var express = require('express');
var models  = require('../models');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

var mod_conv = function(mods){
	mod_nums = {"NoMod": 0, "NF": 1, "EZ": 2, "NoVideo": 4, "HD": 8, "HR": 16, "SD": 32, "DT": 64, "Relax": 128, "HT": 256, "NC": 512, "FL": 1024, "Autoplay": 2048, "SO": 4096, "Relax2": 8192, "PF": 16384, "Key4": 32768, "Key5": 65536, "Key6": 131072, "Key7": 262144, "Key8": 524288, "FadeIn": 1048576, "Random": 2097152, "LastMod": 4194304, "Key9": 16777216, "Key10": 33554432, "Key1": 67108864, "Key3": 134217728, "Key2": 268435456}
	strict = 0;
	if(mods == -1){
		return "%"
	} else if(mods < 0){
		strict = 1;
		mods *= -1
	}
	string = ""
	for(mod in mod_nums){
		if((mod_nums[mod] & mods) != 0){
			if(strict){
				string += mod
			}else{
				string += "%"+mod+"%"
			}
		}
	}
	return string
}

var format_min_max = function(min,max){
	if(min == null || min == ""){
		min = 0
	}
	if(max == null || max == ""){
		max = Number.MAX_VALUE
	}
	if(min > min){
		temp = min
		min = max
		max = temp
	}

	return [min,max]

}


/* GET home page. */
router.get('/', function(req, res, next) {
	mods = req.query.mods
	if(mods == null || mods==0){
		mods = -1
	}
	name = "%" + req.query.n + "%"
	pp_range = format_min_max(req.query.mpp,req.query.xpp)
	rank_range = format_min_max(req.query.mr,req.query.xr)
	time_range = format_min_max(req.query.ml,req.query.xl)
	bpm_range = format_min_max(req.query.mb,req.query.xb)
	diff_range = format_min_max(req.query.md,req.query.xd)
	mods = mod_conv(mods)
	map_name = req.query.n
	mode = req.query.m
    console.log('MinPP: '+pp_range[0] + " MAX PP " + pp_range[1])
  models.Beatmap.findAll({order: [['score', 'DESC']], where: {mode: 0, diff: {$gt: diff_range[0], $lt: diff_range[1]}, bpm: {$gt: bpm_range[0], $lt: bpm_range[1]}, length: {$gt: time_range[0], $lt: time_range[1]}, avg_rank: {$gt: rank_range[0], $lt: rank_range[1]}, avg_pp: {$gt: pp_range[0], $lt: pp_range[1]}, pop_mod: {$like: mods},$or: [{name: {$like: name}}, {artist: {$like: name}}, {mapper: {$like: name}}]}, limit: 100}).then(function(maps) {
    res.render('index', {
      title: 'osuFM',
      maps: maps
    });
  });
});

module.exports = router;
