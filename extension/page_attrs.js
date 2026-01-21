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
 * @param {browser.webRequest._OnBeforeRequestDetails} details
 * @returns Record<string, string>
 */
async function get_attrs(details) {
	let result = {}

	if (details.documentUrl) {
		result.document_url = details.documentUrl
	}
	if (details.originUrl) {
		result.origin_url = details.originUrl
	}

	if (details.tabId !== -1) {
		result = {
			...result,
			...await browser.tabs.sendMessage(details.tabId, null).catch(_ => {
				console.log(`Failed to message tab ${details.tabId}`)
				return {}
			})
		}
	}
	return result
}

/**
 * @param {number} download_id
 * @param {browser.webRequest._OnBeforeRequestDetails} details
 */
async function submit(download_id, details) {
	const key = `page_attrs:${download_id}`
	const delta = {}

	// TODO: Figure out a way to call this function earlier
	delta[key] = await get_attrs(details)

	await browser.storage.local.set(delta)
}

// Hope that the request returns and the download is created before the service worker shuts down

/** @type Map<string, number[]> */
const l = new Map()
/** @type Map<string, browser.webRequest._OnBeforeRequestDetails[]> */
const r = new Map()

browser.downloads.onCreated.addListener(async item => {
	const req_details = map_queue_pop(r, item.url)
	if (req_details !== undefined) {
		await submit(item.id, req_details)
		return
	}
	map_queue_push(l, item.url, item.id)
	setTimeout(() => {
		map_queue_pop(l, item.url)
	}, 1000)
})
browser.webRequest.onBeforeRequest.addListener(details => {(async () => {
	const down_id = map_queue_pop(l, details.url)
	if (down_id !== undefined) {
		await submit(down_id, details)
		return
	}
	map_queue_push(r, details.url, details)
	setTimeout(() => {
		map_queue_pop(r, details.url)
	}, 1000)
})()}, {urls: ['<all_urls>']})
