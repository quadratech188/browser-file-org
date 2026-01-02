// @ts-check

/**
 * @param {any} event
 * @param {any} cond
 */
async function listen_once(event, cond) {
	return new Promise((resolve) => {
		function listen(/** @type any */ item) {
			if (!cond(item)) {
				return;
			}

			event.removeListener(listen);
			resolve(item);
		}
		event.addListener(listen);
	})
}
