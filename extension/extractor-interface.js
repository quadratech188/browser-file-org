/**
 * @typedef {{
 *	type: 'tab'|'browser',
 *	args: any
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
function send_download(download_config, attrs) {
	/** @type RequestedDownload */
	const request = {
		attrs,
		meta: {
			reproduce: download_config
		}
	}
	browser.runtime.sendMessage({
		type: 'add_rule',
		body: request
	})
}

/**
 * @param {Rule} rule 
 */
function add_rule(rule) {
	browser.runtime.sendMessage({
		type: 'add_rule',
		body: rule
	})
}
