// @ts-check

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
	const data = (await browser.storage.local.get(key))[key]
	/** @type FileAttrs */
	const attrs = data.file_attrs
	await browser.storage.local.remove(key)

	console.log(`Found download with attrs:`)
	console.log(attrs)


	const path = download_item.filename.split('/')
	/** @type FileAttrs */
	const default_value = {
		filename: path[path.length - 1],
		url: download_item.url
	}
	for (const [k, v] of Object.entries(default_value)) {
		if (!(k in attrs)) {
			attrs[k] = v
		}
	}

	const history = (await browser.storage.local.get({
		history: []
	}))['history']

	history.push(data)
	if (history.length > 1000) {
		history.shift()
	}

	await browser.storage.local.set({
		history: history
	})

	/** @type Rule[] */
	const rules = (await browser.storage.local.get('rules'))['rules']
	const rule = rules.values()
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))
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
