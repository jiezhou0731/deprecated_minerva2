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
import os

#112 - 199 not committed yet.
for fileNumber in range (0,0):
    print str(fileNumber)
    msg = os.system("curl 'http://localhost:8080/solr/electronic/update?commit=true&&overwrite=true' --data-binary @/var/www/minerva2/data/electronic/toSolr/"+str(fileNumber)+".json -H 'Content-type:application/json'")
    if (msg!=0) :
        os.system("~/Documents/data/infosense/./stable_solr_core_refresh.sh")
        fileNumber = fileNumber-1

msg = os.system("curl 'http://localhost:8080/solr/electronic/update?commit=true&&overwrite=true' --data-binary @/var/www/minerva2/data/electronic/cn.json -H 'Content-type:application/json'")
if (msg!=0) :
    os.system("~/Documents/data/infosense/./stable_solr_core_refresh.sh")

