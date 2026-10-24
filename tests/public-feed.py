"""Read-only, actual Binance spot REST probes; not synthetic fixtures or profitability tests."""
import datetime,json,pathlib,urllib.request,urllib.parse
BASE='https://api.binance.com/api/v3/'
def get(endpoint,**params):
 url=BASE+endpoint+('?' + urllib.parse.urlencode(params) if params else '')
 with urllib.request.urlopen(url,timeout=15) as response:
  assert response.status==200
  return json.load(response)
DAY=86400000
now=get('time')['serverTime'];prior=now//DAY*DAY-DAY
out={'kind':'Actual Binance spot public REST, not mocked','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'serverTime':now,'checks':[],'daily':{}}
for symbol in ['BTCUSDT','ETHUSDT','SOLUSDT']:
 for tf,step in [('5m',300000),('15m',900000),('1h',3600000),('4h',14400000)]:
  data=get('klines',symbol=symbol,interval=tf,limit=3)
  assert len(data)==3
  for i,row in enumerate(data):
   t,o,h,l,c,v,end=int(row[0]),*map(float,row[1:6]),int(row[6])
   assert 0<l<=min(o,c)<=max(o,c)<=h and v>=0 and end==t+step-1
   if i: assert t-data[i-1][0]==step
  out['checks'].append({'symbol':symbol,'timeframe':tf,'count':3,'lastOpen':data[-1][0]})
 data=get('klines',symbol=symbol,interval='1d',startTime=prior,endTime=prior+DAY-1,limit=1)
 assert len(data)==1 and data[0][0]==prior and data[0][6]==prior+DAY-1
 h,l,c=map(float,[data[0][2],data[0][3],data[0][4]]);pp=(h+l+c)/3
 out['daily'][symbol]={'rows':data,'PP':pp,'R1':2*pp-l,'S1':2*pp-h,'validFrom':prior+DAY}
pathlib.Path('tests/results/public-feed.json').write_text(json.dumps(out,indent=2)+'\n')
print('PASS: actual public REST OHLCV for 3 Binance spot assets x 4 chart timeframes; complete previous UTC daily klines and PP/R1/S1 for each asset. WebSocket/long sessions not tested by this script.')
