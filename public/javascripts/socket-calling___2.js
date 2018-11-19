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

var scrollToBottom = (target) => {
  $('html, body').animate({scrollTop: $(target).prop("scrollHeight")}, 800);
};

socket.on('videocall_send', function (data) {

  var strdata=JSON.stringify(data);
  document.querySelector('#modalCallAccept').setAttribute('data-str',strdata)
  document.querySelector('#modalCallAccept').setAttribute('data-type','video');
  
  var calltxt=data.my_name;
  document.getElementById("modalCallMsg").innerHTML = calltxt;
  document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+data.my_img);
  document.getElementById("modal_incomingcall").innerHTML = "INCOMING CALL";
  document.querySelector("#myCallModal .modal-footer").style.visibility = 'visible';

  $("#myCallModal").modal({backdrop: 'static', keyboard: false});
  
  var aud = document.getElementById("mdCallRingtone");
  aud.play();

  aud.onended = function() {

      $('#myCallModal').modal('hide');

      var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
      var data = JSON.parse(obj);
      // alert('call_noresponse');
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
        call_status: getCookie('call_status')

      },function(data){
        // alert('call_ noresponse emit done');
        console.log(data);
        if(document.getElementById("hangup")){
          window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
        }else{
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();

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
  $("#myCallModal").modal({backdrop: 'static', keyboard: false});
  
  var aud = document.getElementById("mdCallRingtone");
  aud.play();

  aud.onended = function() {
      $('#myCallModal').modal('hide'); // undo

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
        call_status: getCookie('call_status')

      },function(data){

        // alert('call_ noresponse emit done');
        if(document.getElementById("hangup")){
          window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
        }else{
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();

        }

      });


  };

});

socket.on('send_noresponse', function (data) {
  // alert('send_ noresponse receive');
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
  }else{
    
    var msgid = (data.msg_id).replace('TimeUuid: ', '');
    var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
    html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
    $('.message-container').append(html);
    scrollToBottom('.message-container');
    lightbox_call();

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
    
    var msgid = (data.msg_id).replace('TimeUuid: ', '');
    var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
    html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
    $('.message-container').append(html);
    scrollToBottom('.message-container');
    lightbox_call();
  }
  

});

socket.on('send_hangup_after', function (data) {
  
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.dir_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.dir_name) +'/' + encodeURI(data.dir_img));
    
  }else{

    var msgid = (data.msg_id).replace('TimeUuid: ', '');
    var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.caller_img, data.caller_name, false);
    html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.caller_name,data.partner_name, '', moment().format('h:mm a'), false);
    $('.message-container').append(html);
    scrollToBottom('.message-container');
    lightbox_call();
  }
});

socket.on('send_accept', (data) => {
 
  setCookie('call_status','receive',1);
  $('#myCallModal').modal('hide');
  
  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

});

socket.on('send_reject_caller', function (data) {
  
  if(document.getElementById("hangup")){
    
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
    
  }else{
    var msgid = (data.msg_id).replace('TimeUuid: ', '');
     var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
     html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
     $('.message-container').append(html);
     scrollToBottom('.message-container');
     lightbox_call();
  }
});

socket.on('send_reject_media_caller', function (data) {
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
  }else{
    var msgid = (data.msg_id).replace('TimeUuid: ', '');
     var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
     html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
     $('.message-container').append(html);
     scrollToBottom('.message-container');
     lightbox_call();
  
  }


});

socket.on('send_reject_media_receiver', function (data) {
  
  if(document.getElementById("hangup")){
    window.location.replace('/hayven/chat/'+'personal'+'/'+ data.partner_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.partner_name) +'/' + encodeURI(data.partner_img));
  }else{
    var msgid = (data.msg_id).replace('TimeUuid: ', '');
    var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
    html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
    $('.message-container').append(html);
    scrollToBottom('.message-container');
    lightbox_call();
  }


});



function callRejectBtn(){ // call rejected by receiver
  $('#myCallModal').modal('hide');
  var aud = document.getElementById("mdCallRingtone");
  aud.pause();
  aud.currentTime = 0;

  var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
  var data = JSON.parse(obj);
  
  socket.emit('call_reject_receiver', {
    caller_id: data.my_id,
    partner_id: data.to_id,
    partner_name: data.to_name,

    user_id : data.my_id,
    sender_name: data.my_name,
    sender_img: data.my_img,

    msgtext: data.call_type,
    conversation_id : data.conversation_id,
    hangup_id: data.hangup_id,
    hangup_name : data.hangup_name,
    hangup_img : data.hangup_img,

    reload_status: true,
    call_status: getCookie('call_status'),
    

  },function(data){
    // call rejected by receiver;
   
      if(document.getElementById("hangup")){
        window.location.replace('/hayven/chat/'+'personal'+'/'+ data.hangup_id +'/'+ encodeURI(data.conversation_id) +'/'+ encodeURI(data.hangup_name) +'/' + encodeURI(data.hangup_img));
      }else{
        var msgid = (data.msg_id).replace('TimeUuid: ', '');
        var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
        html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
        $('.message-container').append(html);
        scrollToBottom('.message-container');
        lightbox_call();

      }
    
  });
};

function callAcceptBtn(element){

  var obj = document.querySelector('#modalCallAccept').getAttribute('data-str');
  var call_type = document.querySelector('#modalCallAccept').getAttribute('data-type');

  var data = JSON.parse(obj);

  socket.emit('call_accept', { 
    //accept_id : data.to_id,
    caller_id: data.my_id,
    partner_id: data.to_id,
    
    user_id : user_id,

    sender_name: data.my_name,
    sender_img: data.my_img,

    msgtext: call_type,
    conversation_id : data.conversation_id,
    hangup_id: data.hangup_id,
    hangup_name : data.hangup_name,
    hangup_img : data.hangup_img,
    
  },function(){
    setCookie('call_status','receive',1);
    if(call_type=='audio'){
      window.location.replace('/call/audio/'+data.to_id+'/'+data.to_name+'/'+data.to_img+'/'+data.room_genid+'/'+data.my_name+'/'+data.my_img+'/'+data.my_id+'/'+data.conversation_id);
    }else{
      window.location.replace('/call/video/'+data.to_id+'/'+data.to_name+'/'+data.to_img+'/'+data.room_genid+'/'+data.my_name+'/'+data.my_img+'/'+data.my_id+'/'+data.conversation_id);
    }

  });

}

function openAudioCall(element){
  if(conversation_type=='personal'){

    socket.emit('get_isbusy_status', {
      partner_id: room_id,
      partner_name: room_name,
      partner_img: room_img,
      caller_id: user_id,
      user_id: user_id,
      sender_img: user_img,
      sender_name: user_fullname,
      conversation_id: conversation_id,
      msgtext: 'audio',
      to: to, 
      // is_room: is_room, 
      // text: str, 
      
    }, function (data) {
      console.log('get_isbusy_status',data);
      if(data.is_online){
        // user not busy
        if(parseInt(data.is_busy)==0){

          window.location.replace('/call/audio/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id);
          setCookie('call_status','new',1);

        }else{
          // user is busy
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();

          document.getElementById("modalCallMsg").innerHTML = room_name;
          document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
          document.getElementById("modal_incomingcall").innerHTML = "User Busy";
          document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

          $("#myCallModal").modal({backdrop: 'static', keyboard: false});    

          setInterval(function(){
            $('#myCallModal').modal('hide');
            
          },3000);
        }

      }else{
        // user not online
        var msgid = (data.msg_id).replace('TimeUuid: ', '');
        var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
        html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
        $('.message-container').append(html);
        scrollToBottom('.message-container');
        lightbox_call();

        document.getElementById("modalCallMsg").innerHTML = room_name;
        document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
        document.getElementById("modal_incomingcall").innerHTML = "User Not Online";
        document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

        $("#myCallModal").modal({backdrop: 'static', keyboard: false});    

        setInterval(function(){
          $('#myCallModal').modal('hide');
          
        },3000);
      }
  });
  }else{
    alert('Sorry, Conference call not available.');
  }
  

}

function openVideoCall(element){
  if(conversation_type=='personal'){

    socket.emit('get_isbusy_status', {
      partner_id: room_id,
      caller_id: user_id,
      user_id: user_id,
      sender_img: user_img,
      sender_name: user_fullname,
      conversation_id: conversation_id,
      msgtext: 'video'

    }, function (data) {
      if(data.is_online){
          // user not busy
         if(parseInt(data.is_busy)==0){
          window.location.replace('/call/video/'+room_id+'/'+room_name+'/'+room_img+'/'+conversation_id);
          setCookie('call_status','new',1);

        }else{
          // user is busy
          var msgid = (data.msg_id).replace('TimeUuid: ', '');
          var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
          html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
          $('.message-container').append(html);
          scrollToBottom('.message-container');
          lightbox_call();

          document.getElementById("modalCallMsg").innerHTML = room_name;
          document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
          document.getElementById("modal_incomingcall").innerHTML = "User Busy";
          document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

          $("#myCallModal").modal({backdrop: 'static', keyboard: false});    

          setInterval(function(){
            $('#myCallModal').modal('hide');

          },3000);
        }


      }else{

        var msgid = (data.msg_id).replace('TimeUuid: ', '');
        var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
        html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,user_fullname,room_name, '', moment().format('h:mm a'), false);
        $('.message-container').append(html);
        scrollToBottom('.message-container');
        lightbox_call();

        document.getElementById("modalCallMsg").innerHTML = room_name;
        document.querySelector('#calling_userimg').setAttribute('src',"/images/users/"+room_img);
        document.getElementById("modal_incomingcall").innerHTML = "User Not Online";
        document.querySelector("#myCallModal .modal-footer").style.visibility = 'hidden';

        $("#myCallModal").modal({backdrop: 'static', keyboard: false});    

        setInterval(function(){
          $('#myCallModal').modal('hide');
          
        },3000);
      }
     

  });

    
  }else{
    alert('Sorry, Conference call not available.');
  }

}

function callbackAudioVideo(element){
    var calltype = element.getAttribute('data-calltype');
    if(calltype=='audio'){
        $('.audio-call').click();
    }else{
        $('.video-call').click();
    }

}