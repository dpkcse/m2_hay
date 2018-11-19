var app = require('express');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
const metascraper = require('metascraper');
const got = require('got');
var router = app.Router();

var {models} = require('./../config/db/express-cassandra');

var hayvenjs = [];

var get_conversation = (conversation_id, seartTxt, callback) =>{
  if(seartTxt == 1){
    console.log("Fron true:  "+seartTxt);
    models.instance.Messages.find({conversation_id: conversation_id, $orderby:{ '$desc' :'msg_id' }, $limit:20 }, {raw:true, allow_filtering: true}, function(err, conversation){
      if(err){
        callback({status: false, err: err});
      }else{
        console.log("conversation length:  "+conversation.length);
        callback({status: true, conversation: _.reverse(conversation)});
      }
    });
  }else{
    console.log("Fron false:  "+seartTxt);
    models.instance.Messages.find({conversation_id: conversation_id, $orderby:{ '$desc' :'msg_id' }}, {raw:true, allow_filtering: true}, function(err, conversation){
      if(err){
        callback({status: false, err: err});
      }else{
        console.log("conversation length:  "+conversation.length);
        callback({status: true, conversation: _.reverse(conversation)});
      }
    });
  }
};


var get_messages_tag = (conversation_id, user_id, callback) =>{
  models.instance.MessagesTag.find({conversation_id: models.uuidFromString(conversation_id), tagged_by:models.uuidFromString(user_id) }, {raw:true, allow_filtering: true}, function(err, tags){
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, tags: tags});
    }
  });
};

var get_myTags = (conversation_id, user_id, callback) => {
  models.instance.Tag.find({
    tagged_by: models.uuidFromString(user_id),
    type: "CONNECT"
  }, {
    allow_filtering: true
  }, function (tagserr, tags) {
    if (tagserr) {
      callback({
        status: false,
        err: tagserr
      });
    } else {

      models.instance.Convtag.find({
        conversation_id: models.uuidFromString(conversation_id)
      }, {
        allow_filtering: true
      }, function (err, Ctags) {
        if (tagserr) {
          callback({
            status: false,
            err: tagserr
          });
        } else {
          callback({
            status: true,
            tags: tags,
            Ctags: Ctags
          });
        }
      });
    }
  });
};

hayvenjs["get_conversation"] = (data, callback) => {
  if (data.conversationid != undefined) {
    // console.log('This is hayvenjs', data);
    models.instance.Conversation.find({ conversation_id: models.uuidFromString(data.conversationid) }, function (err, conversationDetail) {
      if (err) throw err;

      get_conversation(models.uuidFromString(data.conversationid), data.seartTxt, (result, error) => {

        models.instance.Pinned.findOne({ user_id: models.uuidFromString(data.user_id), block_id: models.timeuuidFromString(data.conversationid) }, { allow_filtering: true }, function (err, pinnedBlocks) {
          if (err) throw err;

          get_myTags(data.conversationid, data.user_id, (tRes, Terr) => {

            if (Terr) throw Terr;

            var tagID = [];
            var tags = [];
            var condtagsid = [];

            _.each(tRes.Ctags, function (value, key) {
              tagID.push(value.id.toString());
              condtagsid.push(value.tag_id.toString());
            });

            get_messages_tag(data.conversationid, data.user_id, (mtgsRes, mtgsErr) => {

              if (Terr) throw Terr;

              var res_data = {
                conversation_id: data.conversationid,
                conversation_type: data.type,
                conversation: conversationDetail,
                room_id: data.id,
                room_name: data.name,
                room_img: data.img,
                conversation_list: result.conversation,
                totalTags: tRes.tags,
                tags: tagID,
                condtagsid: condtagsid,
                pinnedStatus: pinnedBlocks,
                messagestag: mtgsRes.tags,
                msg: 'success'
              };

              callback(res_data);
            });
          });

        });
      });
    });
  } else {
    callback({ msg: 'fail' });
  }

};

hayvenjs["get_old_msg"] = (data, callback) =>{
    if(data.msg_id != "" && data.conversation_id != ""){
        console.log('msgid : ' + data.msg_id);
        console.log('convid: ' + data.conversation_id);
        $query = {
            conversation_id: models.uuidFromString(data.conversation_id),
            msg_id: {'$lt': models.timeuuidFromString(data.msg_id) },
            $orderby:{ '$desc' :'msg_id' },
            $limit:20
        };

        models.instance.Messages.find($query, {raw:true, allow_filtering: true}, function(err, conversation){
          if(err){
            callback({status: false, err: err});
          }else{
            callback({status: true, old_msgs: conversation});
          }
        });
    }
    else {
        callback({status: false, err: 'Data missing'});
    }
};


// Get all public rooms from db where workspace define
hayvenjs["public_conversation"] = (data, callback) =>{

  var query = {
    group_keyspace: { $eq: data.keySpace },
    single: { $eq: 'no' }
  };

  models.instance.Conversation.find( query, { raw: true, allow_filtering: true },function(err, rooms) {
    if (err) {
      var res_data = {
        staus: false
      };
    }else{

      models.instance.Tag.find( {}, { raw: true, allow_filtering: true },function(terr, tags) {
        if (terr) {
          console.log(terr);
        }else{
          var convID = [];
          var convTag = [];

          _.each(rooms, function(value,key){
            convID.push(value.conversation_id.toString());
          });

          // console.log(170, convID);
          
          // _.each(tags, function(va,ke){
          //   if(convID.indexOf(va.conversation_id.toString()) !== -1){
          //     convTag.push({'cnvID':va.conversation_id.toString(),'title':va.title});
          //   }
          // });

          var res_data = {
            rooms: rooms,
            convTag: convTag,
            staus: true
          };
          callback(res_data);
        }
      });


    }

  });

};

module.exports = {hayvenjs};
