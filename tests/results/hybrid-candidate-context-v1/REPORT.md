# hybrid-candidate-context-v1 — INCOMPLETE: resource guard

Specification1.0, planning checkpoint `c074bada10ff4c63f631e1afb05cb6307cdb1db9`. This package implements and starts the authorized study. It does **not** produce a research rejection or a completed model comparison: the single worker stopped at the declared resource limit during outcome-blind preparation. No market labels, fits, October forecasts or evaluation were generated. No automatic retry, shortened history, parameter change or fresh run followed.

## Declared comparison / preserved application

Candidate-level context: first qualifying opportunity per Binance USD-M BTCUSDT5m source-vector/side, using the actual0.4.22 nearest unrecovered opposite-color zone, age≤300, edge distance≤6ATR and valid geometry. Both sides are considered without score minimum, SHORT tie selection, position occupancy or cooldown. First opportunities are identified before burn-in/tail exclusions. This is not the old policy's trades or the99/964 cohort.

The six-feature M0 contains geometry, age, side and log(ATR/Close); M1 adds the four specified existing EMA/RSI/stopping-volume/M-W representations. Current source functions are extracted through a controlled adapter, with full-past-prefix recomputation from July1 and only pure volume-reference memoization. No application bootstrap, storage, timer, network or backtest capability is available to the adapter. [Complete frozen specification](../../../research/candidate-context/SPECIFICATION.md), [executable protocol](../../../research/candidate-context/protocol.json), [operations/schema](../../../research/candidate-context/README.md).

Root `hybrid-terminal.html` remains **0.4.22 RC**, byte-exact SHA-256 `e037089b4044aff4fee18b696646126c53f024c155076daae3be96240d13dc16`. No application release/version bump, signal/selection/indicator/target/execution/journal/preference change or forecast deployment.

## Data and seals actually established

| Identity | Value |
| --- | --- |
| Frozen Q3 perpetual trade payload | `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397` ·26,496 rows |
| Separate October trade payload | `aa96d6649a19effcaec2eb9a20871927a994c7b51a531b57329c6c3e8c75532c` ·8,928 rows |
| Joined original12-field rows | `982412ebcf98b08e0278c625e3a3684e9dbdefba707a94102506b681a614cd71` ·35,424 rows |
| Protocol file SHA-256 | `49751e9897537c64fc8a0177e3f36d21df707d83c2470ce486695be3e4437f22` |
| Initial executable/protocol/data seal, canonical payload hash | `c5f24bc623cd58b91d21fbebaefd5fb73185e9d5aee446e91284a31a35f811dd` |
| Saved checkpoint canonical payload hash | `82dc72faf406000908ae087dde9a87e92ddd96078d18ac8b09f946e183b69588` |

The unchanged Q3 loader/schema verified its original payload, complete grid and pinned bundle. Q3 was not reacquired. No matching October artifact existed. The separate study reader performed **10 actual public requests**, server time plus9 October-only trade pages. Exact coverage/closure, original12 fields/types, chronology and OHLC/volume identities verified, gaps/duplicates/conflicts0. It preserves immutable raw response receipts and a canonical data hash separated from acquisition timestamps. [Current official API specification reviewed](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data#kline-candlestick-data), [compact provenance/quality](input-quality.json). No Spot/Mark/index/funding/account request or fallback; no historical trading-rule claim. Old Q3 date restrictions remain intact.

[Initial seal](../../../research/candidate-context/source-seal.json) binds the code/protocol/data **before labels**. The completed unlabeled count seal, model/scaler seal and evaluation artifacts were **not reached** and are not fabricated. Source hashes still match that initial seal after the run. Acquisition/raw/per-opportunity data remain ignored.

## Measured stopping point / partial counts

Configured market limit: **900 seconds, one calculation worker,2GiB observed RSS**. The controller schedules a899-second stop with1-second kill grace. Its receipt records **897.790 wall-clock seconds** and observed peak **381,620,224 bytes (363.941MiB)**. Resource guard fired; RSS guard did not. These wall-clock/monitor observations are not a timing benchmark or a claim of exactly900 measured seconds. [Receipt](resource-receipt.json).

Saved preparation: **31,400/35,424 bars**, ending at source open `2026-10-18T00:35:00Z`. Next index **31,400**, source open **`2026-10-18T00:40:00Z`**; **4,024 bars remain**. Both market fit counters are **0**. No market outcome/forecast fields or training/model/evaluation artifacts exist.

| Retained candidate population | LONG | SHORT | Total | State |
| --- | --- | --- | --- | --- |
| July–September training |434|470|904|Unlabeled preparation complete |
| October evaluation |92|96|188|Partial preparation only; not the final test population |
| Saved total |526|566|1,092|Partial study |

There are1,235 first qualifying zone-side IDs/unique source zones encountered:1,092 retained plus140 burn-in exclusions and3 training-tail exclusions. Repeated encounters24,415 do not re-enter. Retained zone IDs are unique; all stored feature values are finite. Invalid-feature exclusions observed0. These are preparation counts, not event frequencies or power evidence. [Partial quality/calendar summary](summary.json) includes all92 training and31 October dates, explicitly distinguishing complete zero-count days, the partial October18 day, and **unprocessed days whose counts are null**, never fabricated zeros.

| Requested research quantity | Actual availability |
| --- | --- |
| M0 / M1 absolute Brier scores |Unavailable—neither model fit |
| Paired improvement / ambiguity bounds |Unavailable—no forecasts or labels |
| Target / stop / expiry frequencies; gaps / ambiguity |Unavailable—market labels not generated |
| Temporal percentiles, reliability, sections, thinned comparison |Unavailable—evaluation not reached |
| Screening verdict |Not issued; **incomplete-resource-cap**, not screen-negative |

## Validation actually performed

- Before market preparation, **10/10 synthetic focused groups passed**, including independent logistic intercept and one-variable root oracles; finite-difference objective gradient/Hessian; stable sigmoid/log loss, fixed ridge, unpenalized intercept, population SD/zero-column handling and numerical failures; actual-source prefix/memo parity and directional flags; LONG/SHORT geometry/open-first gap/stop-first ambiguity/120th-bar/expiry; immutable-stage/hash and intake pagination/access/cooldown checks.
- Final focused command **12/12 PASS**, adding actual grouped-calendar `.4/−.9` with counts1/9→−.05 and screen-positive/sensitivity-blocking fixtures. The required ambiguity golden returns **[−.32,.48]**, while either uniform convention gives+.08. Empty denominators remain undefined; type7 quantiles and fixed block RNG are checked. The exhausted-budget resume guard was strengthened in the same test group and that affected group alone passed again. Two added cases (published source/data seal and explicit October resume/corruption/cooldown) passed separately: **14 focused groups validated locally**. The resume fixture initially rejected ordinary1sec pacing in its fake wait; corrected to advance the fake clock for allowed waits, without changing collector bytes or repeating public acquisition. No market computation repeated.
- `npm run check:source` PASS. No old policy/aggression market replay, new browser suite, public app smoke, live soak or midnight observation. The existing full CI workflow remains authoritative; final exact head/run/jobs are checked after publication, saved ignored at `.qa-results/hybrid-candidate-context-v1/ci-verification.json` and reported at handoff. No extra publication merely to announce CI.
- Independent stored-output verification without engine/label/fit/forecast replay reconciles **1,235=1,092+143**, ID uniqueness, period/side counts, finite feature values, artifact hashes and absence of label/forecast fields. [Verification](aggregation-verification.json). Completed-output score aggregation code is included but **has no real completed output to verify** in this run.
- All **755 pre-existing tracked protected identities** (application, baseline, research, QA and historical result files) and **140 prior protected source/data/seal/output identities** verified unchanged. Sets overlap. No historical manifest was rewritten, no old dataset/seal resealed. Scope checksums accompany this package.

## Interpretation / exact next action

No statement about incremental forecasting value is supported by this incomplete run. Q3 was inspected and October had general chart/UI exposure; even a future completed comparison remains exploratory. Candidate-level probability must never be transferred to approved-plan probability or compared with the app's binary break-even requirement. Expiry is distinct from stop,1−p is not stop probability, funding/other execution/account effects remain unknown rather than zero. No calibration, expected R, profitability, original-Pine parity or edge claim.

**STOP.** The current v1 receipt marks its allowance exhausted; `--resume` correctly rejects it. Keep the existing ignored run/checkpoint/data. Further execution requires a separately authorized resource-contract continuation that explicitly preserves this checkpoint and seal history. Do not create another directory to reset the allowance, reacquire data, repeat completed prefixes/fits, truncate history or automatically begin a different experiment.
