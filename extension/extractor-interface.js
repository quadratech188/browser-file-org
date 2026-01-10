/**
 * @typedef {{
 *     type: 'tab', args: string
 * } | {
 *     type: 'browser', args: browser.downloads._DownloadOptions
 * }} DownloadConfig
 *
 * @typedef {{
 *	attrs: Record<string, string>,
 *	meta: {
 *		reproduce: DownloadConfig
 *	}
 * }} RequestedDownload
 */

/**
 * @param {DownloadConfig} download_config
 * @param {Record<string, string>} attrs 
 */
async function send_download(download_config, attrs) {
	/** @type RequestedDownload */
	const request = {
		attrs,
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
