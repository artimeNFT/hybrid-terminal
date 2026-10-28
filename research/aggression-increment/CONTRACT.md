# Taker-aggression increment v1 — frozen review contract

Reviewed checkpoint: `df416deb8612c5e68661b73e74a3680677cff269`. Copied verbatim from its current STATUS before labels or fits.

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

