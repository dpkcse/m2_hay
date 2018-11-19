var _ = require('lodash');
module.exports = function (io) {
    var app = require('express');
    var router = app.Router();
    io.on('connection', function (socket) {
        socket.on('checklistBrdcast', function (message,callback) {
            socket.broadcast.emit('new_checklist', message); // this emit receive all users except me
            callback({'msg':'success'});
        });
    });
    return router;
}
