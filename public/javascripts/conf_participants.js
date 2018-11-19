
const PARTICIPANT_MAIN_CLASS = 'participant memdiv';
const PARTICIPANT_CLASS = 'participant memdiv';
const PARTICIPANT_FULLSCREEN = 'participant memdiv pfullscreen';
const PARTICIPANT_OFFSCREEN = 'participant memdiv poffscreen';

/**
 * Creates a video element for a new participant
 *
 * @param {String} name - the name of the new participant, to be used as tag
 *                        name of the video element.
 *                        The tag of the new element will be 'video<name>'
 * @return
 */
function Participant(name) { // Constructor function
	// alert('Participant:'+name.user_fullname);
	// var name=name.name;
	// var user_fullname=name.user_fullname;

	this.name = name.name;
	this.user_fullname=name.user_fullname;
	this.user_img = name.user_img;
	this.join_time = name.join_time;
	// alert(name.join_time);

	var container = document.createElement('div');

	container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	container.id = this.name;

	var container2 = document.createElement('div');
	container2.setAttribute('data-calltype',call_type_route);
	container2.className = "container2div";

	var container_text = document.createElement('div');
	container_text.setAttribute('data-calltype',call_type_route);
	container_text.className = "container2text";

	container.appendChild(container2);
	container.appendChild(container_text);

	// var img_speaker = document.createElement('img');
	// img_speaker.setAttribute('src','/images/call/speaker-on_56px.svg');
	// img_speaker.setAttribute('uid',this.name);
	// img_speaker.setAttribute('data-status','on');
	//
	// img_speaker.onclick = function() {
	// 	var uid=$(this).attr('uid');
	// 	var getstatus=$(this).attr('data-status');
	// 	if(getstatus)
	//
	//
	// 	$('#video-' + uid).prop('muted', true);
	//
	// };

	//img_speaker.className = "img-speaker";

	var span = document.createElement('p');
	span.className = "span-name";

	var timer = document.createElement('p');
	timer.className = "span-timer";

	var video = document.createElement('video');
	video.id = 'video-' + this.name;
	video.autoplay = true;
	video.controls = false;

	if(call_type_route=='audio'){
		video.setAttribute('poster','/images/users/'+this.user_img);
	}

	var rtcPeer;
	var a = moment.utc();
	var b = moment.utc(this.join_time);

	var timerVar = setInterval(countTimer, 1000);
	var totalSeconds = a.diff(b,'seconds');

	function countTimer() {
	   ++totalSeconds;
	   var hour = Math.floor(totalSeconds /3600);
	   var minute = Math.floor((totalSeconds - hour*3600)/60);
	   var seconds = totalSeconds - (hour*3600 + minute*60);

	   timer.innerHTML = hour + ":" + minute + ":" + seconds;
	}

	container2.appendChild(video);


	// if(isPresentMainParticipant()){
		// container_text.appendChild(img_speaker);
		container_text.appendChild(span);
		container_text.appendChild(timer);
		span.appendChild(document.createTextNode(this.user_fullname));
	// }

	document.getElementById('participants').appendChild(container);


	redrawConf();

	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		console.log('Invoking SDP offer callback function'+this.name);
		var msg =  {
				id : "receiveVideoFrom",
				sender : this.name,
				sdpOffer : offerSdp
		};
		sendMessage(msg);
	}


	this.onIceCandidate = function (candidate, wp) {
		  console.log("Local candidate"+ this.name + candidate);

		  var message = {
		    id: 'onIceCandidate',
		    candidate: candidate,
		    sender: this.name
		  };
		  sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {
		console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();

		if(container.parentNode !=null){
			container.parentNode.removeChild(container);
		}

	};


	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
	}


}
