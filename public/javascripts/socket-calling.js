var per_msg_top_call = (msgid, msg_date, msg_right, msg_mirror, msg_user_img, msg_user_name, msg_is_flag) =>{
  console.log('per_msg_top_call',msgid, msg_date, msg_right, msg_mirror, msg_user_img, msg_user_name, msg_is_flag);
  $.each($('.separetor'), function(k,v){
    if($(v).text() == msg_date){
      msg_date = " "; return 0;
    }
  });
  var html = "";
  html += '<div class="separetor">'+ msg_date +'</div>';
  html += '<div class="per-msg '+ msg_right +' msg_id_'+ msgid +'" data-msgid="'+ msgid +'">';
  html +=   '<input type="checkbox" class="selectIt">';
  html +=   '<div class="profile-picture">';
  html +=     '<img src="/images/users/'+ msg_user_img +'">';
  html +=   '</div>';
  html +=   '<div class="triangle-up-right '+ msg_mirror +'"></div>';
  html +=   '<div class="msg-con">';
  html +=     '<div class="msg-header">';
  html +=       '<div class="user-name">'+ msg_user_name +'</div>';
  html +=       '<div class="toolbar">';
  html +=         '<img src="/images/incoming-reaction_20px @1x.png" class="toolbar-img" onclick="open_reaction(event)">';
  html +=         '<img src="/images/incoming-thread_20px @1x.png" class="toolbar-img">';
  if (msg_is_flag) {
    html +=         '<img src="/images/flagged_20px @1x.png" class="toolbar-img flaged" onclick="flag_unflag(event)">';
  } else {
    html +=         '<img src="/images/incoming-flag_20px @1x.png" class="toolbar-img" onclick="flag_unflag(event)">';
  }
  html +=         '<img src="/images/incoming-more_20px @1x.png" class="toolbar-img" onclick="open_more(\''+ msgid +'\',event)">';
  html +=       '</div>';
  html +=     '</div>'; // end of 'msg-header' div
  return html;
};
var per_msg_main_body_call = (msg_text,msg_type,msg_from,sender_name,receiver_name, msg_link_url, msg_time, msg_status=true) =>{
  console.log('per_msg_main_body',msg_text, msg_link_url, msg_time, msg_status);
  // Check miss call related messages
  if(msg_type=='call'){
    if(msg_from == user_id){ // right side
      var msg_text= receiver_name + " missed a " + (msg_text == "audio"? "" : msg_text) + " call from you. "+"<a href='javascript:void(0)' data-calltype='"+msg_text+"' onclick='callbackAudioVideo(this)'>Callback</a>";
    } else { // left side
      var msg_text= "You missed a " + (msg_text == "audio"? "" : msg_text) + " call from " + sender_name + ". "+"<a href='javascript:void(0)' data-calltype='"+msg_text+"' onclick='callbackAudioVideo(this)'>Callback</a>" ;
    }
  }
  // Check call related messages
  // else if(msg_type=='called'){
  //   if(row.call_duration != null){
  //     var msg_call_duration=" (" + row.call_duration + ") ";
  //   }else{
  //     var msg_call_duration=' ';
  //   }
  //   if(row.sender == user_id){
  //     // right side
  //     var msg_text= "You called "+ data[0].room_name + "." + msg_call_duration;
  //   } else {
  //     // left side
  //     var msg_text= row.sender_name + " called you." + msg_call_duration;
  //   }
  // }
  // Check call related messages
  else if(msg_type=='network'){
    if(msg_from == user_id){
      // right side
      var msg_text= "You tried to call "+ receiver_name + " from outside network. ";
    } else {
      // left side
      var msg_text= sender_name + " tried to call you from outside network. " ;
    }
  }
  else{
    var msg_text= row.msg_body;
  }

  var html = "";
  html +=     '<div class="msg-body">';
  html +=       '<div class="body-text">';
  html +=         '<span class="msg-text">'+msg_text;
  if(msg_link_url.length>0) {
    html +=         '<a href="'+ msg_link_url[0] +'" target="_blank">'+ msg_link_url[0] +'</a>';
  }
  html +=         '\n</span>';
  html +=         '<div class="msg-send-seen-delivered">';
  if(msg_status) {
    html +=           '<img src="/images/reciept-delivered_14px_200 @1x.png">';
  } else {
    html +=           '<img src="/images/reciept-sent_14px_200 @1x.png">';
  }
  html +=         '</div>';
  html +=         '<div class="per-msg-time">'+ msg_time +'</div>';
  html +=         '<div class="attachment"></div>';
  html +=         '<div class="replies"></div>';
  html +=       '</div>'; // end of 'body-text' div
  html +=       '<div class="per-msg-action"><img src="/images/NavbarIcons/actions-create_24px_FFF.png" class="pointer"></div>';
  html +=     '</div>'; // end of 'msg-body' div
  html +=     '<div class="msg-footer"></div>';
  html +=   '</div>'; // end of 'msg-con' div, which start when call the per_msg_top() function.
  html += '</div>'; // end of 'per-msg' div, which start when call the per_msg_top() function.
  return html;
};

// var scrollToBottom = (target) => {
//   $('html, body').animate({scrollTop: $(target).prop("scrollHeight")}, 800);
// };

socket.on('videocall_send', function (data) {

  var strdata=JSON.stringify(data);
  // alert(strdata);
  document.querySelector('#modalCallAccept').setAttribute('data-str',strdata)
  document.querySelector('#modalCallAccept').setAttribute('data-type','video');

  var calltxt=data.my_name;
  document.getElementById("modalCallMsg").innerHTML = calltxt;
  document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+data.my_img);
  document.getElementById("modal_incomingcall").innerHTML = "INCOMING CALL";
  document.querySelector("#myCallModal .modal-footer").style.visibility = 'visible';

  // $("#myCallModal").modal({backdrop: 'static', keyboard: false});
  $("#myCallModal").show();

  var aud = document.getElementById("mdCallRingtone");
  aud.play();

  aud.onended = function() {

    $("#myCallModal").hide();

    var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
    var data = JSON.parse(obj);

    socket.emit('call_noresponse', {
      caller_id: data.my_id,
      sender_name: data.my_name,
      sender_img: data.my_img,

      partner_id: data.to_id,
      partner_name: data.to_name,
      partner_img:data.to_img,
      user_id : data.my_id,

      msgtext: 'video',
      conversation_id : data.conversation_id,
      hangup_id: data.hangup_id,
      hangup_name : data.hangup_name,
      hangup_img : data.hangup_img,

      reload_status: true,
      call_status: getCookieCall('call_status')

    },function(data){
      // alert('call_ noresponse emit done');
      console.log(data);
      if(document.getElementById("hangup")){
        window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
      }else{
        if(to==data.caller_id){
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);

          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();
        }else{
          // alert('no draw');
        }
      }
    });
  };

});



socket.on('audiocall_send', function (data) {

  var strdata=JSON.stringify(data);

  document.querySelector('#modalCallAccept').setAttribute('data-str', strdata);
  document.querySelector('#modalCallAccept').setAttribute('data-type', 'audio');

  var calltxt = data.my_name;

  //$('#modalCallMsg').text(calltxt);
  document.getElementById("modalCallMsg").innerHTML = calltxt;
  document.querySelector('#calling_userimg').setAttribute('src', "/images/users/"+data.my_img);
  document.getElementById("modal_incomingcall").innerHTML = "INCOMING CALL";
  document.querySelector("#myCallModal .modal-footer").style.visibility = 'visible';
  // $("#myCallModal").modal({backdrop: 'static', keyboard: false});
  $("#myCallModal").show();

  var aud = document.getElementById("mdCallRingtone");
  aud.play();

  aud.onended = function() {
    // $('#myCallModal').modal('hide'); // undo
    $("#myCallModal").hide();

    var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
    var data = JSON.parse(obj);
    // alert('call_ noresponse emit');
    socket.emit('call_noresponse', {
      caller_id: data.my_id,
      partner_id: data.to_id,

      user_id : data.my_id,
      sender_name: data.my_name,
      sender_img: data.my_img,

      msgtext: 'audio',
      conversation_id : data.conversation_id,
      hangup_id: data.hangup_id,
      hangup_name : data.hangup_name,
      hangup_img : data.hangup_img,

      reload_status: true,
      call_status: getCookieCall('call_status')

    },function(data){

      // alert('call_ noresponse emit done');
      if(document.getElementById("hangup")){
        window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
      }else{
        if(to==data.caller_id){
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();
        }
      }
    });


  };

});

socket.on('send_noresponse', function (data) {
  // alert('send_ noresponse receive');
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
  }else{
    if(to==data.caller_id){
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();
    }else{
      // alert('send_noresponse no draw');
    }
  }
});

socket.on('send_hangup_before', function (data) {

  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

  document.getElementById('modalCallCloseBtn').click();

  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
  }else{
    if(to==data.caller_id){
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();
    }
  }
});

socket.on('send_hangup_after', function (data) {

  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.dir_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.dir_name) +'/' + encodeURI(data.dir_img));

  }else{
    if(to==data.caller_id){
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();
    }
  }
});

socket.on('send_accept', (data) => {
  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('call_status','receive',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  $("#myCallModal").hide();

  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

});

socket.on('send_accept_conf', (data) => {
  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('call_status','receive',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);
  $("#myCallModal").hide();

  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;
  // alert('ok');

});

socket.on('send_reject_caller', function (data) {
  console.log('send_reject_caller',data);

  if(document.getElementById("hangup")){

    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));

  }else{
    if(to==data.caller_id){
      // alert('same');
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();

    }else{
      // alert('not same');
    }

  }
});

socket.on('send_reject_media_caller', function (data) {
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
  }else{
    if(to==data.caller_id){
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();
    }

  }


});

socket.on('send_reject_media_receiver', function (data) {

  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.partner_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.partner_name) +'/' + encodeURI(data.partner_img));
  }else{
    if(to==data.caller_id){
      var msgid = (data.msg_id).replace('TimeUuid: ', '');
      var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
      html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
      $('.message-container').append(html);
      scrollToBottom('.message-container');
      lightbox_call();
    }
  }
});



socket.on('videoconf_send', function (data) {
  var strdata=JSON.stringify(data);
  // alert(strdata);
  document.querySelector('#modalCallAccept').setAttribute('data-str',strdata);
  document.querySelector('#modalCallAccept').setAttribute('data-type','videoconf');

  var calltxt=data.rootFullname;
  document.getElementById("modalCallMsg").innerHTML = data.rootFullname;
  document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+data.rootImg);

  if(data.conversation_type=="personal"){
    document.getElementById("modal_incomingcall").innerHTML = "INCOMING DIRECT CALL";
  }
  else if(data.conversation_type=="addparticipant"){
    document.getElementById("modal_incomingcall").innerHTML = "INCOMING CALL";
  }
  else{
    document.getElementById("modal_incomingcall").innerHTML = "INCOMING GROUP CALL";
  }

  document.querySelector("#myCallModal .modal-footer").style.visibility = 'visible';

  $("#myCallModal").show();

  var aud = document.getElementById("mdCallRingtone");
  aud.play();

  aud.onended = function() {

    if(data.conversation_type=="personal"){
      callRejectBtn();
    }
    else if(data.conversation_type=="addparticipant"){
      callRejectBtn();
    }
    else{
      $('#myCallModal').hide();
      aud.pause();
      aud.currentTime = 0;
    }
  };

});

socket.on('videoconf_rejoin', function (data) {
  // alert('videoconf_rejoin');
  window.open('/call/videoconf/'+partner_id+'/'+partner_name+'/'+partner_img+'/'+conversation_id+'/'+conversation_id);

});

socket.on('callconf_user_reject', function (data) {

  if($('.addParticipantPopup').is(":visible")){
    // alert('callconf_user_reject');
    $('.checkGroupCall[data-uid="'+data.user_id+'"]').click();
  }

});

socket.on('videoconf_endall', function (data) {
  // alert('end call');
  if(typeof leaveRoomClientConf == 'function') {
    leaveRoomClientConf('no_db','endcall');
  }else{

    $("#myCallModal").hide();
    // delete_cookie('reloadstatus');
    // delete_cookie('screenstatus');
    setCookieCall('reloadstatus','newconf',1);
    setCookieCall('screenstatus','no',1);
    setCookieCall('mutestatus','no',1);
    setCookieCall('timerstatus',0,1);

    var aud = document.getElementById("mdCallRingtone");
    aud.pause();
    aud.currentTime = 0;
  }


});

socket.on('conf_reg_screen', function (data) {
  // alert('conf_reg_screen');
  registerConf('screen');
  // window.location.replace('/hayven');

});

function rejoinVideoConf(element=null){
  window.open('/call/videoconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_id);
}

function reCallVideoConf(element){
  window.open('/call/videoconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id);
}

function tog_groupcall_chk(element){
  if($(element).attr('data-status')=='yes'){
    $(element).attr('data-status','no').attr('src','/images/call/groupcall_checkmark_no.png').css('opacity', '0.5');
  }else{
    $(element).attr('data-status','yes').attr('src','/images/call/groupcall_checkmark_yes.png').css('opacity', '1');
  }
}



var searchCallMember = (value) => {
  $("#memberHolderCall li").each(function () {

    if ($(this).find('label').text().toLowerCase().search(value.toLowerCase()) > -1) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });

  $("#memberHolderCall li").unhighlight();
  $("#memberHolderCall li").highlight(value);
}

function memAssignForCall(e,memUUID){

  if(e.target.checked){
    $(e.target).attr('checked','checked');

  }else{
    $(e.target).removeAttr('checked');

  }

  if($('.checkGroupCall[checked]').length==0){
    $('#btnMakecall').attr('disabled','disabled');
  }else{
    $('#btnMakecall').removeAttr('disabled');
  }
}
function cancelCall(){
  $('.videoCallMenuPopup').hide();

  // $('.create-todo-popup-title').val("");

}
var viewMemberListCall = ()=>{

  var roomid = $('#roomIdDiv').attr('data-roomid');
  // var totalMember = parseInt($('#totalMember').text());
  $('#memberHolderCall').html("");
  console.log('viewMemberListCall',allUserdata[0].users,participants);
  // var html='';
  $.each(allUserdata[0].users, function(ky, va){
    $.each(participants, function(k, v){
      if(va.id === v && va.id !=user_id){
        var design = '	<li>';
        design += '		<label class="">'+va.fullname+'';
        design += '			<input checked onclick="memAssignForCall(event,\''+va.id+'\')" id="'+va.fullname.replace(/\s/g,'')+'" class="checkGroupCall" data-uid="'+va.id+'" type="checkbox">';
        design += '			<span class="checkmark"></span>';
        design += '		</label>';
        design += '		</li>';

        $("#memberHolderCall").append(design);
      }
    });
  });

  overlayScrollbars();
  // $('#memberHolderCall').append(html);

}

function ringGroupCall(){
  var win_voip_group = window.open('');
  var convid = $('#roomIdDiv').attr('data-roomid');
  var arr_participants=[];

  $('.checkGroupCall[checked]').each(function(k,v){
    arr_participants.push($(v).attr('data-uid'));
  });
  
  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('reloadstatus','newconf',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  $('.videoCallMenuPopup').hide();

  if(set_calltype=='video'){

    win_voip_group.location.href = '/call/videoconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_type;

  }else{

    win_voip_group.location.href = '/call/audioconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_type;
  }

  setTimeout(function(){


    socket.emit('ringGroupCall', {
      name : user_id, // uid
      user_fullname : user_fullname,
      roomName : convid, // cid
      rootImg: user_img,
      rootFullname: user_fullname,
      rootId: user_id,
      arr_participants: arr_participants,
      conversation_type: conversation_type,
      call_type_route: set_calltype,
      reloadstatus: 'newconf',
      isRefresh: null,
      joinstatus: 'initiator',
      reg_status: 'webcam'

    },function(cbdata){


    });
  }, 7000);


}

function ringDirectCall(win_voip){
  var convid = $('#roomIdDiv').attr('data-roomid');
  var arr_participants=[];

  arr_participants.push(user_id);
  arr_participants.push(room_id);

  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('reloadstatus','newconf',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  $('.videoCallMenuPopup').hide();

  if(set_calltype=='video'){

    win_voip.location.href = '/call/videoconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_type;

  }else{

    win_voip.location.href = '/call/audioconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_type;
  }

  setTimeout(function(){


    socket.emit('ringGroupCall', {
      name : user_id, // uid
      user_fullname : user_fullname,
      roomName : convid, // cid
      rootImg: user_img,
      rootFullname: user_fullname,
      rootId: user_id,
      arr_participants: arr_participants,
      conversation_type: conversation_type,
      call_type_route: set_calltype,
      reloadstatus: 'newconf',
      isRefresh: null,
      joinstatus: 'initiator',
      reg_status: 'webcam'

    },function(cbdata){


    });
  }, 7000);

}


function openVideoCall(element){
  set_calltype = $(element).attr('data-type');
  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('reloadstatus','newconf',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  if(room_id){

    if(conversation_type=='personal'){
      var win_voip = window.open('');

      socket.emit('get_isbusy_conf', {
        partner_id: room_id,
        caller_id: user_id,
        user_id: user_id,
        sender_img: user_img,
        sender_name: user_fullname,
        conversation_id: conversation_id,
        msgtext: $(element).attr('data-type'),
        conversation_type: conversation_type

      }, function (data) {

        if(data.is_timeout){
          win_voip.close();
          alert('Timeout. Retry after 10 seconds.');

        }
        // else if(data.caller_busy){
        //   win_voip.close();
        //   alert('Not Allowed.');
        // }
        else if(data.partner_busy){
          win_voip.close();
          alert('User Busy.');
        }
        else if(data.is_call){
          win_voip.close();
          alert('Already in progress.');

        }
        else if(data.is_busy){

          if(set_calltype=='video'){

            win_voip.location.href = '/call/videoconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_id+'/'+conversation_type;
          }else{

            win_voip.location.href = '/call/audioconf/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id+'/'+conversation_id+'/'+conversation_type;
          }

        }else{ // new call
          // setTimeout(function(){
          ringDirectCall(win_voip);
          // }, 10000);

        }
      });

    }else{

      viewMemberListCall();

      if($('.videoCallMenuPopup').is(":visible") == false){
        $('.videoCallMenuPopup').show();
      }else{
        $('.videoCallMenuPopup').hide();
      }
    }

  }
  else{
    alert('Select whom to call first.');
  }
}


// function openAudioCall(element){
//   if(conversation_type=='personal'){

//     socket.emit('get_isbusy_status', {
//       partner_id: room_id,
//       partner_name: room_name,
//       partner_img: room_img,
//       caller_id: user_id,
//       user_id: user_id,
//       sender_img: user_img,
//       sender_name: user_fullname,
//       conversation_id: conversation_id,
//       msgtext: 'audio',
//       to: to,
//       // is_room: is_room,
//       // text: str,

//     }, function (data) {
//       console.log('get_isbusy_status',data);
//       if(data.is_online){
//         // user not busy
//         if(parseInt(data.is_busy)==0){

//           window.location.replace('/call/audio/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id);
//           setCookie('call_status','new',1);

//         }else{
//           // user is busy
//           //if(to==data.caller_id){
//             var msgid = (data.msg_id).replace('TimeUuid: ', '');
//             var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
//             html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
//             $('.message-container').append(html);
//             scrollToBottom('.message-container');
//             lightbox_call();
//           //}

//           document.getElementById("modalCallMsg").innerHTML = room_name;
//           document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
//           document.getElementById("modal_incomingcall").innerHTML = "User Busy";
//           document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

//           // $("#myCallModal").modal({backdrop: 'static', keyboard: false});
//           $("#myCallModal").show();

//           setInterval(function(){
//             // $('#myCallModal').modal('hide');
//             $("#myCallModal").hide();

//           },3000);
//         }

//       }else{
//         // user not online
//         //if(to==data.caller_id){
//           var msgid = (data.msg_id).replace('TimeUuid: ', '');
//           var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
//           html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
//           $('.message-container').append(html);
//           scrollToBottom('.message-container');
//           lightbox_call();
//         //}

//         document.getElementById("modalCallMsg").innerHTML = room_name;
//         document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
//         document.getElementById("modal_incomingcall").innerHTML = "User Not Online";
//         document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

//         // $("#myCallModal").modal({backdrop: 'static', keyboard: false});
//         $("#myCallModal").show();

//         setInterval(function(){
//           // $('#myCallModal').modal('hide');
//           $("#myCallModal").hide();

//         },3000);
//       }
//   });
//   }else{
//     alert('Audio Conference call not available.');
//   }


// }

function callAcceptBtn(element){
  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('reloadstatus','newconf',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
  var call_type = document.querySelector('#modalCallAccept').getAttribute('data-type');

  var data = JSON.parse(obj);
  var win_voip = window.open('');

  socket.emit('call_accept_conf', {
    user_id: user_id

  },function(){
    var aud = document.getElementById("mdCallRingtone");
    aud.pause();
    aud.currentTime = 0;

    $("#myCallModal").hide();
    // alert(getCookie('screenstatus'));
    if(data.call_type_route=='video'){
      win_voip.location.href = '/call/videoconf/'+data.rootId+'/'+data.rootFullname+'/'+data.rootImg+'/'+data.roomName+'/'+data.roomName+'/'+data.conversation_type;
    }else{
      win_voip.location.href = '/call/audioconf/'+data.rootId+'/'+data.rootFullname+'/'+data.rootImg+'/'+data.roomName+'/'+data.roomName+'/'+data.conversation_type;
    }

  });
}

function callRejectBtn(){ // call rejected by receiver
  $("#myCallModal").hide();
  // delete_cookie('reloadstatus');
  // delete_cookie('screenstatus');
  setCookieCall('reloadstatus','newconf',1);
  setCookieCall('screenstatus','no',1);
  setCookieCall('mutestatus','no',1);
  setCookieCall('timerstatus',0,1);

  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

  var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');

  var data_conf = JSON.parse(obj);
  var call_type = document.querySelector('#modalCallAccept').getAttribute('data-type');
  // if(call_type=='videoconf'){

  socket.emit('call_reject_conf', {
    user_id: user_id,
    data_conf: data_conf

  },function(data){

  });

  // }


};

function callbackAudioVideo(element){
  var calltype = element.getAttribute('data-calltype');
  if(calltype=='audio'){
    $('.audio_call_icon').click();
  }else{
    $('.icon_video_call').click();
  }

}
