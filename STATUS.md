# Hybrid Terminal — current status
Updated: 2026-10-29, Asia/Jerusalem. Single current task board; start with [START_HERE.md](START_HERE.md). Historical reports/next-step wording do not select today's task.

## Verified application and working arrangement
- Private repository [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main; sole active app `/mnt/c/users/shlom/desktop/the hybrid-terminal/hybrid-terminal.html`. VECTOR LAB and other projects are separate.
- App **0.4.17 RC unchanged**, SHA256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`; application commit `1608a5d98bbed55839bec28c22880144cdcb01c0`.
- This conversation reviews/plans; the existing VS Code/WSL Codex session implements. No new implementing session. Safely inspect/synchronize local branch/dirty state before writing; GitHub cannot prove WSL/browser state.
- User priority: **contracts first, Spot secondary**. Binance/MEXC/Hyperliquid are candidates, no final account/fee tier/margin mode selected. Polymarket is a separate deferred workflow.
- UI remains English chart/header, Hebrew panel, bilingual Help. Preserve Filled/Hollow choices, palette/noncolor cues and user journal. Journal desktop navigation/readability/selection accepted2026-10-27. Physical touch/accessibility/current-source live equivalence remain unverified.

## Current decision and task
**Five-condition5m policy paused.** Spot906/perpetual886 inspected-Q3 studies failed every declared modeled-fee scenario; they are correlated studies, not independent confirmations. No further tuning/run or automatic strategy change.

**In progress — ONE standalone taker-aggression increment**, same local owner/main, safely fast-forwarded to `df416deb8612c5e68661b73e74a3680677cff269` with no local work discarded. The complete exact contract is now [research/aggression-increment/CONTRACT.md](research/aggression-increment/CONTRACT.md), preserved verbatim from the planning checkpoint; [protocol](research/aggression-increment/protocol.json), [implementation/solver notes](research/aggression-increment/README.md). It is independent of the old policy and imports no old calculation/execution engine.

**Pre-label seal:** written UTC `2026-10-28T23:12:34.112Z`, canonical protocol `cef8bfcfa1a64e275793f4d1870cde0c57f004c42748468133d2134c27be7844`, trade `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`, bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`. [Source/data seal](research/aggression-increment/seal.json) records zero real labels/fits before sealing. Existing26496-row trade dataset verified with the unchanged typed derivatives validation gate; no acquisition/Mark substitution/old-engine replay. Application0.4.17 and historical sources/seals unchanged.

**Contract:** fixed2973 July–August /1439 September structural opportunities; current closed candle's five raw features plus taker-buy base imbalance only; next-open→30-minute-open target. Common-valid masks,95% coverage per partition. OLS with intercept, training-only population scaling, deterministic column-pivoted Householder QR v1.0.0/full ranks6/7/tolerance1e-12. One fit per model; coefficient/scaler/solver seal must be written and verified before September labels. Nonpositive aggression coefficient stops with test-not-evaluated/null, never zero test performance. Primary10bps: augmented per-opportunity mean>0 and paired improvement>0;5/20bps cannot rescue failure. Funding unapplied/unknown, fully adjusted return unavailable. No inference/advantage claim; September remains exploratory.

**Completed preflight:**12 focused synthetic fixtures passed, including independent literal OLS/scaler expectations, rank detection, exact horizon/calendar, common masks/95% boundary, negative/exact-zero training rejection with no September access, coefficient-seal-before-September ordering, flat forecasts/common denominator/cost-once and historical-byte checks. A test assertion was corrected to recognize signed zero; no runtime rule changed. Evidence `.qa-results/aggression-increment-v1/final-fixtures.log`. No real labels/fits yet at this checkpoint.

**Exact resume:** execute the single sealed attempt at `.qa-results/aggression-increment-v1/run` using the existing trade file, one worker/hard300s; no retries/refits. Respect the training gate, then publish code/protocol/seals/compact report/quality/STATUS as one package and verify exact full CI. Stop at declared rejection/inconclusive/pass.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| P1 | Taker-aggression incremental-information test | Protocol/source/data sealed;12 synthetic fixtures passed; single real attempt next. |
| Paused | Five-condition5m strategy research | No automatic rescue/tuning/score/stop/venue/timeframe change. |
| Done | Derivatives gross/fee-only pilot | `045a6b4d7ce20dfbd4f2a400b50fb2aea9bf8bf8`; [CI40781160320](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40781160320) attempt1 all3 jobs/20 browser suites passed. [Report](tests/results/derivatives-pilot-v1/REPORT.md). |
| Done | Intake and Spot pilot/economics | [Intake](tests/results/derivatives-intake-v1/REPORT.md), [Spot pilot](tests/results/policy-pilot-v1/REPORT.md); immutable data/source/seals retained, no replay/reacquisition. |
| Done / monitored | Regional reload capture | Installed; cause unresolved, inspect next natural artifact only. |
| P2 | Retained product/research gaps | Actual execution/funding/margin, live origin equivalence, all-zone99/964 imbalance, physical touch/accessibility/Psy/TR parity, CLI plaintext-storage follow-up. No automatic work. |

## Preserved evidence and limitations
- Existing raw derivatives data remain ignored at `research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/`. New primary rows/predictions/receipts ignored at `.qa-results/aggression-increment-v1/`; no private journals/profiles/accounts accessed. Required full CI uses synthetic fixtures only, not acquired data.
- Funding calendar/settlement ordering, spread/slippage/latency/intrabar/account fills, historical filters and margin/liquidation remain unknown/unmodeled; no fully adjusted return. Current metadata is not Q3 rules. Taker volume is executed initiator-side aggregation, not order-book delta, absorption or participant intent.
- [Origin audit](tests/results/calculation-readiness-v1/REPORT.md), [all-zone preparation](tests/results/preparation-v1/REPORT.md), historical reports/seals/checksums and [STATUS_HISTORY.md](STATUS_HISTORY.md)/Git remain intact. Their live-equivalence/imbalance limitations are not reopened.
- Exact0.4.4 hour/0.4.7 midnight acceptance remains source-specific; no repeated soak/cohort/public-data acquisition. No application release, score vote, old-policy filter, new indicator/venue/timeframe/dependency or unrequested follow-up.
