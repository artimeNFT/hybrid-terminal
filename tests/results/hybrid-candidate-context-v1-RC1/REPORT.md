# hybrid-candidate-context-v1 / RC1 — completed, screen-negative

Resource-only continuation authorized at `e63dd6a3457a64b4fcda6518c34f40538ef50d58`, from parent delivery `ffb2a38fbc21da9d1d95a70ee2dbe50c702d3326`. The [original incomplete report](../hybrid-candidate-context-v1/REPORT.md) remains unchanged. RC1 continued the same worker/run/checkpoint and completed the original specification; it did not start a replacement study or revise statistical/scientific parameters.

**Result: screen-negative — below the declared observed-effect threshold.** Augmentation slightly worsened the observed October Brier score; no claim of statistically significant deterioration or universal absence of information. End this version. No retuning, sign rescue, additional feature/model search, forward-confirmation trigger or forecast deployment follows.

## Population and complete counts

First qualifying nearest unrecovered opposite-color vector opportunity per Binance USD-M BTCUSDT5m source zone/side, both directions, before burn-in/tail exclusions. The frozen local age≤300/edge distance≤6ATR/validity/geometry rules apply. No minimum score, SHORT tie selection, position occupancy or cooldown. This is candidate-level context, not the existing policy's trades or approved-plan probabilities.

| Period | LONG | SHORT | Retained / distinct zones |
| --- | --- | --- | --- |
| July–September training |434|470|904|
| October evaluation |171|170|341|
| Total |605|640|1,245|

All35,424 source bars prepared. First qualifying IDs/unique source zones1,390 =1,245 retained +140 burn-in exclusions +5 period-tail exclusions (3 training,2 October). Repeated encounters27,373 do not re-enter. No observed invalid-feature exclusions. All92 training and31 October calendar dates retained in quality evidence; all31 October days have opportunities. Training labels:454 target,443 stop,7 expiry (Y=1:454; Y=0:450). October:158 target,183 stop,0 expiry; observed target fraction158/341≈46.3343%. Opening-barrier resolutions0, same-bar ambiguity0 in October. Zero observed expiry does not change the event definition or authorize treating1−p as a general stop probability.

M0 has the unchanged6 geometry/relative-volatility features; M1 adds the specified4 EMA/RSI/stopping-volume/M-W encodings. Both use identical904 training records and shared training-only scaling for common columns. Each fit occurred once, from zero coefficients, under the original mean-log-loss ridge objective. Both converged in4 Newton iterations; final gradient infinity norms M0≈7.56e−14/M1≈1.60e−13, below1e−8. No zero-SD columns, fallback solver, class reweighting, tuning or October recalibration. [Training summary](training-summary.json), [model/scaler seal](../../../research/candidate-context-RC1/fit-seal.json).

## Primary result and fixed sensitivities

| Comparison | N | M0 Brier | M1 Brier | Improvement M0−M1 |
| --- | --- | --- | --- | --- |
| All October opportunities |341|0.231297369387|0.231544076900|**−0.000246707514**|
| October1–10 |109|0.237771645379|0.237897981428|−0.000126336049|
| October11–20 |112|0.220495640672|0.223582765199|−0.003087124527|
| October21–31 |120|0.235498182161|0.233203171209|+0.002295010952|
| Predeclared thinned subset |61|0.267741270444|0.266340258582|+0.001401011862|

The declared primary threshold is **δ=+0.005 absolute Brier units**. Whole-population Δ<δ produces screen-negative. The positive thinned/last-section descriptions do not rescue it; only1 of3 section gains is positive. No subset was chosen after outcomes. Thinning retains earliest opportunities separated by≥120*5min across both sides, with frozen ties.

Conservative labelwise ambiguity outer bounds: **[−0.000246707514, −0.000246707514]**, equal to the known-label result because no October event is ambiguous. Uniform target-first sensitivity is the same result. Small last-digit differences between aggregate formulas reflect floating arithmetic, not a different evaluation. The synthetic ambiguity golden still verifies[-.32,.48] versus either uniform+.08; bounds do not assert jointly realizable overlapping intrabar paths.

| Calendar moving-block description | Draws / defined | Type7 2.5–97.5 percentile range for Δ | Undefined |
| --- | --- | --- | --- |
|3-day, seed20261103 reset |10,000 /10,000|[−0.002962180981, +0.001912540378]|0|
|7-day, seed20261103 reset |10,000 /10,000|[−0.003563258357, +0.001376808604]|0|

Paired daily loss **sums/counts**, all31 calendar days, noncircular blocks and truncated final blocks were retained. These are exploratory conditional sensitivity summaries, **not nominal95% coverage, significance tests, parameter-uncertainty estimates or new independent regimes**. About10.33/4.43 calendar-block equivalents at3/7days and overlapping episodes limit information. Both ranges include zero. No inference that a true effect is absent is claimed.

Fixed reliability bins show count / mean forecast / observed frequency:

| Bin | M0 | M1 |
| --- | --- | --- |
|[0,.2) |2 /0.166785 /0 |2 /0.169161 /0 |
|[.2,.4) |91 /0.320087 /0.307692 |100 /0.325190 /0.320000 |
|[.4,.6) |156 /0.490015 /0.448718 |144 /0.493947 /0.437500 |
|[.6,.8) |83 /0.690947 /0.614458 |82 /0.687020 /0.634146 |
|[.8,1] |9 /0.851419 /1.000000 |13 /0.842925 /0.846154 |

These small/single-month bins do not establish calibrated product-ready probabilities. [Exact stored evaluation](evaluation.json) retains unrounded figures, all31 daily sums/counts, sections, thinning and bins.

## RC1 authority, accounting and preservation

Actual stopped-state checks matched stage features/index31,400,1,092 rows,904 training rows, no inFlight work, fits0/0 and no later-stage artifacts. Source/data/artifact hashes and original receipt matched; no study Node process was active. Starting checkpoint, original receipt and source seal were preserved as byte-exact immutable ignored snapshots. No reset or repair of history.

The [external grant](../../../research/candidate-context-RC1/grant.json), canonical hash `1155971c1bf9838889f4ef9ec8f82b93fc80e372386663a26d85befcd4060149`, binds parent source/protocol/data identities, start snapshot and controller SHA `e2f375164973b2638a70373ad2cfbe832575dba208414e8726d035e1b0050baf`. Controller is outside `research/candidate-context/`; **all13 original files in that folder remain byte-exact**. Its fingerprint,900sec protocol and exhausted flags were never monkeypatched. The original `run.cjs --resume` still rejects and its receipt remains historical incomplete.

| Resource/accounting item | Actual |
| --- | --- |
| Original authorized/charged allowance |900,000ms, remains exhausted |
| Original observed wall elapsed |897,790ms, preserved separately |
| One RC1 additional grant |600,000ms maximum |
| RC1 observed monotonic elapsed |277,616.812807ms |
| RC1 observed wall elapsed |275,005ms; distinct clock observation |
| RC1 charged consumption |277,617ms (ceiling of monotonic observation) |
| Total charged allowance |1,177,617ms of at most1,500,000ms |
| RC1 observed worker peak RSS |401,551,360 bytes /382.949MiB, below2GiB |
| Segments / calculation workers |1 /1 |

Wall and monotonic observations are recorded separately; no cause of their difference or exact comparable total wall duration is inferred. No budget/RSS/interruption error occurred during RC1. Unused allowance does not authorize another evaluation: ledger state complete and worker state complete reject relaunch.

An exclusive lock, active Node check, immutable segment intent/observation/receipt chain and reconciled cumulative ledger prevent duplicate launches/reset allowance. Only a safe observed interruption can resume with remaining grant; uncertain inFlight work blocks restart. [Ledger](resource-ledger.json), [segment receipt](resource-receipt.json), [snapshot/prefix preservation](preservation.json).

The unchanged worker started at31400, preserving all1,092 saved rows/IDs and904 training rows exactly, then appended153 October candidates. It wrote the complete unlabeled/pre-label seal before training labels and both model/scaler seals before October forecasts/outcomes/metrics. Actual fit counts1/1; no repeated outcomes/fits or new market directory. No acquisition, optimization, historical replay, application/storage change or extra extension.

## Identity chain

| Identity | Canonical hash / SHA-256 |
| --- | --- |
| Parent source/protocol/data seal |`c5f24bc623cd58b91d21fbebaefd5fb73185e9d5aee446e91284a31a35f811dd`|
| Original protocol file |`49751e9897537c64fc8a0177e3f36d21df707d83c2470ce486695be3e4437f22`|
| Starting checkpoint payload |`82dc72faf406000908ae087dde9a87e92ddd96078d18ac8b09f946e183b69588`|
| Final checkpoint payload |`82eb80a4cb5dbb7444ea86de806af3ce2b1962dbe93742bb4b0ae2a16802aa6d`|
| Complete pre-label seal |`eea813060765363d827fd1fd14bf3020aeb91562d9d3a506eee9ce56af8cc737`|
| Model/scaler seal |`1d2f127858321654f6ed89a273ff0547c5d26c71250574abc02bb1ef0ec91364`|
| Q3 trade data |`84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`|
| October trade data |`aa96d6649a19effcaec2eb9a20871927a994c7b51a531b57329c6c3e8c75532c`|
| Joined raw12-field rows |`982412ebcf98b08e0278c625e3a3684e9dbdefba707a94102506b681a614cd71`|

[Delivery identities](delivery.json), [complete unlabeled quality/calendar](quality.json). Application remains0.4.22 RC, SHA `e037089b4044aff4fee18b696646126c53f024c155076daae3be96240d13dc16`.

## Actually performed validation / limits

Before launching,10/10 synthetic controller groups PASS: absent/invalid grant, wrong identities/stopped state, immutable prefixes, original exhaustion rejection, real file lock/duplicate launch, cumulative accounting and resets, real child time/RSS controls, safe interruption and active process detection. Final controller/verifier command12/12 PASS; an added published-grant binding case passed separately (13 groups locally validated). Independent ambiguity/weighting/temporal goldens pass. `npm run check:source` PASS. No new browser suite/dependency.

Original and [independent stored-output verification](independent-verification.json) PASS without importing/replaying the calculation adapter, label generator, prediction or fitting routines. Independent algebra reconciles whole/section/thinned scores, outcomes, gaps, ambiguity bounds, bins, all daily sums/counts, both10,000-draw deterministic percentile summaries and the screen rule. Model/pre-label hash chains and one-fit counters verify. All775 prior tracked protected files and140 prior protected identities match; sets overlap. Raw acquisition/row/prediction/checkpoint/log evidence remains ignored in the **same** run directory. Parent report/seals/findings are unchanged.

One linked continuation publication with CURRENT STATUS and exact published full CI, verified after push and retained ignored under `market-run/RC1/ci-verification.json`, reported at handoff. No separate publication merely to announce CI. Existing required browser regressions are CI checks, not new public/live acceptance.

Q3 was inspected; October had chart/UI exposure. This is exploratory temporal evaluation, not untouched confirmation. Four local encodings are not original-Pine parity or independent information sources. Level-reaching is not next-open trading; no price/fill, expected-R conversion, comparison with the binary break-even card or profitability estimate. Funding and other execution/account effects remain unknown/unapplied, not zero. **End this version and stop.** No automatic retuning, new experiment, forward validation or forecast deployment.
