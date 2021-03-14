const fs = window.require('fs');

export default function jsonUpdater(filePath, fileName, objToAppend) {
        // path still not working even if i convert the object to string, so we use this ugly thing
        const dbFilePath = filePath + '/data/' + fileName + '.json'

        let dbObj = JSON.parse(fs.readFileSync(dbFilePath));

        dbObj = {...dbObj, ...objToAppend};

        fs.writeFileSync(dbFilePath, JSON.stringify(dbObj, 0, 2));

        console.log(`File: ${fileName} updated!`)
}