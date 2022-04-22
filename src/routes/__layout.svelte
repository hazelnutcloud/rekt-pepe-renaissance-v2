<script>
	import Header from '$lib/components/header/Header.svelte';
	import Annoucements from '$lib/components/Icons/Announcements.svelte';
	import Discord from '$lib/components/Icons/Discord.svelte';
	import Telegram from '$lib/components/Icons/Telegram.svelte';
	import Twitter from '$lib/components/Icons/Twitter.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../styles/main.scss';
</script>

<Header />

<main>
	<slot />
</main>

<footer class="footer">
	<div class="socials">
		<a
			class="icon-wrapper"
			data-delay="0"
			href="https://twitter.com/RevestFinance"
			target="_blank"
		>
			<Twitter />
		</a>
		<a
			class="icon-wrapper"
			data-delay="150"
			href="https://t.me/revestfinance"
			target="_blank"
		>
			<Telegram />
		</a>
		<a
			class="icon-wrapper"
			data-delay="300"
			href="https://t.me/RevestAnnouncements"
			target="_blank"
		>
			<Annoucements />
		</a>
		<a
			class="icon-wrapper"
			data-delay="500"
			href="https://discord.gg/TdJSzW9H4G"
			target="_blank"
		>
			<Discord />
		</a>
	</div>
	<p class="copyright" data-delay="400">
		{`Rekt Pepe Renaissance ${new Date().getFullYear()} ©. All Rights Reserved.`}
	</p>
</footer>

<SvelteToast />

<style lang="scss">
	.icon-wrapper {
		display: flex;
		align-items: center;
		opacity: 0.5;

		&:hover {
			opacity: 1;
		}

		:global(svg) {
			height: var(--font-size--3);
			width: var(--font-size--3);
		}
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: var(--page-wrapper-padding);
		width: 100%;
		//max-width: var(--screen--xl);
		margin: 0 auto;
		align-items: center;
		justify-content: space-evenly;
	}

	.socials {
		display: flex;
		gap: 2rem;
	}

	footer {
		display: grid;
		place-items: center;
		padding: var(--page-wrapper-padding);
		gap: 2rem;
		z-index: 1;
	}

	.copyright {
		font-family: var(--font-family--base);
		color: var(--color--lightgray);
		font-size: var(--font-size---2);
	}
</style>
