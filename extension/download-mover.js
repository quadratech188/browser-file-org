// @ts-check

/**
 * @typedef {{
 * 	attrs: FileAttrs,
 * 	meta: {
 * 		id: number,
 * 		start_time: string,
 * 		end_time: string,
 * 		reproduce: DownloadConfig | undefined,
 * 		matched: boolean,
 * 		dest: string,
 * 		status: 'not_moved' | 'moved' | 'failed',
 * 		move_error: string | undefined,
 * 		location: string
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

	/** @type SerializedRule[] */
	const rules = (await browser.storage.local.get({
		rules: []
	}))['rules']

	const rule = rules
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))

	/** @type {'not_moved'|'moved'|'failed'} */
	let status = 'not_moved'
	let dest = download_item.filename
	let move_error

	if (rule !== undefined) {
		dest = rule.get_path(attrs)

		console.log(`Matches this rule:`)
		console.log(rule.serialize())
		console.log(`Moving to ${dest}`)

		try {
			const response = await browser.runtime.sendNativeMessage('gcu_file_mover', { file: download_item.filename,
				dest: dest,
				options: {
					create_dest_folder: false,
					replace_dest: false,
					delete_on_error: true
				}
			})
			if (response.type === 'success') {
				status = 'moved'
				console.log(`Moved to ${dest}`)
			}
			else {
				status = 'failed'
				move_error = response
			}
		}
		catch (e) {
			status = 'failed'
			move_error = e
		}
	}

	if (status === 'failed') {
		console.log('An error occured:')
		console.log(move_error)
	}

	/** @type FinishedDownload */
	const next = {
		attrs: attrs,
		meta: {
			id: id,
			start_time: /** @type string */ (download_item.startTime),
			end_time: /** @type string */ (download_item.endTime),
			reproduce: enqueued !== undefined? enqueued.meta.reproduce: undefined,
			matched: rule !== undefined,
			dest: dest,
			status: status,
			move_error: move_error,
			location: move_error !== undefined? dest: download_item.filename
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

})
