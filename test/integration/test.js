require('../../app');
var webdriverjs = require("webdriverjs");
var client1 = webdriverjs.remote();
var client2 = webdriverjs.remote();

client1
.testMode()
.init()
.url("https://localhost:8080/s/test",function(){
  client2
  .testMode()
  .init()
  .url("https://localhost:8080/s/test",function(){
    client1.click('#0_table0_cell_c0_r0',function(){
      client2.click('#0_table0_cell_c1_r0');
    })
  })
})
