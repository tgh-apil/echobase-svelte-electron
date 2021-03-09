<script>
    export let value;
    export let placeholder;
    export let id;
    export let label;
    export let name;
</script>

<h3 for={id}>{label}</h3>
<input bind:value {placeholder} {id} {name} type="text" />

<style>
    input { width: 100% }    
</style>