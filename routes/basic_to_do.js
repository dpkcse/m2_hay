var express = require('express');
var moment = require('moment');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var highlight = require('highlight');
var _ = require('lodash');
var inArray = require('in-array');

var {models} = require('./../config/db/express-cassandra');
var {getActiveUsers} = require('./../utils/chatuser');
var {
  getAllTOdo
  } = require('./../utils/todo');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve('./public/user_uploads/'))
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + file.originalname.replace(path.extname(file.originalname), '_') + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

/* GET listing. */
router.get('/', function(req, res, next) {
  if(req.session.login){
    getActiveUsers((userdata, user_error) =>{
      if(user_error) throw user_error;
        //user is an array of plain objects with only name and age
        var all_users = [];
        if(userdata.status){
          _.each(userdata.users, function(row, key){
              all_users.push({
                  id: row.id,
                  createdat: row.createdat,
                  dept: row.dept,
                  designation: row.designation,
                  email: row.email,
                  fullname: row.fullname,
                  gcm_id: row.gcm_id,
                  img: row.img,
                  is_active: row.is_active,
                  is_busy: row.is_busy
              });
          });
        }

        getAllTOdo(req.session.user_id, (response,error)=>{
          if(response.status){

            var activities = _.orderBy(response.activities, ["activity_created_at"], ["desc"]);
            var draftactivities = _.orderBy(response.draft, ["activity_created_at"], ["desc"]);
            var mytdoList = {};
            var clusteringKey = {};
            var overdue = [];
            var pinned = [];
            var normaltodo = [];

            var now = moment(new Date()); //todays date
            _.each(activities, function(todo,ke){

              clusteringKey[todo.activity_id] = todo.activity_created_at;

              mytdoList[todo.activity_id] = {
                'todoid': todo.activity_id,
                'reminder_time': todo.activity_has_reminder,
                'todo_members': todo.activity_participants,
                'todo_enddate': todo.activity_end_time,
                'todo_starttime': todo.activity_from,
                'todo_endtime': todo.activity_to,
                'todo_createdby': todo.activity_created_by
              };

              var end = moment(todo.activity_end_time, "YYYY-MM-DD"); // activity end date
              var duration = moment.duration(now.diff(end)); // get duration in between today and end date
              var days = duration.asDays(); // convert it to days

              if (todo.activity_has_flagged === null) {
                todo['hasflag'] = 0;
              } else {
                if (todo.activity_has_flagged.indexOf(req.session.user_id) > -1) {
                  todo['hasflag'] = 1;
                } else {
                  todo['hasflag'] = 0;
                }
              }

              todo['days'] = days;

              if(days > 1){ // if days greater then 1 it will cross today
                if (todo.activity_pinned === null) {
                  overdue.push(todo);
                } else {
                  if (todo.activity_pinned.indexOf(req.session.user_id) === -1) {
                    overdue.push(todo);
                  } else {
                    pinned.push(todo);
                  }
                }
              }else if(todo.activity_pinned === null){
                normaltodo.push(todo);
              }else{
                if(todo.activity_pinned.indexOf(req.session.user_id) === -1){
                  normaltodo.push(todo);
                }else{
                  pinned.push(todo);
                }
              }

            });

            if (draftactivities.length > 0) {
              _.each(draftactivities, function (draft, ke) {

                clusteringKey[draft.activity_id] = draft.activity_created_at;
                mytdoList[draft.activity_id] = {
                  'todoid': draft.activity_id,
                  'reminder_time': draft.activity_has_reminder,
                  'todo_members': draft.activity_participants,
                  'todo_enddate': draft.activity_end_time,
                  'todo_starttime': draft.activity_from,
                  'todo_endtime': draft.activity_to,
                  'todo_createdby': draft.activity_created_by
                };

                var end = moment(draft.activity_end_time, "YYYY-MM-DD"); // activity end date
                var duration = moment.duration(now.diff(end)); // get duration in between today and end date
                var days = duration.asDays(); // convert it to days


                if (draft.activity_has_flagged === null) {
                  draft['hasflag'] = 0;
                } else {
                  if (draft.activity_has_flagged.indexOf(req.session.user_id) > -1) {
                    draft['hasflag'] = 1;
                  } else {
                    draft['hasflag'] = 0;
                  }
                }

                draft['days'] = days;


                if (days > 1) { // if days greater then 1 it will cross today
                  if (draft.activity_pinned === null){
                    overdue.push(draft);
                  }else{
                    if (draft.activity_pinned.indexOf(req.session.user_id) === -1) {
                      overdue.push(draft);
                    } else {
                      pinned.push(draft);
                    }
                  }

                } else if (draft.activity_pinned === null) {
                  normaltodo.push(draft);
                } else {
                  if (draft.activity_pinned.indexOf(req.session.user_id) === -1) {
                    normaltodo.push(draft);
                  } else {
                    pinned.push(draft);
                  }
                }

              });
            }

            models.instance.Tag.find({ tagged_by: models.uuidFromString(req.session.user_id), type: "TODO"}, { allow_filtering: true }, function(tagserr, tags){
              if(tagserr){
                throw tagserr;
              }else{
                var res_data = {
                  url:'basic_to_do',
                  title: "ToDo",
                  bodyClass: "basic",
                  success: req.session.success,
                  error: req.session.error,
                  file_server: process.env.FILE_SERVER,
                  user_id: req.session.user_id,
                  user_fullname: req.session.user_fullname,
                  user_email: req.session.user_email,
                  user_img: req.session.user_img,
                  highlight: highlight,
                  moment: moment,
                  _:_,
                  has_login: true,
                  data: [{
                      users: all_users,
                      pinned:pinned,
                      overdue:overdue,
                      normaltodo:normaltodo,
                      tags: tags,
                      clusteringKey: clusteringKey,
                      tdoList: mytdoList
                  }]
                };
                res.render('basic_to_do', res_data);
              }
            });
          }
        });


    });
  } else {
    res.redirect('/');
  }
});

router.post('/todoFiles', upload.array('todofiles', 10), function(req, res, next){
  console.log(req.files);
  if(req.session.login){
    if (req.files.length < 1){
      res.json({'msg':'No files were uploaded.'});
    }
    else{
      res.json({'file_info': req.files, 'msg': 'Successfully uploaded'});
    }
  } else {
    res.redirect('/');
  }
});

module.exports = router;
