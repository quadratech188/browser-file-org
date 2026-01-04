import {mount, unmount} from 'svelte'
import Popup from './Popup.svelte'

/**
 * @param {Rule} rule
 */
window.create_rule_popup = function(rule) {
	const host = document.createElement('div')
	const shadow = host.attachShadow({ mode: 'open'})
	const target = document.createElement('div')

	document.body.appendChild(host)
	shadow.appendChild(target)

	return new Promise((resolve, reject) => {
		const popup = mount(Popup, {
			target: target,
			props: {
				serialized_rule: rule.serialize(),
				onclose: (result) => {
					unmount(popup)
					target.remove()
					if (result) {
						resolve(new Rule(result))
					}
					else {
						reject(result)
					}
				}
			}
		})
	})
}
