# Hybrid System — implement the next integrity increment

Work only in /mnt/c/Users/shlom/Desktop/THE hybrid-terminal. Keep VECTOR LAB completely separate. The user has authorized continued Hybrid development and wants concrete, bounded improvements. Do not stop at a plan or ask again for routine reversible work.

## Establish the baseline

Read applicable AGENTS.md, README and STATUS.md. Inspect the actual current source and tests before editing. The attached review targets 0.4.0, whose CRLF-to-LF normalized SHA-256 is:

0593c0096957d295628d267f1f3b16dd90a6478832d61bf39d2e9ed1959bc7d9

Confirm provenance. If the local source has progressed, preserve the newer work and reconcile these findings rather than restoring an old version. Preserve an immutable pre-edit baseline. Do not alter release archives or old journal records. Use an isolated branch if Git already exists and that fits project instructions; a repository conversion is not this task.

Read REVIEW_AND_ROADMAP.md, findings.actual.json and audit-040.cjs in this review folder. The baseline probe is intentionally hash-locked; run it against the matching baseline if Node is available. After changes, use appropriate maintained project regressions rather than weakening that hash lock.

## Objective and scope

Deliver a small, reviewable integrity release, proposed 0.4.1 if consistent with local versioning. Improve the meaning of statistics, sizing and candidate diagnostics before adding more indicators or probabilities. Preserve current thresholds and valid ordinary-market default signal behavior. Do not add broker connections, orders, API secrets, a backend, framework migration, new symbols, new selectable timeframes or an ML model.

Preserve 5m/15m/1h/4h, the existing markets, chart history, live/provisional versus confirmed separation, PVSRA controls, independent Filled/Hollow up body selection, Pane Volume/RSI14/None, complete-UTC-day traditional PP/R1/S1, gap-stop handling, preference migration and journal export. English chart/header/controls/inspector; Hebrew analysis panel and Help.

## Required changes

1. Honest statistics states across screen, copy/report and exports.
   - N=0: win rate and confidence interval are unavailable, not measured zero or a manufactured interval.
   - Positive gains with no losses: remove the numeric PF=99 sentinel. Show an explicit no-loss/undefined-ratio state, with gain/loss and N where useful.
   - Define all-zero, all-loss and ordinary mixed cases. Prevent NaN/Infinity leaking into JSON; represent status separately from numeric nullable values.
   - Keep realized net-R drawdown labeled as such. Do not imply mark-to-market account-equity drawdown.
   - Keep fee and execution definitions visible. The existing 0.1% entry-notional round-trip model is a baseline assumption, not known live account fees.

2. Sizing transparency and an explicitly assumed cash-Spot preview.
   - Label the current risk/stop-distance quantity as nominal geometric sizing, with fees, slippage, gap and funding assumptions visible in concise Hebrew.
   - Show estimated notional, notional/account ratio and affordability under a clearly selected cash-only Spot LONG scenario. A 10x geometric notional must not appear as an executable cash-only quantity.
   - If an optional feasible cash-Spot estimate is implemented, use an explicit quote-currency cash balance assumption, explicit cost inputs/default assumptions and public symbol metadata for applicable tick/step/notional rules. Round quantities down safely; handle stale/missing filters as unknown, not approved. Do not claim full account/order-type tradability.
   - No implicit futures leverage, borrowing, liquidation model or inference of execution product from the chart alone. A research SHORT on Spot is a simulated directional hypothesis, not an executable unborrowed Spot order.
   - Product/account-specific inputs can remain explicitly unconfigured. This must not block independent statistics and labeling fixes.
   - Do not silently replace the historical execution/fee model. A new execution model needs a distinct version and new records must identify it, preserving old records.

3. Both-side candidate diagnostics without silently changing the strategy.
   - Refactor only as necessary to expose LONG and SHORT condition counts, target availability, geometry eligibility and a concise reason for WAIT/conflict.
   - Explain the reviewed counterexample: tied preliminary scores select SHORT before target eligibility, suppressing an eligible LONG. Preserve the existing default selection rule in this increment; clearly show that it caused WAIT.
   - Do not automatically flip to the other side, increase scores or tune thresholds. A proposed alternative selection policy belongs in a documented, separately versioned experiment, not a hidden fix.
   - Show decision close time and distinguish current/provisional market information from the frozen confirmed candidate.

4. Numerical validity and zero-reference handling.
   - Add explicit finite, warm-up and positive-denominator checks to relevant calculations and displays.
   - Use flat zero-volume and zero-ATR cases to define unavailable/data-quality states. Do not present zero-vs-zero volume comparisons as actionable strong-volume evidence.
   - Determine and document the reference policy for zero-gain/zero-loss RSI. Do not silently force 50 or claim Pine parity without a matching reference.
   - Keep raw diagnostic values and actionable eligibility conceptually distinct. If a new invalid-input gate changes decisions, version the affected rule semantics and demonstrate that ordinary valid-input behavior is preserved.
   - Cover partial-day VWAP/Daily Open coverage labels if already supported or a small safe extension; do not expand this into a new VWAP implementation.

5. Source and mode labels.
   - Make Binance Spot and research/simulation mode visible. Preserve existing health information and stale-response guards.
   - Do not claim the MEXC perpetual screenshot is the same market, or that TR_MAIN/Psy/ADR parity is complete.
   - Update Hebrew Help for changed states and assumptions. Keep the chart readable; additional diagnostics belong in compact expandable content when possible.

## Validation proportional to the changes

Add meaningful regressions for:
- N=0, all-zero R, no-loss, all-loss and mixed net-R statistics; identical states across UI, report and serialized export.
- Reviewed sizing inputs (account 1,000, risk 1%, entry 100, stop 99.9), affordability, invalid input, and any fee/rounding/minimum constraints actually implemented.
- Both-side diagnostics for the tie fixture and unchanged legacy selection on ordinary valid data.
- Flat zero-volume, zero ATR, insufficient warm-up and invalid arithmetic.
- Journal bytes/IDs and preference migration preservation.

Run the maintained project suites required by its instructions, plus focused desktop/mobile browser checks for changed UI. Do not create tautological tests that merely repeat implementation expressions. Avoid adding application runtime dependencies.

Attempt a bounded real-feed observation across a 5m close if the environment allows. An actual UTC-midnight transition and long reconnect/storage soak remain separate observations if not reached during this task. Report exactly what was observed; do not substitute deterministic fixtures for a live claim, or leave a process running indefinitely.

If a capability is unavailable, complete the independent work and document the precise remaining limitation. Do not seek permission for read-only checks or reversible work already in scope.

## Deliverables and stopping point

- Updated authoritative HTML and a preserved pre-edit baseline.
- Appropriate regressions and evidence, with no unsupported profitability or parity claim.
- Concise README/STATUS updates: version/hash, behavior and rule/execution-version changes, assumptions, exact validation and remaining limitations.
- One short final response with the file to open, the main corrected behavior, tests actually run and the next bounded task.

Stop after this integrity increment is implemented and checked. Sessions/Psy/ADR, MACD/OI, paper-trade lifecycle, long research history and calibrated probabilities remain later increments in REVIEW_AND_ROADMAP.md.

