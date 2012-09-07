// bullshit we are removing later
var I = 0;

var ES = function(s){
  var es = this;
  if(!s.el) throw 'el is required';
  var $el = $(s.el);
  s.parent = $el;
  s = jQuery.extend({
        urlGet:       "sheets/enduser.documentation.html", //local url, if you want to get a sheet from a url
        urlSave:      "save.html",          //local url, for use only with the default save for sheet
        editable:       true,               //bool, Makes the jSheetControls_formula & jSheetControls_fx appear
        editableTabs:   true,             //bool, If sheet is editable, this allows users to change the tabs by second click
        barMenus:     true,             //bool, if sheet is editable, this will show the mini menu in barTop and barLeft for sheet manipulation
        socket: null, //object, websocket connection
        freezableCells:   false,              //bool, if sheet is editable, this will show the barHandles and allow user to drag them to freeze cells, not yet working.
        allowToggleState:   true,             //allows the function that changes the spreadsheet's state from static to editable and back
        urlMenu:      "/menu.html",           //local url, for the menu to the left of title
        menu:     '',             //menu AS STRING!, overrides urlMenu
        newColumnWidth:   120,              //int, the width of new columns or columns that have no width assigned
        title:        null,               //html, general title of the sheet group
        inlineMenu:     null,               //html, menu for editing sheet
        buildSheet:     false,              //bool, string, or object
                                    //bool true - build sheet inside of parent
                                    //bool false - use urlGet from local url
                                    //string  - '{number_of_cols}x{number_of_rows} (5x100)
                                    //object - table
        calcOff:      false,              //bool, turns calculationEngine off (no spreadsheet, just grid)
        log:        false,              //bool, turns some debugging logs on (/* jS */ this.log('msg'))
        lockFormulas:     false,              //bool, turns the ability to edit any formula off
        parent:       parent,           //object, sheet's parent, DON'T CHANGE
        colMargin:      18,               //int, the height and the width of all bar items, and new rows
        fnSave: function() { $el.getSheet().saveSheet(); }, //fn, default save function, more of a proof of concept
        fnOpen: function() {          //fn, by default allows you to paste table html into a javascript prompt for you to see what it looks likes if you where to use sheet
          var t = prompt('Paste your table html here');
          if (t) {
            $el.getSheet().openSheet(t);
          }
        },
        fnClose:      function() {},          //fn, default clase function, more of a proof of concept
        
        boxModelCorrection: 2,                //int, attempts to correct the differences found in heights and widths of different browsers, if you mess with this, get ready for the must upsetting and delacate js ever
        calculations:   {},               //object, used to extend the standard functions that come with sheet
        cellSelectModel:  'excel',            //string, 'excel' || 'oo' || 'gdocs' Excel sets the first cell onmousedown active, openoffice sets the last, now you can choose how you want it to be ;)
        autoAddCells:   true,             //bool, when user presses enter on the last row/col, this will allow them to add more cells, thus improving performance and optimizing modification speed
        resizable:      true,             //bool, makes the $(obj).sheet(); object resizeable, also adds a resizable formula textarea at top of sheet
        autoFiller:     false,              //bool, the little guy that hangs out to the bottom right of a selected cell, users can click and drag the value to other cells
        minSize:      {rows: 15, cols: 5},      //object - {rows: int, cols: int}, Makes the sheet stay at a certain size when loaded in edit mode, to make modification more productive
        forceColWidthsOnStartup:true,           //bool, makes cell widths load from pre-made colgroup/col objects, use this if you plan on making the col items, makes widths more stable on startup
        alertFormulaErrors: false
      }, s);
  this.s = s;
  this.version = '2.0.x trunk';
  this.i = 0;
  this.sheetCount = 0;
  this.spreadsheets = []; //the actual spreadsheets are going to be populated here
  this.autoFillerNotGroup = true;
  this.sizeSync = {}; /* future location of all deminsion sync/mods */
  this.nav = false;
  this.readOnly = [];
  this.busy = false;
  this.colLast = 0; /* the most recent used column */
  this.rowLast = 0; /* the most recent used row */
  this.cellLast = { /* the most recent used cell */
    td: jQuery('<td />'), //this is a dud td, so that we don't get errors
    row: -1,
    col: -1,
    isEdit: false
  }; 
  /* the most recent highlighted cells */
  this.highlightedLast = {
    td: jQuery('<td />'),
    rowStart: -1,
    colStart: -1,
    rowEnd: -1,
    colEnd: -1
  };
  this.callStack = 0;
  this.context = {};
  this.calcLast = 0;
  this.isRowHeightSync = [];
  this.EMPTY_VALUE = {};
  this.isDirty =  false;
  this.barMouseDown_first = 0;
  this.barMouseDown_last = 0;
  this.obj = {//obj = object references
    //Please note, class references use the tag name because it's about 4 times faster
    autoFiller:     function() { return jQuery('#' + ES.id.autoFiller + /* jS */ es.i); },
    barCorner:      function() { return jQuery('#' + ES.id.barCorner + /* jS */ es.i); },
    barCornerAll:   function() { return es.s.parent.find('div.' + ES.cl.barCorner); },
    barCornerParent:  function() { return jQuery('#' + ES.id.barCornerParent + /* jS */ es.i); },
    barCornerParentAll: function() { return es.s.parent.find('td.' + ES.cl.barCornerParent); },
    barHelper:      function() { return jQuery('div.' + ES.cl.barHelper); },
    barLeft:      function() { return jQuery('#' + ES.id.barLeft + /* jS */ es.i); },
    barLeftAll:     function() { return es.s.parent.find('div.' + ES.cl.barLeft); },
    barLeftParent:    function() { return jQuery('#' + ES.id.barLeftParent + /* jS */ es.i); },
    barLeftParentAll: function() { return es.s.parent.find('div.' + ES.cl.barLeftParent); },
    barLeftHandle:    function() { return jQuery('#' + ES.id.barLeftHandle); },
    barLeftMenu:    function() { return jQuery('#' + ES.id.barLeftMenu); },
    barTop:       function() { return jQuery('#' + ES.id.barTop + /* jS */ es.i); },
    barTopAll:      function() { return es.s.parent.find('div.' + ES.cl.barTop); },
    barTopParent:     function() { return jQuery('#' + ES.id.barTopParent + /* jS */ es.i); },
    barTopParentAll:  function() { return es.s.parent.find('div.' + ES.cl.barTopParent); },
    barTopHandle:   function() { return jQuery('#' + ES.id.barTopHandle); },
    barTopMenuParent: function() { return jQuery('#' + ES.id.barTopMenuParent); },
    barTopMenu:     function() { return jQuery('#' + ES.id.barTopMenu); },
    cellActive:     function() { return jQuery(/* jS */ es.cellLast.td); },
    cellMenu:     function() { return jQuery('#' + ES.id.cellMenu); },
    cellHighlighted:  function() { return jQuery(/* jS */ es.highlightedLast.td); },
    chart:        function() { return jQuery('div.' + ES.cl.chart); },
    controls:     function() { return jQuery('#' + ES.id.controls); },
    formula:      function() { return jQuery('#' + ES.id.formula); },
    fullScreen:     function() { return jQuery('div.' + ES.cl.fullScreen); },
    inlineMenu:     function() { return jQuery('#' + ES.id.inlineMenu); },
    inPlaceEdit:    function() { return jQuery('#' + ES.id.inPlaceEdit); },
    label:        function() { return jQuery('#' + ES.id.label); },
    menu:       function() { return jQuery('#' + ES.id.menu); },
    pane:         function() { return jQuery('#' + ES.id.pane + /* jS */ es.i); },
    paneAll:      function() { return es.s.parent.find('div.' + ES.cl.pane); },
    parent:       function() { return es.s.parent; },
    sheet:        function() { return jQuery('#' + ES.id.sheet + /* jS */ es.i); },
    sheetAll:       function() { return es.s.parent.find('table.' + ES.cl.sheet); },
    tab:        function() { return jQuery('#' + ES.id.tab + /* jS */ es.i); },
    tabAll:       function() { return this.tabContainer().find('a.' + ES.cl.tab); },
    tabContainer:   function() { return jQuery('#' + ES.id.tabContainer); },
    tableBody:      function() { return document.getElementById(ES.id.sheet + /* jS */ es.i); },
    tableControl:   function() { return jQuery('#' + ES.id.tableControl + /* jS */ es.i); },
    tableControlAll:  function() { return es.s.parent.find('table.' + ES.cl.tableControl); },
    title:        function() { return jQuery('#' + ES.id.title); },
    ui:         function() { return jQuery('#' + ES.id.ui); },
    uiActive:     function() { return es.s.parent.find('div.' + ES.cl.uiActive); }
  };

  this.$window = jQuery(window);
  
  var emptyFN = function() {};
  
  //ready the sheet's parser
  var es_lexer = function() {};
  es_lexer.prototype = parser.lexer;

  var es_parser = function() {
    this.lexer = new es_lexer();
    this.yy = {};
  };
  es_parser.prototype = parser;
  
  this.Parser = new es_parser;
  
  if (this.s.buildSheet) {//override urlGet, this has some effect on how the topbar is sized
    if (typeof(this.s.buildSheet) == 'object') {
      o = this.s.buildSheet;
    } else if (this.s.buildSheet == true || this.s.buildSheet == 'true') {
      o = jQuery(this.s.parent.html());
    } else if (this.s.buildSheet.match(/x/i)) {
      o = ES.makeTable.fromSize(this.s.buildSheet);
    }
  }
  
  //We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
  //jQuery(this).html(this.s.loading);
  // this.s.this.s.parent = this.s.parent;
  this.s.parent
    .html('')
    .addClass(ES.cl.parent);
  
  this.s.parent
    .bind('switchSpreadsheet', function(e, js, i){
      /* jS */ es.switchSpreadsheet(i);
    })
    .bind('renameSpreadsheet', function(e, js, i){
      /* jS */ es.renameSpreadsheet(i);
    });
  
  //Use the setting height/width if they are there, otherwise use parent's
  this.s.width = (this.s.width ? this.s.width : this.s.parent.width());
  this.s.height = (this.s.height ? this.s.height : this.s.parent.height());
  
  
  // Drop functions if they are not needed & save time in recursion
  if (!this.s.log) {
    /* jS */ this.log = emptyFN;
  }
  
  if (!jQuery.ui || !this.s.resizable) {
    /* jS */ this.resizable = /* jS */ this.draggable = emptyFN;
  }
  
  if (!jQuery.support.boxModel) {
    this.s.boxModelCorrection = 0;
  }
  
  if (!jQuery.scrollTo) {
    /* jS */ this.followMe = emptyFN;
  }
  
  if (!this.s.barMenus) {
    /* jS */ this.barTopMenu = /* jS */ this.barLeftMenu = emptyFN;
  }
  
  if (!this.s.freezableCells) { //this feature does not yet work
    /* jS */ this.barTopHandle = /* jS */ this.barLeftHandle = emptyFN;
  }
  
  if (this.s.calcOff) {
    /* jS */ this.calc = emptyFN;
  }
  
  if (!Raphael) {
    ES.engine.chart = emptyFN;
  }
  
  ///* jS */ this.log('Startup');
  
  this.$window
    .resize(function() {
      if (jS) { //We check because jS might have been killed
        this.s.width = this.s.parent.width();
        this.s.height = this.s.parent.height();
        /* jS */ es.sheetSyncSize();
      }
    });
  
  
  if (ES.fn) { //If the new calculations engine is alive, fill it too, we will remove above when no longer needed.
    //Extend the calculation engine plugins
    ES.fn = jQuery.extend(ES.fn, this.s.calculations);
  
    //Extend the calculation engine with advanced functions
    if (ES.advancedfn) {
      ES.fn = jQuery.extend(ES.fn, ES.advancedfn);
    }
  
    //Extend the calculation engine with finance functions
    if (ES.financefn) {
      ES.fn = jQuery.extend(ES.fn, ES.financefn);
    }
  }
  
  if (!this.s.alertFormulaErrors) {
    /* jS */ this.alertFormulaError = emptyFN;
  }
  
  /* jS */ this.openSheet(o, this.s.forceColWidthsOnStartup);
};

/*
ES.createInstance = function(s, I, this.s.parent) { //s = ES settings, I = ES Instance Integer

  this.s.socket.on('message', function(data){
    ES.jSS[data.action](data.args); 
  });

}
*/

jQuery.extend(ES.prototype,{
    
  kill: function() { /* For ajax manipulation, kills this instance of sheet entirley */
    /* jS */ this.obj.tabContainer().remove();
    /* jS */ this.obj.fullScreen().remove();
    /* jS */ this.obj.inPlaceEdit().remove();
    this.s.parent
      .removeClass(ES.cl.uiParent)
      .html('')
      .removeAttr('sheetInstance');
    cE = s = ES.instance[I] = jS = null;
    delete cE;
    delete s;
    delete ES.instance[I];
    delete jS;
  },
  trigger: function(eventType, extraParameters) {
    //wrapper for jQuery trigger of this.s.parent, in case of further mods in the future
    extraParameters = (extraParameters ? extraParameters : []);

    this.s.parent.trigger(eventType, [this].concat(extraParameters));
  },
  spreadsheetsToArray: function(forceRebuild) {
    if (forceRebuild || /* jS */ this.spreadsheets.length == 0) {
      /* jS */ this.cycleCellsAll(function(sheet, row, col) {
        var td = jQuery(this);
        /* jS */ this.createCell(sheet, row, col, td.text(), td.attr('formula'));
      });
    }
    return /* jS */ this.spreadsheets;
  },
  spreadsheetToArray: function(forceRebuild, i) {
    i = (i ? i : /* jS */ this.i);
    if (forceRebuild || !/* jS */ this.spreadsheets[i]) {
      /* jS */ this.cycleCells(function(sheet, row, col) {
        var td = jQuery(this);
        /* jS */ this.createCell(sheet, row, col, td.text(), td.attr('formula'));
      });
    }
  },
  createCell: function(sheet, row, col, value, formula, calcCount, calcLast) {
    if (!/* jS */ this.spreadsheets[sheet]) /* jS */ this.spreadsheets[sheet] = [];
    if (!/* jS */ this.spreadsheets[sheet][row]) /* jS */ this.spreadsheets[sheet][row] = [];
    

    /* jS */ this.spreadsheets[sheet][row][col] = {
      formula: formula,
      value: value,
      calcCount: (calcCount ? calcCount : 0),
      calcLast: (calcLast ? calcLast : -1)
    };
    
    return /* jS */ this.spreadsheets[sheet][row][col];
  },

  setNav: function(nav) {
    jQuery(ES.instance).each(function() {
      this.nav = false;
    });
  
    /* jS */ this.nav = nav;
  },
  
  updateCellsAfterPasteToFormula: function(oldVal) { /* oldVal is what formula should be when this is done working with all the values */
    var newValCount = 0;
    var formula = /* jS */ this.obj.formula();
    
    oldVal = (oldVal ? oldVal : formula.val());
    
    var loc = {row: /* jS */ this.cellLast.row,col: /* jS */ this.cellLast.col};                
    var val = formula.val(); //once ctrl+v is hit formula now has the data we need
    var firstValue = val;

    if (loc.row == -1 && loc.col == -1) return false; //at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor

    var tdsBefore = jQuery('<div />');
    var tdsAfter = jQuery('<div />');

    var row = val.split(/\n/g); //break at rows

    for (var i = 0; i < row.length; i++) {
      var col = row[i].split(/\t/g); //break at columns
      for (var j = 0; j < col.length; j++) {
        newValCount++;
        var td = jQuery(/* jS */ this.getTd(/* jS */ this.i, i + loc.row, j + loc.col));

        if (td.length) {
          var cell = /* jS */ this.spreadsheets[/* jS */ this.i][i + loc.row][j + loc.col];
          tdsBefore.append(td.clone());
    
          if ((col[j] + '').charAt(0) == '=') { //we need to know if it's a formula here
            cell.formula = col[j];
            td.attr('formula', col[j]);
          } else {
            cell.formula = null;
            cell.value = col[j];
      
            td
              .html(col[j])
              .removeAttr('formula');
          }
    
          tdsAfter.append(td.clone());
    
          if (i == 0 && j == 0) { //we have to finish the current edit
            firstValue = col[j];
          }
        }
      }
    }
    
    if (val != firstValue) {
      formula.val(firstValue);
    }
    
    /* jS */ /*undoable */ this.add(tdsBefore.children());
    /* jS */ this.fillUpOrDown(false, false, firstValue);
    /* jS */ /*undoable */ this.add(tdsAfter.children());

    /* jS */ this.setDirty(true);
    /* jS */ this.cellEditDoneHandler(true);
  },
  
  isTd: function(o) { /* ensures the the object selected is actually a td that is in a sheet
              o: object, cell object;
            */
    o = (o[0] ? o[0] : [o]);
    if (o[0]) {
      if (!isNaN(o[0].cellIndex)) { 
        return true;
      }
    }
    return false;
  },
  
  isSheetEditable: function(i) {
    i = (i == null ? /* jS */ this.i : i);
    return (
      this.s.editable == true && /* jS */ !this.readOnly[i]
    );
  },
  isFormulaEditable: function(o) { /* ensures that formula attribute of an object is editable
                      o: object, td object being used as cell
                  */
    if (this.s.lockFormulas) {
      if(o.attr('formula') !== undefined) {
        return false;
      }
    }
    return true;
  },
  toggleFullScreen: function() { /* toggles full screen mode */
    if (/* jS */ this.obj.fullScreen().is(':visible')) { //here we remove full screen
      jQuery('body').removeClass('bodyNoScroll');
      this.s.parent = this.s.parent;
      
      var w = this.s.parent.width();
      var h = this.s.parent.height();
      this.s.width = w;
      this.s.height = h;
      
      /* jS */ this.obj.tabContainer().insertAfter(
        this.s.parent.append(/* jS */ this.obj.fullScreen().children())
      ).removeClass(ES.cl.tabContainerFullScreen);
      
      /* jS */ this.obj.fullScreen().remove();
      
      /* jS */ this.sheetSyncSize();
    } else { //here we make a full screen
      jQuery('body').addClass('bodyNoScroll');
      
      var w = this.$window.width() - 15;
      var h = this.$window.height() - 35;
      
      
      this.s.width = w;
      this.s.height = h;
      
      /* jS */ this.obj.tabContainer().insertAfter(
        jQuery('<div class="' + ES.cl.fullScreen + ' ' + ES.cl.uiFullScreen + '" />')
          .append(this.s.parent.children())
          .appendTo('body')
      ).addClass(ES.cl.tabContainerFullScreen);
      
      this.s.parent = /* jS */ this.obj.fullScreen();
      
      /* jS */ this.sheetSyncSize();
    }
  },
  renameSpreadsheet: function(i) {
    if (isNaN(i)) return false;
    
    if (i > -1)
      /* jS */ this.sheetTab();
  },
  switchSpreadsheet: function(i) {
    if (isNaN(i)) return false;
    
    if (i == -1) {
      /* jS */ this.addSheet('5x10');
    } else if (i != /* jS */ this.i) {
      /* jS */ this.setActiveSheet(i);
      /* jS */ this.calc(i);
    }
    
    /* jS */ this.trigger('switchSheet', [i]);
    return false;
  },
  tuneTableForSheetUse: function(o) { /* makes table object usable by sheet
                      o: object, table object;
                    */
    o
      .addClass(ES.cl.sheet)
      .attr('id', ES.id.sheet + /* jS */ this.i)
      .attr('border', '1px')
      .attr('cellpadding', '0')
      .attr('cellspacing', '0');
      
    o.find('td.' + ES.cl.cellActive).removeClass(ES.cl.cellActive);
    
    return o;
  },
  
  setTdIds: function(sheet, i) { /* cycles through all the td in a sheet and sets their id & virtual spreadsheet so it can be quickly referenced later
                sheet: object, table object;
                i: integer, sheet index
              */
    var es = this;
    if (!o || !sheet) {
      sheet = /* jS */ this.obj.sheet();
      i = /* jS */ this.i;
    }
    
    /* jS */ this.spreadsheets[i] = []; //reset the sheet's spreadsheet
    
    sheet.find('tr').each(function(row) {
      jQuery(this).children().each(function(col) {
        var td = jQuery(this).attr('id', /* jS */ es.getTdId(i, row, col));
        /* jS */ es.createCell(i, row, col, td.text(), td.attr('formula'));
      });
    });
  },

  setControlIds: function() { /* resets the control ids, useful for when adding new sheets/controls between sheets/controls :) */
    var resetIds = function(o, id) {
      o.each(function(i) {
        jQuery(this).attr('id', id + i);
      });
    };
    
    resetIds(/* jS */ this.obj.sheetAll().each(function(i) {
      /* jS */ this.setTdIds(jQuery(this), i);
    }), ES.id.sheet);
    
    resetIds(/* jS */ this.obj.barTopAll(), ES.id.barTop);
    resetIds(/* jS */ this.obj.barTopParentAll(), ES.id.barTopParent);
    resetIds(/* jS */ this.obj.barLeftAll(), ES.id.barLeft);
    resetIds(/* jS */ this.obj.barLeftParentAll(), ES.id.barLeftParent);
    resetIds(/* jS */ this.obj.barCornerAll(), ES.id.barCorner);
    resetIds(/* jS */ this.obj.barCornerParentAll(), ES.id.barCornerParent);
    resetIds(/* jS */ this.obj.tableControlAll(), ES.id.tableControl);
    resetIds(/* jS */ this.obj.paneAll(), ES.id.pane);
    resetIds(/* jS */ this.obj.tabAll().each(function(j) {
      jQuery(this).attr('i', j);
    }), ES.id.tab);
  },

  merge: function() { /* merges cells */
    var cellsValue = "";
    var cellValue = "";
    var cells = /* jS */ this.obj.cellHighlighted();
    var formula;
    var cellFirstLoc = /* jS */ this.getTdLocation(cells.first());
    var cellLastLoc = /* jS */ this.getTdLocation(cells.last());
    var colI = (cellLastLoc.col - cellFirstLoc.col) + 1;
    
    if (cells.length > 1 && cellFirstLoc.row) {
      for (var i = cellFirstLoc.col; i <= cellLastLoc.col; i++) {
        var td = jQuery(/* jS */ this.getTd(/* jS */ this.i, cellFirstLoc.row, i)).hide();
        var cell = /* jS */ this.spreadsheets[/* jS */ this.i][cellFirstLoc.row][i];
        
        cellsValue = (cell.formula ? "(" + cell.formula.replace('=', '') + ")" : cell.value) + cellsValue;
        
        if (i != cellFirstLoc.col) {
          cell.formula = null;
          cell.value;
          td
            .attr('formula', '')
            .html('')
            .hide();
        }
      }
      
      var cell = cells.first()
        .show()
        .attr('colspan', colI)
        .html(cellsValue);
      
      /* jS */ this.setDirty(true);
      /* jS */ this.calc();
    } else if (!cellFirstLoc.row) {
      alert(ES.msg.merge);
    }
  },

  unmerge: function() { /* unmerges cells */
    var cell = /* jS */ this.obj.cellHighlighted().first();
    var loc = /* jS */ this.getTdLocation(cell);
    var formula = cell.attr('formula');
    var v = cell.text();
    v = (formula ? formula : v);
    
    var rowI = cell.attr('rowspan');
    var colI = cell.attr('colspan');
    
    //rowI = parseInt(rowI ? rowI : 1); //we have to have a minimum here;
    colI = parseInt(colI ? colI : 1);
    
    var td = '<td />';
    
    var tds = '';
    
    if (colI) {
      for (var i = 0; i < colI; i++) {
        tds += td;
      }
    }
    
    for (var i = loc.col; i < colI; i++) {
      jQuery(/* jS */ this.getTd(/* jS */ this.i, loc.row, i)).show();
    }
    
    cell.removeAttr('colspan');
    
    /* jS */ this.setDirty(true);
    /* jS */ this.calc();
  },

  fillUpOrDown: function(goUp, skipOffsetForumals, v) { /* fills values down or up to highlighted cells from active cell;
                              goUp: bool, default is down, when set to true value are filled from bottom, up;
                              skipOffsetForumals: bool, default is formulas will offest, when set to true formulas will stay static;
                              v: string, the value to set cells to, if not set, formula will be used;
                            */
    var cells = /* jS */ this.obj.cellHighlighted();
    var cellActive = /* jS */ this.obj.cellActive();
    //Make it undoable
    /* jS */ /*undoable */ this.add(cells);
    
    var startFromActiveCell = cellActive.hasClass(ES.cl.uiCellHighlighted);
    var startLoc = /* jS */ this.getTdLocation(cells.first());
    var endLoc = /* jS */ this.getTdLocation(cells.last());
    
    v = (v ? v : /* jS */ this.obj.formula().val()); //allow value to be overridden
    
    var offset = {
      row: 0,
      col: 0
    };
    var td;
    var newV = v;
    var fn;
    if (v.charAt(0) == '=') {
      fn = function(sheet, row, col){
        td = jQuery(this);
        
        if (goUp) {
          offset.row = -endLoc.row + row;
          offset.col = -endLoc.col + col;
        }
        else {
          offset.row = row - startLoc.row;
          offset.col = col - startLoc.col;
        }
        
        newV = /* jS */ this.reparseFormula(v, offset);
        
        /* jS */ this.spreadsheets[sheet][row][col].formula = newV;
        
        td.attr('formula', newV).html('');
      };
    } else {
      if (goUp && !isNaN(newV)) {
        newV *= 1;
        newV -= endLoc.row;
        newV -= endLoc.col;
      }
      fn = function(sheet, row, col){
        td = jQuery(this);
        
        /* jS */ this.spreadsheets[sheet][row][col].formula = null;
        /* jS */ this.spreadsheets[sheet][row][col].value = newV;
        
        td.removeAttr('formula').html(newV);
        
        if (!isNaN(newV)) 
          newV++;
      };
    }
    
    /* jS */ this.cycleCells(fn, startLoc, endLoc);
    
    /* jS */ this.setDirty(true);
    /* jS */ this.calc();
    
    //Make it redoable
    /* jS */ /*undoable */ this.add(cells);
  },
  offsetFormulas: function(loc, offset, isBefore) {/* makes cell formulas increment in a range
                                        loc: {row: int, col: int}
                                        offset: {row: int,col: int} offsets increment;
                                        isBefore: bool, inserted before location
                                      */
    var size = /* jS */ this.sheetSize();
    //shifted range is the range of cells that are moved
    var shiftedRange = {
      first: loc,
      last: {
        row: size.height,
        col: size.width
      }
    };
    //effected range is the entire spreadsheet
    var affectedRange = {
      first: {
        row: 0,
        col: 0
      },
      last: {
        row: size.height,
        col: size.width
      }
    };
    
    /* jS */ this.log("offsetFormulas from - Col:" + loc.col + ',Row:' + loc.row);
    /* jS */ this.log("Is before loc:" + (isBefore ? 'true' : 'false'));
    /* jS */ this.log("Offset: - Col:" + offset.col + ',Row:' + offset.row);
    
    function isInFormula(thisLoc, rowOrCol) {
      var move = false;
      
      if (isBefore) {
        if (thisLoc >= rowOrCol)
          move = true;
      } else {
        if (thisLoc > rowOrCol) 
          move = true;
      }
      
      return move;
    }

    /* jS */ this.cycleCells(function (sheet, row, col) {
      var td = jQuery(this);
      var formula = td.attr('formula');

      if (formula && /* jS */ this.isFormulaEditable(td)) {
        formula = /* jS */ this.reparseFormula(formula, offset, function(thisLoc){
          return {
            row: isInFormula(thisLoc.row, loc.row),
            col: isInFormula(thisLoc.col, loc.col)
          };
        });
        
        /* jS */ this.spreadsheets[sheet][row][col].formula = formula;
        td.attr('formula', formula);
      }

    }, affectedRange.first, affectedRange.last);
    
    
    /* jS */ this.cellEditDoneHandler();
    /* jS */ this.calc();
  },
  reparseFormula: function(formula, offset, fn) {
    return formula.replace(ES.engine.regEx.cell, function(ignored, col, row, pos) {
        var loc = ES.engine.parseLocation(ignored);
        
        if (fn) {
          var move = fn(loc);
          
          
          if (move.col || move.row) {
            if (move.col) loc.col += offset.col;
            if (move.row) loc.row += offset.row;
            
            return /* jS */ this.makeFormula(loc);
          }
        } else {
          return /* jS */ this.makeFormula(loc, offset);
        }
                    
        return ignored;
    });
  },
  makeFormula: function(loc, offset) {
    offset = jQuery.extend({row: 0, col: 0}, offset);
    
    //set offsets
    loc.col += offset.col;
    loc.row += offset.row;
    
    //0 based now
    if (loc.col < 0) loc.col = 0;
    if (loc.row < 0) loc.row = 0;
    
    return ES.engine.parseCellName(loc.col, loc.row);
  },
  cycleCells: function(fn, firstLoc, lastLoc, sheet) { /* cylces through a certain group of cells in a spreadsheet and applies a function to them
                          fn: function, the function to apply to a cell;
                          firstLoc: array of int - [col, row], the group to start;
                          lastLoc: array of int - [col, row], the group to end;
                        */
    sheet = (sheet ? sheet : /* jS */ this.i);
    firstLoc = (firstLoc ? firstLoc : {row: 0, col: 0});
    
    if (!lastLoc) {
      var size = /* jS */ this.sheetSize(jQuery('#' + ES.id.sheet + sheet));
      lastLoc = {row: size.height, col: size.width};
    }
    
    for (var row = firstLoc.row; row <= lastLoc.row; row++) {
      for (var col = firstLoc.col; col <= lastLoc.col; col++) {
        var td = /* jS */ this.getTd(sheet, row, col);
        if (td) {
          fn.apply(td, [sheet, row, col]);
        }
      }
    }
  },
  cycleCellsAll: function(fn) {
    for (var i = 0; i <= /* jS */ this.sheetCount; i++) {
      var size = /* jS */ this.sheetSize(jQuery('#' + ES.id.sheet + i));
      var endLoc = {row: size.height, col: size.width};
      /* jS */ this.cycleCells(fn, {row: 0, col: 0}, endLoc, i);
    }
  },
  cycleCellsAndMaintainPoint: function(fn, firstLoc, lastLoc) { /* cylces through a certain group of cells in a spreadsheet and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
                                  fn: function, the function to apply to a cell;
                                  firstLoc: array of int - [col, row], the group to start;
                                  lastLoc: array of int - [col, row], the group to end;
                                */
    var o = [];
    for (var i = (firstLoc.row < lastLoc.row ? firstLoc.row : lastLoc.row) ; i <= (firstLoc.row > lastLoc.row ? firstLoc.row : lastLoc.row); i++) {
      for (var j = (firstLoc.col < lastLoc.col ? firstLoc.col : lastLoc.col); j <= (firstLoc.col > lastLoc.col ? firstLoc.col : lastLoc.col); j++) {
        o.push(/* jS */ this.getTd(/* jS */ this.i, i, j));
        fn(o[o.length - 1]);
      }
    }
    return o;
  },
  addTab: function() { /* Adds a tab for navigation to a spreadsheet */
    jQuery('<span class="' + ES.cl.uiTab + ' ui-corner-bottom">' + 
        '<a class="' + ES.cl.tab + '" id="' + ES.id.tab + /* jS */ this.i + '" i="' + /* jS */ this.i + '">' + /* jS */ this.sheetTab(true) + '</a>' + 
      '</span>')
        .insertBefore(
          /* jS */ this.obj.tabContainer().find('span:last')
        );
  },
  sheetDecorate: function(o) { /* preps a table for use as a sheet;
                  o: object, table object;
                */
    /* jS */ this.formatSheet(o);
    /* jS */ this.sheetSyncSizeToCols(o);
    /* jS */ this.sheetDecorateRemove();
  },
  formatSheet: function(o) { /* adds tbody, colgroup, heights and widths to different parts of a spreadsheet
                  o: object, table object;
                */
    var es = this;
    var tableWidth = 0;
    if (o.find('tbody').length < 1) {
      o.wrapInner('<tbody />');
    }
    
    if (o.find('colgroup').length < 1 || o.find('col').length < 1) {
      o.remove('colgroup');
      var colgroup = jQuery('<colgroup />');
      o.find('tr:first').children().each(function() {
        var w = es.s.newColumnWidth;
        jQuery('<col />')
          .width(w)
          .css('width', (w) + 'px')
          .attr('width', (w) + 'px')
          .appendTo(colgroup);
        
        tableWidth += w;
      });
      o.find('tr').each(function() {
        jQuery(this)
          .height(es.s.colMargin)
          .css('height', es.s.colMargin + 'px')
          .attr('height', es.s.colMargin + 'px');
      });
      colgroup.prependTo(o);
    }
    
    o
      .removeAttr('width')
      .css('width', '')
      .width(tableWidth);
  },
  checkMinSize: function(o) { /* ensure sheet minimums have been met, if not add columns and rows
                  o: object, table object;
                */
    var size = /* jS */ this.sheetSize();
    
    var addRows = 0;
    var addCols = 0;
    
    if ((size.width) < this.s.minSize.cols) {
      addCols = this.s.minSize.cols - size.width - 1;
    }
    
    if (addCols) {
      /* jS */ this.addColumnMulti(addCols, false, true);
    }
    
    if ((size.height) < this.s.minSize.rows) {
      addRows = this.s.minSize.rows - size.height - 1;
    }
    
    if (addRows) {
      /* jS */ this.addRowMulti(addRows, false, true);
    }
  },

  resizable: function(o, settings) { /* jQuery ui resizeable integration
                      o: object, any object that neds resizing;
                      settings: object, the settings used with jQuery ui resizable;
                    */
    if (o.attr('resizable')) {
      o.resizable("destroy");
    }
      
    o
      .resizable(settings)
      .attr('resizable', true);
  },
  
  draggable: function(o, settings) {
    if (o.attr('draggable')) {
      o.resizable("destroy");
    }
    
    o
      .draggable(settings)
      .attr('draggable', true)
  },
  resizeBarTop: function(e) {
      /* jS */ this.resizable(jQuery(e.target), {
        handles: 'e',
        start: function() {
          /* jS */ this.busy = true;
          /* jS */ this.obj.barHelper().remove();
        },
        stop: function(e, ui) {
          /* jS */ this.busy = false;
          var i = /* jS */ this.getBarTopIndex(this);
          /* jS */ this.sheetSyncSizeToDivs();
          var w = /* jS */ this.width(this, true);
          /* jS */ this.obj.sheet().find('col').eq(i)
            .width(w)
            .css('width', w + 'px')
            .attr('width', w + 'px');
          
          /* jS */ this.followMe();
          /* jS */ this.obj.pane().scroll();
        }
      });
  },
  resizeBarLeft: function(e) {
      /* jS */ this.resizable(jQuery(e.target), {
        handles: 's',
        start: function() {
          /* jS */ this.busy = true;
          /* jS */ this.obj.barHelper().remove();
        },
        stop: function(e, ui) {
          /* jS */ this.busy = false;
          var i = /* jS */ this.getBarLeftIndex(jQuery(this));
          /* jS */ this.setHeight(i, 'bar', true);
          /* jS */ this.setHeight(i, 'cell');
          
          /* jS */ this.followMe();
          /* jS */ this.obj.pane().scroll();
        }
      });
  },
  sheetDecorateRemove: function(makeClone) { /* removes sheet decorations
                          makesClone: bool, creates a clone rather than the actual object;
                        */
    var o = (makeClone ? /* jS */ this.obj.sheetAll().clone() : /* jS */ this.obj.sheetAll());
    
    //Get rid of highlighted cells and active cells
    jQuery(o).find('td.' + ES.cl.cellActive)
      .removeClass(ES.cl.cellActive + ' ' + ES.cl.uiCellActive);
      
    jQuery(o).find('td.' + ES.cl.cellHighlighted)
      .removeClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
    /*
    //IE Bug, match width with css width
    jQuery(o).find('col').each(function(i) {
      var v = jQuery(this).css('width');
      v = ((v + '').match('px') ? v : v + 'px');
      jQuery(o).find('col').eq(i).attr('width', v);
    });
    */
    return o;
  },
  labelUpdate: function(v, setDirect) { /* updates the label so that the user knows where they are currently positioned
                      v: string or array of ints, new location value;
                      setDirect: bool, converts the array of a1 or [0,0] to "A1";
                    */
    if (!setDirect) {
      /* jS */ this.obj.label().html(ES.engine.parseCellName(v.col, v.row));
    } else {
      /* jS */ this.obj.label().html(v);
    }
  },
  cellEdit: function(td, isDrag, skipFocus) { /* starts cell to be edited
                    td: object, td object;

                    isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
                    */
                    //socket
    /* jS */ this.autoFillerNotGroup = true; //make autoFiller directional again.
    //This finished up the edit of the last cell
    /* jS */ this.cellEditDoneHandler();
    /* jS */ this.followMe(td);
    /* jS */ this.obj.pane().scroll();
    var loc = /* jS */ this.getTdLocation(td);
    
    //Show where we are to the user
    /* jS */ this.labelUpdate(loc);
    
    var v = td.attr('formula');
    if (!v) {
      v = td.text();
    }
    
    var formula = /* jS */ this.obj.formula()
      .val(v)
      .blur();
    
    if (!skipFocus) {
      //formula
        //.focus()
        //.select();
    }
    
    /* jS */ this.cellSetActive(td, loc, isDrag);
  },
  cellSetActive: function(td, loc, isDrag, directional, fnDone) { /* cell cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
                                    td: object, td object;
                                    loc: array of ints - [col, row];
                                    isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
                                    directional: bool, makes highlighting directional, only left/right or only up/down;
                                    fnDone: function, called after the cells are set active;
                                  */
                                  //socket
    var es = this;
    if(this.s.socket){
      this.s.socket.emit('message', {action: 'cell_active', args:{loc: loc, user:s.socket.udata, last_row: /* jS */ this.rowLast, last_col: /* jS */ this.colLast, sheet_idx: /* jS */ this.i } });
    }
    if (typeof(loc.col) != 'undefined') {
      /* jS */ this.cellLast.td = td; //save the current cell/td
      
      /* jS */ this.cellLast.row = /* jS */ this.rowLast = loc.row;
      /* jS */ this.cellLast.col = /* jS */ this.colLast = loc.col;
      
      /* jS */ this.bar_clearActive();
      /* jS */ this.cell_clearHighlighted();
      
      /* jS */ this.highlightedLast.td = td;
      
      /* jS */ this.cell_setActive(); //themeroll the cell and bars
      /* jS */ this.bar_setActive('left', /* jS */ this.cellLast.row);
      /* jS */ this.bar_setActive('top', /* jS */ this.cellLast.col);
      
      var selectModel;
      var clearHighlightedModel;
      
      /* jS */ this.highlightedLast.rowStart = loc.row;
      /* jS */ this.highlightedLast.colStart = loc.col;
      /* jS */ this.highlightedLast.rowLast = loc.row;
      /* jS */ this.highlightedLast.colLast = loc.col;
      
      switch (this.s.cellSelectModel) {
        case 'excel':
        case 'gdocs':
          selectModel = function() {};
          clearHighlightedModel = /* jS */ this.cell_clearHighlighted.bind(this);
          break;
        case 'oo':
          selectModel = function(target) {
            var td = jQuery(target);
            if (/* jS */ es.isTd(td)) {
              /* jS */ es.cellEdit(td);
            }
          };
          clearHighlightedModel = function() {};
          break;
      }
      
      if (isDrag) {
        var lastLoc = loc; //we keep track of the most recent location because we don't want tons of recursion here
        /* jS */ this.obj.pane()
          .mousemove(function(e) {
            var endLoc = /* jS */ es.getTdLocation([e.target]);
            var ok = true;
            
            if (directional) {
              ok = false;
              if (loc.col == endLoc.col || loc.row == endLoc.row) {
                ok = true;
              }
            }
            
            if ((lastLoc.col != endLoc.col || lastLoc.row != endLoc.row) && ok) { //this prevents this method from firing too much
              //clear highlighted cells if needed
              clearHighlightedModel();
              
              //set current bars
              /* jS */ es.highlightedLast.colEnd = endLoc.col;
              /* jS */ es.highlightedLast.rowEnd = endLoc.row;
              
              //select active cell if needed
              selectModel(e.target);
              
              //highlight the cells
              /* jS */ es.highlightedLast.td = /* jS */ es.cycleCellsAndMaintainPoint(/* jS */ es.cell_setHighlighted, loc, endLoc);
            }
            
            lastLoc = endLoc;
          });
        
        jQuery(document)
          .one('mouseup', function() {

            /* jS */ es.obj.pane()
              .unbind('mousemove')
              .unbind('mouseup');
            
            if (jQuery.isFunction(fnDone)) {
              fnDone();
            }
          });
      }
    }
  },

  cellStyleToggle: function(setClass, removeClass) { /* sets a cells class for styling
                              setClass: string, class(es) to set cells to;
                              removeClass: string, class(es) to remove from cell if the setClass would conflict with;
                            */
    //Lets check to remove any style classes
    var uiCell = /* jS */ this.obj.cellHighlighted();
    
    /* jS */ /*undoable */ this.add(uiCell);
    
    if (removeClass) {
      uiCell.removeClass(removeClass);
    }
    //Now lets add some style
    if (uiCell.hasClass(setClass)) {
      uiCell.removeClass(setClass);
    } else {
      uiCell.addClass(setClass);
    }
    
    /* jS */ /*undoable */ this.add(uiCell);
    
    ///* jS */ this.obj.formula()
      //.focus()
      //.select();
    return false;
  },
  fontReSize: function (direction) { /* resizes fonts in a cell by 1 pixel
                      direction: string, "up" || "down"
                    */
    var resize=0;
    switch (direction) {
      case 'up':
        resize=1;
        break;
      case 'down':
        resize=-1;
        break;    
    }
    
    //Lets check to remove any style classes
    var uiCell = /* jS */ this.obj.cellHighlighted();
    
    /* jS */ /*undoable */ this.add(uiCell);
    
    uiCell.each(function(i) {
      cell = jQuery(this);
      var curr_size = (cell.css("font-size") + '').replace("px","")
      var new_size = parseInt(curr_size ? curr_size : 10) + resize;
      cell.css("font-size", new_size + "px");
    });
    
    /* jS */ /*undoable */ this.add(uiCell);
  },
  
  updateCellValue: function(sheet, row, col) {
    //first detect if the cell exists if not return nothing
    
    if (!/* jS */ this.spreadsheets[sheet]) return 'Error: Sheet not found';
    if (!/* jS */ this.spreadsheets[sheet][row]) return 'Error: Row not found';
    if (!/* jS */ this.spreadsheets[sheet][row][col]) return 'Error: Column not found';
    
    var cell = /* jS */ this.spreadsheets[sheet][row][col];
    cell.oldValue = cell.value; //we detect the last value, so that we don't have to update all cell, thus saving resources
    
    if (cell.state) throw("Error: Loop Detected");
    cell.state = "red";
    
    if (cell.calcCount < 1 && cell.calcLast != /* jS */ this.calcLast) {
      cell.calcLast = /* jS */ this.calcLast;
      cell.calcCount++;
      if (cell.formula) {
        try {
          if (cell.formula.charAt(0) == '=') {
            cell.formula = cell.formula.substring(1, cell.formula.length);
          }
          
          var Parser;
          if (/* jS */ this.callStack) { //we prevent parsers from overwriting each other
            if (!cell.parser) { //cut down on un-needed parser creation
              cell.parser = (new /* jS */ this.parser);
            }
            Parser = cell.parser
          } else {//use the sheet's parser if there aren't many calls in the callStack
            Parser = /* jS */ this.Parser;
          }
          
          /* jS */ this.callStack++
          Parser.lexer.cell = {
            sheet: sheet,
            row: row,
            col: col,
            cell: cell,
            s: s,
            editable: this.s.editable,
            jS: jS
          };
          Parser.lexer.cellHandler = /* jS */ ES.cellHandlers;
          cell.value = Parser.parse(cell.formula);
        } catch(e) {
          cell.value = e.toString().replace(/\n/g, '<br />'); //error
          
          this.s.parent.one('calculation', function() { // the error size may be bigger than that of the cell, so adjust the height accordingly
            /* jS */ this.setHeight(row, 'cell', false);
          });
          
          /* jS */ this.alertFormulaError(cell.value);
        }
        /* jS */ this.callStack--;
      }
    
      if (cell.html) { //if cell has an html front bring that to the value but preserve it's value
        jQuery(/* jS */ this.getTd(sheet, row, col)).html(cell.html);          
      } else {
        jQuery(/* jS */ this.getTd(sheet, row, col)).html(cell.value);
      }
    }
    
    
    cell.state = null;
    
    return cell.value;
  },
  
  alertFormulaError: function(msg) {
    alert(
      'cell:' + row + ' ;' + col + '\n' +
      'value: "' + cell.formula + '"\n' + 
      'error: \n' + e
    );
  },
  
  calc: function(tableI) { /* harnesses calculations engine's calculation function
                    tableI: int, the current table integer;
                    fuel: variable holder, used to prevent memory leaks, and for calculations;
                  */
    tableI = (tableI ? tableI : /* jS */ this.i);
    if (/* jS */ this.readOnly[tableI]) return; //readonly is no calc at all
    
    /* jS */ this.log('Calculation Started');
    /* jS */ this.calcLast = new Date();
    ES.engine.calc(tableI, /* jS */ this.spreadsheetsToArray()[tableI], /* jS */ this.updateCellValue.bind(this));
    /* jS */ this.trigger('calculation');
    /* jS */ this.isSheetEdit = false;
    /* jS */ this.log('Calculation Ended');
  },
  refreshLabelsColumns: function(){ /* reset values inside bars for columns */
    var w = 0;
    /* jS */ this.obj.barTop().children().each(function(i) {
      jQuery(this).text(ES.engine.columnLabelString(i));
      w += jQuery(this).width();
    });
    return w;
  },
  refreshLabelsRows: function(){ /* resets values inside bars for rows */
    /* jS */ this.obj.barLeft().children().each(function(i) {
      jQuery(this).text((i + 1));
    });
  },
  addSheet: function(size, socket) { /* adds a spreadsheet
                  size: string example "10x100" which means 10 columns by 100 rows;
                */
    var es = this;
    size = (size ? size : prompt(ES.msg.newSheet));
    if (size) {
      /* jS */ this.cellEditAbandon();
      /* jS */ this.setDirty(true);
      var newSheetControl = /* jS */ this.sheetUI(ES.makeTable.fromSize(size), /* jS */ this.sheetCount + 1, function(o) { 
        /* jS */ es.setActiveSheet(/* jS */ es.sheetCount);
      }, true);
      
      if(!socket){
        args = [].slice.call(arguments)
        args[1] = true;
        if(this.s.socket) this.s.socket.emit('message', { action:'jsheet_trigger', args:{fnName: 'addSheet', fnArgs: args} });
      }
      /* jS */ this.trigger('addSheet', [/* jS */ this.i]);
    }
  },
  deleteSheet: function(sheetId, socket) { /* removes the currently selected sheet */
    var oldI = sheetId || /* jS */ this.i;
    
    /* jS */ this.obj.barHelper().remove();

    /* jS */ this.obj.tableControl().remove();
    /* jS */ this.obj.tabContainer().children().eq(/* jS */ this.i).remove();
    /* jS */ this.i = 0;
    /* jS */ this.sheetCount--;
    
    /* jS */ this.setControlIds();
    
    /* jS */ this.setActiveSheet(/* jS */ this.i);
    /* jS */ this.setDirty(true);
    if(!socket){
      args = [].slice.call(arguments)
      args[0] = oldI;
      args[1] = true;
      this.s.socket.emit('message', { action:'jsheet_trigger', args:{fnName: 'addSheet', fnArgs: args} });
    }
    /* jS */ this.trigger('deleteSheet', [oldI]);
  },
  deleteRow: function(skipCalc, row, socket) { /* removes the currently selected row */
    var rowLast = row || /* jS */ this.rowLast;
    /* jS */ this.obj.barLeft().children().eq(rowLast).remove();
    jQuery(/* jS */ this.getTd(/* jS */ this.i, rowLast, 0)).parent().remove();
    
    /* jS */ this.refreshLabelsRows();
    /* jS */ this.setTdIds();
    /* jS */ this.obj.pane().scroll();
    
    /* jS */ this.offsetFormulas({
      row: rowLast,
      col: 0
    }, {
      row: -1,
      col: 0
    });
    
    /* jS */ this.setDirty(true);
    
    /* jS */ this.cellEditAbandon();
    
    if(!socket){
      args = [].slice.call(arguments)
      args[2] = true;
      this.s.socket.emit('message', { action:'jsheet_trigger', args:{fnName: 'deleteRow', fnArgs: args} });
    }

    /* jS */ this.trigger('deleteRow', rowLast);
  },
  deleteColumn: function(skipCalc, col, socket ) { /* removes the currently selected column */
    var colLast = col || /* jS */ this.colLast;
    /* jS */ this.obj.barHelper().remove();
    /* jS */ this.obj.barTop().children().eq(colLast).remove();
    /* jS */ this.obj.sheet().find('colgroup col').eq(colLast).remove();
    
    var size = /* jS */ this.sheetSize();
    for (var i = 0; i <= size.height; i++) {
      jQuery(/* jS */ this.getTd(/* jS */ this.i, i, colLast)).remove();
    }
    
    var w = /* jS */ this.refreshLabelsColumns();
    /* jS */ this.setTdIds();
    /* jS */ this.obj.sheet().width(w);
    /* jS */ this.obj.pane().scroll();
    
    /* jS */ this.offsetFormulas({
      row: 0,
      col: colLast
    }, {
      row: 0,
      col: -1
    });
    
    /* jS */ this.setDirty(true);
    
    /* jS */ this.cellEditAbandon();
    
    if(!socket){
      args = [].slice.call(arguments)
      args[2] = true;
      this.s.socket.emit('message', { action:'jsheet_trigger', args:{fnName: 'deleteColumn', fnArgs: args} });
    }

    /* jS */ this.trigger('deleteColumn', colLast);
  },
  sheetTab: function(get) { /* manages a tabs inner value
                  get: bool, makes return the current value of the tab;
                */
    var sheetTab = '';
    if (get) {
      sheetTab = /* jS */ this.obj.sheet().attr('title');
      sheetTab = (sheetTab ? sheetTab : 'Spreadsheet ' + (/* jS */ this.i + 1));
    } else if (/* jS */ this.isSheetEditable() && this.s.editableTabs) { //ensure that the sheet is editable, then let them change the sheet's name
      var newTitle = prompt("What would you like the sheet's title to be?", /* jS */ this.sheetTab(true));
      if (!newTitle) { //The user didn't set the new tab name
        sheetTab = /* jS */ this.obj.sheet().attr('title');
        newTitle = (sheetTab ? sheetTab : 'Spreadsheet' + (/* jS */ this.i + 1));
      } else {
        /* jS */ this.setDirty(true);
        /* jS */ this.obj.sheet().attr('title', newTitle);
        /* jS */ this.obj.tab().html(newTitle);
        
        sheetTab = newTitle;
      }
    }
    return jQuery('<div />').text(sheetTab).html();
  },
  print: function(o) { /* prints a value in a new window
              o: string, any string;
            */
    var w = window.open();
    w.document.write("<html><body><xmp>" + o + "\n</xmp></body></html>");
    w.document.close();
  },
  viewSource: function(pretty) { /* prints the source of a sheet for a user to see
                    pretty: bool, makes html a bit easier for the user to see;
                  */
    var sheetClone = /* jS */ this.sheetDecorateRemove(true);
    
    var s = "";
    if (pretty) {
      jQuery(sheetClone).each(function() {
        s += /* jS */ this.HTMLtoPrettySource(this);
      });
    } else {
      s += jQuery('<div />').html(sheetClone).html();
    }
    
    /* jS */ this.print(s);
    
    return false;
  },
  saveSheet: function() { /* saves the sheet */
    var v = /* jS */ this.sheetDecorateRemove(true);
    var d = jQuery('<div />').html(v).html();

    jQuery.ajax({
      url: this.s.urlSave,
      type: 'POST',
      data: 's=' + d,
      dataType: 'html',
      success: function(data) {
        /* jS */ this.setDirty(false);
        /* jS */ this.trigger('saveSheet');
      }
    });
  },
  HTMLtoCompactSource: function(node) { /* prints html to 1 line
                      node: object;
                    */
    var result = "";
    if (node.nodeType == 1) {
      // ELEMENT_NODE
      result += "<" + node.tagName;
      hasClass = false;
      
      var n = node.attributes.length;
      for (var i = 0, hasClass = false; i < n; i++) {
        var key = node.attributes[i].name;
        var val = node.getAttribute(key);
        if (val) {
          if (key == "contentEditable" && val == "inherit") {
            continue;
            // IE hack.
          }
          if (key == "class") {
            hasClass = true;
          }
          
          if (typeof(val) == "string") {
            result += " " + key + '="' + val.replace(/"/g, "'") + '"';
          } else if (key == "style" && val.cssText) {
            result += ' style="' + val.cssText + '"';
          }
        }
      }

      if (node.tagName == "COL") {
        // IE hack, which doesn't like <COL..></COL>.
        result += '/>';
      } else {
        result += ">";
        var childResult = "";
        jQuery(node.childNodes).each(function() {
          childResult += /* jS */ this.HTMLtoCompactSource(this);
        });
        result += childResult;
        result += "</" + node.tagName + ">";
      }

    } else if (node.nodeType == 3) {
      // TEXT_NODE
      result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
    }
    return result;
  },
  HTMLtoPrettySource: function(node, prefix) {/* prints html to manu lines, formatted for easy viewing
                          node: object;
                          prefix: string;
                        */
    if (!prefix) {
      prefix = "";
    }
    var result = "";
    if (node.nodeType == 1) {
      // ELEMENT_NODE
      result += "\n" + prefix + "<" + node.tagName;
      var n = node.attributes.length;
      for (var i = 0; i < n; i++) {
        var key = node.attributes[i].name;
        var val = node.getAttribute(key);
        if (val) {
          if (key == "contentEditable" && val == "inherit") {
            continue; // IE hack.
          }
          if (typeof(val) == "string") {
            result += " " + key + '="' + val.replace(/"/g, "'") + '"';
          } else if (key == "style" && val.cssText) {
            result += ' style="' + val.cssText + '"';
          }
        }
      }
      if (node.childNodes.length <= 0) {
        result += "/>";
      } else {
        result += ">";
        var childResult = "";
        var n = node.childNodes.length;
        for (var i = 0; i < n; i++) {
          childResult += /* jS */ this.HTMLtoPrettySource(node.childNodes[i], prefix + "  ");
        }
        result += childResult;
        if (childResult.indexOf('\n') >= 0) {
          result += "\n" + prefix;
        }
        result += "</" + node.tagName + ">";
      }
    } else if (node.nodeType == 3) {
      // TEXT_NODE
      result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
    }
    return result;
  },
  followMe: function(td) { /* scrolls the sheet to the selected cell
                td: object, td object;
              */
    td = (td ? td : jQuery(/* jS */ this.cellLast.td));
    var pane = /* jS */ this.obj.pane();
    var panePos = pane.offset();
    var paneWidth = pane.width();
    var paneHeight = pane.height();

    var tdPos = td.offset();
    var tdWidth = td.width();
    var tdHeight = td.height();
    
    var margin = 20;
    
    ///* jS */ this.log('td: [' + tdPos.left + ', ' + tdPos.top + ']');
    ///* jS */ this.log('pane: [' + panePos.left + ', ' + panePos.top + ']');
    
    if ((tdPos.left + tdWidth + margin) > (panePos.left + paneWidth)) { //right
      pane.stop().scrollTo(td, {
        axis: 'x',
        duration: 50,
        offset: - ((paneWidth - tdWidth) - margin)
      });
    } else if (tdPos.left < panePos.left) { //left
      pane.stop().scrollTo(td, {
        axis: 'x',
        duration: 50
      });
    }
    
    if ((tdPos.top + tdHeight + margin) > (panePos.top + paneHeight)) { //bottom
      pane.stop().scrollTo(td, {
        axis: 'y',
        duration: 50,
        offset: - ((paneHeight - tdHeight) - margin)
      });
    } else if (tdPos.top < panePos.top) { //top
      pane.stop().scrollTo(td, {
        axis: 'y',
        duration: 50
      });
    }

    
    /* jS */ this.autoFillerGoToTd(td, tdHeight, tdWidth);
  },
  autoFillerGoToTd: function(td, tdHeight, tdWidth) { /* moves autoFiller to a selected cell
                              td: object, td object;
                              tdHeight: height of a td object;
                              tdWidth: width of a td object;
                            */
    td = (td ? td : jQuery(/* jS */ this.cellLast.td));
    tdHeight = (tdHeight ? tdHeight : td.height());
    tdWidth = (tdWidth ? tdWidth : td.width());
    
    if (this.s.autoFiller) {
      if (td.attr('id')) { //ensure that it is a usable cell
        tdPos = td.position();
        /* jS */ this.obj.autoFiller()
          .show()
          .css('top', ((tdPos.top + (tdHeight ? tdHeight : td.height()) - 3) + 'px'))
          .css('left', ((tdPos.left + (tdWidth ? tdWidth : td.width()) - 3) + 'px'));
      }
    }
  },
  
  setActiveSheet: function(i) { /* sets active a spreadsheet inside of a sheet instance 
                  i: int, a sheet integer desired to show;
                  */
    var es = this;
    i = (i ? i : 0);

    /* jS */ this.obj.tableControlAll().hide().eq(i).show();
    /* jS */ this.i = i;     
    
    /* jS */ this.tab_setActive();
    
    if (!/* jS */ this.isRowHeightSync[i]) { //this makes it only run once, no need to have it run every time a user changes a sheet
      /* jS */ this.isRowHeightSync[i] = true;
      /* jS */ this.obj.sheet().find('tr').each(function(j) {
        /* jS */ es.setHeight(j, 'cell');
        /*
        fixes a wired bug with height in chrome and ie
        It seems that at some point during the sheet's initializtion the height for each
        row isn't yet clearly defined, this ensures that the heights for barLeft match 
        that of each row in the currently active sheet when a user uses a non strict doc type.
        */
      });
    }
    
    /* jS */ this.readOnly[i] = /* jS */ this.obj.sheet().hasClass('readonly');
    
    /* jS */ this.sheetSyncSize();
    ///* jS */ this.replaceWithSafeImg();
  },
  openSheetURL: function ( url ) { /* opens a table object from a url, then opens it
                    url: string, location;
                  */
    this.s.urlGet = url;
    return /* jS */ this.openSheet();
  },
  openSheet: function(o, reloadBarsOverride) { /* opens a spreadsheet into the active sheet instance \
                          o: object, a table object;
                          reloadBarsOverride: if set to true, foces bars on left and top not be reloaded;
                        */
    var es = this;
    if (!/* jS */ this.isDirty ? true : confirm(ES.msg.openSheet)) {
      /* jS */ this.header();
      
      var fnAfter = function(i, l) {
        if (i == (l - 1)) {
          /* jS */ es.i = 0;
          /* jS */ es.setActiveSheet();
          /* jS */ es.resize();
          for (var i = 0; i <= /* jS */ es.sheetCount; i++) {
            /* jS */ es.calc(i);
          }
          
          /* jS */ es.trigger('sheetOpened', [i]);
        }
      };
      
      if (!o) {
        jQuery('<div />').load(this.s.urlGet, function() {
          var sheets = jQuery(this).find('table');
          sheets.each(function(i) {
            /* jS */ es.sheetUI(jQuery(this), i, function() { 
              fnAfter(i, sheets.length);
            }, true);
          });
        });
      } else {
        var sheets = jQuery('<div />').html(o).children('table');
        sheets.show().each(function(i) {
          /* jS */ es.sheetUI(jQuery(this), i,  function() { 
            fnAfter(i, sheets.length);
          }, (reloadBarsOverride ? true : false));
        });
      }
      
      /* jS */ this.setDirty(false);
      
      return true;
    } else {
      return false;
    }
  },
  newSheet: function() { /* creates a new shet from size */
    var size = prompt(ES.msg.newSheet);
    if (size) {
      /* jS */ this.openSheet(ES.makeTable.fromSize(size));
    }
  },
  importRow: function(rowArray) { /* creates a new row and then applies an array's values to each of it's new values
                    rowArray: array;
                  */
    /* jS */ this.addRow(null, null, ':last');

    var error = "";
    /* jS */ this.obj.sheet().find('tr:last td').each(function(i) {
      jQuery(this).removeAttr('formula');
      try {
        //To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
        if ((rowArray[i] + '').charAt(0) == "=") {
          jQuery(this).attr('formula', rowArray[i]);          
        } else {
          jQuery(this).html(rowArray[i]);
        }
      } catch(e) {
        //We want to make sure that is something bad happens, we let the user know
        error += e + ';\n';
      }
    });
    
    if (error) {//Show them the errors
      alert(error);
    }
    //Let's recalculate the sheet just in case
    /* jS */ this.setTdIds();
    /* jS */ this.calc();
  },
  importColumn: function(columnArray) { /* creates a new column and then applies an array's values to each of it's new values
                      columnArray: array;
                    */
    /* jS */ this.addColumn();

    var error = "";
    /* jS */ this.obj.sheet().find('tr').each(function(i) {
      var o = jQuery(this).find('td:last');
      try {
        //To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
        if ((columnArray[i] + '').charAt(0) == "=") {
          o.attr('formula', columnArray[i]);          
        } else {
          o.html(columnArray[i]);
        }
      } catch(e) {
        //We want to make sure that is something bad happens, we let the user know
        error += e + ';\n';
      }
    });
    
    if (error) {//Show them the errors
      alert(error);
    }
    //Let's recalculate the sheet just in case
    /* jS */ this.setTdIds();
    /* jS */ this.calc();
  },
  
  sheetSyncSizeToDivs: function() { /* syncs a sheet's size from bars/divs */
    var newSheetWidth = 0;
    /* jS */ this.obj.barTop().children().each(function() {
      newSheetWidth += jQuery(this).width() - this.s.boxModelCorrection;
    });
    /* jS */ this.obj.sheet()
      .width(newSheetWidth)
      .attr('width', newSheetWidth + 'px')
      .css('width', newSheetWidth + 'px');
    return newSheetWidth;
  },
  sheetSyncSizeToCols: function(o) { /* syncs a sheet's size from it's col objects
                      o: object, sheet object;
                    */
    var newSheetWidth = 0;
    o = (o ? o : /* jS */ this.obj.sheet());
    o.find('colgroup col').each(function() {
      newSheetWidth += jQuery(this).width();
    });
    o.width(newSheetWidth);
  },
  sheetSyncSize: function() { /* syncs a sheet's size to that of the jQuery().sheet() caller object */
    var h = this.s.height;
    if (!h) {
      h = 400; //Height really needs to be set by the parent
    } else if (h < 200) {
      h = 200;
    }
    this.s.parent
      .height(h)
      .width(this.s.width);
      
    var w = this.s.width - /* jS */ this.width(/* jS */ this.obj.barLeftParent()) - (this.s.boxModelCorrection);
    
    h = h - /* jS */ this.height(/* jS */ this.obj.controls()) - /* jS */ this.height(/* jS */ this.obj.barTopParent()) - (this.s.boxModelCorrection * 2);
    
    /* jS */ this.obj.pane()
      .height(h)
      .width(w)
      .parent()
        .width(w);
    
    /* jS */ this.obj.ui()
      .width(w + /* jS */ this.width(/* jS */ this.obj.barLeftParent()));
        
    /* jS */ this.obj.barLeftParent()
      .height(h);
    
    /* jS */ this.obj.barTopParent()
      .width(w)
      .parent()
        .width(w);
  },
  cellChangeStyle: function(style, value) { /* changes a cell's style and makes it undoable/redoable
                        style: string, css style name;
                        value: string, css setting;
                      */
                      //socket
    /* jS */ /*undoable */ this.add(/* jS */ this.obj.cellHighlighted()); //save state, make it undoable
    /* jS */ this.obj.cellHighlighted().css(style, value);
    /* jS */ /*undoable */ this.add(/* jS */ this.obj.cellHighlighted()); //save state, make it redoable

  },
  cellFind: function(v) { /* finds a cell in a sheet from a value
                v: string, value in a cell to find;
              */
    if(!v) {
      v = prompt("What are you looking for in this spreadsheet?");
    }
    if (v) {//We just do a simple uppercase/lowercase search.
      var o = /* jS */ this.obj.sheet().find('td:contains("' + v + '")');
      
      if (o.length < 1) {
        o = /* jS */ this.obj.sheet().find('td:contains("' + v.toLowerCase() + '")');
      }
      
      if (o.length < 1) {
        o = /* jS */ this.obj.sheet().find('td:contains("' + v.toUpperCase() + '")');
      }
      
      o = o.eq(0);
      if (o.length > 0) {
        /* jS */ this.cellEdit(o);
      } else {
        alert(ES.msg.cellFind);
      }
    }
  },
  cellSetActiveBar: function(type, start, end) { /* sets a bar active
                            type: string, "col" || "row" || "all";
                            start: int, int to start highlighting from;
                            start: int, int to end highlighting to;
                          */
    var size = /* jS */ this.sheetSize(jQuery('#' + ES.id.sheet + /* jS */ this.i));
    var first = (start < end ? start : end);
    var last = (start < end ? end : start);
    
    var setActive = function(td, rowStart, colStart, rowFollow, colFollow) {
      switch (this.s.cellSelectModel) {
        case 'oo': //follow cursor behavior
          /* jS */ this.cellEdit(jQuery(/* jS */ this.getTd(/* jS */ this.i, rowFollow, colFollow)));
          break;
        default: //stay at initial cell
          /* jS */ this.cellEdit(jQuery(/* jS */ this.getTd(/* jS */ this.i, rowStart, colStart)));
          break;
      }
      
      setActive = function(td) { //save resources
        return td;
      };
      
      return td;
    };

    var cycleFn;

    var td = [];
    
    switch (type) {
      case 'col':
        cycleFn = function() {
          for (var i = 0; i <= size.height; i++) { //rows
            for (var j = first; j <= last; j++) { //cols
              td.push(/* jS */ this.getTd(/* jS */ this.i, i, j));
              /* jS */ this.cell_setHighlighted(setActive(td[td.length - 1], 0, start, 0, end));
            }
          }
        };
        break;
      case 'row':
        cycleFn = function() {
          for (var i = first; i <= last; i++) { //rows
            for (var j = 0; j <= size.width; j++) { //cols
              td.push(/* jS */ this.getTd(/* jS */ this.i, i, j));
              /* jS */ this.cell_setHighlighted(setActive(td[td.length - 1], start, 0, end, 0));
            }
          }
        };
        break;
      case 'all':
        cycleFn = function() {
          setActive = function(td) {
            /* jS */ this.cellEdit(jQuery(td));
            setActive = function() {};
          };
          for (var i = 0; i <= size.height; i++) {
            for (var j = 0; j <= size.width; j++) {
              td.push(/* jS */ this.getTd(/* jS */ this.i, i, j));
              setActive(td[td.length - 1]);
              /* jS */ this.cell_setHighlighted(td[td.length - 1]);
            }
          }
          first = {row: 0,col: 0};
          last = {
            row: size.height,
            col: size.width
          }
        };
        break;
    }
    
    cycleFn();
    
    /* jS */ this.highlightedLast.td = td;
    /* jS */ this.highlightedLast.rowStart = first.row;
    /* jS */ this.highlightedLast.colStart = first.col;
    /* jS */ this.highlightedLast.rowEnd = last.row;
    /* jS */ this.highlightedLast.colEnd = last.col;
  },
  sheetClearActive: function() { /* clears formula and bars from being highlighted */
    /* jS */ this.obj.formula().val('');
    /* jS */ this.obj.barSelected().removeClass(ES.cl.barSelected);
  },
  getTdRange: function(e, v, newFn, notSetFormula) { /* gets a range of selected cells, then returns it */
    /* jS */ this.cellLast.isEdit = true;
    
    var range = function(loc) {
      if (loc.first.col > loc.last.col ||
        loc.first.row > loc.last.row
      ) {
        return {
          first: ES.engine.parseCellName(loc.last.col, loc.last.row),
          last: ES.engine.parseCellName(loc.first.col, loc.first.row)
        };
      } else {
        return {
          first: ES.engine.parseCellName(loc.first.col, loc.first.row),
          last: ES.engine.parseCellName(loc.last.col, loc.last.row)
        };
      }
    };
    var label = function(loc) {
      var rangeLabel = range(loc);
      var v2 = v + '';
      v2 = (v2.match(/=/) ? v2 : '=' + v2); //make sure we can use this value as a formula
      
      if (newFn || v2.charAt(v2.length - 1) != '(') { //if a function is being sent, make sure it can be called by wrapping it in ()
        v2 = v2 + (newFn ? newFn : '') + '(';
      }
      
      var formula;
      var lastChar = '';
      if (rangeLabel.first != rangeLabel.last) {
        formula = rangeLabel.first + ':' + rangeLabel.last;
      } else {
        formula = rangeLabel.first;
      }
      
      if (v2.charAt(v2.length - 1) == '(') {
        lastChar = ')';
      }
      
      return v2 + formula + lastChar;
    };
    var newVal = '';
    
    if (e) { //if from an event, we use mousemove method
      var loc = {
        first: /* jS */ this.getTdLocation([e.target])
      };
      
      var sheet = /* jS */ this.obj.sheet().mousemove(function(e) {
        loc.last = /* jS */ this.getTdLocation([e.target]);
        
        newVal = label(loc);
        
        if (!notSetFormula) {
          /* jS */ this.obj.formula().val(newVal);
          /* jS */ this.obj.inPlaceEdit().val(newVal);
        }
      });
      
      jQuery(document).one('mouseup', function() {
        sheet.unbind('mousemove');
        return newVal;
      });
    } else {
      var cells = /* jS */ this.obj.cellHighlighted().not(/* jS */ this.obj.cellActive());
      
      if (cells.length) {
        var loc = { //tr/td column and row index
          first: /* jS */ this.getTdLocation(cells.first()),
          last: /* jS */ this.getTdLocation(cells.last())
        };
        
        newVal = label(loc);
        
        if (!notSetFormula) {
          /* jS */ this.obj.formula().val(newVal);
          /* jS */ this.obj.inPlaceEdit().val(newVal);
        }
        
        return newVal;
      } else {
        return '';
      }
    }
  },
  getTdId: function(tableI, row, col) { /* makes a td if from values given
                      tableI: int, table integer;
                      row: int, row integer;
                      col: int, col integer;
                    */
    return I + '_table' + tableI + '_cell_c' + col + '_r' + row;
  },
  getTd: function(tableI, row, col) { /* gets a td
                      tableI: int, table integer;
                      row: int, row integer;
                      col: int, col integer;
                    */
    return document.getElementById(/* jS */ this.getTdId(tableI, row, col));
  },
  getTdLocation: function(td) { /* gets td column and row int
                    td: object, td object;
                  */
    if (!td || !td[0]) return {col: 0, row: 0};
    return {
      col: parseInt(td[0].cellIndex),
      row: parseInt(td[0].parentNode.rowIndex)
    }
  },
  getTdFromXY: function(left, top, skipOffset) { /* gets cell from point
                            left: int, pixels left;
                            top: int, pixels top;
                            skipOffset: bool, skips pane offset;
                          */
    var pane = /* jS */ this.obj.pane();
    var paneOffset = (skipOffset ? {left: 0, top: 0} : pane.offset());
    
    top += paneOffset.top + 2;
    left += paneOffset.left + 2;
    
    //here we double check that the coordinates are inside that of the pane, if so then we can continue
    if ((top >= paneOffset.top && top <= paneOffset.top + pane.height()) &&
      (left >= paneOffset.left && left <= paneOffset.left + pane.width())) {
      var td = jQuery(document.elementFromPoint(left - this.$window.scrollLeft(), top - this.$window.scrollTop()));
      
      
      //I use this snippet to help me know where the point was positioned
      /*jQuery('<div class="ui-widget-content" style="position: absolute;">TESTING TESTING</div>')
        .css('top', top + 'px')
        .css('left', left + 'px')
        .appendTo('body');
      */
      
      if (/* jS */ this.isTd(td)) {
        return td;
      }
      return false;
    }
  },
  getBarLeftIndex: function(o) { /* get's index from object */
    var i = jQuery.trim(jQuery(o).text());
    if (isNaN(i)) {
      return -1;
    } else {
      return i - 1;
    }
  },
  getBarTopIndex: function(o) { /* get's index from object */
    var v = jQuery.trim(jQuery(o).text());
    if (!v) return -1;
    
    var i = ES.engine.columnLabelIndex(v);
    i = parseInt(i);
    
    if (isNaN(i)) {
      return -1;
    } else {
      return i;
    }
  },
  
  log: function(msg) {  //The log prints: {Current Time}, {Seconds from last log};{msg}
    /* jS */ time.set();
    console.log(/* jS */ time.get() + ', ' + /* jS */ time.diff() + '; ' + msg);
  },
  replaceWithSafeImg: function(o) {  //ensures all pictures will load and keep their respective bar the same size.
    (o ? o : /* jS */ this.obj.sheet().find('img')).each(function() {      
      var src = jQuery(this).attr('src');
      jQuery(this).replaceWith(/* jS */ this.safeImg(src, /* jS */ this.getTdLocation(jQuery(this).parent()).row));
    });
  },
  
  
  setDirty: function(dirty) { /* jS */ this.isDirty = dirty; },
  appendToFormula: function(v, o) {
    var formula = /* jS */ this.obj.formula();
    
    var fV = formula.val();
    
    if (fV.charAt(0) != '=') {
      fV = '=' + fV;
    }
    
    formula.val(fV + v);
  },
  
  sheetSize: function(o) {
    var loc = /* jS */ this.getTdLocation((o ? o : /* jS */ this.obj.sheet()).find('td:last'));
    return {
      width: loc.col,
      height: loc.row
    };
  },
  toggleState:  function(replacementSheets) {
    if (this.s.allowToggleState) {
      if (this.s.editable) {
        /* jS */ this.cellEditAbandon();
        /* jS */ this.saveSheet();
      }
      /* jS */ this.setDirty(false);
      this.s.editable = !this.s.editable;
      /* jS */ this.obj.tabContainer().remove();
      var sheets = (replacementSheets ? replacementSheets : /* jS */ this.obj.sheetAll().clone());
      this.s.parent.children().remove();
      /* jS */ this.openSheet(sheets, true);
    }
  },
  setCellRef: function(ref) {
    var td = /* jS */ this.obj.cellActive();
    loc = /* jS */ this.getTdLocation(td);
    
    cellRef = (ref ? ref : prompt('Enter the name you would like to reference the cell by.'));
    
    if (cellRef) {
      /* jS */ this.spreadsheets[cellRef] = /* jS */ this.spreadsheets[/* jS */ this.i][loc.row][loc.col];
    }
    
    /* jS */ this.calc();
  },
});