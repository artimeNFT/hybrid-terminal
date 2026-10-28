# Taker-aggression increment v1 — training rejection

Client date: 2026-10-29, Asia/Jerusalem. Actual UTC receipt times below.

**Verdict: training-rejected. September: test-not-evaluated.**

The augmented raw-unit aggression coefficient is **-2.898428919396 bps per unit A**, standardized **-0.787728113999 bps per training population SD**. It is nonpositive, so the predeclared persistence direction stops. No September labels, forecasts, MSE, gross/fee-only means, directional counts or daily performance were generated. These values are unavailable/null, not zero. No sign reversal, refit, new threshold or alternate test was attempted.

This result rejects progression under this contract; it does not establish that aggression has no information in every setting or that reversing its sign works. Q3 was already inspected; no inference, predictive advantage or independent confirmation is claimed.

**gross / after modeled fees, before funding and other unmodeled execution/account effects** — the result family remains explicit, but its September values were not computed. Funding is `not-applied: calendar completeness and account settlement timing unverified`, unavailable/null, never zero. Fully adjusted return unavailable.

## Frozen question, source and chronology

- Independent of the paused five-condition policy: no old eligibility, score, indicator, stop, target, R denominator or engine replay. Only finite raw trade OHLCV/base-taker fields. No acquisition, Mark substitution, account/browser-profile access or application change.
- Exact reviewed [contract](../../../research/aggression-increment/CONTRACT.md), preserved verbatim from `df416deb8612c5e68661b73e74a3680677cff269`; [machine protocol](../../../research/aggression-increment/protocol.json); [implementation/solver notes](../../../research/aggression-increment/README.md). Pre-label local commit `eadcee364898b243b46c12433d8ed19fe2c5326a`.
- [Pre-label seal](../../../research/aggression-increment/seal.json) UTC `2026-10-28T23:12:34.112Z`, SHA `88387eea5e00a1b6397e45fcae4b947348536fd01a9a73a242927f589b410e14`. Zero real targets/fits before sealing. Canonical protocol `cef8bfcfa1a64e275793f4d1870cde0c57f004c42748468133d2134c27be7844`. Runtime implementation unchanged after sealing.
- [Coefficient/scaler seal](../../../research/aggression-increment/fit-seal.json) UTC `2026-10-28T23:14:30.686Z`, SHA `ad874dc82dbe2bba59623e40bb404b97d0758c6c13e98cb0240ed289c10569d7`. Includes training row hash, both scalers/models, raw/standardized coefficients, rank diagnostics and solver identity. Written and read back/verified before the conditional test branch; no September targets before it.
- One real attempt, one baseline fit and one augmented fit, zero September evaluations; **2.176925s /300s**, one 256MiB-heap worker, Node `v24.15.0`, complete UTC `2026-10-28T23:14:30.884Z`. No retry/refit.

## Data and exact time coordinates

- Existing Binance USDⓈ-M BTCUSDT linear USDT-perpetual 5m trade dataset, 26496 closed bars, UTC `[2026-07-01,2026-10-01)`. Unchanged typed derivatives loader validates schema/units/hash/complete grid; raw tuple[9] taker-buy base volume and tuple[5] total base volume are both BTC. No quote/base mixing or Mark placeholders.
- Trade payload `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`; original trade-file SHA `d3fe4e7db46ceccc6b17f35298577fc1072c1298602cf22c535ba0b7ec48bbca`; bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`. Pinned trade bytes and bundle-manifest hash references were validated, including September raw trade-source bytes; that validation is distinct from constructing/evaluating September labels or opportunity masks. September is not represented as untouched evidence.
- UTC :00/:30 entry boundaries fixed independently of price/outcomes. Decision candle i closes at entry T; entry O[i+1], exit O[i+7] exactly 30 minutes later. y=10000×(exitOpen/entryOpen−1), bps. No final-close/Oct1-open substitution.
- Train entries July1 01:00→Aug31 23:00; last exit Aug31 23:30 strictly before September. Two initial-history slots and Aug31 23:30 split-crossing entry excluded by calendar. No old 3999-bar preparation exclusion. September calendar 1439 entries Sep1 00:00→Sep30 23:00, last exit 23:30; Sep30 23:30 entry excluded because Oct1 open is absent.

| Partition | Structural opportunities | Common-valid | Invalid | Coverage | State |
| --- | ---: | ---: | ---: | --- | --- |
| July–August | 2973 | 2973 | 0 | 100% (gate≥95%) | Fitted once each |
| September | 1439 | unavailable | unavailable | Not assessed after training rejection | No evaluation |

Training invalidity reason counts are empty on every day; exact daily denominators are in [quality.json](quality.json). No outcome-based exclusions or imputation. Both models use the same valid A mask. September validity is not inferred from raw-grid coverage.

## Fixed features and fit

Baseline: current candle return 10000×(C/O−1); range/close; close position(C−L)/(H−L); volume/prior-ten-volume mean excluding current; preceding30-minute return 10000×(C[i−1]/C[i−7]−1), excluding current. Augmented adds only A=2B/V−1. Necessary source candles contiguous; current H>L, current V>0, prior mean>0, finite positive prices and 0≤B≤V. No clipping, interactions, extra lag, tuning or transformation beyond declared training-only standardization.

OLS with intercept, training means/population SD only; baseline common scalers exactly equal augmented first five. y remains bps. `hybrid-householder-column-pivoted-qr/1.0.0`, no normal-equation inverse/regularization/fallback. Relative rank rule abs(Rkk)>1e-12×max(abs(diag(R))); full ranks6/7 required and obtained. Coefficients below are descriptive fit parameters, not independent trading votes or causal effects. Full precision is sealed.

| Parameter | Baseline raw | Baseline standardized | Augmented raw | Augmented standardized |
| --- | ---: | ---: | ---: | ---: |
| Intercept | -0.43096663888 | 1.02293340884 | -0.749484780621 | 1.02293340884 |
| Current candle return bps | 0.0679910036047 | 0.660783868509 | 0.0957020354912 | 0.930098952558 |
| Range / close | 973.186600907 | 1.28771167806 | 921.078848146 | 1.21876317251 |
| Close position | 1.57095255871 | 0.544244241178 | 2.22829008597 | 0.771973692166 |
| Relative volume vs prior10 | -0.435020513761 | -0.543901464165 | -0.419465207984 | -0.524452832849 |
| Preceding30m return bps | -0.0212025303333 | -0.556064178938 | -0.021309170885 | -0.558860967336 |
| Aggression A | not included | not included | -2.8984289194 | -0.787728113999 |

Raw predictor coefficients are target bps per raw feature unit; standardized coefficients are bps per training SD. Intercepts follow their respective parameterizations. The negative aggression coefficient is not turned into a contrarian strategy.

## Unreached test and cost rule

The frozen rule would use exact unrounded forecast sign (+1/−1/0), with zero flat, payoff=sign×y−bps×I(nonflat), divided by every common-valid opportunity including flat. Primary 10bps requires augmented mean>0 AND paired augmented-minus-baseline mean>0. The 5/20bps are sensitivities on the same forecasts and cannot rescue rejection. No stops, thresholds or selected-trade denominator. These rules were not evaluated on September because the training gate already rejected. September MSE and daily/long/short/flat counts are unavailable, not fabricated.

## Validation, preservation and evidence

- 12 focused synthetic cases passed: independently specified feature/horizon/calendar arithmetic; invalid/common masks and exact 95% gate; literal orthogonal OLS coefficients/scalers/residual errors; exact/near rank failure; training-only preprocessing; negative/exact-zero gate with no September access; persisted coefficient-seal ordering; exact tiny/zero forecasts, per-opportunity costs, MSE/daily totals; deterministic output and historical-byte checks. A signed-zero test assertion was corrected before outcomes; the runtime already treated both zeros as nonpositive.
- Stored verification without refit/new labels passed; independent Python **55** stored hash/calendar/scaler/coefficient/gate checks plus training-material-hash reconciliation passed. No second QR fit, real-label regeneration or September access. Raw/summary hashes `1fffb2700a42d75250af3ad93b6e3624f6f9b2a28fbaecd2c4265f144b51b073` / `56e3e729a9c884e6f46a9aa69948d14d57a23f8ce60b8baecfdfa0ec030f065e`.
- Required local `npm test` passed all groups; the final focused suite additionally checks the actual coefficient seal binding. Exact-publication full CI is verified after the single push and reported at handoff/ignored receipt, not inferred from prior CI. CI uses synthetic fixtures only.
- 770 existing protected tracked files and ignored data/prior-output receipts checked unchanged. Active app 0.4.17 RC SHA `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`, Spot 1.0.1/schema 1, frozen engines, all prior seals/datasets/manifests remain intact. No dependency, feed, strategy, journal or preference changes. No live soak, old-policy acquired-data replay or research-cohort rerun.
- Primary training rows and run receipts remain ignored at `.qa-results/aggression-increment-v1/run/`; the raw file contains training rows only and `testRows:null`. Compact summary/quality/delivery and both seals are published. `node research/aggression-increment.cjs verify --out .qa-results/aggression-increment-v1/run` validates retained outputs without refitting.

## Limits and stop

Taker aggregation cannot establish order-book depth, cancellations/replenishment, absorption, intent, precise trade ordering or executable spreads. Bid/ask/slippage/latency, intrabar/account fills, historical filters, funding settlement/calendar and margin/liquidation remain unknown/unmodeled. No verified account-fee tier or fully adjusted performance. Q3 remains exploratory.

**Stop this declared direction at training rejection.** No sign reversal, model/feature/horizon/venue/fee search, refit, September peek or application integration. Any later research/product task requires a new bounded instruction; this package proposes no replacement hypothesis.
