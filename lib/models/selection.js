/* stub server model for selections since the server doesn't actually care about them*/
var Selection = module.exports = function(id,db){
}

Selection.prototype.addCell = function(sheet,row_id,col_id,cb){
  cb(null,'');

};
Selection.prototype.replicateSelection = function(selection,cb){
  cb(null,selection);
};
Selection.prototype.clear = function(silent,cb){
  cb(null,silent);
};
