ES.Sheet = Backbone.Model.extend({
  initialize: function(){
    this.initializeRows();
    this.initializeCols();
    this.initializeCells();
  },
  initializeRows: function(){
    this.row_count = ES.DEFAULT_ROW_COUNT;
    this.rows = [];
    for(var i = 0; i<this.row_count; i++){
      this.rows.push(ES.uid());
    }
  },
  initializeCols: function(){
    this.col_count = ES.DEFAULT_COL_COUNT;
    this.cols = [];
    for(var i = 0; i<this.col_count; i++){
      this.cols.push(ES.uid());
    }
  },
  initializeCells: function(){
    this.cells = {};
  },
  rowCount: function(){
    return this.row_count;
  },
  colCount: function(){
    return this.col_count;
  },
  rowIds: function(){
    return this.rows; 
  },
  colIds: function(){
    return this.cols; 
  },
  rowExists: function(row_id){
    return _.include(this.rows,row_id);
  },
  colExists: function(col_id){
    return _.include(this.cols,col_id);
  },
  updateCell: function(row_id,col_id,value){
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(!this.cells[row_id]) this.cells[row_id] = {};
    this.cells[row_id][col_id] = value;
    return true;
  },
  getValue: function(row_id,col_id){
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(_.isUndefined(this.cells[row_id])) return null; 
    return this.cells[row_id][col_id] || null;
  }
});
