<script>
	import { blur, fly } from 'svelte/transition';
	import Fa from 'svelte-fa/src/fa.svelte';
	// @ts-ignore
	import { faCircleXmark } from '@fortawesome/free-solid-svg-icons/index.es';
	import RoadmapItem from '$lib/components/RoadmapItem.svelte';

	let openInfo = 0;

	let roadMaps = [
		{
			desc: 'Each Rekt Pepe will be smart-wallet enabled utilizing Revest\'s innovative counterfactual void storage system. A smart-wallet can contain other assets such as ERC-20 token. Assets can be easily transferred to these smart-wallet enable NFTs by sending the asset to the address found in the metadata for the NFT. The Renaissance can develop or commission a frontend interface through which these assets can be withdrawn.',
			title: 'Utility for Smart Wallets',
			revealed: true
		},
		{
			desc: 'Smart-wallet enabled NFTs can be used as a receptacle for token staking or for receiving a share of a protocol or project\'s revenue. A series of smart-wallet enabled NFTs can also be easily airdropped to. Revest Finance offers services to make this easy and seamless',
			title: 'Staking through Revest',
			revealed: false
		},
		{
			desc: 'Rekt Pepe Renaissance is a community-driven project, and The Renaissance will be made into a DAO shortly after the conclusion of the NFT mint. The DAO will own, in its entirety, the intellectual property, website, DNS, Discord, Twitter relating to the project. The DAO is provided this roadmap as a set of guidelines as to what the can achieve. The DAO will utilize a novel governance solution that will be 100% on-chain, made possible through the capabilities of the smart-wallet enabled NFTs.',
			title: 'Community-Driven DAO',
			revealed: false
		},
		{
			desc: 'The Renaissance could serve as a bounty board for Quality Assurance and Beta Testing services required by other projects in order to prevent them from getting Rekt. The Renaissance may also act as a “network-of-networks”, or a hub, to connect  protocols and projects that may form good partners, and further aid in the maturity of the crypto industry. The Renaissance may charge a fee for these services if they so wish. The Renaissance may also serve as a community to those who’ve been rekt. The Renaissance may welcome these individuals or communities subject to admittance being granted through the governance of The Renaissance.',
			title: 'Biz-Dev Relay Network (Goal)',
			revealed: false
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
		<p class="text-center p-4">Rekt Pepe Renaissance is a <span class="font-bold">community-driven</span> project. It will be developed by and taken in whatever direction The Renaissance decrees.
		</p>
	</div>
	<div class="grid grid-cols-2 relative gap-4 w-full max-w-7xl h-full">
		{#if openInfo !== 0}
			<div
				class="absolute h-full w-full p-14 bg-base-200"
				transition:fly={{ x: -500, duration: 500 }}
				on:click|stopPropagation={() => {}}
			>
				<div class="flex" transition:blur={{ delay: 300 }}>
					<div class="flex-1 text-5xl font-bold mb-10">
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
			<RoadmapItem on:click={() => openInfo = index + 1} {index} title={roadMap.title} revealed={roadMap.revealed} />
		{/each}
	</div>
</div>
