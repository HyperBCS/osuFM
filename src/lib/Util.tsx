export const str_time = (length: number) => {
    var minutes:number = Math.floor(length / 60);
    var seconds:number = length % 60;
    var ret_str:string 
    ret_str = ("00" + seconds)
    ret_str = ret_str.substring(ret_str.length - 2, ret_str.length)
    return minutes + ":" + ret_str
}

export const intToMods = (mod_int: number) => {
    var mod_string = "";
    if (mod_int == -1) {
      mod_string += "NO";
    }
    if (mod_int & (1 << 0)) {
      mod_string += "NF";
    }
    if (mod_int & (1 << 1)) {
      mod_string += "EZ";
    }
    if (mod_int & (1 << 2)) {
      mod_string += "TD";
    }
    if (mod_int & (1 << 3)) {
      mod_string += "HD";
    }
    if (mod_int & (1 << 4)) {
      mod_string += "HR";
    }
    if (mod_int & (1 << 6) && !(mod_int & (1 << 9))) {
      mod_string += "DT";
    }
    if (mod_int & (1 << 7)) {
      mod_string += "RX";
    }
    if (mod_int & (1 << 8)) {
      mod_string += "HT";
    }
    if (mod_int & (1 << 9)) {
      mod_string += "NC";
    }
    if (mod_int & (1 << 10)) {
      mod_string += "FL";
    }
    if (mod_int & (1 << 5)) {
      mod_string += "SD";
    }
    if (mod_int & (1 << 11)) {
      mod_string += "AP";
    }
    if (mod_int & (1 << 12)) {
      mod_string += "SO";
    }
    if (mod_int & (1 << 13)) {
      mod_string += "RX";
    }
    if (mod_int & (1 << 14)) {
      mod_string += "PF";
    }
    if (mod_int & (1 << 15)) {
      mod_string += "4K";
    }
    if (mod_int & (1 << 16)) {
      mod_string += "5K";
    }
    if (mod_int & (1 << 17)) {
      mod_string += "6K";
    }
    if (mod_int & (1 << 18)) {
      mod_string += "7K";
    }
    if (mod_int & (1 << 19)) {
      mod_string += "8K";
    }
    if (mod_int & (1 << 20)) {
      mod_string += "FI";
    }
    if (mod_int & (1 << 21)) {
      mod_string += "RD";
    }
    if (mod_int & (1 << 22)) {
      mod_string += "CM";
    }
    if (mod_int & (1 << 23)) {
      mod_string += "TP";
    }
    if (mod_int & (1 << 24)) {
      mod_string += "9K";
    }
    if (mod_int & (1 << 25)) {
      mod_string += "CP";
    }
    if (mod_int & (1 << 26)) {
      mod_string += "1K";
    }
    if (mod_int & (1 << 27)) {
      mod_string += "3K";
    }
    if (mod_int & (1 << 28)) {
      mod_string += "2K";
    }
    if (mod_int & (1 << 30)) {
      mod_string += "MR";
    }
    if (mod_string == "") {
      mod_string = "None";
    }
    return mod_string;
  };