<script>
	import Carousel from '$lib/components/Carousel.svelte';
import { blur } from 'svelte/transition';
</script>

<div class="flex flex-col items-center gap-10 p-4" in:blur>
	<div class="w-full max-w-7xl mt-8">
		<div class="divider"><h1 class="text-4xl lg:text-6xl font-bold">About</h1></div>
	</div>
	<div class="bg-base-200 p-4 lg:p-14 max-w-7xl rounded-xl w-full" in:blur={{ delay: 100 }}>
		<div class="flex flex-wrap md:flex-nowrap justify-center gap-4">
			<div class="flex-1">
				<Carousel />
			</div>
			<p class="font-Montserrat text-xl">
				Following the exploit Revest Finance suffered in March 2022, they swore an oath to do
				everything in their power to make those affected whole. Out of this came the Renaissance.
				The Rekt Pepe Renaissance!
			</p>
		</div>
	</div>
	<div class="bg-base-200 p-4 lg:p-14 max-w-7xl rounded-xl w-full" in:blur={{ delay: 300 }}>
		<div class="flex gap-4 flex-wrap justify-center md:flex-nowrap">
			<p class="font-Montserrat text-xl">
				Rekt Pepe Renaissance is a Charity NFT collection—verified by Blocks—which pokes fun at all
				the projects that have ever gotten rekt, including Revest. Proceeds from the NFT mint will
				be going to the affected communities and to the artists we commissioned for the amazing and
				hilarious collection.
			</p>
			<div class="flex-1">
				<Carousel />
			</div>
		</div>
	</div>
	<div class="w-full max-w-7xl">
		<div class="divider text-xl font-bold">Partners</div>
	</div>
	<div class="flex flex-col lg:flex-row justify-between items-center w-full max-w-7xl py-10 gap-10">
		<a href="https://revest.finance/" target="_blank"
			>
				<img src="logos/revest.svg" alt="revest finance" class="w-52 h-auto rounded-xl" />
				<p class="text-center pt-10">Revest Finance</p></a
		>
		<a href="https://www.blocks.io/" target="_blank"
			><img src="logos/blocks.png" alt="BLOCKS" class="w-52 h-auto rounded-xl" />
			<p class="text-center pt-10">BLOCKS</p></a
		>
		<a href="https://rena.finance/" target="_blank"
			><img src="logos/rena.jpg" alt="rena" class="w-52 h-auto rounded-xl" /><p class="text-center pt-10">Rena Finance</p></a
		>
		<a href="https://ecofi.io/" target="_blank"
			><img src="logos/ecofi.png" alt="EcoFi" class="w-auto h-36 rounded-xl" /><p class="text-center pt-10">EcoFi</p></a
		>
	</div>
</div>
