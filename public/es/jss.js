jQuery.extend(ES.prototype,{
  cell_active: function(data){
    console.log('cell active socket rcd');
    console.log(data.user);
    var td = /* jS */ this.getTd(data.sheet_idx,data.loc.row,data.loc.col);
    var last_td = /* jS */ this.getTd(data.sheet_idx,data.last_row,data.last_col);
    jQuery(last_td).css('background', '');
    jQuery(td).css('background', data.user.color);
  },
  cellEditDone: function(data){
    console.log('cell edit done socket rcd');
    console.log('user');
    console.log(data.user);
    var td = /* jS */ this.getTd(data.sheet_idx,data.cell.row,data.cell.col);
    /* jS */ this.createCell(data.sheet_idx,data.cell.row,data.cell.col,data.cell.value,data.cell.formula,data.cell.calcCount);
    if(data.cell.formula){jQuery(td).attr('formula',data.cell.formula);}
    /* jS */ this.calc();
  },
  control_factory_trigger: function(data){
    console.log('trigger');
    /* jS */ this[data.fnName].apply(/* jS */ this, data.fnArgs);
  },
  jsheet_trigger: function(data){
    console.log('trigger');
    this[data.fnName].apply(jS, data.fnArgs);
  }
});