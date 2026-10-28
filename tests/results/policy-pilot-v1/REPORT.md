# Fixed-origin descriptive policy pilot v1 — BTCUSDT 5m Q3

Completed once, 2026-10-28. **All three declared net-cost summaries are negative.** This is exploratory description of existing rules and OHLC simulator assumptions on previously inspected data, not a live-session replay, independent confirmation, vector-effect estimate or evidence of predictive advantage. No retuning or further study was performed.

## Pre-outcome contract and identities

- Corrected planning checkpoint: `8a7baa92d56bd45b70e1e491de82cb11b63ead31`; exact [reviewed contract](../../../research/policy-pilot/REVIEW_CONTRACT.md) and machine [protocol](../../../research/policy-pilot/protocol.json).
- Canonical protocol SHA-256: `632d2155944ec99941f116d583bc7b29e051cd8469b8de049ffb961f7aaa0898`; protocol file SHA-256: `da3baa7f4dae2a0123480643ec5b3a69f5869d4e9bdbb8ade43b987f26f9d6d8`.
- Effective pre-outcome [seal](../../../research/policy-pilot/seal.json): `932c93acb4a9fb77379b8238db0c615fa232a722255f0370429752a8f9d7b39a`, written `2026-10-28T11:21:30.223Z`. Local checkpoint `f6dffd30680ace9e8d4b4820af50b12fc38f13ee` committed the implementation/seal before the real attempt began at 2026-10-28T11:21:58.791Z. Both checkpoints publish together after the report; there was no intermediate publication.
- Frozen 0.4.3 HTML SHA-256: `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`; original execution body `bd37997efa97480c9ff8ab52374422a05be29238c70ae4a312d3d4c99bb0661e`. Existing calculation contract `04d2c9dbbba6fb3d84b692c4410496f03e280dad82bb8357b44a443527b66156`. Existing explicit frozen binding and all 16 implementation/dependency hashes are in the seal.
- Dataset: Binance Spot BTCUSDT 5m, `[2026-07-01,2026-10-01)`, 26,496 complete contiguous rows, no gaps/duplicates/issues. Canonical data hash `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`; retained file hash `fc06545122b941f570c4cca001d0ae57306b3e0ca010130984c5f46156440ea3`. Existing CLI 1.0.1/schema 1 loader validates decimal strings before Number conversion; producer 1.0.0 remains valid. No reacquisition or rewrite.
- Active app remains **0.4.17 RC**, bytes `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`. No application/rule/execution/RSI/indicator/strategy, journal, preference, feed or frozen-research change. No personal profile/storage was used.

The original preflight evidence was reused. The review specification was corrected **before outcomes** to preserve the source's expiry cursor. An initial pre-outcome seal was superseded only to remove a copied-contract trailing blank line caught by `git diff --check`; its seal/document bytes remain ignored under `.qa-results/policy-pilot-v1-preformat/`. The canonical protocol was unchanged; the effective seal above and checkpoint precede every Q3 outcome.

## Policy and measurement

Every considered decision recomputes the complete past-only prefix from July 1 through that decision using unchanged `analyze`/`sigAt` via existing `preparation/calculations.cjs`. Only the previously reviewed pure volumeReference memo is reused; no indicator/parser state, rolling 4000 reseed or new indicator formulas. Score minimum 3, higher-score selection/SHORT tie before eligibility, original targets and WAIT behavior remain exact. A valid WAIT never receives a substitute plan.

The extracted frozen `backtest` keeps its entry, directional validity, risk, stop-first/gap, TP2, TP1 and cursor expressions. Three explicit adapter substitutions change only start index, admissible loop bound, and appended trace coordinates. Synthetic fixtures compare the original trade projection. Decisions are supplied by the past-only calculation adapter rather than full-future initialization.

Start **flat at index 3999**, an evaluation initial condition. Calendar-only last decision 26375 (`i<=N-121`) ensures all 120 future bars exist even if a trade might resolve earlier. Decision-close window: **2026-07-14T21:20:00Z through 2026-09-30T14:00:00Z**. No positions reset at block boundaries.

Entry is next open. Risk is `abs(stop-nextOpenEntry)`, not decision-close risk. Stop first; adverse stop gaps fill at open; favorable target gaps still fill at TP2. TP1 is the original touch flag only, with no partial exit. Stop/TP2 at j resumes decisions at j+1, including a hit exactly at i+120. Expiry prices i+120 close and resumes i+122. Raw trace stores actual exit bar, loop exit cursor and next decision bar separately; it does not assert a precise intrabar exit time.

One gross schedule is used. NetR=`grossR-(bps/10000)*entry/risk` at 5/10/20 round-trip bps. These **replace** the original 10 bps charge; the original stored R is retained only to verify 10 bps arithmetic, never charged twice. No extra slippage, leverage, quantity/account model or alternative intrabar execution scenario.

## Counts and exclusions

- 26496 input bars; 3999 initial indices excluded for preparation; 120 calendar-tail indices excluded; **22377 admissible decision indices**.
- **12185 considered**, 11,279 WAIT/no plan; 906 selected plans and **906 accepted trades**. Invalid next-open entries 0; unavailable calculation decisions 0.
- **10179 held indices skipped**, plus **13 extra expiry-cursor indices**; 12185+10179+13=22377. A zone may be reused after resolution; this is not a first-eligible-per-zone cohort.
- LONG 422; SHORT 484. These are simulator/research scenarios, not approved Spot short orders.

## Descriptive results in R

Gains/losses are sums of positive R / absolute negative R, not account currency. Profitable means strictly netR>0; exact zeros are separate. PF is gains/losses and has explicit null states for no trades/no loss denominator; all rows here have a defined denominator. No inference intervals or independence claims.

| Cost | Mean R | Median R | Gains R | Losses R | PF | Win/zero/loss counts | Win/zero/loss fractions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gross | 0.153283 | -1.000000 | 716.864108 | 577.989948 | 1.240271 | 327/0/579 | 36.09%/0.00%/63.91% |
| 5 bps | -0.353337 | -1.226878 | 559.456551 | 879.579578 | 0.636050 | 319/0/587 | 35.21%/0.00%/64.79% |
| 10 bps | -0.859956 | -1.463390 | 428.918491 | 1208.038705 | 0.355054 | 288/0/618 | 31.79%/0.00%/68.21% |
| 20 bps | -1.873195 | -1.996679 | 265.007329 | 1962.121916 | 0.135062 | 199/0/707 | 21.96%/0.00%/78.04% |

Gross mean is positive but every declared net mean is negative under these modeled costs. At 10 bps the modeled mean deduction is 1.013239R per trade, reflecting entry notional relative to stop risk. This is the declared arithmetic assumption, not verified account fees or total real execution cost. No fee/threshold adjustment is recommended from these outcomes.

Exit reasons: **577 stop, 316 TP2, 13 expiry**; stop-at-open subset 0. Holding bars inclusive: mean 11.235099, median 4, min 1, max 120. TP1 flag 425/906 (46.91%). Both stop and TP2 touched on the exit candle in 2/906 (0.22%); original stop-first remains. These flags cannot establish true intrabar ordering; a same-bar stop does not update TP1 in the original loop.

## Continuous chronology

Each block contains 7459 admissible indices. Trades are attributed by their decision index and keep full follow-up. Two holdings reached a following block (one each from blocks 1/2); none followed into the excluded final tail. These are serial, descriptive partitions, not independent validation sets.

| Block | Decision indices | First → last decision close UTC | Trades | Mean R · 5 bps | Mean R · 10 bps | Mean R · 20 bps | Cross-block holdings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [3999, 11458) | 2026-07-14T21:20:00Z → 2026-08-09T18:50:00Z | 298 | -0.339220 | -0.868100 | -1.925860 | 1 |
| 2 | [11458, 18917) | 2026-08-09T18:55:00Z → 2026-09-04T16:25:00Z | 328 | -0.479373 | -1.030500 | -2.132754 | 1 |
| 3 | [18917, 26376) | 2026-09-04T16:30:00Z → 2026-09-30T14:00:00Z | 280 | -0.220718 | -0.651509 | -1.513089 | 0 |

At 10 bps, LONG mean −0.878315R; SHORT mean −0.843949R. Full-precision all/side/block metrics, gains/losses, medians, PF states and counts are in [summary.json](summary.json). No subgroup or cost choice was used to retune rules.

## Validation and resources

- 15 independent synthetic fixtures: LONG/SHORT next-open risk, adverse gaps, no favorable improvement, stop-first ambiguity/TP1, expiry and final-bar hit cursors, invalid entries, WAIT, zone reuse/non-overlap, calendar tails, continuous holdings, costs once/zero/PF states, deterministic serialization and corrupted trace rejection.
- Actual calculator/memo/no-memo/reviewed-adapter snapshot equality at 2 deterministic synthetic fixed-origin points; original frozen execution trade-projection comparison. The existing 24-point origin audit is reused, not rerun: sampled 1000-bar decision/zone agreement with numeric tolerances and only 5 non-WAIT reference decisions does **not** establish all live startup/append/reload equivalence. EMA800 remains context-only.
- `npm test` passed on sealed code: active source checks, 9 app suites, frozen research 18 / audit 9 / contract 9 / preparation 13 plus 15 pilot cases, and 14 presentation suites/109 cases. Required exact-published CI also selects full QA; use the publication's GitHub Checks. Its actual post-push receipt is ignored `.qa-results/policy-pilot-v1-q3/ci-verification.json`, not a claim about an old app run.
- One real run, wall **376.029s**, calculation 374.214s, observed process RSS maximum 463183872 bytes. One worker, 512MiB worker-heap limit, hard 3600-second cap; no retries/truncation/reseed. RSS is process-wide, not a per-worker isolation guarantee.
- Stored canonical trace/summary/identity/cursor coverage verified without indicator or execution replay. Independent Python reaggregation verified **3993** arithmetic/count checks, including every stored grossR and 10 bps charge, all/side/block summaries and intact data bytes. This is verification of stored output, not a second real run or new execution scenario.

## Artifacts, commands and limits

Primary raw output stays ignored at `.qa-results/policy-pilot-v1-q3/`: `raw.json` (29081773 bytes), `summary.json`, `result.json`, `runtime.json`, exclusive `attempt.json`, calculation-only `progress.jsonl`, logs and independent verification. Raw canonical hash `92308bb009895ad96135048f87824af1e70761f3e85aff5e8b1d24dc3a82fc1e`; summary canonical hash `b60a6f3e806157a1e3aa6876349aa5d6c742cbeb4299bfaed5427afea2bdb650`. [delivery.json](delivery.json) binds compact artifacts and source identities. Historical reports/seals/datasets remain unchanged.

Commands used from the project root (`run` executed exactly once; pre-outcome formatting reseal described above):

```sh
node --require ./research/source-context/preload.cjs research/policy-pilot.cjs seal --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/policy-pilot-v1-q3
node --require ./research/source-context/preload.cjs research/policy-pilot.cjs run --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/policy-pilot-v1-q3
node --require ./research/source-context/preload.cjs research/policy-pilot.cjs verify --out .qa-results/policy-pilot-v1-q3
```

The exclusive attempt claim rejects restarting that output directory. `seal` is a new-protocol operation, not a command to overwrite historical seals. Required CI uses synthetic fixtures only, has no acquired datasets, and never runs this real pilot. Browser/live observations and cohorts were not repeated locally; the full required CI browser job is source-bound QA, not real-session acceptance.

Q3 was already inspected. Results depend on this finite origin, preparation exclusion, flat start, single symbol/timeframe/period, OHLC stop-first model and declared costs. They are not universal live equivalence or account performance. No future confirmatory data, held-out baseline, probability, bootstrap, parameter search or causal vector claim is provided. **Stop after this report; any follow-up needs a separate bounded scope.**
