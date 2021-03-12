const { PythonShell } = window.require('python-shell');

export default function launchPy(file_name, root_path) {

    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: 'src/python_scripts',
        args: [file_name, root_path]
    }

    PythonShell.run('imageManipulation.py', options, function(err, results) {
        if (err) throw err;
        console.log(results);
    })
}