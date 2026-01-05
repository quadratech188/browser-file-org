browser.runtime.onMessage.addListener(async message => {
	switch(message.type) {
		case 'send_download':
			await handle_send_download(message.body)
			break
		case 'add_rule':
			await handle_add_rule(message.body)
			break
	}
})

/**
 * @param {RequestedDownload} request
 */
async function handle_send_download(request) {
	let id
	switch (request.meta.reproduce.type) {
		case 'tab':
			id = await tab_download(request.meta.reproduce.args)
			break
		case 'browser':
			id = await browser_download(request.meta.reproduce.args)
			break
	}
	const storage = {}
	storage[`file_attrs:${id}`] = request
	browser.storage.local.set(storage)
}

/**
 * @param {SerializedRule} rule 
 */
async function handle_add_rule(rule) {
	/** @type SerializedRule[] */
	const rules = (await browser.storage.local.get({
		rules: []
	}))['rules']

	rules.push(rule);

	await browser.storage.local.set({
		rules: rules
	})
}
