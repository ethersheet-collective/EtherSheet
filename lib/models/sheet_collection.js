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

SheetCollection.prototype.addSheet = function(sheet, cb){
};

SheetCollection.prototype.removeSheet = function(){
};

SheetCollection.prototype.destroy = function(){
};
  
SheetCollection.prototype.findSheet = function(id,cb){
  this.es.getSheet(id,cb);
};
