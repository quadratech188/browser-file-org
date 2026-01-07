<script>
	let { serialized_rule = $bindable({
		id: crypto.randomUUID(),
		conds: {},
		dest: ''
	})} = $props()

	/** @type [string, string][] */
	let conds = $state(Object.entries(serialized_rule.conds))
	let dest = $state(serialized_rule.dest)

	$effect(() => {
		serialized_rule.conds = Object.fromEntries(conds)
		serialized_rule.dest = dest
	})
</script>

<div class="frame">
	<button onclick={() => {conds.unshift(['', ''])}}>Add new attribute</button>
	<div class="grid">
		{#each conds as cond, index}
		<input bind:value={cond[0]} type="text" size=5>
		<p>|</p>
		<input bind:value={cond[1]} type="text" size=5>
		<button onclick={() => {conds.splice(index, 1)}}>x</button>
		{/each}
	</div>
	<hr>
	<div class="dest-row">
		<p>Move to:</p>
		<input bind:value={dest} class="dest" type="text" size=5>
	</div>
</div>

<style>
* {
	box-sizing: border-box;
}
p {
	margin: 0;
}
hr {
	margin-top: 1rem;
	margin-bottom: 1rem;
}
.frame {
	padding: 1rem;
	border-style: solid;
	border-width: 1px;
	width: 100%;
}
.grid {
	display: grid;
	grid-template-columns: 1fr auto 1fr auto;
	row-gap: 0.3rem;
	margin-top: 0.3rem;
}
.dest-row {
	display: flex;
	justify-content: space-between;
}
.dest {
	width: 70%;
}
</style>
