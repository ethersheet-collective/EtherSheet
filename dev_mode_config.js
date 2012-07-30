// # DEV MODE
module.exports = {

// ## watch_list
// List of files and directories to monitor.
  watch_list: [
    'app.js'
  ],
  
// ## recursive watch_list
// List of files and directories to monitor.
  recursive_watch_list: [
    'lib','views','test'
  ],

// ## processes
// all processes are rebooted on file change
// use the token [[file_path]] in your command 
// to pass the name of the changed file into your process
  processes: [

// ### dev server
    {
      name: 'Ethersheet Server https:/localhost:8080/',
      prompt: 'S',
      color: 'magenta',
      command: 'npm start',
      env:{NODE_ENV: 'test'}
    },
// ### test suite 
    {
      name: 'Test Suite',
      prompt: 'T',
      color: 'blue',
      command: 'npm test', 
      env:{NODE_ENV: 'test'}
    }
  ]
}
