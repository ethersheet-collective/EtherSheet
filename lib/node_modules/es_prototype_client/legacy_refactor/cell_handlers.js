ES.cellHandlers = {
  cellValue: function(id) { //Example: A1
    var loc = ES.engine.parseLocation(id);
    return /* jS */ this.updateCellValue(this.sheet, loc.row, loc.col);
  },
  cellRangeValue: function(ids) {//Example: A1:B1
    ids = ids.split(':');
    var start = ES.engine.parseLocation(ids[0]);
    var end = ES.engine.parseLocation(ids[1]);
    var result = [];
    
    for (var i = start.row; i <= end.row; i++) {
      for (var j = start.col; j <= end.col; j++) {
        result.push(/* jS */ this.updateCellValue(this.sheet, i, j));
      }
    }
    return [result];
  },
  fixedCellValue: function(id) {
    return /* jS */ ES.cellHandlers.cellValue.apply(this, [(id + '').replace(/[$]/g, '')]);
  },
  fixedCellRangeValue: function(ids) {
    return /* jS */ ES.cellHandlers.cellRangeValue.apply(this, [(ids + '').replace(/[$]/g, '')]);
  },
  remoteCellValue: function(id) {//Example: SHEET1:A1
    var sheet, loc;
    id = id.replace(ES.engine.regEx.remoteCell, function(ignored1, ignored2, I, col, row) {
      sheet = (I * 1) - 1;
      loc = ES.engine.parseLocation(col + row);
      return ignored1;
    });
    return /* jS */ this.updateCellValue(sheet, loc.row, loc.col);
  },
  remoteCellRangeValue: function(ids) {//Example: SHEET1:A1:B2
    var sheet, start, end;
    ids = ids.replace(ES.engine.regEx.remoteCellRange, function(ignored1, ignored2, I, startCol, startRow, endCol, endRow) {
      sheet = (I * 1) - 1;
      start = ES.engine.parseLocation(startCol + startRow);
      end = ES.engine.parseLocation(endCol + endRow);
      return ignored1;
    });
    
    var result = [];
    
    for (var i = start.row; i <= end.row; i++) {
      for (var j = start.col; j <= end.col; j++) {
        result.push(/* jS */ this.updateCellValue(sheet, i, j));
      }
    }

    return [result];
  },
  callFunction: function(fn, args, cell) {          
    if (!args) {
      args = [''];
    } else if (jQuery.isArray(args)) {
      args = args.reverse();
    } else {
      args = [args];
    }
      
    return (ES.fn[fn] ? ES.fn[fn].apply(cell, args) : "Error: Function Not Found");
  }
};