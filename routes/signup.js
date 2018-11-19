var express = require('express');
var router = express.Router();

var {models} = require('./../config/db/express-cassandra');
var {passwordToHass, passwordToCompare} = require('./../utils/hassing');

/* GET signup listing. */
router.get('/', function(req, res, next) {
  if(req.session.login){
    res.redirect('/hayven');
  } else {
    res.render('signup', { title: 'Signup | NEC', bodyClass: 'centered-form', success: req.session.success, error: req.session.error, has_login: false });
    req.session.error = null;
  }
});

/* POST signup listing. */
router.post('/', function(req, res, next) {
  if(req.session.login){
    res.redirect('/hayven');
  } else {
    req.check('first_name', 'First name is required').isLength({ min:3 }).trim();
    req.check('last_name', 'Last name is required').isLength({ min:3 }).trim();
    req.check('email', 'Invalid email address').isEmail();
    req.check('password', 'Password should be at least 6 characters.').isLength({ min: 6 }).trim();
    //req.check('phone_Number', 'Phone Number').trim();

    var error = req.validationErrors();
    if(error) {
      req.session.error = error;
      req.session.success = false;
      res.redirect('/signup');
    } else {
      req.session.success = true;
      var user = new models.instance.Users({
          email: req.body.email,
          fullname: req.body.first_name + ' ' + req.body.last_name,
          password: passwordToHass(req.body.password),
          dept: 'ITL',
          designation: 'Test',
          img: 'img.png'
      });
      user.saveAsync()
          .then(function() {
              res.redirect('/signup/signup_mailing');
          })
          .catch(function(err) {
              console.log(err);
          });
    }
  }

});


router.get('/signup_mailing', function(req, res, next) {
    if (req.session.login) {
        res.redirect('/hayven');
    } else {
        res.render('signup_mailing', { title: 'Signup | NEC', bodyClass: 'centered-form', success: req.session.success, error: req.session.error, has_login: false });
        req.session.error = null;
    }
});


module.exports = router;
