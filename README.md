# Hybrid System 0.4.3

Open `hybrid-terminal.html` directly in a modern browser. It is the authoritative standalone vanilla JavaScript/Canvas app. No build, backend or application dependencies. Binance spot REST/WebSocket access is needed. Markets remain BTCUSDT / ETHUSDT / SOLUSDT and chart timeframes remain 5m / 15m / 1h / 4h.

Chart/header/inspector text is English; the analysis panel and Help are Hebrew. On narrow screens the chart has its own usable height and the main area scrolls to the analysis panel.

## Reproducible QA and version control

Private repository: [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal). The [main CI workflow](https://github.com/artimeNFT/hybrid-terminal/actions/workflows/ci.yml?query=branch%3Amain) has verified remote runs; exact checkpoint/run evidence and the credential-storage follow-up are maintained in STATUS.md.

Use **Node.js 24** (`.nvmrc`). The standalone HTML needs no npm installation. For development/CI, the exact QA-only Playwright 1.64.1 and @napi-rs/canvas 1.0.13 versions and transitive integrity hashes are locked:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run qa:browser:install
npm run test:browser
```

`npm test` runs the reviewed tracked-source hashes, nine deterministic app suites, the 18-case research suite and nine synthetic audit fixtures. Browser QA runs the existing five mocked Chromium scripts with synthetic REST/WebSocket fixtures, a guard rejecting unmocked external requests, and per-context traces. Test logs, screenshots, traces and manifests go to ignored `.qa-results/`. Open a trace with `npx playwright show-trace .qa-results/browser/browser-navigation/trace-1.zip`. Neither required CI group uses public Binance, acquired datasets, browser journals, credentials or WSL-specific paths. Legacy direct script commands remain available; the npm runner supplies nonhistorical output directories.

On a minimal **Ubuntu 24.04 x64 WSL host without passwordless sudo**, use `npm run qa:browser:local` instead of `qa:browser:install`. It installs the pinned Chromium and downloads/extracts the three missing Ubuntu NSS/NSPR/ALSA packages under ignored `.tools/browser-libs`; the runner discovers these local libraries. Other operating systems should use Playwright's normal dependency setup. This fallback requires Ubuntu apt metadata/access but no system writes. No old `/tmp/hybrid-qa-tools` package/library path is used by the normal QA runner.

Git tracks source, schema, tests, required baselines, documentation, package lock and small textual evidence. Acquired `research/datasets/`, dependencies/tools, release ZIPs and bulky generated browser artifacts remain on disk and are ignored. Frozen data and historical full-delivery manifests are provenance records; those full manifests require the retained local delivery and are **not** required checkout/CI checks. `npm run check:source` explicitly checks only the tracked reviewed HTML, research source/schema and required HTML baselines.

`.github/workflows/ci.yml` uses Node 24 / standard Ubuntu 24.04, separate bounded deterministic and Chromium jobs, push/PR targeting main and manual dispatch. Action versions are pinned to verified official release SHAs. Permissions are read-only; only failure diagnostics from `.qa-results/` are uploaded, retained for three days. Required checks do not deploy, schedule collection, enable auto-merge or configure paid runners.

**STATUS.md contains the only maintained task board. Every completed increment must update it.** Local test success and a local independent Python oracle are distinct from a GitHub Actions run and independent external review. Repository publication/remote run status and any remaining login action are recorded there.

## Offline calculation-readiness audit 1.0.0

This separate audit measures **history-origin sensitivity and decision-time causality**, using the actual reviewed app calculation functions through a controlled adapter. It does not execute application bootstrap, storage, `calc()` or backtest, duplicate indicator formulas, generate episodes/outcomes, or change live strategy policies. App 0.4.3 and CLI 1.0.1/schema 1 remain unchanged.

```sh
# Existing local dataset only; no acquisition. Use a fresh output name each run.
node research/readiness-audit.cjs --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/calculation-readiness-v1/q3-new.json

# Compact synthetic fixtures; no acquired dataset or public market access needed.
npm run test:audit
```

The real-data command first applies CLI 1.0.1 schema/hash/quality validation to the complete 26,496-row BTCUSDT 5m Q3 dataset. `research/audit/protocol.json` predeclares 24 UTC decision-close timestamps and 60/100/300/1000/2000/4000-bar windows. Every decision compares the longest available past-only prefix to each trailing origin; same-origin future appends are tested separately. Full local JSON/Markdown are written exclusively under the chosen output path; compact findings and a concise warm-up report are tracked in `tests/results/calculation-readiness-v1/`.

Observed at the 24 fixed points: 60/100-bar windows changed component votes at 6/2 points, with no action-side/eligibility flips; plan prices changed at five points in each short window. The 300-bar plan flag is only tiny RR drift. At 1000+ bars, sampled score/plan/target/MW results matched the finite longest reference, while EMA800 still drifted even at 4000 (max 0.053216 price / 0.001574 reference ATR). **EMA800 is context-only.** Five hundred same-origin future-append checks had zero differences. The nine synthetic audit fixtures include an actual old-target LONG/WAIT origin disagreement and flat-tail RSI availability drift, so neither the real sample's side agreement nor a 1000-bar core-input candidate is a universal guarantee.

See `tests/results/calculation-readiness-v1/REPORT.md`, `findings.json` and `research/audit/README.md` for per-feature availability/error units, timestamp-aligned examples, source/data identities, projection assumptions and provisional warm-up guidance. The longest history is a reference, not absolute convergence. Next bounded step is independent adapter/protocol review and a predeclared stable-origin/burn-in/error-budget/state contract; episode generation and matched-control work remain queued. `npm test` and the deterministic Actions job include the synthetic audit group.

## Frozen research data — tool 1.0.1 / schema 1

CLI **1.0.1** fixes the externally reproduced timeframe-validation defect: only primitive strings `5m`, `15m`, `1h`, `4h` are accepted through an own-key check. Inherited names and coercible non-strings fail before acquisition filesystem/network activity. Valid 1.0.0 datasets/checkpoints remain compatible; malformed payloads are rejected for both producers even if rehashed. Schema 1 and valid-data hashes are unchanged. See `research/SCHEMA.md` and the resolution/evidence on STATUS's single task board.

`research/klines.cjs` is a separate dependency-free Node.js >=22 command-line tool. **The authoritative HTML remains byte-for-byte 0.4.3**, SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`. The CLI never imports the terminal, chart cache, indicators or journal. It acquires public Binance Spot klines, preserves all 12 fields and decimal-string precision, validates closed UTC coverage, saves immutable outputs and independently reloads/verifies them offline. Tool/schema are versioned separately from the app.

The actual acceptance dataset, retained locally and intentionally excluded from Git, is `research/datasets/btcusdt-5m-2026-q3.json`: **complete, 26,496 rows, zero gaps/duplicates/conflicts**, coverage **[2026-07-01T00:00:00Z, 2026-10-01T00:00:00Z)**. Canonical data SHA-256: `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`. It was acquired from the official public market-data-only host, offline validated and independently checked with Python stdlib JSON/SHA256/Decimal/grid QA. Two separate 288-row July 1 acquisitions have identical canonical data hashes; that sample also matches the corresponding Q3 rows. These are engineering checks, not strategy evaluation or trading-advantage evidence.

Run from the project root. A fresh Git checkout does not include acquired datasets; acquire or restore them before optional offline/full-delivery validation. The first command intentionally uses a **fresh output path** for reproduction; existing frozen files are never overwritten:

```sh
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json

# After Ctrl+C/network failure: identical configuration/output, plus --resume.
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json --resume

# Offline, using the frozen dataset delivered here:
node research/klines.cjs validate --file research/datasets/btcusdt-5m-2026-q3.json
node research/klines.cjs compare --first research/datasets/btcusdt-5m-2026-07-01-repeat-a.json --second research/datasets/btcusdt-5m-2026-07-01-repeat-b.json
node --test tests/research-data.cjs
node scripts/check-source.cjs
```

To repeat the small check with a fresh file, use the acquisition command with end `2026-07-02T00:00:00Z` and a new output name, then compare with `research/datasets/btcusdt-5m-2026-07-01-repeat-a.json`. If `data-api.binance.vision` is unavailable, an explicit `--base-url https://api.binance.com` is supported; a resumed acquisition must keep its original host.

Adjacent `.checkpoint.json` files are resumable work states, **not frozen datasets**; the offline dataset validator rejects them. Request timeout is 15 seconds, pages at most 1,000, retries at most three, with pacing, Retry-After and immediate HTTP 418 stop. Missing/developing rows remain gaps and produce `incomplete`; invalid/conflicting source pages block and remain in checkpoint evidence. Exit 0 means complete/identical, 2 valid incomplete/different, 1 error/invalid, 130 cancelled. See `research/SCHEMA.md` for exact field order/units, canonical bytes, precision/quality rules, rate policy, lock recovery and resource bounds. Data hashes exclude volatile acquisition metadata; file checksums protect delivered bytes separately. `RESEARCH_DATA_SHA256SUMS.txt` and earlier delivery manifests remain historical **1.0.0** records; use the reviewed historical commit/original delivery to check them. Current mandatory source checks are `qa/source-checksums.json` via `npm run check:source`; CLI 1.0.1 source/test/schema checks are also recorded in `qa/research-cli-1.0.1-sha256.json`.

Evidence and provenance: `tests/results/research-data-v1/`, `SOURCE_PROVENANCE.md`, `STATUS.md`. No app dependency, UI, strategy, research-snapshot export, archive ingestion, indicator or paper-trade feature changed. Prior app browser/live evidence remains historical; no new UTC-midnight or long-session observation was performed.

## Chart navigation — 0.4.3

Drag inside the main price plot to move candles with the pointer vertically, or diagonally to move time and price together. The price span stays constant. Translation uses the original bounds and plot height: `shift = dy * (hi0 - lo0) / ph0`, then `[lo0 + shift, hi0 + shift]`; offsets never accumulate from an already shifted range. Vertical positioning activates after **4 CSS pixels** and at least **10% of horizontal displacement**, then remains active until release. Clicks/jitter and nearly horizontal drags retain automatic price fitting. Horizontal panning also has a 4-pixel dead zone. A pure vertical drag retains the existing follow-live state.

Only a gesture starting in the main price plot can translate price. Volume/RSI gestures pan time only, even if the pointer later enters the price plot. Price-axis drag/wheel still scales price; time-axis drag and plot wheel still zoom time. Single-pointer mouse/touch capture survives leaving the canvas; release, cancellation or lost capture ends the gesture. Invalid bounds, empty data and zero-sized plots cannot initiate price translation.

Manual price positioning survives developing and confirmed feed updates. **Live / End** returns to latest time and retains manual price position. **Auto scale / Escape**, or double-clicking the price axis, restores automatic price fitting. **Reset**, or double-clicking the plot, restores 150 bars, latest time with the existing 18-bar right margin, and automatic price fitting. With chart focus, **Up/Down** moves candles by 10% of the price-plot height; Left/Right, Home and +/− keep their existing actions. Keys outside chart focus retain page/input behavior. Viewport positioning is session-local, as before; reload/market/timeframe changes retain the existing reset behavior.

Baseline 0.4.2 is preserved as `baseline/hybrid-terminal.0.4.2.html` (reviewed SHA-256 `d91b92a0105e4c35aa8357d19ac123a2c73918cf093a7e905b1aa4941df7b6ed`). Current source hash, exact performed checks and limitations are in STATUS; evidence is under `tests/results/0.4.3/`. This is a navigation-only increment: strategy, backtest, day context, preferences and journal semantics remain unchanged. No dependencies added.

## UTC day context — 0.4.2

**Day levels** independently enables PDH/PDL: the previous complete UTC day's high/low from the same Binance Spot symbol. **Pivots** remains independent. Both share one guarded daily-kline cache and in-flight request; adding a consumer does not duplicate requests. Missing history ranges are paginated in blocks of at most 1,000 daily bars, with atomic validation/publication. Disabling both layers cancels pending publication; re-enabling cannot accept an obsolete response. Trusted server UTC time is required. Failed requests and a just-completed day not yet published retry at a bounded 15-second interval; missing historical days remain explicitly unavailable until a reload.

For source day D, levels have exact validity **[D+1 00:00 UTC, D+2 00:00 UTC)**. Source OHLC must be a validated complete daily kline, never a partial intraday aggregation. Symbol/timeframe/epoch/range guards remain. Rendering uses day-bounded segments; PDH has long dashes, PDL short/dotted dashes, and pivots their existing dash style. Labels prioritize the active/inspected day. Close labels merge; on narrow segments a compact label points to the full-precision values/source/validity in the English inspector. Off-screen levels do not change automatic price scaling.

The compact Hebrew **nearest-level card** uses only enabled layers. It shows one nearest above and one below the **latest confirmed close price**, plus equality when present. Coincident names share one price. Distances are absolute, percentage and ATR; nonpositive/unavailable denominators are unavailable. Expand its source details for the UTC source date, as-of close timestamp, validity interval and response-observation time. At a close **exactly at UTC midnight**, the card selects the new validity day even before the next opening-bar update. Until the just-completed source day is received and validated, that period is loading/unavailable; yesterday's levels are never relabeled as today's. Mouse, panning and provisional prices do not move this anchor. The chart inspector follows the inspected time separately. Disabled layers have an explicit explanation.

These are reference levels, not forecasts, targets or score votes. Rule version **hybrid-v2-validity-closed**, execution **ohlc-market-stop-v2-gap-open**, fee assumptions, RSI/statistics/sizing and journal IDs/content are unchanged. The strategy/analysis/backtest, journal implementation and automatic price-range source match 0.4.1 byte for byte. Daily context changes do not write or backfill journal decisions. Research JSON adds a separately labeled `levelContext` snapshot. Preferences add only `dayLevels` within existing v2 display settings, retaining other fields.

## Integrity release 0.4.1

The visible source/mode is **BINANCE SPOT · RESEARCH / SIMULATION**. A condition count is not a success probability. No execution connection, leverage or account permissions are inferred from the chart.

Statistics use `net-r-states-v1`, shared by the panel, copy/report and **הורד תמונת מחקר JSON**:

| Resolved net-R outcomes | Win rate / Wilson 95% | PF |
| --- | --- | --- |
| N=0 | Unavailable (`null` values) | Unavailable |
| All zero | Measured zero wins, interval based on N | Undefined 0/0 (`all-zero`) |
| Positive gains, no losses | Measured win rate / interval | Undefined ratio (`no-losses`), no 99 sentinel |
| All losses | Zero wins, interval based on N | 0 |
| Mixed | Measured win rate / interval | Positive net R divided by loss magnitude net R |

Invalid outcomes/arithmetic are unavailable, never NaN/Infinity serialized as a result. Drawdown is cumulative **realized closed-trade net R**, not mark-to-market or account-equity drawdown. The historical fee remains 0.1% of entry notional per round trip, an assumption rather than known live account fees.

Sizing is **nominal geometric quantity = account × risk% / stop distance**. The reviewed 1,000 / 1% / entry 100 / stop 99.9 case gives about 100 units / 10,000 USDT / a 10× notional-to-reference-account ratio. This is not approved leverage or an executable quantity. The default product/cash scenario is unconfigured. Selecting **Cash-only Spot LONG** and supplying an explicit assumed USDT cash balance compares cash with nominal notional **before costs only**. Insufficient cash is explicit; covering that notional is not an order approval. SHORT is directional research, not unborrowed Spot execution. Costs, borrowing/funding and venue/account constraints are unconfigured; executable quantity stays `null`. No feasible-size calculation, exchange-filter approval, rounding or order-type check was added.

Expandable diagnostics show both LONG/SHORT counts, targets, geometry, eligibility and WAIT/conflict reason. The legacy policy remains **higher score, SHORT on a tie, before eligibility**. In the reviewed 3/3 fixture, SHORT has no target, LONG is eligible, and the terminal deliberately retains WAIT while explaining the suppressed LONG. An eligible-first policy remains a separate, unimplemented experiment requiring its own rule version and comparison.

Rule semantics are now **`hybrid-v2-validity-closed`**: positive finite ATR, a usable volume reference, valid finite OHLCV/time, EMA/signal warm-up and usable RSI are required for action. Zero-reference volume/product comparisons cannot manufacture strength. A zero previous spread-product maximum is not product-based vector evidence. RSI14 uses the existing Wilder calculation; after 14 changes, no gains and no losses is explicitly undefined (`null`), not forced to 50/100. The old seed diagnostic is retained separately in `rsiRaw` and never votes. One-sided gains/losses retain 100/0. This is local policy `wilder14-local-undefined-zero-change-v1`, not verified Pine parity. Ordinary valid-input thresholds and legacy decisions are preserved; degenerate inputs intentionally change.

The first loaded UTC day's coverage is labeled partial when it starts after midnight. VWAP still uses loaded-bar HLC3 weighted by base volume; **DO*** is then only the first loaded bar's open. Coverage labels do not replace that calculation or extend the research window.

Old journal records retain their exact IDs, signatures, versions and content. New observations use the new rule-version identity and include frozen candidate diagnostics; upgrading may append a distinct new-version observation for the same candle. No old observation is re-versioned or overwritten. The execution version remains **`ohlc-market-stop-v2-gap-open`**. Research snapshot export is separate from the journal and includes nullable numeric statistics, explicit states, sizing assumptions, confirmed/provisional candidates, source and versions. It is not a complete immutable dataset or an execution ledger.

## Appearance and context

- **Candles:** High contrast (light blue/orange), Standard (bright green/red), or the existing PVSRA normal/rising/vector mapping. The legend and inspector give direction and class in text.
- **Body:** Filled or Hollow up. Choose **PVSRA + Hollow up** for bright volume coloring with hollow rising bodies and filled falling bodies. Direction compares close with the same candle's open; equality is a neutral doji. Previous-close colors are not used.
- **Pane:** Volume (default), RSI14, or None. One synchronized lower pane uses the chart's pan, zoom, time and crosshair. RSI reads the existing Wilder array used by the score, with 35/65 references and midpoint 50. The first 14 price changes are warm-up; undefined zero-change RSI and unavailable values are not plotted. Developing values are dashed amber and explicitly Provisional. An empty crosshair position has no oscillator value.
- **Day levels:** previous complete UTC-day PDH/PDL; independent of Pivots, shared validated source, default off.
- **Pivots:** independently toggles Traditional PP/R1/S1 from the previous completed **UTC day**, on the selected Binance spot market. PP=(H+L+C)/3, R1=2×PP−L, S1=2×PP−H. Separate UTC daily klines supply the complete source; intraday chart slices are never substituted. Each segment exists only in its following UTC day. Price labels and a source/validity status identify the selected period; missing inputs are unavailable. There is no claim of exact TR_MAIN settings parity.
- **Display → Volume tags:** optional ◆ vector / ● rising volume on Volume bars, off by default.

Valid v2 palette/timezone/tag preferences survive; Body/Pane/Pivots/Day levels also persist. Known v1 palette/hollow/timezone choices migrate conservatively. Unrelated v2 view fields are retained. Appearance/context controls do not change the 0–5 score, thresholds, signal plans or decision identities.

## Decisions, navigation and journal

Confirmed signals, notifications and backtest inputs remain based on closed candles. Developing analysis is provisional. M/W confirmation/supersession chronology, feed identity guards, stale/offline/timeout status and local journal safeguards remain.

Drag the price plot to pan time/price, lower pane to pan time only; wheel to zoom; Shift+wheel to pan time. Drag/wheel the price axis to scale, double-click to restore automatic fitting. With chart focus: Left/Right pan time, Up/Down pan price, Home/End and +/−. **Live** returns to latest time while keeping manual price position. Israel/UTC changes displayed time only.

**History +1,000** adds up to 5,000 chart-only candles. It does not extend/reseed the confirmed decision/backtest window. Chart RSI, like chart EMAs, uses the extended chart's history origin; confirmed score RSI keeps its original analysis window. Panning is not replay: the analysis panel stays current.

The local journal retains up to 1,000 observed confirmed decisions, not executions. Export JSON for a backup. Existing decision IDs/signatures and prior application/configuration versions are preserved, including records without an execution-version field. Malformed/unknown journals remain protected from automatic overwrite. Storage stays under the existing journal key and browser origin; no migration clears it.

## Backtest execution correction

Version **ohlc-market-stop-v2-gap-open** replaces the implicit 0.3.1 stop-at-price model for newly computed backtests. An already-open position whose later candle opens beyond its market stop exits at that open, with zero extra modeled slippage. Both supplied long/short gap fixtures produce **−2.5R gross / −2.55R net**; the actual 0.3.1 function reproduced **−1R gross / −1.05R net**. Consequently historical backtest results can worsen for gap stops.

The fee remains the same **0.1% of entry notional per round trip**, deducted once. Entry is still the next open; entries already beyond stop or target are skipped; stops/targets and the 120-bar horizon are unchanged. Stop priority is retained whenever stop and target are both touched. Target gaps retain the target price, without favorable open improvement; stop priority also applies to a target-gap bar that reverses through its stop. This is a conservative OHLC priority model, without intrabar ordering or order-queue simulation. Actual product/order behavior, fees and slippage need separate definitions. Prior journal records are not rewritten.

## Reproduce validation

Dependency-free synthetic/mocked suites:

```sh
node tests/regression.cjs
node tests/ui-smoke.cjs
node tests/live-chart.cjs
node tests/readability-reliability.cjs
node tests/history.cjs
node tests/increment.cjs
node tests/integrity.cjs
node tests/day-context.cjs
node tests/navigation.cjs
```

Real browser suites require Playwright/Chromium as **test tools only**:

```sh
node tests/browser-smoke.cjs
node tests/browser-increment.cjs
node tests/browser-integrity.cjs
node tests/browser-day-context.cjs
node tests/browser-navigation.cjs
node tests/browser-live-close.cjs
node tests/browser-live.cjs
python3 tests/public-feed.py
```

`browser-smoke` and `browser-increment` use actual Chromium/Canvas with synthetic/mocked feed data. `browser-live` and `public-feed.py` access actual public Binance data. Current navigation checks are under `tests/results/0.4.3/`; 0.4.2 day-context and 0.4.1 integrity results remain historical evidence. `browser-navigation` verifies actual candle pixels after mouse gestures and Chromium touch emulation; its feed is synthetic, with no physical-device or actual live-stream claim. `browser-integrity` uses controlled synthetic candidates/outcomes and downloads real JSON files; its clipboard is a test double. `browser-live-close` makes no feed interception and stops after one actual 5m close or a bounded timeout. Earlier release QA used temporary packages/libraries under `/tmp/hybrid-qa-tools`; that historical setup is not needed by the locked npm QA commands above. The retained observation commands below describe prior runs and remain outside required CI. Opening the standalone app needs no QA packages.

## Defined follow-up requirements

| Extension | Inputs/configuration needed before implementation or parity claims |
| --- | --- |
| TR/PVSRA reference | Exact Pine/library/TR_MAIN source URL and version; exported settings and identical exchange, product, symbol/timeframe/history origin. Compare volume ties, zero-volume and initialization behavior. |
| Psy-Hi / Psy-Lo and sessions | Exact range/session rules, crypto vs forex mode, timezone and DST handling, reference source/settings and session calendar. Never substitute generic round numbers. Developing ranges must retain when each extreme became known. |
| ADR / Hi-ADR | Exact daily-range lookback, completed/developing-day policy, session definition, band anchor, units and reference implementation. ADR is not ATR; do not backdate the final session range. |
| Optional MACD | Define periods, source and initialization; use as context first. Shared price inputs with EMA/RSI do not justify extra independent score votes. |
| OI / Funding | Identify derivatives venue/product/contracts (the screenshot's MEXC OPUSDT.P differs from this spot feed), API/history coverage, units, timestamps, refresh/freshness and funding schedule. No spot-volume proxy, undisclosed venue substitution or historical backfill with today's snapshot. OI does not establish average leverage or net long direction. |

The 0.4.1 close observation remains preserved. The 0.4.2 short live check observed real daily context and controlled network resync, with a separately tagged isolated storage-failure fixture; it did not reach a new close, UTC midnight or a long-session duration. See STATUS and the bounded commands below. Later feature work remains a separate paper-trade lifecycle/longer-history research engine, not an extension of chart backfill. Exact TR parity remains unverified.

## Bounded reliability observations

Run from this project root with Playwright/Chromium QA tools. Every run uses an isolated temporary browser context, records source SHA-256, UTC plus runtime IANA `Asia/Jerusalem` timestamps, first/last daily source segments, completed-candle/journal counts, actual offline/online resync, and an explicitly injected quota-style storage failure/recovery. The user's ordinary browser journal is never used. No feed interception is used. Sampling has a hard deadline and each default output directory is timestamped. This is not an account/order test.

In this WSL environment the exact commands are (not run for 0.4.3):

```sh
# Short practical observation (75 seconds of sampling, plus bounded setup/resync).
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=smoke HYBRID_OBSERVE_SECONDS=75 node tests/browser-observe-context.cjs

# Start 1–3 minutes BEFORE 00:00 UTC; collects at least a minute after it.
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=midnight HYBRID_OBSERVE_SECONDS=420 node tests/browser-observe-context.cjs

# Separate, explicit one-hour sampling observation (not run in this increment).
LD_LIBRARY_PATH=/tmp/hybrid-qa-tools/libs/usr/lib/x86_64-linux-gnu NODE_PATH=/tmp/hybrid-qa-tools/node_modules HYBRID_OBSERVE_MODE=soak HYBRID_OBSERVE_SECONDS=3600 node tests/browser-observe-context.cjs
```

The midnight command outside its window writes **pending-window-unavailable** and exits without waiting all day. Smoke does not qualify as midnight/soak. Failed/unreached required windows are marked incomplete/partial. Sampling is restricted to 30–7,200 seconds with a setup/resync deadline of sampling plus 120 seconds. Tools under `/tmp` are temporary; opening the standalone app needs none of them. Actual UTC-midnight transition and a one-hour reconnect/storage observation remain pending.
