var _ = require('underscore');
var async = require('async');

var Sheet = module.exports = function(id,db){
  this.id = id;
  this.db = db;
  this._data = null;
}

Sheet.prototype.rowAt = function(index,cb){
  var sheet = this;
  index = Number(index);
  sheet.db.getSheet(this.id,function(err,data){
    if(err) cb(err);
    if(index >= data.rows.length) return cb(new Error("row index out of bounds"));
    cb(null,data.rows[index]);
  });
};

Sheet.prototype.colAt = function(index,cb){
  var sheet = this;
  index = Number(index);
  sheet.db.getSheet(this.id,function(err,data){
    if(err) cb(err);
    if(index >= data.cols.length) return cb(new Error("col index out of bounds"));
    cb(null,data.cols[index]);
  });
};

Sheet.prototype.commitCell = function(row,col,cell,cb){
  this.updateCell(row,col,cell,function(){/*no op*/});
  cb(null,row,col);
};

Sheet.prototype.resizeCell = function(row_id,col_id,width,height,cb){
  var sheet = this;

  function setColWidth(next){
    sheet.setColWidth(col_id,width,next);
  }

  function setRowHeight(next){
    sheet.setRowHeight(row_id,height,next);
  }

  function done(err){
    if(err) throw err;
    cb(null,row_id,col_id,width,height);
  }

  async.parallel(
    [ setColWidth,
      setRowHeight ], 
    done);
};

Sheet.prototype.setColWidth = function(col_id,width,cb){
  if(!_.isNumber(width)) return cb(null);
  var sheet = this;

  sheet.db.getColWidths(sheet.id,function(err,widths){
    if(err) throw err;
    widths = widths || {};
    widths[col_id] = width;
    sheet.db.setColWidths(sheet.id,widths,cb);
  });
};

Sheet.prototype.setRowHeight = function(row_id,height,cb){
  if(!_.isNumber(height)) return cb(null);
  var sheet = this;

  sheet.db.getRowHeights(sheet.id,function(err,heights){
    if(err) throw err;
    heights = heights || {};
    heights[row_id] = height;
    sheet.db.setRowHeights(sheet.id,heights,cb);
  });
};

Sheet.prototype.updateCell = function(row,col,cell,cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    if(!data.cells[row]) data.cells[row] = {};
    data.cells[row][col] = cell;
    sheet.db.setCells(sheet.id,data.cells,cb);
  }); 

};

Sheet.prototype.getValue = function(row,col,cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    if(!data.cells[row]) return cb(null,''); 
    cb(null, data.cells[row][col] || '');
  }); 
};

Sheet.prototype.getSheet = function(id,cb){
  var sheet = this;
  if(sheet._data) return cb(null,this._data);
  sheet.db.getSheet(this.id,function(err,data){
    sheet._data = data;
    cb(null,sheet._data);
  });
};


Sheet.prototype.insertCol = function(position, new_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    data.cols.splice(position,0,new_id);
    sheet.db.setColIndex(sheet.id,data.cols,cb);
  }); 
};

Sheet.prototype.insertRow = function(position, new_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    data.rows.splice(position,0,new_id);
    sheet.db.setRowIndex(sheet.id,data.rows,cb);
  }); 
};


function getCell(cells,row_id,col_id){
  if(!cells[row_id]) return undefined;
  if(_.isUndefined(cells[row_id])) return null;
  if(!cells[row_id][col_id]) return undefined;
  return cells[row_id][col_id] || null;
}

function getCellValue(cells,row_id,col_id){
  var value;
  var cell = getCell(cells,row_id,col_id);

  if(!cell || _.isUndefined(cell) || _.isNull(cell)){
    value = '';
  } else {
    value = cell.value;  
  }

  if(!value || _.isUndefined(value) || _.isNull(value)) value = '';
  return value.toString().trim();
}

Sheet.prototype.sortRows = function(col_id, cb){
  var sheet = this;

  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    var cells = data.cells;
    var rows = data.rows;

    rows.sort(function compareRows(row_a,row_b){
      var value_a = getCellValue(cells,row_a,col_id);
      var value_b = getCellValue(cells,row_b,col_id);
      
      // blanks go last
      if (value_a === "" && value_b === "") return 0;
      if (value_a === "") return 1;
      if (value_b === "") return -1;

      // default sort
      return value_a.localeCompare(value_b);
    });
    
    sheet.db.setRowIndex(sheet.id,rows,function(){
      if(err) throw err;
      cb(null,col_id);
    });
  }); 
};

Sheet.prototype.deleteCol = function(col_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    var col_pos = _.indexOf(data.cols,col_id);
    if(col_pos === -1) return false;
    _.each(data.rows,function(row_id){
      if(data.cells[row_id]){
         delete data.cells[row_id][col_id];
      }   
    }); 
    data.cols.splice(col_pos,1);
    sheet.db.setColIndex(sheet.id,data.cols);
    sheet.db.setCells(sheet.id,data.cells,cb);
  });
};

Sheet.prototype.deleteRow = function(row_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    var row_pos = _.indexOf(data.rows,row_id);
    if(row_pos === -1) return false;
    data.cells[row_id] = {};
    data.rows.splice(row_pos,1);
    sheet.db.setRowIndex(sheet.id,data.rows);
    sheet.db.setCells(sheet.id,data.cells,cb);
  });
};

Sheet.prototype.touchAccessTime = function(cb){
  var sheet = this;
  var curTime = Date.now();

  sheet.db.getMeta(sheet.id, function(err,meta){
    if(!meta){meta = {}}
    meta.lastAccess = curTime;
    sheet.db.setMeta(sheet.id,meta,function(){
      cb(err,curTime);
    });
  });

  return curTime;
}

Sheet.getCellType = function(cell_value){
  if(_.isNumber(cell_value)) return 'number';
  if(cell_value.charAt(0) == '=') return 'formula';
  if(_.isString(cell_value) && _.isNaN(cell_value * 1)) return 'string';
  if(_.isString(cell_value) && _.isFinite(cell_value * 1)) return 'number';
  throw 'Undefined Cell Type ' + cell_value;
};
