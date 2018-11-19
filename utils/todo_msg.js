var app = require('express');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
const metascraper = require('metascraper');
const got = require('got');
var router = app.Router();

var {models} = require('./../config/db/express-cassandra');
var {createPersonalConv} = require('./../utils/conversation');
var {send_todo_msg_acceptance} = require('./../utils/message');

var todo_msg = [];

var isRealString = (str) => {
  return typeof str === 'string' && str.trim().length >0;
}

var get_conversation = (activity_id, callback) =>{
    // models.instance.ActivityMessages.find({activity_id: activity_id, $orderby:{ '$desc' :'msg_id' }, $limit:20 }, {raw:true, allow_filtering: true}, function(err, conversation){
    models.instance.ActivityMessages.find({activity_id: activity_id, $orderby:{ '$desc' :'msg_id' } }, {raw:true, allow_filtering: true}, function(err, conversation){
        if(err) callback({status: false, err: err});
        else {
            callback({status: true, conversation: _.reverse(conversation)});
        }
    });
};

todo_msg["get_todo_unread"] = (data, uid, callback) =>{
    var convid = new Set();
    _.forEach(data, function(val, k){
        convid.add(models.uuidFromString(val));
    });
    var convid_array = Array.from(convid);
    var query = {
        activity_id: {'$in': convid_array}
    };

    models.instance.ActivityMessages.find(query, { raw: true, allow_filtering: true }, function(error, all_msg){
        if(error) callback({status: false}, error);

        var all_unread = [];
        var msg_has_rep = [];
        var unread_replay = [];

        // Get all unread messages
        _.forEach(all_msg, function(amv, amk){
            if(amv.msg_status == null && amv.sender.toString() != uid){
                // console.log(amv.sender_name);
                all_unread.push(amv);
            }

            // if(amv.has_reply > 0){
            //     if(msg_has_rep.indexOf(amv.msg_id) == -1)
            //         msg_has_rep.push(amv.msg_id);
            // }
        });

        // Get all unread replay
        if(msg_has_rep.length){
            // models.instance.ReplayConv.find({msg_id:{'$in':msg_has_rep}}, { raw: true, allow_filtering: true }, function(error_rep, rep_con_data){
            //     if(error_rep) callback({status: false}, error_rep);
            //
            //     // console.log(rep_con_data.length);
            //     var rep_con_id = [];
            //     _.forEach(rep_con_data, function(rcv, rck){
            //         rep_con_id.push(rcv.rep_id);
            //     });
            //
            //     var query = { conversation_id: {'$in': rep_con_id} };
            //     models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error_rep, all_rep_msg){
            //         if(error_rep) callback({status: false}, error_rep);
            //
            //         _.forEach(all_rep_msg, function(amv, amk){
            //             if(amv.msg_status == null && amv.sender.toString() != uid)
            //                 unread_replay.push(amv);
            //         });
            //         callback({status: true, data: {all_unread, unread_replay, rep_con_data}}, false);
            //     });
            // });
        }else{
            callback({status: true, data: {all_unread, unread_replay, rep_con_data:[]}}, false);
        }
    });
}

todo_msg["update_todomsg_status_add_viewer"] = (data, callback) =>{
    var messid = new Set();
    _.forEach(data.msgids, function(val, k){
        // console.log(val);
        messid.add(models.timeuuidFromString(val));
    });
    var uid = data.user_id;
    var msgarray = Array.from(messid);
    var query = {
        activity_id: {$eq: models.uuidFromString(data.activity_id)},
        msg_id: {'$in': msgarray}
    };
    var query_object = {activity_id: {$eq: models.uuidFromString(data.activity_id)},msg_id: {'$in': msgarray}};
    var update_values_object = {msg_status: {'$add': [uid]},has_delivered: 1};
    var options = {ttl: 86400, if_exists: true};
    models.instance.ActivityMessages.update(query_object, update_values_object, function(err){
        if(err){
            callback({status: false});
            throw err;
        }else{
            callback({status: true});
        }
    });
};


todo_msg["get_todo_msg"] = (data, callback) =>{
    get_conversation(models.uuidFromString(data.activity_id), (result, error) => {
        if(error) callback({status: false, error: error});
        if(result.status && result.conversation.length>0)
            callback({status: true, conversation: result.conversation});
        else
            callback({status: false});
    });
};

todo_msg["save_msg"] = (data, callback) =>{
    var createdat = new Date().getTime();
    var msgid = models.timeuuid();
    // console.log(37, msgid);
    if(isRealString(data.text)){
      var uuidconversation_id = models.uuidFromString(data.activity_id);
      var uuidfrom = models.uuidFromString(data.sender_id);
      var imgfile = (typeof data.attach_files === 'undefined')?null:data.attach_files.imgfile;
      var audiofile = (typeof data.attach_files === 'undefined')?null:data.attach_files.audiofile;
      var videofile = (typeof data.attach_files === 'undefined')?null:data.attach_files.videofile;
      var otherfile = (typeof data.attach_files === 'undefined')?null:data.attach_files.otherfile;

      var message = new models.instance.ActivityMessages({
          msg_id: msgid,
          msg_body: data.text,
          attch_imgfile: imgfile,
          attch_audiofile: audiofile,
          attch_videofile: videofile,
          attch_otherfile: otherfile,
          sender: uuidfrom,
          sender_name: data.sender_name,
          sender_img: data.sender_img,
          has_delivered: 0,
          activity_id: uuidconversation_id
      });
      // console.log('todo_msg 145');
      message.saveAsync()
          .then(function(res) {
              callback({status:true, msg: message});
          })
          .catch(function(err) {
              callback({status:false, err: err});
          });
    } else {
      callback({status:false, err: 'Message formate not supported.'});
    }
};

todo_msg["flag_unflag"] = (data, callback) =>{
    if(data.is_add == 'no'){
        models.instance.ActivityMessages.update({activity_id: models.uuidFromString(data.activity_id), msg_id: models.timeuuidFromString(data.msg_id)}, {
        has_flagged: {'$remove': [data.user_id]}
        }, function(err){
            if(err) callback({status: false, err: err});
            callback({status: true});
        });
    } else if(data.is_add == 'yes'){
        models.instance.ActivityMessages.update({activity_id: models.uuidFromString(data.activity_id), msg_id: models.timeuuidFromString(data.msg_id)}, {
        has_flagged: {'$add': [data.user_id]}
        }, function(err){
            if(err) callback({status: false, err: err});
            callback({status: true});
        });
    }
};

todo_msg["add_reac_emoji"] = (activity_id, msg_id, user_id, user_fullname, emoji, callback) =>{
  var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
  var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;

  models.instance.ActivityMessages.find({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)}, {raw:true, allow_filtering: true}, function(err, message){
    if(err){
      console.log(error);
    }else{
      var messageEmoji = new models.instance.MessageEmoji({
        msg_id: models.timeuuidFromString(msg_id),
        user_id: models.uuidFromString(user_id),
        user_fullname: user_fullname,
        emoji_name: emoji
      });
      messageEmoji.saveAsync().then(function() {
        console.log('Ok');
      }).catch(function(err) {
        console.log(err);
      });
      _.forEach(message[0].has_emoji, function(v,k){
        switch(k) {
          case "grinning":
            v += (k==emoji)?1:0; c_grinning += v; break;
          case "joy":
            v += (k==emoji)?1:0; c_joy += v; break;
          case "open_mouth":
            v += (k==emoji)?1:0; c_open_mouth += v; break;
          case "disappointed_relieved":
            v += (k==emoji)?1:0; c_disappointed_relieved += v; break;
          case "rage":
            v += (k==emoji)?1:0; c_rage += v; break;
          case "thumbsup":
            v += (k==emoji)?1:0; c_thumbsup += v; break;
          case "thumbsdown":
            v += (k==emoji)?1:0; c_thumbsdown += v; break;
          case "heart":
            v += (k==emoji)?1:0; c_heart += v; break;
        }
      });

      models.instance.ActivityMessages.update({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)}, {
          has_emoji: {'$add': {
                              "grinning": c_grinning,
                              "joy": c_joy,
                              "open_mouth": c_open_mouth,
                              "disappointed_relieved": c_disappointed_relieved,
                              "rage": c_rage,
                              "thumbsup": c_thumbsup,
                              "thumbsdown": c_thumbsdown,
                              "heart": c_heart } }
      }, function(err){
          if(err) callback({status: false, err: err});
          callback({status: true, rep: 'add'});
      });
    }
  });
};

todo_msg["delete_reac_emoji"] = (activity_id, msg_id, uid, emoji, callback) =>{
  models.instance.MessageEmoji.delete({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, function(err){
    if(err){
      callback({status: false, result: err});
    }else{
      var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
      var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;

      models.instance.ActivityMessages.find({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)},
            {raw:true, allow_filtering: true}, function(err, message){
        if(err){
          console.log(error);
        }else{
          _.forEach(message[0].has_emoji, function(v,k){
            switch(k) {
              case "grinning":
                v -= (k==emoji)?1:0; c_grinning += v; break;
              case "joy":
                v -= (k==emoji)?1:0; c_joy += v; break;
              case "open_mouth":
                v -= (k==emoji)?1:0; c_open_mouth += v; break;
              case "disappointed_relieved":
                v -= (k==emoji)?1:0; c_disappointed_relieved += v; break;
              case "rage":
                v -= (k==emoji)?1:0; c_rage += v; break;
              case "thumbsup":
                v -= (k==emoji)?1:0; c_thumbsup += v; break;
              case "thumbsdown":
                v -= (k==emoji)?1:0; c_thumbsdown += v; break;
              case "heart":
                v -= (k==emoji)?1:0; c_heart += v; break;
            }
          });

          models.instance.ActivityMessages.update({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)}, {
              has_emoji: {'$add': {
                                  "grinning": c_grinning,
                                  "joy": c_joy,
                                  "open_mouth": c_open_mouth,
                                  "disappointed_relieved": c_disappointed_relieved,
                                  "rage": c_rage,
                                  "thumbsup": c_thumbsup,
                                  "thumbsdown": c_thumbsdown,
                                  "heart": c_heart } }
          }, function(err){
              if(err) callback({status: false, err: err});
              callback({status: true, rep: 'delete'});
              // callback({status: true, result: emoji_user});
          });
        }
      });
      // callback({status: true});
    }
  });
};

todo_msg["update_reac_emoji"] = (activity_id, msg_id, uid, emoji, callback) =>{
  var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
  var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;
  models.instance.MessageEmoji.find({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, {raw:true, allow_filtering: true}, function(err, emoji_user){
    if(err) callback({status: false, err: err});
    else {
      var old_rec = emoji_user[0].emoji_name;
      models.instance.MessageEmoji.update({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, {emoji_name: emoji}, function(err2){
        if(err2) callback({status: false, err: err2});
        else{
          models.instance.ActivityMessages.find({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)},
                    {raw:true, allow_filtering: true}, function(err3, message){
            _.forEach(message[0].has_emoji, function(v,k){
                if(k == "grinning"){
                  c_grinning = v;
                  if(k==emoji) c_grinning++;
                  if(k==old_rec) c_grinning--;
                }
                if(k=="joy"){
                  c_joy = v;
                  if(k==emoji) c_joy++;
                  if(k==old_rec) c_joy--;
                }
                if(k=="open_mouth"){
                  c_open_mouth = v;
                  if(k==emoji) c_open_mouth++;
                  if(k==old_rec) c_open_mouth--;
                }
                if(k=="disappointed_relieved"){
                  c_disappointed_relieved = v;
                  if(k==emoji) c_disappointed_relieved++;
                  if(k==old_rec) c_disappointed_relieved--;
                }
                if(k=="rage"){
                  c_rage = v;
                  if(k==emoji) c_rage++;
                  if(k==old_rec) c_rage--;
                }
                if(k=="thumbsup"){
                  c_thumbsup = v;
                  if(k==emoji) c_thumbsup++;
                  if(k==old_rec) c_thumbsup--;
                }
                if(k=="thumbsdown"){
                  c_thumbsdown = v;
                  if(k==emoji) c_thumbsdown++;
                  if(k==old_rec) c_thumbsdown--;
                }
                if(k=="heart"){
                  c_heart = v;
                  if(k==emoji) c_heart++;
                  if(k==old_rec) c_heart--;
                }
            });

            models.instance.ActivityMessages.update({activity_id: models.uuidFromString(activity_id), msg_id: models.timeuuidFromString(msg_id)}, {
                  has_emoji: {'$add': {
                                      "grinning": c_grinning,
                                      "joy": c_joy,
                                      "open_mouth": c_open_mouth,
                                      "disappointed_relieved": c_disappointed_relieved,
                                      "rage": c_rage,
                                      "thumbsup": c_thumbsup,
                                      "thumbsdown": c_thumbsdown,
                                      "heart": c_heart } }
            }, function(err){
                if(err) callback({status: false, err: err});
                else callback({status: true, rep: 'update', old_rep: old_rec});
            });
          });
        }
      });
    }
  });
};

todo_msg["view_reac_emoji_list"] = (msg_id, emoji, callback) =>{
  models.instance.MessageEmoji.find({msg_id: models.timeuuidFromString(msg_id), emoji_name: emoji}, {raw:true, allow_filtering: true}, function(err, emoji_user_list){
    if(err){
      callback({status: false, result: err});
    }else{
      callback({status: true, result: emoji_user_list});
    }
  });
};

todo_msg["replyId"] = (msg_id, conversation_id, callback) =>{
  models.instance.ReplayConv.find({msg_id: models.timeuuidFromString(msg_id), conversation_id: models.uuidFromString(conversation_id)},
          {raw:true, allow_filtering: true}, function(err, reply_info){
    if(err){
      callback({status: false, result: err});
    }else{
      if(reply_info.length == 0){
        var reply_uuid = models.uuid();
        var replyData = new models.instance.ReplayConv({
          rep_id: reply_uuid,
          msg_id: models.timeuuidFromString(msg_id),
          conversation_id: models.uuidFromString(conversation_id)
        });
        replyData.saveAsync().then(function(res) {
            // console.log(315, reply_uuid);
            callback({status:true, result: reply_uuid});
        }).catch(function(err) {
            callback({status:false, err: err});
        });
      }else{
        // console.log(321, reply_info[0].rep_id);
        callback({status: true, result: reply_info[0].rep_id});
      }
    }
  });
};

todo_msg["thread_reply_update"] = (data, callback) =>{
  models.instance.ActivityMessages.find({activity_id: models.uuidFromString(data.activity_id), msg_id: models.timeuuidFromString(data.msg_id)}, {raw:true, allow_filtering: true}, function(err, msg_info){
    if(err){
      callback({status: false, result: err});
    }else{
        models.instance.ActivityMessages.update({activity_id: models.uuidFromString(data.activity_id), msg_id: models.timeuuidFromString(data.msg_id)},
            {has_reply: (Number(msg_info[0].has_reply) + 1), last_reply_time: new Date().getTime(), last_reply_name: data.last_reply_name}, function(err){
          if(err) callback({status:false, msg: err});
          callback({status:true});
      });
    }
  });
};

todo_msg["find_reply_list"] = (msg_id, activity_id, callback) =>{
  models.instance.ReplayConv.find({msg_id: models.timeuuidFromString(msg_id), conversation_id: models.uuidFromString(activity_id)},
      {raw:true, allow_filtering: true}, function(err, rep_id){
    if(err) callback({status: false, data: err});
    else{
      // console.log(344, rep_id);
      models.instance.ActivityMessages.find({activity_id: rep_id[0].rep_id},
            {raw:true, allow_filtering: true}, function(error, rep_list){
        // console.log(347, rep_list);
        if(error) callback({status: false, data: err});
        callback({status: true, data: rep_list});
      });
    }
  });
};

todo_msg["findUnreadRep"] = (data, callback) =>{
    var convid = new Set();
    _.forEach(data.has_reply_msgid, function(val, k){
        convid.add(models.timeuuidFromString(val));
    });
    var convid_array = Array.from(convid);
    var query = {
        msg_id: {'$in': convid_array},
        conversation_id: models.uuidFromString(data.activity_id)
    };

    models.instance.ReplayConv.find(query, { raw: true, allow_filtering: true }, function(err, reply){
        if(err) callback({status: false, error: err});
        else{
            if(reply.length>0){
                var aid = new Set();
                _.forEach(reply, function(v, k){
                    aid.add(v.rep_id);
                });
                var aid_array = Array.from(aid);
                models.instance.ActivityMessages.find({activity_id: {'$in': aid_array}}, { raw: true, allow_filtering: true }, function(error, act_msgs){
                    if(error)  callback({status: false, error: error});
                    else{
                        callback({status: true, reply, msgs: act_msgs});
                    }
                });
            }else{
                callback({status: false});
            }
        }
    });
};

todo_msg["send_acceptance"] = (activity_id, arg_data, sender_name, sender_img, callback) => {
    // console.log("====================================================================");
    // console.log(502, result);
    var nomsg = [];
    _.forEach(arg_data.adminListUUID, function (v, k) {
        if (arg_data.createdBy != v) {
            createPersonalConv(arg_data.createdBy, v, arg_data.ecosystem, (res) => {
                // console.log(473, res);
                send_todo_msg_acceptance(arg_data.createdBy, sender_img, sender_name, res.conversation_id.toString(), arg_data.activityTitle, [], 'todo', activity_id, (rep, err) => {
                    if (err) console.log('send_acceptance error: ', err);
                    nomsg.push({ uid: v, msg: rep.msg });
                    if ((nomsg.length + 1) == arg_data.adminListUUID.length)
                        callback(nomsg);
                });
            });
        }
    });
};


todo_msg["todo_info"] = (data, callback) =>{
    var id = new Set();
    _.forEach(data, function(val, k){
        id.add(models.uuidFromString(val));
    });
    var idarray = Array.from(id);
    var query = {
        activity_id: {'$in': idarray}
    };
    // console.log(query);
    models.instance.Activity.find(query, {raw:true, allow_filtering: true}, function(error, activity_list){
        if(error) callback({status: false, msg: error});
        else{
            callback({status: true, activity_list: activity_list});
        }
    });
};

todo_msg["update_accept_toto"] = (conversation_id, msg_id, callback) =>{
    // console.log(conversation_id, msg_id);
    models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {msg_body: 'accept'}, function(err){
        if(err) callback({status: false, error: err});
        else callback({status: true});
    });
};
todo_msg["update_decline_toto"] = (conversation_id, msg_id, activity_id, user_id, callback) =>{
    // console.log(conversation_id, msg_id);
    models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {msg_body: 'decline'}, function(err){
        if(err) callback({status: false, error: err});
        else callback({status: true});
    });
    models.instance.Activity.find({ activity_id: models.uuidFromString(activity_id)}, {raw:true, allow_filtering: true}, function(error, activity){
        if(error) callback({status: false, error: error});

        models.instance.Activity.update({activity_id: models.uuidFromString(activity_id), activity_created_at: activity[0].activity_created_at}, {activity_participants: { $remove: [user_id] }}, function(err){
            if(err) callback({status: false, error: err});
            else callback({status: true});
        });
    });
};

todo_msg["has_new_todo_reply"] = (data, callback) =>{
    var unread_replay = [];
    models.instance.ActivityMessages.find({activity_id: models.uuidFromString(data.activity_id), has_reply: { '$gt':0}}, {raw:true, allow_filtering: true}, function(e1, actmsg){
        if(e1) callback({status: false, error: e1, unread_replay});
        else if(actmsg.length > 0){
            var msgids = [];
            _.forEach(actmsg, function(v, k){
                msgids.push(v.msg_id);
            });

            models.instance.ReplayConv.find({conversation_id: models.uuidFromString(data.activity_id), msg_id: {'$in': msgids}}, {raw:true, allow_filtering: true}, function(e2, rep_conv){
                if(e2) callback({status: false, error: e2, unread_replay});
                else if(rep_conv.length>0){
                    var actids = [];
                    _.forEach(rep_conv, function(v, k){
                        actids.push(v.rep_id);
                    });

                    models.instance.ActivityMessages.find({activity_id: {'$in': actids}}, {raw:true, allow_filtering: true}, function(e3, all_replies){
                        if(e3) callback({status: false, error: e3, unread_replay});
                        else if(all_replies.length>0){
                            // console.log(all_replies.length);
                            _.forEach(all_replies, function(amv, amk){
                                if(amv.msg_status == null && amv.sender.toString() != data.user_id)
                                    unread_replay.push(amv);
                                else if(amv.msg_status != null && amv.sender.toString() != data.user_id && amv.msg_status.indexOf(data.user_id) == -1)
                                    unread_replay.push(amv);
                            });
                            callback({status: true, unread_replay});
                        }
                        else{
                            callback({status: false, error: 'no reply msg', unread_replay});
                        }
                    });
                }
                else{
                    callback({status: false, error: 'no reply id', unread_replay});
                }
            });
        }
        else{
            callback({status: false, error: 'no reply activity', unread_replay});
        }
    });
};
todo_msg["todo_chat_search"] = (data, callback) =>{
    var msgids = [];    // msgids store all match string with flag true
                        // and all reply msg id with flag false, for check
    var rep_msg_id = [];

    /* Find all msg for given activity_id */
    models.instance.ActivityMessages.find({activity_id: models.uuidFromString(data.activity_id)}, {raw:true, allow_filtering: true}, function(e1, actmsg){
        if(e1) callback({status: false, error: e1, msgids});
        else if(actmsg.length > 0){
            _.forEach(actmsg, function(v, k){
                if((v.msg_body).toLowerCase().indexOf(data.str)>-1)
                    msgids.push({msg_id: v.msg_id.toString(), status: true});
                if(v.has_reply>0){
                    msgids.push({msg_id: v.msg_id.toString(), status: false}); // need check again
                    rep_msg_id.push(v.msg_id);
                }
            });

            if(rep_msg_id.length > 0){
                /* find all reply msg conversation id */
                models.instance.ReplayConv.find({conversation_id: models.uuidFromString(data.activity_id), msg_id: {'$in': rep_msg_id}}, {raw:true, allow_filtering: true}, function(e2, rep_conv){
                    if(e2) callback({status: false, error: e2, unread_replay});
                    else if(rep_conv.length>0){
                        var actids = [];
                        var repmsgids = [];         // all reply msg activity_id which not match the string
                        var has_repmsgids = [];     // all reply msg activity_id which match the string
                        var not_match_msgid = [];   // all reply msg parent id which not match the string
                        _.forEach(rep_conv, function(v, k){
                            actids.push(v.rep_id);
                        });

                        /* find all reply msg */
                        models.instance.ActivityMessages.find({activity_id: {'$in': actids}}, {raw:true, allow_filtering: true}, function(e3, all_replies){
                            if(e3) callback({status: false, error: e3, unread_replay});
                            else if(all_replies.length>0){
                                _.forEach(all_replies, function(amv, amk){
                                    // string match with the reply body
                                    if((amv.msg_body).toLowerCase().indexOf(data.str) > -1){
                                        if(has_repmsgids.indexOf(amv.activity_id.toString()) == -1){
                                            has_repmsgids.push(amv.activity_id.toString());
                                        }
                                    }
                                    // string not match with the reply body
                                    else if((amv.msg_body).toLowerCase().indexOf(data.str) == -1){
                                        if(repmsgids.indexOf(amv.activity_id.toString()) == -1){
                                            repmsgids.push(amv.activity_id.toString());
                                        }
                                    }
                                });

                                // remove matches id from not mstches id array
                                _.forEach(repmsgids, function(vv,kk){
                                    _.forEach(has_repmsgids, function(m, n){
                                        if(vv == m)
                                            repmsgids[kk] = 0;
                                    });
                                });

                                // store msg id which not match
                                _.forEach(repmsgids, function(vv,kk){
                                    _.forEach(rep_conv, function(m, n){
                                        if(vv == m.rep_id.toString()){
                                            if(not_match_msgid.indexOf(m.msg_id.toString()) == -1)
                                                not_match_msgid.push(m.msg_id.toString());
                                        }
                                    });
                                });
                                // console.log("==========================================");
                                // console.log(not_match_msgid);
                                // console.log("==========================================");
                                // console.log(msgids);
                                // console.log("==========================================");

                                // create the final msg id array, which match the string
                                _.forEach(msgids, function(j, k){
                                    _.forEach(not_match_msgid, function(jj, kk){
                                        if(j.msg_id == jj && j.status === false){
                                            msgids[k].msg_id = 0;
                                        }
                                    });
                                });
                                // console.log(msgids);
                                callback({status: true, msgids});
                            }
                        });
                    }
                });
            }
            else{
                callback({status: true, msgids});
            }
        }
        else{
            callback({status: false, error: 'no reply activity', msgids});
        }
    });
};

var commit_msg_delete_for_Todo = (convid, msg_id, uid, is_seen, remove, callback) =>{
  models.instance.ActivityMessages.find({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)},
    {raw:true, allow_filtering: true}, function(error, msg){
    if(error){
      callback({status: false, err: error});
    }
    else if(msg.length == 1){
      if(uid == msg[0].sender){
        // console.log(336, msg[0].msg_status == null);
        if(msg[0].msg_status == null){ // unread msg can delete sender and system change the msg body for receiver
          models.instance.ActivityMessages.update({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {
                has_delete: {'$add': [uid]},
                msg_body: 'This message was deleted.'
                }, function(err){
                    if(err) callback({status: false, err: err});
                    // console.log(342);
                    callback({status: true});
            });
        } else { // add delete status, but connect no change
            var sender_delete_it = (remove == 'true')?'Sender delete it':' ';
          models.instance.ActivityMessages.update({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {
                has_delete: {'$add': [uid, sender_delete_it]}
                }, function(err){
                    if(err) callback({status: false, err: err});
                    // console.log(350);
                    callback({status: true});
            });
        }
      }else{
        var sender_delete_it = (remove == 'true')?'Sender delete it':' ';
          models.instance.ActivityMessages.update({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {
                has_delete: {'$add': [uid, sender_delete_it]}
                }, function(err){
                    if(err) callback({status: false, err: err});
                    // console.log(350);
                    callback({status: true});
            });
      }
        
    }
    else{
      callback({status: false, err: 'Message id not found'});
    }
  });
};

var permanent_msg_delete_todo =(convid, msg_id, uid, is_seen, remove, callback)=>{
  models.instance.ActivityMessages.find({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)},
    {raw:true, allow_filtering: true}, function(error, msg){
      if(error){
      callback({status: false, err: error});
    }
    else if(msg.length == 1){
        if(is_seen == 'permanent_delete'){
            if(uid == msg[0].sender){
                models.instance.ActivityMessages.delete({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, function(err){
                    if(err) console.log(err);
                    callback({status: true, msg: 'Msg delete successfully'});
                });
            }else{
                models.instance.ActivityMessages.update({activity_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {has_hide: {'$add': [uid]}}, function(err){
                    if(err) console.log(err);
                    callback({status: true, msg: 'Msg hide successfully'});
                });
            }
        }
    }
    else{
      callback({status: false, err: 'Message id not found'});
    }
    });
}

module.exports = {todo_msg,commit_msg_delete_for_Todo,permanent_msg_delete_todo};
