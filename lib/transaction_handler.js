module.exports = function createTransactionHandler(service){
  return function transactionHandler(c,cb){
    if(c.getDataType() != 'sheet' && c.getDataType() != 'sheets') return cb(null,c.getSerializedMessage());
    var model = service.getModel(c.getDataType(),c.getDataId());
    c.execute(model,function(err){
      cb(err,c.getSerializedMessage());
    });
  };

}
