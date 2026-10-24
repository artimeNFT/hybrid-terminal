# Offline calculation-readiness audit 1.0.0

This audit measures calculation reliability, **not strategy performance**. App 0.4.3 and CLI 1.0.1/schema 1 remain unchanged. No outcomes, backtest, episode generation, parameter search or live decision changes.

```sh
# Existing local data only. Choose a fresh output path on subsequent runs.
node research/readiness-audit.cjs --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/calculation-readiness-v1/q3-new.json

# Required CI path: compact generated synthetic fixtures, no acquired data/network.
npm run test:audit
npm test
```

The command first reloads the frozen file and uses **CLI 1.0.1 verify()** to check schema, quality and canonical hash; it requires the declared complete BTCUSDT 5m Q3 identity. It never acquires or rewrites data. Decimal text is verified before conversion to Number, matching the app's numerical inputs. The output JSON and adjacent `.md` are exclusive new writes. Full local output is ignored under `.qa-results`; compact findings and a concise report are tracked under `tests/results/calculation-readiness-v1/`. Absence of local Q3 data does not prevent CI.

## Declared protocol

`protocol.json` was fixed before the first real-data run and remained unchanged. Its SHA-256 is recorded in both the exploratory and final local audit outputs. Six dates (July 15; August 1/15; September 1/15/30) × four **decision-close** times (00:00, 00:05, 12:00, 23:55 UTC) give 24 points, each with ≥4,000 past bars. These calendar points were not selected for signal/performance outcomes. The final point still has one future candle for the causality check.

For every point, compare the prefix beginning July 1 against 60/100/300/1,000/2,000/4,000 trailing closed candles. No window is reseeded from future data. Causality is a separate exact comparison at the **same origin and same decision timestamp**, appending +1/+3/+288 bars where available; the longest origin is also compared against all remaining data. Some horizons coincide, so these are not independent observations. Missing horizons are counted, not synthesized. The implementation caps data at 30,000 bars, decisions at 24, and VM calculation calls at 30 seconds each.

Numeric differences include signed/absolute price units and division by the **longest past-only reference ATR**, only when finite and positive. RSI uses points; RR is dimensionless. These are never price/ATR errors. Small predeclared tolerances suppress report-level floating noise only; strategy thresholds remain untouched. Price and RR plan differences are separate. Numeric maxima in price and ATR units can occur at different timestamps. Availability and actual vote/side/eligibility changes are distinct measurements.

## Controlled adapter

`adapter.cjs` hashes the authoritative HTML against the reviewed 0.4.3 identity and extracts actual `ema`, `mwEvents`, `numericBar`, `volumeReference`, `analyze`, and `sigAt` function definitions plus their actual numerical helpers/RSI policy. It does **not** evaluate the HTML script, application bootstrap, `calc()`, `backtest()`, journal, UI, storage, feed or timers. Access traps reject browser/storage/network capabilities. The app is not modified/refactored. This is a controlled pinned-source adapter, not a general-purpose sandbox for untrusted code.

Two identity wrappers capture the arrays already filtered/sorted by actual `sigAt` for LONG/SHORT target selection. Every original filter/sort/threshold/indicator/plan expression remains intact; wrapper identity is tested against the extracted uninstrumented `sigAt`. No indicator formula is copied into the audit. The adapter and audit file hashes, extracted calculation-source hash and app/rule/RSI identities are recorded.

Snapshots normalize zone births, touches, M/W pivots/confirmations/supersessions and stopping events to **timestamps**, not slice-local indices. M/W reporting includes events with pivots in the last 30 bars, confirmed by t, with future supersession censored; this covers the actual 15-bar vote horizon but is not a serialization of all parser internals. Eligible zone pools and votes come from actual `sigAt`. First touches after t are unknown at t. A complete-data `analyze()` cache contains future recovery/supersession metadata by design; raw caches are not mistaken for decision-time leakage. The decision result itself is compared without censoring its votes, selection or plans.

## Interpretation / next step

Minimum availability is not convergence. The longest supplied history is a finite reference with an arbitrary July 1 origin. Real-data findings are limited to 24 points and five non-WAIT reference actions; they do not prove a universal burn-in or the absence of all leaks. The flat-tail fixture demonstrates that RSI availability can still differ after 1,000 flat bars. The old-target fixture demonstrates an actual LONG/WAIT origin difference even though no action-side flip occurred in the real sample.

See the concise report for feature-specific guidance. Keep the longest fixed origin where practical. A 1,000-bar score-input warm-up and 4,000-bar context window are **candidates for independent policy validation on these observations**, with residual EMA800 error retained; they are not new live gates. UTC day-open coverage and the 311-bar vector-classification/recovery horizon are separate requirements, and M/W parser carry-state has no proven finite universal bound here.

Next bounded step: independently review adapter/protocol and predeclare feature error budgets plus a stable-origin/burn-in/state contract. Episode generation and matched-control research remain queued until that contract is settled. No profitability or absolute convergence claim.
