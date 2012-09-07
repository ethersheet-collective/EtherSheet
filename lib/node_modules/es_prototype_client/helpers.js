//This function builds the inline menu to make it easy to interact with each sheet instance
function inlineMenu(I){
  I = (I ? I.length : 0);
  
  //we want to be able to edit the html for the menu to make them multi-instance
  var html = $('#inlineMenu').html().replace(/sheetInstance/g, "$.sheet.instance[" + I + "]");
  
  var menu = $(html);
  
  //The following is just so you get an idea of how to style cells
  menu.find('.colorPickerCell').colorPicker().change(function(){
      $.sheet.instance[I].cellChangeStyle('background-color', $(this).val());
  });
  
  menu.find('.colorPickerFont').colorPicker().change(function(){
      $.sheet.instance[I].cellChangeStyle('color', $(this).val());
  });
  
  menu.find('.colorPickers').children().eq(1).css('background-image', "url('/images/palette.png')");
  menu.find('.colorPickers').children().eq(3).css('background-image', "url('/images/palette_bg.png')");             

  return menu;
}

function goToObj(s){
  $('html, body').animate({
      scrollTop: $(s).offset().top
  }, 'slow');
  return false;
}

var time = { /* time loggin used with this.log, useful for finding out if new methods are faster */
  now: new Date(),
  last: new Date(),
  diff: function() {
    return Math.abs(Math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
  },
  set: function() {
    this.last = this.now;
    this.now = new Date();
  },
  get: function() {
    return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
  }
};

var key = { /* key objects, makes it easier to develop */
  BACKSPACE:      8,
  CAPS_LOCK:      20,
  COMMA:        188,
  CONTROL:      17,
  ALT:        18,
  DELETE:       46,
  DOWN:         40,
  END:        35,
  ENTER:        13,
  ESCAPE:       27,
  HOME:         36,
  INSERT:       45,
  LEFT:         37,
  NUMPAD_ADD:     107,
  NUMPAD_DECIMAL:   110,
  NUMPAD_DIVIDE:    111,
  NUMPAD_ENTER:     108,
  NUMPAD_MULTIPLY:  106,
  NUMPAD_SUBTRACT:  109,
  PAGE_DOWN:      34,
  PAGE_UP:      33,
  PERIOD:       190,
  RIGHT:        39,
  SHIFT:        16,
  SPACE:        32,
  TAB:        9,
  UP:         38,
  F:          70,
  V:          86,
  Y:          89,
  Z:          90
};

var arrHelpers = {
  foldPrepare: function(firstArg, theArguments, unique) { // Computes the best array-like arguments for calling fold().
    var result;
    if (firstArg != null &&
      firstArg instanceof Object &&
      firstArg["length"] != null) {
      result = firstArg;
    } else {
      result = theArguments;
    }
    
    if (unique) {
      result = this.unique(result);
    }
    
    return result;
  },
  fold: function(arr, funcOfTwoArgs, result, castToN, N) {
    for (var i = 0; i < arr.length; i++) {
      result = funcOfTwoArgs(result, (castToN == true ? N(arr[i]): arr[i]));
    }
    return result;
  },
  toNumbers: function(arr) {
    arr = this.flatten(arr);
    
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        arr[i] = jQuery.trim(arr[i]);
        if (isNaN(arr[i])) {
          arr[i] = 0;
        } else {
          arr[i] = arr[i] * 1;
        }
      } else {
        arr[i] = 0;
      }
    }
    
    return arr;
  },
  unique: function(arr) {
    var a = [];
    var l = arr.length;
    for (var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (arr[i] === arr[j])
          j = ++i;
      }
      a.push(arr[i]);
    }
    return a;
  },
  flatten: function(arr) {
    var flat = [];
    for (var i = 0, l = arr.length; i < l; i++){
      var type = Object.prototype.toString.call(arr[i]).split(' ').pop().split(']').shift().toLowerCase();
      if (type) {
        flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? this.flatten(arr[i]) : arr[i]);
      }
    }
    return flat;
  },
  insertAt: function(arr, val, index){
    jQuery(val).each(function(){
      if (index > -1 && index <= arr.length) {
        arr.splice(index, 0, this);
      }
    });
    return arr;
  }
};
