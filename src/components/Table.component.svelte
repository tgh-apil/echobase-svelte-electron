<script>
	import { onMount } from 'svelte';
	import { videoToEdit, videoPathToEdit, rootDirectory, currentPage } from '../stores.js';
	import Filters from './Filters.component.svelte';
	const fs = window.require('fs');

	// read data folder
	// this does not scale well!!
	// my poor RAM
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
	let maxEntriesShown = 30;

	let value = '';
	let appliedFilters = [];

	let filters = [
		{
			value : 'None',
			label : 'View',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: '4C', value: '4C'},
				{label: '5C', value: '5C'},
				{label: 'PLSX', value: 'PLSX'},
				{label: 'PSAXb', value: 'PSAXb'},
				{label: 'PSAXm', value: 'PSAXm'},
				{label: 'PSAXa', value: 'PSAXa'},
				{label: 'AVSX', value: 'AVSX'},
				{label: 'SC', value: 'SC'},
				{label: 'RISV', value: 'RISV'},
				{label: 'Lung', value: 'Lung'},
				{label: 'Other', value: 'Other'},
			],
			id: 'view-filter',
			type: 'multi-select'
		},
		{
			value : 'None',
			label : 'Quality',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: '0', value: 0},
				{label: '1', value: 1},
				{label: '2', value: 2},
				{label: '3', value: 3},
			],
			id: 'quality-filter',
			type: 'multi-select'
		},
		{
			value : 'None',
			label : 'Gain',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Under gained', value: 'Under gained'},
				{label: 'Optimal', value: 'Optimal'},
				{label: 'Overgained', value: 'Overgained'},
			],
			id: 'gain-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Orientation',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Correct', value: 'Correct'},
				{label: 'Incorrect', value: 'Incorrect'},
			],
			id: 'orientation-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Depth',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Appropriate', value: 'Appropriate'},
				{label: 'Inappropriate', value: 'Inappropriate'},
			],
			id: 'depth-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Focus',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Appropriate', value: 'Appropriate'},
				{label: 'Inappropriate', value: 'Inappropriate'},
			],
			id: 'focus-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Frequency',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Appropriate', value: 'Appropriate'},
				{label: 'Inappropriate', value: 'Inappropriate'},
			],
			id: 'frequency-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Physiology',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: 'Normal', value: 'Normal'},
				{label: 'Abnormal', value: 'Abnormal'},
			],
			id: 'physiology-filter',
			type: 'single-select'
		},
		{
			value : 'None',
			label : 'Cardiac Cycles',
			options : [
				{label: 'Not filtered', value: 'None'},
				{label: '0', value: 0},
				{label: '1', value: 1},
				{label: '2', value: 2},
				{label: '3', value: 3},
			],
			id: 'cardiac-cycles-filter',
			type: 'multi-select'
		},
		{
			name: 'Bookmark',
			label: 'Bookmark',
			options: [
				{label: 'Not filtered', value: 'None'},
				{label: 'Yes', value: 'Yes'},
				{label: 'No', value: 'No'},
			],
			id: 'bookmarked-filter',
			type: 'single-select'
		}
	]

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

	onMount(() => {
		prevButton.disabled = true;
		nextButton.disabled = true;

		if (hasData) {
			if (filteredResults.length > maxEntriesShown) {
				nextButton.disabled = false;
			}
		}
	})
	
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

		if (counter <= 0) {
			prevButton.disabled = true;
		}
		else {
			prevButton.disabled = false;
		}

		populateTable()
	}

	// this function is so bad
	function populateTable() {
		let searchTerms = value;
		let tempResults = [];

		// reload data flag when redrawing the table
		hasData = true;

		// this has to search for unique terms
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
			} else {
				console.log('no results');
				hasData = false;
			}
		} else {
			filteredResults = dataArray;
		}

		// only called when categorical filters are applied
		if (appliedFilters.length != 0) {
			// store filtered results temporarily
			let localTemp = [];

			appliedFilters.forEach(filter => {
				// first check whether the filter is an array
				if (Array.isArray(filter.value)) {
					filter.value.forEach(arrayVal => {
						filteredResults.forEach(v => {
							console.log(arrayVal);
							console.log(v[filter.label])
							if (v[filter.label] === arrayVal) {
								localTemp = [...localTemp, v]
							}
						})
					})
				} else {
					localTemp = filteredResults.filter(v => {
						return v[filter.label] === filter.value;
					})	
				}

				filteredResults = localTemp;
			})

			if (filteredResults == 0) {
				hasData = false;
			}
		}

		// we only want a subset of the data at a time
		let shownResults = [];
		
		if (filteredResults.length <= maxEntriesShown) {
			shownResults = filteredResults.slice(0, filteredResults.length);
		} else {
			shownResults = filteredResults.slice(counter, counter + maxEntriesShown);
		}

		// create columns based on keys on the original unchanging data
		colHeadings = (Object.keys(dataArray[0]));
		
		// create rows based on values 
		rowData = (Object.values(shownResults));
		
		// add link to video clip to each row
		console.log(rowData);

		//truncate length of comments to be displayed
		rowData.forEach(data => {
			if (data.Comments.length >= 50) {
				data.Comments = data.Comments.slice(0, 50) + '...';
			}
		})
	}

	function clearSearch() {
		value = '';
		populateTable();
	}

	function applyFilters() {
		appliedFilters = [];
		
		filters.forEach(filter => {
			if (filter.value != 'None') {
				let label = filter.label;
				let value = filter.value;
				let obj = {label: label, value: value}
				appliedFilters.push(obj);
			}
		})
		
		populateTable();
	}

	function clearFilters() {
		appliedFilters = [];

		filters.forEach(v => {
			v.value = 'None';
			v.options.label = 'Not filtered';
			v.options.value = 'None';
		})

		populateTable();
	}

	function openClip(fileName) {
		currentPage.update(src => src = 'viewEditClip');

		const file = '__anon__' + fileName;
		const filepath = $rootDirectory + '/done/' + file;

		videoToEdit.update(src => src = file);
		videoPathToEdit.update(src => src = filepath);
		console.log(filepath);
	}

	// to reference container for autoscroll
	let container;

	function handleKeydown() {
		populateTable()
	}
</script>

<div class="searchbar-container">
	<span></span>
	<div>
		<input class="searchbar" bind:value placeholder='🔎 Global search' id='searchbar' name='searchbar' type='text' on:keyup={handleKeydown} />
	</div>
	<div>
		<button class="clear-search-button" on:click={clearSearch}>Clear Search</button>
	</div>
</div>
<div class="filter-container">
	<Filters filters={filters}/>
</div>
<div class="filter-button-container">
	<span class="filler"></span>
	<button class="filter-button" on:click={clearFilters}>Clear Filters</button>
	<button class="filter-button" on:click={applyFilters}>Apply Filters</button>
</div>
{#if hasData}
	<div class="table-div-container" bind:this={container}>
		<div class="table-div-container-inner">
			<table style="width:100%">
				<tr>
					{#each colHeadings as heading}
						{#if heading === "Filename"}
							<th>View and Edit</th>
						{:else}
							<th>{heading}</th>
						{/if}
					{/each}
				</tr>
				{#each rowData as row}
					<tr>
						<!-- this needs to be refactored to update automatically when the form updates -->
						<td>{row.View}</td>
						<td>{row.Quality}</td>
						<td>{row.Gain}</td>
						<td>{row.Orientation}</td>
						<td>{row.Depth}</td>
						<td>{row.Focus}</td>
						<td>{row.Frequency}</td>
						<td>{row.Physiology}</td>
						<td>{row['Cardiac Cycles']}</td>
						<td class="td-long-text">{row.Comments}</td>
						<td>{row.Bookmark}</td>
						<td><button class="td-filename-button" on:click={openClip(row.Filename)}>Open</button></td>
						<td>{row['Depth Measure']}</td>
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
	</div>
{:else}
	<div class="no-results-container">
		<h2 class="intro-text">🙊🙉🙈</h2>
		<p class="intro-text">Uh-oh, no results found!</p>
	</div>
{/if}
<div class=nav-button-container>
	<span class="filler"></span>
	<button class="table-button" bind:this={prevButton} on:click={() => changePage(-1)}>Previous</button>
	<button class="table-button" bind:this={nextButton} on:click={() => changePage(1)}>Next</button>
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.searchbar-container {
		display: grid;
		grid-template-columns: 1fr 3fr 1fr;
		margin-top: 25px;
		margin-bottom: 25px;
	}

	.searchbar {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		padding-top: 7px;
		padding-bottom: 7px;
		padding-left: 10px;
		padding-right: 10px;
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

	.filler {
		grid-column-end: 9;
	}

	.clear-search-button {
		position: relative;
		top: 50%;
		text-align: center;
		transform: translate(0, -50%);
		font-size: 14px;
		font-weight: bold;
		margin-left: 10px;
		height: 100%;
		width: auto;
		padding-left: 10px;
		padding-right: 10px;
	}

	.filter-button-container {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        padding-bottom: 20px;
	}

	.filter-button {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-top: 5px;
		padding-bottom: 5px;
		width: 90%;
		font-size: 16px;
	}

	.no-results-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.table-div-container {
		height: 45%;
		overflow: auto;
		margin-bottom: 20px;
	}

	.table-div-container-inner {
		height: 100%;
	}

	.table-button-container {
		display:grid;
		grid-template-columns: 1fr 3.5fr 1fr;
	}
	
	.table-button {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-top: 5px;
		padding-bottom: 5px;
		width: 90%;
		font-size: 16px;
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

	.td-filename-button {
		font-size: 16px;
		font-weight: bold;
		border: none;
		color: #ff264e;
		height: 100%;
		width: 100%;
		border-radius: 0px;
	}

	.td-filename-button:hover {
		color: #fff;
	}

	.td-long-text {
		text-align: left;
		font-style: italic;
	}

	.nav-button-container {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
		position: relative;
	}
</style>