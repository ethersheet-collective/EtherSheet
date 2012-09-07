/* controlFactory creates the different objects requied by sheet */
jQuery.extend(ES.prototype,{ 
  addRowMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi rows
                        qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
                        isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
                        skipFormulaReparse: bool, re-parses formulas if needed
                      */
    if (!qty) {
      qty = prompt(ES.msg.addRowMulti);
    }
    if (qty) {
      if (!isNaN(qty))
        /* jS */ this.addCells(null, isBefore, null, parseInt(qty), 'row', skipFormulaReparse);
    }
  },
  addColumnMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi columns
                        qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
                        isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
                        skipFormulaReparse: bool, re-parses formulas if needed
                      */
    if (!qty) {
      qty = prompt(ES.msg.addColumnMulti);
    }
    if (qty) {
      if (!isNaN(qty))
        /* jS */ this.addCells(null, isBefore, null, parseInt(qty), 'col', skipFormulaReparse);
    }
  },
  addCells: function(eq, isBefore, eqO, qty, type, skipFormulaReparse) { /*creates cells for sheet and the bars that go along with them
                              eq: int, position where cells should be added;
                              isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end;
                              eq0: no longer used, kept for legacy;
                              qty: int, how many rows/columsn to add;
                              type: string - "col" || "row", determans the type of cells to add;
                              skipFormulaReparse: bool, re-parses formulas if needed
                          */
    var es = this;
    //hide the autoFiller, it can get confused
    if (this.s.autoFiller) {
      /* jS */ this.obj.autoFiller().hide();
    }
    
    /* jS */ this.setDirty(true);
    /* jS */ this.obj.barHelper().remove();
    
    var sheet = /* jS */ this.obj.sheet();
    var sheetWidth = sheet.width();
    
    ///* jS */ this.cellEditAbandon();
    
    qty = (qty ? qty : 1);
    type = (type ? type : 'col');
    
    //var barLast = (type == 'row' ? /* jS */ this.rowLast : /* jS */ this.colLast);
    var cellLastBar = (type == 'row' ? /* jS */ this.cellLast.row : /* jS */ this.cellLast.col);
    
    if (!eq) {
      if (cellLastBar == -1) {
        eq = ':last';
      } else {
        eq = ':eq(' + cellLastBar + ')';
      }
    } else if (!isNaN(eq)){
      eq = ':eq(' + (eq) + ')';
    }
    
    var o;
    switch (type) {
      case "row":
        o = {
          bar: /* jS */ this.obj.barLeft().children('div' + eq),
          barParent: /* jS */ this.obj.barLeft(),
          cells: function() {
            return sheet.find('tr' + eq);
          },
          col: function() { return ''; },
          newBar: '<div class="' + ES.cl.uiBar + '" style="height: ' + (this.s.colMargin - this.s.boxModelCorrection) + 'px;" />',
          size: function() {
            return /* jS */ es.getTdLocation(o.cells().find('td:last'));
          },
          loc: function() {
            return /* jS */ es.getTdLocation(o.cells().find('td:first'));
          },
          newCells: function() {
            var j = o.size().col;
            var newCells = '';
            
            for (var i = 0; i <= j; i++) {
              newCells += '<td />';
            }
            
            return '<tr style="height: ' + es.s.colMargin + 'px;">' + newCells + '</tr>';
          },
          newCol: '',
          reLabel: function() {               
            o.barParent.children().each(function(i) {
              jQuery(this).text(i + 1);
            });
          },
          dimensions: function(bar, cell, col) {
            bar.height(cell.height(es.s.colMargin).outerHeight() - es.s.boxModelCorrection);
          },
          offset: {row: qty,col: 0}
        };
        break;
      case "col":
        o = {
          bar: /* jS */ this.obj.barTop().children('div' + eq),
          barParent: /* jS */ this.obj.barTop(),
          cells: function() {
            var cellStart = sheet.find('tr:first').children(eq);
            var cellEnd = sheet.find('td:last');
            var loc1 = /* jS */ es.getTdLocation(cellStart);
            var loc2 = /* jS */ es.getTdLocation(cellEnd);
            
            //we get the first cell then get all the other cells directly... faster ;)
            var cells = jQuery(/* jS */ es.getTd(/* jS */ es.i, loc1.row, loc1.col));
            var cell;
            for (var i = 1; i <= loc2.row; i++) {
              cells.push(/* jS */ es.getTd(/* jS */ es.i, i, loc1.col));
            }
            
            return cells;
          },
          col: function() {
            return sheet.find('col' + eq);
          },
          newBar: '<div class="' + ES.cl.uiBar + '"/>',
          newCol: '<col />',
          loc: function(cells) {
            cells = (cells ? cells : o.cells());
            return /* jS */ es.getTdLocation(cells.first());
          },
          newCells: function() {
            return '<td />';
          },
          reLabel: function() {
            o.barParent.children().each(function(i) {
              jQuery(this).text(ES.engine.columnLabelString(i));
            });
          },
          dimensions: function(bar, cell, col) {                
            var w = es.s.newColumnWidth;
            col
              .width(w)
              .css('width', w + 'px')
              .attr('width', w + 'px');
            
            bar
              .width(w - es.s.boxModelCorrection);
            
            sheet.width(sheetWidth + (w * qty));
          },
          offset: {row: 0, col: qty}
        };
        break;
    }
    
    //make undoable
    /* jS */ this.add(jQuery(sheet).add(o.barParent));
    
    var cells = o.cells();
    var loc = o.loc(cells); 
    var col = o.col();
    
    var newBar = o.newBar;
    var newCell = o.newCells();
    var newCol = o.newCol;
    
    var newCols = '';
    var newBars = '';
    var newCells = '';
    
    for (var i = 0; i < qty; i++) { //by keeping these variables strings temporarily, we cut down on using system resources
      newCols += newCol;
      newBars += newBar;
      newCells += newCell;
    }
    
    newCols = jQuery(newCols);
    newBars = jQuery(newBars);
    newCells = jQuery(newCells);
    
    if (isBefore) {
      cells.before(newCells);
      o.bar.before(newBars);
      jQuery(col).before(newCols);
    } else {
      cells.after(newCells);
      o.bar.after(newBars);
      jQuery(col).after(newCols);
    }
    
    /* jS */ this.setTdIds(sheet, /* jS */ this.i);
    
    o.dimensions(newBars, newCells, newCols);
    o.reLabel();

    /* jS */ this.obj.pane().scroll();
    
    if (!skipFormulaReparse && eq != ':last') {
      //offset formulas
      /* jS */ this.offsetFormulas(loc, o.offset, isBefore);
    }
    
    //Because the line numbers get bigger, it is possible that the bars have changed in size, lets sync them
    /* jS */ this.sheetSyncSize();
    
    //Let's make it redoable
    /* jS */ this.add(jQuery(sheet).add(o.barParent));
  },
  addRow: function(atRow, isBefore, atRowQ, socket) {/* creates single row
                        qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
                        isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
                      */
    //socket                  
    console.log('addrow at ' + atRow)
    /* jS */ this.addCells(atRow, isBefore, atRowQ, 1, 'row');
    if(!socket){
      args = [].slice.call(arguments)
      args[3] = true;
      this.s.socket.emit('message', { action:'control_factory_trigger', args:{fnName: 'addRow', fnArgs: args} });
    }
    /* jS */ this.trigger('addRow', [atRow, isBefore, atRowQ, 1]);
  },
  addColumn: function(atColumn, isBefore, atColumnQ, socket) {/* creates single column
                        qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
                        isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
                      */
                      //socket
    /* jS */ this.addCells(atColumn, isBefore, atColumnQ, 1, 'col');
    if(!socket){
      args = [].slice.call(arguments)
      args[3] = true;
      this.s.socket.emit('message', { action:'control_factory_trigger', args:{fnName: 'addColumn', fnArgs: args} });
    }
    /* jS */ this.trigger('addColumn', [atRow, isBefore, atRowQ, 1]);
  },
  barLeft: function(reloadHeights, o) { /* creates all the bars to the left of the spreadsheet
                        reloadHeights: bool, reloads all the heights of each bar from the cells of the sheet;
                        o: object, the table/spreadsheeet object
                    */
    var es = this;
    /* jS */ this.obj.barLeft().remove();
    var barLeft = jQuery('<div border="1px" id="' + ES.id.barLeft + /* jS */ this.i + '" class="' + ES.cl.barLeft + '" />');
    var heightFn;
    if (reloadHeights) { //This is our standard way of detecting height when a sheet loads from a url
      heightFn = function(i, objSource, objBar) {
        objBar.height(parseInt(objSource.outerHeight()) - es.s.boxModelCorrection);
      };
    } else { //This way of detecting height is used becuase the object has some problems getting
        //height because both tr and td have height set
        //This corrects the problem
        //This is only used when a sheet is already loaded in the pane
      heightFn = function(i, objSource, objBar) {
        objBar.height(parseInt(objSource.css('height').replace('px','')) - es.s.boxModelCorrection);
      };
    }
    
    o.find('tr').each(function(i) {
      var child = jQuery('<div>' + (i + 1) + '</div>');
      barLeft.append(child);
      heightFn(i, jQuery(this), child);
    });
    
    /* jS */ this.barMouseDown_height(
      /* jS */ this.obj.barLeftParent().append(barLeft)
    );
  },
  barTop: function(reloadWidths, o) { /* creates all the bars to the top of the spreadsheet
                        reloadWidths: bool, reloads all the widths of each bar from the cells of the sheet;
                        o: object, the table/spreadsheeet object
                    */
    var es = this;
    /* jS */ this.obj.barTop().remove();
    var barTop = jQuery('<div id="' + ES.id.barTop + /* jS */ this.i + '" class="' + ES.cl.barTop + '" />');
    barTop.height(this.s.colMargin);
    
    var parents;
    var widthFn;
    
    if (reloadWidths) {
      parents = o.find('tr:first').children();
      widthFn = function(obj) {
        return /* jS */ es.width(obj);
      };
    } else {
      parents = o.find('col');
      widthFn = function(obj) {

        return parseInt(jQuery(obj).css('width').replace('px','')) - es.s.boxModelCorrection;
      };
    }
    
    parents.each(function(i) {
      var v = ES.engine.columnLabelString(i);
      var w = widthFn(this);
      
      var child = jQuery("<div>" + v + "</div>")
        .width(w)
        .height(es.s.colMargin);
      barTop.append(child);
    });
    
    /* jS */ this.barMouseDown_width(
      /* jS */ es.obj.barTopParent().append(barTop)
    );
  },
  barTopHandle: function(bar, i) {
    if (/* jS */ this.busy) return false;
    if (i != 0) return false;
    /* jS */ this.obj.barHelper().remove();
    
    var target = /* jS */ this.obj.barTop().children().eq(i);
    
    var pos = target.position();

    var barTopHandle = jQuery('<div id="' + ES.id.barTopHandle + '" class="' + ES.cl.uiBarTopHandle + ' ' + ES.cl.barHelper + ' ' + ES.cl.barTopHandle + '" />')
      .height(this.s.colMargin - 2)
      .css('left', pos.left + 'px')
      .appendTo(bar);
    
    /* jS */ this.draggable(barTopHandle, {
      axis: 'x',
      start: function() {
        /* jS */ this.busy = true;
      },
      stop: function() {
        /* jS */ this.busy = false;
      }
    });
  },
  barLeftHandle: function(bar, i) {
    if (/* jS */ this.busy) return false;
    if (i != 0) return false;
    /* jS */ this.obj.barHelper().remove();
    
    var target = /* jS */ this.obj.barLeft().children().eq(i);
    
    var pos = target.position();

    var barLeftHandle = jQuery('<div id="' + ES.id.barLeftHandle + '" class="' + ES.cl.uiBarLeftHandle + ' ' + ES.cl.barHelper + ' ' + ES.cl.barLeftHandle + '" />')
      .width(this.s.colMargin - 6)
      .height(this.s.colMargin / 3)
      .css('top', pos.top + 'px')
      .appendTo(bar);
    
    /* jS */ this.draggable(barLeftHandle, {
      axis: 'y',
      start: function() {
        /* jS */ this.busy = true;
      },
      stop: function() {
        /* jS */ this.busy = false;
      }
    });
  },
  makeMenu: function(bar, menuItems) {
    var menu;
    function addLink(msg, fn) {
      switch (msg) {
        case "line":
          jQuery('<hr />').appendTo(menu);
          break;
        default:
          jQuery('<div>' + msg + '</div>').click(function() {
            fn();
            return false;
          }).appendTo(menu);
      }
        
    }
    
    switch (bar) {
      case "top":
        menu = jQuery('<div id="' + ES.id.barTopMenu + '" class="' + ES.cl.uiMenu + ' ' + ES.cl.barHelper + '" />');
        break;
      case "left":
        menu = jQuery('<div id="' + ES.id.barLeftMenu + '" class="' + ES.cl.uiMenu + ' ' + ES.cl.barHelper + '" />');
        break;
      case "cell":
        menu = jQuery('<div id="' + ES.id.cellMenu + '" class="' + ES.cl.uiMenu + ' ' + ES.cl.barHelper + '" />');
        break;
    }
    
    menu
      .width(this.s.newColumnWidth)
      .mouseleave(function() {
        menu.hide();
      })
      .appendTo('body')
      .hide();
    
    jQuery(menuItems).each(function() {
      addLink(this.msg, this.fn);
    });
    
    return menu;
  },
  barTopMenu: function(e, i, target) {
    if (/* jS */ this.busy) return false;
    var menu = /* jS */ this.obj.barTopMenu().hide();
    
    if (i) /* jS */ this.obj.barTopHandle().remove();
    var menu;
    
    if (!menu.length) {
      menu = /* jS */ this.makeMenu('top', [{
        msg: ES.msg.menuInsertColumnAfter,
        fn: function(){
          /* jS */ this.addColumn(/* jS */ this.cellLast.col);
          return false;
        }
      }, {
        msg: ES.msg.menuInsertColumnBefore,
        fn: function(){
          /* jS */ this.addColumn(/* jS */ this.cellLast.col, true);
          return false;
        }
      }, {
        msg: ES.msg.menuAddColumnEnd,
        fn: function(){
          /* jS */ this.addColumn(':last');
          return false;
        }
      }, {
        msg: ES.msg.menuDeleteColumn,
        fn: function(){
          /* jS */ this.deleteColumn(false, /* jS */ this.cellLast.col);
          return false;
        }
      }]);
    }
    
    if (!target) {
      menu
        .css('left', (e.pageX - 5) + 'px')
        .css('top', (e.pageY - 5) + 'px')
        .show();
      return menu;
    }

    var barTopMenuParent = /* jS */ this.obj.barTopMenuParent().hide();
    
    if (!barTopMenuParent.length) {
    
      barTopMenuParent = jQuery('<div id="' + ES.id.barTopMenuParent + '" class="' + ES.cl.uiBarTopMenu + ' ' + ES.cl.barHelper + '">' +
          '<span class="ui-icon ui-icon-triangle-1-s" /></span>' +
        '</div>')
        .click(function(e) {
          barTopMenuParent.parent()
            .mousedown()
            .mouseup();
          
          var offset = barTopMenuParent.offset();
          
          menu
            .css('left', (offset.left - (this.s.newColumnWidth - this.s.colMargin)) + 'px')
            .css('top', (offset.top + (this.s.colMargin * .8)) + 'px')
            .show();
        })
        .blur(function() {
          if (menu) menu.hide();
        })
        .height(this.s.colMargin);
    }
    
    barTopMenuParent
      .appendTo(target)
      .show();
  },
  barLeftMenu: function(e, i) {
    if (/* jS */ this.busy) return false;
    /* jS */ this.obj.barLeftMenu().hide();
    
    if (i) /* jS */ this.obj.barLeftHandle().remove();
    var menu;
    
    menu = /* jS */ this.obj.barLeftMenu();
    
    if (!menu.length) {
      menu = /* jS */ this.makeMenu('left', [{
          msg: ES.msg.menuInsertRowAfter,
          fn: function(){
            /* jS */ this.addRow(/* jS */ this.cellLast.row); // we really need to pass in the row here
            return false;
          }
        }, {
          msg: ES.msg.menuInsertRowBefore,
          fn: function(){
            /* jS */ this.addRow(/* jS */ this.cellLast.row, true); // we really need to pass in the row here
            return false;
          }
        }, {
          msg: ES.msg.menuAddRowEnd,
          fn: function(){
            /* jS */ this.addRow(':last');
            return false;
          }
        }, {
          msg: ES.msg.menuDeleteRow,
          fn: function(){
            /* jS */ this.deleteRow(false, /* jS */ this.cellLast.row);// we really need to pass in the row here
            return false;
          }
        }]);
    }
    
    menu
      .css('left', (e.pageX - 5) + 'px')
      .css('top', (e.pageY - 5) + 'px')
      .show();
  },
  cellMenu: function(e) {
    if (/* jS */ this.busy) return false;
    /* jS */ this.obj.cellMenu().hide();
    
    var menu = /* jS */ this.obj.cellMenu();
    
    if (!menu.length) {
      menu = /* jS */ this.makeMenu('cell', [{
          msg: ES.msg.menuInsertColumnAfter,
          fn: function(){
            /* jS */ this.addColumn(/* jS */ this.cellLast.col);
            return false;
          }
        }, {
          msg: ES.msg.menuInsertColumnBefore,
          fn: function(){
            /* jS */ this.addColumn(/* jS */ this.cellLast.col, true);
            return false;
          }
        }, {
          msg: ES.msg.menuAddColumnEnd,
          fn: function(){
            /* jS */ this.addColumn(':last');
            return false;
          }
        }, {
          msg: ES.msg.menuDeleteColumn,
          fn: function(){
            /* jS */ this.deleteColumn(false, /* jS */ this.cellLast.col);
            return false;
          }
        }, {
          msg: "line"
        },{
          msg: ES.msg.menuInsertRowAfter,
          fn: function(){
            /* jS */ this.addRow(/* jS */ this.cellLast.row);
            return false;
          }
        }, {
          msg: ES.msg.menuInsertRowBefore,
          fn: function(){
            /* jS */ this.addRow(/* jS */ this.cellLast.row, true);
            return false;
          }
        }, {
          msg: ES.msg.menuAddRowEnd,
          fn: function(){
            /* jS */ this.addRow(':last');
            return false;
          }
        }, {
          msg: ES.msg.menuDeleteRow,
          fn: function(){
            /* jS */ this.deleteRow(false, /* jS */ this.cellLast.row);
            return false;
          }
        }, {
          msg: 'line'
        }, {
          msg: ES.msg.menuAddSheet,
          fn: function() {
            /* jS */ this.addSheet('5x10');
          }
        }, {
          msg: ES.msg.menuDeleteSheet,
          fn: function() {
            /* jS */ this.deleteSheet();
          }
        }]);
    }
    
    menu
      .css('left', (e.pageX - 5) + 'px')
      .css('top', (e.pageY - 5) + 'px')
      .show();
  },
  header: function() { /* creates the control/container for everything above the spreadsheet */
    var es = this;

    /* jS */ this.obj.controls().remove();
    /* jS */ this.obj.tabContainer().remove();
    
    var header = jQuery('<div id="' + ES.id.controls + '" class="' + ES.cl.controls + '"></div>');
    
    var firstRow = jQuery('<table cellpadding="0" cellspacing="0" border="0"><tr /></table>').prependTo(header);
    var firstRowTr = jQuery('<tr />');
    
    if (this.s.title) {
      var title;
      if (jQuery.isFunction(this.s.title)) {
        title = /* jS */ this.title(jS);
      } else {
        title = this.s.title;
      }
      firstRowTr.append(jQuery('<td id="' + ES.id.title + '" class="' + ES.cl.title + '" />').html(title));
    }
    
    if (this.s.inlineMenu && /* jS */ this.isSheetEditable()) {
      var inlineMenu;
      if (jQuery.isFunction(this.s.inlineMenu)) {
        inlineMenu = this.s.inlineMenu(jS);
      } else {
        inlineMenu = this.s.inlineMenu;
      }
      firstRowTr.append(jQuery('<td id="' + ES.id.inlineMenu + '" class="' + ES.cl.inlineMenu + '" />').html(inlineMenu));
    }
    
    if (/* jS */ this.isSheetEditable()) {
      //Sheet Menu Control
      function makeMenu(ulMenu) {
        var menu = jQuery('<td id="' + ES.id.menu + '" class="' + ES.cl.menu + '" />')
          .html(
            ulMenu
              .replace(/sheetInstance/g, "ES.instance[" + I + "]")
              .replace(/menuInstance/g, I));
              
          menu
            .prependTo(firstRowTr)
            .find("ul").hide()
            .addClass(ES.cl.uiMenuUl)
            .first().show();
          
          menu
            .find("li")
              .addClass(ES.cl.uiMenuLi)
              .hover(function(){
                jQuery(this).find('ul:first')
                  .hide()
                  .show();
              },function(){
                jQuery(this).find('ul:first')
                  .hide();
              });
        return menu;
      }
      
      if (this.s.menu) {
        makeMenu(this.s.menu);
      } else {
        jQuery('<div />').load(this.s.urlMenu, function() {
          makeMenu(jQuery(this).html());
        });
      }
      
      //Edit box menu
      var secondRow = jQuery('<table cellpadding="0" cellspacing="0" border="0">' +
          '<tr>' +
            '<td id="' + ES.id.label + '" class="' + ES.cl.label + '"></td>' +
            '<td class="' + ES.cl.formulaParent + '">' +
              '<textarea id="' + ES.id.formula + '" class="' + ES.cl.formula + '"></textarea>' +
            '</td>' +
          '</tr>' +
        '</table>')
        .appendTo(header)
        .find('textarea')
          .keydown(/* jS */ es.keyDownHandler_formulaKeydown)
          .keyup(function() {
            /* jS */ es.obj.inPlaceEdit().val(/* jS */ this.obj.formula().val());
          })
          .change(function() {
            /* jS */ es.obj.inPlaceEdit().val(/* jS */ this.obj.formula().val());
          })
          .bind('paste', /* jS */ this.pasteOverCells)
          .focus(function() {
            /* jS */ es.setNav(false);
          })
          .focusout(function() {
            /* jS */ es.setNav(true);
          })
          .blur(function() {
            /* jS */ es.setNav(true);
          });
      
      jQuery(ES.instance).each(function() {
        this.nav = false;
      });
      
      /* jS */ this.setNav(true);
      
      jQuery(document)
        .unbind('keydown')
        .keydown(/* jS */ this.keyDownHandler_documentKeydown);
    }
    
    firstRowTr.appendTo(firstRow);
    
    var tabParent = jQuery('<div id="' + ES.id.tabContainer + '" class="' + ES.cl.tabContainer + '" />')
      .mousedown(function(e) {
        /* jS */ es.trigger('switchSpreadsheet', [jQuery(e.target).attr('i') * 1]);
        return false;
      })
      .dblclick(function(e) {
        /* jS */ es.trigger('renameSpreadsheet', [jQuery(e.target).attr('i') * 1]);
        return 
      });
    
    
    if (/* jS */ this.isSheetEditable()) {
      var addSheet = jQuery('<span class="' + ES.cl.uiTab + ' ui-corner-bottom" title="Add a spreadsheet" i="-1">+</span>').appendTo(tabParent);
      
      if (jQuery.fn.sortable) {
        var startPosition;
        
        tabParent.sortable({
          placeholder: 'ui-state-highlight',
          axis: 'x',
          forceHelperSize: true,
          forcePlaceholderSize: true,
          opacity: 0.6,
          cancel: 'span[i="-1"]',
          start: function(e, ui) {
            startPosition = ui.item.index();
            /* jS */ es.trigger('tabSortstart', [e, ui]);
          },
          update: function(e, ui) {
            /* jS */ es.trigger('tabSortupdate', [e, ui, startPosition]);
          }
        });
      }
    } else {
      jQuery('<span />').appendTo(tabParent);
    }

    this.s.parent
      .html('')
      .append(header) //add controls header
      .append('<div id="' + ES.id.ui + '" class="' + ES.cl.ui + '">') //add spreadsheet control
      .after(tabParent);
  },
  sheetUI: function(o, i, fn, reloadBars) { /* creates the spreadsheet user interface
                        o: object, table object to be used as a spreadsheet;
                        i: int, the new count for spreadsheets in this instance;
                        fn: function, called after the spreadsheet is created and tuned for use;
                        reloadBars: bool, if set to true reloads id bars on top and left;
                      */
    var es = this;
    if (!i) {
      /* jS */ this.sheetCount = 0;
      /* jS */ this.i = 0;
    } else {
      /* jS */ this.sheetCount = parseInt(i);
      /* jS */ this.i = /* jS */ this.sheetCount;
      i = /* jS */ this.i;
    }
    
    o = /* jS */ this.tuneTableForSheetUse(o);
    
    /* jS */ this.readOnly[i] = o.hasClass('readonly');
    
    var objContainer = /* jS */ this.table().appendTo(/* jS */ this.obj.ui());
    var pane = /* jS */ this.obj.pane().html(o);
    
    if (this.s.autoFiller && /* jS */ this.isSheetEditable()) {
      pane.append(/* jS */ this.autoFiller());
    }
          
    /* jS */ this.sheetDecorate(o);
    
    /* jS */ this.barTop(reloadBars, o);
    /* jS */ this.barLeft(reloadBars, o);
  
    /* jS */ this.sheetTab(true);
    
    if (/* jS */ this.isSheetEditable()) {
      var formula = /* jS */ this.obj.formula();
      pane
        .mousedown(function(e) {
          if (/* jS */ es.isTd(e.target)) {
              /* jS */ es.cellOnMouseDown(e);
              return false;
            }
        })
        .bind('contextmenu', function(e) {
          /* jS */ es.cellMenu(e);
          return false;
        })
        .disableSelectionSpecial()
        .dblclick(/* jS */ this.cellOnDblClick);
    }
    
    /* jS */ this.start(i);

    /* jS */ this.setTdIds(o, /* jS */ this.i);
    
    /* jS */ this.checkMinSize(o);
    
    /* jS */ this.scrollBars(pane);
    
    /* jS */ this.addTab();
    
    if (fn) {
      fn(objContainer, pane);
    }
    
    ///* jS */ this.log('Sheet Initialized');
    
    return objContainer;
  },
  table: function() { /* creates the table control the will contain all the other controls for this instance */
    return jQuery('<table cellpadding="0" cellspacing="0" border="0" id="' + ES.id.tableControl + /* jS */ this.i + '" class="' + ES.cl.tableControl + '">' +
      '<tbody>' +
        '<tr>' + 
          '<td id="' + ES.id.barCornerParent + /* jS */ this.i + '" class="' + ES.cl.barCornerParent + '">' + //corner
            '<div style="height: ' + this.s.colMargin + '; width: ' + this.s.colMargin + ';" id="' + ES.id.barCorner + /* jS */ this.i + '" class="' + ES.cl.barCorner +'"' + (/* jS */ this.isSheetEditable() ? ' onClick="ES.instance[' + I + '].cellSetActiveBar(\'all\');"' : '') + ' title="Select All">&nbsp;</div>' +
          '</td>' + 
          '<td class="' + ES.cl.barTopTd + '">' + //barTop
            '<div id="' + ES.id.barTopParent + /* jS */ this.i + '" class="' + ES.cl.barTopParent + '"></div>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td class="' + ES.cl.barLeftTd + '">' + //barLeft
            '<div style="width: ' + this.s.colMargin + ';" id="' + ES.id.barLeftParent + /* jS */ this.i + '" class="' + ES.cl.barLeftParent + '"></div>' +
          '</td>' +
          '<td class="' + ES.cl.sheetPaneTd + '">' + //pane
            '<div id="' + ES.id.pane + /* jS */ this.i + '" class="' + ES.cl.pane + '"></div>' +
          '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>');
  },
  chartCache: [],
  safeImg: function(src, row) { /* creates and image and then resizes the cell's row for viewing
                  src: string, location of image;
                  row: int, the row number where the image is located;
                */
    return jQuery('<img />')
      .hide()
      .load(function() { //prevent the image from being too big for the row
        jQuery(this).fadeIn(function() {
          jQuery(this).addClass('safeImg');
          /* jS */ this.setHeight(parseInt(row), 'cell', false);
        });
      })
      .attr('src', src);
  },
  inPlaceEdit: function(td) { /* creates a teaxtarea for a user to put a value in that floats on top of the current selected cell
                  td: object, the cell to be edited
                */
                //socket
    var es = this;
    /* jS */ this.obj.inPlaceEdit().remove();
    var formula = /* jS */ this.obj.formula();         
    var offset = td.offset();
    var style = td.attr('style');
    var w = td.width();
    var h = td.height();
    var textarea = jQuery('<textarea id="' + ES.id.inPlaceEdit + '" class="' + ES.cl.inPlaceEdit + ' ' + ES.cl.uiInPlaceEdit + '" />')
      .css('left', offset.left)
      .css('top', offset.top)
      .width(w)
      .height(h)
      .keydown(/* jS */ this.inPlaceEditOnKeyDown.bind(this))
      .keyup(function() {
        formula.val(textarea.val());
      })
      .change(function() {
        formula.val(textarea.val());
      })
      .focus(function() {
        /* jS */ es.setNav(false);
      })
      .focusout(function() {
        /* jS */ es.setNav(true);
      })
      .blur(function() {
        /* jS */ es.setNav(true);
      })
      .bind('paste', /* jS */ es.pasteOverCells.bind(this))
      .appendTo('body')
      .val(formula.val())
      .focus()
      .select();
    
    //Make the textarrea resizable automatically
    if (jQuery.fn.elastic) {
      textarea.elastic();
    }
  },
  autoFiller: function() { /* created the autofiller object */
    return jQuery('<div id="' + (ES.id.autoFiller + /* jS */ this.i) + '" class="' + ES.cl.autoFiller + ' ' + ES.cl.uiAutoFiller + '">' +
            '<div class="' + ES.cl.autoFillerHandle + '" />' +
            '<div class="' + ES.cl.autoFillerCover + '" />' +
        '</div>')
        .mousedown(function(e) {
          var td = /* jS */ this.cellLast.td;
          if (td) {
            var loc = /* jS */ this.getTdLocation(td);
            /* jS */ this.cellSetActive(td, loc, true, /* jS */ this.autoFillerNotGroup, function() {                   
              var hlighted = /* jS */ this.obj.cellHighlighted();
              var hLoc = /* jS */ this.getTdLocation(hlighted.first());
              /* jS */ this.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
              /* jS */ this.autoFillerGoToTd(hlighted.last());
              /* jS */ this.autoFillerNotGroup = false;
            });
          }
        });
  }
});