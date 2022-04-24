<script>
	// import { page } from '$app/stores';
	import { formatAddress } from "$lib/functions/formatAddress";
	import { mdiAlertRhombus } from "@mdi/js";
	import Button, { Label } from "@smui/button";
	import { Svg } from "@smui/common/elements";
	import IconButton, { Icon } from "@smui/icon-button";
	import FaWallet from "svelte-icons/fa/FaWallet.svelte";
	import { appVersionIndex } from "../../../stores.js";
	import logo from "./revest-logo.svg";
	import { ethers } from "ethers";
	import { onMount } from "svelte";

	let hasMetamask = false;
  let connected = false;
  let address;
  let invalidNetwork = false;
  let network;
  let chainId;
  let provider;

  onMount(async () => {
    if (window.ethereum) {
      hasMetamask = true;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      network = await provider.getNetwork();
      chainId = network.chainId;
      if (chainId !== 250) {
        invalidNetwork = true;
      }
      if (window.ethereum.selectedAddress) {
        await requestAccounts();
      }
      window.ethereum.on("accountsChanged", onAccountsChanged);
      window.ethereum.on("chainChanged", onChainChange);
    }
  });

  const onChainChange = async (_chainId) => {
    invalidNetwork = _chainId != 0xfa ? true : false;
  };

  const onAccountsChanged = async (accounts) => {
    connected = true;
    address = accounts[0];
  };
  const requestAccounts = async () => {
    if (hasMetamask) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts) {
        await onAccountsChanged(accounts);
      }
    }
  };
</script>

<header class:is-visible={$appVersionIndex > 1}>
  <div class="corner">
    <a href="/">
      <img alt="SvelteKit" class="logo" src={logo} />
    </a>
  </div>

  <!-- <nav>
    <ul>
      <li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
    </ul>
  </nav> -->

  {#if $appVersionIndex === 2}
    <div class="corner">
      {#if !connected}
        <IconButton
          on:click={requestAccounts}
          variant="unelevated"
          class="icon-button"
        >
          <FaWallet />
        </IconButton>
      {:else}
        <Button
          on:click={() => console.log('show network swich dropdown?')}
          variant="unelevated"
          color="secondary"
          class="button"
          disabled
        >
          <Label>
            <img src="/images/icons/ethereum-logo.svg" class="icon" alt="network logo" />
            {formatAddress(address)}
          </Label>
        </Button>
        {#if invalidNetwork}
          <div class="network-status">
            <div class="icon">
              <Icon component={Svg} viewBox="0 0 24 24">
                <path fill="currentColor" d={mdiAlertRhombus} />
              </Icon>
            </div>
            Please switch to Fantom Network
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</header>

<style lang="scss">
  .network-status {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    align-items: center;
    font-weight: var(--font-weight--bold);
    font-size: var(--font-size---1);
    color: hsl(358, 95%, 63%);
    width: 100%;
  }

  .corner {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  * :global(.icon-button) {
    background-color: var(--color--yellow);
    border-radius: 100%;
    color: var(--text-color--secondary);
  }

  header {
    display: none;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    padding: var(--page-wrapper-padding);
    gap: 1rem;
    top: 0;
    z-index: var(--index--header);
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    transition: top 0.2s ease-in-out;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    &.is-visible {
      display: flex;
    }

    @include media('<phone') {
      background-color: var(--color--darkblack-transparent);
      backdrop-filter: blur(1rem);
      -webkit-backdrop-filter: blur(1rem);
    }
  }

  * :global(.button) {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 3rem;
    width: 3rem;
    object-fit: contain;

    @include media('>phone') {
      height: var(--font-size--3);
      width: var(--font-size--3);
    }
  }
</style>
