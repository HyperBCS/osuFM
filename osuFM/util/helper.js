const fs = require('fs')
const { Op } = require("sequelize");
var models  = require('../models');


const getFileUpdatedDate = () => {
    const stats = fs.statSync('osuFM.db')
    return stats.mtime
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
  
  var str_time = function(length){
      minutes = Math.floor(length / 60);
      seconds = length % 60;
      seconds = ("00" + seconds)
      seconds = seconds.substring(seconds.length-2,seconds.length)
      return minutes + ":" + seconds
  }
  
  function getMapCache() {
    console.log("Loading cache")
    query = {order: [['score', 'DESC']], where: {mode: {[Op.eq]: 0}}}
    map_ret = []
    models.Beatmap.findAndCountAll(query).then(function(maps) {
        for(m in maps.rows){
            m_json = maps.rows[m].toJSON()
            
            m_json.length = str_time(maps.rows[m].length)
            m_json.pop_mod = intToMods(maps.rows[m].pop_mod)
            if(m_json.pop_mod == ''){
                m_json.pop_mod = 'None'
            }
            map_ret.push(m_json)
        }
        console.log("Done Loading Cache")
    });
    return map_ret;
}

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



exports.intToMods = intToMods
exports.mapCache = getMapCache
exports.dbUpdateDate = getFileUpdatedDate
exports.str_time = str_time
exports.get_mode = get_mode
exports.format_min_max = format_min_max
exports.mod_conv = mod_conv