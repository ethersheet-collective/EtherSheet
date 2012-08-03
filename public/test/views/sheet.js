describe('SheetView', function(){

  var sheet;

  before(function(){
    sheet = new ES.SheetView({
      el: document.getElementById('ethersheet'),
      model: new ES.Sheet()
    });
    sheet.render();
  });

  it('should render a table', function(){
    $('#ethersheet table').length.should.not.be.empty;
  });

  it('by default, it should create a blank 20x100 table display', function(){
    $('#ethersheet .table-row').length.should.equal(100);
    $('#ethersheet .table-cell').length.should.equal(2000);
    $('#ethersheet .column-header').length.should.equal(20);
    $('#ethersheet .row-header').length.should.equal(100);
  });
});
