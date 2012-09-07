var config, server;

if(process.env.NODE_ENV == 'test'){
  console.log('starting Ethersheet in test mode');
  config = require('./lib/test/config-test');
} else if(process.env.CONFIG_PATH){
  config = require(process.env.CONFIG_PATH);
} else {
  config = require('./config');
}

server = require('./lib/server').createServer(config);
