import numpy as np
import math
import functools 
from sklearn.linear_model import LinearRegression
import pandas as pd
from peewee import *
import json
import requests
import time
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
import copy 
from datetime import datetime
from oppai import *
import sys, traceback

db = SqliteDatabase('osuFM.db',pragmas=[('journal_mode', 'wal')])
modes = ["osu", "taiko", "fruits", "mania"]

def intToMod(mod_int):
    mod_string = ""
    if (mod_int == -1):
        mod_string += "NO"
    if (mod_int & 1 << 0):
        mod_string += "NF"
    if (mod_int & 1 << 1):
        mod_string += "EZ"
    if (mod_int & 1 << 2):
        mod_string += "TD"
    if (mod_int & 1 << 3):
        mod_string += "HD"
    if (mod_int & 1 << 4):
        mod_string += "HR"
    if (mod_int & 1 << 6 and not(mod_int & 1 << 9)):
        mod_string += "DT"
    if (mod_int & 1 << 7):
        mod_string += "RX"
    if (mod_int & 1 << 8):
        mod_string += "HT"
    if (mod_int & 1 << 9):
        mod_string += "NC"
    if (mod_int & 1 << 10):
        mod_string += "FL"
    if (mod_int & 1 << 5):
        mod_string += "SD"
    if (mod_int & 1 << 11):
        mod_string += "AP"
    if (mod_int & 1 << 12):
        mod_string += "SO"
    if (mod_int & 1 << 13):
        mod_string += "RX"
    if (mod_int & 1 << 14):
        mod_string += "PF"
    if (mod_int & 1 << 15):
        mod_string += "4K"
    if (mod_int & 1 << 16):
        mod_string += "5K"
    if (mod_int & 1 << 17):
        mod_string += "6K"
    if (mod_int & 1 << 18):
        mod_string += "7K"
    if (mod_int & 1 << 19):
        mod_string += "8K"
    if (mod_int & 1 << 20):
        mod_string += "FI"
    if (mod_int & 1 << 21):
        mod_string += "RD"
    if (mod_int & 1 << 22):
        mod_string += "CM"
    if (mod_int & 1 << 23):
        mod_string += "TP"
    if (mod_int & 1 << 24):
        mod_string += "9K"
    if (mod_int & 1 << 25):
        mod_string += "CP"
    if (mod_int & 1 << 26):
        mod_string += "1K"
    if (mod_int & 1 << 27):
        mod_string += "3K"
    if (mod_int & 1 << 28):
        mod_string += "2K"
    if (mod_int & 1 << 30):
        mod_string += "MR"
    return mod_string

def modsToInt(mod_string_arr):
    mods = 0
    for mod in mod_string_arr:
        if mod == "NF":
            mods |= 1 << 0
        elif mod == "EZ":
            mods |= 1 << 1
        elif mod == "HD":
            mods |= 1 << 3
        elif mod == "HR":
            mods |= 1 << 4
        elif mod == "SD":
            mods |= 1 << 5
        elif mod == "DT":
            mods |= 1 << 6
        elif mod == "RX":
            mods |= 1 << 7
        elif mod == "HT":
            mods |= 1 << 8
        elif mod == "NC":
            mods |= 1 << 6
            mods |= 1 << 9
        elif mod == "FL":
            mods |= 1 << 10
        elif mod == "TD":
            mods |= 1 << 2
        elif mod == "AP":
            mods |= 1 << 11
        elif mod == "SO":
            mods |= 1 << 12
        elif mod == "RX":
            mods |= 1 << 13
        elif mod == "PF":
            mods |= 1 << 14
        elif mod == "4K":
            mods |= 1 << 15
        elif mod == "5K":
            mods |= 1 << 16
        elif mod == "6K":
            mods |= 1 << 17
        elif mod == "7K":
            mods |= 1 << 18
        elif mod == "8K":
            mods |= 1 << 19
        elif mod == "FI":
            mods |= 1 << 20
        elif mod == "RD":
            mods |= 1 << 21
        elif mod == "CM":
            mods |= 1 << 22
        elif mod == "TP":
            mods |= 1 << 23
        elif mod == "9K":
            mods |= 1 << 24
        elif mod == "CP":
            mods |= 1 << 25
        elif mod == "1K":
            mods |= 1 << 26
        elif mod == "3K":
            mods |= 1 << 27
        elif mod == "2K":
            mods |= 1 << 28
        elif mod == "MR":
            mods |= 1 << 30
    return mods

class BaseModel(Model):
    class Meta:
        database = db

class Beatmaps(BaseModel):
    bid = IntegerField()
    sid = IntegerField()
    name = CharField()
    artist = CharField()
    mapper = CharField()
    num_scores = IntegerField()
    pop_mod = IntegerField()
    avg_pp = FloatField()
    avg_acc = FloatField()
    avg_rank = IntegerField()
    avg_pos = IntegerField()
    mode = IntegerField()
    cs = FloatField()
    ar = FloatField()
    od = FloatField()
    length = IntegerField()
    bpm = FloatField()
    diff = FloatField()
    version = CharField()
    score = FloatField()
    calculated = BooleanField(null = True)
    date_ranked = FloatField()
    class Meta:
        primary_key = CompositeKey('bid','pop_mod', 'mode')

class Beatmap(object):
    num_scores = 0
    pop_mod = 0
    avg_pp = 0
    avg_acc = 0
    avg_rank = 0
    avg_pos = 0
    
    def __init__(self, bid, set_id, title, artist, mapper, cs, ar, od, length, bpm, diff, version, mode, date_ranked, calculated):
        self.bid = bid
        self.set_id = set_id
        self.title = title
        self.artist = artist
        self.mapper = mapper
        self.cs = cs
        self.ar = ar
        self.od = od
        self.length = length
        self.bpm = bpm
        self.diff = diff
        self.version = version
        self.mode = mode
        self.calculated = calculated
        self.date_ranked = date_ranked

class Score(object):
    def __init__(self, uid, map_id, rank, acc, mods, pos, mode, map_pp, user_pp):
        self.uid = uid
        self.map_id = map_id
        self.rank = rank
        self.acc = acc
        self.mods = mods
        self.pos = pos
        self.mode = mode
        self.map_pp = map_pp
        self.user_pp = user_pp

def func(x, a):
    return 1 / (x*a)

def predictData(X,y,num_scores,bid):
    bin_list = {}
    for ind,val in enumerate(X):
        # 50 / 2 groups
        bin_label = math.floor(100*((val-1) / 2) / 100)
        if bin_label not in bin_list:
            bin_list[bin_label] = {}
            bin_list[bin_label]['x'] = []
            bin_list[bin_label]['y'] = []
            bin_list[bin_label]['count'] = 0
        bin_list[bin_label]['x'].append(X[ind])
        bin_list[bin_label]['y'].append(y[ind])
        bin_list[bin_label]['count'] += 1
    count_arr = np.empty([26,])
    for bin_label in bin_list:
        count_arr[bin_label] = (bin_list[bin_label]['count'])
    bins_normal = np.amax(count_arr)
    for bin_label in bin_list:
        bin_list[bin_label]['count'] /= bins_normal
        count_arr[bin_label] /= bins_normal
    new_x = []
    new_y = []
    if num_scores > 500:
        from_top = 0.05
    else:
        from_top = 1
    
    for b in bin_list:
        score_tup = [((bin_list[b]['x'][ind]),(bin_list[b]['y'][ind])) for ind,val in enumerate(bin_list[b]['x'])]
        score_tup.sort(key=lambda x:x[1], reverse=True)
        num_scores = math.ceil(len(bin_list[b]['x']) * from_top)
        tmp_x = [score_tup[ind][0] for ind,val in enumerate(score_tup)]
        tmp_y = [score_tup[ind][1] for ind,val in enumerate(score_tup)]
        new_x.extend(tmp_x[:num_scores])
        new_y.extend(tmp_y[:num_scores])
    new_x = np.array(new_x).reshape(-1, 1)
    new_y = np.array(new_y).reshape(-1, 1)
    reg1 = LinearRegression().fit(new_x, new_y)
    y_pred = reg1.predict(new_x)
    score = reg1.score(new_x, new_y)
    for ind in range(len(new_y)):
        if reg1.coef_[0][0] >= 0:
            new_y[ind] = new_y[ind] + 0.005*new_y[ind]/count_arr[math.floor(100*((new_x[ind]-1) / 2) / 100)]
        else:
            new_y[ind] = new_y[ind] - 0.005*new_y[ind]/count_arr[math.floor(100*((new_x[ind]-1) / 2) / 100)]
    reg = LinearRegression().fit(new_x, new_y)
    y_pred = reg.predict(new_x)
    score = reg.score(new_x, new_y)
    # if bid == 1373950:
    #     print(count_arr)
    #     print(abs(reg.coef_[0][0]*(score) + reg.coef_[0][0]*(1-score)*(0.5)))
    #     plt.plot(new_x, y_pred, color='blue', linewidth=3)
    #     plt.scatter(new_x, new_y,  color='red',s=area)
    #     plt.show()
    return abs(reg.coef_[0][0]*(score) + reg.coef_[0][0]*(1-score)*(0.5))

def getURL(url, auth_string, checkJson):
    tries = 100
    while tries > 0:
        headers = {"Authorization": auth_string}
        try:
            r = requests.get(url, headers=headers)
        except Exception as e:
            traceback.print_exc(file=sys.stdout)
            tries -= 1
            continue
        if r.status_code != 200:
            tries -= 1
            time.sleep(0.5)
            print("[" + str(r.status_code) + "]"
                      + "[" + str(100 - tries) + "]"
                      + "Retry... " + url)
            if tries == 0:
                print("BAD DATA")
                exit(-1)
            continue
        if checkJson:
            return r.json()
        else:
            return r.text
def parse_scores(user, scores, beatmaps):
    for pos,score in enumerate(scores):
        mode = score["mode_int"]
        if score["beatmap"]["id"] not in beatmaps[mode]:
            beatmaps[mode][score["beatmap"]["id"]] = {}
        mods = modsToInt(score["mods"]) & ~( (1<<30) | (1<<9) | (1<<5) | (1<<14))
        try:
            user_score = Score(score["user"]["id"], score["beatmap"]["id"], user["pp_rank"], score["accuracy"], mods, pos+1, score["beatmap"]["mode_int"],
                        score["pp"], user["pp"])
            if mods not in beatmaps[mode][score["beatmap"]["id"]]:
                b = Beatmap(score["beatmap"]["id"], score["beatmap"]["beatmapset_id"], score["beatmapset"]["title"],
                                score["beatmapset"]["artist"], score["beatmapset"]["creator"], score["beatmap"]["cs"], score["beatmap"]["ar"],
                                score["beatmap"]["accuracy"], score["beatmap"]["hit_length"], score["beatmap"]["bpm"], score["beatmap"]["difficulty_rating"],
                                score["beatmap"]["version"], score["beatmap"]["mode_int"],None, False)
                beatmaps[mode][score["beatmap"]["id"]][mods] = {}
                beatmaps[mode][score["beatmap"]["id"]][mods]["scores"] = []
                beatmaps[mode][score["beatmap"]["id"]][mods]["map_info"] = b
            beatmaps[mode][score["beatmap"]["id"]][mods]["scores"].append(user_score)
        except:
            print("Null values for " + score["user"]["username"])
            return

def process_maps(beatmaps, good_maps):
    for mode in beatmaps:
        for ind, beatmap in enumerate(beatmaps[mode]):
            # print("["+str(ind)+"/"+str(len(beatmaps[mode]))+"]")
            for mods in beatmaps[mode][beatmap]:
                map_info = copy.deepcopy(beatmaps[mode][beatmap][mods]["map_info"])
                mod_scores = beatmaps[mode][beatmap][mods]['scores']
                if(len(mod_scores) < 50):
                    continue
                # print(map_info["artist"],"-",map_info["name"] + "[" + map_info["version"] + "]+",intToMod(mods))
                num_scores = len(mod_scores)
                x = [val.pos for val in mod_scores]
                y = [val.user_pp for val in mod_scores]
                x = np.array(x, dtype=np.float64)
                y = np.array(y, dtype=np.float64)
                score = predictData(x,y,num_scores,beatmap)
                if score < 1:
                    continue
                weight_arr = np.fromfunction(lambda i: pow(0.95,i), (num_scores,), dtype=np.float64)
                weight_sum = np.sum(weight_arr)
                pp_arr = np.array([val.map_pp for val in mod_scores], dtype=np.float64)
                acc_arr = np.array([val.acc for val in mod_scores], dtype=np.float64)
                rank_arr = np.array([val.rank for val in mod_scores], dtype=np.float64)
                pp_arr *= weight_arr
                acc_arr *= weight_arr
                rank_arr *= weight_arr
                x *= weight_arr
                map_info.avg_pos = np.sum(x) / np.sum(weight_sum)
                map_info.avg_pp = np.sum(pp_arr) / np.sum(weight_sum)
                map_info.avg_acc = np.sum(acc_arr) / np.sum(weight_sum)
                map_info.avg_rank = np.sum(rank_arr) / np.sum(weight_sum)
                map_info.num_scores = num_scores
                map_info.score = score
                map_info.pop_mod = mods
                good_maps.append(map_info)
                # print(map_info.artist,"-",map_info.title + "[" + map_info.version + "]+",intToMod(mods))
                # print("    Score: ",map_info.score)
                # print("    AVG PP: ",map_info.avg_pp)
                # print("    AVG ACC: ",map_info.avg_acc)
                # print("    AVG RANK: ",map_info.avg_rank)

def loadMaps(beatmaps):
    count = 0
    for m in Beatmaps.select():
        count += 1
        b = Beatmap(m.bid, m.sid, m.name,
                                    m.artist, m.mapper, m.cs, m.ar,
                                    m.od, m.length, m.bpm, m.diff,
                                    m.version,m.mode,m.date_ranked, True)
        if m.bid not in beatmaps[m.mode]:
            beatmaps[m.mode][m.bid] = {}
        beatmaps[m.mode][m.bid][m.pop_mod] = {}
        beatmaps[m.mode][m.bid][m.pop_mod]["scores"] = []
        beatmaps[m.mode][m.bid][m.pop_mod]["map_info"] = b
    print("Loaded",count,"maps from the DB")

def getDates(maps, auth_string):
    set_id_list = {}
    date_cache = {}
    thread_list = []
    for m in maps:
        if m.date_ranked is not None:
            date_cache[m.set_id] = m.date_ranked
            continue
        if m.date_ranked is None and m.set_id in date_cache:
            m.date_ranked = date_cache[m.set_id]
            continue
        if m.set_id not in set_id_list and m.set_id not in date_cache:
            set_id_list[m.set_id] = m.bid
    
    executor = ThreadPoolExecutor()
    with ThreadPoolExecutor(max_workers=10) as executor:
        for sid in set_id_list:
            url = "https://osu.ppy.sh/api/v2/beatmaps/" + str(set_id_list[sid])
            thread_list.append(executor.submit(getURL, url,auth_string,True))
    fetch_count = 0
    for task in as_completed(thread_list):
        fetch_count += 1
        print("Getting date ranked for map ["+str(fetch_count)+"/"+str(len(set_id_list))+"]")
        map_text = task.result()
        date_str = map_text["beatmapset"]["ranked_date"]
        date_time_obj = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S%z')
        date_cache[map_text["beatmapset"]["id"]] = date_time_obj.timestamp()
    for ind, m in enumerate(maps):
        print("Setting date ranked for map ["+str(ind+1)+"/"+str(len(maps))+"]")
        m.date_ranked = date_cache[m.set_id]

def calcDiffs(maps):
    for ind, m in enumerate(maps):
        print("Calculating diff for map ["+str(ind+1)+"/"+str(len(maps))+"]")
        if  m.calculated or m.mode != 0 or not ((m.pop_mod & ((1 << 1) + (1 << 4) + (1 << 6) + (1 << 8))) > 0):
            m.calculated = 1
            continue
        url = "https://osu.ppy.sh/osu/" + str(m.bid)
        map_text = getURL(url, "", False)
        try:
            ez = ezpp_new()
            ezpp_set_mods(ez, m.pop_mod)
            ezpp_data(ez, map_text, len(map_text.encode('utf-8')))
            diff = ezpp_stars(ez)
            if(diff > 100):
                print("Invalid map file")
                ezpp_free(ez)
                continue
            m.diff = diff
            m.ar = ezpp_ar(ez)
            m.cs = ezpp_cs(ez)
            m.od = ezpp_od(ez)
            if (m.pop_mod & (1 << 6)):
                m.length /= 1.5
                m.bpm *= 1.5
            elif (m.pop_mod & (1 << 8)):
                m.length *= 1.5
                m.bpm /= 1.5
            ezpp_free(ez)
        except:
           print("Exception caught handling map " + str(m.id))


try:
    db.connect()
except:
    pass
try:
    Beatmaps.create_table(True)
    # db.create_tables([Beatmaps, Scores])
    print("Initialized DB tables")
except:
    pass

with open('conf.json') as json_file:
    config = json.load(json_file)
url = 'https://osu.ppy.sh/oauth/token'
headers = {'Content-Type': 'application/json'}
r = requests.post(url, headers=headers,json=config)
auth_string = "Bearer " + r.json()["access_token"]
max_pages = config["max_pages"]
beatmaps = {0: {}, 1: {}, 2: {}, 3:{}}
loadMaps(beatmaps)
good_maps = []
for mode_int,mode in enumerate(modes):
    url = "https://osu.ppy.sh/api/v2/rankings/" + mode + "/country"
    countries = getURL(url, auth_string, True)["ranking"]
    for country_obj in countries:
        reached100k = False
        country = country_obj["code"]
        print("Starting country [" + country + "]")
        for i in range(1,max_pages+1):
            if reached100k:
                break
            print("[" + mode + "][" + country + "]Starting page" +  "[" + str(i) + "/" + str(max_pages) + "]")

            url = "https://osu.ppy.sh/api/v2/rankings/" + mode + "/performance?cursor[page]=" + str(i) + "&country=" + country
            users = (getURL(url, auth_string, True))["ranking"]

            user_map = {}
            user_score_map = {}
            executor = ThreadPoolExecutor()
            thread_list = []
            with ThreadPoolExecutor(max_workers=25) as executor:
                for user in users:
                    if "pp" in user and user["pp"] < 1000:
                            reached100k = True
                            break
                    user_id = user["user"]["id"]
                    user_map[user_id] = user
                    url = "https://osu.ppy.sh/api/v2/users/" + str(user_id) + "/scores/best?mode=" + mode + "&limit=100"
                    thread_list.append(executor.submit(getURL, url,auth_string,True))

            for task in as_completed(thread_list):
                user_scores = task.result()
                if len(user_scores) == 0 or "user" not in user_scores[0]:
                    continue
                user_id = ((user_scores[0])["user"])["id"]
                user_score_map[user_id] = user_scores
            for user_scores in user_score_map:
                parse_scores(user_map[((user_score_map[user_scores][0])["user"])["id"]], user_score_map[user_scores], beatmaps)
process_maps(beatmaps, good_maps)
calcDiffs(good_maps)
getDates(good_maps,auth_string)
good_maps.sort(key=lambda x:x.score, reverse=True)
for map_info in good_maps:
    try:
        new_map = Beatmaps.replace(avg_acc=map_info.avg_acc,score=map_info.score,avg_pos =map_info.avg_pos,pop_mod=map_info.pop_mod,avg_pp=map_info.avg_pp,avg_rank=map_info.avg_rank,num_scores=map_info.num_scores,mode=map_info.mode,bid = map_info.bid, \
            name = map_info.title, artist=map_info.artist,mapper=map_info.mapper,cs=map_info.cs,ar=map_info.ar,od=map_info.od, \
            length=map_info.length,bpm=map_info.bpm,diff=map_info.diff,version=map_info.version,sid=map_info.set_id,date_ranked=map_info.date_ranked, calculated=True).execute()
    except:
        print("Error executing query with map")
        print(map_info.artist,"-",map_info.title + "[" + map_info.version + "]+",map_info.pop_mod)
        print("    Score: ",map_info.score)
        print("    AVG PP: ",map_info.avg_pp)
        print("    AVG ACC: ",map_info.avg_acc)
        print("    AVG RANK: ",map_info.avg_rank)

f=open("comp_maps.csv", "w")
f.write("bid,sid,name,artist,mapper,version,pop_mod,avg_pp,avg_acc,mode,cs,ar,od,length,bpm,diff,score,date_ranked\n")
for m in good_maps:
    try:
        csv_line = [m.bid,m.set_id,(base64.b64encode((m.title).encode('UTF-8'))).decode("utf-8"),(base64.b64encode((m.artist).encode('UTF-8'))).decode("utf-8"),
        (base64.b64encode((m.mapper).encode('UTF-8'))).decode("utf-8"),(base64.b64encode((m.version).encode('UTF-8'))).decode("utf-8"),m.pop_mod,m.avg_pp,m.avg_acc,m.mode,
        m.cs,m.ar,m.od,m.length,m.bpm,m.diff,m.score,m.date_ranked]
        for ind,val in enumerate(csv_line):
            csv_line[ind] = str(csv_line[ind])
        f.write(",".join(csv_line))
        f.write("\n")
    except:
        print("Error writing map to csv")
        print(map_info.artist,"-",map_info.title + "[" + map_info.version + "]+",map_info.pop_mod)
        print("    Score: ",map_info.score)
        print("    AVG PP: ",map_info.avg_pp)
        print("    AVG ACC: ",map_info.avg_acc)
        print("    AVG RANK: ",map_info.avg_rank)

f.close() 

f=open("datemodified", "w")
f.write(str(datetime.now()))
f.close()