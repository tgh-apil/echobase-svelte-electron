# Echobase

## π©Ί An echo clip labeling app 

**Specific usecase:** loads cardiac ultrasound clips (mp4) so users can label them on specific metrics (image quality, view, etc...).\
**General usecase:** loads any video so users can apply any number of labels to the video.\
**Output:** each labeled video has a corresponding `file_name.json` file with labels.

## π Expected folder structure
The app will ask you to select you root folder. The root folder should contain `storage`, `done`, and `data` folders.  All videos go in the storage folder.\
As videos get labeled, they will automatically get moved to the `done` folder. \
All labels will automatically end up in the `data` folder.

```
Root
β   
ββββstorage
|   video_3.mp4
|   video_4.mp4
|    ...
|
ββββimage_recognition
|   saved_model
|   
ββββdone
|   video_1.mp4
|   video_2.mp4
|
ββββdata
|   video_1.json
|   video_2.json
|
```

### π€ Tech
[Svelte](svelte.dev)\
[Electron](https://www.electronjs.org/)\
Tensorflow 2 + opencv to determine clip depth

### π©βπ» To Use
1. Get dependancies: `npm install`
2. Run dev to edit live: `npm start`
3. Make for your platform: `npm run make`

### π Deep Learning Capacity
If you want to use the digit recognition we're using to gauge depth, you'll need to have these installed on your system:

- python 3.8x
- Tensorflow 2
- opencv
- numpy


**Note**: the system is *really* bad at classifying the number 7 correctly.


If you don't want these, remove lines `10` and `33` from `FormTemplate.components.svelte`

### π» Starter templtae 
[Electron Forge + Svelte Starter](https://github.com/codediodeio/electron-forge-svelte)
