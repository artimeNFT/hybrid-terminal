# Taker-aggression increment v1

One standalone exploratory test, independent of the paused five-condition policy. The exact reviewed [contract](CONTRACT.md) and [machine protocol](protocol.json) govern it. The active application, frozen calculation engines and historical seals are not modified or executed. No acquisition or account access.

## Stages and commands

From the repository root, Node24, no new dependency:

```sh
node research/aggression-increment.cjs seal --dataset research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/trade.json --out .qa-results/aggression-increment-v1/run
node research/aggression-increment.cjs run --dataset research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/trade.json --out .qa-results/aggression-increment-v1/run
node research/aggression-increment.cjs verify --out .qa-results/aggression-increment-v1/run
```

These document the single authorized run, not permission for another. `seal.json`, the run claim and coefficient seal use exclusive creation; an incomplete attempt cannot be silently retried. The new source/protocol/data seal precedes real labels/fits. `fit-seal.json` contains both models, training-only scalers, rank/solver details and the training-material hash; it is written to the research directory and ignored output directory and verified before any September features/targets/evaluation. A nonpositive raw-unit aggression coefficient stops there: September performance is unavailable, not zero. Coverage/rank/scale failures are inconclusive. The300-second controller terminates its one256MiB-heap worker on failure; no fallback, refit or approximation.

`verify` checks stored identities/hashes/gates and, if evaluated, aggregates stored forecasts only. It generates no targets, fits or forecasts. Primary rows, predictions, daily receipts and runtime logs stay ignored. A compact report, quality, coefficients and seals are tracked. Funding is unapplied/unknown; fully adjusted returns remain unavailable.

## Solver and preprocessing

`hybrid-householder-column-pivoted-qr/1.0.0`, implemented in `ols.cjs`, uses native double precision, Householder reflections and trailing-norm column pivoting (ties keep current column order). Intercept plus five/six predictors. No normal equations, explicit inverse, regularization or fallback learner. Rank is the number of absolute R diagonals strictly greater than `1e-12 * max(abs(diag(R)))`; full ranks6/7 are required. Synthetic orthogonal-design expectations independently specify coefficients, population scales, residual errors and near-rank cases before any real fit.

Predictor means and population SD use common training rows only; the same first five scalers are reused for both models. Constant columns are explicitly detected, with no artificial scale. Targets remain in bps. Standardized coefficients are bps per training SD; raw coefficients divide by that SD, with the intercept transformed back. Exact unrounded prediction signs determine LONG/SHORT/flat; no epsilon. Every primary mean includes all common-valid opportunities, including flat forecasts. Daily totals and MSE are descriptive; they do not select a model.

The loader calls the unchanged typed derivatives trade loader for source/units/hash/complete-grid validation and adds only the original tuple[9] taker-buy base volume alongside tuple[5] total base volume. Pure decimal helpers are reused without adopting a Spot input schema. It does not import any old calculation adapter or execution engine. Mark/funding arrays never enter the test. Feature masks are based on necessary valid source values, never the target's sign or profitability. Nonfinite target arithmetic stops inconclusive rather than dropping an outcome. Invalidity reason counts can overlap; excluded-opportunity counts do not.

Q3, including September, was already inspected. A declared exploratory pass would justify only a separately frozen untouched-data test, not an advantage claim, fully adjusted profitability or application integration. Negative/inconclusive results stop this direction without tuning.
