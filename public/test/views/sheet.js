describe('SheetView', function(){

  var sheet;

  before(function(){
    sheet = new SheetView({
      el: document.getElementById('ethersheet'),
    });
  });

  it('should render a table', function(){
    sheet.render();
    $('#ethersheet table').length.should.not.be.empty;
  });
});
