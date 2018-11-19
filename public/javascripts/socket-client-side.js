var socket = io();
var onlineUserList = [];

/**
 * When connect event occured
 **/
socket.on('connect', function(){
  // emait the user as 'login' and send 'user_id' and 'user_fullname' which save into database
  // then update the database table field, that user is loged in by ajax calling.
  // console.log('client-socket 9 ', {from: user_id, text: user_fullname});
  socket.emit('login', {from: user_id, text: user_fullname});

  // logout emait received from server
  socket.on("logout", function(data) {
    // console.log(14, data);
    removeA(onlineUserList,data.userdata.from);
    $('.online_'+data.userdata.from).addClass('offline').removeClass('online');
    $('.online_'+data.userdata.from).addClass('box-default').removeClass('box-success');
  });

});


/* reconnect_attempt attempt */
socket.on('reconnect_attempt', () =>{
    socket.emit('has_login', function(res){
        if(! res){
            window.location.href="/";
        }
    });
});

/**
 * When disconnect event occured
 **/
socket.on('disconnect', function(){
    console.log('Disconnected');
});

/**
* after login,
* receive a welcome message with all online user lists, handled by socket.
**/
socket.on('online_user_list', function(message) {
  // console.log(25, message);
  $.each(message.text, function(k, v) {
    // console.log(v);
    onlineUserList.push(v);
    // $('.online_'+v).addClass('online').removeClass('offline');
    $('.online_' + v).addClass('online').removeClass('offline');
    $('.online_' + v).addClass('box-success').removeClass('box-default');
  });
});

/**
* When a new user login,
* broadcast to other user, that someone joined.
* and user list marked as online
**/
socket.on('new_user_notification', function(notification) {
  // console.log(40, notification);
  onlineUserList.push(notification.text.from);
  $('.online_' + notification.text.from).addClass('online').removeClass('offline');
  $('.online_' + notification.text.from).addClass('box-success').removeClass('box-default');
});




// $(window).bind("load", function() {
//   $('a, div, span, p').css('opacity', 1);
// });
