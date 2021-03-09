<script>
    import RadioButtonGroup from './RadioButtonGroup.components.svelte';
    import SelectGroup from './SelectGroup.component.svelte';
    import TextInput from './TextInput.component.svelte';
    import TextArea from './TextArea.component.svelte';
    import {nextClip} from '../NextClip.svelte';
    import { rootDirectory } from '../stores';
    const fs = window.require('fs');

    export let fields;
    export let onSubmit;

    let storagePath = $rootDirectory + '/storage/';
    let donePath = $rootDirectory + '/done/';
    
    // Convert fields from [ { name: 'name', value: 'Value' } ] to { name : Value } which is more useful when submitting a form
    const fieldsToObject = (fields) => fields.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});
    
    function saveData(data) {
        let convertedData = JSON.stringify(data, 0, 2);

        fs.readdir($rootDirectory + '/storage', (err, files) => {
            let fileName = $rootDirectory + '/data/' + files[0] + '.json';
            fs.writeFile(fileName, convertedData, (err) => {
                if (err) throw err;
                console.log(`saved file ${files[0]}`);
            })
        })
    }
    // When submitting, turn our fields representation into a JSON body
    const handleSubmit = () => onSubmit(saveData(fieldsToObject(fields)), nextClip(storagePath, donePath));

</script>

<form on:submit|preventDefault={() => handleSubmit(fields)}>
    <div class="formOptions">
        <h2>Just a couple of questions...</h2>
        {#each fields as field}
            {#if field.type === 'radio'}
                <RadioButtonGroup bind:group={field.value} label={field.label} options={field.options} id={field.id}/>
            {:else if field.type === 'select'}
                <SelectGroup bind:value={field.value} label={field.label} options={field.options} id={field.id}/>
            {:else if field.type === 'text'}
                <TextInput bind:value={field.value} label={field.label} placeholder={field.placeholder} id={field.id} name={field.name}/>
            {:else if field.type === 'text-area'}
                <TextArea bind:value={field.value} label={field.label} placeholder={field.placeholder} id={field.id} name={field.name}/>            
            {/if}
        {/each}
    </div>
    <div>
        <button type="submit">Submit</button>
    </div>
</form>

<style>
    h2 {
        color: #5549b3;
        margin-top: 0px;
        font-size: 30px;
        font-family:  'IBM Plex Sans', sans-serif;
    }
</style>
