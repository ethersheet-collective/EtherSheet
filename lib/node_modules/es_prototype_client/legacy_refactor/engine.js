/**********************************
 * Socket Methods
 * These will be called based on socket messages coming in.
 * *******************************/
ES.engine = { //Calculations Engine
  calc: function(tableI, spreadsheets, ignite, freshCalc) { //spreadsheets are array, [spreadsheet][row][cell], like A1 = o[0][0][0];
    for (var j = 0; j < spreadsheets.length; j++) {
      for (var k = 0; k < spreadsheets[j].length; k++) {
        spreadsheets[j][k].calcCount = 0;
      }
    }
    
    for (var j = 0; j < spreadsheets.length; j++) {
      for (var k = 0; k < spreadsheets[j].length; k++) {
        ignite(tableI, j, k);
      }
    }
  },
  parseLocation: function(locStr) { // With input of "A1", "B4", "F20", will return {row: 0,col: 0}, {row: 3,col: 1}, {row: 19,col: 5}.
    for (var firstNum = 0; firstNum < locStr.length; firstNum++) {
      if (locStr.charCodeAt(firstNum) <= 57) {// 57 == '9'
        break;
      }
    }
    return {
      row: parseInt(locStr.substring(firstNum)) - 1, 
      col: this.columnLabelIndex(locStr.substring(0, firstNum))
    };
  },
  parseCellName: function(col, row){
    return ES.engine.columnLabelString(col) + (row + 1);
  },
  columnLabelIndex: function(str) {
    // Converts A to 0, B to 1, Z to 25, AA to 26.
    var num = 0;
    for (var i = 0; i < str.length; i++) {
      var digit = str.toUpperCase().charCodeAt(i) - 65;    // 65 == 'A'.
      num = (num * 26) + digit;
    }
    return (num >= 0 ? num : 0);
  },
  columnLabelString: function(index) {//0 = A, 1 = B
    var b = (index).toString(26).toUpperCase();   // Radix is 26.
    var c = [];
    for (var i = 0; i < b.length; i++) {
      var x = b.charCodeAt(i);
      if (i <= 0 && b.length > 1) {          // Leftmost digit is special, where 1 is A.
        x = x - 1;
      }
      if (x <= 57) {                  // x <= '9'.
        c.push(String.fromCharCode(x - 48 + 65)); // x - '0' + 'A'.
      } else {
        c.push(String.fromCharCode(x + 10));
      }
    }
    return c.join("");
  },
  cFN: {//cFN = compiler functions, usually mathmatical
    sum:  function(x, y) { return x + y; },
    max:  function(x, y) { return x > y ? x: y; },
    min:  function(x, y) { return x < y ? x: y; },
    count:  function(x, y) { return (y != null) ? x + 1: x; },
    divide: function(x, y) { return x / y; },
    clean: function(v) {
      if (typeof(v) == 'string') {
        v = v.replace(ES.engine.regEx.amp, '&')
          .replace(ES.engine.regEx.nbsp, ' ')
          .replace(/\n/g,'')
          .replace(/\r/g,'');
      }
      return v;
    },
    sanitize: function(v) {
      if (v) {
        if (isNaN(v)) {
          return v;
        } else {
          return v * 1;
        }
      }
      return "";
    }
  },
  regEx: {
    n:      /[\$,\s]/g,
    cell:       /\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1
    range:      /\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1:a4
    remoteCell:   /\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1
    remoteCellRange:  /\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1:b4
    sheet:      /SHEET/i,
    amp:      /&/g,
    gt:       /</g,
    lt:       />/g,
    nbsp:       /&nbsp;/g
  },
  str: {
    amp:  '&amp;',
    lt:   '&lt;',
    gt:   '&gt;',
    nbsp:   '&nbps;'
  },
  chart: function(o) { /* creates a chart for use inside of a cell
                          piggybacks RaphealJS
              options:
                type

                data
                legend
                title
                x {data, legend}

                y {data, legend}
                owner
                        */
    var jS = this.jS;
    var owner = this;
    
    function sanitize(v, toNum) {
      if (!v) {
        if (toNum) {
          v = 0;
        } else {
          v = "";
        }
      } else {
        if (toNum) {
          v = arrHelpers.toNumbers(v);
        } else {
          v = arrHelpers.flatten(v);
        }
      }
      return v;
    }
    
    o = jQuery.extend({
      x: { legend: "", data: [0]},
      y: { legend: "", data: [0]},
      title: "",
      data: [0],
      legend: "",
      chart: jQuery('<div class="' + ES.cl.chart + '" />')
        .mousedown(function() {
          jQuery(this).parent().mousedown();
        })
        .mousemove(function() {
          jQuery(this).parent().mousemove();
          return false;
        })
    }, o);
  
    o.data = sanitize(o.data, true);
    o.x.data = sanitize(o.x.data, true);
    o.y.data = sanitize(o.y.data, true);
    o.legend = sanitize(o.legend);
    o.x.legend = sanitize(o.x.legend);
    o.y.legend = sanitize(o.y.legend);
  
    o.legend = (o.legend ? o.legend : o.data);

    this.s.origParent.one('calculation', function() {
      var width = o.chart.width();
      var height = o.chart.height();
      var r = Raphael(o.chart[0]);
      if (r.g) {
        if (o.title) r.g.text(width / 2, 10, o.title).attr({"font-size": 20});
        switch (o.type) {
        case "bar":
          r.g.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
            .hover(function () {
              this.flag = r.g.popup(
                this.bar.x,
                this.bar.y,
                this.bar.value || "0"
              ).insertBefore(this);
            },function () {
              this.flag.animate({
                opacity: 0
                },300, 

                function () {
                  this.remove();
                  }
                );
              });
          break;
        case "hbar":
          r.g.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
            .hover(function () {
              this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
            },function () {
              this.flag.animate({
                opacity: 0
                },300, 
                function () {
                  this.remove();
                  }
                );
              });
          break;
        case "line":
          r.g.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
            nostroke: false, 
            axis: "0 0 1 1", 
            symbol: "o", 
            smooth: true
          })
          .hoverColumn(function () {
            this.tags = r.set();
            try {
              for (var i = 0; i < this.y.length; i++) {
                this.tags.push(r.g.tag(this.x, this.y[i], this.values[i], 0, 10).insertBefore(this).attr([{
                  fill: "#fff"
                }, {
                  fill: this.symbols[i].attr("fill")
                }]));
              }
            } catch (e) {}
          }, function () {
            this.tags && this.tags.remove();
          });
      
          break;
        case "pie":
          var pie = r.g.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend: o.legend})
            .hover(function () {
              this.sector.stop();
              this.sector.scale(1.1, 1.1, this.cx, this.cy);
              if (this.label) {
                this.label[0].stop();
                this.label[0].scale(1.5);
                this.label[1].attr({"font-weight": 800});
              }
            }, function () {
              this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
              if (this.label) {
                this.label[0].animate({scale: 1}, 500, "bounce");
                this.label[1].attr({"font-weight": 400});
              }
            });
          break;
        case "dot":
          r.g.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
            symbol: "o", 
            max: 10, 
            heat: true, 
            axis: "0 0 1 1", 
            axisxstep: o.x.data.length - 1, 
            axisystep: o.y.data.length - 1, 
            axisxlabels: (o.x.legend ? o.x.legend : o.x.data),
            axisylabels: (o.y.legend ? o.y.legend : o.y.data),
            axisxtype: " ", 
            axisytype: " "
          })
            .hover(function () {
              this.tag = this.tag || r.g.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
              this.tag.show();
            }, function () {
              this.tag && this.tag.hide();
            });
          break;
        }
      
        jS.attrH.setHeight(owner.row, 'cell', false);
      }
    });
    
    return o.chart;
  }
};