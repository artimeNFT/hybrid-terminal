# Product context 0.4.18 RC — delivery

Sole active file: root `hybrid-terminal.html`. SHA-256 **`a873886edf0137d1aa6a62eb2195e1ff1f0f749272e0f1b9fc60130dd0b76881`**. Implementation baseline: `9b46ccd6405412c512ad69e93553c51417670d82`; exact previous 0.4.17 preserved internally as `baseline/hybrid-terminal.0.4.17.html`, SHA `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`. The numbered baseline is not another user application. [Reviewed scope](HANDOFF.md).

## User steps

1. Open the same root HTML (refresh an already-open old version normally). In the header, use **Market: Spot / USDⓈ-M Perpetual**. Fresh installations use Spot; an explicit valid saved selection restores.
2. Wait for the selected-product source label, feed health and confirmed timestamp. If unavailable, it stays unavailable; no Spot fallback. **Refresh** permits a deliberate new attempt. Feed freshness is not predictive validation or proof of calculation convergence.
3. Existing **Display**, **History +1,000**, HTF, daily levels/Pivots/ADR and chart navigation now use that product's trade candles. Mark/index/funding are not fetched or substituted.
4. Drawings and Volume settings restore for their own product/symbol/timeframe. They are not copied across products. The journal's **מוצר שנרשם** filter distinguishes new records; old missing provenance remains unavailable. All records still share rolling 1000 retention.

## Routes and official specifications

| Path | Spot | USDⓈ-M Perpetual |
| --- | --- | --- |
| Clock | `https://api.binance.com/api/v3/time` | `https://fapi.binance.com/fapi/v1/time` |
| Initial/resync/history/HTF/UTC daily | `https://api.binance.com/api/v3/klines` | `https://fapi.binance.com/fapi/v1/klines` |
| Kline stream | `wss://stream.binance.com:9443/ws/<symbol>@kline_<tf>` | `wss://fstream.binance.com/market/ws/<symbol>@kline_<tf>` |

Verified current primary docs before route selection: [USDⓈ-M REST market data](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data), [Market kline streams](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/ws-streams/market), [2026 URL architecture announcement](https://www.binance.com/en-NG/support/announcement/detail/ebf9b0aa9eca4ff3804eef6fb09ba32a), [Spot WebSocket specification](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md). Klines belong to `/market`, not the old bare futures URL or `/public` depth category. Trade volume is base asset; price is USDT per base asset. Wrong-symbol/timeframe/non-kline and explicitly wrong futures market-type frames are rejected. No private endpoint, account key, orders, backend or dependency added.

## Isolation, storage and behavior

- One explicit product catalog routes every existing network path. Source/request epochs, captured product and cancellation isolate initialization, HTF, history, daily caches and WS/reconnects. Switching clears old data/plan/history/clock trust, cancels draft/selection/menu gestures, and waits for valid selected-source input. Daily cache/request identity includes venue/product; market context guards reject mismatches.
- Initial REST access failure stops. Access-blocked daily requests stop until deliberate Refresh; other consecutive daily failures stop after 3. WS reconnection before a valid message is bounded to 3 attempts (3/6/12s); a healthy received message resets that budget. There is no alternate-host/product fallback. Normal explicitly initiated refresh/online/resume behavior remains.
- Isolated `hybridTerminal.marketProduct.v1` schema1 stores only selection. Malformed/unsupported/read-failed/external-change/write-failed preference bytes are retained, with a visible session-only status. Other preferences remain unchanged.
- Spot drawing key `hybridTerminal.manualDrawings.v1` and Volume key `hybridTerminal.volumePane.v2` keep their schema/bytes; new perpetual keys are `hybridTerminal.manualDrawings.usdm.v1` / `hybridTerminal.volumePane.usdm.v2`. Each retains existing collection limits/validation and external-change/write-failure guards. Unsaved state stays product-local in memory. Spot-only legacy Volume height handling is unchanged; an old Spot ceiling is never assigned to perpetual.
- Journal remains the same schema1/global rolling 1000 store. Spot IDs and signal signatures stay exact. Perpetual IDs prefix `BINANCE|usdm|`; new records additionally carry venue/product/source and source-context routes/units, outside the signal signature. Existing records are neither enriched nor re-signed. Repeated switch/refresh of an already observed candle deduplicates. Legacy product is classified only from its own explicit fields/source, never from live mode or guessed ID.
- Header/canvas/panel/export/Help expose selected source; journal browse exposes recorded source. Spot cash coverage is disabled as a margin approval in perpetual mode; nominal geometry remains available and does not produce executable quantity. Planning costs remain assumptions. Perpetual simulation statistics disclose missing funding/account effects. Strategy/indicator/selection/stop/target/execution algorithms and versions are unchanged; product prices may produce different outputs without proving advantage or live equivalence.

## Actual validation

| Check | Performed evidence |
| --- | --- |
| Deterministic project QA | `npm test` completed all existing groups, with product tests registered in `test:app`; frozen research checks run only synthetic fixtures. Final focused suite 8/8 passed. |
| Spot golden | Exact0.4.17 algorithm bodies and indicator/decision/backtest arrays on fixed/random/mirrored fixtures; original journal IDs/signatures/records retained, native chart pixels retained. |
| Product fixtures | All 12 perpetual symbol/timeframe combinations, all REST routes, stale initial/daily/HTF/history/WS/reconnect, product-specific drawings/Volume, valid/invalid/read/write/external-change storage, unavailable source/no fallback and cash-versus-margin separation. |
| Actual mocked Chromium | Desktop1440 and narrow320 controls, pointer/touch-emulated drawing creation, product restoration, native isolated file-origin reload, source labels, storage and both Help languages. Existing 20 browser suites passed across the initial run plus six version-bound reruns; required exact publication CI runs the complete set once. |
| Preservation | 140 previously tracked frozen source/data/seal/historical-manifest and ignored prior-output/data identities unchanged. Original sealed QA runner and policy-pilot test/validator unchanged. |
| Public feed | Single native Chromium/file-origin smoke **PASS**; **4.527144s**, **5 REST** (all 200), **1 WS**, **1 stream update**. Product usdm, clock trusted, phase live, feed healthy, daily source ready. No route violation, page error, fallback or retry observed. Bound120s/24REST/2WS honored. |

Public receipt: ignored `.qa-results/product-context-0.4.18/public-smoke-20261029/receipt.json`; source hash equals this release. This verifies routing/native-browser access and a stream update only. Confirmed initial REST history is not a witnessed candle-close advance. No hour soak, midnight observation, research acquisition/replay or execution acceptance claimed. Only BTCUSDT 5m was publicly smoked; the other combinations are mocked acceptance.

During development, screenshot inspection caught a stale static Spot source label and it was corrected before the final smoke. Compatibility expectations were advanced to0.4.18 and explicitly allow only documented source/view/storage changes; mathematical bodies and legacy record comparisons remain strict. Journal golden comparison excludes only newly specified provenance/observation metadata for new appends, while comparing all existing signal/identity fields.

## Historical research context

A previous Spot pilot additionally sealed the then-active0.4.17 hash. Its files cannot be rewritten to follow a new UI. New opt-in `research/source-context/pilot-0.4.17.cjs` provides the exact archived0.4.17 logical identity before the unchanged historical loader selects frozen0.4.3 calculations. It logs both the real live hash and archived hash, validates the physical archive/original loader bytes, and leaves all original seal checks enabled. `test:preparation` explicitly chooses this context only for the old pilot fixtures; other current-root tests use the live app. No old seal is rewritten and no historical Q3 outcomes are regenerated. The new aggression fixture's historical UI preservation assertion likewise names the exact physical0.4.17 baseline. Historical checksum manifests retain their original declarations; the new scoped manifest records current QA bindings honestly.

## Screenshots and limits

[Desktop](desktop.png), [320px](narrow.png), [Hebrew Help](help-he.png), [English Help](help-en.png) were actually inspected. Screenshots use synthetic prices/isolated QA storage, not personal journal data or the public smoke. Source-bound browser evidence remains ignored at `.qa-results/product-context-0.4.18/browser/evidence.json`.

Physical touch/screen-reader/human readability, ordinary user-profile persistence, broader regional/API availability and long-session/candle-close/midnight behavior on0.4.18 remain unverified. Previous0.4.4/0.4.7 observations do not transfer. No account fees, funding settlement, margin/leverage/liquidation, executable sizing or account permissions are established. Existing negative research and training rejection remain closed/paused; aggression is not integrated.

Exact-published full CI is verified after the single push; the ignored receipt at `.qa-results/product-context-0.4.18/ci-verification.json` and delivery handoff record its actual run/head/job results. No second publication just to announce CI. Stop after this package; P1 manual-plan workspace and all other roadmap work remain queued.
