# Planning-only cost / stop-gap sensitivity — 0.4.7 RC

Source SHA-256: `4bafacddf8d726fc48601471c7a7fe713c2fb2038f0908264131ba864f7aa8e8`.
Starting checkpoint: `e3f4ec3d1a31cf9879ba2adb36d5ec5ad364e3b5`.
Exact pre-edit 0.4.6: `baseline/hybrid-terminal.0.4.6.html`, `7c12ba003d8a03bff8322c7d9143c8bc926aa6847b62dbaf065d80b3d55e5195`.

Optional native expander, closed by default, below the existing eligible confirmed plan. WAIT/invalid geometry has no substitute card or numeric scenario. Only `panel` among the 92 previous functions changes, adding the independent updater; 91 prior bodies stay exact. New initialization and a separate preference key do not alter old preferences or journal. Focused fixtures compare actual calculation/backtest objects and journal bytes with the preserved 0.4.6 source.

## Arithmetic and guards

E is confirmed decision-close entry, S stop, T TP2, D=|E-S|, d=+1 LONG/-1 SHORT. F=E*(feeBps+slippageBps)/10000; G=S*gapBps/10000. Hypothetical net TP2 R=(d*(T-E)-F)/D, ordinary-stop R=-1-F/D, gap-stressed stop R=-1-(F+G)/D. Gap is adverse below LONG stop / above SHORT stop, based on stop notional. Fee/slippage are totals across entry and exit; neither is doubled again.

At E=100, D=2, gross target 3R: zero costs yield 3/-1/-1 for either side. Default fee10/slippage0/gap0 yields F=0.1 and 2.95/-1.05/-1.05, agreeing with the unchanged 0.05 baseline costR. Gap100 bps yields G=0.98 for LONG stop98 or 1.02 for SHORT stop102, stressed -1.54/-1.56 respectively. This difference follows stop notional, not asymmetric direction handling. Gap never changes ordinary-stop/net-target R.

Finite nonnegative primitive numeric assumptions only; fee/slippage each <=100 bps, gap<=1,000 bps, inclusive. These software caps are not empirical market estimates or limits on real losses. Empty, nonfinite, negative, above-cap or malformed saved values produce no numeric output; stop/target must be finite, positive and directionally valid, with positive risk/reward. Overflow is unavailable. Invalid saved bytes are preserved until explicit user correction/reset. A dedicated schema-1 key persists valid user edits; quota-style failure leaves valid session inputs available. No automatic default write.

## Checks actually performed

- Full `npm test`: active source verification; nine app suites; 18 CLI, nine audit, nine contract, 13 preparation fixtures in explicit frozen 0.4.3 context; four presentation suites (5+6+7+7 cases).
- Seven focused planning fixtures: both sides/zero-cost/default/additive slippage, adverse stop-notional gap, invalid inputs/geometry/arithmetic, provisional/view anchor, restored/invalid/quota-failed storage, source/body/decision/backtest/sizing/journal invariance.
- All nine mocked Chromium scripts, including actual 1440×1100 desktop and 390×844 touch-emulated narrow cost-card interactions. Actual calculated LONG and reflected SHORT fixtures, WAIT isolation, native expansion, baseline/stress/error/reset, stored assumptions, input focus through provisional WebSocket frames, no horizontal overflow or console/page errors. Network guard: no unexpected requests.
- Actual images inspected: desktop LONG full layout and card, narrow LONG full layout/stress/error, narrow SHORT card. All 16 screenshots are identified by hashes in `screenshots.json`; only inspected images carry that flag. Raw images/traces are ignored, retained locally under the paths in that registry; compact evidence is tracked.
- Read-only frozen source/audit/preparation seal/payload verification; six dataset/checkpoint byte hashes, old manifests/research/evidence and historical STATUS archive unchanged. No cohort, outcome, acquisition or hour-soak rerun. See `preservation.json` and `frozen-check.log`.

The local tests ran against this same repository's isolated worktree before byte-identical fast-forward promotion to the authoritative root. All runner manifest exit codes are zero. Publication/actual Actions commit evidence is recorded separately after push; local pass is not remote CI.

## Limits and independent next action

Decision-close planning assumptions, not executable prices, verified account fees or historical outcomes. Existing backtest enters next open and is not numerically identical. TP1 stays touch-only, not a partial exit; SHORT stays research/simulation, not an approved Spot short order. Baseline costR/gross RR, sizing, all rules/execution/backtest/journal behavior and chart controls remain unchanged. No account connectivity, orders, feeds, indicators or dependencies.

The existing native one-shot midnight timer remains unchanged at 2026-10-25 23:58 UTC. Scheduled is not observed. Publish a clean settled root before 23:45 UTC; if unfinished, preserve isolated work rather than dirtying the active root. Review its real 420-second evidence after execution (bounded completion about 2026-10-26 00:08 UTC): actual source/version/hash, real UTC boundary and daily-context rollover, final feed/context, journal preservation/uniqueness and injected versus unexplained faults. No acceptance transfers from old 0.4.4 soak. Physical touch and user-perceived readability of the new card remain pending. Do not wait all day or begin another task.
