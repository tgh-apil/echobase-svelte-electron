<script>
    import Checkbox from './Checkbox.component.svelte';
    import TextInput from './TextInput.component.svelte';

    export let filters;

    const fieldsToObject = (filters) => filters.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});

    const handleSubmit = () => onsubmit(fieldsToObject(filters));

</script>

<form on:submit|preventDefault={() => handleSubmit(filters)}>
    {#each filters as filter}
        {#if filter.type === 'check'}
            <Checkbox bind:group={filter.value} label={filter.label} options={filter.options} id={filter.id}/>
        {:else if filter.type === 'text'}
            <TextInput bind:value={filter.value} label={filter.label} placeholder={filter.placeholder} id={filter.id} name={filter.name}/>
        {/if}
    {/each}

</form>