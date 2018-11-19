var app = require('express');
var router = app.Router();
var _ = require('lodash');

var {models} = require('./../config/db/express-cassandra');

var isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
}

var createActivity = (activityType, activityTitle, activityDescription, createdBy, endTime, ecosystem, adminList, todoFrom, todoTo, todoReminder, callback) => {
    var adminAccept = [];

    adminAccept.push(createdBy.toString());

    endTime=endTime.split("-");
    var newDate = endTime[1]+"/"+endTime[0]+"/"+endTime[2];
    let clusteringkey = new Date().getTime();
    var activity_id = models.uuid();
    var activity = new models.instance.Activity({
        activity_id: activity_id,
        activity_type: activityType,
        activity_title: activityTitle,
        activity_description:activityDescription,
        activity_created_by: models.uuidFromString(createdBy),
        activity_created_at: clusteringkey,
        activity_is_active: 1,
        activity_start_time: clusteringkey,
        activity_end_time: newDate,
        activity_workspace: ecosystem,
        activity_participants: adminList,
        activity_accepted: adminAccept,
        activity_from: todoFrom,
        activity_to: todoTo,
        activity_has_reminder: todoReminder
    });
    activity.saveAsync().then(function() {
        callback({ status: true, activity_id, clusteringkey: clusteringkey});
    }).catch(function(err) {
        callback({status:false, err: err});
    });
};

var updateDraftActivity = (activityid, clusteringkey, activityTitle, activityDescription, endTime, ecosystem, adminList, todoFrom, todoTo, todoReminder, callback) => {

    endTime = endTime.split("-");
    var newDate = endTime[1] + "/" + endTime[0] + "/" + endTime[2];

    models.instance.Activity.update({
        activity_id: models.uuidFromString(activityid),
        activity_created_at: clusteringkey
    }, {
        activity_title: activityTitle,
        activity_description: activityDescription,
        activity_is_active: 1,
        activity_end_time: newDate,
        activity_workspace: ecosystem,
        activity_participants: { $add: adminList },
        activity_from: todoFrom,
        activity_to: todoTo,
        activity_has_reminder: todoReminder
    }, function (err) {
        if (err) {
            throw err;
            callback({ status: false, err: err });
        } else {
            callback({ status: true, activityid });
        }
    });

};


var getAllTOdo = (useruuid, callback) => {
    var query = {
        activity_participants: { $contains: useruuid },
        activity_is_active: { $eq: 1 }
    };

    models.instance.Activity.find(query, { raw: true, allow_filtering: true }, function (err, activities) {
        if (err) {
            console.log("This is err", err);
            callback({ status: false, err: err });
        } else {
            getDraftActivity(useruuid)
                .then((result) => {
                    callback({ status: true, activities: activities, draft: result.activities });
                }).catch((err) => console.log(err));
        }
    });
};

function getDraftActivity(useruuid) {
    return new Promise((resolve, reject) => {
        var query = {
            activity_created_by: { $eq: models.uuidFromString(useruuid) },
            activity_is_active: { $eq: 2 }
        };
        models.instance.Activity.find(query, { raw: true, allow_filtering: true }, function (err, activities) {
            if (err) {
                reject({ status: false, err: err });
            } else {
                resolve({ status: true, activities: activities });
            }
        });
    });
}


var getActivityDetail = (data, callback) =>{
    models.instance.Activity.findOne({activity_id:models.uuidFromString(data.activity_id)}, function(err, activityDetail){
        if(err){
        console.log("This is err",err);
        callback({status: false, err: err});
        }else{
        callback({status: true, activityDetail: activityDetail});
        }
    });
};

var getChecklist = (data, callback) =>{
    var query = {
        checklist_activity_id: { $eq: models.uuidFromString(data) },
    };

    models.instance.Checklist.find(query,{ raw: true, allow_filtering: true }, function(err, activities) {
        if(err){
            callback({status: false, err: err});
        }else{
            callback({status: true, activities: activities});
        }
    });
};


var insertChecklist = (checkedlist,checklist,activity_id,createdBy,callback) =>{
    var queries = [];
    var checklistids = [];

    _.each(checklist, function(v, k) {

        var checklist_id = models.uuid();
        var checklist = new models.instance.Checklist({
            checklist_id: checklist_id,
            checklist_activity_id: models.uuidFromString(activity_id.toString()),
            checklist_by: models.uuidFromString(createdBy),
            checklist_title: v.replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''),
            checklist_status: checkedlist[v]
        });

        var save_query = checklist.save({return_query: true});
        queries.push(save_query);
        checklistids.push(checklist_id);

    });

    models.doBatch(queries, function(err){
        if(err){ throw err;}
        else {
            callback({status:true,checklistids:checklistids});
        }
    });
};

var updateActivity = (clusteringkey,userid,acti,type,callback) =>{
    if(type == 'pin'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey },{activity_pinned: { $add: [userid] },},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });

    }else if(type == 'unpin'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_pinned: { $remove: [userid] },},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'flag'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey },{activity_has_flagged: { $add: [userid] },},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });

    }else if(type == 'unflag'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_has_flagged: { $remove: [userid] },},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'title'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_title: userid},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    } else if (type == 'noteUp') {
        models.instance.Activity.update({
            activity_id: models.uuidFromString(acti),
            activity_created_at: clusteringkey
        }, {
            activity_description: userid
        }, function (err) {
            if (err) {
                throw err;
                callback({
                    "msg": "fail"
                });
            } else {
                callback({
                    "msg": "success"
                });
            }
        });
    } else if (type == 'checkitem') {
      models.instance.Checklist.update({ checklist_activity_id: models.uuidFromString(clusteringkey), checklist_id: models.uuidFromString(acti) },{checklist_title: userid},function (err) {
          if (err) {
              throw err;
              callback({"msg":"fail"});
          } else {
              callback({"msg":"success"});
          }
      });

    }else if(type == 'addmember'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_participants: { $add: [userid] }},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    } else if (type == 'acceptActivty') {
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey }, { activity_accepted: { $add: [userid] } }, function (err) {
            if (err) {
                throw err;
                callback({ "msg": "fail" });
            } else {
                callback({ "msg": "success" });
            }
        });
    }else if(type == 'removemember'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_participants: { $remove: [userid] }},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'checklistchecked'){
        models.instance.Checklist.update({ checklist_activity_id: models.uuidFromString(clusteringkey), checklist_id: models.uuidFromString(acti)},{ checklist_status:userid },function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'checklistunchecked'){
        models.instance.Checklist.update({checklist_activity_id: models.uuidFromString(clusteringkey), checklist_id: models.uuidFromString(acti)},{ checklist_status: userid},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'duedate'){
        userid=userid.split("-");
        var newDate = userid[1]+"/"+userid[0]+"/"+userid[2];

        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_end_time: newDate},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }else if(type == 'workspace'){
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey  },{activity_workspace: userid},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    } else if (type == 'timenreminder') {
        models.instance.Activity.update({ activity_id: models.uuidFromString(acti), activity_created_at: clusteringkey }, { activity_from: userid["activity_from"], activity_to: userid["activity_to"], activity_has_reminder: userid["activity_reminder"] }, function (err) {
            if (err) {
                throw err;
                callback({ "msg": "fail" });
            } else {
                callback({ "msg": "success" });
            }
        });
    } else if (type == 'acceptActivityFromMsg') {
        activityMsg(userid)
            .then((res) => {
                var query = {
                    conversation_id: { $eq: res.msg.conversation_id },
                    msg_id: res.msg.msg_id
                };
                // console.log(453, query);

                models.instance.Messages.update(query, {
                    activity_id: acti.toString(),
                    msg_body: 'accept'
                }, function (err) {
                    if (err) {
                        callback({ "msg": "fail" });
                        throw err;
                    }
                    callback({ "msg": "success" });
                });
            })
            .catch((err) => {
                console.log(err);
            })
    } else if (type == 'declineActivityFromMsg') {
        console.log(313, userid);
        activityMsg(userid)
        .then((res) => {
            var query = {
                conversation_id: { $eq: res.msg.conversation_id },
                msg_id: res.msg.msg_id
            };
            // console.log(453, query);

            models.instance.Messages.update(query, {
                activity_id: acti.toString(),
                msg_body: 'decline'
            }, function (err) {
                if (err) {
                    callback({ "msg": "fail" });
                    throw err;
                }
                callback({ "msg": "success" });
            });
        })
        .catch((err) => {
            console.log(err);
        })
    }else if (type == 'completed') {

        models.instance.Activity.update({
            activity_id: models.uuidFromString(acti),
            activity_created_at: clusteringkey
        }, {
            activity_is_active: (userid > -1 ? userid : 0)
        }, function (err) {
            if (err) {

                throw err;
                callback({
                    "msg": "fail"
                });
            } else {
                if (userid > -1) {
                    getChecklist(acti, (response) => {
                        if (response.activities != undefined) {
                            var mqueries = [];
                            _.each(response.activities, function (v, k) {
                                var update_query = models.instance.Checklist.update({
                                    checklist_activity_id: models.uuidFromString(acti),
                                    checklist_id: v.checklist_id
                                }, {
                                    checklist_status: 1
                                }, {
                                    return_query: true
                                });
                                mqueries.push(update_query);
                            });

                            models.doBatch(mqueries, function (err) {
                                if (err) {
                                    throw err;
                                } else {
                                    callback({
                                        "msg": "success"
                                    });
                                }
                            });
                        }
                    });
                } else {
                    callback({
                        "msg": "success"
                    });
                }

            }
        });
    } else if (type == 'incomplete') {
        models.instance.Activity.update({
            activity_id: models.uuidFromString(acti),
            activity_created_at: clusteringkey
        }, {
                activity_is_active: (userid > -1 ? userid : 1)
            }, function (err) {
                if (err) {
                    throw err;
                    callback({
                        "msg": "fail"
                    });
                } else {
                    if (userid > -1) {
                        getChecklist(acti, (response) => {
                            if (response.activities != undefined) {
                                var mqueries = [];
                                _.each(response.activities, function (v, k) {
                                    var update_query = models.instance.Checklist.update({
                                        checklist_activity_id: models.uuidFromString(acti),
                                        checklist_id: v.checklist_id
                                    }, {
                                            checklist_status: 0
                                        }, {
                                            return_query: true
                                        });
                                    mqueries.push(update_query);
                                });

                                models.doBatch(mqueries, function (err) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        callback({
                                            "msg": "success"
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        callback({
                            "msg": "success"
                        });
                    }
                }
            });
    }else if( type == 'delete_to_do'){
        models.instance.Activity.delete({activity_created_at:clusteringkey, activity_id: models.uuidFromString(acti)},function (err) {
            if (err) {
                throw err;
                callback({"msg":"fail"});
            } else {
                callback({"msg":"success"});
            }
        });
    }
}

var todosearch = (userid,type,list,callback) =>{
    if(type = 'flag'){

        if(list.length > 0){
            var ids = new Set();
            _.forEach(list, function(val, k){
                ids.add(models.uuidFromString(val));
            });
            var activity_list = Array.from(ids);
            var query = {
                activity_id: {'$in': activity_list}
            };
        }else{
            var query = {
                activity_has_flagged: { $contains: userid }
            };
        }

        models.instance.Activity.find(query,{ raw: true, allow_filtering: true }, function(err, activities) {
            if(err){
                throw err;
                callback({status: false, err: err});
            }else{
                callback({status: true, activities: activities});
            }
        });
    }
}
var deleteCheclList = (checklist_id, clusteringkey, callback) => {

    var query_object = {
        checklist_id: models.uuidFromString(checklist_id),
        checklist_activity_id: models.uuidFromString(clusteringkey),
    };

    models.instance.Checklist.delete(query_object, function (err) {
        if (err) {
            throw err;
            callback({
                status: false
            });
        } else {
            callback({
                status: true
            });
        }
    });
};

var getAllActivityhMsg = (data, target_text, targetFilter, userid, callback) => {
    var activityids = new Set();
    _.forEach(data, function (val, k) {
        activityids.add(models.uuidFromString(val));
    });
    var activityids_array = Array.from(activityids);
    var query = {
        checklist_activity_id: {
            '$in': activityids_array
        }
    };

    //Query for get msges
    models.instance.Checklist.find(query, {
        raw: true,
        allow_filtering: true
    }, function (error, all_msg) {
        if (error) {
            callback({
                status: false,
                error: error
            });
        } else {
            var convList = [];
            if (targetFilter === 'text') {
                //loop using for match text with msg body for search text in whole messages
                _.forEach(all_msg, function (val, k) {
                    var str = val.checklist_title.toLowerCase();
                    var target_case = target_text.toLowerCase();
                    var res = str.match(target_case);
                    if (res != null) {
                        if (res.index > -1) {
                            if (convList.indexOf(val.checklist_activity_id.toString()) === -1) {
                                convList.push(val.checklist_activity_id.toString());
                            }
                        }
                    }
                });
            }
            callback({
                status: true,
                data: convList
            });
        }
    });
  };
var get_messages_tag = (conversation_id, user_id, callback) => {
    models.instance.MessagesTag.find({ conversation_id: models.uuidFromString(conversation_id), tagged_by: models.uuidFromString(user_id) }, { raw: true, allow_filtering: true }, function (err, tags) {
        if (err) {
            callback({ status: false, err: err });
        } else {
            activityFiles(conversation_id)
                .then((response) => {
                    callback({ status: true, tags: tags, files: response.all_msg });
                }).catch((error) => {
                    console.log(error);
                });
        }
    });
};

function activityMsg(msgid) {
    return new Promise((resolve, reject) => {
        var query = {
            msg_id: models.timeuuidFromString(msgid)
        };

        models.instance.Messages.findOne(query, { raw: true, allow_filtering: true }, function (error, all_msg) {
            if (error) {
                reject({ status: false, error: error })
            } else {
                resolve({ status: true, msg: all_msg })
            }

        });
    });
}

function allActivityMsg(conversation_id, activity_id) {
    return new Promise((resolve, reject) => {
        var query = {
            conversation_id: { $eq: models.uuidFromString(conversation_id) },
            activity_id: { $eq: activity_id }
        };

        models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function (error, all_msg) {
            if (error) {
                reject({ status: false, error: error })
            } else {
                resolve({ status: true, msg: all_msg })
            }

        });
    });
}

function activityFiles(activityID) {
    return new Promise((resolve, reject) => {

        var query = {
            activity_id: { $eq: models.uuidFromString(activityID) }
        };

        models.instance.ActivityMessages.find(query, { raw: true, allow_filtering: true }, function (error, all_msg) {
            if (error) {
                reject({ status: false, error: error })
            } else {
                resolve({ status: true, all_msg: all_msg })
            }

        });
    });
}

var get_myTags = (conversation_id, user_id, callback) => {
    models.instance.Tag.find({
        tagged_by: models.uuidFromString(user_id),
        type: "TODO"
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

var getAllCompletedActivity = (user_id,callback) =>{
    models.instance.Activity.find({activity_created_by: models.uuidFromString(user_id),activity_is_active:0}, { allow_filtering: true }, function(tagserr, tags){
        if(tagserr){
            callback({status: false, err: tagserr});
        }else{
            callback({status: true, activities: tags});
        }
    });
};


var draftActivity = (activityType, activityTitle, createdBy, ecosystem, adminList, status, callback) => {

    var activity_id = models.uuid();
    let clusteringkey = new Date().getTime();
    var adminAccept = [];
    adminAccept.push(createdBy.toString());

    var activity = new models.instance.Activity({
        activity_id: activity_id,
        activity_type: activityType,
        activity_title: activityTitle,
        activity_created_by: models.uuidFromString(createdBy),
        activity_created_at: clusteringkey,
        activity_is_active: status,
        activity_start_time: clusteringkey,
        activity_workspace: ecosystem,
        activity_participants: adminList,
        activity_accepted: adminAccept
    });
    activity.saveAsync().then(function () {
        callback({ status: true, activity_id, clusteringkey: clusteringkey});
    }).catch(function (err) {
        callback({ status: false, err: err });
    });
};

var saveNotification =(data,callback)=>{
    callback(data);
}

var saveCokkeiFiles = (data, callback) => {
    var createdat = new Date().getTime();
    var msgid = models.timeuuid();
    // console.log(37, msgid);
    if (isRealString(data.text)) {
        var uuidconversation_id = models.uuidFromString(data.activity_id);
        var uuidfrom = models.uuidFromString(data.sender_id);

        var message = new models.instance.ActivityMessages({
            msg_id: msgid,
            msg_body: data.text,
            attch_imgfile: data.imgfile,
            attch_audiofile: data.audiofile,
            attch_videofile: data.videofile,
            attch_otherfile: data.otherfile,
            sender: uuidfrom,
            sender_name: data.sender_name,
            sender_img: data.sender_img,
            has_delivered: 0,
            activity_id: uuidconversation_id
        });
        message.saveAsync()
            .then(function (res) {
                callback({ status: true, msg: message });
            })
            .catch(function (err) {
                callback({ status: false, err: err });
            });
    } else {
        callback({ status: false, err: 'Message formate not supported.' });
    }
};

var UpdatecokkieFiles = (data, callback) => {
    
    var query_object = {
        activity_id: { $eq: models.uuidFromString(data.activity_id) },
        msg_id: { $eq: models.timeuuidFromString(data.msg_id) }
    };

    var update_values_object = {
        attch_imgfile: { $add: data.imgfile },
        attch_audiofile: { $add: data.audiofile },
        attch_videofile: { $add: data.videofile },
        attch_otherfile: { $add: data.otherfile }
    };

    models.instance.ActivityMessages.update(query_object, update_values_object, function (err) {
        if (err) {
            callback({ "msg": "fail" });
            throw err;
        }
        callback({ "msg": "success" });
    });
}



module.exports = {
    createActivity,
    getAllTOdo,
    getActivityDetail,
    insertChecklist,
    getChecklist,
    updateActivity,
    todosearch,
    deleteCheclList,
    getAllActivityhMsg,
    get_messages_tag,
    get_myTags,
    getAllCompletedActivity,
    draftActivity,
    updateDraftActivity,
    saveNotification,
    allActivityMsg,
    saveCokkeiFiles,
    UpdatecokkieFiles
};
