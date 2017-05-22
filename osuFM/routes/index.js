var express = require('express');
var models  = require('../models');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Beatmap.findAll({order: [['score', 'DESC']], where: {mode: 0, avg_pp: {$gt: 220, $lt: 300}, pop_mod: {$like: '%DT%'} }, limit: 1000}).then(function(maps) {
    res.render('index', {
      title: 'osuFM',
      maps: maps
    });
  });
});

module.exports = router;
