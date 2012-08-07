describe('TableView', function(){

  var table;

  before(function(){
    table = new ES.TableView({
      el: document.getElementById('ethersheet'),
      model: new ES.Sheet()
    });
    table.render();
  });

  it('should render a table', function(){
    $('#ethersheet table').length.should.not.be.empty;
  });

  it('by default, it should create a blank 20x100 table display', function(){
    var expected_cell_count = ES.DEFAULT_ROW_COUNT * ES.DEFAULT_COL_COUNT;
    $('#ethersheet .table-cell').length.should.equal(expected_cell_count);
    $('#ethersheet .table-row').length.should.equal(ES.DEFAULT_ROW_COUNT);
    $('#ethersheet .column-header').length.should.equal(ES.DEFAULT_COL_COUNT);
    $("#ethersheet .column-header").last().text().should.equal('T');
    $('#ethersheet .row-header').length.should.equal(ES.DEFAULT_ROW_COUNT)
    $("#ethersheet .row-header").last().text().should.equal('100');
  });
});
