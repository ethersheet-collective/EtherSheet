#Stitchit

A simple template compiler, based on Jammit and designed for node.  Use it to take a directory of template files and stitch them together into a single script that can be loaded in the browser.

The api may change to include a .pipe interface, as well as a way to also load the templates into your node environment. Maybe a commandline interface? Who knows, it's version 0.0.1.

## Installation

    npm install stitchit

## Usage

```javascript
var stitchit = require('stitchit');

// the following are optional, except path 
var options = {
  path: '/some/path/to/templates',
  namespace: 'window.JST',
  compiler: '_.template',
  extension: 'jst'
}

// if you are fine with all the defaults, just pass in the path as a string
options = '/some/path/to/templates';

// stitchit creates a string you can serve directly to the browser, or write to a file, etc
stitchit(options,function(err,templates){
  fs.writeFile('/path/to/compiled/script',templates);
});

// alternatively, if you'd like everything done syncronously, don't pass a callback
var templates = stitchit(options);
```
