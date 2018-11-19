/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */
// Variables defined in and used from main.js.
/* globals randomString, AppController, sendAsyncUrlRequest, parseJSON */
/* exported params */
'use strict';
  
// Generate random room id and connect.
// var roomServer = 'http://172.16.3.11:8080';
var roomServer = 'http://172.16.0.71:8080';
//var roomServer = 'https://appr.tc';
var loadingParams = {
  errorMessages: [],
  warningMessages: [],
  suggestedRoomId: randomString(9),
  roomServer: roomServer,
  connect: false,
  paramsFunction: function() {
    return new Promise(function(resolve, reject) {
      trace('Initializing; retrieving params from: ' + roomServer + '/params');
      sendAsyncUrlRequest('GET', roomServer + '/params').then(function(result) {
        var serverParams = parseJSON(result);
        var newParams = {};
        if (!serverParams) {
          resolve(newParams);
          return;
        }

        // Convert from server format to expected format.
        newParams.isLoopback = serverParams.is_loopback === 'true';

        if(call_type=='audio'){
          newParams.mediaConstraints = parseJSON("{\"video\": false, \"audio\": true}");
        }else{
          newParams.mediaConstraints = parseJSON(serverParams.media_constraints);

        }

        newParams.offerOptions = parseJSON(serverParams.offer_options);
        newParams.peerConnectionConfig = parseJSON(serverParams.pc_config);
        newParams.peerConnectionConstraints =
            parseJSON(serverParams.pc_constraints);
        newParams.iceServerRequestUrl = serverParams.ice_server_url;
        newParams.iceServerTransports = serverParams.ice_server_transports;
        newParams.wssUrl = serverParams.wss_url;
        newParams.wssPostUrl = serverParams.wss_post_url;
        newParams.versionInfo = parseJSON(serverParams.version_info);
        newParams.messages = serverParams.messages;

        trace('Initializing; parameters from server: ');
        trace(JSON.stringify(newParams));
        resolve(newParams);
      }).catch(function(error) {
        // alert('Outside Network Not Supported');

        if(user_id == caller_id){

          socket.emit('call_reject_network_caller', {
            caller_id: caller_id,
            partner_id: partner_id,
            partner_name:partner_name,
            partner_img:partner_img,

            user_id : user_id,
            sender_name: user_fullname,
            sender_img: user_img,

            msgtext: call_type,
            conversation_id : conversation_id,
            hangup_id: partner_id,
            hangup_name : partner_name,
            hangup_img : partner_img,

            reload_status: true,
            call_status: getCookie('call_status')

          },function(data){
            if(data){
              if(document.getElementById("hangup")){
                window.location.replace('/hayven/chat/'+'personal'+'/'+ partner_id +'/'+ encodeURI(conversation_id) +'/'+ encodeURI(partner_name) +'/' + encodeURI(partner_img));
              }else{
                var msgid = (data.msg_id).replace('TimeUuid: ', '');
                var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
                html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
                $('.message-container').append(html);
                scrollToBottom('.message-container');
                lightbox_call();
              }
            }
          });

        }else{

          socket.emit('call_reject_network_receiver', {
            caller_id: caller_id,
            partner_id: partner_id,
            partner_name:partner_name,
            partner_img:partner_img,

            user_id : caller_id,
            sender_name: caller_name,
            sender_img: caller_img,

            msgtext: call_type,
            conversation_id : conversation_id,
            hangup_id: caller_id,
            hangup_name : caller_name,
            hangup_img : caller_img,

            reload_status: true,
            call_status: getCookie('call_status')

          },function(data){

            if(document.getElementById("hangup")){
              window.location.replace('/hayven/chat/'+'personal'+'/'+ caller_id +'/'+ encodeURI(conversation_id) +'/'+ encodeURI(caller_name) +'/' + encodeURI(caller_img));
            }else{
              var msgid = (data.msg_id).replace('TimeUuid: ', '');
              var html = per_msg_top_call(msgid, moment().format("MMM Do, YYYY"), '', '', data.sender_img, data.sender_name, false);
              html += per_msg_main_body_call(data.msg_text,data.msg_type,data.msg_from,data.sender_name,data.partner_name, '', moment().format('h:mm a'), false);
              $('.message-container').append(html);
              scrollToBottom('.message-container');
              lightbox_call();
            }

          });

        }

        trace('Initializing; error getting params from server: ' +
            error.message);
        reject(error);
      });
    });
  }
};

new AppController(loadingParams);
