<script>
	import { onDestroy } from 'svelte';

	export let deadline = Date.now();
	export let started = false;

	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	const timer = setInterval(() => {
		const now = Date.now();

		const distance = deadline - now;

		days = Math.floor(distance / (1000 * 60 * 60 * 24));
		hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((distance % (1000 * 60)) / 1000);
	});

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<div class="flex flex-col items-center gap-4">
	<p class="text-xl">{started ? "ending in" : "starting in"}</p>
	<div class="grid grid-flow-col gap-5 text-center auto-cols-max -z-10 bg-base-300 p-4 rounded-2xl">
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content mt-">
			<span class="countdown font-mono text-5xl">
				<span style="--value:{days};" />
			</span>
			days
		</div>
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown font-mono text-5xl">
				<span style="--value:{hours};" />
			</span>
			hours
		</div>
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown font-mono text-5xl">
				<span style="--value:{minutes};" />
			</span>
			min
		</div>
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown font-mono text-5xl">
				<span style="--value:{seconds};" />
			</span>
			sec
		</div>
	</div>
</div>
