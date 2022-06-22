<script>
	import { blur, fly } from 'svelte/transition';
	import Fa from 'svelte-fa/src/fa.svelte';
	// @ts-ignore
	import { faCircleXmark } from '@fortawesome/free-solid-svg-icons/index.es';
	import RoadmapItem from '$lib/components/RoadmapItem.svelte';

	let openInfo = 0;

	let roadMaps = [
		{
			desc: 'lorem',
			title: 'roadmap 1'
		},
		{
			desc: 'ipsum',
			title: 'roadmap 2'
		},
		{
			desc: 'dolor',
			title: 'roadmap 3'
		},
		{
			desc: 'sit',
			title: 'roadmap 4'
		},
		{
			desc: 'amet',
			title: 'roadmap 5'
		},
		{
			desc: 'consectetur',
			title: 'roadmap 6'
		},
		{
			desc: 'adipisicing',
			title: 'roadmap 7'
		}
	];
</script>

<div
	class="flex flex-col gap-4 p-4 items-center h-screen overflow-y-auto"
	in:blur
	on:click={() => (openInfo = 0)}
>
	<div class="w-full max-w-7xl pb-4">
		<div class="divider text-4xl lg:text-6xl font-black text-left"><h1>Roadmap</h1></div>
	</div>
	<div class="flex flex-col lg:flex-row relative gap-4 w-full max-w-7xl h-auto lg:h-full">
		{#if openInfo !== 0}
			<div
				class="absolute h-full w-full p-4 bg-base-200"
				transition:fly={{ x: -500, duration: 500 }}
				on:click|stopPropagation={() => {}}
			>
				<div class="flex" transition:blur={{ delay: 300 }}>
					<div class="flex-1 text-xl font-bold">
						{roadMaps[openInfo - 1].title}
					</div>
					<div on:click={() => (openInfo = 0)}>
						<Fa icon={faCircleXmark} class="flex-none hover:cursor-pointer" scale={1.5} />
					</div>
				</div>
				<p transition:blur={{ delay: 400 }} class="font-Montserrat">
					{roadMaps[openInfo - 1].desc}
				</p>
			</div>
		{/if}
		{#each roadMaps as roadMap, index}
			<RoadmapItem on:click={() => openInfo = index + 1} {index} title={roadMap.title} />
		{/each}
	</div>
</div>
