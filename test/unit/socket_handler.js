var config = require('../config-test.js');
var esSocketHandler = require('../../lib/socket_handler');
var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');


describe('EtherSheet Server', function(){
  describe('websocket crud endpoints', function(){
    var io, mock, io_mock, emitter;

    it('should respond to a read event', function(done){
      emitter = new EventEmitter();
      io = {};
      mock = sinon.mock(emitter);
      io_mock = sinon.mock(io);
      esSocketHandler(emitter,io,config);
      mock.expects('emit');
      emitter.emit('read');
      done();
    });
  });
});
