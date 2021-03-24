<script>
	import { videoSource, videoToEdit, videoPathToEdit, rootDirectory, currentPage } from './stores.js';
	import FormTemplate from './components/FormTemplate.components.svelte';
	import Confetti from './components/Confetti.component.svelte';
	import NavBar from './components/NavBar.component.svelte';
	import Table from './components/Table.component.svelte';
	import { formFields } from './models/RatingForm.model.js';

	const { dialog } = require('electron').remote;

    // python scripts
	import { vidBlackBar } from './pythonScripts';
	const fs = window.require('fs');

	let fields = formFields;

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

	function setFormData() {
		// load the json db data for the clip being edited
		const dbData = $rootDirectory + '/data/' + $videoToEdit + '.json'
		const editClipData = JSON.parse(fs.readFileSync(dbData));

		let keys = Object.keys(editClipData);
		
		for (let i = 0; i < fields.length; i++) {
			console.log(fields[i].name);
			fields[i].value = editClipData[keys[i]];
			console.log(`field value: ${fields[i].name} clip data: ${editClipData[keys[i]]}`);
		}

		// console.log(editableKeys);
		// console.log(fields[1].value);
		// console.log(editClipData['Quality']);

		// fields[1].value = editClipData['Quality'];


	}

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
					<video src={$videoSource} autoplay loop muted/>
				</div>
				<div class="form-div" bind:this={div}>
					<div class="form">
						<FormTemplate onSubmit={() => (scrollToTop())} {fields} />
					</div>
				</div>	
			</main>
		{:else if $currentPage === 'overview'}
			<Table />
		{:else if $currentPage === 'viewEditClip'}
			<div >
				<h2>Clip: {$videoPathToEdit}</h2>
			</div>
			<main class="main" on:load={setFormData()}>
				<div class="videoPlayer">
					<video src={$videoPathToEdit} autoplay loop muted/>
				</div>
				<div class="form-div" bind:this={div}>
					<div class="form">
						<FormTemplate onSubmit={() => (scrollToTop())} {fields} />
					</div>
				</div>	
			</main>
		{:else}
	<div>
		<NavBar />
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
	
	.load-btn {
		font-size: 40px;
		color: #ff264e;
		border-width: 2px;
		border-color: #ff264e;
		padding: 20px 20px;
		transition: border 0.15s ease-in-out;
		transition: color 0.15s ease-in-out;
		-webkit-transition: background-color 0.15s ease-in-out;
	}

	.load-btn:hover{
		background-color: #ff264e;
		border-color: #fff;
		color: #fff;
		cursor: pointer;
	}
</style>