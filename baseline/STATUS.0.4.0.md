# Hybrid System — checkpoint

Date: 2026-10-23, Asia/Jerusalem. Version: **0.4.0**. Increment complete.

Authoritative app: `hybrid-terminal.html` in `/mnt/c/Users/shlom/Desktop/THE hybrid-terminal`.
SHA-256: `0593c0096957d295628d267f1f3b16dd90a6478832d61bf39d2e9ed1959bc7d9`.

Preserved before editing: `baseline/hybrid-terminal.0.3.1.html`, SHA-256 `940e951deaea0474a575a4ba859c43333aed9b5996441ab6975f22f5beba793e`. This matched the 0.3.1 ZIP exactly and contained the most complete consistent feature set. All numbered HTML files, release ZIPs and supplied notes remain unchanged. No active Git repository or applicable AGENTS.md was present. Source/hash comparison is in `SOURCE_PROVENANCE.md`; application diff: `changes-since-0.3.1.diff`.

## Delivered

- Independently visible **Candles** and **Body** controls. PVSRA + Hollow up persists; filled bodies remain available. Direction is actual own open/close, neutral doji retained. v2 preferences and known v1 palette/body/timezone migrate without clearing the journal or unrelated v2 view fields.
- **Pane = Volume / RSI14 / None**. Reuses the original RSI14 array, displays warm-up/unavailable/closed/provisional states, shares chart time/pan/zoom/crosshair, with 35/50/65 references. Confirmed score thresholds remain 35/65 and strategy decisions are unchanged.
- **Pivots** toggle: Traditional PP/R1/S1 from previous complete UTC-day Binance spot klines. Bounded daily pagination, source/validity labels, missing-data state, exact UTC-day segments and epoch/symbol/timeframe/range response guards. No truncated intraday daily proxy or current-day look-ahead.
- Reproduced both supplied already-open gap-stop cases with the actual preserved backtest. Fixed stop fills outside the later bar range using **ohlc-market-stop-v2-gap-open**. Long and short: −2.5R gross, −2.55R net, replacing −1R/−1.05R in these fixtures. The 0.1% entry-notional round-trip cost, stop-first priority, strategy/entries/targets/horizon are retained. Targets get no favorable gap improvement. New calculations and new journal configurations identify the execution version; old journal records/IDs/versions remain intact.
- English chart/header/inspector, Hebrew panel/Help, improved narrow-screen chart height. Framework, markets, timeframes and dependency-free standalone architecture preserved.

## Actual validation

All logs/evidence are in `tests/results/`. Tests were recovered from the 0.3.1 archive; obsolete version/migration/Help expectations and the regression DOM stub were updated.

- All six dependency-free suites passed: `regression`, `ui-smoke`, `live-chart`, `readability-reliability`, `history`, `increment`. Includes 4,185 original/current-bar and 4,185 append-only signal comparisons across 15 synthetic datasets and score thresholds 3/4/5.
- New synthetic regressions cover 54 palette/body/class/direction cases, preference restoration/migration, unchanged signal/classification/backtest/journal, RSI seed warm-up/selection/provisional separation/empty space, pivot arithmetic and distinct adjacent UTC-day values, missing/incomplete daily sources, pagination, obsolete symbol/timeframe/range responses, stable history, long/short gap stops, ordinary stop-first priority, invalid entries and preserved legacy journal bytes.
- `browser-smoke.cjs` and `browser-increment.cjs` passed on actual Chromium/Canvas with mocked market data. Screenshots inspected at 1440×1000, 430×1000 and 390×844; controls, navigation, Help, local storage, chart history and provisional updates checked with no console/page errors. Phone canvas height after layout fix: ~329px. Fixed a clipped RSI title found during visual inspection.
- Native Canvas rendering passed at desktop/narrow widths and after panning. This is chart rendering, distinct from full browser layout.
- **Actual public REST:** 3 assets × 4 chart timeframes, plus complete previous UTC-day klines and pivots for each asset passed. Raw daily rows and timestamps are in `public-feed.json`.
- **Actual browser feed, no interception:** BTCUSDT 5m, ETHUSDT 15m, SOLUSDT 4h and BTCUSDT 1h each loaded 1,000 bars, received valid live WebSocket updates and daily Pivots, with no page/console errors. Details: `browser-live.json`; screenshot: `browser/live.png`. An initial short probe waited too little for two streams; the follow-up explicitly waited for `feedHealth().ready` and all four passed.
- QA-only Playwright/Canvas packages and extracted missing Chromium libraries were placed in `/tmp/hybrid-qa-tools`; the browser needed execution outside the sandbox. No system-package installation or application dependency was introduced. Local opening requires none of these tools.

## Remaining and next bounded task

Real live candle-close/UTC-midnight transition and long-session reconnect/storage behavior were not observed over an extended session; closure/rollover/races are covered with deterministic fixtures. Next: a bounded live soak spanning a 5m close and UTC day rollover, checking one confirmed journal append, RSI confirmation and pivot validity transition.

Exact TR_MAIN/Pine parity remains unverified. README records the precise source/settings/data requirements for PVSRA, Psy/session/DST, ADR anchoring/lookback, optional MACD and derivatives OI/Funding. No derivatives data, Psy substitute, ADR/ATR substitution or extra score vote was added. Execution product, real fees/slippage and historical research acceptance remain separate work; UI/feed checks do not establish profitability.
