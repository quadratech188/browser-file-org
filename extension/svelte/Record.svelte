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

	let error_opened = $state(false)

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
	<p>
		<span>Status:</span>
		{#if record.meta.status === 'moved'}
		<span style="color: green">Moved</span>
		{:else if record.meta.status === 'not_moved'}
		<span style="color: green">Not moved</span>
		{:else}
		<span style="color: red">Failed</span>
		<span
			role="button"
			tabindex="0"
			class="toggle-icon"
			onclick={() => {error_opened = !error_opened}}
			onkeydown={(e) => {
				if (e.key == 'Enter') {
					error_opened = !error_opened
				}
			}}>
			{error_opened ? '\u25B4' : '\u25BE'}
		</span>

		{#if error_opened}
		<br>
		<span class="error-text">
		| {record.meta.move_error}
		</span>
		{/if}
		{/if}
	</p>
	
	<div class="horiz">
		<p style="white-space: nowrap;">Last seen:&nbsp;</p>
		<p class="filepath" title={record.meta.location}>{record.meta.location}</p>
	</div>

	<div class="horiz">
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
p {
	margin: 0;
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
.filepath {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	min-width: 0;
	flex-grow: 1;
}
.horiz {
	width: 100%;
	display: flex;
}
.toggle-icon {
    cursor: pointer;
    user-select: none;
    padding: 0 0.2rem;
}
.error-text {
    font-family: monospace;
}
</style>
