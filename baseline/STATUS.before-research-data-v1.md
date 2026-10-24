# Hybrid System — vertical chart navigation checkpoint

Date: 2026-10-24, Asia/Jerusalem. Version **0.4.3**, implemented and checked.
Authoritative standalone app: `hybrid-terminal.html`.
SHA-256: `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.

## Baseline and bounded scope

The source exactly matched reviewed 0.4.2 SHA-256 `d91b92a0105e4c35aa8357d19ac123a2c73918cf093a7e905b1aa4941df7b6ed`. Preserved it before edits as read-only `baseline/hybrid-terminal.0.4.2.html` and `baseline/STATUS.0.4.2.md`. No newer navigation implementation was present. Read applicable instruction paths and current README/STATUS/source/tests; no AGENTS.md or active Git repository. Workspace resolves to `/mnt/c/users/shlom/desktop/the hybrid-terminal`, the established Hybrid Windows folder. No parallel implementation, subagents, repository conversion or other-project work.

All old numbered HTML, releases, archives, baselines, diffs, review notes and evidence remain. Application diff: `changes-since-0.4.2.diff`; provenance/checksums: `SOURCE_PROVENANCE.md`, `SHA256SUMS.txt`. New evidence: `tests/results/0.4.3/`.

## Implemented behavior

- A main-price-plot drag moves candles with the pointer vertically without changing price span; diagonal dragging translates time and price. Each move uses drag-start price bounds, time geometry and plot height: `shift = dy * (hi0 - lo0) / ph0`, then `[lo0 + shift, hi0 + shift]`. No accumulated translation.
- Vertical activation requires **4 CSS pixels** and at least **10% of horizontal displacement**. It latches until release, so reversing direction remains relative to the original range. Clicks/jitter and nearly horizontal drags keep automatic price fitting. Horizontal dragging has a 4-pixel dead zone; a pure vertical drag preserves follow-live state.
- Only price-plot-origin gestures can translate price. Volume/RSI-origin gestures remain horizontal even when moved into the price plot. Price-axis scaling and time-axis zoom remain. Single-pointer capture, release, cancellation/lost capture, secondary-pointer isolation and stale-epoch rejection are handled; invalid bounds, empty data and zero dimensions cannot translate price.
- While chart-focused, Up/Down moves candles vertically by 10% of plot height. Outside focus, page/input keys are unaffected; modified browser shortcuts are left alone. English tooltips/accessibility and Hebrew Help describe the controls.
- Manual price position survives developing and confirmed feed updates. **Live / End** returns to latest time while preserving manual price position. **Auto scale / Escape**, or price-axis double-click, restores price fitting. **Reset**, or plot double-click, restores 150 bars, latest time, the existing 18-bar right margin and automatic fitting. Reload/market/timeframe changes retain their previous view-reset behavior; viewport position is not saved as a preference.

## Preserved behavior

Rule **`hybrid-v2-validity-closed`**, execution **`ohlc-market-stop-v2-gap-open`** and the historical 0.1% entry-notional round-trip fee remain unchanged. Strategy/analysis/backtest, chart renderer, journal/history/daily context, preferences and sizing/research-export/report implementations match 0.4.2 byte for byte (`preservation.json`). Navigation changes only viewport state, never OHLCV, indicators, confirmed/provisional decisions, plans, backtest results or decision IDs/signatures. Existing journal records retain their bytes and application versions; new observations identify app 0.4.3 with the same rule identity. Day levels/Pivots/nearest context, label placement, palettes, independent bodies, markets/timeframes and history are retained. No new indicator, research/export feature, runtime dependency, framework or backend.

## Checks actually performed

- **Nine dependency-free Node suites passed:** regression, ui-smoke, live-chart, readability-reliability, history, increment, integrity, day-context and navigation. Final-source hash, timestamps and exit codes are in `node-validation.json`. Existing 6,882 legacy valid-decision comparisons and 4,185 append checks remain passing.
- New navigation regressions verify 80px movement, same-gesture reverse/diagonal movement and constant span; frozen start geometry across resize; thresholds and lower-pane isolation; secondary pointers/cancel/lost capture; axes/keyboard; invalid/empty/zero dimensions. Upgrade from 0.4.2 preserves existing journal bytes and engine results. Navigated and untouched controls produce the same market/indicator/signal/backtest/journal content after identical provisional and confirmed stream fixtures (independent new observation timestamps excluded from cross-instance comparison).
- **Five Chromium suites passed:** browser-smoke, browser-increment, browser-integrity, browser-day-context and browser-navigation. Actual Canvas/mouse interaction with synthetic REST/WebSocket inputs; desktop 1440×1000, narrow 430×1000 and phone 390×844. Logs and source hash: `browser-validation.json` and suite `.txt` files. Earlier tests retain their identified storage/clipboard/strategy doubles.
- Navigation browser evidence reads **actual candle-colored pixels**: downward displacement **+80px**, reverse **−80px**, diagonal **+70px time / +40px price**. Price span before/after: **6.0133617573658** in the synthetic fixture. It also checks axis drag/wheel/time zoom, lower panes, capture outside Canvas and release, keyboard focus, Auto scale/Live/Reset, provisional/confirmed WebSocket persistence, Day levels/Pivots labels, PVSRA/Hollow up, history and fixed confirmed context. Evidence: `browser-navigation/evidence.json` plus screenshots. No page/console errors.
- Chromium **emulated touch** on a 390px viewport verifies 80px price translation with constant span, no page scroll, release and actual pointer cancellation. This is not a physical-device test. Desktop/phone screenshots were inspected.
- One inherited day-context browser assertion initially read the panel before its scheduled animation-frame update. Added an explicit wait for the rendered disabled state; rerun passed. Original log/manifest retained as `browser-day-context.initial.txt` and `browser-validation.initial.json`. No application change was needed for that assertion. Browser launch requires execution outside the restricted sandbox here, using existing temporary QA tools; no app dependencies were installed.

## Pending observations and exact reproduction

No new actual public-feed observation was performed for this navigation-only increment. Stream persistence above used synthetic messages in an actual browser. The prior 0.4.2 short live run and 0.4.1 real-close evidence remain historical; neither proves 0.4.3 live midnight/long-session reliability. **Actual UTC-midnight transition, a one-hour reconnect/storage session and physical touch-device checks remain pending.** No test process remains running.

Run `node tests/navigation.cjs` for focused deterministic checks. Browser reproduction in this WSL environment:

```sh
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules node tests/browser-navigation.cjs

# Start 1–3 minutes BEFORE UTC midnight; otherwise records pending-window-unavailable.
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=midnight HYBRID_OBSERVE_SECONDS=420 node tests/browser-observe-context.cjs

# Separate one-hour sampling observation; not run in this increment.
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=soak HYBRID_OBSERVE_SECONDS=3600 node tests/browser-observe-context.cjs
```

Observation sampling is bounded to 30–7,200 seconds with a setup/resync deadline of sampling plus 120 seconds. The retained observation tool records source hash, UTC and runtime IANA Asia/Jerusalem times, source segments, completed-candle/journal counts, disconnect/resync and explicitly injected storage failure/recovery in an isolated profile. Its default output now goes to timestamped 0.4.3 directories; earlier evidence is preserved. Temporary QA tools under `/tmp` are not application dependencies.

Stop after this navigation increment. No profitability, execution-readiness or exact Pine/TR_MAIN parity claim.
