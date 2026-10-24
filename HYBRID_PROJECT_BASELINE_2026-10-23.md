# Hybrid System Terminal - Project Baseline

Date: 2026-10-23 (Asia/Jerusalem)
Status: takeover assessment and proposed delivery plan; original application is unchanged.

## 1. Product objective and ownership

Build a practical decision-support terminal based on the Traders Reality Hybrid framework. Reduce manual chart inspection, make calculations and context explicit, support consistent risk planning, and record decisions for review. Quantify possible statistical advantages where the data supports them.

The user does not require advance knowledge of price or an ability to beat every other trader to information. A useful outcome can include faster, clearer, more consistent decisions. Financial advantage must be measured separately from workflow improvement.

This is a separate project from VECTOR LAB: separate repository or project root, instructions, task threads, changes, datasets, outputs, and acceptance history. Do not modify VECTOR LAB as part of this project. Claude or another model may provide external review when needed; its claims remain subject to evidence and independent verification. User-facing discussion is in Hebrew; implementation specifications and technical handoffs are in English.

This document is a proposed operational baseline, not a claim that a ChatGPT project, local repository, or folder connection has been created.

## 2. Inputs reviewed

- `hybrid-terminal(1).html`: single-file vanilla JavaScript/canvas application, 27,053 bytes. SHA-256: `88bbfd418aeddb437240f517173d4581badda8f45ef8100c240555efafc3d533`.
- `HYBRID_TERMINAL_NOTES.md`: initial author handoff, logic specification, validation claims, and roadmap.
- The user's pasted author response and stated product objective.
- Public Traders Reality library documentation, TR_MAIN description, course overview, and the 18-page Hybrid learning PDF, including selected chart illustrations.
- Official OpenAI documentation concerning projects, local directories, CLI/IDE access, cloud environments, and parallel worktrees.

No application files were changed during this assessment. No historical market profitability test or live feed acceptance test was performed. The author's Python comparison code and original test outputs were not supplied.

Access limitations: the individual course lesson redirected to the membership-gated course page; full lesson videos were not inspected. YouTube playlist contents could not be retrieved. The exact community Blueprint/Hybrid Trailing Stop script was not identified from the supplied description. These sources must not be represented as fully reviewed.

## 3. Feasibility assessment

| Outcome | Assessment | Acceptance basis |
| --- | --- | --- |
| Reliable indicator and chart workspace | Technically feasible | Reference-data comparisons, deterministic calculations, live data integrity checks |
| Clear context and risk workflow | Technically feasible | Explicit inputs, explanations, stable plans, usability checks |
| Reproducible historical research | Technically feasible after engine repairs | Causal replay, preserved data/configuration, realistic execution assumptions |
| Measurable improvement in decision workflow | Testable | Compare decision time, omissions, and rule adherence against the user's current process |
| Positive trading expectancy | Unknown | Out-of-sample and forward evidence after costs |

Do not make product completion depend on finding a profitable strategy. Conversely, a working interface is not proof of financial advantage.

## 4. Current implementation and interpretation

The application requests Binance spot OHLCV for BTCUSDT, ETHUSDT, and SOLUSDT on 5m/15m/1h/4h, initially 1,000 candles, then maintains a rolling window capped at 1,200 candles. It includes PVSRA-style coloring, vector zones, EMA13/50/200/800, daily UTC VWAP/open, ATR14, RSI14, approximate stopping-volume and M/W detection, a signal checklist, a backtest, position sizing, notifications, and a report.

Its signal model is one particular vector-recovery/reversion hypothesis. Its thresholds and pattern definitions are author-selected approximations. It does not establish a complete mechanical specification of the Hybrid method. Several plotted indicators do not participate in its signal decision. The higher-timeframe trend is informational only.

Documented PVSRA thresholds are consistent at the rule-description level with the public library description. Exact parity with a selected Pine version, feed, initialization, and edge cases remains an acceptance task.

The source material supports studying environment, moving-average extension, vector recovery, stopping-volume candles, and M/W structures. It does not provide the complete executable entry/exit rules used in this application or a reproducible performance study validating those rules. Claims about market-maker intent or inevitable vector recovery must be treated as interpretations or hypotheses. OHLCV alone does not identify a particular participant's inventory or intent.

## 5. Confirmed findings and corrections to the handoff

### F01 - Historical M/W calculations can change after future candles are appended

In `calc`, confirmed swing points are compressed using the complete dataset. A later, more extreme swing of the same type can replace an earlier swing, changing historical M/W structures consumed by `sigAt`.

A constructed test using the actual calculation functions found an M at index 90 when the dataset ended at index 93. Appending candles through index 119 removed that M. Recomputing the signal checklist for index 93 changed its score from 1 to 0. This demonstrates a historical consistency defect; it does not measure its frequency or profitability impact in real markets.

The handoff's blanket assertion of no look-ahead is therefore not accepted. A three-bar pivot confirmation delay does not by itself solve this later replacement problem. Preserve each event's formation time, confirmation time, and subsequent state changes without rewriting earlier decisions.

### F02 - Live signals use developing candles while historical entries use completed candles

The WebSocket handler discards Binance's closed-candle flag, and `calc` evaluates the latest developing candle. Historical evaluation uses completed OHLCV and enters at the following open. Live alerts and plans can consequently appear, change, and disappear within a candle without equivalent historical evidence.

Initial acceptance should use completed-candle decisions. A developing-candle preview can remain visibly provisional. Intrabar trading research would require a separately specified and recorded event model.

### F03 - Backtest cache is not keyed by asset and full data identity

Cache reuse checks the last candle timestamp and minimum score, but not the symbol or dataset identity. A controlled replacement of the data at the same last timestamp retained a six-trade cached result when a fresh evaluation produced twelve trades. These are synthetic fixture counts, not market results.

Invalidate or key caches by all inputs that affect a result, including symbol, timeframe, data revision, rule version, and costs.

### F04 - Out-of-order loading can attach old data to the new selection

Concurrent loads lack request-generation and response-identity guards. A controlled test resolved an ETH request first and an older BTC request last. The selected symbol remained ETH while the final candle data came from BTC.

Associate every response and WebSocket message with the active request/feed identity. Reject obsolete responses. Validate ordering, uniqueness, continuity, and candle structure.

### F05 - Higher-timeframe context becomes stale

`htf()` is requested during loading and does not continuously refresh its context. Context should expose its timestamp and confirmation state and refresh on the applicable higher-timeframe boundary.

### F06 - Costs are an explicit but unvalidated simplification

The newly supplied notes explicitly define 0.1% as a round-trip fee. The earlier critique must therefore not call the missing second deduction a proven programming error. The code subtracts 0.1% of entry notional once; this is broadly consistent with that stated simplified assumption.

Acceptance still requires defining the execution product and actual per-side fee model, spread, slippage, stop execution, and financing/funding where relevant. Position sizing currently uses stop distance without all these costs.

TP1 is a touch statistic, not a partial exit. Simulated trades close at TP2, the stop, or the time limit. Any partial-exit or breakeven-stop policy requires its own explicit implementation and validation.

### F07 - Recovery statistics are descriptive and have unequal observation windows

Older vectors have more opportunity to recover than recent vectors. The displayed median time to 50% excludes unrecovered vectors. Such figures do not directly estimate a future trade's chance of success.

Measure recovery within fixed horizons, report unresolved cases, and compare with matched non-vector zones. Evaluate target-before-stop outcomes and costs separately from eventual price revisits.

### F08 - Alerts and plans are not a durable trade journal

The application retains account/risk inputs in local storage, but does not preserve an immutable signal and decision history. Alerts are triggered by changes in the signal side, rather than a complete unique setup identity. A displayed plan is recalculated and is not a frozen open-trade record.

Persist event identity, source data timestamps, rule/configuration version, confirmation time, observed conditions, plan, invalidation, and outcome. Distinguish observations, candidate setups, confirmed decisions, and tracked paper trades.

### F09 - Historical scaling needs more than a larger request limit

At 5m, 1,000 candles cover about 3.47 days; 50,000 cover about 173.61 days; a 365-day year contains 105,120 candles. Binance spot REST limits one kline response to 1,000 candles, so longer ranges require pagination or archive ingestion.

The current implementation repeatedly scans history and zones on updates, with quadratic work possible in its zone scan. Separate historical storage, incremental live calculations, replay, and rendering. A backend is not automatically necessary; choose the smallest architecture that passes measured workloads.

## 6. Ordered delivery plan and gates

| Priority | Deliverable | Gate before moving on |
| --- | --- | --- |
| P0 | Isolated project root, preserved original baseline, known code version, defect register | Work cannot change VECTOR LAB files; original inputs remain identifiable |
| P1 | Correct event chronology, completed-candle decisions, feed isolation, cache correctness, fresh context | Historical decisions are invariant when later data is appended; delayed requests cannot corrupt selection; gaps/stale data are visible |
| P2 | Faithful core analysis workspace and early journal | Reference comparisons use identical feeds/settings; each observation is explainable and recordable; hypothetical and confirmed states are clear |
| P3 | One explicit setup and reproducible research | Frozen definitions, realistic costs, chronological holdout, matched/repeated baselines, and preserved experiment records |
| P4 | Forward paper validation and usable first release | Live/replay agreement and journal integrity pass; workflow improves in measured use; remaining limitations are documented |

P2 core: vector colors/zones, EMA13/50/200/800, relative distance/volatility, higher-timeframe context, risk/target distances, relevant session/day levels, and clear waiting/invalidation reasons. Add ADR/AWR, exact Psy/session details, or other elements according to their role in the chosen workflow and verified source definitions.

P3 starts with a narrow research slice, proposed as BTCUSDT 5m with 1h context, without claiming that this is the best market or timeframe. Preserve the application's other choices but do not imply equal validation. Decide the actual execution product before interpreting results as executable P&L.

Research requirements:

- Use chronological train/validation/holdout periods. Avoid allowing trade outcomes across a split boundary to influence earlier calibration.
- Keep parameter searches and sensitivity-driven changes away from the final untouched holdout.
- Compare repeated random-entry baselines with comparable direction, volatility, exposure, stop/target geometry, and costs.
- Compare vector revisit behavior with matched ordinary-candle areas.
- Report average net R, uncertainty, drawdowns, exposure, event/trade counts, and results by regime. Win rate alone is insufficient.
- Check whether promising performance persists over nearby parameters and in additional periods/assets.
- Treat the first 50 forward signals as an operational checkpoint, not a statistical proof of trading advantage.
- Predefine a bounded initial experiment and a review decision. If evidence is weak, document that result before adding filters or indicators.

Do not introduce an optional HTF filter, alternate volume source, trailing stop, or additional strategy as an assumed improvement. Each changes the hypothesis and needs a separate comparison.

## 7. Workflow success criteria

The first usable terminal should help the user answer:

1. Is the feed current, and which market/timeframe is being observed?
2. What is the environment, and which vector zones and relevant levels are nearby?
3. Is there a precisely defined setup, or only an observation requiring patience?
4. What would invalidate the setup, and what are the risk and plausible target distances?
5. Which conditions are measured, which are approximations, and which are unvalidated?
6. Can the user reconstruct the decision later from a preserved record?

Compare decision time, omitted checklist items, inconsistent rule application, and completeness of records against the current manual process. Financial results remain a separate evaluation.

## 8. Access and concurrent-project arrangement

The current conversation can read and process the supplied workspace copies; it has no automatic access to an arbitrary folder on the user's computer or another active task's live working state.

Documented options:

- ChatGPT desktop local project: attach the relevant project folder using the project's folder controls, if available in the user's installed app.
- Codex CLI/IDE: start a dedicated session in the Hybrid directory or open that directory in a separate IDE workspace.
- Codex Cloud: use a separately configured repository/environment and task workspace.
- Current chat: uploaded files or a ZIP snapshot are sufficient for local analysis and implementation here; changes do not automatically synchronize back to the user's machine.

Two projects can be worked on concurrently using independent chats/sessions and distinct roots. For concurrent branches within the same Git repository, use separate worktrees. Avoid simultaneous editing of the same working directory, shared output files, or conflicting development ports. Available compute and account limits still apply.

Suggested roots: `VECTOR_LAB/` and `HYBRID_SYSTEM/`. The first implementation task should target the Hybrid root explicitly and identify its baseline commit/hash. Keep technical handoff and implementation instructions in English.

## 9. Source references and review status

Accessed 2026-10-23. References document method or product behavior, not account-specific availability or profitable trading performance.

| Source | URL | Review status |
| --- | --- | --- |
| Traders Reality library | https://www.tradingview.com/script/8zgJTM9u-Traders-Reality-Lib/ | Public documented function definitions reviewed; exact executable Pine parity remains to be established |
| TR_MAIN | https://www.tradingview.com/script/Etj1ixAs-Traders-Reality-Main/ | Public feature/settings description reviewed |
| Hybrid learning guide | https://bunny-wp-pullzone-t6yljr7iex.b-cdn.net/wp-content/uploads/2025/04/How-To-Learn-The-Hybrid.pdf | Extracted text across 18 pages read; selected chart pages visually inspected |
| Free course overview | https://tradersreality.com/courses/breaking-down-the-hybrid-system/ | Overview and curriculum reviewed; full lesson content requires membership access |
| Supplied lesson | https://tradersreality.com/courses/breaking-down-the-hybrid-system/lesson/the-market-makers/ | Redirected to course overview; video not inspected |
| Supplied playlist | https://www.youtube.com/playlist?list=PLbBPPTpCLCmSHvjxwiIgwAGPA-pXs312c | Retrieval unavailable; not reviewed as video content |
| Community Blueprint / Hybrid Trailing Stop | No exact script link supplied | Identity and behavior unverified; not a dependency of the first release |
| OpenAI projects | https://learn.chatgpt.com/docs/projects | Official project/folder/CLI/IDE guidance reviewed |
| OpenAI worktrees | https://learn.chatgpt.com/docs/environments/git-worktrees | Official parallel isolation guidance reviewed |
| OpenAI environments | https://learn.chatgpt.com/docs/environments/modes | Local/worktree/cloud boundaries reviewed |
| Binance spot REST | https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md | Kline pagination and public market-data behavior reviewed in the initial audit |
| Binance public archive | https://github.com/binance/binance-public-data | Archive availability reviewed in the initial audit; normalize timestamp units when importing |

## 10. Immediate next implementation scope

Prepare the isolated Hybrid workspace, preserve the original, and implement P1 with focused regressions for historical consistency, candle confirmation, request ordering, cross-symbol caching, and context freshness. Produce a clear diff and test results against the recorded baseline. Do not broaden the strategy or treat current backtest numbers as accepted performance evidence.

This scope defines the next increment. It does not claim that implementation has already been performed.
