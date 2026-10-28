# Hybrid Terminal — current status
Updated: 2026-10-29, Asia/Jerusalem. Single current task board; start with [START_HERE.md](START_HERE.md).

## Verified checkpoint and completed work
- Private repository [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main. Sole active app: `/mnt/c/users/shlom/desktop/the hybrid-terminal/hybrid-terminal.html`; VECTOR LAB is separate.
- App **0.4.17 RC remains byte-for-byte unchanged**, SHA-256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`; application commit `1608a5d98bbed55839bec28c22880144cdcb01c0`. No application release/feed/strategy change in this package.
- Existing pilot `e5198f856d8829621aa16ff576c67c453e0fc63f`, [full CI40733330767](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40733330767), attempt 1 passed all 3 jobs/20 Chromium suites. One 906-trade run remains unchanged; no outcomes/replay in this package. [Report](tests/results/policy-pilot-v1/REPORT.md), [summary](tests/results/policy-pilot-v1/summary.json).
- Read-only economics `fca5bf957a6be66f1d4941778e68719ebd3d1c12`, [documentation CI40767950669](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40767950669) passed scope/regression; deterministic/browser skipped. Accepted/closed: median stop 14.000168bps, modeled 10 bps median cost 0.714277R/ mean 1.013239R. Full table remains at that STATUS commit and ignored economics receipts; no diagnostic repeated.
- Capture `1ea5eac40882178076688378edfd1434d4801c2e`/[CI40673156079](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40673156079) remains installed/monitored, cause unresolved. Chart/journal/context complete; user journal desktop acceptance 2026-10-27 retained.

## Delivered — one derivatives gross/fee-only pilot
**Completed single bounded run**, using existing verified BTCUSDT USDⓈ-M linear USDT-perpetual trade data only. Planning `6e839eba7d83000ef4af57610c067d232e6c16f5`; pre-outcome code/protocol/source/data checkpoint `b3604638109ef196c4e92578fed8016a4b6d76b4`. [Report](tests/results/derivatives-pilot-v1/REPORT.md), [whole/side/block summary](tests/results/derivatives-pilot-v1/summary.json), [delivery identities](tests/results/derivatives-pilot-v1/delivery.json), [complete reviewed contract](research/derivatives-pilot/REVIEW_CONTRACT.md).

**gross / after modeled fees, before funding and other unmodeled execution/account effects**

| Population | Trades | Gross mean R | After 5bps | After 10bps | After 20bps |
| --- | ---: | ---: | ---: | ---: | ---: |
| Whole | 886 | 0.079982 | -0.389137 | -0.858256 | -1.796494 |
| LONG | 413 | 0.068078 | -0.415786 | -0.899650 | -1.867379 |
| SHORT | 473 | 0.090376 | -0.365869 | -0.822113 | -1.734601 |
| Block 1 | 325 | 0.085404 | -0.436778 | -0.958961 | -2.003325 |
| Block 2 | 287 | 0.045577 | -0.464335 | -0.974248 | -1.994074 |
| Block 3 | 274 | 0.109587 | -0.253862 | -0.617312 | -1.344211 |

All declared fee scenarios have negative means for the whole population, each side and every block. Exploratory description, no inference/retuning/advantage claim. Funding state **`not-applied: calendar completeness and account settlement timing unverified`**, value unavailable/null, never zero; fully adjusted return unavailable. No bound on omitted funding/account/execution effects. Median stop 14.175177 entry-notional bps; mean 10bps CostR 0.938238 explains the gross-to-fee-only deduction.

**Protocol and preservation:** separate derivatives typed loader/calculation contract; no Spot loader/Spot contract identity, Mark volume or Mark fills. Full July1 past prefix, score3/original SHORT tie and all frozen rules/execution retained. Flat index3999 through26375; original expiry i+120→next i+122 and final-bar-hit→next i+121 retained. Three equal continuous blocks, no resets. Fixed5/10/20bps replace source10bps once. [Seal](research/derivatives-pilot/seal.json) UTC `2026-10-28T22:25:52.913Z`, canonical protocol `4944bd1c272a28b903b5c9b808a77c83e0207ad8850bbc47a8ddf813dba09ef8`, calculation contract `f740da9b9d456a789abba2e063c95583c52a32950f68d836196ae9fa06b8fe5f`. Runtime implementation unchanged after seal.

**Data/output identity:** 26496 trade rows, payload `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`, bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`; existing immutable intake preserved, no requests/reacquisition. Raw hash `4e87b085f3e2d6087fb05c958bdf4852349971adfcbcf334ca3c4d7d9ef213fc`, summary canonical hash `f2496a88dfde6a3a85b82582144d2a0269afac329e286e261b26df1c56a235bd`. Primary trace/receipts ignored at `.qa-results/derivatives-pilot-v1/run/`; acquired data remains ignored in its existing directory.

**Measured checks:** exactly one run 332.914s /3600s, complete at `2026-10-28T22:32:48.504Z`. Scheduling partition 22377=11633 considered+10724 held+20 expiry skips;10747 WAIT/no-plan,886 selected/traded,0 invalid entries/unavailable calculations. Stops566/TP2 300/expiry20,0 stop-at-open,419 TP1 flags,1 both-touch,2 cross-block holdings. Stored verification without replay passed; independent Python67746 aggregate/identity checks passed. Ten focused synthetic fixtures passed, including actual tracked seal and original-engine/execution/scheduling/cost/missing-component checks. `npm test` passed all required groups; final focused seal assertion also passed. 755 existing protected files/receipts unchanged. Prior origin audit reused; no new broad parity audit.

**Publication QA verified:** commit **045a6b4d7ce20dfbd4f2a400b50fb2aea9bf8bf8**, [exact CI40781160320](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40781160320) attempt1: scope/deterministic/Chromium jobs all actually succeeded, including20 browser suites. Independently inspected through GitHub. Receipt remains ignored at `.qa-results/derivatives-pilot-v1/run/ci-verification.json`. No rerun or application release.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| Done | Derivatives gross/fee-only pilot | One run/report/exact full CI40781160320 verified. Negative after every declared fee; no new run. |
| P1 | Post-pilot decision | Current five-condition5m policy research paused. Next: one focused hypothesis-design challenge using existing retained inputs; design only, no implementation/outcomes. |
| Done | Contract-matched intake | `34b76b47c1ab4592ca5eacdaf28caad9762080d7` / [CI40775631512](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40775631512) passed; trade/Mark26496 each, funding276 retrieved/calendar UNKNOWN. [Intake report](tests/results/derivatives-intake-v1/REPORT.md). |
| Done | Spot pilot/economics and app/context | Historical sources/datasets/seals/reports and app0.4.17 preserved; no replay/release. |
| Done / monitored | Regional reload capture | Installed; cause unresolved, inspect natural failure evidence only. |
| P2 | Preserved gaps | Live initialization/append/reload equivalence, all-zone99/964 imbalance/overlap, physical touch/accessibility/Psy/TR parity unresolved. |
| P2 | CLI credential storage | Plaintext-storage follow-up; no credential display/global changes. |

## Independent interpretation and decision — 2026-10-29
- Independently recomputed48 count/mean/linear-fee identities from the tracked whole/side/block aggregate summary; all passed. This is stored-summary arithmetic, not another pilot, raw execution replay or statistical inference.
- Gross mean0.0799819193R; mean5bps deduction0.4691189660R. All whole/side/block means negative after each declared fee. Fully adjusted returns remain unavailable: funding may pay or charge, and missing effects are unbounded. Do not relabel fee-only findings as complete account losses/profitability.
- Spot906 and derivatives886 trades cover the same inspected quarter and correlated underlying; they are not independent confirmations. No causal claim that changing the feed caused a performance difference. The unchanged rules have no demonstrated tradable edge under these tested assumptions.
- Pause further runs/tuning of this five-condition5m policy. Do not automatically alter score/stop/target, prefer a subgroup, lower fees, try more venues/timeframes, or pursue funding as a way to rescue the outcome.
- Keep the terminal's manual chart/context/risk/journal utility separate from strategy validation. Current app0.4.17 remains unchanged; no new feature or restriction is implemented by this decision. Existing UI/backlog priorities are preserved, not erased.
- Existing candidate information: Binance official API documents taker-buy base and quote volume in fields9/10, already retained by the derivatives intake. A potential normalized imbalance is2*takerBuyBase/totalBase−1 with strict valid positive denominator; a mathematical description, not net money entering, actual absorption or predictive value. No such feature has been calculated or tested here. Source checked2026-10-29: https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data .
- Any later test remains exploratory on Q3; an independent baseline and untouched-data design are required before a predictive-advantage claim. No new data acquisition or release now.

## Limitations and exact next action
Funding calendar/account settlement ordering, actual fees/spread/slippage, historical tick/lot/filter sizing, partial fills/latency and leverage/margin/liquidation/insurance effects remain unverified/unmodeled. Current metadata is not Q3 rules; 5m OHLC is not account execution. July1 finite-prefix calculations do not establish universal live equivalence or absolute convergence. No fully adjusted return or causal Spot-versus-futures advantage claimed; contracts remain priority, no final venue/account/fee tier selected.

**Exact next action:** one focused independent hypothesis-design challenge, relayed by the user to Claude, then choose/reject one candidate before any implementation. No Codex task is active. A candidate is venue-specific taker-aggression information already retained in trade klines (total/base/quote volume and taker-buy base/quote), evaluated independently rather than automatically added as a sixth score vote. Ask for one falsifiable question, a geometry/volatility-aware baseline, cost feasibility and a bounded first test/stop rule. A recommendation to stop is acceptable. No general audit, parameter/venue/timeframe search, new feed/cohort or outcome computation is authorized by this planning update.

Application 0.4.17, Spot1.0.1/schema1, all frozen source/data/seals and historical checksum manifests remain unchanged; no journal/profile/preference/feed/account/dependency access/change. Exact0.4.4 hour and0.4.7 midnight acceptance stay source-bound, not repeated/transferred. README correction already complete. [STATUS_HISTORY.md](STATUS_HISTORY.md), Git and historical reports preserve earlier evidence.
