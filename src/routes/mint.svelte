<script lang="ts">
	import { blur } from 'svelte/transition';
	import Countdown from '$lib/components/Countdown.svelte';
	import { accounts, provider } from '$lib/ethereum/stores';
	import { rprAbi, rprAddress } from '$lib/ethereum/constants';
	import { ethers } from 'ethers';
	import Carousel from '$lib/components/Carousel.svelte';

	enum Phase {
		PRESEED,
		SEED,
		PRE,
		PUBLIC
	}

	const totalMint = 10000;
	let rprContract: ethers.Contract;
	let preSaleStartTime = 0;
	let presaleDuration = 0;
	let seedPrice = 0;
	let presalePrice = 0;
	let publicPrice = 0;
	let mintPrice = 0;
	let totalMinted = 0;
	let seedRoundAlloc = 0;
	let rektOGAlloc = 0;
	let mintCount = 1;
	let maxPerAddressDuringMint = 1;
	let maxMint = 0;
	let phase = Phase.PRESEED;
	let numberMinted = 0;

	const rprContractStatic = new ethers.Contract(
		rprAddress,
		rprAbi,
		new ethers.providers.JsonRpcProvider()
	);

	const getSaleConfig = async () => {
		const saleConfig = await rprContractStatic.saleConfig();
		preSaleStartTime = Number(saleConfig.preSaleStartTime) * 1000;
		presaleDuration = Number(saleConfig.preSaleDuration) * 1000;
		seedPrice = Number(ethers.utils.formatEther(saleConfig.seedPrice));
		presalePrice = Number(ethers.utils.formatEther(saleConfig.preSalePrice));
		publicPrice = Number(ethers.utils.formatEther(saleConfig.publicSalePrice));
	};

	const getTotalMinted = async () => {
		totalMinted = Number(await rprContractStatic.totalSupply());
	};

	const getSeedRoundAlloc = async () => {
		if (!$provider || $accounts.length === 0) return;

		seedRoundAlloc = Number(await rprContract.allowlist($accounts[0]));
	};

	const getRektOGAlloc = async () => {
		if (!$provider || $accounts.length === 0) return;

		rektOGAlloc = Number(await rprContract.rektOGs($accounts[0]));
	};

	const getMaxMint = async () => {
		maxPerAddressDuringMint = Number(await rprContractStatic.maxPerAddressDuringMint());
	};

	const getNumberMinted = async () => {
		if (!$provider || $accounts.length === 0) return;
		numberMinted = Number(await rprContract.numberMinted({ from: $accounts[0] }));
	};

	const mint = async () => {
		if (!$provider || $accounts.length === 0) return;
		switch (phase) {
			case Phase.SEED:
				try {
					const tx = await rprContract.seedRoundMint(mintCount.toString(), {
						value: ethers.utils.parseEther(mintPrice.toFixed(2))
					});
					await tx.wait();
					totalMinted += mintCount;
					getSeedRoundAlloc();
					getTotalMinted();
					console.log('successfully minted ', mintCount, ' rekt pepes: ', tx);
				} catch (e) {
					console.error(e);
				}
				break;
			case Phase.PRE:
				try {
					const tx = await rprContract.mint(mintCount.toString(), {
						value: ethers.utils.parseEther(mintPrice.toFixed(2))
					});
					await tx.wait();
					totalMinted += mintCount;
					getNumberMinted();
					getTotalMinted();
					console.log('successfully minted ', mintCount, ' rekt pepes: ', tx);
				} catch (e) {
					console.error(e);
				}
				break;
			case Phase.PUBLIC:
				try {
					const tx = await rprContract.mint(mintCount.toString(), {
						value: ethers.utils.parseEther(mintPrice.toFixed(2))
					});
					await tx.wait();
					totalMinted += mintCount;
					getNumberMinted();
					getTotalMinted();
					console.log('successfully minted ', mintCount, ' rekt pepes', tx);
				} catch (e) {
					console.error(e);
				}
				break;

			default:
				break;
		}
	};

	const listenToMints = () => {
		rprContractStatic.on('Mint', () => {
			getTotalMinted();
		});
	};

	getSaleConfig();
	getTotalMinted();
	getMaxMint();
	listenToMints();

	$: if ($provider && $accounts.length > 0) {
		rprContract = new ethers.Contract(rprAddress, rprAbi, $provider.getSigner());
		getSeedRoundAlloc();
		getRektOGAlloc();
		getNumberMinted();
	}

	$: if (preSaleStartTime > 0) {
		const now = Date.now();
		if (seedPrice === 0) {
			phase = Phase.PRESEED;
		} else if (now < preSaleStartTime) {
			phase = Phase.SEED;
		} else if (now >= preSaleStartTime && now < preSaleStartTime + presaleDuration) {
			phase = Phase.PRE;
		} else if (now >= preSaleStartTime + presaleDuration) {
			phase = Phase.PUBLIC;
		}
	}

	$: if (phase === Phase.PRESEED) {
		mintPrice = 0;
		maxMint = 0;
	} else if ((seedRoundAlloc > 0 || rektOGAlloc > 0) && phase === Phase.SEED) {
		mintPrice = seedPrice * mintCount;
		if (seedRoundAlloc > 0) {
			maxMint = seedRoundAlloc;
		} else if (rektOGAlloc > 0) {
			maxMint = rektOGAlloc;
		}
	} else if (phase === Phase.PRE) {
		mintPrice = presalePrice * mintCount;

		const maxMint_ = maxPerAddressDuringMint - numberMinted;
		if (rektOGAlloc > 0) {
			maxMint = Math.max(maxMint_, rektOGAlloc);
		} else {
			maxMint = maxMint_;
		}
	} else if (phase === Phase.PUBLIC) {
		if (rektOGAlloc > 0) {
			mintPrice = presalePrice * mintCount;
			maxMint = rektOGAlloc;
		} else {
			mintPrice = publicPrice * mintCount;
			maxMint = maxPerAddressDuringMint - numberMinted;
		}
	} else {
		mintPrice = publicPrice;
	}
</script>

<div class="flex flex-col items-center gap-4 p-4" in:blur>
	{#if phase !== Phase.PUBLIC && preSaleStartTime > 0}
		<h1 class="divider text-4xl font-bold">Pre Sale</h1>
		<Countdown
			deadline={phase === Phase.PRE ? preSaleStartTime + presaleDuration : preSaleStartTime}
			started={phase === Phase.PRE}
		/>
		{#if (seedRoundAlloc > 0 || rektOGAlloc > 0) && phase === Phase.SEED}
			<h1 class="divider text-4xl font-bold">Seed Round</h1>
			<Countdown deadline={preSaleStartTime} started />
		{:else if (seedRoundAlloc > 0 || rektOGAlloc > 0) && phase === Phase.PRESEED}
			<h1 class="divider text-4xl font-bold text-center py-4 lg:py-0">
				Seed Round <br class="block lg:hidden" />Not Started Yet
			</h1>
		{/if}
	{:else if preSaleStartTime === 0}
		<h1 class="divider text-4xl font-bold">Pre Sale <br class="block lg:hidden" />Time TBD</h1>
	{/if}

	<div
		class="flex flex-col md:flex-row gap-8 items-start justify-between mt-10 rounded-lg bg-base-200 p-8 w-full max-w-3xl"
	>
		<div class="flex-1">
			<Carousel />
		</div>
		<div class="flex flex-col w-full gap-4 items-center">
			<div class="stats shadow w-full rounded-xl max-w-sm">
				<div class="stat place-items-center">
					<div class="stat-title text-xl">Minted</div>
					<div class="stat-value">{totalMinted.toLocaleString()}/{totalMint.toLocaleString()}</div>
					<div class="stat-desc">rekt pepes</div>
				</div>
			</div>
			<p class="text-center text-2xl font-extrabold bg-base-100 rounded-xl py-2 w-full max-w-sm">
				{mintPrice.toFixed(2)} ETH
			</p>
			<div class="form-control">
				<div class="input-group">
					<button
						class="btn btn-square"
						on:click={() => {
							if (mintCount <= 1) return;
							mintCount--;
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
							width="24px"
							height="24px"
							class="fill-neutral-content"
							><path
								d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
							/></svg
						>
					</button>
					<input
						type="number"
						placeholder="1"
						class="input input-bordered w-full"
						bind:value={mintCount}
						on:change={() => {
							if (mintCount <= 1) mintCount = 1;
							if (mintCount >= maxMint) mintCount = maxMint;
						}}
					/>
					<button
						class="btn btn-square"
						on:click={() => {
							if (mintCount >= maxMint) return;
							mintCount++;
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
							width="24px"
							height="24px"
							class="fill-neutral-content"
							><path
								d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
							/></svg
						>
					</button>
				</div>
			</div>
			<button
				class:btn-disabled={$accounts.length == 0 || maxMint == 0}
				class="btn bg-base-300 w-32"
				disabled={$accounts.length == 0 || maxMint == 0}
				on:click={() => mint()}>Mint</button
			>
		</div>
	</div>
	<div class="mt-10 rounded-lg bg-base-200 p-4 lg:p-10 w-full max-w-3xl font-Montserrat text-xl">
		Following the exploit Revest Finance suffered in March 2022, they swore an oath to do everything
		in their power to make those affected whole. Out of this came the Renaissance. The Rekt Pepe
		Renaissance! <div class="divider" />
		Rekt Pepe Renaissance is a Charity NFT collection—verified by Blocks—which pokes fun at all the projects
		that have ever gotten rekt, including Revest. Proceeds from the NFT mint will be going to the affected
		communities and to the artists we commissioned for the amazing and hilarious collection.
	</div>
</div>
