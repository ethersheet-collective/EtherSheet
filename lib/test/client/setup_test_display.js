function setupTestDisplay($){
  $('<a id="test-toggle">')
  .css({
    position: 'absolute',
    top:0,
    left:0,
    cursor:'pointer',
    font:'12px monaco'
  })
  .click(function(){
    var $mocha = $('#mocha');
    var $es = $('#ethersheet-container');
    var $styles = $('#mocha-styles');
    if($mocha.css('display')=='none'){
      $es.hide();
      $styles.attr('rel','stylesheet');
      $mocha.show();
      $(this).html('[X] Display Tests');
    } else {
      $mocha.hide();
      $styles.attr('rel','disabled');
      $es.show();
      $(this).html('[ ] Display Tests');
    } 
  })
  .text('[X] Display Tests')
  .prependTo('body')
};
