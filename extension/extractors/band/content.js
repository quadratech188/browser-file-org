// @ts-check

set_page_attrs(() => {
	const title = /** @type HTMLAnchorElement */ (document.querySelector('.uriText'))
	return {
		band_name: title.innerText
	}
})
