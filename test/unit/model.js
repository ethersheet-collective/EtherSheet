var EtherSheetService = require('../../lib/ethersheet_service');
var config = require('../../config.js');
var assert = require('chai').assert;
var async = require('async');
var uuid = require('node-uuid').v4;

describe('Models', function(){
  var es;

  before(function(done){
    es = new EtherSheetService(config);
    es.onConnect(done);
  });

  describe('Sheet', function(){
    var sheet, id;

    beforeEach(function(){
      id = uuid();
      sheet = es.getModel('sheet',id);
    });

    it("updateCell", function(done){
      var test_value = 'foo';
      async.parallel({
        row_id: function(cb){ sheet.rowAt(0,cb); },
        col_id: function(cb){ sheet.colAt(0,cb); }
      },testUpdate);

      function testUpdate(err,d){
        sheet.updateCell(d.row_id,d.col_id,test_value,function(err){
          if(err) done(err); 
          es.getModel('sheet',id).getValue(d.row_id,d.col_id,function(err,value){
            if(err) done(err); 
            assert.strictEqual(value,test_value);
            done();
          });
        });
      }
    });
  });

});
