var express = require('express');
var socket_io = require('socket.io');
var fs = require('fs');
var stitchit = require('stitchit');
var EtherSheetService = require('./ethersheet').EtherSheetService;

var PUBLIC_DIR = __dirname + '/../public/';
var PUBLIC_MODULES_DIR = __dirname + '/../public/node_modules/';
var TEMPLATE_PATH = PUBLIC_MODULES_DIR + '/es/templates/';
var TEMPLATE_NAMESPACE = 'templates';

exports.createServer = function(config){
  // create an EtherSheetService
  var es = new EtherSheetService(config);

  /***********************************************
  * Express HTTP Server
  ***********************************************/
  var app = express.createServer({
    key: fs.readFileSync(config.https_key),
    cert: fs.readFileSync(config.https_cert)
  });
  
  // Server Settings
  app.set('view options', {
      layout: false
  });

  // Server Middleware
  app.use(express.static(PUBLIC_DIR));
  app.use(express.static(PUBLIC_MODULES_DIR));
  app.use(express.logger({ format: ':method :url' }));
  app.use(express.bodyParser());

  /**********************************************
  * HTTP Routes
  **********************************************/
  //index
  app.get('/', function(req,res){
    res.render('index.ejs');
  });

  // save the sheet
  app.post('/save', function(req,res){
    es.save_sheet(req.body.sheet_id, req.body.sheet_data);
    res.send(req.body.sheet_id);
  });

  //get the sheet in json form
  app.get('/s/:sheetid.json', function(req,res){
    es.find_or_create_sheet(req.params.sheetid, function(err, sheet){
      if(err){
        throw(err);
      }
      res.send(sheet.sheetdata);
    });
  });

  // sheet entry page
  app.get('/s/:sheetid', function(req,res){
    res.render('jquery.sheet.ejs', {sheet_id: req.params.sheetid, socket_port: config.port});
  });


  app.get('/es/templates', function(req,res){
    stitchit({path:TEMPLATE_PATH,namespace:TEMPLATE_NAMESPACE},function(err,templates){
      if(err) throw err;
      res.send(templates);
    });
  });

  /***********************************************
  * Socket.io
  ***********************************************/
  var io = socket_io.listen(app);

  io.sockets.on('connection', function(socket){

    socket.on('JOIN_ROOM', function(data){
      es.find_or_create_user(data.user_id, function(err, user){ 
        if(err){
          throw(err);
        }
        console.log(data.user_id);
        console.log(user);
        socket.udata = user;
        socket.udata.sheet_id = data.sheet_id;
        es.add_user_to_room(socket.udata, data.sheet_id, function(err){
          if(err){
            console.log(err);
          }
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

  /***********************************************
  * Fire the canons!!
  ***********************************************/
  app.listen(config.port, config.host, function(){
    console.log('ethersheet is listening over https on port ' + config.port);
  });

  return app;
}
