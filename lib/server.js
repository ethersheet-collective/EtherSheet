var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
var Transactor = require('transactor');
var EtherSheetService = require('./ethersheet_service');
var createTransactionHandler = require('./transaction_handler');

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

  /***********************************************
  * EtherSheet DB Client 
  ***********************************************/
  var es = new EtherSheetService(config);

  // listen after setup
  es.onConnect(function(err){
    if(err) throw err;
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
    var sheet_id = String(req.params.sheetid);
    es.getSheet(sheet_id,function(err,sheet_data){
      if(err) return res.send(500,String(err));
      console.log('sheet '+sheet_id,sheet_data);
      res.render('sheet.ejs',{
        channel:sheet_id,
        sheet:JSON.stringify(sheet_data)
      });
    });
  });


  /***********************************************
  * PubSub Server 
  ***********************************************/
  var pub_server = new Transactor(); 

  pub_server.onTransaction(createTransactionHandler(es));

  /***********************************************
  * Websocket Server
  ***********************************************/
  var ws_server = sockjs.createServer();

  ws_server.installHandlers(http_server,{prefix:'.*/pubsub'});
  
  ws_server.on('connection', function(socket){
    var channel = socket.pathname.split('/')[1];
    pub_server.addSocket(channel,socket);
  });

  return http_server;
}
