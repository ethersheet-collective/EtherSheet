if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*
function columnIndexToName() - returns the proper column name (uppercase letter, double letter after 26 columns)
*/

return function columnIndexToName(index){
  var char_code = (index % 26) + 65;
  var num_letters = Math.ceil((index+1) / 26);
  var char_array = [];
  for(var i=0; i<num_letters; i++){
    char_array.push(char_code);
  } 
  return String.fromCharCode.apply(this,char_array);
};

});
