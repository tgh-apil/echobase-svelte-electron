<script>
	import { onMount } from 'svelte';
	import { rootDirectory } from '../stores.js';
	const fs = window.require('fs');

	// read data folder
	const dataDir = $rootDirectory + '/data/'
	const dataArray = fs.readdirSync(dataDir);

	let dataParse = [];
	let colHeadings = [];
	let rowData = [];

	// check if there's saved data
	let hasData;
	
	let prevButton;
	let nextButton;
	let counter = 0; 
	let maxEntriesShown = 20;

	onMount(() => {
		prevButton.disabled = true;
		console.log(dataArray.length);
	})

	if (dataArray.length === 0) {
		hasData = false;
	} else {
		hasData = true;
		populateTable();
	}

	// add a next page button --> load next 100 entries
	function changePage(modifier) {
		if (counter === maxEntriesShown) {
			prevButton.disabled = true;
		}
		else {
			prevButton.disabled = false;
		}

		if (counter >= dataArray.length) {
			nextButton.disabled = true;
		} else {
			nextButton.disabled = false;
		}

		counter += maxEntriesShown * modifier;
		console.log(counter);
		populateTable()
	}

	function populateTable() {
		// parse data from json
		if (dataArray.length <= maxEntriesShown) {
			dataArray.forEach(fileData => {
				dataParse.push(JSON.parse(fs.readFileSync(dataDir + fileData)));
			});
		} else {
			for (let i = 0 + counter; i < maxEntriesShown + counter; i++) {
				dataParse.push(JSON.parse(fs.readFileSync(dataDir + dataArray[i])));
			}
		}

		// create columns based on keys
		colHeadings = (Object.keys(dataParse[0]));

		// create rows based on values
		rowData = (Object.values(dataParse))
		// truncate the data: clip name (limit to 20 chars), comments (limit 50 chars)
		for (let i = 0; i < rowData.length; i++) {
			// let fileName = dataArray[i].slice(8, dataArray[i].length - 9)
			// rowData.unshift(fileName);

			if (rowData[i].Comments.length > 30) {
				rowData[i].Comments = rowData[i].Comments.slice(0, 31) + '...';
				console.log(rowData[i].Comments);				
			}
		}
		
		// if click on cell 'edit labels', insert new video player + ratings form to edit the form
	}

</script>

{#if hasData}
	<div class="table-div-container">
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
	<div>
		<button bind:this={prevButton} on:click={() => changePage(-1)}>Previous</button>
		<button bind:this={nextButton} on:click={() => changePage(1)}>Next</button>
	</div>
{:else}
<div>
	nah
</div>
{/if}

<style>
	.table-div-container {
		overflow: scroll;
		height: 80%;
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