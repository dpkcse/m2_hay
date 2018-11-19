require('./config/config.js');

var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var expressSession = require('express-session')({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
});
var socketIO = require('socket.io');
var sharedsession = require("express-socket.io-session");
// var bootstrap = require('bootstrap');
var index = require('./routes/index');
var signup = require('./routes/signup');
var forgotpassword = require('./routes/forgot-password');
var logout = require('./routes/logout');
var chat = require('./routes/chat');
var hayven = require('./routes/hayven');
var call = require('./routes/call');
var projects = require('./routes/projects');
var quicklists = require('./routes/quicklists');
var polls = require('./routes/polls');
var notification = require('./routes/notification');
var android_api = require('./routes/android_api');
var workspaceSetting = require('./routes/workspaceSetting');
var user_settings = require('./routes/user_settings');
var files = require('./routes/files_main_page');
var files_upload = require('./routes/files');
var hayven_files_list = require('./routes/hayven_files_list');
var contacts = require('./routes/contacts');
var Calendar = require('./routes/calendar');
var BasicView = require('./routes/basic_view_connect');
var BasicViewToDo = require('./routes/basic_to_do');
var BasicCalendar = require('./routes/basic_calendar');
// var fileUpload = require('express-fileupload');

alluserlist = []; // {user_id: '345234rqwerq3w452345452345dfadf', user_fullname: 'User Full Name'}

// Express
var app = express();

// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// app.use(fileUpload({
//   limits: { fileSize: 80 * 1024 * 1024 },
// }));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(expressSession({secret: 'keyboard3245235cat', resave: false, saveUninitialized: false}));
app.use(expressSession);
app.use(express.static("public"));
// Socket.io
var io = socketIO();
app.io = io;
io.use(sharedsession(expressSession, {
    autoSave: true
}));
io.of('/namespace').use(sharedsession(expressSession, {
    autoSave: true
}));

require('./socket/socket.js')(io);
require('./socket/_global.js')(io);
require('./socket/d_socket.js')(io);

app.use('/', index);
app.use('/signup', signup);
app.use('/forgot-password', forgotpassword);
app.use('/logout', logout);
app.use('/chat', chat);
app.use('/hayven', hayven);
app.use('/call', call);
app.use('/projects', projects);
app.use('/quicklists', quicklists);
app.use('/polls', polls);
app.use('/notification', notification);
app.use('/android_api', android_api);
app.use('/settings', workspaceSetting);
app.use('/user_settings', user_settings);
app.use('/files', files);
app.use('/files_upload', files_upload);
app.use('/hayven_files_list', hayven_files_list);
app.use('/contacts', contacts);
app.use('/calendar', Calendar);
app.use('/basic_view_connect', BasicView);
app.use('/basic_to_do', BasicViewToDo);
app.use('/basic_calendar', BasicCalendar);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error', {title: 'Not Found', bodyClass: ''});
    res.send(err.message);
});
// node --max-old-space-size=2000;
module.exports = app;
