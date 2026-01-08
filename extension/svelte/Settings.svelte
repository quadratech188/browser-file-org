<script>
	import { onMount } from 'svelte'
	import Rule from './Rule.svelte'
	import Record from './Record.svelte'

	/** @type SerializedRule[] */
	let rules = $state([])
	/** @type FinishedDownload[] */
	let history = $state([])

	onMount(async () => {
		rules = (await browser.storage.local.get({
			rules: []
		}))['rules']
		history = (await browser.storage.local.get({
			history: []
		}))['history']
	})

	browser.storage.local.onChanged.addListener(console.log)

	async function save() {
		await browser.storage.local.set({
			rules: $state.snapshot(rules)
		})
	}
	/**
	 * @param {FinishedDownload} record
	 */
	async function move_again(record) {
		const result = await try_move(record.attrs, record.meta.location)

		// FIXME: This is purely visual and not written to storage
		// TODO: Make Svelte $state work with browser.storage
		record.meta = {
			...record.meta,
			...result
		}
	}
</script>

<div id="frame">
	<div id="rules">
		<div class="align-row">
			<h1>Rules</h1>
			<button style="margin-left: 1rem"
				onclick={save}>Save</button>
		</div>
		{#each rules as rule, index (rule.id)}
		<div class="rule-container">
			<Rule bind:serialized_rule={rules[index]}/>
			<button onclick={() => {rules.splice(index, 1)}}>x</button>
		</div>
		{/each}
	</div>
	<div id="history">
		{#each history as record (record.id)}
		<div class="rule-container">
			<Record record={record}
				on_move_again={move_again}
				on_new_rule={(r) => {rules.push(r)}}/>
		</div>
		{/each}
		<h1>History</h1>
	</div>
</div>

<style>
#frame {
	display: flex;
}
#rules, #history {
	width: 100%;
	padding: 1rem;
	min-width: 0;
}
#history {
	display: flex;
	flex-direction: column-reverse;
}
.rule-container {
	margin-bottom: 1rem;
	display: flex;
	flex-direction: row;
}
.align-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}
</style>
