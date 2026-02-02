// @ts-check

/**
 *
 * @typedef {{
 *     type: 'not_moved' | 'moved',
 *     location: string
 * } | {
 *     type: 'deleted'
 * } | {
 *     type: 'failed',
 *     location: string,
 *     error: {type: string, message: string | undefined}
 * }} MoveResult
 *
 * @param {FileAttrs} attrs
 * @param {string} origin
 * @returns {Promise<MoveResult>}
 */

async function try_move(attrs, origin) {
	/** @type SerializedRule[] */
	const rules = (await browser.storage.local.get({
		rules: []
	}))['rules']

	console.log('These attrs:')
	console.log(attrs)

	const rule = rules
		.map(rule_obj => new Rule(rule_obj))
		.find(rule => rule.matches(attrs))

	if (rule === undefined) {
		console.log('Failed to match anything')
		return {
			type: 'not_moved',
			location: origin
		}
	}

	const dest = rule.get_path(attrs)

	console.log(`Matches this rule:`)
	console.log(rule.serialize())
	console.log(`Moving ${origin} to ${dest}`)

	try {
		const response = await browser.runtime.sendNativeMessage('browser_file_org_native', {
			origin: origin,
			dest: dest,
			opts: {
				dest_exists: 'error'
			}
		})
		if ('Ok' in response) {
			if (response.Ok === 'moved') {
				return {
					type: 'moved',
					location: dest
				}
			}
			else {
				return {
					type: 'deleted'
				}
			}
		}
		else {
			console.log('Native Host returned error:')
			console.log(response.Err)
			return {
				type: 'failed',
				location: origin,
				error: response.Err
			}
		}
	}
	catch (e) {
		console.log('There was an error during messaging:')
		console.log(e)
		return {
			type: 'failed',
			location: origin,
			error: {
				type: 'messaging',
				message: `${e}`
			}
		}
	}
}
