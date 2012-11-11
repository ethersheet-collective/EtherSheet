var EtherSheetService = require('./ethersheet').EtherSheetService;

module.exports = function(socket,io,config){
  var es = new EtherSheetService(config);

