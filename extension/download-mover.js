// @ts-check

/**
 * @typedef {{
 * 	attrs: FileAttrs,
 * 	meta: EnqueuedDownload['meta'] & {
 * 		end_time: number,
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

	/** @type EnqueuedDownload */
	const enqueued = (await browser.storage.local.get(key))[key]
	// For now, we don't support downloads that we didn't trigger
	if (enqueued === undefined) return
	await browser.storage.local.remove(key)


	for (const [k, v] of Object.entries(enqueued.attrs)) {
		attrs[k] = v
	}

	console.log(`Found download with attrs:`)
	console.log(attrs)

	/** @type Rule[] */
	const rules = (await browser.storage.local.get('rules'))['rules']
	const rule = rules.values()
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))

	/** @type FinishedDownload */
	const next = {
		attrs: attrs,
		meta: {
			...enqueued.meta,
			end_time: Date.now(),
			moved: rule !== undefined,
			dest: (rule !== undefined)? rule.get_path(attrs): download_item.filename
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

	console.log(`Matches this rule:`)
	console.log(rule.serialize())

	const dest_path = rule.get_path(attrs)
	console.log(`Moving to ${dest_path}`)

	await browser.runtime.sendNativeMessage('gcu_file_mover', {
		file: download_item.filename,
		dest: dest_path,
		options: {
			create_dest_folder: false,
			replace_dest: false,
			delete_on_error: true
		}
	}).then(result => {
		if (result.type === 'success') {
			console.log(`Moved to ${dest_path}`)
			return
		}
		console.log(result)
	}), e => {
		console.log(e)
	}
})
