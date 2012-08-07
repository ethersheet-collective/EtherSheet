ES.uid = function() {
  var mime ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var ua = [];
  var r32;
  for(var a = 0; a < 3; a++) {
    r32 = Math.floor(0x100000000 * Math.random());
    for(var b = 0; b < 6; b++) {
      ua.push(mime[r32 & 0x3F]);
      r32 = r32 >>> 6;
    }
  }
  return ua.join('');
};
