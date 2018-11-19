var app = require('express');
var router = app.Router();
var _ = require('lodash');

var {models} = require('./../config/db/express-cassandra');

var saveConversation = (created_by, participants, title, callback) => {
  var conversation_id = models.uuid();
  var conversation = new models.instance.Conversation({
    conversation_id: conversation_id,
    created_by: models.uuidFromString(created_by),
    participants: participants,
    title: title
  });
  conversation.saveAsync().then(function() {
    callback({status:true, conversation_id});
  }).catch(function(err) {
    callback({status:false, err: err});
  });
};

var createGroup = (adminList,memberList,groupName,createdBy,ecosystem,grpprivacy,conv_img,callback) =>{
  var conversation_id = models.uuid();
  var conversation = new models.instance.Conversation({
      conversation_id: conversation_id,
      created_by: models.uuidFromString(createdBy),
      group: 'yes',
      group_keyspace:ecosystem,
      privacy:grpprivacy,
      single: 'no',
      participants_admin: adminList,
      participants: memberList,
      title: groupName,
      conv_img : conv_img
  });
  conversation.saveAsync().then(function() {
    callback({status:true, conversation_id});
  }).catch(function(err) {
    callback({status:false, err: err});
  });
};

var findConversationHistory = (conversation_id, callback) =>{
  models.instance.Messages.find({conversation_id: conversation_id}, {raw:true, allow_filtering: true}, function(err, conversation){
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, conversation: conversation});
    }
  });
};

var checkAdmin = (conversation_id,useruuid, callback) =>{
  models.instance.Conversation.find({conversation_id: models.timeuuidFromString(conversation_id),created_by: models.timeuuidFromString(useruuid)}, {raw:true, allow_filtering: true}, function(err, conversation){
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, conversation: conversation});
    }
  });
};

var check_only_Creator_or_admin = (conversation_id, useruuid, callback) =>{
  var query = {
    participants_admin: { $contains: useruuid },
    conversation_id: { $eq: models.uuidFromString(conversation_id) }
  };

  models.instance.Conversation.find(query,{ raw: true, allow_filtering: true }, function(err, conversation) {
    if(err){
      console.log("This is err",err);
      callback({status: false, err: err});
    }else{
      callback({status: true, conversation_id: conversation});
    }
  });
};


var createPersonalConv = (myID, frndID, ecosystem, callback) =>{

  var query = {
    participants: { $contains: myID},
    group: { $eq: 'no' },
    single: { $eq: 'yes' }
  };

  models.instance.Conversation.find(query,{ raw: true, allow_filtering: true }, function(err, conversation) {
    if(err){
      console.log("This is err",err);
      callback({status: false, err: err});
    }else{
      var resultCount = 0;
      var resultArray = 0;
      var ownCount = 0;

      if(myID === frndID){
        _.each(conversation, function(v, k) {
          if(v.participants.length == 1){
            if(v.participants[0]== frndID){
              resultArray = v.conversation_id;
            }
          }else{
            ownCount++;
          }
        });

        if(parseInt(ownCount) === parseInt(conversation.length)){
          var conversation_id = models.uuid();
          var memberList = [myID,frndID];
          var conversation = new models.instance.Conversation({
              conversation_id: conversation_id,
              created_by: models.uuidFromString(myID),
              group: 'no',
              group_keyspace:ecosystem,
              privacy:'private',
              single: 'yes',
              participants: memberList,
              title: 'Personal'
          });
          conversation.saveAsync().then(function() {
            callback({status:true, conversation_id});
          }).catch(function(err) {
            callback({status:false, err: err});
          });
        }else{
          callback({status: true, conversation_id: resultArray});
        }

      }else{
        _.each(conversation, function(v, k) {

          var result = _.find(v.participants, function (str, i) {
            if (str.match(frndID)){
              return true;
            }
          });

          if(result !== undefined){
            resultCount++;
            resultArray = v.conversation_id;
          }
        });

        if(resultCount>0){
          callback({status: true, conversation_id: resultArray});
        }else{
          var conversation_id = models.uuid();
          var memberList = [myID,frndID];
          var conversation = new models.instance.Conversation({
              conversation_id: conversation_id,
              created_by: models.uuidFromString(myID),
              group: 'no',
              group_keyspace:ecosystem,
              privacy:'private',
              single: 'yes',
              participants: memberList,
              title: 'Personal'
          });
          conversation.saveAsync().then(function() {
            callback({status:true, conversation_id});
          }).catch(function(err) {
            callback({status:false, err: err});
          });
        }
      }
    }
  });
};

var findConvDetail = (conversationid, callback) =>{
  models.instance.Conversation.find({conversation_id: models.uuidFromString(conversationid) }, function(err, conversationDetail) {
    if (err) throw err;
    else callback({status:true, conversationDetail: conversationDetail});
  });
};

var saveNewGroup = (conversationMemList,ecosystem,crtUserID, callback) =>{
  var conversation_id = models.uuid();
  var conversation = new models.instance.Conversation({
      conversation_id: conversation_id,
      created_by: models.uuidFromString(crtUserID),
      group: 'yes',
      group_keyspace:ecosystem,
      privacy:'private',
      single: 'no',
      participants: conversationMemList,
      title: 'Group'
  });
  conversation.saveAsync().then(function() {
    callback({status:true, conversation_id});
  }).catch(function(err) {
    callback({status:false, err: err});
  });
};

var updateGroupName = (conversationid,newGroupname, callback) =>{
  var query_object = {conversation_id: models.uuidFromString(conversationid)};
  var gname = (newGroupname == '' ? 'Group':newGroupname);
  var update_values_object = {title: gname};
  var options = {ttl: 86400, if_exists: true};
  models.instance.Conversation.update(query_object, update_values_object, options, function(err){
      if(err) callback({status:false, err: err});
      else callback({status:true});
  });
};

var updateKeySpace = (conversation_id,keySpace, callback) =>{
  var query_object = {conversation_id: models.uuidFromString(conversation_id)};
  var update_values_object = {group_keyspace: keySpace};
  var options = {ttl: 86400, if_exists: true};
  models.instance.Conversation.update(query_object, update_values_object, options, function(err){
      if(err) callback({status:false, err: err});
      else callback({status:true});
  });
};

var updatePrivecy = (conversation_id,grpprivacy, callback) =>{
  var query_object = {conversation_id: models.uuidFromString(conversation_id)};
  var update_values_object = {privacy: grpprivacy};
  var options = {ttl: 86400, if_exists: true};
  models.instance.Conversation.update(query_object, update_values_object, options, function(err){
      if(err) callback({status:false, err: err});
      else callback({status:true});
  });
};

var updateRoomimg = (conversation_id,roomName, callback) =>{
  var query_object = {conversation_id: models.uuidFromString(conversation_id)};
  var update_values_object = {conv_img: roomName};
  var options = {ttl: 86400, if_exists: true};
  models.instance.Conversation.update(query_object, update_values_object, options, function(err){
      if(err) callback({status:false, err: err});
      else callback({status:true});
  });
};

var saveTag = (mstagids, roomid, messgids, created_by, tagTitle, tagType, callback) => {

  var queries = [];
  var tags = [];
  var mtagsid = [];

  _.each(tagTitle, function(v, k) {
    var tag_id = models.uuid();
    var tag = new models.instance.Tag({
      tag_id: tag_id,
      tagged_by: models.uuidFromString(created_by),
      title: v.replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''),
      type: tagType
    });
    var save_query = tag.save({return_query: true});
    queries.push(save_query);
    tags.push(tag_id);

  });

  models.doBatch(queries, function(err){
      if(err){ throw err;}
      else {
        console.log(mstagids);
        if(mstagids.length == 0){
          callback({status:true,tags:tags});
        }else{
            if(messgids.length>0){
              if(mstagids.length > 0){
                var mqueries = [];
                _.each(mstagids, function(v, k) {
                  var update_query = models.instance.MessagesTag.update(
                    {id: models.timeuuidFromString(v)},
                    {tag_title: { $add: tagTitle} },
                    {return_query: true}
                  );
                  mqueries.push(update_query);
                  mtagsid.push(v);
                });
              }else{
                var mqueries = [];
                _.each(messgids, function(v, k) {
                  var mid = models.timeuuid();
                  var mtag = new models.instance.MessagesTag({
                    id: mid,
                    tag_title: tagTitle,
                    tagged_by: models.uuidFromString(created_by),
                    conversation_id: models.uuidFromString(roomid),
                    message_id: models.timeuuidFromString(v)
                  });
                  var msave_query = mtag.save({return_query: true});
                  mqueries.push(msave_query);
                  mtagsid.push(mid);
                });
              }
      
              models.doBatch(mqueries, function(err){
                if(err){ throw err;}
                else {
                  callback({status:true,tags:tags,mtagsid:mtagsid});
                }
              });
            }else{
              callback({status:true,tags:tags});
            }
        }

      }
  });
};

var filesTag = (message_id,conversation_id,tagged_by,tag_title,callback) =>{
  var mid = models.timeuuid();
  var mtag = new models.instance.MessagesTag({
    id: mid,
    tag_title: tag_title,
    tagged_by: models.uuidFromString(tagged_by),
    conversation_id: models.uuidFromString(conversation_id),
    message_id: message_id
  });

  mtag.saveAsync().then(function() {
    callback({status:true, id:mid});
  }).catch(function(err) {
    callback({status:false, err: err});
  });
}

// var findMsgIDs = (roomid,userid,callback)=>{
//   models.instance.MessagesTag.find({conversation_id: models.uuidFromString(roomid),tagged_by: models.uuidFromString(userid)}, function(err, conversationDetail) {
//     if (err) throw err;
//     else callback({status:true, conversationDetail: conversationDetail});
//   });
// }

var saveConTag = (tagid, roomid, callback) => {

  var queries = [];
  var tags = [];
  var roottags = [];
  var messagesTagQuries = [];

  _.each(tagid, function(v, k) {
    var id = models.uuid();
    var tag = new models.instance.Convtag({
      id: id,
      tag_id: v,
      conversation_id: models.uuidFromString(roomid)
    });

    var save_query = tag.save({return_query: true});
    queries.push(save_query);
    
    //Loop for save tag to users or rooms in tag table (END HERE)
    tags.push(id);
    roottags.push(v);
  });

  models.doBatch(queries, function(err){
      if(err){ throw err;}
      else {
        callback({status:true,tags:tags,roottags:roottags});
      }
  });

};

var saveConvD = (mstagids,tagTitle,tag_id,roomID, callback) => {
  var mtagsid = [];
  var id = models.uuid();
  var tag = new models.instance.Convtag({
    id: id,
    tag_id: models.uuidFromString(tag_id),
    conversation_id: models.uuidFromString(roomID)
  });
  tag.saveAsync().then(function() {
        if(mstagids.length == 0){
          callback({status:true,id:id,rootid:tag_id});
        }else{
          if(mstagids.length > 0){
            var mqueries = [];
            _.each(mstagids, function(v, k) {
              var update_query = models.instance.MessagesTag.update(
                {id: models.timeuuidFromString(v)},
                {tag_title: { $add: [tagTitle]} },
                {return_query: true}
              );
              mqueries.push(update_query);
              mtagsid.push(v);
            });

            models.doBatch(mqueries, function(err){
              if(err){ throw err;}
              else {
                callback({status:true,id:id,rootid:tag_id});
              }
            });
          }
        }
    
  }).catch(function(err) {
    callback({status:false, err: err});
  });
};

var findtag = (conversation_id,title, callback) =>{
  models.instance.Tag.find({tagged_by: models.uuidFromString(conversation_id),title: title}, {raw:true, allow_filtering: true}, function(err, tagDet){
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, tagDet: tagDet});
    }
  });
};

var getAllTagData = (tagid, callback) =>{
  models.instance.Convtag.find({tag_id: models.uuidFromString(tagid)}, {raw:true, allow_filtering: true}, function(err, tagDet){
    if(err){
      callback({status: false, err: err});
    }else{
      callback({status: true, tagDet: tagDet});
    }
  });
};

var getAllTagsforList = (myconversation_list,callback) =>{
  var c_id = new Set();
  _.forEach(myconversation_list, function(val, k){
    c_id.add(models.uuidFromString(val));
  });
  var msgarray = Array.from(c_id);
  var promises = [];
  var itemRows = msgarray;
  for(var i = 0; i < itemRows.length; i++) {
    var id = itemRows[i];
    var p = new Promise(function(resolve, reject){dbData(id, resolve, reject);});
    promises.push(p);
  }
  Promise.all(promises).then(function(data) {
    callback({status:true, data:data});
  });
}

var dbData = (id, resolve, reject)=>{
    
  var query = {
      conversation_id: {'$eq': id}
  };

  models.instance.Convtag.find(query, { raw: true, allow_filtering: true }, function(error, all_msg){
      if(error) {
          return reject();
      }else{
          return resolve(all_msg);
      }
  })
}


var deleteUnusedTag = (tagid, callback) =>{
  var query_object = {
    tag_id: models.timeuuidFromString(tagid)
  };

  models.instance.Tag.delete(query_object, function(err){
    if(err) {
      throw err;
      callback({status: false});
    }else {
      callback({status: true});
    }
  });
};


function checkParticipants(conversation_id) {
  console.log("+++++++++++++++", conversation_id);
  return new Promise((resolve, reject) => {
    models.instance.Conversation.findOne({ conversation_id: models.uuidFromString(conversation_id) }, { raw: true, allow_filtering: true }, function (err, conversation) {
      console.log("**************", conversation);
      if (err) {
        reject({ status: false, err: err });
      } else {
        resolve({ status: true, conversation: conversation });
      }
    });
  });
}


module.exports = {
  saveConversation,
  findConversationHistory,
  createGroup,
  checkAdmin,
  createPersonalConv,
  check_only_Creator_or_admin,
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
  deleteUnusedTag,
  checkParticipants
};
