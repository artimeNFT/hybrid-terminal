# Contract-matched public intake v1 — BTCUSDT USDⓈ-M perpetual

**Verified public-data bundle**, captured 2026-10-28, engineering/exploratory Q3 only. No account connection, fee tier, leverage/margin selection, app/feed change, indicators, strategy/outcomes, funding-PnL model or liquidation estimate. Binance is this engineering reference, not the user's final venue choice.

## Reference verified before acquisition

Planning checkpoint `2339e8e9a13189483f49c2786bfc16334c131162`. Official [API catalog](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data) and [contract-unit specification](https://www.binance.com/en-AE/support/faq/detail/360033161972) were checked; five paced direct probes all returned 200 before implementation/full capture. Current API metadata identifies U_MARGINED, unique BTCUSDT/pair BTCUSDT, PERPETUAL, base BTC, quote/margin USDT and COIN underlying. The separate public specification establishes linear stablecoin settlement and one underlying-unit contracts. Thus this reference uses quantity BTC, price USDT/BTC, unit 1BTC and USDT settlement; it is not inferred from the ticker suffix. Current lot/price filters do not define historical Q3 rules.

Trade and Mark tuples and funding objects were corroborated by actual responses, including funding `rateType`. No substituted venue/Spot endpoint or signed request. [Schema](../../../research/derivatives/SCHEMA.md), [compact provenance](provenance.json), [quality](quality.json).

## Captured data and identities

UTC range `[2026-07-01,2026-10-01)`, 5m price grids. All 26496 expected **closed** rows are present in each price series, with zero gaps, duplicates, conflicts, malformed rows or developing/future exclusions. Separate payloads preserve raw decimal strings/all 12 tuple fields. Trade retains base/quote volume, trade count and taker fields. Mark non-price fields remain raw **placeholders**, including its nonzero integer; none is interpreted as traded volume/taker flow/trade count.

| Series | Rows/events | Verified state | Canonical data SHA-256 |
| --- | --- | --- | --- |
| funding | 276 | retrieved | `952c9c0ae0c4aa7d50a00f57017d540c9e481e43a255872152fe23d4efec3f63` |
| mark | 26496 | complete | `f7ca6bf6677809e0644358a1f22c9a5a5574c69851c5d122203b7033d3c52925` |
| trade | 26496 | complete | `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397` |

Composite dataBundleHash: `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`. It hashes only the three typed data hashes. Each data hash includes stable contract/series identity, units, endpoint, requested range and raw rows; it excludes request/capture times and metadata/quality. This is a new derivatives schema, not Spot schema 1.

Current metadataHash: `2e31f9c890cb2ddbe1ae94c154f16d7f3e37ae28e766aea8aca99d50001f0746`. Snapshot capturedAt `2026-10-28T21:30:54.818Z`, trusted time cutoff `2026-10-28T21:30:51.845Z`. It retains the whole returned exchangeInfo plus selected contract/units/docs and separate current-observation identity. Exchange-info serverTime is not used as the trusted clock. Snapshot/filter observations are **not historical Q3 trading rules**, nor a claim about when each rule became effective. No historical sizing or fee validation follows.

Funding: **276 events**, 276 unique timestamps, all returned type Regular; missing type 0 / associated Mark 0. Signed decimal rates, event-associated Mark, millisecond timestamps and every returned field are retained. First `2026-07-01T00:00:00.000Z`, last `2026-09-30T16:00:00.002Z`. Observed unique-time spacing is 28799974–28800013ms, including source millisecond offsets; no eight-hour snapping/assumption. Distinct same-time types (including absent metadata) remain distinct identities.

**Funding retrieval completed; historical-calendar completeness remains UNKNOWN**, expectedEvents=null. A page shorter than the documented limit completes that queried API range; it cannot prove every historical funding event was published or infer missing events as zero. Same-time saturation is handled by time-window subdivision, stopping at an ambiguous full single-millisecond response rather than skipping event types. No funding calendar or PnL is manufactured.

## Bounds, failure and reproducibility

The full acquisition used **57 unsigned public GETs**: time 1 / exchangeInfo 1 / trade 27 / Mark 27 / funding 1; every response 200, no retry/resume. Including five preflight and three tiny repeated probes: 65 API requests total. No repeated full-Q3 acquisition. All three tiny historical responses were byte-identical to preflight; this checks only that short range, not universal source stability.

Collector bounds: 1s pacing, 15s timeout/body deadline, 4MB decoded response cap, 3 attempts/request, 256 cumulative attempts across explicit resumes, max 60s cooldown wait, 900s invocation wall cap and at most 3 resumes. Original server cutoff is immutable, resume age≤24h. 403/418/451 stop without automatic retry; malformed data/checkpoints/contract mismatches stop, retaining response/failure evidence. No fallback host. Request parameters are recorded before GET. Guarded current-candle exclusion preserves the entire requested denominator. Frozen outputs are exclusive; only the explicit checkpoint is mutable.

Data identity does not depend on current metadata/capture timestamps. Mocked repeated collections produced identical dataBundleHash with different metadataHash. Unknown funding fields change the data hash. Raw response bodies have separate hashes/URL/parameters/status/header receipts. Hashes establish reproducibility/integrity relative to these observations, not provider signatures or historical-calendar proof.

## Checks actually performed

- 14 focused mocked cases passed: primitive identity/unit gates before FS/network, raw trade/Mark semantics, gap/duplicate/conflict accounting, signed funding/missing metadata/same-time types, 1001-row pagination, full funding page subdivision, future exclusions, interrupted resume, recomputed-checksum wrong-contract/stale rejection, 429/backoff/5xx/access stops, bad JSON/source retention and data/metadata hash separation.
- Initial fixtures caught a resume URL comparison error caused by canonical checkpoint key ordering. Endpoint/query comparison was corrected to compare identical parameters independently of order; successful final fixtures and the real capture use that corrected producer. No source change after capture.
- `npm test` passed on collector code with the initial 13 intake cases and existing groups. After adding the preservation case and final npm registration, `npm run test:research` passed the unchanged 18 Spot cases plus all 14 intake cases, keeping the pilot-sealed QA runner byte-identical. Unchanged groups were not repeated locally. Read-only historical pilot seal identity verification passed. Required exact-published full CI uses mocked data only; its actual receipt is ignored `.qa-results/derivatives-intake-20261028/ci-verification.json`. No acquired dataset/public provider access is required by CI.
- `node research/derivatives.cjs verify --out research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1` independently recomputed typed identities, hashes, coverage and quality offline. Python checked **133106** hashes/grid/decimal/taker/event/response identities and preservation invariants. Producer fingerprint still exactly `a325d9a40578695a4ce272c3655345fb430448b7b0d3333c860463167919831b`.

## Storage, preservation and limitations

Ignored raw directory: `research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/`: immutable `trade.json`, `mark.json`, `funding.json`, `metadata.json`, `bundle.json`; mutable checkpoint plus response/failure receipts. Ignored QA `.qa-results/derivatives-intake-20261028/` retains probe bodies/receipts, mocked logs, public acquisition/verification logs, independent checks and exact CI receipt. [delivery.json](delivery.json) binds compact artifacts/source hashes; source/runtime data stay separate.

The original Spot CLI 1.0.1 bytes, Spot schema 1, Q3 Spot dataset, source bindings and research seals are unchanged. Existing pilot raw hash and seal remain exact. App 0.4.17 RC stays SHA-256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`; no UI/feed/journal/preferences/strategy/indicator/backtest changes, dependency or account access.

This intake establishes data provenance/availability, not historical trading-rule completeness, fees, bid/ask/intrabar fills, leverage/liquidation or derivatives profitability. Q3 was previously inspected and remains exploratory. Any future evaluation needs a separate contract for execution/cost/trigger/funding timing and missing market/account evidence. **Stop after this intake report; no evaluation or further feature starts automatically.**
