# Hybrid System — UTC day context checkpoint

Date: 2026-10-24, Asia/Jerusalem. Version **0.4.2**, implemented and checked.
Open `hybrid-terminal.html` in the established Hybrid project.
SHA-256: `d91b92a0105e4c35aa8357d19ac123a2c73918cf093a7e905b1aa4941df7b6ed`.

## Baseline and scope

The starting source exactly matched the reviewed 0.4.1 hash `7ebb7bf88cc2721722b5e4d6769a6938a5b48478f03452919e50259f2512caf4`. Preserved it before editing as read-only `baseline/hybrid-terminal.0.4.1.html`, together with `baseline/STATUS.0.4.1.md`. Read the task, README/STATUS and actual source/tests; no applicable AGENTS.md or active Git repository. No repository conversion, subagents or other-project work. Previous HTML/releases/archives/diffs/notes and earlier evidence remain unchanged.

Current application diff: `changes-since-0.4.1.diff`. Provenance/checksums: `SOURCE_PROVENANCE.md`, `SHA256SUMS.txt`.

## What changed

- Independent English **Day levels** control for PDH/PDL, stored as `dayLevels` in existing v2 preferences. Pivots works independently; other display/sizing preferences and unknown view fields are retained.
- One complete-day Binance Spot cache and shared in-flight lifecycle for both layers. Strict daily OHLC/date/end validation, atomic publication, <=1,000-day missing-range pagination, trusted UTC clock, epoch/symbol/timeframe/range guards and all-off/reenable race protection. Cached validated periods are reused; a second consumer does not duplicate requests. Failed/newly missing daily publication retries are bounded to 15 seconds; older missing periods remain unavailable until reload.
- PDH/PDL and PP/R1/S1 render only within their own **[validFrom, validTo)** UTC day. Labels prioritize the active/inspected day, merge when close, and point to full-precision inspector/source/validity information when space is insufficient. Line styles/text supplement color. Off-screen levels do not expand the price range. Historical segments, crosshair, navigation/right margin and chart-only history remain.
- Compact Hebrew nearest-level card uses enabled layers and the **latest confirmed close timestamp, price and ATR**. It shows at most one above/below price group plus equality, absolute/%/ATR distances with finite positive denominators, and expandable source/as-of/validity details. Panning, mouse and provisional prices do not move its anchor. All layers off has an explicit explanation.
- An exact midnight close selects the new validity day even before the next opening-bar update. Its source is unknown until the completed daily response arrives and validates. Missing/late sources display loading/unavailable; old levels are never assigned a new date. The chart inspector separately describes the inspected time.
- Research JSON/copy report include separately labeled reference context; journal records are neither enriched retrospectively nor rewritten. Hebrew Help explains the controls, day boundaries and reference-only meaning.

## Preserved semantics

**Rule:** `hybrid-v2-validity-closed`. **Execution:** `ohlc-market-stop-v2-gap-open`. Fee remains **0.1% entry notional per round trip**, a historical assumption. No strategy votes, selection/threshold/plan changes or probabilities. Strategy/analysis/backtest, journal implementation and automatic price-range source are byte-identical to 0.4.1. Existing RSI/statistics/sizing, closed/provisional separation, feed guards, PVSRA plus independent Hollow up/Filled, markets/timeframes and journal IDs/content/export/retention are preserved. No runtime dependency/backend/orders/secrets added.

## Actual validation

Evidence is under `tests/results/0.4.2/`; earlier version results remain historical.

- All **eight** dependency-free suites passed on this source: regression, UI smoke, live-chart, readability/reliability, history, increment, integrity, day-context. Source hash/exit codes/timestamps: `node-validation.json`. Existing 6,882 valid-input legacy comparisons and 4,185 append-only checks remain passing.
- New deterministic regressions cover known/distinct daily levels; missing/invalid/incomplete/duplicate/unordered/failed daily sources; trusted-clock loss; exact midnight before the opening update and delayed source; positive-denominator nearest/equal/missing-side cases; independent/shared/persisted toggles; obsolete asset/timeframe/range/off-on responses; missing-range pagination and failed-page atomicity; historical panning/auto-scale; unchanged signal/backtest/journal bytes/versions. Jerusalem DST labels are checked with runtime IANA conversion.
- All **four Chromium suites** passed: browser-smoke, browser-increment, browser-integrity, browser-day-context (log: `browser-context.txt`). Controlled synthetic feed/outcomes; real Canvas, actual pixel changes, drag/pan/zoom/crosshair/Home/End/history, five deliberately colliding levels and full-precision inspector, actual JSON downloads and preference restoration. Desktop 1440×1000 and narrow 390×844 / 430×1000 checked with no page/console errors. Screenshots inspected under `browser-context/` and `browser-retained/`; storage/clipboard doubles in integrity tests remain identified.
- **Actual public-feed short observation:** source hash matches this final HTML. Run 2026-10-24 **04:31:32.884–04:32:55.373 UTC**, runtime IANA **07:31:32–07:32:55 Asia/Jerusalem (GMT+3)**; 75.011 seconds sampling plus bounded setup/resync. Actual Binance Spot daily context/Pivots and live updates, zero extra daily requests for the second consumer, controlled network offline/online with guarded reload, no stale final samples or page/console errors, prior observed records retained. Evidence: `live-smoke/evidence.json`, `live-smoke/final.png`.
- The same isolated temporary Chromium context tested **injected quota-style write failure and recovery**: failure was visible, stored bytes unchanged, recovery persistent and IDs/bytes unchanged. This was not an actual full-disk/quota incident and did not access the user's regular browser journal.
- This short window observed **no new completed 5m frame, actual UTC midnight or one-hour session**. The earlier 0.4.1 real-close evidence is preserved separately and is not represented as a new 0.4.2 observation. The midnight-window guard was run now and correctly wrote `pending-window-unavailable` instead of waiting all day (`midnight-window-check/evidence.json`).

## Remaining observation and exact reproduction

Actual UTC rollover and long-session reliability remain **pending**. The bounded `tests/browser-observe-context.cjs` records source hash, UTC/IANA local timestamps, first/last daily segments, closed-candle/journal counts, disconnect/resync and explicitly tagged isolated storage-failure/recovery. No process remains running. Reproduce from the project root with the existing temporary QA tools:

```sh
# Start 1–3 minutes BEFORE UTC midnight; skips when the window is unavailable.
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=midnight HYBRID_OBSERVE_SECONDS=420 node tests/browser-observe-context.cjs

# Separate one-hour sampling observation; not run in this increment.
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=soak HYBRID_OBSERVE_SECONDS=3600 node tests/browser-observe-context.cjs
```

Sampling is finite (30–7,200 seconds), with a hard setup/resync deadline of sampling plus 120 seconds. Output directories are timestamped by default. Browser execution needed sandbox escalation here; packages/libraries are QA-only under `/tmp`, not application dependencies. Deterministic fixtures do not prove a live midnight transition.

Stop after this context increment. Later work is a separate paper-trade lifecycle and reproducible longer-history research engine. No sessions/Psy/ADR, MACD/OI, execution readiness, profitable edge or exact TR_MAIN/Pine parity claim.
