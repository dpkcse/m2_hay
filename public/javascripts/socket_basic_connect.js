/**
* When message form submit
**/
$('#msg').on('keydown', function(event) {
  var code = event.keyCode || event.which;
  if (code == 13 && !event.shiftKey) { //Enter keycode = 13
    event.preventDefault();
    msg_form_submit();
  }

  // When typing start into message box
  if (typing === false) {
    typing = true;
    socket.emit('client_typing', { display: true, room_id: to, sender_id: user_id, sender_name: user_fullname, sender_img: user_img, conversation_id: conversation_id, reply: false, msg_id: false });
    timeout = setTimeout(timeoutFunction, 2000);
  }
});

var msg_sending_process = (str) => {
  var is_room = (conversation_type == 'group') ? true : false;
  $("#ChatFileUpload").closest('form').trigger("reset");
  $("#FileComment").val("");
  $("#attach_chat_file_list").html("");
  socket.emit('send_message', {
    conversation_id: conversation_id, sender_img: user_img,
    sender_name: user_fullname, to: to,
    is_room: is_room, text: str,
    attach_files: filedata[0], thread_root_id: swap_conversation_id,tags:tagListForFileAttach
  });
  filedata.length = 0; filedata = [];
  audiofile.length = 0; audiofile = [];
  imgfile.length = 0; imgfile = [];
  otherfile.length = 0; otherfile = [];
  videofile.length = 0; videofile = [];
  formDataTemp.length = 0; formDataTemp = [];
};

// socket.on('message_sent', function(data) {
//     $('.typing-indicator').html("");
//     filedata[0] = []; filedata = []; formDataTemp = [];
//     audiofile = []; videofile = []; imgfile = []; otherfile = [];
//     var html = draw_msg(data.msg, true);
//     $('#msg-container').append(html);
//     scrollToBottom('.chat-page .os-viewport');
//     // sent_delivered();
//     last_delivered_always_show();
//     $('#msg').html('').focus();
//
//     if(data.tagmsgid != undefined){
//       if(msgIdsFtag.indexOf(data.tagmsgid) === -1){
//         msgIdsFtag.push(data.tagmsgid);
//       }
//     }
//
// });
var message_sent = (data) => {
    $('.typing-indicator').html("");
    filedata.length = 0; filedata = [];
    audiofile.length = 0; audiofile = [];
    imgfile.length = 0; imgfile = [];
    otherfile.length = 0; otherfile = [];
    videofile.length = 0; videofile = [];
    formDataTemp.length = 0; formDataTemp = [];
    var html = draw_msg(data.msg, true);
    $('#msg-container').append(html);
    scrollToBottom('.chat-page .os-viewport');
    // sent_delivered();
    last_delivered_always_show();
    $('#msg').html('').focus();

    if(data.tagmsgid != undefined){
      if(msgIdsFtag.indexOf(data.tagmsgid) === -1){
        msgIdsFtag.push(data.tagmsgid);
      }
    }
};

/**
* timeoutFunction call after 2 second typing start
**/
var timeoutFunction = () => {
    var rep = false;
    var msgid = false;
    if($('#threadReplyPopUp').is(':visible')){
        msgid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_msg_id');
        rep = true;
    }
    typing = false;
    socket.emit("client_typing", { display: false, room_id: to, sender_id: user_id, sender_name: user_fullname, sender_img: user_img, conversation_id: conversation_id, reply: rep, msg_id: msgid});
};

/**
* Receive typing event and
* display indicator images hide and show
**/
socket.on('server_typing_emit', function(data) {
  if (data.sender_id != user_id) {
      if($('#threadReplyPopUp').is(':visible') && $('.thread-user-msg').attr('data-rep_msg_id') == data.msg_id && data.reply === true){
          draw_rep_typing_indicator(data.display, data.img, data.name);
      }
      else if (conversation_id == data.conversation_id && data.reply === false) {
        draw_typing_indicator(data.display, data.img, data.name);
      }
  }
});

/**
* When a new message come,
* Check user message container is opne or not.
* if open, it show's the message in the container
* else marked as a notification that new message arived
**/
socket.on('newMessage', function(message) {
    // socket.emit('has_login', function(has_loged_in){
        // if(has_loged_in){
    if (conversation_id == message.msg.conversation_id) {
        if(user_id == message.msg.sender){
            console.log(100, message);
            message_sent(message);
            $('.msg-separetor-unread').hide();

            // for files tag. while file uploading
            if(message.msg.attch_audiofile != null || message.msg.attch_imgfile != null || message.msg.attch_otherfile != null || message.msg.attch_videofile != null  ){
                if(tagListForFileAttach.length>0){
                    $.each(tagListForFileAttach, function(kt,vt){
                        $("#filesTag"+message.msg.msg_id).append('<span class="filesTag">'+vt+'</span>')
                    });
                    $("#filesTag"+message.msg.msg_id).show();
                    $("#filesTagHolder"+message.msg.msg_id).show();
                }
            }
        }else{
            console.log(103, message);
            $('.typing-indicator').html("");
            message.msg.has_delivered = 1;
            var html = draw_msg(message.msg, true);
            $('#msg-container').append(html);
            $('.msg-separetor-unread').hide();
            scrollToBottom('.chat-page .os-viewport');

            socket.emit('seen_emit', { msgid: message.msg.msg_id, senderid: to, receiverid: user_id, conversation_id: conversation_id });
            $('.msg-send-seen-delivered').hide();
        }
    }
    else if ($("#conv" + message.msg.conversation_id).length == 1 && message.msg.sender !== user_id){
    var count = $("#conv"+message.msg.conversation_id).find(".unreadMsgCount").html();
    count = Number(count)>0?Number(count)+1:1;
    $("#conv"+message.msg.conversation_id).find(".unreadMsgCount").html(count);
    $("#conv"+message.msg.conversation_id).attr("data-nom", count);
    if($(".scroll_unreadMsg").is(":visible"))
        count = Number($(".scroll_unreadMsg>h5>span").text())+1;
    display_show_hide_unread_bar(count);
    // Add delivered
    var adin = [];
    adin.push(message.msg);
    socket.emit('add_delivered_if_need', adin);

        // push notification
        Push.Permission.request();
        Push.create(message.msg.sender_name, {
            body: message.msg.msg_body,
            icon: "/images/users/" + message.msg.sender_img,
            timeout: 10000,
            onClick: function () {
                document.getElementById("conv" + message.msg.conversation_id).click();
            }
        });
    }
  unread_msg_conv_intop();
  // }
// });
});

/**
* When add new emoji reaction,
**/
socket.on('emoji_on_emit', function(data) {
    if(data.sender_id != user_id)
        append_reac_emoji(data.msg_id, '/images/emoji/' + data.emoji_name + '.png', 1);
});

socket.on('updateRoomPrivecy', function (data){
    if ($("#conv" + data.conversation_id).is(':visible')){
        if ($("#conv" + data.conversation_id).attr('data-conversationtype') == 'group'){

            let roomTitle = $("#conv" + data.conversation_id +" .usersName").text();
            if (data.grpprivacy == 'private') {
                $("#conv" + data.conversation_id).find('span:first-child').removeClass('hash').addClass('lock');

            }

            if (data.grpprivacy == 'public') {
                $("#conv" + data.conversation_id).find('span:first-child').removeClass('lock').addClass('hash');
            }

            toastr["success"]("\"" + roomTitle + "\" room is " + data.grpprivacy + " now", "Success");
        }
    }
});

socket.on('groupCreate', function (params) {
    if (!$("#conv" + params.room_id).is(':visible')) {
        if (params.memberList.indexOf(user_id) > -1) {
            if (params.teamname.length > 17) {
                var over_length = "over_length";
            }
            if (params.teamname.indexOf(',') > -1) {
                $("#directListUl").append('<li data-octr="' + params.createdbyid + '"  onclick="start_conversation(event)" data-subtitle="' + params.selectecosystem + '" data-id="' + params.createdbyid + '" data-conversationtype="group" data-tm= "' + params.memberList.length + '" data-conversationid="' + params.room_id + '" data-name="' + params.teamname + '" data-img="feelix.jpg"  id="conv' + params.room_id + '" class="' + over_length + '"><span class="' + (params.grpprivacy === 'public' ? "hash" : "lock") + '"></span> <span class="usersName">' + params.teamname + '</li><span class="remove removeThisGroup" onclick="removeThisGroup(\'' + params.room_id + '\')" data-balloon="Click to leave" data-balloon-pos="left" style="display: none;"></span></span>');
            } else {
                $("#channelList").prepend('<li data-octr="' + params.createdbyid + '"  onclick="start_conversation(event)" data-subtitle="' + params.selectecosystem + '" data-id="' + params.createdbyid + '" data-conversationtype="group" data-tm= "' + params.memberList.length + '" data-conversationid="' + params.room_id + '" data-name="' + params.teamname + '" data-img="feelix.jpg"  id="conv' + params.room_id + '" class="' + over_length + '"><span class="' + (params.grpprivacy === 'public' ? "hash" : "lock") + '"></span> <span class="usersName">' + params.teamname + '</li><span class="remove removeThisGroup" onclick="removeThisGroup(\'' + params.room_id + '\')" data-balloon="Click to leave" data-balloon-pos="left" style="display: none;"></span></span>');
            }

            sidebarLiMouseEnter();

            // <span class="sub-text"> - ' + params.selectecosystem + '</span>

            toastr["success"]("You are added to a new " + params.grpprivacy + " room \"" + params.teamname + "\" by \"" + params.createdby + "\"", "Success");
        }
    }
});

socket.on('removefromGroup', function (params) {
    if (params.targetID == user_id){
        toastr["success"]("You are removed from a " + params.grpprivacy + " room \"" + params.teamname + "\" by \"" + params.createdby + "\"", "Success");
        $("#conv" + params.room_id).remove();
    }
});

/* Reply Messages */
$('#msg_rep').on('keydown', function(event) {
  var code = event.keyCode || event.which;
  if (code == 13 && !event.shiftKey) { //Enter keycode = 13
    event.preventDefault();
    rep_msg_send_fn();
    var containerHeight = $(".replies-container").height();
    $('.forScrollBar .os-viewport').animate({ scrollTop: containerHeight }, 1);
  }

    // When typing start into reply message box
    if (typing === false) {
      typing = true;
      var convid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_con_id');
      var msgid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_msg_id');

      socket.emit('client_typing', { display: true, room_id: to, sender_id: user_id, sender_name: user_fullname, sender_img: user_img, conversation_id: convid, reply: true, msg_id: msgid });
      timeout = setTimeout(timeoutFunction, 2000);
    }
});
var rep_msg_send_fn = () =>{
    var str = $('#msg_rep').html();
    str = str.replace(/(<\/?(?:img|br)[^>]*>)|<[^>]+>/ig, '$1'); // replace all html tag
    str = convert(str);
    str = str.replace(/&nbsp;/gi, '').trim();
    str = str.replace(/^(\s*<br( \/)?>)*|(<br( \/)?>\s*)*$/gm, '');
    if (str != "") {
        var is_room = (conversation_type == 'group') ? true : false;
        $("#ChatFileUpload").closest('form').trigger("reset");
        $("#FileComment").val("");
        $("#attach_chat_file_list").html("");
        if($('.msg_id_'+thread_root_id).length > 0)
            var convid = conversation_id;
        else
            var convid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_con_id');
        socket.emit('send_rep_message', {
          conversation_id: thread_id, sender_img: user_img,
          sender_name: user_fullname, to: to,
          is_room: is_room, text: str,
          attach_files: filedata[0], thread_root_id: convid,
          root_msg_id: thread_root_id
        });
        socket.emit('update_thread_count', { msg_id: thread_root_id, conversation_id: convid, last_reply_name: user_fullname });
        draw_rep_count(thread_root_id);
        filedata.length = 0; filedata = [];
        audiofile.length = 0; audiofile = [];
        imgfile.length = 0; imgfile = [];
        otherfile.length = 0; otherfile = [];
        videofile.length = 0; videofile = [];
        formDataTemp.length = 0; formDataTemp = [];
        $("#msg_rep").html("");
        $("#msg_rep").focus();
    }
};
socket.on('newRepMessage', function(message) {
    if(message.status){
        if (to == message.msg.sender_id || thread_id == message.msg.conversation_id) {
            draw_rep_msg(message.msg);
        }

        if( user_id != message.msg.sender){
            unread_replay_data.push({
                rep_conv: message.msg.conversation_id,
                msg_id: message.msg.msg_id,
                root_conv_id: message.root_conv_id,
                root_msg_id: message.root_msg_id
            });
            urrm_pn = JSON.parse(JSON.stringify(unread_replay_data));
            var nor = Number($('#conv'+message.root_conv_id).attr('data-nor'));
            $('#conv'+message.root_conv_id).attr('data-nor', Number(nor+1));
            $('#conv'+message.root_conv_id).addClass("has_unread_replay");
            // $(".side_bar_thread_ico").show();
            $(".thread_active").show();

            // push notification
            Push.Permission.request();
            Push.create(message.msg.sender_name, {
                body: message.msg.msg_body,
                icon: "/images/users/"+message.msg.sender_img,
                timeout: 10000,
                onClick: function() {
                    // document.getElementById("conv"+message.msg.conversation_id).click();
                }
            });
        }
    }
});
socket.on('update_thread_counter', function(data){
    draw_rep_count(data.msg_id);
})
/* End Reply Messages */

socket.on('receive_emit', function(data) {
    update_msg_seen_status(data);
});

socket.on('update_msg_receive_seen', function(data) {
  $.each(data.msgid, function(k, v) {
    update_msg_seen_status(v);
  });
});


$(function(){
    var my_all_conv = [];
    var my_all_personal_conv = [];
    var my_all_group_conv = [];

    $.each($('[id^=conv]'), function(k,v){
        if($(v).is("li"))
            my_all_conv.push($(v).attr('data-conversationid'));
    });

    $.each($('[id^=conv]'), function(k,v){

        if($(v).is("li") && $(v).attr("data-conversationtype") == 'personal')
            my_all_personal_conv.push($(v).attr('data-conversationid'));

        setCookie("myAllPerConvId", my_all_personal_conv);
    });

    $.each($('[id^=conv]'), function(k,v){

        if($(v).is("li") && $(v).attr("data-conversationtype") == 'group')
            my_all_group_conv.push($(v).attr('data-conversationid'));

        setCookie("myAllGrpConvId", my_all_group_conv);
    });

    socket.emit('all_unread_msg', {my_all_conv}, function(data){
        // console.log(data);
        // Unread messages
        $.each(data.all_unread, function(k,v){
            var id = v.conversation_id.toString();
            var c = Number($("#conv"+id).find(".unreadMsgCount").text());
            $("#conv"+id).find(".unreadMsgCount").html(c+1);
            $("#conv"+id).attr("data-nom", c+1);
        });
        unread_msg_conv_intop();
        total_unread_count = data.all_unread.length;
        display_show_hide_unread_bar(total_unread_count);
        // Unread end

        // Add delivered
        socket.emit('add_delivered_if_need', data.all_unread);

        // Unread replay
        if(data.unread_replay.length > 0){
            // $(".side_bar_thread_ico").show();
            $(".thread_active").show();

            $.each(data.rep_con_data, function(k,v){
                $.each(data.unread_replay, function(kk, vv){
                    if(v.rep_id == vv.conversation_id){
                        unread_replay_data.push({
                            rep_conv: vv.conversation_id,
                            msg_id: vv.msg_id,
                            root_conv_id: v.conversation_id,
                            root_msg_id: v.msg_id
                        });
                        $("#conv"+v.conversation_id).addClass("has_unread_replay");
                        var nor = Number($("#conv"+v.conversation_id).attr("data-nor"));
                        $("#conv"+v.conversation_id).attr("data-nor", Number(nor+1));
                    }
                });
            });
            urrm_pn = JSON.parse(JSON.stringify(unread_replay_data));
        }
        if (getCookie('lastNotification') != "") {
            $('#conv'+ getCookie('lastNotification')).trigger('click');
            setCookie('lastNotification', '', 1);
        }else{
           $("#conv"+user_id).trigger('click'); 
        }
        // $("#conv"+user_id).trigger('click');
        // $("#msg").focus();

    });
});

socket.on('get_delivered_notification', function(data){
    // console.log(243, data);
    $.each(data, function(k,v){
        if($('.msg_id_'+v.msg_id).length >0){
            $('.msg_id_'+v.msg_id).find('.msg-send-seen-delivered').text(' - Delivered');
        }
    });
    last_delivered_always_show();
    // console.log(data);
});


var load_older_data = (conv_id, msg_id) =>{
  socket.emit('load_older_msg', {conversation_id: conv_id, msg_id: msg_id}, (result)=>{
    if(result.old_msgs.length > 0){
      $.each(result.old_msgs, function(k,v){
        draw_msg(v, false);
      });
      $('.chat-page .os-viewport').scrollTop($('.msg_id_'+msg_id).offset().top);
    }
  });
};

socket.on('room_delete_broadcast', function (data) {
    if (data.user_id != user_id) {
        if (data.conv_participants.indexOf(user_id) > -1) {
            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["info"]("\"" + data.user_fullname + "\" has deleted \"" + data.title + "\", please contact with \"" + data.user_fullname + "\" for further assistence", "Hi " + user_fullname + " !!!");

            $("#conv" + data.roomId).remove();
            if ($("#createChannelContainer").is(':visible')) {
                if ($("#conv" + data.roomId).hasClass('active')) {
                    closeRightSection();
                }

            }
        }
    }
});

