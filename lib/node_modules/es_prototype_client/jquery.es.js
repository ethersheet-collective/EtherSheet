jQuery.fn.extend({
  disableSelectionSpecial : function() { 
    this.each(function() { 
      this.onselectstart = function() { return false; }; 
      this.unselectable = "on"; 
      jQuery(this).css('-moz-user-select', 'none'); 
    });
    return this;
  },
  getSheet: function() {
    var I = parseInt(jQuery(this).attr('sheetInstance'));
    if (!isNaN(I)) {
      return jQuery.sheet.instance[I];
    }
    return false;
  },
  getCellValue: function(row, col, sheet) {
    var jS = $(this).getSheet();
    sheet = (sheet ? sheet : 0);
    try {
      return jS.spreadsheets[sheet][row][col].value;
    } catch(e) {
      return "";
    }
  }
});