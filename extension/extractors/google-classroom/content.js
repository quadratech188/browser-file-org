// @ts-check

const FILE_DIV_SELECTOR = 'div.luto0c, div.t2wIBc';
const FILENAME_SELECTOR = 'div.A6dC2c.QDKOcc.UtdKPb.U0QIdc';
const HEADER_LIST_SELECTOR = 'h1.Hwv4mb.rIyhE'

/**
 * @param {string} url
 * @returns {string}
 */
function get_classroom_id(url) {
	const re = /https:\/\/classroom\.google\.com(?:\/u\/\d+)?\/c\/(?<id>[^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return /** @type string */ (match.groups?.id);
}

/**
 * @param {HTMLDivElement} div 
 */
function add_rule_btn(div) {
	const btn = document.createElement('button')
	btn.classList.add('gcu-rule-btn');
	btn.textContent = 'Make this Classroom into a Rule'
	btn.addEventListener('click', async () => {
		await add_rule(new Rule({
			id: crypto.randomUUID(),
			conds: {
				classroom_id: get_classroom_id(window.location.href)
			},
			dest: ''
		}), true)
	})
	div.appendChild(btn)
}

/**
 * @param {HTMLDivElement} div 
 */
function add_button_div(div) {
	const url = /** @type string */ (div.querySelector('a')?.href);

	const re = /https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/view\?usp=classroom_web&authuser=(\d+)/;
	const match = url.match(re);
	if (match === null) {
		// Probably just not a google drive link, but I don't really care
		console.warn(`Failed to parse link: ${url}`);
		return;
	}
	const file_id = match[1];
	const authuser = match[2];

	// https://sites.google.com/site/gdocs2direct/
	const download_url = `https://drive.usercontent.google.com/download?id=${file_id}&export=download&authuser=${authuser}`

	const filename = /** @type {HTMLDivElement} */(div.querySelector(FILENAME_SELECTOR)).innerText;

	let extension_div = document.createElement('div');
	extension_div.classList.add('gcu-btn-div');

	const folder_download_btn = document.createElement('button');
	folder_download_btn.textContent = "Download to Folder"
	folder_download_btn.addEventListener('click', async () => {
		await send_download({
			type: 'tab',
			args: download_url
		}, {
			filename: filename,
			classroom_id: get_classroom_id(window.location.href)
		})
	})
	extension_div.appendChild(folder_download_btn);

	div.appendChild(extension_div);
}

const observer = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		mutation.addedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;
			const element = /** @type Element */ (node)

			if (element.matches(FILE_DIV_SELECTOR)) {
				add_button_div(/** @type HTMLDivElement */ (element));
			}
			if (element.matches(HEADER_LIST_SELECTOR)) {
				add_rule_btn(/** @type HTMLDivElement */ (element));
			}
		})
		mutation.removedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;
			const element = /** @type Element */ (node)

			if (element.classList.contains('gcu-btn-div')) {
				add_button_div(/** @type HTMLDivElement */ (mutation.target));
			}
			if (element.classList.contains('gcu-rule-btn')) {
				add_rule_btn(/** @type HTMLDivElement */ (mutation.target));
			}
		})
	});
})

observer.observe(document.body, {
	childList: true,
	subtree: true,
})

document.querySelectorAll(HEADER_LIST_SELECTOR).forEach((e) => {
	add_rule_btn(/** @type HTMLDivElement */ (e))
})
