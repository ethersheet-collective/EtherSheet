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

Sheet.prototype.commitCell = function(row,col,val,cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    if(!data.cells[row]) data.cells[row] = {};
    data.cells[row][col] = val;
    sheet.db.setCells(sheet.id,data.cells,cb);
  }); 
};

Sheet.prototype.updateCell = function(row,col,val,cb){
  cb(null,row,col,val);
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
