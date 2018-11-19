var express = require('express');
var bcrypt = require('bcryptjs');
var FCM = require('fcm-node');
var multer = require('multer');
var fcm = new FCM('AAAAwSuL-Gg:APA91bGQeZg_iF_nu7zWvGq4XfkPKRas5H8T8BVKL3Ve8o5HqKHQh2vMcWZYL4W5kl1fUPqd8osSP4EXNA59Y2QstNSd1S0MoptoXRCusSia1-ql62fapg8NT7tRlAuxBHRnEqeNxE4c');
var _ = require('lodash');
var moment = require('moment');
var router = express.Router();
var inArray = require('in-array');
var {models} = require('./../config/db/express-cassandra');
var {passwordToHass, passwordToCompare} = require('./../utils/hassing');
var {getActiveUsers} = require('./../utils/chatuser');
var {saveConversation, findConversationHistory,checkAdmin,createPersonalConv,check_only_Creator_or_admin} = require('./../utils/conversation');
var {
  generateMessage,
  sendNewMsg,
  sendBusyMsg,
  commit_msg_delete,
  flag_unflag,
  add_reac_emoji,
  view_reac_emoji_list,
  get_group_lists,
  update_msg_status_add_viewer,
  check_reac_emoji_list,
  delete_reac_emoji,
  update_reac_emoji,
  get_messages_tag,
  getAllUnread,
  getPersonalConversation,
  replyId
} = require('./../utils/message');

var {
  getAllConversation,
  getAllMsg,
  set_status
} = require('./../utils/android');

// creates a configured middleware instance
// destination: handles destination
// filenane: allows you to set the name of the recorded file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/upload/`))
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname.replace(path.extname(file.originalname), '@') +Date.now() +  path.extname(file.originalname));
    }
});

// utiliza a storage para configurar a instância do multer
const upload = multer({ storage });


/* GET login page. */
router.get('/', function(req, res, next) {
  if(req.session.login){
    res.redirect('/hayven');
  } else {
    res.send('This is android new api https://27.147.195.222:2267');
  }
});

/* POST login listing. */
router.post('/login', function(req, res, next) {
  models.instance.Users.find({}, {raw:true, allow_filtering: true}, function(err, users){
      if(err) throw err;
      //user is an array of plain objects with only name and age
      var alluserlist = [];
      var user = [];
      var msg = '';
      _.each(users, function(v,k){
        alluserlist.push({id: v.id, dept: v.dept, designation: v.designation, email: v.email, fullname: v.fullname, img: v.img});

        // Removing the old gcm_id if any
        var query_object = {id: v.id};
        var update_values_object = {gcm_id: null};
        var options = {conditions: {gcm_id: req.body.gcm_id}};
        if(req.body.gcm_id == v.gcm_id && req.body.email != v.email){
          models.instance.Users.update(query_object, update_values_object, options, function(err){
              if(err) console.log(err);
              else console.log('Removing the old gcm_id if any');
          });
        }
        // End of removing the old gcm_id if any

        if(req.body.email == v.email){
          if(passwordToCompare(req.body.password, v.password)){
            msg = "true";
            user = {id: v.id, dept: v.dept, designation: v.designation, email: v.email, fullname: v.fullname, img: v.img};

            query_object = {id: v.id};
            update_values_object = {gcm_id: req.body.gcm_id};
            options = {conditions: {email: req.body.email}};
            models.instance.Users.update(query_object, update_values_object, options, function(err){
                if(err) console.log(err);
                else console.log('Successfully update the gcm id');
            });
          }else{
            msg = 'Password does not match';
          }
        }
      });
      if(msg == ""){
        res.send({alluserlist: [], user: {}, msg: "Email address is invalid"});
      }
      else if(msg == "Password does not match"){
        res.send({alluserlist: [], user: {}, msg: "Password does not match"});
      }
      else{
        // Get all conversations
        getAllConversation(user.id.toString(),(result)=>{
          if(result.status){
            var conversations = result.conversations;
            var myConversationList = [] // keep all conversatons in this array
            var conversationTitle = {};
            var conversationType = {};
            var conversationWith = {};
            var conversationImage = {};
            var userName = {};
            var userImg = {};
            var myConversationID = "";

            _.each(alluserlist, function(users,k){
              userName[users.id] = users.fullname;
              userImg[users.id] = users.img;
            });

            //Get conversation detail along with user table for further user list to android
            if(result.conversations.length > 0){
              _.each(result.conversations, function(conversations,k){
                if(myConversationList.indexOf(conversations.conversation_id.toString()) === -1){

                  myConversationList.push(conversations.conversation_id.toString());
                  conversationTitle[conversations.conversation_id.toString()] = conversations.title;
                  conversationType[conversations.conversation_id.toString()] = conversations.single;
                  conversationImage[conversations.conversation_id.toString()] = conversations.conv_img;
                  if(conversations.single == 'yes'){
                    if(conversations.participants.length == 1){
                      myConversationID = conversations.conversation_id.toString();
                    }else{
                      _.forEach(conversations.participants, function(pv, pk){
                        if(pv !== null && pv.toString() !== user.id.toString()){
                          conversationWith[conversations.conversation_id.toString()] = pv;
                        }
                      });
                    }
                  }
                }
              });

              if(myConversationList.length > 0){
                getAllMsg(myConversationList,(result)=>{

                  if(result.status){

                    var all_unread = [];
                    var all_message = [];
                    var counts = {};
                    var last_conversation_id = [];
                    var androidUserList = [];

                    // Push all messages
                    _.forEach(result.data, function(amv, amk){
                      if(amv.length>0){
                        _.each(amv, function(mv,mk){
                          all_message.push(mv);
                        });
                      }
                    });

                    // Get all unread message
                    var all_message_orderBy = _.orderBy(all_message, ['created_at'], ['desc']);

                    _.forEach(all_message_orderBy, function(amv, amk){
                      if(amv.msg_status == null && amv.sender.toString() != user.id.toString()){
                          all_unread.push(amv);
                      }
                    });

                    //Count unread message and push it to counts array
                    all_unread.forEach(function(x) {
                      counts[x.conversation_id.toString()] = (counts[x.conversation_id.toString()] || 0)+1;
                    });

                    //Get All last Message
                    _.forEach(all_message_orderBy, function(amv, amk){
                      if(last_conversation_id.indexOf(amv.conversation_id.toString()) === -1){
                        last_conversation_id.push(amv.conversation_id.toString());
                        // all_last_message.push(amv);
                        if(amv.conversation_id.toString() !== myConversationID){
                          androidUserList.push({
                            'conversation_id':amv.conversation_id,
                            'conversation_type':(conversationType[amv.conversation_id.toString()] == 'yes' ? 'Personal': 'Group'),
                            'conversation_title': (conversationType[amv.conversation_id.toString()] == 'yes' ? userName[conversationWith[amv.conversation_id.toString()]] : conversationTitle[amv.conversation_id.toString()]),
                            'msg_body':amv.msg_body,
                            'created_at':amv.created_at,
                            'msg_id':amv.msg_id,
                            'msg_type':amv.msg_type,
                            'sender_img':(conversationType[amv.conversation_id.toString()] == 'yes' ? userImg[conversationWith[amv.conversation_id.toString()]]: conversationImage[amv.conversation_id.toString()]),
                            'sender_name':amv.sender_name,
                            'totalUnread': (counts[amv.conversation_id.toString()] > 0 ? counts[amv.conversation_id.toString()] : 0)
                          });
                        }

                      }
                    });


                    console.log(210,androidUserList.length);

                    res.send({
                      alluserlist: alluserlist,
                      conversations:conversations,
                      user: user,
                      msg: msg,
                      myUserList:androidUserList
                    });

                  }else{
                    console.log(result);
                  }
                });
              }
            }else{
              res.send({
                alluserlist: alluserlist,
                conversations:'',
                user: user,
                msg: msg,
                myUserList:''
              });
            }
          }else{
            console.log(result);
          }
        });
      }
  });
});

/* after login reload all data by user id. */
router.post('/reload_conversation', function(req, res, next) {
  models.instance.Users.find({}, {raw:true, allow_filtering: true}, function(err, users){
      if(err) throw err;
      //user is an array of plain objects with only name and age
      var alluserlist = [];
      var user = [];
      var msg = "true";
      _.each(users, function(v,k){
        alluserlist.push({id: v.id, dept: v.dept, designation: v.designation, email: v.email, fullname: v.fullname, img: v.img});
        if(v.id.toString() == req.body.id)
          user = {id: v.id, dept: v.dept, designation: v.designation, email: v.email, fullname: v.fullname, img: v.img};
      });

      // Get all conversations
      getAllConversation(user.id.toString(),(result)=>{
        if(result.status){
          var conversations = result.conversations;
          var myConversationList = [] // keep all conversatons in this array
          var conversationTitle = {};
          var conversationType = {};
          var conversationWith = {};
          var conversationImage = {};
          var userName = {};
          var userImg = {};
          var myConversationID = "";

          _.each(alluserlist, function(users,k){
            userName[users.id] = users.fullname;
            userImg[users.id] = users.img;
          });

          //Get conversation detail along with user table for further user list to android
          if(result.conversations.length > 0){
            _.each(result.conversations, function(conversations,k){
              if(myConversationList.indexOf(conversations.conversation_id.toString()) === -1){

                myConversationList.push(conversations.conversation_id.toString());
                conversationTitle[conversations.conversation_id.toString()] = conversations.title;
                conversationType[conversations.conversation_id.toString()] = conversations.single;
                conversationImage[conversations.conversation_id.toString()] = conversations.conv_img;
                if(conversations.single == 'yes'){
                  if(conversations.participants.length == 1){
                    myConversationID = conversations.conversation_id.toString();
                  }else{
                    _.forEach(conversations.participants, function(pv, pk){
                      if(pv !== null && pv.toString() !== user.id.toString()){
                        conversationWith[conversations.conversation_id.toString()] = pv;
                      }
                    });
                  }
                }
              }
            });

            if(myConversationList.length > 0){
              getAllMsg(myConversationList,(result)=>{

                if(result.status){

                  var all_unread = [];
                  var all_message = [];
                  var counts = {};
                  var last_conversation_id = [];
                  var androidUserList = [];

                  // Push all messages
                  _.forEach(result.data, function(amv, amk){
                    if(amv.length>0){
                      _.each(amv, function(mv,mk){
                        all_message.push(mv);
                      });
                    }
                  });

                  // Get all unread message
                  var all_message_orderBy = _.orderBy(all_message, ['created_at'], ['desc']);

                  _.forEach(all_message_orderBy, function(amv, amk){
                    if(amv.msg_status == null && amv.sender.toString() != user.id.toString()){
                        all_unread.push(amv);
                    }
                  });

                  //Count unread message and push it to counts array
                  all_unread.forEach(function(x) {
                    counts[x.conversation_id.toString()] = (counts[x.conversation_id.toString()] || 0)+1;
                  });

                  //Get All last Message
                  _.forEach(all_message_orderBy, function(amv, amk){
                    if(last_conversation_id.indexOf(amv.conversation_id.toString()) === -1){
                      last_conversation_id.push(amv.conversation_id.toString());
                      // all_last_message.push(amv);
                      if(amv.conversation_id.toString() !== myConversationID){
                        androidUserList.push({
                          'conversation_id':amv.conversation_id,
                          'conversation_type':(conversationType[amv.conversation_id.toString()] == 'yes' ? 'Personal': 'Group'),
                          'conversation_title': (conversationType[amv.conversation_id.toString()] == 'yes' ? userName[conversationWith[amv.conversation_id.toString()]] : conversationTitle[amv.conversation_id.toString()]),
                          'msg_body':amv.msg_body,
                          'created_at':amv.created_at,
                          'msg_id':amv.msg_id,
                          'msg_type':amv.msg_type,
                          'sender_img':(conversationType[amv.conversation_id.toString()] == 'yes' ? userImg[conversationWith[amv.conversation_id.toString()]]: conversationImage[amv.conversation_id.toString()]),
                          'sender_name':amv.sender_name,
                          'totalUnread': (counts[amv.conversation_id.toString()] > 0 ? counts[amv.conversation_id.toString()] : 0)
                        });
                      }

                    }
                  });


                  console.log(356,androidUserList.length);

                  res.send({
                    alluserlist: alluserlist,
                    conversations:conversations,
                    user: user,
                    msg: msg,
                    myUserList:androidUserList
                  });

                }else{
                  console.log(result);
                }
              });
            }
          }else{
            res.send({
              alluserlist: alluserlist,
              conversations:'',
              user: user,
              msg: msg,
              myUserList:''
            });
          }
        }else{
          console.log(result);
        }
      });
  });
});


/* Send fcm . */
/* Send fcm . */
router.post('/fcm-send', function(req, res, next) {
  var sender_id = req.body.sender_id;
  var reciver_id = models.uuidFromString(req.body.reciver_id);
  var call_type = req.body.call_type;
  var msg = req.body.msg;

  models.instance.Users.find({id: reciver_id}, {raw:true, allow_filtering: true}, function(err, user){
      if(err) throw err;

      if(user[0].gcm_id != null){
        var message = {
            to: user[0].gcm_id,
            data: {
                sender_id: sender_id,
                reciver_id: req.body.reciver_id,
                reciver_token: user[0].gcm_id,
                call_type: call_type,
                msg: msg
            }
        };

        if(call_type == "cancel"){
          set_status(models.uuidFromString(sender_id), reciver_id, 0, (result, err1) =>{
            if(err1) throw err1;
            if(result.status){
              fcm.send(message, function(err, response){
                  if (err) {
                      console.log(err);
                      res.send({status: "FCM Error: ", response: err});
                  } else {
                      res.send({status: "Successfully sent with response: ", response: response, message: message});
                  }
              });
            }
          });
        }
        else if(call_type == "accept") {
          fcm.send(message, function(err, response){
              if (err) {
                  console.log(err);
                  res.send({status: "FCM Error: ", response: err});
              } else {
                  res.send({status: "Successfully sent with response: ", response: response, message: message});
              }
          });
        }
        else {
          if(user[0].is_busy == 1){
            res.send({status: "User is busy"});
          }
          else{
            set_status(models.uuidFromString(sender_id), reciver_id, 1, (result, err1) =>{
              if(err1) throw err1;
              if(result.status){
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                        res.send({status: "FCM Error: ", response: err});
                    } else {
                        res.send({status: "Successfully sent with response: ", response: response, message: message});
                    }
                });
              }
            });
          }
        }
      }
      else{
        res.send({status: "user have no gcm id"});
      }
  });
});


// Url for add member ID in conversation tbl
router.post("/personalConCreate", function(req, res, next) {
  createPersonalConv( req.body.user_id, req.body.targetID, req.body.ecosystem, (result, err) =>{
    if (err) {
      if (err) throw err;
    } else if(result.status){
      // res.send(JSON.stringify(result));
      var conversation_id = result.conversation_id;
      findConversationHistory(conversation_id, (result, error) => {
        if(result.status){
          var conversation_list = _.sortBy(result.conversation, ["created_at"]);
          var unseenId = [];
          _.each(conversation_list, function(vc,kc){
            if(vc.msg_status == null){
              console.log(291,vc.msg_status);
              unseenId.push(vc.msg_id.toString());
            }else{
              var seenId = vc.msg_status;
              if(seenId.indexOf(req.body.user_id) == -1){
                unseenId.push(vc.msg_id.toString());
              }
            }
          });

          if(unseenId.length > 0){
            update_msg_status_add_viewer(unseenId, req.body.user_id, conversation_id.toString(), (result) =>{
              if(result.status){
                res.send({status: true, conversation_id: conversation_id, result: conversation_list});
              }else{
                console.log(result);
              }
            });
          }else{
            res.send({status: true, conversation_id: conversation_id, result: conversation_list});
          }
        }else{
          res.send({status: false, conversation_id: conversation_id, result: []});
        }
      });

    } else {
      res.send(false);
    }
  });
});

// All conversation history
router.post("/conversation_history", function(req, res, next) {
    var conversation_id = models.uuidFromString(req.body.conversation_id);
    findConversationHistory(conversation_id, (result, error) => {
        console.log(515, conversation_id, req.body.user_id);
      if(result.status){
        var conversation_list = _.sortBy(result.conversation, ["created_at"]);
        var unseenId = [];
        _.each(conversation_list, function(vc,kc){
          if(vc.msg_status == null){
            console.log(291,vc.msg_status);
            unseenId.push(vc.msg_id.toString());
          }else{
            var seenId = vc.msg_status;
            if(seenId.indexOf(req.body.user_id) == -1){
              unseenId.push(vc.msg_id.toString());
            }
          }
        });

        if(unseenId.length > 0){
          update_msg_status_add_viewer(unseenId, req.body.user_id, conversation_id.toString(), (result) =>{
            if(result.status){
              res.send({status: true, conversation_id: conversation_id, result: conversation_list});
            }else{
              console.log(result);
            }
          });
        }else{
          res.send({status: true, conversation_id: conversation_id, result: conversation_list});
        }
      }else{
        res.send({status: false, conversation_id: conversation_id, result: []});
      }
    });
});

// Delete a message
router.post('/commit_msg_delete', function(req, res, next){
    commit_msg_delete(req.body.convid, req.body.msgid, req.body.uid, req.body.is_seen, req.body.remove, (result) =>{
      res.json(result);
    });
});

// Flag and Unflag
router.post('/flag_unflag', function(req, res, next){
  flag_unflag(req.body.msgid, req.body.uid, req.body.is_add, req.body.convid, (result) =>{
    res.json(result);
  });
});

module.exports = router;
