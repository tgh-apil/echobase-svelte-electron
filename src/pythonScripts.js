const { PythonShell } = window.require('python-shell');
const fs = window.require('fs');
import jsonUpdater from './jsonUpdater';

export default function launchPy(file_name, root_path) {

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

        const depth_obj = {'depth_cm': depth};

        jsonUpdater(root_path, file_name, depth_obj)
    })
}