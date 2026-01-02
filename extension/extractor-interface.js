/**
 * @typedef {{
 *	type: 'tab'|'browser',
 *	args: any
 * }} DownloadConfig
 *
 * @typedef {{
 *	attrs: Record<string, string>,
 *	meta: {
 *		download_config: DownloadConfig
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
			download_config
		}
	}
	port.postMessage(message)
}
