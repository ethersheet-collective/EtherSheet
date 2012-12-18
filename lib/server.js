var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
var Transactor = require('transactor');
var esSocketHandler = require('./socket_handler');

var ES_CLIENT_PATH= __dirname + '/../node_modules/es_client';
var LAYOUT_PATH = __dirname + '/layouts';


exports.createServer = function(config){


  /***********************************************
  * EtherSheet HTTP Server
  ***********************************************/
  var app = express();
  var http_server = http.createServer(app);

  // Server Settings
  app.set('views',LAYOUT_PATH);
  app.use(express.logger({ format: ':method :url' }));
  app.use('/es_client',express.static(ES_CLIENT_PATH));

  // listen after setup
  process.nextTick(function(){
    http_server.listen(config.port, config.host, function(){
      console.log('ethersheet is listening over http on port ' + config.port);
    });
  });


  /**********************************************
  * HTTP Routes
  *********************************************/
  //index
  app.get('/', function(req,res){
    res.render('index.ejs');
  });

  //load up the sheet
  app.get('/s/:sheetid', function(req,res){
    res.render('sheet.ejs',{
      sheet_id:req.params.sheetid
    });
  });


  /***********************************************
  * PubSub Server 
  ***********************************************/
  var pub_server = new Transactor(); 
  
  /***********************************************
  * Websocket Server
  ***********************************************/
  var ws_server = sockjs.createServer();
  ws_server.installHandlers(http_server,{prefix:'/pubsub'});
  ws_server.on('connection', function(socket){
    var channel = socket.pathname.substr(socket.prefix.length);
    pub_server.addSocket(channel,socket);
  });

  return http_server;
}
