// @ts-check

/**
 * @typedef {{
 * 	attrs: FileAttrs,
 * 	meta: {
 * 		id: number,
 * 		start_time: string,
 * 		end_time: string,
 * 		reproduce?: DownloadConfig,
 * 		moved: boolean,
 * 		dest: string
 * 	}
 * }} FinishedDownload
 */

browser.downloads.onChanged.addListener(async (item) => {
	if (!('state' in item)) {
		return false
	}
	if (item.state.current !== 'complete') {
		return false
	}

	const id = item.id
	const download_item = (await browser.downloads.search({id}))[0]

	const key = `file_attrs:${id}`

	const path = download_item.filename.split('/')
	/** @type FileAttrs */
	const attrs = {
		filename: path[path.length - 1],
		url: download_item.url
	}

	/** @type RequestedDownload */
	const enqueued = (await browser.storage.local.get(key))[key]
	await browser.storage.local.remove(key)

	if (enqueued !== undefined) {
		for (const [k, v] of Object.entries(enqueued.attrs)) {
			attrs[k] = v
		}
	}

	console.log(`Found download with attrs:`)
	console.log(attrs)

	/** @type Rule[] */
	const rules = (await browser.storage.local.get('rules'))['rules']
	const rule = rules.values()
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))

	let dest = download_item.filename
	if (rule !== undefined) {
		dest = rule.get_path(attrs)

		console.log(`Matches this rule:`)
		console.log(rule.serialize())
		console.log(`Moving to ${dest}`)
	}

	/** @type FinishedDownload */
	const next = {
		attrs: attrs,
		meta: {
			id: id,
			start_time: download_item.startTime,
			end_time: download_item.endTime,
			reproduce: enqueued === undefined? enqueued.meta.reproduce: undefined,
			moved: rule !== undefined,
			dest: dest
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

	if (rule === undefined) return


	await browser.runtime.sendNativeMessage('gcu_file_mover', {
		file: download_item.filename,
		dest: dest,
		options: {
			create_dest_folder: false,
			replace_dest: false,
			delete_on_error: true
		}
	}).then(result => {
		if (result.type === 'success') {
			console.log(`Moved to ${dest}`)
			return
		}
		console.log(result)
	}), e => {
		console.log(e)
	}
})
