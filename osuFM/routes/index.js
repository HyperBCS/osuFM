var express = require('express');
var models  = require('../models');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Score.findAll().then(function(users) {
    res.render('index', {
      title: 'osuFM',
      users: users
    });
  });
});

module.exports = router;
