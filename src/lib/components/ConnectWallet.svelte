<script lang="ts">
	import { truncateAddress } from '$lib/ethereum/helpers';
	import { accounts, provider } from '$lib/ethereum/stores';
	import { network } from '$lib/ethereum/constants';

	import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faWallet,
		faArrowRightFromBracket,
		faExclamationCircle
	} from '@fortawesome/free-solid-svg-icons/index.es';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';
	import Web3Modal from 'web3modal';
	import CoinBaseWalletSDK from '@coinbase/wallet-sdk';
	import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
	import * as UAuthWeb3Modal from '@uauth/web3modal';
	import UAuthSPA from '@uauth/js';

	const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
		clientID: "40ffd3bd-8fa8-4759-af3d-173f482b61d4",
		redirectUri: "http://localhost:3000",
		scope: "openid wallet"
	};

	const providerOptions = {
		coinbasewallet: {
			package: CoinBaseWalletSDK,
			options: {
				appName: 'Rekt Pepe Renaissance',
				infuraId: 'd704cdd9955f4fae94b5b600f39a183c'
			}
		},
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				infuraId: 'd704cdd9955f4fae94b5b600f39a183c'
			}
		},
		'custom-uauth': {
			display: UAuthWeb3Modal.display,
			connector: UAuthWeb3Modal.connector,
			package: UAuthSPA,
			options: uauthOptions
		}
	};

	let web3modal: Web3Modal | undefined;
	let web3modalInstance: any;
	let wrongChain = false;

	// connect wallet
	const connectWallet = () => {
		initWeb3Modal();
		initWallet();
	};

	// disconnect wallet
	const disconnectWallet = () => {
		web3modal?.clearCachedProvider();
		$provider = undefined;
		$accounts = [];
	};

	const changeNetwork = async () => {
		try {
			await $provider!.send('wallet_switchEthereumChain', [{ chainId: network }]);
			checkChainId();
		} catch (switchError: any) {
			console.error(switchError);
			checkChainId();
		}
	};

	// initialises wallet
	const initWallet = async () => {
		web3modalInstance = await web3modal!.connect();
		$provider = new ethers.providers.Web3Provider(web3modalInstance);
		$accounts = await $provider!.listAccounts();
		const udomain = await new UAuthSPA(uauthOptions).user();
		if (udomain) {
			udomainName = udomain.sub;
		}
		initEthers();
	};

	// checks chain id and registers event listeners
	const initEthers = () => {
		checkChainId();
		web3modalInstance.on('accountsChanged', () => {
			disconnectWallet();
		});
		web3modalInstance.on('chainChanged', () => {
			checkChainId();
		});
		web3modalInstance.on('disconnect', () => {
			disconnectWallet();
		});
	};

	//check chain id
	const checkChainId = async () => {
		const chainId = await $provider!.send('eth_chainId', []);
		if (chainId !== network) {
			wrongChain = true;
		} else {
			wrongChain = false;
		}
	};

	// inits web3modal singleton
	const initWeb3Modal = () => {
		if (!web3modal) {
			web3modal = new Web3Modal({
				cacheProvider: true,
				theme: {
					background: 'hsl(var(--b2))',
					main: 'hsl(var(--bc))',
					secondary: 'hsl(var(--bc))',
					border: 'hsl(var(--b1))',
					hover: 'hsl(var(--b3))'
				},
				providerOptions
			});
			UAuthWeb3Modal.registerWeb3Modal(web3modal);
		}
	};

	// check if have cached provider and connect on mount
	onMount(() => {
		initWeb3Modal();
		if (!web3modal!.cachedProvider) return;
		initWallet();
	});

	let udomainName: string | undefined;
	$: displayAddress = udomainName ? udomainName : $accounts[0] ? truncateAddress($accounts[0]) : '';
</script>

{#if wrongChain}
	<button class="btn-warning btn text-lg" on:click={() => changeNetwork()}
		><Fa icon={faExclamationCircle} class="pr-4" scale={1.2} />Change Network</button
	>
{:else if $accounts.length == 0}
	<button class="text-base-content btn text-lg bg-base-300" on:click={() => connectWallet()}
		><Fa icon={faWallet} class="md:pr-4" scale={1.2} /><span class="hidden md:inline"
			>Connect Wallet</span
		></button
	>
{:else if $accounts.length > 0}
	<div class="dropdown dropdown-end">
		<label for="" tabindex="0" class="text-base-content btn text-lg bg-base-300"
			><Fa icon={faWallet} class="md:pr-4" scale={1.2} /><span class="hidden md:inline"
				>{displayAddress}</span
			></label
		>
		<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
			<li>
				<a href="https://opensea.io/{$accounts[0]}" target="_blank"
					><Fa icon={faWallet} class="pr-2" scale={1.2} />My Wallet</a
				>
			</li>
			<li>
				<p class="text-error" on:click={() => disconnectWallet()}>
					<Fa icon={faArrowRightFromBracket} class="pr-2" scale={1.2} />Disconnect
				</p>
			</li>
		</ul>
	</div>
{/if}
