var filedata = [], audiofile = [], imgfile = [], otherfile = [], videofile = [], formDataTemp = []; // file upload related
var temp_str_for_rep = "";

$(function(){
    // join all activity as room
    var alltodoli = $('.com-t-l');
    var all_my_activity_id = [];
    $.each(alltodoli, function(k,v){
        all_my_activity_id.push($(v).attr('data-activityid'));
    });
    socket.emit('todochat_join', {all_my_activity_id, user_id}, (res) =>{
        if(res.status){
            $.each(res.data.all_unread, function(k, v){
                draw_ur_count(v.activity_id);
                if($("#activity_"+v.activity_id).hasClass('selected')){
                    $('#chat_icon>img').attr('src', '/images/basicAssets/Chat_active.svg');
                    $('#chat_icon>img').css({'width': '14px', 'height': '14px'});
                }
            });
        }
    });
    // end joining
});

var scrollToBottom = (target) => {
	$(target).animate({ scrollTop: $(target).prop("scrollHeight") }, 800);
};

var find_new_reply = (activity_id) =>{
	// console.log(activity_id);
	socket.emit('has_new_reply', {activity_id, user_id}, (res) =>{
        if(res.unread_replay.length>0){
			$('#chat_icon>img').attr('src', '/images/basicAssets/Chat_active.svg');
	        $('#chat_icon>img').css({'width': '14px', 'height': '14px'});
		}
        else{
            if($("#activity_"+activity_id).attr("data-urm")==0){
                $('#chat_icon>img').attr('src', '/images/basicAssets/Chat.svg');
    	        $('#chat_icon>img').css({'width': '14px', 'height': '14px'});
            }
	    }
    });
};

var open_file_browser_for_send_msg = () => {
	var activity_id = $('#chat_icon').attr('data-activity_id');
	if (typeof activity_id == 'undefined') {
		alert("please select a todo, then click here");
	} else if (activity_id == "") {
		open_file_browser();
		$("#uploadbtn").hide();
		$("#uploadbtn_f_todo").show();
	} else {
		open_file_browser();
		$("#uploadbtn").show();
		$("#uploadbtn_f_todo").hide();
		$("#chat_icon").trigger('click');
		$("#chat_icon").addClass('fromOutsideLiveChat');
	}
};

// open the todo live chat for todo
$("#chat_icon").click(function (event) {
    var activity_id = $(event.target).attr('data-activity_id');
    if(typeof activity_id == 'undefined'){
        alert("please select a todo, then click here");
    }else{
        var room_title = $('#activity_'+activity_id).find('.toDoName').html();
        $('.todo_chat_room_title').html("Task Chat");
        $('#chatbox').attr('placeholder', 'Message '+ room_title +' …');
        $("#live-chat").removeClass();
        $("#live-chat").addClass('live_chat_box_'+activity_id);
        $("#live-chat").show();
        $('.chat-history').html("");
        if($('#actCre').val() == user_id)
            if($('#activity_'+activity_id).attr('data-urm') > 0)
                $('#activity_'+activity_id).append('<span class="remove" onclick="hideThisTodo(event,\''+activity_id+'\')"></span>');
        $('#chat_icon>img').attr('src', '/images/basicAssets/Chat.svg');
        $('#activity_'+activity_id).attr('data-urm', 0);
        $('#activity_'+activity_id).find('.unreadMsgCount').html("");
        var arg_data = {activity_id: activity_id, user_id: user_id};

        var has_reply_msgid = [];
        socket.emit('find_todo_chat_history', arg_data, (res_data) =>{
            if(res_data.status == true){
                $('.msgNotFound').remove();
            }else{
                if($('.msgNotFound').length < 1)
                $('.chat-history').append('<h1 class="msgNotFound">No messages found in this thread !</h1>')

            }
            var numsl = []; // need_update_message_seen_list
            if(res_data.status){
                $.each(res_data.conversation, function(k, v){
                    if (v.msg_status == null) {
    					if (v.sender == user_id) {
    						// This msg send by this user; so no need to change any seen status
    					} else {
    						// This msg receive by this user; so need to change seen status
    						numsl.push(v.msg_id);
    					}
    				}

    				// If msg status have some user id, then
    				else {
    					if (v.msg_status.indexOf(user_id) > -1) {
    						// This msg already this user seen
    					} else {
    						if (v.sender != user_id) {
    							// This msg receive by this user; so need to change seen status
    							numsl.push(v.msg_id);
    						}
    					}
    				}
    				if(numsl.length == 1)
    					draw_urhr();
                    if(v.has_reply > 0)
                        has_reply_msgid.push(v.msg_id);
                    per_todo_msg(v, true);
                });
				scrollToBottom('.todo-chat-body .os-viewport');

                if(numsl.length > 1)
                    find_urhr_add_s(numsl.length);

                if(has_reply_msgid.length > 0){
                    socket.emit('find_unread_reply', {has_reply_msgid, activity_id, user_id}, (rep)=>{
                        if(rep.reply.length>0){
                            $.each(rep.reply, function(k, v){
                                $.each(rep.msgs, function(kk, vv){
                                    if(vv.activity_id == v.rep_id){
                                        if(vv.sender != user_id && (vv.msg_status == null || (vv.msg_status).indexOf(user_id) == -1) ){
                                            v.nour = (v.nour>0)?v.nour+1:1;
                                        }
                                    }
                                });
                            });
                            $.each(rep.reply, function(k, v){
                                if(v.nour>0){
                                    $('.todo_msgid_'+v.msg_id).find('.replyicon').attr('src','/images/basicAssets/custom_thread_for_reply_unread.svg');
                                    var msg = (v.nour>1)?' replies':' reply';
                                    $('.todo_msgid_'+v.msg_id).find('.last_rep_text').append('<span class="urtext">&nbsp;(<span class="urrepno">'+ v.nour +'<span> new '+ msg +')<span>');
                                }
                            });
                        }
                    });
                }

				if(chatmessagestag != undefined){
					if(chatmessagestag.length>0){
						$.each(chatmessagestag, function(k,v){
							msgIdsFtag.push(v.id);
							if(v.tag_title != undefined){
								if (v.tag_title !== null) {
									if (v.tag_title.length > 0) {
										$.each(v.tag_title, function (kt, vt) {
											$("#filesTag" + v.message_id).append('<span class="filesTag">' + vt + '</span>');
										});
										$("#filesTag" + v.message_id).show();
										$("#filesTagHolder" + v.message_id).show();
									}
								}
							}
						});
					}
                }

                if (numsl.length > 0) {
                    var arg_data2 = { msgids: numsl, user_id: user_id, activity_id: activity_id };
                    socket.emit('update_todo_msg_status', arg_data2);
    			}
            }
        });

        // Floating Date in the top bar
		$('.todo-chat-body .os-viewport').on('scroll', function () {
			var scrollTop = $('.todo-chat-body .os-viewport').scrollTop();
    		if (scrollTop === 0)
    			$('#top-date').html("");
    		$(".msg-separetor:visible").each(function () {
    			var last = true;
    			if (last)
    				$(this).removeClass('not_visible');
    			if ($(this).offset().top < 100) {
    				last = false;
    				$(this).addClass("not_visible");
    				$('#top-date').html($('.not_visible').last().attr('data-date'));
    			}
    		});
    	});
    }
    // if($(".chat-history").html() == ""){
    //     console.log('null')
    // }else{
    //     console.log('find')
    // }
});
// end open the todo live chat for todo


// close todo live chat
$('.chat-close').click(function () {
    $("#live-chat").css('display', 'none');
    $("#todo_chat_search_input").val("");
    temp_str_for_rep = "";
    hide_search_input();
    find_new_reply($('#chat_icon').attr('data-activity_id'));
});
// end close todo live chat


// send message from todo live chat
$('#chatbox').keypress(function (event) {
  var code = event.keyCode || event.which;
  if (code == 13 && !event.shiftKey) { //Enter keycode = 13
    event.preventDefault();
    todo_msg_send();
  }
  // When typing start into message box
  if (typing === false) {
    typing = true;
    socket.emit('todo_user_typing', {
        display: true,
        sender_id: user_id,
        sender_name: user_fullname,
        sender_img: user_img,
        activity_id: $('#chat_icon').attr('data-activity_id')});
    timeout = setTimeout(timeoutFunction, 2000);
  }
});
var todo_msg_send = () =>{
    var str = $('#chatbox').html();
    if(str != ""){
        var arg_data = {
                activity_id: $('#chat_icon').attr('data-activity_id'),
                sender_id: user_id,
                sender_img: user_img,
                sender_name: user_fullname,
                text: str,
                attach_files: filedata[0],
                thread_root_id: 0,
                root_msg_id: 0,
				tags:tagListForFileAttach
            };
        socket.emit('todo_send_message', arg_data, (res)=>{
            filedata.length = 0; filedata = [];
            audiofile.length = 0; audiofile = [];
            imgfile.length = 0; imgfile = [];
            otherfile.length = 0; otherfile = [];
            videofile.length = 0; videofile = [];
            formDataTemp.length = 0; formDataTemp = [];
        });
        $('#chatbox').html("");
        $('#chatbox').focus();
    }
};
// end send message from todo live chat


// get a new todo msg
// if same thread is open then draw it
// or draw the counter
socket.on('todo_msg_receive', function(data){
    $('.msg-separetor-unread').hide();
    $('.msgNotFound').remove();
    $('.typing-indicator').html("");
    if(data.status && $('.live_chat_box_'+data.msg.activity_id).is(':visible')){
        per_todo_msg(data.msg, true);

        // for tag listing while append new msg with file
if(data.msg.attch_audiofile != null || data.msg.attch_imgfile != null || data.msg.attch_otherfile != null || data.msg.attch_videofile != null  ){
			if(tagListForFileAttach.length>0){
				$.each(tagListForFileAttach, function(kt,vt){
					$("#filesTag"+data.msg.msg_id).append('<span class="filesTag">'+vt+'</span>')
				});
				$("#filesTag"+data.msg.msg_id).show();
				$("#filesTagHolder"+data.msg.msg_id).show();
			}
		}
		scrollToBottom('.todo-chat-body .os-viewport');
    }
    else
        draw_ur_count(data.msg.activity_id);
});


// draw todo thread unread counter
var draw_ur_count = (activity_id) =>{
    var nour = $("#activity_"+activity_id).attr("data-urm"); // number of unread = nour
    nour++;
    $("#activity_"+activity_id).attr("data-urm", nour);
    // $("#activity_"+activity_id).find(".unreadMsgCount").html(nour);
    $("#activity_"+activity_id).find(".unreadMsgCount").html(' ');
    $("#activity_"+activity_id).find(".remove").remove();
};


// draw unread msg group head
var draw_urhr = () =>{
	var html = '<div class="msg-separetor-unread"><p>1 new message</p></div>';
	$(".chat-history").append(html);
};
var find_urhr_add_s = (nour) =>{
	$(".chat-history").find('.msg-separetor-unread>p').html(nour + ' new messages');
};
 
// draw todo live chat per msg
var per_todo_msg = (data, append=true) =>{
	// var sender_delete_it = "";
		// if(data.has_delete != null){
		// 	if((data.has_delete).indexOf(user_id) == -1){
		// 		var sender_delete_it = ((data.has_delete).indexOf('Sender delete it')>-1)?"<i><img src='/images/delete_msg.png' class='deleteicon'>This message was deleted.</i><span class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span><br>":"";
		// 	}
		// 	else{
		// 		data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> You deleted this message.</i><span class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span>";
		// 		attach_show = false;
		// 	}

		// } 

		// if(data.msg_body == "This message was deleted.")
		// 	data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> This message was deleted.</i><span  class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span>";
    
    if (data.has_hide != null)
        if ((data.has_hide).indexOf(user_id) > -1)
            return;
        
    // if(data.has_delete == null || (data.has_delete).indexOf(user_id) == -1){
    var attach_show = true, deletebtn_active = true, permanently = false;
    if (data.has_delete != null) {
        if ((data.has_delete).indexOf(user_id) == -1) {
            if ((data.has_delete).indexOf('Sender delete it') > -1) {
                data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> This message was deleted.</i><span  class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span>";
                attach_show = false;
            }
        }
        else {
            data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> You deleted this message.</i><span class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span>";
            attach_show = false;
        }
    }

    if (data.msg_body == "This message was deleted.") {
        data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> This message was deleted.</i><span  class='silent_delete' onclick='removeThisLine(event,\""+data.msg_id+"\")'> (Remove this line)</span>";
        attach_show = false;
    }
    /* Start Date Group By */
    var msg_date = moment(data.created_at).calendar(null, {
        sameDay: '[Today]',
        lastDay: '[Yesterday]',
        lastWeek: function(now) {return '['+this.format("MMM Do, YYYY")+']';},
        sameElse: function(now) {return '['+this.format("MMM Do, YYYY")+']';}
    });
    var temp_date = msg_date;

    if(append){
        $.each($('.msg-separetor'), function(k, v) {
            if ($(v).text() == msg_date) {
                msg_date = null;
                return 0;
            }
        });
        if(msg_date !== null && $('.msg-separetor-unread').length == 0){
            var date_html = '<div class="msg-separetor" data-date="'+ msg_date +'"><p>'+ msg_date +'</p></div>';
            $(".chat-history").append(date_html);
        }
    }
    /* End Date Group By */

    var html =  '<div class="chat-message clearfix todo_msgid_'+ data.msg_id +'" data-msgid="'+ data.msg_id +'">';
    html +=         '<img class="user-imgs" src="/images/users/'+ data.sender_img +'" alt="'+ data.sender_img +'">';
    html +=         '<div class="chat-message-content clearfix" data-sendername="'+ data.sender_name +'">';
    html +=             '<h5>';
    html +=                 data.sender_name +'<span class="chat-time">'+ moment(data.created_at).format('h:mm a') +'</span>';
    // Check flag and unflag message
    if(data.has_flagged != null && (data.has_flagged).indexOf(user_id) != -1){

		html += '&nbsp;<img onclick="flaggedUserMsg(event)" class="flaggedMsg" src="/images/basicAssets/Flagged.svg">';
    }
    html +=             '</h5>';
    if(data.attch_imgfile!==null || data.attch_videofile!==null || data.attch_otherfile!==null)
	{
		if(user_id === data.sender){if(attachFileList.indexOf(data.msg_id) === -1){attachFileList.push(data.msg_id);}}
		html +=			'<p class="chating_para_2" style="font-style: italic;">' + data.msg_body +'</p>';
	}else
        html +=			'<p class="chating_para_2">' + data.msg_body +'</p>';
    if(data.attch_videofile!==null){
        html += per_msg_video_attachment(data.attch_videofile);
    }
    if(data.attch_imgfile!==null){
        html += per_msg_img_attachment(data.attch_imgfile, data.sender_name, data.sender_img);
    }
    if(data.attch_audiofile!==null){
        html += per_msg_audio_attachment(data.attch_audiofile);
    }
    if(data.attch_otherfile!==null){
        html += per_msg_file_attachment(data.attch_otherfile);
    }
    html +=             '<div class="replies">';
    // Check emoji reaction message
    if(data.has_emoji !== null){
        $.each(data.has_emoji, function(k, v){
            if(v>0)
            html += emoji_html(k, "/images/emoji/"+ k +".png", v);
        });
    }
    html +=             '</div>';
    if(data.has_reply > 0){
        html += per_msg_rep_btn(data.has_reply, data.last_reply_time, data.last_reply_name);
    }
    html +=         '</div>';
    html +=         '<div class="msgs-form-users-options">';
    html +=             '<div class="call-rep-emoji" onclick="viewEmojiList(event)"><img src="/images/basicAssets/AddEmoji.svg" alt=""></div>';
    // Check flag and unflag message
    if(data.has_flagged != null && (data.has_flagged).indexOf(user_id) != -1){
        html +=             '<div class="flag" onclick="flggUserMsg(event)"><img src="/images/basicAssets/Flagged.svg" alt=""></div>';
    }
    else{
        html +=	            '<div class="flag" onclick="flggUserMsg(event)"><img src="/images/basicAssets/NotFlagged.svg" alt=""></div>';
    }
    html +=	            '<div class="replys" onclick="threadReply(event)"><img src="/images/basicAssets/Thread.svg" alt=""></div>';
    html +=	            '<div class="more" onclick="moreMsgAction(event)">';
    html +=                 '<img src="/images/basicAssets/MoreMenu.svg" alt="">';
    html +=                     '<div class="msg-more-popup" style="display:none">';
    html +=	                    '<p onclick="viewCreateTodoPopup()">Create a Task</p>';
    html +=	                    '<p>Schedule an event</p>';
    html +=                     '<p>Start a poll</p>';
    html +=                     '<p>Share Message</p>';
    var delete_all_active = (data.sender == user_id);
    html +=                     '<p onclick="delete_this_msg(event, '+ delete_all_active +')">Delete Message</p>';
    html +=	                '</div>';
    html +=             '</div>';
    html +=         '</div>';
    html +=     '</div>';

    html +=			'<div id="filesTagHolder'+data.msg_id+'" style="display:none;margin: 8px 9% 0px; float: left;font-family: hvWorkSans;"><span style="margin: 0px 8px 0px 0px; float: left;font-size: 14px;font-family: hvAssistant;font-style: italic;">'+data.sender_name  +' tagged the attachment(s) as</span>  <span style="float: left;margin-top: 0px;" id="filesTag'+data.msg_id+'"></span></div>';

    $('.chat-history').append(html);
};
var moreMsgAction = (event)=>{
    if($(event.target).find('.msg-more-popup').is(':visible')){
        $(event.target).find('.msg-more-popup').hide();
    }else{
        $('.msg-more-popup').hide();
        $(event.target).find('.msg-more-popup').show();
    	var chat_Page_height = $('.chat-page').height();
    	var scrollY = event.pageY;
    	var total = chat_Page_height - event.pageY;
    	if(total < 35){
    		$(event.target).find('.msg-more-popup').css('top', '-195px')
    	}
    }
	// $('.msgs-form-users').mouseenter(function(){
	// 	if($(this).height() > 60){
	// 		$(this).children('.msgs-form-users-options').css('top', '16px');
	// 	}
	// });
};
var per_msg_img_attachment = (msg_attach_img, sender_name, sender_img) => {
	var html = "";
	var strWindowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=600,height=400";
	$.each(msg_attach_img, function(k,v){
		html +=	'<img data-sender_name="'+ sender_name +'" data-sender_img="'+ sender_img +'" class="img_attach" src="'+ file_server +'/upload/'+ v +'" alt="'+ v +'" onclick="window.open(\''+ file_server +'/upload/'+ v +'\', \'Image Viewer\', \''+ strWindowFeatures +'\')">';
	});
	return html;
}
var per_msg_video_attachment = (msg_attach_video) => {
	var html = "";
	$.each(msg_attach_video, function(k, v) {
		var file_type = v.split('.').pop().toLowerCase();
		html += '<video controls class="media-msg">';
		html += '<source class="vdo_attach" src="' + file_server + '/upload/' + v + '" type="video/' + file_type + '">';
		html += 'Your browser does not support HTML5 video.';
		html += '</video>';
	});
	return html;
}
var per_msg_audio_attachment = (msg_attach_audio) => {
	var html = "";
	$.each(msg_attach_audio, function(k, v) {
		var file_type = v.split('.').pop().toLowerCase();
		html += '<audio controls class="media-msg">';
		html += '<source class="ado_attach" src="' + file_server + '/upload/' + v + '" type="audio/' + file_type + '">';
		html += 'Your browser does not support audio tag.';
		html += '</audio>';
	});
	return html;
}

var per_msg_file_attachment = (msg_attach_file) => {
	var html = "";
	$.each(msg_attach_file, function(k, v) {
		var file_type = v.split('.').pop().toLowerCase();
		switch (file_type) {
			case 'ai':
			case 'mp3':
			case 'doc':
			case 'docx':
			case 'indd':
			case 'js':
			case 'sql':
			case 'pdf':
			case 'ppt':
			case 'pptx':
			case 'psd':
			case 'svg':
			case 'xls':
			case 'xlsx':
			case 'zip':
			case 'rar':
			ext = file_type;
			break;
			default:
			ext = 'other';
		}
		html += '<a href="' + file_server + '/upload/' + v + '" target="_blank">';
		html += '<div class="fil_attach attach-file lightbox" data-filetype="' + ext + '" data-src="' + file_server + '/upload/' + v + '">';
		html += '<img src="/images/file_icon/' + ext + '.png" alt="' + v + '">';
		html += '<div class="file-name">' + v.substring(0, v.lastIndexOf('@')) + '.' + file_type + '</div>';
		html += '<div class="file-time">' + moment().format('h:mm a') + '</div>';
		html += '</div>';
		html += '</a>';
		// console.log(html);
	});
	return html;
};
/* Start Emoji */
var viewEmojiList = (event) => {
	var design 	= '<div class="emojiListContainer">';
    	design += 	'<img src="/images/emoji/grinning.png" data-name="grinning" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/joy.png" data-name="joy" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/open_mouth.png" data-name="open_mouth" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/disappointed_relieved.png" data-name="disappointed_relieved" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/rage.png" data-name="rage" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/thumbsup.png" data-name="thumbsup" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/thumbsdown.png" data-name="thumbsdown" onclick="add_reac_into_replies(event)">';
    	design += 	'<img src="/images/emoji/heart.png" data-name="heart" onclick="add_reac_into_replies(event)">';
    	design += '</div>';


	if(!$(event.target).closest(".call-rep-emoji").find(".emojiListContainer").length == 1){
		$(event.target).closest(".call-rep-emoji").append(design);
	}
	// else{
	// 	$(event.target).closest(".emoji").find(".emojiListContainer").remove();
	// }
};
var add_reac_into_replies = (event) => {
    var activity_id = $('#chat_icon').attr('data-activity_id');
	var msg_id = $(event.target).closest('.chat-message').attr('data-msgid');
	var src = $(event.target).attr('src');
	var emojiname = $(event.target).attr('data-name');
    var count = 1;
    var data = { user_id, user_fullname, msg_id, activity_id, emojiname, count};

    socket.emit('add_reac_emoji', data, (res)=>{
        console.log(res);
        if (res.status) {
            if (res.rep == 'add') {
                append_reac_emoji(msg_id, src, 1);
                // socket.emit("emoji_emit", { room_id: to, msgid: msg_id, emoji_name: emojiname, count: 1, sender_id: user_id });
            } else if (res.rep == 'delete') {
                update_reac_emoji(msg_id, src, -1);
            } else if (res.rep == 'update') {
                update_reac_emoji(msg_id, '/images/emoji/' + res.old_rep + '.png', -1);
                append_reac_emoji(msg_id, src, 1);
            }
        }
    });
};
var append_reac_emoji = (msgid, src, count) => {
	var allemoji = $('.todo_msgid_' + msgid).find('.emoji img');
	if (allemoji == undefined) {
		emoji_html_append(msgid, src, count);
	} else {
		var noe = 0;
		$.each(allemoji, function(k, v) {
			if ($(v).attr('src') == src) {
				noe = parseInt($(v).next('.count-emoji').text());
				$(v).next('.count-emoji').text(noe + 1);
			}
		});
		if (noe === 0) {
			emoji_html_append(msgid, src, count);
		}
	}
	$('.emojiListContainer').remove();
};
var update_reac_emoji = (msgid, src, count) => {
	var allemoji = $('.todo_msgid_' + msgid).find('.emoji img');

	var noe = 0;
	$.each(allemoji, function(k, v) {
		if ($(v).attr('src') == src) {
			noe = parseInt($(v).next('.count-emoji').text());
			if (noe == 1)
			$(v).closest('.emoji').remove();
			else
			$(v).next('.count-emoji').text(noe - 1);
		}
	});

	$('.emojiListContainer').remove();
};
var emoji_html_append = (msgid, src, count) => {
	var emoji_name = ((src.split('/'))[3]).replace('.png', '');
	var html = emoji_html(emoji_name, src, count);
	$('.todo_msgid_' + msgid).find('.replies').append(html);
};
var emoji_html = (emoji_name, src, count) =>{
	var html =  '<span class="emoji '+emoji_name+' "  onmouseover="open_rep_user_emo(event)" onmouseout="close_rep_user_emo(event)">';
    	html +=    '<img src="' + src + '" data-name="'+emoji_name+'" onclick="add_reac_into_replies(event)"> ';
    	html +=    '<span class="count-emoji">' + count + '</span>';
    	html += '</span>';
	return html;
}
var open_rep_user_emo = (event) => {
	if ($('.rep_user_emo_list').length == 0) {
        // var activity_id = $('#chat_icon').attr('data-activity_id');
		var msg_id = $(event.target).closest('.chat-message').attr('data-msgid');
		var emojiname = (($(event.target).closest('.emoji').find('img').attr('src').split('/'))[3]).replace('.png', '');

        var data = { msg_id, emojiname };
        socket.emit('emoji_rep_list', data, (res)=>{
            if (res.length > 0) {
                var nameList = [];
                var na = "";
                var html = '<div class="rep_user_emo_list">';
                $.each(res, function(k, v) {
                    nameList.push(v.user_fullname);
                });
                if(nameList.indexOf(user_fullname) !== -1){
                    if(nameList.length >1){
                        na = "You & "
                    }else{
                        na  = "You"
                    }
                    var tempIndx = nameList[0];
                    nameList[0] = na;
                    nameList[nameList.indexOf(user_fullname)] = tempIndx;
                }
                $.each(nameList, function(k, v) {
                    html += v+" ";
                });
                html += '</div>';
                $('.todo_msgid_' + msg_id).find('.'+ emojiname).append(html);
                var div_offset = $(event.target).closest('.emoji').offset();
                // console.log(div_offset);
                $('.rep_user_emo_list').css('left', div_offset.left - 290);
            }
        });

        // $.ajax({
		// 	url: '/hayven/emoji_rep_list',
		// 	type: 'POST',
		// 	data: { msgid: msg_id, emojiname: emoji_name },
		// 	dataType: 'JSON',
		// 	success: function(res) {
		// 		if (res.length > 0) {
		// 			var nameList = [];
		// 			var na = "";
		// 			var html = '<div class="rep_user_emo_list">';
		// 			$.each(res, function(k, v) {
		// 				nameList.push(v.user_fullname);
		// 			});
		// 			if(nameList.indexOf(user_fullname) !== -1){
		// 				if(nameList.length >1){
		// 					na = "You & "
		// 				}else{
		// 					na  = "You"
		// 				}
		// 				var tempIndx = nameList[0];
		// 				nameList[0] = na;
		// 				nameList[nameList.indexOf(user_fullname)] = tempIndx;
		// 			}
		// 			$.each(nameList, function(k, v) {
		// 				html += v+" ";
		// 			});
		// 			html += '</div>';
		// 			$('.msg_id_' + msg_id).find('.'+ emoji_name).append(html);
		// 			var div_offset = $(event.target).closest('.emoji').offset();
		// 			// console.log(div_offset);
		// 			$('.rep_user_emo_list').css('left', div_offset.left - 290);
		// 		}
		// 	},
		// 	error: function(err) {
		// 		console.log(err.responseText);
		// 	}
		// });
	}
};
var close_rep_user_emo = (event) => {
	$('.rep_user_emo_list').remove();
};
/* End Emoji */
/* Flag and unflag */
var flggUserMsg = (event) =>{
	var flaggedMsg ='<img class="flaggedMsg" onclick="flaggedUserMsg(event)" src="/images/basicAssets/Flagged.svg">';
	var flagged ='<img  src="/images/basicAssets/Flagged.svg" alt="Flagged">';
	var not_flagged = '<img src="/images/basicAssets/NotFlagged.svg" alt="Not Flagged">';

	var msg_id = $(event.target).closest('.chat-message').attr('data-msgid');
	var activity_id = $('#chat_icon').attr('data-activity_id');

	if($(event.target).closest('.chat-message').find(".flaggedMsg").length == 1){
        var data = { user_id, msg_id, is_add: 'no', activity_id };
        socket.emit('todo_flag_unflag', data, (res)=>{
            if (res.status) {
                $(event.target).closest(".chat-message").find(".flaggedMsg").remove();
                $(event.target).closest(".chat-message").find(".flag").html(not_flagged);
            }
        });
	}else{
		var data = { user_id, msg_id, is_add: 'yes', activity_id };
        socket.emit('todo_flag_unflag', data, (res)=>{
            if (res.status) {
                $(event.target).closest(".chat-message").find(".chat-time").append(flaggedMsg);
                $(event.target).closest(".chat-message").find(".flag").html(flagged);
            }
        });
	}
};
/* End flag */



var thread_id = "";
var thread_root_id = "";

var threadReply = (event) =>{
	if($('#threadReplyPopUp').is(":visible") == false){
        var activity_id = $('#chat_icon').attr('data-activity_id');
		var msgid = $(event.target).closest('.chat-message').attr('data-msgid');

		$.ajax({
			url: "/hayven/todo_open_thread",
			type: "POST",
			data: { msg_id: msgid, activity_id: activity_id },
			dataType: "JSON",
			success: function(threadrep) {
				thread_id = threadrep;
				thread_root_id = msgid;

                $('.todo_msgid_'+msgid).find('.replyicon').attr('src','/images/basicAssets/custom_thread_for_reply.svg');
                $('.todo_msgid_'+msgid).find('.urtext').remove();

				/* main thread msg html design */
				draw_reply_popup_html(
					activity_id,
					msgid,
					$('.todo_msgid_'+msgid).find('.user-imgs').attr('alt'),
					$('.todo_msgid_'+msgid).find('.chat-message-content').attr('data-sendername'),
					$('.todo_msgid_'+msgid).find('.chat-time').html(),
					$('.todo_msgid_'+msgid).find('.chating_para_2').html());
				$('#msg_rep').attr('placeholder', 'Reply to '+ $('.todo_msgid_'+msgid).find('.chat-message-content').attr('data-sendername') +'');

				/* end of main thread msg html design */

				$('#threadReplyPopUp .replies-container').html("");
				$('.pevThread').hide();
				$('.nextThread').hide();
				var all_rep_btn = $(".msgReply");
                for(var i=0; i < all_rep_btn.length; i++){
                    if($(all_rep_btn[i]).closest('.chat-message').attr('data-msgid') == msgid){
						if(i > 0) {
							$('.pevThread').show();
							$('.pevThread').attr("data-ano_msg_id", $(all_rep_btn[i-1]).closest('.chat-message').attr('data-msgid'));
						}
						if(i+1 < all_rep_btn.length) {
							$('.nextThread').show();
							$('.nextThread').attr("data-ano_msg_id", $(all_rep_btn[i+1]).closest('.chat-message').attr('data-msgid'));
						}
					}
				}

				$('#threadReplyPopUp').show();
				$('#msg_rep').focus();

				find_and_show_reply_msg(msgid);
			},
			error: function(err) {
				console.log(err.responseText);
			}
		});

        $('#threadReplyPopUp').show();
	}
};
var read_rep_counter = 0;
var find_and_show_reply_msg = (msgid) => {
	var noofreply = parseInt($('.todo_msgid_'+msgid).find('.no-of-replies').text());
	$('.reply-separetor p').html(noofreply+' Reply');
	// $.each(unread_replay_data, function(k,v){
	// 	if(v.root_msg_id == msgid){
	// 		var nor = Number($('#conv'+v.root_conv_id).attr('data-nor'));
	// 		$('#conv'+v.root_conv_id).attr('data-nor', (nor-1 > 0)?nor-1:"");
	// 		$('#conv'+v.root_conv_id).find('.unreadMsgCount').text((nor-1 > 0)?nor-1:"");
	// 		$('.todo_msgid_'+msgid).css('background', 'transparent');
	// 		v.root_msg_id = 0;
	// 		v.root_conv_id = 0;
	// 		read_rep_counter++;
	// 	}
	// });
	// if((unread_replay_data.length - read_rep_counter) == 0){
	// 	$(".thread_active").hide();
	// 	read_rep_counter = 0;
	// }
	if (noofreply > 0) {
		socket.emit('find_todo_reply', { msg_id: msgid, activity_id: $('#chat_icon').attr('data-activity_id') }, (reply_list) => {
			if (reply_list.status) {
				var reply_list_data = _.sortBy(reply_list.data, ["created_at", ]);
                // console.log(reply_list_data);
				var need_update_reply_message_seen_list = [];
				var rep_conv_id = reply_list_data[0].activity_id;
				$.each(reply_list_data, function(key, row) {
					if (row.msg_status == null) {
						if (row.sender == user_id) {
							// This msg send by this user; so no need to change any seen status
						} else {
							// This msg receive by this user; so need to change seen status
							need_update_reply_message_seen_list.push(row.msg_id);
						}
					}
					// If msg status have some user id, then
					else {
						if (row.msg_status.indexOf(user_id) > -1) {
							// This msg already this user seen
						} else {
							if (row.sender != user_id) {
								// This msg receive by this user; so need to change seen status
								need_update_reply_message_seen_list.push(row.msg_id);
							}
						}
					}
					if(need_update_reply_message_seen_list.length == 1)
						draw_rep_urhr();
					draw_rep_msg(row);
				});
                if(need_update_reply_message_seen_list.length > 1)
                    find_rep_urhr_add_s(need_update_reply_message_seen_list.length);

                if (need_update_reply_message_seen_list.length > 0) {
                    var arg_data2 = { msgids: need_update_reply_message_seen_list, user_id: user_id, activity_id: rep_conv_id };
                    socket.emit('update_todo_msg_status', arg_data2);
    			}
			} else {
				console.log('replay search query error', reply_list); // error meessage here
			}
		});
	}
};
// var find_and_show_reply_msg_popup = (msgid, convid) => {
// 	$.each(unread_replay_data, function(k,v){
// 		if(v.root_msg_id == msgid){
// 			var nor = Number($('#conv'+v.root_conv_id).attr('data-nor'));
// 			$('#conv'+v.root_conv_id).attr('data-nor', (nor-1 > 0)?nor-1:"");
// 			$('#conv'+v.root_conv_id).find('.unreadMsgCount').text((nor-1 > 0)?nor-1:"");
// 			$('.todo_msgid_'+msgid).css('background', 'transparent');
// 			v.root_msg_id = 0;
// 			v.root_conv_id = 0;
// 			read_rep_counter++;
// 		}
// 	});
// 	if((unread_replay_data.length - read_rep_counter) == 0){
// 		$(".thread_active").hide();
// 		read_rep_counter = 0;
// 	}
// 	// if (noofreply > 0) {
// 		socket.emit('find_todo_reply', { msg_id: msgid, conversation_id: convid }, (reply_list) => {
// 			if (reply_list.status) {
// 				var reply_list_data = _.sortBy(reply_list.data, ["created_at", ]);
//
// 				var need_update_reply_message_seen_list = [];
// 				var rep_conv_id = reply_list_data[0].conversation_id;
// 				$.each(reply_list_data, function(key, row) {
// 					if (row.msg_status == null) {
// 						if (row.sender == user_id) {
// 							// This msg send by this user; so no need to change any seen status
// 						} else {
// 							// This msg receive by this user; so need to change seen status
// 							need_update_reply_message_seen_list.push(row.msg_id);
// 						}
// 					}
// 					// If msg status have some user id, then
// 					else {
// 						if (row.msg_status.indexOf(user_id) > -1) {
// 							// This msg already this user seen
// 						} else {
// 							if (row.sender != user_id) {
// 								// This msg receive by this user; so need to change seen status
// 								need_update_reply_message_seen_list.push(row.msg_id);
// 							}
// 						}
// 					}
// 					if(need_update_reply_message_seen_list.length == 1)
// 						draw_rep_urhr();
// 					draw_rep_msg(row);
// 				});
// 				var thisconv_count = 0;
// 				for(var m=0; m<urrm_pn.length; m++){
// 					if(urrm_pn[m].root_conv_id == convid)
// 						thisconv_count++;
// 					else
// 						thisconv_count = 1;
// 					if(urrm_pn[m].root_conv_id == convid && urrm_pn[m].root_msg_id == msgid){
// 						if(thisconv_count>1){
// 							if(urrm_pn[m-1].root_conv_id == convid){
// 								$('.pevThread').show();
// 								$('.pevThread').attr("data-ano_msg_id", urrm_pn[m-1].root_msg_id);
// 								$('.pevThread').attr("data-conv_id", urrm_pn[m-1].root_conv_id);
// 							}
// 						}
// 						if(m+1 < urrm_pn.length){
// 							if(urrm_pn[m+1].root_conv_id == convid){
// 								$('.nextThread').show();
// 								$('.nextThread').attr("data-ano_msg_id", urrm_pn[m+1].root_msg_id);
// 								$('.nextThread').attr("data-conv_id", urrm_pn[m+1].root_conv_id);
// 							}
// 						}
// 					}
// 				}
//
// 				if (need_update_reply_message_seen_list.length > 0) {
// 				  $.ajax({
// 				    url: '/hayven/update_msg_status',
// 				    type: 'POST',
// 				    data: {
// 				      msgid_lists: JSON.stringify(need_update_reply_message_seen_list),
// 				      user_id: user_id,
// 					  conversation_id: rep_conv_id
// 				    },
// 				    dataType: 'JSON',
// 				    success: function(res) {
// 				      // socket.emit('update_msg_seen', {
// 				      //   msgid: need_update_reply_message_seen_list,
// 				      //   senderid: to,
// 				      //   receiverid: user_id,
// 				      //   conversation_id: convid
// 				      // });
// 				    },
// 				    error: function(err) {
// 				      console.log(err);
// 				    }
// 				  });
// 				}
//
// 				// separetor_show_hide();
// 			} else {
// 				console.log('replay search query error', reply_list); // error meessage here
// 			}
// 		});
// 	// }
// };
var draw_reply_popup_html = (rep_con_id, rep_msg_id, img, name, time, body) =>{
	var main_msg_body = '<div class="thread-user-photo"><img src="/images/users/'+ img +'" alt="'+ img +'"></div>';
	main_msg_body += '<div class="thread-user-msg" data-rep_con_id="'+ rep_con_id +'" data-rep_msg_id="'+ rep_msg_id +'"><h4>';
	main_msg_body += name;
	main_msg_body += '&nbsp;<span class="thread-msg-time">'+ time +'</span>';
	main_msg_body += '</h4>';
	main_msg_body += '<p>'+ body +'</p>';
	main_msg_body += '</div>';
	$('#threadReplyPopUp .main-thread-msgs').html(main_msg_body);
};
var draw_rep_msg = (row) =>{
	var html = 	'<div class="main-thread-msgs rep_msg_'+ row.msg_id +'" style="margin-top:18px;">';
	html += 		'<div class="thread-user-photo">';
	html +=				'<img src="/images/users/'+ row.sender_img +'" alt="">';
	html += 		'</div>';
	html +=			'<div class="thread-user-msg">';
	html += 			'<h4>'+ row.sender_name + '&nbsp;<span class="thread-msg-time">'+ moment(row.created_at).format('h:mm a') +'</span></h4>';
	if(row.attch_imgfile!==null || row.attch_videofile!==null || row.attch_otherfile!==null)
		html +=			'<p style="font-style: italic;">'+ row.msg_body +'</p>';
	else
		html +=			'<p>'+ row.msg_body +'</p>';
	if(row.attch_videofile!==null){
		html += per_msg_video_attachment(row.attch_videofile);
	}
	if(row.attch_imgfile != null){
		html += per_msg_img_attachment(row.attch_imgfile, row.sender_name, row.sender_img);
	}
	if(row.attch_audiofile!==null){
		html += per_msg_audio_attachment(row.attch_audiofile);
	}
	if(row.attch_otherfile!==null){
		html += per_msg_file_attachment(row.attch_otherfile);
	}
	html += 		'</div>';
	html += 	'</div>';
	$('#threadReplyPopUp .replies-container').append(html);
	var containerHeight = $(".replies-container").height();
	$('.forScrollBar .os-viewport').animate({ scrollTop: containerHeight }, 1);
    if(temp_str_for_rep != ""){
        $('.thread-user-msg>p').unhighlight();
        $('.thread-user-msg>p').highlight(temp_str_for_rep);
    }
}
var draw_rep_urhr = () =>{
	var html = '<div class="msg-separetor-unread"><p>1 new reply</p></div>';
	$("#threadReplyPopUp .replies-container").append(html);
};
var find_rep_urhr_add_s = (nour) =>{
	$("#threadReplyPopUp .replies-container").find('.msg-separetor-unread>p').html(nour + ' new replies');
};
var draw_rep_count = (data) =>{
	var noofreply = Number($('.todo_msgid_'+data.msg_id).find('.no-of-replies').text());
    if(data.last_reply_name == user_fullname)
        var name = "You";
    else
        var name = data.last_reply_name;
	if(noofreply>0){
		$('.todo_msgid_'+data.msg_id).find('.no-of-replies').text(noofreply+1);
		$('.todo_msgid_'+data.msg_id).find('.last_rep_text').html('Last reply '+ moment(new Date()).fromNow() +' <b><i>'+ name +'</i></b>' );
	}else{
		var html = per_msg_rep_btn(noofreply+1, new Date(), name);
		$('.todo_msgid_'+data.msg_id).find('.chat-message-content').append(html);
	}
	$('.reply-separetor p').html( (noofreply+1) +' Reply');
};
var open_another_rep = (event) =>{
	var msg_id = $(event.target).attr('data-ano_msg_id');
	if($('.todo_msgid_'+msg_id).length){
		closetodoreply();
		$('.todo_msgid_'+msg_id).find('.msgReply p').trigger('click');
	}
    // else{
	// 	var conv_id = $(event.target).attr('data-conv_id');
	// 	closeAllPopUp();
	// 	$('#conv'+conv_id).attr('data-tmp_msgid', msg_id);
	// 	$('#conv'+conv_id).trigger('click');
	// }
};
$('#msg_rep').on('keydown', function(event) {
    var code = event.keyCode || event.which;
    if (code == 13 && !event.shiftKey) { //Enter keycode = 13
        event.preventDefault();
        rep_msg_send_fn();
        var containerHeight = $(".replies-container").height();
        $('.forScrollBar .os-viewport').animate({ scrollTop: containerHeight }, 1);
    }

    // When typing start into reply message box
    // if (typing === false) {
    //   typing = true;
    //   var convid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_con_id');
    //   var msgid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_msg_id');
    //
    //   socket.emit('client_typing', { display: true, room_id: to, sender_id: user_id, sender_name: user_fullname, sender_img: user_img, conversation_id: convid, reply: true, msg_id: msgid });
    //   timeout = setTimeout(timeoutFunction, 2000);
    // }
});
var rep_msg_send_fn = () =>{
    var str = $('#msg_rep').html();
    str = str.replace(/(<\/?(?:img|br)[^>]*>)|<[^>]+>/ig, '$1'); // replace all html tag
    // str = convert(str);
    str = str.replace(/&nbsp;/gi, '').trim();
    str = str.replace(/^(\s*<br( \/)?>)*|(<br( \/)?>\s*)*$/gm, '');
    if (str != "") {
        $("#ChatFileUpload").closest('form').trigger("reset");
        $("#FileComment").val("");
        $("#attach_chat_file_list").html("");
        if($('.todo_msgid_'+thread_root_id).length > 0)
            var convid = $('#chat_icon').attr('data-activity_id');
        else
            var convid = $('#threadReplyPopUp .main-thread-msgs').find('.thread-user-msg').attr('data-rep_con_id');
        var arg_data = {
                activity_id: thread_id,
                sender_id: user_id,
                sender_img: user_img,
                sender_name: user_fullname,
                text: str,
                attach_files: filedata[0],
                thread_root_id: $('#chat_icon').attr('data-activity_id'),
                root_msg_id: $('.thread-user-msg').attr('data-rep_msg_id')
            };
        socket.emit('todo_send_message', arg_data, (rep)=>{
            $("#msg_rep").html("");
            $("#msg_rep").focus();
        });
        // socket.emit('update_thread_count', { msg_id: thread_root_id, conversation_id: convid, last_reply_name: user_fullname });

        filedata.length = 0; filedata = [];
        audiofile.length = 0; audiofile = [];
        imgfile.length = 0; imgfile = [];
        otherfile.length = 0; otherfile = [];
        videofile.length = 0; videofile = [];
        formDataTemp.length = 0; formDataTemp = [];
    }
};
socket.on('newRepMessage', function(message) {
    // console.log(message);
    if(message.res.status){
        if ($('.thread-user-msg').attr('data-rep_con_id') == message.data.thread_root_id) {
            draw_rep_msg(message.res.msg);
            $('.msg-separetor-unread').hide();
        }

        // if( user_id != message.msg.sender){
        //     unread_replay_data.push({
        //         rep_conv: message.msg.conversation_id,
        //         msg_id: message.msg.msg_id,
        //         root_conv_id: message.root_conv_id,
        //         root_msg_id: message.root_msg_id
        //     });
        //     urrm_pn = JSON.parse(JSON.stringify(unread_replay_data));
        //     var nor = Number($('#conv'+message.root_conv_id).attr('data-nor'));
        //     $('#conv'+message.root_conv_id).attr('data-nor', Number(nor+1));
        //     $('#conv'+message.root_conv_id).addClass("has_unread_replay");
        //     // $(".side_bar_thread_ico").show();
        //     $(".thread_active").show();
        //
        //     // push notification
        //     Push.Permission.request();
        //     Push.create(message.msg.sender_name, {
        //         body: message.msg.msg_body,
        //         icon: "/images/users/"+message.msg.sender_img,
        //         timeout: 10000,
        //         onClick: function() {
        //             // document.getElementById("conv"+message.msg.conversation_id).click();
        //         }
        //     });
        // }
    }
});
socket.on('update_thread_counter', function(data){
    draw_rep_count(data);
});
var per_msg_rep_btn = (count, rep_time, rep_name) =>{
	var html = "";
	html += 		'<div class="msgReply" >';
	html +=				'<div class="groupImg">';
	// for(var i=0; i<count; i++)
	// html +=				'<img src="/images/users/img.png">';
	html +=				'</div>';
	html +=				'<div class="countReply">';
	html += 				'<img class="replyicon" src="/images/basicAssets/custom_thread_for_reply.svg" onclick="threadReply(event)">';
	html += 				'<p onclick="threadReply(event)"><span class="no-of-replies" >'+ count +'</span> Reply </p>';
	html +=					'<img class="replyarrow" src="/images/basicAssets/custom_rightChevron_for_reply.svg" onclick="threadReply(event)">';
	html += 				'<span class="last_rep_text"> Last reply ' + moment(rep_time).fromNow() + ' from '+ rep_name +'</span>';
	html +=				'</div>';
	html += 		'</div>';
	return html;
}
var closetodoreply = () =>{
    $('#threadReplyPopUp').hide();
};
/**
* timeoutFunction call after 2 second typing start
**/
var timeoutFunction = () => {
    typing = false;
    socket.emit("todo_user_typing", {
            display: false,
            sender_id: user_id,
            sender_name: user_fullname,
            sender_img: user_img,
            activity_id: $('#chat_icon').attr('data-activity_id')});
};

/**
* Receive typing event and
* display indicator images hide and show
**/
socket.on('todo_server_typing_emit', function(data) {
  if (data.sender_id != user_id) {
      draw_todo_typing_indicator(data);
  }
});

var draw_todo_typing_indicator = (data) => {
	if (data.display) {
		if ($('.typing-indicator').html() == "") {
			$('.typing-indicator').html(data.name + '&nbsp;<span>is typing....</span>');
		}
	} else {
		$('.typing-indicator').html("");
	}
};



/* Start emoji sending */
var emoji_div_draw = () => {
	var emojiNumber;
	var design = '<div class="emoji_div">';
	design += '<div class="emoji-container-name">Pick your reaction</div>';
	design += '<div class="emoji-container overlayScrollbars">';
	for (emojiNumber = 1; emojiNumber < 65; emojiNumber++) {
		design += '<img src="/images/emojiPacks/hv'+emojiNumber+'.svg">';
	}
	design += '</div>';
	design += '</div>';
	return design;
};
var open_todo_emoji = () => {
	if ($('.emoji_div').length == 0) {
		var design = emoji_div_draw();
		$('.todos-chat-write').append(design);
        $('.msg-separetor').hide();
        $('.msg-separetor-unread').hide();
		insert_emoji('chatbox');
	} else {
        $('.msg-separetor').show();
        $('.msg-separetor-unread').show();
		$('.emoji_div').remove();
	}
	overlayScrollbars();
}
var insert_emoji = (id) => {
	$('.emoji_div .emoji-container>img').on('click', function() {
		var emoji_name = $(this).attr('src');
		$('#'+id).append('<img src="' + emoji_name + '" style="width:20px; height:20px; vertical-align: middle;" />&nbsp;');
		// open_emoji();
		var el = document.getElementById(id);
		placeCaretAtEnd(el);
		// $('.emoji_div').remove(); // remove emoji div after insert.
	});
};

var open_rep_emoji = (event) => {
	var offsetval = $(event.target).offset();
	if ($('.emoji_div').length == 0) {
		var design = emoji_div_draw();
		$('.write-thread-msgs').append(design);
		insert_emoji('msg_rep');
		$('.emoji_div').css('top', offsetval.top - 314);
		$('.emoji_div').css('left', offsetval.left);
		$('.emoji_div').css('bottom', 'unset');
		$('.emoji_div').css('z-index', 9);
		// $('.emoji_div').css({'top': (offset.top - 314), 'left': offset.left, 'bottom': 'unset'});
	} else {
        $('.msg-separetor').show();
        $('.msg-separetor-unread').show();
		$('.emoji_div').remove();
	}
};

var placeCaretAtEnd = (el) => {
	el.focus();
	if (typeof window.getSelection != "undefined"
	&& typeof document.createRange != "undefined") {
		var range = document.createRange();
		range.selectNodeContents(el);
		range.collapse(false);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (typeof document.body.createTextRange != "undefined") {
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(el);
		textRange.collapse(false);
		textRange.select();
	}
};

var show_search_input = () =>{
    $(".search-into-todo-msg").hide();
    $("#todo_chat_search_input").show();
    $("#todo_chat_search_input").focus();
};
$('#todo_chat_search_input').keypress(function (event) {
    var code = event.keyCode || event.which;
    var str = $("#todo_chat_search_input").val().toLowerCase().trim();
    if (code == 13 && !event.shiftKey && str != "") { //Enter keycode = 13
        event.preventDefault();
        var activity_id = $('#chat_icon').attr('data-activity_id');
        socket.emit('todo_chat_search', {activity_id, str}, (res)=>{
            $('.msg-separetor').hide();
            $('.chat-message').hide();
            $('.chating_para_2').unhighlight();
            temp_str_for_rep = str;
            $.each(res.msgids, function(k, v){
                $('.todo_msgid_'+v.msg_id).prevAll("div.msg-separetor:first").show();
                $('.todo_msgid_'+v.msg_id).show();
                $('.chating_para_2').highlight(str);
            });
        });
    }else{
        $('.chat-message').show();
        $('.msg-separetor').show();
    }
});
var hide_search_input = () =>{
    if($("#todo_chat_search_input").val() == ""){
        $("#todo_chat_search_input").hide();
        $(".search-into-todo-msg").show();
        temp_str_for_rep = "";
    }
};
var overlayScrollbars =()=>{
	$(function() {
		$('.overlayScrollbars').overlayScrollbars({
			className: "os-theme-dark",
			resize: "none",
			sizeAutoCapable: true,
			paddingAbsolute: true,
			overflowBehavior: {
				x: "hidden",
				y: "scroll"
			},
			scrollbars: {
				visibility: "auto",
				autoHide: "move",
				autoHideDelay: 500,
				dragScrolling: true,
				clickScrolling: true,
				touchSupport: true
			},
		});
	});
};

overlayScrollbars();
/* End emoji sending */
$(document).mouseup(function(e){
    if((e.target.id == 'chatbox' || e.target.id == 'msg_rep') && $('.emoji_div').length == 1){
        $('.msg-separetor').show();
        $('.msg-separetor-unread').show();
        $('.emoji_div').remove();
    }
});
