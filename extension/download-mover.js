// @ts-check

/**
 * @typedef {{
 * 	attrs: FileAttrs,
 * 	meta: {
 * 		id: number,
 * 		start_time: string,
 * 		end_time: string,
 * 		reproduce: DownloadConfig | undefined,
 * 		dest: string,
 * 		status: 'not_moved' | 'moved' | 'failed',
 * 		move_error: string | undefined,
 * 		location: string
 * 	}
 * }} FinishedDownload
 */

/**
 * @param {FileAttrs} attrs
 * @param {string} location
 * @returns {Promise<{
 *     dest: string,
 *     status: 'not_moved' | 'moved' | 'failed',
 *     location: string,
 *     move_error: string | undefined
 * }>}
 */
async function try_move(attrs, location) {
	/** @type SerializedRule[] */
	const rules = (await browser.storage.local.get({
		rules: []
	}))['rules']

	const rule = rules
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))

	if (rule === undefined) {
		return {
			dest: location,
			status: 'not_moved',
			location: location,
			move_error: undefined
		}
	}

	const dest = rule.get_path(attrs)

	console.log('These attrs:')
	console.log(attrs)
	console.log(`Matches this rule:`)
	console.log(rule.serialize())
	console.log(`Moving to ${dest}`)

	try {
		const response = await browser.runtime.sendNativeMessage('gcu_file_mover', {
			file: location,
			dest: dest,
			options: {
				create_dest_folder: false,
				replace_dest: false,
				delete_on_error: true
			}
		})
		if (response.type === 'success') {
			return {
				dest: dest,
				status: 'moved',
				location: dest,
				move_error: undefined
			}
		}
		else {
			return {
				dest: dest,
				status: 'failed',
				location: location,
				move_error: response
			}
		}
	}
	catch (e) {
		return {
			dest: dest,
			status: 'failed',
			location: location,
			move_error: `${e}`
		}
	}
}

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

	const move_result = await try_move(attrs, download_item.filename)

	if (move_result.status === 'failed') {
		console.log('An error occured:')
		console.log(move_result.move_error)
	}

	/** @type FinishedDownload */
	const next = {
		attrs: attrs,
		meta: {
			id: id,
			start_time: /** @type string */ (download_item.startTime),
			end_time: /** @type string */ new Date().toISOString(),
			reproduce: enqueued !== undefined? enqueued.meta.reproduce: undefined,
			...move_result
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
})
