import { $, $$, addTooltip } from './lib'

let circles = $$('.export-circle')

let circlesGrouped = $$('.ortho-map')
	.map( map => {
		return map.querySelectorAll('.export-circle')
	})

let labelsGrouped = $$('.ortho-map')
	.map( map => {
		return map.querySelectorAll('.ortho-country-name')
	})

let exportContent = el => {

	let name = el.getAttribute('data-name')
	let exp = (parseInt(el.getAttribute('data-export'))/1000000000).toFixed(1).replace('.', ',')
	let imp = (parseInt(el.getAttribute('data-import'))/1000000000).toFixed(1).replace('.', ',')


	return `<strong>${name}</strong><br />
		Importiert aus d. EU: ${exp} Mrd. €<br />
		Exportiert in die EU: ${imp} Mrd. €<br />`

}

$$('.voronoi').forEach( el => addTooltip(el, exportContent, () => {}))