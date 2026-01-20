// @ts-check

(() => {
	const frame = document.querySelector('div.attachFiles')
	if (!frame) return

	const url = new URL(window.location.href)

	const board_code = url.searchParams.get('board_code')
	const board_idx = url.searchParams.get('idx')


	if (!board_code || !board_idx) {
		return
	}

	const header = /** @type HTMLHeadingElement */ (document.querySelector('.hgroup')?.querySelector('h1'))
	if (!header) {
		return
	}

	const attrs = {}

	const category = document.querySelector('.sub_title_01')?.querySelector('h1')
	if (category) {
		attrs.category = category.innerText
	}

	const board = document.querySelector('.sub_subject')
	if (board) {
		attrs.board = /** @type HTMLHeadingElement */ (board).innerText
	}

	if (header.childNodes.length === 3) {
		attrs.tag = /** @type HTMLSpanElement */ (header.childNodes[1]).innerText
		attrs.post = /** @type Text */ (header.childNodes[2]).data.trim()
	}
	if (header.childNodes.length === 1) {
		attrs.post = header.innerText
	}
	
	console.log(attrs)

	/** @type Record<string, string> */
	const prefixed_attrs = {}
	for (const [k, v] of Object.entries(attrs)) {
		prefixed_attrs[`doitedu_${k}`] = v
	}
	set_page_attrs(prefixed_attrs)

	const id_regexp = new RegExp(/javascript:file_download\((?<id>[0-9]+)\)/)
	for (const p of frame.children) {
		const anchor = /** @type HTMLAnchorElement */ (p.querySelector('a'))

		const match = anchor.href.match(id_regexp)
		if (!match) {
			console.log('Failed to get id of download item:')
			console.log(anchor)
			continue
		}

		const id = parseInt(/** @type string */ (match.groups?.id))
		const params = new URLSearchParams([
			['board_code', board_code],
			['board_idx', board_idx],
			['sel_no', `${id}`]
		])
		const download_url = `${url.origin}/bbs_shop/file_download.php?${params}`

		const span = /** @type HTMLSpanElement */ (anchor.querySelector('span'))
		const filename = span.textContent.trim()

		// Disable original download action
		anchor.href = 'javascript:;'

		anchor.addEventListener('click', () => {
			send_download({
				type: 'browser',
				args: {
					url: download_url,
					filename: filename
				}
			}, {
			})
		})
	}
})()
