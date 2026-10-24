# Offline calculation contract 1.0.0

`v1.json` is the machine-readable declaration. Status: **predeclared, awaiting independent review**. It specifies calculation preparation for a future BTCUSDT 5m Q3 pilot; it does not specify or generate episodes, controls, outcomes or a holdout. It changes no live decision, RSI policy, threshold, execution rule or journal behavior. App 0.4.3, acquisition CLI 1.0.1/schema 1 and audit 1.0.0 retain their identities.

This declaration follows the completed audit and its focused independent check at `6c3210b`. It is **post-audit**, not a claim that these choices preceded the sensitivity measurements. No outcomes were inspected or used to choose preparation rules. The audit's 1000/4000-bar observations are finite engineering evidence, not universal convergence bounds. The original report/protocol/results are historical and remain unchanged.

## Canonical input and clock

Use the frozen, complete Binance Spot BTCUSDT 5m range **[2026-07-01T00:00:00Z, 2026-10-01T00:00:00Z)**, 26,496 rows, canonical hash `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`. Before any future analysis, reuse `loadVerifiedDataset()` from `research/readiness-audit.cjs`: it applies acquisition CLI 1.0.1 verification and exact range/hash checks before decimal-to-Number conversion. No reacquisition, data rewrite or missing-bar interpolation. The source check command below reads no acquired dataset and does not claim to verify its current local availability.

For decision close t, pass **only** the consecutive, confirmed prefix with candle opens in [origin,t). The latest input bar opens at t−300,000 ms; Binance's inclusive close field is t−1 ms. t may equal the frozen end, since the last candle opens before it. Never use a future candle in canonical calculation preparation. Future-append projections remain separate diagnostic tests. Births, touches, confirmations, supersessions and decision identity use UTC timestamps, never slice-local indices.

The origin is **always July 1 00:00 UTC**. It is part of the calculand, not a moving loading convenience. The first bar lacks pre-origin true-range context; recursive seeds and M/W parser history before July 1 remain unknown. Full replay preserves this finite definition; it does not reconstruct an infinite past. Any earlier origin, revised data, source change, market/timeframe extension or approximation policy requires a new reviewed contract identity and fresh evidence. No synthetic 1h context is derived from this 5m contract.

## Preparation and exclusions

Exclude the first **3,999** prefix lengths. With **4,000 bars including the decision candle**, the first permitted close is **2026-07-14T21:20:00Z**. Always recompute the complete growing prefix, not the last 4000 bars. Keep all preparation bars and their target/M/W history: exclusion applies to decision timestamps, not to earlier source events that remain eligible under the unchanged app rules. This conservative cutoff reuses the audit's reference preparation minimum and makes all four EMAs available on ordinary valid input. It is not proof of convergence and does not select a profitable threshold.

| Requirement | Interpretation |
| --- | --- |
| Correct fixed origin, continuous verified input and exact coordinates | Missing bars, origin changes or provisional inputs block calculation preparation; no reseeding or synthetic replacement |
| At least 4000 past bars | Initial preparation exclusion, separate from actual feature availability and numerical convergence |
| Actual `sigAt().validity.ready` plus finite EMA50, positive ATR14, ready RSI14 and volume reference | Preserve undefined flat RSI, zero-reference/zero-volume and invalid arithmetic policies; time alone cannot make them valid |
| Actual candle-open UTC day coverage | Require `from-UTC-open`; an unavailable context value remains explicitly unavailable |
| Valid WAIT | Retain WAIT as a valid decision state; exclusion/missing input must not be relabeled WAIT or silently removed by a future episode builder |

EMA50, ATR14, RSI14, volume/target classification, stopping volume and M/W feed actual score/eligibility/plan logic. EMA13/200/800 and UTC VWAP/day open are context; EMA800 error is never a score change. Context availability is reported independently and does not add a score gate. Minimums are structural: EMA periods 13/50/200/800; ATR emits early values while building its first 14-TR seed; RSI needs 14 changes/15 bars but can remain undefined; current volume needs 10 prior bars. Targets can need 311 bars including current to classify their own oldest 300-bar origin. Stopping volume needs 27 bars. These finite horizons do not bound recursive seeds or M/W carried state.

## Feature error budgets

The accepted calculation is the **actual pinned application's finite-origin calculation**, in Node 24 through the existing controlled adapter. No alternate indicator implementation is introduced. Therefore the predeclared reproducibility budget is **zero**, separately for every listed feature and state. It is intentionally stricter than the audit's display/report tolerances.

| Comparison | Allowed difference from the same source/origin/decision |
| --- | --- |
| EMA13/50/200/800, ATR14, VWAP, day open | 0 price units; 0 reference-ATR units when reference ATR is positive/finite |
| RSI14 | 0 RSI points; never price/ATR units |
| Plan entry/stop/targets; RR | 0 price units; 0 dimensionless RR respectively |
| Availability/undefined states, volume references/class, UTC coverage, target IDs/geometry/recovery, M/W and stopping state | Exact decision-time projection equality |
| Component votes, totals, selected direction, actual side, both candidates' eligibility and plans | Exact equality; even unchanged side does not excuse a changed vote/plan |
| Future append, same origin and t | Exact equality of the seven existing audit projection fields |

Different-origin runs are **outside this contract**, even when their prices fall within a small tolerance or sides match. Their measured drift remains diagnostic. There is no approved approximation budget for rolling 1000/4000-bar substitution. Zero replay difference is reproducibility, **not** a claim of zero market-price error or absolute convergence. No EMA seed-weight percentage is used as price error. A future alternate-runtime/streaming implementation must receive its own predeclared error budget and validation; do not relax this one retrospectively to make it pass.

## M/W and resumption policy

Version 1 accepts only `full-past-prefix-recompute`. Replay the original prefix through the actual `analyze`/`mwEvents`/`sigAt`, preserving pivot ordering, three right-bar confirmation, replacements and supersession chronology. Do not use the audit's 30-bar M/W reporting list or 15-bar vote horizon as a serialized parser checkpoint. No universal finite M/W warm-up was established; older alternating pivots can influence the parser. Likewise retain target classification/recovery and recursive seeds by full replay.

On interruption, a cursor may identify the next timestamp, but it is not trusted calculation state. Revalidate the dataset and pinned source/contract identities, then replay from the original origin. Version 1 accepts **no serialized indicator/M/W state, rolling cache or partial-prefix resume**. If a resource bound is reached, fail and record it; do not truncate/reseed. A retained-state optimization would require a separately reviewed state schema and full-prefix parity fixtures. No such optimization is implemented here.

## Focused checks and limits

```sh
# Declaration consistency and pinned source hashes only; no acquired data/bootstrap.
node research/calculation-contract.cjs

# Generated fixtures only; no market access or acquired datasets.
npm run test:contract
```

`assessSnapshot()` consumes a **trusted snapshot from the pinned adapter**, requires an explicit state-mode declaration, and reports preparation exclusions separately from application side. It does not prove that a caller supplied a verified prefix or authenticate a fabricated snapshot. A future builder must validate inputs and construct snapshots itself. `checkReplay()` reuses the original exact causal projection comparator; it rejects different origins/timestamps and any changed field. These helpers are offline policy checks, not an episode engine or a production live gate.

Checks cover the exact 3999/4000 boundary, warmed-but-wrong origins, UTC close/end coordinates, real undefined RSI/zero-volume/zero-ATR inputs, valid WAIT retention, sub-report-tolerance price/RSI/RR changes, exact future replay and full-origin M/W reconstruction after a simulated restart. No completed real Q3 audit or successful application/research/browser check is rerun locally just for this declaration. Required CI still runs its complete existing jobs plus the new compact contract fixtures.

**Exact next action:** independently review `v1.json`, these assumptions and the focused checks. After acceptance, separately predeclare one episode/control protocol with ordering, horizon/censoring, chronological holdout and costs before generating outcomes. Broader data review and actual UTC-midnight/long-session/physical-touch observations remain open separately.
