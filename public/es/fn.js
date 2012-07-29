//standard functions used in spreadsheet expressions
jQuery.extend(ES.prototype,{
  VERSION: function() {
    return this.jS.version;
  },
  IMG: function(v) {
    return jQuery('<img />')
      .attr('src', v);
  },
  AVERAGE:  function(values) { 
    var arr = arrHelpers.foldPrepare(values, arguments);
    return this.SUM(arr) / this.COUNT(arr); 
  },
  AVG:    function(values) { 
    return this.AVERAGE(values);
  },
  COUNT:    function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.count, 0); },
  COUNTA:   function() {
    var count = 0;
    var args = arrHelpers.flatten(arguments);
    for (var i = 0; i < args.length; i++) {
      if (args[i]) {
        count++;
      }
    }
    return count;
  },
  SUM:    function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.sum, 0, true, this.N); },
  MAX:    function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.max, Number.MIN_VALUE, true, this.N); },
  MIN:    function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.min, Number.MAX_VALUE, true, this.N); },
  MEAN:   function(values) { return this.SUM(values) / values.length; },
  ABS :     function(v) { return Math.abs(this.N(v)); },
  CEILING:  function(v) { return Math.ceil(this.N(v)); },
  FLOOR:    function(v) { return Math.floor(this.N(v)); },
  INT:    function(v) { return Math.floor(this.N(v)); },
  ROUND:    function(v, decimals) {
    return this.FIXED(v, (decimals ? decimals : 0), false);
  },
  RAND:     function() { return Math.random(); },
  RND:    function() { return Math.random(); },
  TRUE:     function() { return 'TRUE'; },
  FALSE:    function() { return 'FALSE'; },
  NOW:    function() { return new Date ( ); },
  TODAY:    function() { return Date( Math.floor( new Date ( ) ) ); },
  DAYSFROM:   function(year, month, day) { 
    return Math.floor( (new Date() - new Date (year, (month - 1), day)) / 86400000);
  },
  DAYS: function(v1, v2) {
    var date1 = new Date(v1);
    var date2 = new Date(v2);
    var ONE_DAY = 1000 * 60 * 60 * 24;
    return Math.round(Math.abs(date1.getTime() - date2.getTime()) / ONE_DAY);
  },
  DATEVALUE: function(v) {
    var d = new Date(v);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  },
  IF: function(expression, resultTrue, resultFalse){
    //return [expression, resultTrue, resultFalse] + "";
    return (expression ? resultTrue : resultFalse);
  },
  FIXED:    function(v, decimals, noCommas) { 
    if (decimals == null) {
      decimals = 2;
    }
    var x = Math.pow(10, decimals);
    var n = String(Math.round(this.N(v) * x) / x); 
    var p = n.indexOf('.');
    if (p < 0) {
      p = n.length;
      n += '.';
    }
    for (var i = n.length - p - 1; i < decimals; i++) {
      n += '0';
    }
    if (noCommas == true) {// Treats null as false.
      return n;
    }
    var arr = n.replace('-', '').split('.');
    var result = [];
    var first  = true;
    while (arr[0].length > 0) { // LHS of decimal point.
      if (!first) {
        result.unshift(',');
      }
      result.unshift(arr[0].slice(-3));
      arr[0] = arr[0].slice(0, -3);
      first = false;
    }
    if (decimals > 0) {
      result.push('.');
      var first = true;
      while (arr[1].length > 0) { // RHS of decimal point.
        if (!first) {
          result.push(',');
        }
        result.push(arr[1].slice(0, 3));
        arr[1] = arr[1].slice(3);
        first = false;
      }
    }
    if (v < 0) {
      return '-' + result.join('');
    }
    return result.join('');
  },
  TRIM: function(v) { 
    if (typeof(v) == 'string') {
      v = jQuery.trim(v);
    }
    return v;
  },
  HYPERLINK: function(link, name) {
    name = (name ? name : 'LINK');
    return jQuery('<a href="' + link + '" target="_new">' + name + '</a>');
  },
  DOLLAR: function(v, decimals, symbol) { 
    if (decimals == null) {
      decimals = 2;
    }
    
    if (symbol == null) {
      symbol = '$';
    }
    
    var r = this.FIXED(v, decimals, false);
    
    if (v >= 0) {
      this.cell.html = symbol + r;
    } else {
      this.cell.html = '-' + symbol + r.slice(1);
    }
    return v;
  },
  VALUE: function(v) { return parseFloat(v); },
  N: function(v) {
    if (v == null) {return 0;}
    if (v instanceof Date) {return v.getTime();}
    if (typeof(v) == 'object') {v = v.toString();}
    if (typeof(v) == 'string') {v = parseFloat(v.replace(jSE.regEx.n, ''));}
    if (isNaN(v)) {return 0;}
    if (typeof(v) == 'number') {return v;}
    if (v == true) {return 1;}
    return 0;
  },
  PI: function() { return Math.PI; },
  POWER: function(x, y) {
    return Math.pow(x, y);
  },
  SQRT: function(v) {
    return Math.sqrt(v);
  },
  DROPDOWN: function(v, noBlank) {
    v = arrHelpers.foldPrepare(v, arguments, true);
    var cell = this.cell;
    var jS = this.jS;
    
    if (this.s.editable) {
      
      var id = "dropdown" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
      var o = jQuery('<select style="width: 100%;" name="' + id + '" id="' + id + '" />')
        .mousedown(function() {
          jS.cellEdit(jQuery(this).parent(), null, true);
        });
    
      if (!noBlank) {
        o.append('<option value="">Select a value</option>');
      }
    
      for (var i = 0; i < (v.length <= 50 ? v.length : 50); i++) {
        if (v[i]) {
          o.append('<option value="' + v[i] + '">' + v[i] + '</option>');
        }
      }
      
      
      //here we find out if it is on initial calc, if it is, the value we an use to set the dropdown
      if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('#' + id).length == 0) {
        cell.selectedValue = jS.spreadsheets[this.sheet][this.row][this.col].value;
      }
      
      jS.s.origParent.one('calculation', function() {
        jQuery('#' + id)
          .change(function() {
            cell.selectedValue = jQuery(this).val();
            jS.calc();
          });
        jS.attrH.setHeight(jS.getTdLocation(o.parent()).row, 'cell', false);
      });
          
      o.val(cell.selectedValue);
      
      this.cell.html = o;
    }
    return cell.selectedValue;
  },
  RADIO: function(v) {
    v = arrHelpers.foldPrepare(v, arguments, true);
    var cell = this.cell;
    var jS = this.jS;
    
    if (this.s.editable) {
      var id = "radio" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
      
      var o = jQuery('<span />')
        .mousedown(function() {
          jS.cellEdit(jQuery(this).parent());
        });
      
      for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
        if (v[i]) {
          var input = jQuery('<input type="radio" name="' + id + '" class="' + id + '" />')
            .val(v[i]);
          
          if (v[i] == cell.selectedValue) {
            input.attr('checked', 'true');
          }
          
          o
            .append(input)
            .append('<span>' + v[i] + '</span>')
            .append('<br />');
          
          jS.s.origParent.one('calculation', function() {
            jQuery('.' + id)
              .change(function() {
                cell.selectedValue = jQuery(this).val();
                jS.calc();
              });
            jS.attrH.setHeight(jS.getTdLocation(o.parent()).row, 'cell', false);
          });
        }
      }
      
      //here we find out if it is on initial calc, if it is, the value we an use to set the radio
      if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('.' + id).length == 0) {
        cell.selectedValue = jS.spreadsheets[this.sheet][this.row][this.col].value;
      }
      
      this.cell.html = o;
    }
    return cell.selectedValue;
  },
  CHECKBOX: function(v) {
    v = arrHelpers.foldPrepare(v, arguments)[0];
    var cell = this.cell;
    var jS = this.jS;
    
    if (this.s.editable) {
      
      var id = "checkbox" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
      var checkbox = jQuery('<input type="checkbox" name="' + id + '" class="' + id + '" />')
        .val(v);
        
      var o = jQuery('<span />')
        .append(checkbox)
        .append('<span>' + v + '</span><br />')
        .mousedown(function() {
          jS.cellEdit(jQuery(this).parent());
        });
      
      if (v == cell.selectedValue) {
        checkbox.attr('checked', true);
      }
      
      var td = jQuery(jS.getTd(this.sheet, this.row, this.col));
      if (!td.children().length) {
        if (td.text() == cell.selectedValue) {
          checkbox.attr('checked', true);
        }
      }
      
      jS.s.origParent.one('calculation', function() {
        jQuery('.' + id)
          .change(function() {
            cell.selectedValue = (jQuery(this).is(':checked') ? jQuery(this).val() : '');
            jS.calc();
          });
      });
      
      //here we find out if it is on initial calc, if it is, the value we an use to set the checkbox
      if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('.' + id).length == 0) {
        var checked = jS.spreadsheets[this.sheet][this.row][this.col].value;
        cell.selectedValue = (checked == 'true' || checked == true ? v : '');
      }

      this.cell.html = o;
    }
    return cell.selectedValue;
  },
  BARCHART: function(values, legend, title) {
    return jSE.chart.apply(this, [{
      type: 'bar',
      data: values,
      legend: legend,
      title: title
    }]);
  },
  HBARCHART:  function(values, legend, title) {
    return jSE.chart.apply(this, [{
      type: 'hbar',
      data: values,
      legend: legend,
      title: title
    }]);
  },
  LINECHART:  function(valuesX, valuesY) {
    return jSE.chart.apply(this, [{
      type: 'line',
      x: {
        data: valuesX
      },
      y: {
        data: valuesY
      },
      title: ""
    }]);
  },
  PIECHART: function(values, legend, title) {
    return jSE.chart.apply(this, [{
      type: 'pie',
      data: values,
      legend: legend,
      title: title
    }]);
  },
  DOTCHART: function(valuesX, valuesY, values, legendX, legendY, title) {
    return jSE.chart.apply(this, [{
      type: 'dot',
      data: (values ? values : valuesX),
      x: {
        data: valuesX,
        legend: legendX
      },
      y: {
        data: (valuesY ? valuesY : valuesX),
        legend: (legendY ? legendY : legendX)
      },
      title: title
    }]);
  },
  CELLREF: function(v) {
    return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
  },
  CALCTIME: function() {
    var owner = this;
    this.s.origParent.one('calculation', function() {
      jQuery(owner.jS.getTd(owner.sheet, owner.row, owner.col))
        .text(owner.jS.time.diff());
    });
    return "";
  }
});