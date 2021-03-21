<script>
    import SelectGroup from './SelectGroup.component.svelte';
    import SelectMultipleGroup from './SelectMultipleGroup.component.svelte';

    export let filters = [];
</script>

<div class="filter-container">
    {#each filters as filter}
        {#if filter.type === 'single-select'}
            <div class="select-container">
                <SelectGroup bind:value={filter.value} label={filter.label} options={filter.options} id={filter.id}/>
            </div>
        {:else if filter.type === 'multi-select'}
            <div class="select-container">
                <SelectMultipleGroup bind:value={filter.value} label={filter.label} options={filter.options} id={filter.id}/>
            </div>
        {/if}
    {/each}
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

    .filter-container {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        padding-bottom: 25px;
    }

    .select-container {
        width: auto;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 14px;
    }
</style>