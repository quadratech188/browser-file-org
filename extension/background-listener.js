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

browser.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener(async (/** @type RequestedDownload */message) => {
		let id
		switch (message.meta.reproduce.type) {
			case 'tab':
				id = await tab_download(message.meta.reproduce.args)
				break
			case 'browser':
				id = await browser_download(message.meta.reproduce.args)
				break
		}
		const storage = {}
		storage[`file_attrs:${id}`] = message
		browser.storage.local.set(storage)
	})
})
