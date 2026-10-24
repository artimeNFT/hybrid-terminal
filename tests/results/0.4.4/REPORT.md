# Presentation release candidate 0.4.4

The sole active application remains root `hybrid-terminal.html`. The panel now leads with feed health, confirmed close time, LONG/SHORT/WAIT and its main reason, followed by the eligible plan and nominal sizing. WAIT has no substitute plan. Provisional information has a separate temporary card. Candles, independent Body and navigation remain visible; Display groups secondary controls. Detailed candidate/context/statistics/recovery and cash assumptions expand on demand. Panel/Help remain Hebrew and chart/header/controls English.

## Source and preservation

Started from clean main, fast-forwarded to alignment checkpoint `ae45baf74efc58698afe35d5981df87006d16bad`. No unfinished local work was discarded. The superseded preparation-review utility was not implemented.

- Active application: **0.4.4 RC**, SHA-256 `f89f6f48a725d3f3e354a651b7a627e60ad7c1270105f6936b44803030f51cfa`.
- Exact reviewed internal reference: `baseline/hybrid-terminal.0.4.3.html`, SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.
- CLI remains **1.0.1 / schema 1**, SHA-256 `50104e76ec7209b058bc26f129d42ed59d615ed2f48efb0e4454e481287c1b1d`.
- Q3 canonical identity remains `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`, 26,496 complete BTCUSDT 5m rows. No acquisition, Q3 audit calculation or cohort regeneration.

The explicit runner `research/run-frozen.cjs` launches a separate historical source context. It binds only reads of logical root HTML to the independently hash-verified immutable 0.4.3 file, covering sync/callback/promise APIs. All other paths and all writes retain normal behavior. This is a versioned process-local binding, not a filesystem sandbox or new calculation engine. Original research modules, declarations, seals, payloads and accepted hashes stay unchanged. Direct unbound adapters still reject the changed active root. New binding/loader identities and the actual active UI hash are separate provenance; see `frozen-existing-verification.json` and `research/source-context/README.md`.

`preservation.json` records byte comparisons against the alignment checkpoint for original research, manifests, baselines, evidence, pinned research tests and lockfile; the historical STATUS archive and six local frozen dataset/checkpoint hashes also match. The original `qa/source-checksums.json` remains historical. Active checks use new `qa/source-checksums.0.4.4.json`; scoped release sources are recorded separately in `qa/presentation-0.4.4-sha256.json`.

## Risk presentation

The confirmed plan uses confirmed close `P`, stop/TP coordinates from that same plan and ATR at the confirmed decision index:

- Stop/TP1/TP2 ATR distances: `abs(coordinate - P) / decisionATR`.
- Modeled round-trip cost R: `0.001 * P / abs(P - stop)`.

The label states the existing 0.1% entry-notional round-trip assumption, not verified account fees or total execution cost. Missing, nonpositive, nonfinite or mismatched entry/close inputs show unavailable; zero stop/target distance is unavailable. Cost R can remain available with missing ATR because its formula does not use ATR. These values do not change sizing, backtest costs, selection/ties, eligibility, stop/target calculations, journal identities, rule/execution versions or RSI policy.

## Checks actually performed

`npm test` passed on Node 24.15.0: nine active-app suites; unchanged 18 CLI, nine audit, nine contract and 13 preparation cases under the explicit frozen context; five new presentation tests. The latter compare every existing nonpresentation function body with frozen 0.4.3, compare actual indicators/classifications/decisions/backtests on deterministic LONG/SHORT/random/degenerate fixtures across thresholds 3/4/5, guard risk arithmetic, and preserve prior journal bytes/metadata/preferences.

`npm run test:browser` passed all **six actual Chromium suites**, with no unexpected external network requests. They cover independent palette/body, panes/daily context/history, statistic edge states, journal/export/sizing invariance, 80px/reverse/diagonal candle-pixel movement with unchanged price span, axis/lower-pane isolation, manual-position persistence, Auto scale/Live/Reset and touch emulation/cancel. New presentation fixtures cover eight desktop/narrow × WAIT/eligible/unavailable/provisional states, confirmed risk coordinates, no WAIT plan, provisional invariance, collapsed details with open-state preservation, curve rendering after expansion, preference restoration and no horizontal overflow.

Existing UI fixtures were updated to open grouped controls. Initial local failures exposed historical CLI async source reads and hidden-control clicks; the binding and fixtures were corrected while preserving the old hash assertions and research tests. Final logs/manifests here contain the successful runs. Initial diagnostics remain in ignored `.qa-results/0.4.4/`.

Read-only historical verification also passed:

```sh
node research/run-frozen.cjs check --preparation-output .qa-results/preparation-v1/q3-v1 --audit-output .qa-results/calculation-readiness-v1/q3-audit.json
```

This verifies original audit file bytes/source identity and original preparation seal/canonical payload hashes (`e33d77…` features, `9a5184…` pairs), without recalculating the study. The observation tool's Display access/default ignored output was adapted and syntax checked; no actual live observation was run for this release.

## Visual inspection and limits

Actual screenshots were visually inspected at 1440×1100 desktop and 390×844 touch-emulated widths for all four states. The primary reason/plan is readable; narrow main scrolling preserves a usable chart. `screenshots.json` records current local image hashes and which images were inspected. Images/traces remain ignored local artifacts in `.qa-results/browser/browser-presentation/`; reproduce with the browser command. The eligible screenshot uses an actual calculated synthetic LONG, the unavailable fixture returns HTTP 503, and provisional input is a synthetic unclosed WebSocket bar. Synthetic flat price history is intentional, not a live-market screenshot.

Browser emulation does **not** complete physical-device acceptance. Actual UTC-midnight rollover and a one-hour reconnect/storage observation remain pending. Calculation parity is finite fixture evidence plus unchanged source bodies, not proof of all possible future behavior or strategy profitability. Historical preparation inference limitations remain unchanged.

## Delivery and next action

Publication uses non-force main pushes and actual GitHub Actions inspection. The implementation run receipt is added separately after that run completes; the CURRENT STATUS section records its commit/run. Final delivery verifies the latest pushed commit's actual CI and remote alignment with an ignored receipt, avoiding a self-referential run/commit checksum loop.

Stop after this presentation increment. The next unfinished milestone is bounded real-session acceptance using the existing observation tool: actual UTC-midnight, separate one-hour reconnect/storage observation, and physical-device touch when available. The extra research utility, outcome analysis, threshold changes and indicators stay deferred.
