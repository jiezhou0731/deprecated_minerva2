#!/usr/bin/python

from bs4 import BeautifulSoup
import re
import json
import requests
from requests.auth import HTTPBasicAuth

for i in range(0,1727):
	print i
	data = {"from" : i*1000, "size" : 1000,
    "query" : {
        "match_all" : {}
    	}
	};
	data_json = json.dumps(data)
	headers = {'content-type': 'application/json'}
	r = requests.post('https://els.istresearch.com:19200/memex-domains/electronics/_search', data=data_json, auth=HTTPBasicAuth('memex', '3vYAZ8bSztbxmznvhD4C'), headers=headers)
	f = open("dump/"+str(i)+'.json','w')
	f.write(r.text)
	f.close()