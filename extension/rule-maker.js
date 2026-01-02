document.addEventListener('DOMContentLoaded', () => {
	const rules_div = document.getElementById('rules')
	const histories_div = document.getElementById('history')

	rules_load(rules_div)
	histories_load(histories_div)

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
async function rules_load(rules_div) {
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
 * @param {Element} history
 * @param {string} k
 * @param {string} v
 * @returns {Element}
 */
function history_attr_new(history, k, v) {
	const history_attr_template =
		/** @type HTMLTemplateElement */ (document.getElementById('history-attr-template'))

	const target = history.querySelector('.history-attr-grid')
	target.appendChild(document.importNode(history_attr_template.content, true))
	const row = target.lastElementChild

	const k_input = (/** @type HTMLParagraphElement */ (row.children[0]))
	k_input.innerText = k;

	const v_input = (/** @type HTMLParagraphElement */ (row.children[1]))
	v_input.innerText = v;

	return row
}

/**
 * @param {Element} histories
 * @returns {Element}
 */
function history_new(histories) {
	const history_template = /** @type HTMLTemplateElement */ (document.getElementById('history-template'))

	histories.prepend(document.importNode(history_template.content, true))
	return histories.firstElementChild
}

/**
 * @param {Element} history
 * @param {string} dest
 */
function history_dest(history, dest) {
	const dest_anchor = (/** @type HTMLAnchorElement */ (history.querySelector('.history-dest')))
	dest_anchor.innerText = dest
	dest_anchor.href = `file:///${dest}`
}

/**
 * @param {Element} histories_div
 */
async function histories_load(histories_div) {
	const histories = (await browser.storage.local.get({
		'history': []
	}))['history']

	for (const history of histories) {
		const history_div = history_new(histories_div)
		for (const [k, v] of Object.entries(history)) {
			history_attr_new(history_div, k, v)
		}
		history_dest(history_div, "TODO!")
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
