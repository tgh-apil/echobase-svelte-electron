<script>
	import { videoSource } from '../stores';
</script>

{#if $videoSource === 'done'}
<h1>🎉🎉 All Clips Rated! 🎉🎉</h1>
{:else}
<video src={$videoSource} autoplay loop muted/>
{/if}

<style>
	h1 {
		color: #fff;
		font-weight: 400;
		font-family: 'IBM Plex Sans' sans-serif;
	}
	video {
		height: 100%;
		width: 100%;
	}
</style>