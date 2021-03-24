<script context="module">
    import { videoSource } from './stores';
    
    const fs = window.require('fs');
    
    export function nextClip(storagePath, donePath) {
        const storageFiles = fs.readdirSync(storagePath);

        const oldPath = storagePath + '/' + storageFiles[0];
        const newPath = donePath + '/' + storageFiles[0];
        
        fs.rename(oldPath, newPath, (err) => {
            if (err) throw err;
        })

        if (storageFiles.length > 1) {
            videoSource.update((src) => src = storagePath + storageFiles[1]);
        } else {
            videoSource.update(src => src = 'done');
        }

        console.log(`moved ${storageFiles[0]} to done!`);
    }
</script>