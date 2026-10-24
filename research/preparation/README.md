# Outcome-blind preparation 1.0.0

One exploratory BTCUSDT 5m Q3 preparation protocol, one greedy matching design and feasibility diagnostics. This is a **different estimand from the live nearest-vector policy**: all eligible vector and ordinary zones can produce episodes. No score, selected-side, M/W, stopping-volume or legacy tie-policy filter is applied. Q3 has already been inspected for engineering purposes and is not an untouched confirmatory holdout.

`protocol.json` is the operational declaration. Its final protocol/source seal must exist before cohort summaries are generated. This is not an outcome/inference protocol. No next-open execution, fills/gaps, barrier resolution, ambiguity rates, MFE/MAE, returns/equity, confidence intervals, resampling or significance/edge labels are computed.

## Reproduce

Use Node 24, the unchanged local frozen dataset and a **fresh** ignored output directory:

```sh
node research/prepare.cjs seal --out .qa-results/preparation-v1/q3-new
node research/prepare.cjs benchmark --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/preparation-v1/q3-new
node research/prepare.cjs run --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/preparation-v1/q3-new
node research/prepare.cjs verify --out .qa-results/preparation-v1/q3-new
node tests/verify-preparation.cjs research/datasets/btcusdt-5m-2026-q3.json .qa-results/preparation-v1/q3-new
npm run test:preparation
```

The CLI verifies existing data with CLI 1.0.1 before analysis; exact canonical hash/range/symbol/timeframe/complete coverage must match the accepted calculation contract. It does not acquire or rewrite data. Required CI uses only compact generated fixtures; acquired Q3 is optional/local. Each run refuses existing seal/benchmark/runtime records rather than overwriting a previous run. An interrupted calculation restarts in a fresh directory from the original prefix, with the same declaration/source identities; no parser/indicator checkpoint is serialized.

`features.json` and `pairs.json` are canonical compact UTF-8 JSON with recursively ASCII-sorted keys and coordinate-sorted arrays. `result.json` records both SHA-256 hashes. Volatile runtime/progress/benchmark metadata is separate. A run is usable only when **both result and runtime say complete** and reopened canonical hashes verify. Failed resource/publication runs are explicitly non-complete; never use partial files as a cohort. Bulky full features/unmatched details remain under ignored `.qa-results/`. Compact report/evidence is tracked under `tests/results/preparation-v1/`, including the complete 99-pair/day-span and 198 matched-covariate projection for later independent review. The read-only verifier checks every episode against its own past raw bars and every pair against the fixed constraints, then repeats the identical matching design to verify its hash; it does not run alternative designs or duplicate indicator formulas.

## Actual calculations and resources

`calculations.cjs` separately extracts hash-pinned, **unmodified function bodies** for `ema`, `mwEvents`, `numericBar`, `volumeReference`, `analyze`, and `sigAt`. It never executes the HTML/bootstrap, `calc`, backtest, browser storage or feed. The original audit adapter, calculation contract and historical evidence are untouched. Guarded VM capabilities throw on network/storage/bootstrap/timer access. Input loading/CLI validation reads the full frozen file for integrity; calculation features receive only the confirmed prefix through their decision.

Every decision reruns `analyze` on **the full July 1 past prefix**, including all recursive indicator seeds, classifications, VWAP and complete M/W parser history. Native lexical Math/Number bindings avoid VM proxy lookups. A private in-memory memo stores only the actual pure `volumeReference` results on the immutable fixed-origin numeric input. That function depends solely on the source candle and its preceding ten numeric candles, not future/recursive/parser/classification state. The memo is never serialized, never moved to another origin, and never exposed for mutation. All classification expressions and recursive/M/W calculations still run from the full prefix. Exact memo/no-memo frame and reviewed-adapter decision/metric/reference parity is checked before admission; fixtures include backward replay and modified future bars.

Two bounded Node worker threads alternate decision indices. Each reconstructs every prefix independently; no calculation state is transferred between threads. Each collects local first eligibility; the coordinator sorts and deduplicates to the **global first** before any chronology/tail exclusion. Fixtures compare sequential and sharded replay exactly. Worker heap is bounded at 512 MiB, per-VM-call timeout 30 seconds, wall limit one hour. Four reference prefixes, twice each, are benchmarked before the full run with a twofold admission margin. Refusal/failure is explicit; no rolling origin, truncation, partial completion or matching relaxation is substituted. RSS observations are process-wide across threads and must not be added together; worker heap observations are per thread.

## Episodes and decision-time features

- V is actual mutually exclusive `cls===2`. C is `cls===0` with ready source volume reference. Exclude class 1, unavailable references and zero range. Preserve `close>=open` direction including doji; census and episode rows report doji explicitly.
- At a valid, contract-permitted decision, SHORT requires an up-zone high strictly below the close; LONG requires a down-zone low strictly above it. Both arms require age 1–300 inclusive, near-edge distance at most 6 actual ATR14 and an unrecovered midpoint through that decision. Later lows/highs are never read.
- Up recovery is low <= midpoint; down recovery high >= midpoint. Equality recovers in both arms. Earlier edge touches are allowed and recorded, including the first touch timestamp known by t. The source candle does not count as a subsequent touch.
- Consider all eligible zones; rank within arm/side by nearest edge, creation timestamp and stable ID. An ID is symbol/timeframe/zone-open milliseconds/side, never a mutable slice index. One episode per zone at first eligible **valid** decision in the permitted range, before block/tail exclusions; excluded episodes never reappear later.
- Use t−19 through t for planned stops: LONG min(low−0.3 ATR, close−ATR); SHORT max(high+0.3 ATR, close+ATR). TP1 is near edge, TP2 midpoint. Record price/ATR geometry, RR, age, source OHLCV/class/reference and prior-touch state. These are decision-close plans; no next-open or actual-entry label.
- ATR percentile is empirical midrank among the preceding 288 actual ATR values excluding t. Calendar fields use **decision-close UTC**, including midnight/weekend/bucket changes.
- Contract preparation starts at decision index 3999, retains every preparation bar/event, actual validity/undefined states and full UTC-open coverage. Blocks are [3999,11498), [11498,18997), [18997,26496). Include only t+120 < blockEnd, based exclusively on coordinates.

Source census exclusions use **creation** blocks (including pre-permitted), while episode exclusions use first-eligible **decision** blocks. They have different denominators and are labeled separately. In the raw source table, C denotes potential class-0 sources **before** ready-reference/range exclusions; its unavailable-reference and zero-range columns are explicit and can overlap. Eligible C episode counts always require a ready reference and positive range. Sources without an episode may have aged out before the permitted range, recovered, remained inside/too far away, or never reached a valid eligible decision; this census is not a count of failed trades. Invalid decisions and their exclusion reasons are reported separately, not relabeled WAIT.

## One fixed matching design and diagnostics

V order: decision time, creation time, ID. Match 1:1 without replacement to C in the same side/block/prior-touch/weekend/six-hour bucket, 121–2016 bars apart inclusive. Absolute calipers are 0.25 for midpoint/ATR, stop-distance/ATR and width/ATR; ln(2) for ln(age); 0.10 for ATR percentile. Minimize the sum of squared caliper-normalized differences. Exact ties use absolute separation, C decision time, creation time, ID. No epsilon, alternative design search or automatic relaxation. Unmatched reasons separate exact stratum, time support, multivariate caliper support, missing inputs and control exhaustion.

Report counts, exclusions, match rate, unmatched composition/support and balance globally, by side, block and side-by-block. SMD is (V mean−C mean) divided by the **pre-match** pooled SD sqrt((sampleVarianceV+sampleVarianceC)/2), reused unchanged for post-match in each population. Sample variances use n−1. Distributions include finite/missing n, min/max/mean/sample SD and type-7 quartiles. Fewer than two pre observations in either arm gives null SMD; missing matched arms are explicit; zero denominator yields labeled equal/different states (different means flagged, no Infinity serialized). Flag |SMD|>=0.1; constants/missing values are not silently treated as a measured zero SMD. RR/age/edge distance and categorical indicators are diagnosed beyond the five calipers. A low match rate or remaining flag is a valid feasibility finding, not permission to retune.

Within-arm overlap is permitted. Coordinate windows [t+1,t+120] overlap when separation <120 bars; report overlap pairs, episodes involved and maximum concurrency before/after matching. Report decision-day concentration, HHI/weekend/buckets, cross-day pair counts and all pair reserved UTC day spans. Within-pair separation does not establish independence; reused underlying candles, overlapping same-arm windows and calendar concentration remain for a separate dependence plan. SMD does not prove exchangeability. No inference or trading advantage follows from feasibility.

**Next:** independent preparation/matching/dependence review; only then freeze a separate outcome/execution/cost/ambiguity/censoring/chronological-evaluation/inference protocol before any outcome resolution.
