from twikit import Client, TooManyRequests
import time
from datetime import datetime
import csv
from configparser import ConfigParser
from random import randint

MINIMUM_TWEETS = 10
QUERY = 'chatgpt'

# login credentials
config = ConfigParser()
config.read('config.ini')
username = config['X']['username']
email = config['X']['email']
pasword = config['X']['password']

print(username, pasword, email)

# authenticate to X.com
#! user login credentials
client = Client(language='en-US')
client.login(auth_info_1=username, auth_info_2=email, password=pasword)
client.save_cookies('cookies.json')