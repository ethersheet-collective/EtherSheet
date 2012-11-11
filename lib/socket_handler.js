var EtherSheetService = require('./ethersheet').EtherSheetService;

module.exports = function(socket,io,config){
  var es = new EtherSheetService(config);
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
  
  /* crud operations */
  // TODO: Decide on API for what bootstrap returns on read
  socket.on('read', function(id){
    socket.emit('');
  });

  socket.on('disconnect', function(){
    if(socket.udata){
      socket.leave(socket.udata.sheet_id);
      es.remove_user_from_room(socket.udata, socket.udata.sheet_id);
      io.sockets.in(socket.udata.sheet_id).emit('USER_CHANGE', {user: socket.udata, action: 'LEFT', sheet_data:EtherSheetService.sheets[socket.udata.sheet_id]});
    }
  });

};
