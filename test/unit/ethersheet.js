var EtherSheetService = require('../../ethersheet.js').EtherSheetService;

describe('EtherSheetService', function(){

  describe('.colors', function(){
    it("should have at least 2 colors", function(){
      EtherSheetService.colors.length.should.be.above(1);
    })

    it("should be an array", function(){
      EtherSheetService.colors.should.be.an.instanceOf(Array);
    })
  })

  describe('.sql', function(){
    it("should have a sql connection", function(){
      EtherSheetService.should.have.property('sql');
      EtherSheetService.sql.should.have.property('query');
    })
  })

})
