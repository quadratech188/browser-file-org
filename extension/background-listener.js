// @ts-check

// Firefox - we already injected everything with the 'scripts' key
if (typeof importScripts === 'undefined') {

}
// Chromium
else {
	importScripts('browser-polyfill.min.js')
	importScripts('util.js')
	importScripts('move-download.js')
}

/**
 * @typedef DownloadRequest
 * @property {'tab'|'browser'} download_type
 * @property {any} download_args
 * @property {FileAttrs} file_attrs
 */

browser.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener(async (/** @type DownloadRequest */message) => {
		let id
		switch (message.download_type) {
			case 'tab':
				id = await tab_download(message.download_args)
				break
			case 'browser':
				id = await browser_download(message.download_args)
				break
		}
		const storage = {}
		storage[`file_attrs:${id}`] = {
			file_attrs: message.file_attrs,
			meta: {
				id: id,
				start_time: Date.now(),
				download_type: message.download_type,
				download_args: message.download_args
			}
		}
		browser.storage.local.set(storage)
	})
})
