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
 * @typedef {RequestedDownload & {
 * 	meta: {
 * 		id: number,
 * 		start_time: number
 * 	}
 * }} EnqueuedDownload
 */

browser.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener(async (/** @type RequestedDownload */message) => {
		let id
		switch (message.meta.download_config.type) {
			case 'tab':
				id = await tab_download(message.meta.download_config.args)
				break
			case 'browser':
				id = await browser_download(message.meta.download_config.args)
				break
		}
		/** @type EnqueuedDownload */
		const next = {
			...message,
			meta: {
				...message.meta,
				id: id,
				start_time: Date.now()
			}
		}
		next[`file_attrs:${id}`] = next
		browser.storage.local.set(next)
	})
})
