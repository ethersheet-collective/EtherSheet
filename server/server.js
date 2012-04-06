/****************************************
 * Initializers, include nesseccary packages
 * and set up constants
 ****************************************/
var es = {};

// includes
var express = require('express');
var io = require('socket.io');
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
var Emitter = require('events').EventEmitter;
var emitter = new Emitter();

// constants
var PORT = 8080

var HTTPS_KEY = './snakeoil.key';
var HTTPS_CERT = './snakeoil.crt';

var MYSQL_DATABASE = 'ethersheet';
var MYSQL_TABLE = 'sheets';
var MYSQL_USER = 'ethersheet';
var MYSQL_PASS = 'ethersheet';
var MYSQL_HOST = 'localhost';

/*************************************************
 * bootstrap https connetctions and mysql connections
 *************************************************/

// PLEASE PLEASE PLEASE deploy this for production with the self
// signed cert.  It would be a REALLY BAD IDEA
var httpsopts = {
  key: fs.readFileSync(HTTPS_KEY),
  cert: fs.readFileSync(HTTPS_CERT)
}
var app = express.createServer(httpsopts)
  , io = io.listen(app);

// bootstrap mysql
es.sql = mysql.createClient({
  user: MYSQL_USER,
  password: MYSQL_PASS,
  host: MYSQL_HOST,
  database: MYSQL_DATABASE,
});

//express settings
app.set('view options', {
    layout: false
});
app.use(express.static(__dirname + '/public'));

/**********************************************
 * routes
 **********************************************/
app.get('/', function(req,res){
  res.render('index.ejs');
});

app.get('/s/:sheetid', function(req,res){
  sheet = es.initialize_sheet(req.params.sheetid);
  emitter.on('sheet_ready', function(){
    res.render('jquery.sheet.ejs');
  });
});

/***********************************************
 * Fire the canons!!
 ***********************************************/
app.listen(PORT, function(){
  console.log('ethersheet is listening over https on port ' + PORT);
});

/***********************************************
 * utitilty functions
 ***********************************************/
  es.initialize_sheet = function(sheet_id){
    es.sql.query('SELECT sheetdata FROM sheets WHERE sheetid = ?', 
                  [sheet_id], 
                  function selectCb(err, results, fields) {
                    if(err) {
                      throw err;
                    }
                    if(results.length > 0){ // a sheet exists
                      //load the data and emit an event
                      es.sheet_data = results[0].sheetdata;
                      console.log(results[0].sheetdata);
                      emitter.emit('sheet_ready');
                    } else {
                      //create a new sheet
                      es.create_sheet(sheet_id);
                    }
                  }
                );

  };
  es.create_sheet = function(sheet_id){
    es.sql.query('INSERT INTO sheets VALUES (?, "{}")',
                 [sheet_id],
                 function selectCb(err, results, fields){
                   if(err) {
                     throw err;
                   }
                    es.sheet_data = {} ;
                    console.log(es.sheet_data);
                    emitter.emit('sheet_ready');
                 }
              );
  };
