/* Attribute Helpers
  I created this object so I could see, quickly, which attribute was most stable.
  As it turns out, all browsers are different, thus this has evolved to a much uglier beast
*/
jQuery.extend(ES.prototype,{
  width: function(o, skipCorrection) {
    return jQuery(o).outerWidth() - (skipCorrection ? 0 : this.s.boxModelCorrection);
  },
  widthReverse: function(o, skipCorrection) {
    return jQuery(o).outerWidth() + (skipCorrection ? 0 : this.s.boxModelCorrection);
  },
  height: function(o, skipCorrection) {
    return jQuery(o).outerHeight() - (skipCorrection ? 0 : this.s.boxModelCorrection);
  },
  heightReverse: function(o, skipCorrection) {
    return jQuery(o).outerHeight() + (skipCorrection ? 0 : this.s.boxModelCorrection);
  },
  syncSheetWidthFromTds: function(o) {
    var w = 0;
    o = (o ? o : /* jS */ this.obj.sheet());
    o.find('col').each(function() {
      w += jQuery(this).width();
    });
    o.width(w);
    return w;
  },
  setHeight: function(i, from, skipCorrection, o) {
    var correction = 0;
    var h = 0;
    var fn;
    
    switch(from) {
      case 'cell':
        o = (o ? o : /* jS */ this.obj.barLeft().children().eq(i));
        h = /* jS */ this.height(jQuery(/* jS */ this.getTd(/* jS */ this.i, i, 0)).parent().andSelf(), skipCorrection);
        break;
      case 'bar':
        if (!o) {
          var tr = jQuery(/* jS */ this.getTd(/* jS */ this.i, i, 0)).parent();
          var td = tr.children();
          o = tr.add(td);
        } 
        h = /* jS */ this.heightReverse(/* jS */ this.obj.barLeft().children().eq(i), skipCorrection);
        break;
    }
    
    if (h) {
      jQuery(o)
        .height(h)
        .css('height', h + 'px')
        .attr('height', h + 'px');
    }

    return o;
  }
});