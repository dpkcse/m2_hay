var app = require('express');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
// var urlMetadata = require('url-metadata');
// var ogs = require('open-graph-scraper');
const metascraper = require('metascraper');
const got = require('got');
var router = app.Router();

var {models} = require('./../config/db/express-cassandra');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var isRealString = (str) => {
  return typeof str === 'string' && str.trim().length >0;
}

var generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: new Date().getTime()
  };
};

var sendNewMsg = (from, sender_img, sender_name, conversation_id, msg, attachment, callback) => {
  var createdat = new Date().getTime();
  var msgid = models.timeuuid();
  // console.log(37, msgid);
  if(isRealString(msg)){
    var uuidconversation_id = models.uuidFromString(conversation_id);
    // console.log(40, uuidconversation_id);
    var uuidfrom = models.uuidFromString(from);
    var imgfile = (typeof attachment === 'undefined')?null:attachment.imgfile;
    var audiofile = (typeof attachment === 'undefined')?null:attachment.audiofile;
    var videofile = (typeof attachment === 'undefined')?null:attachment.videofile;
    var otherfile = (typeof attachment === 'undefined')?null:attachment.otherfile;

    var message = new models.instance.Messages({
        msg_id: msgid,
        msg_body: msg,
        attch_imgfile: imgfile,
        attch_audiofile: audiofile,
        attch_videofile: videofile,
        attch_otherfile: otherfile,
        sender: uuidfrom,
        sender_name: sender_name,
        sender_img: sender_img,
        has_delivered: 0,
        conversation_id: uuidconversation_id
    });

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

var readOldMessage = (data, callback) =>{
  models.instance.Messages.findOne({msg_id: models.timeuuidFromString(data.old_msg_id)}, {raw: true, allow_filtering: true}, function(err, message){
    if(err) callback({status: false, error: err});
    else{
      var msgid = models.timeuuid();

      var message = new models.instance.Messages({
          msg_id: msgid,
          msg_body: message.msg_body,
          attch_imgfile: message.attch_imgfile,
          attch_audiofile: message.attch_audiofile,
          attch_videofile: message.attch_videofile,
          attch_otherfile: message.attch_otherfile,
          sender: models.uuidFromString(data.sender_id),
          sender_name: data.sender_name,
          sender_img: data.sender_img,
          conversation_id: models.uuidFromString(data.conversation_id)
      });

      message.saveAsync()
          .then(function(res) {
              callback({status:true, res: msgid, message_data: message});
          })
          .catch(function(err) {
              callback({status:false, err: err});
          });
    }
  });
};

var add_reac_emoji = (conversation_id, msg_id, user_id, user_fullname, emoji, callback) =>{
  var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
  var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;

  models.instance.Messages.find({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {raw:true, allow_filtering: true}, function(err, message){
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

      models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {
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
var check_reac_emoji_list = (msg_id, uid, callback) =>{
  models.instance.MessageEmoji.find({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) },
          {raw:true, allow_filtering: true}, function(err, emoji_user){
    if(err){
      callback({status: false, result: err});
    }else{
      callback({status: true, result: emoji_user});
    }
  });
};
var delete_reac_emoji = (conversation_id, msg_id, uid, emoji, callback) =>{
  models.instance.MessageEmoji.delete({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, function(err){
    if(err){
      callback({status: false, result: err});
    }else{
      var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
      var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;

      models.instance.Messages.find({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)},
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

          models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {
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
var update_reac_emoji = (conversation_id, msg_id, uid, emoji, callback) =>{
  var c_grinning = 0; var c_joy = 0; var c_open_mouth = 0; var c_disappointed_relieved = 0;
  var c_rage = 0; var c_thumbsup = 0; var c_thumbsdown = 0; var c_heart = 0;
  models.instance.MessageEmoji.find({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, {raw:true, allow_filtering: true}, function(err, emoji_user){
    if(err) callback({status: false, err: err});
    else {
      var old_rec = emoji_user[0].emoji_name;
      models.instance.MessageEmoji.update({msg_id: models.timeuuidFromString(msg_id), user_id: models.uuidFromString(uid) }, {emoji_name: emoji}, function(err2){
        if(err2) callback({status: false, err: err2});
        else{
          models.instance.Messages.find({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)},
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

            models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {
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
var view_reac_emoji_list = (msg_id, emoji, callback) =>{
  models.instance.MessageEmoji.find({msg_id: models.timeuuidFromString(msg_id), emoji_name: emoji}, {raw:true, allow_filtering: true}, function(err, emoji_user_list){
    if(err){
      callback({status: false, result: err});
    }else{
      callback({status: true, result: emoji_user_list});
    }
  });
};


var flag_unflag = (msg_id, uid, is_add, conversation_id, callback) =>{
  if(is_add == 'no'){
    models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {
        has_flagged: {'$remove': [uid]}
    }, function(err){
        if(err) callback({status: false, err: err});
        callback({status: true});
    });
  } else if(is_add == 'yes'){
    models.instance.Messages.update({conversation_id: models.uuidFromString(conversation_id), msg_id: models.timeuuidFromString(msg_id)}, {
        has_flagged: {'$add': [uid]}
    }, function(err){
        if(err) callback({status: false, err: err});
        callback({status: true});
    });
  }
};

var commit_msg_delete = (convid, msg_id, uid, is_seen, remove, callback) =>{
  models.instance.Messages.find({conversation_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)},
    {raw:true, allow_filtering: true}, function(error, msg){
    if(error){
      callback({status: false, err: error});
    }
    else if(msg.length == 1){
        if(is_seen == 'permanent_delete'){
            if(uid == msg[0].sender){
                models.instance.Messages.delete({conversation_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, function(err){
                    if(err) console.log(err);
                    callback({status: true, msg: 'Msg delete successfully'});
                });
            }else{
                models.instance.Messages.update({conversation_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {has_hide: {'$add': [uid]}}, function(err){
                    if(err) console.log(err);
                    callback({status: true, msg: 'Msg hide successfully'});
                });
            }
        }else{
            if(msg[0].msg_status == null){ // unread msg can delete sender and system change the msg body for receiver
                models.instance.Messages.update({conversation_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {
                    has_delete: {'$add': [uid]},
                    msg_body: 'This message was deleted.'
                    }, function(err){
                        if(err) callback({status: false, err: err});
                        // console.log(342);
                        callback({status: true});
                });
            } else { // add delete status, but connect no change
                var sender_delete_it = (remove == 'true')?'Sender delete it':' ';
                models.instance.Messages.update({conversation_id: models.uuidFromString(convid), msg_id: models.timeuuidFromString(msg_id)}, {
                    has_delete: {'$add': [uid, sender_delete_it]}
                    }, function(err){
                        if(err) callback({status: false, err: err});
                        // console.log(350);
                        callback({status: true});
                });
            }
        }
    }
    else{
      callback({status: false, err: 'Message id not found'});
    }
  });
};

var replyId = (msg_id, conversation_id, callback) =>{
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
var thread_reply_update = (data, callback) =>{
  models.instance.Messages.find({conversation_id: models.uuidFromString(data.conversation_id), msg_id: models.timeuuidFromString(data.msg_id)}, {raw:true, allow_filtering: true}, function(err, msg_info){
    if(err){
      callback({status: false, result: err});
    }else{
        models.instance.Messages.update({conversation_id: models.uuidFromString(data.conversation_id), msg_id: models.timeuuidFromString(data.msg_id)},
            {has_reply: (Number(msg_info[0].has_reply) + 1), last_reply_time: new Date().getTime(), last_reply_name: data.last_reply_name}, function(err){
          if(err) callback({status:false, msg: err});
          callback({status:true});
      });
    }
  });
};
var find_reply_list = (msg_id, conversation_id, callback) =>{
  models.instance.ReplayConv.find({msg_id: models.timeuuidFromString(msg_id), conversation_id: models.uuidFromString(conversation_id)},
      {raw:true, allow_filtering: true}, function(err, rep_id){
    if(err) callback({status: false, data: err});
    else{
      // console.log(344, rep_id);
      models.instance.Messages.find({conversation_id: rep_id[0].rep_id},
            {raw:true, allow_filtering: true}, function(error, rep_list){
        // console.log(347, rep_list);
        if(error) callback({status: false, data: err});
        callback({status: true, data: rep_list});
      });
    }
  });
};

var update_msg_status_add_viewer = (msg_ids, uid, conversation_id, callback) =>{
    var messid = new Set();
    _.forEach(msg_ids, function(val, k){
        console.log(val);
        messid.add(models.timeuuidFromString(val));
    });
    var msgarray = Array.from(messid);
    var query = {
        conversation_id: {$eq: models.uuidFromString(conversation_id)},
        msg_id: {'$in': msgarray}
    };
    // console.log(430, query);

    models.instance.Messages.update(query, {
        msg_status: {'$add': [uid]},
        has_delivered: 1
    }, function(err){
        if(err){
            callback({status: false});
            throw err;
        }
        callback({status: true});
    });
};


var update_one_msg_status_add_viewer = (msg_id, uid, conversation_id, callback) =>{
    var messid = new Set();
    messid.add(models.timeuuidFromString(msg_id));
    var msgarray = Array.from(messid);
    var query = {
        conversation_id: {$eq: models.uuidFromString(conversation_id)},
        msg_id: {'$in': msgarray}
    };
    // console.log(453, query);

    models.instance.Messages.update(query, {
        msg_status: {'$add': [uid]},
        has_delivered: 1
    }, function(err){
        if(err){
            callback({status: false});
            throw err;
        }
        callback({status: true});
    });
};


var sendBusyMsg = (data, callback) => {
  if(typeof data.user_id=='object'){
    var uuidfrom = (data.user_id);
  }else{
    var uuidfrom = models.uuidFromString(data.user_id);
  }


  var query_object = {id: uuidfrom};
  var update_values_object = {is_busy: data.is_busy};
  var options = {ttl: 86400, if_exists: true};

  models.instance.Users.update(query_object, update_values_object, function(err){
    if(err) callback({status: false, err: err});
    callback({status: true});
  });
};

// var sendCallMsg = (from, sender_img, sender_name, conversation_id, msg, msgtype, callback) => {

//   var createdat = new Date().getTime();
//   var msgid = models.timeuuid();
//   if(isRealString(msg)){
//     uuidconversation_id = models.uuidFromString(conversation_id);
//     uuidfrom = models.uuidFromString(from);
//     var message = new models.instance.Messages({
//         msg_id: msgid,
//         msg_body: msg,
//         sender: uuidfrom,
//         sender_name: sender_name,
//         sender_img: sender_img,
//         conversation_id: uuidconversation_id,
//         msg_type : msgtype
//     });

//     message.saveAsync()
//         .then(function(res) {
//             callback({status:true, res: msgid});
//         })
//         .catch(function(err) {
//             callback({status:false, err: err});
//         });
//   } else {
//     callback({status:false, err: 'Message formate not supported.'});
//   }
// };

// var sendCallMsg = (from, sender_img, sender_name, conversation_id, msg, msgtype,msgduration, callback) => {

//   var createdat = new Date().getTime();
//   var msgid = models.timeuuid();
//   if(isRealString(msg)){
//     uuidconversation_id = models.uuidFromString(conversation_id);
//     uuidfrom = models.uuidFromString(from);
//     var message = new models.instance.Messages({
//         msg_id: msgid,
//         msg_body: msg,
//         sender: uuidfrom,
//         sender_name: sender_name,
//         sender_img: sender_img,
//         conversation_id: uuidconversation_id,
//         msg_type : msgtype,
//         call_duration: msgduration
//     });

//     message.saveAsync()
//         .then(function(res) {
//             callback({status:true, res: msgid});
//         })
//         .catch(function(err) {
//             callback({status:false, err: err});
//         });
//   } else {
//     callback({status:false, err: 'Message formate not supported.'});
//   }
// };

var sendCallMsg = (from, sender_img, sender_name, conversation_id, msg, msgtype,msgduration, callback) => {

  var createdat = new Date().getTime();
  var msgid = models.timeuuid();
  if(isRealString(msg)){
    uuidconversation_id = models.uuidFromString(conversation_id);
    uuidfrom = models.uuidFromString(from);
    var message = new models.instance.Messages({
        msg_id: msgid,
        msg_body: msg,
        sender: uuidfrom,
        sender_name: sender_name,
        sender_img: sender_img,
        conversation_id: uuidconversation_id,
        msg_type : msgtype,
        call_duration: msgduration
    });

    message.saveAsync()
        .then(function(res) {
            callback({status:true, res: msgid});
        })
        .catch(function(err) {
            callback({status:false, err: err});
        });
  } else {
    callback({status:false, err: 'Message formate not supported.'});
  }
};

var getUserIsBusy = (from, callback) => {
  models.instance.Users.findOne({id: models.uuidFromString(from)}, {raw:true, allow_filtering: true}, function(err, user){
        if(err) throw err;
        //user is an array of plain objects with only name and age
        if(user){
          callback({status:user.is_busy});

        } else {
          callback({status:false});
        }
    });
  };

var get_group_lists = (user_id, callback) =>{
  var query = {
    participants: { $contains: user_id },
    group: { $eq: 'yes' },
    single: { $eq: 'no' }
  };
  models.instance.Conversation.find( query, { raw: true, allow_filtering: true },
    function(err, peoples) {
        if (err) callback({status: false, result: err});
        else callback({status: true, result: peoples});
  });
};


var hasMessageThisTag = (conversation_id, msgid, userid, tagname, callback) =>{

  var query = {
    tag_title: { $eq: tagname },
    message_id: { $eq: models.uuidFromString(msgid) }
  };

  models.instance.MessagesTag.find(query,{ raw: true, allow_filtering: true }, function(err, tags) {
    if(err){
      if (error) throw error;
    }else{

      if(tags.length == 0){
        var tagid = models.timeuuid();
        var createdat = new Date().getTime();
        var messagestags = new models.instance.MessagesTag({
            tag_id: tagid,
            created_by: models.uuidFromString(userid),
            created_at: createdat,
            tag_title:tagname,
            tagged_by:models.uuidFromString(userid),
            conversation_id:models.uuidFromString(conversation_id),
            message_id:models.uuidFromString(msgid)
        });
        messagestags.saveAsync().then(function() {
          callback({status: true, tagid: tagid});
        }).catch(function(err) {
          if (err) throw err;
        });
      }else{
        callback({status:false, err: 'Already tagged'});
      }

    }
  });
};

var hasUserThisTag = (convrsationid, msgid, userid, tagname, callback) =>{

  var query = {
    tag_title: { $contains: tagname },
    conversation_id: { $eq: models.uuidFromString(convrsationid) },
    message_id: { $eq: models.uuidFromString(msgid) },
    created_by: { $eq: models.uuidFromString(userid) }
  };

  models.instance.MessagesTag.find(query,{ raw: true, allow_filtering: true }, function(err, tags) {
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, hasUserThisTag: tags});
    }
  });
};

var get_messages_tag = (conversation_id,callback) => {
  var query = {
    conversation_id: { $eq: models.uuidFromString(conversation_id) }
  };

  models.instance.MessagesTag.find(query,{ raw: true, allow_filtering: true }, function(err, tags) {
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, tags: tags});
    }
  });
};

// var deleteThisTag = (tagid, callback) =>{
//   var query_object = {
//     tag_id: models.timeuuidFromString(tagid)
//   };
//
//   models.instance.MessagesTag.delete(query_object, function(err){
//     if(err) {
//       callback({status: false});
//     }else {
//       callback({status: true});
//     }
//   });
// };

var deleteThisTag = (mstagids,tagTitle,tagid,rommID, callback) =>{
  var mtagsid = [];

  var query_object = {
    id: models.timeuuidFromString(tagid)
  };

  models.instance.Convtag.delete(query_object, function(err){
    if(err) {
      throw err;
      callback({status: false});
    }else {
      if(mstagids.length == 0){
        callback({status:true});
      }else{
        if(mstagids.length > 0){
          var mqueries = [];
          _.each(mstagids, function(v, k) {
            console.log(v);
            console.log(tagTitle);
            var update_query = models.instance.MessagesTag.update(
              {id: models.timeuuidFromString(v)},
              {tag_title: { $remove: [tagTitle]} },
              {return_query: true}
            );
            mqueries.push(update_query);
            mtagsid.push(v);
          });

          models.doBatch(mqueries, function(err){
            if(err){ throw err;}
            else {
              callback({status:true});
            }
          });
        }
      }

    }
  });
};
// var getAllUnread = (user_id, callback) =>{

//   models.instance.Messages.find({},{ raw: true, allow_filtering: true }, function(err, tags) {
//     if(err){
//       console.log(err);
//     }else{
//       var query = {
//         participants: { $contains: user_id }
//       };

//       models.instance.Conversation.find( query, { raw: true, allow_filtering: true }, function(err, peoples) {
//         if (err) throw err;

//         models.instance.ReplayConv.find({},{ raw: true, allow_filtering: true }, function(err, ReplayConvs) {
//           if(err){
//             console.log(err);
//           }else{

//             var replyConvID = []; //reply id as conversation in msg tbl
//             var replyMsgConvID = []; //message conversation id which has reply thread
//             var replyMsg = []; //message conversation which has reply thread
//             var replyRootMsgID = []; //message conversation which has reply thread

//             _.forEach(newrplList, function(rv,rk){
//               _.forEach(tags, function(tv,tk){
//                 if(rv.msg_id.toString() == tv.msg_id.toString()){
//                   replyConvID.push(rv.rep_id.toString());
//                   replyMsgConvID.push(rv.conversation_id.toString());
//                   replyRootMsgID.push(rv.msg_id.toString());
//                 }
//               });
//             });

//             var replyConvIDunique = replyConvID.filter(function(item, i, ar){ return ar.indexOf(item) === i; });

//             _.forEach(replyConvIDunique, function(rcv,tck){
//               _.forEach(tags, function(tv,tk){
//                 if(tv.conversation_id.toString() == rcv){
//                   if(tv.sender.toString() != user_id.toString()){
//                     replyMsg.push({
//                       'conversation_id':replyMsgConvID[tck],
//                       'msg_body':tv.msg_body,
//                       'created_at':tv.created_at,
//                       'msg_id':replyRootMsgID[tck]
//                     });
//                   }
//                 }
//               });
//             });

//             _.sortBy(replyMsg, ['created_at'],'desc');

//             var status = [];
//             var conversation = [];
//             _.forEach(tags, function(v,k){
//               conversation.push(v.conversation_id.toString());
//               _.forEach(peoples, function(valu,key){
//                 if(v.conversation_id.toString() == valu.conversation_id.toString()){
//                   if(v.sender.toString() != user_id.toString()){
//                     status.push({
//                       "conersation_id":v.conversation_id.toString(),
//                       "msg_id":v.msg_id.toString(),
//                       "msg_status":v.msg_status,
//                       "msg":v.msg_body,
//                       "created_at":v.created_at
//                     });
//                   }

//                 }
//               });
//             });

//             var array_elements = [];
//             var msgbodyArray = [];
//             var unique = conversation.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
//             _.forEach(status, function(v,k){
//               if(conversation.indexOf(v.conersation_id) != -1){
//                 if(v.msg_status == null){
//                   array_elements.push(v.conersation_id);
//                   msgbodyArray.push({
//                     'conversation_id':v.conersation_id,
//                     'msg_body':v.msg,
//                     'created_at':v.created_at,
//                     'msg_id':v.msg_id
//                   });
//                 }
//               }
//             });

//             array_elements.sort();
//             var newMsgBoddy = replyMsg.concat(msgbodyArray);
//             callback({status: true, array_elements:array_elements,msgbodyArray:newMsgBoddy,unique:unique});
//           }
//         });
//       });
//     }
//   });
// };

// var getAllUnread = (user_id, callback) =>{

//   models.instance.Messages.find({},{ raw: true, allow_filtering: true }, function(err, tags) {
//     if(err){
//       console.log(err);
//     }else{
//       var query = {
//         participants: { $contains: user_id }
//       };

//       models.instance.Conversation.find( query, { raw: true, allow_filtering: true }, function(err, peoples) {
//         if (err) throw err;

//         models.instance.ReplayConv.find({},{ raw: true, allow_filtering: true }, function(err, ReplayConvs) {
//           if(err){
//             console.log(err);
//           }else{

//             var replyConvID = []; //reply id as conversation in msg tbl
//             var replyMsgConvID = []; //message conversation id which has reply thread
//             var replyMsg = []; //message conversation which has reply thread
//             var replyRootMsgID = []; //message conversation which has reply thread

//             var newrplList = _.sortBy(ReplayConvs, ['rep_id']);

//             _.forEach(newrplList, function(rv,rk){
//               _.forEach(tags, function(tv,tk){
//                 if(rv.msg_id.toString() == tv.msg_id.toString()){
//                   replyConvID.push(rv.rep_id.toString());
//                   replyMsgConvID.push(rv.conversation_id.toString());
//                   replyRootMsgID.push(rv.msg_id.toString());
//                 }
//               });
//             });

//             var replyConvIDunique = replyConvID.filter(function(item, i, ar){ return ar.indexOf(item) === i; });

//             _.forEach(replyConvIDunique, function(rcv,tck){
//               _.forEach(tags, function(tv,tk){
//                 if(tv.conversation_id.toString() == rcv){
//                   if(tv.sender.toString() != user_id.toString()){
//                     replyMsg.push({
//                       'conversation_id':replyMsgConvID[tck],
//                       'conversation_rep_id':tv.conversation_id.toString(),
//                       'msg_body':tv.msg_body,
//                       'created_at':tv.created_at,
//                       'msg_id':replyRootMsgID[tck],
//                       'msg_status':tv.msg_status
//                     });
//                   }
//                 }
//               });
//             });


//             var OrreplyMsg = _.orderBy(replyMsg, ['created_at'], ['desc']);
//             var newReplyList = [];
//             var neMsgBody = [];

//             _.forEach(OrreplyMsg, function(cv,ck){
//               if(cv.msg_status != null){
//                 var parti = cv.msg_status;
//                 if(parti.indexOf(user_id.toString()) == -1){
//                   neMsgBody.push({
//                     'conversation_id':cv.conversation_id,
//                     'msg_body':cv.msg_body,
//                     'created_at':cv.created_at,
//                     'msg_id':cv.msg_id,
//                     'msg_type':'reply'
//                   });
//                 }
//               }else{
//                 if(newReplyList.indexOf(cv.conversation_rep_id) == -1){
//                   newReplyList.push(cv.conversation_rep_id);
//                   neMsgBody.push({
//                     'conversation_id':cv.conversation_id,
//                     'msg_body':cv.msg_body,
//                     'created_at':cv.created_at,
//                     'msg_id':cv.msg_id,
//                     'msg_type':'reply'
//                   });
//                 }
//               }

//             });

//             var status = [];
//             var conversation = [];

//             _.forEach(tags, function(v,k){
//               conversation.push(v.conversation_id.toString());
//               _.forEach(peoples, function(valu,key){
//                 if(v.conversation_id.toString() == valu.conversation_id.toString()){
//                   if(v.sender.toString() != user_id.toString()){
//                     status.push({
//                       "conersation_id":v.conversation_id.toString(),
//                       "msg_id":v.msg_id.toString(),
//                       "msg_status":v.msg_status,
//                       "msg":v.msg_body,
//                       "created_at":v.created_at
//                     });
//                   }
//                 }
//               });
//             });

//             var array_elements = [];
//             var msgbodyArray = [];

//             var unique = conversation.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
//             _.forEach(status, function(v,k){
//               if(conversation.indexOf(v.conersation_id) != -1){
//                 if(v.msg_status == null){
//                   array_elements.push(v.conersation_id);
//                   msgbodyArray.push({
//                     'conversation_id':v.conersation_id,
//                     'msg_body':v.msg,
//                     'created_at':v.created_at,
//                     'msg_id':v.msg_id,
//                     'msg_type':'direct'
//                   });
//                 }
//               }
//             });

//             array_elements.sort();
//             var newMsgBoddy = neMsgBody.concat(msgbodyArray);
//             callback({status: true, array_elements:array_elements,msgbodyArray:newMsgBoddy,unique:unique});

//           }
//         });
//       });
//     }
//   });
// };

var getAllUnread = (user_id, callback) =>{

  models.instance.Messages.find({},{ raw: true, allow_filtering: true }, function(err, tags) {
    if(err){
      console.log(err);
    }else{
      var query = {
        participants: { $contains: user_id }
      };

      models.instance.Conversation.find( query, { raw: true, allow_filtering: true }, function(err, peoples) {
        if (err) throw err;

        models.instance.ReplayConv.find({},{ raw: true, allow_filtering: true }, function(err, ReplayConvs) {
          if(err){
            console.log(err);
          }else{

            var replyConvID = []; //reply id as conversation in msg tbl
            var replyMsgConvID = []; //message conversation id which has reply thread
            var replyMsg = []; //message conversation which has reply thread
            var replyRootMsgID = []; //message conversation which has reply thread

            var newrplList = _.sortBy(ReplayConvs, ['rep_id']);

            _.forEach(newrplList, function(rv,rk){
              _.forEach(tags, function(tv,tk){
                if(rv.msg_id.toString() == tv.msg_id.toString()){
                  replyConvID.push(rv.rep_id.toString());
                  replyMsgConvID.push(rv.conversation_id.toString());
                  replyRootMsgID.push(rv.msg_id.toString());
                }
              });
            });

            var replyConvIDunique = replyConvID.filter(function(item, i, ar){ return ar.indexOf(item) === i; });

            _.forEach(replyConvIDunique, function(rcv,tck){
              _.forEach(tags, function(tv,tk){
                if(tv.conversation_id.toString() == rcv){
                  if(tv.sender.toString() != user_id.toString()){
                    replyMsg.push({
                      'conversation_id':replyMsgConvID[tck],
                      'conversation_rep_id':tv.conversation_id.toString(),
                      'msg_body':tv.msg_body,
                      'created_at':tv.created_at,
                      'msg_id':replyRootMsgID[tck],
                      'msg_status':tv.msg_status,
                      'sender_img':tv.sender_img,
                      'sender_name':tv.sender_name
                    });
                  }
                }
              });
            });

            var OrreplyMsg = _.orderBy(replyMsg, ['created_at'], ['desc']);
            var newReplyList = [];
            var neMsgBody = [];

            _.forEach(OrreplyMsg, function(cv,ck){
              if(cv.msg_status != null){
                var parti = cv.msg_status;
                if(parti.indexOf(user_id.toString()) == -1){
                  neMsgBody.push({
                    'conversation_id':cv.conversation_id,
                    'msg_body':cv.msg_body,
                    'created_at':cv.created_at,
                    'msg_id':cv.msg_id,
                    'msg_type':'reply',
                    'sender_img':cv.sender_img,
                    'sender_name':cv.sender_name
                  });
                }
              }else{
                if(newReplyList.indexOf(cv.conversation_rep_id) == -1){
                  newReplyList.push(cv.conversation_rep_id);
                  neMsgBody.push({
                    'conversation_id':cv.conversation_id,
                    'msg_body':cv.msg_body,
                    'created_at':cv.created_at,
                    'msg_id':cv.msg_id,
                    'msg_type':'reply',
                    'sender_img':cv.sender_img,
                    'sender_name':cv.sender_name
                  });
                }
              }

            });

            var status = [];
            var conversation = [];

            _.forEach(tags, function(v,k){
              conversation.push(v.conversation_id.toString());
              _.forEach(peoples, function(valu,key){
                if(v.conversation_id.toString() == valu.conversation_id.toString()){
                  if(v.sender.toString() != user_id.toString()){
                    status.push({
                      "conersation_id":v.conversation_id.toString(),
                      "msg_id":v.msg_id.toString(),
                      "msg_status":v.msg_status,
                      "msg":v.msg_body,
                      "created_at":v.created_at,
                      'sender_img':v.sender_img,
                      'sender_name':v.sender_name
                    });
                  }
                }
              });
            });

            var array_elements = [];
            var msgbodyArray = [];
            var ReadmsgbodyArray = [];

            var unique = conversation.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
            _.forEach(status, function(v,k){
              if(conversation.indexOf(v.conersation_id) != -1){
                if(v.msg_status == null){
                  array_elements.push(v.conersation_id);
                  msgbodyArray.push({
                    'conversation_id':v.conersation_id,
                    'msg_body':v.msg,
                    'created_at':v.created_at,
                    'msg_id':v.msg_id,
                    'msg_type':'direct',
                    'sender_img':v.sender_img,
                    'sender_name':v.sender_name
                  });
                }else{
                  ReadmsgbodyArray.push({
                    'conversation_id':v.conersation_id,
                    'msg_body':v.msg,
                    'created_at':v.created_at,
                    'msg_id':v.msg_id,
                    'msg_type':'read',
                    'sender_img':v.sender_img,
                    'sender_name':v.sender_name
                  });
                }
              }
            });



            array_elements.sort();
            var newMsgBoddy = neMsgBody.concat(msgbodyArray);
            var unreadmsgbody = msgbodyArray;
            var Readmsgbody = ReadmsgbodyArray;
            callback({status: true,
              array_elements:array_elements,
              msgbodyArray:newMsgBoddy,
              unique:unique,
              unreadmsgbody:unreadmsgbody,
              Readmsgbody:Readmsgbody});

          }
        });
      });
    }
  });
};

var getAllUnreadConv = (data, uid, callback) =>{
    var convid = new Set();
    _.forEach(data, function(val, k){
        convid.add(models.uuidFromString(val));
    });
    var convid_array = Array.from(convid);
    var query = {
        conversation_id: {'$in': convid_array}
    };


    models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error, all_msg){
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

            if(amv.has_reply > 0){
                if(msg_has_rep.indexOf(amv.msg_id) == -1)
                    msg_has_rep.push(amv.msg_id);
            }
        });

        // Get all unread replay
        if(msg_has_rep.length){
            models.instance.ReplayConv.find({msg_id:{'$in':msg_has_rep}}, { raw: true, allow_filtering: true }, function(error_rep, rep_con_data){
                if(error_rep) callback({status: false}, error_rep);

                // console.log(rep_con_data.length);
                var rep_con_id = [];
                _.forEach(rep_con_data, function(rcv, rck){
                    rep_con_id.push(rcv.rep_id);
                });

                var query = { conversation_id: {'$in': rep_con_id} };
                models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error_rep, all_rep_msg){
                    if(error_rep) callback({status: false}, error_rep);

                    _.forEach(all_rep_msg, function(amv, amk){
                        if(amv.msg_status == null && amv.sender.toString() != uid)
                            unread_replay.push(amv);
                    });
                    callback({status: true, data: {all_unread, unread_replay, rep_con_data}}, false);
                });
            });
        }else{
            callback({status: true, data: {all_unread, unread_replay, rep_con_data:[]}}, false);
        }
    });
};
var update_delivered_if_need = (data, callback) =>{
    var update_deli_qry = [];
    var update_data = [];
    _.forEach(data, function(val, k){
        if(val.has_delivered == 0){
            var update_query = models.instance.Messages.update(
                {conversation_id: models.uuidFromString(val.conversation_id), msg_id: models.timeuuidFromString(val.msg_id)},
                {has_delivered: 1 },
                {return_query: true}
            );
            update_deli_qry.push(update_query);
            update_data.push(val);
        }
    });
    if(update_deli_qry.length > 0){
        models.doBatch(update_deli_qry, function(err){
            if(err){ throw err;}

            callback({status: true, msgs: update_data});
        });
    }
    else{
        callback({status: false});
    }
};
var getPersonalConversation = (user_id,callback) =>{
  var query = {
    participants: { $contains: user_id },
    group: { $eq: 'no' },
    single: { $eq: 'yes' }
  };

  models.instance.Conversation.find( query, { raw: true, allow_filtering: true }, function(err, conversations) {
    if(err) {
      callback({status: false,err:err});
    }else {
      callback({status: true,conversations:conversations});
    }
  });
};


var getAllSearchMsg = (data,target_text,targetFilter,userid,callback) =>{
  var convid = new Set();
  _.forEach(data, function(val, k){
      convid.add(models.uuidFromString(val));
  });
  var convid_array = Array.from(convid);
  var query = {
      conversation_id: {'$in': convid_array}
  };

  //Query for get msges

  models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error, all_msg){
      if(error) {
        callback({status: false,error:error});
      }else{
        var convList = [];
        if(targetFilter === 'text'){
          //loop using for match text with msg body for search text in whole messages
          _.forEach(all_msg, function(val, k){
            var str = val.msg_body.toLowerCase();
            var target_case = target_text.toLowerCase();
            var res = str.match(target_case);
            if(res != null){
              if(res.index > -1){
                if(convList.indexOf(val.conversation_id.toString()) === -1){
                  convList.push(val.conversation_id.toString());
                }
              }
            }
          });
        }else if(targetFilter === 'flag'){
          //loop using for check flagged data
          var target_case = target_text.toLowerCase();
          _.forEach(all_msg, function(val, k){
            if(val.has_flagged !== null){
              if(target_text != 1){
                var str = val.msg_body.toLowerCase();
                var target_case = target_text.toLowerCase();
                var res = str.match(target_case);
                if(res != null){
                  if(res.index > -1){
                    console.log(val.has_flagged);
                    if(val.has_flagged.indexOf(userid.toString()) !== -1){
                      if(convList.indexOf(val.conversation_id.toString()) === -1){
                        convList.push(val.conversation_id.toString());
                      }
                    }
                  }
                }
              }else{
                if(val.has_flagged.indexOf(userid.toString()) !== -1){
                  if(convList.indexOf(val.conversation_id.toString()) === -1){
                    convList.push(val.conversation_id.toString());
                  }
                }
              }

            }
          });
        }

        callback({status: true,data:convList});
      }
  });
};

var get_one_msg = (data, callback) =>{
    var query = {
        conversation_id: models.uuidFromString(data.conversation_id),
        msg_id: models.timeuuidFromString(data.msg_id)
    }
  models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error, msg){
      if(error) {
        callback({status: false, error:error});
      }else{
        callback({status: true, msg: msg[0]});
      }
  });
};

var url_preview = (data, callback) =>{
  // console.log(data);
  // urlMetadata(data.url).then(
  //   function (metadata) { // success handler
  //     callback(metadata);
  //   },
  //   function (error) { // failure handler
  //     callback(error);
  //   }
  // );


  // var options = {'url': data.url, 'followAllRedirects': true, 'encoding': 'utf8', 'maxRedirects': 20};
  // ogs(options, function (error, results) {
  //   // console.log(681, error);
  //   // console.log(682, results);
  //   if(error) callback({status: false, msg: results});
  //   else callback({status: true, msg: results});
  // });


  (async () => {
    try {
      const {body: html, url} = await got(data.url);
      const metadata = await metascraper({html, url});
      var new_img_name = new Date().getTime() + '.png';
      download(metadata.image, './public/upload/' + new_img_name, function(){
        console.log('710 image download done');
      });
      models.instance.Messages.update({msg_id: models.timeuuidFromString(data.msgid)}, {
          msg_body: '<a href="'+ metadata.url +'" target="_blank">'+ metadata.title +'</a>',
          url_favicon: metadata.logo,
          url_base_title: metadata.publisher,
          url_title: metadata.title,
          url_body: metadata.description,
          url_image: new_img_name
      }, function(err){
          if(err) callback({status: false, body: err});
          callback({status: true, body: metadata});
      });
    } catch (error) {
      callback({status:false, body: error});
    }
  })();
};
var send_todo_msg_acceptance = (from, sender_img, sender_name, conversation_id, msg, attachment, msgtype, activity_id, callback) => {
  var createdat = new Date().getTime();
  var msgid = models.timeuuid();
  // console.log(37, msgid);
  if(isRealString(msg)){
    var uuidconversation_id = models.uuidFromString(conversation_id);
    // console.log(40, uuidconversation_id);
    var uuidfrom = models.uuidFromString(from);
    var imgfile = (typeof attachment === 'undefined')?null:attachment.imgfile;
    var audiofile = (typeof attachment === 'undefined')?null:attachment.audiofile;
    var videofile = (typeof attachment === 'undefined')?null:attachment.videofile;
    var otherfile = (typeof attachment === 'undefined')?null:attachment.otherfile;

    var message = new models.instance.Messages({
        msg_id: msgid,
        msg_body: msg,
        attch_imgfile: imgfile,
        attch_audiofile: audiofile,
        attch_videofile: videofile,
        attch_otherfile: otherfile,
        sender: uuidfrom,
        sender_name: sender_name,
        sender_img: sender_img,
        has_delivered: 0,
        msg_type : msgtype,
        activity_id: activity_id,
        conversation_id: uuidconversation_id
    });

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

var get_conversation_info = (roomName, callback) =>{
  models.instance.Conversation.find({conversation_id: models.timeuuidFromString(roomName) }, function(err, conversationDetail) {
    
    callback(conversationDetail[0].participants);
  });

  
}

var update_userbusy = (arr_participants, is_busy, callback) =>{
  console.log('============> update_userbusy',arr_participants);
  var messid = new Set();

  if(typeof arr_participants=='object'){
    
    _.forEach(arr_participants, function(val, k){
        console.log(val);
        messid.add(models.uuidFromString(val));
    });
  }else{
    messid.add(models.uuidFromString(arr_participants));
  }

  var msgarray = Array.from(messid);
  
  var query = {
      id: {'$in': msgarray}
  };
  
  // console.log('==> update_userbusy', query);

  models.instance.Users.update(query, {
      is_busy: is_busy
  }, function(err){
      if(err){
          callback({status: false});
          throw err;
      }
      callback({status: true});
  });

}

var connect_msgUpdate = (data)=>{
  return new Promise((resolve,reject)=>{
      models.instance.Messages.update({conversation_id: models.uuidFromString(data.conv_id), msg_id: models.timeuuidFromString(data.msg_id)},{msg_body: data.msg_body, edit_status: data.update_at},function (err) {
          if (err) {
              reject(err);
          } else {
              resolve({"msg":"success"});
          }
      });
  });
}



module.exports = {generateMessage, sendNewMsg,
                  sendCallMsg, sendBusyMsg,
                  getUserIsBusy, commit_msg_delete,
                  flag_unflag, add_reac_emoji,
                  view_reac_emoji_list, get_group_lists,
                  update_msg_status_add_viewer, update_one_msg_status_add_viewer,
                  check_reac_emoji_list,
                  delete_reac_emoji, update_reac_emoji,
                  get_messages_tag, hasUserThisTag,
                  hasMessageThisTag, deleteThisTag,
                  getAllUnread, getPersonalConversation,
                  replyId, thread_reply_update,
                  find_reply_list, url_preview,
                  readOldMessage, getAllUnreadConv,
                  update_delivered_if_need,
                  getAllSearchMsg, get_one_msg,
                  send_todo_msg_acceptance,
                  update_userbusy , 
                  get_conversation_info,
                  connect_msgUpdate
                };
