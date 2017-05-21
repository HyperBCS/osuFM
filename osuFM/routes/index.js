var express = require('express');
var models  = require('../models');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Beatmap.findAll({order: [['num_scores', 'DESC']], where: {mode: 3}, limit: 50}).then(function(maps) {
    res.render('index', {
      title: 'osuFM',
      maps: maps
    });
  });
});

module.exports = router;
