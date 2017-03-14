import fs from 'fs'
import iso from 'iso-3166-1'
import readline from 'readline'
import readlineSync from 'readline-sync'

let data = JSON.parse(fs.readFileSync('balance.json'))

let mappings = JSON.parse(fs.readFileSync('mappings.json'))

data
	.filter(d => !d.code.startsWith('Q') || d.code === 'QA')
	.filter(d => !mappings[d.code])
	.forEach(d => {

	let answer = null

	try {
		let name = iso.whereAlpha2(d.code).country
		answer = readlineSync.question(name + ' ' + '(eu, me, na, sa, as, af, oc, x)' + '\n').trim()
	} catch (err) {
		answer = readlineSync.question(d.code + ' ' + '(eu, me, na, sa, as, af, oc, x)' + '\n').trim()
	}

	if(answer !== ''){ mappings[d.code] = answer }

	fs.writeFileSync('mappings.json', JSON.stringify(mappings, null, 2))
	fs.writeFileSync('../interactive/mappings.json', JSON.stringify(mappings, null, 2))

})