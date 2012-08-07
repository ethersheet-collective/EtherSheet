describe('Sheet', function(){
  var sheet;

  before(function(){
    sheet = new ES.Sheet();
  });

  it('rowCount should get row count', function(){
    sheet.rowCount().should.equal(ES.DEFAULT_ROW_COUNT);
  });
  it('colCount should get column count', function(){
    sheet.colCount().should.equal(ES.DEFAULT_COL_COUNT);
  });
  it('rowIds should return an array of ids', function(){
    var row_ids = sheet.rowIds();
    row_ids.length.should.equal(ES.DEFAULT_ROW_COUNT);
  });
  it('colIds should return an array of ids', function(){
    var col_ids = sheet.colIds();
    col_ids.length.should.equal(ES.DEFAULT_COL_COUNT);
  });
  it('should update cells', function(){
    var row_id = sheet.rowIds()[0];
    var col_id = sheet.colIds()[0];
    var cell_id = sheet.updateCell(row_id,col_id,5);
    sheet.getValue(row_id,col_id).should.equal(5);
  });
  describe('add rows', function(){});
  describe('remove rows', function(){});
  describe('add columns', function(){});
  describe('remove columns', function(){});
});
