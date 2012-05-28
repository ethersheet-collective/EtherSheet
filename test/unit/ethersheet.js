var EtherSheetService = require('../../ethersheet.js').EtherSheetService;
var _ = require('underscore');

describe('EtherSheetService', function(){

  describe('.colors', function(){
    it("should have at least 2 colors", function(){
      EtherSheetService.colors.length.should.be.above(1);
    })

    it("should be an array", function(){
      EtherSheetService.colors.should.be.an.instanceOf(Array);
    })

    it("should get a random color", function(){
      var es = new EtherSheetService();
      var colors = [];
      for(var i=0; i<100; i++){
        colors.push(es.get_random_color());
      }
      _.uniq(colors).length.should.eql(EtherSheetService.colors.length);
       
    })
  })

  describe('.sql', function(){
    it("should have a sql connection", function(){
      EtherSheetService.should.have.property('sql');
      EtherSheetService.sql.should.have.property('query');
    })
  })

  describe('users', function(){
  })

})
