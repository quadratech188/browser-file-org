<script>
	let {serialized_rule = {
		conds: {},
		dest: ''
	}, onclose = () => {}} = $props();
	import Rule from './Rule.svelte'

</script>

<div class="browser-file-org-veil"
	onclick={(e) => {if (e.target == e.currentTarget) onclose(null)}}
	role="presentation">
	<div class="browser-file-org-popup">
		<h3 style="text-align: center;">Create new rule</h3>
		<div class="rule-container">
			<Rule bind:serialized_rule={serialized_rule}/>
		</div>
		<div>
			<button style="float: right" onclick={() => {onclose(serialized_rule)}}>Create</button>
		</div>
	</div>
</div>

<svelte:window onkeydown={(e) => {if (e.key == 'Escape') onclose(null)}} />

<style>
h3 {
	margin-top: 0;
}
button {
	margin-top: 0.3rem;
}
.browser-file-org-veil {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 10000;
	background: rgba(0, 0, 0, 0.2);
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 20vh;
}
.browser-file-org-popup {
	width: 50vw;
	background: white;
	padding: 1rem;
	max-height: 70vh;

	display: flex;
	flex-direction: column;
}
.rule-container {
	flex-shrink: 1;
	overflow-y: auto;
}
</style>
