// @ts-check

/**
 * @typedef {{
 *     type: 'tab', args: string
 * } | {
 *     type: 'browser', args: browser.downloads._DownloadOptions
 * }} DownloadConfig
 *
 * @typedef {{
 *     attrs: Record<string, string>,
 *     meta: {
 *         reproduce: DownloadConfig
 *     }
 * }} RequestedDownload
 */

/**
 * @param {DownloadConfig} download_config
 * @param {Record<string, string>} attrs 
 */
async function send_download(download_config, attrs) {
	/** @type RequestedDownload */
	const request = {
		attrs: {
			...await _get_page_attrs(),
			...attrs
		},
		meta: {
			reproduce: download_config
		}
	}
	await browser.runtime.sendMessage({
		type: 'send_download',
		body: request
	})
}

/**
 * @param {Rule} rule 
 * @param {boolean} prompt
 */
async function add_rule(rule, prompt = false) {
	if (prompt == false) {
		await browser.runtime.sendMessage({
			type: 'add_rule',
			body: rule.serialize()
		})
		return
	}

	create_rule_popup(rule).then(async new_rule => {
		await add_rule(new_rule, false)
	}, () => {
		// The user just closed the window, don't care
	})
}

/**
 * @typedef {Record<string, string> | (
 *     () => Record<string, string>
 * ) | (
 *     () => Promise<Record<string, string>>
 * )} PageAttrs
 */

/** @type PageAttrs */ 
let page_attrs = {}

/**
 * @param {PageAttrs} attrs
 */
function set_page_attrs(attrs) {
	page_attrs = attrs
}

async function _get_page_attrs() {
	if (page_attrs instanceof Function) {
		return await page_attrs()
	}
	else {
		return page_attrs
	}
}

browser.runtime.onMessage.addListener((_, __, send_response) => {
	_get_page_attrs().then(attrs => {
		send_response(attrs)
	}).catch(e => {
		console.error(e)
		send_response({})
	})
	return true
})
