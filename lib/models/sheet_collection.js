var _ = require('underscore');
var async = require('async');
var Sheet = require('./sheet');
var uuid = require('node-uuid').v4;

var SheetCollection = module.exports = function(id,es,db){
  this.id = id;
  this.es = es;
  this.db = db;
  this._sheet_ids = [];
};

SheetCollection.prototype.find = function(id,cb){
  this.db.get(id + ':sheet_collection', cb);
};

SheetCollection.prototype.create = function(id,cb){
  var sheet_id = uuid();
  var self = this;
  this.es.createSheet(sheet_id, null, function(err,data){
    self.db.set(id + ':sheet_collection', [sheet_id], cb);
  }); 
};

SheetCollection.prototype.findOrCreate = function(id,cb){
  var collection = this;
  collection.find(id,function(err,data){
    if(err) throw err;
    if(!data){
      return collection.create(id,function(err){
        collection.find(id,cb);
      });
    }
    cb(null, data);
  });
};

SheetCollection.prototype.getSheets = function(cb){
  async.map(this._sheet_ids, this.findSheet.bind(this), cb);
};

SheetCollection.prototype.setSheetIds = function(sheet_ids){
  this._sheet_ids = sheet_ids;
  return this;
};

SheetCollection.prototype.addSheet = function(data, cb){
  var self = this;
  self.find(this.id, function(err,sheet_ids){
    sheet_ids.push(data.id);
    self.db.set(self.id + ':sheet_collection', sheet_ids, function(err,data){});
    self.es.createSheet(data.id, data, cb);
  });
};

SheetCollection.prototype.deleteSheet = function(id,cb){
  console.log("delete sheet",id);
  var self = this;
  self.find(this.id, function(err,sheet_ids){
    var idx = sheet_ids.indexOf(id);
    sheet_ids.splice(idx,1);
    self.db.set(self.id + ':sheet_collection', sheet_ids, function(err,data){});
  });
  this.es.deleteSheet(id,cb); 
};

SheetCollection.prototype.renameSheet = function(sheet_id,new_name,cb){
  var self = this;
  self.es.getMeta(sheet_id, function(err,sheet_meta){
    sheet_meta.title = new_name;
    self.es.setMeta(sheet_id,sheet_meta,cb);
  });
};

SheetCollection.prototype.destroy = function(){
};
  
SheetCollection.prototype.findSheet = function(id,cb){
  this.es.getSheet(id,cb);
};
