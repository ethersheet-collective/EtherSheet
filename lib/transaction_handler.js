var Command = require('es_command');

module.exports = function createTransactionHandler(service){

  return function transactionHandler(channel,data_string,cb){
    var c = new Command(data_string);
    var model = service.getModel(c.getDataType(),c.getDataId());
    c.execute(model,function(err,msg){
      cb(err,Command.serialize(msg));
    });
  };

}
