if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*
    Templates
    loader for non-browser environment

    NOTE: currently this is only for running tests via the commandline. 
    implementation is COMPLETELY TERRIBLE, considered harmful, etc
*/

var stitchit = require('stitchit');
var _ = require('underscore');

var template_string = stitchit({path:__dirname+'/', namespace:'templates'});

// Buahahaha
eval(template_string);

// shim for injecting require into template environment
// so we can access helper functions
var templateWrapper = function(template){
  return function(data){
    data = data || {};
    data.require = require;
    return template(data);
  }
};

module.exports = templates;

for(i in templates) templates[i] = templateWrapper(templates[i]); 

return templates;

});
