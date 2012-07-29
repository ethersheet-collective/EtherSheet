if(process.env.NODE_ENV == 'test'){
  console.log('starting Ethersheet in test mode');
  var config = require('./test/config-test');
} else {
  var config = require('./config');
}
var server = require('./lib/server.js').createServer(config);
