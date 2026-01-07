<script>
	const {
		record,
		on_new_rule = () => {}
	} = $props()

	const checked_attrs = $state({})
	for (const k of Object.keys(record.attrs)) {
		checked_attrs[k] = false
	}

	function check_all(e) {
		for (const k of Object.keys(checked_attrs)) {
			checked_attrs[k] = e.target.checked
		}
	}
	function new_rule() {
		/** @type Record<string, string> */
		const conds = {}
		for (const [k, v] of Object.entries(record.attrs)) {
			if (!checked_attrs[k]) continue
			conds[k] = v
		}
		/** @type SerializedRule */
		const rule = {
			conds,
			dest: ''
		}
		on_new_rule(rule)
	}
</script>

<div class="frame">
	<table>
	<tbody>
		<tr>
			<th style="width: 30%">Attribute</th>
			<th>Value</th>
			<th style="width: min-content">
				<input type="checkbox" onchange={check_all}>
			</th>
		</tr>
		{#each Object.entries(record.attrs) as [k, v]}
		<tr>
			<td>{k}</td>
			<td>
			<div class="scroll">{v}</div>
			</td>
			<td>
				<input bind:checked={checked_attrs[k]} type="checkbox">
			</td>
		</tr>
		{/each}
	</tbody>
	</table>
	<hr>
	<div class="button-container">
		<button>Redownload (TODO)</button>
		<button>Move again (TODO)</button>
		<button onclick={() => {new_rule()}}>Create new rule from selected attributes</button>
	</div>
</div>
<style>
* {
	box-sizing: border-box;
}
table, th, td {
	border-style: solid;
	border-width: 1px;
}
table {
	table-layout: fixed;
	border-collapse: collapse;
	width: 100%;
}
button {
	width: 100%;
}
.frame {
	padding: 1rem;
	border-style: solid;
	border-width: 1px;
	width: 100%;
}
.scroll {
	overflow-wrap: anywhere;
	word-break: break-all;
	overflow: auto;
	max-height: 3.5rem;
}
.button-container {
	display: flex;
}
</style>
