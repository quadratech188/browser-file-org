// @ts-check

(async () => {
	const extractors = [
		{
			url_pattern: 'https://classroom.google.com/.*',
			extractor: 'google-classroom'
		},
		{
			url_pattern: 'doitedu.kr/bbs_shop/',
			extractor: 'doitedu'
		},
	]

	const url = window.location.href

	for (const cond of extractors) {
		if (new RegExp(cond.url_pattern).test(url)) {
			await import(browser.runtime.getURL(`extractors/${cond.extractor}/content.js`))
		}
	}
})()
