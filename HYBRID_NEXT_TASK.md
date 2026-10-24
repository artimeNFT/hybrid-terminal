# Hybrid System — next local development task

Prepared: 2026-10-23, Asia/Jerusalem.
Status: implementation brief with checked numerical examples; not a new application release.

## Read this first

Only the two supplied baseline/specification documents are available in the current chat workspace. The HTML, tests and 0.3.1 ZIP from the preceding implementation are not available here now. No current application code was edited or executed in this turn. The arithmetic below was checked with exact decimal arithmetic; it is not evidence that the application passes these cases.

Work from the actual Hybrid project on the user's computer. Determine its version and record the HTML SHA-256 before editing. The last release described in the conversation was 0.3.1; the user may still have an earlier file open. Inspect rather than assuming. Read any applicable AGENTS.md and the current STATUS.md / README.md if present. Preserve the user's existing notes and Claude's files.

The two attached documents describe the original baseline and can contain defects subsequently repaired. Original HTML SHA-256 was 88bbfd418aeddb437240f517173d4581badda8f45ef8100c240555efafc3d533. That is a provenance reference, not the expected hash of the latest application. Earlier reported passing tests are historical context; do not claim they were rerun in this chat.

## Project and workflow boundaries

- Hybrid System is separate from VECTOR LAB and from any other currently running project. Use a separate VS Code window, distinct project root and dedicated Codex chat. Opening the Hybrid window does not require closing the existing project.
- Work locally in the folder containing the actual HTML and tests. Keep the other project's files, running tasks and configuration untouched.
- Use Sol 6.1 High for this bounded implementation. Recommend Astra High explicitly if a difficult numerical discrepancy or causality audit warrants it; the user changes the selected model. Do not spawn subagents unless the user requests them.
- Proceed with reversible work already authorized. Preserve a baseline, implement the bounded change, run appropriate checks and update a short checkpoint. Request missing source files only if they are absent locally.
- User-facing conversation: Hebrew. Header, chart controls and chart text: English. Right panel and Help: Hebrew. Technical specifications and handoffs: English.

## Task A — restore optional hollow-up bodies without clutter

The user clarified that they liked the earlier bright PVSRA palette with a hollow rising body and filled falling body. They delegate the interface design to our judgment and have difficulty distinguishing some colors. Do not respond by removing a useful choice or repeatedly resetting their display preferences.

Keep two clearly visible, independently labeled controls above the chart:

| Control | Values | Meaning |
| --- | --- | --- |
| Candles | High contrast / Standard / PVSRA | Color encoding |
| Body | Filled / Hollow up | Body fill encoding |

- PVSRA is volume classification on ordinary OHLC candles: normal, rising volume and climax/vector. It is not a separate price series and does not generate extra market observations. Both rising and falling candles exist in each volume class.
- Keep bright PVSRA colors and a visible legend. Standard uses two direction colors. High contrast uses light blue for up and orange for down. Retain an existing valid palette choice. The user's newly preferred combination is PVSRA + Hollow up; make it easy to select and persist.
- In our Hollow up option, C > O means a hollow body; C < O means a filled body. C = O is a neutral doji. Wick/border color still follows the chosen palette and volume class. Hollow up is an appearance option, not TradingView Hollow Candles parity: TradingView's native hollow-chart colors can refer to previous close, whereas this terminal's direction uses the candle's own open/close.
- Retain the filled-body option. Do not add another chart series, a three-chart layout or a software-version selector. The earlier comparison image was a static illustration.
- Keep optional volume tags off unless the user enables them. Classification remains readable in the inspector even when class symbols are hidden.
- Preserve existing v2 display settings and decision-journal storage. Migrate known older fields conservatively; old/new preference formats should not silently erase the user's selected timezone or palette.
- Changing either control must leave signal, backtest, vector classification and journal identity unchanged. Preserve developing/closed candle distinction.

Check: all three volume classes × up/down/doji × both body choices; visible selector location; preference restoration and migration; chart in English; Hebrew help/right panel; desktop and narrow layout; real Canvas rendering. Add only the checks needed for this behavior and adapt obsolete assertions that demanded all-filled bodies.

## Task B — audit gap handling before interpreting backtest risk

Inspect the actual backtest and recorded execution assumptions. The original specification checks the stop before a target on the same candle; that alone does not resolve a gap across an existing stop.

Add a focused fixture for a trade that is ALREADY open before the gap:

| Case | Entry | Stop | Later bar O/H/L/C | Reference gross R under the assumption below |
| --- | --- | --- | --- | --- |
| Long stop gap | 100 | 98 | 95 / 96 / 94 / 95.5 | -2.5R |
| Short stop gap | 100 | 102 | 105 / 106 / 104 / 105.5 | -2.5R |

Candidate OHLC execution assumption: a market-triggered stop crossed at the next open fills at that open, with zero additional slippage for this fixture. This is a deterministic modeling assumption, not a promise of live execution. The actual trading product/order type still needs an explicit definition before live-performance acceptance.

For the long case, recording an exit at 98 when the whole later bar is below 98 would give an unavailable price and an optimistic -1R result. If the implementation confirms this defect, first reproduce it with the actual functions, then correct the model and give the execution assumptions an explicit version. Preserve historical records under their original version; do not rewrite observed journal entries.

For ordinary non-gap bars, retain the existing conservative stop-first rule when stop and target are both touched and their sequence is unknown. Define entry validity and gap-target behavior separately; do not infer intrabar ordering from OHLC. Verify symmetry between long and short.

## Task C — distinguish projected risk, fills and cost assumptions

Checked example: account 10,000, nominal risk 1%, signal close 100, stop 98 gives planned size 50 units before fees. If a later entry fills at 103 with the same stop and unchanged size, nominal stop loss is 250 (2.5% of the account), not the planned 100. The displayed plan is a projection at signal time; actual fill/risk must be recomputed if a paper/execution workflow is introduced.

Do not silently change the 0.1% entry-notional round-trip cost in the existing model. The supplied baseline explicitly identifies it as a simplification, not proof of a missing second fee. A per-side model is a separately versioned execution assumption.

Reference algebra, with direction d = +1 for long and -1 for short, entry e, exit x, stop s:

    risk_per_unit = abs(e - s)
    gross_R = d * (x - e) / risk_per_unit
    fee_R = (entry_fee_rate * e + exit_fee_rate * x) / risk_per_unit
    net_R = gross_R - fee_R

The following uses hypothetical fees of 0.05% PER SIDE, not a claim about current Binance fees, spread, funding or slippage:

| Side | Entry | Exit | Stop | Gross R | Fee R | Net R |
| --- | --- | --- | --- | --- | --- | --- |
| LONG | 100 | 110 | 98 | 5 | 0.0525 | 4.9475 |
| SHORT | 100 | 90 | 102 | 5 | 0.0475 | 4.9525 |

The old simplified entry-notional deduction would produce 4.95R in both examples. That difference should be described, not mislabeled as a proven bug. Fee-inclusive sizing, funding/borrow costs and execution-product restrictions need their own defined scope.

## PVSRA boundary cases to retain for reference comparison

From the supplied specification: compare current volume with the PREVIOUS ten-bar mean; compare current volume × high-low spread with the maximum of the PREVIOUS ten products; vector classification takes priority over rising volume. Exact behavior must ultimately be compared with an identified Pine source on the same feed/settings.

With previous ten bars all having volume 100 and spread 2, mean volume is 100 and max product is 200:

| Current volume | Spread | Classification implied by the supplied rules |
| --- | --- | --- |
| 149.999 | 1 | Normal |
| 150 | 1 | Rising volume |
| 199 | 0.5 | Rising volume |
| 200 | 0.5 | Vector by volume |
| 100 | 2 | Vector by equal product threshold |
| 90 | 3 | Vector by product despite lower volume |

A zero-volume reference has mean/product zero and no meaningful relative-volume denominator. Inspect and compare its treatment with the named Pine source; do not silently invent a new strategy rule. Daily VWAP with zero cumulative volume should remain unavailable, not NaN or Infinity. Source access to the TradingView library page was restricted during this turn, so exact Pine parity is not claimed.

## Completion and next checkpoint

1. Inspect current code and preserve a baseline.
2. Implement Task A, then test the actual application.
3. Reproduce Task B on actual functions and correct it if confirmed. Keep costs and entry/exit assumptions explicit; Task C is a consistency audit, not authorization to tune strategy thresholds.
4. Run the existing required regression suites appropriate to the changes, plus real browser/Canvas checks. Verify public-feed operation locally if network access permits; synthetic data must be labeled as synthetic.
5. Report what changed, the actual checks run, unverified items and the next bounded task. Save a short checkpoint so a quota interruption is easy to resume.

Do not add indicators, tune strategy thresholds, introduce a trailing stop/HTF filter, broaden research coverage or claim profitability in this increment.

## Verified setup sources

- Codex IDE extension: https://learn.chatgpt.com/docs/codex/ide
- Project boundaries: https://learn.chatgpt.com/docs/projects
- VS Code New Window shortcut: https://code.visualstudio.com/docs/reference/default-keybindings
- TradingView hollow-chart semantics: https://www.tradingview.com/support/solutions/43000745270-hollow-candle-charts-explained/

## First prompt for the new Codex chat

Read HYBRID_NEXT_TASK.md and the actual project's applicable instructions/status files. Confirm the Hybrid project root and current HTML version/hash. Implement Task A, then reproduce and address Task B if the gap-stop defect is present. Preserve existing display preferences and journal history, keep chart controls English and the right panel/help Hebrew, and leave every other project untouched. Run focused and required checks, update the checkpoint, and return the concrete result and next step. Do not rebuild the app from the old notes when current source is available.
