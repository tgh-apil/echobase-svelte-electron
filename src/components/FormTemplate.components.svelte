<script>
    import RadioButtonGroup from './RadioButtonGroup.components.svelte';
    import SelectGroup from './SelectGroup.component.svelte';
    import TextInput from './TextInput.component.svelte';
    import TextArea from './TextArea.component.svelte';
    import { nextClip } from '../NextClip.svelte';
    import { rootDirectory, videoSource } from '../stores';

    // comment this out if you dont wan't to run python scripts
    import { launchPy } from '../pythonScripts';

    const fs = window.require('fs');

    export let fields;
    export let onSubmit;

    // I know this is the wrong way to do this, but importing Path does not work for some stupid reason
    let storagePath = $rootDirectory + '/storage/';
    let donePath = $rootDirectory + '/done/';
    
    // Convert fields from [ { name: 'name', value: 'Value' } ] to { name : Value } which is more useful when submitting a form
    const fieldsToObject = (fields) => fields.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});
    
    function saveData(data) {
        let convertedData = JSON.stringify(data, 0, 2);

        fs.readdir($rootDirectory + '/storage', (err, files) => {
            let currentFile = files[0] + '.json';
            let filePath = $rootDirectory + '/data/' + currentFile;

            // comment this line out if you don't want to run the python scripts
            // for machine learning + digit recognition
            launchPy(files[0], $rootDirectory);
            
            fs.writeFile(filePath, convertedData, (err) => {
                if (err) throw err;
                console.log(`saved file ${currentFile}`);
            })
        })

        nextClip(storagePath, donePath);
    }

    // When submitting, turn our fields representation into a JSON body
    const handleSubmit = () => onSubmit(saveData(fieldsToObject(fields)));
</script>

<form on:submit|preventDefault={() => handleSubmit(fields)}>
    <div class="formOptions">
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
