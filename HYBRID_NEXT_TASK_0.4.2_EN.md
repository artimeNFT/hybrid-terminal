# Hybrid System — next task: UTC day levels and a concise context card

Date: 2026-10-24, Asia/Jerusalem. Proposed application increment: 0.4.2.
Authoritative local project: /mnt/c/Users/shlom/Desktop/THE hybrid-terminal.

## Review receipt for 0.4.1

The reviewer inspected the supplied HTML, STATUS, README, provenance, checksums and diff. Actual HTML SHA-256 matches:

7ebb7bf88cc2721722b5e4d6769a6938a5b48478f03452919e50259f2512caf4

The supplied diff's additions/deletions match the actual difference from the known 0.4.0 baseline. Independent isolated synthetic probes confirmed:

- Empty/all-zero/no-loss/all-loss/mixed statistics states, plus unavailable invalid outcomes.
- The reviewed 10x nominal sizing case is explicitly unaffordable with 1,000 USDT assumed cash; executable quantity remains null.
- Flat zero-volume data yields no vectors, unavailable RSI, zero ATR and invalid actionable state.
- The reviewed tie remains WAIT, with the eligible LONG and legacy-policy suppression now exposed.
- 3,360 ordinary valid decisions across four synthetic datasets and thresholds 3/4/5 match 0.4.0 in side, score, chosen direction, items and plan.

These are independent mathematical probes, not a rerun of the seven local suites or browser/live-feed QA. The actual 5m close is reported in STATUS; its raw evidence files were not attached to the reviewer. UTC rollover and long reconnect/storage behavior remain pending. This receipt does not establish profitability or full TR_MAIN parity.

## Execute this bounded task

Inspect applicable AGENTS.md, current README/STATUS, source and existing tests. Continue from the actual latest source, preserving newer work if any. If still on the reviewed 0.4.1, preserve an immutable pre-edit baseline. Keep this work inside Hybrid, separate from VECTOR LAB. Deliver a working, tested increment rather than only a plan; routine reversible implementation is already authorized.

Add **PDH / PDL** (previous UTC day's high/low) and a compact Hebrew **nearest-level context card**. This should improve market orientation without changing any strategy decision, execution assumption or probability claim.

### 1. Complete-day data and validity

Use complete previous UTC-day Binance Spot daily klines, reusing the existing proven daily-data path where practical. Do not approximate a complete day from the first loaded intraday slice.

For source day D:
- PDH = source daily high; PDL = source daily low.
- Source day must be complete and valid.
- Values apply only during the following UTC day, with explicit [validFrom, validTo) timestamps.
- Missing, incomplete, duplicate, failed or obsolete inputs remain unavailable. Do not silently reuse another day's levels.

Share caching/request logic with pivots without making PDH/PDL depend on Pivots being visible. Either feature must work independently. Keep bounded pagination, source validation, trusted UTC-clock requirements, symbol/timeframe/range/epoch guards and disable/reenable race protection. Avoid duplicate daily requests and broad unrelated refactoring.

At rollover, a delayed daily response must show loading/unavailable for the new period, not relabel stale values as current.

### 2. Chart controls and rendering

Add an independent English **Day levels** control for PDH/PDL; preserve its state through the existing preference scheme without clearing unrelated fields. Existing Pivots remains independent.

Render day-bounded segments and readable PDH/PDL price labels. Use line style/text as well as color. Preserve the user's bright PVSRA + Hollow up option, other palettes and filled bodies.

Prioritize labels for the active/inspected day; use deterministic placement when PDH, PDL and PP/R1/S1 overlap. A compact merged label or an explicit overflow/inspector treatment is preferable to overlapping unreadable text. Keep labels inside the plot and avoid covering candles unnecessarily. Off-screen levels should not force a large automatic price range or create many distant labels.

History panning should retain the relevant historical daily segments and crosshair source/validity information. Existing right-side empty space, follow-live and navigation behavior must remain usable. Do not turn chart panning into research replay.

### 3. Hebrew context card

Show at most the nearest valid enabled level above and below the latest confirmed price, using PDH/PDL and the existing PP/R1/S1 when their respective layers are enabled. If price equals a level, identify that state. If no valid candidate exists on one side, show unavailable explicitly.

For each shown level:
- Name and price.
- Absolute distance, percentage of confirmed price and distance in ATR, only with finite positive denominators.
- Source UTC date and the as-of time used to select its valid period, in concise expandable detail.

Anchor this card to the **latest confirmed close timestamp** and its known price/ATR, not the developing candle or mouse position. At an exact UTC midnight close, the new day's valid period begins; the just-completed day's source may be used only once validated as complete. A source response that has not arrived is not known data. Define this boundary explicitly and test it.

Make clear that the card is reference context, not a target forecast or additional score vote. The confirmed/provisional distinction and existing LONG/SHORT diagnostics remain intact.

If all context layers are disabled, offer a concise explanation rather than inferring hidden signals. Keep chart/header/control/inspector text English and right panel/Help Hebrew.

### 4. Invariance and preserved behavior

Preserve:
- BTCUSDT/ETHUSDT/SOLUSDT and 5m/15m/1h/4h.
- Rule version hybrid-v2-validity-closed and unchanged default selection, thresholds, plans and confirmed decisions.
- Execution version ohlc-market-stop-v2-gap-open and baseline fee assumptions.
- RSI policy, statistics states, nominal sizing/cash labels and research export.
- Existing journal IDs/content/signatures, retention/export, safe storage behavior and display preferences.
- Existing complete-day pivots, chart-only older history, source/mode labels and feed guards.

This increment introduces reference context only. Do not add sessions/Psy/ADR approximations, MACD, OI, probabilities, broker orders, API secrets, a backend or runtime framework. Exact TR_MAIN settings parity remains a separate comparison.

### 5. Verification and outstanding reliability observations

Add focused regressions for:
- Known PDH/PDL values and distinct consecutive-day segments.
- Partial/missing/invalid daily sources and clock unavailability.
- Exact midnight boundaries, including a close before the next opening-bar update and delayed daily responses.
- Independent Day levels/Pivots toggles, preference restoration and stale symbol/timeframe/range responses.
- Nearest above/below/equal cases, unavailable ATR and historical panning.
- Unchanged signals/backtest/journal when context layers are toggled or daily responses arrive.

Run the existing required suites and focused desktop/narrow browser checks. Inspect label collisions with deliberately close PDH/PDL/pivots. Test actual canvas interactions, not just DOM text. No application dependency is required.

Keep UTC rollover and long-session reliability as explicit separate observations. Prepare or reuse a bounded observation test that records source hash, UTC and IANA Asia/Jerusalem timestamps, last/first daily segment, completed-candle journal counts, disconnect/resync and local-storage failure/recovery states. For storage-failure fixtures, isolate the origin/profile and preserve the user's actual journal.

Run a practical bounded live check if the relevant window is available; terminate it after the defined window. If actual midnight or the long-session duration is not reached, report it as pending and provide the exact reproduction command. Passing deterministic fixtures is not evidence of a live midnight transition. Use real timezone conversion rather than a fixed Israel UTC offset.

### 6. Deliver and stop

Deliver updated authoritative HTML, preserved 0.4.1 baseline, appropriate tests/evidence, and concise README/STATUS/provenance/checksum updates. Preserve historical release files and prior evidence.

Report what the user can now see, the actual checks performed, and remaining limitations. Separate implemented behavior from observed live behavior. Do not claim execution readiness, profitable edge or Pine parity.

Stop after this context increment. Later work remains a separate paper-trade lifecycle and reproducible longer-history research engine, followed by evidence-based evaluation of additional features.

