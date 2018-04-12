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
from requests.adapters import HTTPAdapter 
from requests.packages.urllib3.util.retry import Retry
from requests_futures.sessions import FuturesSession
from requests import Session
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
    calculated = BooleanField(null = True)

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

# Actually scores
class Beatmap(object):
    bid = 0
    scores = []
    def __init__(self, bid, acc, mods,uid,pp,raw_pp,rank, pos, mode):
        self.bid = bid
        self.scores = [{'bid': bid,'acc': acc,'mods': mods,'uid': uid,'map_pp': pp, 'user_pp': raw_pp, 'rank': rank, 'pos': pos, 'mode': mode}]
    def __eq__(self, other):
        if isinstance(other, Beatmap):
            return ((self.bid == other.bid))
        else:
            return False
    def __ne__(self, other):
        return (not self.__eq__(other))
    def __hash__(self):
        return hash(self.bid)
    def addScore(self, bid, acc, mods,uid,pp,raw_pp,rank, pos, mode):
        self.scores.append({'bid': bid, 'acc': acc,'mods': mods,'uid': uid,'map_pp': pp, 'user_pp': raw_pp, 'rank': rank, 'pos': pos, 'mode': mode})

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
    start_page = int(config._sections["crawler"]['start_page'])
    country = config._sections["crawler"]['country']
    # Need to make this auto get every mode soon. 
    mode = int(config._sections["crawler"]['mode'])
except:
    raise Exception("Invalid config")

def urlBuilder(page, mode, type,uid=0):
    if type == 0:
        baseURL = "https://osu.ppy.sh/p/pp/"
        if (page > 0 and page <= 200) and (mode >= 0 and mode < 4):
            if country == None or country == "":
                return baseURL+"?m="+str(mode)+"&page="+str(page)
            else:
                return baseURL+"?m="+str(mode)+"&page="+str(page) + "&c="+country
        else:
            print("Page or mode out of range")
            exit()
    elif type == 1:
        baseURL = "https://osu.ppy.sh/api/get_user_best"
        return baseURL + "?k="+key+"&u="+str(uid)+"&m="+str(mode)+"&limit="+str(limit)
    elif type == 2:
        baseURL = "https://osu.ppy.sh/osu/"
        return baseURL + str(uid)
    elif type == 3:
        baseURL = "https://osu.ppy.sh/api/get_beatmaps"
        return baseURL + "?k="+key+"&b="+str(uid)+"&m="+str(mode)+"&a=1"

def fetchURL(url):
    count = 30
    while count > 0:
        try:
            count -= 1
            cookies = dict(osu_site_v='old')
            r = requests.get(url,timeout=2,cookies=cookies)
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
    return r.text

# Need to detect except httplib.IncompleteRead
def fetchTop(uids, mode):
    urls = [urlBuilder(0,mode,1,uid) for uid in uids]
    # page = fetchURL(url)
    ss = Session()
    retries = Retry(total=5, raise_on_redirect=True,
                    raise_on_status=True)
    ss.mount('http://', HTTPAdapter(max_retries=retries))
    ss.mount('https://', HTTPAdapter(max_retries=retries))
    s = FuturesSession(max_workers=50, session=ss)
    cookies = dict(osu_site_v='old')
    rs = (s.get(u,cookies=cookies, timeout=2) for u in urls)
    pages = [json.loads(pg.result().text) for pg in rs]
    return pages

def addBeatmap(beatmap, mode):
    bm = Beatmaps.select().where(Beatmaps.bid == beatmap['bid'], Beatmaps.mode == mode, Beatmaps.pop_mod == "" | Beatmaps.pop_mod == "HD" )
    sid = None
    cs = None
    ar = None
    od = None
    diff = None
    bpm = None
    length = None
    version = None
    title = None
    artist = None
    creator = None
    if bm == None:
        url = urlBuilder(0,mode,3,beatmap['bid'])
        page = fetchURL(url)
        pop_mod = mods.main(beatmap['pop_mod'])
        map_info = (json.loads(page))[0]
        sid = map_info['beatmapset_id']
        cs = map_info['diff_size']
        ar = map_info['diff_approach']
        od = map_info['diff_overall']
        diff = map_info['difficultyrating']
        bpm = map_info['bpm']
        length = map_info['total_length']
        version = map_info['version']
        title = map_info['title']
        artist = map_info['artist']
        creator = map_info['creator']
    else:
        bm = bm[0]
        sid = bm.sid
        cs = bm.cs
        ar = bm.ar
        od = bm.od
        diff = bm.diff
        bpm = bm.bpm
        length = bm.length
        version = bm.version
        title = bm.title
        artist = bm.artist
        creator = bm.creator
    tries = 3
    while tries > 0:
        try:
            lock.acquire()
            new_map = Beatmaps.create(avg_acc=beatmap['avg_acc'],score=beatmap['score'],avg_pos = beatmap['avg_pos'],pop_mod=pop_mod,avg_pp=beatmap['avg_pp'],avg_rank=beatmap['avg_rank'],num_scores=beatmap['num_scores'],mode=mode,bid = beatmap['bid'], \
             name = title, artist=artist,mapper=creator,cs=cs,ar=ar,od=od, \
             length=length,bpm=bpm,diff=diff,version=version,sid=sid)
            lock.release()
            break
        except Exception as e:
            lock.release()
            tries -= 1
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(str(e), fname, exc_tb.tb_lineno)


# Create a function called "chunks" with two arguments, l and n:
def chunks(l, n):
    # For item i in a range that is a length of l,
    for i in range(0, len(l), n):
        # Create an index range for l of n items:
        yield l[i:i+n]


def updateMap(beatmap, mode):
    tries = 3
    while tries > 0:
        try:
            query = Beatmaps.update(avg_acc=beatmap['avg_acc'],score=beatmap['score'],avg_pos = beatmap['avg_pos'],avg_pp=beatmap['avg_pp'], \
                avg_rank=beatmap['avg_rank'],num_scores=beatmap['num_scores']) \
                .where(Beatmaps.bid == beatmap['bid'], \
                Beatmaps.mode==mode, Beatmaps.pop_mod==beatmap['pop_mod'])
            query.execute()
            break
        except Exception as e:
            tries -= 1
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(str(e), fname, exc_tb.tb_lineno)

def getPage(page, mode):
    global map_set
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
    user_data = []
    for user in raw_user:
        if user != None:
            uid = re.findall('\d+', user['href'])
            rank = re.findall('\d+', data[count][0])
            pp_raw = data[count][4].replace(",","")
            pp_raw = re.findall('\d+', pp_raw)
            # print("Rank "+str(rank))
            count += 1
            user_data.append({'uid': uid[0], 'rank': rank[0], 'pp_raw': pp_raw[0]})
    tops = fetchTop([ud['uid'] for ud in user_data], mode)
    for ind, user in enumerate(user_data):
        users.append(User(str(user['uid']),tops[ind],user['pp_raw'],user['rank']))
    for user in users:
        count = 0
        lock.acquire()
        for top in user.scores:
            count += 1
            acc = Acc(top)
            mods = int(top['enabled_mods'])
            if mods & 512 != 0:
                mods = mods ^ 512
            beatmap = Beatmap(top['beatmap_id'],float(acc),mods, user.uid, float(top['pp']),float(user.pp),int(user.rank), count, mode)
            if beatmap not in map_set:
                map_set.add(beatmap)
            else:
                for m in map_set:
                    if beatmap == m:
                        m.addScore(top['beatmap_id'],float(acc),int(mods), user.uid, float(top['pp']),float(user.pp),int(user.rank), count, mode)
        lock.release()


def fetchMode(info):
    start = info['start']
    pages = start + info['pages']
    if pages > 201:
        pages = 201
    mode = info['mode']
    map_set = set()
    try:
        for i in range(start,pages):
            print("[" + str(i) + "/" + str(pages-1) + "]")
            getPage(i,mode)
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(str(e), fname, exc_tb.tb_lineno)
        lock.release()
        score_lock.release()

def updateDB(info, mode):
    db_map = None
    bid = info['bid']
    mod = info['pop_mod']
    db_map = Beatmaps.select().where(Beatmaps.bid == int(bid), Beatmaps.mode == mode, Beatmaps.pop_mod == mods.main(mod))
    # print("LENGTH "+str(len(db_map)))
    if len(db_map) == 0:
        print("Adding map to DB")
        addBeatmap(info, mode)
    else:
        updateMap(info, mode)

def processMaps(args):
    n = 0
    mode = args['mode']
    count = args['size']
    print("STARTING" + str(len(args['maps'])))
    for m in args['maps']:
        n +=1 
        print("["+str(n)+"/"+str(count) + "]")
        modl = []
        top_mods = []
        scores = m.scores
        for item in scores:
            modl.append(item['mods'])
        modl = Counter(modl).most_common()
        if len(modl) == 0:
            continue
        for ppm in modl:
            pop_mod = ppm[0]
            avg_pp = 0
            avg_rank = 0
            avg_pos = 0
            avg_acc = 0
            count_mod = 0
            count_pos = 0
            num_scores = len(scores)
            for item in scores:
                threshhold = 33
                if ppm[0] == item['mods']:
                    count_mod += 1
                    if item['pos'] < threshhold:
                        count_pos += 1
            if count_pos < 50:
                continue
            top_mods = count_pos / count_mod
            for item in scores:
                if pop_mod == item['mods']:
                    avg_pp += item['map_pp']
                    avg_pos += item['pos']
                    avg_rank += item['rank']
                    avg_acc += item['acc']
            # Avg pp and rank are for specific mod, but num scores are for everything
            avg_pp /= count_mod
            avg_rank /= count_mod
            avg_pos /= count_mod
            avg_acc /= count_mod
            # scaled_pos = num_scores * (count_pos / count_mod)
            scaled_pos = num_scores * top_mods
            ci_score = ci(scaled_pos, num_scores)
            # print("SCORE: " + str(ci_score) + " FOR " + m.artist + " - " + m.name)
            info = {'bid': m.bid,'avg_pp': avg_pp, 'avg_rank': avg_rank, 'avg_pos': avg_pos, 'avg_acc': avg_acc, 'num_scores': count_mod, 'score': ci_score, 'pop_mod': pop_mod}
            tries = 20
            # while tries > 0:
            #     try:
                    # query = Beatmaps.update(avg_pp = avg_pp,avg_rank = avg_rank,avg_pos = avg_pos,avg_acc = avg_acc,num_scores = len(scores),score=ci_score,pop_mod = mods.main(pop_mod)).where(Beatmaps.bid == m.bid, Beatmaps.mode == m.mode)
            updateDB(info,mode)
                #     break
                # except Exception as e:
                #     tries -= 1
                #     exc_type, exc_obj, exc_tb = sys.exc_info()
                #     fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                #     print(str(e), fname, exc_tb.tb_lineno)

def ci(pos, n):
    z = 3.5
    phat = 1.0 * pos / n

    return (phat + z*z/(2*n) - z * math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)

def getKey(item):
    return item[0]


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
offset = pages % threads
size = math.floor(pages / threads)
current = start_page
pool = ThreadPool(threads)
arg = []
for i in range(0,threads): 
    if i == 0:
        arg.append({'start': current,'pages': offset + size,'mode': mode})
        current += offset + size
    else:
        arg.append({'start': current,'pages': size,'mode': mode})
        current += size 
results = pool.map(fetchMode, arg)
print("Beginning score processing...")
arg = []
maps = []
print("Loading Maps")
count = len(map_set)
offset = count % threads
current = 0
size = math.floor(count / threads)
for m in map_set:
    maps.append(m)
for i in range(0,threads): 
    if i == 0:
        arg.append({'start': current,'size': offset + size,'mode': mode, 'count': count, 'maps': maps[current:current+size]})
        current += offset + size
    else:
        arg.append({'start': current,'size': size,'mode': mode, 'count': count, 'maps': maps[current:current+size]})
        current += size 
pool.map(processMaps,arg)