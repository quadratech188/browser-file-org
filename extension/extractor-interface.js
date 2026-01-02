/**
 * @param {'tab'|'browser'} download_type
 * @param {any} download_args
 * @param {Record<string, string>} file_attrs 
 */
function send_download(download_type, download_args, file_attrs) {
	const port = browser.runtime.connect({
		name: 'download_request'
	})
	port.onMessage.addListener(() => {
		// TODO
	})
	port.postMessage({
		download_type: download_type,
		download_args: download_args,
		file_attrs: file_attrs
	})
}
