var express = require('express');
var models  = require('../models');
var router = express.Router();
const { Op } = require("sequelize");
var Sequelize = require('sequelize');
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });







function getMapCache(){
    console.log("Loading cache")
    query = {order: [['score', 'DESC']]}
    map_ret = []
    models.Beatmap.findAndCountAll(query).then(function(maps) {
        for(m in maps.rows){
            m_json = maps.rows[m].toJSON()
            m_json.all_title = (maps.rows[m].artist + " " + maps.rows[m].name + " " + maps.rows[m].version + " " + maps.rows[m].mapper).toLowerCase()
            m_json.length = str_time(maps.rows[m].length)
            m_json.pop_mod = intToMods(maps.rows[m].pop_mod)
            if(m_json.pop_mod == ''){
                m_json.pop_mod = 'None'
            }
            map_ret.push(m_json)
        }
    });
    console.log("Done loading cache")
    return map_ret;

}

var mapCache = getMapCache();

var defaults = { mods: '0',
page: '1',
ml: '0',
xl: '9007199254740991',
m: '0',
n1: '',
n2: '',
mpp: '',
xpp: '',
mb: '',
xb: '',
md: '0',
xd: '15',
mar: '0',
xar: '11',
mcs: '0',
xcs: '10' }


var mod_conv = function(mods, response){

	mod_nums = {"NF": 1, "EZ": 2, "NoVideo": 4, "HD": 8, "HR": 16, "SD": 32, "DT": 64, "Relax": 128, "HT": 256, "NC": 512, "FL": 1024, "Autoplay": 2048, "SO": 4096, "Relax2": 8192, "PF": 16384, "Key4": 32768, "Key5": 65536, "Key6": 131072, "Key7": 262144, "Key8": 524288, "FadeIn": 1048576, "Random": 2097152, "LastMod": 4194304, "Key9": 16777216, "Key10": 33554432, "Key1": 67108864, "Key3": 134217728, "Key2": 268435456}
    if(mods < 0){
		response['NO'] = true
        return
	}
    if(mods % 2 != 0){
        mods += 1
    }
	for(mod in mod_nums){
		if((mod_nums[mod] & mods) != 0){
			response[mod] = true
		}
    }

}

var intToMods = function(mod_int){
    var mod_string = "";
        if(mod_int == -1){
            mod_string += "NO";
        }
        if(mod_int & 1<<0){
            mod_string += "NF";
        }
        if(mod_int & 1<<1){
            mod_string += "EZ";
        }
        if(mod_int & 1<<2){
            mod_string += "TD";
        }
        if(mod_int & 1<<3){
            mod_string += "HD";
        }
        if(mod_int & 1<<4){
            mod_string += "HR";
        }
        if(mod_int & 1<<6 && !(mod_int & 1<<9)){
            mod_string += "DT";
        }
        if(mod_int & 1<<7){
            mod_string += "RX";
        }
        if(mod_int & 1<<8){
            mod_string += "HT";
        }
        if(mod_int & 1<<9){
            mod_string += "NC";
        }
        if(mod_int & 1<<10){
            mod_string += "FL";
        }
        if(mod_int & 1<<5){
            mod_string += "SD";
        }
        if(mod_int & 1<<11){
            mod_string += "AP";
        }
        if(mod_int & 1<<12){
            mod_string += "SO";
        }
        if(mod_int & 1<<13){
            mod_string += "RX";
        }
        if(mod_int & 1<<14){
            mod_string += "PF";
        }
        if(mod_int & 1<<15){
            mod_string += "4K";
        }
        if(mod_int & 1<<16){
            mod_string += "5K";
        }
        if(mod_int & 1<<17){
            mod_string += "6K";
        }
        if(mod_int & 1<<18){
            mod_string += "7K";
        }
        if(mod_int & 1<<19){
            mod_string += "8K";
        }
        if(mod_int & 1<<20){
            mod_string += "FI";
        }
        if(mod_int & 1<<21){
            mod_string += "RD";
        }
        if(mod_int & 1<<22){
            mod_string += "CM";
        }
        if(mod_int & 1<<23){
            mod_string += "TP";
        }
        if(mod_int & 1<<24){
            mod_string += "9K";
        }
        if(mod_int & 1<<25){
            mod_string += "CP";
        }
        if(mod_int & 1<<26){
            mod_string += "1K";
        }
        if(mod_int & 1<<27){
            mod_string += "3K";
        }
        if(mod_int & 1<<28){
            mod_string += "2K";
        }
        if(mod_int & 1<<30){
            mod_string += "MR";
        }
    return mod_string;
}

var format_min_max = function(min,max){
	if(min == null || min == ""){
		min = 0
	}
	if(max == null || max == ""){
		max = Number.MAX_VALUE
	}
	if(Number(min) > Number(max)){
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

var str_time = function(length){
	minutes = Math.floor(length / 60);
	seconds = length % 60;
	seconds = ("00" + seconds)
	seconds = seconds.substring(seconds.length-2,seconds.length)
	return minutes + ":" + seconds
}


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
      title: 'osuFM'
    });
});

/* GET filter page. */
router.get('/filter', function(req, res, next) {
	mods = req.query.mods
	mods_o = mods
	if(mods == null || mods == ''){
		mods = 0
	}
    mods = parseInt(mods)
	name = "%" + req.query.n + "%"
	ranges = {}
	try{
		pp_range = format_min_max(req.query.mpp,req.query.xpp)
		time_range = format_min_max(req.query.ml,req.query.xl)
		bpm_range = format_min_max(req.query.mb,req.query.xb)
		diff_range = format_min_max(req.query.md,req.query.xd)
		ar_range = format_min_max(req.query.mar,req.query.xar)
		cs_range = format_min_max(req.query.mcs,req.query.xcs)
	} catch(err){
		  var err = new Error('Internal Server Error');
		  err.status = 500;
		  return next(err);
	}
	limit = 10
	page = req.query.page
	if(page == null || page == '' || page < 1 || Math.abs(page) > Number.MAX_SAFE_INTEGER){
		page = 1
	} else{
		page = page.replace(/[^0-9]/g, '');
		if(page == '' || Math.abs(page) > Number.MAX_SAFE_INTEGER){
			page = 1
		}
	}
	offset = (page-1) * limit
	response = {n: name.replace(/%/g,''), 'DT': false, 'HD': false, 'HR': false, 'EZ': false, 'FL': false, 'NO': false, params: req.query}
	name = name.replace(/ /g,'%')
	map_name = req.query.n
	mode = req.query.m
	if(mode == null || mode == ''){
	mode = 0
    }
	mode = get_mode(mode)
    mod_conv(mods,response)
    default_params = true
    for(query in req.query){
        if(req.query[query] == defaults[query]){
        } else{
            default_params = false
        }
    }
    if(default_params){
        res.json({
            maps: mapCache,
          });
          return
    } else if(mods == null || mods == 0){
        query = {order: [['score', 'DESC']], where: {diff: {[Op.gte]: diff_range[0], [Op.lte]: diff_range[1]}, bpm: {[Op.gte]: bpm_range[0], [Op.lte]: bpm_range[1]}, length: {[Op.gte]: time_range[0], [Op.lte]: time_range[1]}, avg_pp: {[Op.gte]: pp_range[0], [Op.lte]: pp_range[1]}, cs: {[Op.gte]: cs_range[0], [Op.lte]: cs_range[1]},ar: {[Op.gte]: ar_range[0], [Op.lte]: ar_range[1]} ,[Op.and]: [{[Op.or]: mode} ]}}

     } else{
        query_mod = mods
        if(query_mod == -1){
            query_mod = 0;
        } else if(query_mod % 2 != 0){
            query_mod += 1
        }
        query =  {order: [['score', 'DESC']], where: {diff2: {[Op.and]: [Sequelize.literal("pop_mod == " + query_mod)]}, diff: {[Op.gte]: diff_range[0], [Op.lte]: diff_range[1]}, bpm: {[Op.gte]: bpm_range[0], [Op.lte]: bpm_range[1]}, length: {[Op.gte]: time_range[0], [Op.lte]: time_range[1]}, avg_pp: {[Op.gte]: pp_range[0], [Op.lte]: pp_range[1]}, cs: {[Op.gte]: cs_range[0], [Op.lte]: cs_range[1]},ar: {[Op.gte]: ar_range[0], [Op.lte]: ar_range[1]} ,[Op.and]: [{[Op.or]: mode} ]}}
    }
    map_ret = []
    models.Beatmap.findAndCountAll(query).then(function(maps) {
        for(m in maps.rows){
            m_json = maps.rows[m].toJSON()
            m_json.all_title = (maps.rows[m].artist + " " + maps.rows[m].name + " " + maps.rows[m].version + " " + maps.rows[m].mapper).toLowerCase()
            m_json.length = str_time(maps.rows[m].length)
            m_json.pop_mod = intToMods(maps.rows[m].pop_mod)
            if(m_json.pop_mod == ''){
                m_json.pop_mod = 'None'
            }
            map_ret.push(m_json)
        }
    res.json({
      maps: map_ret,
    });
  }).catch(function (err) {
  		  console.error(err.stack)
		  var err = new Error('Internal Server Error');
		  err.status = 500;
		  return next(err);
	});
});

module.exports = router;