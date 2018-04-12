import sys, os
import configparser
import re
import mods
import math
import ssl
import json
import requests
import logging
import threading
from beatmap import Beatmap
import diff_calc
from time import sleep
from multiprocessing.dummy import Pool as ThreadPool 
from threading import Lock
from collections import Counter
from dateutil import parser
from peewee import *
from bs4 import BeautifulSoup

db = SqliteDatabase('../osuFM/osuFM.db',threadlocals=True,pragmas=[('journal_mode', 'wal')])
# logger = logging.getLogger('peewee')
# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.StreamHandler())
lock = Lock()
score_lock = Lock()
map_set = set()

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
    pop_mod = CharField()
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
    calculated = BooleanField()

class Scores(BaseModel):
    uid = IntegerField()
    bid = IntegerField()
    rank = IntegerField()
    acc = FloatField()
    mods = IntegerField()
    pos = IntegerField()
    mode = IntegerField()
    map_pp = FloatField()
    user_pp = FloatField()
    class Meta:
        primary_key = CompositeKey('uid', 'bid', 'mode')

class mods:
    def __init__(self):
        self.nomod = 0,
        self.nf = 0
        self.ez = 0
        self.hd = 0
        self.hr = 0
        self.dt = 0
        self.ht = 0
        self.nc = 0
        self.fl = 0
        self.so = 0
        self.speed_changing = self.dt | self.ht | self.nc
        self.map_changing = self.hr | self.ez | self.speed_changing
    def update(self):
        self.speed_changing = self.dt | self.ht | self.nc
        self.map_changing = self.hr | self.ez | self.speed_changing
mod = mods()

def set_mods(mod, m):
        if m == "NF":
            mod.nf = 1
        if m == "EZ":
            mod.ez = 1
        if m == "HD":
            mod.hd = 1
        if m == "HR":
            mod.hr = 1
        if m == "DT":
            mod.dt = 1
        if m == "HT":
            mod.ht = 1
        if m == "NC":
            mod.nc = 1
        if m == "FL":
            mod.fl = 1
        if m == "SO":
            mod.so = 1

# Attempt to import API key from config
try:
    f = open('keys.cfg');
    config = configparser.ConfigParser()
    config.readfp(f)
    key = config._sections["osu"]['api_key']
    pages = int(config._sections["crawler"]['pages'])
    threads = int(config._sections["crawler"]['threads'])
    limit = int(config._sections["crawler"]['limit'])
    start_page = int(config._sections["crawler"]['start_page'])
    country = config._sections["crawler"]['country']
    # Need to make this auto get every mode soon. 
    mode = int(config._sections["crawler"]['mode'])
except:
    raise Exception("Invalid config")

def fetchURL(url):
    count = 30
    while count > 0:
        try:
            count -= 1
            r = requests.get(url,timeout=2)
            break
        except Exception as e:
            sleep(1)
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print("[" + str(30 - count) + "/20" + "]",str(e), fname, exc_tb.tb_lineno)
            if count == 1:
                exit()
    if count == 0:
        print("Network timeout")
        exit()
    return r.text.splitlines()

def calcDiff(m):
    mod = mods()
    url = "https://osu.ppy.sh/osu/" + str(m.bid)
    mod_s = m.pop_mod
    if mod_s == "HD" or mod_s == "":
        m.calculated = True
        return
    if mod_s != "":
        mod_s = [mod_s[i:i+2] for i in range(0, len(mod_s), 2)]
        for ms in mod_s:
            set_mods(mod, ms)
            mod.update()
    bm = fetchURL(url)
    map = Beatmap(bm)
    map.bpm = m.bpm
    map.length = m.length
    map.apply_mods(mod)
    diff = diff_calc.main(map)[2]
    m.cs = map.cs
    m.ar = map.ar
    m.od = map.od
    m.bpm = map.bpm
    m.length = map.length
    m.diff = diff
    m.calculated = True
    m.save()

def diffCalc(arg):
    maps = arg['maps']
    length = arg['size']
    count = 0
    for m in maps:
        count += 1
        print("[" + str(count) + "/" + str(arg['size']) + "]")
        if m.calculated == None or m.calculated == 0:
            calcDiff(m)



try:
    db.connect()
except:
    pass
try:
    Beatmaps.create_table(True)
    Scores.create_table(True)
    # db.create_tables([Beatmaps, Scores])
    print("Initialized DB tables")
except:
    pass
print("Beginning score processing...")
pool = ThreadPool(threads)
arg = []
maps = []
print("Loading Maps")
count = Beatmaps.select().where(Beatmaps.mode == 0).count()
offset = count % threads
current = 0
size = math.floor(count / threads)
for m in Beatmaps.select().where(Beatmaps.mode == 0).order_by(Beatmaps.score.desc()):
    maps.append(m)
for i in range(0,threads): 
    if i == 0:
        arg.append({'start': current,'size': offset + size, 'count': count, 'maps': maps[current:current+size]})
        current += offset + size
    else:
        arg.append({'start': current,'size': size, 'count': count, 'maps': maps[current:current+size]})
        current += size 
pool.map(diffCalc,arg)