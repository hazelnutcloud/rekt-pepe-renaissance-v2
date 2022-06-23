<script>
	import ConnectWallet from '$lib/components/ConnectWallet.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { onMount } from 'svelte';
	// @ts-ignore
	import { themeChange } from 'theme-change';
	import '../app.css';

	onMount(() => {
		themeChange(false);
	});
</script>

<!-- https://daisyui.com/components/drawer/ -->
<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="w-full navbar bg-base-200 top-0 left-0 justify-between z-50 sticky">
			<div class="flex-none lg:hidden">
				<label for="my-drawer-3" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-6 h-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/></svg
					>
				</label>
			</div>
			<a href="/">
				<div
					class="text-3xl hover:bg-base-300 p-2 rounded-lg hover:shadow-lg hidden lg:block font-serif tracking-wide"
				>
					RPR
				</div>
				</a
			>
			<div class="flex gap-4">
				<ThemePicker />
				<ul class="menu menu-horizontal menu-compact gap-1 hidden lg:flex">
					<!-- Navbar menu content here -->
					<li class="py-0">
						<a class="text-xl" href="/mint">Mint</a>
					</li>
					<li class="py-0">
						<a class="text-xl" href="/roadmap">Roadmap</a>
					</li>
					<li class="py-0">
						<a class="text-xl" href="/about">About</a>
					</li>
				</ul>
				<ConnectWallet />
			</div>
		</div>
		<!-- Page content here -->
		<slot />
		<Footer />
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" class="drawer-overlay" />
		<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
			<!-- Sidebar content here -->
			<li><a class="text-xl" href="/">Home</a></li>
			<li><a class="text-xl" href="/mint">Mint</a></li>
			<li><a class="text-xl" href="/roadmap">Roadmap</a></li>
			<li><a class="text-xl" href="/about">About</a></li>
		</ul>
	</div>
</div>
