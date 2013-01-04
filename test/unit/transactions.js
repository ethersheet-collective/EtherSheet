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
    expected_result.vector = '123';

    service.getModel = function(type,id){
      assert.equal(type,test_command.type);
      assert.equal(id,test_command.id);
      return {
        test_action: function(){
          assert.deepEqual(Array.prototype.slice.call(arguments,0,2),test_command.params);
          arguments[2](null,expected_result); }
      }
    };

    transactionHandler('test_channel',JSON.stringify(test_command),function(err,data){
      assert.deepEqual(data,JSON.stringify(expected_result));
      done(err);
    });
  });

});
