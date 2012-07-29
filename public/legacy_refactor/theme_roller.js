jQuery.extend(ES.prototype,{ /* jQuery ui Themeroller integration */
  start: function() {
    //Style sheet     
    this.s.parent.addClass(ES.cl.uiParent);
    /* jS */ this.obj.sheet().addClass(ES.cl.uiSheet);
    //Style bars
    /* jS */ this.obj.barLeft().children().addClass(ES.cl.uiBar);
    /* jS */ this.obj.barTop().children().addClass(ES.cl.uiBar);
    /* jS */ this.obj.barCornerParent().addClass(ES.cl.uiBar);
    
    /* jS */ this.obj.controls().addClass(ES.cl.uiControl);
    /* jS */ this.obj.label().addClass(ES.cl.uiControl);
    /* jS */ this.obj.formula().addClass(ES.cl.uiControlTextBox);
  },
  
  cell_setActive: function() {
    this.cell_clearActive();
    this.cell_setHighlighted(
      /* jS */ this.cellLast.td
        .addClass(ES.cl.cellActive)
    );
  },
  cell_setHighlighted: function(td) {
    jQuery(td)
      .addClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
  },
  cell_clearActive: function() {
    /* jS */ this.obj.cellActive()
      .removeClass(ES.cl.cellActive);
  },
  cell_isHighlighted: function() {
    return (/* jS */ this.highlightedLast.td ? true : false);
  },
  cell_clearHighlighted: function() {
    if (/* jS */ this.cell_isHighlighted()) {
      /* jS */ this.obj.cellHighlighted()
        .removeClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
    }
    
    /* jS */ this.highlightedLast.rowStart = -1;
    /* jS */ this.highlightedLast.colStart = -1;
    /* jS */ this.highlightedLast.rowEnd = -1;

    /* jS */ this.highlightedLast.colEnd = -1;
    /* jS */ this.highlightedLast.td = jQuery('<td />');
  },
  
  bar_style: function(o) {
    jQuery(o).addClass(ES.cl.uiBar);
  },
  bar_setActive: function(direction, i) {
    //We don't clear here because we can have multi active bars
    switch(direction) {
      case 'top': /* jS */ this.obj.barTop().children().eq(i).addClass(ES.cl.uiActive);
        break;
      case 'left': /* jS */ this.obj.barLeft().children().eq(i).addClass(ES.cl.uiActive);
        break;
    }
  },
  bar_clearActive: function() {
    /* jS */ this.obj.barTop().add(/* jS */ this.obj.barLeft()).children('.' + ES.cl.uiActive)
      .removeClass(ES.cl.uiActive);
  },

  tab_setActive: function(o) {
    this.tab_clearActive();
    /* jS */ this.obj.tab().parent().addClass(ES.cl.uiTabActive);
  },
  tab_clearActive: function () {
    /* jS */ this.obj.tabContainer().find('span.' + ES.cl.uiTabActive)
      .removeClass(ES.cl.uiTabActive);
  },

  resize: function() {// add resizable jquery.ui if available
    var es = this;
    // resizable container div
    /* jS */ this.resizable(this.s.parent, {
      minWidth: this.s.width * 0.5,
      minHeight: this.s.height * 0.5,

      start: function() {
        /* jS */ es.obj.ui().hide();
      },
      stop: function() {
        /* jS */ es.obj.ui().show();
        es.s.width = es.s.parent.width();
        es.s.height = es.s.parent.height();
        /* jS */ es.sheetSyncSize();
      }
    });
    // resizable formula area - a bit hard to grab the handle but is there!
    var formulaResizeParent = jQuery('<span />');
    /* jS */ this.resizable(/* jS */ this.obj.formula().wrap(formulaResizeParent).parent(), {
      minHeight: /* jS */ this.obj.formula().height(), 
      maxHeight: 78,
      handles: 's',
      resize: function(e, ui) {
        /* jS */ es.obj.formula().height(ui.size.height);
        /* jS */ es.sheetSyncSize();
      }
    });
  }
});