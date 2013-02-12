var Command = require('es_command');

module.exports = function createTransactionHandler(service){

  return function transactionHandler(channel,command_string,cb){
    var c = new Command(command_string);
    
    if(c.getDataType() == 'user') return cb(null,c.getSerializedMessage());

    var model = service.getModel(c.getDataType(),c.getDataId());
    c.execute(model,function(err){
      cb(err,c.getSerializedMessage());
    });
  };

}
