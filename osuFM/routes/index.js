var express = require('express');
var models  = require('../models');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

var mod_conv = function(mods, response){
	mod_nums = {"NoMod": 0, "NF": 1, "EZ": 2, "NoVideo": 4, "HD": 8, "HR": 16, "SD": 32, "DT": 64, "Relax": 128, "HT": 256, "NC": 512, "FL": 1024, "Autoplay": 2048, "SO": 4096, "Relax2": 8192, "PF": 16384, "Key4": 32768, "Key5": 65536, "Key6": 131072, "Key7": 262144, "Key8": 524288, "FadeIn": 1048576, "Random": 2097152, "LastMod": 4194304, "Key9": 16777216, "Key10": 33554432, "Key1": 67108864, "Key3": 134217728, "Key2": 268435456}
	strict = 0;
	if(mods == -1){
		response.params.mods = null
		return "%"
	} else if(mods == 0){
		response['NO'] = true
		return ''
	} else if(mods < 0){
		response['NO'] = true
		strict = 1;
		mods *= -1
	}
	string = ""
	for(mod in mod_nums){
		if((mod_nums[mod] & mods) != 0){
			response[mod] = true
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

var get_mode = function(mode){
	if(mode == -1){
		return [{mode: 0},{mode: 1},{mode: 2},{mode: 3}]
	}
	return [{mode: mode}]
}


/* GET home page. */
router.get('/', function(req, res, next) {
	mods = req.query.mods
	mods_o = mods
	if(mods == null || mods == ''){
		mods = -1
	}
	if(req.query.n == null){
		req.query.n = ''
	}
	name = "%" + req.query.n + "%"
	pp_range = format_min_max(req.query.mpp,req.query.xpp)
	rank_range = format_min_max(req.query.mr,req.query.xr)
	time_range = format_min_max(req.query.ml,req.query.xl)
	bpm_range = format_min_max(req.query.mb,req.query.xb)
	diff_range = format_min_max(req.query.md,req.query.xd)
	limit = 10
	page = req.query.page
	if(page == null || page == ''){
		page = 1
	}
	offset = (page-1) * limit
	response = {n: name.replace(/%/g,''), 'DT': false, 'HD': false, 'HR': false, 'EZ': false, 'FL': false, 'NO': false, params: req.query}
	mods = mod_conv(mods ,response)
	map_name = req.query.n
	mode = req.query.m
	if(mode == null || mode == ''){
	mode = 0
	}
	mode = get_mode(mode)
  models.Beatmap.findAndCountAll({order: [['score', 'DESC']], where: {diff: {$gt: diff_range[0], $lt: diff_range[1]}, bpm: {$gt: bpm_range[0], $lt: bpm_range[1]}, length: {$gt: time_range[0], $lt: time_range[1]}, avg_rank: {$gt: rank_range[0], $lt: rank_range[1]}, avg_pp: {$gt: pp_range[0], $lt: pp_range[1]}, pop_mod: {$like: mods},$and: [{$or: [{name: {$like: name}}, {artist: {$like: name}}, {mapper: {$like: name}}, {version: {$like: name}}]},{$or: mode} ]}, limit: limit, offset: offset}).then(function(maps) {
    for(m in maps.rows){
    	if(maps.rows[m].pop_mod == ''){
    		maps.rows[m].pop_mod = 'No Mod'
    	}
    }
    res.render('index', {
      title: 'osuFM',
      pages:  Math.ceil(maps.count / 10),
      current_page: page,
      maps: maps.rows,
      response: response
    });
  });
});

module.exports = router;
