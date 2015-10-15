#!/usr/bin/python

from bs4 import BeautifulSoup
import re
import json
import requests
from requests.auth import HTTPBasicAuth

data = {"from" : 2, "size" : 1,
    "query" : {
        "match_all" : {}
    }
};
data_json = json.dumps(data)
headers = {'content-type': 'application/json'}

r = requests.post('https://els.istresearch.com:19200/memex-domains/electronics/_search', data=data_json, auth=HTTPBasicAuth('memex', '3vYAZ8bSztbxmznvhD4C'), headers=headers)
print r.text

'''
with open("raw1.json") as json_file:
    json_data = json.load(json_file)
    #print(json_data["hits"]["hits"][0]["_source"]["raw_content"])

doc = json_data["hits"]["hits"][0]["_source"]["raw_content"].encode('utf-8')
print doc

print "############################################"
soup = BeautifulSoup(''.join(doc),"html.parser")
print soup.getText()

f = open('processed.txt','w')
#f.write(soup.getText(separator=u' ').encode('utf-8'))
f.close()


#print soup.title
#print soup.prettify()
'''