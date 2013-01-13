var createTransactionHandler = require('../../lib/transaction_handler');
var assert = require('chai').assert;

describe('Transactions', function(){
  var transactionHandler, service, test_command;
  beforeEach(function(){
    test_command = {
      type: 'test_type',
      id: 'test_id',
      action: 'test_action',
      params: ['param1','param2']
    };
    service = {};
    transactionHandler = createTransactionHandler(service);
  });

  it("should execute the correct action", function(done){
    var expected_result = Object.create(test_command);

    service.getModel = function(type,id){
      assert.equal(type,test_command.type);
      assert.equal(id,test_command.id);
      return {
        test_action: function(){
          // assert correct params are passed in
          var params = Array.prototype.slice.call(arguments,0,2);
          var cb = arguments[2];
          assert.deepEqual(params,test_command.params);
          cb(null); 
        }
      }
    };

    var command_string = JSON.stringify(test_command);
    
    transactionHandler('test_channel',command_string,function(err,data){
      assert.deepEqual(data,command_string);
      done(err);
    });
  });

});
