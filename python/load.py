import json
import requests
from urllib.parse import urlparse

def parse(uri):
    return 'http://' + urlparse(uri).netloc

# print(parse('derpy://127.0.0.1:8000'))

def post(url, data):
    r = requests.post(url, json=data)
    res = r.json()
    if not res['ok']:
        raise Exception(res['error'])
    return res['value']


class Module:
    def __init__(self, base):
        self.__dict__['base'] = base
    def __call__(self, *args):
        return post(self.base + '/call', args)
    def __setattr__(self, key, value):
        post(self.base + '/setProp', [ key, value ])
    def __getattr__(self, key):
        if key == 'base':
            return self.__dict__['base']
        return post(self.base + '/getProp', key)


x = Module(parse('derpy://127.0.0.1:8000'))

x.fooz = 'bar'
