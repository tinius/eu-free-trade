import sync from 'csv-parse/lib/sync'
import fs from 'fs'
import _ from 'lodash'
import countries from 'i18n-iso-countries'

let eu = 'AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR,HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK'
	.split(',')
	.map(d => d.trim())

let isNumber = str => {
	try {
		return parseInt(str) > 0 ? true : false
	} catch (e) {
		return false
	}
}

let manualNames = {
	'RU' : 'Russland',
	'US' : 'Vereinigte Staaten'
}

let data = sync(fs.readFileSync('flows.csv'), { columns : true })
	//.filter(d => d.FLOW === 'IMPORT')
	.filter(d => eu.indexOf(d.PARTNER) < 0)
	.filter(d => !d.PARTNER.startsWith('EU'))
	.filter(d => isNumber(d.Value))

let top = _(data)
	.filter(d => d.PRODUCT === 'TOTAL')
	.groupBy(d => d.PARTNER)
	.filter(arr => arr.length === 2)
	.map(arr => {

		return {
			'code' : arr[0].PARTNER,
			'name' : manualNames[arr[0].PARTNER] ? manualNames[arr[0].PARTNER] : countries.getName(arr[0].PARTNER, 'de'),
			'import' : parseInt(arr[0].Value),
			'export' : parseInt(arr[1].Value),
			'balance' : parseInt(arr[1].Value) - parseInt(arr[0].Value)
		}
	})
	//.map(d => { return { code : d.PARTNER, value : parseInt(d.Value) } } )
	.orderBy(d => d.export, 'desc')
	.valueOf()

console.log(top)

fs.writeFileSync('balance.json', JSON.stringify(top, null, 2))
fs.writeFileSync('../interactive/balance.json', JSON.stringify(top, null, 2))

//console.log(top)

// let topGoods = top
// 	.map( d1 => {
// 		let inner = _(data)
// 			.filter(d2 => d1.code === d2.PARTNER)
// 			.filter(d2 => d2.PRODUCT.length === 2)
// 			.groupBy(d2 => d2.PARTNER)
// 			.map( (v, k) => {
// 				return _(v)
// 					.map( v2 => {

// 						return { product : v2.PRODUCT, value : parseInt(v2.Value) }
// 					})
// 					.orderBy( v2 => v2.value, 'desc' )
// 					.slice(0, 5)
// 					.valueOf()
// 			})
// 			//.map( x => console.log(x) )
// 			.valueOf()

// 		return {
// 			'code' : d1.code,
// 			'goods' : inner
// 		}

// 			//console.log(inner)

// 	})

// console.log(JSON.stringify(topGoods, null, 2))