var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
var fs = require('fs');
var Command = require('es_command');
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
  app.use(express.bodyParser());
  app.use(express.cookieParser());

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

  //convert sheet to csv
  app.get('/s/:sheetid.csv', function(req,res){
    var sheet_id = String(req.params.sheetid);

    if(!req.cookie || !req.cookie.JSESSIONID == sheet_id){
      console.log('req.cookie', req.cookie);
      res.cookie('JSESSIONID', sheet_id, { maxAge: 900000, httpOnly: false});
      res.redirect("/s/" + sheet_id);
    }

    es.sheetToCSV(sheet_id,function(err, sheet_data){
      res.header('content-type', 'text/csv');
      res.render('csv.ejs',{ csv:sheet_data});
    });
  });

  //load up the sheet
  app.get('/s/:collection_id', function(req,res){
    var collection_id = String(req.params.collection_id);
    es.getSheetCollection(collection_id,function(err,sheet_data){
      console.log('sheet_data', sheet_data);
      if(err) return res.send(500,String(err));
      res.render('sheet.ejs',{
        channel:collection_id,
        sheet_collection:JSON.stringify(sheet_data)
      });
    });
  });

  //import csv
  app.post('/import/csv', function(req,res){
    var csv_path = req.files.csv_file.path;
    var sheet_id = req.body.sheet_id;
    fs.readFile(csv_path, function(err, data){
      es.createSheetFromCSV(sheet_id, data, function(err){
        res.redirect('back');
        pub_server.refreshClients(sheet_id); 
      });
    });
  });
  

  /***********************************************
  * PubSub Server 
  ***********************************************/
  var pub_server = new Transactor();
  var transactionHandler = createTransactionHandler(es);

  pub_server.onTransaction(function(channel,socket,command_string,cb){
    var c = new Command(command_string);
        
    if(c.getDataType()=='user' && c.getAction()=='addUser'){
      var id = c.getParams()[0].id;
      socket.es_user_id = id;
    }

    transactionHandler(c,cb);
  });

  pub_server.onClose(function(channel,socket){
    var close_msg = {
      type:'user',
      action:'removeUser',
      params:[{
        id: socket.es_user_id
      }]
    };
    var close_command = Command.serialize(close_msg);
    pub_server.broadcast(socket,channel,close_command);
  });
  pub_server.refreshClients = function(sheet_id){
    var refresh_msg = {
      type: 'sheet',
      id: sheet_id,
      action: 'refreshSheet',
      params:[]
    }
    var refresh_command = Command.serialize(refresh_msg);
    console.log('sending refresh command');
    pub_server.broadcast(null,sheet_id,refresh_command);
  };


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
