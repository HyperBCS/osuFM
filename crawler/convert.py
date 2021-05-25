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
db2 = SqliteDatabase('osuFM3.db',pragmas=[('journal_mode', 'wal')])

good_maps = []

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
    
    def __init__(self, bid, set_id, title, artist, mapper, cs, ar, od, length, bpm, diff, version, mode, date_ranked, score, pop_mod, avg_pp, avg_acc, avg_rank, avg_pos):
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
        'sid': self.set_id,
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

good_maps.sort(key=lambda x:x.score, reverse=True)
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

q1 = """CREATE INDEX "queryHelper" ON "beatmaps" (
	"score"	DESC,
	"index",
	"bid",
	"sid",
	"name",
	"artist",
	"mapper",
	"version",
	"ar",
	"cs",
	"od",
	"length",
	"bpm",
	"diff",
	"mode",
	"date_ranked",
	"pop_mod",
	"avg_pp",
	"avg_acc",
	"avg_rank",
	"avg_pos"
);
"""
q2 = "pragma journal_mode = delete;"
q3 = "pragma page_size = 4096;"

q4 = "VACUUM;"
sqliteCursor.execute(q1)
sqliteCursor.execute(q2)
sqliteCursor.execute(q3)
sqliteCursor.execute(q4)
con.commit()
con.close()

# f=open("datemodified", "w")
# f.write(str(datetime.now()))
# f.close()