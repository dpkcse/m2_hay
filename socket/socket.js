var _ = require('lodash');

module.exports = function (io) {
  var app = require('express');
  var router = app.Router();
  var {
    generateMessage,
    sendNewMsg,
    sendCallMsg,
    sendBusyMsg,
    getUserIsBusy,
    update_one_msg_status_add_viewer,
    hasMessageThisTag,
    deleteThisTag,
    replyId,
    thread_reply_update,
    find_reply_list,
    url_preview,
    readOldMessage,
    getAllUnreadConv,
    update_delivered_if_need,
    getAllSearchMsg,
    get_one_msg,
    check_reac_emoji_list,
    update_userbusy,
    get_conversation_info,
    connect_msgUpdate
  } = require('./../utils/message');
  var {
    saveConversation,
    findConversationHistory,
    createGroup,
    createPersonalConv,
    findConvDetail,
    saveNewGroup,
    updateGroupName,
    updateKeySpace,
    updatePrivecy,
    updateRoomimg,
    saveTag,
    findtag,
    saveConTag,
    saveConvD,
    getAllTagData,
    filesTag,
    getAllTagsforList,
    deleteUnusedTag
  } = require('./../utils/conversation');

  var { file_unlink } = require('./../utils/files');

  var {
    createActivity,
    getActivityDetail,
    insertChecklist,
    getChecklist,
    updateActivity,
    todosearch,
    deleteCheclList,
    getAllActivityhMsg,
    get_myTags,
    get_messages_tag,
    getAllCompletedActivity,
    draftActivity,
    updateDraftActivity,
    activityAccepted,
    allActivityMsg,
    saveCokkeiFiles,
    UpdatecokkieFiles
  } = require('./../utils/todo');

  var { hayvenjs } = require('./../utils/hayvenjs');
  var { todo_msg } = require('./../utils/todo_msg');

  // added by sujon
  var {
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
  } = require('./../utils/voice_video');

  var timerConf = {};
  var reloadConf = {};

  io.on('connection', function (socket) {
    socket.join('1');
    // socket.join('bde4b452-0734-4aaf-b5c1-09cc12d7ab64');
    socket.on('login', function (userdata) {
      socket.join('navigate_2018_902770');
      socket.join(userdata.from);

      // if(typeof userdata.room_groups !== 'undefined'){
      //   _.forEach(userdata.room_groups, function(v, k){
      //     socket.join(v.conversation_id);
      //   });
      // }

      socket.handshake.session.userdata = userdata;
      socket.handshake.session.save();

      if (alluserlist.indexOf(userdata.from) != -1) {
        console.log(userdata.text + ' is connected into socket');
      } else {
        alluserlist.push(userdata.from);
      }
      // console.log(alluserlist);
      // var room = io.sockets.adapter.rooms['navigate_2018_902770'];
      // room.length
      socket.emit('online_user_list', generateMessage('Admin', alluserlist)); // this emit receive only who is login
      socket.broadcast.emit('new_user_notification', generateMessage('Admin', socket.handshake.session.userdata)); // this emit receive all users except me

      // if (reloadConf[userdata.from]) {
      //   console.log('reloading...................................');
      //   io.to(userdata.from).emit('refresh_voip', 'reload');
      //   delete reloadConf[socket.handshake.session.userdata.from];
      // }
    });

    socket.on('disconnect', function () {
      console.log('disconnect*********************',socket.handshake.session.confdata);
      if (socket.handshake.session.confdata) {
        getRoomInfo(socket.handshake.session.confdata.roomName, (error, room) => {
          if (room == null) {

          } else {
            let usersInRoom = room.participants;

            for (let i in usersInRoom) {
              if (usersInRoom[i].name == socket.handshake.session.userdata.from) {
                reloadConf[socket.handshake.session.userdata.from] = socket.handshake.session.confdata;
                console.log('=====> reload data set');
                leaveRoomConfbyId(socket.id);
              }
            }

          }
        });
      }else{
        io.sockets.in('navigate_2018_902770').emit('logout', { userdata: socket.handshake.session.userdata });
        if (socket.handshake.session.userdata) {
          alluserlist = alluserlist.filter(function (el) {
            return el !== socket.handshake.session.userdata.from;
          });
          delete socket.handshake.session.userdata;
          socket.handshake.session.save();
        }

      }

    });

    socket.on('o2otoGroup', function (message, callback) {
      if (message.currentConvID != "") {
        findConvDetail(message.currentConvID, (result, err) => {
          if (err) { throw err; }
          else {
            console.log(result);
            var previousList = result.conversationDetail[0].participants;
            var newMember = [message.targetUserID];
            var conversationMemList = previousList.concat(newMember);
            saveNewGroup(conversationMemList, message.ecosystem, message.crtUserID.toString(), (result, err) => {
              if (err) { throw err; }
              else {
                callback(result);
              }
            });
          }
        });
      }
    });

    socket.on('saveGroupName', function (message, callback) {
      if (message.currentConvID != "") {
        updateGroupName(message.conversation_id, message.newGroupname, (result, err) => {
          if (err) {
            throw err;
          } else {
            callback(result);
          }
        });
      }
    });


    socket.on('sendMessage', function (message, callback) {
      if (message.is_room === false) {
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(72, err);
            } else {
              if (result.status) {
                if (socket.handshake.session.userdata.from.toString() !== message.to.toString()) {
                  io.to(message.to).emit('newMessage', {
                    msg_id: result.res,
                    msg_from: socket.handshake.session.userdata.from,
                    msg_text: message.text,
                    msg_sender_name: message.sender_name,
                    msg_sender_img: message.sender_img,
                    msg_attach_files: message.attach_files,
                    msg_conv_id: message.conversation_id,
                    msg_thread_root_id: message.thread_root_id
                  });
                }
                // console.log('socketjs 38', result);
                callback(result);
              } else {
                console.log(result);
              }
            }
          });
      }
      else if (message.is_room === true) {
        // console.log('something wrong!!!');
        // io.to('navigate_2018_902770').emit('newMessage', generateMessage(socket.handshake.session.userdata.from, message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img));
        // This is temporary group message.
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(err);
            } else {
              if (result.status) {
                socket.broadcast.emit('newMessage', {
                  msg_id: result.res,
                  msg_from: message.to,
                  msg_text: message.text,
                  msg_sender_name: message.sender_name,
                  msg_sender_img: message.sender_img,
                  msg_attach_files: message.attach_files,
                  msg_conv_id: message.conversation_id,
                  msg_thread_root_id: message.thread_root_id
                }); // this emit receive all users except me
                // io.to(message.conversation_id).emit('newMessage', {msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id}); // this emit receive all users except me
                // console.log({msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id});
                callback(result);
              } else {
                console.log(result);
              }
            }
          });
      }
    });

    /*for mobile*/
    socket.on('sendMessageFromMobile', function (message, callback) {
      console.log(119, message);
      if (message.is_room === false) {
        sendNewMsg(message.sender_id,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(127, err);
            } else {
              if (result.status) {
                  io.to(message.to).emit('newMessage', result);
                  io.to(message.sender_id).emit('newMessage', result);
              } else {
                console.log(result);
              }
            }
          });
      }
      else if (message.is_room === true) {
        // console.log('something wrong!!!');
        // io.to('navigate_2018_902770').emit('newMessage', generateMessage(socket.handshake.session.userdata.from, message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img));
        // This is temporary group message.
        sendNewMsg(message.sender_id,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(err);
            } else {
              if (result.status) {
                socket.broadcast.emit('newMessage', result); // this emit receive all users except me
                // io.to(message.conversation_id).emit('newMessage', {msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id}); // this emit receive all users except me
                // console.log({msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id});
                callback(result);
              } else {
                console.log(result);
              }
            }
          });
      }
    });

    socket.on('msg_url2preview', function (data, callback) {
      url_preview(data, (res) => {
        if (res.status) {
          socket.broadcast.emit('url2preview', res.body);
          callback(res.body);
        } else {
          console.log('socket 160', res);
        }
      });
    });

    socket.on('unlink_file', function (data) {
      file_unlink(data);
    });

    socket.on('seen_emit', function (data) {
      // console.log(260, data);
      update_one_msg_status_add_viewer(data.msgid, data.receiverid, data.conversation_id, (result) => {
        if (result.status)
          io.to(data.senderid).emit('receive_emit', data.msgid);
      });
    });

    socket.on('update_msg_seen', function (data) {
      io.to(data.senderid).emit('update_msg_receive_seen', data);
    });

    socket.on('one_user_deleted_this', function (data) {
      socket.broadcast.emit('delete_from_all', data);
    });

    socket.on('update_thread_count', function (data) {
      thread_reply_update(data, (result) => {
        if (result.status) {
          console.log('socket update_thread_count update status = ', result);
          socket.broadcast.emit('update_thread_counter', data);
          // callback(_.toString(result.result));
        } else {
          console.log('socket 130', result);
          // callback(result);
        }
      });
    });

    socket.on('find_reply', function (data, callback) {
      find_reply_list(data.msg_id, data.conversation_id, (result) => {
        callback(result);
      });
    });

    socket.on('addNewMeberToGroup', function (message, callback) {
      io.to(message.userID).emit('popUpgroupblock', {
        senderName: message.senderName,
        userID: message.userID,
        userName: message.userName,
        userImg: message.userImg,
        cnvID: message.cnvID,
        desig: message.desig,
        groupName: message.groupName
      });
    });

    socket.on('shareThisMsg', function (data, callback) {
      createPersonalConv(data.myID, data.targetID, 'personal', (result, err) => {
        if (err) {
          if (err) throw err;
        } else if (result.status) {
          callback(result);
        } else {
          console.log(result);
        }
      });
    });

    socket.on('shareMessage', function (data, callback) {
      readOldMessage(data, (result, error) => {
        // console.log(result);
        if (result.status) {
          io.to(data.target_user).emit('newMessage', {
            msg_id: result.res,
            msg_from: data.sender_id,
            msg_text: result.message_data.msg_body,
            msg_sender_name: data.sender_name,
            msg_sender_img: data.sender_img,
            msg_attach_files: {
              attch_imgfile: result.message_data.attch_imgfile,
              attch_audiofile: result.message_data.attch_audiofile,
              attch_videofile: result.message_data.attch_videofile,
              attch_otherfile: result.message_data.attch_otherfile
            },
            msg_conv_id: data.conversation_id,
            msg_thread_root_id: false
          });
          callback(result);
        } else {
          callback({ status: false });
        }
      });
    });

    socket.on('messageTagSave', function (data, callback) {
      hasMessageThisTag(data.conversation_id, data.msg_id, data.userid, data.tagTitle, (respond, error) => {
        if (error) {
          if (error) throw error;
        } else if (respond.status) {
          callback({ status: true, respond: respond });
        } else {
          callback({ status: false, respond: respond });
        }
      });
    });

    socket.on('deleteTag', function (data, callback) {
      if (data.tagid != undefined && data.tagid != "") {
        deleteThisTag(data.msgIdsFtag, data.tagtile, data.tagid, data.rommID, (respond, error) => {
          if (error) {
            if (error) throw error;
          } else if (respond.status) {
            callback({ status: true, respond: respond });
          } else {
            callback({ status: false, respond: respond });
          }
        });
      }
    });



    socket.on('groupCreateBrdcst', function (message, callback) {

      var str = message.memberList;
      var strUUID = message.memberListUUID;
      var adminList = message.adminList;
      var adminListUUID = message.adminListUUID;
      var memberlist = str.concat(adminList);
      var memberlistUUID = strUUID.concat(adminListUUID);
      var joinMenber = memberlist.join(',');
      if (message.teamname !== "") {
        createGroup(adminListUUID, memberlistUUID, message.teamname, message.createdby, message.selectecosystem, message.grpprivacy, message.conv_img, (result, err) => {
          if (err) {
            console.log(err);
          } else {
            if (result.status) {
              socket.broadcast.emit('groupCreate', {
                room_id: result.conversation_id.toString(),
                memberList: strUUID,
                adminList: adminListUUID,
                selectecosystem: message.selectecosystem,
                teamname: message.teamname,
                grpprivacy: message.grpprivacy,
                conv_img: message.conv_img,
                createdby: message.createdby_name,
                createdbyid: message.createdby

              });
              callback(result);
            } else {
              console.log(result);
            }
          }
        });
      }
    });

    socket.on('groupMemberAdd', function (message, callback) {
      socket.broadcast.emit('groupCreate', {
        room_id: message.room_id,
        memberList: message.memberList,
        selectecosystem: message.selectecosystem,
        teamname: message.teamname,
        grpprivacy: message.grpprivacy,
        createdby: message.createdby_name,
        createdbyid: message.createdby,
        targetID: message.targetID
      });
    });

    socket.on('groupMemberDelete', function (message, callback) {
      socket.broadcast.emit('removefromGroup', {
        room_id: message.room_id,
        memberList: message.memberList,
        selectecosystem: message.selectecosystem,
        teamname: message.teamname,
        grpprivacy: message.grpprivacy,
        createdby: message.createdby_name,
        createdbyid: message.createdby,
        targetID: message.targetID
      });
    });

    socket.on('client_typing', function (message) {
      // console.log('line 112 room_id= ', message.room_id);
      // console.log('line 113 sender_id= ', message.sender_id);
      // console.log('line 114 conversation_id ', message.conversation_id);
      if (message.room_id == message.sender_id) {
        io.to(message.conversation_id).emit('server_typing_emit', { display: message.display, room_id: message.room_id, sender_id: message.sender_id, img: message.sender_img, name: message.sender_name, conversation_id: message.conversation_id, msg_id: message.msg_id, reply: message.reply });
      } else {
        io.to(message.room_id).emit('server_typing_emit', { display: message.display, room_id: message.room_id, sender_id: message.sender_id, img: message.sender_img, name: message.sender_name, conversation_id: message.conversation_id, msg_id: message.msg_id, reply: message.reply });
      }
      // socket.broadcast.emit('typingBroadcast', {display: message.display, msgsenderroom: message.sendto, img: message.sender_img, name: message.sender_name});
    });

    socket.on('emoji_emit', function (data) {
      // console.log(data);
      io.to(data.room_id).emit('emoji_on_emit', { room_id: data.room_id, msg_id: data.msgid, emoji_name: data.emoji_name, count: data.count, sender_id: data.sender_id });
    });

    socket.on('group_join', function (group) {
      socket.join(group.group_id);
    });


    /***********************************************************************/
    /***********************************************************************/
    socket.on('get_conversation_history', function (data, callback) {
      hayvenjs.get_conversation(data, (demodata) => {
        callback(demodata);
      });
    });

    socket.on('load_older_msg', function (data, callback) {
      hayvenjs.get_old_msg(data, (data_rep) => {
        callback(data_rep);
      });
    });

    // Get all public rooms from db where workspace define
    socket.on('public_conversation_history', function (data, callback) {
      hayvenjs.public_conversation(data, (demodata) => {
        callback(demodata);
      });
    });

    socket.on('updateKeySpace', function (message, callback) {
      if (message.conversation_id != "") {
        updateKeySpace(message.conversation_id, message.keySpace, (result, err) => {
          if (err) {
            throw err;
          } else {
            callback(result);
          }
        });
      }
    });


    socket.on('updatePrivecy', function (message, callback) {
      if (message.conversation_id != "") {
        updatePrivecy(message.conversation_id, message.grpprivacy, (result, err) => {
          if (err) {
            throw err;
          } else {
            socket.broadcast.emit('updateRoomPrivecy', message);
            callback(result);
          }
        });
      }
    });

    socket.on('updateRoomimg', function (message, callback) {
      if (message.conversation_id != "") {
        updateRoomimg(message.conversation_id, message.conv_img, (result, err) => {
          if (err) {
            throw err;
          } else {
            callback(result);
          }
        });
      }
    });


    socket.on('send_message', function (message) {
      // if(socket.handshake.session.login === true){
      // console.log(1165, socket.handshake.session.login);
      if (message.is_room === false) {
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(72, err);
            } else {
              if (result.status) {

                if (socket.handshake.session.userdata.from.toString() !== message.to.toString()) {
                  io.to(message.to).emit('newMessage', result);
                }
                if (message.attach_files !== undefined) {
                  filesTag(result.msg.msg_id, message.conversation_id, socket.handshake.session.userdata.from, message.tags, (response, err) => {
                    if (err) {
                      console.log(998, err);
                    }
                    else {
                      // io.to(socket.handshake.session.userdata.from.toString()).emit('message_sent', {msg:result.msg,tagmsgid:response});
                      result.tagmsgid = response;
                      io.to(socket.handshake.session.userdata.from.toString()).emit('newMessage', result);
                    }
                  });
                }
                else {
                  io.to(socket.handshake.session.userdata.from.toString()).emit('newMessage', result);
                }
              }
              else {
                console.log(result);
              }
            }
          });
      }
      else if (message.is_room === true) {
        // console.log('something wrong!!!');
        // io.to('navigate_2018_902770').emit('newMessage', generateMessage(socket.handshake.session.userdata.from, message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img));
        // This is temporary group message.
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(err);
            } else {
              if (result.status) {
                socket.broadcast.emit('newMessage', result); // this emit receive all users except me
                // io.to(message.conversation_id).emit('newMessage', {msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id}); // this emit receive all users except me
                // console.log({msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id});
                // io.to(socket.handshake.session.userdata.from.toString()).emit('message_sent', result);

                if (message.attach_files !== undefined) {
                  filesTag(result.msg.msg_id, message.conversation_id, socket.handshake.session.userdata.from, message.tags, (response, err) => {
                    if (err) {
                      console.log(998, err);
                    } else {
                      if (socket.handshake.session.userdata.from.toString() !== message.to.toString()) {
                        io.to(message.to).emit('newMessage', result);
                      }
                      // io.to(socket.handshake.session.userdata.from.toString()).emit('message_sent', {msg:result.msg,tagmsgid:response.id});
                      result.tagmsgid = response.id;
                      io.to(socket.handshake.session.userdata.from.toString()).emit('newMessage', result);
                    }
                  });
                }
                else {
                  io.to(socket.handshake.session.userdata.from.toString()).emit('newMessage', result);
                }

              } else {
                console.log(result);
              }
            }
          });
      }
      // }
    });

    socket.on('saveTag', function (message, callback) {
      if (message.currentConvID != "") {
        saveTag(message.msgIdsFtag, message.conversation_id, message.messgids, message.created_by, message.tagTitle, message.tagType, (result, err) => {
          if (err) {
            throw err;
          } else {
            saveConTag(result.tags, message.conversation_id, (cresult, cerr) => {
              if (err) {
                throw err;
              } else {
                if (cresult.status) {
                  callback({
                    status: true,
                    tags: cresult.tags,
                    roottags: cresult.roottags,
                    mtagsid: result.mtagsid
                  });
                } else {
                  callback({
                    status: false
                  });
                }
              }
            });
          }
        });

      }
    });


    socket.on('saveConvTag', function (message, callback) {
      console.log(message);
      saveConvD(message.msgIdsFtag, message.tagtile, message.tagid, message.conversation_id, (cresult, cerr) => {
        if (cerr) {
          throw cerr;
        } else {
          callback(cresult);
        }
      });
    });

    socket.on('taggedData', function (message, callback) {
      getAllTagData(message.tagid, (result, err) => {
        if (err) {
          throw err;
        } else {
          callback(result);
        }
      });
    });

    socket.on('send_rep_message', function (message) {
      if (message.is_room === false) {
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(72, err);
            } else {
              if (result.status) {
                result.root_conv_id = message.thread_root_id;
                result.root_msg_id = message.root_msg_id;
                if (socket.handshake.session.userdata.from.toString() !== message.to.toString()) {
                  io.to(message.to).emit('newRepMessage', result);
                }
                io.to(socket.handshake.session.userdata.from.toString()).emit('newRepMessage', result);
              } else {
                console.log(result);
              }
            }
          });
      }
      else if (message.is_room === true) {
        // console.log('something wrong!!!');
        // io.to('navigate_2018_902770').emit('newMessage', generateMessage(socket.handshake.session.userdata.from, message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img));
        // This is temporary group message.
        sendNewMsg(socket.handshake.session.userdata.from,
          message.sender_img, message.sender_name,
          message.conversation_id,
          message.text,
          message.attach_files, (result, err) => {
            if (err) {
              console.log(err);
            } else {
              if (result.status) {
                result.root_conv_id = message.thread_root_id;
                result.root_msg_id = message.root_msg_id;
                socket.broadcast.emit('newRepMessage', result); // this emit receive all users except me
                // io.to(message.conversation_id).emit('newMessage', {msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id}); // this emit receive all users except me
                // console.log({msg_id: result.res, msg_from: message.to, msg_text: message.text, msg_sender_name: message.sender_name, msg_sender_img: message.sender_img, msg_attach_files: message.attach_files, msg_conv_id: message.conversation_id});
                io.to(socket.handshake.session.userdata.from.toString()).emit('newRepMessage', result);
              } else {
                console.log(result);
              }
            }
          });
      }
    });

    socket.on('all_unread_msg', function (data, callback) {
      getAllUnreadConv(data.my_all_conv, socket.handshake.session.userdata.from, function (repdata, error) {
        if (repdata.status)
          callback(repdata.data);
        else
          callback(error);
      });
    });

    socket.on('add_delivered_if_need', function (data) {
      update_delivered_if_need(data, function (delidata, error) {
        if (delidata.status)
          socket.broadcast.emit('get_delivered_notification', delidata.msgs);
        else
          console.log(1136, delidata.status, error);
      });
    });

    socket.on('getAllDataForSearch', function (data, callback) {
      getAllSearchMsg(data.conversation_list, data.target_text, data.target_filter, data.user_id, (result, error) => {
        if (result.status) {
          callback({ status: result.status, data: result.data });
        } else {
          callback({ status: result.status, data: result.error });
        }
      });
    });

    socket.on('get_one_msg_info', function (data, callback) {
      get_one_msg(data, (result, error) => {
        if (result.status) {
          callback(result.msg);
        } else {
          console.log(error);
          callback(result);
        }
      });
    });

    socket.on('getAllTagsforList', function (data, callback) {
      getAllTagsforList(data.myconversation_list, (result, error) => {
        if (result.status) {
          var tagsIDS = [];
          _.each(result.data, function (v, k) {
            if (v.length > 0) {
              _.each(v, function (vt, kt) {
                if (tagsIDS.indexOf(vt.tag_id.toString()) === -1) {
                  tagsIDS.push(vt.tag_id.toString());
                }
              });
            }
          });
          callback({ status: result.status, data: tagsIDS });
        } else {
          callback({ status: result.status, data: result.error });
        }
      });
    });

    socket.on('deleteUnusedTag', function (data, callback) {
      if (data.tagid != undefined && data.tagid != "") {
        deleteUnusedTag(data.tagid, (respond, error) => {
          if (error) {
            if (error) throw error;
          } else if (respond.status) {
            callback({ status: true, respond: respond });
          } else {
            callback({ status: false, respond: respond });
          }
        });
      }
    });

    /***********************************************************************/
    /***********************************************************************/
    /********************    TODO SOCKET START HERE     ********************/
    /***********************************************************************/
    /***********************************************************************/

    // Create activity
    socket.on('toCreateBrdcst', function (message, callback) {
      // console.log(message);
      var adminListUUID = message.adminListUUID;
      var userMsdlist = {};
      if (message.teamname !== "") {
        createActivity(message.activityType, message.activityTitle, message.activityDescription, message.createdBy, message.endTime, message.ecosystem, adminListUUID, message.todoFrom, message.todoTo, message.todoReminder, (result, err) => {
          if (err) {
            console.log(err);
          } else {
            if (result.status) {

              todo_msg.send_acceptance(result.activity_id.toString(), message, socket.handshake.session.user_fullname, socket.handshake.session.user_img, (msgsend) => {
                _.forEach(msgsend, function (v, k) {
                  io.to(v.uid).emit('newMessage', v);
                  userMsdlist[v.uid] = v.msg.msg_id.toString();
                  // console.log(1267, v.uid);
                  // console.log(1268, v.msg.msg_id.toString());
                });

                if (message.checklist.length > 0) {
                  insertChecklist(message.checkedList, message.checklist, result.activity_id, message.createdBy, (res, err) => {
                    socket.broadcast.emit('CreateActivityBrdcst', { status: '200', message, result, userMsdlist });
                    callback({ "activityres": result, "checklist": res });
                  });
                } else {
                  socket.broadcast.emit('CreateActivityBrdcst', { status: '200', message, result, userMsdlist });
                  callback({ "activityres": result });
                }
              });
            } else {
              console.log(result);
            }
          }
        });
      }
    });

    socket.on('sendMsgOngroupMemberadddelete', function (message, callback) {
      if (message.type == 'add') {
        todo_msg.send_acceptance(message.activity_id, message, socket.handshake.session.user_fullname, socket.handshake.session.user_img, (msgsend) => {
          _.forEach(msgsend, function (v, k) {
            io.to(v.uid).emit('newMessage', v);
            io.to(v.uid).emit('addTnTodo', {
              by: socket.handshake.session.user_fullname,
              title: message.activityTitle,
              sender: socket.handshake.session.user_id,
              activity_id: message.activity_id,
              msg_id: v.msg.msg_id.toString(),
              conversation_id: v.msg.conversation_id.toString()
            });
          });
          callback(msgsend);
        });
      } else if (message.type == 'delete') {
        createPersonalConv(message.createdBy, message.uuID, message.ecosystem, (res) => {
          if (res.conversation_id != null) {
            allActivityMsg(res.conversation_id.toString(), message.activity_id)
              .then((response) => {
                var msglist = _.orderBy(response.msg, ["created_at"], ["asc"]);
                todo_msg.update_decline_toto(msglist[msglist.length - 1].conversation_id.toString(), msglist[msglist.length - 1].msg_id.toString(), message.activity_id, message.uuID, (res) => {
                  io.to(message.uuID).emit('removeFromTodo', {
                    by: socket.handshake.session.user_fullname,
                    title: message.activityTitle,
                    sender: socket.handshake.session.user_id,
                    activity_id: message.activity_id,
                    msg_id: msglist[msglist.length - 1].msg_id.toString(),
                    conversation_id: msglist[msglist.length - 1].conversation_id.toString()
                  });
                  callback(res);
                });
              }).catch((err) => {
                console.log(err);
              });
          }
        });

      }
    });


    // Create activity
    socket.on('updateDraftActivity', function (message, callback) {
      var adminListUUID = message.adminListUUID;
      if (message.teamname !== "") {
        updateDraftActivity(
          message.activityid,
          message.clusteringkey,
          message.activityTitle,
          message.activityDescription,
          message.endTime,
          message.ecosystem,
          adminListUUID,
          message.todoFrom,
          message.todoTo,
          message.todoReminder,
          (result, err) => {
            if (err) {
              console.log(err);
            } else {
              if (result.status) {
                todo_msg.send_acceptance(message.activityid, message, socket.handshake.session.user_fullname, socket.handshake.session.user_img, (msgsend) => {
                  _.forEach(msgsend, function (v, k) {

                    io.to(v.uid).emit('newMessage', v);
                    // console.log(1267, v.uid);
                    // console.log(1268, v.msg.msg_id.toString());
                  });
                });

                callback({ "activityres": result });
              } else {
                console.log(result);
              }
            }
          });
      }
    });

    socket.on('CreateDraftActivity', function (message, callback) {
      var adminListUUID = message.adminListUUID;
      if (message.teamname !== "") {
        draftActivity(message.activityType, message.activityTitle, message.createdBy, message.ecosystem, adminListUUID, message.status, (result, err) => {
          if (err) {
            console.log(err);
          } else {
            if (result.status) {


              callback({ "activityres": result });
            } else {
              console.log(result);
            }
          }
        });
      }
    });

    //Get activity details by activity ID

    socket.on('get_activity_history', function (data, callback) {

      getActivityDetail(data, (activityDetail) => {
        getChecklist(data.activity_id, (response) => {

          get_myTags(data.activity_id, data.user_id, (tRes, Terr) => {

            if (Terr) throw Terr;

            var tagID = [];
            var tags = [];
            var condtagsid = [];

            _.each(tRes.Ctags, function (value, key) {
              tagID.push(value.id.toString());
              condtagsid.push(value.tag_id.toString());
            });

            get_messages_tag(data.activity_id, data.user_id, (mtgsRes, mtgsErr) => {

              if (Terr) throw Terr;

              callback({
                activityDetail,
                response,
                totalTags: tRes.tags,
                tags: tagID,
                condtagsid: condtagsid,
                messagestag: mtgsRes.tags,
                files: mtgsRes.files
              });

            });
          });

        });

      });
    });

    socket.on('todochat_join', function (data, callback) {
      // console.log(data);
      _.forEach(data.all_my_activity_id, function (v, k) {
        socket.join(v);
      });
      todo_msg.get_todo_unread(data.all_my_activity_id, data.user_id, (res) => {
        callback(res);
      });
    });

    socket.on('find_todo_chat_history', function (data, callback) {
      todo_msg.get_todo_msg(data, (res) => {
        // console.log(1264, res);
        callback(res);
      });
    });

    socket.on('todo_send_message', function (data, callback) {
      todo_msg.save_msg(data, (res) => {
        if (data.thread_root_id == 0) {
          if (data.attach_files !== undefined) {
            filesTag(res.msg.msg_id, data.activity_id, socket.handshake.session.userdata.from, data.tags, (response, err) => {
              if (err) {
                console.log(998, err);
              } else {
                res.tagmsgid = response;
                io.to(data.activity_id).emit('todo_msg_receive', res);
              }
            });
          }
          else {
            io.to(data.activity_id).emit('todo_msg_receive', res);
          }
          callback({ res, data });
        }
        else {
          io.to(data.thread_root_id).emit('newRepMessage', { status: true, res, data });
          var newdata = { activity_id: data.thread_root_id, msg_id: data.root_msg_id, last_reply_name: data.sender_name };
          todo_msg.thread_reply_update(newdata, (result) => {
            if (result.status) {
              console.log('socket 1312 = ', result);
              io.to(data.thread_root_id).emit('update_thread_counter', newdata);
            } else {
              console.log('socket 130', result);
              // callback(result);
            }
          });
          callback({ res, data });
        }
      });
    });

    socket.on('cokkieFilesSave', function (data, callback) {
      saveCokkeiFiles(data, (res, err) => {
        callback({ res, data });
      });
    });

    socket.on('cokkieFilesUpdate', function (data, callback) {
      UpdatecokkieFiles(data, (res, err) => {
        callback({ res, data });
      });
    });
    socket.on('update_todo_msg_status', function (data) {
      todo_msg.update_todomsg_status_add_viewer(data, (res) => {
        console.log('update_todo_msg_status', res);
      });
    });

    socket.on('toodoUpdate', function (data, callback) {
      updateActivity(data.clusteringkey, data.contain, data.targetID, data.type, (response, error) => {
        //socket.emit('update_activity_on_fly', { status: '200', data });
        socket.broadcast.emit('update_activity_on_fly', { status: '200', data });

        callback({ "msg": response });
      });
    });

    socket.on('todosearch', function (data, callback) {
      todosearch(data.userid, data.type, data.activity_list, (response, error) => {
        callback(response);
      });
    });

    socket.on('todo_user_typing', function (data) {
      io.to(data.activity_id).emit('todo_server_typing_emit', {
        display: data.display,
        sender_id: data.sender_id,
        img: data.sender_img,
        name: data.sender_name,
        activity_id: data.activity_id
      });
    });
    socket.on('updateChecklist', function (message, callback) {
      insertChecklist(message.checkedList, message.checklist, message.activity_id, message.createdBy, (res, err) => {
        socket.broadcast.emit('new_checklist', { status: '200', message, res });
        callback({ res });
      });
    });

    socket.on('deleteCheclList', function (message, callback) {
      deleteCheclList(message.checklist_id, message.clusteringkey, (res, err) => {
        socket.broadcast.emit('remove_on_fly', { status: '200', message, res });
        callback({
          res
        });
      });
    });

    socket.on('todoListForSearch', function (data, callback) {
      getAllActivityhMsg(data.allActivityList, data.target_text, data.target_filter, data.user_id, (result, error) => {
        if (result.status) {
          callback({ status: result.status, data: result.data });
        } else {
          callback({ status: result.status, data: result.error });
        }
      });
    });

    socket.on('todo_flag_unflag', function (data, callback) {
      todo_msg.flag_unflag(data, (res) => {
        callback(res);
      });
    });

    socket.on('add_reac_emoji', function (data, callback) {
      check_reac_emoji_list(data.msg_id, data.user_id, (result) => {
        if (result.status) {
          if (result.result.length == 0) {
            // add first time like/reaction
            todo_msg.add_reac_emoji(data.activity_id, data.msg_id, data.user_id, data.user_fullname, data.emojiname, (res) => {
              callback(res);
            });
          } else {
            if (result.result[0].emoji_name == data.emojiname) {
              // delete same user same type reaction
              todo_msg.delete_reac_emoji(data.activity_id, data.msg_id, data.user_id, data.emojiname, (res) => {
                callback(res);
              });
            } else {
              todo_msg.update_reac_emoji(data.activity_id, data.msg_id, data.user_id, data.emojiname, (res) => {
                callback(res);
              });
            }
          }
        }
      });
    });

    socket.on('emoji_rep_list', function (data, callback) {
      todo_msg.view_reac_emoji_list(data.msg_id, data.emojiname, (result) => {
        callback(result.result);
      });
    });

    socket.on('find_todo_reply', function (data, callback) {
      todo_msg.find_reply_list(data.msg_id, data.activity_id, (result) => {
        callback(result);
      });
    });

    socket.on('getCompletedTodo', (data, callback) => {
      getAllCompletedActivity(data.user_id, (res) => {
        callback({ res });
      });
    });

    socket.on('find_unread_reply', function (data, callback) {
      todo_msg.findUnreadRep(data, (res) => {
        callback(res);
      });
    });

    socket.on('need_todo_info', function (data, callback) {
      todo_msg.todo_info(data, (res) => {
        callback(res);
      });
    })
    socket.on('todo_acepted', function (conversation_id, msg_id, user_id, activity_id, callback) {
      todo_msg.update_accept_toto(conversation_id, msg_id, (res) => {
        io.to(user_id).emit('activityAcceptFromMessage', { conversation_id: conversation_id, user_id: user_id, activity_id: activity_id });
        callback(res);
      });
    });
    socket.on('todo_decline', function (conversation_id, msg_id, activity_id, user_id, callback) {
      todo_msg.update_decline_toto(conversation_id, msg_id, activity_id, user_id, (res) => {
        io.to(user_id).emit('activityDeclineFromMessage', { conversation_id: conversation_id, user_id: user_id, activity_id: activity_id });
        callback(res);
      });
    });

    socket.on('has_new_reply', function (data, callback) {
      todo_msg.has_new_todo_reply(data, (res) => {
        callback(res);
      });
    });

    socket.on('todo_chat_search', function (data, callback) {
      todo_msg.todo_chat_search(data, (res) => {
        callback(res);
      });
    });

    socket.on('removethisline', function (data, callback) {
      io.to(data.user_id).emit('removedline', data);
    });



    /***********************************************************************/
    /***********************************************************************/
    /********************    TODO SOCKET END HERE     **********************/
    /***********************************************************************/
    /***********************************************************************/


    /***********************************************************************/
    /***********************************************************************/
    /******    Sujon conference SOCKET START HERE     **********************/
    /***********************************************************************/
    /***********************************************************************/
    socket.on('get_isbusy_conf', function (data, callback) {
      var caller_busy = false;
      var partner_busy = false;
      var is_call = false;

      getRoomInfoUser(data.partner_id, (error, userbusy) => {
        partner_busy = userbusy;
        getRoomInfoUser(data.caller_id, (error2, userbusy2) => {
          caller_busy = userbusy2;

          if (timerConf[data.conversation_id] == null) {
            getRoomInfo(data.conversation_id, (error, room) => {
              if (room == null) {

                callback({
                  'is_busy': false,
                  'is_call': false,
                  'is_timeout': false,
                  'caller_busy': caller_busy,
                  'partner_busy': partner_busy

                });

              } else {
                let usersInRoom = room.participants;

                for (let i in usersInRoom) {
                  if (usersInRoom[i].name == data.user_id) {
                    is_call = true;
                  }
                }

                callback({
                  'is_busy': true,
                  'is_call': is_call,
                  'is_timeout': false,
                  'caller_busy': caller_busy,
                  'partner_busy': partner_busy
                });

              }
            });
          } else {
            callback({
              'is_busy': false,
              'is_call': false,
              'is_timeout': true,
              'caller_busy': caller_busy,
              'partner_busy': partner_busy
            });

          }
        });



      });

      // getUserIsBusy(data.caller_id, (result1, err) =>{
      // if(result1.status==1) caller_busy=true;

      // getUserIsBusy(data.partner_id, (result2, err2) =>{
      // if(result2.status==1) partner_busy=true;


      // });
      // });


    });

    socket.on('ringGroupCall', function (data, callback) {

      _.forEach(data.arr_participants, function (v, k) {

        if (data.rootId != v) {
          // getUserIsBusy(v, (resultbusy, errbusy) =>{
          getRoomInfoUser(v, (error, userbusy) => {
            if (userbusy == false) {
              // update_userbusy(v, 1 , (result) =>{
              io.to(v).emit('videoconf_send', data);
              // });
            }
          });
        }
      });

      callback(true);
    });

    socket.on('ringDynCall', function (data, callback) {

      _.forEach(data.arr_participants, function (v, k) {

        if (data.rootId != v) {
          // getUserIsBusy(v, (resultbusy, errbusy) =>{
          getRoomInfoUser(v, (error, userbusy) => {
            if (userbusy == false) {
              // update_userbusy(v, 1 , (result) =>{
              io.to(v).emit('videoconf_send', data);
              callback(true);
              // });
            }else{
              callback(false);
            }
          });
        }
      });


    });

    socket.on('hangupDynCall', function (data, callback) {

      io.to(data.hangupid).emit('videoconf_endall', data);
      callback(true);

    });

    socket.on('getCallMemberList', function (data, callback) {

      getRoomInfo(data.conversation_id, (error, room) => {
        if (room == null) {
          callback(null);
        }
        else {
          let usersInRoom = room.participants;
          var arrUserList=[];
          for (let i in usersInRoom) {
            arrUserList.push(usersInRoom[i].name)
          }
          // console.log(typeof(arrUserList));
          callback(arrUserList);
        }
      });


    });

    socket.on('message_voip', message => {
      // console.log(`Connection: %s receive message`, message.id);

      switch (message.id) {
        case 'joinRoom': // execute auto when page visit
          console.log('==> joinRoom', message);
          socket.handshake.session.confdata = message;
          socket.handshake.session.save();

          get_conversation_info(message.roomName, (arr_participants) => {
            console.log('==> get_conversation_info return', arr_participants);

            joinRoomConf(socket, message, err => {
              if (err) { console.error(`join Room error ${err}`); }

              // update_userbusy(message.rootId , 1 , (result) =>{

              if (message.reg_status != 'screen') {

                if (message.conversation_type == 'personal' && message.joinstatus == 'initiator' && message.reloadstatus != 'refresh') {


                }
                else if (message.conversation_type == 'personal' && message.reloadstatus == 'refresh') {
                  clearTimeout(timerConf[message.roomName]);
                  delete timerConf[message.roomName];
                }

                else if (message.conversation_type == 'group' && message.joinstatus == 'initiator' && message.reloadstatus != 'refresh') {


                }
                else if (message.conversation_type == 'group' && message.joinstatus == 'initiator' && message.reloadstatus == 'refresh') {
                  clearTimeout(timerConf[message.roomName]);
                  delete timerConf[message.roomName];
                }

              }

              // });
            });

          });

          break;

        case 'leaveRoom':
          console.log('==> leave_Room', message);

          socket.handshake.session.confdata = message;
          socket.handshake.session.save();

          get_conversation_info(message.conversation_id, (arr_participants) => {
            // update_userbusy(message.user_id , 0 , (result) =>{

            // personal call both actions
            if (message.conversation_type == 'personal' && message.reloadstatus == 'endcall') {
              getRoomInfo(message.conversation_id, (error, room) => {
                if (room == null) { }
                else {
                  let usersInRoom = room.participants;
                  if (Object.keys(usersInRoom).length > 2) {
                    if(message.joinstatus == 'initiator'){
                      for (let i in usersInRoom) {
                        if (usersInRoom[i].name != message.rootId) {
                          io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                        }
                      }
                    }else{

                    }
                  }else{
                    for (let i in usersInRoom) {
                      if (usersInRoom[i].name != message.rootId) {
                        io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                      }
                    }
                  }

                }
              });
            }
            else if (message.conversation_type == 'personal' && message.reloadstatus == 'refresh') {
              timerConf[message.conversation_id] = setTimeout(() => {


                getRoomInfo(message.conversation_id, (error, room) => {
                  if (room == null) { }
                  else {
                    let usersInRoom = room.participants;
                    for (let i in usersInRoom) {
                      // if (usersInRoom[i].name == data.sender_name) {
                      io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                      // }
                    }
                  }
                });
                delete timerConf[message.conversation_id];
              }, 10000);
            }
            // group call initiator actions
            else if (message.conversation_type == 'group' && message.joinstatus == 'initiator' && message.reloadstatus == 'endcall') {

              getRoomInfo(message.conversation_id, (error, room) => {
                if (room == null) { }
                else {
                  let usersInRoom = room.participants;
                  for (let i in usersInRoom) {
                    // if (usersInRoom[i].name == data.sender_name) {
                    io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                    // }
                  }
                }
              });
            }
            else if (message.conversation_type == 'group' && message.joinstatus == 'initiator' && message.reloadstatus == 'refresh') {
              timerConf[message.conversation_id] = setTimeout(() => {
                console.log('timeout beyond time' + message.conversation_id);

                getRoomInfo(message.conversation_id, (error, room) => {
                  if (room == null) {
                  } else {
                    let usersInRoom = room.participants;
                    for (let i in usersInRoom) {
                      // if (usersInRoom[i].name == data.sender_name) {
                      io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                      // }
                    }
                  }
                });
                delete timerConf[message.conversation_id];
              }, 10000);
            }


            leaveRoomConf(socket, message, (error) => {
              console.log('leaveRoomConfleaveRoomConf', error);
              if (error) console.error(error);

              console.log('leaveRoomConf...', message.reloadstatus);

              if (message.reloadstatus == 'screen') {

                io.to(message.user_id).emit('conf_reg_screen', message);

              }

            });
            // });
          });

          // if(message.paramstatus=='yesdb'){
          //   sendCallMsg(message.user_id, message.sender_img, message.sender_name, message.conversation_id, message.msgtext, message.joinstatus,message.call_duration, (result3, err) =>{
          //     if(err) console.log(err);
          //     else {
          //       // console.log('------------DB OK');
          //     }
          //   });
          // }



          break;

        case 'receiveVideoFrom':
          // console.log('----------------receiveVideoFrom',message);
          receiveVideoFrom(socket, message.sender, message.sdpOffer, (error) => {
            if (error) {
              console.error(error);
            }
          });
          break;

        case 'endcall_initiator':
          getRoomInfo(message.conversation_id, (error, room) => {
            if (room == null) {

            } else {
              let usersInRoom = room.participants;
              for (let i in usersInRoom) {
                // if (usersInRoom[i].name == data.sender_name) {
                io.to(usersInRoom[i].name).emit('videoconf_endall', message);
                // }
              }


            }
          });
          break;
        case 'onIceCandidate':
          addIceCandidate(socket, message, (error) => {
            if (error) {
              console.error(error);
            }
          });
          break;
        default:
          socket.emit({ id: 'error', msg: `Invalid message ${message}` });
      }
    });

    socket.on('videocall_req', function (data, callback) {

      if (data.to_id) {
        console.log('sendBusy from videocall_req');
        sendBusyMsg({ user_id: data.my_id, is_busy: 1 }, (result1) => {
          if (result1.status) {
            console.log('sendBusy from videocall_req');
            sendBusyMsg({ user_id: data.to_id, is_busy: 1 }, (result2) => {
              if (result2.status) {
                io.to(data.to_id).emit('videocall_send', data);
                callback(result2.status);
              }
            });
          }
        });
      }
    });

    socket.on('audiocall_req', function (data, callback) {

      if (data.to_id) {

        sendBusyMsg({ user_id: data.my_id, is_busy: 1 }, (result1) => {

          if (result1.status) {
            console.log('sendBusy1 from audiocall_req');

            sendBusyMsg({ user_id: data.to_id, is_busy: 1 }, (result2) => {
              if (result2.status) {
                console.log('sendBusy2 from audiocall_req');
                io.to(data.to_id).emit('audiocall_send', data);
                callback(result2.status);
              }
            });


          }
        });

      }

    });

    socket.on('call_hangup_before', function (data, callback) {
      if (data.hangup_id) {
        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {
            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', data.call_duration, (result3, err) => {
                    if (err) { console.log(err); }
                    else {

                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.caller_name,
                          msg_sender_img: data.caller_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });

                        console.log('send.Call.Msg > call_ hangup_before : ' + data);
                        io.to(data.hangup_id).emit('send_hangup_before', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }
                // else{
                //   io.to(data.hangup_id).emit('send_hangup_before', data);
                // }
              }
            });
          }
        });
      }
    });

    socket.on('call_hangup_after', function (data, callback) {

      if (data.hangup_id) {

        sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result1) => {

          if (result1.status) {

            sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result2) => {

              if (result2.status) {
                console.log('send.Call.Msg > call_ hangup_after' + data.reload_status);

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, data.msg_status, data.call_duration, (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.caller_name,
                          msg_sender_img: data.caller_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });

                        io.to(data.hangup_id).emit('send_hangup_after', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                } else {

                }

              }
            });

          }
        });
      }

    });

    socket.on('call_reject_receiver', function (data, callback) {

      if (data.caller_id) {

        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {

            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {
                    if (err) console.log(err);
                    else {
                      if (result3.status) {

                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });

                        io.to(data.caller_id).emit('send_reject_caller', data);

                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }

              }
            });

          }
        });


      }

    });

    socket.on('call_reject_media_caller', function (data, callback) {

      if (data.caller_id) {
        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {
            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });
                        console.log('send.Call.Msg > call_ reject_media_caller');
                        io.to(data.hangup_id).emit('send_reject_media_caller', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }

              }
            });

          }
        });
      }

    });

    socket.on('call_reject_media_receiver', function (data, callback) {

      if (data.caller_id) {

        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {

            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {
                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {

                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });
                        io.to(data.hangup_id).emit('send_reject_media_receiver', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }

              }
            });

          }
        });


      }

    });

    socket.on('call_reject_network_caller', function (data, callback) {

      if (data.caller_id) {

        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {

            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'network', '', (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });

                        console.log('send.Call.Msg > call_ reject_network_caller');
                        io.to(data.hangup_id).emit('send_reject_media_caller', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }

              }
            });

          }
        });


      }

    });

    socket.on('call_reject_network_receiver', function (data, callback) {

      if (data.caller_id) {

        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {

            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {

                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'network', '', (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });

                        console.log('send.Call.Msg > call_ reject_network_receiver');
                        io.to(data.hangup_id).emit('send_reject_media_receiver', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }

              }
            });

          }
        });


      }

    });

    socket.on('call_noresponse', function (data, callback) {
      if (data.caller_id) {
        sendBusyMsg({ user_id: data.partner_id, is_busy: 0 }, (result1) => {
          if (result1.status) {
            sendBusyMsg({ user_id: data.caller_id, is_busy: 0 }, (result2) => {
              if (result2.status) {
                console.log('send.Call.Msg > call_ noresponse reload_status', data.reload_status);
                if (data.reload_status == true) {
                  sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result3.status) {
                        _.merge(data, {
                          msg_id: result3.res,
                          msg_from: data.caller_id,
                          msg_text: data.msgtext,
                          msg_sender_name: data.sender_name,
                          msg_sender_img: data.sender_img,
                          msg_conv_id: data.conversation_id,
                          msg_type: 'call'
                        });
                        console.log('send.Call.Msg > call_ noresponse', data);
                        io.to(data.caller_id).emit('send_noresponse', data);
                        callback(data);
                      } else {
                        console.log(result3);
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    });

    socket.on('call_accept', function (data, callback) {

      if (data.caller_id) {
        console.log('call_accept: ' + data.caller_id);

        io.to(data.caller_id).emit('send_accept', data);
        callback(true);

      }

    });

    socket.on('call_accept_conf', function (data, callback) {
      if (data.user_id) {
        console.log('call_accept_conf: ' + data.user_id);

        io.to(data.user_id).emit('send_accept_conf', data);
        callback(true);

      }
    });

    socket.on('call_reject_conf', function (data, callback) {
      if (data.user_id) {
        console.log('call_reject_conf: ' + data);

        if (data.data_conf.conversation_type == 'group') {
          // update_userbusy(data.user_id , 0 , (result) =>{
          callback(true);
          // });

        }
        else if (data.data_conf.conversation_type == 'addparticipant') {
          getRoomInfo(data.data_conf.roomName, (error, room) => {
            if (room == null) { }
            else {
              let usersInRoom = room.participants;
              for (let i in usersInRoom) {
                if (usersInRoom[i].name != data.user_id) {
                  io.to(usersInRoom[i].name).emit('callconf_user_reject', data);
                }
              }
            }
          });
        }
        else {

          // update_userbusy(data.data_conf.arr_participants, 0 , (result2) =>{
          _.forEach(data.data_conf.arr_participants, function (v, k) {
            if (data.user_id != v) {
              io.to(v).emit('videoconf_endall', data);
            }

          });

          callback(true);
          // });

        }
      }
    });

    socket.on('get_isbusy_status', function (data, callback) {

      if (data.partner_id) {
        var is_online = false;

        alluserlist.filter(function (el) {
          if (el == data.partner_id) is_online = true;

        });

        if (is_online) {

          getUserIsBusy(data.partner_id, (result1, err) => {
            if (err) {
              console.log(err);
            } else {

              if (result1.status == 1) {
                // user is busy
                sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result2, err) => {

                  if (err) {
                    console.log(err);
                  } else {
                    if (result2.status) {
                      console.log('send.Call.Msg > get_isbusy_status');

                      callback({
                        is_busy: result1.status,
                        is_online: is_online,
                        result: result2,
                        msg_id: result2.res,
                        msg_from: socket.handshake.session.userdata.from,
                        msg_text: data.msgtext,
                        msg_sender_name: data.sender_name,
                        msg_sender_img: data.sender_img,
                        msg_conv_id: data.conversation_id,
                        msg_type: 'call'
                      });
                    }
                  }
                });

              } else {
                // user not busy
                callback({
                  is_busy: result1.status,
                  is_online: is_online,

                });
              }

            }
          });

        } else {
          // user not online

          sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {

            if (err) {
              console.log(err);
            } else {
              if (result3.status) {
                console.log('send.Call.Msg > get_isbusy_status');
                console.log(result3.res);
                callback({
                  is_busy: 0,
                  is_online: is_online,
                  result: result3,
                  msg_id: result3.res,
                  msg_from: socket.handshake.session.userdata.from,
                  msg_text: data.msgtext,
                  msg_sender_name: data.sender_name,
                  msg_sender_img: data.sender_img,
                  msg_conv_id: data.conversation_id,
                  msg_type: 'call'
                });
              }
            }
          });
        }
      }

    });

    socket.on('get_isbusy_status', function (data, callback) {

      if (data.partner_id) {
        var is_online = false;

        alluserlist.filter(function (el) {
          if (el == data.partner_id) is_online = true;

        });

        if (is_online) {

          getUserIsBusy(data.partner_id, (result1, err) => {
            if (err) {
              console.log(err);
            } else {

              if (result1.status == 1) {
                // user is busy
                sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result2, err) => {

                  if (err) {
                    console.log(err);
                  } else {
                    if (result2.status) {
                      console.log('send.Call.Msg > get_isbusy_status');

                      callback({
                        is_busy: result1.status,
                        is_online: is_online,
                        result: result2,
                        msg_id: result2.res,
                        msg_from: socket.handshake.session.userdata.from,
                        msg_text: data.msgtext,
                        msg_sender_name: data.sender_name,
                        msg_sender_img: data.sender_img,
                        msg_conv_id: data.conversation_id,
                        msg_type: 'call'
                      });
                    }
                  }
                });

              } else {
                // user not busy
                callback({
                  is_busy: result1.status,
                  is_online: is_online,

                });
              }

            }
          });

        } else {
          // user not online

          sendCallMsg(data.user_id, data.sender_img, data.sender_name, data.conversation_id, data.msgtext, 'call', '', (result3, err) => {

            if (err) {
              console.log(err);
            } else {
              if (result3.status) {
                console.log('send.Call.Msg > get_isbusy_status');
                console.log(result3.res);
                callback({
                  is_busy: 0,
                  is_online: is_online,
                  result: result3,
                  msg_id: result3.res,
                  msg_from: socket.handshake.session.userdata.from,
                  msg_text: data.msgtext,
                  msg_sender_name: data.sender_name,
                  msg_sender_img: data.sender_img,
                  msg_conv_id: data.conversation_id,
                  msg_type: 'call'
                });
              }
            }
          });
        }
      }

    });
    /***********************************************************************/
    /***********************************************************************/
    /******    Sujon conference SOCKET END HERE     **********************/
    /***********************************************************************/
    /***********************************************************************/
    socket.on('msgUpdate', function(data,callback){
      connect_msgUpdate(data).then((res)=>{
        callback(res);
      }).catch((err)=>{
        callback(err);
      });
    });

    //******************************//
    // use for room or group delete //
    //******************************//
    socket.on('roomdelete', function (params) {
      socket.broadcast.emit('room_delete_broadcast', params);
    })


    // *********************************
    // This socket need for Android Call
    // *********************************
    socket.on('kurento_call', function(data){
    	io.to(data.sender).emit('kurento', data);
    	io.to(data.reciver).emit('kurento', data);
    	console.log(1066, data);
    });

  });

  return router;
}
