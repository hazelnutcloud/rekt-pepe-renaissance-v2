<script lang="ts">
	import clickOutside from '$lib/functions/clickOutside.js';
	import { portal } from '$lib/functions/portal.js';
	import { mdiClose } from '@mdi/js';
	import { Svg } from '@smui/common/elements';
	import { useActions } from '@smui/common/internal';
	import IconButton,{ Icon } from '@smui/icon-button';
	import { onMount } from 'svelte';
	import { shouldShowActions } from '../../../stores.js';
	import Pannable from './_UseActionsPannable';
	import Swipeable from './_UseActionsSwipeable';

	let shouldShowActions_value = false;

	onMount(() => {
		shouldShowActions.subscribe((value: boolean) => {
			shouldShowActions_value = value;
			document.querySelector('body').classList.toggle('locked', value);
			document.querySelector('html').classList.toggle('locked', value); // safari
		});
	});

	const handleCloseDrawer = () => {
		shouldShowActions.set(false);
	};
</script>

<div class="modal" use:portal={'#portal'} class:visible={shouldShowActions_value}>
	<div
		class="target"
		use:useActions={[Swipeable, Pannable]}
		use:clickOutside
		class:visible={shouldShowActions_value}
		on:click_outside={handleCloseDrawer}
	>
		<div class="close">
			<IconButton class="icon-button" on:click={handleCloseDrawer} size="normal">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiClose} />
				</Icon>
			</IconButton>
		</div>
		<span class="swipe-indicator" />
		<span>
			<slot />
		</span>
	</div>
</div>

<style lang="scss">
	* :global(.icon-button) {
		background-color: var(--color--yellow);
		border-radius: 100%;
		color: var(--text-color--secondary);
	}

	.swipe-indicator {
		display: block;
		height: 0.25rem;
		border-radius: 0.25rem;
		width: 2rem;
		background-color: var(--color--yellow);
		position: absolute;
		top: 0.5rem;

		@include media('>phone') {
			display: none;
		}
	}

	.close {
		display: none;
		position: absolute;
		top: 2rem;
		right: 2rem;

		@include media('>phone') {
			display: block;
		}
	}

	.target {
		position: fixed;
		bottom: 0;
		left: 0;
		top: auto !important;
		height: 50vh;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		border-bottom-right-radius: 1rem;
		border-top-right-radius: 1rem;
		text-align: center;
		background-color: var(--color--lightblack);
		z-index: 1;
		transform: translate3d(0, 100%, 0);
		padding: 0 1.5rem;

		&.visible {
			transform: translate3d(0, 0, 0);
		}
	}

	.modal {
		position: fixed;
		display: block;
		opacity: 0;
		visibility: hidden;
		content: '';
		inset: 0;
		z-index: var(--index--modal);
		transition-property: opacity, visibility;
		transition-duration: 0.2s;
		transition-timing-function: ease-in-out;
		background-color: var(--color--darkblack-transparent);
		backdrop-filter: blur(1rem);
		-webkit-backdrop-filter: blur(1rem);

		&.visible {
			visibility: visible;
			opacity: 1;
		}
	}
</style>
