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
	const port = browser.runtime.connect({
		name: 'download_request'
	})
	port.onMessage.addListener(() => {
		// TODO
	})
	/** @type RequestedDownload */
	const message = {
		attrs,
		meta: {
			reproduce: download_config
		}
	}
	port.postMessage(message)
}
