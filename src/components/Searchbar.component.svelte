<script>
    import TextInput from './TextInput.component.svelte';
    export let field;

    function Test() {
        console.log('hiiii')
    }
</script>

<div>
    <TextInput bind:value={field.value} label='' placeholder={field.placeholder} id={field.id} name={field.name} on:keydown={Test} />
</div>



<style>

</style>