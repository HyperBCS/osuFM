import numpy as np
import matplotlib.pyplot as plt  # To visualize
import matplotlib
import math
import functools 
from sklearn.linear_model import LinearRegression, Ridge
import pandas as pd
from scipy.stats import norm
from sklearn.neighbors import KernelDensity
from sklearn.utils.fixes import parse_version
from peewee import *
from scipy.optimize import curve_fit
import json
import sqlite3
import time

db = SqliteDatabase('osuFM.db',pragmas=[('journal_mode', 'wal')])
cnx = sqlite3.connect('data.db')

# maps = pd.read_csv("beatmaps.csv")
# scores = pd.read_hdf('scores.hdf')
scores = pd.read_sql_query("SELECT * FROM scores", cnx)
maps = pd.read_sql_query("SELECT * FROM beatmaps", cnx)

def intToMod(mod_int):
    mod_string = "";
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
    class Meta:
        primary_key = CompositeKey('bid','pop_mod', 'mode')

class Beatmap(object):
    def __init__(self, bid, set_id, title, artist, mapper, cs, ar, od, length, bpm, diff, version, mode):
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
        self.self.mode = mode

class Score(object):
    def __init__(uid, map_id, rank, acc, mods, pos, mode, map_pp, user_pp):
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

def predictData(X,y,bid,num_scores):
    area = 2
    slope_max = 0
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
    if bid == 1373950:
        print(count_arr)
        print(abs(reg.coef_[0][0]*(score) + reg.coef_[0][0]*(1-score)*(0.5)))
        plt.plot(new_x, y_pred, color='blue', linewidth=3)
        plt.scatter(new_x, new_y,  color='red',s=area)
        plt.show()
    return abs(reg.coef_[0][0]*(score) + reg.coef_[0][0]*(1-score)*(0.5)) , y_pred

def graphData(y,X, y_pred):
    area = 2
    plt.scatter(X, y,  color='red',s=area)
    plt.plot(X, y_pred, color='blue', linewidth=3)
    plt.show()


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




mod_map = {}
print("Creating Score Map")
for ind, score in enumerate(scores.values):
    bid = score[2]
    mods = int(score[5])
    if ind % 1000000 == 0:
        print("["+str(ind)+"/"+str(len(scores))+"]")
    if bid not in mod_map:
        mod_map[bid] = {}
    if mods not in mod_map[bid]:
        mod_map[bid][mods] = []
    # mod_map[bid][mods][0].append(score[9])
    # mod_map[bid][mods][1].append(score[6])
    mod_map[bid][mods].append((score[9],score[6]))
print("Score Map Created")

uarray, carray = np.unique(scores["map_id"], return_counts=True)
bids = [(uarray[i],carray[i]) for i in range(0, len(uarray)) if carray[i] > 50]
bids.sort(key=lambda bids: bids[1], reverse=True)
map_coefs = []
for ind, bid in enumerate(bids):
    print("["+str(ind)+"/"+str(len(bids))+"]")
    for mods in mod_map[bid[0]]:
        # map_info = maps.loc[maps['bid'] == bid[0]].iloc[0]
        
        mod_scores = mod_map[bid[0]][mods]
        if(len(mod_scores) < 50):
            continue
        # print(map_info["artist"],"-",map_info["name"] + "[" + map_info["version"] + "]+",intToMod(mods))
        num_scores = len(mod_scores)
        if len(mod_scores) > 2000:
            top10 = math.ceil(num_scores * 0.33)
        else:
            top10 =num_scores
        mod_scores.sort(key=lambda mod_scores: mod_scores[0], reverse=True)
        x = []
        y = []
        [x.append(val[0])  for val in mod_scores]
        [y.append(val[1])  for val in mod_scores]
        x = np.array(x)
        y = np.array(y)
        if bid[0] == 2201460 and mods == 24:
            print(x)
            print(y)

        score, y_pred = predictData(y,x,bid[0],num_scores)
        if score < 1:
            continue
        map_coefs.append((bid, score, mods, x, y, y_pred))
map_coefs.sort(key=lambda map_coefs: map_coefs[1], reverse=True)
with db.atomic():
    for m in map_coefs:
        bid = m[0]
        try:
            map_info = maps.loc[maps['bid'] == bid[0]].iloc[0]
            map_info = maps.loc[maps['bid'] == bid[0]].iloc[0]
            # print(m[1],map_info["artist"],"-",map_info["name"] + "[" + map_info["version"] + "]+",intToMod(m[2]))
            new_map = Beatmaps.replace(avg_acc=0,score=m[1],avg_pos =0,pop_mod=m[2],avg_pp=0,avg_rank=0,num_scores=0,mode=0,bid = bid[0], \
                name = map_info["name"], artist=map_info["artist"],mapper=map_info["mapper"],cs=map_info["cs"],ar=map_info["ar"],od=map_info["od"], \
                length=map_info["length"],bpm=map_info["bpm"],diff=map_info["diff"],version=map_info["version"],sid=map_info["sid"]).execute()
            # graphData(m[3],m[4],m[5])
        except:
            print("BID NOT FOUND",bid)