# Hybrid Terminal 0.4.9 successor candidate — not integrated

**Current direction and task order:** read the CURRENT sections of [STATUS.md](STATUS.md). This branch contains the isolated volume-pane / responsive-legend successor to the preserved 0.4.8 Help candidate (`30432aba73c3b6a5112999f2d0448e9835dfdeaa`). The authoritative WSL root stays on clean published **0.4.7**, SHA-256 `4bafacddf8d726fc48601471c7a7fe713c2fb2038f0908264131ba864f7aa8e8`, through the independently scheduled midnight observation. Do not switch that root or merge this candidate before actual source-specific evidence is reviewed (or a separate decision if the observation cannot run).

Open `hybrid-terminal.html` directly in a modern browser. It is the authoritative standalone vanilla JavaScript/Canvas app. No build, backend or application dependencies. Binance spot REST/WebSocket access is needed. Markets remain BTCUSDT / ETHUSDT / SOLUSDT and chart timeframes remain 5m / 15m / 1h / 4h.

Chart/header/inspector text is English; the analysis panel is Hebrew. Help offers Hebrew and English, with Hebrew on a fresh installation. On narrow screens the chart has its own usable height and the main area scrolls to the analysis panel.

## Reproducible QA and version control

Private repository: [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal). The [main CI workflow](https://github.com/artimeNFT/hybrid-terminal/actions/workflows/ci.yml?query=branch%3Amain) has verified remote runs; exact checkpoint/run evidence and the credential-storage follow-up are maintained in STATUS.md.

Use **Node.js 24** (`.nvmrc`). The standalone HTML needs no npm installation. For development/CI, the exact QA-only Playwright 1.64.1 and @napi-rs/canvas 1.0.13 versions and transitive integrity hashes are locked:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run qa:browser:install
npm run test:browser
```

`npm test` runs the active versioned source checks, nine deterministic app suites, the unchanged 18-case research / nine audit / nine contract / 13 preparation fixtures in an explicit frozen 0.4.3 context, and five presentation, six target-path, seven provenance/readability, seven planning-cost, six readability/Help and eight volume/legend checks. Browser QA runs eleven mocked Chromium scripts with synthetic REST/WebSocket fixtures, a guard rejecting unmocked external requests, and per-context traces. Test logs, screenshots, traces and manifests go to ignored `.qa-results/`. Open a trace with `npx playwright show-trace .qa-results/browser/browser-navigation/trace-1.zip`. Neither required CI group uses public Binance, acquired datasets, browser journals, credentials or WSL-specific paths. Legacy direct script commands remain available; the npm runner supplies nonhistorical output directories.

On a minimal **Ubuntu 24.04 x64 WSL host without passwordless sudo**, use `npm run qa:browser:local` instead of `qa:browser:install`. It installs the pinned Chromium and downloads/extracts the three missing Ubuntu NSS/NSPR/ALSA packages under ignored `.tools/browser-libs`; the runner discovers these local libraries. Other operating systems should use Playwright's normal dependency setup. This fallback requires Ubuntu apt metadata/access but no system writes. No old `/tmp/hybrid-qa-tools` package/library path is used by the normal QA runner.

Git tracks source, schema, tests, required baselines, documentation, package lock and small textual evidence. Acquired `research/datasets/`, dependencies/tools, release ZIPs and bulky generated browser artifacts remain on disk and are ignored. Frozen data and historical full-delivery manifests are provenance records; those full manifests require the retained local delivery and are **not** required checkout/CI checks. `npm run check:source` uses new `qa/source-checksums.0.4.9.json` for the active app, exact internal baseline, binding code and required tracked sources. The old `qa/source-checksums.json` remains an unchanged historical 0.4.3 manifest and is verified only in its explicit frozen context.

`.github/workflows/ci.yml` uses Node 24 / standard Ubuntu 24.04, separate bounded deterministic and Chromium jobs, push/PR targeting main and manual dispatch. Action versions are pinned to verified official release SHAs. Permissions are read-only; only failure diagnostics from `.qa-results/` are uploaded, retained for three days. Required checks do not deploy, schedule collection, enable auto-merge or configure paid runners.

**STATUS.md contains the only maintained task board. Every completed increment must update it.** Local test success and a local independent Python oracle are distinct from a GitHub Actions run and independent external review. Repository publication/remote run status and any remaining login action are recorded there.

## Isolated Volume / narrow legend successor — 0.4.9

Branch `candidate/volume-legend-0.4.9`, worktree `/tmp/hybrid-volume-legend-0.4.9`, based on exact published predecessor `30432aba73c3b6a5112999f2d0448e9835dfdeaa`. Predecessor 0.4.8 remains unchanged on its branch and is preserved internally as `baseline/hybrid-terminal.0.4.8.html` (`49267248f1808133c52e2331fa9d6f7b325be7580a71867177c5dd5d12323858`). Successor HTML SHA-256: `043f952a58166e5bdeced32efa2d38a5857c2166b009da9eeb4898f5d745b64a`. Both candidates remain **unmerged**. The authoritative root stays clean/published **0.4.7 / `4bafacddf8d726fc48601471c7a7fe713c2fb2038f0908264131ba864f7aa8e8`**; no root, timer, observer or wrapper change.

Default Volume height and automatic visible-bar scale retain the prior presentation until a control changes. Drag its divider, or use **Display → Volume pane → Height**. The slider reports current pixels; the saved fraction adapts to the viewport. User resizing keeps at least 64px of Volume and, where space permits, 180px of price on wider plots / 160px on narrow plots, with a 60% pane ceiling. On the 280px narrow canvas that permits 64–82px Volume while retaining 160px price. Very short canvases clamp to the feasible legacy minimum; height adjustment may require closing Display or enlarging the window.

Drag/wheel the **Volume right axis**, or enter a positive **Ceiling**, to scale Volume independently. Scale is linear and nonnegative, anchored at the visible **0** baseline. There is no vertical translation or independent time offset. Bars above the ceiling end at the top and carry a light ▲ cap; the pane title counts clipped bars. **Auto volume** fits visible bars and keeps pane height; double-clicking its axis also restores Auto. **Reset volume** restores default height and Auto. The main Reset retains its existing time/price behavior. Price-axis gestures outside the Volume axis remain unchanged. Horizontal pan/zoom/crosshair coordinates stay shared.

Volume settings use only `hybridTerminal.volumePane.v1` (schema 1): optional height fraction and absolute base-volume ceiling. Finite restored values are bounded (fraction 0.01–0.6; manual ceiling 1e-12–1e18); actual geometry applies tighter limits. Invalid saved bytes remain intact with defaults and a notice until explicit user input; storage failure is session-only. No automatic initial write or clearing of other preferences/journal. The settings also apply after symbol/timeframe changes; Auto volume refits that view. RSI keeps its prior height and 0–100 scale; None hides the lower pane without losing Volume settings. Empty/zero-size interactions are guarded.

All six indicator names, including **DO/DO***, now use measured spacing on narrow plots and wrap when needed. The desktop layout stays unchanged when it fits. Header height and daily-label clearance agree; price/time transforms are unchanged. A verified 320px interaction issue also needed a focused fix: crosshair inspector wrapping could move the canvas between pointer movement and pointer-down. Its current height is held while interacting with the chart, then normal wrapping is restored. Default layout is unchanged.

Hebrew Help now says **מכנה**, and QA-only emulated/physical-device wording is retained in evidence rather than user Help. Both languages explain the new controls. No relative-volume formula, feed, scoring/strategy, indicator arithmetic, backtest, journal or execution change. Eight focused cases, required local groups and actual raster/pointer/keyboard/touch-emulated checks at 1440/430/390/320px are recorded in `tests/results/volume-legend-0.4.9/`; raw screenshots/traces are in this worktree `.qa-results/volume-legend-0.4.9/browser-final/`.

The existing root observer's receipt says it finished at 2026-10-26 00:05 UTC with 420.006 seconds on 0.4.7 and raw rollover/pass flags. This task read that receipt only; **independent evidence review and acceptance remain pending**. It does not validate either candidate. Integration order and exact next action are in CURRENT STATUS: review actual root evidence, review predecessor then successor delta, reconcile newer main documentation on the successor, verify CI, then integrate the successor once when separately authorized. Do not merge both candidates independently or start the next feature automatically.

## Isolated readability and bilingual Help candidate — 0.4.8

Branch `candidate/readability-help-0.4.8`, internal worktree `/tmp/hybrid-readability-help-0.4.8`. Its `hybrid-terminal.html` is a preview candidate; it has **not** replaced the active 0.4.7 root. Candidate SHA-256: `49267248f1808133c52e2331fa9d6f7b325be7580a71867177c5dd5d12323858`. The existing timer, observer and wrapper remain unchanged and point at the authoritative root, not this worktree. No new schedule, live soak, dataset acquisition or research cohort.

Candles now names **Standard · Green ↑ / Red ↓**, **High contrast · Blue ↑ / Orange ↓**, and **PVSRA · Direction + volume**. The legend explains the selected mapping. Existing `standard` / `accessible` / `pvsra` option values, actual palette colors, High contrast default and saved selections are unchanged. Body remains an independent Filled / Hollow up choice; Filled remains the fresh default. Optional ◆ Vector / ● Rising volume tags remain available. User preference for Filled and useful vector tags does not silently reset saved choices.

Help starts with three workflow steps, followed by seven expandable references. Paired Hebrew/English facts cover feed health versus calculation coverage, confirmed/provisional and selection/tie policy, candle/body/volume meanings, navigation and Full/Focus/history, current indicators and UTC coverage, plan/ATR/R/target-path/sizing/cost assumptions, and journal/export/historical-simulation limits. Score counts are not probabilities; WAIT gets no fallback; TP1 is touch-only; decision-close planning differs from next-open simulation. Formulas and ordered input limits use isolated LTR spans in either language. Only Help changes language; chart/header remain English and panel Hebrew.

Help language persists only in `hybridTerminal.helpLanguage.v1` (`schemaVersion:1`, `language:he|en`). No automatic fresh-install write. Invalid saved data falls back to Hebrew with a notice and preserves stored bytes until explicit selection; unavailable storage is session-only. No other preference or journal key is cleared. Language and Start here buttons do not close the overlay. Explicit Close, backdrop and Escape close it; modal keyboard focus stays inside and returns to its opener. Expanded references survive language switching. Background controls are temporarily inert and their prior state is restored.

The countdown and DO/DO* already exist and were **not** duplicated or modified. Countdown uses candle end/server offset, and zero does not confirm closure. Partial-day DO* uses the first loaded open; it is not authenticated full-day coverage. Actual narrow fixture inventory found DO* legend x=342 outside a 304px price-header clip at 390px viewport; the desktop 968px clip contains it. The countdown appears while last price is in the plot and disappears with that price label when manually panned out. These are separately recorded visibility limits, not fixes or live-midnight acceptance.

Checks/evidence: `tests/results/readability-help-0.4.8/`; ignored actual desktop/narrow images/traces in the candidate worktree `.qa-results/readability-help-0.4.8/browser-focused/`. Existing calculations, palette values, feed/chart drawing, execution/backtest/sizing/journal and frozen research remain unchanged. Exactly 98 prior function bodies are source-identical; only the existing legend renderer changes. The previous blanket Help button-close setup is replaced by new focused Help functions. Integration is a separate later action recorded in CURRENT STATUS.

## Optional plan cost / stop-gap scenarios — 0.4.7

Expand **עלויות ופער סטופ · תכנון בלבד · אופציונלי** below an existing eligible confirmed plan. It is closed by default and absent for WAIT or invalid plan geometry. Inputs are total round-trip modeled fee (default **10 bps**), total adverse entry/exit slippage (default **0 bps**), both based on decision-close entry notional, and adverse opening-gap shock beyond the stop (default **0 bps**), based on stop notional. These are user assumptions, not verified account costs. Software input bounds are 0–100 fee bps, 0–100 slippage bps and 0–1,000 gap bps; these are guards, not estimates of plausible market costs or maximum real losses.

For confirmed entry E, stop S, TP2 T, D=abs(E-S), and d=+1 LONG / -1 SHORT: F=E*(feeBps+slippageBps)/10000 and G=S*gapBps/10000. The three hypothetical outputs are net TP2 R=(d*(T-E)-F)/D, ordinary-stop R=-1-F/D, and gap-stressed stop R=-1-(F+G)/D. A gap is adverse below the LONG stop or above the SHORT stop; zero gap gives ordinary-stop R. Blank, nonfinite, negative, excessive inputs or invalid geometry yield no numeric scenario. Values are rounded only for display.

This is decision-close planning, not executable prices or historical results. The existing backtest enters at the **next open**, so it is not numerically identical to this card. TP1 remains a **touch statistic**, not a partial exit. SHORT remains research/simulation, not an approved Spot short order. The fixed 0.1% baseline costR, gross RR, nominal sizing, strategy, execution and journal remain unchanged. Assumptions persist under a separate `hybridTerminal.planningCosts.v1` key only after valid user edits; old preferences and journal bytes are preserved. Invalid saved assumptions require explicit correction/reset; storage failure keeps current inputs session-only. Provisional prices and chart interaction do not move the confirmed anchor.

Evidence: `tests/results/planning-costs-0.4.7/`, with inspected synthetic-feed Chromium desktop/narrow screenshots under `.qa-results/planning-costs-0.4.7/browser-focused/`. The exact pre-edit 0.4.6 is internal `baseline/hybrid-terminal.0.4.6.html` (SHA-256 `7c12ba003d8a03bff8322c7d9143c8bc926aa6847b62dbaf065d80b3d55e5195`). Tonight's existing 420-second midnight timer is independent and unchanged; its actual loaded source governs attribution. Scheduled is not accepted. No new cohort, acquisition, live hour soak or physical-device test was run.

## Decision-data provenance and chart readability — 0.4.6

The confirmed decision identifies its actual symbol/timeframe, participating closed-candle count, first input candle **open** time in UTC, and confirmed decision **close** time in UTC. This reads the existing confirmed calculation prefix, including WAIT; it does not change its length, EMA/ATR/RSI initialization or decisions. The expandable explanation distinguishes the calculation window from **History +1,000**, which loads older chart-only candles and can give chart indicators an older origin. Feed health remains a separate status. Counts/origin are not a convergence, full-warm-up or fixed-origin research-equivalence claim; the finite BTCUSDT 5m audit does not establish 15m equivalence.

**Display → Annotation density** defaults to **Full**, retaining the existing M/W annotations. **Focus** displays only the latest active confirmed M and W known at the confirmed chart index (if within the viewport). It filters text annotations only: confirmed decisions, plan/SL/TP lines, current price, other layers and exact level inspection remain available under their existing layer controls. Return to Full at any time. This optional preference persists alongside existing display preferences, preserving unrelated stored fields and journal bytes.

Daily UTC status and chart-facing/nearest level prices are concise. Open **Details · exact values**, or the Hebrew nearest-level price/source details, for exact unrounded computed values and validity. Colliding labels can share a display box marked `distinct`; their underlying values stay separate. Display rounding does not merge levels or snap them to exchange order ticks.

Evidence: `tests/results/provenance-0.4.6/`. Current desktop/narrow screenshots use synthetic feed fixtures. Exact pre-edit 0.4.5 is retained internally as `baseline/hybrid-terminal.0.4.5.html`, SHA-256 `ec03f24021ac71008ee8196927c2c188b98c9bf0105e89f7e25902c951f561ba`. Historical 0.4.4 soak acceptance does not automatically validate 0.4.6 and is not repeated. Tonight's separate 420-second actual-window observation records the then-active settled root version/hash; scheduled/observed status and the exact next action are maintained in CURRENT STATUS.

## Confirmed-plan target-path context — 0.4.5

The existing eligible confirmed plan contains **רמות בדרך ליעד**: up to three directional price groups strictly between plan entry and TP2, followed by expandable remaining rows, endpoints and source coverage. Rows distinguish before TP1 / exactly TP1 / between TP1 and TP2, with distances from entry in percent, confirmed ATR and R (`abs(entry-stop)`). Invalid denominators disable only their own metrics. Equal prices share labels; distinct values never merge because of rounding. Summary prices are compact unless they need exact disambiguation; precise prices remain in details/tooltips.

Sources are existing validated PDH/PDL/PP/R1/S1 and confirmed EMA50/EMA200/UTC VWAP. Day levels and Pivots retain their independent toggles; EMA/VWAP follows its existing layer. Missing, disabled, loading, invalid and partial UTC-day VWAP are excluded and disclosed. No rows among available references is not a clear-path claim. EMA/VWAP are decision-time references rather than fixed future barriers. This geometry adds no score votes or measured resistance/probability.

The anchor includes confirmed close/time, plan/ATR, symbol/timeframe/epoch and valid daily context. Provisional price, crosshair, chart pan/backfill and manual chart scaling do not move it. Source validation may complete asynchronously for that same context; obsolete symbol/timeframe responses remain rejected by existing request guards. WAIT has no substitute plan or path. The existing nearest-day-level card remains separate and unchanged; no chart lines or feeds were added.

Evidence: `tests/results/target-path-0.4.5/`. Current actual Chromium desktop/narrow screenshots use synthetic feed fixtures and an explicitly isolated partial-coverage fixture. Internal `baseline/hybrid-terminal.0.4.4.html` preserves the prior accepted source (`f89f6f…`). Its one-hour soak and user desktop-readability acceptance stay attributed to **0.4.4**, not the changed 0.4.5 HTML. The hour soak is not automatically repeated. Future 420-second midnight acceptance must record the exact application version/hash actually loaded; physical touch and user acceptance of the new section remain pending.

## Presentation release candidate 0.4.4

The primary Hebrew panel shows existing feed health, the latest confirmed UTC/local close, LONG/SHORT/WAIT and its main reason first. The eligible confirmed plan follows; WAIT has no substitute plan. Stop/TP1/TP2 distances use the **confirmed decision's ATR**, alongside prices, percentages and gross RR. Modeled cost in R is `0.001 * decisionClose / abs(decisionClose - stop)`, the existing 0.1% entry-notional round-trip assumption. It is neither verified account fees nor total execution cost; it does not change nominal sizing or backtest deductions. Missing/zero/nonfinite inputs display unavailable.

Candles, independent Body and critical chart navigation remain accessible. **Display** groups layers, Pane, Day levels/Pivots, timezone and volume tags. Candidate diagnostics, confirmed context, historical statistics/recovery and cash assumptions expand on demand. Dynamic detail expanders retain their open state across feed redraws. The provisional card is separate and marked temporary; it never supplies confirmed plan coordinates. The journal/export remains directly accessible. Existing preferences/records/IDs, rules, execution, palettes, symbols and timeframes are preserved; that presentation increment advanced application metadata to 0.4.4; target-path was 0.4.5; provenance/readability was 0.4.6; planning-cost was 0.4.7; the isolated Help candidate is 0.4.8 and is not integrated.

The 0.4.4 Chromium screenshots cover WAIT, eligible-plan, unavailable and provisional states at desktop and 390px touch-emulated widths. Feed data is synthetic. A later one-hour actual soak and user desktop-readability acceptance apply specifically to 0.4.4; separate midnight and physical acceptance remain pending. Evidence: `tests/results/0.4.4/`; screenshots are local under `.qa-results/browser/browser-presentation/`.

## Frozen research source context

The only active application is the root HTML. Exact reviewed **0.4.3** bytes are preserved internally as `baseline/hybrid-terminal.0.4.3.html` (SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`). Historical research modules/declarations/seals/payloads and their old hash checks remain unchanged.

Use the explicit process-local source runner below. It maps only historical logical reads of root HTML to that verified immutable reference, logs its new binding/loader identities, and reports the actual active-app hash separately. Other reads/writes are unchanged. Direct historical adapters against the new active HTML still reject the old hash; there is no accepted-hash expansion or new calculation engine. Details: `research/source-context/README.md`.

```sh
# Source-only verification; no acquired dataset required.
node research/run-frozen.cjs check
# Optional read-only verification of existing local original artifacts; no regeneration.
node research/run-frozen.cjs check --preparation-output .qa-results/preparation-v1/q3-v1 --audit-output .qa-results/calculation-readiness-v1/q3-audit.json
```

The historical reproduction commands below use this context. They document old studies, not permission to generate new cohorts or resume deferred research. Required CI uses compact synthetic fixtures, and the active app/browser suites run outside the frozen context.

## Outcome-blind episode and matching preparation 1.0.0

`research/preparation/protocol.json` declares the exploratory all-eligible-zone V/C preparation and **one** fixed greedy matching design. This changes the estimand from the live nearest-zone policy. The separate tool uses actual full-prefix app calculations under accepted contract 1.0.0 and never resolves outcomes or reads a next-open execution price. The frozen 0.4.3 research reference, CLI/data/audit/contract remain unchanged; the active presentation version is separate.

```sh
# Existing local frozen data; fresh ignored output directory, no acquisition.
node research/run-frozen.cjs prepare seal --out .qa-results/preparation-v1/q3-new
node research/run-frozen.cjs prepare benchmark --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/preparation-v1/q3-new
node research/run-frozen.cjs prepare run --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/preparation-v1/q3-new
node research/run-frozen.cjs prepare verify --out .qa-results/preparation-v1/q3-new
npm run test:preparation
```

Full features/pairs/day spans and runtime metadata remain ignored; tracked compact evidence is in `tests/results/preparation-v1/`. Method, symmetry/equality/exclusion order, exact matching/ties, fixed pre-match SMD denominators, missing states, resource bounds and limits: `research/preparation/README.md`. A poor match or residual imbalance is a finding; no automatic retuning or inference is performed. Focused independent engineering/fixture/pair review is recorded in STATUS; comparison/inference suitability remains unresolved. Further research diagnostics and outcomes are deferred under the current product roadmap. Q3 is exploratory, not an untouched holdout.

## Offline calculation contract 1.0.0

The next bounded contract is now predeclared in `research/contract/v1.json`, with assumptions and exclusions in `research/contract/README.md`. It requires full past-prefix replay from the frozen July 1 origin, excludes the first 3999 candles, preserves actual validity/undefined states, requires actual UTC day-open coverage, and allows zero same-origin replay differences for each feature/state/decision. The 4000-bar preparation rule is not a convergence claim. EMA800 remains context-only. M/W resumption recomputes all pivots from the original prefix; recent-event lists and rolling caches are not accepted retained state.

```sh
node research/run-frozen.cjs contract
npm run test:contract
```

These commands check the declaration/pinned sources and synthetic policy fixtures without acquired data or application bootstrap. The frozen 0.4.3 research reference, CLI 1.0.1/schema 1, audit and frozen data are unchanged. Focused independent acceptance is recorded in STATUS; the frozen contract JSON retains its original predeclared status/identity. The separate preparation above uses this finite-origin reference without changing live gates. STATUS remains the only maintained task board.

## Offline calculation-readiness audit 1.0.0

This separate audit measures **history-origin sensitivity and decision-time causality**, using the actual reviewed app calculation functions through a controlled adapter. It does not execute application bootstrap, storage, `calc()` or backtest, duplicate indicator formulas, generate episodes/outcomes, or change live strategy policies. The frozen 0.4.3 research reference and CLI 1.0.1/schema 1 remain unchanged.

```sh
# Existing local dataset only; no acquisition. Use a fresh output name each run.
node research/run-frozen.cjs audit --dataset research/datasets/btcusdt-5m-2026-q3.json --out .qa-results/calculation-readiness-v1/q3-new.json

# Compact synthetic fixtures; no acquired dataset or public market access needed.
npm run test:audit
```

The real-data command first applies CLI 1.0.1 schema/hash/quality validation to the complete 26,496-row BTCUSDT 5m Q3 dataset. `research/audit/protocol.json` predeclares 24 UTC decision-close timestamps and 60/100/300/1000/2000/4000-bar windows. Every decision compares the longest available past-only prefix to each trailing origin; same-origin future appends are tested separately. Full local JSON/Markdown are written exclusively under the chosen output path; compact findings and a concise warm-up report are tracked in `tests/results/calculation-readiness-v1/`.

Observed at the 24 fixed points: 60/100-bar windows changed component votes at 6/2 points, with no action-side/eligibility flips; plan prices changed at five points in each short window. The 300-bar plan flag is only tiny RR drift. At 1000+ bars, sampled score/plan/target/MW results matched the finite longest reference, while EMA800 still drifted even at 4000 (max 0.053216 price / 0.001574 reference ATR). **EMA800 is context-only.** Five hundred same-origin future-append checks had zero differences. The nine synthetic audit fixtures include an actual old-target LONG/WAIT origin disagreement and flat-tail RSI availability drift, so neither the real sample's side agreement nor a 1000-bar core-input candidate is a universal guarantee.

See `tests/results/calculation-readiness-v1/REPORT.md`, `findings.json` and `research/audit/README.md` for per-feature availability/error units, timestamp-aligned examples, source/data identities, projection assumptions and provisional warm-up guidance. The longest history is a reference, not absolute convergence. The focused independent adapter/protocol check and finite-origin contract acceptance are recorded in STATUS. Outcome-blind episode/matching preparation 1.0.0 has since been delivered; its limited retained sample does not establish trading performance. Current task order is maintained only in STATUS. `npm test` and the deterministic Actions job include the synthetic audit group.

## Frozen research data — tool 1.0.1 / schema 1

CLI **1.0.1** fixes the externally reproduced timeframe-validation defect: only primitive strings `5m`, `15m`, `1h`, `4h` are accepted through an own-key check. Inherited names and coercible non-strings fail before acquisition filesystem/network activity. Valid 1.0.0 datasets/checkpoints remain compatible; malformed payloads are rejected for both producers even if rehashed. Schema 1 and valid-data hashes are unchanged. See `research/SCHEMA.md` and the resolution/evidence on STATUS's single task board.

`research/klines.cjs` is a separate dependency-free Node.js >=22 command-line tool. **The internal frozen research HTML is byte-for-byte 0.4.3**, SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`. The CLI never imports the terminal, chart cache, indicators or journal. It acquires public Binance Spot klines, preserves all 12 fields and decimal-string precision, validates closed UTC coverage, saves immutable outputs and independently reloads/verifies them offline. Tool/schema are versioned separately from the app.

The actual acceptance dataset, retained locally and intentionally excluded from Git, is `research/datasets/btcusdt-5m-2026-q3.json`: **complete, 26,496 rows, zero gaps/duplicates/conflicts**, coverage **[2026-07-01T00:00:00Z, 2026-10-01T00:00:00Z)**. Canonical data SHA-256: `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`. It was acquired from the official public market-data-only host, offline validated and independently checked with Python stdlib JSON/SHA256/Decimal/grid QA. Two separate 288-row July 1 acquisitions have identical canonical data hashes; that sample also matches the corresponding Q3 rows. These are engineering checks, not strategy evaluation or trading-advantage evidence.

Run from the project root. A fresh Git checkout does not include acquired datasets; acquire or restore them before optional offline/full-delivery validation. The first command intentionally uses a **fresh output path** for reproduction; existing frozen files are never overwritten:

```sh
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json

# After Ctrl+C/network failure: identical configuration/output, plus --resume.
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json --resume

# Offline, using the frozen dataset delivered here:
node research/klines.cjs validate --file research/datasets/btcusdt-5m-2026-q3.json
node research/klines.cjs compare --first research/datasets/btcusdt-5m-2026-07-01-repeat-a.json --second research/datasets/btcusdt-5m-2026-07-01-repeat-b.json
npm run test:research
node scripts/check-source.cjs
```

To repeat the small check with a fresh file, use the acquisition command with end `2026-07-02T00:00:00Z` and a new output name, then compare with `research/datasets/btcusdt-5m-2026-07-01-repeat-a.json`. If `data-api.binance.vision` is unavailable, an explicit `--base-url https://api.binance.com` is supported; a resumed acquisition must keep its original host.

Adjacent `.checkpoint.json` files are resumable work states, **not frozen datasets**; the offline dataset validator rejects them. Request timeout is 15 seconds, pages at most 1,000, retries at most three, with pacing, Retry-After and immediate HTTP 418 stop. Missing/developing rows remain gaps and produce `incomplete`; invalid/conflicting source pages block and remain in checkpoint evidence. Exit 0 means complete/identical, 2 valid incomplete/different, 1 error/invalid, 130 cancelled. See `research/SCHEMA.md` for exact field order/units, canonical bytes, precision/quality rules, rate policy, lock recovery and resource bounds. Data hashes exclude volatile acquisition metadata; file checksums protect delivered bytes separately. `RESEARCH_DATA_SHA256SUMS.txt` and earlier delivery manifests remain historical **1.0.0** records; use the reviewed historical commit/original delivery to check them. Current active-app checks are `qa/source-checksums.0.4.6.json` via `npm run check:source`; the original `qa/source-checksums.json` remains historical; CLI 1.0.1 source/test/schema checks are also recorded in `qa/research-cli-1.0.1-sha256.json`.

Evidence and provenance: `tests/results/research-data-v1/`, `SOURCE_PROVENANCE.md`, `STATUS.md`. The CLI 1.0.1 increment changed no app dependency, UI, strategy, research-snapshot export, archive ingestion, indicator or paper-trade feature. Prior app browser/live evidence remains historical; no new UTC-midnight or long-session observation was performed.

## Chart navigation — 0.4.3

Drag inside the main price plot to move candles with the pointer vertically, or diagonally to move time and price together. The price span stays constant. Translation uses the original bounds and plot height: `shift = dy * (hi0 - lo0) / ph0`, then `[lo0 + shift, hi0 + shift]`; offsets never accumulate from an already shifted range. Vertical positioning activates after **4 CSS pixels** and at least **10% of horizontal displacement**, then remains active until release. Clicks/jitter and nearly horizontal drags retain automatic price fitting. Horizontal panning also has a 4-pixel dead zone. A pure vertical drag retains the existing follow-live state.

Only a gesture starting in the main price plot can translate price. Volume/RSI gestures pan time only, even if the pointer later enters the price plot. Price-axis drag/wheel still scales price; time-axis drag and plot wheel still zoom time. Single-pointer mouse/touch capture survives leaving the canvas; release, cancellation or lost capture ends the gesture. Invalid bounds, empty data and zero-sized plots cannot initiate price translation.

Manual price positioning survives developing and confirmed feed updates. **Live / End** returns to latest time and retains manual price position. **Auto scale / Escape**, or double-clicking the price axis, restores automatic price fitting. **Reset**, or double-clicking the plot, restores 150 bars, latest time with the existing 18-bar right margin, and automatic price fitting. With chart focus, **Up/Down** moves candles by 10% of the price-plot height; Left/Right, Home and +/− keep their existing actions. Keys outside chart focus retain page/input behavior. Viewport positioning is session-local, as before; reload/market/timeframe changes retain the existing reset behavior.

Baseline 0.4.2 is preserved as `baseline/hybrid-terminal.0.4.2.html` (reviewed SHA-256 `d91b92a0105e4c35aa8357d19ac123a2c73918cf093a7e905b1aa4941df7b6ed`). Current source hash, exact performed checks and limitations are in STATUS; evidence is under `tests/results/0.4.3/`. That historical increment changed navigation only; strategy, backtest, day context, preferences and journal semantics were preserved. No dependencies added.

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

`browser-smoke` and `browser-increment` use actual Chromium/Canvas with synthetic/mocked feed data. `browser-live` and `public-feed.py` access actual public Binance data. Current navigation rechecks are under `tests/results/0.4.4/`; original 0.4.3 navigation, 0.4.2 day-context and 0.4.1 integrity results remain historical evidence. `browser-navigation` verifies actual candle pixels after mouse gestures and Chromium touch emulation; its feed is synthetic, with no physical-device or actual live-stream claim. `browser-integrity` uses controlled synthetic candidates/outcomes and downloads real JSON files; its clipboard is a test double. `browser-live-close` makes no feed interception and stops after one actual 5m close or a bounded timeout. Earlier release QA used temporary packages/libraries under `/tmp/hybrid-qa-tools`; that historical setup is not needed by the locked npm QA commands above. The retained observation commands below describe prior runs and remain outside required CI. Opening the standalone app needs no QA packages.

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

The one-hour soak is accepted for exact 0.4.4 source `f89f6f48a725d3f3e354a651b7a627e60ad7c1270105f6936b44803030f51cfa`; retain its original evidence. Separate midnight/physical acceptance remains pending. For a later application version, record the actual tested hash and never transfer old acceptance. Tonight's authorized one-shot midnight invocation uses the existing observer against the then-active settled root; see CURRENT STATUS for the native timer and evidence location. Do not automatically repeat the hour soak. With the locked QA installation on this WSL host, use these existing tools (the Display-group access was adapted; no observation was run in this presentation increment):

```sh
# Short practical observation (75 seconds of sampling, plus bounded setup/resync).
LD_LIBRARY_PATH="$PWD/.tools/browser-libs/root/usr/lib/x86_64-linux-gnu" HYBRID_OBSERVE_MODE=smoke HYBRID_OBSERVE_SECONDS=75 node tests/browser-observe-context.cjs

# Start 1–3 minutes BEFORE 00:00 UTC; collects at least a minute after it.
LD_LIBRARY_PATH="$PWD/.tools/browser-libs/root/usr/lib/x86_64-linux-gnu" HYBRID_OBSERVE_MODE=midnight HYBRID_OBSERVE_SECONDS=420 node tests/browser-observe-context.cjs

# Historical hour command; do not repeat the accepted 0.4.4 soak automatically.
LD_LIBRARY_PATH="$PWD/.tools/browser-libs/root/usr/lib/x86_64-linux-gnu" HYBRID_OBSERVE_MODE=soak HYBRID_OBSERVE_SECONDS=3600 node tests/browser-observe-context.cjs
```

The midnight command outside its window writes **pending-window-unavailable** and exits without waiting all day. Smoke does not qualify as midnight/soak. Failed/unreached required windows are marked incomplete/partial. Sampling is restricted to 30–7,200 seconds with a setup/resync deadline of sampling plus 120 seconds. Outputs default to ignored `.qa-results/observations/` with source hash and actual runtime version tags; opening the standalone app needs no QA tools. Separate 420-second midnight-mode acceptance remains pending. The existing observer records the actual source/runtime version; only the exact 0.4.4 source has the accepted hour soak.
