// 'use strict';

/**
 *  User session 
 */
module.exports = class Session {

    /**
     * constructor method
     * 
     * @param {object} socket    Socket
     */
    constructor(socket, userName, user_fullname,joinstatus, roomName,reg_status) {
        this.id = socket.id;
        this.name = userName;
        this.user_fullname = user_fullname;
        this.joinstatus=joinstatus;
        this.reg_status=reg_status;
        this.roomName = roomName;
        this.socket = socket;
        this.outgoingMedia = null;
        this.incomingMedia = {};
        this.iceCandidateQueue = {};
    }

    /**
     * ice candidate for this user
     * @param {object} data 
     * @param {object} candidate 
     */
    addIceCandidate(data, candidate) {
        // self
        if (data.sender === this.name) {
            // have outgoing media.
            if (this.outgoingMedia) {
                // console.log(` add candidate to self : %s`, data.sender);
                this.outgoingMedia.addIceCandidate(candidate);
            } else {
                // save candidate to ice queue.
                // console.log(` still does not have outgoing endpoint for ${data.sender}`);
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        } else {
            // others
            let webRtc = this.incomingMedia[data.sender];
            if (webRtc) {
                // console.log(`%s add candidate to from %s`, this.name, data.sender);
                webRtc.addIceCandidate(candidate);
            } else {
                // console.log(`${this.name} still does not have endpoint for ${data.sender}`);
                if (!this.iceCandidateQueue[data.sender]) {
                    this.iceCandidateQueue[data.sender] = [];
                }
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        }
    }

    /**
     * 
     * @param {*} data 
     */
    sendMessage(data) {
        if (this.socket) {
            // console.log('Sending message server: ' + data);
            this.socket.emit('message_voip', data);
        } else {
            console.error('socket is null');
        }
    }


    setOutgoingMedia(outgoingMedia) {
        this.outgoingMedia = outgoingMedia;
    }

    /**
     * 
     * @param {*} roomName 
     */
    setRoomName(roomName) {
        this.roomName = roomName; 
    }


    /**
     * 
     * @param {*} userName 
     */
    setUserName(userName) {
        this.name = userName;
    }

}