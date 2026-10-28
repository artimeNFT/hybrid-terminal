# Hybrid Terminal — current status
Updated: 2026-10-29, Asia/Jerusalem. Single current task board; start with [START_HERE.md](START_HERE.md). Historical reports/next-step wording do not select today's task.

## Verified application and working arrangement
- Private repository [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main; sole active app `/mnt/c/users/shlom/desktop/the hybrid-terminal/hybrid-terminal.html`. VECTOR LAB and other projects are separate.
- App **0.4.17 RC unchanged**, SHA256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`; application commit `1608a5d98bbed55839bec28c22880144cdcb01c0`.
- This conversation reviews/plans; the existing VS Code/WSL Codex session implements. No new implementing session. Safely inspect/synchronize local branch/dirty state before writing; GitHub cannot prove WSL/browser state.
- User priority: **contracts first, Spot secondary**. Binance/MEXC/Hyperliquid are candidates, no final account/fee tier/margin mode selected. Polymarket is a separate deferred workflow.
- UI remains English chart/header, Hebrew panel, bilingual Help. Preserve Filled/Hollow choices, palette/noncolor cues and user journal. Journal desktop navigation/readability/selection accepted2026-10-27. Physical touch/accessibility/current-source live equivalence remain unverified.

## Current decision and one next action
**The five-condition5m policy is paused for further tuning/runs.** Its Spot and derivatives Q3 fee scenarios were negative. These correlated inspected-quarter studies are not independent confirmations; complete account returns remain unavailable. Keep the terminal's manual context/chart/risk/journal utility separate from strategy validation.

**Next: ONE standalone exploratory taker-aggression incremental-information test, queued/not run.** Claude's relayed design is adopted with explicit time coordinates, split purging, training-only preprocessing and common-opportunity scoring below. This is independent of the old policy: no sixth vote, old entry filters, stops/targets or old-engine replay.

The existing Codex session should materialize/seal this protocol and its implementation before real training labels/fitting, validate focused synthetic fixtures, fit each model once, seal coefficients/scalers, and evaluate September once only if the predeclared training gate permits. Publish one package and stop. No additional general audit/model consultation required.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| P1 | Taker-aggression increment test | Queued: exact contract below; one baseline and one augmented OLS, fixed30-minute horizon and10bps primary hurdle. Stop on declared failure; no search. |
| Paused | Five-condition5m strategy research | Spot906 and derivatives886 trades did not survive modeled fees. No automatic stop/score/venue/timeframe changes to rescue results. |
| Done | Derivatives price/fee-only pilot | `045a6b4d7ce20dfbd4f2a400b50fb2aea9bf8bf8`; [CI40781160320](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40781160320) attempt1 all3 jobs/20 browser suites succeeded, independently checked. |
| Done | Intake and Spot pilot/economics | Sources, data, seals and reports retained; no replay/reacquisition. |
| Done / monitored | Regional reload capture | Installed/validated; cause unresolved. Inspect next natural failure artifact only; not a research gate. |
| P2 | Product/backlog and retained findings | Actual contract execution/funding/margin, live origin equivalence, all-zone99/964 imbalance, human touch/accessibility/Psy/TR parity and CLI plaintext storage remain scoped gaps. No automatic work. |

## Exact new test contract — freeze before real labels/fits
### Question and input
- Hypothesis: current-bar taker-buy imbalance contributes positively to subsequent30-minute price-return forecasting beyond a fixed OHLCV baseline, enough to improve the fixed sign strategy after modeled fees. Proposed mechanism is aggression persistence; no absorption/intent/causal-flow claim.
- Use existing Binance USDⓈ-M BTCUSDT USDT-perpetual5m Q3 trade dataset only: bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`, trade payload `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`;26496 bars, `[2026-07-01,2026-10-01)`. Verify using the unchanged typed derivatives loader. No acquisition, Mark-volume substitution, old model replay or personal data.
- This test has finite raw-bar features, no recursive indicators/MW/zone preparation. Do NOT inherit the old3999-bar exclusion, score or fixed-origin calculation contract. Existing raw history is retained for strictly past-only feature construction.

### Calendar and exact target
- Opportunities: entry open T on every UTC :00/:30 clock boundary, fixed independently of prices/outcomes. Decision is the close of preceding5m candle i; entry O[i+1] at T, exit O[i+7] exactly30minutes later. Require both actual opens; do not substitute final-bar close or synthesize an Oct1 open.
- Target y in entry-notional bps: `10000*(O[i+7]/O[i+1]-1)`. No stops/targets, old eligibility or position overlap; each30-minute holding ends at the next opportunity's entry.
- Train: T in July–August, with exit strictly before `2026-09-01T00:00:00Z`. Exclude the Aug31 23:30 entry whose exit reaches September. Test: T in September, with observed exit inside available data. Earlier raw bars may prepare September features, never refit.
- Structurally eligible counts, before invalid-data exclusions: **2973 train**, entries July1 01:00→Aug31 23:00; **1439 September**, entries Sep1 00:00→Sep30 23:00. Last exits Aug31/Sep30 23:30. Independently checked from the calendar alone. Report denominator/exclusion reasons separately; no resampling/clock shift.

### Features and validity
For decision candle i, use raw final OHLCV only through i:
1. Current candle return bps `10000*(C[i]/O[i]-1)`.
2. Range/close `(H[i]-L[i])/C[i]`.
3. Close position `(C[i]-L[i])/(H[i]-L[i])`.
4. Relative volume `V[i]/mean(V[i-10:i])`, ten prior candles excluding i.
5. Preceding30-minute return bps, excluding the current candle: `10000*(C[i-1]/C[i-7]-1)`.
- Augmented model adds only `A[i]=2*B[i]/V[i]-1`, where B is taker-buy base volume, same units as V. No transformations/interactions/clipping/winsorization or additional lags.
- Strict valid finite prices/source fields, H>L, positive current V and prior mean,0<=B<=V, contiguous necessary candles, no unavailable coercion/imputation. Both models use the same common-valid rows including valid A, even though baseline does not use A.
- Coverage gate (planning judgment, fixed now): at least95% of structurally eligible opportunities valid in EACH partition. Below that is inconclusive; no coverage-rule adjustment. Report invalidity by reason/day. No outcome-based exclusions.

### Two models, one fit and seals
- Ordinary least squares WITH intercept: five features versus the same five plus A. Fit exactly once each on the common July–August rows, no regularization, CV, feature selection, refits or hyperparameter search.
- Standardize predictors using training means and population SD only; apply those unchanged to September. y stays in bps. Baseline common-feature scalers equal augmented common-feature scalers. Constant/nonfinite scales or rank-deficient/nonestimable fits => inconclusive, no fallback learner.
- Use a numerically stable QR/SVD least-squares solution with documented solver/version and fixed relative rank tolerance1e-12. Require full column ranks6/7 including intercept. No explicit normal-equation matrix inverse. Validate solver/scalers against independent literal synthetic expectations before real fitting; no application runtime dependency.
- Protocol/code/data seal precedes real target computation/fitting. Coefficient/scaler/solver identity seal must be written and verified BEFORE generating/evaluating September targets/results. No test-set centering, model choice or inspection to decide coefficients.
- Training gate: if augmented raw-unit A coefficient is <=0, stop the direction without evaluating September outcomes; report training rejection and test-not-evaluated, not zero test return. Report raw-unit and standardized coefficient. Failure of estimability/coverage is inconclusive.

### Fixed scoring, primary decision and report
- Forecast sign gives LONG(+1)/SHORT(−1); EXACT unrounded zero gives flat(0), no confidence/epsilon/threshold filter.
- Payoff at cost b per common opportunity: `sign(prediction)*y - b*I(sign!=0)`. Flat contributes0 and pays0; do not divide primary means by only selected trades. Same fixed common-valid September opportunities for both models.
- **Primary b=10bps round trip**.5/20bps are descriptive sensitivities on the SAME frozen forecasts, not selection criteria. Costs are fixed entry-notional assumptions, not account quotes/maker fills or leverage returns. No R denominator.
- Report both models' gross/after-fee means per opportunity, paired augmented-minus-baseline mean at10bps, counts/coverage/long/short/flat, training coefficient, September forecast MSE diagnostically and daily descriptive totals. No confidence intervals/p-values or independence claim.
- Stop this direction if training A coefficient<=0 OR augmented September mean after10bps<=0 OR its paired improvement over baseline<=0. Adequate coverage/estimability required. Passing means only worthy of a separately frozen untouched-data test; no app integration, predictive-edge or fully adjusted profitability claim.
- Funding unapplied/unknown, never zero; fully adjusted return unavailable. Bid/ask/slippage/latency, intrabar/account fills, historical filters and margin/liquidation unmodeled. Q3 was already inspected; September is exploratory despite chronological fitting.

### Delivery and limits
- Synthetic fixtures: aggression signs/units/zero/range guards, exact open-to-open horizon, split/tail exclusions and calendar counts, common masks, train-only scaling, stable fit/rank detection, coefficient gate, zero forecast/payoff denominator/cost once, coefficient-seal-before-test and deterministic output. No real-data broad audit.
- One real fit per model and at most one September evaluation, one worker,300-second wall cap. No reverse sign, alternate horizon/grid/features/model/fee, new venue/timeframe or winning subset after results.
- Preserve current app0.4.17, old policy/calculation code, loaders/datasets/seals and all prior outputs. New isolated research entry point/protocol; no UI/strategy/journal/source migration, account connection or dependency upgrade.
- Keep raw rows/predictions/receipts ignored; track compact protocol/seals/report/quality and source-bound checks. Code/Help-if-relevant/concise STATUS together; required final QA and exact published full CI once. No automatic follow-up or app release; stop after a rejected/inconclusive/passing exploratory report.

## Completed evidence and boundaries
- Derivatives pilot886 trades: gross +0.0799819193R; after5/10/20bps −0.389137/−0.858256/−1.796494R. Both sides/all3 blocks negative at each declared fee. [Report](tests/results/derivatives-pilot-v1/REPORT.md), [summary](tests/results/derivatives-pilot-v1/summary.json).48 independent aggregate identities passed in review; no replay/inference. Funding absent, fully adjusted return unavailable.
- Spot pilot906 trades: gross+0.153283R; after5/10/20bps −0.353337/−0.859956/−1.873195R. [Report](tests/results/policy-pilot-v1/REPORT.md), [CI40733330767](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40733330767). Same inspected quarter/underlying, not independent confirmation or a causal feed comparison.
- [Derivatives intake](tests/results/derivatives-intake-v1/REPORT.md): trade/Mark26496 each, funding276 returned/calendarUNKNOWN; current metadata not historical filters; Mark placeholders not traded volume. [CI40775631512](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40775631512). Old Spot CLI1.0.1/schema1 unchanged.
- [Economics](https://github.com/artimeNFT/hybrid-terminal/blob/fca5bf957a6be66f1d4941778e68719ebd3d1c12/STATUS.md): small stop distances amplify entry-notional cost in R; close/open differences do not establish realistic execution. Complete; no repeated diagnostic.
- [Origin audit](tests/results/calculation-readiness-v1/REPORT.md)/[contract](research/contract/README.md) remain historical.24 sampled timestamps/5 non-WAIT references are not universal live equivalence. [All-zone preparation](tests/results/preparation-v1/REPORT.md)99/964, imbalance/overlap remains separate and unresolved.
- [Capture](tests/results/regional-reload-capture/REPORT.md), [CI40673156079](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40673156079): installed; cause unresolved, inspect next natural artifact only. Old exact0.4.4 hour/0.4.7 midnight observations remain source-specific and are not repeated/transferred.
- Private journals/credentials remain outside GitHub. No real trading/account/wallet access. Never infer leverage/executable quantity/liquidation from this research.
- Primary references checked: [Binance raw kline fields](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data); [training-only preprocessing](https://scikit-learn.org/stable/common_pitfalls); [least squares/rank](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html). Tool choice is implementation-specific; these do not validate a trading edge.

## Continuity and delivery method
One implementation owner, one bounded package. Reuse completed evidence; no repeated cohorts/soaks/general audits. Only operational-document allowlist changes may use short CI; new research/tests require full QA. Skipped is not executed.
Replace this current snapshot rather than append full history. [STATUS_HISTORY.md](STATUS_HISTORY.md), Git and named source-bound reports retain previous boards/contracts/results. A new chat reads START_HERE and current STATUS, verifies live HEAD/CI/access and resumes the exact unfinished task.
