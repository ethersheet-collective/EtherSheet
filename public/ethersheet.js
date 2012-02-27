/* Ethersheet.js - Main controller for es a collaborative spreasheet */
/* Authored by: Cooper Quintin <cooperq@cooperq.com> (@cooperq) */

var es = {
  sheet_values : {},
  row_size: 0,
  col_size: 0,
  table_selector: '#sheet1',
  initialize : function(){
    $('#sheet-container').append($('<table id="sheet1" class="es">'));
  },
  redraw_table: function(){
    $(this.table_selector).html('');
    $(this.table_selector).html(this.sheet_to_table());
  },
  sheet_to_table : function(){
    var self = this;
    html = '';
    for(i=0; i < this.row_size; i++){
      //draw row
      html += '<tr id="row-' + i + '">';
      //draw empty column in each row
      for(j=0; j < this.col_size; j++){
        html += '<td id="cell-' + i + '-' + j + '" ><div row='+i+' col='+j+' contenteditable=true></div></td>';
      }
      html += '</tr>';
    }
    $(this.table_selector).append(html);
    //loop through each element in the data
    for(var r in this.sheet_values){
      var row = this.sheet_values[r];
      for(var i in row){ 
      //fill in the cell
        var cell = $('#cell-'+r+'-'+ i + ' div');
        cell.attr('id', row[i].guid);
        cell.append(es.parse_value(row[i].val));
      }
    }

    $(this.table_selector +' td div').focus(function(){
      var row = $(this).attr('row');
      var col = $(this).attr('col');
      if(self.sheet_values[row][col]) {
        $(this).html(self.sheet_values[row][col].val)
      }
    });

    $(this.table_selector +' td div').blur(function(){
      if($(this).html() !=''){
        var row = $(this).attr('row');
        var col = $(this).attr('col');
        es.add_value($(this).attr('col'), $(this).attr('row'), $(this).html());
        $(this).html =  self.sheet_values[row][col].display_value
      }
    });
  },
  add_value: function(column, row, value){
    console.log('adding values ' + column + ' ' + row + ' ' + value);
    row = parseInt(row);
    column = parseInt(column);
    if(this.sheet_values[row] === undefined){
      this.sheet_values[row] = {}
    }
    this.sheet_values[row][column] = {guid: _.uniqueId(Math.floor(Math.random() * 100000)), val: value, display_value: this.parse_value(value)}
    if(column+1 >= this.col_size){
      this.col_size = column+2;
    }
    if(row+1 >= this.row_size){
      this.row_size = row+2;
    }
    this.redraw_table();
  },
  delete_index: function(index, collection){
    delete collection[index];
    new_collection = _.clone(collection);
    console.log(collection);
    console.log(new_collection);
    for(elem in new_collection){
      console.log(elem);
      if(elem > index){
        delete collection[elem]
        collection[elem - 1] = new_collection[elem];
      }
    }
    console.log(this.sheet_values);
  },
  delete_row: function(index){
    this.delete_index(index, this.sheet_values);
    this.redraw_table();
  },
  delete_column: function(index){
    for( var row in this.sheet_values ){
      this.delete_index(index, this.sheet_values[row]);
    }
    this.redraw_table();
  },
  /*takes in the contents of a cell, returns the value if its a function*/
  parse_value: function(value){
    // its not a function so return immediately
    if(value.charAt(0) == '=') {
      var formula = value.slice(1)
      formula = this.parse_cell_refs(formula)
      return formula_parser.parse(formula);
    } else {
      return value;
    }
  },

  parse_cell_refs: function(formula){
    var cells = formula.match(/[a-z]+[0-9]+/gi)
    _.each(cells, function(c){
      //TODO
      //get ref_cell object from index
      var cell = es.ord_to_ary_idx(c, es.sheet_values);
      //insert cell ID into 'reverse_dependencies' of cell obj
      //insert ref_cell ID into 'dependencies' of cell obj
      //str_rep index with cell value
      formula = formula.replace(c, es.parse_value(cell.val));
    });
    return formula;
  },

  ord_to_ary_idx: function(str, ary){
    var letters = str.match(/[a-z]+/gi)[0].split('')
    var row_idx = parseInt(str.match(/[0-9]+/g)[0]) - 1
    var col_idx = _.reduce(letters, function(memo, c){ return memo + c.toUpperCase().charCodeAt(0)-65}, 0);
    return(ary[row_idx][col_idx]);
  }

};

//when row is clicked make contents editable
//when editing is done
//update values
//redraw
