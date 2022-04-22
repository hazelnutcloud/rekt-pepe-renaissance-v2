<script context="module">
    export const prerender = true;
</script>

<script lang="ts">
    import Countdown from '$lib/components/Countdown/Countdown.svelte';
    import Confetti from '$lib/components/Confetti/Confetti.svelte';
    import Integer from '$lib/components/Integer/integer.svelte';
    import UseActions from '$lib/components/useActions/_UseActionsComponent.svelte';
    import inputObj from '$lib/scripts/spiritSwapInputs.json';
    import Accordion,{ Content,Header,Panel } from '@smui-extra/accordion';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
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

        console.log('submitted and valid');
    }
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<!--<section class="title-group">-->
<!--	<h1 class="title">-->
<!--		REKT-->
<!--	</h1>-->
<!--</section>-->

<ul>
{#each Array(15) as _, i}
    <li class="firefly"/>
{/each}
</ul>

<!--<ul class="typography-canvas">-->
<!--    {#each Array(1) as _, i}-->
<!--        <li class="background-text">REKT PEPE</li>-->
<!--    {/each}-->
<!--</ul>-->

<Countdown from="2022-05-22 16:09:00" dateFormat="YYYY-MM-DD H:m:s" zone="Europe/Athens" let:remaining>
    <div class="panel-counter">
        <ul class="typography-canvas">
            {#each Array(3) as _, i}
                <li class="background-text">REKT PEPE</li>
                <li class="background-text">RENAISSANCE</li>
            {/each}
        </ul>
        {#if remaining.done === false}
            {#if remaining.days || remaining.hours || remaining.minutes || remaining.seconds}
                <div class="panel-counter-date">
            <span>{remaining.days}<span class="highlight">d&nbsp;</span></span>
            <span>{remaining.hours}<span class="highlight">h&nbsp;</span></span>
            <span>{remaining.minutes}<span class="highlight">m&nbsp;</span></span>
            <span>{remaining.seconds}<span class="highlight">s&nbsp;</span></span>
                </div>
                <div><span class="highlight">until</span> Early Bird</div>
            {/if}
        {:else}
            {appVersionIndex.set(2)}
        {/if}
    </div>
</Countdown>

<section class="panel-wrapper">
    <div class="panel-body ui-element">
        <h2 class="panel-body-title highlight">Rekt Pepe Renaissance</h2>
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
                    <div class="message success">Thank you for signing up!</div>
                    <TiHeart />
                    <Confetti />
                </span>
        {/if}
    </div>
</section>

{#if $appVersionIndex === 2}

<img class="inner-border-radius" src="https://cdn.discordapp.com/attachments/963461875897610351/966459714550509718/IMG_8541.jpg" alt="">

<section class="ui-section full-width nft-teaser-wrapper">
    <div class="nft-teaser-copy">text</div>
    <div class="ui-element nft-teaser-container">
        {#each Array(4) as _, i}
            <img class="nft-teaser" src="https://ik.imagekit.io/bayc/assets/ape2.png" alt="">
        {/each}
    </div>
</section>

{/if}
{#if $appVersionIndex === 2}

<section class="ui-section">
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
            disabled={!amountOfNftsToPurchase > 0}>
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


<style lang="scss">
  .error {
    color: var(--color--error);
    font-size: 0.85rem;
  }

  .success {
  }

  .highlight {
    color: #a5a5a5;
  }

  .panel {
    &-wrapper {
      gap: 2rem;
      max-width: 40rem;
      width: 100%;
      margin-top: 2rem;
    }

    &-body {
      backdrop-filter: blur(0.5rem);
      background-color: #ffffff5c;
      border-radius: var(--border-radius);
      border: 2px solid #ffffff33;

      &-title {
        font-family: var(--font-family--tertiary);
      }

      &-text {
        font-size: var(--font-size---1);
      }

      &-form {
        display: flex;
        justify-content: center;
        flex-direction: column;
        width: 100%;
          gap: 1rem;

        :global(.mdc-floating-label) {
          font-family: var(--font-family--tertiary);
        }
      }
    }

    &-counter {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: var(--font-family--tertiary);
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
    font-size: 9rem;
    line-height: 9rem;
    opacity: 0.3;
    color: #ffffff;
    pointer-events: none;
    user-select: none;
    list-style: none;
    word-break: break-word;

    @include media('>phone') {
      line-height: 15rem;
      font-size: 15rem;
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

    &::before,
    &::after {
      content: "?";
      position: absolute;
      width: 1rem;
      height: 1rem;
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
        animation: animateHeart 1s 8;

      :global(svg) {
        height: 6rem;
        max-height: 6rem;
        max-width: 6rem;
      }

      .message {
        position: absolute;
        mix-blend-mode: exclusion;
        font-size: 1.2rem;
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
        font-family: var(--font-family--tertiary);
        font-size: var(--font-size---1);
        font-weight: 200;
        text-align: left;
    }

	.accordion {
		&-content-title,
		&-header-title {
			font-family: var(--font-family--tertiary);
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
