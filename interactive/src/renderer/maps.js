import * as d3 from 'd3'
import data from './balance.json'
import world from './world.json'
import * as topojson from 'topojson'
import iso from 'iso-3166-1'
import mappings from './mappings.json'
import cityStates from './city_states.json'
import { jsdom } from 'jsdom'
import fs from 'fs'

let template = fs.readFileSync('template.html')

let dom = jsdom(template)

let height = 500

let highlights = [
'CH', 'RU', 'US', 'CA',
'BR', 'PE', 'TR', 'AE', 'EG', 'KZ',
'CN', 'IN', 'HK', 'AU', 'NZ',
'NG', 'ZA', 'NO']

let eu = 'AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR,HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK'
	.split(',')
	.map(d => d.trim())

let manualLocations = {
	'RU' : [40, 56],
	'US' : [-99, 39.5]
}

let views = [
	{
		'continent' : 'Europa',
		'code' : 'eu',
		'rotation' : [-14, -52, 0],
		'scale' : 450
	},
	{
		'continent' : 'Nordamerika',
		'code' : 'na',
		'rotation' : [94, -36, 0],
		'scale' : 350
	},
	{
		'continent' : 'Südamerika',
		'code' : 'sa',
		'rotation' : [59, 20, 0],
		'scale' : 350
	},
	{
		'continent' : 'Naher Osten & Kaukasus',
		'code' : 'me',
		'rotation' : [-49, -40, 0],
		'scale' : 350
	},
	{
		'continent' : 'Ostasien',
		'code' : 'as',
		'rotation' : [-103, -32, 0],
		'scale' : 250
	},
	{
		'continent' : 'Afrika',
		'code' : 'af',
		'rotation' : [-18, -4, 0],
		'scale' : 250
	},
	{
		'continent' : 'Ozeanien',
		'code' : 'oc',
		'rotation' : [-136, 16, 0],
		'scale' : 250
	}
]

let rScale = d3.scaleSqrt()
	.domain(d3.extent(data.map(d => d.export)))
	.range([0, 60])

views.forEach( (v, vIndex) => {

let features = topojson.feature(world, world.objects.countries)

features.features = features.features
	.concat(cityStates.features)

let filteredData = data
	.filter(d => iso.whereAlpha2(d.code))
	.filter(d => mappings[d.code] === v.code)
	.filter(d => features.features.find(f => iso.whereAlpha2(d.code).numeric === f.id))
	.filter(d => d.code !== 'FK')
	.sort( (a, b) => {
		return b.export - a.export
	})

let svg = d3.select(dom.querySelector('#maps-container'))
	.append('svg')
	.attr('viewBox', '0 0 300 500')
	.attr('class', 'ortho-map')
	.style('height', height)

let proj = d3.geoOrthographic()
	.scale(v.scale)
	.translate([150, 250])
	.rotate(v.rotation)
	// [300, 500] would fuck up voronoi -- find out why ... (zoom?)
	.clipExtent([[0, 0], [340, 500]])

let path = d3.geoPath()
	.projection(proj)

let graticule = d3.geoGraticule()

svg
	.append('path')
	.datum(graticule)
	.attr('d', d => {
		if(path(d)){
		let str = path(d).replace(/\.[0-9]+/g, '')
		return str
		}

	})
	.attr('class', 'ortho-graticule')

svg
	.selectAll('country')
	.data(features.features)
	.enter()
	.append('path')
	.attr('d', d => {

		if(path(d)){

		let str = path(d).replace(/\.[0-9]+/g, '')

		return str
	}

	})
	.attr('class', d => {
		let c = iso.whereNumeric(d.id)
		let code = c ? c.alpha2 : 'x'
		return eu.indexOf(code) >= 0 ? 'ortho-country ortho-country--eu' : 'ortho-country'
	})

let circleLayer = svg
	.append('g')

circleLayer

	.selectAll('.export-circle')
	.data(filteredData)
	.enter()
	.append('circle')

	.attr('cx', d => {

		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			let [x, y] = proj(manualLocations[d.code])
			return x
		}

		return path.centroid(f)[0]
	})

	.attr('cy', d => {

		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			let [x, y] = proj(manualLocations[d.code])
			return y
		}

		return path.centroid(f)[1]

	})

	.attr('r', d => rScale(d.export))
	.attr('class', d => {
		return d.export/d.import <= 1.1 && d.export/d.import >= 0.8 ? 'export-circle balanced-circle' :
		(d.balance < 0 ? 'export-circle negative-circle' : 'export-circle')
	})
	.attr('data-id',  d => d.code)


let labelLayer = svg
	.append('g')

labelLayer
	.selectAll('.ortho-country-name')
	.data(filteredData.filter(d => highlights.indexOf(d.code) >= 0))
	.enter()
	.append('text')
	.attr('x', d => {

		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			let [x, y] = proj(manualLocations[d.code])
			return x
		}

		let x = path.centroid(f)[0]
		return x
	})

	.attr('y', d => {

		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			let [x, y] = proj(manualLocations[d.code])
			return y - rScale(d.export) - 6
		}

		let y = path.centroid(f)[1]
		return y - rScale(d.export) - 6

	})
	.attr('class', d => {

		return d.export/d.import <= 1.1 && d.export/d.import >= 0.8 ? 'ortho-country-name ortho-country-name--balanced' :
		(d.balance < 0 ? 'ortho-country-name ortho-country-name--negative' : 'ortho-country-name')
	})
	.text(d => d.name)
	.attr('data-id', d => d.code)

if(vIndex === 0){

	let legendBg = svg
		.append('rect')
		.attr('x', 0)
		.attr('y', height - 134)
		.attr('width', 300)
		.attr('height', 134)
		.attr('fill', 'rgba(255,255,255,0.7)')

	let legend = svg
		.append('foreignObject')
		.attr('x', 0)
		.attr('y', 368)
		.attr('width', 300)
		.attr('height', 134)

	legend
		.append('div')
		.attr('class', 'legend-div')
		// .attr('x', 4)
		// .attr('y', height - 74)
		// .attr('class', 'ortho-legend ortho-legend--strong')

		.html(`

		<span class='legend-header'>Legende</span><br />

		Die Größe der Kreise gibt den Wert der Waren an,                       
		die aus der EU in das jeweilige Land <strong>exportiert</strong> werden.<br />

		Die Farbe verdeutlicht die Handelsbilanz: <span class='ortho-blue'>Blaue</span> Staaten importieren mehr Waren aus der EU,
		als sie dorthin liefern. <span class='ortho-red'>Rot</span> markierte Länder hingegen sind Nettoexporteure.
		Staaten in <span class='ortho-yellow'>Gelb</span> haben eine ausgeglichene Handelsbilanz mit der EU.

		`)

	// let sumWithPad = (sum, cur) => {
	// 	return sum + 2 + cur*2
	// }

	// let sizes = [2, 4, 6]

	// let circles = svg
	// 	.selectAll('.empty-legend-circle')
	// 	.data(sizes)
	// 	.enter()
	// 	.append('circle')
	// 	.attr('cx', (d, i) => 3 + sizes.slice(0, i+1).reduce(sumWithPad, 0))
	// 	.attr('cy', height - 60)
	// 	.attr('r', d => d)
	// 	.attr('class', 'empty-legend-circle')

	// svg
	// 	.append('text')
	// 	.attr('x', 44)
	// 	.attr('y', height - 56)
	// 	.text('EU-Exportmenge')
	// 	.attr('class', 'ortho-legend')

	// let expCircle = svg
	// 	.append('circle')
	// 	.attr('r', 6)
	// 	.attr('cx', 10)
	// 	.attr('cy', height - 44)
	// 	.attr('class', 'legend-circle legend-circle--plus')

	// let expText = svg
	// 	.append('text')
	// 	.attr('x', 20)
	// 	.attr('y', height - 40)
	// 	.text('Nettoimporteur von EU-Waren')
	// 	.attr('class', 'ortho-legend')

	// let balCircle = svg
	// 	.append('circle')
	// 	.attr('r', 6)
	// 	.attr('cx', 10)
	// 	.attr('cy', height - 28)
	// 	.attr('class', 'legend-circle legend-circle--balanced')

	// let balText = svg
	// 	.append('text')
	// 	.attr('x', 20)
	// 	.attr('y', height - 24)
	// 	.text('ausgeglichene Handelsbilanz')
	// 	.attr('class', 'ortho-legend')

	// let impCircle = svg
	// 	.append('circle')
	// 	.attr('r', 6)
	// 	.attr('cx', 10)
	// 	.attr('cy', height - 12)
	// 	.attr('class', 'legend-circle legend-circle--minus')

	// let impText = svg
	// 	.append('text')
	// 	.attr('x', 20)
	// 	.attr('y', height - 8)
	// 	.text('Nettoexporteur')
	// 	.attr('class', 'ortho-legend')

	}

let voronoiGroup = svg
	.append('g')

let voronoi = d3.voronoi()
	.extent([[0, 0], [300, 420]])
	.x(d => {
		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			return proj(manualLocations[d.code])[0]
		}
		return path.centroid(f)[0]
	})
	.y(d => {
		let f = features.features.find( f => {
			return iso.whereAlpha2(d.code).numeric === f.id
		})

		if(manualLocations[d.code]){
			return proj(manualLocations[d.code])[1]
		}

		return path.centroid(f)[1]
	})

let voronoiData = voronoi(filteredData).polygons()

let voronoiPolys = svg
	.selectAll('.voronoi')
	.data(voronoiData)
	.enter()
	.append('path')
	.attr('d', d => {
		return d ? 'M' + d.join('L') + 'Z' : null
	})
	.attr('class', 'voronoi')
	.attr('data-name', d => d.data.name)
	.attr('data-id', d => d.data.code)
	.attr('data-index', vIndex)
	.attr('data-export', d => d.data.export)
	.attr('data-import', d => d.data.import)

svg
	.append('text')
	.attr('x', 8)
	.attr('y', 20)
	.text(v.continent)
	.attr('class', 'ortho-title')

})

fs.writeFileSync('../index.html', dom.querySelector('html').outerHTML)