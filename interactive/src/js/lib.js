let $ = sel => document.querySelector(sel)
let $$ = sel => Array.from(document.querySelectorAll(sel))

let scrolling = false
let coords = []

let width = window.innerWidth || screen.width

let addTooltip = (el, content, alsoDo) => {

	let tt = document.createElement('div')
	tt.setAttribute('class', 'tooltip tooltip-off')

	tt.innerHTML = content(el)


	el.addEventListener('mousemove', evt => {

		if(width > 450){
			tt.style.left = evt.pageX + 4 + 'px'
			tt.style.top = evt.pageY + 4 + 'px'
		}

	})

	el.addEventListener('mouseenter', evt => {
	 	tt.classList.remove('tooltip-off')

		alsoDo(el)

	 })

	el.addEventListener('mouseleave', evt => {
	 	tt.classList.add('tooltip-off')
	})

	// lets turn off mobile tooltips for now

	// el.addEventListener('touchstart', evt => {

	// 	coords = [evt.touches[0].pageX, evt.touches[0].pageY]
	// 	scrolling = false
	// })

	// el.addEventListener('touchmove', () => {
	// 	scrolling = true
	// })

	// el.addEventListener('touchend', evt => {
	// 	if(!scrolling){

	// 		$$('.tooltip').forEach(otherEl => otherEl.classList.add('tooltip-off'))

	// 		tt.classList.remove('tooltip-off')

	// 		let elWidth = tt.getBoundingClientRect().width
	// 		let l = coords[0] - elWidth/2

	// 		tt.style.left = l <= 0 ? 0 :
	// 			(l > width - elWidth ? width - elWidth + 'px' : l + 'px')
	// 		tt.style.top = coords[1] + 4 + 'px'

	// 		alsoDo(el)
		
	// 	}
	// })

	document.body.appendChild(tt)

}

export {$, $$, addTooltip}