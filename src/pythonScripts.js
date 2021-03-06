const { PythonShell } = window.require('python-shell');
import jsonUpdater from './jsonUpdater';

export function launchPy(file_name, root_path) {

    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: 'src/python_scripts',
        args: [file_name, root_path]
    }

    let pyResults = []

    PythonShell.run('imageManipulation.py', options, function(err, results) {
        // results come in as an object
        if (err) throw err;
        results.forEach(result => {
            pyResults.push(result);
        })

        console.log(results);

        const depth = parseInt(pyResults[pyResults.length - 1]);

        const fileNameObj = {'Filename': file_name.slice(8, file_name.length)}
        const depthObj = {'Depth Measure': depth};

        jsonUpdater(root_path, file_name + '.json', fileNameObj)
        jsonUpdater(root_path, file_name + '.json', depthObj)
    })
}

export function vidBlackBar(root_path) {

    let pyResults = [];

    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: 'src/python_scripts',
        args: [root_path]
    }

    PythonShell.run('video_anon.py', options, function(err, results) {
        if (err) throw err;
        results.forEach(result => {
            pyResults.push(result);
        })
        
        console.log(results);
        
        const isClean = pyResults[pyResults.length - 1];

        return isClean;
    })
}