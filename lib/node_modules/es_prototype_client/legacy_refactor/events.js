/* event handlers for sheet; e = event */
jQuery.extend(ES.prototype,{  

  keyDownHandler_enterOnInPlaceEdit: function(e) {
    if (!e.shiftKey) {
      return /* jS */ this.cellSetFocusFromKeyCode(e);
    } else {
      return true;
    }
  },
  keyDownHandler_enter: function(e) {
    if (!/* jS */ this.cellLast.isEdit && !e.ctrlKey) {
      /* jS */ this.cellLast.td.dblclick();
      return false;
    } else {
      return this.keyDownHandler_enterOnInPlaceEdit(e);
    }
  },
  keyDownHandler_tab: function(e) {
    return /* jS */ this.cellSetFocusFromKeyCode(e);
  },
  keyDownHandler_findCell: function(e) {
    if (e.ctrlKey) { 
      /* jS */ this.cellFind();
      return false;
    }
    return true;
  },
  keyDownHandler_redo: function(e) {
    if (e.ctrlKey && !/* jS */ this.cellLast.isEdit) { 
      /* jS */ this.undoOrRedo();
      return false;
    }
    return true;
  },
  keyDownHandler_undo: function(e) {
    if (e.ctrlKey && !/* jS */ this.cellLast.isEdit) {
      /* jS */ this.undoOrRedo(true);
      return false;
    }
    return true;
  },
  keyDownHandler_pageUpDown: function(reverse) {
    var pane = /* jS */ this.obj.pane();
    var left = /* jS */ this.cellLast.td.position().left;
    var top = 0;
    
    if (reverse) {
      top = 0;
      pane.scrollTop(pane.scrollTop() - pane.height());
      
    } else {
      top = pane.height() - (s.colMargin * 3);
      pane.scrollTop(pane.scrollTop() + top);

    }
    
    return /* jS */ this.cellSetFocusFromXY(left, top);
  },
  keyDownHandler_formulaKeydown: function(e) {

    switch (e.keyCode) {
      case key.ESCAPE:  /* jS */ this.cellEditAbandon();
        break;
      case key.ENTER:   /* jS */ this.cellSetFocusFromKeyCode(e); return false;
        break;              
      default:      /* jS */ this.cellLast.isEdit = true;
    }
  },
  keyDownHandler_documentKeydown: function(e) {
    if (/* jS */ this.nav) {
      switch (e.keyCode) {
        case key.TAB:     /* jS */ this.keyDownHandler_tab(e);
          break;
        case key.ENTER:
        case key.LEFT:
        case key.UP:
        case key.RIGHT:
        case key.DOWN:    (e.shiftKey ? /* jS */ this.cellSetHighlightFromKeyCode(e) : /* jS */ this.cellSetFocusFromKeyCode(e));
          break;
        case key.PAGE_UP: /* jS */ this.keyDownHandler_pageUpDown(true);
          break;
        case key.PAGE_DOWN: /* jS */ this.keyDownHandler_pageUpDown();
          break;
        case key.HOME:
        case key.END:   /* jS */ this.cellSetFocusFromKeyCode(e);
          break;
        case key.V:   /* jS */ this.pasteOverCells(e);
          break;
        case key.Y:   /* jS */ this.keyDownHandler_redo(e);
          break;
        case key.Z:   /* jS */ this.keyDownHandler_undo(e);
          break;
        case key.ESCAPE:  /* jS */ this.cellEditAbandon();
          break;
        case key.F:   /* jS */ this.keyDownHandler_findCell(e);
          break;
        case key.CONTROL: //we need to filter these to keep cell state
        case key.CAPS_LOCK:
        case key.SHIFT:
        case key.ALT:
          break;
        default:    /* jS */ this.obj.cellActive().dblclick(); return true;
      }
      return false;
    }
  },

  pasteOverCells: function(e) { //used for pasting from other spreadsheets
    if (e.ctrlKey || e.type == "paste") {
      var fnAfter = function() {
        /* jS */ this.updateCellsAfterPasteToFormula();
      };
      
      var doc = jQuery(document)
        .one('keyup', function() {
          fnAfter();
          fnAfter = function() {};
          doc.mouseup();
        })
        .one('mouseup', function() {
          fnAfter();
          fnAfter = function() {};
          doc.keyup();
        });
      
      return true;
    }
  },
  inPlaceEditOnKeyDown: function(e) {
    switch (e.keyCode) {
      case key.ENTER:   return /* jS */ this.keyDownHandler_enterOnInPlaceEdit(e);
        break;
      case key.TAB:     return /* jS */ this.keyDownHandler_tab(e);
        break;
      case key.ESCAPE:  /* jS */ this.cellEditAbandon(); return false;
        break;
    }
  },
  formulaChange: function(e) {
    /* jS */ this.obj.inPlaceEdit().val(/* jS */ this.obj.formula().val());
  },
  inPlaceEditChange: function(e) {
    /* jS */ this.obj.formula().val(/* jS */ this.obj.inPlaceEdit().val());
  },
  cellEditDoneHandler: function(forceCalc) { /* called to edit a cells value from this.obj.formula(), afterward setting "fnAfterCellEdit" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
                      forceCalc: bool, if set to true forces a calculation of the selected sheet
                    */
    switch (/* jS */ this.cellLast.isEdit || forceCalc) {
      case true:
        /* jS */ this.obj.inPlaceEdit().remove();
        var formula = /* jS */ this.obj.formula();
        //formula.unbind('keydown'); //remove any lingering events from inPlaceEdit
        var td = /* jS */ this.cellLast.td;
        switch(/* jS */ this.isFormulaEditable(td)) {
          case true:
            //Lets ensure that the cell being edited is actually active
            if (td && /* jS */ this.cellLast.row > -1 && /* jS */ this.cellLast.col > -1) {
              //first, let's make it undoable before we edit it
              /* jS */ this.add(td);
              //This should return either a val from textbox or formula, but if fails it tries once more from formula.
              var v = formula.val();
              var prevVal = td.text();
              var cell = /* jS */ this.spreadsheets[/* jS */ this.i][/* jS */ this.cellLast.row][/* jS */ this.cellLast.col];
              console.log('cell edit done');
              console.log(cell);
              
              if (v.charAt(0) == '=') {
                td
                  .attr('formula', v)
                  .html('');
                cell.value = v;
                cell.formula = v;
              } else {
                td
                  .removeAttr('formula')
                  .html(v);
                cell.value = v;
                cell.formula = null;
              }
              
              //reset the cell's value
              cell.calcCount = 0;
              
              if(s.socket && cell){
                cell.row = /* jS */ this.cellLast.row
                cell.col = /* jS */ this.cellLast.col
                s.socket.emit('message', { action:'cellEditDone', args:{cell: cell, sheet_idx: /* jS */ this.i, user: s.socket.udata.user} });
              }
              if (v != prevVal || forceCalc) {
                /* jS */ this.calc();
              }
              
              /* jS */ this.attrH.setHeight(/* jS */ this.cellLast.row, 'cell');
              
              //Save the newest version of that cell
              /* jS */ this.add(td);
              
              //formula.focus().select();
              /* jS */ this.cellLast.isEdit = false;
              
              /* jS */ this.setDirty(true);
              
              //perform final function call
              /* jS */ this.trigger('afterCellEdit', [{
                td: /* jS */ this.cellLast.td,
                row: /* jS */ this.cellLast.row,
                col: /* jS */ this.cellLast.col,
                spreadsheetIndex: /* jS */ this.i,
                sheetIndex: I
              }]);
            }
        }
        //now lets save the sheet
        s.fnSave();
        break;
      default:
        /* jS */ this.setHeight(/* jS */ this.cellLast.row, 'cell', false);
    }
  },
  cellEditAbandon: function(skipCalc) { /* removes focus of a selected cell and doesn't change it's value
                        skipCalc: bool, if set to true will skip sheet calculation;
                      */
    /* jS */ this.obj.inPlaceEdit().remove();
    /* jS */ this.cell_clearActive();
    /* jS */ this.bar_clearActive();
    /* jS */ this.cell_clearHighlighted();
    
    if (!skipCalc) {
      /* jS */ this.calc();
    }
    
    /* jS */ this.cellLast.td = jQuery('<td />');
    /* jS */ this.cellLast.row = -1;
    /* jS */ this.cellLast.col = -1;
    /* jS */ this.rowLast = -1;
    /* jS */ this.colLast = -1;
    
    /* jS */ this.labelUpdate('', true);
    /* jS */ this.obj.formula()
      .val('');
    
    if (this.s.autoFiller) {
      /* jS */ this.obj.autoFiller().hide();
    }
    
    return false;
  },
  cellSetFocusFromXY: function(left, top, skipOffset) { /* a handy function the will set a cell active by it's location on the browser;
                              left: int, pixels left;
                              top: int, pixels top;
                              skipOffset: bool, skips offset;
                            */
    var td = /* jS */ this.getTdFromXY(left, top, skipOffset);
    
    if (/* jS */ this.isTd(td)) {
      /* jS */ this.cell_clearHighlighted();
      
      /* jS */ this.cellEdit(td);
      return false;
    } else {
      return true;
    }
  },
  cellSetHighlightFromKeyCode: function(e) {
    var c = /* jS */ this.highlightedLast.colLast;
    var r = /* jS */ this.highlightedLast.rowLast;
    var size = /* jS */ this.sheetSize();
    jQuery(/* jS */ this.cellLast.td).mousedown();
    
    switch (e.keyCode) {
      case key.UP:    r--; break;
      case key.DOWN:    r++; break;
      case key.LEFT:    c--; break;
      case key.RIGHT:   c++; break;
    }
    
    function keepInSize(i, size) {
      if (i < 0) return 0;
      if (i > size) return size;
      return i;
    }
    r = keepInSize(r, size.height);
    c = keepInSize(c, size.width);
    
    td = /* jS */ this.getTd(/* jS */ this.i, r, c);
    jQuery(td).mousemove().mouseup();
    
    /* jS */ this.highlightedLast.rowLast = r;
    /* jS */ this.highlightedLast.colLast = c;
    return false;
  },
  cellSetFocusFromKeyCode: function(e) { /* invoke a click on next/prev cell */
    var c = /* jS */ this.cellLast.col; //we don't set the cellLast.col here so that we never go into indexes that don't exist
    var r = /* jS */ this.cellLast.row;
    var overrideIsEdit = false;
    switch (e.keyCode) {
      case key.UP:    r--; break;
      case key.DOWN:    r++; break;
      case key.LEFT:    c--; break;
      case key.RIGHT:   c++; break;
      case key.ENTER:   r++;
        overrideIsEdit = true;
        if (/* jS */ this.highlightedLast.td.length > 1) {
          var inPlaceEdit = /* jS */ this.obj.inPlaceEdit();
          var v = inPlaceEdit.val();
          inPlaceEdit.remove();
          /* jS */ this.updateCellsAfterPasteToFormula(v);
          return true;
        } else if (s.autoAddCells) {
          if (/* jS */ this.cellLast.row == /* jS */ this.sheetSize().height) {
            /* jS */ this.addRow(':last');
          }
        }
        break;
      case key.TAB:
        overrideIsEdit = true;
        if (e.shiftKey) {
          c--;
        } else {
          c++;
        }
        if (s.autoAddCells) {
          if (/* jS */ this.cellLast.col == /* jS */ this.sheetSize().width) {
            /* jS */ this.addColumn(':last');
          }
        }
        break;
      case key.HOME:    c = 0; break;
      case key.END:   c = /* jS */ this.cellLast.td.parent().find('td').length - 1; break;
    }
    
    //we check here and make sure all values are above -1, so that we get a selected cell
    c = (c < 0 ? 0 : c);
    r = (r < 0 ? 0 : r);
    
    //to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
    if (!/* jS */ this.cellLast.isEdit || overrideIsEdit) {
      //get the td that we want to go to
      var td = /* jS */ this.getTd(/* jS */ this.i, r, c);
    
      //if the td exists, lets go to it
      if (td) {
        /* jS */ this.cell_clearHighlighted();
        td = jQuery(td);
        if (td.is(':hidden')) {
          function getNext(o, reverse) {
            if (reverse) {
              c++;
              o = o.next()
            }
            else {
              c--;
              o = o.prev();
            }
            
            if (o.is(':hidden') && o.length) {
              return getNext(o, reverse);
            }
            return o;
          }
          
          td = getNext(td, c > /* jS */ this.cellLast.col);
        }
        /* jS */ this.cellEdit(td);
        return false;
      }
    }
    
    //default, can be overridden above
    return true;
  },
  cellOnMouseDown: function(e) {
    //socket
    /* jS */ this.obj.formula().blur();
    if (e.shiftKey) {
      /* jS */ this.getTdRange(e, /* jS */ this.obj.formula().val());
    } else {
      /* jS */ this.cellEdit(jQuery(e.target), true);
    }     
  },
  cellOnDblClick: function(e) {
    //socket
    /* jS */ this.cellLast.isEdit = /* jS */ this.isSheetEdit = true;
    /* jS */ this.inPlaceEdit(/* jS */ this.cellLast.td);
    ///* jS */ this.log('click, in place edit activated');
  },
  scrollBars: function(pane) { /* makes the bars scroll as the sheet is scrolled
                  pane: object, the sheet's pane;
                */
    var es = this;
    var o = { //cut down on recursion, grab them once
      barLeft: /* jS */ this.obj.barLeftParent(), 
      barTop: /* jS */ this.obj.barTopParent()
    };
    
    pane.scroll(function() {
      o.barTop.scrollLeft(pane.scrollLeft());//2 lines of beautiful jQuery js
      o.barLeft.scrollTop(pane.scrollTop());
      
      /* jS */ es.trigger('paneScroll');
    });
  },
  
  /* handles bar events, including resizing */
  barMouseDown_select: function(o, e, selectFn) {    
    selectFn(e.target);
    o
      .unbind('mouseover')
      .mouseover(function(e) {
        selectFn(e.target);
      });
      
    jQuery(document)
      .one('mouseup', function() {
        o
          .unbind('mouseover')
          .unbind('mouseup');
      });
    
    return false;
  },

  barMouseDown_height: function(o) { 
    var es = this;    
    var selectRow = function () {};

    o //let any user resize
      .unbind('mousedown')
      .mousedown(function(e) {
        var i = /* jS */ this.getBarLeftIndex(e.target);
        if (i == -1) return false;
        
        /* jS */ es.barMouseDown_first = /* jS */ es.barMouseDown_last = /* jS */ es.rowLast = i;
        /* jS */ es.barMouseDown_select(o, e, selectRow);
        return false;
      })
      .bind('contextmenu', function(e) {
        if (!/* jS */ es.isSheetEditable()) return false;
        
        var i = /* jS */ es.getBarLeftIndex(e.target);
        if (i == -1) return false;
        
        o.parent()
          .mousedown()
          .mouseup();
        
        /* jS */ es.barLeftMenu(e, i);
        
        return false;
      })
      .parent()
      .mouseover(function(e) {
        if (jQuery(e.target).attr('id')) return false;
        var i = /* jS */ es.getBarLeftIndex(e.target);
        if (i == -1) return false;
        
        /* jS */ es.resizeBarLeft(e);
        
        if (/* jS */ es.isSheetEditable())
          /* jS */ es.barLeftHandle(o, i);
      });
      
    if (/* jS */ this.isSheetEditable()) { //only let editable select
      selectRow = function(o) {
        if (!o) return false;
        if (jQuery(o).attr('id')) return false;
        var i = /* jS */ this.getBarLeftIndex(o);
        if (i == -1) return false;
        
        /* jS */ this.rowLast = i; //keep track of last row for inserting new rows
        /* jS */ this.barMouseDown_last = i;
        
        /* jS */ this.cellSetActiveBar('row', /* jS */ this.barMouseDown_first, /* jS */ this.barMouseDown_last);
      };
    }
  },
  barMouseDown_width: function(o) {
    var es = this;
    var selectColumn = function() {};
    var w = 0;
    o //let any user resize
      .unbind('mousedown')
      .mousedown(function(e) {
        var i = /* jS */ this.getBarTopIndex(e.target);
        if (i == -1) return false;
          
        /* jS */ es.barMouseDown_first = /* jS */ es.barMouseDown_last = /* jS */ es.colLast = i;
        /* jS */ es.barMouseDown_select(o, e, selectColumn);

        return false;
      })
      .bind('contextmenu', function(e) {
        if (!/* jS */ es.isSheetEditable()) return false;
        
        var i = /* jS */ es.getBarTopIndex(e.target);
        if (i == -1) return false;
        o.parent()
          .mousedown()
          .mouseup();
          
        /* jS */ es.barTopMenu(e, i);
        
        return false;
      })
      .parent()
      .mouseover(function(e) {
        if (jQuery(e.target).attr('id')) return false;
        var i = /* jS */ es.getBarTopIndex(e.target);
        if (i == -1) return false;
        ///* jS */ es.log('Column: ' +i);
        /* jS */ es.resizeBarTop(e);
        
        if (/* jS */ es.isSheetEditable()) {
          /* jS */ es.barTopHandle(o, i);
          /* jS */ es.barTopMenu(e, i, jQuery(e.target));
        }
        
        return false;
      });
    if (/* jS */ es.isSheetEditable()) { //only let editable select
      selectColumn = function(o) {
        if (!o) return false;
        if (jQuery(o).attr('id')) return false;
        var i = /* jS */ es.getBarTopIndex(o);
        if (i == -1) return false;
        
        /* jS */ es.colLast = i; //keep track of last column for inserting new columns
        /* jS */ es.barMouseDown_last = i;
        
        /* jS */ es.cellSetActiveBar('col', /* jS */ es.barMouseDown_first, /* jS */ es.barMouseDown_last);
      };
    }
  }
});