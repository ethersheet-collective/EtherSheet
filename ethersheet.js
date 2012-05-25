var util = require("util");
var events = require("events");
var mysql = require('mysql');
var config = require('./config');

/***********************************************
 * EtherSheetService
 ***********************************************/
var EtherSheetService = exports.EtherSheetService = function(){
  events.EventEmitter.call(this);
};

// inherits from EventEmitter
util.inherits(EtherSheetService, events.EventEmitter);

// Bootstrap MySQL
EtherSheetService.sql = mysql.createClient({
  user: config.mysql_user,
  password: config.mysql_password,
  host: config.mysql_host,
  database: config.mysql_database
});

// EtherSheet Internal Data
EtherSheetService.sheets = {};
EtherSheetService.default_sheetdata = '[{"metadata":{"columns":5,"rows":15,"title":"","col_widths":{"c0":"120","c1":"120","c2":"120","c3":"120","c4":"120"}},"data":{"r0":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r1":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r2":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r3":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r4":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r5":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r6":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r7":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r8":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r9":{"h":"18px","c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r10":{"c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r11":{"c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r12":{"c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r13":{"c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}},"r14":{"c0":{"value":"","colspan":null,"cl":""},"c1":{"value":"","colspan":null,"cl":""},"c2":{"value":"","colspan":null,"cl":""},"c3":{"value":"","colspan":null,"cl":""},"c4":{"value":"","colspan":null,"cl":""}}}}]';
EtherSheetService.colors = [
  '#1BA5E0',
  '#0EF012',
  '#F283F0',
  '#DFF25E',
  '#FAA166',
  '#FC3F52'
];

// EtherSheet API
EtherSheetService.prototype.find_or_create_user = function(user_id, callback){
  var es = this;
  EtherSheetService.sql.query(
    'SELECT * FROM users WHERE token = ?', 
    [user_id], 
    function(err, results, fields) {
      if(err) {
        throw err;
      }
      if(results.length > 0){ //  user exists
        callback(results[0]);
      } else {
        EtherSheetService.sql.query(
          'INSERT INTO users (token, color) VALUES (?, ?)',
          [user_id, es.get_color()],
          function(err, results, fields){
            if(err) {
              throw err;
            } else {
              es.find_or_create_user(user_id, callback);
            }
          }
        );
      }
    }
  );
}

EtherSheetService.prototype.add_user_to_room = function(user, sheet_id, cb){
  EtherSheetService.sheets[sheet_id] = EtherSheetService.sheets[sheet_id] || {count:0, users:{}};
  EtherSheetService.sheets[sheet_id].count++;
  EtherSheetService.sheets[sheet_id].users[user.user_id] = user;
  console.log('user ' + user.token + ' joined room ' + sheet_id);
  cb(null);
};

EtherSheetService.prototype.remove_user_from_room = function(user){
  EtherSheetService.sheets[user.sheet_id].count--;
  delete(EtherSheetService.sheets[user.sheet_id].users[user.user_id]);
}

EtherSheetService.prototype.get_color = function(){
  idx = Math.floor(Math.random() * 100);  
  return EtherSheetService.colors[idx % EtherSheetService.colors.length]
};

EtherSheetService.prototype.save_sheet = function(sheet_id, sheet_data){
  EtherSheetService.sql.query(
    'UPDATE sheets SET sheetdata = ? WHERE sheetid = ?', [sheet_data, sheet_id],
    function(err, results, fields){
      if(err){
        console.log('ERROR: ' + err);
      }
    }
  );
};

EtherSheetService.prototype.find_or_create_sheet = function(sheet_id,cb){
  var es = this;
  EtherSheetService.sql.query(
    'SELECT * FROM sheets WHERE sheetid = ?', 
    [sheet_id], 
    function(err, results, fields) {
      if(err) {
        throw err;
      }
      if(results.length > 0){ // a sheet exists
        //load the data and emit an event
        EtherSheetService.sheet_data = results[0];
        cb(results[0]);
      } else {
        //create a new sheet
        es.create_sheet(sheet_id,cb);
      }
    }
  );
};

EtherSheetService.prototype.create_sheet = function(sheet_id,cb){
  var es = this;
  EtherSheetService.sql.query(
    'INSERT INTO sheets VALUES (?, ?)',
    [sheet_id, EtherSheetService.default_sheetdata],
    function(err, results, fields){
      if(err) {
        throw err;
      }
      EtherSheetService.sheet_data = {sheetid: sheet_id, sheetdata: EtherSheetService.default_sheetdata} ;
      cb(EtherSheetService.sheet_data);
    }
  );
}; 
