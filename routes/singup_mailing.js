var express = require('express');
var router = express.Router();

var { models } = require('./../config/db/express-cassandra');
var { passwordToHass, passwordToCompare } = require('./../utils/hassing');

/* GET signup listing. */
router.get('/', function(req, res, next) {
    if (req.session.login) {
        res.redirect('/hayven');
    } else {
        res.render('singup_mailing', { title: 'Signup | NEC', bodyClass: 'centered-form', success: req.session.success, error: req.session.error, has_login: false });
        req.session.error = null;
    }
});



module.exports = router;