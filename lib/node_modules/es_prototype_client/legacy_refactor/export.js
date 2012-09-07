jQuery.extend(ES.prototype,{ /* exports sheets into xml, json, or html formats */
  exportSheet_xml: function (skipCData) {
    var sheetClone = /* jS */ this.sheetDecorateRemove(true);      
    var document = "";
    
    var cdata = ['<![CDATA[',']]>'];
    
    if (skipCData) {
      cdata = ['',''];
    }

    jQuery(sheetClone).each(function() {
      var row = '';
      var table = jQuery(this);
      var colCount = 0;
      var col_widths = '';

      table.find('colgroup').children().each(function (i) {
        col_widths += '<c' + i + '>' + (jQuery(this).attr('width') + '').replace('px', '') + '</c' + i + '>';
      });
      
      var trs = table.find('tr');
      var rowCount = trs.length;
      
      trs.each(function(i){
        var col = '';
        
        var tr = jQuery(this);
        var h = tr.attr('height');
        var height = (h ? h : s.colMargin);
        var tds = tr.find('td');
        colCount = tds.length;
        
        tds.each(function(j){
          var td = jQuery(this);
          var colSpan = td.attr('colspan');
          colSpan = (colSpan > 1 ? colSpan : '');
          
          var formula = td.attr('formula');
          var text = (formula ? formula : td.text());
          var cl = td.attr('class');
          var style = td.attr('style');
            
          //Add to current row
          col += '<c' + j +
            (style ? ' style=\"' + style + '\"' : '') + 
            (cl ? ' class=\"' + cl + '\"' : '') + 
            (colSpan ? ' colspan=\"' + colSpan + '\"' : '') +
          '>' + text + '</c' + j + '>';
        });
        
        row += '<r' + i + ' h=\"' + height + '\">' + col + '</r' + i + '>';
      });

      document += '<document title="' + table.attr('title') + '">' +
            '<metadata>' +
              '<columns>' + colCount + '</columns>' +  //length is 1 based, index is 0 based
              '<rows>' + rowCount + '</rows>' +  //length is 1 based, index is 0 based
              '<col_widths>' + col_widths + '</col_widths>' +
            '</metadata>' +
            '<data>' + row + '</data>' +
          '</document>';
    });

    return '<documents>' + document + '</documents>';
  },
  
  exportSheet_json: function() {
    var sheetClone = /* jS */ this.sheetDecorateRemove(true);
    var documents = []; //documents
    
    jQuery(sheetClone).each(function() {
      var document = {}; //document
      document['metadata'] = {};
      document['data'] = {};
      
      var table = jQuery(this);
      
      var trs = table.find('tr');
      var rowCount = trs.length;
      var colCount = 0;
      var col_widths = '';
      
      trs.each(function(i) {
        var tr = jQuery(this);
        var tds = tr.find('td');
        colCount = tds.length;
        
        document['data']['r' + i] = {};
        document['data']['r' + i]['h'] = tr.attr('height');
        
        tds.each(function(j) {
          var td = jQuery(this);
          var colSpan = td.attr('colspan');
          colSpan = (colSpan > 1 ? colSpan : null);
          var formula = td.attr('formula');

          document['data']['r' + i]['c' + j] = {
            'value': (formula ? formula : td.text()),
            'style': td.attr('style'),
            'colspan': colSpan,
            'cl': td.attr('class')
          };
        });
      });
      document['metadata'] = {
        'columns': colCount, //length is 1 based, index is 0 based
        'rows': rowCount, //length is 1 based, index is 0 based
        'title': table.attr('title'),
        'col_widths': {}
      };
      
      table.find('colgroup').children().each(function(i) {
        document['metadata']['col_widths']['c' + i] = (jQuery(this).attr('width') + '').replace('px', '');
      });
      
      documents.push(document); //append to documents
    });
    return documents;
  },

  exportSheet_html: function() {
    return /* jS */ this.sheetDecorateRemove(true);
  }
});