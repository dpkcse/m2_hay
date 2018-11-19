var app = require('express');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var url = require('url');
var kurento = require('kurento-client');
var minimst = require('minimist');
var { Session, Register, argvConf } = require('../libav');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var userRegister = new Register();
var rooms = {};

// var urlMetadata = require('url-metadata');
// var ogs = require('open-graph-scraper');
const metascraper = require('metascraper');
const got = require('got');
var router = app.Router();

var {models} = require('./../config/db/express-cassandra');

// console.log('argvConf',argvConf);

let asUrl = url.parse(argvConf.as_uri);
let port = asUrl.port;
let wsUrl = url.parse(argvConf.ws_uri).href;

function joinRoomConf(socket, message, callback) {
    // get room
    //message.roomName : conversation_id
    getRoomConf(message.roomName, (error, room) => {
        if (error) {callback(error);return;}
        // join user to room
        // message.name : user_name
        // console.log('----before join',Object.keys(room.participants).length);
        joinConf(socket, room, message.name, message.user_fullname,message.joinstatus,message, (err, user) => {
            if (err) {callback(err);return;}
            console.log(`join success : ${user.name}`); // bug fix
            // console.log('----after join',Object.keys(room.participants).length);
            callback();
        });
    });
}

/**
 * Get room. Creates room if room does not exists
 * @param {string} roomName
 */
function getRoomConf(roomName, callback) {
    let room = rooms[roomName];

    if (room == null) {
        console.log(`create new room : ${roomName}`);
        getKurentoClient((error, kurentoClient) => {
            if (error) { return callback(error);}

            // console.log('------------getKurentoClient',kurentoClient);
            kurentoClient.create('MediaPipeline', (error, pipeline) => {
                if (error) { return callback(error); }

                room = {
                    name: roomName,
                    pipeline: pipeline,
                    participants: {},
                    kurentoClient: kurentoClient
                };

                rooms[roomName] = room;
                callback(null, room);
            });
        });
    } else {
        console.log(`get existing room : ${roomName}`);
        callback(null, room);
    }
}

function getRoomInfo(roomName, callback) {
    let room = rooms[roomName];
    // console.log('-get room info',room);
    callback(null, room);

}

function getRoomInfoUser(userName, callback) {
  // let room = rooms[roomName];
  var userbusy=false;

  _.forEach(rooms, function(room){
    let usersInRoom = room.participants;

    for (let i in usersInRoom) {
      if (usersInRoom[i].name == userName) {
        userbusy = true;
      }
    }
  });

  callback(null, userbusy);

}
/**
 * join call room
    // userName = user_name
    // room.name = conversation_id

 */
function joinConf(socket, room, userName, user_fullname,joinstatus,message, callback) {
    // add user to session
    let userSession = new Session(socket,userName,user_fullname,joinstatus,room.name,message.reg_status,message.rootImg);
    console.log('===**********************>userSession',userSession);
    userRegister.register(userSession);  // save userSession to register

    room.pipeline.create('WebRtcEndpoint', (error, outgoingMedia) => {
        if (error) {
            console.error('no participant in room');
            if (Object.keys(room.participants).length === 0) {
                room.pipeline.release();
            }
            return callback(error);
        }

        // else
        outgoingMedia.setMaxVideoRecvBandwidth(300);
        outgoingMedia.setMinVideoRecvBandwidth(100);
        // console.log('###### outgoingMedia');
        // console.log(JSON.stringify(outgoingMedia));
        // WebRtcEndpoint.setTurnUrl('turnuser:123456@27.147.195.221:3478');
        // console.log('#######getTurnUrl',WebRtcEndpoint.getTurnUrl());
        userSession.setOutgoingMedia(outgoingMedia);

        // add ice candidate the get sent before endpoint is established
        // socket.id : room iceCandidate Queue
        let iceCandidateQueue = userSession.iceCandidateQueue[userSession.name];
        if (iceCandidateQueue) {
            while (iceCandidateQueue.length) {
                let message = iceCandidateQueue.shift();
                console.error(`user: ${userSession.id} collect candidate for outgoing media`);
                userSession.outgoingMedia.addIceCandidate(message.candidate);
            }
        }

        // ICE listener
        userSession.outgoingMedia.on('OnIceCandidate', event => {
            // console.log(`generate outgoing candidate ${userSession.id}`);
            let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
            userSession.sendMessage({
                id: 'iceCandidate',
                name: userSession.name,
                candidate: candidate
            });
        });


        let usersInRoom = room.participants;
        // when initiator (1st hit) : empty
        // notify other user that new user is joing
        for (let i in usersInRoom) { // not for first time (init)
            if (usersInRoom[i].name != userSession.name) {
                usersInRoom[i].sendMessage({
                    id: 'newParticipantArrived',
                    name: userSession.name,
                    user_fullname: userSession.user_fullname,
                    reg_status:  userSession.reg_status,
                    user_img: userSession.user_img,
                    join_time: userSession.join_time

                });
            }
        }
        // send list of current user in the room to current participant
        let existingUsers = [];

        for (let i in usersInRoom) { // same loop
            if (usersInRoom[i].name != userSession.name) { // same condition
                existingUsers.push({
                    name: usersInRoom[i].name,
                    user_fullname: usersInRoom[i].user_fullname,
                    user_img : usersInRoom[i].user_img,
                    join_time: usersInRoom[i].join_time
                });
            }
        }

        userSession.sendMessage({
            id: 'existingParticipants',
            data: existingUsers, // 1st hit : 0
            roomName: room.name,
            reg_status: userSession.reg_status,
            join_time: userSession.join_time
        });

        // register user to room
        room.participants[userSession.name] = userSession;

        // console.log('----------room.participants',Object.keys(room.participants).length);

        callback(null, userSession);
    });
}


function receiveVideoFrom(socket, senderName, sdpOffer, callback) {
    let userSession = userRegister.getById(socket.id);
    let sender = userRegister.getByName(senderName);

    if (!userSession){
        console.log('--------- bug receiveVideoFrom',userSession,sender);
        return; // bug fix
    }

    getEndpointForUser(userSession, sender, (error, endpoint) => {
        if (error) {
            console.error(error);
            callback(error);
        }

        endpoint.processOffer(sdpOffer, (error, sdpAnswer) => {
            console.log(`process offer from ${sender.name} to ${userSession.name}`);
            if (error) {
                return callback(error);
            }
            let data = {
                id: 'receiveVideoAnswer',
                name: sender.name,
                sdpAnswer: sdpAnswer
            };
            userSession.sendMessage(data);

            endpoint.gatherCandidates(error => {
                if (error) {
                    return callback(error);
                }
            });

            return callback(null, sdpAnswer);
        });
    });
}

function leaveRoomConf(socket,message, callback) {

    var userSession = userRegister.getById(socket.id);

    if (!userSession) return;

    var room = rooms[userSession.roomName];

    if(!room) return;

    console.log('notify all user that ' + userSession.name + ' is leaving the room ' + room.name);

    var usersInRoom = room.participants;

    // release outgoing media for the leaving user
    delete usersInRoom[userSession.name];

    if(userSession.outgoingMedia){
        userSession.outgoingMedia.release();
    }

    // release incoming media for the leaving user
    for (var i in userSession.incomingMedia) {
        if(userSession.incomingMedia[i]){
            userSession.incomingMedia[i].release();
            delete userSession.incomingMedia[i];
        }

    }

    var data = {
        id: 'participantLeft',
        name: userSession.name
    };

    for (var i in usersInRoom) {
        var user = usersInRoom[i];
        // release viewer from this
        if(user.incomingMedia[userSession.name]){
          user.incomingMedia[userSession.name].release();
          delete user.incomingMedia[userSession.name];
        }
        // notify all user in the room
        user.sendMessage(data);
    }

    // Release pipeline and delete room when room is empty
    if (Object.keys(room.participants).length == 0) {
        // console.log('-----------delete room',message.leavestatus);
        room.pipeline.release();
        delete rooms[userSession.roomName];
    }

    delete userSession.roomName;
    callback(null);
}

function leaveRoomConfbyId(socketid,message, callback) {
    console.log('leaveRoomConfbyId',socketid);
    var userSession = userRegister.getById(socketid);

    if (!userSession) return;

    var room = rooms[userSession.roomName];

    if(!room) return;

    console.log('notify all user that ' + userSession.name + ' is leaving the room ' + room.name);

    var usersInRoom = room.participants;

    // release outgoing media for the leaving user
    delete usersInRoom[userSession.name];

    if(userSession.outgoingMedia){
        userSession.outgoingMedia.release();
    }

    // release incoming media for the leaving user
    for (var i in userSession.incomingMedia) {
        if(userSession.incomingMedia[i]){
            userSession.incomingMedia[i].release();
            delete userSession.incomingMedia[i];
        }

    }

    var data = {
        id: 'participantLeft',
        name: userSession.name
    };

    for (var i in usersInRoom) {
        var user = usersInRoom[i];
        // release viewer from this
        if(user.incomingMedia[userSession.name]){
          user.incomingMedia[userSession.name].release();
          delete user.incomingMedia[userSession.name];
        }


        // notify all user in the room
        user.sendMessage(data);
    }


    // Release pipeline and delete room when room is empty
    if (Object.keys(room.participants).length == 0) {
        // console.log('-----------delete room',message.leavestatus);
        room.pipeline.release();
        delete rooms[userSession.roomName];
    }

    delete userSession.roomName;
}


/**
 * getKurento Client
 *
 * @param {function} callback
 */
function getKurentoClient(callback) {
    kurento(wsUrl, (error, kurentoClient) => {
        if (error) {
            let message = `Could not find media server at address ${wsUrl}`;
            return callback(`${message} . Exiting with error ${error}`);
        }
        // console.log('getKurentoClient ok');
        callback(null, kurentoClient);
    });
}

/**
 *  Add ICE candidate, required for WebRTC calls
 *
 * @param {*} socket
 * @param {*} message
 * @param {*} callback
 */
function addIceCandidate(socket, message, callback) {
    let user = userRegister.getById(socket.id);
    if (user != null) {
        // assign type to IceCandidate
        let candidate = kurento.register.complexTypes.IceCandidate(message.candidate);
        user.addIceCandidate(message, candidate);
        callback();
    } else {
        console.error(`ice candidate with no user receive : ${message.sender}`);
        callback(new Error("addIceCandidate failed"));
    }
}


/**
 *
 * @param {*} userSession
 * @param {*} sender
 * @param {*} callback
 */
function getEndpointForUser(userSession, sender, callback) {

    if (userSession.name === sender.name) {
        return callback(null, userSession.outgoingMedia);
    }

    let incoming = userSession.incomingMedia[sender.name];

    if (incoming == null) {
        console.log(`user : ${userSession.id} create endpoint to receive video from : ${sender.id}`);
        getRoomConf(userSession.roomName, (error, room) => {
            if (error) {
                console.error(error);
                callback(error);
                return;
            }
            room.pipeline.create('WebRtcEndpoint', (error, incoming) => {
                if (error) {
                    if (Object.keys(room.participants).length === 0) {
                        room.pipeline.release();
                    }
                    console.error('error: ' + error);
                    callback(error);
                    return;
                }

                console.log(`######## user: ${userSession.name} successfully create pipeline`);
                // console.log(JSON.stringify(incoming));
                incoming.setMaxVideoRecvBandwidth(300);
                incoming.setMinVideoRecvBandwidth(100);
                 // WebRtcEndpoint.setTurnUrl('sujon:123456@172.16.0.73:3478');
                 // console.log('########## getTurnUrl',WebRtcEndpoint.getTurnUrl());
                userSession.incomingMedia[sender.name] = incoming;

                // add ice candidate the get sent before endpoints is establlished
                let iceCandidateQueue = userSession.iceCandidateQueue[sender.name];
                if (iceCandidateQueue) {
                    while (iceCandidateQueue.length) {
                        let message = iceCandidateQueue.shift();
                        // console.log(`user: ${userSession.name} collect candidate for ${message.data.sender}`);
                        incoming.addIceCandidate(message.candidate);
                    }
                }

                incoming.on('OnIceCandidate', event => {
                    // ka ka ka ka ka
                    // console.log(`generate incoming media candidate: ${userSession.id} from ${sender.id}`);
                    let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                    userSession.sendMessage({
                        id: 'iceCandidate',
                        name: sender.name,
                        candidate: candidate
                    });
                });

                sender.outgoingMedia.connect(incoming, error => {
                    if (error) {
                        console.log(error);
                        callback(error);
                        return;
                    }
                    callback(null, incoming);
                });
            });
        })
    } else {
        console.log(`user: ${userSession.name} get existing endpoint to receive video from: ${sender.name}`);
        sender.outgoingMedia.connect(incoming, error => {
            if (error) {
                callback(error);
            }
            callback(null, incoming);
        });
    }
}

module.exports = {
  getEndpointForUser,
  addIceCandidate,
  getKurentoClient,
  leaveRoomConf,
  leaveRoomConfbyId,
  receiveVideoFrom,
  joinConf,
  getRoomConf,
  getRoomInfo,
  getRoomInfoUser,
  joinRoomConf
};
