<script>
	import { onMount } from 'svelte';
	import { rootDirectory } from '../stores.js';
	const fs = window.require('fs');

	// read data folder
	const dataDir = $rootDirectory + '/data/'
	let dataArray = fs.readdirSync(dataDir);

	// check if there's saved data (or filtered data)
	let hasData;

	// for the table
	let colHeadings;
	let rowData;

	let prevButton;
	let nextButton;
	let counter = 0; 
	let maxEntriesShown = 40;

	// // for the search bar
	// let field = {
	// 	value: '',
	// 	placeholder: '🔎 search',
	// 	id: 'searchbar',
	// 	name: 'searchbar' 
	// };

	let value = '';

	onMount(() => {
		prevButton.disabled = true;
	})

	// this is the array we'll store data in when we apply filters/search terms
	let filteredResults;

	if (dataArray.length === 0) {
		hasData = false;
	} else {
		hasData = true;

		// this will be the data we filter through
		dataArray = dataArray.map(data => JSON.parse(fs.readFileSync(dataDir + data)));
		filteredResults = dataArray;
		populateTable();
	}
	
	function scrollToTop() {
		container.scrollTo({ top: 0, behavior: 'smooth' });
    }

	function changePage(modifier) {
		counter += maxEntriesShown * modifier;
		
		scrollToTop();
			
		if (counter + maxEntriesShown >= filteredResults.length) {
			nextButton.disabled = true;
		} else {
			nextButton.disabled = false;			
		}

		if (counter === 0) {
			prevButton.disabled = true;
		}
		else {
			prevButton.disabled = false;
		}

		populateTable()
	}

	function populateTable() {
		let searchTerms = value;
		let tempResults = [];

		// reload data flag when redrawing the table
		hasData = true;

		if (searchTerms != '') {
			dataArray.forEach(data => {
				Object.values(data).forEach(v => {
					v = String(v).toLowerCase();

					if (v.includes(searchTerms.toLowerCase())) {
						tempResults = [...tempResults, data]
					}
				})
			})
			
	
			if (tempResults.length > 0) {
				// need to add this otherwise the array will continue to add on itself
				filteredResults = tempResults;
				// filteredResults = dataArray;
			} else {
				console.log('no results');
				hasData = false;
			}

			console.log(filteredResults.length);
		} else {
			filteredResults = dataArray;
		}

		// we only want a subset of the data at a time
		let shownResults = [];
		
		if (filteredResults.length <= maxEntriesShown) {
			shownResults = filteredResults.slice(0, filteredResults.length);
		} else {
			shownResults = filteredResults.slice(counter, counter + maxEntriesShown);
		}

		// create columns based on keys
		colHeadings = (Object.keys(shownResults[0]));
		// colHeadings.unshift('clip name');

		// create rows based on values + truncate length of comments to be displayed
		rowData = (Object.values(shownResults));

		rowData.forEach(data => {
			if (data.Comments.length >= 50) {
				data.Comments = data.Comments.slice(0, 50) + '...';
			}
		})
		
	}

	// to reference container for autoscroll
	let container;

	function handleKeydown() {
		populateTable()
	}
</script>

	<div class="searchbar-container">
		<input class="searchbar" bind:value placeholder='🔎 Global search' id='searchbar' name='searchbar' type='text' on:keyup={handleKeydown} />
	</div>
{#if hasData}
	<div class="table-div-container" bind:this={container}>
		<div class="table-div-container-inner">
			<table style="width:100%">
				<tr>
					{#each colHeadings as heading}
						<th>{heading}</th>
					{/each}
				</tr>
				{#each rowData as row}
				<tr>
					<td>{row.View}</td>
						<td>{row['Quality (0-4)']}</td>
						<td>{row.Gain}</td>
						<td>{row.Orientation}</td>
						<td>{row.Depth}</td>
						<td>{row.Focus}</td>
						<td>{row.Frequency}</td>
						<td>{row.Physiology}</td>
						<td>{row['Cardiac Cycles (#)']}</td>
						<td class="td-comments">{row.Comments}</td>
						<td>{row["Depth (cm)"]}</td>
					</tr>
				{/each}
			</table>
		</div>
	</div>
	<div class="table-button-container">
		<div class="table-page-number-container">
			<div class="table-page-number">Page {(counter/maxEntriesShown) + 1} of {Math.ceil(filteredResults.length/maxEntriesShown)}</div>
		</div>
		<div class="table-results-counter-container">
			<div class="table-results-counter">{counter + 1} to {counter + maxEntriesShown > filteredResults.length ? filteredResults.length : counter + maxEntriesShown} entries out of {filteredResults.length} total results</div>
		</div>
		<div>
			<button class="table-button" bind:this={prevButton} on:click={() => changePage(-1)}>Previous</button>
			<button class="table-button" bind:this={nextButton} on:click={() => changePage(1)}>Next</button>
		</div>
	</div>
{:else}
<div class="no-results-container">
	<h2 class="intro-text">🙊🙉🙈</h2>
	<p class="intro-text">Uh-oh, no results found in the database!</p>
</div>
{/if}

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.searchbar-container {
		display: grid;
		columns: 1fr;
		margin-top: 25px;
		margin-bottom: 25px;
	}
	
	.searchbar {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-top: 7px;
		padding-bottom: 7px;
		padding-left: 10px;
		padding-right: 10px;
		width: 75%;
		font-size: 25px;
		background-color: #000;
		border: 1px solid #fff;
		border-radius: 10px;
		color: #fff;
		resize: none;
		transition: border 0.15s ease-in-out;
	}

	.searchbar:hover {
		border: 1px solid #ff264e
	}

	.searchbar:focus {
		border: 1px solid #ff264e
	}

	.no-results-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.table-div-container {
		height: 70%;
		overflow: auto;
		margin-bottom: 25px;
	}

	.table-div-container-inner {
		height: 100%;
	}

	.table-button-container {
		display:grid;
		grid-template-columns: 1fr 3.5fr 1fr;
	}
	
	.table-button {
		font-size: 16px;
		padding-top: 5px;
		padding-bottom: 5px;
		padding-left: 20px;
		padding-right: 20px;
		margin-right: 0px;
	}

	.table-page-number-container {
		position: relative;
	}

	.table-results-counter-container {
		position: relative;
	}

	.table-page-number {
		font-size: 16px;
		font-weight: bold;
		color: #ff264e;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.table-results-counter {
		font-size: 16px;
		font-style: italic;
		color: #808080;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	tr {
		text-align: center;
	}

	tr:nth-child(even) {
		background-color:#1a1a1a;
	}

	tr:nth-child(odd) {
		background-color: #000;
	}

	th {
		color: #ff264e;
	}

	.td-comments {
		text-align: left;
		font-style: italic;
	}
</style>