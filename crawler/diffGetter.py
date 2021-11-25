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
import sys, traceback, os
import sqlite3

db = SqliteDatabase('osuFM.db',pragmas=[('journal_mode', 'wal')])

good_maps = []

def intToMod(mod_int):
    mod_string = []
    if (mod_int == -1):
        mod_string.append({"acronym":"NO"})
    if (mod_int & 1 << 0):
        mod_string.append({"acronym":"NF"})
    if (mod_int & 1 << 1):
        mod_string.append({"acronym":"EZ"})
    if (mod_int & 1 << 2):
        mod_string.append({"acronym":"TD"})
    if (mod_int & 1 << 3):
        mod_string.append({"acronym":"HD"})
    if (mod_int & 1 << 4):
        mod_string.append({"acronym":"HR"})
    if (mod_int & 1 << 6 and not(mod_int & 1 << 9)):
        mod_string.append({"acronym":"DT"})
    if (mod_int & 1 << 7):
        mod_string.append({"acronym":"RX"})
    if (mod_int & 1 << 8):
        mod_string.append({"acronym":"HT"})
    if (mod_int & 1 << 9):
        mod_string.append({"acronym":"NC"})
    if (mod_int & 1 << 10):
        mod_string.append({"acronym":"FL"})
    if (mod_int & 1 << 5):
        mod_string.append({"acronym":"SD"})
    if (mod_int & 1 << 11):
        mod_string.append({"acronym":"AP"})
    if (mod_int & 1 << 12):
        mod_string.append({"acronym":"SO"})
    if (mod_int & 1 << 13):
        mod_string.append({"acronym":"RX"})
    if (mod_int & 1 << 14):
        mod_string.append({"acronym":"PF"})
    if (mod_int & 1 << 15):
        mod_string.append({"acronym":"4K"})
    if (mod_int & 1 << 16):
        mod_string.append({"acronym":"5K"})
    if (mod_int & 1 << 17):
        mod_string.append({"acronym":"6K"})
    if (mod_int & 1 << 18):
        mod_string.append({"acronym":"7K"})
    if (mod_int & 1 << 19):
        mod_string.append({"acronym":"8K"})
    if (mod_int & 1 << 20):
        mod_string.append({"acronym":"FI"})
    if (mod_int & 1 << 21):
        mod_string.append({"acronym":"RD"})
    if (mod_int & 1 << 22):
        mod_string.append({"acronym":"CM"})
    if (mod_int & 1 << 23):
        mod_string.append({"acronym":"TP"})
    if (mod_int & 1 << 24):
        mod_string.append({"acronym":"9K"})
    if (mod_int & 1 << 25):
        mod_string.append({"acronym":"CP"})
    if (mod_int & 1 << 26):
        mod_string.append({"acronym":"1K"})
    if (mod_int & 1 << 27):
        mod_string.append({"acronym":"3K"})
    if (mod_int & 1 << 28):
        mod_string.append({"acronym":"2K"})
    if (mod_int & 1 << 30):
        mod_string.append({"acronym":"MR"})
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
    
    def __init__(self, bid, sid, title, artist, mapper, cs, ar, od, length, bpm, diff, version, mode, date_ranked, score, pop_mod, avg_pp, avg_acc, avg_rank, avg_pos):
        self.bid = bid
        self.sid = sid
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
        self.date_ranked = date_ranked
        self.score = score
        self.avg_pp = avg_pp
        self.avg_acc = avg_acc
        self.avg_rank = avg_rank
        self.avg_pos = avg_pos
        self.pop_mod = pop_mod

    def to_dict(self):
        return {
        'bid': self.bid,
        'sid': self.sid,
        'name': self.title,
        'artist': self.artist,
        'mapper': self.mapper,
        'version': self.cs,
        'ar': self.ar,
        'cs': self.cs,
        'od': self.od,
        'length': self.length,
        'bpm': self.bpm,
        'diff': self.diff,
        'version': self.version,
        'mode': self.mode,
        'date_ranked': self.date_ranked,
        'score': self.score,
        'pop_mod': self.pop_mod,
        'avg_pp':  self.avg_pp,
        'avg_acc':  self.avg_acc,
        'avg_rank':  self.avg_rank,
        'avg_pos':  self.avg_pos
        }

def diffFetch(map):
    tries = 100
    url = "https://osu.ppy.sh/difficulty-rating"
    while tries > 0:
        try:
            body = {"beatmap_id":map.bid,"ruleset_id":map.mode,"mods":intToMod(map.pop_mod)}
            print(body,map.pop_mod)
            r = requests.post(url,json=body)
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
                return None
            continue
        return r.text

def getDiff(good_maps):
    for m in good_maps:
        m.diff = diffFetch(m)


def loadMaps():
    count = 0
    for m in Beatmaps.select():
        
        count += 1
        b = Beatmap(m.bid, m.sid, m.name,
                                    m.artist, m.mapper, m.cs, m.ar,
                                    m.od, m.length, m.bpm, m.diff,
                                    m.version,m.mode,m.date_ranked, m.score, m.pop_mod, m.avg_pp, m.avg_acc, m.avg_rank, m.avg_pos)
        good_maps.append(b)
    print("Loaded",count,"maps from the DB")
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

loadMaps()
getDiff(good_maps)
good_maps.sort(key=lambda x:x.score, reverse=True)
for map_info in good_maps:
    try:
        new_map = Beatmaps.replace(avg_acc=map_info.avg_acc,score=map_info.score,avg_pos =map_info.avg_pos,pop_mod=map_info.pop_mod,avg_pp=map_info.avg_pp,avg_rank=map_info.avg_rank,num_scores=map_info.num_scores,mode=map_info.mode,bid = map_info.bid, \
            name = map_info.title, artist=map_info.artist,mapper=map_info.mapper,cs=map_info.cs,ar=map_info.ar,od=map_info.od, \
            length=map_info.length,bpm=map_info.bpm,diff=map_info.diff,version=map_info.version,sid=map_info.sid,date_ranked=map_info.date_ranked, calculated=True).execute()
    except:
        print("Error executing query with map")
        print(map_info.artist,"-",map_info.title + "[" + map_info.version + "]+",map_info.pop_mod)
        print("    Score: ",map_info.score)
        print("    AVG PP: ",map_info.avg_pp)
        print("    AVG ACC: ",map_info.avg_acc)
        print("    AVG RANK: ",map_info.avg_rank)
try:
    os.remove("osuDB.db")
except:
    pass
con = sqlite3.connect("osuDB.db")
sqliteCursor = con.cursor()
df = pd.DataFrame.from_records([s.to_dict() for s in good_maps])
df.to_sql("beatmaps", con,index=False)

sqliteCursor.executescript('''
    PRAGMA foreign_keys=off;

    BEGIN TRANSACTION;
    ALTER TABLE beatmaps RENAME TO old_beatmaps;

    /*create a new table with the same column names and types while
    defining a primary key for the desired column*/
    CREATE TABLE "beatmaps" (
	"bid"	INTEGER,
	"sid"	INTEGER,
	"name"	TEXT,
	"artist"	TEXT,
	"mapper"	TEXT,
	"version"	TEXT,
	"ar"	REAL,
	"cs"	REAL,
	"od"	REAL,
	"length"	INTEGER,
	"bpm"	REAL,
	"diff"	REAL,
	"mode"	INTEGER,
	"date_ranked"	REAL,
	"score"	REAL,
	"pop_mod"	INTEGER,
	"avg_pp"	REAL,
	"avg_acc"	REAL,
	"avg_rank"	INTEGER,
	"avg_pos"	INTEGER,
	PRIMARY KEY("bid","pop_mod","mode")
);

    INSERT INTO beatmaps SELECT * FROM old_beatmaps;

    DROP TABLE old_beatmaps;
    COMMIT TRANSACTION;''')

sqliteCursor.executescript(
    """CREATE INDEX "loaderHelp" ON "beatmaps" (
	"mode",
	"score"	DESC
);
CREATE INDEX "searchHelp" ON "beatmaps" (
	"mode"	DESC,
	"score"	DESC,
	"ar"	DESC,
	"cs"	DESC,
	"length"	DESC,
	"bpm"	DESC,
	"diff"	DESC,
	"date_ranked"	DESC,
	"pop_mod"	DESC,
	"avg_pp"	DESC
);
""")
q2 = "pragma journal_mode = delete;"
q3 = "pragma page_size = 4096;"

q4 = "VACUUM;"
sqliteCursor.execute(q2)
sqliteCursor.execute(q3)
sqliteCursor.execute(q4)
con.commit()
con.close()

f=open("datemodified", "w")
f.write(str(datetime.now()))
f.close()