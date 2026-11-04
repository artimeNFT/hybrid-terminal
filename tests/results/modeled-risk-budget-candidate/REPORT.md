# Isolated candidate — modeled risk-budget sizing

Candidate branch `candidate/modeled-risk-budget`, worktree `/tmp/hybrid-modeled-risk-budget`, based on main `c12d02b39982514c190cf4220137093845cec8da`. This is one planning-math candidate, not an integrated release or execution approval. Authoritative main/root remains0.4.25 RC, SHA-256 `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`.

Candidate HTML SHA-256 **`240b2f0ba94226e20dd9dafbcd004fdb7b844a3f0e13529e0d045a4c62f931bd`**. Application-version metadata remains0.4.25 intentionally; document title explicitly identifies the candidate and a separate named manifest `qa/source-checksums.modeled-risk-budget-candidate.json` validates the changed bytes. Old manifest/seals remain unchanged. Exact pre-edit HTML is archived at `baseline/hybrid-terminal.0.4.25.html`; do not relabel the candidate as the unchanged main source.

## Reading the candidate

Choose **Market → USDⓈ-M Perpetual**, a supported BTC/ETH/SOL symbol and timeframe. When there is an eligible confirmed plan, expand **גודל נומינלי והנחות הון · לא כמות לביצוע** inside the existing confirmed planning workspace. Read **כמות לפי תקציב הפסד בתרחיש** below the original nominal estimate. The existing account/risk inputs and fee/slippage/gap assumptions control the comparison; there are no new inputs/preferences. Expand its exact details for product/symbol/timeframe/UTC confirmed anchor, assumptions, original coordinates and unrounded arithmetic. WAIT has no substitute plan; unsupported products clear/hide the comparison.

The comparison is not recommended/executable quantity, margin/leverage approval, a liquidation estimate or guaranteed loss cap. Funding and all unmodeled account/execution effects are excluded, not assumed zero. The10bps default is a model assumption, not a verified account fee. It is decision-close planning, not the backtest's next-open execution. Existing nominal sizing and its limitations stay visible and unchanged.

## Same cost model, budget arithmetic only

Reuse the unchanged validated `planningCostScenario` output:

```
B = existing account × riskPercent / 100
D = scenario.distance
L = D × (−scenario.gapStopR)
q = B / L
notional = q × scenario.entry
loss at existing nominal quantity = sizingSnapshot().quantity × L
```

No second fee/gap model is introduced. Existing fees/slippage are based on entry, while the gap amount is based on stop. Gap0 uses ordinary-stop costs. Helper inputs and every arithmetic output must be positive and finite; the current nonnegative-cost scenario has `gapStopR ≤ −1`. Missing/partial/invalid inputs, invalid confirmed identity/eligibility, unsupported product/symbol or overflow clear the new numbers. New details remain mounted through clearing/restoration, preserving open state; original controls/listeners/focus remain stable.

Independent literal checks (account1000, risk1%, budget10):

| Scenario | Unit modeled loss | Quantity | Loss at nominal quantity10 |
| --- | ---: | ---: | ---: |
| LONG E100 / S99,10bps fee, zero extra slippage/gap |1.1|10/1.1 ≈9.090909090909|11|
| Symmetric SHORT E100 / S101, same costs |1.1|10/1.1 ≈9.090909090909|11|
| Either side, all costs zero |1|10|10|
| LONG,10bps fee +100bps gap from S99 |2.09|10/2.09 ≈4.784688995215|20.9|
| SHORT,10bps fee +100bps gap from S101 |2.11|10/2.11 ≈4.739336492891|21.1|

Budget conservation `q×L≈B` is checked with tolerance `1e-12 × max(1, abs(B))`. Under nonnegative costs, q≤nominal is checked without clamping. This is algebraic consistency, not profitability or empirical risk calibration.

## Actual validation / preservation

- Six new deterministic groups PASS: independent LONG/SHORT/zero/fee/gap literals; budget and quantity inequalities; invalid/coercion/overflow cases; immediate clearing; confirmed/provisional/history/selection isolation; exact engine/sizing/export/journal preservation.31 affected existing context/plan/source suites' test groups also PASS.
- New actual mocked Chromium checks PASS at1440/320 for LONG/SHORT/WAIT, exact quantities/notional/nominal loss, native partial typing and focus, mounted expanders, unchanged storage/journal on projection refresh, source/product/stale-message isolation, no overflow and both Help languages. Original nominal controls remain mounted. [Desktop](1440-LONG-fee-only.png), [320px](320-LONG-fee-only.png), [gap](320-LONG-gap.png), [SHORT gap](320-SHORT-gap.png), [WAIT](320-WAIT-unavailable.png), [partial input](320-LONG-partial-planningfee.png), [Hebrew Help](320-help-he.png) and [English Help](320-help-en.png) screenshots inspected; no physical-device or live acceptance claim.
- Development checks caught an invalid oracle (manually replaced signal later recalculated by the existing feed engine); the anchor check uses a genuine confirmed decision. A new expander-state defect was demonstrated and corrected by keeping the new details node mounted. Original failed development logs retained ignored; assertions were not weakened. Required checks on settled source are recorded below.
- All838 pre-existing baseline/research/reference/checksum/result files remain byte-exact. New comparison changes only one original function body, `updatePlanningCosts`; new helper/UI functions are additive. `nominalSizing`, `sizingSnapshot`, `planningCostScenario`, strategy/selection/targets/stops, backtest, journal and exports remain exact. Existing full-precision numbers, stored inputs and default chart raster remain unchanged. No new storage access, endpoint, timer, WebSocket or dependency.
- Required deterministic `npm test`: **PASS**, one settled run. Required local `npm run test:browser` exited1 after the existing27 scripts passed: the new script lacked the existing project-local libnspr4 fallback and failed at browser launch. Added the same fallback used by the other appended scripts; the affected new script then PASSed all6 scenarios without an external LD_LIBRARY_PATH. No repeat of the27 successful scripts. Exact command results are in `validation.json`. One required exact-published full CI is triggered by the candidate draft PR after settlement. Read actual head/run/jobs; save readback ignored and report it in final handoff. No extra publication solely to announce CI success, no merge and no rerun to obtain green.

Raw local evidence/logs are ignored in the candidate's `.qa-results/modeled-risk-budget-candidate/`; compact receipts/screenshots are additive here. Isolated mocked feeds and synthetic records only; no raw personal export/account inputs, market acquisition, public smoke, research/cohort run or parked diagnostic was accessed/restarted. Existing regional and historical fee-reload assertions remain intact. Their historical failures remain UNKNOWN; a successful candidate run cannot prove persistence repaired or waive full-release acceptance.

Stop after candidate publication/CI readback. No merge or feature expansion; independent numerical/CI review is the next unfinished action.
