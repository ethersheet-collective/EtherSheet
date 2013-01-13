var Command = require('es_command');

module.exports = function createTransactionHandler(service){

  return function transactionHandler(channel,command_string,cb){
    var c = new Command(command_string);
    var model = service.getModel(c.getDataType(),c.getDataId());
    c.execute(model,function(err){
      cb(err,command_string);
    });
  };

}
