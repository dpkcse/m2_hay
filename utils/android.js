var app = require('express');
var router = app.Router();
var _ = require('lodash');

var {models} = require('./../config/db/express-cassandra');

//Get All conversations by userid

var getAllConversation = (myID,callback) => {
    var query = {
          participants: { $contains: myID }
        };
    
    models.instance.Conversation.find( query, { raw: true, allow_filtering: true }, function(err, conversations) {
        if (err){
            callback({status:false, err});
        }else{
            callback({status:true, conversations});
        }
    })
};

var getAllMsg = (convArray,callback) => {
    
    var convid = new Set();
    _.forEach(convArray, function(val, k){
        convid.add(models.uuidFromString(val));
    });
    var convid_array = Array.from(convid);
    
    var promises = [];
	var itemRows = convid_array;
	for(var i = 0; i < itemRows.length; i++) {
		var id = itemRows[i];
		var p = new Promise(function(resolve, reject){dbData(id, resolve, reject);});
		promises.push(p);
	}
	Promise.all(promises).then(function(data) {
		callback({status:true, data:data});
    });
};

var dbData = (id, resolve, reject)=>{
    
    var query = {
        conversation_id: {'$eq': id}
    };

    models.instance.Messages.find(query, { raw: true, allow_filtering: true }, function(error, all_msg){
        if(error) {
            return reject();
        }else{
            return resolve(all_msg);
        }
    })
}

var set_status = (sender_id, reciver_id, status, callback) => {
  var uuids = new Set();
  uuids.add(sender_id);
  uuids.add(reciver_id);
  var uuidsarray = Array.from(uuids);
  var query = {id: {'$in': uuidsarray}};

  models.instance.Users.update(query, {
      is_busy: status
  }, function(err){
      if(err){
        // console.log(1149);
        callback({status: false});
        throw err;
      }
      // console.log(1153, query);
      callback({status: true});
  });
};

module.exports = {
    getAllConversation,
    getAllMsg,
    set_status
};
