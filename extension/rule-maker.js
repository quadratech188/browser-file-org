document.addEventListener('DOMContentLoaded', () => {
	const rules_div = document.getElementById('rules')

	load(rules_div)

	document.addEventListener('click', (e) => {
		const target = /** @type Element */ (e.target)

		if (target.matches('.rule-new')) {
			rule_new(rules_div)
		}

		if (target.matches('.attr-new')) {
			attr_new(target.closest('.rule'), '', '')
		}

		if (target.matches('.attr-del')) {
			target.closest('.attr-row').remove()
		}

		if (target.matches('.rule-del')) {
			target.closest('.rule').remove()
		}
	
		if (target.matches('.save')) {
			save(rules_div)
		}
	})
})

/**
 * @param {Element} rule 
 * @param {string} k
 * @param {string} v
 * @returns {Element}
 */
function attr_new(rule, k, v) {
	const attr_template = /** @type HTMLTemplateElement */ (document.getElementById('attr-template'))

	const target = rule.querySelector('.attr-grid')
	target.appendChild(document.importNode(attr_template.content, true))
	const row = target.lastElementChild

	const k_input = (/** @type HTMLInputElement */ (row.children[0]))
	k_input.value = k;

	const v_input = (/** @type HTMLInputElement */ (row.children[2]))
	v_input.value = v;

	return row
}

/**
 * @param {Element} rules
 * @returns {Element}
 */
function rule_new(rules) {
	const rule_template = /** @type HTMLTemplateElement */ (document.getElementById('rule-template'))

	rules.appendChild(document.importNode(rule_template.content, true))
	return rules.lastElementChild
}

/**
 * @param {Element} rule
 * @param {string} dest
 */
function rule_dest(rule, dest) {
	const dest_input = (/** @type HTMLInputElement */ (rule.querySelector('.rule-dest')))
	dest_input.value = dest
}

/**
 * @param {Element} rules_div
 */
async function load(rules_div) {
	const rules = (await browser.storage.local.get({
		'rules': []
	}))['rules']

	for (const rule of rules) {
		const rule_div = rule_new(rules_div)
		for (const [k, v] of Object.entries(rule.conds)) {
			attr_new(rule_div, k, v)
		}

		rule_dest(rule_div, rule.dest)
	}
}

/**
 * @param {Element} rules_div 
 */
async function save(rules_div) {
	const rules = []
	for (const rule_div of rules_div.children) {
		const grid = rule_div.querySelector('.attr-grid')
		const conds = {}
		for (const row of grid.children) {
			const k = (/** @type HTMLInputElement */ (row.children[0])).value
			const v = (/** @type HTMLInputElement */ (row.children[2])).value
			conds[k] = v
		}
		rules.push({
			conds: conds,
			dest: (/** @type HTMLInputElement */ (rule_div.querySelector('.rule-dest'))).value
		})
	}
	await browser.storage.local.set({
		'rules': rules
	})
}
