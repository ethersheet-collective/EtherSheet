var EtherSheetService = require('../../lib/ethersheet').EtherSheetService;
var _ = require('underscore');
var config = require('../../config.js');
var should = require('chai').should();
var async = require('async');

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
      es.createSheet('delete_test',function(err){
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
      es.getSheet('create_test', function(err, sheet){
        if(err){
          throw err;
        }
        sheet.should.have.property('row_index');
        sheet.should.have.property('col_index');
        sheet.should.have.property('cells');
        sheet.cells.should.be.empty;
        sheet.row_index.length.should.eq(config.default_row_count);
        sheet.col_index.length.should.eq(config.default_col_count);
        done();
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
  });
});
