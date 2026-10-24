# Calculation-readiness audit 1.0.0

Offline calculation reliability only: no trading outcomes, strategy-performance evaluation, episode generation or threshold optimization.

- **Application:** 0.4.3, SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`. Actual extracted `analyze`, `sigAt`, EMA and M/W functions; no application bootstrap, storage, `calc()` or backtest. Rule/RSI policies unchanged.
- **Data:** CLI 1.0.1/schema 1 verified the unchanged BTCUSDT 5m dataset: **26,496 complete rows**, no gaps/duplicates/conflicts, coverage **[2026-07-01T00:00:00Z, 2026-10-01T00:00:00Z)**. Canonical SHA-256 `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`.
- **Sample:** 24 predeclared calendar decision-close timestamps, with 4,032–26,495 inclusive past bars; 144 origin comparisons. Reference actions: **3 LONG, 2 SHORT, 19 WAIT**. These points were not selected using trading outcomes. Protocol unchanged between exploratory and final runs.
- **Evidence:** `findings.json` contains all feature maxima/availability counts, timestamp-aligned examples and source/protocol hashes. Full local snapshots are retained under ignored `.qa-results/calculation-readiness-v1/q3-audit.json`, with its byte hash recorded in findings. Required CI generates compact synthetic fixtures and needs no acquired data.

## History-origin sensitivity

Counts below are out of 24 decisions for each trailing window. "Selected direction" includes the internal LONG/SHORT choice when the action is WAIT.

| Trailing bars | Changed component votes | Selected direction | Action side / eligibility | Plan prices / RR | Eligible targets | Recent M/W | Partial UTC coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | 6 | 1 | 0 / 0 | 5 / 5 | 6 | 0 | 18 |
| 100 | 2 | 0 | 0 / 0 | 5 / 5 | 2 | 0 | 18 |
| 300 | 0 | 0 | 0 / 0 | 0 / 1 | 0 | 0 | 0 |
| 1000 | 0 | 0 | 0 / 0 | 0 / 0 | 0 | 0 | 0 |
| 2000 | 0 | 0 | 0 / 0 | 0 / 0 | 0 | 0 | 0 |
| 4000 | 0 | 0 | 0 / 0 | 0 / 0 | 0 | 0 | 0 |

At 60 bars, four opposite-vector-target votes and two EMA50/ATR stretch votes changed; at 100, two opposite-vector-target votes changed. Eligible target-state counts (6/2) are separate and need not map one-to-one to vote changes. Exact changed components and selected target timestamps are in the representative evidence. A 60-bar WAIT can retain a different internally selected direction. Plan-price changes are separate from action-side/eligibility changes. The sole 300-bar plan flag is **RR only**, approximately `1.66e-9`; stop/target-price differences are below the declared price-report tolerance. No action-side/eligibility flips occurred in the real sample, but that does not make all decisions identical: votes, selected direction, targets and plan values can differ. The synthetic old-target fixture does produce LONG versus WAIT under a shorter origin.

## Feature-specific warm-up guidance

These are provisional research-planning recommendations, **not new live gates**. Price and ATR maxima can occur at different points. "Matched" means these samples at the stated reporting precision, not proof of absolute convergence.

| Feature | Minimum / structural input | Observed maximum differences | Recommendation and limits |
| --- | --- | --- | --- |
| EMA13, context | 13 closes | 60 bars: 0.02850 price / 0.000371 reference ATR; 300+ matched | Keep fixed origin where practical; 300 is only a tested candidate. First availability is not convergence. |
| EMA50, score input | 50 closes; overall actionable input gate starts at 60 bars | 60: 43.7216 price / 0.71958 ATR; 100: 18.1462 / 0.25065; 300: 0.002588 / 0.0000369; 1000+ matched | A 1000-bar score-input burn-in is a candidate for independent validation on this data, not a universal bound or an optimized strategy threshold. |
| EMA200, context | 200 closes | Unavailable at 60/100. At 300: 43.6943 / 1.27697 ATR; 1000: 0.03264 / 0.000948; 2000: 0.00000231 / 3.82e-8; 4000 matched | Keep availability separate from error. Consider 2000/4000 only with a separately declared tolerance. |
| EMA800, context-only | 800 closes | Unavailable at 60/100/300. At 1000: 93.7418 price / 3.17856 ATR; 2000: 16.6143 / 0.27750; 4000: 0.053216 / 0.001574 | Even 4000 retains drift. Keep longest origin where practical; a 4000-bar context candidate must retain this residual. **Not a score change.** |
| ATR14 | Expanding first-14-TR seed, then recursion; first bar has no previous close | 60: 1.40173 price / 0.01157 ATR; 100: 0.08721 / 0.001092; 300: 3.83e-8 / 6.33e-10; 1000+ matched | Fourteen bars constructs the seed, not convergence. Validate a fixed-origin or provisional 1000-bar core-input contract. |
| RSI14 | 14 changes / 15 bars; no-change seed undefined | 60: 0.82490 points; 100: 0.06870; 300: 4.47e-8; 1000+ matched on Q3 | RSI errors are points, never price/ATR units. The flat-tail fixture still changes availability at 1000 bars: no universal finite burn-in is established. Preserve existing policy. |
| Volume / vector targets | 10 prior bars for current class; target age up to 300 plus each origin's 10-bar classification context → 311 including current | Current class matched everywhere. Target pools differed at 6/2 points for 60/100, none at 300+ here | At least 311 covers the finite classification/recovery input horizon; ATR-based eligibility still needs its own origin policy. A 300-bar match here is not a general guarantee. |
| UTC VWAP / DO, context | Actual UTC day open, up to 288 bars at 5m; positive cumulative volume | Partial coverage at 18/24 points for 60/100; max VWAP price errors about 1016.68 / 936.95; 300+ matched | Supply the complete candle-open UTC day. A 00:00 close belongs to the prior 23:55 candle; 00:05 belongs to the new 00:00 candle. This differs from the nearest-level card's close-time validity. |
| Stopping volume / M/W | Stopping: 20-bar context plus vote age up to 6 → 27 bars. M/W: 3-bar right confirmation and carried pivot history | Recent states matched here; fixtures verify confirmation and later supersession | Keep stable origin or independently review a retained parser-state contract. No universal finite M/W convergence bound follows from 24 matches. |

EMA13/200/800, VWAP and DO are context. Only actual `sigAt` votes, selection, eligibility and plans are counted as decision differences. No EMA seed-weight percentage is described as market-price error.

## Decision-time causality — a separate finding

**500 exact same-origin future-append comparisons; zero differences** across decision-time metrics, volume, UTC coverage, eligible zones, recent M/W/stopping state and actual decision/plans. Every origin receives +1/+3/+288 bars where available; the longest origin is also checked against all remaining future data. Twenty-eight unavailable horizon/origin pairs are skipped. Some horizons coincide, so these are not independent observations.

Future recovery/supersession metadata is censored to what was known at t, while actual decision results are compared unchanged. Raw full-history caches are not causal snapshots. M/W reporting covers recent 30-bar pivot-age context, including the actual 15-bar vote horizon; it is not a serialization of every parser buffer. The old-target fixture changes LONG to WAIT under a shorter history yet preserves the prior decision after later target recovery. A separate negative check detects deliberately altered earlier values/votes. The finite checks do not prove absence of every possible future-data leak.

## Validation and next bounded step

Nine audit fixtures passed: actual-versus-captured `sigAt` parity, UTC boundaries, timestamp alignment, EMA/flat-RSI availability, old-target action disagreement, M/W confirmation/supersession, negative causality detection, all six windows and sample bounds. `npm test` also passed all nine existing application suites and 18 research-data cases. Required CI makes no public-market request.

**Next:** independent adapter/protocol review, followed by a predeclared stable-origin/burn-in/feature-error-budget contract, including target history and M/W carry-state. Episode generation and matched controls stay queued. The longest July 1 prefix is a reference, not absolute truth; 24 points and five non-WAIT actions do not establish regime coverage or strategy performance.
