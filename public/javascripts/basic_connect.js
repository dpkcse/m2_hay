var all_current_sms = [];
var to = "";
var conversation_id = "";
var conversation_type = "";
var room_id = "";
var room_name = "";
var room_img = "";
var filedata = [],
	audiofile = [],
	videofile = [],
	imgfile = [],
	otherfile = [];
var thread_id = "";
var thread_root_id = "";
var swap_conversation_id = "";
var adminArra = [];
var participants = [];
var roomTitle = "";
var privacy = "";
var keySpace = "";
var tagListForFileAttach = [];
var attachFileList = [];

var formDataTemp = [];
var urrm_pn = [];
var need_todo_details = [];
var loaderEndTime;
var recentEmo = [];
var sidebarLiMouseEnter = () => {

	$('.side_bar_list_item li').mouseleave(function () {
		$(this).children('.remove').hide();
	});

	$('.side_bar_list_item li').mouseenter(function () {
		if ($(this).children('.unreadMsgCount').text().length > 0) {
			$(this).children('.remove').hide();
		} else {
			$(this).children('.remove').show();
		}
	});
}

var scrollToBottom = (target) => {
	$(target).animate({ scrollTop: $(target).prop("scrollHeight") }, 800);
};

var unread_msg_conv_intop = () => {
	$.each($(".side_bar_list_item li"), function () {
		if (!$(this).find(".unreadMsgCount").html() == "") {
			$(this).css('color', 'rgba(0,0,0,0.88)');
		}
	});

	var unread = ""; var read = ""; var count = 0;
	$.each($("#directListUl li"), function (k, v) {
		if (count === 0) {
			count++;
			read += v.outerHTML;

		}
		else {
			if (!$(v).find(".unreadMsgCount").html() == "") {
				unread += v.outerHTML;
			} else {
				read += v.outerHTML;
			}
		}
	});
	$("#directListUl").html(unread);
	$("#directListUl").append(read);
	sidebarLiMouseEnter();
}
unread_msg_conv_intop();

var _rep_msg = (urdv) => {
	thread_id = urdv.rep_conv;
	thread_root_id = urdv.root_msg_id;

	socket.emit('get_one_msg_info', { conversation_id: urdv.root_conv_id, msg_id: urdv.root_msg_id }, (res) => {
		// console.log(res);
		draw_reply_popup_html(res.conversation_id, urdv.root_msg_id, res.sender_img, res.sender_name, moment(res.created_at).format('h:mm a'), res.msg_body);
		$('#msg_rep').attr('placeholder', 'Reply to ' + res.sender_name + '');
		$('#threadReplyPopUp .replies-container').html("");

		$('.pevThread').hide();
		$('.nextThread').hide();

		$('#threadReplyPopUp').show();
		$('#msg_rep').focus();

		find_and_show_reply_msg_popup(thread_root_id, urdv.root_conv_id);
	});
};

var FtempArray = [];    // for file upload tag
var FtaggedList = [];   // for file upload tag
var my_tag_list = {};
var my_tag_id = [];

var start_conversation = (event) => {

	event.stopImmediatePropagation();
	var conversationid = conversation_id = $(event.target).attr("data-conversationid");

	if (conversationid != undefined) {
		loaderEndTime = moment(new Date()).format('mm:ms');
		pageCustomLoader(true);
		$('.fileSliderBackWrap').hide();
		$('.media-file-popup').hide();
		$('.image-popup-slider').hide();
		if ($(".threadasideContainer").is(":visible")) {
			var rep_offset = "";
			var rep_conv_id = $(event.target).attr("data-conversationid");
			urrm_pn = _.sortBy(urrm_pn, ["root_conv_id",]);

			$.each(urrm_pn, function (urdk, urdv) {
				if ($('#conv' + rep_conv_id).attr('data-tmp_msgid') == undefined) {
					if (urdv.root_conv_id == rep_conv_id) {
						_rep_msg(urdv);
						return false;
					}
				} else {
					if (urdv.root_conv_id == rep_conv_id && urdv.root_msg_id == $('#conv' + rep_conv_id).attr('data-tmp_msgid')) {
						_rep_msg(urdv);
						return false;
					}
				}
			});
		} else if (!$(event.target).hasClass('sideActive')) {

			adminArra = [];
			participants = [];

			if ($('#groupChatContainer').is(":visible") == false) {
				$(".connect_right_section").hide();
				$('#groupChatContainer').show();
			}

			if ($("#defaultRoom").is(":visible")) {
				$("#defaultRoom").remove();
			}

			$('#msg').focus();

			var id = to = room_id = $(event.target).attr("data-id");
			var type = conversation_type = $(event.target).attr("data-conversationtype");
			var conversationid = conversation_id = $(event.target).attr("data-conversationid");
			var name = room_name = $(event.target).attr("data-name");
			var img = room_img = $(event.target).attr("data-img");
			var subtitle = $(event.target).attr("data-subtitle");
			var tm = $(event.target).attr("data-tm");
			var status = $(event.target).find('.online, .offline, .hash, .lock').attr('class');

			$("#pin-to-bar").attr('data-conversationid', conversationid);
			$("#createConvTag").attr('data-roomid', conversationid);

			$("#lastActive").val(conversationid);

			$("#pin-to-bar").attr('data-id', id);
			$("#pin-to-bar").attr('data-subtitle', subtitle);
			$("#pin-to-bar").attr('data-img', img);
			$("#pin-to-bar").attr('data-name', name);
			$("#pin-to-bar").attr('data-type', type);

			$("#conv_title").html('<span class="' + status + '"></span><span class="converstaion_name">' + name + '</span>');
			// $("#conv_title").text(name);
			// $("#conv_key").text('@'+subtitle);
			$("#conv_key").text('@ Navigate');
			$("#totalMember").text(tm);
			// console.log({type, id, conversationid, name, img});
			$("#msg").html("");
			$("#msg-container").html("");

			$('.voice-call').show();
			$('.video-call').show();

			// For tag purpose. while clicking on room or personal
			$('.chat-head-calling .addTagConv').hide();
			$('.chat-head-calling .tagged').show();
			$("#taggedList").html("");

			//Msg placeholder
			$("#msg").attr('placeholder', 'Message ' + name + '');


			// Chat head member count div
			if (type == "group") {
				$('.chat-head-name h4').css('display', 'block');
				$('.chat-head-name').css('margin-top', '17px');
				$('#roomIdDiv').css('cursor', 'pointer');
				$('#leaveThisRoom').show();
				$('#roomIdDiv').attr('onclick', "roomEdit($(this).attr('data-roomid'),$(this).attr('data-title'),$(this).attr('data-privecy'),$(this).attr('data-keyspace'),$(this).attr('data-convimg'))");
				if (name.indexOf(',') > -1) {
					$('#leaveThisRoom').text('Leave group');
				} else {
					$('#leaveThisRoom').text('Leave room');
				}
			} else if (type == "personal") {
				$('.chat-head-name h4').css('display', 'none');
				$('.chat-head-name').css('margin-top', '28px');
				$('#roomIdDiv').removeAttr('onclick');
				$('#roomIdDiv').css('cursor', 'default');
				$('#leaveThisRoom').hide();
				forActiveCallIcon(onlineUserList, participants, 'personal', id);
			}

			tagListTitle = [];
			tagLsitDetail = [];

			$("#fileAttachTagLs").html('');

			tagListForFileAttach = [];
			FtempArray = [];
			FtaggedList = [];


			$("#taggedIMG").attr('src', '/images/basicAssets/custom_not_tag.svg');
			$("#createConvTag").val('');
			$("#tagItemList").text('');

			if (!$(".threadasideContainer").is(":visible")) {
				var this_msg_unread = Number($("#conv" + conversation_id).attr("data-nom"));
				// console.log(202, this_msg_unread);
				var total_unreadcount = Number($(".scroll_unreadMsg>h5>span").text()) - this_msg_unread;
				// console.log(205, total_unreadcount);
				display_show_hide_unread_bar(total_unreadcount);
				$("#conv" + conversation_id).find(".unreadMsgCount").html("");
				$("#conv" + conversation_id).attr("data-nom", 0);
			}
			var seartTxt = $("#searchText").val();
			socket.emit('get_conversation_history', { type, id, conversationid, name, img, user_id, seartTxt }, (respons) => {
				if (respons.msg == "success") {
					loaderEndTime = moment(new Date()).format('mm:ms');
					pageCustomLoader(false);
					var need_update_message_seen_list = [];

					attachFileList = [];

					if (respons.messagestag.length > 0) {
						$.each(respons.messagestag, function (k, v) {
							msgIdsFtag.push(v.id);
						});
					}

					if (respons.tags != undefined) {
						var taggedID = respons.tags;//all con tag tag_id
						var condtagsid = FtaggedList = respons.condtagsid;//all con tag id

						var tempTagList = [];

						var totalTagslist = FtempArray = _.orderBy(respons.totalTags, ['title'], ['asc']);

						$.each(totalTagslist, function (k, v) {

							if (alltags.indexOf(v.title.toLowerCase()) === -1) {
								my_tag_list[v.tag_id] = v.title.toLowerCase();
								alltags.push(v.title.toLowerCase());
								my_tag_id.push(v.tag_id.toString());
							}

							if (condtagsid.indexOf(v.tag_id) !== -1) {
								tagListForFileAttach.push(v.title.toLowerCase());
								tagListTitle.push(v.title.toLowerCase());
								tagLsitDetail.push({ 'cnvtagid': taggedID[condtagsid.indexOf(v.tag_id)], 'tagid': v.tag_id, 'tagTitle': v.title.toLowerCase(), 'roomid': conversationid });

								var design = '<li onclick="removeLevel(\'' + taggedID[condtagsid.indexOf(v.tag_id)] + '\',\'' + conversationid + '\',\'' + v.tag_id + '\')">' + v.title + '<span class="tagcheck" id="level' + taggedID[condtagsid.indexOf(v.tag_id)] + '"></span></li>';

								if (tempTagList.indexOf(v.tag_id) === -1) { tempTagList.push(v.tag_id); }
								$('#taggedList').append(design);
							}
						});

						$.each(totalTagslist, function (k, v) {
							if (tempTagList.indexOf(v.tag_id) === -1) {
								var design = '<li id="tagLi' + v.tag_id + '" onclick="addTagto(\'' + v.tag_id + '\',\'' + conversationid + '\')">' + v.title + '</li>';
								$('#taggedList').append(design);
							}
						});

						if (tagListTitle.length > 0) {
							$("#tagItemList").text(tagListTitle.join(','));
							$("#taggedIMG").attr('src', '/images/basicAssets/custom_tagged.svg');
						}
					}


					if ($.inArray(user_id, respons.conversation["0"].participants_admin) !== -1) {
						adminArra = respons.conversation["0"].participants_admin;
						participants = respons.conversation["0"].participants;
						// console.log(84,{participants,adminArra});
						$("#roomIdDiv").attr('data-roomid', conversationid);
						$("#roomIdDiv").attr('data-title', respons.conversation["0"].title);
						$("#roomIdDiv").attr('data-privecy', respons.conversation["0"].privacy);
						$("#roomIdDiv").attr('data-keyspace', respons.conversation["0"].group_keyspace);
						$("#roomIdDiv").attr('data-convimg', respons.conversation["0"].conv_img);
						forActiveCallIcon(onlineUserList, participants, 'group');

					} else {
						// $("#roomIdDiv").attr('data-roomid','0');
						adminArra = respons.conversation["0"].participants_admin;
						participants = respons.conversation["0"].participants;
						// console.log(94,{participants,adminArra});
						$("#roomIdDiv").attr('data-roomid', conversationid);
						$("#roomIdDiv").attr('data-title', respons.conversation["0"].title);
						$("#roomIdDiv").attr('data-privecy', respons.conversation["0"].privacy);
						$("#roomIdDiv").attr('data-keyspace', respons.conversation["0"].group_keyspace);
						$("#roomIdDiv").attr('data-convimg', respons.conversation["0"].conv_img);
						forActiveCallIcon(onlineUserList, participants, 'group');
					}

					if (respons.pinnedStatus != undefined) {
						$("#pin-to-bar").addClass('pined');
						$("#pin-to-bar").attr('data-pinned', respons.pinnedStatus.id);
						$("#pin-to-bar").attr('src', '/images/basicAssets/custom_pinned.svg');
					} else {
						$("#pin-to-bar").removeClass('pined');
						$("#pin-to-bar").attr('data-pinned', '');
						$("#pin-to-bar").attr('src', '/images/basicAssets/custom_not_pin.svg');
					}

					$('#memberHolder .checkTask').each(function (i, obj) {
						$(obj).prop('checked', false);
					});
					var a = [];
					var b = [];
					$('#memberHolder .checkTask').each(function (i, obj) {
						if (participants.indexOf($(obj).attr('data-uid')) > -1) {
							$(obj).prop('checked', true);
							a.push($(obj).closest('li'))
						} else {
							b.push($(obj).closest('li'))
						}
					});

					$('#memberHolder .os-content').html('');
					$.each(a, function (i, e) {
						$('#memberHolder .os-content').append(e);
					});

					$.each(b, function (i, e) {
						$('#memberHolder .os-content').append(e);
					});

					var msg_ids = [];
					$.each(respons.conversation_list, function (k, v) {
						msg_ids.push(v.msg_id);
						if (v.msg_status == null) {
							if (v.sender == user_id) {
								// This msg send by this user; so no need to change any seen status
							} else {
								// This msg receive by this user; so need to change seen status
								need_update_message_seen_list.push(v.msg_id);
							}
						}

						// If msg status have some user id, then
						else {
							if (v.msg_status.indexOf(user_id) > -1) {
								// This msg already this user seen
							} else {
								if (v.sender != user_id) {
									// This msg receive by this user; so need to change seen status
									need_update_message_seen_list.push(v.msg_id);
								}
							}
						}
						if (need_update_message_seen_list.length == 1)
							draw_urhr();

						if ($("#searchAction").val() == 2) {
							if (v.has_flagged !== null) {
								if (v.has_flagged.indexOf(user_id.toString()) !== -1) {
									draw_msg(v, true);
								}
							}
						} else {
							draw_msg(v, true);
						}

					});

					if (need_update_message_seen_list.length > 1)
						find_urhr_add_s(need_update_message_seen_list.length);

					if (respons.messagestag != undefined) {
						if (respons.messagestag.length > 0) {
							$.each(respons.messagestag, function (k, v) {
								msgIdsFtag.push(v.id);
								if (v.tag_title != undefined) {
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

					if ($("#searchText").val() != 1) {
						var str = $('#searchText').val();
						str = str.replace(/<\/?[^>]+(>|$)/g, "");

						$('.user-msg>p').unhighlight();
						$('.user-msg>p').highlight(str);

						$.each($('.msgs-form-users'), function () {
							if ($(this).find('.highlight').length == 0) {
								$(this).prev('.msg-separetor').hide();
								$(this).hide();
							} else {
								$(this).prev('.msg-separetor').show();
								$(this).show();
							}
						});
					}

					sent_delivered();
					last_delivered_always_show();

					scrollToBottom('.chat-page .os-viewport');

					if (need_update_message_seen_list.length > 0) {
						$.ajax({
							url: '/hayven/update_msg_status',
							type: 'POST',
							data: {
								msgid_lists: JSON.stringify(need_update_message_seen_list),
								user_id: user_id,
								conversation_id: conversation_id
							},
							dataType: 'JSON',
							success: function (res) {
								socket.emit('update_msg_seen', {
									msgid: need_update_message_seen_list,
									senderid: to,
									receiverid: user_id,
									conversation_id: conversation_id
								});
							},
							error: function (err) {
								console.log(err);
							}
						});
					}
					if (need_todo_details.length > 0) {
						// console.log(need_todo_details);
						socket.emit('need_todo_info', need_todo_details, (res) => {
							if (res.status) {
								$('.msgs-form-users').each(function (i, obj) {
									$.each(res.activity_list, function (tk, tv) {
										if ($(obj).find('.todo_id_' + tv.activity_id).find('.acceptedLabel').length == 1) {
											if ($(obj).find('.todo_id_' + tv.activity_id).find('.acceptedLabel').hasClass('decline')) {
												$(obj).find('.todo_id_' + tv.activity_id).find('.acceptedLabel>label').html(tv.activity_title);
											} else {
												$(obj).find('.todo_id_' + tv.activity_id).find('.acceptedLabel>label').html(tv.activity_title);
												var ml = draw_todo_member_list(tv.activity_participants);
												$(obj).find('.todo_id_' + tv.activity_id).append(ml);
											}

										} else {
											$(obj).find('.todo_id_' + tv.activity_id).find('.toDoName').html(tv.activity_title);
											$(obj).find('.todo_id_' + tv.activity_id).find('.dudate').html(moment(tv.activity_end_time).format("Do MMMM, YYYY"));
											$(obj).find('.todo_id_' + tv.activity_id).find('.accept_toDO').attr('data-members', tv.activity_participants);
										}
									});
								});

							}
						});
					}
				} else {
					console.log("failed to load");
				}

			});
			sideBarActiveInactive(event);
			unread_msg_conv_intop();
		}
		// Floating Date in the top bar
		$('.chat-page .os-viewport').on('scroll', function () {
			var scrollTop = $('.chat-page .os-viewport').scrollTop();
			if (scrollTop === 0)
				$('#top-date').html("");
			$(".msg-separetor").each(function () {
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

		if (windowWidth <= 415) {
			$('#hayvenSidebar').hide();
		}
	}


};
var sent_delivered = () => {
	$('.msg-send-seen-delivered').hide();
	var remove_previous = false;
	$($('.msg-send-seen-delivered').get().reverse()).each(function (k, v) {
		if (remove_previous) $(v).text("");
		if ($(v).text() == ' - Sent') $(v).show();
		if ($(v).text() == ' - Delivered') { $(v).show(); remove_previous = true; }
	});
};
var last_delivered_always_show = () => {
	var last_img = $('.msg-send-seen-delivered').last().closest('.msgs-form-users').find('.msg-user-photo>img').attr('alt');
	if ($('#conv' + user_id).attr('data-img') == last_img && $('.msg-send-seen-delivered').last().text() != ' - Sent') {
		$('.msg-send-seen-delivered').hide();
		$('.msg-send-seen-delivered').last().text(' - Delivered');
		$('.msg-send-seen-delivered').last().show();
	}
};
var update_msg_seen_status = (msgid) => {
	if ($('.msg-send-seen-delivered').last().text() != ' - Delivered')
		$('.msg_id_' + msgid).find('.msg-send-seen-delivered').text(' - Delivered').delay(3000).fadeOut();
	last_delivered_always_show();
};
var tooltipForOverLength = () => {
	$('.side_bar_list_item li').mouseenter(function () {
		var lengthCount = $(this).children('.usersName').text().length;
		var thisName = $(this).children('.usersName').text();
		var selector = $(this);
		if (lengthCount > 20) {
			setTimeout(function () {
				selector.attr({
					'data-balloon-length': 'medium',
					'data-balloon': '' + thisName + '',
					'data-balloon-pos': 'up'
				});
			}, 1000);

		}
	});

	// $('#createTodo').mouseleave(function () {
	// 	// $('#createTodo').find('.tooltipForRightSide').remove();
	// 	// $('.main-header').css('z-index', '999');

	// });

	$('#createTodo').mouseenter(function () {
		var selector = $(this);
		setTimeout(function () {
			selector.attr({
				'data-balloon': 'Add a quick task and share',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('#CreateEvent').mouseenter(function () {
		var selector = $(this);
		setTimeout(function () {
			selector.attr({
				'data-balloon': 'Create an event or schedule and share',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.createFeedBack').mouseenter(function () {
		var selector = $(this);
		setTimeout(function () {
			selector.attr({
				'data-balloon': 'Add a feedback',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.chat-head-calling .pin-unpin').mouseenter(function () {
		var selector = $(this);
		var convTitle = $('#conv_title').text();
		var roomType = $('#roomIdDiv').attr('data-title');
		if (roomType == 'Personal') {
			if ($('#pin-to-bar').hasClass('pined') == true) {
				convTitle = "Unpin this direct chat";
			} else {
				convTitle = "Pin this direct chat";
			}
		} else {
			if ($('#pin-to-bar').hasClass('pined') == true) {
				convTitle = "Unpin this room";
			} else {
				convTitle = "Pin this room";
			}
		}
		if ($('#pin-to-bar').hasClass('pined') == true) {
			setTimeout(function () {
				selector.attr({
					'data-balloon': '' + convTitle + '',
					'data-balloon-pos': 'up'
				});
			}, 1000);

		} else {

		}
		setTimeout(function () {
			selector.attr({
				'data-balloon': '' + convTitle + '',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.chat-head-calling .tagged').mouseenter(function () {
		var selector = $(this);
		var convTitle = $('#conv_title').text();
		var roomType = $('#roomIdDiv').attr('data-title');
		if (roomType == 'Personal') {
			convTitle = "Tag this direct chat";
		} else {
			convTitle = "Tag this room";
		}
		setTimeout(function () {
			selector.attr({
				'data-balloon': '' + convTitle + '',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.chat-head-calling .voice-call').mouseenter(function () {
		var selector = $(this);
		var convTitle = $('#conv_title').text();
		var roomType = $('#roomIdDiv').attr('data-title');
		if (roomType == 'Personal') {
			convTitle = 'Call "' + convTitle + '"';
		} else {
			convTitle = 'Conference Call with members of "' + convTitle + '"';
		}
		setTimeout(function () {
			selector.attr({
				'data-balloon': '' + convTitle + '',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.chat-head-calling .video-call').mouseenter(function () {
		var selector = $(this);
		var convTitle = $('#conv_title').text();
		var roomType = $('#roomIdDiv').attr('data-title');
		if (roomType == 'Personal') {
			convTitle = 'Make a video call to "' + convTitle + '"';
		} else {
			convTitle = 'Video Conference with members of "' + convTitle + '"';
		}
		setTimeout(function () {
			selector.attr({
				'data-balloon': '' + convTitle + '',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.chat-head-calling .more-menu').mouseenter(function () {
		var selector = $(this);
		if ($('.moreMenuPopup').is(':visible') == true) {
			setTimeout(function () {
				selector.attr({
					'data-balloon': 'Hide more option',
					'data-balloon-pos': 'up'
				});
			}, 1000);

			// var design = '<div class="tooltipForRightSide tooltipHeadLeft"><h2>Hide more option</h2><span></span></div>';
		} else {
			setTimeout(function () {
				selector.attr({
					'data-balloon': 'See more option',
					'data-balloon-pos': 'up'
				});
			}, 1000);

			// var design = '<div class="tooltipForRightSide tooltipHeadLeft"><h2>See more option</h2><span></span></div>';
		}
	});
	$('.addTagConv').mouseenter(function () {
		var selector = $(this);

		if ($('#tagItemList').text().length > 25) {
			var text = $('#tagItemList').text();
			setTimeout(function () {
				selector.attr({
					'data-balloon': '' + text + '',
					'data-balloon-pos': 'up'
				});
			}, 1000);
		}

	});
	$('.pevThread').mouseenter(function () {
		var selector = $(this);
		setTimeout(function () {
			selector.attr({
				'data-balloon': 'Go to previous threaded reply',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});
	$('.nextThread').mouseenter(function () {
		var selector = $(this);
		setTimeout(function () {
			selector.attr({
				'data-balloon': 'Go to next threaded reply',
				'data-balloon-pos': 'up'
			});
		}, 1000);

	});


}
tooltipForOverLength();

var tooltipForBackWrap = () => {
	$('.closeBackwrap').mouseenter(function () {
		$(this).attr({
			'data-balloon': 'Press Esc to close',
			'data-balloon-pos': 'up'
		});

	});
}
tooltipForBackWrap();

var draw_urhr = () => {
	var html = '<div class="msg-separetor-unread"><p>1 new message</p></div>';
	$("#msg-container").append(html);
};
var find_urhr_add_s = (nour) => {
	$("#msg-container").find('.msg-separetor-unread>p').html(nour + ' new messages');
};
var draw_msg = (data, append = true) => {
	if (data.has_hide != null)
		if ((data.has_hide).indexOf(user_id) > -1)
			return;
	// if(data.has_delete == null || (data.has_delete).indexOf(user_id) == -1){
	var attach_show = true, deletebtn_active = true, permanently = false;
	if (data.has_delete != null) {
		if ((data.has_delete).indexOf(user_id) == -1) {
			if ((data.has_delete).indexOf('Sender delete it') > -1) {
				data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> This message was deleted.</i>";
				attach_show = false;
				permanently = true;
				// deletebtn_active = false;
			}
		}
		else {
			data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> You deleted this message.</i>";
			attach_show = false;
			permanently = true;
		}
	}

	if (data.msg_body == "This message was deleted.") {
		data.msg_body = "<i><img src='/images/delete_msg.png' class='deleteicon'> This message was deleted.</i>";
		attach_show = false;
		permanently = true;
	}

	if (permanently) {
		data.msg_body += '<span onclick="permanent_delete_silently(\'' + data.msg_id + '\')" class="silent_delete"> (Remove this line)</span>';
	}

	/* Start Date Group By */
	var msg_date = moment(data.created_at).calendar(null, {
		sameDay: '[Today]',
		lastDay: '[Yesterday]',
		lastWeek: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; },
		sameElse: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; }
	});
	var temp_date = msg_date;

	if (append) {
		$.each($('.msg-separetor'), function (k, v) {
			if ($(v).text() == msg_date) {
				msg_date = null;
				return 0;
			}
		});
		if (msg_date !== null && $('.msg-separetor-unread').length == 0) {
			var date_html = '<div class="msg-separetor" data-date="' + msg_date + '"><p>' + msg_date + '</p></div>';
			$("#msg-container").append(date_html);
		}
	}
	/* End Date Group By */


	var html = '<div class="msgs-form-users msg_id_' + data.msg_id + '" data-msgid="' + data.msg_id + '">';
	html += '<div class="msg-user-photo">';
	html += '<img src="/images/users/' + data.sender_img + '" alt="' + data.sender_img + '">';
	html += '</div>';
	html += '<div class="user-msg" data-sendername="' + data.sender_name + '">';
	html += '<h4>' + data.sender_name;
	html += '&nbsp;<span class="msg-time">' + moment(data.created_at).format('h:mm a') + '</span>';
	// Sms seen unseen
	var delete_both_side = 0;
	html += '<span class="msg-send-seen-delivered">';
	// Issue #54, for own conversation, no need to show messages status
	// data.conversation_id != user_id
	if (data.conversation_id != user_id && data.sender == user_id) {
		if (data.has_delivered == 0) {
			delete_both_side = 1;
			html += ' - Sent';
		} else {
			if (data.msg_status == null) {
				delete_both_side = 0;
				html += ' - Delivered';
			}
		}
	}
	html += '</span>';
	if(data.edit_status != null){
		data.edit_status = Number(data.edit_status);
		html += '<div class="message_edit_status" data-balloon-pos="up" data-balloon="'+moment(data.edit_status).format('MMM Do YYYY @ h:mm a')+'">  - [Edited] </div>';
	}

	html += '<span data-val="' + delete_both_side + '" class="hidden msg_id_del_status_' + data.msg_id + '"></span>';

	// Check flag and unflag message
	if (data.has_flagged != null && (data.has_flagged).indexOf(user_id) != -1) {
		html += '&nbsp;<img onclick="flaggedUserMsg(event)" class="flaggedMsg" src="/images/basicAssets/Flagged.svg">';
	}
	html += '</h4>';
	/*========================== MSG TEXT BODY =======================================*/
	if (data.msg_body == 'No Comments')
		html += '<p id="data_msg_body'+data.msg_id+'"></p>';
	else if (data.attch_imgfile !== null || data.attch_videofile !== null || data.attch_otherfile !== null)
		html += '<p style="font-style: italic;" id="data_msg_body'+data.msg_id+'">' + data.msg_body + '</p>';
	else if (data.msg_type == 'todo') {
		html += draw_todo_share(data);
		need_todo_details.push(data.activity_id);
	}
	else if(isURL(data.msg_body))
		html += '<p id="data_msg_body'+data.msg_id+'" class="has_url" data-date="'+ data.created_at +'">' + data.msg_body + '</p>';
	else
		html += '<p id="data_msg_body'+data.msg_id+'">' + data.msg_body + '</p>';
	/*========================== MSG TEXT BODY END ====================================*/
	if (data.attch_videofile !== null && attach_show) {
		if (user_id === data.sender) { if (attachFileList.indexOf(data.msg_id) === -1) { attachFileList.push(data.msg_id); } }
		html += per_msg_video_attachment(data.attch_videofile);
	}
	if (data.attch_imgfile !== null && attach_show) {
		if (user_id === data.sender) { if (attachFileList.indexOf(data.msg_id) === -1) { attachFileList.push(data.msg_id); } }
		html += per_msg_img_attachment(data.attch_imgfile, data.sender_name, data.sender_img, data.msg_body);
	}
	if (data.attch_audiofile !== null && attach_show) {
		if (user_id === data.sender) { if (attachFileList.indexOf(data.msg_id) === -1) { attachFileList.push(data.msg_id); } }
		html += per_msg_audio_attachment(data.attch_audiofile);
	}
	if (data.attch_otherfile !== null && attach_show) {
		if (user_id === data.sender) { if (attachFileList.indexOf(data.msg_id) === -1) { attachFileList.push(data.msg_id); } }
		html += per_msg_file_attachment(data.attch_otherfile,data.sender_name);
	}
	html += '<div class="replies">';
	// Check emoji reaction message
	if (data.has_emoji !== null && attach_show) {
		$.each(data.has_emoji, function (k, v) {
			if (v > 0)
				html += emoji_html(k, "/images/emoji/" + k + ".png", v);
		});
	}
	html += '</div>';

	html += '<div id="filesTagHolder' + data.msg_id + '" style="display:none;margin: 8px 0px; float: left;width:100%; font-family:hvWorkSans;"><span style="margin: 0px 8px 0px 0px; float: left;font-size: 14px;font-family: hvAssistant;font-style: italic;">' + data.sender_name + ' tagged the attachment(s) as</span>  <span style="float: left;margin-top: 0px;" id="filesTag' + data.msg_id + '"></span></div>';

	if (data.has_reply > 0 && attach_show) {
		html += per_msg_rep_btn(data.has_reply, data.last_reply_time, data.last_reply_name);
	}
	html += '</div>';
	html += '<div class="msgs-form-users-options">';
	html += '<div class="call-rep-emoji" onclick="viewEmojiList(event)"><img src="/images/basicAssets/AddEmoji.svg" alt=""></div>';
	// Check flag and unflag message
	if (data.has_flagged != null && (data.has_flagged).indexOf(user_id) != -1) {
		html += '<div class="flag" onclick="flggUserMsg(event)"><img src="/images/basicAssets/Flagged.svg" alt=""></div>';
	}
	else {
		html += '<div class="flag" onclick="flggUserMsg(event)"><img src="/images/basicAssets/NotFlagged.svg" alt=""></div>';
	}
	html += '<div class="replys" onclick="threadReply(event)"><img src="/images/basicAssets/Thread.svg" alt=""></div>';
	html += '<div class="more">';
	html += '<img src="/images/basicAssets/MoreMenu.svg" alt="">';
	html += '<div class="msg-more-popup" style="display:none">';
	if (data.has_delete == null && data.msg_type !== 'todo') {
		var regex = /(&nbsp;|<([^>]+)>)/ig
		html += '<p onclick="viewCreateTodoPopupNew(event,\'' + data.msg_body.replace(regex, "") + '\',\'' + data.msg_id +'\')" class="createNTFC">Create a Task</p>';
	}
	html += '<p>Schedule an event</p>';
	html += '<p onclick="shareMessage(event)">Share Message</p>';
	if(data.sender == user_id)
		html += '<p onclick="editMessage(event)">Edit Message</p>';
	if (permanently) {
		html += '<p onclick="delete_permanently(event)">Delete Message</p>';
	} else {
		var delete_all_active = (data.sender == user_id);
		html += '<p onclick="delete_this_msg(event, ' + delete_all_active + ')">Delete Message</p>';
	}
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	if (append)
		$("#msg-container").append(html);
	else {
		$("#msg-container").prepend(html);

		$.each($('.msg-separetor'), function (k, v) {
			if ($(v).text() == msg_date) {
				$(v).remove();
				return 0;
			}
		});
		var date_html = '<div class="msg-separetor" data-date="' + msg_date + '"><p>' + msg_date + '</p></div>';
		$("#msg-container").prepend(date_html);
	}

	moreMsgAction();
	// viewThread();
	// }
};
var isURL = (str) =>{
	var url_pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
	if(!url_pattern.test(str))
		return false;
	else
		return true;
};

var draw_todo_share = (data) => {
	var html = '';
	if (data.sender != user_id) {
		html += '<p>' + data.sender_name + ' is sharing a To-Do with you.</p>';
	} else {
		html += '<p>You share a To-Do.</p>';
	}

	html += '<div class="toDoContent todo_id_' + data.activity_id + ' todo_share_div_' + data.msg_id + '" data-aid="' + data.activity_id + '">'; // Start todo div
	if (data.msg_body == 'accept') {
		html += '<div class="toDoContent_Sec1">';
		html += '<div class="acceptCheck"></div>';
		if (data.sender != user_id)
			html += '<p class="acceptedLabel">Youve accepted <label onclick="goto_todo(event)">...</label></p>';
		else
			html += '<p class="acceptedLabel">' + $('#conv' + data.conversation_id).attr('data-name') + ' accepted <label onclick="goto_todo(event)">...</label></p>';
		html += '</div>';
	}
	else if (data.msg_body == 'decline') {
		html += '<div class="toDoContent_Sec1">';
		html += '<div class="acceptCheck decline"></div>';
		if (data.sender != user_id)
			html += '<p class="acceptedLabel decline">Youve decline <label>...</label></p>';
		else
			html += '<p class="acceptedLabel decline">' + $('#conv' + data.conversation_id).attr('data-name') + ' decline <label onclick="goto_todo(event)">...</label></p>';
		html += '</div>';
	}
	else {
		html += '<div class="toDoContent_Sec1">';
		html += '<img src="/images/basicAssets/custom_to_do_for_msg.svg">';
		html += '<p class="toDoName">...</p>';
		html += '<p>Due Date: <span class="dudate">...</span></p>';
		html += '</div>';
		if (data.sender != user_id) {
			html += '<div class="toDoContent_Sec2">';
			html += '<button class="accept_toDO" data-members="" onclick="accept_todo(event, \'' + data.conversation_id + '\', \'' + data.msg_id + '\',\'' + data.activity_id + '\')">Accept</button>';
			html += '<button class="decline_toDo" onclick="decline(event, \'' + data.conversation_id + '\', \'' + data.msg_id + '\', \'' + data.activity_id + '\')">Decline</button>';
			html += '</div>';
		}
	}
	html += '</div>'; // End todo div
	return html;
}
var goto_todo = (event) => {
	var aid = $(event.target).closest('.toDoContent').attr('data-aid');
	setCookie('lastActive', aid, 1);
	window.location.href = '/basic_to_do';
};
var accept_todo = (event, conversation_id, msg_id, activity_id) => {
	var members = $(event.target).attr('data-members').split(',');
	var html = '';
	socket.emit('todo_acepted', conversation_id, msg_id, user_id, activity_id, (res) => {
		html = '<div class="acceptCheck"></div>';
		html += '<p class="acceptedLabel">Youve accepted <label onclick="goto_todo(event)">' + $(event.target).closest('.toDoContent').find('.toDoName').html() + '</label></p>';
		$(event.target).closest('.toDoContent').find('.toDoContent_Sec1').html(html);
		html = draw_todo_member_list(members);
		// console.log(html);
		$(event.target).closest('.toDoContent').find('.toDoContent_Sec2').html(html);
	});
};
var draw_todo_member_list = (members) => {
	var html = '';
	var you_decline_this_todo = false;
	html += '<div class="toDoContent_Sec2">';
	html += '<h1 class="acceptedMember">Accepted Member</h1>';
	$.each(members, function (k, v) {
		if (v == user_id) {
			you_decline_this_todo = true;
		}
		if (k < 4) {
			$.each(allUserdata[0].users, function (kk, vv) {
				if (v == vv.id)
					html += '<img src="/images/users/' + vv.img + '" class="selected_member" title="' + vv.fullname + '" alt="' + vv.img + '">';
			});
		}
		else if (k == 4) {
			html += '<span class="countSelected">+' + (members.length - 4) + '</span>';
		}
	});
	html += '</div>';
	return you_decline_this_todo ? html : "";
};
var decline = (event, conversation_id, msg_id, activity_id) => {
	// console.log(conversation_id, msg_id, activity_id);
	socket.emit('todo_decline', conversation_id, msg_id, activity_id, user_id, (res) => {
		var html = '<div class="acceptCheck decline"></div>';
		html += '<p class="acceptedLabel decline">Youve decline <label>' + $(event.target).closest('.toDoContent').find('.toDoName').html() + '</label></p>';
		$(event.target).closest('.toDoContent').find('.toDoContent_Sec1').html(html);
		$(event.target).closest('.toDoContent').find('.toDoContent_Sec2').remove();
	});
};
var per_msg_img_attachment = (msg_attach_img, sender_name, sender_img, data_msg) => {
	var html = "";
	var strWindowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=600,height=400";
	$.each(msg_attach_img, function (k, v) {
		//var file_name = v.split('@');
		//html += '<p>'+file_name[0]+ '.' + file_name[1].substring(file_name[1].lastIndexOf(".")+1) +'</p>';
		//html +=	'<img data-sender_name="'+ sender_name +'" data-sender_img="'+ sender_img +'" class="img_attach" src="'+ file_server +'/upload/'+ v +'" alt="'+ v +'" onclick="window.open(\''+ file_server +'/upload/'+ v +'\', \'Image Viewer\', \''+ strWindowFeatures +'\')">';
		html += '<img data-msg="'+data_msg+'" data-sender_name="' + sender_name + '" data-sender_img="' + sender_img + '" class="img_attach" src="' + file_server + '/upload/' + v + '" alt="' + v + '" onclick="showImageSlider(event)" data-src="' + file_server + '/upload/' + v + '">';
	});
	return html;
}
var per_msg_video_attachment = (msg_attach_video) => {
	var html = "";
	$.each(msg_attach_video, function (k, v) {
		var file_type = v.split('.').pop().toLowerCase();
		html += '<video controls class="media-msg">';
		html += '<source class="vdo_attach" src="' + file_server + '/upload/' + v + '" type="video/' + file_type + '" data-file_name="' + v + '">';
		html += 'Your browser does not support HTML5 video.';
		html += '</video>';
	});
	return html;
}
var per_msg_audio_attachment = (msg_attach_audio) => {
	var html = "";
	$.each(msg_attach_audio, function (k, v) {
		var file_type = v.split('.').pop().toLowerCase();
		html += '<audio controls class="media-msg">';
		html += '<source class="ado_attach" src="' + file_server + '/upload/' + v + '" type="audio/' + file_type + '">';
		html += 'Your browser does not support audio tag.';
		html += '</audio>';
	});
	return html;
}

var per_msg_file_attachment = (msg_attach_file,sender_name) => {
	var html = "";
	$.each(msg_attach_file, function (k, v) {
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
		html += '<div class="fil_attach attach-file lightbox" data-sender_name="'+sender_name+'" data-filetype="' + ext + '" data-src="' + file_server + '/upload/' + v + '" data-file_name="' + v + '">';
		html += '<img src="/images/file_icon/' + ext + '.png" alt="' + v + '">';
		html += '<div class="file-name">' + v.substring(0, v.lastIndexOf('@')) + '.' + file_type + '</div>';
		html += '<div class="file-time">' + moment().format('h:mm a') + '</div>';
		html += '</div>';
		html += '</a>';
		// console.log(html);
	});
	return html;
};
var per_msg_rep_btn = (count, rep_time, rep_name) => {
	var html = "";
	html += '<div class="msgReply" >';
	html += '<div class="groupImg">';
	for (var i = 0; i < count; i++)
		html += '<img src="/images/users/img.png">';
	html += '</div>';
	html += '<div class="countReply">';
	html += '<img src="/images/basicAssets/custom_thread_for_reply.svg" onclick="threadReply(event)">';
	html += '<p onclick="threadReply(event)"><span class="no-of-replies" >' + count + '</span> Reply </p>';
	html += '<img class="replyarrow" src="/images/basicAssets/custom_rightChevron_for_reply.svg" onclick="threadReply(event)">';
	html += '<span class="last_rep_text"> Last reply ' + moment(rep_time).fromNow() + ' from ' + rep_name + '</span>';
	html += '</div>';
	html += '</div>';
	return html;
}
// Delete message
var delete_this_msg = (event, all_active) => {
	var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
	$('.msg-more-popup').hide();
	$('#delete_msg_div').show();
	$('.main-deleted-msg').html($('.msg_id_' + msgid).find('.msg-user-photo')[0].outerHTML);
	$('.main-deleted-msg').append('<div class="delbody">' + $('.msg_id_' + msgid).find('.user-msg').html() + '</div>');
	$('#delete_msg_div').find('.delete_msg_sec_title').html('Are you sure you want to delete this message? This cannot be <span class="undone">undone.</span>');
	$('#delete_msg_div').find('.btn-msg-del').show();
	$('#delete_msg_div').find('.btn-msg-del').attr('data-id', msgid);
	$('#delete_msg_div').find('.btn-msg-del-all').attr('data-id', msgid);
	if ($('#conv' + user_id).hasClass('sideActive')) {
		$('#delete_msg_div').find('.btn-msg-del').hide();
		$('#delete_msg_div').find('.btn-msg-del.permanent_delete').show();
	} else {
		$('#delete_msg_div').find('.permanent_delete').hide();
	}
	if (all_active && (!$('#conv' + user_id).hasClass('selected')))
		$('#delete_msg_div').find('.btn-msg-del-all').show();
	else
		$('#delete_msg_div').find('.btn-msg-del-all').hide();
};
var delete_commit = (e) => {
	var msgid = $(e).attr('data-id');
	var is_seen = $('.msg_id_del_status_' + msgid).attr('data-val');
	var remove_both_side = $(e).hasClass('btn-msg-del-all');
	console.log(remove_both_side);
	$.ajax({
		url: '/hayven/commit_msg_delete',
		type: 'POST',
		data: { uid: user_id, conversation_id: conversation_id, msgid: msgid, is_seen: is_seen, remove: remove_both_side },
		dataType: 'JSON',
		success: function (res) {
			if (res.status) {
				if (remove_both_side) {
					socket.emit("one_user_deleted_this", { msgid: msgid });
				}
				var h4data = $('.msg_id_' + msgid).find('.user-msg>h4').html();
				var delhtml = '<p> <i><img src="/images/delete_msg.png" class="deleteicon"> You deleted this message.</i><span onclick="permanent_delete_silently(\'' + msgid + '\')" class="silent_delete"> (Remove this line)</span></p>';
				$('.msg_id_' + msgid).find('.user-msg').html('<h4>' + h4data + '</h4>' + delhtml);
				$('.msg_id_' + msgid).find('.msg-more-popup>p').last().attr('onclick', 'delete_permanently(event)');
				closeAllPopUp();
				$('.msg_id_' + msgid).find('.createNTFC').remove();
			}
		},
		error: function (err) {
			console.log(err.responseText);
		}
	});
};
var delete_permanently = (event) => {
	var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
	$('.msg-more-popup').hide();
	$('#delete_msg_div').show();
	$('.main-deleted-msg').html($('.msg_id_' + msgid).find('.msg-user-photo')[0].outerHTML);
	$('.main-deleted-msg').append('<div class="delbody">' + $('.msg_id_' + msgid).find('.user-msg').html() + '</div>');
	$('#delete_msg_div').find('.btn-msg-del').hide();
	$('#delete_msg_div').find('.delete_msg_sec_title').html('Are you sure you want to delete this message permanently? This cannot be <span class="undone">undone.</span>');
	$('#delete_msg_div').find('.permanent_delete').attr('data-id', msgid);
	$('#delete_msg_div').find('.permanent_delete').show();
};
var permanent_delete_silently = (msgid) => {
	$.ajax({
		url: '/hayven/commit_msg_delete',
		type: 'POST',
		data: { uid: user_id, conversation_id: conversation_id, msgid: msgid, is_seen: 'permanent_delete', remove: true },
		dataType: 'JSON',
		success: function (res) {
			if (res.status) {
				// if(remove_both_side){
				//     socket.emit("one_user_deleted_this", {msgid: msgid});
				// }
				socket.emit('removethisline', { msgid, user_id });
				closeAllPopUp();
			}
		},
		error: function (err) {
			console.log(err.responseText);
		}
	});
};
socket.on('removedline', function (data) {
	$('.msg_id_' + data.msgid).remove();
	$('.msg_id_' + data.msgid).find('.createNTFC').remove();
});
var permanent_delete = (e) => {
	var msgid = $(e).attr('data-id');
	permanent_delete_silently(msgid);
};
socket.on("delete_from_all", function (data) {
	var h4data = $('.msg_id_' + data.msgid).find('.user-msg>h4').html();
	var delhtml = '<p> <i><img src="/images/delete_msg.png" class="deleteicon"> This message was deleted.</i></p>';
	$('.msg_id_' + data.msgid).find('.user-msg').html('<h4>' + h4data + '</h4>' + delhtml);
	$('.msg_id_' + data.msgid).find('.createNTFC').remove();
});
// end of delete message
/* Start emoji sending */
var emoCount = 0;
var emoji_div_draw = () => {
	if (getCookie('recentEmo') != ""){
		var drawRecent = JSON.parse(getCookie('recentEmo'));
	}else{
		var drawRecent = 0;
	}
	
	var emojiNumber;
	emoCount = 0;
	var design = '<div class="emoji_div">';
	// design += '<div class="emoji-header"><img src="/images/emoji/temp-emoji-head.png"></div>';
	// design += '<div class="search-emoji-from-list">';
	// design += '<input type="text" placeholder="Search">';
	// design += '</div>';
	// recentEmo
	design += '<div class="lodingDiv"><img src = "/images/typing-indicator.gif" ></div>';
	if (drawRecent.length > 0) {
		design += '<div class="emoji-container-name recentEmo">Recent reaction</div>';
		design += '<div class="emoji-container overlayScrollbars recentEmo" style="height: auto;">';
		$.each(drawRecent, function(k,v){
			design += '<img src="/images/emojiPacks/' + v + '">';
		});
		design += '</div>';
	}
	design += '<div class="emoji-container-name">Pick your reaction</div>';
	design += '<div class="emoji-container overlayScrollbars pickingReactDiv">';
	for (emojiNumber = 1; emojiNumber < 65; emojiNumber++) {
		design += '<img src="/images/emojiPacks/hv' + emojiNumber + '.svg">';
		emoCount++;
	}
	design += '</div>';
	design += '</div>';
	return design;
};
var open_emoji = () => {
	if ($('.emoji_div').length == 0) {
		var design = emoji_div_draw();
		$('.send-msgs').append(design);
		if (emoCount === $('.emoji_div .pickingReactDiv>img').length) {
			$(".lodingDiv").fadeOut(300, function () { $(this).remove(); });
		}
		insert_emoji('msg');
	} else {
		$('.emoji_div').remove();
		// $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
		// $('.backWrap').hide();
	}
	// var emojilength = $('.emoji-container img').length;
	// $('.emoji-container').on('scroll', function(event){
	// 	var i;
	// 	if(emojilength == 66){
	// 		emojilength = emojilength +1;
	// 		for (i = 67; i < 874; i++) {
	// 			var html = '<img src="/images/emojiPacks/hv'+i+'.svg">';
	// 			$('.emoji-container').append(html);
	// 		}
	// 	}
	// });
	overlayScrollbars();

}
var insert_emoji = (id) => {
	$('.emoji_div .emoji-container>img').on('click', function () {
		var emoji_name = $(this).attr('src');
		let name = emoji_name.split('/');
		if (recentEmo.indexOf(name[name.length - 1]) === -1) {
			recentEmo.push(name[name.length - 1]);
		}
		setCookie('recentEmo', JSON.stringify(recentEmo),1);
		$('#' + id).append('<img src="' + emoji_name + '" style="width:20px; height:20px; vertical-align: middle;" />&nbsp;');
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
/* End emoji sending */
/**
* When message form submit
**/
var convert = (str) => {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var text1 = str.replace(exp, "<a target='_blank' href='$1'>$1</a>");
	var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
};

var msg_form_submit = () => {
	var str = $('#msg').html();
	str = str.replace(/(<\/?(?:img|br)[^>]*>)|<[^>]+>/ig, '$1'); // replace all html tag
	str = convert(str);
	str = str.replace(/&nbsp;/gi, '').trim();
	str = str.replace(/^(\s*<br( \/)?>)*|(<br( \/)?>\s*)*$/gm, '');
	if (str != "") {
		msg_sending_process(str);
	}
};

var draw_typing_indicator = (add_remove, img, name) => {
	if (add_remove) {
		if ($('.typing-indicator').html() == "") {
			$('.typing-indicator').html(name + '&nbsp;<span>is typing....</span>');
		}
	} else {
		$('.typing-indicator').html("");
	}
};
var draw_rep_typing_indicator = (add_remove, img, name) => {
	if (add_remove) {
		if ($('.rep-typing-indicator').html() == "") {
			$('.rep-typing-indicator').html(name + '&nbsp;<span>is typing....</span>');
		}
	} else {
		$('.rep-typing-indicator').html("");
	}
};




function createChannel() {
	$(".create-channel-heading").text("Create Room");
	$(".connect_right_section").hide();
	$('#createChannelContainer').show();

	$('#team-name').focus();

	if (!$("#defaultRoom").is(":visible")) {
		$('.side_bar_list_item li').removeClass('sideActive');
		$('.side_bar_list_item li').children(".hash, .online, .offline, .lock, .toDo").css('left', '12px');
		$("#channelList").prepend('<li data-myid="' + user_id + '" data-createdby="0"  data-octr="' + user_id + '" id="defaultRoom" class="sideActive"><span class="hash"  style="left: 6px;"></span><span class="usersName"> New Room </span></li>');
	}

	$(".add-team-member").prop("disabled", false);
	$("#ml-admintype").hide();
	$("#ml-membertype").hide();
	$("#ml-listHA").html('');
	$("#ml-listHl").html('');
	$("#team-name").val('');
	$("#select-ecosystem option").prop("selected", false);
	$('#grpPrivacy').attr('checked', false);

	adminArra = [];
	participants = [];

	$("#roomIdDiv").attr('data-roomid', '');
	$("#roomIdDiv").attr('data-title', '');
	$("#roomIdDiv").attr('data-privecy', '');
	$("#roomIdDiv").attr('data-keyspace', '');
	$("#roomIdDiv").attr('data-rfu', '');
	$(".submitBtn").show();

	$("#demoImg").attr('src', '/images/basic_view/channel-photo.JPG');
	$("#upload-channel-photo").attr("onchange", "getInfo(event)");

	$("#s-l-def").html("");
	$("#directMsgUserList").html("");

	$.each(allUserdata[0].users, function (ky, va) {
		var definedList = '<li>';
		definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
		definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">' + va.designation + '</spna>';
		definedList += '    </li>';

		$("#s-l-def").append(definedList);
		$("#directMsgUserList").append(definedList);
	});
	if($('.fileSliderBackWrap').is(':visible') == true){
		$('.fileSliderBackWrap').hide();
	}

	all_action_for_selected_member();

}

function createDirMsg() {
	$('#createDirMsgContainer').show();
	$('.add-direct-member').focus();
	$('.add-direct-member').attr('spellcheck', false);

	$("#ml-admintype").hide();
	$("#ml-membertype").hide();
	$(".ml-listHA").html('');
	$(".ml-listHl").html('');

	$("#s-l-def").html("");
	$("#directMsgUserList").html("");
	$('.suggested-type-list').show();
	$('.suggested-type-list>ul').css('width', '323px !important');
	$('.remove-suggested-type-list').hide();
	var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
	$.each(user_list, function (ky, va) {
		if (va.id !== user_id) {
			var definedList = '<li class="showEl">';
			definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
			definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">@ Navigate</spna>';
			definedList += '    </li>';

			$("#s-l-def").append(definedList);
			$("#directMsgUserList").append(definedList);
			$("#directMsgUserList li.showEl:first").addClass('selected default');
		}
	});

	if($('.fileSliderBackWrap').is(':visible') == true){
		$('.fileSliderBackWrap').hide();
	}

	all_action_for_selected_member();
	// $('#createDirMsgContainer').height($( window ).height() -130 );
	popupMouseEnter();

}


function closeRightSection() {

	if ($("#divCheck").val() == '1') {
		if ($("#createChannelContainer").is(":visible") && $("#defaultRoom").is(":visible")) {
			$("#defaultRoom").remove();
		}

		$(".connect_right_section").hide();
		$('#groupChatContainer').show();

		$(".add-team-member").prop("disabled", false);
		$('#grpPrivacy').prop("disabled", false);
		$(".add-direct-member").html('');
		$(".add-team-member").val('');

		memberList = [];
		memberListUUID = [];
		directMsgCont = 1;

		$("#ml-admintype").hide();
		$("#ml-membertype").hide();

		$(".ml-listHA").html('');
		$(".ml-listHl").html('');
		$("#team-name").val('');
		$("#select-ecosystem option").prop("selected", false);
		$('#grpPrivacy').attr('checked', false);

		// $("#roomIdDiv").attr('data-roomid', '');
		// $("#roomIdDiv").attr('data-title', '');
		// $("#roomIdDiv").attr('data-privecy', '');
		// $("#roomIdDiv").attr('data-keyspace', '');
		// $("#roomIdDiv").attr('data-rfu', '');

		$(".submitBtn").show();
		$('.side_bar_list_item li').removeClass('sideActive');
		$("#conv" + $("#lastActive").val()).addClass('sideActive');
		$("#lastActive").val('1');
		$("#groupChatContainer").show();

	} else if ($("#divCheck").val() == '2') {
		joinChannelPanel();
		$("#divCheck").val('1');
	}
}

function createToDo(e) {
	if ($('.create-todo-popup').is(":visible") == false) {
		$('.create-todo-popup').show();
		$('#createTodo').hide();
		$('.create-todo-popup-title').focus();
	}
}
function searchConversation(e) {
	if ($('.search-panel').is(":visible") == false) {
		$('.search-panel').show();
		$('#searchConversation').hide();
		$('.search-panel input').focus();
	}
}
function todoToggleAdvance() {
	if ($("#todoAdvanceOption").is(":visible") == true) {
		$("#todoAdvanceOption").hide();
	} else {
		$("#todoAdvanceOption").show();
		$('.channel-member-search input').focus();
	}
}
function searchFilter() {
	if ($('.filterMainContainer').is(":visible") == false) {
		$('.filterMainContainer').show();
		$('.side-bar-filter-icon').addClass('active');
	}
	if ($('.filterMainContainer').is(":visible") == true) {
		$('.fileSliderBackWrap').hide();
	}
}
function chooseTag() {
	if ($('.filterMainContainer').is(":visible") == true) {
		$('.chooseTag').show();
	}
}
function moreMenuPopup() {
	if ($('.moreMenuPopup').is(":visible") == false) {
		$('.moreMenuPopup').show();
	} else {
		$('.moreMenuPopup').hide();
	}
}

function checkEligibilty(user_id,createdby, adminList) {
	if (createdby === user_id){
		if (adminList.indexOf(user_id)>-1){
			if(adminList.length > 1){
				return true;
			}else{
				return false;
			}
		}
	}else{
		return true;
	}
}

function joinChannelPanel() {

	var keySpace = 'Navigate';
	socket.emit('public_conversation_history', { keySpace }, (respons) => {
		if (respons.staus) {
			$("#publicRoomsList").html("");
			$(".connect_right_section").hide();
			$('#joinChannelPanel').show();
			$.each(respons.rooms, function (k, v) {
				if (checkEligibilty(user_id,v.created_by, v.participants_admin)){
					var ststus = (v.privacy == "public" ? "hash" : "lock");
					if ($.inArray(user_id, v.participants) !== -1) {
						var totalMember = v.participants;
						var roomDesign = '<div class="added-channels">';
						roomDesign += '		<div class="channel-joined" id="roomJoin' + v.conversation_id + '" style="display:blockrr;"><img src="/images/basicAssets/joined.png" alt="">Joined</div>';
						roomDesign += '		<h3 class="chanel-name" id="joinChanelTile' + v.conversation_id + '" data-roomid="' + v.conversation_id + '" data-rfu="join" data-title="' + v.title + '" data-privecy="' + v.privacy + '" data-keyspace="' + v.group_keyspace + '" data-participants="' + v.participants + '" data-admin="' + v.participants_admin + '" onclick="roomFromJOin($(this).attr(\'data-participants\'),$(this).attr(\'data-admin\'),$(this).attr(\'data-roomid\'),$(this).attr(\'data-title\'),$(this).attr(\'data-privecy\'),$(this).attr(\'data-keyspace\'))"><span class="' + ststus + '"></span><span id="roomTitle' + v.conversation_id + '">' + v.title + '<span></h3>';
						roomDesign += '		<p class="channel-members"><img src="/images/basicAssets/Users.svg" alt="">' + totalMember.length + ' Members</p>';
						roomDesign += '		<div class="channel-tags">';
						$.each(respons.convTag, function (ck, cv) {
							if (cv.cnvID == v.conversation_id) {
								roomDesign += '  		<p>' + cv.title + '</p>';
							}
						});
						roomDesign += '		</div>';
						// if ($.inArray(user_id, v.participants_admin) !== -1) {
						// 	roomDesign += '		<h3 class="click-to-leave" id="roomBtn' + v.conversation_id + '">Leave Room</h3>';
						// } else {
						// 	roomDesign += '		<h3 class="click-to-leave" id="roomBtn' + v.conversation_id + '" onclick="leaveRoom(\'' + v.conversation_id + '\',\'' + user_id + '\')">Leave Room</h3>';
						// }

						roomDesign += '		<h3 class="click-to-leave" id="roomBtn' + v.conversation_id + '" onclick="leaveRoom(\'' + totalMember.length + '\',\'' + v.created_by + '\',\'' + v.privacy + '\',\'' + v.group_keyspace + '\',\'' + v.conversation_id + '\',\'' + user_id + '\')">Leave Room</h3>';
						roomDesign += '</div>';

						$("#publicRoomsList").append(roomDesign);
					} else {
						var totalMember = v.participants;
						var roomDesign = '<div class="added-channels">';
						roomDesign += '		<div class="channel-joined" id="roomJoin' + v.conversation_id + '" style="display:none;"><img src="/images/basicAssets/joined.png" alt="">Joined</div>';
						roomDesign += '		<h3 class="chanel-name" id="joinChanelTile' + v.conversation_id + '" data-roomid="' + v.conversation_id + '" data-rfu="join" data-title="' + v.title + '" data-privecy="' + v.privacy + '" data-keyspace="' + v.group_keyspace + '" data-participants="' + v.participants + '" data-admin="' + v.participants_admin + '" onclick="roomFromJOin($(this).attr(\'data-participants\'),$(this).attr(\'data-admin\'),$(this).attr(\'data-roomid\'),$(this).attr(\'data-title\'),$(this).attr(\'data-privecy\'),$(this).attr(\'data-keyspace\'))"><span class="' + ststus + '"></span><span id="roomTitle' + v.conversation_id + '">' + v.title + '<span></h3>';
						roomDesign += '		<p class="channel-members"><img src="/images/basicAssets/Users.svg" alt="">' + totalMember.length + ' Members</p>';
						roomDesign += '		<div class="channel-tags">';
						$.each(respons.convTag, function (ck, cv) {
							if (cv.cnvID == v.conversation_id) {
								roomDesign += '  		<p>' + cv.title + '</p>';
							}
						});
						roomDesign += '		</div>';
						// if ($.inArray(user_id, v.participants_admin) !== -1) {
						// 	roomDesign += '		<h3 class="click-to-join" id="roomBtn' + v.conversation_id + '">Join Room</h3>';
						// } else {
						// 	roomDesign += '		<h3 class="click-to-join" id="roomBtn' + v.conversation_id + '" onclick="joinRoom(\'' + v.conversation_id + '\',\'' + user_id + '\',\'' + v.title + '\')">Join Room</h3>';
						// }
						roomDesign += '		<h3 class="click-to-join" id="roomBtn' + v.conversation_id + '" onclick="joinRoom(\'' + totalMember.length + '\',\'' + v.created_by + '\',\'' + v.privacy + '\',\'' + v.group_keyspace + '\',\'' + v.conversation_id + '\',\'' + user_id + '\',\'' + v.title + '\')">Join Room</h3>';

						roomDesign += '</div>';
						$("#publicRoomsList").append(roomDesign);
					}
				}
			});

			$('#publicRoomsList').masonry({
				itemSelector: '.added-channels',
				columnWidth: 405,
				gutter: 20
			});

		}
	});
	$('#joinChannelPanel').height($(window).height() - 130);
	if(windowWidth <= 415){
		$('#hayvenSidebar').hide();
	}
}
// function moreMenuPopup() {
// 		// $(e.this).children('.msg-more-popup').toggle();
// 		console.log(this);
// }

var moreMsgAction = () => {
	$('.more').on('click', function (event) {
		$(this).children('.msg-more-popup').show();
		var chat_Page_height = $('.chat-page').height();
		var scrollY = event.pageY;
		var total = chat_Page_height - scrollY;
		if (total < 90) {
			$(this).children('.msg-more-popup').css('top', '-195px')
		}
	});
	$('.msgs-form-users').mouseenter(function () {
		if ($(this).height() > 90) {
			$(this).children('.msgs-form-users-options').css('top', '16px');
		}
	});
}
moreMsgAction();
$(document).mouseup(function (e) {
	var createToDoPop = $(".create-todo-popup");
	var searchPanel = $('.search-panel');
	var filterPannel = $('.filterMainContainer');
	var moreMenuPopup = $('.moreMenuPopup');
	var moreMenumsgPopup = $('.msg-more-popup');
	var repEmojiDiv = $('.emojiListContainer');
	var emoji_div = $('.emoji_div');
	var sendEmoji = $('.send-emoji');
	var taggedList = $('.addTagConv');
	var menuMore = $('.more-menu');
	var videoCallMenuPopup = $('.videoCallMenuPopup');
	var videocall = $('.video-call');


	//per msg more option
	if (!moreMenumsgPopup.is(e.target) && moreMenumsgPopup.has(e.target).length === 0) {
		moreMenumsgPopup.hide();
	}

	if (!taggedList.is(e.target) && taggedList.has(e.target).length === 0) {
		taggedList.hide();
		$('.tagged').show();
		var checkNewTag = $('#CustagItemList').text().length;
		if (checkNewTag !== 0) {
			// console.log('tagged')
			$('#taggedIMGAttachFile').attr("src", "/images/basicAssets/custom_tagged.svg");
		} else {
			// console.log('not tagged')
			$('#taggedIMGAttachFile').attr("src", "/images/basicAssets/custom_not_tag.svg");
		}
	}


	// if the target of the click isn't the container nor a descendant of the container
	if (!createToDoPop.is(e.target) && createToDoPop.has(e.target).length === 0) {
		createToDoPop.hide();
		$('#createTodo').show();
	}
	if (!searchPanel.is(e.target) && searchPanel.has(e.target).length === 0) {
		searchPanel.hide();
		$('#searchConversation').show();
	}
	if (!filterPannel.is(e.target) && filterPannel.has(e.target).length === 0) {
		filterPannel.hide();
		$('.side-bar-filter-icon').removeClass('active');
		$('.chooseTag').hide();
	}

	if (moreMenuPopup.is(':visible') == true) {
		if (!moreMenuPopup.is(e.target) && moreMenuPopup.has(e.target).length === 0 && !menuMore.is(e.target) && menuMore.has(e.target).length === 0) {
			// open_emoji()
			moreMenuPopup.hide();
		}
	}


	if (!repEmojiDiv.is(e.target) && repEmojiDiv.has(e.target).length === 0) {
		repEmojiDiv.remove();
	}
	if (emoji_div.is(':visible') == true) {
		if (!emoji_div.is(e.target) && emoji_div.has(e.target).length === 0 && !sendEmoji.is(e.target) && sendEmoji.has(e.target).length === 0) {
			// open_emoji()
			emoji_div.remove();
		}
	}
	if (videoCallMenuPopup.is(':visible') == true) {
		if (!videoCallMenuPopup.is(e.target) && videoCallMenuPopup.has(e.target).length === 0 && !videocall.is(e.target) && videocall.has(e.target).length === 0) {

			videoCallMenuPopup.hide();
		}
	}
});

// create to do popup

var sideBarSearchcollapses = () => {
	$(".side-bar-search-icon").mouseenter(function () {
		if ($(".thread_active").is(":visible") !== true) {
			// $(".side_bar_thread_ico").show();
			$(this).hide();
			if ($('#sideBarSearch').is(':visible') == false) {
				$('#sideBarSearch').show();
			}
		}

	});


	$('#sideBarSearch').mouseleave(function () {

		if ($('#sideBarSearch').is(':focus') == false && $('#sideBarSearch').val().length < 1) {
			$(this).hide();
			$(".side-bar-search-icon").show();
		}

	});

	$('#sideBarSearch').blur(function () {
		if ($('#sideBarSearch').val().length < 1) {
			$(this).hide();
			$(".side-bar-search-icon").show();
		}

	});
}
sideBarSearchcollapses();


// var viewThread =()=>{
// 	$(".msgs-form-users").on('click', function(){
// 		$(".side_bar_thread_ico").toggle();
// 		$(".thread_active").toggle();
// 	});
// }
// viewThread();
$(".thread_active").on('click', function () {
	// $('#connectAsideContainer').hide();
	$(".label_head_aside").hide();
	$(".threadasideContainer").show();
	$.each($(".side_bar_list_item li"), function (k, per_li) {
		if ($(per_li).hasClass('has_unread_replay')) {
			$(per_li).show();
			var nor = $(per_li).attr('data-nor');
			$(per_li).find('.unreadMsgCount').html(nor);
		}
		else
			$(per_li).hide();
	});
});
var ur_replay2ur_msg = () => {
	$.each($(".side_bar_list_item li"), function (k, per_li) {
		var nom = Number($(per_li).attr('data-nom')) > 0 ? Number($(per_li).attr('data-nom')) : "";
		$(per_li).find('.unreadMsgCount').html(nom);
	});
};
var threadReply = (event) => {
	if ($('#threadReplyPopUp').is(":visible") == false) {
		var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');

		$.ajax({
			url: "/hayven/open_thread",
			type: "POST",
			data: { msg_id: msgid, conversation_id: conversation_id },
			dataType: "JSON",
			success: function (threadrep) {
				thread_id = threadrep;
				thread_root_id = msgid;

				/* main thread msg html design */
				draw_reply_popup_html(
					conversation_id,
					msgid,
					$('.msg_id_' + msgid).find('.msg-user-photo>img').attr('alt'),
					$('.msg_id_' + msgid).find('.user-msg').attr('data-sendername'),
					$('.msg_id_' + msgid).find('.msg-time').html(),
					$('.msg_id_' + msgid).find('.user-msg p').html());
				$('#msg_rep').attr('placeholder', 'Reply to ' + $('.msg_id_' + msgid).find('.user-msg').attr('data-sendername') + '');

				/* end of main thread msg html design */

				$('#threadReplyPopUp .replies-container').html("");
				$('.pevThread').hide();
				$('.nextThread').hide();
				var all_rep_btn = $(".msgReply");
				for (var i = 0; i < all_rep_btn.length; i++) {
					if ($(all_rep_btn[i]).closest('.msgs-form-users').attr('data-msgid') == msgid) {
						if (i > 0) {
							$('.pevThread').show();
							$('.pevThread').attr("data-ano_msg_id", $(all_rep_btn[i - 1]).closest('.msgs-form-users').attr('data-msgid'));
						}
						if (i + 1 < all_rep_btn.length) {
							$('.nextThread').show();
							$('.nextThread').attr("data-ano_msg_id", $(all_rep_btn[i + 1]).closest('.msgs-form-users').attr('data-msgid'));
						}
					}
				}

				$('#threadReplyPopUp').show();
				$('#msg_rep').focus();

				find_and_show_reply_msg(msgid);
			},
			error: function (err) {
				console.log(err.responseText);
			}
		});
	}
};
var read_rep_counter = 0;
var find_and_show_reply_msg = (msgid) => {
	var noofreply = parseInt($('.msg_id_' + msgid).find('.no-of-replies').text());
	$('.reply-separetor p').html(noofreply + ' Reply');
	$.each(unread_replay_data, function (k, v) {
		if (v.root_msg_id == msgid) {
			var nor = Number($('#conv' + v.root_conv_id).attr('data-nor'));
			$('#conv' + v.root_conv_id).attr('data-nor', (nor - 1 > 0) ? nor - 1 : "");
			$('#conv' + v.root_conv_id).find('.unreadMsgCount').text((nor - 1 > 0) ? nor - 1 : "");
			$('.msg_id_' + msgid).css('background', 'transparent');
			v.root_msg_id = 0;
			v.root_conv_id = 0;
			read_rep_counter++;
		}
	});
	if ((unread_replay_data.length - read_rep_counter) == 0) {
		$(".thread_active").hide();
		read_rep_counter = 0;
	}
	if (noofreply > 0) {
		socket.emit('find_reply', { msg_id: msgid, conversation_id: conversation_id }, (reply_list) => {
			if (reply_list.status) {
				var reply_list_data = _.sortBy(reply_list.data, ["created_at",]);

				var need_update_reply_message_seen_list = [];
				var rep_conv_id = reply_list_data[0].conversation_id;
				$.each(reply_list_data, function (key, row) {
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
					if (need_update_reply_message_seen_list.length == 1)
						draw_rep_urhr();
					draw_rep_msg(row);
				});

				if (need_update_reply_message_seen_list.length > 1)
					find_rep_urhr_add_s(need_update_reply_message_seen_list.length);

				if (need_update_reply_message_seen_list.length > 0) {
					$.ajax({
						url: '/hayven/update_msg_status',
						type: 'POST',
						data: {
							msgid_lists: JSON.stringify(need_update_reply_message_seen_list),
							user_id: user_id,
							conversation_id: rep_conv_id
						},
						dataType: 'JSON',
						success: function (res) {
							socket.emit('update_msg_seen', {
								msgid: need_update_reply_message_seen_list,
								senderid: to,
								receiverid: user_id,
								conversation_id: conversation_id
							});
						},
						error: function (err) {
							console.log(err);
						}
					});
				}

				// separetor_show_hide();
			} else {
				console.log('replay search query error', reply_list); // error meessage here
			}
		});
	}
};
var find_and_show_reply_msg_popup = (msgid, convid) => {
	$.each(unread_replay_data, function (k, v) {
		if (v.root_msg_id == msgid) {
			var nor = Number($('#conv' + v.root_conv_id).attr('data-nor'));
			$('#conv' + v.root_conv_id).attr('data-nor', (nor - 1 > 0) ? nor - 1 : "");
			$('#conv' + v.root_conv_id).find('.unreadMsgCount').text((nor - 1 > 0) ? nor - 1 : "");
			$('.msg_id_' + msgid).css('background', 'transparent');
			v.root_msg_id = 0;
			v.root_conv_id = 0;
			read_rep_counter++;
		}
	});
	if ((unread_replay_data.length - read_rep_counter) == 0) {
		$(".thread_active").hide();
		read_rep_counter = 0;
	}
	// if (noofreply > 0) {
	socket.emit('find_reply', { msg_id: msgid, conversation_id: convid }, (reply_list) => {
		if (reply_list.status) {
			var reply_list_data = _.sortBy(reply_list.data, ["created_at",]);

			var need_update_reply_message_seen_list = [];
			var rep_conv_id = reply_list_data[0].conversation_id;
			$.each(reply_list_data, function (key, row) {
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
				if (need_update_reply_message_seen_list.length == 1)
					draw_rep_urhr();
				draw_rep_msg(row);
			});

			if (need_update_reply_message_seen_list.length > 1)
				find_rep_urhr_add_s(need_update_reply_message_seen_list.length);

			var thisconv_count = 0;
			for (var m = 0; m < urrm_pn.length; m++) {
				if (urrm_pn[m].root_conv_id == convid)
					thisconv_count++;
				else
					thisconv_count = 1;
				if (urrm_pn[m].root_conv_id == convid && urrm_pn[m].root_msg_id == msgid) {
					if (thisconv_count > 1) {
						if (urrm_pn[m - 1].root_conv_id == convid) {
							$('.pevThread').show();
							$('.pevThread').attr("data-ano_msg_id", urrm_pn[m - 1].root_msg_id);
							$('.pevThread').attr("data-conv_id", urrm_pn[m - 1].root_conv_id);
						}
					}
					if (m + 1 < urrm_pn.length) {
						if (urrm_pn[m + 1].root_conv_id == convid) {
							$('.nextThread').show();
							$('.nextThread').attr("data-ano_msg_id", urrm_pn[m + 1].root_msg_id);
							$('.nextThread').attr("data-conv_id", urrm_pn[m + 1].root_conv_id);
						}
					}
				}
			}

			if (need_update_reply_message_seen_list.length > 0) {
				$.ajax({
					url: '/hayven/update_msg_status',
					type: 'POST',
					data: {
						msgid_lists: JSON.stringify(need_update_reply_message_seen_list),
						user_id: user_id,
						conversation_id: rep_conv_id
					},
					dataType: 'JSON',
					success: function (res) {
						// socket.emit('update_msg_seen', {
						//   msgid: need_update_reply_message_seen_list,
						//   senderid: to,
						//   receiverid: user_id,
						//   conversation_id: convid
						// });
					},
					error: function (err) {
						console.log(err);
					}
				});
			}

			// separetor_show_hide();
		} else {
			console.log('replay search query error', reply_list); // error meessage here
		}
	});
	// }
};
var draw_reply_popup_html = (rep_con_id, rep_msg_id, img, name, time, body) => {
	var main_msg_body = '<div class="thread-user-photo"><img src="/images/users/' + img + '" alt="' + img + '"></div>';
	main_msg_body += '<div class="thread-user-msg" data-rep_con_id="' + rep_con_id + '" data-rep_msg_id="' + rep_msg_id + '"><h4>';
	main_msg_body += name;
	main_msg_body += '&nbsp;<span class="thread-msg-time">' + time + '</span>';
	main_msg_body += '</h4>';
	main_msg_body += '<p>' + body + '</p>';
	main_msg_body += '</div>';
	$('#threadReplyPopUp .main-thread-msgs').html(main_msg_body);
};
var draw_rep_msg = (row) => {
	var html = '<div class="main-thread-msgs rep_msg_' + row.msg_id + '" style="margin-top:18px;">';
	html += '<div class="thread-user-photo">';
	html += '<img src="/images/users/' + row.sender_img + '" alt="">';
	html += '</div>';
	html += '<div class="thread-user-msg">';
	html += '<h4>' + row.sender_name + '&nbsp;<span class="thread-msg-time">' + moment(row.created_at).format('h:mm a') + '</span></h4>';
	if (row.msg_body == 'No Comments')
		html += '<p></p>';
	else if (row.attch_imgfile !== null || row.attch_videofile !== null || row.attch_otherfile !== null)
		html += '<p style="font-style: italic;">' + row.msg_body + '</p>';
	else
		html += '<p>' + row.msg_body + '</p>';
	if (row.attch_videofile !== null) {
		html += per_msg_video_attachment(row.attch_videofile);
	}
	if (row.attch_imgfile != null) {
		html += per_msg_img_attachment(row.attch_imgfile, row.sender_name, row.sender_img);
	}
	if (row.attch_audiofile !== null) {
		html += per_msg_audio_attachment(row.attch_audiofile);
	}
	if (row.attch_otherfile !== null) {
		html += per_msg_file_attachment(row.attch_otherfile);
	}
	html += '</div>';
	html += '</div>';
	$('#threadReplyPopUp .replies-container').append(html);
	var containerHeight = $(".replies-container").height();
	$('.forScrollBar .os-viewport').animate({ scrollTop: containerHeight }, 1);
}
var draw_rep_urhr = () => {
	var html = '<div class="msg-separetor-unread"><p>1 new reply</p></div>';
	$("#threadReplyPopUp .replies-container").append(html);
};
var find_rep_urhr_add_s = (nour) => {
	$("#threadReplyPopUp .replies-container").find('.msg-separetor-unread>p').html(nour + ' new replies');
};
var draw_rep_count = (msgid) => {
	var noofreply = Number($('.msg_id_' + msgid).find('.no-of-replies').text());
	if (noofreply > 0) {
		$('.msg_id_' + msgid).find('.no-of-replies').text(noofreply + 1);
		$('.msg_id_' + msgid).find('.last_rep_text').html('Last reply ' + moment(new Date()).fromNow() + ' <b><i>You</i></b>');
	} else {
		var html = per_msg_rep_btn(noofreply + 1, new Date(), "You");
		$('.msg_id_' + msgid).find('.user-msg').append(html);
	}
	$('.reply-separetor p').html((noofreply + 1) + ' Reply');
};
var open_another_rep = (event) => {
	var msg_id = $(event.target).attr('data-ano_msg_id');
	if ($('.msg_id_' + msg_id).length) {
		closeAllPopUp();
		$('.msg_id_' + msg_id).find('.msgReply p').trigger('click');
	} else {
		var conv_id = $(event.target).attr('data-conv_id');
		closeAllPopUp();
		$('#conv' + conv_id).attr('data-tmp_msgid', msg_id);
		$('#conv' + conv_id).trigger('click');
	}
};
function backToChat() {
	$(".threadasideContainer").hide();
	$('#connectAsideContainer').show();
	ur_replay2ur_msg();
	$(".side_bar_list_item li").show();
	$(".label_head_aside").show();
	$('#connectAsideContainer .backToChat').hide();
	$('#filterUnread_msg').removeClass('activeComFilter');
}

function viewCreateTodoPopupNew(event, title, id) {
	// $('#createToDoPopup').show();
	// console.log(title);
	// $("#connectTodoTitle").val(title);
	if(title.length > 0){
		var imgsrc = [];
		$(".msg_id_" + id + " .img_attach").each(function (i, obj) {
			var img = $(obj).attr('src').split('/');
			console.log(img[img.length - 1]);
			imgsrc.push(img[img.length - 1]);
		})

		$(".msg_id_" + id + " .fil_attach").each(function (i, obj) {
			var file = $(obj).attr('data-src').split('/');
			console.log(file[file.length - 1]);
			imgsrc.push(file[file.length - 1]);
		})

		setCookie("create_to_f_con", title, 1);
		setCookie("create_to_f_participant", participants, 1);
		setCookie("create_to_f_atached", imgsrc, 1);
		window.location.href = "/basic_to_do";
	}else{
		// setCookie("create_to_f_con", 'New To Do', 1);
		// setCookie("create_to_f_participant", participants, 1);
		// window.location.href = "/basic_to_do";
		// $('#delete_msg_div').show();
		var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
		var newtitle = 'New To Do';
		$('.msg-more-popup').hide();
		$('#delete_msg_div').show();
		$('.del_msg_title').text('Create To Do')
		$('.main-deleted-msg').html($('.msg_id_' + msgid).find('.msg-user-photo')[0].outerHTML);
		$('.main-deleted-msg').append('<div class="delbody">' + $('.msg_id_' + msgid).find('.user-msg').html() + '</div>');
		$('#delete_msg_div').find('.delete_msg_sec_title').html('<strong>To Do title not found.  </strong> Are you sure you want to create a new To Do ?</span>');
		$('.btn-msg-del , .btn-cancel').hide();
		$('.delete_msg_div .btn_div').append('<button class="btn-cancel forcreateTodo" style="margin-right:18px;" onclick="closeAllPopUp()">No</button> <button class="btn-msg-del forcreateTodo" onclick="viewCreateTodoPopupNew(event,\'' + newtitle + '\',\'' + msgid+'\')">Yes</button>');
	}
	
}

function viewtodoAdOp() {
	viewMemberImg = [];
	sharedMemberList = [];
	currentMemberList = [];
	if ($('#toggle_area').is(':visible') == true) {
		$('#toggle_area').hide();
		$("#title_textbox").val('');
		$("#notes_area").val('');
		$("#timeFrom").val('');
		$("#timeTo").val('');
		$("#ReminderTime").val('');
		$('.ownerThisToDo').remove();
		$('.sharedIMG').remove();
		$('.share_textbox').val("");
	} else if ($('#toggle_area').is(':visible') == false) {
		$('#toggle_area').show();
		if ($('#sharePeopleList').find('.ownerThisToDo').length < 1) {
			$('#sharePeopleList .sharing_label').after('<img onclick="viewShareList(event)" src="/images/users/' + user_img + '" data-uuid="' + user_id + '" class="ownerThisToDo">');
			currentMemberList.push(user_id);
			viewMemberImg.push(user_id);
			sharedMemberList.push(user_id);
		}

	}

}
function viewAllThread() {
	$('#threadReplyPopUpSlider').show();
}
// var threadSlider =()=>{
//
// 	$('.nextThread').on('click', function(){
// 		$(this).parent('.ThreadPopUp').hide();
// 		$('.ThreadPopUp').next('.ThreadPopUp').show();
// 	});
// 	$('.pevThread').on('click', function(){
// 		$(this).parent('.ThreadPopUp').hide();
// 		$('.ThreadPopUp').prev('.ThreadPopUp').show();
// 	});
// }
// threadSlider();

/* Flag and unflag */
var flggUserMsg = (event) => {
	var flaggedMsg = '<img class="flaggedMsg" onclick="flaggedUserMsg(event)" src="/images/basicAssets/Flagged.svg">';
	var flagged = '<img  src="/images/basicAssets/Flagged.svg" alt="Flagged">';
	var not_flagged = '<img src="/images/basicAssets/NotFlagged.svg" alt="Not Flagged">';

	var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');

	if ($(event.target).closest('.msgs-form-users').find(".flaggedMsg").length == 1) {
		$.ajax({
			url: '/hayven/flag_unflag',
			type: 'POST',
			data: { uid: user_id, msgid: msgid, is_add: 'no', conversation_id: conversation_id },
			dataType: 'JSON',
			success: function (res) {
				if (res.status) {
					$(event.target).closest(".msgs-form-users").find(".flaggedMsg").remove();
					$(event.target).closest(".msgs-form-users").css('background-color', 'transparent');
					$(event.target).closest(".msgs-form-users").find(".flag").html(not_flagged);
				}
			},
			error: function (err) {
				console.log(err.responseText);
			}
		});
	} else {
		$.ajax({
			url: '/hayven/flag_unflag',
			type: 'POST',
			data: { uid: user_id, msgid: msgid, is_add: 'yes', conversation_id: conversation_id },
			dataType: 'JSON',
			success: function (res) {
				if (res.status) {
					$(event.target).closest(".msgs-form-users").find(".user-msg h4").append(flaggedMsg);
					$(event.target).closest(".msgs-form-users").css('background-color', 'rgba(224, 60, 49, 0.04)');
					$(event.target).closest(".msgs-form-users").find(".flag").html(flagged);
				}
			},
			error: function (err) {
				console.log(err.responseText);
			}
		});
	}
};
/* End flag */
var flaggedUserMsg = (event) => {
	var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
	$(event.target).closest('.msgs-form-users.msg_id_' + msgid + '').find('.flag').click()
}

/* Start Emoji */
var viewEmojiList = (event) => {
	var design = '<div class="emojiListContainer">';
	design += '<img src="/images/emoji/grinning.png" data-name="grinning" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/joy.png" data-name="joy" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/open_mouth.png" data-name="open_mouth" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/disappointed_relieved.png" data-name="disappointed_relieved" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/rage.png" data-name="rage" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/thumbsup.png" data-name="thumbsup" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/thumbsdown.png" data-name="thumbsdown" onclick="add_reac_into_replies(event)">';
	design += '<img src="/images/emoji/heart.png" data-name="heart" onclick="add_reac_into_replies(event)">';
	design += '</div>';


	if (!$(event.target).closest(".call-rep-emoji").find(".emojiListContainer").length == 1) {
		$(event.target).closest(".call-rep-emoji").append(design);
	}
	// else{
	// 	$(event.target).closest(".emoji").find(".emojiListContainer").remove();
	// }
};
var add_reac_into_replies = (event) => {
	var msg_id = $(event.target).closest('.msgs-form-users').attr('data-msgid');
	var src = $(event.target).attr('src');
	var emojiname = $(event.target).attr('data-name');

	$.ajax({
		url: '/hayven/add_reac_emoji',
		type: 'POST',
		data: { msgid: msg_id, conversation_id: conversation_id, emoji: emojiname },
		dataType: 'JSON',
		success: function (res) {
			if (res.status) {
				if (res.rep == 'add') {
					append_reac_emoji(msg_id, src, 1);
					socket.emit("emoji_emit", { room_id: to, msgid: msg_id, emoji_name: emojiname, count: 1, sender_id: user_id });
				} else if (res.rep == 'delete') {
					update_reac_emoji(msg_id, src, -1);
				} else if (res.rep == 'update') {
					update_reac_emoji(msg_id, '/images/emoji/' + res.old_rep + '.png', -1);
					append_reac_emoji(msg_id, src, 1);
				}
			}
		},
		error: function (err) {
			console.log(err.responseText);
		}
	});
};
var append_reac_emoji = (msgid, src, count) => {
	var allemoji = $('.msg_id_' + msgid).find('.emoji img');
	if (allemoji == undefined) {
		emoji_html_append(msgid, src, count);
	} else {
		var noe = 0;
		$.each(allemoji, function (k, v) {
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
	var allemoji = $('.msg_id_' + msgid).find('.emoji img');

	var noe = 0;
	$.each(allemoji, function (k, v) {
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
	$('.msg_id_' + msgid).find('.replies').append(html);
};
var emoji_html = (emoji_name, src, count) => {
	var html = '<span class="emoji ' + emoji_name + ' "  onmouseover="open_rep_user_emo(event)" onmouseout="close_rep_user_emo(event)">';
	html += '<img src="' + src + '" data-name="' + emoji_name + '" onclick="add_reac_into_replies(event)"> ';
	html += '<span class="count-emoji">' + count + '</span>';
	html += '</span>';
	return html;
}
var open_rep_user_emo = (event) => {
	if ($('.rep_user_emo_list').length == 0) {
		var msg_id = $(event.target).closest('.msgs-form-users').attr('data-msgid');
		var emoji_name = (($(event.target).closest('.emoji').find('img').attr('src').split('/'))[3]).replace('.png', '');
		$.ajax({
			url: '/hayven/emoji_rep_list',
			type: 'POST',
			data: { msgid: msg_id, emojiname: emoji_name },
			dataType: 'JSON',
			success: function (res) {
				if (res.length > 0) {
					var nameList = [];
					var na = "";
					var html = '<div class="rep_user_emo_list">';
					$.each(res, function (k, v) {
						nameList.push(v.user_fullname);
					});
					if (nameList.indexOf(user_fullname) !== -1) {
						if (nameList.length > 1) {
							na = "You & "
						} else {
							na = "You"
						}
						var tempIndx = nameList[0];
						nameList[0] = na;
						nameList[nameList.indexOf(user_fullname)] = tempIndx;
					}
					$.each(nameList, function (k, v) {
						html += v + " ";
					});
					html += '</div>';
					$('.msg_id_' + msg_id).find('.' + emoji_name).append(html);
					var div_offset = $(event.target).closest('.emoji').offset();
					// console.log(div_offset);
					$('.rep_user_emo_list').css('left', div_offset.left - 290);
				}
			},
			error: function (err) {
				console.log(err.responseText);
			}
		});
	}
};
var close_rep_user_emo = (event) => {
	$('.rep_user_emo_list').remove();
};
/* End Emoji */

/* Start messages searching */
$("#search-msg").on('keyup', function (event) {
	var str = $('#search-msg').val();
	str = str.replace(/<\/?[^>]+(>|$)/g, "");
	// console.log(str);
	$('.user-msg>p').unhighlight();
	$('.user-msg>p').highlight(str);
	if (str.length > 0) {
		$.each($('.msgs-form-users'), function () {
			if ($(this).find('.highlight').length == 0) {
				$(this).prev('.msg-separetor').hide();
				$(this).hide();
			} else {
				$(this).prev('.msg-separetor').show();
				$(this).show();
			}
		});
	} else {
		$('.msg-separetor').show();
		$('.msgs-form-users').show();
	}
});
/* End messages searching */


var filter_unread = () => {
	if (!$('#filterUnread_msg').hasClass('activeComFilter')) {
		$('#filterUnread_msg').addClass('activeComFilter');
		$('#connectAsideContainer .backToChat').show();
		$('#conv' + user_id + '').hide();
		var click_1st_unread_thread = false;
		$.each($(".side_bar_list_item li"), function (k, per_li) {
			var has_unread = Number($(per_li).find(".unreadMsgCount").html());
			if (has_unread < 1) {
				$(per_li).hide();
			}
		});
		$.each($(".side_bar_list_item li:visible"), function (k, per_li) {
			var has_unread = Number($(per_li).find(".unreadMsgCount").html());
			if (has_unread > 0 && click_1st_unread_thread === false) {
				$(per_li).trigger("click");
				click_1st_unread_thread = true;
				return false;
			}
		});
	} else {
		backToChat();
	}
};
/* End Filtaring */

// media popup
$('.media-tabs>li').click(function () {
	$('.media-tabs>li').removeClass("active");
	$(this).addClass("active");
});

function viewImgDiv() {
	$('.media_Tab_Content').hide();
	$("#mediaImages").show();
	$('.media-file-popup input[type="text"]').attr('class', "");
	$('.media-file-popup input[type="text"]').addClass('Search-img').attr('placeholder', "Search Images");
	$('.media-file-popup input[type="text"]').val('');
	mediaFileSearch();
}

function viewvideoDiv() {
	$('.media_Tab_Content').hide();
	$("#mediaVideos").show();
	$('.media-file-popup input[type="text"]').attr('class', "").attr('placeholder', "Search Videos");
	$('.media-file-popup input[type="text"]').addClass('Search-videos');
	$('.media-file-popup input[type="text"]').val('');
	mediaFileSearch();
}
function viewFilesDiv() {
	$('.media_Tab_Content').hide();
	$("#mediaFiles").show();
	$('.media-file-popup input[type="text"]').attr('class', "").attr('placeholder', "Search Files");
	$('.media-file-popup input[type="text"]').addClass('Search-files');
	$('.media-file-popup input[type="text"]').val('');
	mediaFileSearch();
}

function viewLinksDiv() {
	$('.media_Tab_Content').hide();
	$("#mediaLinks").show();
	$('.media-file-popup input[type="text"]').attr('class', "").attr('placeholder', "Search Links");
	$('.media-file-popup input[type="text"]').addClass('Search-links');
	$('.media-file-popup input[type="text"]').val('');
	mediaFileSearch();
}
var mediaFilePopup = () => {
	$('.fileSliderBackWrap').show();
	$('.media-file-popup').show();
	$('.media-file-popup input[type="text"]').val('');
	$('.close-media-popup').addClass('allAttachmentView');
	if ($('#headNoficationDialog').is(':visible') == true) {
		$('.fileSliderBackWrap').css('height', 'calc(100% - 106px)');
	} else if ($('#headNoficationDialog').is(':visible') == true) {
		$('.fileSliderBackWrap').css('height', 'calc(100% - 64px)');
	}

	$("#mediaImages").html("");
	var allimg = $('.img_attach');

	if (allimg.length === 0) {
		var notFoundMsg = '<h2>No Images found in this thread !</h2>'
		$("#mediaImages").append(notFoundMsg);
	}

	var lastid_f_i;

	$.each(allimg, function (k, v) {
		// console.log(v);
		var datamsg = $(v).attr('data-msg');
		var imgname = $(v).attr('data-src');
		var name = imgname.split('/');
		var imgName = name[name.length -1].split('@');
		var imgFormate = name[name.length -1].split('.');
		var imgFullName = imgName[0]+'.'+imgFormate[imgFormate.length - 1];
		var sender = $(v).attr('data-sender_name');

		var unixt = Number((v.alt).substring((v.alt).lastIndexOf('@') + 1, (v.alt).lastIndexOf('.')));
		var msg_date = moment(unixt).calendar(null, {
			sameDay: '[Today]',
			lastDay: '[Yesterday]',
			lastWeek: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; },
			sameElse: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; }
		});

		$.each($('.date-by-images h3'), function (dk, dv) {
			if ($(dv).text() == msg_date) {
				msg_date = null;
				return 0;
			}
		});

		if (msg_date !== null) {
			lastid_f_i = msg_date.replace(/[\s,]+/g, ' ').trim().replace(/\s/g, '') + "img";
			var dataofimg = '<div class="date-by-images" id="' + lastid_f_i+'"><h3>' + msg_date + '</h3></div>';
			$("#mediaImages").prepend(dataofimg);
		}

		var html = '';
		html += '<div class="all-images" data-msg="' + datamsg + '" onclick="showImageSlider(event)" data-src="' + v.src + '" data-filename="' + v.alt + '" data-sender_name="' + $(v).attr('data-sender_name') + '" data-sender_img="' + $(v).attr('data-sender_img') + '">';
		html += '<img src="' + v.src + '" alt="' + v.alt + '" style="pointer-events: none;">';
		html += '<div class="img-name">';
		html += '<div class="customToolTip">'+ sender +'<br> Uploaded on '+ moment(unixt).format('MMMM Do YYYY, h:mm a') +'<br>'+ imgFullName +'</div>';
		html += '<p>'+ imgFullName +'</p>';
		html += '</div>';
		html += '</div>';
		$("#mediaImages #" + lastid_f_i).append(html);
	});

	$('#mediaVideos').html('');
	var allVideos = $('.vdo_attach');

	if (allVideos.length === 0) {
		var notFoundMsg = '<h2>No Videos found in this thread !</h2>'
		$("#mediaVideos").append(notFoundMsg);

	}
	var lastid_f_V;

	$.each(allVideos, function (k, v) {
		var name = $(v).attr('data-file_name');
		var vidName = name.split('@');
		var vidType = name.split('.');
		var actType = vidType[vidType.length - 1];
		var videoname = vidName[0]+'.'+actType;
		
		var unixt = Number(name.substring(name.lastIndexOf('@') + 1, name.lastIndexOf('.')));
		var msg_date = moment(unixt).calendar(null, {
			sameDay: '[Today]',
			lastDay: '[Yesterday]',
			lastWeek: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; },
			sameElse: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; }
		});

		$.each($('.date-by-videos h3'), function (dk, dv) {
			if ($(dv).text() == msg_date) {
				msg_date = null;
				return 0;
			}
		});

		if (msg_date !== null) {
			lastid_f_V = msg_date.replace(/[\s,]+/g, ' ').trim().replace(/\s/g, '') + "vdo";
			var dataofvdo = '<div class="date-by-videos" id="' + lastid_f_V +'"><h3>' + msg_date + '</h3></div>';
			$("#mediaVideos").prepend(dataofvdo);
		}
		var file_type = name.split('.').pop().toLowerCase();
	var eachVideo = '<div class="all-videos" controls>';
		eachVideo += 	'<video controls>';
		eachVideo += 		'<source class="vdo_attach" src="' + file_server + '/upload/' + name + '" type="video/' + file_type + '" data-file_name="' + name + '">';
		eachVideo += 	'</video>';
		eachVideo += 	'<div class="video-name" data-balloon="'+ videoname +'" data-balloon-pos="up" data-balloon-length="fit">';
		eachVideo += 		'<p>'+ videoname +'</p>';
		eachVideo += 	'</div>';
		eachVideo += '</div>';

		$('#mediaVideos #' + lastid_f_V).append(eachVideo);
	});

	$('#mediaFiles').html('');
	var allfiles = $('.fil_attach');

	if (allfiles.length === 0) {
		var notFoundMsg = '<h2>No Files found in this thread !</h2>'
		$("#mediaFiles").append(notFoundMsg);
	}

	var lastid_f_f;

	$.each(allfiles, function (k, v) {
		var senderName = $(v).attr('data-sender_name');
		var datafiletype = $(v).attr('data-filetype');
		var name = $(v).attr('data-file_name');

		var unixt = Number(name.substring(name.lastIndexOf('@') + 1, name.lastIndexOf('.')));

		var msg_date = moment(unixt).calendar(null, {
			sameDay: '[Today]',
			lastDay: '[Yesterday]',
			lastWeek: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; },
			sameElse: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; }
		});

		$.each($('.date-by-files h3'), function (dk, dv) {
			if ($(dv).text() == msg_date) {
				msg_date = null;
				return 0;
			}
		});

		if (msg_date !== null) {
			lastid_f_f = msg_date.replace(/[\s,]+/g, ' ').trim().replace(/\s/g, '') + "file";
			var dataofFile = '<div class="date-by-files" id="' + lastid_f_f +'"><h3>' + msg_date + '</h3></div>';
			$("#mediaFiles").prepend(dataofFile);
		}
		var file_type = name.split('.').pop().toLowerCase();
		var eachFiles = '<div class="all-files">';
			eachFiles += 	'<img class="file-icon" src="/images/file_icon/' + datafiletype + '.png" data-file_name="' + name + '">';
			eachFiles += 	'<div class="file-details">';
			eachFiles += 		'<h4>' + name.substring(0, name.lastIndexOf('@')) + '.' + file_type + '</h4>';
			eachFiles += 		'<p>'+senderName+' <span>' + moment(unixt).format('MMMM Do YYYY, h:mm a') + '</span></p>';
			eachFiles += 	'</div>';
			eachFiles += 	'<div class="file-hover-option">';
			eachFiles += 		'<a href="' + file_server + '/upload/' + name + '">';
			eachFiles += 			'<img src="/images/basicAssets/Download.svg" alt="">';
			eachFiles += 		'</a>';
			eachFiles += 		'<img src="/images/basicAssets/NotFlagged.svg" alt="">';
			eachFiles += 		'<img src="/images/basicAssets/MoreMenu.svg" alt="">';
			eachFiles += 	'</div>';
			eachFiles += '</div>';

		$('#mediaFiles #' + lastid_f_f).append(eachFiles);
	});
	
	$('#mediaLinks').html('');
	var alllink = $('.has_url');
	var lastid_f_l;
	if(alllink.length === 0){
		var notFoundMsg = '<h2>No Links found in this thread !</h2>'
		$("#mediaLinks").append(notFoundMsg);
	}

	$.each(alllink, function (k, v) {
		var senderName = $(v).closest('.user-msg').attr('data-sendername');

		var unixt = $(v).attr('data-date');

		var msg_date = moment(unixt).calendar(null, {
			sameDay: '[Today]',
			lastDay: '[Yesterday]',
			lastWeek: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; },
			sameElse: function (now) { return '[' + this.format("MMM Do, YYYY") + ']'; }
		});

		$.each($('.date-by-links h3'), function (dk, dv) {
			if ($(dv).text() == msg_date) {
				msg_date = null;
				return 0;
			}
		});

		if (msg_date !== null) {
			lastid_f_l = msg_date.replace(/[\s,]+/g, ' ').trim().replace(/\s/g, '') + "link";
			var dataofLink = '<div class="date-by-links" id="' + lastid_f_l +'"><h3>' + msg_date + '</h3></div>';
			$("#mediaLinks").prepend(dataofLink);
		}
		var eachurl = '<div class="all-links">';
			eachurl+= 	'<div class="links-logo">';
			eachurl+= 		'<img src="/images/basic_view/instagram.jpg" alt="">';
			eachurl+= 	'</div>';
			eachurl+= 	'<div class="link-details">';
			eachurl+= 		'<h4>No Title</h4>';
			eachurl+= 		$(v).html();
			eachurl+= 		'<p>'+ senderName +' <span>'+ moment(unixt).format('MMMM Do YYYY, h:mm a') +'</span></p>';
			eachurl+= 	'</div>';
			eachurl+= '</div>';

		$('#mediaLinks #' + lastid_f_l).append(eachurl);
	});
	mediaFileSearch();
}

var showImageSlider = (event) => {
	var changeText = $('.image-popup-header>h2');
	$('.fileSliderBackWrap').show();
	$('.media-file-popup').hide();
	$('.image-popup-slider').show();
	if (!$('.close-media-popup').hasClass('allAttachmentView')) {
		$('.close-image-popup-slider').addClass('openForMsg');
		$(changeText).html('<img class="back-to-media-tab" onclick="backToMediaTab()" src="/images/basicAssets/BackArrow.svg" alt=""> Chat');
	}else{
		$(changeText).html('<img class="back-to-media-tab" onclick="backToMediaTab()" src="/images/basicAssets/BackArrow.svg" alt=""> Images');
	}
	if ($('#headNoficationDialog').is(':visible') == true) {
		$('.fileSliderBackWrap').css('height', 'calc(100% - 106px)');
	} else {
		$('.fileSliderBackWrap').css('height', 'calc(100% - 64px)');
	}
	var curimg = $(event.target).attr('data-src');
	var imgsn = $(event.target).attr('data-sender_name');
	var img = $(event.target).attr('data-sender_img');
	var msgBody = $(event.target).attr('data-msg');
	if ($('.close-media-popup').hasClass('allAttachmentView')) {
		var allthisdateimg = $(event.target).closest('#mediaImages').find('.all-images');
		// console.log(allthisdateimg);
	} else {
		var allthisdateimg = $(event.target).closest('.user-msg').find('.img_attach');
		$('.back-to-media-tab').addClass('openForMsg');
		// console.log(allthisdateimg);
	}

	// var allthisdateimg = $(event.target).closest('.date-by-images').find('.all-images');
	$('.images-slider-footer').html("");
	$('.show-picture-comment>p').html("");
	$.each(allthisdateimg, function (k, v) {
		// console.log(allthisdateimg);
		var src = $(v).attr('data-src');
		var name = $(v).attr('data-sender_name');
		var img = $(v).attr('data-sender_img');
		var msgBody = $(v).attr('data-msg');
		var html = '<div class="slider-footer-all-images" onclick="activethisimg(\'' + src + '\', \'' + name + '\', \'' + img + '\', \'' + msgBody + '\')">';
		html += '<img src="' + $(v).attr('data-src') + '" data-msg="'+msgBody+'" alt="">';
		html += '</div>';
		$('.images-slider-footer').append(html);
		// console.log(html);
	});

	if (allthisdateimg.length == 1) {
		$('.slider-left-arrow').hide();
		$('.slider-right-arrow').hide();
		$('.images-slider-footer').hide();
		// $('.images-slide-body').css('height','calc(100% - 104px)');
	} else {
		$('.slider-left-arrow').show();
		$('.slider-right-arrow').show();
		$('.images-slider-footer').show();
		// $('.images-slide-body').css('height','calc(100% - 211px)');
	}
	activethisimg(curimg, imgsn, img, msgBody);
};
var activethisimg = (curimg, imgsn, img, msgBody) => {
	var name = curimg.split('/');
	var unixt = Number(name[name.length-1].substring(name[name.length-1].lastIndexOf('@') + 1, name[name.length-1].lastIndexOf('.')));
	$('.image-popup-slider').find('.currentimg').attr('src', curimg);
	$('.image-popup-slider').find('.shared-by-user-photo>img').attr('src', '/images/users/' + img);
	$('.image-popup-slider').find('.shared-by-user-details>h3').html(imgsn);
	$('.image-popup-slider').find('.shared-by-user-details>p').html('Uploaded on ' + moment(unixt).format('MMMM Do YYYY @ h:mm a'));
	$('.image-popup-slider').find('.show-picture-comment>p').html(msgBody);
	$('.image-popup-slider').find('.slide-image-more-option>a').attr('href', curimg);
	$('.slider-footer-all-images img').removeClass('active');
	$.each($('.slider-footer-all-images img'), function (k, v) {
		if ($(v).attr('src') == curimg)
			$(v).addClass('active');
	});
};
// slider left arrow a click = sla
var slaclick = () => {
	var pref_el = $('img.active').closest('.slider-footer-all-images').prev();
	// console.log(pref_el.length);
	if (pref_el.length) {
		pref_el.trigger('click');
	}
	else {
		$('.slider-footer-all-images').last().trigger('click');
	}
};
// slider right arrow a click = sra
var sraclick = () => {
	var next_el = $('img.active').closest('.slider-footer-all-images').next();
	if (next_el.length)
		next_el.trigger('click');
	else
		$('.slider-footer-all-images').first().trigger('click');
};
var backToMediaTab = () => {
	if ($('.close-image-popup-slider').hasClass('openForMsg')) {
		$('.fileSliderBackWrap').hide();
		$('.image-popup-slider').hide();
		$('.media-file-popup').show();
		$('.close-image-popup-slider').removeClass('openForMsg');
	} else {
		$('.image-popup-slider').hide();
		$('.media-file-popup').show();
	}
}

function mediaFilePopup() {
	$('.fileSliderBackWrap').show();
}

function closeMediaPopup() {
	$('.fileSliderBackWrap').hide();
	$('.close-media-popup').removeClass('allAttachmentView');
}



function acceptToDo(event) {
	var html = '<div class="toDoContent_Sec1">';
	html += '<div class="acceptCheck"></div>';
	html += '<p class="acceptedLabel">Youve accepted <label>Amazon Wishlist.</label></p>';
	html += '</div>';
	html += '<div class="toDoContent_Sec2">';
	html += '<h1 class="acceptedMember">Accepted Member</h1>';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<span class="countSelected">+4</span>';
	html += '</div>';

	$(event.target).closest('.toDoContent').html(html);
}

function viewEventMember(event) {
	var html = '<div class="event_content_sec1">';
	html += '<div class="acceptCheck"></div>';
	html += '<p class="acceptedLabel">Youve accepted <label>Amazon Wishlist.</label></p>';
	html += '</div>';
	html += '<div class="event_content_sec2">';
	html += '<h1 class="attendingMemberLabel">Attending</h1>';
	html += '<h1 class="maybeAttMemberLabel">Maybe Attending</h1>';
	html += '<h1 class="notAttMemberLabel">Not Attending</h1>';
	html += '<div class="attendingMemberCount">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '</div>';
	html += '<div class="maybeAttMemberCount">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<span class="countSelected">+4</span>';
	html += '</div>';
	html += '<div class="notAttMemberCount">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '<img src="/images/users/joni.jpg" class="selected_member">';
	html += '</div>';
	html += '</div>';

	$(event.target).closest('.event_content').html(html);
}




var calendarPicker = () => {
	$("#eventDateAndTime").on('click', function () {
		$("#calenderPicker").show();
	});

	$("#calenderDoneBtn").on('click', function () {
		$("#calenderPicker").hide();
	})
	$("#calenderCancelBtn").on('click', function () {
		$("#calenderPicker").hide();
	})

}
calendarPicker();


var escKeyUpForConnect = () => {
	$(window).keyup(function (e) {
		if (e.keyCode == 27) {
			// filter sidebar
			if ($('.filterMainContainer').is(":visible") == true && $('.chooseTag').is(":visible") == true) {
				$('.chooseTag').hide();

			} else if ($('.filterMainContainer').is(":visible") == true) {
				$('.filterMainContainer').hide();
				$('.side-bar-filter-icon').removeClass("active");
			}
			// create to do chat header
			// search bar chat header
			if ($('.search-panel').is(":visible") == true) {
				$('.search-panel').hide();
				$("#searchConversation").show();
			}
			// more option chat header
			if ($('.moreMenuPopup').is(":visible") == true && $('.backwrap').is(":visible") == true) {
				$('.backwrap').hide();
			} else if ($('.moreMenuPopup').is(":visible") == true) {
				$('.moreMenuPopup').hide();
			}
			// msg hover
			if ($('.msgs-form-users-options').is(":visible") == true && $('.emojiListContainer').is(":visible") == true) {
				$('.emojiListContainer').hide();
			} else if ($('.msgs-form-users-options').is(":visible") == true && $('.msg-more-popup').is(":visible") == true) {
				$('.msg-more-popup').hide();
			}

			//thread sidebar container
			if ($('.threadasideContainer').is(':visible') == true) {
				$('.threadasideContainer').hide();
				$("#connectAsideContainer").show();
			}
			//// create Tagged Container
			if ($('.chat-head-calling .addTagConv').is(':visible') == true) {
				$('.chat-head-calling .addTagConv').hide();
				$('.chat-head-calling .tagged').show();
				$(this).val("");
			}
			//// create Tagged Container
			if ($('#createDirMsgContainer').is(":visible") == true && $('.add-direct-member').is(':focus') == false || $('#createChannelContainer').is(':visible') == true && $('.add-team-member').is(':focus') == false && $('#team-name').is(':focus') == false || $('#joinChannelPanel').is(':visible') == true) {
				$('.connect_right_section').hide();
				$('#groupChatContainer').show();
			}
			//// for emoji div container
			if ($('.emoji_div').is(":visible") == true) {
				$('.emoji_div').remove();
			}
			//// for direct msg popup
			if ($('#createDirMsgContainer').is(":visible") == true) {
				closeAllPopUp();
			}
			//// for view member  popup
			if ($('#memberListBackWrap').is(":visible") == true) {
				closeAllPopUp();
			}

			if ($('.fileSliderBackWrap').is(":visible") == true) {
				// $('.image-popup-slider').hide();
				// $('.fileSliderBackWrap').hide();
				if($('.media-file-popup').is(':visible') == true){
					$( ".close-media-popup.allAttachmentView" ).click();
				}
				if($('.image-popup-slider').is(':visible') == true){
					$( ".close-image-popup-slider" ).click();
				}
			}
			//closeAllPopUp();
		}
	});

	$('#addChecklist ').keyup(function (event) {
		var inputValue = $('#addChecklist').val();
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if (keycode == '13') {
			if (!$(this).val() == '') {
				if (checklistiTEM.indexOf(inputValue) === -1) {
					checklistiTEM.push(inputValue);

					var checkHtml = '<li>';
					checkHtml += '<label class="checkbox_container">' + inputValue + '';
					checkHtml += '<input class="todoCheckBoxInput" type ="checkbox" value="1">';
					checkHtml += '<span class="checkmark"></span>';
					checkHtml += '</label>';
					checkHtml += '</li>';
					$(checkHtml).appendTo('#toggle_area>.item_list');
					$('#addChecklist').val('');

					countBoxes();
					countChecked();
					$(".item_list input:checkbox").click(countChecked);
				} else {
					toastr['warning']('"' + inputValue + '" Already added to your checklist', 'Warning');
				}

			}
		}
	});
}

escKeyUpForConnect();

// get box count
var checkBoxCount = 0;
var isChecked = 0;

function countBoxes() {
	checkBoxCount = $(".item_list input:checkbox").length;
	console.log(checkBoxCount);
}

countBoxes();
$(".item_list input:checkbox").click(countBoxes);

// count checks

function countChecked() {
	isChecked = $(".item_list input:checkbox:checked").length;
	var percentage = parseInt(((isChecked / checkBoxCount) * 100), 10);
	var percent_width = "width:" + percentage + "%";

	$(".progress").attr("style", percent_width)
	$(".progress_status").text(percentage + "%");
}
countChecked();
$(".item_list input:checkbox").click(countChecked);

//create new event
//create new event
function createEventF(event) {
	event.preventDefault();
	var eventName = $('.create-event-popup-title').val();
	var eventLocation = $('.event-location').val();
	var design = '<div class="msgs-form-users">';
	design += '<div class="msg-user-photo">';
	design += '<img src="/images/users/nayeem.jpg" alt="">';
	design += '</div>';
	design += '<div class="user-msg">';
	design += '<h4>George Jsons<span class="msg-time">3:12 PM</span></h4>';
	design += '<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>';
	design += '<div class="event_content">';
	design += '<div class="event_content_sec1">';
	design += '<img src="/images/basicAssets/custom_event_for_msg.svg">';
	design += '<p class="toDoName">' + eventName + '</p>';
	design += '<span class="dateAndTime">When: 14 September, 2018(3:30pm - 4:30pm)</span>';
	design += '<span class="location">Where: ' + eventLocation + '</span>';
	design += '</div>';
	design += '<div class="event_content_sec2">';
	design += '<button class="attending" onclick="viewEventMember(event)">Attending</button>';
	design += '<button class="maybe_attending" onclick="viewEventMember(event)">Maybe Attending</button>';
	design += '<button class="not_attending" onclick="viewEventMember(event)">Not Attending</button>';
	design += '</div>';
	design += '</div>';
	design += '</div>';
	design += '<div class="msgs-form-users-options" style="top: 16px;">';
	design += '<div class="call-rep-emoji" onclick="viewEmojiList(event)">';
	design += '<img src="/images/basicAssets/AddEmoji.svg" alt="">';
	design += '</div>';
	design += '<div class="flag" onclick="flggUserMsg(event)">';
	design += '<img src="/images/basicAssets/NotFlagged.svg" alt="">';
	design += '</div>';
	design += '<div class="replys" onclick="threadReply()">';
	design += '<img src="/images/basicAssets/Thread.svg" alt="">';
	design += '</div>';
	design += '<div class="more">';
	design += '<img src="/images/basicAssets/MoreMenu.svg" alt="">';
	design += '<div class="msg-more-popup" style="display:none">';
	design += '<p onclick="viewCreateTodoPopupNew(event)">Create a Task</p>';
	design += '<p>Schedule an event</p>';
	design += '<p>Share Message</p>';
	design += '<p>Edit Message</p>';
	design += '</div>';
	design += '</div>';
	design += '</div>';
	design += '</div>';
	if (eventName != "" && eventLocation != "") {
		$('#msg-container').append(design);
		$('.create-event-popup-title').val("");
		$('.event-location').val("");
		$('.create-event-popup').hide();
		$('#CreateEvent').show();
		moreMsgAction();
	}
}




/////////// create new tag for conversation

var addNewTagConv = () => {

	$('.chat-head-calling .tagged').on('click', function () {
		$(this).hide();
		$('.chat-head-calling .addTagConv').show();
		$("#createConvTag").focus();
	});

	$('.chat-upload-popup-content .tagged').on('click', function () {
		$(this).hide();
		$('.chat-upload-popup-content .addTagConv').show();
		$("#customAdd").focus();
	});

}

addNewTagConv();



// create new to do
var connectMembers = [];


var addNewTodo = () => {
	$('.create-todo-popup-title').on('keyup', function (e) {
		var toDoName = $(this).val();
		if (toDoName != "") {
			var design = '<div class="msgs-form-users">';
			design += '<div class="msg-user-photo">';
			design += '<img src="/images/users/joni.jpg" alt="">';
			design += '</div>';
			design += '<div class="user-msg">';
			design += '<h4>Dalim Chy<span class="msg-time">3:12 PM</span></h4>';
			design += '<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>';
			design += '<div class="toDoContent">';
			design += '<div class="toDoContent_Sec1">';
			design += '<img src="/images/basicAssets/custom_to_do_for_msg.svg">';
			design += '<p class="toDoName">' + toDoName + '</p>';
			design += '<p>Due Date: 14 September, 2018</p>';
			design += '</div>';
			design += '<div class="toDoContent_Sec2">';
			design += '<button class="accept_toDO" onclick="acceptToDo(event)">Accept</button>';
			design += '<button class="decline_toDo">Decline</button>';
			design += '</div>';
			design += '</div>';
			design += '</div>';
			design += '<div class="msgs-form-users-options" style="top: 16px;">';
			design += '<div class="call-rep-emoji" onclick="viewEmojiList(event)">';
			design += '<img src="/images/basicAssets/AddEmoji.svg" alt="">';
			design += '</div>';
			design += '<div class="flag" onclick="flggUserMsg(event)">';
			design += '<img src="/images/basicAssets/NotFlagged.svg" alt="">';
			design += '</div>';
			design += '<div class="replys" onclick="threadReply(event)">';
			design += '<img src="/images/basicAssets/Thread.svg" alt="">';
			design += '</div>';
			design += '<div class="more">';
			design += '<img src="/images/basicAssets/MoreMenu.svg" alt="">';
			design += '<div class="msg-more-popup" style="display:none">';
			design += '<p onclick="viewCreateTodoPopupNew(event)">Create a Task</p>';
			design += '<p>Schedule an event</p>';
			design += '<p>Share Message</p>';
			design += '<p>Edit Message</p>';
			design += '</div>';
			design += '</div>';
			design += '</div>';
			design += '</div>';

			if (e.keyCode == 13) {
				$('#msg-container').append(design);
				$(this).val("");
				$(".create-todo-popup").hide();
				$("#createTodo").show();

				var checklistiTEMNN = [];
				var checkedListNN = [];

				if (connectMembers.indexOf(user_id) === -1) {
					connectMembers.push(user_id);
				}

				socket.emit('toCreateBrdcst', {
					activityType: 'TODO',
					activityTitle: toDoName,
					activityDescription: "",
					createdBy: user_id,
					endTime: moment().format("DD-MM-YYYY"),
					ecosystem: "Navigate",
					adminListUUID: connectMembers,
					checklist: checklistiTEMNN,
					checkedList: checkedListNN
				},
					function (confirmation) {
						if (confirmation.activityres.status) {
							$(this).val("");
							connectMembers = [];
						}
					});
			}
			moreMsgAction();
		}

	});

}
addNewTodo();

function createTOD() {
	var checklistiTEM = [];
	var checkedList = [];

	if (connectMembers.indexOf(user_id) === -1) {
		connectMembers.push(user_id);
	}

	var toDoName = $('.create-todo-popup-title').val();

	if (toDoName != "") {
		socket.emit('toCreateBrdcst', {
			activityType: 'TODO',
			activityTitle: toDoName,
			activityDescription: "",
			createdBy: user_id,
			endTime: moment().format("DD-MM-YYYY"),
			ecosystem: "Navigate",
			adminListUUID: connectMembers,
			checklist: checklistiTEM,
			checkedList: checkedList
		},
			function (confirmation) {
				if (confirmation.activityres.status) {
					$('.create-todo-popup-title').val("");
					connectMembers = [];
					$('.create-todo-popup').hide();
					$('#createTodo').show();
				}
			});
	}

}

function cancelTodo() {
	$('.create-todo-popup').hide();
	$('#createTodo').show();
	$('.create-todo-popup-title').val("");
	connectMembers = [];
}

function memAssignForTodo(e, memUUID) {

	if (e.target.checked) {
		if (connectMembers.indexOf(memUUID) === -1) {
			connectMembers.push(memUUID);
		}
	} else {
		removeA(connectMembers, memUUID);
	}
}

var searchTodoMember = (value) => {
	$("#memberHolder li").each(function () {

		if ($(this).find('label').text().toLowerCase().search(value.toLowerCase()) > -1) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});

	$("#memberHolder li").unhighlight();
	$("#memberHolder li").highlight(value);
}

// var containerHeight = ()=>{
// 	$(window).resize(function(){
// 		var windowHeight = $( window ).height();
// 		$('.chat-page').height(windowHeight -229 );
// 		$('#joinChannelPanel').height(windowHeight -130 );
// 		$('#createChannelContainer').height(windowHeight -130 );
// 		$('aside').height(windowHeight -64 );
// 	});

// 	$('.chat-page').height($( window ).height() -229 );
// 	$('aside').height($( window ).height()  -64 );
// }

// containerHeight();



var viewMemberList = (event) => {
	var roomid = $('#roomIdDiv').attr('data-roomid');
	var totalMember = parseInt($('#totalMember').text());
	$('#memberListBackWrap').show();
	$('#memberListBackWrap').html("");
	if (adminArra.indexOf(user_id) > -1) {
		$("#roomIdDiv").attr('data-rfu', 'ready');
		var html = '<div class="adminContainer">';
		html += '<div class="closeBackwrap" onclick="closeAllPopUp()"><img src="/images/basicAssets/close_button.svg"></div>';
		html += '<div class="label">';
		html += '<h1 class="label_Title">Members </h1>';
		html += '<h1 class="list_Count">(<span>' + totalMember + '</span>)</h1>';
		html += '</div>';
		html += '<input type="text" class="searchMember" placeholder="Search by name" onkeyup="searchMember(event,$(this).val());">';
		html += '<span class="remove searchClear"></span>';
		html += '<div class="suggest_Container overlayScrollbars " style="display: block;">';
		html += '<ul class="suggested-list">';
		var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
		$.each(user_list, function (ky, va) {
			$.each(participants, function (k, v) {
				if (va.id === v) {
					if(adminArra.indexOf(va.id) !== -1){
						html += '<li class="showEl adminThisGroup">';
						html += '<div class="list" id="member' + va.id + '">';
						html += '<img src="/images/users/' + va.img + '">';
						html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
						html += '<h1 class="memberName">' + va.fullname + '</h1>';
						html += '<span class="creator">Admin</span>';
						html += '</div>';
						html += '</li>';
					}
				}
			});
		});
		$.each(user_list, function (ky, va) {
			$.each(participants, function (k, v) {
				if (va.id === v) {
					if(adminArra.indexOf(va.id) == -1){
						html += '<li onclick="removeMember(\'member\',\'' + va.id + '\',\'' + roomid + '\')" class="showEl">';
						html += '<div class="list" id="member' + va.id + '">';
						html += '<img src="/images/users/' + va.img + '">';
						html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
						html += '<h1 class="memberName">' + va.fullname + '</h1>';
						html += '<span class="tagcheck forActive"></span>';
						html += '</div>';
						html += '</li>';
					}
				}
			});
		});
		$.each(user_list, function (ky, va) {
			if (participants.indexOf(va.id) == allUserdata[0].users.indexOf(va.id)) {
				var img_src = va.img;
				var name = va.fullname;
				var uuid = va.id;
				html += '<li onclick="updateMember(event, \'' + img_src + '\',\'' + name + '\',\'' + uuid + '\')" class="showEl">';
				html += '<div class="list" id="member' + va.id + '">';
				html += '<img src="/images/users/' + va.img + '">';
				html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
				html += '<h1 class="memberName" data-uuid="' + va.id + '">' + va.fullname + '</h1>';
				html += '</div>';
				html += '</li>';
			}
		});
		html += '</ul>';
		html += '</div>';
		html += '</div>';
	}
	else {
		var html = '<div class="adminContainer">';
		html += '<div class="closeBackwrap" onclick="closeAllPopUp()"><img src="/images/basicAssets/close_button.svg"></div>';
		html += '<div class="label">';
		html += '<h1 class="label_Title">Members </h1>';
		html += '<h1 class="list_Count">(<span>' + totalMember + '</span>)</h1>';
		html += '</div>';
		html += '<input type="text" class="searchMember" placeholder="Search by name" onkeyup="searchMember(event,$(this).val());">';
		html += '<span class="remove searchClear"></span>';
		html += '<div class="suggest_Container overlayScrollbars" style="display: block;">';
		html += '<ul class="suggested-list">';
		var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);

		$.each(user_list, function (ky, va) {
			$.each(participants, function (k, v) {
				if (va.id === v) {
					if(adminArra.indexOf(va.id) !== -1){
						html += '<li class="showEl">';
						html += '<div class="list" id="member' + va.id + '">';
						html += '<img src="/images/users/' + va.img + '">';
						html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
						html += '<h1 class="memberName">' + va.fullname + '</h1>';
						html += '<span class="creator">Admin</span>';
						html += '</div>';
						html += '</li>';
					}
				}
			});
		});
		$.each(user_list, function (ky, va) {
			$.each(participants, function (k, v) {
				if (va.id === v) {
					if(adminArra.indexOf(va.id) == -1){
						html += '<li class="showEl">';
						html += '<div class="list" id="member' + va.id + '">';
						html += '<img src="/images/users/' + va.img + '">';
						html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
						html += '<h1 class="memberName">' + va.fullname + '</h1>';
						html += '</div>';
						html += '</li>';
					}
				}
			});
		});
		html += '</ul>';
		html += '</div>';
		html += '</div>';
	}
	overlayScrollbars();
	$('#memberListBackWrap').append(html);
	$('#memberListBackWrap .suggested-list li:first').addClass('selected default');
	$('.searchMember').focus();
	$('.remove.searchClear').on('click', function () {
		$('.searchMember').val('');
		$('.adminContainer li').show();
		$(this).hide();
	});
	tooltipForBackWrap();
	popupMouseEnter();
	searchClearInput();
}

var searchMember = (event, value) => {
	if (event.keyCode !== 40 && event.keyCode !== 38 && event.keyCode !== 13) {
		$(".adminContainer .remove.searchClear").each(function () {
			if (value.length > 0) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
		$(".memberName").each(function () {
			if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
				$(this).closest('li').show();
				$(this).closest('li').addClass('showEl');
			} else {
				$(this).closest('li').hide();
				$(this).closest('li').removeClass('showEl');
			}
		});

		$('.memberName').unhighlight();
		$('.memberName').highlight(value);
		$("#memberListBackWrap li").removeClass('selected');
		$("#memberListBackWrap li.showEl:first").addClass('selected');
	}

}

var updateMember = (event, img_src, name, uuid) => {
	$('.suggested-list .selected').remove();
	var roomid = $("#roomIdDiv").attr('data-roomid');
	// var img_src = $(event.target).find('img').attr('src');
	// var name = $(event.target).find('.memberName').text();
	// var uuid = $(event.target).find('.memberName').attr('data-uuid');
	var html = '<li onclick="removeMember(\'member\',\'' + uuid + '\',\'' + roomid + '\')" class="showEl">';
	html += '<div class="list" id="member' + uuid + '">';
	html += '<img src="/images/users/' + img_src + '">';
	html += '<span class="online_' + uuid + ' ' + (onlineUserList.indexOf(uuid) === -1 ? "offline" : "online") + '"></span>';
	html += '<h1 class="memberName">' + name + '</span></h1>';
	html += '<span class="tagcheck forActive"></span>';
	html += '</div>';
	html += '</li>';

	if ($("#roomIdDiv").attr('data-rfu') == 'ready') {
		var roomTitle = $("#roomIdDiv").attr('data-title');
		// console.log('roomid = ', roomid, 'roomTitle', roomTitle, 'img_src', img_src, 'name', name, 'uuid', uuid   );

		if (jQuery.inArray(uuid, participants) === -1) {
			$.ajax({
				type: 'POST',
				data: {
					conversation_id: roomid,
					targetID: uuid
				},
				dataType: 'json',
				url: '/hayven/groupMemberAdd',
				success: function (data) {
					participants.push(uuid);
					var totalMember = parseInt($('.list_Count span').text());
					// $(event.target).parent('li').remove();
					$('.adminContainer .suggested-list li').removeClass('selected');
					let nextLilength = $('#member' + uuid + '').parent('li').next('li').length;
					if(nextLilength > 0)
						$('#member' + uuid + '').parent('li').next('li').addClass('selected');
					else
						$('#member' + uuid + '').parent('li').prev('li').addClass('selected');

					// $('li #member' + uuid + '').parent('li').remove();
					$('.adminThisGroup:last').after(html);
					// $('.adminContainer .suggested-list li.showEl:first').addClass('selected');
					// $('.suggest_Container .os-viewport').animate({ scrollTop: 0 }, 1);
					$('.list_Count span').text( totalMember + 1);
					$('#totalMember').text( totalMember + 1);
					$("#conv" + roomid).attr('data-tm', totalMember + 1);
					popupMouseEnter();

					var workSpaceName = $('#roomIdDiv').attr('data-keyspace');
					var groupPrivacy = $('#roomIdDiv').attr('data-privecy');
					var roomTitle = $("#roomIdDiv").attr('data-title');
					socket.emit('groupMemberAdd', {
						room_id: roomid,
						memberList: participants,
						selectecosystem: workSpaceName,
						teamname: roomTitle,
						grpprivacy: groupPrivacy,
						createdby: user_id,
						createdby_name: user_fullname
					});
				}
			});
		} else {
			toastr["warning"](name + " is a member of \"" + roomTitle + "\" room", "Warning");
		}

	}

}



$(window).bind('mousewheel DOMMouseScroll', function (event) {
	if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
		var scrollTop = $('.chat-page .os-viewport').scrollTop();
		if (scrollTop === 0 && $('.msgs-form-users').first().attr('data-msgid') != undefined) {
			load_older_data(conversation_id, $('.msgs-form-users').first().attr('data-msgid'));
		}
	}
});



var member_Conversation = (id) => {
	var convId = $('.side_bar_list_item li[data-id="' + id + '"]').attr('id');
	if (convId !== undefined) {
		$('#' + convId).click();
		closeAllPopUp();
	}
}

var removeThisList = (param) => {

	var roomid = $("#conv" + param).attr('data-conversationid');
	var uuid = $("#conv" + param).attr('data-id');
	var checkClass = $("#conv" + param).attr('class');

	$.ajax({
		type: 'POST',
		data: {
			conversation_id: roomid,
			targetID: uuid
		},
		dataType: 'json',
		url: '/hayven/hideUserinSidebar',
		success: function (data) {
			if (checkClass !== "sideActive") {
				$("#conv" + param).remove();
			} else {
				$("#conv" + param).remove();
				$('#conv' + user_id).click();
			}

		}
	});

}

sidebarLiMouseEnter();

//leave room
function removeThisGroup(params) {
	var conv_id = $("#conv" + params).attr('data-conversationid');
	var dataId = $("#conv" + params).attr('data-id');
	var memberList = $("#conv" + params).attr('data-tm');
	var createdbyid = $("#conv" + params).attr('data-createdby');
	var selectecosystem = 'Navigate';
	var grpprivacy = 'public';
	var type = $("#conv" + params).attr('data-conversationtype');
	var octr = $("#conv" + params).attr('data-octr');

	if (type === 'group') {
		if (octr === user_id) {
			var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
			$('.msg-more-popup').hide();
			$('#delete_msg_div').show();
			$('.del_msg_title').text('Delete Room')
			$('.main-deleted-msg').append('<div class="delbody" style="margin-left:0px;"><strong>' + $('#conv' + conv_id + ' .usersName').text() + '</strong></div>');
			$('#delete_msg_div').find('.delete_msg_sec_title').html('Do you want to delete this room?</span>');
			$('.btn-msg-del , .btn-cancel').hide();
			$('.delete_msg_div .btn_div').append('<button class="btn-cancel forcreateTodo" style="margin-right:18px;" onclick="closeAllPopUp()">No</button> <button class="btn-msg-del forcreateTodo" onclick="leaveRoom(\'' + memberList + '\',\'' + createdbyid + '\',\'' + grpprivacy + '\',\'' + selectecosystem + '\',\'' + conv_id + '\',\'' + dataId + '\')">Yes</button>');
		} else {
			leaveRoom(memberList, createdbyid, grpprivacy, selectecosystem, conv_id, dataId);

			if ($("#conv" + params).hasClass('sideActive')) {
				$('#conv' + user_id + '').click();
			}
		}

	}

}


///keyboard up arrow key and down arrow key
var getActiveLi = function (selector) {
	var activeLI;
	var ind = $(selector).each(function (i) {
		if ($(this).hasClass('selected'))
			activeLI = i;
	})
	return activeLI;
}
// var suggestedActiveLi = function () {
// 	var activeLI;
// 	var ind = $('#directMsgUserList li.showEl').each(function (i) {
// 		if ($(this).hasClass('selected'))
// 			activeLI = i;
// 	})
// 	return activeLI;
// }
// var suggestedMemberActiveLi = function () {
// 	var activeLI;
// 	var ind = $('#memberListBackWrap li.showEl').each(function (i) {
// 		if ($(this).hasClass('selected'))
// 			activeLI = i;
// 	})
// 	return activeLI;
// }


var arrowUpArrowDownKey = () => {
	/// ArrowUp value = 38
	/// ArrowDown value = 40
	$(document).keydown(function (e) {
		// e.preventDefault();
		$('.suggested-list li').removeClass('default');
		if (e.keyCode == 38) {
			e.preventDefault();
			if (!$('.backwrap').is(':visible') && inputValueCountFun('msg', 'conte') == false && inputValueCountFun('add-team-member', 'class') == false && inputValueCountFun('team-name', 'id') == false && inputValueCountFun('create-todo-popup-title', 'class') == false && inputValueCountFun('create-event-popup-title', 'class') == false && !$('#ChatFileUpload').is(':visible') && inputValueCountFun('sideBarSearch', 'id') == false) {
				var activeIndexLI = getActiveLi('.side_bar_list_item li');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('.side_bar_list_item li:eq(' + newIndexLi + ')');
				var sideBarHeight = $('#hayvenSidebar').height();
				var sidebarLiCount = (sideBarHeight - 293) / 29;
				var totalLi = $('.side_bar_list_item li').length;
				if (totalLi > newIndexLi) {

					if (newIndexLi == -1) {
						$('.side-bar .os-viewport').animate({ scrollTop: 29 * totalLi }, 1);
					} else {
						if (totalLi > sidebarLiCount) {
							sidebarLiCount -= 4;
							$('.side-bar .os-viewport').animate({ scrollTop: 29 * newIndexLi }, 1);
						}
					}
				}

				$('.side_bar_list_item li').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
					// nextLi.click();
				}
				else {
					$('.side_bar_list_item li:first').addClass('selected');
					// $('.side_bar_list_item li:first').click();
				}
			}
			if ($('#createChannelContainer').is(':visible') && !$('#createDirMsgContainer').is(':visible')) {
				// $('.add-direct-member').blur();
				var activeIndexLI = getActiveLi('#s-l-def li.showEl');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('#s-l-def li.showEl:eq(' + newIndexLi + ')');
				var totalLi = $('#s-l-def li.showEl').length;
				if (totalLi > newIndexLi) {

					if (newIndexLi == -1) {
						$('.suggested-type-list .os-viewport').animate({ scrollTop: 64 * totalLi }, 1);
					} else {
						if (totalLi > newIndexLi) {
							newIndexLi -= 4;
							$('.suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
						}
					}
				}
				$('#s-l-def li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
			}
			if ($('#createDirMsgContainer').is(':visible') == true) {
				// $('.add-direct-member').blur();
				var activeIndexLI = getActiveLi('#directMsgUserList li.showEl');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('#directMsgUserList li.showEl:eq(' + newIndexLi + ')');
				var totalLi = $('#directMsgUserList li.showEl').length;
				if (totalLi > newIndexLi) {

					if (newIndexLi == -1) {
						$('.createdirmsg_container .suggested-type-list .os-viewport').animate({ scrollTop: 64 * totalLi }, 1);
					} else {
						if (totalLi > newIndexLi) {
							newIndexLi -= 4;
							$('.createdirmsg_container .suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
						}
					}
				}
				$('#directMsgUserList li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
			}
			if ($('#shareMessagePopUp').is(':visible') == true) {
				// $('.add-direct-member').blur();
				var activeIndexLI = getActiveLi('#shareMessagePopUp li.showEl');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('#shareMessagePopUp li.showEl:eq(' + newIndexLi + ')');
				var totalLi = $('#shareMessagePopUp li.showEl').length;
				if (totalLi > newIndexLi) {

					if (newIndexLi == -1) {
						$('.allMemberList  .os-viewport').animate({ scrollTop: 64 * totalLi }, 1);
					} else {
						if (totalLi > newIndexLi) {
							newIndexLi -= 4;
							$('.allMemberList  .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
						}
					}
				}
				$('#shareMessagePopUp li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
			}
			if ($('#memberListBackWrap').is(':visible') == true) {
				// $('.searchMember').blur();
				var activeIndexLI = getActiveLi('#memberListBackWrap li.showEl');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('#memberListBackWrap li.showEl:eq(' + newIndexLi + ')');
				var totalLi = $('#memberListBackWrap li.showEl').length;
				if (totalLi > newIndexLi) {

					if (newIndexLi == -1) {
						$('.suggest_Container .os-viewport').animate({ scrollTop: 64 * totalLi }, 1);
					} else {
						if (totalLi > newIndexLi) {
							newIndexLi -= 4;
							$('.suggest_Container .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
						}
					}
				}
				$('#memberListBackWrap li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
			}
			if ($('#notificationPopup').is(':visible') == true) {
				// $('.searchMember').blur();
				var activeIndexLI = getActiveLi('#notificationPopup label.showEl');
				var newIndexLi = activeIndexLI - 1;
				var nextLi = $('#notificationPopup label.showEl:eq(' + newIndexLi + ')');
				var totalLi = $('#notificationPopup label.showEl').length;
				$('#notificationPopup label.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
			}
		}

		if (e.keyCode == 40) {
			e.preventDefault();
			if (!$('.backwrap').is(':visible') && inputValueCountFun('msg', 'conte') == false && inputValueCountFun('add-team-member', 'class') == false && inputValueCountFun('team-name', 'id') == false && inputValueCountFun('create-todo-popup-title', 'class') == false && inputValueCountFun('create-event-popup-title', 'class') == false && !$('#ChatFileUpload').is(':visible') && inputValueCountFun('sideBarSearch', 'id') == false) {
				var activeIndexLI = getActiveLi('.side_bar_list_item li');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('.side_bar_list_item li:eq(' + newIndexLi + ')');
				var sideBarHeight = $('#hayvenSidebar').height();
				var sidebarLiCount = (sideBarHeight - 293) / 29;
				if (newIndexLi > sidebarLiCount) {
					newIndexLi -= sidebarLiCount
					$('.side-bar .os-viewport').animate({ scrollTop: 29 * newIndexLi }, 1);
				}
				$('.side_bar_list_item li').removeClass('selected');
				if (nextLi.length) {
					// nextLi.click();
					nextLi.addClass('selected');
				}
				else {
					$('.side_bar_list_item li:first').addClass('selected');
					$('.side-bar .os-viewport').animate({ scrollTop: 0 }, 1);
				}
			}
			if ($('#createChannelContainer').is(':visible') && !$('#createDirMsgContainer').is(':visible')) {
				var activeIndexLI = getActiveLi('#s-l-def li.showEl');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('#s-l-def li.showEl:eq(' + newIndexLi + ')');
				if (newIndexLi > 4) {
					newIndexLi -= 4
					$('.suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
				}

				$('#s-l-def li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
				else {
					$('#s-l-def li.showEl:first').addClass('selected');
					$('.suggested-type-list .os-viewport').animate({ scrollTop: 0 }, 1);
				}

			}
			if ($('#createDirMsgContainer').is(':visible') == true) {
				var activeIndexLI = getActiveLi('#directMsgUserList li.showEl');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('#directMsgUserList li.showEl:eq(' + newIndexLi + ')');
				if (newIndexLi > 4) {
					newIndexLi -= 4
					$('.createdirmsg_container .suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
				}

				$('#directMsgUserList li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
				else {
					$('#directMsgUserList li.showEl:first').addClass('selected');
					$('.createdirmsg_container .suggested-type-list .os-viewport').animate({ scrollTop: 0 }, 1);
				}

			}
			if ($('#shareMessagePopUp').is(':visible') == true) {
				var activeIndexLI = getActiveLi('#shareMessagePopUp li.showEl');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('#shareMessagePopUp li.showEl:eq(' + newIndexLi + ')');
				if (newIndexLi > 4) {
					newIndexLi -= 4
					$('.allMemberList .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
				}

				$('#shareMessagePopUp li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
				else {
					$('#shareMessagePopUp li.showEl:first').addClass('selected');
					$('.allMemberList .os-viewport').animate({ scrollTop: 0 }, 1);
				}

			}
			if ($('#memberListBackWrap').is(':visible') == true) {
				// $('.searchMember').blur();
				var activeIndexLI = getActiveLi('#memberListBackWrap li.showEl');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('#memberListBackWrap li.showEl:eq(' + newIndexLi + ')');
				if (newIndexLi > 4) {
					newIndexLi -= 4
					$('.suggest_Container .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
				}

				$('#memberListBackWrap li.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
				else {
					$('#memberListBackWrap li.showEl:first').addClass('selected');
					$('.suggest_Container .os-viewport').animate({ scrollTop: 0 }, 1);
				}
			}
			if ($('#notificationPopup').is(':visible') == true) {
				// $('.searchMember').blur();
				var activeIndexLI = getActiveLi('#notificationPopup label.showEl');
				var newIndexLi = activeIndexLI + 1;
				var nextLi = $('#notificationPopup label.showEl:eq(' + newIndexLi + ')');

				$('#notificationPopup label.showEl').removeClass('selected');

				if (nextLi.length) {
					nextLi.addClass('selected');
				}
				else {
					$('#notificationPopup label.showEl:first').addClass('selected');
				}
			}
		}
		if (e.keyCode == 13) {
			e.preventDefault();
			if ($('#createDirMsgContainer').is(':visible') == true) {
				if ($('#directMsgUserList li.showEl').hasClass('selected')) {
					$('#directMsgUserList li.showEl.selected').click();
				} else {
					// if already select one or more member, then press enter again; it trigger the "start" btn
					check_and_submit_for_new_conv();
				}
			}

			if (!$('.backwrap').is(':visible') && inputValueCountFun('msg', 'conte') == false && inputValueCountFun('add-team-member', 'class') == false && inputValueCountFun('team-name', 'id') == false && inputValueCountFun('create-todo-popup-title', 'class') == false && inputValueCountFun('create-event-popup-title', 'class') == false && !$('#ChatFileUpload').is(':visible') && inputValueCountFun('sideBarSearch', 'id') == false) {
				$('.side_bar_list_item li.selected').trigger('click');
			}
			if (!$('#createChannelContainer').is(':visible') && $('#memberListBackWrap').is(':visible') == true) {
				$('#memberListBackWrap .suggested-list li.selected').trigger('click');
			}
			if ($('#createChannelContainer').is(':visible') && !$('#createDirMsgContainer').is(':visible')) {
				$('#s-l-def li.selected').trigger('click');
			}
			if ($('#shareMessagePopUp').is(':visible') && !$('#createDirMsgContainer').is(':visible')) {
				$('#shareMessagePopUp .suggested-list li.selected').trigger('click');
			}
			if ($('#notificationPopup').is(':visible') && !$('#createDirMsgContainer').is(':visible')) {
				$('#notificationPopup label.selected').trigger('click');
			}
		}
		if (e.keyCode == 8 && $('#createDirMsgContainer').is(':visible')) {  // backspace
			var value = $('#add_direct_member').html();
			// console.log(value.charCodeAt(value.length-1));
			if ($('.selected_member_name').length > 0 && value.charCodeAt(value.length - 1) == 173) {
				e.preventDefault();
				removeA(memberList, $('#add_direct_member .selected_member_name').last().text());
				removeA(memberListUUID, $('#add_direct_member .selected_member_name').last().attr('data-uuid'));
				$('#add_direct_member .selected_member_name').last().remove();
				draw_name();
				var el = document.getElementById('add_direct_member');
				placeCaretAtEnd(el);
			}
			// else{
			// 	console.log(3420, value);
			// 	console.log(3421, value.charAt(value.length-1));
			// }
		}
		if (e.keyCode == 8 && $('#shareMessagePopUp').is(':visible')) {  // backspace
			var value = $('#searchInputForShare').html();
			// console.log(value.charCodeAt(value.length-1));
			if ($('.selected_member_name').length > 0 && value.charCodeAt(value.length - 1) == 173) {
				e.preventDefault();
				var removeUuid = $('#searchInputForShare .selected_member_name').last().attr('data-uuid');
				removeA(selectedShareMember, removeUuid);
				$('#searchInputForShare .selected_member_name').last().remove();
				draw_name();
				var el = document.getElementById('searchInputForShare');
				placeCaretAtEnd(el);
				$('.no_of_user_left_to_add span').text(10 - selectedShareMember.length);

				var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
				$.each(user_list, function(k,v){
					if(v.id == removeUuid){
						$('#shareSuggestedList').append(userListDesign(v));
					}
				});
				popupMouseEnter();
			}
		}
	});
}

arrowUpArrowDownKey();


function suggestedUserList() {
	var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
	$.each(user_list, function (ky, va) {
		if (va.id != user_id) {
			if (sharedMemberList.indexOf(va.id) == -1) {
				var imSrc = va.img;
				var dataID = va.id;
				var definedList = '<li onclick="shareThisMember(\'' + dataID + '\',\'' + imSrc + '\')" id="toDoMember' + dataID + '" class="showEl">';
				definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
				definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">@ Navigate</spna>';
				definedList += '    </li>';
				$('.suggested-list').append(definedList);
				$('.suggested-list li.showEl:first').addClass("selected default");
			}
		}

	});
}

$('#search_members').on('click', function () {
	var value = $(this).val();
	if (value == 0) {
		$('.suggested-type-list').show();
		$(".inputGroup2 .suggested-list li.showEl").removeClass('selected');
		$(".inputGroup2 .suggested-list li.showEl:first").addClass('selected default');
		$('.suggested-type-list .os-viewport').animate({ scrollTop: 0 }, 1);
	}
	$('.suggested-list').html("");
	suggestedUserList();
	popupMouseEnter();
});

function forActiveCallIcon(onlineUserList, participants,type,id){
	var participantActive = _.intersection( onlineUserList , participants );
	if(type == 'personal'){
		if(onlineUserList.indexOf(id) !== -1){
			$('.voice-call img').attr('src','/images/basicAssets/voice_call_for_active.svg');
			$('.video-call img').attr('src','/images/basicAssets/video_call_for_active.svg');
		}else{
			$('.voice-call img').attr('src','/images/basicAssets/custom_voice_call.svg');
			$('.video-call img').attr('src','/images/basicAssets/custom_video_call.svg');
		}
	}else if(type == 'group'){
		if(participantActive.length > 1){
			$('.voice-call img').attr('src','/images/basicAssets/voice_call_for_active.svg');
			$('.video-call img').attr('src','/images/basicAssets/video_call_for_active.svg');
		}else{
			$('.voice-call img').attr('src','/images/basicAssets/custom_voice_call.svg');
			$('.video-call img').attr('src','/images/basicAssets/custom_video_call.svg');
		}
	}
}



function pageCustomLoader(type){


	// if(type == true){
	// 	var i;
	// 	for(i = 1; i < 51; i++ ){
	// 		$('.progressLoaderBar').css('width',i+'%');
	// 		$('#parcentOnText').text(i+'%');
	// 	}
	// 	$('.rightSectionpageloader').show();
	// }else{
	// 	$('.progressLoaderBar').css('width','100%');
	// 	$('#parcentOnText').text('100%');
	// 	$('.rightSectionpageloader').delay(800).hide(0);
	// }
}


//var i = setInterval(function() { pageCustomLoader(); }, 100);


function editMessage(event){
	var msgid = $(event.target).closest('.msgs-form-users').attr('data-msgid');
	$('#data_msg_body'+msgid).attr('contenteditable','true');
	$('#data_msg_body'+msgid).focus();
    placeCaretAtEnd(document.getElementById('data_msg_body'+msgid));

    var editMessageId = msgid;
    var editMessageValue = $('#data_msg_body'+msgid).text();
    editMessageAction(editMessageId,editMessageValue);
}

var editMessageAction = (id,value)=>{
	var updateAt = ''+new Date().getTime()+'';
	$('#data_msg_body'+id).keyup(function(e){
		e.stopImmediatePropagation();
		if(e.keyCode == 13){
			if($('#data_msg_body'+id).text().length > 0){
				$('#data_msg_body'+id).blur();
			}
			
		}
	});
	$('#data_msg_body'+id).blur(function(e){
		e.stopImmediatePropagation();
		$('#data_msg_body'+id).attr('contenteditable', 'false');
			var data = {
				conv_id 	: conversation_id,
				msg_id  	: id,
				msg_body 	: $('#data_msg_body'+id).text(),
				update_at 	: updateAt
			};
			socket.emit('msgUpdate',data,(res)=>{
				data.update_at = Number(data.update_at);
				var design = '<div class="message_edit_status" data-balloon-pos="up" data-balloon="'+moment(data.update_at).format('MMM Do YYYY @ h:mm a')+'">  - [Edited] </div>';
				if($('#data_msg_body'+id).closest('.user-msg').find('.message_edit_status').length == 0)
					$('#data_msg_body'+id).closest('.user-msg').find('h4').append(design);
				
				toastr['success']('Message updated successfully');
			});
		});
}

var selectedShareMember = [];
function shareMessage(event){
	selectedShareMember = [];
	$('#shareMessagePopUp').show();
	$('.searchInput').html("");
	$('#shareSuggestedList').html("");
	$('.no_of_user_left_to_add span').text(10 - selectedShareMember.length);
	var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
	console.log(participants);
	$.each(user_list, function(k,v){
		if(participants.indexOf(v.id) == -1 && v.id !== user_id){
			$('#shareSuggestedList').append(userListDesign(v));
		}
	});
	popupMouseEnter();

}

var userListDesign =(data)=>{
	var design  = '<li class="memberContainer showEl" id="suggestUsers'+data.id+'" data-id="'+data.id+'" dat-img-src="'+data.img+'" data-fullname="'+data.fullname+'" onclick="userAddAction(\''+data.id+'\', \''+data.fullname+'\', \''+data.img+'\')">';
		design += 	'<img src="/images/users/'+data.img+'" class="profile">';
		design += 	'<span class="userFullName s-l-def-clas" data-uuid="'+data.id+'">'+data.fullname+'</span>';
		design += 	'<span class="designation-name">@ Navigate</span>';
		design += '</li>';

	return design;
}

function userAddAction(uuid,username,imgsrc){
	if(selectedShareMember.length < 10){
		draw_name();
		var design  = '<span class="selected_member_name" data-uuid="'+uuid+'" data-img="/images/users/'+imgsrc+'" contenteditable="false"><span class="user_name">'+username+'</span><img src="/images/basicAssets/Remove.svg" onclick="remove_this_user_search(event,\''+uuid+'\',\'/images/users/'+imgsrc+'\',\''+username+'\')"></span> &shy;';
		$('.searchInput').append(design);
		make_content_non_editable('selected_member_name');
		$('#suggestUsers'+uuid).remove();
		selectedShareMember.push(uuid);
		var el = document.getElementById('searchInputForShare');
		placeCaretAtEnd(el);
		$('.no_of_user_left_to_add span').text(10 - selectedShareMember.length);
	}else{
		toastr["warning"]("This member is not allowed.", "Warning");
	}
}

function remove_this_user_search(event,uuid,imgsrc,name){
		$(event.target).parent('.selected_member_name').remove();
		removeA(selectedShareMember, uuid);
		var newimgsrc = imgsrc.split('/');
		var design  = '<li class="memberContainer showEl" id="suggestUsers'+uuid+'" data-id="'+uuid+'" dat-img-src="'+newimgsrc[newimgsrc.length - 1]+'" data-fullname="'+name+'" onclick="userAddAction(\''+uuid+'\', \''+name+'\', \''+newimgsrc[newimgsrc.length - 1]+'\')">';
			design += 	'<img src="/images/users/'+newimgsrc[newimgsrc.length - 1]+'" class="profile">';
			design += 	'<span class="userFullName s-l-def-clas" data-uuid="'+uuid+'">'+name+'</span>';
			design += 	'<span class="designation-name">@ Navigate</span>';
			design += '</li>';
		$('#shareSuggestedList').append(design);
		popupMouseEnter();
		draw_name();
		$('.no_of_user_left_to_add span').text(10 - selectedShareMember.length);

}