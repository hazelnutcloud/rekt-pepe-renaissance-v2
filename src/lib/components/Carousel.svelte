<script>
	const pepes = Array(10).fill(0);
</script>

<!-- this was all just taken from https://codepen.io/studiojvla/pen/qVbQqW -->
<div class="slider rounded-xl">
	<div class="slide-track">
		{#each pepes as _pepe, index}
			<div class="slide">
				<img src="rektpepes/silhouettes/{index + 1}.png" height="270" width="270" alt="rekt pepe" />
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(calc(-270px * 7));
		}
	}

    .slide-track {
        animation: scroll 40s linear infinite;
        display: flex;
        width: calc(270px * 14);
    }

    .slide {
        height: 270px;
        width: 270px;
    }

	.slider {
		background: white;
		box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.125);
		height: 270px;
		margin: auto;
		overflow: hidden;
		position: relative;
		width: 270px;
	}
</style>
