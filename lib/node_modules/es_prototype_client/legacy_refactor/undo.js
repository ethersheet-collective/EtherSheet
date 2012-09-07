jQuery.extend(ES.prototype,{ 
/* makes cell editing undoable and redoable
          there should always be 2 cellUndoable.add()'s every time used, one to save the current state, the second to save the new
        */
  undoOrRedo: function(undo) {
    //hide the autoFiller, it can get confused
    if (s.autoFiller) {
      /* jS */ this.obj.autoFiller().hide();
    }
    
    if (undo && this.i > 0) {
      this.i--;
      this.i--;
    } else if (!undo && this.i < this.stack.length) {
      this.i++;
      this.i++;
    }
    
    this.get().clone().each(function() {
      var o = jQuery(this);
      var id = o.attr('undoable');
      if (id) {
        jQuery('#' + id).replaceWith(
          o
            .removeAttr('undoable')
            .attr('id', id)
        );
      } else {
        /* jS */ this.log('Not available.');
      }
    });
    
    /* jS */ this.cell_clearActive();
    /* jS */ this.bar_clearActive();
    /* jS */ this.cell_clearHighlighted();
    
    /* jS */ this.calc();
  },
  get: function() { //gets the current cell
    return jQuery(this.stack[this.i]);
  },
  add: function(tds) {
    var oldTds = tds.clone().each(function() {
      var o = jQuery(this);
      var id = o.attr('id');
      if (!id) return;
      o
        .removeAttr('id') //id can only exist in one location, on the sheet, so here we use the id as the attr 'undoable'
        .attr('undoable', id)
        .removeClass(ES.cl.cellHighlighted + ' ' + ES.cl.uiCellHighlighted);
    });
    
    this.stack[this.i++] = oldTds;
      
    if (this.stack.length > this.i) {
      for (var i = this.stack.length; i > this.i; i--) {
        this.stack.pop();
      }
    }
    
    
    if (this.stack.length > 20) { //undoable count, we want to be careful of too much memory consumption
      this.stack.shift(); //drop the first value
    }
      
  },
  i: 0,
  stack: []
});