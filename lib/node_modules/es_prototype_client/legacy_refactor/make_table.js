ES.makeTable = {

  json: function(data, makeEval) { /* creates a sheet from json data, for format see top
                    data: json;
                    makeEval: bool, if true evals json;
                  */
    sheet = (makeEval == true ? eval('(' + data + ')') : data);
    
    var tables = jQuery('<div />');
    
    sheet = (jQuery.isArray(sheet) ? sheet : [sheet]);
    
    for (var i = 0; i < sheet.length; i++) {
      var colCount = parseInt(sheet[i].metadata.columns);
      var rowCount = parseInt(sheet[i].metadata.rows);
      title = sheet[i].metadata.title;
      title = (title ? title : "Spreadsheet " + i);
    
      var table = jQuery("<table />");
      var tableWidth = 0;
      var colgroup = jQuery('<colgroup />').appendTo(table);
      var tbody = jQuery('<tbody />');
      
      //go ahead and make the cols for colgroup
      if (sheet[i]['metadata']['col_widths']) {
        for (var x = 0; x < colCount; x++) {
          var w = 120;
          if (sheet[i]['metadata']['col_widths']['c' + x]) {
            var newW = parseInt(sheet[i]['metadata']['col_widths']['c' + x].replace('px', ''));
            w = (newW ? newW : 120); //if width doesn't exist, grab default
            tableWidth += w;
          }
          colgroup.append('<col width="' + w + 'px" style="width: ' + w + 'px;" />');
        }
      }
      
      table
        .attr('title', title)
        .width(tableWidth);
      
      for (var x = 0; x < rowCount; x++) { //tr
        var tr = jQuery('<tr />').appendTo(table);
        tr.attr('height', (sheet[i]['data']['r' + x].h ? sheet[i]['data']['r' + x].h : 18));
        
        for (var y = 0; y < colCount; y++) { //td
          var cell = sheet[i]['data']['r' + x]['c' + y];
          var cur_val;
          var colSpan;
          var style;
          var cl;
          
          if (cell) {
            cur_val = cell.value + '';
            colSpan = cell.colSpan + '';
            style = cell.style + '';
            cl = cell.cl + '';
          }

          var cur_td = jQuery('<td' + 
              (style ? ' style=\"' + style + '\"' : '' ) + 
              (cl ? ' class=\"' + cl + '\"' : '' ) + 
              (colSpan ? ' colspan=\"' + colSpan + '\"' : '' ) + 
            ' />');
          try {
            if(typeof(cur_val) == "number") {
              cur_td.html(cur_val);
            } else {
              if (cur_val.charAt(0) == '=') {
                cur_td.attr("formula", cur_val);
              } else {
                cur_td.html(cur_val);
              }
            }
          } catch (e) {}
        
          tr.append(cur_td);

        }
      }
      
      tables.append(table);
    }
    return tables.children();
  },
  fromSize: function(size, h, w) { /* creates a spreadsheet object from a size given 
                    size: string, example "10x100" which means 10 columns by 100 rows;
                    h: int, height for each new row;
                    w: int, width of each new column;
                  */
    if (!size) {
      size = "5x10";
    }
    size = size.toLowerCase().split('x');

    var columnsCount = parseInt(size[0]);
    var rowsCount = parseInt(size[1]);
    
    //Create elements before loop to make it faster.
    var newSheet = jQuery('<table />');
    var standardTd = '<td></td>';
    var tds = '';
    
    //Using -- is many times faster than ++
    for (var i = columnsCount; i >= 1; i--) {
      tds += standardTd;
    }

    var standardTr = '<tr' + (h ? ' height="' + h + 'px" style="height: ' + h + 'px;"' : '') + '>' + tds + '</tr>';
    var trs = '';
    for (var i = rowsCount; i >= 1; i--) {
      trs += standardTr;
    }
    
    newSheet.html('<tbody>' + trs + '</tbody>');
    
    if (w) {
      newSheet.width(columnsCount * w);
    }
    
    return newSheet;
  }
};