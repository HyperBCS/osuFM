import sys
import configparser
import urllib.request
import re
import mods
import ssl
import json
from bs4 import BeautifulSoup

class Beatmap(object):
    bid = 0
    scores = []
    def __init__(self, bid, acc, mods,uid,pp):
        self.bid = bid
        self.scores = [{'acc': acc,'mods': mods,'uid': uid,'pp': pp}]
    def __eq__(self, other):
        if isinstance(other, Beatmap):
            return ((self.bid == other.bid))
        else:
            return False
    def __ne__(self, other):
        return (not self.__eq__(other))
    def __hash__(self):
        return hash(self.bid)
    def addScore(self, bid, acc, mods,uid,pp):
        self.scores.append({'acc': acc,'mods': mods,'uid': uid,'pp': pp})

class User:
    uid = ""
    scores = []
    def __init__(self,username,scores):
        self.uid = username
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
        return baseURL + "?k="+key+"&u="+str(uid[0])+"&m="+str(mode)+"&limit=10"

def fetchTop(uid, mode):
    url = urlBuilder(0,mode, 1,uid)
    context = ssl._create_unverified_context()
    page = urllib.request.urlopen(url,context=context).read()
    return json.loads(page)

def getPage(page, mode, maps):
    url = urlBuilder(page,mode,0)
    context = ssl._create_unverified_context()
    page = BeautifulSoup(urllib.request.urlopen(url,context=context).read(),"html.parser")
    raw_user = page.table.find_all('a')
    users = []
    for user in raw_user:
        if user != None:
            uid = re.findall('\d+', user['href'])
            tops = fetchTop(uid,mode)
            users.append(User(str(uid[0]),tops))
    for user in users:
        for top in user.scores:
            acc = Acc(top)
            beatmap = Beatmap(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'])
            if beatmap not in maps:
                maps.add(beatmap)
            else:
                for m in maps:
                    if beatmap == m:
                        m.addScore(top['beatmap_id'],acc,top['enabled_mods'], user.uid, top['pp'])


def fetchMode(pages,mode):
    map_set = set()
    for i in range(1,pages+1):
        getPage(i,mode, map_set)
    return map_set

pages = 1
mode = 3
maps = fetchMode(pages,mode)
print('BID,Count')
for m in maps:
    print("'"+m.bid+"',"+str(len(m.scores)))