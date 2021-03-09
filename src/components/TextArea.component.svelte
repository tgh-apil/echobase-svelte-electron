<script>
    export let value;
    export let placeholder;
    export let id;
    export let label;
    export let name;
</script>

<h3 for={id}>{label}</h3>
<textarea bind:value {placeholder} {id} {name} type="text-area"></textarea>

<style>
    textarea { width: 100%; height: 150px; }    
</style>