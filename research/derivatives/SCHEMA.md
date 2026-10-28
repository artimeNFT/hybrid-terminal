# Binance USDⓈ-M public intake v1

Collector: `node research/derivatives.cjs acquire --out research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1`; offline check: `node research/derivatives.cjs verify --out <same-directory>`. Explicit `--resume` is supported only for a nonterminal interrupted/network checkpoint with matching configuration and producer fingerprint. Completed bundles are immutable. Do not repeat the completed full-quarter acquisition as a ritual.

This independent schema is `hybrid-binance-usdm-public/v1`, collector 1.0.0. It never extends/relabels the frozen Spot CLI 1.0.1/schema 1. No application/bootstrap, indicator, execution, fee/account or funding-PnL model is imported. Only the Spot CLI's exported exact decimal comparison/parser and UTC parser are reused; its bytes remain pinned.

## Identity and time

Only BINANCE USD-M, BTCUSDT/pair BTCUSDT, PERPETUAL, base BTC, quote/margin/settlement USDT, linear base-quantity unit 1BTC, price USDT/BTC and quantity BTC are supported. Identity requires current `/fapi/v1/exchangeInfo` to identify U_MARGINED/UTC and exactly one matching contract; it is not inferred from a suffix. Public contract-unit documentation is the separate authority for the linear/base-unit declaration. Current quantity/tick filters are observations, never historical Q3 order rules or executable sizing.

Default range is UTC `[2026-07-01,2026-10-01)`, 5m, 26496 rows per price grid. Programmatic subranges within Q3 exist for compact fixtures/probes; CLI acquisition defaults to the full quarter. Start/end must be primitive aligned integer milliseconds or explicit UTC ISO strings. Symbol/timeframe must be primitive exact strings. No extra venue/symbol/timeframe/base URL.

Trusted cutoff comes only from `/fapi/v1/time`. Exchange-info's own `serverTime` is not used as the clock. Kline requests stop before the current interval; quality always retains the whole requested denominator, disclosing eligible/unfinished rows. Funding timestamps must precede cutoff. Future portions cannot become complete by shortening the requested range.

## Separate raw series

All decimal strings and source fields retain their representation, including trailing zeros. No Number conversion, interpolation, aggregation, tick snapping or price normalization.

| Series | Endpoint | Preserved fields and units |
| --- | --- | --- |
| `trade` | `/fapi/v1/klines` | 12-field tuple: open-ms, O/H/L/C USDT/BTC strings, base volume BTC, close-ms, quote volume USDT, trade count, taker-buy base BTC, taker-buy quote USDT, ignored source string. |
| `mark` | `/fapi/v1/markPriceKlines` | 12-field tuple: same time/OHLC positions; positions 5/7/8/9/10/11 are opaque non-price placeholders. They are not volume, taker flow or trade counts, even when nonzero. |
| `funding` | `/fapi/v1/fundingRate` |Original event objects: symbol, fundingTime-ms, signed decimal-string fundingRate (fraction/event), optional associated markPrice USDT/BTC and rateType, plus every other returned JSON field. Absence remains absence; no default rate/type/Mark. |

OHLC prices must be positive and geometrically valid, timestamps safe/ms/grid-aligned, close=open+300000−1. Trade totals/taker comparisons use exact decimal arithmetic. Mark placeholders receive type checks only, not trade-volume semantics. Signed funding has its own parser; the nonnegative Spot parser is not incorrectly applied to negative rates.

Funding identity is `(symbol,fundingTime,rateType-presence,value)`. Different same-time types and an absent type are distinct. Repeated identical identities and conflicts are reported as invalid, not silently deduplicated. Rows sort by timestamp, then type-presence/value for deterministic hashing; HTTP receipts preserve the original response order. Observed spacing uses distinct timestamps, with same-time type counts reported separately. No eight-hour expectation, absent-event zero or historical calendar is inferred.

## Paging, bounds and failure

Kline pages use fixed half-open windows of at most 1000 intervals, translating end to inclusive `endTime=b−1`. Short/empty source pages advance the declared window and produce explicit gaps rather than fabricated rows or endless retries.

Funding queries use inclusive API boundaries `[a,b−1]`, limit 1000. A full response cannot prove its last timestamp exhausted all event types. The collector therefore partitions that time window and accepts only leaves with fewer than 1000 returned events. It never blindly advances `lastTime+1`. Saturation at a single millisecond stops as ambiguous; no event is silently dropped. Accepted leaf windows must partition the eligible range. Retrieval completion describes this API procedure only; historical-calendar completeness stays **unknown**, including an empty response.

- One official host, GET only, redirects rejected; no keys, signed endpoints, fallback Spot host or account connection.
- 1s pacing, 15s request/body timeout, 4MB decoded-body cap, 256 total HTTP attempts across resumes ; 3 attempts/request with bounded exponential backoff and Retry-After. Waits above 60s stop with retained cooldown.403/418/451 stop without automatic retry; other nonretryable 4xx/malformed JSON/invalid pages are terminal.
- Each invocation has a 900s wall cap; at most 3 explicit resumes. Resume rechecks source fingerprint, exact contract/range, complete checkpoint structure/quality/cursors, and original server cutoff age≤24h using a fresh time request. Original cutoff/metadata are retained, never refreshed into different data semantics. Lock files are never automatically broken.
- Checkpoint is the sole mutable working file, atomically replaced. Request URL/parameters are recorded before GET; bounded response bodies, hashes, headers and failure receipts remain ignored. SIGINT/SIGTERM retain the checkpoint. Source-validation failures cannot resume; no invalid final bundle is published.

## Immutable artifacts and hashes

`trade.json`, `mark.json`, `funding.json` have kind `hybrid-usdm-public-series`, typed payload/dataHash, independently recomputed quality and acquisition coverage/cutoff references. Canonical dataHash is SHA-256 over recursive JavaScript-lexicographic-key JSON (ASCII for declared fields): schema, full stable contract/series units/source, requested range, raw rows. It excludes capture timestamps, cutoff/metadata references, quality and request logs. Nonfinite/non-JSON values are rejected.

`metadata.json` has a separate hash of the current snapshot: observed capture time, trusted cutoff, full exchangeInfo, selected contract, verified units and documentation references. It does not assert historical filter continuity. Current metadata changes do not change an otherwise identical series dataHash.

`bundle.json` binds the three data hashes and their quality, with a separate metadataHash. `dataBundleHash` hashes only the three typed data hashes. State `verified` requires complete trade and Mark grids plus completed eligible funding retrieval for a past range; funding calendar remains unknown. Valid gaps/future exclusions yield `incomplete`. Malformed data stops before bundle publication, retaining raw failure evidence. Exclusive publication never overwrites an existing bundle/series/snapshot; interrupted publication may reuse only byte-identical artifacts.

Offline verification recomputes identities, data/metadata hashes, quality and window coverage. Hashes detect mutation relative to receipts; they are not provider signatures or proof of API history completeness. Raw data/checkpoints/responses stay ignored under research/datasets or .qa-results. Q3 remains exploratory; intake proves provenance/availability only.

## Authoritative references checked 2026-10-28

- [Binance USDⓈ-M API catalog](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data): time, exchangeInfo, trade/Mark klines and funding history. Current direct response probes corroborated the shapes before full acquisition.
- [Binance contract specifications](https://www.binance.com/en-AE/support/faq/detail/360033161972): linear stablecoin settlement and underlying-unit quantities; combined with current BTC/USDT metadata. This public reference is not an account fee quote or historical Q3 rule snapshot.
