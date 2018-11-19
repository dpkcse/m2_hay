var tempUpdateAction,tempActivityCreatedAt,tempActivityCreatedBy;
var my_all_personal_conversationId = getCookie('myAllPerConvId').split(',');
var myAllGrpConvId = getCookie('myAllGrpConvId').split(',');
var set_default = () =>{
	directMsgCont = 1;
	directMsgName = "";
	directMsgUUID = "";
	directMsgImg = "";
	directMsgSubtitle = "";
	memberList = [];
	memberListUUID = [];
	$('.add-direct-member').html("");
}

var profileNav = () =>{

	if($('.profilenavMainSection').is(":visible") == true){
		$('.profilenavMainSection').hide();
		$('.profile_nav img.nav_ico').css('transform', 'rotate(0deg)');
		$('.right-section').css('z-index', '4');
		$('.chat-header').css('z-index', '4');
	}else{
		$('.profilenavMainSection').show();
		$('.profile_nav img.nav_ico').css('transform', 'rotate(180deg)');
		$('.right-section').css('z-index', '0');
		$('.chat-header').css('z-index', '0');
	}
}


function logout(){

}

$(document).mouseup(function(e){
    var profileNavis = $(".profile_nav");
    var profileNavContent = $('.profilenavMainSection');
    var createEventPop = $('.create-event-popup');

    // if the target of the click isn't the container nor a descendant of the container
	if (!profileNavis.is(e.target) && profileNavis.has(e.target).length === 0)
    {
		if(profileNavContent.is(':visible') == true){
			profileNav();
		}
    }
    if (!createEventPop.is(e.target) && createEventPop.has(e.target).length === 0)
	{

		if($("#calenderPicker").is(":visible") == true){
			$("#calenderPicker").hide()
		}else{
			createEventPop.hide();
		}
		$('#CreateEvent').show();
	}

});

var escKeyUpForHead = ()=>{
 	$(window).keyup(function(e){
 		if (e.keyCode == 27) {
 			if($('.profilenavMainSection').is(":visible") == true){
				$('.profilenavMainSection').hide();
				$('.profile_nav img.nav_ico').css('transform', 'rotate(0deg)');
			}
			if ($('#memberListBackWrap').is(':visible') == true) {
                $('.closeBackwrap').trigger("click");
            }
			if($('#ChatFileUpload').is(':visible') == true || $('#delete_msg_div').is(':visible') == true){
				closeUploadPopup();
				closeAllPopUp();
			}else 
				if ($('#ChatFileUpload').is(':visible') == false && $('.delete_msg_div').is(':visible') == false){
				if ($('#live-chat').is(':visible') == true && $('.emoji_div').is(':visible') == false) {
					$('#live-chat').hide();
				} else {
					if ($('.emoji_div').is(':visible') == true) {
						$('.emoji_div').hide();
					}
				}
			}
			// create event chat header
			if ($('.create-event-popup').is(":visible") == true && $("#eventAdvanceOption").is(":visible") == true) {
				$("#eventAdvanceOption").hide();

			} else if ($('.create-event-popup').is(":visible") == true) {
				$('.create-event-popup').hide();
				$("#CreateEvent").show();
			}
			// create event chat header
			if ($('.create-todo-popup').is(":visible") == true && $("#todoAdvanceOption").is(":visible") == true) {
				$("#todoAdvanceOption").hide();

			} else if ($('.create-todo-popup').is(":visible") == true) {
				$('.create-todo-popup').hide();
				$("#createTodo").show();
			}
			closeAllPopUp();
			//for mute notification
			if($('#notificationPopup').is(':visible')){
				$('#notificationPopup').hide();
			}
			if($('#shareMessagePopUp').is(':visible')){
				$('#shareMessagePopUp').hide();
			}
 		}	
 	});
 }
 escKeyUpForHead();


 var sideBarActiveInactive = (event)=>{
 	$('.side_bar_list_item li').removeClass('sideActive');
 	$('.side_bar_list_item li').removeClass('selected');
	$('.side_bar_list_item li').children(".hash, .online, .offline, .lock, .toDo").css('left', '12px');
	$(event.target).addClass('sideActive');
	$(event.target).addClass('selected');
	$(event.target).children('.remove').hide();
	$(event.target).children(".hash, .online, .offline, .lock, .toDo").css('left', '6px');
 }

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}


//new scroll design

var overlayScrollbars = () => {
	$(function () {
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
}

overlayScrollbars();



///close all popup

function closeAllPopUp() {

	if ($('#repChatFileUpload').is(":visible") == true) {
		repcloseUploadPopup()
	}else{
		if ($('#threadReplyPopUp').is(":visible") == true && $('.emoji_div').is(":visible") == false) {
			$('#threadReplyPopUp').hide();
		} else{
			// $('#threadReplyPopUp').hide();
			if ($('.emoji_div').is(":visible") == true) {
				$('.emoji_div').hide();
			}
		};
	}

	if($('#delete_msg_div').is(':visible') == true){
		$('#updateAction').val(tempUpdateAction);
		$('#actCre').val(tempActivityCreatedAt);
		$('#activityCreatedAt').val(tempActivityCreatedBy);
		$('.del_msg_title').text('Delete message');
		$('.forcreateTodo').remove();
		$('#delete_msg_div').hide();
		$('.btn-cancel').show();
	}

	if ($('#createDirMsgContainer').is(":visible")) {
		$('#createDirMsgContainer').hide();
		$('.add-direct-member').val("");
	};
	
	// if($('.backwrap').is(':visible') == true){
	// 	$('.backwrap').hide();
	// }

	if ($('#completed_activity_div').is(':visible') == true) {
		$("#amazonWishlist").prop('checked', false);
		$('#completed_activity_div').hide();
	}
	if ($('#reopen_activity_div').is(':visible') == true) {
		$("#amazonWishlist").prop('checked', true);
		$('#reopen_activity_div').hide();
	}
	if(!$('#memberListBackWrap').is(':visible')){
		if($('#createToDoPopup').is(":visible")){
			if($("#toggle_area").is(":visible")){
				if ($('#dueDatePickerDiv').is(":visible")) {
					$('#dueDatePickerDiv').hide();
				} else {
					viewtodoAdOp();
				}
			}else{
				$('#createToDoPopup').hide();
			}
		}
	}else{
		$('#memberListBackWrap').hide();
	}
	if($('#delete_to_do_div').is(':visible')){
		$('#delete_to_do_div').hide();
	}

	$("#team-name").val("");
	$("#ml-admintype").hide();
	$("#ml-membertype").hide();
	$("#defaultRoom").remove();
	$("#ml-listHA").html('');
	$("#ml-listHl").html('');
	$("#grpPrivacy").prop("checked",false);
	$('.no_of_user_left_to_add span').text('10');
	set_default();

	
}

//after mouse enter

var popupMouseEnter = ()=>{
	$('.suggested-list li').mouseenter(function () {
		$('.suggested-list .showEl').removeClass('selected');
		$('.suggested-list li').removeClass('default');
		$(this).addClass('selected');

	});
	$('.memberList .list').mouseenter(function () {
		$('.memberList .showEl').removeClass('selected');
		$('.memberList .list').removeClass('default');
		$(this).addClass('selected');

	});
	$('.notification_mute_time label').mouseenter(function () {
		$('.notification_mute_time  .showEl').removeClass('selected');
		$('.notification_mute_time  label').removeClass('default');
		$(this).addClass('selected');
	});
}
// start script for permission browser notification
$('#allowNotification').on('click', function () {
	var permission = Notification.permission;
	Notification.requestPermission(function (permission) {
		// If the user accepts, let's create a notification
		if (permission === "granted") {
			$('#headNoficationDialog').hide();
			$('.chat-header').css('top', '64px');
			$('.chat-page').css('height', 'calc(-229px + 100vh)');
			$('aside').css('height', 'calc(-64px + 100vh)');
			$('.fileSliderBackWrap').css('height', 'calc(100% - 64px)');
			$('#right-section-area').css('top', '64px');
		} else {
			$('#headNoficationDialog').hide();
			$('.chat-header').css('top', '64px');
			$('aside').css('height', 'calc(-64px + 100vh)');
			$('.chat-page').css('height', 'calc(-229px + 100vh)');
			$('.fileSliderBackWrap').css('height', 'calc(100% - 64px)');
			$('#right-section-area').css('top', '64px');
		}
	});
});
$("#denyNotification").on('click', function () {
	var notification = getCookie("notification_status");
	setCookie("notification_status", "block", 30);
	$('#headNoficationDialog').hide();
	$('.chat-header').css('top', '64px');
	$('aside').css('height', 'calc(-64px + 100vh)');
	$('.chat-page').css('height', 'calc(-229px + 100vh)');
	$('.fileSliderBackWrap').css('height', 'calc(100% - 64px)');
	$('#right-section-area').css('top', '64px');

});
var notificationPermission = () => {
	var permission = Notification.permission;
	if (Notification.permission === "default") {
		$('#headNoficationDialog').show();
	}
	if (Notification.permission === 'denied') {
		$('#headNoficationDialog').hide();
		$('.chat-header').css('top', '64px');
		$('aside').css('height', 'calc(-64px + 100vh)');
		$('.chat-page').css('height', 'calc(-229px + 100vh)');
	}
	if (Notification.permission === "granted") {
		$('#headNoficationDialog').hide();
		$('.chat-header').css('top', '64px');
		$('aside').css('height', 'calc(-64px + 100vh)');
		$('.chat-page').css('height', 'calc(-229px + 100vh)');
	}
	var notification = getCookie("notification_status");
	if (notification != "") {
		$('#headNoficationDialog').hide();
		$('.chat-header').css('top', '64px');
		$('aside').css('height', 'calc(-64px + 100vh)');
		$('.chat-page').css('height', 'calc(-229px + 100vh)');
	}

}
notificationPermission();

function setCookie(notification_status, notification_value) {
	document.cookie = notification_status + "=" + notification_value;
}

function getCookie(notification_status) {
	var notification_status = notification_status + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(notification_status) == 0) {
			return c.substring(notification_status.length, c.length);
		}
	}
	return "";
}

// end script permission browser notification

function inputValueCountFun (ele,type){
	switch(type) {
    case 'id':
        if($('#'+ele).val().length > 0){
			return true;
		}else{
			return false;
		}
        break;
    case 'class':
        if($('.'+ele).val().length > 0){
			return true;
		}else{
			return false;
		}
        break;
    case 'conte':
        if($('#'+ele).text().length > 0){
			return true;
		}else{
			return false;
		}
        break;
    default:
        return false;
}
}



function clearMemberSearch() {
	$('#search_members').val("");
	$('#search_members').blur();
	$('.inputGroup2 .remove').hide();
	$('#toggle_area .remove').hide();
	$('.suggested-type-list').hide();
}

$('#search_members').on('keyup', function (e) {
    var value = $(this).val();
    if(e.keyCode !== 40 && e.keyCode !== 38){
      if (value.length !== 0) {
          $('.suggested-type-list').show();
          $('.inputGroup2 .remove').show();
          $('#toggle_area .remove').show();
      } else {
          $('.suggested-type-list').hide();
          $('.inputGroup2 .remove').hide();
          $('#toggle_area .remove').hide();
      }
      $(".s-l-def-clas").each(function () {
          if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
              $(this).parent('li').show();
              $(this).parent('li').addClass('showEl');
          } else {
              $(this).parent('li').hide();
              $(this).parent('li').removeClass('showEl');
          }
      });

      $('.s-l-def-clas').unhighlight();
      $('.s-l-def-clas').highlight(value);
      $(".inputGroup2 .suggested-list li").removeClass('selected');
      $(".inputGroup2 .suggested-list li.showEl:first").addClass('selected');
    }

});

//for tooltip 
$('#sharePeopleList').mouseenter(function(){
    var value = [];
    $(this).removeClass('mycustomTooltip tooltips');
    $(this).children('.tooltipspan').remove();
    var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
    var na = '';
    $.each(user_list, function(k,v){
        if(sharedMemberList.indexOf(v.id) !== -1){
            if($('#create-todo-popup').is(':visible')){
            	if(v.id  == user_id){
	                value.push(v.fullname+'(Owner)');
	                na = v.fullname+'(Owner)';
	            }else{
	                value.push(v.fullname);
	            }
            }else{
            	
        		if(v.id  == $('#actCre').val()){
	                value.push(v.fullname+'(Owner)');
	                na = v.fullname+'(Owner)';
	            }else{
	                value.push(v.fullname);
	            }
            	
            }
        }
    });
    var ownerIndex = value.indexOf(na);
    var zeroIndex = value[0];
    if(value.indexOf(na) !== 0){
        value[0] = na;
        value[ownerIndex] = zeroIndex;
    }
    if($(this).find('.tooltipspan').length == 0){
        $(this).addClass('mycustomTooltip tooltips');
        $(this).append('<span class="tooltipspan"></span>');
    }else if($(this).find('.tooltipspan').length > 1){
        $(this).removeClass('mycustomTooltip tooltips');
        $(this).children('.tooltipspan').remove();
    }
    $('.tooltipspan').html(value.join("<br/>"))
    
});

function createEventPop(e){
	if($('.create-event-popup').is(":visible") == false){
		$('.create-event-popup').show();
		$('#CreateEvent').hide();
		$('.create-event-popup-title').focus();
	}
}
function eventToggleAdvance(){
	if($('#eventAdvanceOption').is(":visible") == false){
		$('#eventAdvanceOption').show();
		$('.channel-member-search input').focus();
	}else{
		$('#eventAdvanceOption').hide();
	}
}



socket.on('newMessage', function(message) {
	if(!$('#hayvenConnectPage').hasClass('active')){
		//for all conv
		if(my_all_personal_conversationId.indexOf(message.msg.conversation_id) > -1 || myAllGrpConvId.indexOf(message.msg.conversation_id) > -1){
			var conv_Id = message.msg.conversation_id;
			var uuID = message.msg.sender;
			console.log(message);
	        Push.create(message.msg.sender_name, {
	            body: message.msg.msg_body,
	            icon: "/images/users/" + message.msg.sender_img,
	            timeout: 10000,
	            onClick: function () {
	                // document.getElementById("hayvenConnectPage").click();
	                setCookie('lastNotification', message.msg.conversation_id, 1);
	                window.location.href = '/';
	            }
	        });
		}
	}
});

socket.on('activityAcceptFromMessage', function (data) {
	if (data.user_id != null) {
		getThisActivitydetail(data.activity_id.toString())
			.then((result) => {
				console.log(470, result);
				acceptActivty('', result.activity_id.toString(), result.activity_title, data.user_id, result.activity_created_at);
			}).catch((err) => {
				console.log(474, err);
			});
	}
});

function acceptActivty(msgid, activity_id, activity_title, user_id, toDoCreateAt) {
	socket.emit('toodoUpdate', {
		targetID: activity_id,
		type: 'acceptActivty',
		contain: user_id,
		clusteringkey: toDoCreateAt
	},
		function (confirmation) {
			if (confirmation.msg.msg == 'success') {
				if ($("#unpinTodoList").is(':visible')) {
					var todoDesign = '<li id="activity_' + activity_id + '" data-activityid="' + activity_id + '" data-urm=0 class="com-t-l todoLink n_td" onclick="startToDo(event)">';
					todoDesign += '     <span class="toDo" ></span >';
					todoDesign += '     <span class="toDoName">' + activity_title + '</span>';
					todoDesign += '     <img id="fla_' + activity_id + '" data-createdat="' + activity_id + '" class="Flagged sidebarFlag" src="/images/basicAssets/Flagged_red.svg" style="display:none;">';
					todoDesign += '     <span class="unreadMsgCount"></span>';
					todoDesign += '</li>';
					$("#unpinTodoList").prepend(todoDesign);

					if (msgid != '') {
						socket.emit('toodoUpdate', {
							targetID: activity_id,
							type: 'acceptActivityFromMsg',
							contain: msgid,
							clusteringkey: toDoCreateAt
						},
							function (confirmation) {
								console.log(confirmation)
							});
					}

				}
			}
		});
}

socket.on('activityDeclineFromMessage', function (data) {
	if (data.user_id != null) {
		getThisActivitydetail(data.activity_id.toString())
			.then((result) => {
				console.log(470, result);
				declineActivity('', result.activity_id.toString(), result.activity_created_at, data.user_id);
			}).catch((err) => {
				console.log(474, err);
			});
	}
});

socket.on('addTnTodo', function (data) {
	toastr.options.closeButton = true;
	toastr.options.timeOut = 2000;
	toastr.options.extendedTimeOut = 1000;
	toastr.options.preventDuplicates = true;
	toastr["info"]("Yor are added to a new todo \"" + data.title + "\" by  \"" + data.by + "\"", "Hello " + user_fullname + " !!!");

	$(".msg_id_" + data.msg_id).find('.user-msg').find('p').remove();

	var html = '';
	if (data.sender != user_id) {
		html += '<p>' + data.by + ' is sharing a To-Do with you.</p>';
	} else {
		html += '<p>You share a To-Do.</p>';
	}

	html += '<div class="toDoContent todo_id_' + data.activity_id + ' todo_share_div_' + data.msg_id + '" data-aid="' + data.activity_id + '">'; // Start todo div

	html += '<div class="toDoContent_Sec1">';
	html += '<img src="/images/basicAssets/custom_to_do_for_msg.svg">';
	html += '<p class="toDoName">' + data.title + '</p>';
	html += '<p>Due Date: <span class="dudate">' + moment(new Date()).format("Do MMMM, YYYY") + '</span></p>';
	html += '</div>';
	if (data.sender != user_id) {
		html += '<div class="toDoContent_Sec2">';
		html += '<button class="accept_toDO" data-members="" onclick="accept_todo(event, \'' + data.conversation_id + '\', \'' + data.msg_id + '\',\'' + data.activity_id + '\')">Accept</button>';
		html += '<button class="decline_toDo" onclick="decline(event, \'' + data.conversation_id + '\', \'' + data.msg_id + '\', \'' + data.activity_id + '\')">Decline</button>';
		html += '</div>';
	}

	html += '</div>'; // End todo div

	$(".msg_id_" + data.msg_id).find('.user-msg').find('h4').after(html);

});

socket.on('removeFromTodo', function (data) {

	toastr.options.closeButton = true;
	toastr.options.timeOut = 2000;
	toastr.options.extendedTimeOut = 1000;
	toastr.options.preventDuplicates = true;
	toastr["info"]("Yor are removed from  todo \"" + data.title + "\" by  \"" + data.by + "\"", "Hello " + user_fullname + " !!!");

	var html = '';

	html += '<div class="toDoContent_Sec1">';
	html += '<div class="acceptCheck decline"></div>';
	if (data.sender != user_id)
		html += '<p class="acceptedLabel decline">You\'ve removed from <label>' + data.title + '</label></p>';
	else
		html += '<p class="acceptedLabel decline">' + $('#conv' + data.conversation_id).attr('data-name') + ' decline <label onclick="goto_todo(event)">...</label></p>';
	html += '</div>';

	$(".todo_share_div_" + data.msg_id).html("");
	$(".todo_share_div_" + data.msg_id).append(html);
});

function declineActivity(msgid, todoActivityId, toDoCreateAt, uuID) {
	socket.emit('toodoUpdate', {
		targetID: todoActivityId,
		type: 'removemember',
		contain: uuID,
		clusteringkey: toDoCreateAt
	},
		function (confirmation) {
			if (msgid != '') {
				socket.emit('toodoUpdate', {
					targetID: todoActivityId,
					type: 'declineActivityFromMsg',
					contain: msgid,
					clusteringkey: toDoCreateAt
				},
					function (confirmation) {
						console.log(confirmation)
					});
			}
		});
}

function getThisActivitydetail(activity_id) {
	return new Promise((resolve, reject) => {
		socket.emit('get_activity_history', {
			activity_id,
			user_id
		}, (respons) => {
			if (respons.activityDetail.status) {
				resolve(respons.activityDetail.activityDetail);
			} else {
				reject({ 'err': 'fail' })
			}
		});
	});

}

///for all popup
function viewAllBackWrap(id){
	if($('#'+id).is(':visible')){
		$('#'+id).hide();
	}else{
		$('#'+id).show();
	}
	popupMouseEnter();
}
//for close modal
function closeModal(id){
	$('#'+id).hide();
}


//Set the caret focus always to end in contenteditable
function placeCaretAtEnd(el) {
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
}