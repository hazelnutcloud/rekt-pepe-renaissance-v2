<script>
	import { onMount } from 'svelte';

	export let integer = 0;
	export let inputObj;

	let onlyPositive = true;

	const id = inputObj.index;

	onMount(() => {
		if ('extra_data' in inputObj && 'only_positive' in inputObj.extra_data) {
			onlyPositive = Boolean(inputObj.extra_data.only_positive);
		}
	});
</script>

<label for={id} class="input-label">
	<span class="input-label-text">{inputObj.label}</span>
	<input
		class="input numeric"
		type="number"
		name="name"
		placeholder="0"
		autocomplete="off"
		autocorrect="off"
		step="any"
		min="0"
		spellcheck="false"
		{id}
		bind:value={integer}
		on:input={() => {
			if (integer < 0 && onlyPositive) {
				integer = 0;
			}
			if (integer % 1 != 0) {
				integer = Math.floor(integer);
			}
		}}
	/>
</label>

<style lang="scss">

</style>
