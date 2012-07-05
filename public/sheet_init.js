$(function(){
    //Here is where we initiate the sheets
    //every time sheet is created it creates a new jQuery.sheet.instance (array), to manipulate each sheet, the jQuery object is returned
  $.getJSON('/s/'+SHEET_ID+'.json', function(data) {

    var socket = io.connect(SOCKET_URL);

    socket.on('connect', function() {
      $('#disconnect-message').hide();
      console.log('connected');
      if(!docCookies.hasItem('user_id')){
        docCookies.setItem('user_id', randomString(20));
      }
      socket.emit('JOIN_ROOM', { sheet_id: SHEET_ID, user_id: docCookies.getItem('user_id') });
    });
    
    socket.on('disconnect', function() {
      $('#disconnect-message').show();
      window.setInterval(function(){
        var socket = io.connect(SOCKET_URL);
      }, 1000);
    });

    socket.on('USER_CHANGE', function(data){
      
      update_usermenu(data.sheet_data);
      socket.udata = data.sheet_data.users[docCookies.getItem('user_id')]
    });

    socket.on('ROOM_JOINED', function(){
      var sheet_init;
      if( data == null ) sheet_init = "10x30";
      else sheet_init = $.sheet.makeTable.json(data);

      $('#jQuerySheet0').sheet({
        title: SHEET_ID,
        socket: socket,
        inlineMenu: inlineMenu($.sheet.instance),
        buildSheet: sheet_init,
        height: window.innerHeight - 27,
        width: window.innerWidth - 7,
        fnSave: function(){
          $('#jSheetTitle_0').css('background','#f00');
          $.post(
            '/save', 
            {sheet_id: SHEET_ID, sheet_data: JSON.stringify($.sheet.instance[0].exportSheet.json())},
            function(){
              $('#jSheetTitle_0').css('background','none');
            }
          );
        },
        autoFiller: true
      });
    });
  });
    
  //This is for some fancy menu stuff
  var o = $('#structures');
  var top = o.offset().top - 300;
  $(document).scroll(function(e){
    if ($(this).scrollTop() > top) {
      $('#lockedMenu').removeClass('locked');
    }
    else {
      $('#lockedMenu').addClass('locked');
    }
  }).scroll();
});