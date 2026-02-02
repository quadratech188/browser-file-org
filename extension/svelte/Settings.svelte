<script>
	import { onMount } from 'svelte'
	import Rule from './Rule.svelte'
	import Record from './Record.svelte'
	import {dndzone} from "svelte-dnd-action";

	/** @type SerializedRule[] */
	let rules = $state([])
	/** @type FinishedDownload[] */
	let history = $state([])
	$inspect(history)

	onMount(async () => {
		const data = await browser.storage.local.get({
			rules: [],
			history: []
		})
		rules = data.rules,
		history = data.history
	})

	browser.storage.onChanged.addListener(async (e) => {
		if (!('history_last_modified' in e)) return
		const data = await browser.storage.local.get({
			history: []
		})
		history = data.history
	})

	async function save() {
		await browser.storage.local.set({
			rules: $state.snapshot(rules)
		})
	}

	/**
	 * @param {FinishedDownload} record
	 */
	async function move_again(record) {
		if (!('location' in record.meta.move_result)) return
		record.meta.move_result = await try_move(record.attrs, record.meta.move_result.location)

		// This doesn't trigger onChanged
		await browser.storage.local.set({
			history: $state.snapshot(history),
			history_last_modified: Date.now()
		})
	}

	function handle_dnd_consider(e) {
		rules = e.detail.items
	}
	function handle_dnd_finalize(e) {
		rules = e.detail.items
	}
</script>

<div id="frame">
	<div id="rules">
		<div class="align-row">
			<h1>Rules</h1>
			<button style="margin-left: 1rem"
				onclick={save}>Save</button>
		</div>
		<section use:dndzone="{{items: rules}}" onconsider="{handle_dnd_consider}" onfinalize="{handle_dnd_finalize}">
		{#each rules as rule, index (rule.id)}
		<div class="rule-container">
			<Rule bind:serialized_rule={rules[index]}/>
			<button onclick={() => {rules.splice(index, 1)}}>x</button>
		</div>
		{/each}
		</section>
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
	justify-content: flex-end;
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
