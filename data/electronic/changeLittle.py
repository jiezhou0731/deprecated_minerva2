#!/usr/bin/python

from bs4 import BeautifulSoup
import re
import json
import requests
from requests.auth import HTTPBasicAuth
from urlparse import urlparse
from urlparse import urljoin
import urllib
import os.path
import socket


socket.setdefaulttimeout(30)
error_doc_number = 0
doc_total_number = 0

for fileNumber in range (500,1727):
    with open("toSolr/"+str(fileNumber)+".json") as json_file:
        f = open('change/'+str(fileNumber)+'.json','w')
        f.write("[")
        json_data = json.load(json_file)

        docCount=0

        # For each document in the json file
        for doc in json_data:
            try:
                print str(doc_total_number) +",  error: " + str(error_doc_number) 
                
                doc_total_number = doc_total_number + 1
                soup = BeautifulSoup(''.join(doc["html"]),"html.parser")

                cssLinks = soup.findAll('link')
                # For each image in the document
                for css in cssLinks:
                    css['href'] = css['href'][5:]
                    print css

                images = soup.findAll('img')
                # For each image in the document
                for img in images:
                    img['src'] = img['src'][5:]
                    print img['src'][5:]
                    break
                break
                docCount = docCount + 1
                if docCount!=1: f.write(",")
                f.write(json.dumps(doc).encode('utf-8'))
            except:
                error_doc_number = error_doc_number+1
        break
        f.write("]")
        f.close()


'''
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