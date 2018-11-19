function get_isrefresh(){
	var isRefresh = true;
	var sessionAlive = sessionStorage.getItem("sessionAlive");
	if (sessionAlive === null) {
	    isRefresh = 'new';
	    sessionStorage.setItem("sessionAlive", true);
	}
	return sessionAlive;
}

var obj_config = {
    iceServers: [
        {"urls":"stun:209.59.180.75:3478"},
        {
        	"urls":"turn:209.59.180.75:3478?transport=udp",
        	"username":"turnuser",
        	"credential":"123456"
        },
        {
        	"urls":"turn:209.59.180.75:3478?transport=tcp",
        	"username":"turnuser",
        	"credential":"123456"
        },

        // {"urls":"stun:27.147.195.221:3478"},
        // {
        // 	"urls":"turn:27.147.195.221:3478?transport=udp",
        // 	"username":"turnuser",
        // 	"credential":"123456"
        // },
        // {
        // 	"urls":"turn:27.147.195.221:3478?transport=tcp",
        // 	"username":"turnuser",
        // 	"credential":"123456"
        // },

        // {
        //     "urls": "stun:172.16.0.73:3478"
        // },
        // {
        //     "urls": "turn:172.16.0.73:3478?transport=udp",
        //     "username": "sujon",
        //     "credential": "123456"
        // },
        // {
        //     "urls": "turn:172.16.0.73:3478?transport=tcp",
        //     "username": "sujon",
        //     "credential": "123456"
        // }
    ],
    // iceTransportPolicy: 'relay'
};

var participants = {};
var name;

// setInterval(function(){ console.log(participants) }, 10000);

socket.on('connect', () => {
	console.log('ws connect success');
});

socket.on('refresh_voip', data => {
	// alert('refresh_voip.');
	location.reload();
	// leaveRoomClientConf('no_db','endcall');
});

socket.on('message_voip', parsedMessage => {
    // console.info('Received message: ' + parsedMessage.id);

    switch (parsedMessage.id) {
        case 'existingParticipants':
            onExistingParticipants(parsedMessage);
            break;

        case 'newParticipantArrived':
            onNewParticipant(parsedMessage);
            break;

        case 'participantLeft':
            onParticipantLeft(parsedMessage);
            break;

        case 'receiveVideoAnswer':
            receiveVideoResponse(parsedMessage);
            break;

        case 'iceCandidate':
            participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function(error) {
                if (error) {
                    console.error("Error adding candidate: " + error);
                    return;
                }
            });
            break;
        default:
            console.error('Unrecognized message', parsedMessage);
    }
});

window.onunload = window.onbeforeunload = function() {
	console.log('onbeforeunload');
	leaveRoomClientConf('no_db','refresh');
	setCookieCall('reloadstatus','refresh',1);
	// setCookieCall('timerstatus',totalSeconds,1);


	// socket.disconnect();
};

function registerConf(reg_status='webcam') {
	name = document.getElementById('name').value;
	var roomName = document.getElementById('roomName').value;

	var message = {
		id : 'joinRoom',
		name : name, // uid
		user_fullname : user_fullname,
		roomName : roomName, // cid
		rootImg: user_img,
		rootFullname: user_fullname,
		rootId: user_id,
		arr_participants: arr_participants,
		conversation_type: conversation_type,
		call_type_route: call_type_route,
		reloadstatus: getCookieCall('reloadstatus'),
		isRefresh: get_isrefresh(),
		joinstatus: join_who,
		reg_status: reg_status
	}

	sendMessage(message);
	setCookieCall('reloadstatus','newconf',1);
}

function openScreenShare(){
	if(call_type_route=='video'){
		if(is_chrome){
			getChromeExtensionStatus(function(status) {
				if(status === 'not-installed'){
					window.open('https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk');
				}else{
					leaveRoomClientConf('no_db','screen');
				}
			});
		}else{
			leaveRoomClientConf('no_db','screen');
		}
	}else{
		alert('Not supported in audio call.');
	}


}

function leaveRoomClientConf(paramstatus='yesdb',reloadstatus='no',isRefresh='no') {
	// alert('leaveRoom');
	sendMessage({
		'id': 'leaveRoom',
		'user_id' : user_id,
		'sender_img' : user_img,
		'sender_name' : user_fullname,
		'conversation_id' : conversation_id,
		'msgtext' : 'videoconf',
		'conversation_type':conversation_type,
		'call_duration' : '0',
		'paramstatus': paramstatus,
		'arr_participants' : arr_participants,
		'rootId': user_id,
		'joinstatus': join_who,
		'msg_status' : join_who,
		'reloadstatus' : reloadstatus, // screen/refresh/no
		'isRefresh': get_isrefresh()
	});

	for (var key in participants) {
		participants[key].dispose();
	}

	if(reloadstatus =='screen'){
		var getscreenstatus=$('#screen-share').attr('data-status');
		if(getscreenstatus=='no'){
			$('#screen-share').attr('data-status','yes').attr('src','/images/call/screen-share-off_48px.svg');
			setCookieCall('screenstatus','yes',1);
		}else{
			$('#screen-share').attr('data-status','no').attr('src','/images/call/screen-share-on_48px.svg');
			setCookieCall('screenstatus','no',1);
		}

	}else{
		socket.close();
	}

	if(reloadstatus=='endcall'){
		setCookieCall('reloadstatus','newconf',1);
		window.close();
	}

}

function muteConf(){
	var getstatus_mute=$('#mute-audio').attr('data-status');
	if(getstatus_mute=='no'){
		participants[name].rtcPeer.audioEnabled = false;
		$('#mute-audio').attr('data-status','yes').attr('src','/images/call/mute-on_56px.svg');
		setCookieCall('mutestatus','yes',1);
	}else{
		participants[name].rtcPeer.audioEnabled = true;
		$('#mute-audio').attr('data-status','no').attr('src','/images/call/mute-off_56px.svg');
		setCookieCall('mutestatus','no',1);
	}
}
function toggleVideoConf(){
	var getstatus_video=$('#mute-video').attr('data-status');
	if(getstatus_video=='no'){
		participants[name].rtcPeer.videoEnabled = true;
		$('#mute-video').attr('data-status','yes').attr('src','/images/call/video-on_56px.svg');
		setCookieCall('videostatus','yes',1);
	}else{
		participants[name].rtcPeer.videoEnabled = false;
		$('#mute-video').attr('data-status','no').attr('src','/images/call/video-off_56px.svg');
		setCookieCall('videostatus','no',1);
	}
}

function onNewParticipant(request) {
	console.log('--------onNewParticipant',request);

	receiveVideo({
		name:request.name,
		user_fullname: request.user_fullname,
		user_img: request.user_img,
		join_time: request.join_time
	});
	$('.checkGroupCall[data-uid="'+request.name+'"]').attr('checked','checked');
}

function receiveVideoResponse(result) {
	participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	}else{
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error (error);
		});
	}
}

function onExistingParticipants(msg) {
	var getscreenstatus=$('#screen-share').attr('data-status');

	if(getCookieCall('screenstatus')=='yes'){
		var constraints = {
			audio : false,
			video : true
		};
		var setSource='screen';
		$('#screen-share').attr('data-status','yes').attr('src','/images/call/screen-share-off_48px.svg');

	}else{
		if(call_type_route=='video'){
			var constraints = {
				audio : true,
				video : true
			};
			var setSource='webcam';
			$('#screen-share').attr('data-status','no').attr('src','/images/call/screen-share-on_48px.svg');
		}else if(call_type_route=='audio'){
			var constraints = {
				audio : true,
				video : false
			};
			var setSource='webcam';
			$('#screen-share').attr('data-status','no').attr('src','/images/call/screen-share-on_48px.svg');
		}

	}

	console.log(name + " registered in room: " + room);

	var participant = new Participant({
		name:name,
		user_fullname:user_fullname,
		user_img: user_img,
		join_time: msg.join_time
	});
	participants[name] = participant;

	var video = participant.getVideoElement();

	var options = {
	      localVideo: video,
	      mediaConstraints: constraints,
	      sendSource: setSource,
	      configuration :  obj_config,
	      onicecandidate: participant.onIceCandidate.bind(participant),

    }


	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
		function (error) {
		  if(error) {return console.error(error);}
		  this.generateOffer(participant.offerToReceiveVideo.bind(participant));
	});

 //    if(getCookieCall('mutestatus')=='yes'){
	// 	participant.rtcPeer.audioEnabled = false;
	// 	$('#mute-audio').attr('data-status','yes').attr('src','/images/call/mute-on_56px.svg');

	// }else{
	// 	participant.rtcPeer.audioEnabled = true;
	// 	$('#mute-audio').attr('data-status','no').attr('src','/images/call/mute-off_56px.svg');

	// }

	msg.data.forEach(receiveVideo);
}

// sender == username
function receiveVideo(sender) {
	// alert('receiveVideo:'+JSON.stringify(sender));
	var participant = new Participant(sender);
	participants[sender.name] = participant;
	var video = participant.getVideoElement();

	var options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant),
      // sendSource: 'screen',
      configuration : obj_config
    }

	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
		function (error) {
			if(error) {
				return console.error(error);
			}
			this.generateOffer(participant.offerToReceiveVideo.bind(participant));
		}
	);
}

function onParticipantLeft(request) {
	console.log('Participant ' + request.name + ' left');
	var participant = participants[request.name];
	participant.dispose();
	delete participants[request.name];
	if($('.addParticipantPopup').is(":visible")){
		$('.checkGroupCall[data-uid="'+request.name+'"]').removeAttr('checked');
	}

	redrawConf();
}

function sendMessage(message) {
	// console.log('Sending message client: ' + message.id);
	socket.emit('message_voip', message);
}
