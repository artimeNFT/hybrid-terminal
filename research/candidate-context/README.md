# hybrid-candidate-context-v1

One offline exploratory candidate-context screen, specification1.0. See [SPECIFICATION.md](SPECIFICATION.md), executable [protocol.json](protocol.json), and the [source-bound delivery](../../tests/results/hybrid-candidate-context-v1/REPORT.md). Application0.4.22, old studies and their seals are unchanged.

## Data / separate October schema

Reuse `research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/trade.json` through the unchanged typed Q3 validator. October is a separate `hybrid-candidate-october-trade/v1` payload, never accepted as frozen Q3. Contract: Binance USD-M BTCUSDT linear USDT perpetual, trade OHLCV,5m, UTC `[2026-10-01,2026-11-01)`. Metadata/observation/request information is outside the canonical payload/data hash.

`payload` contains exact contract/source/series/symbol/timeframe/range and ordered raw `rows`. Preserve all12 returned fields/types: open time, open/high/low/close strings, base volume string (BTC), inclusive close time, quote volume string (USDT), integer trade count, taker-buy base/quote strings, final ignored-field string. These are trade data, not Mark/index or measured bid/ask depth. Verify exact8,928 closed timestamps and full tuple geometry/types; no imputation/deduplication/conflict repair. Joined35,424 rows retain the July1 origin. Decimal/hash validation precedes Number calculation conversion.

[Official endpoint specification reviewed](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data#kline-candlestick-data). Collector uses only `/fapi/v1/time` and `/fapi/v1/klines` on `https://fapi.binance.com`, explicit BTCUSDT/5m/startTime/endTime/limit1000. Request parameters are checkpointed before GET, responses preserved with hashes. Maximum32 total attempts across resumes,3 per exact request,15sec/request,4MB response and1sec pacing;429/5xx/network retries bounded. Retry-After over60sec stops with not-before;403/418/451 stop without fallback. No funding, metadata/account/API-key request or historical-rule claim.

Acquisition has already been performed for this package. Do not run it again to obtain another specimen. Existing immutable artifact:
`research/datasets/hybrid-candidate-context-v1-october/trade.json` (ignored).

## Stages / recovery

The authorized existing invocation is:

```
node research/candidate-context/run.cjs .qa-results/hybrid-candidate-context-v1/market-run research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/trade.json research/datasets/hybrid-candidate-context-v1-october/trade.json
```

Inspect `resource-receipt.json` and hash-checked `checkpoint.json` first. The existing run must never be replaced by a fresh run directory to reset its budget. One calculation worker; a read-only controller monitors elapsed time/RSS and enforces the cumulative900sec/2GiB cap. Fixed-origin full-past-prefix recomputation uses actual application functions; only pure volumeReference memoization is reused. No bootstrap, browser storage or backtest is executed by that adapter.

Source/data seal precedes market labels. Complete unlabeled features/counts and the pre-label seal must precede training labels. Both model/scaler artifacts and fit seal precede October forecasts/outcomes. Fits have durable intent counters; uncertain interrupted fits/evaluation are blocked instead of silently repeated. Zero usable period/missing class/nonconvergence/source/resource failures are explicit, never model fallbacks.

Only an explicitly observed interruption with remaining allowance may use the same invocation plus `--resume`; all source/data/artifact hashes must match. An exhausted resource allowance cannot resume under this contract. Follow CURRENT STATUS for the actual result/resume state.

Independent stored aggregation, without replaying calculations, labels, predictions or fits:

```
node research/candidate-context/verify.cjs .qa-results/hybrid-candidate-context-v1/market-run
```

Synthetic tests: `node --test tests/candidate-context.cjs`; integrated in `npm run test:preparation`. No acquired data is required in CI and no browser suite was added.

## Interpretation

Candidate-level level-reaching forecasts only, not the existing policy's trades, approved-plan probabilities, original-Pine equivalence or profitability. Outcome labels preserve target/stop/expiry, opening-barrier resolutions and intrabar ambiguity. Expiry is not a full-risk loss;1−p is not stop probability. No expected-R conversion or comparison with the binary break-even card. Funding/other account/execution effects remain unknown, not zero. Exploratory conditional bootstrap percentiles do not establish nominal95% coverage or significance. No retuning, deployment or automatic next experiment.
