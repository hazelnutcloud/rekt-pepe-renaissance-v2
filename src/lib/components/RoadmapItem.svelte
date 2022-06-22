<script>
	// @ts-nocheck

	import Fa from 'svelte-fa/src/fa.svelte';
	import { faRightLong } from '@fortawesome/free-solid-svg-icons/index.es';
	import { blur } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let index = 0;
	export let title = 'Roadmap item';

	const dispatch = createEventDispatcher();
</script>

<div
	class="lg:flex-1 lg:h-full bg-zinc-500 p-4 bg-blend-multiply bg-contain hover:bg-white h-40 flex flex-col items-start justify-end roadmap-item"
	style="--bg-url: url('/rektpepes/silhouettes/{index + 1}.png');"
	in:blur={{ delay: index * 200 + 100 }}
	on:click|stopPropagation={() => dispatch('click')}
>
	{title}
	<Fa icon={faRightLong} />
</div>

<style>
	.roadmap-item {
		background-image: var(--bg-url);
	}
</style>
