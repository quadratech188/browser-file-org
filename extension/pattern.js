// @ts-check

/**
 * @typedef {Record<string, string> & {
 * 	filename: string,
 * 	url: string
 * }} FileAttrs
 */

class Rule {
	/** @type Map<string, RegExp> */
	conds;
	/** @type string */
	dest;

	/**
	 * @param {*} obj 
	 */
	constructor(obj) {
		this.dest = obj.dest
		this.conds = new Map()

		for (const [k, v] of Object.entries(obj)) {
			this.conds[k] = new RegExp(v)
		}
	}

	/**
	 * @param {FileAttrs} file_attrs 
	 * @returns {boolean}
	 */
	matches(file_attrs) {
		for (const [k, v] of this.conds) {
			if (!(k in file_attrs)) {
				return false
			}
			if (!v.test(file_attrs[k])) {
				return false
			}
		}
		return true
	}

	/**
	 * @param {FileAttrs} file_attrs
	 * @returns {string}
	 */
	get_path(file_attrs) {
		return `${this.dest}/${file_attrs.filename}`
	}

	serialize() {
		const conds = {}
		for (const [k, v] of this.conds) {
			conds[k] = v.source
		}
		return {
			conds: conds,
			dest: this.dest
		}
	}
}
