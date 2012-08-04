// returns the proper column name (uppercase letter, double letter after 26 columns)
ES.columnIndexToName = function(index){
  var char_code = (index % 26) + 65;
  var num_letters = Math.ceil((index+1) / 26);
  var char_array = [];
  for(i=0; i<num_letters; i++){
    char_array.push(char_code);
  } 
  return String.fromCharCode.apply(this,char_array);
}
