<script>
    export let value;
    export let id;
    export let options;
    export let label;
</script>

<h3 for={id}>{label}</h3>
<select multiple bind:value {id}>
    {#each options as option}
        <option value={option.value}>
            {option.label}
        </option>
    {/each}
</select>

<style>
    select { width: 100% } 
</style>