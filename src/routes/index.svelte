<script context="module">
    export const prerender = true;
</script>

<script lang="ts">
    import { fade } from 'svelte/transition';
    import Countdown from '$lib/components/Countdown/Countdown.svelte';
    import Integer from '$lib/components/Integer/Integer.svelte';
    import UseActions from '$lib/components/useActions/_UseActionsComponent.svelte';
    import inputObj from '$lib/scripts/spiritSwapInputs.json';
    import Accordion,{ Content,Header,Panel } from '@smui-extra/accordion';
    import Textfield from '@smui/textfield';
    import { portal } from '$lib/functions/portal.js';
    import Button,{ Label } from '@smui/button';
    import IconButton,{ Icon } from '@smui/icon-button';
    import pluralize from 'pluralize';
    import TiHeart from 'svelte-icons/ti/TiHeart.svelte';
    import { shouldShowActions, appVersionIndex } from '../stores.js';

    let submitted = false;
    let focused = false;
    let value: string | null = null;
    let dirty = false;
    let invalid = false;
    let valueA = '';
    let valueB = '';
    let valueC = '';
    let valueD = '';
    $: disabled = !value || !dirty || invalid;

    function clickHandler() {
        alert(`Sending to ${value}!`);
        value = null;
        dirty = false;
    }

    // Base
    let isTransactionConfirmed = false;
    let amountOfNftsToPurchase = 1;
    let canPurchase = false;
    let hasTransactionFinished = false;
    let isTransactionPending = false;
    let canBuyNFTs = false;
    let nftURI =
        '/images/pepe-teaser.png';

    // Handle Accordion
    let panel1Open = false;

    // Handle email signup action
    /**
     *
     * @param {event} event - The observable event.
     * @listens event
     */
    const handleSubmitEmailForm = (event) => {
        event.preventDefault();
        submitted = true;
        document.body.classList.add('submitted');

        console.log('submitted and valid');
    }
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<Countdown from="2022-05-23 9:00:00" dateFormat="YYYY-MM-DD H:m:s" zone="Europe/Madrid" let:remaining>
    {#if $appVersionIndex === 1}
            {#if remaining.done === false}
                {#if remaining.days || remaining.hours || remaining.minutes || remaining.seconds}
                    <div class="splash-page-wrapper" transition:fade>
                    <ul class="typography-canvas">
                        <li class="background-text">Rekt Pepe</li>
                        <li class="background-text">Renaissance</li>
                    </ul>
        <div class="panel-counter">
                    <div class="panel-counter-date highlight">
                        <span>{remaining.days}</span><span>d&nbsp;</span>
                        <span>{remaining.hours}</span><span>h&nbsp;</span>
                        <span>{remaining.minutes}</span><span>m&nbsp;</span>
                        <span>{remaining.seconds}</span><span>s&nbsp;</span>
                    </div>
                    <div>
                        <span>until</span>
                        <span class="highlight"> Early Bird</span>
                    </div>
        </div>
                    <section class="panel-wrapper">
                        <div class="panel-body">
                            <h2 class="panel-body-title highlight">NFT Drop</h2>
                            <span class="panel-body-text">
            RektPepeRenaissance is this and that because this and that.
            If you'd like to participate in the ealy bird something, get on the list below.
        </span>
                            {#if !submitted}
                                <form class="panel-body-form" action="">
                                    <!--
                                      Note: when you bind to `invalid`, but you only want to
                                      monitor it instead of updating it yourself, you also
                                      should include `updateInvalid`.
                                    -->
                                    <Textfield
                                      type="email"
                                      bind:dirty
                                      bind:invalid
                                      updateInvalid
                                      bind:value
                                      label="Email Address"
                                      input$autocomplete="email"
                                      on:focus={() => (focused = true)}
                                      on:blur={() => (focused = false)}
                                    >
                                    </Textfield>
                                    {#if invalid}
                                        <div class="message error">That's not a valid email address, come on.</div>
                                    {/if}
                                    <section class="action-wrapper">
                                        <Button
                                          variant="unelevated"

                                          class="button"
                                          disabled={disabled}
                                          on:click={(event) => handleSubmitEmailForm(event)}
                                        >
                                            <Label
                                            >Get On The List</Label>
                                        </Button>
                                    </section>
                                </form>
                            {:else}
            <span class="heart-icon">
                    <div class="highlight">Thank you for signing up!</div>
                </span>
                            {/if}
                        </div>
                    </section>
                    </div>
                {/if}
            {/if}
    {/if}
</Countdown>

{#if $appVersionIndex === 2}

<section class="ui-section" transition:fade>
    <img class="image" src={nftURI} alt="" />
    <img class="image-punch" src={nftURI} alt="" />
    <section class="card-header">
        <h2 class="summary-wrapper">
            <span class="summary-grid">
                <span>Remaining NFTs</span>
                <strong>400</strong>
            </span>
        </h2>
    </section>
    <section class="card-content">
        {#each inputObj.inputs as input}
            <Integer bind:integer={amountOfNftsToPurchase} inputObj={input} />
        {/each}
    </section>
    <section class="action-wrapper">
        <Button
            on:click={() => shouldShowActions.set(true)}
            variant="unelevated"
            class="button"
            disabled={amountOfNftsToPurchase <= 0}>
            <Label
                >{canPurchase
                    ? hasTransactionFinished
                        ? 'buy more'
                        : 'buy'
                    : 'approve'}</Label>
        </Button>
    </section>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={panel1Open} variant="outlined" color="secondary">
                <Header>
                    <h3 class="accordion-header-title">Learn More</h3>
                    <span slot="description">Instructions Below</span>
                    <IconButton slot="icon" toggle pressed={panel1Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <h3 class="accordion-content-title">Title</h3>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi dicta
                    explicabo animi dolorem veritatis expedita iusto et omnis numquam nisi
                    quidem veniam, aspernatur perferendis. Obcaecati, reprehenderit nobis
                    cumque soluta tempora praesentium porro nihil saepe impedit et hic
                    quis nostrum neque labore consectetur aperiam magni dolore, recusandae
                    reiciendis omnis tempore ipsum.
                    <h3 class="accordion-content-title">Title 2</h3>
                    Enim tempore nobis nostrum aperiam nihil magni voluptates, natus
                    tenetur libero asperiores dolores cupiditate obcaecati ex at quaerat
                    veritatis aut. Officiis modi ex voluptatum rem itaque rerum ipsa
                    suscipit animi eos accusantium. Alias id nihil officiis rerum
                    architecto veritatis inventore nemo et, quae ullam ipsam dolore,
                    perferendis, velit ducimus doloribus?</Content>
            </Panel>
        </Accordion>
    </div>
</section>

<UseActions>
    <section class="bottom-drawer">
        {#if hasTransactionFinished}
            <section class="grid center gap-3">
                <h2>
                    {`Thank You for purchasing ${amountOfNftsToPurchase} ${pluralize(
                        'Spirit NFT',
                        amountOfNftsToPurchase,
                    )}!`}
                </h2>
                <span class="heart-icon">
                    <TiHeart />
                    <Confetti />
                </span>
                <Button
                    variant="outlined"
                    href="https://app.revest.finance/"
                    target="_blank"
                    color="secondary"
                    class="button">
                    <Label>Take Me To Gallery</Label>
                </Button>
            </section>
        {:else if isTransactionPending}
            <section class="grid center">
                <h2>Transaction Processing</h2>
                <span>Depending on Gas, this may take some time.</span>
                <div class="image-container">
                    <img
                        src="/gifs/revestloading.gif"
                        class="loading-gif"
                        alt="Revest loading gif" />
                </div>
            </section>
        {:else if canBuyNFTs}
            <h2 class="modal-title">
                {`You are about to buy ${amountOfNftsToPurchase} ${pluralize(
                    'Spirit NFT',
                    amountOfNftsToPurchase,
                )}!`}
            </h2>
            <div class="summary-wrapper">
                <h3 class="summary-title">Summary</h3>
                <div class="summary-grid">
                    <span>NFT Name</span>
                    <strong>Spirit NFT</strong>
                    <span>Quantity to buy</span>
                    <strong>{amountOfNftsToPurchase}</strong>
                </div>
            </div>
            <section class="action-wrapper">
                <Button
                    on:click={() => console.log('buy')}
                    variant="unelevated"
                    class="button">
                    <Label>Buy</Label>
                </Button>
            </section>
        {:else if !isTransactionConfirmed}
            <section class="grid center">
                <h2>Approve the transaction in metamask to continue.</h2>
                <div class="image-container">
                    <img src="/images/metamask.png" alt="Metamask gif" />
                </div>
            </section>
        {:else}
            <section class="grid center">
                <h2>Approval Processing</h2>
                <span>Depending on Gas, this may take some time.</span>
                <div class="image-container">
                    <img
                        src="/gifs/revestloading.gif"
                        class="loading-gif"
                        alt="Revest loading gif" />
                </div>
            </section>
        {/if}
    </section>
</UseActions>
    {/if}

<ul class="firefly-wrapper" transition:fade use:portal={'#portal'} >
    {#each Array(15) as _, i}
        <li class="firefly"/>
    {/each}
</ul>

<style lang="scss">
    .splash-page-wrapper {
        display: grid;
        place-items: center;
        gap: 3rem;

        @include media('>phone') {
            gap: 5rem;
        }
    }

  .error {
    color: var(--color--error);
    font-size: 0.85rem;
  }

  .success {
  }
    @keyframes shine {
        to {
            background-position: 100% center;
        }
    }

  .highlight {
      font-family: var(--font-family--secondary);
      background: -webkit-linear-gradient(#eee, #333);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background: linear-gradient(to right, #FDFBFB, #EBEDEE 70%);
      background: linear-gradient(to right, #e75959 20%, #56c375 40%, #56c375 60%, #e75959 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-size: 200% auto;




      :global(body.submitted) & {
          background: linear-gradient(to right, #e75959 20%, #56c375 40%, #56c375 60%, #6984f8 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear forwards;
      }
  }

  .panel {
    &-wrapper {
      gap: 2rem;
      max-width: 40rem;
      width: 100%;
    }

    &-body {
        color: var(--color--whitegray-transparent);
      border-radius: var(--border-radius);
        display: grid;
        padding: 1rem;
        gap: 2rem;
        background-color: hsl(0deg 0% 29% / 9%);

        @include media('>tablet') {
            padding: 2rem;
        }

        &-title {
            font-size: var(--font-size--4);
            text-align: center;
            text-transform: uppercase;
        }

      &-form {
        display: flex;
        justify-content: center;
        flex-direction: column;
        width: 100%;
          gap: 2rem;

        :global(.mdc-floating-label) {
          font-family: var(--font-family--base);
        }
      }
    }

    &-counter {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
        color: var(--color--lightgray-transparent);

        text-align: center;
    font-size: var(--font-size--3);
    }
  }

  .typography-canvas {
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .background-text {
    font-family: var(--font-family--secondary);
    font-size: var(--font-size--5);
    line-height: var(--font-size--5);
    color: var(--color--lightgray-transparent);
    pointer-events: none;
    user-select: none;
    list-style: none;
    word-break: break-word;

    @include media('>desktop') {
      line-height: 10rem;
      font-size: 10rem;
    }
  }

  .nft-teaser {
    aspect-ratio: 1;
    background-color: #f9f9f9;
    border-radius: 0.5rem;
    max-width: 100%;
    width: 100%;

    @include media('>tablet') {
      max-width: 12rem;
    }

    &-wrapper {
      display: flex;
      justify-content: space-between;

      @include media('>tablet') {
        flex-direction: row;
      }
    }

    &-container {
      display: grid;
      place-items: center;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  }

  $quantity: 15;

  .firefly {
    z-index: 1;
    position: fixed;
    left: 50%;
    top: 50%;
    width: 0.4vw;
    height: 0.4vw;
    margin: (-0.2vw) 0 0 9.8vw;
    animation: ease 200s alternate infinite;
    pointer-events: none;
    user-select: none;
      list-style: none;

      &-wrapper {
          margin: 0;
      }

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      transform-origin: -10vw;
    }

    &::before {
      background: transparent;
      opacity: 0.4;
      animation: drift ease alternate infinite;
    }

    &::after {
      background: white;
      opacity: 0;
      box-shadow: 0 0 0vw 0vw yellow;
      animation: drift ease alternate infinite, flash ease infinite;
    }
  }

   //Randomize Fireflies Motion
  @for $i from 1 through $quantity {
    $steps: random(12) + 16;
    $rotationSpeed: random(10) + 8s;

    .firefly:nth-child(#{$i}) {
      animation-name: move#{$i};

      &::before {
        animation-duration: #{$rotationSpeed};
      }

      &::after {
        animation-duration: #{$rotationSpeed}, random(6000) + 5000ms;
        animation-delay: 0ms, random(8000) + 500ms;
      }
    }

    @keyframes move#{$i} {
      @for $step from 0 through $steps {
        #{calc($step * 100 / $steps)}% {
          transform: translateX(random(100) - 50vw) translateY(random(100) - 50vh) scale(calc(random(75) / 100) + 0.25);
        }
      }
    }
  }

  @keyframes drift {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes flash {
    0%, 30%, 100% {
      opacity: 0;
      box-shadow: 0 0 0vw 0vw yellow;
    }

    5% {
      opacity: 1;
      box-shadow: 0 0 2vw 0.4vw yellow;
    }
  }

    * :global(.button) {
        padding: 0.5rem 1rem;
        flex: 1;

        font-size: 1.2rem !important;

        &:not(:disabled) {
            background: #e75959;
            background: linear-gradient(90deg, #e75959 0%, #56c375 100%);
        }
    }

    @keyframes animateHeart {
        // scale down and scale up faster in irregular intervals to get the throbbing effect
        0% {
            transform: scale(0.8);
        }
        5% {
            transform: scale(0.9);
        }
        10% {
            transform: scale(0.8);
        }
        15% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.8);
        }
        100% {
            transform: scale(0.8);
        }
    }

    .heart-icon {
      display: flex;
      width: 100%;
      text-align: center;
      align-items: center;
      justify-content: center;
        color: var(--color--error);
        height: var(--font-size--5);
        transform: scale(0.8);
        margin-inline: auto;
        //animation: animateHeart 1s 8;

      :global(svg) {
        height: 6rem;
        max-height: 6rem;
        max-width: 6rem;
      }

      .highlight {
        position: absolute;
        mix-blend-mode: exclusion;
        font-size: var(--font-size--2);
      }
    }

    .image-container {
        width: 5rem;
        height: 5rem;
        margin-top: 2rem;
    }

    .ui-section {
        position: relative;
        overflow: hidden;
    }

    .action-wrapper {
        display: flex;
    }

    .title {
        font-size: var(--font-size--5);
        position: relative;

        &-group {
            text-align: center;
        }
    }

    .image {
        border-radius: 1rem;

		&-punch {
			display: none;
			@include media('>phone') {
				display: block;
				position: absolute;
				top: 6rem;
				width: 100%;
				z-index: -1;
				opacity: 0.7;
				filter: blur(5rem);
			}
		}
    }

    @keyframes float {
        50% {
            transform: translate(0, 2px);
        }
    }

    .summary {
        &-title {
            text-align: left;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            color: var(--whitegray-transparent);
            border-bottom: 1px solid var(--border-color--primary);
        }

        &-grid {
            grid-gap: 1rem 0;
            display: grid;
            align-items: center;
            grid-auto-columns: min-content;
            grid-template-columns: repeat(2, minmax(0, 1fr));

            & > * {
                &:nth-child(odd) {
                    text-align: left;
                }

                &:nth-child(even) {
                    text-align: right;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
            }

            strong {
                color: var(--color--yellow);
            }
        }
    }

    .subtitle {
        color: var(--text-color--accent);
        font-size: var(--font-size--0);
        font-weight: 200;
        text-align: left;
    }

	.accordion {
		&-content-title,
		&-header-title {
        font-size: var(--font-size---2);
		}
	}

    .card {
        &-header {
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color--primary);
        }
    }

    @keyframes up {
        0% {
            opacity: 0;
            transform: translate(0, 0) skew(0);
        }
        1% {
            opacity: 1;
        }
        20% {
            transform: translate(0, -40%) skew(-5deg);
        }
        40% {
            transform: translate(0, -80%) skew(8deg);
        }
        60% {
            transform: translate(0, -120%) skew(-7deg);
        }
        80% {
            transform: translate(0, -160%) skew(4deg);
        }
        100% {
            transform: translate(0, -200%) skew(0);
            opacity: 0;
        }
    }
</style>
