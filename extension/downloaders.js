// @ts-check

/**
 * @param {string} file_url 
 * @returns {Promise<number>}
 */

async function tab_download(file_url) {
	const download_tab = await browser.tabs.create({
		active:false,
		url: file_url
	})
	/** @type browser.downloads.DownloadItem */
	const download = (await listen_once(browser.downloads.onCreated,
		(/** @type browser.downloads.DownloadItem */ download) => {
		return download.url == file_url
	}))

	await browser.tabs.remove(download_tab.id)
	return download.id
}

/**
 * @param {browser.downloads._DownloadOptions} options 
 * @returns {Promise<number>}
 */
async function browser_download(options) {
	return await browser.downloads.download(options)
}
