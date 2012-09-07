if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

return {
  columnIndexToName: require('es_client/helpers/column_index_to_name'),
  uid: require('es_client/helpers/uid')
}

});
