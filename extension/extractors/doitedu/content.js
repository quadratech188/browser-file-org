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

	const post = /** @type Text */ (header.childNodes[2]).data.trim()
	const board = /** @type HTMLSpanElement */ (header.childNodes[1]).innerText

	set_page_attrs({
		doitedu_post: post,
		doitedu_board: board
	})

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
