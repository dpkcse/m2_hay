

var searchsldefclas = (event,value) => {
	value = value.trim();
	if(event.keyCode !== 40 && event.keyCode !== 38 && event.keyCode !== 13){
		$(".s-l-def-clas").each(function() {
			if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
				$(this).parent('li').show();
				$(this).parent('li').addClass('showEl');
			}else {
				$(this).parent('li').hide();
				$(this).parent('li').removeClass('showEl');
			}
		});

		$('.s-l-def-clas').unhighlight();
		$('.s-l-def-clas').highlight(value);
		if($('#directMsgUserList').is(':visible')){
			$("#directMsgUserList li").removeClass('selected');
			$("#directMsgUserList li.showEl:first").addClass('selected');
		}else if($('#createChannelContainer').is(':visible')){
			$("#createChannelContainer .invite-member li").removeClass('selected');
			$("#createChannelContainer .invite-member li.showEl:first").addClass('selected');
		}else if($('#shareMessagePopUp').is(':visible')){
			$("#shareMessagePopUp li").removeClass('selected');
			$("#shareMessagePopUp li.showEl:first").addClass('selected');
		}
	}

}


var searchRooms = (value) => {

	if(value == ''){
		$(".chanel-name").each(function() {
			$(this).parent('div').show();
			$(this).parent('div:nth-child(3n)').css('margin-right','0px');
		});
	}else{
		$(".chanel-name").each(function() {
			if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
				$(this).parent('div').show();

				// $(this).parent('div').css('margin-right','16px');
				// $(this).parent('div:nth-child(3n)').css('margin-right','0px');
			}else {
				$(this).parent('div').hide();
			}
		});

		$(".chanel-name:visible").each(function() {
			$(this).parent('div:visible:nth-child(3n)').css('margin-right','0px');
		});
	}

	$('.chanel-name').unhighlight();
	$('.chanel-name').highlight(value);
}

var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
$.each(user_list, function (ky, va) {
	if(jQuery.inArray(va.dept, dept) == -1){
		dept.push(va.dept);
	}
	if(va.id != user_id){
		var design = '	<li>';
		design += '		<label class="">'+va.fullname+'';
		design += '			<input onclick="memAssignForTodo(event,\''+va.id+'\')" id="'+va.fullname.replace(/\s/g,'')+'" class="checkTask" data-uid="'+va.id+'" type="checkbox">';
		design += '			<span class="checkmark"></span>';
		design += '		</label>';
		design += '		</li>';

		// var design = '	<div class="added-channel-members">';
		// 	design += '		<input onclick="memAssignForTodo(event,\''+va.id+'\')" id="'+va.fullname.replace(/\s/g,'')+'" class="checkTask" data-uid="'+va.id+'" type="checkbox">';
		// 	design += '		<label for="'+va.fullname.replace(/\s/g,'')+'">'+va.fullname+'</label>';
		// 	design += '	</div>';

		$("#memberHolder").append(design);
	}

});

$.each(dept, function(k,v){
	var ulDes = '<li>';
	ulDes += '      <div class="department">'+v+'</div>';
	ulDes += '      <div class="dpt-members">';
	ulDes += '        <ul class="suggested-list" id="s-l-'+v.replace(/\s/g,'')+'" >';
	ulDes += '        </ul>';
	ulDes += '      </div>';
	ulDes += '    </li>';

	$("#s-m-ul").append(ulDes);
});
// Render all user accoroding to designation
$.each(allUserdata[0].users, function(ky,va){
	if(va.id == user_id){
		var adminDes = '<li>';
		adminDes += '        <img src="/images/users/'+va.img+'" class="profile">';
		adminDes += '        <span class="name" data-uuid="'+va.id+'">'+va.fullname+'</span> <span class="is-admin">(Admin)</span>';
		adminDes += '      </li>';
		$("#memberlist").append(adminDes);
	}else{
		var liDes = '<li>';
		liDes += '      <img src="/images/users/'+va.img+'" class="profile">';
		liDes += '      <spna class="name" data-uuid="'+va.id+'">'+va.fullname+'</spna> <spna class="designation-name">'+va.designation+'</spna>';
		liDes += '    </li>';
		var dept = va.dept;
		$("#s-l-"+dept.replace(/\s/g,'')).append(liDes);
	}

	var definedList = '<li class="showEl">';
	definedList += '      <img src="/images/users/'+va.img+'" class="profile">';
	definedList += '      <spna class="name s-l-def-clas" data-uuid="'+va.id+'">'+va.fullname+'</spna> <spna class="designation-name">'+va.designation+'</spna>';
	definedList += '    </li>';

	$("#s-l-def").append(definedList);
	$("#directMsgUserList").append(definedList);
});

/** Add suggested user list to
selected group member list */
var directMsgCont = 1;
var directMsgName = "";
var directMsgUUID = "";
var directMsgImg = "";
var directMsgSubtitle = "";

// $('.suggested-list li').on('click', function(){
//
// 	var img_src = $(this).find('img').attr('src');
// 	var name = $(this).find('.name').text();
// 	var uuid = $(this).find('.name').attr('data-uuid');
// 	var subtitle = $(this).find('.designation-name').text();
//
// 	if($("#createDirMsgContainer").is(":visible") && $("#roomIdDiv").attr('data-rfu') == ''){
// 		if(directMsgCont == 1){
// 			memberList.push(name);
// 			memberListUUID.push(uuid);
// 			directMsgCont++;
// 			directMsgName = name;
// 			directMsgUUID = uuid;
// 			directMsgImg = img_src;
// 			directMsgSubtitle = subtitle;
// 			group_member_li_draw(name, img_src, uuid,'0','0',subtitle);
// 			// all_action_for_selected_member();
// 			createDirectmsg();
// 			directMsgCont = 1;
// 			directMsgUUID =[];
// 		}else{
// 			toastr["warning"]("Multiple member is not allowed in direct message", "Warning");
// 		}
// 	}else if($("#roomIdDiv").attr('data-rfu') == 'ready'){
// 		var roomid = $("#roomIdDiv").attr('data-roomid');
// 		var roomTitle = $("#roomIdDiv").attr('data-title');
//
// 		if (jQuery.inArray(uuid, participants) === -1){
// 			$.ajax({
// 	            type: 'POST',
// 	            data: {
// 	                conversation_id: roomid,
// 	                targetID: uuid
// 	            },
// 	            dataType: 'json',
// 	            url: '/hayven/groupMemberAdd',
// 	            success: function(data) {
// 	                participants.push(uuid);
// 	                group_member_li_draw(name, img_src, uuid,'ready',roomid,subtitle);
// 				}
// 	        });
// 		}else{
// 			toastr["warning"](name+" is a member of \""+roomTitle+"\" room", "Warning");
// 		}
//
// 	}else{
//
// 		if($(".inviteMember").length == 0){
// 			$(".memberList").show();
// 		}
//
// 		if(jQuery.inArray(name, memberList) !== -1){
//
// 		}else{
// 			memberList.push(name);
// 			memberListUUID.push(uuid);
// 			$("#numbers").text(parseInt(memberList.length)+1);
//
// 			group_member_li_draw(name, img_src, uuid,'0','0',subtitle);
// 		}
//
// 		all_action_for_selected_member();
// 	}
//
// 	// $(this).remove();
//
// });

$('.add-team-member').on('keyup', function(e){
	var str = $(e.target).val();
	if(str != ""){
		$('.suggested-type-list').show();
		$('.invite-member .remove').show();
		if(str.indexOf('@') != -1){
			$('.suggested-type-list li').hide();
			send_email_invite(str);
		}
	} else {
		$('.suggested-type-list').hide();
		$('.invite-member .remove').hide();
	}
});

// $('.add-direct-member').on('keyup', function(e){
// 	if(e.keyCode !== 40 && e.keyCode !== 38 && e.keyCode !== 13){
// 		var str = $(e.target).val();
// 		if(str != ""){
// 			$('.remove-suggested-type-list').show();
// 			// $('.suggested-type-list').show();
// 			// $('.suggested-type-list>ul').css('width','323px !important');
// 			// if(str.indexOf('@') != -1){
// 			// 	$('.suggested-type-list li').hide();
// 			// 	send_email_invite(str);
// 			// }
// 		} else {
// 			// $('.suggested-type-list').hide();
// 			$('.remove-suggested-type-list').hide();
// 		}
// 		$("#directMsgUserList li").removeClass('selected');
// 		$("#directMsgUserList li.showEl:first").addClass('selected');
// 	}
//
// });

$(".ml-listHl .member-div").mouseenter(function(e) {
	$(this).find('.add-admin').show();
	$(this).find('.remove-it').show();
}).mouseleave(function() {
	$(this).find('.add-admin').hide();
	$(this).find('.remove-it').hide();
});

$(".ml-listHA .member-div").mouseenter(function(e) {
	$(this).find('.remove-admin').show();
	$(this).find('.remove-it').show();
}).mouseleave(function() {
	$(this).find('.remove-admin').hide();
	$(this).find('.remove-it').hide();
});

/*
Create Chat Group on click create btn
*/

var getInfo = (event)=>{
	var tmppath = URL.createObjectURL(event.target.files[0]);
	$("#demoImg").attr('src',URL.createObjectURL(event.target.files[0]));
};

var roomImageUpdate = (roomid,event)=>{
	console.log(roomid);
	var formData = new FormData($('#roomImg')[0]);
	$.ajax({
		url: '/hayven/convImg',
		type: "POST",
		data: formData,
		dataType: 'json',
		contentType: false,
		processData: false,
		success: function(res){
			console.log(res);
			socket.emit('updateRoomimg', {
				conversation_id: roomid,
				conv_img: res.filename
			}, (callBack) => {
				var tmppath = URL.createObjectURL(event.target.files[0]);
				$("#demoImg").attr('src',URL.createObjectURL(event.target.files[0]));
			});
		}
	});
}

var CreateGroup = () =>{

	var teamname = $("#team-name").val();
	var selectecosystem = $("#select-ecosystem").val();
	var grpprivacy = 'public';
	if(teamname.length > 17){
		var over_length  = "over_length";
	}

	if ($("#grpPrivacy").is(":checked")) {
		grpprivacy = 'private';
	}else{
		grpprivacy = 'public';
	}

	if(teamname != ""){
		if(selectecosystem != ""){
			if(grpprivacy != ""){

				adminList.push(user_fullname);
				adminListUUID.push(user_id);

				$(".backWrap").hide();
				$(".new-group-chat-popup").hide();

			}else{
				$("#grp-privacy").css('border','1px solid RED');
			}
		}else{
			$("#select-ecosystem").css('border','1px solid RED');
		}
	}else{
		$("#team-name").css('border','1px solid RED');
	}

	// console.log($("#upload-channel-photo").val());

	if($("#upload-channel-photo").val() != ""){
		var formData = new FormData($('#roomImg')[0]);
		$.ajax({
			url: '/hayven/convImg',
			type: "POST",
			data: formData,
			dataType: 'json',
			contentType: false,
			processData: false,
			success: function(res){
				socket.emit('groupCreateBrdcst', {
					createdby: user_id,
					createdby_name: user_fullname,
					memberList: memberList,
					memberListUUID: memberListUUID,
					adminList: adminList,
					adminListUUID: adminListUUID,
					is_room: '6',
					teamname: teamname,
					selectecosystem: selectecosystem,
					grpprivacy: grpprivacy,
					conv_img : 'feelix.jpg'
				},
				function(confirmation){
					$("#defaultRoom").remove();
					$("#channelList").prepend('<li data-myid="' + user_id + '" data-createdby="0"  data-octr="' + user_id + '" onclick="start_conversation(event)" data-subtitle="' + selectecosystem + '" data-id="' + user_id + '" data-conversationtype="group" data-tm= "' + parseInt(parseInt(memberListUUID.length) + 1) + '" data-conversationid="' + confirmation.conversation_id + '" data-name="' + teamname + '" data-img="feelix.jpg"  id="conv' + confirmation.conversation_id + '" class="' + over_length + '"><span class="' + (grpprivacy === 'public' ? "hash" : "lock") + '"></span> '+teamname+'<span class="sub-text"> - '+selectecosystem+'</span></li>');
					$("#team-name").val("");
					$("#ml-admintype").hide();
					$("#ml-membertype").hide();

					$("#ml-listHA").html('');
					$("#ml-listHl").html('');
					$("#grpPrivacy").prop("checked",false);
					closeRightSection();
					$('.list_Count span').text(memberListUUID.length + 1);
					$('#totalMember').text(memberListUUID.length + 1);
					$('#conv'+confirmation.conversation_id).click();
					tooltipForOverLength();
				});
			}
		});
	}else{
		socket.emit('groupCreateBrdcst', {
			createdby: user_id,
			createdby_name: user_fullname,
			memberList: memberList,
			memberListUUID: memberListUUID,
			adminList: adminList,
			adminListUUID: adminListUUID,
			is_room: '6',
			teamname: teamname,
			selectecosystem: selectecosystem,
			grpprivacy: grpprivacy,
			conv_img : 'feelix.jpg'
		},
		function(confirmation){
			$("#defaultRoom").remove();
			$("#channelList").prepend('<li data-myid="' + user_id + '" data-createdby="0"  data-octr="' + user_id + '" onclick="start_conversation(event)" data-subtitle="' + selectecosystem + '" data-id="' + user_id + '" data-conversationtype="group" data-tm= "' + parseInt(parseInt(memberListUUID.length) + 1) + '" data-conversationid="' + confirmation.conversation_id + '" data-name="' + teamname + '" data-img="feelix.jpg"  id="conv' + confirmation.conversation_id + '" class="' + over_length + '"><span class="' + (grpprivacy === 'public' ? "hash" : "lock") + '"></span> '+teamname+'<span class="sub-text"> - '+selectecosystem+'</span></li>');
			$("#team-name").val("");
			$("#ml-admintype").hide();
			$("#ml-membertype").hide();

			$("#ml-listHA").html('');
			$("#ml-listHl").html('');
			$("#grpPrivacy").prop("checked",false);
			closeRightSection();
			$('.list_Count span').text(memberListUUID.length + 1);
			$('#totalMember').text(memberListUUID.length + 1);
			$('#conv'+confirmation.conversation_id).click();
			tooltipForOverLength();
		});
	}
	all_action_for_selected_member();
}

$(document).keyup(function(e) {
	if (e.keyCode == 27) { // escape key maps to keycode `27`

		if ($('.suggested-type-list').is(':visible')) {
			$('.suggested-type-list').hide();
			$('.add-team-member').val("");
			$('.add-direct-member').html("");
		}
	}
});


/** On mouse up event 'mouseup' */
$(document).mouseup(function(e) {
	var container = $('.suggested-type-list');

	if (!container.is(e.target) && container.has(e.target).length === 0) {
		if($('#createDirMsgContainer').is(':visible') == true){
			container.show();
		}else{
			container.hide();
		}
		$('.add-team-member').val("");
	}
});

$(".remove-suggested-type-list").click(function(){
	$('.add-direct-member').html("");
	$('.add-team-member').val("");
	if($('#createDirMsgContainer').is(':visible') == true){
		$('.suggested-type-list').show();
		$('.suggested-type-list li').show();
		$('#directMsgUserList li').removeClass('selected');
		$('#directMsgUserList li').addClass('showEl');
		$('#directMsgUserList li.showEl:first').addClass('selected');
		$('.s-l-def-clas').unhighlight();
		$(this).hide();
	}else{
		$('.suggested-type-list').hide();
	}
});



/** action for selected member list */
var all_action_for_selected_member = () =>{
	/** On hover into the selected group member list,
	if member is already admin, show the remove admin btn,
	if member is not admin, show the make admin btn */

	$(".ml-listHl .member-div").mouseenter(function(e) {
		$(this).find('.add-admin').show();
		$(this).find('.remove-it').show();
	}).mouseleave(function() {
		$(this).find('.add-admin').hide();
		$(this).find('.remove-it').hide();
	});

	$(".ml-listHA .member-div").mouseenter(function(e) {
		$(this).find('.remove-admin').show();
		$(this).find('.remove-it').show();
	}).mouseleave(function() {
		$(this).find('.remove-admin').hide();
		$(this).find('.remove-it').hide();
	});
	/** When click on the make admin btn,
	admin text show and hide add admin btn */

	/** When click on the remove admin btn,
	admin text null and hide remove admin btn */
	$(".remove-admin").on('click', function(){
		$(this).closest('li').find('.is-admin').text('').hide();
		$(this).closest('li').find('.remove-admin').hide();
		adminList.splice($(this).closest('li').find('.name').text(),1);
		adminList.splice($(this).closest('li').find('.name').attr('data-uuid'),1);
		memberList.push($(this).closest('li').find('.name').text());
		memberListUUID.push($(this).closest('li').find('.name').attr('data-uuid'));
	});

	$('.remove-it').on('click', function(e){
		console.log('Yes , I got this');
		e.preventDefault();
		e.stopImmediatePropagation();

		var name = $(this).closest('div').find('.name').text();
		var img = $(this).closest('div').find('img').attr('src');
		var uuid = $(this).closest('div').find('.name').attr('data-uuid');
		// if($(this).parent('.member-div') == true){
		// 	alert('Yes , I got this');
		// }
		if(!$(this).hasClass('GroupFlRight')){
			directMsgCont = 1;

			removeA(memberList, name);
			removeA(memberListUUID, uuid);
			$("#numbers").text(parseInt(memberList.length)+1);
			$(this).closest('div').remove();
			if($(".ml-listHl>.member-div").length == 0){
				$("#ml-membertype").hide();
			}

			var definedList = '<li>';
			definedList += '      <img src="'+img+'" class="profile">';
			definedList += '      <spna class="name s-l-def-clas" data-uuid="'+uuid+'">'+name+'</spna>';
			definedList += '    </li>';

			$("#s-l-def").append(definedList);
			$("#directMsgUserList").append(definedList);

			all_action_for_selected_member();
		}


	});

	$('.suggested-list li').on('click', function(event){
		event.stopImmediatePropagation();

		var img_src = $(this).find('img').attr('src');
		var name = $(this).find('.name').text();
		var uuid = $(this).find('.name').attr('data-uuid');
		var subtitle = $(this).find('.designation-name').text();

		if($("#createDirMsgContainer").is(":visible") && $("#roomIdDiv").attr('data-rfu') == ''){
			if(directMsgCont == 1 && memberListUUID.indexOf(uuid) === -1 && memberListUUID.length < 10){
				memberList.push(name);
				memberListUUID.push(uuid);
				directMsgCont++;
				directMsgName = name;
				directMsgUUID = uuid;
				directMsgImg = img_src;
				directMsgSubtitle = subtitle;
				// group_member_li_draw(name, img_src, uuid,'0','0',subtitle);
				// all_action_for_selected_member();
				// createDirectmsg();
				draw_name();
				$('.add-direct-member').append('<span class="selected_member_name" data-uuid="'+ uuid +'" data-img="'+img_src+'"><span class="user_name">' + name +'</span><img src="/images/basicAssets/Remove.svg" onClick="remove_this_user(event,\''+uuid+'\',\''+img_src+'\',\''+name+'\')"></span> &shy;');// it's a special char &shy; non visible in html
				make_content_non_editable('selected_member_name');
				directMsgCont = 1;
				directMsgUUID = [];
				$(this).remove(); // Remove this user after selected;
				var el = document.getElementById('add_direct_member');
				placeCaretAtEnd(el);
				
			}else{
				// toastr["warning"]("Multiple member is not allowed in direct message", "Warning");
				toastr["warning"]("This member is not allowed.", "Warning");
			}
		}

		else if($("#roomIdDiv").attr('data-rfu') == 'ready'){
			var roomid = $("#roomIdDiv").attr('data-roomid');
			var roomTitle = $("#roomIdDiv").attr('data-title');

			if (jQuery.inArray(uuid, participants) === -1){
				$.ajax({
		            type: 'POST',
		            data: {
		                conversation_id: roomid,
		                targetID: uuid
		            },
		            dataType: 'json',
		            url: '/hayven/groupMemberAdd',
		            success: function(data) {
		                participants.push(uuid);
		                group_member_li_draw(name, img_src, uuid,'ready',roomid,subtitle);
					}
		        });
			}else{
				toastr["warning"](name+" is a member of \""+roomTitle+"\" room", "Warning");
			}

		}

		else{
			if($(".inviteMember").length == 0){
				$(".memberList").show();
			}

			if(jQuery.inArray(name, memberList) !== -1){

			}else{
				memberList.push(name);
				memberListUUID.push(uuid);
				$("#numbers").text(parseInt(memberList.length)+1);

				group_member_li_draw(name, img_src, uuid,'0','0',subtitle);
				all_action_for_selected_member();
			}

			// all_action_for_selected_member();
		}

		// $(this).remove();

	});

	$(".checkToDo").click(function(e){
		if(e.target.checked){

			var tagtitle = $("#"+e.target.id).attr('data-tagtitle');
			var tagid = $("#"+e.target.id).attr('data-tagid');

			socket.emit('taggedData', {
				tagid: tagid
			}, (callBack) => {
				console.log(callBack);
				if(callBack.status){
					var len = callBack.tagDet;
					if(len.length > 0){

						var checked = 1;

						$('.chooseTag .checkToDo').each(function (i, row) {
							if($(row).is(':checked')){
								if(taggedCheckedID.indexOf($(row).attr('data-tagid')) === -1){
									taggedCheckedID.push($(row).attr('data-tagid'));
								}
								checked++;
							}
						});



						$("#channelList li").hide();
						$("#pintul li").hide();
						$("#directListUl li").hide();

						var design 	= '<div class="tag_item" id="'+e.target.id+'_ed"><img src="/images/basicAssets/custom_not_tag.svg" class="tagged"><p>'+tagtitle+'</p><img onclick="removeTagFilter(\''+e.target.id+'\')" src="/images/basicAssets/Close.svg"></div>';

						$('.tagg_list').append(design);
						if($(".tag_item").length > 0){
							$('.tagg_list').show();
						}

						$.each(callBack.tagDet, function(tdk,tdv){
							taggedRoomID.push({'tagid':tagid,'roomid':tdv.conversation_id});
						});

						$.each(taggedRoomID, function(tdk,tdv){
							$("#conv"+tdv.roomid).show();
						});

					}else{
						toastr["warning"]("No tagged found", "Warning");
					}
				}

			});
		}else{

			var tagid = $("#"+e.target.id).attr('data-tagid');

			removeA(taggedCheckedID,tagid);

			$("#"+e.target.id+"_ed").remove();

			$("#channelList li").hide();
			$("#pintul li").hide();
			$("#directListUl li").hide();

			if($(".tag_item").length == 0){
				$("#channelList li").show();
				$("#pintul li").show();
				$("#directListUl li").show();
			}else{
				$.each(taggedRoomID, function(tdk,tdv){
					$("#conv"+tdv.roomid).show();
				});
			}
		}
	});

};

/** selected group member list row html */
var group_member_li_draw = (name, img, uuid,urf,roomid,designation) =>{
	if(urf === 'ready'){
		var immg = img.split("/");
		var mldesign = '<div class="member-div" id="member' + uuid + '">';
		mldesign += '          <img src="/images/users/' + immg[3] + '" class="member-img">';
		mldesign += '          <div class="member-name">' + name + '</div>';
		mldesign += '          <img src="/images/remove_8px_200 @1x.png" class="remove-it GroupFlRight" onclick = "removeMember(\'member\',\'' + uuid + '\',\'' + roomid + '\');">';
		mldesign += '          <img src="/images/admin-remove_12px @1x.png" class="remove-admin remove2 GroupFlRight arfImg" onclick="makeMember(\'' + immg[3] + '\',\'' + name + '\',\'' + designation + '\',\'' + uuid + '\',\'' + roomid + '\')">';
		mldesign += '          <img src="/images/admin-add_12px @1x.png" class="add-admin add2 GroupFlRight arfImg"  onclick="makeAdmin(\'' + immg[3] + '\',\'' + name + '\',\'' + designation + '\',\'' + uuid + '\',\'' + roomid + '\')">';
		mldesign += '        </div>';
		$("#ml-listHl").append(mldesign);
	}else{
		var html =  '<div class="member-div" id="member' + uuid + '">';
		html+=    '<img src="'+ img +'" class="member-img">';
		html +=   '<div data-uuid="'+uuid+'" class="member-name name">' + name + '</div>';
		html+=    '<img src="/images/remove_8px_200 @1x.png" class="remove-it">';
		html+=  '</div>';

		$('.ml-listHl').append(html);
	}

	$('.no-of-group-members').text($('.selected-group-members li:visible').length);
	$('.suggested-type-list').hide();
	$('.add-team-member').val("");

	$(".ml-listHl .member-div").mouseenter(function(e) {
		$(this).find('.add-admin').show();
		$(this).find('.remove-it').show();

	}).mouseleave(function() {
		$(this).find('.add-admin').hide();
		$(this).find('.remove-it').hide();
	});

	if ($('#ml-listHA .member-div').length > 0) {
		$("#ml-admintype").show();
	} else {
		$("#ml-admintype").hide();
	}

	if ($('#ml-listHl .member-div').length > 0) {
		$("#ml-membertype").show();
	} else {
		$("#ml-membertype").hide();
	}
};

$('div').on('click', '.pin-to-bar', function(event) {
	event.stopImmediatePropagation();
	event.stopPropagation();

	var conversationid = $(event.target).attr('data-conversationid');
	if(conversationid != ""){
		if ($(event.target).hasClass('pined')) {
			var pinnedid = $(event.target).attr('data-pinned');
			var blockID = $(event.target).attr('data-conversationid');
			var subtitle = $(event.target).attr('data-subtitle');
			var img = $(event.target).attr('data-img');
			var name = $(event.target).attr('data-name');
			var myid = $(event.target).attr('data-myid');
			var createdby = $(event.target).attr('data-createdby');
			var octr = $(event.target).attr('data-octr');
			var type = $(event.target).attr('data-type');

			$.ajax({
				type: 'POST',
				data: {
					pinnedNumber: '',
					targetID: pinnedid,
					blockID: '',
					type: 'unpin'
				},
				dataType: 'json',
				url: '/hayven/pinning',
				success: function(data) {
					$("#pin-to-bar").removeClass('pined');
					$("#pin-to-bar").attr('src','/images/basicAssets/custom_not_pin.svg');
					var sapnClasses = $("#conv"+blockID).find('span').attr('class');
					var splitClass = sapnClasses.split(' ');
					var status = '';

					if($.inArray('online',splitClass) !== -1){
						status = 'online';
					}else if($.inArray('offline',splitClass) !== -1){
						status = 'offline';
					}

					$("#conv"+blockID).remove();

					var design = '<li  data-myid="' + myid + '" data-createdby="' + createdby + '"  data-octr="' + octr + '"  onclick="start_conversation(event)" data-id="'+blockID+'" data-subtitle="'+subtitle+'" data-conversationtype="'+type+'" data-conversationid="'+blockID+'" data-name="'+name+'" data-img="'+img+'" id="conv'+blockID+'">';
					design += '<span class="'+(type == "personal" ? status+" online_"+blockID:"hash")+'"></span><span class="usersName">'+name+'</spam>';
					design += '</li>';
					if(type == 'personal'){

						if(name == user_fullname && blockID == user_id){
							$("#directListUl").prepend(design);
						}else{
							$("#directListUl").append(design);
						}

						// console.log($("#conv"+blockID).find('span').attr('class'));
					}else if(type == 'group'){
						$("#channelList").append(design);
					}
				}
			});

		} else {

			var pinnedCount = $('.pin').length;
			var PinnedNumber = parseInt(pinnedCount) + 1;
			var targetID = $(event.target).attr('data-id');
			var blockID = $(event.target).attr('data-conversationid');
			var subtitle = $(event.target).attr('data-subtitle');
			var img = $(event.target).attr('data-img');
			var name = $(event.target).attr('data-name');
			var type = $(event.target).attr('data-type');

			$.ajax({
				type: 'POST',
				data: {
					pinnedNumber: PinnedNumber,
					targetID: targetID,
					blockID: blockID,
					type: 'pin'
				},
				dataType: 'json',
				url: '/hayven/pinning',
				success: function(data) {
					$("#pin-to-bar").addClass('pined');
					$("#pin-to-bar").attr('src','/images/basicAssets/custom_pinned.svg');
					$("#pin-to-bar").attr('data-pinned',data.pinID);

					var sapnClasses = $("#conv"+blockID).find('span').attr('class');
					var splitClass = sapnClasses.split(' ');
					var status = '';

					if($.inArray('online',splitClass) !== -1){
						status = 'online';
					}else if($.inArray('offline',splitClass) !== -1){
						status = 'offline';
					}

					$("#conv"+blockID).remove();
					var design = '<li onclick="start_conversation(event)" data-id="'+blockID+'" data-subtitle="'+subtitle+'" data-conversationtype="'+type+'" data-conversationid="'+blockID+'" data-name="'+name+'" data-img="'+img+'" id="conv'+blockID+'">';
					design += '<span class="'+(type == "personal" ? status+" online_"+blockID:"hash")+'"></span><span class="usersName">'+name+'</span>';
					design += '</li>';
					$("#pintul").append(design);
				}
			});
		}
	}

});


var getPublicData = (keySpace) =>{
	socket.emit('public_conversation_history', {keySpace}, (respons) =>{
		console.log(respons);
		if(respons.staus){
			$("#publicRoomsList").html("");
			$(".connect_right_section").hide();
			$('#joinChannelPanel').show();
			$.each(respons.rooms, function(k,v){
				// if($.inArray(user_id, v.participants_admin) == -1){

				// }
				var ststus = (v.privacy == "public" ? "hash":"lock");
				if($.inArray(user_id, v.participants) !== -1){
					var totalMember = v.participants;
					var roomDesign =  '<div class="added-channels">';
					roomDesign += '		<div class="channel-joined"><img src="/images/basicAssets/joined.png" alt="">Joined</div>';
					roomDesign += '		<h3 class="chanel-name" id="joinChanelTile'+v.conversation_id+'" data-roomid="'+v.conversation_id+'" data-rfu="join" data-title="'+v.title+'" data-privecy="'+v.privacy+'" data-keyspace="'+v.group_keyspace+'" data-participants="'+v.participants+'" data-admin="'+v.participants_admin+'" onclick="roomFromJOin($(this).attr(\'data-participants\'),$(this).attr(\'data-admin\'),$(this).attr(\'data-roomid\'),$(this).attr(\'data-title\'),$(this).attr(\'data-privecy\'),$(this).attr(\'data-keyspace\'))"><span class="'+ststus+'"></span>'+v.title+'</h3>';
					roomDesign += '		<p class="channel-members"><img src="/images/basicAssets/Users.svg" alt="">'+totalMember.length+' Members</p>';
					roomDesign += '		<div class="channel-tags">';
					$.each(respons.convTag, function(ck,cv){
						if(cv.cnvID == v.conversation_id){
							roomDesign += '  		<p>'+cv.title+'</p>';
						}
					});
					roomDesign += '		</div>';
					roomDesign += '		<h3 class="click-to-join" style="display: none">Join Channel</h3>';
					roomDesign += '		<h3 class="click-to-leave">Leave Room</h3>';
					roomDesign += '</div>';

					$("#publicRoomsList").append(roomDesign);
				}else{
					var totalMember = v.participants;
					var roomDesign =  '<div class="added-channels">';
					roomDesign += '		<h3 class="chanel-name" id="joinChanelTile'+v.conversation_id+'" data-roomid="'+v.conversation_id+'" data-rfu="join" data-title="'+v.title+'" data-privecy="'+v.privacy+'" data-keyspace="'+v.group_keyspace+'" data-participants="'+v.participants+'" data-admin="'+v.participants_admin+'" onclick="roomFromJOin($(this).attr(\'data-participants\'),$(this).attr(\'data-admin\'),$(this).attr(\'data-roomid\'),$(this).attr(\'data-title\'),$(this).attr(\'data-privecy\'),$(this).attr(\'data-keyspace\'))"><span class="'+ststus+'"></span>'+v.title+'</h3>';
					roomDesign += '		<p class="channel-members"><img src="/images/basicAssets/Users.svg" alt="">'+totalMember.length+' Members</p>';
					roomDesign += '		<div class="channel-tags">';
					$.each(respons.convTag, function(ck,cv){
						if(cv.cnvID == v.conversation_id){
							roomDesign += '  		<p>'+cv.title+'</p>';
						}
					});
					roomDesign += '		</div>';
					roomDesign += '		<h3 class="click-to-join">Join Room</h3>';
					roomDesign += '</div>';
					$("#publicRoomsList").append(roomDesign);
				}
			});
		}
	});
};


var joinRoom = (memberList,createdbyid, grpprivacy ,selectecosystem,roomId,user_id, title) =>{
	var selectecosystem = $("#workspaceList").val();
	$.ajax({
		type: 'POST',
		data: {
			conversation_id: roomId,
			targetID: user_id
		},
		dataType: 'json',
		url: '/hayven/groupMemberAdd',
		success: function(data) {
			if(data == 'success'){
				$("#roomJoin"+roomId).show();
				$("#roomBtn"+roomId).removeClass('click-to-join').addClass('click-to-leave');
				$("#roomBtn"+roomId).text("Leave Room");
				
				$("#channelList").prepend('<li data-myid="' + user_id + '" data-createdby="' + createdbyid+'"  data-octr="' + createdbyid + '" onclick="start_conversation(event)" data-subtitle="' + selectecosystem + '" data-id="' + createdbyid + '" data-conversationtype="group" data-tm= "' + memberList + '" data-conversationid="' + roomId + '" data-name="' + title + '" data-img="feelix.jpg"  id="conv' + roomId + '" class=""><span class="' + (grpprivacy === 'public' ? "hash" : "lock") + '"></span> <span class="usersName">' + title + '</li></span>');

				$("#roomBtn" + roomId).attr("onclick", "leaveRoom('" + memberList + "','" + createdbyid + "', '" + grpprivacy + "' ,'" +selectecosystem+"','"+roomId+"','"+user_id+"')");

				sidebarLiMouseEnter();
				leaveThisRoom();
			}
		}
	});
};


var leaveRoom = (memberList, createdbyid, grpprivacy, selectecosystem, roomId, user_id) => {
	var roomTitle = $("#roomTitle" + roomId).text();
	$.ajax({
		type: 'POST',
		data: {
			conversation_id: roomId,
			targetID: user_id
		},
		dataType: 'json',
		url: '/hayven/leaveRoom',
		success: function (data) {
			console.log(data);
			if (data.msg == 'success') {
				$("#roomJoin" + roomId).hide();
				$("#roomBtn" + roomId).removeClass('click-to-leave').addClass('click-to-join');
				$("#roomBtn" + roomId).text("Join Room");
				$("#conv" + roomId).remove();
				$("#roomBtn" + roomId).attr("onclick", "joinRoom('" + memberList + "','" + createdbyid + "', '" + grpprivacy + "' ,'" + selectecosystem + "','" + roomId + "','" + user_id + "','" + roomTitle + "')");

				if ($("#createChannelContainer").is(':visible')) {
					if ($("#conv" + roomId).hasClass('active')) {
						closeRightSection();
					}

				}
			} else if (data.msg == 'nomem') {
				toastr.options.closeButton = true;
				toastr.options.timeOut = 2000;
				toastr.options.extendedTimeOut = 1000;
				toastr["warning"]("Add a member first", "Warning");
			} else if (data.msg == 'delete') {
				var conv_participants = data.conversation[0].participants;
				var title = data.conversation[0].title;
				socket.emit('roomdelete', { conv_participants, user_fullname, title, user_id, roomId });
				$("#conv" + roomId).remove();
				if ($("#createChannelContainer").is(':visible')) {
					if ($("#conv" + roomId).hasClass('active')) {
						closeRightSection();
					}

				}

				$('#delete_msg_div').hide();
			} else {
				toastr.options.closeButton = true;
				toastr.options.timeOut = 2000;
				toastr.options.extendedTimeOut = 1000;
				toastr["warning"]("You can't remove", "Warning");
			}
		}
	});
};

var roomEdit = (roomid,title,privecy,keyspace,rromimg) =>{

	$(".connect_right_section").hide();
	$('#createChannelContainer').show();
	$('.memberList').show();
	$("#ml-listHl").html("");
	$("#ml-listHA").html("");
	$("#team-name").val(title);
	$("#demoImg").attr('src','/upload/'+rromimg);

	$("#upload-channel-photo").attr("onchange","roomImageUpdate(\'"+roomid+"\',event)");

	$(".submitBtn").hide();
	$(".create-channel-heading").text("Update Room");

	// This line use for checking room update or room create
	$("#roomIdDiv").attr('data-rfu','ready');

	$("#select-ecosystem option").each(function(){
		if($(this).val()== keyspace){ // match here
			$(this).attr("selected","selected");
		}
	});

	if(privecy === 'private'){
		$('#grpPrivacy').prop('checked', true);
	} else if (privecy === 'public') {
		$('#grpPrivacy').prop('checked', false);
	}

	if ($.inArray(user_id, adminArra) === -1) {
		$(".add-team-member").prop("disabled",true);
		$('#grpPrivacy').prop("disabled",true);
	}

	$("#s-l-def").html("");
	$("#directMsgUserList").html("");

	$.each(allUserdata[0].users, function(ky, va) {
		$.each(participants, function(k, v) {
			if (va.id === v) {
				if (jQuery.inArray(v, adminArra) === -1) {
					var mldesign = '<div class="member-div" id="member' + va.id + '">';
					mldesign += '          <img src="/images/users/' + va.img + '" class="member-img">';
					mldesign += '          <div class="member-name">' + va.fullname + '</div>';
					// mldesign += '          <div class="member-designation">' + va.designation + '</div>';
					if ($.inArray(user_id, adminArra) !== -1) {
						mldesign += '          <img src="/images/remove_8px_200 @1x.png" class="remove-it GroupFlRight" onclick = "removeMember(\'member\',\'' + va.id + '\',\'' + roomid + '\');">';
						mldesign += '          <img src="/images/admin-remove_12px @1x.png" class="remove-admin remove2 GroupFlRight arfImg" onclick="makeMember(\'' + va.img + '\',\'' + va.fullname + '\',\'' + va.designation + '\',\'' + va.id + '\',\'' + roomid + '\')">';
						mldesign += '          <img src="/images/admin-add_12px @1x.png" class="add-admin add2 GroupFlRight arfImg"  onclick="makeAdmin(\'' + va.img + '\',\'' + va.fullname + '\',\'' + va.designation + '\',\'' + va.id + '\',\'' + roomid + '\')">';
					}
					mldesign += '        </div>';
					$("#ml-listHl").append(mldesign);
					$("#ml-membertype").show();
				}
			}
		});

		if (adminArra !== null) {
			$.each(adminArra, function(kad, vad) {
				if (va.id == vad) {
					var mldesign = '<div class="member-div" id="member' + va.id + '">';
					mldesign += '          <img src="/images/users/' + va.img + '" class="member-img">';
					mldesign += '          <div class="member-name">' + va.fullname + '</div>';
					// mldesign += '          <div class="member-designation">' + va.designation + '</div>';
					if ($.inArray(user_id, adminArra) !== -1) {
						mldesign += '          <img src="/images/remove_8px_200 @1x.png" class="remove-it GroupFlRight" onclick = "removeMember(\'admin\',\'' + va.id + '\',\'' + roomid + '\');">';
						mldesign += '          <img src="/images/admin-remove_12px @1x.png" class="remove-admin remove2 GroupFlRight arfImg" onclick="makeMember(\'' + va.img + '\',\'' + va.fullname + '\',\'' + va.designation + '\',\'' + va.id + '\',\'' + roomid + '\')">';
						mldesign += '          <img src="/images/admin-add_12px @1x.png" class="add-admin add2 GroupFlRight arfImg"  onclick="makeAdmin(\'' + va.img + '\',\'' + va.fullname + '\',\'' + va.designation + '\',\'' + va.id + '\',\'' + roomid + '\')">';
					}
					mldesign += '        </div>';
					$("#ml-listHA").append(mldesign);
					$("#ml-admintype").show();
				}
			});
		}

		var definedList = '<li>';
		definedList += '      <img src="/images/users/'+va.img+'" class="profile">';
		definedList += '      <spna class="name s-l-def-clas" data-uuid="'+va.id+'">'+va.fullname+'</spna> <spna class="designation-name"> @ '+va.designation+'</spna>';
		definedList += '    </li>';

		$("#s-l-def").append(definedList);
		$("#directMsgUserList").append(definedList);

	});



	$('#grpPrivacy').click(function(e) {
		e.stopImmediatePropagation();

		if($("#roomIdDiv").attr('data-rfu') == 'ready'){
			var roomid = $("#roomIdDiv").attr('data-roomid');
			var roomTitle = $("#roomIdDiv").attr('data-title');

			if ($.inArray(user_id, adminArra) !== -1) {
				if(e.target.checked){
					var grpprivacy = 'private';
				}else{
					var grpprivacy = 'public';
				}

				socket.emit('updatePrivecy', {
					conversation_id: roomid,
					grpprivacy: grpprivacy
				}, (callBack) => {

					toastr["success"]("This room is "+grpprivacy+" now", "Success");

					if(grpprivacy == 'private'){
						$("#conv"+roomid).find('span:first-child').removeClass('hash').addClass('lock');

					}

					if(grpprivacy == 'public'){
						$("#conv" + roomid).find('span:first-child').removeClass('lock').addClass('hash');
					}
				});

			}else{
				toastr["warning"]("Please contact with room owner or admin", "Warning");
			}

		}
	});

	all_action_for_selected_member();
};

var roomFromJOin = (participantsOld, admin, roomid, title, privecy, keyspace) =>{

	$("#divCheck").val('2');

	if(participantsOld != null){
		participants = participantsOld.split(',');
	}

	if(admin != null){
		adminArra = admin.split(',');
	}else{
		adminArra = admin;
	}

	$(".connect_right_section").hide();
	$('#createChannelContainer').show();
	$('.memberList').show();
	$("#ml-listHl").html("");
	$("#ml-listHA").html("");
	$("#team-name").val(title);

	$(".submitBtn").hide();
	$(".create-channel-heading").text(title);

	// This line use for checking room update or room create
	$("#roomIdDiv").attr('data-rfu','ready');

	$("#select-ecosystem option").each(function(){
		if($(this).val()== keyspace){ // match here
			$(this).attr("selected","selected");
		}
	});

	if(privecy == 'private'){
		$('#grpPrivacy').attr('checked', true);
	}

	$(".add-team-member").prop("disabled",true);

	$.each(allUserdata[0].users, function(ky, va) {
		$.each(participants, function(k, v) {
			if (va.id === v) {
				if (jQuery.inArray(v, adminArra) === -1) {
					var mldesign = '<div class="member-div" id="member' + va.id + '">';
					mldesign += '          <img src="/images/users/' + va.img + '" class="member-img">';
					mldesign += '          <div class="member-name">' + va.fullname + '</div>';
					mldesign += '        </div>';
					$("#ml-listHl").append(mldesign);
					$("#ml-membertype").show();
				}
			}
		});

		if (adminArra !== null) {
			$.each(adminArra, function(kad, vad) {
				if (va.id == vad) {
					var mldesign = '<div class="member-div" id="member' + va.id + '">';
					mldesign += '          <img src="/images/users/' + va.img + '" class="member-img">';
					mldesign += '          <div class="member-name">' + va.fullname + '</div>';
					mldesign += '        </div>';
					$("#ml-listHA").append(mldesign);
					$("#ml-admintype").show();
				}
			});
		}
	});
};

var removeMember = (targetUser, targetID, conversation_id) => {
	var memberImgarray = $('#member'+targetID).find('img').attr('src').split("/");
	var memberImg = memberImgarray[memberImgarray.length -1];
	var memberName = $('#member'+targetID).find('.memberName').text();
	var design  = '<li onclick="updateMember(event, \''+memberImg+'\',\''+memberName+'\',\''+targetID+'\')" class="showEl">';
		design += '		<div class="list" id="membere'+targetID+'">';
		design += '			<img src="/images/users/'+memberImg+'">';
		design += '			<span class="online_'+targetID+' '+(onlineUserList.indexOf(targetID) === -1 ? "offline":"online" ) +'"></span>';
		design += '			<h1 class="memberName" data-uuid="'+targetID+'">'+memberName+'</h1>';
		design += '		</div>';
		design += '</li>';

	if(targetUser == 'admin'){
		if(adminArra.length > 1){
			var remain = parseInt($("#conv"+conversation_id).attr('data-tm'))-1;
			$.ajax({
				type: 'POST',
				data: {
					conversation_id: conversation_id,
					targetUser: targetUser,
					targetID: targetID
				},
				dataType: 'json',
				url: '/hayven/groupMemberDelete',
				success: function(data) {
					if (data == 'success') {
						var totalMember = parseInt($('.list_Count span').text());
						if (totalMember > 0) {
							$('.list_Count span').text(totalMember - 1);
							$('#totalMember').text(totalMember - 1);
							$("#conv" + conversation_id).attr('data-tm', totalMember - 1);
						} else {
							$('.list_Count span').text(0);
							$('#totalMember').text(0);
						}
						if (data == 'creator') {
							toastr["warning"]("You can\'t delete this user", "Warning");
						} else {
							if ($('#memberListBackWrap').is(':visible') == true) {
								$('li #member' + targetID + '').parent('li').next('.showEl').addClass('selected');
								$("#member" + targetID).parent('li').remove();
							} else {
								$("#member" + targetID).remove();
							}

							removeA(adminArra, targetID);
							var memberList = $('.list_Count span').text();
							var workSpaceName = $('#roomIdDiv').attr('data-keyspace');
							var groupPrivacy = $('#roomIdDiv').attr('data-privecy');
							var roomTitle = $("#roomIdDiv").attr('data-title');
							socket.emit('groupMemberDelete', {
								room_id: conversation_id,
								memberList: memberList,
								selectecosystem: workSpaceName,
								teamname: roomTitle,
								grpprivacy: groupPrivacy,
								targetID: targetID,
								createdby: user_id,
								createdby_name: user_fullname
							});
						}
					} else if (data == 'nomem') {
						toastr.options.closeButton = true;
						toastr.options.timeOut = 2000;
						toastr.options.extendedTimeOut = 1000;
						toastr["warning"]("Add a member first", "Warning");
					} else {
						toastr.options.closeButton = true;
						toastr.options.timeOut = 2000;
						toastr.options.extendedTimeOut = 1000;
						toastr["warning"]("You can't remove", "Warning");
					}
				}
			});
		}else{
			toastr["warning"]("You can\'t remove this user. Make an admin first", "Warning");
		}
	}else{
		var remain = parseInt($("#conv"+conversation_id).attr('data-tm'))-1;
		$.ajax({
			type: 'POST',
			data: {
				conversation_id: conversation_id,
				targetUser: targetUser,
				targetID: targetID
			},
			dataType: 'json',
			url: '/hayven/groupMemberDelete',
			success: function(data) {
				if (data == 'success') {
					var totalMember = parseInt($('.list_Count span').text());
					if (totalMember > 0) {
						$('.list_Count span').text(totalMember - 1);
						$('#totalMember').text(totalMember - 1);
						$("#conv" + conversation_id).attr('data-tm', totalMember - 1);
					} else {
						$('.list_Count span').text(0);
						$('#totalMember').text(0);
					}

					if (data == 'creator') {
						toastr["warning"]("You can\'t delete this user", "Warning");
					} else {
						if ($('#memberListBackWrap').is(':visible') == true) {
							$('li #member' + targetID + '').parent('li').next('.showEl').addClass('selected');
							$('li #member' + targetID + '').parent('li').remove();
							removeA(participants, targetID);
							$('#memberListBackWrap li:last').after(design);
							popupMouseEnter();
						} else {
							$("#member" + targetID).remove();
						}

						var memberList = $('.list_Count span').text();
						var workSpaceName = $('#roomIdDiv').attr('data-keyspace');
						var groupPrivacy = $('#roomIdDiv').attr('data-privecy');
						var roomTitle = $("#roomIdDiv").attr('data-title');

						socket.emit('groupMemberDelete', {
							room_id: conversation_id,
							memberList: memberList,
							selectecosystem: workSpaceName,
							teamname: roomTitle,
							targetID: targetID,
							grpprivacy: groupPrivacy,
							createdby: user_id,
							createdby_name: user_fullname
						});
					}
				} else if (data == 'nomem') {
					toastr.options.closeButton = true;
					toastr.options.timeOut = 2000;
					toastr.options.extendedTimeOut = 1000;
					toastr["warning"]("Add a member first", "Warning");
				} else {
					toastr.options.closeButton = true;
					toastr.options.timeOut = 2000;
					toastr.options.extendedTimeOut = 1000;
					toastr["warning"]("You can't remove", "Warning");
				}
			}
		});
	}

};

// makeMember function used for make member as  a member from admin
var makeMember = (img, name, desig, id, cnvid) => {

	if(adminArra.length > 1){
		$.ajax({
			type: 'POST',
			data: {
				conversation_id: cnvid,
				targetUser: name,
				targetID: id
			},
			dataType: 'json',
			url: '/hayven/makeMember',
			success: function(data) {
				$("#member" + id).remove();
				var mldesign = ' <div class="member-div"  id="member' + id + '">';
				mldesign += '   <img src="/images/users/' + img + '" class="member-img">';
				mldesign += '   <div class="member-name">' + name + '</div>';
				mldesign += '   <div class="member-designation" style="float:left;"></div>';
				mldesign += '	<img src="/images/remove_8px_200 @1x.png" class="remove-it GroupFlRight" onclick = "removeMember(\'member\',\'' + id + '\',\'' + cnvid + '\');">';
				mldesign += '   <img src="/images/admin-remove_12px @1x.png" class="remove-admin remove2 GroupFlRight arfImg" onclick="makeMember(\'' + img + '\',\'' + name + '\',\'' + desig + '\',\'' + id + '\',\'' + cnvid + '\')">';
				mldesign += '   <img src="/images/admin-add_12px @1x.png" class="add-admin add2 GroupFlRight arfImg"   onclick="makeAdmin(\'' + img + '\',\'' + name + '\',\'' + desig + '\',\'' + id + '\',\'' + cnvid + '\')">';
				mldesign += ' </div>';

				$('.ml-listHl').append(mldesign);

				$(".ml-listHl .member-div").mouseenter(function(e) {
					$(this).find('.add-admin').show();
					$(this).find('.remove-it').show();
				}).mouseleave(function() {
					$(this).find('.add-admin').hide();
					$(this).find('.remove-it').hide();
				});

				if ($('#ml-listHA .member-div').length > 0) {
					$("#ml-admintype").show();
				} else {
					$("#ml-admintype").hide();
				}

				if ($('#ml-listHl .member-div').length > 0) {
					$("#ml-membertype").show();
				} else {
					$("#ml-membertype").hide();
				}
				removeA(adminArra,id);
				
				if (adminArra.length == 1){
					if ($("#conv" + cnvid).attr('data-createdby').trim() === adminArra[0]){
						$("#conv" + cnvid).attr('data-createdby',0);
						$("#conv" + cnvid +" .removeThisGroup").remove();
					}
				}
			}
		});
	}else{
		toastr["warning"]("You can\'t remove this user. Make an admin first", "Warning");
	}
};

// makeMember function used for make admin as  a member from member
var makeAdmin = (img, name, desig, id, cnvid) => {
	//alert(conversation_id);
	$.ajax({
		type: 'POST',
		data: {
			conversation_id: cnvid,
			targetUser: name,
			targetID: id
		},
		dataType: 'json',
		url: '/hayven/makeAdmin',
		success: function(data) {
			$("#member" + id).remove();
			var mldesign = ' <div class="member-div"  id="member' + id + '">';
			mldesign += '   <img src="/images/users/' + img + '" class="member-img">';
			mldesign += '   <div class="member-name">' + name + '</div>';
			mldesign += '   <div class="member-designation" style="float:left;"></div>';
			mldesign += '   <img src="/images/remove_8px_200 @1x.png" class="remove-it GroupFlRight" onclick = "removeMember(\'admin\',\'' + id + '\',\'' + cnvid + '\');">';
			mldesign += '   <img src="/images/admin-remove_12px @1x.png" class="remove-admin remove2 GroupFlRight arfImg" onclick="makeMember(\'' + img + '\',\'' + name + '\',\'' + desig + '\',\'' + id + '\',\'' + cnvid + '\')">';
			mldesign += '   <img src="/images/admin-add_12px @1x.png" class="add-admin add2 GroupFlRight arfImg"   onclick="makeAdmin(\'' + img + '\',\'' + name + '\',\'' + desig + '\',\'' + id + '\',\'' + cnvid + '\')">';
			mldesign += ' </div>';

			$('.ml-listHA').append(mldesign);

			$(".ml-listHA .member-div").mouseenter(function(e) {
				$(this).find('.remove-admin').show();
				$(this).find('.remove-it').show();
			}).mouseleave(function() {
				$(this).find('.remove-admin').hide();
				$(this).find('.remove-it').hide();
			});

			if ($('#ml-listHA .member-div').length > 0) {
				$("#ml-admintype").show();
			} else {
				$("#ml-admintype").hide();
			}

			if ($('#ml-listHl .member-div').length > 0) {
				$("#ml-membertype").show();
			} else {
				$("#ml-membertype").hide();
			}

			adminArra.push(id);
			
			if ($("#conv" + cnvid).attr('data-createdby') == 0) {
				$("#conv" + cnvid).attr('data-createdby', user_id.trim())
				$("#conv" + cnvid).append('<span class="remove removeThisGroup" onclick="removeThisGroup(\'' + cnvid + '\')" data-balloon="Click to leave" data-balloon-pos="left" style="display: inline;"></span>');
			}
		}
	});
};

$("#team-name").on('blur keypress', function(e) {
	var code = e.keyCode || e.which;
	if($("#roomIdDiv").attr('data-rfu') == 'ready'){
		if ($.inArray(user_id, adminArra) !== -1) {
			var roomid = $("#roomIdDiv").attr('data-roomid');
			var roomTitle = $("#roomIdDiv").attr('data-title');
			if (code == 13) { //Enter keycode = 13
				e.preventDefault();
				if ($("#team-name").val() != "") {
					var newGroupname = $("#team-name").val();
					socket.emit('saveGroupName', {
						conversation_id: roomid,
						newGroupname: newGroupname
					}, (callBack) => {

						console.log(callBack);

						if (callBack.status) {
							$("#team-name").focusout() ;
							$("#conv_title").text("#"+newGroupname) ;
							$("#conv"+roomid).html('<span class="hash" style="left: 12px;"></span>'+newGroupname) ;
							$("#roomIdDiv").attr('data-title',newGroupname)
						}
					});
				} else {
					$("#team-name").val(groupName);
					toastr["warning"]("You can\'t set an empty group name", "Warning");
				}
			}
		}else{
			toastr["warning"]("Please contact with room owner or admin", "Warning");
		}

	}
});

var updateWorkspace = (thisValue)=>{
	if($("#roomIdDiv").attr('data-rfu') == 'ready'){
		if ($.inArray(user_id, adminArra) !== -1) {

			var roomid = $("#roomIdDiv").attr('data-roomid');
			var roomTitle = $("#roomIdDiv").attr('data-title');

			socket.emit('updateKeySpace', {
				conversation_id: roomid,
				keySpace: thisValue
			}, (callBack) => {

				console.log(callBack);
				toastr["success"]("Workspace changed successfully", "Success");
			});
		}else{
			toastr["warning"]("Please contact with room owner or admin", "Warning");
		}
	}
};

// msg history for own msg
var tagListTitle = [];
var tagLsitDetail = [];
var alltags = [];

var my_conversation = (event) =>{
	pageCustomLoader(true);
	if(!$(event.target).hasClass('sideActive')){
		adminArra = [];
		participants = [];

		if($('#groupChatContainer').is(":visible") == false){
			$(".connect_right_section").hide();
			$('#groupChatContainer').show();
		}

		if($("#defaultRoom").is(":visible")){
			$("#defaultRoom").remove();
		}

		var id = to = room_id = $(event.target).attr("data-id");
		var type = conversation_type = $(event.target).attr("data-conversationtype");
		var conversationid = conversation_id = $(event.target).attr("data-conversationid");
		var name = room_name = $(event.target).attr("data-name");
		var img = room_img = $(event.target).attr("data-img");
		var subtitle = $(event.target).attr("data-subtitle");
		var tm = $(event.target).attr("data-tm");
		var status = $(event.target).find('.online, .offline, .hash, .lock').attr('class');

		$("#pin-to-bar").attr('data-conversationid','');
		$("#createConvTag").attr('data-roomid',conversationid);

		$("#lastActive").val(conversationid);

		$("#pin-to-bar").attr('data-id','');
		$("#pin-to-bar").attr('data-subtitle','');
		$("#pin-to-bar").attr('data-img','');
		$("#pin-to-bar").attr('data-name','');
		$("#pin-to-bar").attr('data-type','');
		$("#pin-to-bar").attr('src','/images/basicAssets/custom_pinned.svg');

		// //use for set title upper side of msg body
		// $("#conv_title").text('#'+name);
		// $("#conv_key").text('@'+subtitle);
		// $("#totalMember").text('1');


		//use for set title upper side of msg body
		$("#conv_title").html('<span class="'+status+'"></span><span class="converstaion_name">'+name+'</span>');
		$("#conv_key").text('@ Navigate');

		// $("#totalMember").text(tm);
		// console.log({type, id, conversationid, name, img});
		$("#msg").html("");
		$("#msg-container").html("");

		$('.voice-call').hide();
		$('.video-call').hide();
		//Msg placeholder
		$("#msg").attr('placeholder', 'Message '+name+'');

		// Chat head member count div
		if (type == "group") {
			$('.chat-head-name h4').css('display', 'block');
			$('.chat-head-name').css('margin-top', '17px');
			$('#roomIdDiv').css('cursor', 'pointer');
			$('#leaveThisRoom').show();
			$('#roomIdDiv').attr('onclick', "roomEdit($(this).attr('data-roomid'),$(this).attr('data-title'),$(this).attr('data-privecy'),$(this).attr('data-keyspace'),$(this).attr('data-convimg'))");
			if(name.indexOf(',') > -1){
				$('#leaveThisRoom').text('Leave group');
			}else{
				$('#leaveThisRoom').text('Leave room');
			}

		} else if (type == "personal") {
			$('.chat-head-name h4').css('display', 'none');
			$('.chat-head-name').css('margin-top', '28px');
			$('#roomIdDiv').removeAttr('onclick');
			$('#roomIdDiv').css('cursor', 'default');
			$('#leaveThisRoom').hide();
		}

		// For tag purpose. while clicking on room or personal
		$('.chat-head-calling .addTagConv').hide();
		$('.chat-head-calling .tagged').show();
		$("#taggedList").html("");
		$("#levelListp").html("");
		tagListTitle = [];
		tagLsitDetail = [];
		$("#fileAttachTagLs").html('');
		tagListForFileAttach = [];

		FtempArray = [];
		FtaggedList = [];

		$("#taggedIMG").attr('src','/images/basicAssets/custom_not_tag.svg');
		$("#createConvTag").val('');
		$("#tagItemList").text('');

		var this_msg_unread = $("#conv"+conversation_id).find(".unreadMsgCount").html();
		total_unread_count -= Number(this_msg_unread);
		display_show_hide_unread_bar(total_unread_count);
		$("#conv"+conversation_id).find(".unreadMsgCount").html("");

		var seartTxt = $("#searchText").val();

		socket.emit('get_conversation_history', {type, id, conversationid, name, img,user_id, seartTxt}, (respons) =>{
			pageCustomLoader(false);
			var need_update_message_seen_list = [];

			if(respons.tags != undefined){
				var taggedID = respons.tags;//all con tag tag_id
				var condtagsid = FtaggedList = respons.condtagsid;//all con tag id

				var tempTagList = [];

				var totalTagslist = FtempArray = _.orderBy(respons.totalTags, ['title'], ['asc']);

				$.each(totalTagslist, function(k,v){

					if(alltags.indexOf(v.title.toLowerCase()) === -1){
						my_tag_list[v.tag_id] = v.title.toLowerCase();
						alltags.push(v.title.toLowerCase());
						my_tag_id.push(v.tag_id.toString());
					}

					if(condtagsid.indexOf(v.tag_id) !== -1){
						tagListForFileAttach.push(v.title.toLowerCase());
						tagListTitle.push(v.title.toLowerCase());
						tagLsitDetail.push({'cnvtagid':taggedID[condtagsid.indexOf(v.tag_id)],'tagid':v.tag_id,'tagTitle':v.title.toLowerCase(),'roomid':conversationid});

						var design ='<li onclick="removeLevel(\''+taggedID[condtagsid.indexOf(v.tag_id)]+'\',\''+conversationid+'\',\''+v.tag_id+'\')">'+v.title+'<span class="tagcheck" id="level'+taggedID[condtagsid.indexOf(v.tag_id)]+'"></span></li>';

						if(tempTagList.indexOf(v.tag_id) === -1){tempTagList.push(v.tag_id);}
						$('#taggedList').append(design);
					}
				});

				$.each(totalTagslist, function(k,v){
					if(tempTagList.indexOf(v.tag_id) === -1){
						var design ='<li id="tagLi'+v.tag_id+'" onclick="addTagto(\''+v.tag_id+'\',\''+conversationid+'\')">'+v.title+'</li>';
						$('#taggedList').append(design);
					}
				});

				if(tagListTitle.length>0){
					$("#tagItemList").text(tagListTitle.join(','));
					$("#taggedIMG").attr('src','/images/basicAssets/custom_tagged.svg');
				}
			}

			var msg_ids = [];
			$.each(respons.conversation_list, function(k,v){
				msg_ids.push(v.msg_id);
				draw_msg(v);
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
			});

			if (respons.messagestag != undefined) {
				if (respons.messagestag.length > 0) {
					$.each(respons.messagestag, function (k, v) {
						msgIdsFtag.push(v.id);
						if (v.tag_title != undefined) {
							if (v.tag_title !== null) {
								if (v.tag_title.length > 0) {
									$.each(v.tag_title, function (kt, vt) {
										$("#filesTag" + v.message_id).append('<span class="filesTag">' + vt + '</span>')
									});
									$("#filesTag" + v.message_id).show();
									$("#filesTagHolder" + v.message_id).show();
								}
							}
						}
					});
				}
			}

			if($("#sideBarSearch").val() != ""){
				var str = $('#sideBarSearch').val();
				str = str.replace(/<\/?[^>]+(>|$)/g, "");
				$('.user-msg>p').unhighlight();
				$('.user-msg>p').highlight(str);
			}

			scrollToBottom('.chat-page .os-viewport');
			if (need_update_message_seen_list.length > 0) {
				$.ajax({
					url: '/hayven/update_msg_status',
					type: 'POST',
					data: {
						msgid_lists: JSON.stringify(need_update_message_seen_list),
						user_id: user_id
					},
					dataType: 'JSON',
					success: function(res) {
						socket.emit('update_msg_seen', {
							msgid: need_update_message_seen_list,
							senderid: to,
							receiverid: user_id,
							conversation_id: conversation_id
						});
					},
					error: function(err) {
						console.log(err);
					}
				});
			}
		});
		sideBarActiveInactive(event);
		unread_msg_conv_intop();
	}

	if($('.fileSliderBackWrap').is(':visible')){
		$('.fileSliderBackWrap').hide();
	}
	if(windowWidth <= 415){
		$('#hayvenSidebar').hide();
	}
};

var msgIdsFtag = [];

$("#createConvTag").on('blur keyup', function(e) {
	if ((e.which >= 65 && e.which <= 90) || e.which == 189 || e.which == 13){
		var str = $('#createConvTag').val().trim();
		str = str.replace(/<\/?[^>]+(>|$)/g, "");

		if(str != ""){

			$(".taggedList li").each(function() {
				if ($(this).text().toLowerCase().search(str.toLowerCase()) > -1) {
					$(this).show();
				}else {
					$(this).hide();
				}
			});

			$('.taggedList li').unhighlight();
			$('.taggedList li').highlight(str);

			var code = e.keyCode || e.which;

			if (code == 13) { //Enter keycode = 13
				var roomid = $("#createConvTag").attr('data-roomid');
				var tagTitle = $("#createConvTag").val();

				e.preventDefault();

				if(tagTitle != "" ){
					if(roomid == ""){
						toastr["warning"]("You have to select a room or personal conversation", "Warning");
						$(this).val("");
					}else{
						var tagArr = tagTitle.split(',');
						var sendTagarr = [];
						var pTag = [];

						$.each(tagArr, function(k,v){

							if(tagListTitle.indexOf(v.toLowerCase()) === -1){
								if(alltags.indexOf(v.toLowerCase()) === -1){

									sendTagarr.push(v.trim().toLowerCase().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
									tagListForFileAttach.push(v.toLowerCase());
									tagListTitle.push(v.toLowerCase());
									alltags.push(v.toLowerCase());

								}else{

									$('.taggedList li').each(function(tagk,tagv){
										if(v.toLowerCase() == $(tagv).text().toLowerCase()){
											$(tagv).trigger('click');
											$("#tagItemList").text(tagListTitle.join(','));
										}
									});
								}
							}
						});

						$(".taggedList li").each(function() {
							$(this).show();
						});

						$('.taggedList li').unhighlight();
						if(sendTagarr.length>0){
							socket.emit('saveTag', {
								created_by: user_id,
								conversation_id: roomid,
								tagTitle: sendTagarr,
								messgids:attachFileList,
								msgIdsFtag: msgIdsFtag,
								tagType: "CONNECT"
							}, (callBack) => {
								console.log(callBack);
								if (callBack.status) {
									$.each(callBack.tags, function(k,v){
										var design ='<li onclick="removeLevel(\''+v+'\',\''+roomid+'\',\''+callBack.roottags[k]+'\')">'+sendTagarr[k]+'<span class="tagcheck" id="level'+v+'" ></span></li>';

										tagLsitDetail.push({'cnvtagid':v,'tagid':callBack.roottags[k],'tagTitle':sendTagarr[k],'roomid':roomid});
										$('.taggedList').append(design);

										var tag_itemdesign 	= '<div class="added-channel-members">';
										tag_itemdesign 	+= '	<input id="tag_'+callBack.roottags[k]+'" data-tagid="'+callBack.roottags[k]+'" data-tagtitle="'+sendTagarr[k]+'" class="checkToDo" type="checkbox">';
										tag_itemdesign 	+= '<label for="tag_'+callBack.roottags[k]+'">'+sendTagarr[k]+'</label>';
										tag_itemdesign 	+= '</div>';

										$("#taggedItem").append(tag_itemdesign);

										my_tag_list[v] = sendTagarr[k];
										my_tag_id.push(v);
									});

									all_action_for_selected_member();

									if(tagListTitle.length>0){
										$("#taggedIMG").attr('src','/images/basicAssets/custom_tagged.svg');
									}

									if(callBack.mtagsid != undefined){
										if(callBack.mtagsid.length>0){
											$.each(callBack.mtagsid, function(k,v){
												if(msgIdsFtag.indexOf(v) === -1){
													msgIdsFtag.push(v);
												}

											});
										}
									}
									$("#createConvTag").val("");
									$("#createConvTag").focus();
									$("#tagItemList").text(tagListTitle.join(','));

									$(".taggedList li").each(function() {
										$(this).show();
									});

									$('.taggedList li').unhighlight();


								}else{
									if (callBack.err == 'at') {
										toastr["warning"]("\""+tagTitle+"\" already tagged", "Warning");
									}
								}
							});
						}
					}
				}else{
					$("#createConvTag").focus();
				}
			}
		}else{
			$(".taggedList li").each(function() {
				$(this).show();
			});

			$('#createConvTag').val($('#createConvTag').val().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
		}
	}else{

		var str = $('#createConvTag').val().trim();
		str = str.replace(/<\/?[^>]+(>|$)/g, "");

		if(str == ""){
			$(".taggedList li").each(function() {
				$(this).show();
				$(this).unhighlight();
			});
		}

		if(e.which == 8){
			$(".taggedList li").each(function() {
				if ($(this).text().toLowerCase().search(str.toLowerCase()) > -1) {
					$(this).show();
				}else {
					$(this).hide();
				}
			});

			$('.taggedList li').unhighlight();
			$('.taggedList li').highlight(str);
		}

		if(e.which == 32){
			$('#createConvTag').val($('#createConvTag').val().replace(" ",""));
		}else{
			$('#createConvTag').val($('#createConvTag').val().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
		}

	}
});

var removeLevel=(lID,rommID,rootTag)=>{
	var thisText = '';
	var indx = "";

	var sendTagaT = $("#level"+lID).parent('li').text().toLowerCase();

	socket.emit('deleteTag', {
		tagid: lID,
		rommID: rommID,
		msgIdsFtag:msgIdsFtag,
		tagtile:sendTagaT
	}, (callBack) => {
		if(callBack.status){

			$("#level"+lID).parent('li').attr('id','tagLi'+rootTag);
			$("#level"+lID).parent('li').attr('onclick','addTagto(\''+rootTag+'\',\''+rommID+'\')');
			$("#level"+lID).remove();

			$.each(tagLsitDetail, function(tdk,tdv){
				if(rootTag == tdv.tagid && rommID == tdv.roomid){
					thisText = tdv.tagTitle;
					indx = tdk;
				}
			});

			removeA(tagListForFileAttach, thisText);
			removeA(tagListTitle, thisText);
			tagLsitDetail.splice(indx, 1);

			$("#tagItemList").text(tagListTitle.join(','));

			if(tagListTitle.length>0){
				$("#taggedIMG").attr('src','/images/basicAssets/custom_tagged.svg');
			}

			if(tagListTitle.length == 0){
				$("#createConvTag").val("");
				$("#taggedIMG").attr('src','/images/basicAssets/custom_not_tag.svg');
			}
		}
	});
};

var addTagto = (lID,rommID) =>{
	var sendTagarr = [];
	var tagssid = [];
	var sendTagaT = $("#tagLi"+lID).text().toLowerCase();
	socket.emit('saveConvTag', {
		tagid: lID,
		conversation_id: rommID,
		messgids:attachFileList,
		msgIdsFtag:msgIdsFtag,
		tagtile:sendTagaT
	}, (callBack) => {
		if (callBack.status) {

			$("#tagLi"+lID).removeAttr('onclick');
			$("#tagLi"+lID).html($("#tagLi"+lID).text()+'<span class="tagcheck" id="level'+callBack.id+'"></span>');

			$("#tagLi"+lID).attr('onclick','removeLevel(\''+callBack.id+'\',\''+rommID+'\',\''+lID+'\')');
			$("#tagLi"+lID).removeAttr('id');

			tagListForFileAttach.push(sendTagaT.toLowerCase());
			tagListTitle.push(sendTagaT.toLowerCase());
			tagLsitDetail.push({'cnvtagid':callBack.id,'tagid':lID,'tagTitle':sendTagaT,'roomid':rommID});

			if(tagListTitle.length>0){
				$("#tagItemList").text(tagListTitle.join(','));
				$("#taggedIMG").attr('src','/images/basicAssets/custom_tagged.svg');
			}

		}else{
			if (callBack.err == 'at') {
				toastr["warning"]("\""+tagTitle+"\" already tagged", "Warning");
			}
		}
	});
}

var taggedIDOnload = [];
var taggedRoomID = [];
var taggedCheckedID = [];
var taggedCheckedRoom = [];

function getTaggedData(Darray) {
	var promises = [];
	var itemRows = Darray;
	for(var i = 0; i < itemRows.length; i++) {
		var id = itemRows[i];
		var p = new Promise(function(resolve, reject){dbData(id, resolve, reject);});
		promises.push(p);
	}
	Promise.all(promises).then(function(data) {
		recalcTotals(data);
	});
}

function dbData(id, resolve, reject) {
	socket.emit('taggedData', {
    	tagid: id
    }, (callBack) => {
    	if(callBack.status){
    		return resolve(callBack.tagDet);
    	}else{
    		return reject();
    	}

	});
}

function search(tagid, roomid, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].tagid === tagid && myArray[i].roomid === roomid) {
            return myArray[i];
        }
    }
}

function countElement(item,array) {
    var count = 0;
    $.each(array, function(i,v) { if (v === item) count++; });
    return count;
}

var tagged_conv_list = [];

function recalcTotals(data){
	if(data.length>0){
		var dbData = [];

		$.each(data,function(k,v){
			$.each(v,function(kd,vd){
				dbData.push(vd);
			});
		});

		$.each(dbData,function(k,v){
			if(search(v.tag_id, v.conversation_id, taggedCheckedRoom) == undefined ){
				taggedCheckedRoom.push({'tagid':v.tag_id,'roomid':v.conversation_id});
				taggedRoomID.push(v.conversation_id);
			}
		});

		$.each(taggedRoomID,function(k,v){
			if( parseInt(taggedCheckedID.length) == parseInt(countElement(v,taggedRoomID))){
				if(currentConv_list.length > 0){
					if(currentConv_list.indexOf(v) > -1){
						$("#conv"+v).show();
					}
				}else{
					$("#conv"+v).show();
					if(tagged_conv_list.indexOf(v) === -1){
						tagged_conv_list.push(v);
					}
				}
			}
		});

	}
}

$(".checkToDo").click(function(e){

	if(e.target.checked){

		var tagtitle = $("#"+e.target.id).attr('data-tagtitle');
		var tagid = $("#"+e.target.id).attr('data-tagid');

		$('#taggedItem .checkToDo').each(function (i, row) {
		    if($(row).is(':checked')){
		    	if(taggedCheckedID.indexOf($(row).attr('data-tagid')) === -1){
		    		taggedCheckedID.push($(row).attr('data-tagid'));
		    	}
		    }

		});

		$("#channelList li").hide();
		$("#pintul li").hide();
		$("#directListUl li").hide();

		var design 	= '<div class="tag_item" id="'+e.target.id+'_ed"><img src="/images/basicAssets/custom_not_tag.svg" class="tagged"><p>'+tagtitle+'</p><img onclick="removeTagFilter(\''+e.target.id+'\')" src="/images/basicAssets/Close.svg"></div>';

		$('.tagg_list').append(design);
		if($(".tag_item").length > 0){
			$('.tagg_list').show();
		}

		getTaggedData(taggedCheckedID);

	}else{

		$("#"+e.target.id+"_ed").remove();
		var tagid = $("#"+e.target.id).attr('data-tagid');

		$("#channelList li").hide();
		$("#pintul li").hide();
		$("#directListUl li").hide();

		removeA(taggedCheckedID,tagid);


		for(var i=0 ; i<taggedCheckedRoom.length; i++){
		    if(taggedCheckedRoom[i].tagid == tagid)
		        taggedCheckedRoom.splice(i);
		}

		getTaggedData(taggedCheckedID);

		if($(".checkToDo:checked").length == 0){

			taggedCheckedRoom = [];
			taggedRoomID = [];
			taggedCheckedID = [];

			if(currentConv_list.length > 0){
				$("#channelList li").hide();
				$("#pintul li").hide();
				$("#directListUl li").hide();

				$.each(currentConv_list,function(k,v){
					$("#conv"+v).show();
				});

				$.each($('.msgs-form-users'), function() {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				});

				$('.user-msg>p').unhighlight();
				$('.user-msg>p').highlight(searchTagList[searchTagList.length-1].replace("_"," "));

				$.each($('.msgs-form-users'), function() {
					if ($(this).find('.highlight').length == 0) {
						$(this).prev('.msg-separetor').hide();
						$(this).hide();
					} else {
						$(this).prev('.msg-separetor').show();
						$(this).show();
					}
				});

				$("#searchText").val(searchTagList[searchTagList.length-1].replace("_"," "));
				$('#sideBarSearch').val("");
				$('#sideBarSearch').hide();
				$(".side-bar-search-icon").show();
			}else{
				$("#channelList li").show();
				$("#pintul li").show();
				$("#directListUl li").show();
			}
		}
	}
});


var removeTagFilter =(id)=>{

	$("#"+id+"_ed").remove();
	$("#"+id).prop('checked',false);

	var splitID = id.split("_");

	$("#channelList li").hide();
	$("#pintul li").hide();
	$("#directListUl li").hide();

	removeA(taggedCheckedID,splitID[1]);

	for(var i=0 ; i<taggedCheckedRoom.length; i++){
	    if(taggedCheckedRoom[i].tagid == splitID[1])
	        taggedCheckedRoom.splice(i);
	}

	getTaggedData(taggedCheckedID);

	if($(".checkToDo:checked").length == 0){

		taggedCheckedRoom = [];
		taggedRoomID = [];
		taggedCheckedID = [];

		if(currentConv_list.length > 0){
			$("#channelList li").hide();
			$("#pintul li").hide();
			$("#directListUl li").hide();

			$.each(currentConv_list,function(k,v){
				$("#conv"+v).show();
			});

			$.each($('.msgs-form-users'), function() {
				$(this).prev('.msg-separetor').show();
				$(this).show();
			});

			$('.user-msg>p').unhighlight();
			$('.user-msg>p').highlight(searchTagList[searchTagList.length-1].replace("_"," "));

			$.each($('.msgs-form-users'), function() {
				if ($(this).find('.highlight').length == 0) {
					$(this).prev('.msg-separetor').hide();
					$(this).hide();
				} else {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				}
			});

			$("#searchText").val(searchTagList[searchTagList.length-1].replace("_"," "));
			$('#sideBarSearch').val("");
			$('#sideBarSearch').hide();
			$(".side-bar-search-icon").show();
		}else{
			$("#channelList li").show();
			$("#pintul li").show();
			$("#directListUl li").show();
		}
	}
}



var searchTag = (value) => {
	$("#taggedItem .added-channel-members").each(function() {

		if ($(this).find('label').text().toLowerCase().search(value.toLowerCase()) > -1) {
			$(this).show();
		}else {
			$(this).hide();
		}
	});

	$("#taggedItem .added-channel-members").unhighlight();
	$("#taggedItem .added-channel-members").highlight(value);
}

var createDirectmsg = () =>{


	if(directMsgName != "" && directMsgUUID != ""){
		var uuID = directMsgUUID;
		$.ajax({
			type: 'POST',
			data: {
				targetUser: directMsgName,
				targetID: directMsgUUID,
				ecosystem: 'Navigate'
			},
			dataType: 'json',
			url: '/hayven/personalConCreate',
			success: function(data) {
				var immg = directMsgImg.split("/");
				if($('#conv'+data.conversation_id).is(':visible')){
					$('#conv'+data.conversation_id).click();
				}else{
					var design = '<li  data-myid="' + user_id + '" data-createdby="0"  data-octr="' + user_id + '"  onclick="start_conversation(event)" data-id="' +uuID+'" data-subtitle="'+directMsgSubtitle+'" data-conversationtype="personal" data-conversationid="'+data.conversation_id+'" data-name="'+directMsgName+'" data-img="'+immg[3]+'" id="conv'+data.conversation_id+'">';
					design += '<span class="online_'+uuID+' '+(onlineUserList.indexOf(uuID) === -1 ? "offline":"online" ) +'"></span><span class="usersName">'+directMsgName+'</span>';
					design += '<span class="unreadMsgCount"></span> <span class="remove" onclick="removeThisList(event)"></span>';
					design += '</li>';
					$("#directListUl").append(design);
					$('#conv'+data.conversation_id).click();
					var conv_Id = data.conversation_id;
					addSidebarListUser(uuID, conv_Id);
				}
				closeAllPopUp();
				set_default();
			},
			error: function(err) {
				console.log(err);
			}
		});
	}else{
		toastr["warning"]("Unable to start direct message", "Warning");
	}

}

//remove from sidebar hide list user

var addSidebarListUser = (uuID, conv_Id)=>{
	// console.log(uuID);
	// console.log(conv_Id);
	$.ajax({
		type: 'POST',
		data: {
			conversation_id: conv_Id,
			targetID: uuID
		},
		dataType: 'json',
		url: '/hayven/removeHideUserinSidebar',
		success: function (data) {
		}
	});
}

var myconversation_list = [];
var searchTagList = [];
var currentConv_list = [];

$("#sideBarSearch").on('blur keyup', function(e) {

	var str = $('#sideBarSearch').val();
	str = str.replace(/<\/?[^>]+(>|$)/g, "");

	var code = e.keyCode || e.which;

	if (code == 13) { //Enter keycode = 13
		e.preventDefault();

		if(str.length>0){

			$('.side_bar_list_item li').each(function(k,v){
				if( $(v).attr('data-conversationid') != user_id){
					if(myconversation_list.indexOf($(v).attr('data-conversationid')) === -1){
						myconversation_list.push($(v).attr('data-conversationid'));
					}
				}
			});

			var searchConvList = [];

			if(tagged_conv_list.length > 0){
				$.each(tagged_conv_list,function(k,v){
					if(searchConvList.indexOf() === -1){
						searchConvList.push(v);
					}
				});
			}

			if(setFlagConvArray.length > 0){
				$.each(setFlagConvArray,function(k,v){
					if(searchConvList.indexOf() === -1){
						searchConvList.push(v);
					}
				});

				var targettext = 'flag'
			}else{
				var targettext = 'text'
			}

			socket.emit('getAllDataForSearch', {
				conversation_list: (searchConvList.length > 0 ? searchConvList:myconversation_list),
				target_text:str,
				target_filter:targettext,
				user_id:user_id
			}, (callBack) => {

				if(callBack.status){

					if(callBack.data.length > 0){
						$("#channelList li").hide();
						$("#pintul li").hide();
						$("#directListUl li").hide();
						currentConv_list = [];
						$.each(callBack.data,function(k,v){
							$("#conv"+v).show();
							currentConv_list.push(v);
						});

						$('.user-msg>p').unhighlight();
						$('.user-msg>p').highlight(str);

						var c_str = str.replace(/ /g,"_");

						searchTagList = [];
						$('.search_tag').remove();

						//var design 	= '<div class="tag_item search_tag" id="'+c_str+'_ed"><img src="/images/basicAssets/Search.svg"><p>'+str+'</p><img onclick="removesearchFilter(\''+c_str+'\')" src="/images/basicAssets/Close.svg"></div>';
						var design 	= '<div class="tag_item search_tag" id="searchFilter_ed"><img src="/images/basicAssets/Search.svg"><p>'+str+'</p><img onclick="removesearchFilter(\''+str+'\')" src="/images/basicAssets/Close.svg"></div>';

						if(searchTagList.indexOf(c_str) === -1){
							$('.tagg_list').append(design);
							searchTagList.push(c_str);
						}

						if($(".tag_item").length > 0){
							$('.tagg_list').show();
						}

						$.each($('.msgs-form-users'), function() {
							if ($(this).find('.highlight').length == 0) {
								$(this).prev('.msg-separetor').hide();
								$(this).hide();
							} else {
								$(this).prev('.msg-separetor').show();
								$(this).show();
							}
						});

						$("#searchText").val(str);
						$('#sideBarSearch').val("");
						$('#sideBarSearch').hide();
						$(".side-bar-search-icon").show();
					}else{

						$("#channelList li").hide();
						$("#pintul li").hide();
						$("#directListUl li").hide();

						var c_str = str.replace(/ /g,"_");
						searchTagList = [];
						$('.search_tag').remove();

						// var design 	= '<div class="tag_item search_tag" id="'+c_str+'_ed"><img src="/images/basicAssets/Search.svg"><p>'+str+'</p><img onclick="removesearchFilter(\''+c_str+'\')" src="/images/basicAssets/Close.svg"></div>';
						var design 	= '<div class="tag_item search_tag" id="searchFilter_ed"><img src="/images/basicAssets/Search.svg"><p>'+str+'</p><img onclick="removesearchFilter(\''+str+'\')" src="/images/basicAssets/Close.svg"></div>';
						$('.tagg_list').append(design);

						if($(".tag_item").length > 0){
							$('.tagg_list').show();
						}

						searchTagList.push(str);
						$("#searchText").val(str);
						$("#errMsg").text('No Result(s) Found');
						$("#errMsg").show();
					}

				}
			});
		}else{
			$("#channelList li").show();
			$("#directListUl li").show();
			$('.user-msg>p').unhighlight();
			$("#errMsg").text('');
			$("#errMsg").hide();
		}
	}

	// if(str.length == 0){
	// 	$("#channelList li").show();
	// 	$("#directListUl li").show();
	// 	$('.user-msg>p').unhighlight();
	// 	$(".tag_item").remove();

	// 	$("#searchText").val(1);
	// 	$('#sideBarSearch').val("");
	// 	$('#sideBarSearch').hide();
	// 	$(".side-bar-search-icon").show();
	// }
});
/* Flag Filtaring  */
var setFlagConvArray = [];

function flagDataRetrive(){
	$('.side_bar_list_item li').each(function(k,v){
		if( $(v).attr('data-conversationid') != user_id){
			if(myconversation_list.indexOf($(v).attr('data-conversationid')) === -1){
				myconversation_list.push($(v).attr('data-conversationid'));
			}
		}
	});

	var seartTxt = $("#searchText").val();
	socket.emit('getAllDataForSearch', {
		conversation_list: (searchTagList.length > 0 ? currentConv_list:myconversation_list),
		target_text:seartTxt,
		target_filter:'flag',
		user_id:user_id
	}, (callBack) => {
		if(callBack.status){

			if(callBack.data.length > 0){
				$("#channelList li").hide();
				$("#pintul li").hide();
				$("#directListUl li").hide();
				$.each(callBack.data,function(k,v){
					$("#conv"+v).show();
					if(setFlagConvArray.indexOf(v) === -1){
						setFlagConvArray.push(v);
					}
				});

				$.each($('.msgs-form-users'), function() {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				});

				if(currentConv_list.length > 0){
					$('.user-msg>p').unhighlight();
					$('.user-msg>p').highlight(seartTxt);

					$.each($('.msgs-form-users'), function() {
						if ($(this).find('.highlight').length == 0) {
							$(this).prev('.msg-separetor').hide();
							$(this).hide();
						} else {
							$(this).prev('.msg-separetor').show();
							$(this).show();
						}

						if ($(this).find('.flaggedMsg').length == 0) {
							$(this).prev('.msg-separetor').hide();
							$(this).hide();
						}
					});
				}

				$("#searchAction").val(2);

				if(!$("#c_flag_ed").is(':visible')){
					var design 	= '<div class="tag_item" id="c_flag_ed"><img src="/images/basicAssets/Flagged.svg" class="flagged"><p>Flagged</p><img onclick="removeFlagFilter(\'c_flag_ed\')" src="/images/basicAssets/Close.svg"></div>';

					$('.tagg_list').append(design);
				}

				if($(".tag_item").length > 0){
					$('.tagg_list').show();
				}
			}else{
				var design 	= '<div class="tag_item" id="c_flag_ed"><img src="/images/basicAssets/Flagged.svg" class="flagged"><p>Flagged</p><img onclick="removeFlagFilter(\'c_flag_ed\')" src="/images/basicAssets/Close.svg"></div>';
				$('.tagg_list').append(design);
				$("#errMsg").text('No Result(s) Found');
				$("#errMsg").show();
			}

		}
	});
}
var show_flag_msg = () =>{
	if(!$('#filterFlagged_msg').hasClass('activeComFilter')){
		$('#filterFlagged_msg').addClass('activeComFilter');
		if(!$("#c_flag_ed").is(':visible')){
		flagDataRetrive();

		}else{

			$("#errMsg").text('');
			$("#errMsg").hide();

			$("#searchAction").val(1);
			$("#c_flag_ed").remove();

			var seartTxt = $("#searchText").val();

			if(currentConv_list.length > 0){
				$("#channelList li").hide();
				$("#pintul li").hide();
				$("#directListUl li").hide();

				$.each(currentConv_list,function(k,v){
					$("#conv"+v).show();
				});

				$.each($('.msgs-form-users'), function() {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				});

				$('.user-msg>p').unhighlight();
				$('.user-msg>p').highlight(seartTxt);

				$.each($('.msgs-form-users'), function() {
					if ($(this).find('.highlight').length == 0) {
						$(this).prev('.msg-separetor').hide();
						$(this).hide();
					} else {
						$(this).prev('.msg-separetor').show();
						$(this).show();
					}
				});

				$("#searchText").val(seartTxt);
				$('#sideBarSearch').val("");
				$('#sideBarSearch').hide();
				$(".side-bar-search-icon").show();
			}else{

				$("#channelList li").show();
				$("#pintul li").show();
				$("#directListUl li").show();

				if($(".tag_item").length == 0){
					$('.tagg_list').hide();
				}
			}
		}
	}else{
		removeFlagFilter('c_flag_ed');
	}


};

var removeFlagFilter = (serID)=>{

	$("#errMsg").text('');
	$("#errMsg").hide();

	setFlagConvArray = [];
	$("#"+serID).remove();

	$("#searchAction").val(1);

	console.log(currentConv_list.length);

	if(currentConv_list.length > 0){
		var seartTxt = $("#searchText").val();
		if(seartTxt != 1){
			socket.emit('getAllDataForSearch', {
				conversation_list: myconversation_list,
				target_text:seartTxt,
				target_filter:'text',
				user_id:user_id
			}, (callBack) => {

				if(callBack.status){

					currentConv_list = [];
					$.each(callBack.data,function(k,v){
						$("#conv"+v).show();
						currentConv_list.push(v);
					});

					$('.user-msg>p').unhighlight();
					$('.user-msg>p').highlight(seartTxt);

					var c_str = seartTxt.replace(/ /g,"_");

					searchTagList = [];

					if(searchTagList.indexOf(c_str) === -1){
						searchTagList.push(c_str);
					}

					$.each($('.msgs-form-users'), function() {
						if ($(this).find('.highlight').length == 0) {
							$(this).prev('.msg-separetor').hide();
							$(this).hide();
						} else {
							$(this).prev('.msg-separetor').show();
							$(this).show();
						}
					});

					$("#searchText").val(seartTxt);
					$('#sideBarSearch').val("");
					$('#sideBarSearch').hide();
					$(".side-bar-search-icon").show();
				}
			});
		}else{
			$("#channelList li").hide();
			$("#pintul li").hide();
			$("#directListUl li").hide();

			$.each(currentConv_list,function(k,v){
				$("#conv"+v).show();
			});

			$.each($('.msgs-form-users'), function() {
				$(this).prev('.msg-separetor').show();
				$(this).show();
			});

			$('.user-msg>p').unhighlight();
			$('.user-msg>p').highlight(searchTagList[searchTagList.length-1].replace("_"," "));

			$.each($('.msgs-form-users'), function() {
				if ($(this).find('.highlight').length == 0) {
					$(this).prev('.msg-separetor').hide();
					$(this).hide();
				} else {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				}
			});

			$("#searchText").val(searchTagList[searchTagList.length-1].replace("_"," "));
			$('#sideBarSearch').val("");
			$('#sideBarSearch').hide();
			$(".side-bar-search-icon").show();
		}

	}else{

		var seartTxt = $("#searchText").val();

		console.log(seartTxt);

		if(seartTxt != 1){
			socket.emit('getAllDataForSearch', {
				conversation_list: myconversation_list,
				target_text:seartTxt,
				target_filter:'text',
				user_id:user_id
			}, (callBack) => {

				if(callBack.status){
					if(callBack.data.length > 0){

						currentConv_list = [];
						$.each(callBack.data,function(k,v){
							$("#conv"+v).show();
							currentConv_list.push(v);
						});

						$('.user-msg>p').unhighlight();
						$('.user-msg>p').highlight(seartTxt);

						var c_str = seartTxt.replace(/ /g,"_");

						searchTagList = [];

						if(searchTagList.indexOf(c_str) === -1){
							searchTagList.push(c_str);
						}

						$.each($('.msgs-form-users'), function() {
							if ($(this).find('.highlight').length == 0) {
								$(this).prev('.msg-separetor').hide();
								$(this).hide();
							} else {
								$(this).prev('.msg-separetor').show();
								$(this).show();
							}
						});

						$("#searchText").val(seartTxt);
						$('#sideBarSearch').val("");
						$('#sideBarSearch').hide();
						$(".side-bar-search-icon").show();
					}else{

						$("#channelList li").hide();
						$("#pintul li").hide();
						$("#directListUl li").hide();

						var c_str = seartTxt.replace(/ /g,"_");
						searchTagList = [];
						$('.search_tag').remove();

						var design 	= '<div class="tag_item search_tag" id="'+c_str+'_ed"><img src="/images/basicAssets/Search.svg"><p>'+seartTxt+'</p><img onclick="removesearchFilter(\''+c_str+'\')" src="/images/basicAssets/Close.svg"></div>';
						$('.tagg_list').append(design);

						if($(".tag_item").length > 0){
							$('.tagg_list').show();
						}

						searchTagList.push(c_str);
						$("#searchText").val(seartTxt);
						$("#errMsg").text('No Result(s) Found');
						$("#errMsg").show();
					}
				}
			});
		}else{
			$("#channelList li").show();
			$("#pintul li").show();
			$("#directListUl li").show();

			if($(".tag_item").length == 0){
				$('.tagg_list').hide();
			}

			$.each($('.msgs-form-users'), function() {
				$(this).prev('.msg-separetor').show();
				$(this).show();
			});
		}


	}
	$('#filterFlagged_msg').removeClass('activeComFilter');
}

var removesearchFilter = (serID)=>{

	$("#errMsg").text('');
	$("#errMsg").hide();

	//$("#"+serID+"_ed").remove();
	$("#searchFilter_ed").remove();
	removeA(searchTagList,serID);


	if(searchTagList.length > 0){
		var seartTxt = $("#searchText").val();
		socket.emit('getAllDataForSearch', {
			conversation_list: myconversation_list,
			target_text:seartTxt,
			target_filter:'text',
			user_id:user_id
		}, (callBack) => {
			if(callBack.status){

				$("#channelList li").hide();
				$("#pintul li").hide();
				$("#directListUl li").hide();

				currentConv_list = [];
				$.each(callBack.data,function(k,v){
					$("#conv"+v).show();
					currentConv_list.push(v);
				});

				$.each(callBack.data,function(k,v){
					$("#conv"+v).show();
				});

				$.each($('.msgs-form-users'), function() {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				});


				$('.user-msg>p').unhighlight();
				$('.user-msg>p').highlight(searchTagList[searchTagList.length-1].replace("_"," "));

				$.each($('.msgs-form-users'), function() {
					if ($(this).find('.highlight').length == 0) {
						$(this).prev('.msg-separetor').hide();
						$(this).hide();
					} else {
						$(this).prev('.msg-separetor').show();
						$(this).show();
					}
				});

				$("#searchText").val(searchTagList[searchTagList.length-1].replace("_"," "));
				$('#sideBarSearch').val("");
				$('#sideBarSearch').hide();
				$(".side-bar-search-icon").show();
			}
		});
	}else{



		currentConv_list = [];

		if(setFlagConvArray.length > 0){

			// $("#channelList li").hide();
			// $("#pintul li").hide();
			// $("#directListUl li").hide();

			// $.each(setFlagConvArray,function(k,v){
			// 	$("#conv"+v).show();
			// });

			// $("#searchText").val(1);

			// $('.user-msg>p').unhighlight();

			// $.each($('.msgs-form-users'), function() {
			// 	$(this).prev('.msg-separetor').show();
			// 	$(this).show();
			// });

			// $.each($('.msgs-form-users'), function() {
			// 	if ($(this).find('.flaggedMsg').length == 0) {
			// 		$(this).prev('.msg-separetor').hide();
			// 		$(this).hide();
			// 	} else {
			// 		$(this).prev('.msg-separetor').show();
			// 		$(this).show();
			// 	}
			// });

			$("#searchText").val(1);
			$('#sideBarSearch').hide();
			$("#sideBarSearch").val("");

			flagDataRetrive();

		}else{

			if($("#c_flag_ed").is(':visible')){

				$("#searchText").val(1);
				$('#sideBarSearch').hide();
				$("#sideBarSearch").val("");

				flagDataRetrive();
			}else{
				$("#channelList li").show();
				$("#pintul li").show();
				$("#directListUl li").show();

				$("#searchText").val(1);
				$('#sideBarSearch').hide();
				$("#sideBarSearch").val("");

				$(".side-bar-search-icon").show();

				$('.user-msg>p').unhighlight();

				$.each($('.msgs-form-users'), function() {
					$(this).prev('.msg-separetor').show();
					$(this).show();
				});

				if($(".tag_item").length == 0){
					$('.tagg_list').hide();
				}
			}
		}
	}
}

$('#taggedList li').mouseleave(function(){
	console.log($(this).has( "span" ).length);
	if($(this).has( "span" ).length == 0){

	}
	// $(this).find('span').removeClass('remove').addClass('tagcheck');
	$(this).removeAttr('onclick');
});

$('#taggedList li').mouseenter(function(){
	console.log($(this).has( "span" ).length);
	if($(this).has( "span" ).length == 0){
		$(this).find('span').removeClass('tagcheck').addClass('remove');
		$(this).find('span').attr('onclick','deleteTag(\''+$(this).text().toLowerCase()+'\')');
	}
});

var removeUsertag = (event) => {

	var roomid = $('#roomIdDiv').attr('data-roomid');

	$('.side_bar_list_item li').each(function(k,v){
		if( $(v).attr('data-conversationid') != user_id){
			if(myconversation_list.indexOf($(v).attr('data-conversationid')) === -1){
				myconversation_list.push($(v).attr('data-conversationid'));
			}
		}
	});

	socket.emit('getAllTagsforList', {
		myconversation_list:myconversation_list
	}, (callBack) => {

		if(callBack.status){
			var my_tagged_ids = callBack.data;
			$('#memberListBackWrap').show();
			$('#memberListBackWrap').html("");
			$("#roomIdDiv").attr('data-rfu', 'ready');

			var html = '<div class="adminContainer">';
				html += '	<div class="closeBackwrap" onclick="closeAllPopUp()"><img src="/images/basicAssets/close_button.svg"></div>';
				html += '	<div class="label">';
				html += '		<h1 class="label_Title">Tag(s) </h1>';
				html += '	</div>';
				html += '	<input type="text" class="searchMember" placeholder="Search by title" onkeyup="searchtags($(this).val());">';
				html += '	<span class="remove searchClear"></span>';
				html += '	<div class="suggest_Container overlayScrollbars" style="display: block;">';
				html += '		<ul class="suggested-list tagslistFloting">';
				$.each(my_tag_list, function (ky, va) {
					if(my_tagged_ids.indexOf(ky) !== -1){
						html += '		<li id="t_'+ky+'">';
						html += '			<div class="list" id="member' + ky + '">';
						html += '				<h1 class="memberName">' + va + '</h1>';
						html += '				<span class="tagcheck"></span>';
						html += '			</div>';
						html += '		</li>';
					}
				});

				$.each(my_tag_list, function (ky, va) {
					if(my_tagged_ids.indexOf(ky) === -1){
						html += '		<li id="t_'+ky+'">';
						html += '			<div class="list" id="member' + ky + '">';
						html += '				<h1 class="memberName">' + va + '</h1>';
						html += '				<span class="remove" onclick="removeTagsUnused(\''+ky+'\',\''+va+'\');"></span>';
						html += '			</div>';
						html += '		</li>';
					}
				});

				html += '		</ul>';
				html += '	</div>';
				html += '</div>';

			overlayScrollbars();
			$('#memberListBackWrap').append(html);
			searchClearInput();
		}
	});
}


function searchClearInput (){
	$('.remove.searchClear').on('click', function () {
		$('.searchMember').val('');
		$('.adminContainer li').addClass('showEl');
		$('.adminContainer li').show();
		$('.adminContainer li.showEl').removeClass('selected');
		$('.adminContainer li.showEl:first').addClass('selected');
		$('.add-team-member').val('');
		$('#s-l-def li').show();
		$('#s-l-def li').addClass('showEl');
		$('#s-l-def li.showEl').removeClass('selected');
		$('#s-l-def li.showEl:first').addClass('selected');
		$(this).hide();
	});
}
var removeTagsUnused = (id,title) => {

	socket.emit('deleteUnusedTag', {
		tagid: id
	}, (callBack) => {
		if(callBack.status){
			$("#t_"+id).remove();
			var indx = '';

			$.each(tagLsitDetail, function(tdk,tdv){
				if(id == tdv.tagid && title == tdv.tagTitle){
					indx = tdk;
				}
			});

			removeA(tagListForFileAttach, title);
			removeA(tagListTitle, title);
			removeA(alltags, title);
			removeA(my_tag_list, title);
			removeA(my_tag_id, id);

			tagLsitDetail.splice(indx, 1);

			$("#taggedList li").each(function(){
				if($(this).text() == title){
					$(this).remove();
				}
			});
		}
	});
}

var searchtags = (thisval) => {

	$(".tagslistFloting li .memberName").each(function() {

		if ($(this).text().toLowerCase().search(thisval.toLowerCase()) > -1) {
			$(this).closest('li').show();
		}else {
			$(this).closest('li').hide();
		}
	});

	$('.tagslistFloting li .memberName').unhighlight();
	$('.tagslistFloting li .memberName').highlight(thisval);
}

// for creating new todo from msg

function viewCreateTodoPopup() {
	$('#createToDoPopup').show();
}

/* Newly added by mahfuz. For the issue #15 */
var filter_user_list = (event) =>{
	var fullhtml = $(event.target).text();
	var fullstr = "";
	for(var i=0; i<fullhtml.length; i++){
		if(fullhtml.charCodeAt(i) == 173) // it's a special char &shy; non visible in html
			fullstr += '@';
		else
			fullstr += fullhtml.charAt(i);
	};
	var value = fullstr.split('@');
	searchsldefclas(event, value[value.length-1]);
};
var draw_name = () =>{
	if($('#createDirMsgContainer').is(':visible')){
		var name_span = '';
		var all_name = $('.add-direct-member>.selected_member_name');
		$.each(all_name, function(k,v){
			$(v).find('img').remove();
			name_span += '<span class="selected_member_name" data-uuid="'+ $(v).attr('data-uuid') +'" data-img="'+ $(v).attr('data-img') +'"><span class="user_name">' + $(v).text() +'</span><img src="/images/basicAssets/Remove.svg" onClick="remove_this_user(event,\''+ $(v).attr('data-uuid') +'\',\''+ $(v).attr('data-img') +'\',\''+$(v).text()+'\')"></span> &shy;';// it's a special char &shy; non visible in html
		});
		$('.add-direct-member').html(name_span);
	}else if($('#shareMessagePopUp').is(':visible')){
		var name_span = '';
		var all_name = $('.searchInput>.selected_member_name');
		$.each(all_name, function(k,v){
			$(v).find('img').remove();
			name_span += '<span class="selected_member_name" data-uuid="'+ $(v).attr('data-uuid') +'" data-img="'+ $(v).attr('data-img') +'"><span class="user_name">' + $(v).text() +'</span><img src="/images/basicAssets/Remove.svg" onClick="remove_this_user_search(event,\''+ $(v).attr('data-uuid') +'\',\''+ $(v).attr('data-img') +'\',\''+$(v).text()+'\')"></span> &shy;';// it's a special char &shy; non visible in html
		});
		$('.searchInput').html(name_span);
	}
	
	make_content_non_editable('selected_member_name');
}
var remove_this_user = (event,dataID,img_src,name) =>{
	var design  = '<li class="showEl">';
		design += '		<img src="'+img_src+'" class="profile">';
		design += '		<span class="name s-l-def-clas" data-uuid="'+dataID+'">'+name+'</span>';
		design += '		<span class="designation-name">@ Navigate</span>';
		design += '</li>';
	var name = $(event.target).closest('.selected_member_name').text();
	var uuid = $(event.target).closest('.selected_member_name').attr('data-uuid');
	removeA(memberList, name);
	removeA(memberListUUID, uuid);
	$(event.target).closest('.selected_member_name').remove();
	$('#directMsgUserList').append(design);
	popupMouseEnter();
	draw_name();
	// // suggestedListLiClick();
	all_action_for_selected_member();

};
var make_content_non_editable = (classname) =>{
	var spans = document.getElementsByClassName(classname);
	for (var i = 0, len = spans.length; i < len; ++i) {
		spans[i].contentEditable = "false";
	}
	$('.no_of_user_left_to_add>span').text(10 - memberListUUID.length);
};
var check_and_submit_for_new_conv = () =>{
	if(memberListUUID.length==1){
		directMsgUUID = memberListUUID[0];
		createDirectmsg();
	}
	else{
		CreateGroup_without_title();
	}
};

var CreateGroup_without_title = () => {
	memberListUUID.push(user_id);
	var total_member = memberListUUID.length;
	var teamname = user_fullname + ',' + memberList.toString();
	var selectecosystem = $("#conv_key").text().replace('@ ', '');
	var grpprivacy = 'public';
	if (teamname.length > 17) {
		var over_length = "over_length";
	}

	grpprivacy = 'private';

	socket.emit('groupCreateBrdcst', {
		createdby: user_id,
		createdby_name: user_fullname,
		memberList: memberList,
		memberListUUID: memberListUUID,
		adminList: memberList,
		adminListUUID: memberListUUID,
		is_room: '6',
		teamname: teamname,
		selectecosystem: selectecosystem,
		grpprivacy: grpprivacy,
		conv_img: 'feelix.jpg'
	}, function (confirmation) {
		$("#directListUl").prepend('<li  data-myid="' + user_id + '" data-createdby="0"  data-octr="' + user_id + '" onclick="start_conversation(event)" data-subtitle="' + selectecosystem + '" data-id="' + user_id + '" data-conversationtype="group" data-tm= "' + memberListUUID.length + '" data-conversationid="' + confirmation.conversation_id + '" data-name="' + teamname + '" data-img="feelix.jpg"  id="conv' + confirmation.conversation_id + '" class="' + over_length + '"><span class="' + (grpprivacy === 'public' ? "hash" : "lock") + '"></span> <span class="usersName">' + teamname + '</span><span class="remove removeThisGroup" onclick="removeThisGroup(\'' + confirmation.conversation_id + '\')" data-balloon="Click to leave" data-balloon-pos="left" style="display: none;"></span></li>');
		sidebarLiMouseEnter();
		closeRightSection();
		$('#conv' + confirmation.conversation_id).click();
		tooltipForOverLength();
		closeAllPopUp();
		$('#totalMember').html(total_member);
	});

};
/* End of new fn for issue #15 */
