var EtherSheetService = require('../../lib/ethersheet').EtherSheetService;
var _ = require('underscore');
var config = require('../config-test.js');

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
        colors.push(es.get_random_color());
      }
      _.uniq(colors).length.should.eql(EtherSheetService.colors.length);
       
    })
  })

  describe('.sql', function(){
    it("should have a sql connection", function(){
      var es = new EtherSheetService(config);
      es.should.have.property('sql');
      es.sql.should.have.property('query');
    })
  })

  describe('users', function(){
    var es = new EtherSheetService(config);
    it('should delete a user', function(done){
      es.delete_user('test',function(err, results){
        if(err){
          throw err;
        }
        results.should.have.property('affectedRows');
        results.affectedRows.should.be.below(2);
        done();
      });
    });

    it('should create a user', function(done){
      es.find_or_create_user('test', function(err, user){
        user.should.have.property('color');
        user.should.have.property('nickname');
        user.should.have.property('user_id');
        user.user_id.should.eql('test');
        user.color.should.not.be.false;
        done();
      });
    });

    it('should find a user', function(done){
      es.find_or_create_user('test', function(err, user, results){
        user.should.have.property('user_id');
        results.length.should.eql(1);
        done();
      });
    });
  })

  describe('sheets', function(){
    var es = new EtherSheetService(config);
    it('should delete a sheet', function(done){
      es.delete_sheet('test',function(err, results){
        if(err){
          throw err;
        }
        results.should.have.property('affectedRows');
        results.affectedRows.should.be.below(2);
        done();
      });
    });

    it('should create a sheet', function(done){
      es.find_or_create_sheet('test', function(err, sheet){
        if(err){
          throw err;
        }
        sheet.should.have.property('sheetid');
        sheet.should.have.property('sheetdata');
        sheet.sheetid.should.eql('test');
        sheet.sheetdata.should.eql = '';
        done();
      });
    });
    
    it('should find a sheet', function(done){
      es.find_or_create_sheet('test', function(err, sheet, results){
        if(err){
          throw err;
        }
        sheet.should.have.property('sheetid');
        results.length.should.eql(1);
        done();
      });
    });
  })

  describe('adding and removing user from rooms', function(){
    var es = new EtherSheetService(config);
    var test_sheet = '';
    var test_user = '';
    before(function(done){
      es.find_or_create_sheet('test', function(err, sheet){
        test_sheet = sheet;
      });
      es.find_or_create_user('test', function(err, user){
        test_user = user; 
      });
      done();
    })

    it('should add a user to a room', function(){
      EtherSheetService.sheets.should.be.a('object');
      es.add_user_to_room(test_user, test_sheet.sheetid, function(){
        EtherSheetService.sheets.should.have.property(test_sheet.sheetid);
        EtherSheetService.sheets[test_sheet.sheetid].count.should.eql(1);
        EtherSheetService.sheets[test_sheet.sheetid].users.should.have.property(test_user.user_id);
      });
    });

    it('should remove a user from a room', function(){
      es.remove_user_from_room(test_user, test_sheet.sheetid);
      EtherSheetService.sheets.should.not.have.property(test_sheet.sheetid);
    });
  })

})
