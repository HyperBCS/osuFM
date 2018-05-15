import sys, os
import re
import ssl
import json
from requests.adapters import HTTPAdapter 
from requests.packages.urllib3.util.retry import Retry
from requests_futures.sessions import FuturesSession
from requests import Session
from bs4 import BeautifulSoup

def fetch_countries(page):
    urls = "https://osu.ppy.sh/p/countryranking?p=countryranking&s=3&o=1&page=" + str(page)
    # page = fetchURL(url)
    ss = Session()
    retries = Retry(total=5, raise_on_redirect=True,
                    raise_on_status=True)
    ss.mount('http://', HTTPAdapter(max_retries=retries))
    ss.mount('https://', HTTPAdapter(max_retries=retries))
    s = FuturesSession(max_workers=50, session=ss)
    cookies = dict(osu_site_v='old')
    rs = s.get(urls,cookies=cookies, timeout=2)
    page = rs.result().text
    page = BeautifulSoup(page,"html.parser")
    page = page.find("table", class_="beatmapListing").select("a")
    countries = []
    before = re.compile(r"<.*\?c=")
    after = re.compile(r"\".*>")
    for country in page:
    	country = before.sub("", str(country))
    	country = after.sub("", str(country))
    	countries.append(country)
    # table = page.p['beatmapListing'].find_all('href')
    return countries

ccs = {'countries':  []}
for i in range(5):
	ccs['countries'] += fetch_countries(i)
with open('countries.json', 'w') as fp:
    json.dump(ccs, fp)