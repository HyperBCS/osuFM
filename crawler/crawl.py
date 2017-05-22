import sys, os
import configparser
import re
import mods
import math
import ssl
import mods
import json
import requests
from multiprocessing.dummy import Pool as ThreadPool 
from threading import Lock
from collections import Counter
from dateutil import parser
from peewee import *
from bs4 import BeautifulSoup

db = SqliteDatabase('../osuFM/osuFM.db',threadlocals=True)
lock = Lock()
score_lock = Lock()

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
    avg_pos = IntegerField()
    mode = IntegerField()
    date_ranked = DateTimeField()
    cs = FloatField()
    ar = FloatField()
    length = IntegerField()
    bpm = FloatField()
    diff = FloatField()
    version = CharField()
    score = FloatField()

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
    

# Actually scores
class Beatmap(object):
    bid = 0
    scores = []
    def __init__(self, bid, acc, mods,uid,pp,raw_pp,rank, pos):
        self.bid = bid
        self.scores = [{'acc': acc,'mods': mods,'uid': uid,'pp': pp, 'raw_pp': raw_pp, 'rank': rank, 'pos': pos}]
    def __eq__(self, other):
        if isinstance(other, Beatmap):
            return ((self.bid == other.bid))
        else:
            return False
    def __ne__(self, other):
        return (not self.__eq__(other))
    def __hash__(self):
        return hash(self.bid)
    def addScore(self, bid, acc, mods,uid,pp,raw_pp,rank, pos):
        self.scores.append({'acc': acc,'mods': mods,'uid': uid,'pp': pp, 'raw_pp': raw_pp, 'rank': rank, 'pos': pos})

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
    pages = int(config._sections["crawler"]['pages'])
    threads = int(config._sections["crawler"]['threads'])
    limit = int(config._sections["crawler"]['limit'])
    # Need to make this auto get every mode soon. 
    mode = int(config._sections["crawler"]['mode'])
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
        return baseURL + "?k="+key+"&u="+str(uid[0])+"&m="+str(mode)+"&limit="+str(limit)
    elif type == 2:
        baseURL = "https://osu.ppy.sh/api/get_user"
        return baseURL + "?k="+key+"&u="+str(uid[0])+"&m="+str(mode)
    elif type == 3:
        baseURL = "https://osu.ppy.sh/api/get_beatmaps"
        return baseURL + "?k="+key+"&b="+str(uid)+"&m="+str(mode)+"&a=1"

def fetchURL(url):
    count = 20
    while count > 0:
        try:
            count -= 1
            r = requests.get(url,timeout=1)
            break
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(str(e), fname, exc_tb.tb_lineno)
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
    tries = 3
    while tries > 0:
        try:
            new_map = Beatmaps.create(score=0,avg_pos = 0,pop_mod=0,avg_pp=0,avg_rank=0,num_scores=0,mode=mode,bid = beatmap.bid, name = map_info['title'], artist=map_info['artist'],mapper=map_info['creator'],date_ranked=date_ranked,cs=map_info['diff_size'],ar=map_info['diff_approach'],length=map_info['total_length'],bpm=map_info['bpm'],diff=map_info['difficultyrating'],version=map_info['version'])
            break
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(str(e), fname, exc_tb.tb_lineno)
    lock.release()
    updateScores(beatmap, mode)


def updateScores(new_map, mode):
    score = None
    score_lock.acquire()
    for sc in new_map.scores:
        tries = 3
        while tries > 0:
            try:
                for s in Scores.select().where(Scores.uid == sc['uid'],Scores.bid == new_map.bid, Scores.mode == mode):
                    score = s
                    s.rank = sc['rank']
                    s.acc = sc['acc']
                    s.mods = sc['mods']
                    s.map_pp = sc['pp']
                    s.user_pp = sc['raw_pp']
                    s.pos = sc['pos']
                    s.save()
                if score == None:
                    score = Scores.create(pos=sc['pos'],uid=sc['uid'],bid=new_map.bid,rank=sc['rank'],acc=sc['acc'],mods=sc['mods'],mode=mode,map_pp=sc['pp'],user_pp=sc['raw_pp'])
                score = None
                break
            except Exception as e:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(str(e), fname, exc_tb.tb_lineno)
    score_lock.release()

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
    for user in raw_user[0:10]:
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
        count = 0
        for top in user.scores:
            count += 1
            acc = Acc(top)
            beatmap = Beatmap(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'],user.pp,user.rank, count)
            if beatmap not in maps:
                maps.add(beatmap)
            else:
                for m in maps:
                    if beatmap == m:
                        m.addScore(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'],user.pp,user.rank, count)


def fetchMode(info):
    start = info['start']
    pages = start + info['pages']
    if pages > 200:
        pages = 200
    mode = info['mode']
    map_set = set()
    try:
        for i in range(start,pages):
            print("[" + str(i) + "/" + str(pages-1) + "]")
            getPage(i,mode, map_set)
        updateDB(map_set, mode)
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(str(e), fname, exc_tb.tb_lineno)
        lock.release()
        score_lock.release()

def updateDB(maps, mode):
    counter = 0
    length = len(maps)
    for m in maps:
        counter += 1
        db_map = None
        db_map = Beatmaps.select().where(Beatmaps.bid == int(m.bid), Beatmaps.mode == mode)
        if len(db_map) != 0:
            print("[" + str(counter) +"/" + str(length) +  "]BID: "+str(m.bid) + " - FOUND")
            updateScores(m, mode)
            continue
        lock.acquire()
        db_map = Beatmaps.select().where(Beatmaps.bid == int(m.bid), Beatmaps.mode == mode)
        # print("LENGTH "+str(len(db_map)))
        if len(db_map) == 0:
            print("[" + str(counter) +"/" + str(length) +  "]BID: "+str(m.bid) + " - ADDING")
            addBeatmap(m, mode)
        else:
            lock.release()
            print("[" + str(counter) +"/" + str(length) +  "]BID: "+str(m.bid) + " - FOUND")
            updateScores(m, mode)

def ci(pos, n):
    z = 1.96
    phat = 1.0 * pos / n

    return (phat + z*z/(2*n) - z * math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)


try:
    db.connect()
except:
    pass
try:
    db.create_tables([Beatmaps, Scores])
    print("Initialized DB tables")
except:
    pass
offset = pages % threads
size = math.floor(pages / threads)
current = 1
pool = ThreadPool(threads)
arg = []
for i in range(0,threads): 
    if i == 0:
        arg.append({'start': 1,'pages': offset + size,'mode': mode})
        current += offset + size
    else:
        arg.append({'start': current,'pages': size,'mode': mode})
        current += size 
results = pool.map(fetchMode, arg)
print("Beginning score processing...")
for m in Beatmaps.select():
    avg_pp = 0
    avg_rank = 0
    avg_pos = 0
    modl = []
    scores = Scores.select().where(Scores.bid == m.bid, Scores.mode == m.mode)
    for item in scores:
        modl.append(item.mods)
    modl = Counter(modl).most_common()
    pop_mod = modl[0][0]
    count_mod = 0
    count_pos = 0
    i = 0
    num_scores = len(scores)
    for item in scores:
        i += 1
        threshhold = 30
        if pop_mod == item.mods:
            if item.pos < threshhold:
                count_pos += 1
            count_mod += 1
            avg_pp += item.map_pp
            avg_pos += item.pos
            avg_rank += item.rank
    # Avg pp and rank are for specific mod, but num scores are for everything
    avg_pp /= count_mod
    avg_rank /= count_mod
    avg_pos /= count_mod
    m.avg_pp = avg_pp
    m.avg_rank = avg_rank
    m.avg_pos = avg_pos
    m.num_scores = len(scores)
    scaled_pos = num_scores * (count_pos / count_mod)
    ci_score = ci(scaled_pos, num_scores)
    # print("SCORE: " + str(ci_score) + " FOR " + m.artist + " - " + m.name)
    m.score=ci_score
    if pop_mod == 576:
        pop_mod -= 512
    m.pop_mod = mods.main(pop_mod)
    tries = 3
    while tries > 0:
        try:
            m.save()
            break
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(str(e), fname, exc_tb.tb_lineno)
