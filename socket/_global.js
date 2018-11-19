var _ = require('lodash');

module.exports = function(io) {
    var app = require('express');
    var router = app.Router();

    io.on('connection', function(socket){
        socket.on('has_login', function(callback){
            if(socket.handshake.session.login === true)
                callback(true);
            else
                callback(false);
        });
    });

    return router;
}
