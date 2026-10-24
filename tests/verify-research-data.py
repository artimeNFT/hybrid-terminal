"""Independent QA oracle; not a runtime dependency of the Node acquisition tool."""
import datetime
import decimal
import hashlib
import json
import sys
from pathlib import Path

decimal.getcontext().prec = 256
steps = {'5m': 300000, '15m': 900000, '1h': 3600000, '4h': 14400000}
reports = []
for filename in sys.argv[1:]:
    d = json.loads(Path(filename).read_text())
    p = d['payload']
    source = {'venue': 'BINANCE', 'market': 'SPOT', 'endpoint': '/api/v3/klines',
              'timeZone': 'UTC', 'timestampUnit': 'ms', 'normalization': 'decimal-text-v1'}
    assert p['source'] == source and p['schemaVersion'] == 1
    start, end = p['range']['startInclusive'], p['range']['endExclusive']
    canonical = {'schemaVersion': 1, 'source': source, 'symbol': p['symbol'],
                 'timeframe': p['timeframe'],
                 'range': {'startInclusive': start, 'endExclusive': end}, 'candles': p['candles']}
    digest = hashlib.sha256(json.dumps(canonical, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
    assert digest == d['dataHash'], 'Independent hash mismatch'
    step, times = steps[p['timeframe']], []
    for row in p['candles']:
        assert len(row) == 12
        assert all(type(row[i]) is int and row[i] >= 0 for i in [0, 6, 8])
        assert start <= row[0] < end and row[0] % step == 0
        assert row[6] == row[0] + step - 1 and row[6] < d['acquisition']['cutoffServerTime']
        assert all(isinstance(row[i], str) for i in [1, 2, 3, 4, 5, 7, 9, 10, 11])
        o, h, lo, c = (decimal.Decimal(row[i]) for i in [1, 2, 3, 4])
        assert 0 < lo <= min(o, c) <= max(o, c) <= h
        assert all(decimal.Decimal(row[i]) >= 0 for i in [5, 7, 9, 10, 11])
        assert decimal.Decimal(row[9]) <= decimal.Decimal(row[5])
        assert decimal.Decimal(row[10]) <= decimal.Decimal(row[7])
        times.append(row[0])
    assert times == list(range(start, end, step)), 'Actual grid is incomplete/duplicated/unordered'
    assert d['quality']['state'] == 'complete' and d['quality']['rowCount'] == len(times)
    assert d['quality']['missingRows'] == d['quality']['duplicateRows'] == 0
    reports.append({'file': filename, 'state': 'complete', 'rows': len(times), 'dataHash': digest,
                    'coverage': [datetime.datetime.fromtimestamp(t / 1000, datetime.timezone.utc).isoformat()
                                 for t in [start, end]], 'independentOracle': 'Python stdlib JSON/SHA256/Decimal/grid'})
print(json.dumps({'passed': True, 'datasets': reports}, indent=2))
