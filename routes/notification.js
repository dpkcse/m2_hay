var { saveNotification } = require('./../utils/todo');

function Notification(title,body,user_by,type,type_id,members){
    this.title = title;
    this.body = body;
    this.user_by = user_by;
    this.members = members;
    this.type = type;
    this.type_id = type_id;

}

Notification.prototype.saveNotify = function (callback) {
    var data = {
        title:this.title,
        body:this.body,
        user_by:this.user_by,
        members:this.members,
        type:this.type,
        type_id:this.type_id
    };

    saveNotification(data,(response)=>{
        callback(response);
    });
};

Notification.prototype.getNotification = function () {
    return this.user_by;
};

module.exports = Notification;