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
  insertRow: function(position){
    var new_id = ES.uid();
    this.rows.splice(position,0,new_id);
    return new_id;
  },
  deleteRow: function(row_id){
    var row_pos = _.indexOf(this.rows,row_id);
    if(row_pos === -1) return false;
    this.cells[row_id] = {};
    this.rows.splice(row_pos,1);
    return true;
  },
  insertCol: function(position){
    var new_id = ES.uid();
    this.cols.splice(position,0,new_id);
    return new_id;
  },
  deleteCol: function(col_id){
    var es = this;
    var col_pos = _.indexOf(this.cols,col_id);
    if(col_pos === -1) return false;
    _.each(this.rows,function(row_id){
      if(es.cells[row_id]){
         delete es.cells[row_id][col_id];
      }
    });
    this.cols.splice(col_pos,1);
    return true;
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
