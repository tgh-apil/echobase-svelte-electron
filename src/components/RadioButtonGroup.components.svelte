<script>
    export let options;
    export let id;
    export let label;
    export let group;
</script>

<h3 for={id}>{label}</h3>
{#each options as option}
    <label>
        <input type=radio bind:group={group} value={option.value}>
        {option.label}
    </label>
{/each}