var express = require('express');
var io = require('socket.io');
var fs = require('fs');
var config = require('./config');
var EtherSheetService = require('./ethersheet').EtherSheetService;

// create an EtherSheetService
var es = new EtherSheetService();

/***********************************************
 * Express HTTP Server
 ***********************************************/
/* TODO: PLEASE PLEASE PLEASE do not deploy this for production with the self
         signed cert.  It would be a REALLY BAD IDEA */
var app = express.createServer({
  key: fs.readFileSync(config.https_key),
  cert: fs.readFileSync(config.https_cert)
});

// Server Settings
app.set('view options', {
    layout: false
});

// Server Middleware
app.use(express.static(__dirname + '/public'));
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
  es.find_or_create_sheet(req.params.sheetid);
  es.on('sheet_ready', function(){
    res.send(es.sheet_data.sheetdata);
  });
});

// sheet entry page
app.get('/s/:sheetid', function(req,res){
  res.render('jquery.sheet.ejs', {sheet_title: req.params.sheetid, socket_port: config.port});
});


/***********************************************
 * Socket.io
 ***********************************************/
var io = io.listen(app);

io.sockets.on('connection', function(socket){

  socket.on('JOIN_ROOM', function(data){
    es.find_or_create_user(data.user_id, function(user){ 
      console.log(data.user_id);
      console.log(user);
      socket.udata = user;
      socket.udata.user_id = data.user_id;
      socket.udata.sheet_id = data.sheet_id;
      es.add_user_to_room(socket.udata);
      socket.emit('ROOM_JOINED');
      io.sockets.in(data.sheet_id).emit(
        'USER_CHANGE', 
        {user: user, action: 'JOINED', sheet_data:es._sheets[data.sheet_id]}
      );
    });
  });
  
  //use this for messages that are passed only to other clients
  //and don't need to interact with the server.
  socket.on('message', function(data){
    socket.broadcast.to(socket.sheet_id).emit('message', data);
  });

  socket.on('disconnect', function(){
    socket.leave(socket.udata.sheet_id);
    es.remove_user_from_room(udata);
    console.log('user ' + socket.udata.user_id + ' LEFT room ' + socket.udata.sheet_id);
    io.sockets.in(socket.udata.sheet_id).emit('USER_CHANGE', {user_id: socket.udata.user_id, action: 'LEFT', sheet_data:es._sheets[socket.udata.sheet_id]});
  });

});

/***********************************************
 * Fire the canons!!
 ***********************************************/
app.listen(config.port, config.host, function(){
  console.log('ethersheet is listening over https on port ' + config.port);
});
