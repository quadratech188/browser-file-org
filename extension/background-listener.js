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

/**
 * @typedef {{
 * 	id: import("crypto").UUID
 * 	attrs: FileAttrs,
 * 	meta: {
 * 		download_id: number,
 * 		start_time: string,
 * 		end_time: string,
 * 		reproduce: DownloadConfig | undefined,
 * 		move_result: MoveResult
 * 	}
 * }} FinishedDownload
 */

browser.downloads.onChanged.addListener(async (item) => {
	if (!('state' in item)) {
		return false
	}
	if (/** @type browser.downloads.StringDelta */ (item.state).current !== 'complete') {
		return false
	}

	const download_item = (await browser.downloads.search({id: item.id}))[0]

	const path = download_item.filename.split('/')
	/** @type FileAttrs */
	let attrs = {
		filename: path[path.length - 1],
		url: download_item.url
	}
	if (download_item.referrer !== undefined) {
		attrs.referrer = download_item.referrer
	}

	const page_key = `page_attrs:${item.id}`
	/** @type Record<string, string> */
	const page_attrs = (await browser.storage.local.get(page_key))[page_key]
	await browser.storage.local.remove(page_key)
	if (page_attrs != undefined) {
		attrs = {
			...attrs,
			...page_attrs
		}
	}

	const key = `file_attrs:${item.id}`
	/** @type RequestedDownload */
	const enqueued = (await browser.storage.local.get(key))[key]
	await browser.storage.local.remove(key)
	if (enqueued !== undefined) {
		attrs = {
			...attrs,
			...enqueued.attrs
		}
	}

	const move_result = await try_move(attrs, download_item.filename)

	/** @type FinishedDownload */
	const next = {
		id: crypto.randomUUID(),
		attrs: attrs,
		meta: {
			download_id: item.id,
			start_time: /** @type string */ (download_item.startTime),
			end_time: /** @type string */ new Date().toISOString(),
			reproduce: enqueued !== undefined? enqueued.meta.reproduce: undefined,
			move_result
		}
	}

	/** @type FinishedDownload[] */
	const history = (await browser.storage.local.get({
		history: []
	}))['history']
	history.push(next)
	if (history.length > 1000) {
		history.shift()
	}
	await browser.storage.local.set({
		history: history
	})
	// browser.storage.local.onChanged() only works for simple datatypes,
	// so we have to watch for this instead :(
	// Actually, onChanged() still fires if the underlying value is the same,
	// so we don't have to worry about two things happening in the same millisecond
	await browser.storage.local.set({
		history_last_modified: Date.now()
	})
})
