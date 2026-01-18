/**
 * @template K, V
 * @param {Map<K, V[]>} map
 * @param {K} k
 * @param {V} v
 */
function map_queue_push(map, k, v) {
	const list = map.get(k)
	if (list === undefined) {
		map.set(k, [v])
	}
	else {
		list.push(v)
	}
}

/**
 * @template K, V
 * @param {Map<K, V[]>} map
 * @param {K} k
 * @returns V | undefined
 */
function map_queue_pop(map, k) {
	const list = map.get(k)
	if (list === undefined) {
		return undefined
	}
	const result = /** @type V */ (list.shift())
	if (list.length === 0) {
		map.delete(k)
	}
	return result
}

/**
 * @param {number} tab_id
 * @returns Record<string, string>
 */
async function get_attrs(tab_id) {
	if (tab_id === -1) return {}
	return await browser.tabs.sendMessage(tab_id, null).catch(_ => {
		console.log(`Failed to message tab ${tab_id}`)
		return {}
	})
}

/**
 * @param {number} download_id
 * @param {number} tab_id
 */
async function submit(download_id, tab_id) {
	const key = `page_attrs:${download_id}`
	const delta = {}

	// TODO: Figure out a way to call this function earlier
	delta[key] = await get_attrs(tab_id)

	console.log(delta)
	await browser.storage.local.set(delta)
}

/** @type Map<string, number[]> */
const l = new Map()
/** @type Map<string, number[]> */
const r = new Map()

browser.downloads.onCreated.addListener(async item => {
	const tab_id = map_queue_pop(r, item.url)
	if (tab_id !== undefined) {
		await submit(item.id, tab_id)
		return
	}
	map_queue_push(l, item.url, item.id)
	setTimeout(() => {
		map_queue_pop(l, item.url)
	}, 1000)
})
browser.webRequest.onHeadersReceived.addListener(details => {(async () => {
	const down_id = map_queue_pop(l, details.url)
	if (down_id !== undefined) {
		await submit(down_id, details.tabId)
		return
	}
	map_queue_push(r, details.url, details.tabId)
	setTimeout(() => {
		map_queue_pop(r, details.url)
	}, 1000)
})()}, {urls: ['<all_urls>']})
