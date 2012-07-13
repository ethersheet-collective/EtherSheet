ES.themeRoller = { /* jQuery ui Themeroller integration */
  start: function() {
    //Style sheet     
    s.parent.addClass(ES.cl.uiParent);
    /* jS */ this.obj.sheet().addClass(ES.cl.uiSheet);
    //Style bars
    /* jS */ this.obj.barLeft().children().addClass(ES.cl.uiBar);
    /* jS */ this.obj.barTop().children().addClass(ES.cl.uiBar);
    /* jS */ this.obj.barCornerParent().addClass(ES.cl.uiBar);
    
    /* jS */ this.obj.controls().addClass(ES.cl.uiControl);
    /* jS */ this.obj.label().addClass(ES.cl.uiControl);
    /* jS */ this.obj.formula().addClass(ES.cl.uiControlTextBox);
  },
  cell: {
    setActive: function() {
      this.clearActive();
      this.setHighlighted(
        /* jS */ this.cellLast.td
          .addClass(ES.cl.cellActive)
      );
    },
    setHighlighted: function(td) {
      jQuery(td)
        .addClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
    },
    clearActive: function() {
      /* jS */ this.obj.cellActive()
        .removeClass(ES.cl.cellActive);
    },
    isHighlighted: function() {
      return (/* jS */ this.highlightedLast.td ? true : false);
    },
    clearHighlighted: function() {
      if (/* jS */ ES.themeRoller.cell.isHighlighted()) {
        /* jS */ this.obj.cellHighlighted()
          .removeClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
      }
      
      /* jS */ this.highlightedLast.rowStart = -1;
      /* jS */ this.highlightedLast.colStart = -1;
      /* jS */ this.highlightedLast.rowEnd = -1;

      /* jS */ this.highlightedLast.colEnd = -1;
      /* jS */ this.highlightedLast.td = jQuery('<td />');
    }
  },
  bar: {
    style: function(o) {
      jQuery(o).addClass(ES.cl.uiBar);
    },
    setActive: function(direction, i) {
      //We don't clear here because we can have multi active bars
      switch(direction) {
        case 'top': /* jS */ this.obj.barTop().children().eq(i).addClass(ES.cl.uiActive);
          break;
        case 'left': /* jS */ this.obj.barLeft().children().eq(i).addClass(ES.cl.uiActive);
          break;
      }
    },
    clearActive: function() {
      /* jS */ this.obj.barTop().add(/* jS */ this.obj.barLeft()).children('.' + ES.cl.uiActive)
        .removeClass(ES.cl.uiActive);
    }
  },
  tab: {
    setActive: function(o) {
      this.clearActive();
      /* jS */ this.obj.tab().parent().addClass(ES.cl.uiTabActive);
    },
    clearActive: function () {
      /* jS */ this.obj.tabContainer().find('span.' + ES.cl.uiTabActive)
        .removeClass(ES.cl.uiTabActive);
    }
  },
  resize: function() {// add resizable jquery.ui if available
    // resizable container div
    /* jS */ this.resizable(s.parent, {
      minWidth: s.width * 0.5,
      minHeight: s.height * 0.5,

      start: function() {
        /* jS */ this.obj.ui().hide();
      },
      stop: function() {
        /* jS */ this.obj.ui().show();
        s.width = s.parent.width();
        s.height = s.parent.height();
        /* jS */ this.sheetSyncSize();
      }
    });
    // resizable formula area - a bit hard to grab the handle but is there!
    var formulaResizeParent = jQuery('<span />');
    /* jS */ this.resizable(/* jS */ this.obj.formula().wrap(formulaResizeParent).parent(), {
      minHeight: /* jS */ this.obj.formula().height(), 
      maxHeight: 78,
      handles: 's',
      resize: function(e, ui) {
        /* jS */ this.obj.formula().height(ui.size.height);
        /* jS */ this.sheetSyncSize();
      }
    });
  }
};