# Confirmed candle price/volume context — 0.4.17 RC

One bounded package from clean/fetched/fast-forwarded main `b3768e604aa51b866b725ce78ca58e68e4826c4b`. The recorded-decision package ([exact published full CI40517556276](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40517556276)) and user-reported navigation/readability/selection acceptance remain complete. They were not restarted. One owner/worktree: `/tmp/hybrid-confirmed-candle-context-0.4.17`, `work/confirmed-candle-context-0.4.17`.

## Source identities and preserved meaning

Active0.4.17 RC SHA-256: `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`.
Exact pre-edit0.4.16: `baseline/hybrid-terminal.0.4.16.html`, SHA-256 `20fd3e34cd83b19081e2aa1c4237d872ec2074ef3407fcb9e24c9c2b911e0339`. This immutable internal baseline is not another active app; root HTML remains the sole user application.

Compared all196 prior named functions through the actual HTML harness:195 source-identical, with only `panel` inserting the nested renderer. Two new read-only functions compute/format descriptive geometry. `analyze` (including the ATR seed/smoothing loop), `volumeReference`, `confirmedVolumeSummary`, `calc`, signal/selection/backtest, feed/epoch/cancellation/history, chart/drawing/sizing and all five journal functions remain exact. Rule `hybrid-v2-validity-closed`, execution `ohlc-market-stop-v2-gap-open`, RSI policy, CLI1.0.1/schema1 unchanged. Only APP_VERSION metadata advances for new observations/exports.

The existing ATR seeds a running average over the first14 true-range values and then uses its existing recursive update. This audit of source informs a **read** of `S.atr[t-1]`; the new display neither copies that formula nor reseeds it from the last14 bars. Availability after14 prior valid candles is not convergence or fixed-origin research parity. Existing ATR finite-prefix dependence is deliberately retained.

`preservation.json` binds unchanged tracked files, exact START_HERE/STATUS_HISTORY, six retained frozen data/checkpoint files and three original observation inputs. Historical baselines/reports/manifests/seals remain exact. No personal browser/journal data, acquisition, cohort/outcome work, repeated live observation, timer/wrapper change or VECTOR LAB work.

## Controls and semantics

1. In the Hebrew panel, expand **הקשר · נרות סגורים**; on narrow screens this is below the chart.
2. Expand **קריאת הנר המאושר · מחיר ונפח**. It is initially collapsed. Symbol/timeframe and explicit UTC decision-input candle close identify its anchor.
3. Read the existing confirmed volume ratio/state/Normal–Rising volume–Vector classification/own-candle direction, followed by range/priorATR14, body percentage and close position. Expand **ערכים מדויקים, נוסחאות ומגבלות** for exact source/previous-ATR values and formulas; the JSON scroll region is keyboard focusable.

| Display | Definition and guarded availability |
| --- | --- |
| Existing Volume | Actual `confirmedVolumeSummary()` object with matching symbol/timeframe/open/close; same prior10 mean/reference states/classification/direction. No second relative-volume/PVSRA definition. Genuine ratio0 remains0; Normal default is disclosed when the existing ratio is unavailable. Vector can qualify via volume×range. |
| Range / prior ATR14 | `(H-L)/S.atr[t-1]`. Four supported chart intervals; current closed valid finite OHLCV/time and14 preceding closed valid candles with exact interval continuity through the current candle, plus positive finite previous ATR. Warm-up, invalid history, unavailable/zero ATR and arithmetic failure are distinct states. |
| Body percentage | `100*abs(C-O)/(H-L)`, with stable divide-before-multiply arithmetic. Valid current source/range only; independent of ATR availability. |
| Close position | `100*(C-L)/(H-L)`;0%=low,100%=high, independent of open/close direction. Same independent current-range guards. |

Valid zero range permits range/ATR0 with valid denominator; body/close position are unavailable, not zero. A non-flat doji has body0. Missing/nonfinite inputs are never coerced to zero. The current intrabar high-low range excludes the opening gap; it is not true range. Geometry descriptions are not measured buy/sell flow, probabilities, predictive categories, composite scores or extra votes.

The anchor reads `S.k[S.closedIndex]` and original `S.atr`, never chart-only `S.history`/`S.chart`, mouse/crosshair, provisional candle or selected journal record. New confirmation advances it. Existing guarded loads clear old context; delayed symbol/timeframe responses cannot replace the new source. Existing nested `data-detail` preservation retains section/exact open state during normal updates. No new settings, storage key, overlays, timers, requests or dependencies. Current live panel, JSON exports, journal and chart semantics remain unchanged.

## Performed validation and independent examples

Final source-bound commands, logs and group manifests accompany this report. Inputs are synthetic/mocked; required CI needs no acquired dataset.

- `npm test`: PASS — app9; unchanged frozen research18/audit9/contract9/preparation13; presentation14 suites/109 cases including10 new context cases.
- `npm run test:browser`: PASS —19 actual mocked Chromium suites. New suite covers1440/390/320 keyboard expanders, initial collapse, exact JSON/formula direction, actual source arithmetic, native hover/pan/history/old-journal selection, provisional and confirmed WebSocket updates, retained open state, and held/obsolete symbol/timeframe responses. Public requests are mocked/guarded; no live-feed claim.
- Independent expected arithmetic:14 prior candles with H102/L98/close100 give priorATR4. Current O100/H106/L98/C104 yields range8, rangeATR2, body50%, close75%. Current O105/C104 retains close75% while direction turns Down and body becomes12.5%. Low/high closes yield0/100%; non-flat doji body0.
- Opening-gap fixture O200/H204/L196/C202 after previous close100 still has intrabar range8/priorATR4=2 (body25%, close75%); the **current** true-range ATR is different and is not used as denominator.
- Normal confirmation after the first wide candle reads priorATR30/7, rangeATR28/15, body25%, close50%, real volume ratio0. It advances only on confirmation; the provisional wide/high-volume candle leaves the prior confirmed context, signal/backtest/journal and closed indicator prefix unchanged.
- Guards cover minimum14 prior versus13, unclosed/invalid/discontinuous prior bars, missing/string/zero/negative/nonfinite ATR, zero range, zero volume/reference, invalid current source and range/ATR overflow independently of finite body/position percentages. Large valid OHLC avoids unnecessary `100*largeNumber` overflow. Prepending older wide-range input changes the existing ATR reference despite the same last14 bars, proving dependence is retained rather than silently reseeded.
- Source/decision/backtest/journal/native Canvas parity against0.4.16, no view-induced storage/network/analysis calls, unchanged raw records/preferences, exact ATR/Volume implementations and source functions verified. Existing required suites protect Volume/ADR/regional/Line/drawings and journal behavior; this is regression coverage, not a repeat of accepted user tasks.
- A focused screenshot rerun after the full browser group aligns the selected section with the viewport top so all compact metrics are visible; this changes only test capture scrolling, with the same application source/assertions. Final screenshots actually inspected are named in `screenshots.json`; raw captures/traces remain ignored/local under implementation `.qa-results/browser/browser-confirmed-candle-context/`. Exact formula `bdi` direction is checked in both Help languages. Physical touch, assistive technology/translation and user perception are not inferred from emulation.
- `git diff --check`, active scoped hashes and unchanged protected/frozen/observation inputs: PASS.

A focused development assertion initially compared whole indicator arrays after a provisional append. Existing behavior correctly extends developing arrays; the assertion was corrected to compare the confirmed prefix plus unchanged signal/backtest/journal, while the entire confirmed context is still compared exactly. This was a fixture correction, not an application calculation fix; the initial focused log is retained with trailing whitespace normalized for Git; its original local bytes/hash are identified in source-identities.json. Full final suites are run after source settled.

## Publication and evidence availability

Code, equivalent Help, concise CURRENT STATUS and scoped evidence publish once through safe clean-main fast-forward/push, without force. Actual exact-published CI must select full QA and all3 jobs complete successfully. Delivery receipts/decoded-log summary/remote-main SHA and final clean/preservation check remain ignored in authoritative root `.qa-results/confirmed-candle-context-0.4.17/`; no second commit only to announce CI. This prepublication report does not invent a future run identity.

New scoped bindings are `qa/source-checksums.0.4.17.json` and `qa/confirmed-candle-context-0.4.17-sha256.json`. Old bindings are historical and untouched. Local-only screenshot availability is explicit; repository-only readers should use the tracked registry/report rather than assume access to a WSL image.

## Limits and next unfinished action

Prior ATR remains history-origin dependent; no convergence, strategy edge, trade outcomes, order-flow measurement or probability claim. Exact0.4.4 hour/0.4.7 midnight observations are not transferred or repeated. Journal0.4.16 user acceptance stays complete and scoped to the reported desktop navigation/readability/selection observations; new-context human readability, physical hardware, screen-reader/translation and extended current-source live acceptance remain unobserved. Existing browser-origin/local storage durability limits persist.

After exact published CI and final source/preservation verification, stop. The next unfinished action is optional bounded ordinary-device readability feedback on this new section; no automatic feature, research task or repeated journal/reload acceptance.
