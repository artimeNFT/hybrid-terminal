# Derivatives policy pilot v1 — descriptive report

Client date: 2026-10-29, Asia/Jerusalem. Actual seal/run UTC receipts are recorded below.

**gross / after modeled fees, before funding and other unmodeled execution/account effects**

**Funding was NOT applied**: `not-applied: calendar completeness and account settlement timing unverified`; its value and fully adjusted return are unavailable/null, never zero. Missing effects are not bounded. This is inspected/exploratory Q3 description, not confirmation, a causal Spot comparison, an independent baseline or a predictive-advantage claim.

**Measured finding:** 886 trades (413 LONG / 473 SHORT), gross mean +0.079982R; after modeled fees mean −0.389137R / −0.858256R / −1.796494R at 5/10/20bps. Every side and every declared block also has a negative mean after each fee. The small positive gross mean does not survive even the lowest declared fee assumption; it establishes no predictive advantage.

## Identity and pre-outcome declaration

- Engineering reference: Binance USDⓈ-M BTCUSDT linear USDT perpetual, 5m, UTC `[2026-07-01,2026-10-01)`. All 26,496 verified trade OHLC/base-volume rows; no acquisition or intake repeated.
- Separate [calculation contract](../../../research/derivatives-pilot/contract.json), [protocol](../../../research/derivatives-pilot/protocol.json), [pre-outcome seal](../../../research/derivatives-pilot/seal.json), and [complete reviewed scope](../../../research/derivatives-pilot/REVIEW_CONTRACT.md). Planning `6e839eba7d83000ef4af57610c067d232e6c16f5`; local pre-outcome commit `b3604638109ef196c4e92578fed8016a4b6d76b4`. Runtime implementation was not changed after sealing.
- Seal timestamp `2026-10-28T22:25:52.913Z`, SHA-256 `b4c970bfb8ee7429f88eaf90281185be815523c3276fbc75eee9e76752bb56e5`; real runs before seal **0**.
- Canonical protocol `4944bd1c272a28b903b5c9b808a77c83e0207ad8850bbc47a8ddf813dba09ef8`; protocol-file SHA `922e8043d100ff21af8ef03e0e2e400e9616539932c933236074d9f695fb1fb0`; new calculation-contract SHA `f740da9b9d456a789abba2e063c95583c52a32950f68d836196ae9fa06b8fe5f`.
- Trade payload `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`; original trade-file SHA `d3fe4e7db46ceccc6b17f35298577fc1072c1298602cf22c535ba0b7ec48bbca`; bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`.
- Frozen engine 0.4.3 SHA `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`; extracted original function bodies `a936482db9a7448505401aab4bca93ee47d470e9d9c145bf3af7e28278d6f8b2`; original backtest `bd37997efa97480c9ff8ab52374422a05be29238c70ae4a312d3d4c99bb0661e`.
- Mark/funding/current-metadata identities are attached in the seal as provenance only. No Mark/funding rows entered the engine. Current metadata is not historical Q3 rules. Frozen Spot loaders/contracts and all historical seals remain unchanged.

## Frozen calculation and execution

Each considered decision recalculates the full past-only July 1 prefix; minimum score3, original selection/SHORT tie before eligibility, target/MW/ATR/RSI/volume policies. No rolling reseed. Existing pure volume-reference memo only. Flat at decision index 3999; final index 26375, calendar 120-bar follow-up, no first-zone episode substitution; zone reuse retained.

Trade/CONTRACT_PRICE OHLC only, next-open entry and original directional validation; risk=abs(stop-nextOpenEntry). Stop-first, adverse stop gap at open, no favorable target improvement, TP2 exit and TP1 touch-only. Exit at j resumes j+1, including final-bar hit i+120→i+121. Expiry is priced at i+120 close, separate loop cursor i+121, next decision i+122. One non-overlap schedule across all blocks, no block resets.

Fixed round-trip 5/10/20bps replace the source 10bps: after-fees R = grossR − (bps/10000)×entry/risk, charged once. Fixed entry-notional assumptions are not verified account fees or per-leg/maker costs. Equal-trade R totals are not account equity or a compounded return.

## Counts and continuous window

| Field | Count |
| --- | ---: |
| admissibleDecisionIndices | 22377 |
| considered | 11633 |
| expiryCursorSkippedIndices | 20 |
| heldSkippedIndices | 10724 |
| initialExcludedIndices | 3999 |
| invalidNextOpenEntries | 0 |
| selectedPlans | 886 |
| tailExcludedIndices | 120 |
| totalBars | 26496 |
| trades | 886 |
| unavailableCalculationDecisions | 0 |
| waitOrNoPlan | 10747 |

Admissible decision-close timestamps: `2026-07-14T21:20:00Z` through `2026-09-30T14:00:00Z` inclusive. Full calculation history still starts July 1.

Blocks are equal 7,459-index portions `[3999,11458)`, `[11458,18917)`, `[18917,26376)`, attributed by decision index. Held and expiry-cursor skips plus considered indices reconcile to 22,377. Initial 3,999 and tail 120 indices are excluded from entry decisions, not removed from calculation/follow-up.

## Whole / side / block results

All rows below share the gross/fee-only/missing-funding label above. Full gains/loss sums, zero counts/fractions, holding distributions and side/block risk/CostR quantiles are in [summary.json](summary.json); no profitable subset was selected.

| Population | Fee bps | n | Mean R | Median R | Sum R | Gains R | Abs losses R | PF | W / zero / L |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Whole | gross | 886 | 0.079982 | -1 | 70.863980 | 638.262143 | 567.398163 | 1.124893 | 317 / 0 / 569 |
| Whole | 5 | 886 | -0.389137 | -1.224308 | -344.775423 | 504.379579 | 849.155002 | 0.593978 | 309 / 0 / 577 |
| Whole | 10 | 886 | -0.858256 | -1.452852 | -760.414827 | 393.432611 | 1153.847438 | 0.340975 | 271 / 0 / 615 |
| Whole | 20 | 886 | -1.796494 | -1.947601 | -1591.693635 | 247.772266 | 1839.465901 | 0.134698 | 201 / 0 / 685 |
| LONG | gross | 413 | 0.068078 | -1 | 28.116317 | 297.074511 | 268.958195 | 1.104538 | 143 / 0 / 270 |
| LONG | 5 | 413 | -0.415786 | -1.229316 | -171.719607 | 235.950052 | 407.669659 | 0.578778 | 138 / 0 / 275 |
| LONG | 10 | 413 | -0.899650 | -1.460326 | -371.555531 | 185.393117 | 556.948648 | 0.332873 | 122 / 0 / 291 |
| LONG | 20 | 413 | -1.867379 | -1.962359 | -771.227379 | 118.356336 | 889.583715 | 0.133047 | 89 / 0 / 324 |
| SHORT | gross | 473 | 0.090376 | -1 | 42.747664 | 341.187632 | 298.439968 | 1.143237 | 174 / 0 / 299 |
| SHORT | 5 | 473 | -0.365869 | -1.220934 | -173.055816 | 268.429527 | 441.485343 | 0.608015 | 171 / 0 / 302 |
| SHORT | 10 | 473 | -0.822113 | -1.447417 | -388.859296 | 208.039494 | 596.898790 | 0.348534 | 149 / 0 / 324 |
| SHORT | 20 | 473 | -1.734601 | -1.928817 | -820.466256 | 129.415930 | 949.882186 | 0.136244 | 112 / 0 / 361 |
| Block 1 | gross | 325 | 0.085404 | -1 | 27.756393 | 239.756393 | 212 | 1.130926 | 113 / 0 / 212 |
| Block 1 | 5 | 325 | -0.436778 | -1.247548 | -141.952899 | 187.230363 | 329.183262 | 0.568772 | 110 / 0 / 215 |
| Block 1 | 10 | 325 | -0.958961 | -1.502428 | -311.662190 | 145.312052 | 456.974243 | 0.317987 | 93 / 0 / 232 |
| Block 1 | 20 | 325 | -2.003325 | -2.094525 | -651.080774 | 88.885638 | 739.966412 | 0.120121 | 70 / 0 / 255 |
| Block 2 | gross | 287 | 0.045577 | -1 | 13.080672 | 196.925825 | 183.845153 | 1.071150 | 102 / 0 / 185 |
| Block 2 | 5 | 287 | -0.464335 | -1.200188 | -133.264273 | 151.193184 | 284.457458 | 0.531514 | 99 / 0 / 188 |
| Block 2 | 10 | 287 | -0.974248 | -1.402671 | -279.609219 | 113.454826 | 393.064045 | 0.288642 | 87 / 0 / 200 |
| Block 2 | 20 | 287 | -1.994074 | -1.911356 | -572.299109 | 69.183573 | 641.482683 | 0.107849 | 62 / 0 / 225 |
| Block 3 | gross | 274 | 0.109587 | -1 | 30.026916 | 201.579925 | 171.553010 | 1.175030 | 102 / 0 / 172 |
| Block 3 | 5 | 274 | -0.253862 | -1.189458 | -69.558251 | 165.956031 | 235.514283 | 0.704654 | 100 / 0 / 174 |
| Block 3 | 10 | 274 | -0.617312 | -1.402747 | -169.143418 | 134.665732 | 303.809151 | 0.443258 | 91 / 0 / 183 |
| Block 3 | 20 | 274 | -1.344211 | -1.897204 | -368.313752 | 89.703055 | 458.016807 | 0.195851 | 69 / 0 / 205 |

| Population | Stop / TP2 / expiry | Stop at open | TP1 touched | Both stop/TP2 | Holding mean / median / min / max | Cross-block / into tail |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Whole | 566 / 300 / 20 | 0 | 419 | 1 | 12.103837 / 4 / 1 / 120 | 2 / 0 |
| LONG | 268 / 131 / 14 | 0 | 186 | 1 | 13.283293 / 4 / 1 / 120 | 1 / 0 |
| SHORT | 298 / 169 / 6 | 0 | 233 | 0 | 11.073996 / 5 / 1 / 120 | 1 / 0 |
| Block 1 | 212 / 110 / 3 | 0 | 155 | 1 | 10.904615 / 4 / 1 / 120 | 1 / 0 |
| Block 2 | 183 / 94 / 10 | 0 | 130 | 0 | 13.087108 / 5 / 1 / 120 | 1 / 0 |
| Block 3 | 171 / 96 / 7 | 0 | 134 | 0 | 12.496350 / 4 / 1 / 120 | 0 / 0 |

TP1 is a touch flag, not a partial exit. Both-touch bars retain stop-first; stop-at-open is a subset of stops. Holding counts include entry and exit bars. Cross-block populations share one schedule and are not independent experiments.

## Stop risk and fee burden

Stop risk bps =10000×risk/entry; CostR=(bps/10000)×entry/risk. Quantiles use Hyndman–Fan type7, h=(n−1)p and linear interpolation; untrimmed equal-trade means.

| Whole population | Min | P10 | Median | P90 | P99 | Max | Mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Risk bps | 1.324914 | 5.727966 | 14.175177 | 35.071056 | 77.941083 | 334.550072 | 18.697592 |
| CostR 5bps | 0.014945 | 0.142568 | 0.352730 | 0.872912 | 2.647123 | 3.773831 | 0.469119 |
| CostR 10bps | 0.029891 | 0.285136 | 0.705459 | 1.745823 | 5.294247 | 7.547662 | 0.938238 |
| CostR 20bps | 0.059782 | 0.570272 | 1.410918 | 3.491646 | 10.588493 | 15.095325 | 1.876476 |

For each fee, mean gross minus mean after-fees equals mean CostR (independently checked). Tight stops increase entry/risk and amplify the same notional fee in R. This is not an estimate of derivatives account economics.

## Run, checks and limitations

- Exactly one real run; wall **332.914s** /3600s, calculation 330.264s; completed `2026-10-28T22:32:48.504Z`, Node `v24.15.0`, one 512MiB-heap worker. Observed process RSS maximum 552996864 bytes includes process/native overhead and is not a heap-size measurement.
- Raw canonical hash `4e87b085f3e2d6087fb05c958bdf4852349971adfcbcf334ca3c4d7d9ef213fc`; summary canonical hash `f2496a88dfde6a3a85b82582144d2a0269afac329e286e261b26df1c56a235bd`. Primary raw trace ignored at `.qa-results/derivatives-pilot-v1/run/raw.json`; no primary data uploaded.
- `node research/derivatives-pilot.cjs verify --out .qa-results/derivatives-pilot-v1/run` verifies stored seal/trace/hash/summary without new calculations/outcomes. Independent Python stored-record verification passed **67746** checks; no OHLC scanning or execution replay.
- 10 focused synthetic fixtures passed: typed input/units and Mark/Spot rejection; two-snapshot original-engine/full-prefix/memo parity; original LONG/SHORT execution; stop-first/gap/TP1/final-bar/expiry/non-overlap/tail; fee replacement once; zero/empty availability; funding-zero/fully-adjusted mislabelling rejection; historical-byte and identity-tamper checks. New adapter VM-object normalization was corrected before sealing/outcomes; frozen expressions unchanged.
- Required local `npm test` passed; the final focused suite also checks the actual tracked seal. Preservation verified 755 existing files/receipts. Actual exact-publication full CI is reported via the publication Actions run, not inferred from prior CI. CI uses synthetic data only, no acquisition or dataset-dependent run. New scoped checksum manifest binds code/QA/report; historical manifests remain untouched.
- Prior origin/causality audits are reused, not rerun. A finite July 1 prefix is not absolute convergence, universal live initialization/append/reload equivalence or a guarantee against all untested data conditions. No new broad parity audit.
- Funding/calendar/account settlement ordering are unverified and unapplied, never zero-assumed. Spread/slippage, historical filters/rounding, partial fills/latency, leverage/margin/liquidation/insurance fees remain unmodeled; fully adjusted returns unavailable. Five-minute OHLC cannot establish intrabar/account execution. No new fills, fee scenario, parameter search, hypothesis test or advantage claim.
- App 0.4.17 RC and its `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a` bytes, Spot 1.0.1/schema 1, frozen datasets/engines/seals and journal semantics remain unchanged. No public request, account/browser access, live observation, cohort regeneration or application release.

**Stop:** package complete after publication/CI verification. No next experiment or feature automatically authorized.
