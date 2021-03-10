<script>
	import VideoPlayer from './components/VideoPlayer.component.svelte';
	import { videoSource, rootDirectory } from './stores.js';
	import FormTemplate from './components/FormTemplate.components.svelte';
	import Confetti from './components/Confetti.component.svelte';
	const { dialog } = require('electron').remote;
	const fs = window.require('fs');
	
	// form options
	let fields = [
		{
			name: 'view',
			type:'select',
			value: '4C',
			label: '🔭 What view is it?',
			id: 'view',
			options: [
				{label: 'Apical FOUR Chamber', value: '4C'},
				{label: 'Apical FIVE Chamber', value: '5C'},
				{label: 'Parasternal Long Axis', value: 'PLX'},
				{label: 'Parasternal Short Axis BASAL', value: 'PSXB'},
				{label: 'Parasternal Short Axis MIDDLE', value: 'PSXM'},
				{label: 'Parasternal Short Axis APICAL', value: 'PSXA'},
				{label: 'Aortic Valve Short Axis', value: 'AVSX'},
				{label: 'Subcostal Four Chamber', value: 'SC'},
				{label: 'Right Lateral IVC/SV IVC View', value: 'RIVC'},
				{label: 'Lung', value: 'LUNG'},
				{label: 'Other', value: 'OTHER'},
			]
		},
		{
			name: 'quality',
			type: 'radio',
			value: 0,
			label: "📸 How's the image quality?",
			id: 'quality',
			options: [
				{label: 'View cannot be identified clearly', value: 0},
				{label: 'View can be identified but diagnosis very difficult/impossible', value: 1},
				{label: 'Most aspects can be diagnosed but image can be clearer', value: 2},
				{label: 'All diagnostic features visible and clear', value: 3},
			]
		},
		{
			name: 'gain',
			type: 'radio',
			value: 0,
			label: "☀ How's the gain?",
			id: 'gain',
			options: [
				{label: 'Under gained', value: 0},
				{label: 'Optimal', value: 1},
				{label: 'Overgained', value: 2},
			]
		},
		{
			name: 'orientation',
			type: 'radio',
			value: 1,
			label: "🧭 Is the orientation correct?",
			id: 'orientation',
			options: [
				{label: 'Yes', value: 1},
				{label: 'No', value: 0},
			]
		},
		{
			name: 'depth',
			type: 'radio',
			value: 1,
			label: '⛏ Is the depth appropriate?',
			id: 'depth',
			options: [
				{label: 'Yes', value: 1},
				{label: 'No', value: 0},
			]
		},
		{
			name: 'focus',
			type: 'radio',
			value: 1,
			label: '🔬 Is the focus appropriate?',
			id: 'focus',
			options: [
				{label: 'Yes', value: 1},
				{label: 'No', value: 0},
			]
		},
		{
			name: 'frequency',
			type: 'radio',
			value: 1,
			label: '🔊 Is the frequecy appropriate?',
			id: 'frequency',
			options: [
				{label: 'Yes', value: 1},
				{label: 'No', value: 0},
			]
		},
		{
			name: 'normal_physiology',
			type: 'radio',
			value: 1,
			label: '🩺 Is the physiology normal?',
			id: 'normal_physiology',
			options: [
				{label: 'Yes', value: 1},
				{label: 'No', value: 0},
			]
		},
		{
			name: 'num_cardiac_cycles',
			type: 'text',
			id: 'num_cardiac_cycles',
			value: '',
			label: '💓 How many cardiac cycles?',
			placeholder: '# Cardiac cycles...'
		},
		{
			name: 'comments',
			type: 'text-area',
			id: 'comments',
			value: '',
			label: '📝 Any comments?',
			placeholder: 'Please leave any additional comments you have (optional)...'
		}
	]

	function loadData() {
		const directory = dialog.showOpenDialogSync({ properties: ['openFile', 'openDirectory'] });

		console.log(directory);

		rootDirectory.update(src => src = directory);

		const storagePath = directory + '/storage';

		if(fs.readdirSync(storagePath).length === 0) {
			videoSource.update(src => src = 'done');
		} else {
			// sets initial clip to be shown
			fs.readdir(storagePath, (err, files) => {
				videoSource.update(src => src = storagePath + '/' + files[0]);
			})
		}
	}

	let div;

    function scrollToTop() {
		div.scrollTo({ top: 0, behavior: 'smooth' });
    }
</script>

{#if $videoSource === ''}
<div class="header">
	<h1 class="logo">Echobase</h1>
	<p class="logo-sub">by APIL</p>
</div>
<div class="startup">
	<div class="startup-child">
		<div>
			<h2 class="intro-text">Hi 👋</h2>
			<br>
			<p class="intro-text">We need you to point us to the data folder 👇</p>
		</div>
		<br>
		<div>
			<button class="load-btn" on:click={loadData}>Take me to the data!</button>
		</div>
	</div>
</div>
<!-- <pre><code>{JSON.stringify(result, 0, 2)}</code></pre> -->
{:else if $videoSource=='done'}
<div>
	<h2 class="outro-text">You're all done!</h2>
	<h2 class="outro-text">🍾</h2>
	<Confetti characters={[ '🎊', '🥳', '🎉']}/>
</div>
{:else}
<main class="main">
	<div class="videoPlayer">
		<VideoPlayer {$videoSource} />
	</div>
	<div class="form-div" bind:this={div}>
		<div class="form">
			<FormTemplate onSubmit={() => (scrollToTop())} {fields} />
		</div>
	</div>	
</main>
{/if}
	
<style>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

main.main {
	display: grid;
	grid-template-columns: 3fr 1.5fr;
	grid-template-rows: 0.1fr 0.1fr;
}

h1.logo {
	color: #ffc800;
	font-family: 'Bodoni Moda', serif;
	font-weight: 900;
	font-size: 90px;
	text-align: right;
	padding-right: 20px;
}

h2.intro-text {
	color: #ffc800;
	font-family: 'Bodoni Moda', serif;
	font-weight: 900;
	font-size: 75px;
	text-align: center;
}

h2.outro-text {
	color: #fff;
	font-family: 'Bodoni Moda', serif;
	font-weight: 900;
	font-size: 75px;
	text-align: center;
}

div.startup {
	display: flex;
	justify-content: center;
	align-items: center;
}

div.startup-child {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

div.header {
	grid-column-start: 1;
	grid-column-end: 5;
}

div.form-div {
	overflow: auto;
	padding-left: 30px;
	padding-right: 20px;
	min-height: 0;
}

div.form {
	height: 0px;
}

p.intro-text {
	text-align: center;
	font-family: 'IBM Plex Sans', sans-seirf;
	font-size: 20px;
	color: #fafafa;
}

p.logo-sub {
	text-align: right;
	font-family: 'IBM Plex Sans', sans-seirf;
	font-size: 24px;
	color: #808080;
	padding-right: 20px;
	padding-top: 0px;
	padding-bottom: 30px;
}

button.load-btn {
	font-family: 'Bodoni Moda', serif;
	font-size: 40px;
	color: #5549b3;
	border-radius: 10px;
	border-width: 2px;
	border-color: #5549b3;
	padding: 20px 20px;
}

button.load-btn:hover{
	border-color: #ffc800;
	color: #ffc800;
}
</style>