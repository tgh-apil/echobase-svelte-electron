<script>
	import VideoPlayer from './components/VideoPlayer.component.svelte';
	import { videoSource, rootDirectory, currentPage } from './stores.js';
	import FormTemplate from './components/FormTemplate.components.svelte';
	import Confetti from './components/Confetti.component.svelte';
	import NavBar from './components/NavBar.component.svelte';

	const { dialog } = require('electron').remote;
    // python scripts
	import { vidBlackBar } from './pythonScripts';
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

	let isDataSet = false;
	let storagePath = '';
	
	// set primary page view
	currentPage.update(src => src = 'main');
	
	function loadData() {
		const directory = dialog.showOpenDialogSync({ properties: ['openFile', 'openDirectory'] });

		console.log(directory);

		rootDirectory.update(src => src = directory);

		vidBlackBar($rootDirectory)
		
		storagePath = directory + '/storage';
		
		setVideo(storagePath);
	}
	
	function setVideo(storagePath) {
		if(fs.readdirSync(storagePath).length === 0) {
			isDataSet = true;
			videoSource.update(src => src = 'done');
		} else {
			// sets initial clip to be shown
			fs.readdir(storagePath, (err, files) => {
				if (files[0].includes('__anon__')) {
					videoSource.update(src => src = storagePath + '/' + files[0]);
					console.log($videoSource);
					isDataSet = true;					
				} else {
					videoSource.update(src => src = 'loading')
					console.log('loading');
					setTimeout(() => {
						setVideo(storagePath);	
					}, 1000);
				}
			})
		}
	}

	let div;

    function scrollToTop() {
		div.scrollTo({ top: 0, behavior: 'smooth' });
    }
</script>

{#if isDataSet === false}
<div class="header">
	<h1>Echobase</h1>
</div>
<div class="startup">
	<div class="startup-child">
		{#if $videoSource === ''}
		<div>
			<h2 class="intro-text">Hi 👋</h2>
			<br>
			<p class="intro-text">We need you to point us to the data folder</p>
		</div>
		<br>
		<div>
			<button class="load-btn" on:click={loadData}>Take me to the data! 🚀</button>
		</div>
		{:else if $videoSource === 'loading'}
		<div>
			<h2 class="intro-text">One second <br>⏱</h2>
			<br>
			<p class="intro-text">We're anonymizing some data for you</p>
		</div>
		{/if}
	</div>
</div>
{:else if isDataSet === true}
	<NavBar />
	{#if $videoSource === 'done'}
	<div>
		<h2 class="outro-text">You're all done! <br>🍾</h2>
		<Confetti characters={[ '🎊', '🥳', '🎉']}/>
	</div>
	{:else}
		{#if $currentPage === 'main'}
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
		{:else if $currentPage === 'overview'}
			<div>
				<p>overview</p>
			</div>
		{:else}
	<div>
		<h2 class="outro-text">Uh-oh, something happened! <br>💩</h2>
	</div>
		{/if}
	{/if}
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
	}

	h2.intro-text {
		color: #ff264e;
		font-family: 'IBM Plex Sans', sans-seirf;
		font-weight: 900;
		font-size: 75px;
		text-align: center;
	}

	h2.outro-text {
		color: #fff;
		font-family: 'IBM Plex Sans', sans-seirf;
		font-weight: 900;
		font-size: 75px;
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%)
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
	}

	.load-btn {
		font-size: 40px;
		border-width: 2px;
		border-color: #fff;
		padding: 20px 20px;
	}

	.load-btn:hover{
		border-color: #ff264e;
		color: #ff264e;
		cursor: pointer;
	}
</style>