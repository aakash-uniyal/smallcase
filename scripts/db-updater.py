import redis
import requests
import json

rh = redis.Redis(
    host='localhost',
    port=6379,
    password=''
)

for ticker in [ k.split(':')[1] for k in rh.keys('stock:*')]:
    payload = {
        'function': 'TIME_SERIES_INTRADAY',
        'symbol': ticker,
        'apikey': '1ZEFBXPKUMKDQ0W1',
        'interval': '1min'
    }
    r = requests.get('https://www.alphavantage.co/query', params=payload)
    d = json.loads(r.text)
    price = d["Time Series (1min)"][d["Meta Data"]["3. Last Refreshed"]]["4. close"]
    rh.set("stock:" + ticker, price)