import sys
import configparser
import re
import mods
import math
import ssl
import mods
import json
import requests
from multiprocessing.dummy import Pool as ThreadPool 
from collections import Counter
from dateutil import parser
from peewee import *
from bs4 import BeautifulSoup

db = SqliteDatabase('../osuFM/osuFM.db')

class BaseModel(Model):
    class Meta:
        database = db

class Beatmaps(BaseModel):
    bid = IntegerField()
    name = CharField()
    artist = CharField()
    mapper = CharField()
    num_scores = IntegerField()
    pop_mod = CharField()
    avg_pp = FloatField()
    avg_rank = IntegerField()
    mode = IntegerField()
    date_ranked = DateTimeField()
    cs = FloatField()
    ar = FloatField()
    length = IntegerField()
    bpm = FloatField()
    diff = FloatField()
    version = CharField()

class Scores(BaseModel):
    uid = IntegerField()
    bid = IntegerField()
    rank = IntegerField()
    acc = FloatField()
    mods = IntegerField()
    mode = IntegerField()
    map_pp = FloatField()
    user_pp = FloatField()
    

# Actually scores
class Beatmap(object):
    bid = 0
    scores = []
    def __init__(self, bid, acc, mods,uid,pp,raw_pp,rank):
        self.bid = bid
        self.scores = [{'acc': acc,'mods': mods,'uid': uid,'pp': pp, 'raw_pp': raw_pp, 'rank': rank}]
    def __eq__(self, other):
        if isinstance(other, Beatmap):
            return ((self.bid == other.bid))
        else:
            return False
    def __ne__(self, other):
        return (not self.__eq__(other))
    def __hash__(self):
        return hash(self.bid)
    def addScore(self, bid, acc, mods,uid,pp,raw_pp,rank):
        self.scores.append({'acc': acc,'mods': mods,'uid': uid,'pp': pp, 'raw_pp': raw_pp, 'rank': rank})

class User:
    uid = ""
    pp = 0
    rank = 0
    scores = []
    def __init__(self,username,scores, pp, rank):
        self.uid = username
        self.pp = pp
        self.rank = rank
        self.scores = scores

def Acc(json):
    a50 = int(json['count50'])
    a100 = int(json['count100'])
    a300 = int(json['count300'])
    amiss = int(json['countmiss'])
    acc = str(round(100*(a50/6 + a100*2/6 + a300)/(a50+a100+a300+amiss),2))
    return acc

# Attempt to import API key from config
try:
    f = open('keys.cfg');
    config = configparser.ConfigParser()
    config.readfp(f)
    key = config._sections["osu"]['api_key']
except:
    raise Exception("Invalid config")

def urlBuilder(page, mode, type,uid=0):
    if type == 0:
        baseURL = "https://osu.ppy.sh/p/pp/"
        if (page > 0 and page < 200) and (mode >= 0 and mode < 4):
            return baseURL+"?m="+str(mode)+"&page="+str(page)
        else:
            print("Page or mode out of range")
            exit()
    elif type == 1:
        baseURL = "https://osu.ppy.sh/api/get_user_best"
        return baseURL + "?k="+key+"&u="+str(uid[0])+"&m="+str(mode)+"&limit=50"
    elif type == 2:
        baseURL = "https://osu.ppy.sh/api/get_user"
        return baseURL + "?k="+key+"&u="+str(uid[0])+"&m="+str(mode)
    elif type == 3:
        baseURL = "https://osu.ppy.sh/api/get_beatmaps"
        return baseURL + "?k="+key+"&b="+str(uid)+"&m="+str(mode)+"&a=1"

def fetchURL(url):
    count = 10
    while count > 0:
        try:
            count -= 1
            r = requests.get(url,timeout=1)
            break
        except Exception as e:
            print(str(e))
    if count == 0:
        print("Network timeout")
        exit()
    return r.text

# Need to detect except httplib.IncompleteRead
def fetchTop(uid, mode):
    url = urlBuilder(0,mode, 1,uid)
    page = fetchURL(url)
    return (json.loads(page))

def addBeatmap(beatmap, mode):
    url = urlBuilder(0,mode,3,beatmap.bid)
    page = fetchURL(url)
    map_info = (json.loads(page))[0]
    date_ranked = parser.parse(map_info['approved_date'])
    new_map = Beatmaps.create(pop_mod=0,avg_pp=0,avg_rank=0,num_scores=len(beatmap.scores),mode=mode,bid = beatmap.bid, name = map_info['title'], artist=map_info['artist'],mapper=map_info['creator'],date_ranked=date_ranked,cs=map_info['diff_size'],ar=map_info['diff_approach'],length=map_info['total_length'],bpm=map_info['bpm'],diff=map_info['difficultyrating'],version=map_info['version'])
    print("Adding beatmap to DB")
    updateScores(beatmap, mode)


def updateScores(new_map, mode):
    score = None
    for sc in new_map.scores:
        for s in Scores.select().where(Scores.uid == sc['uid'],Scores.bid == new_map.bid):
            score = s
            s.rank = sc['rank']
            s.acc = sc['acc']
            s.mods = sc['mods']
            s.map_pp = sc['pp']
            s.user_pp = sc['raw_pp']
            s.save()
        if score == None:
            score = Scores.create(uid=sc['uid'],bid=new_map.bid,rank=sc['rank'],acc=sc['acc'],mods=sc['mods'],mode=mode,map_pp=sc['pp'],user_pp=sc['raw_pp'])
        score = None


def getPage(page, mode, maps):
    url = urlBuilder(page,mode,0)
    page = fetchURL(url)
    page = BeautifulSoup(page,"html.parser")
    table = page.find('table', attrs={'class':'beatmapListing'})
    raw_user = page.table.find_all('a')
    rows = table.find_all('tr')
    data = []
    users = []
    count = 1
    for row in rows:
        cols = row.find_all('td')
        cols = [ele.text.strip() for ele in cols]
        data.append([ele for ele in cols if ele]) # Get rid of empty values
    for user in raw_user:
        if user != None:
            uid = re.findall('\d+', user['href'])
            rank = re.findall('\d+', data[count][0])
            pp_raw = data[count][4].replace(",","")
            pp_raw = re.findall('\d+', pp_raw)
            print("Rank "+str(rank))
            tops = fetchTop(uid,mode)
            users.append(User(str(uid[0]),tops,pp_raw[0],rank[0]))
        count += 1
    for user in users:
        for top in user.scores:
            acc = Acc(top)
            beatmap = Beatmap(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'],user.pp,user.rank)
            if beatmap not in maps:
                maps.add(beatmap)
            else:
                for m in maps:
                    if beatmap == m:
                        m.addScore(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'],user.pp,user.rank)


def fetchMode(info):
    start = info['start']
    pages = start + info['pages']
    mode = info['mode']
    map_set = set()
    for i in range(start,pages+1):
        print("[" + str(i) + "/" + str(start+pages) + "]")
        getPage(i,mode, map_set)
    return map_set


try:
    db.connect()
except:
    pass
try:
    db.create_tables([Beatmaps, Scores])
    print("Initialized DB tables")
except:
    pass
pages = 20
threads = 4
mode = 0
offset = pages % threads
size = math.floor(pages / threads)
current = 1
pool = ThreadPool(threads)
arg = []
for i in range(0,math.floor(pages/size)): 
    if i == 0:
        arg.append({'start': 1,'pages': offset + size,'mode': 1})
        current += offset + size
    else:
        arg.append({'start': current,'pages': current + size,'mode': 1})
        current += size
results = pool.map(fetchMode, arg)
# maps = fetchMode(1,20,mode)
for m in maps:
    db_map = None
    print("BID: "+str(m.bid))
    for n in Beatmaps.select().where(Beatmaps.bid == int(m.bid)):
        db_map = n
    if db_map == None:
        addBeatmap(m, mode)
    else:
        updateScores(m, mode)
for m in Beatmaps.select():
    avg_pp = 0
    avg_rank = 0
    modl = []
    scores = Scores.select().where(Scores.bid == m.bid, Scores.mode == m.mode)
    for item in scores:
        avg_pp += item.map_pp
        avg_rank += item.rank
        modl.append(item.mods)
    avg_pp /= len(scores)
    avg_rank /= len(scores)
    modl = Counter(modl)
    m.avg_pp = avg_pp
    m.avg_rank = avg_rank
    pop_mod = list(modl.elements())[0]
    if pop_mod == 576:
        pop_mod -= 512
    m.pop_mod = mods.main(pop_mod)
    m.save()
