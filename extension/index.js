// @ts-check

/**
 * @typedef Cond
 * @property {RegExp} url_pattern
 * @property {string} extractor
 */

(async () => {
	/** @type Cond[] */
	const default_extractors = [
		{
			url_pattern: new RegExp('https://classroom.google.com/.*'),
			extractor: 'extractors/google-classroom/content.js'
		}
	]

	/** @type Cond[] */
	const extractors = (await browser.storage.local.get({
		extractors: default_extractors
	}))['extractors']

	const url = window.location.href

	for (const cond of extractors) {
		if (cond.url_pattern.test(url)) {
			await import(browser.runtime.getURL(cond.extractor))
		}
	}
})()
