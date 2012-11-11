var http = require('http');
var https = require('https');
var express = require('express');
var socket_io = require('socket.io');
var fs = require('fs');
var stitchit = require('stitchit');
var EtherSheetService = require('./ethersheet').EtherSheetService;

var ES_CLIENT_PATH= __dirname + '/../node_modules/es_client';
var LAYOUT_PATH = __dirname + '/layouts';

// Note: templates should be fixed to load using require in the client
// and not need the server to be aware of them
var TEMPLATE_PATH = ES_CLIENT_PATH + '/templates/';
var TEMPLATE_NAMESPACE = 'module.exports';


exports.createServer = function(config){


  // create a db connection 
  var es = new EtherSheetService(config);


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

  //read sheet (also creates)
  app.get('/s/:sheetid', function(req,res){
    res.render('sheet.ejs',{
      sheet_id:req.params.sheetid
    });
  });

  /********************************
   * CRUD methods for sheet
   ********************************/

  //read sheet (also creates)
  app.get('/api/:sheetid', function(req,res){
    es.find_or_create_sheet(req.params.sheetid, function(err, sheet){
      if(err){
        throw(err);
      }
      res.send(sheet.sheetdata);
    });
  });

  // save the sheet
  app.put('/s/:sheet_id', express.bodyParser(), function(req,res){
    es.save_sheet(req.params.sheet_id, req.body.sheet_data);
    res.send(req.body.sheet_id);
  });
  
  // delete the sheet
  app.delete('/s/:sheet_id', function(req,res){
    es.delete_sheet(req.params.sheet_id, function(err){
      if(err){
        throw err;
      } else {
        res.send(req.params.sheet_id);
      }
    });
  });

  // client-side templates concatenated together
  app.get('/es_client/templates.js', function(req,res){
    stitchit({path:TEMPLATE_PATH,namespace:TEMPLATE_NAMESPACE},function(err,templates){
      if(err) throw err;

      templates = 
        "if (typeof define !== 'function') { var define = require('amdefine')(module) }\n"+
        "define( function(require,exports,module){\n\n"+
        "var _ = require('underscore');\n"+
        "var helpers = require('es_client/helpers');\n"+
        templates+
        "\n});\n";

      res.send(templates);
    });
  });


  /***********************************************
  * Socket.io
  ***********************************************/
  var io = socket_io.listen(server);

  io.sockets.on('connection', function(socket){

    socket.on('JOIN_ROOM', function(data){
      es.find_or_create_user(data.user_id, function(err, user){ 
        if(err) throw(err);
        socket.udata = user;
        socket.udata.sheet_id = data.sheet_id;
        es.add_user_to_room(socket.udata, data.sheet_id, function(err){
          if(err) throw(err);
          socket.join(data.sheet_id);
          socket.emit('ROOM_JOINED');
          io.sockets.in(data.sheet_id).emit(
            'USER_CHANGE', 
            {user: user, action: 'JOINED', sheet_data:EtherSheetService.sheets[data.sheet_id]}
          );
        });
      });
    });
    
    //use this for messages that are passed only to other clients
    //and don't need to interact with the server.
    socket.on('message', function(data){
      socket.broadcast.to(socket.udata.sheet_id).emit('message', data);
    });

    socket.on('disconnect', function(){
      if(socket.udata){
        socket.leave(socket.udata.sheet_id);
        es.remove_user_from_room(socket.udata, socket.udata.sheet_id);
        io.sockets.in(socket.udata.sheet_id).emit('USER_CHANGE', {user: socket.udata, action: 'LEFT', sheet_data:EtherSheetService.sheets[socket.udata.sheet_id]});
      }
    });

  });

  return app;
}
