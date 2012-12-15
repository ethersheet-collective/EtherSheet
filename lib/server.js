var http = require('http');
var https = require('https');
var express = require('express');
var socket_io = require('socket.io');
var stitchit = require('stitchit');
var esSocketHandler = require('./socket_handler');

var ES_CLIENT_PATH= __dirname + '/../node_modules/es_client';
var LAYOUT_PATH = __dirname + '/layouts';


exports.createServer = function(config){


  /***********************************************
  * EtherSheet HTTP Server
  ***********************************************/
  var app = express();
  var server = http.createServer(app);

  // Server Settings
  app.set('views',LAYOUT_PATH);
  app.use(express.logger({ format: ':method :url' }));
  app.use('/es_client',express.static(ES_CLIENT_PATH));

  // listen after setup
  process.nextTick(function(){
    server.listen(config.port, config.host, function(){
      console.log('ethersheet is listening over https on port ' + config.port);
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
  * Socket.io
  ***********************************************/
  var io = socket_io.listen(server);

  io.sockets.on('connection', function(socket){
    esSocketHandler(socket,io,config);
  });

  return app;
}
