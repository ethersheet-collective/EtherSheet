var EtherSheetService = require('../../lib/ethersheet_service');
var _ = require('underscore');
var config = require('../test-config.js');
var should = require('chai').should();
var async = require('async');
var assert = require('chai').assert;

describe('EtherSheetService', function(){

  describe('.colors', function(){
    it("should have at least 2 colors", function(){
      EtherSheetService.colors.length.should.be.above(1);
    })

    it("should be an array", function(){
      EtherSheetService.colors.should.be.an.instanceOf(Array);
    })

    it("should get a random color", function(){
      var es = new EtherSheetService(config);
      var colors = [];
      for(var i=0; i<100; i++){
        colors.push(es.getRandomColor());
      }
      _.uniq(colors).length.should.eql(EtherSheetService.colors.length);
       
    })
  })

  describe('sheets', function(){
    var es;
    
    before(function(done){
      es = new EtherSheetService(config);
      es.onConnect(done);
    });

    it('should delete a sheet', function(done){
      es.createSheet('delete_test', false, function(err){
        if(err) throw err;
        es.deleteSheet('delete_test',function(err){
          if(err) throw err;
          es.getRowIndex('delete_test',function(err,rows){
            if(err) throw err;
            should.not.exist(rows);
            done();
          });
        });
      });
    });

    it('should create a sheet if it does not exist', function(done){
      es.deleteSheet('create_test',function(err){
      es.getSheet('create_test', function(err, sheet){
        if(err){
          throw err;
        }
        sheet.should.have.property('rows');
        sheet.should.have.property('cols');
        sheet.should.have.property('cells');
        sheet.should.have.property('meta');
        sheet.meta.should.have.property('lastAccess');
        sheet.cells.should.be.empty;
        sheet.rows.length.should.eq(config.default_row_count);
        sheet.cols.length.should.eq(config.default_col_count);
        done();
      });
      });
    });
    
    it('should find a sheet', function(done){
      var cb = function(){};
      async.parallel([
        function(cb){es.setRowIndex('test_sheet',['foo'],cb)},
        function(cb){es.setColIndex('test_sheet',['bar'],cb)}, 
        function(cb){es.setCells('test_sheet',{foo:{bar:123}},cb)},
      ], 
      function(err){
        if(err){
          throw err;
        }
        es.getSheet('test_sheet', function(err, sheet){
          if(err){
            throw err;
          }
          sheet.cells.should.not.be.empty;
          sheet.cells['foo']['bar'].should == 123;
          done();
        });
      });
    });

    it('getSheet() should update access time', function(done){
      es.getMeta('test_sheet',function(err,meta){
        var oldTime = meta.lastAccess;
        es.getSheet('test_sheet',function(err,data){});
        setTimeout(function(){
          es.getMeta('test_sheet',function(err,meta){
            var newTime = meta.lastAccess;
            var updated = newTime > oldTime;
            assert.isTrue(updated, 'the access time was updated');
            done();
          });
        }, 1000);
      });
    });

  });

  describe('import/export csv', function(){
    var es, testsheet, sheet;
    before(function(done){
      es = new EtherSheetService(config);
      es.onConnect(done);
      testsheet = 'testcsv2';
      sheet = es.getModel('sheet',testsheet);
    });

    it('should create a sheet from a csv', function(done){
      es.createSheetFromCSV(testsheet, '1,2,3\n4,5,6', function(){
        es.getSheet(testsheet, function(err, data){
          var rowId = data.rows[1];
          var colId = data.cols[1];
          var val = data.cells[rowId][colId].value;
          assert.strictEqual('5', val);
          done();
        });
      });
    });

    it('should create a csv from a sheet', function(done){
      var testsheet = 'testcsv2';
      es.sheetToCSV(testsheet,  function(err,data){
        assert.include(data,'1,2,3,,,');
        assert.include(data,'4,5,6,,,');
        done();
      });
    });

  });

});
