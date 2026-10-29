# Visible latest/confirmed price — 0.4.19 RC

The sole active application is root `hybrid-terminal.html`, SHA-256 **`ba4832ff2c4b3c997a9926362d405d440858ccfcd64c1a7a29287a68a2cc6806`**. The exact previous 0.4.18 source is retained internally at `baseline/hybrid-terminal.0.4.18.html`, SHA `a873886edf0137d1aa6a62eb2195e1ff1f0f749272e0f1b9fc60130dd0b76881`. [Reviewed scope](HANDOFF.md); [machine-readable identities](delivery.json).

## Use

1. Open the authoritative root HTML. Select **Market**, symbol and timeframe as usual.
2. At the top of the Hebrew panel, read **מחיר אחרון זמין · הזנת נרות**: the last valid selected-product candle-feed close, product/symbol/timeframe and **USDT**. It remains visible during WAIT, without a plan and without calculation results. On narrow screens, scroll below the chart to this first panel card.
3. Read **סגירה מאושרת אחרונה** separately, with **סגירת הנר המאושר · UTC**. This is the closed candle's exclusive UTC close boundary; developing updates do not move it. Expand **מחירים מדויקים, זמן ומגבלות** for unrounded values, source-candle opening time and explicitly labelled device stream-receive time.
4. Respect the status text: **תמונת REST · ממתין לעדכון זרם** is a snapshot awaiting streaming, not a fresh-stream claim. Stale/disconnected values remain only as explicitly labelled last received values. Loading a different source clears both prices to **לא זמין** until valid new-source data arrives.

This is a trade-candle-feed close, not a tick-by-tick quote, Mark/index, bid/ask, order price or executable fill. Receive time is the device clock, not the exchange event timestamp. Freshness remains the existing 15-second feed-health policy. No direction/profit color or blinking price is introduced.

## Implementation and preservation

The read-only `marketPriceSnapshot` scans only selected-source `S.k` for its latest valid bar and latest explicitly closed valid bar. Missing/nonfinite/nonpositive prices remain unavailable; an invalid newer tail labels the last valid value rather than calling it fresh. Confirmed price comes directly from closed source candles, independently of `S.sig`, plan or `closedIndex` calculation availability. Adaptive `fmt` is display-only; exact details/title retain the source numeric value, including tiny prices.

`S.price` is manual axis geometry and is never read or changed. Hover, chart-only History, panning and journal selection do not reanchor the card. Existing source-switch clearing and obsolete-response guards remain unchanged. Only the preexisting `updateSystemUI` composition changes; every other prior function body is exact against 0.4.18. The card uses the existing render/clock schedule, with no additional timer, polling, subscription, dependency, preference or journal field/write. Static DOM/text updates preserve the details open state and use safe text rendering. English/Hebrew Help has one paired fact in the existing data-health section.

All 140 prior protected frozen source/data/seal/historical-manifest/output identities and all 129 preexisting tracked baseline/research/qa identities remain unchanged. The original simulator, rule/execution versions and strategy/indicator/selection/sizing/backtest/journal logic are preserved. Historical research QA continues under its existing explicit frozen contexts; no data acquisition, Q3 replay or retuning was performed.

## Actual checks

- `node --test tests/price-card.cjs`: **8/8 PASS**. Independent literal prices/times; REST/WAIT/no-calculation availability; actual mocked provisional/confirmed messages; stale/disconnected/error/offline labels; missing/null/invalid/zero/nonfinite inputs; adaptive tiny prices/exact values; source clearing/obsolete callbacks; axis getter deliberately throws if read; no render analysis/storage/network effects. Fixed/random/mirrored engine and journal outputs match the preserved0.4.18 baseline.
- `npm test`: all required deterministic groups passed, including the focused price and existing product fixtures. Historical research groups use synthetic fixtures only.
- `tests/browser-price-card.cjs` with existing mock hooks: **PASS at 1440 and320px**, native Chromium/file origin with isolated QA storage. Actual pan/History/journal selection; no-calculation rendering; mocked WS receive versus exchange event time; fixed confirmation under provisional updates;15-second stale transition; actual mock disconnect; held source switch and late old callback; product/symbol/timeframe reloads; keyboard details; open-state retention; both Help languages and no horizontal overflow. [Compact browser evidence](browser-evidence.json) reports no page/console errors. All market network responses are mocked.
- `npm run test:browser`: **PASS**, all20 existing suites plus product and price fixtures (22 total), one complete final local run without retries. Exact publication also selects full QA; its run/head/job conclusions are recorded at handoff and in the ignored receipt below, without a second CI-announcement publication.

Raw local logs: `.qa-results/price-card-0.4.19/{focused.log,npm-final.log,browser-final.log}`; source-bound screenshots/state: `.qa-results/price-card-0.4.19/browser/`; preservation receipt: `.qa-results/price-card-0.4.19/preservation.json`. Exact published CI receipt: `.qa-results/price-card-0.4.19/ci-verification.json`.

## Inspected images and limits

[Desktop / WAIT / REST](desktop.png), [320px / developing / exact details](narrow.png), [perpetual ETHUSDT15m](narrow-perpetual.png), [stale](narrow-stale.png), [loading after source switch](narrow-loading.png), [Hebrew Help](help-he.png), [English Help](help-en.png) were actually inspected. Synthetic values and isolated QA storage only; no personal journal/profile was accessed. The card is prominent above feed health, with a separate confirmed close/time and explicit unavailable/stale text. Narrow Help formulas/text remain inside the dialog.

No additional public smoke, soak, midnight or research run was performed. The prior 0.4.18 public smoke,0.4.4 hour and0.4.7 midnight remain bound to their original sources. Current-source live acceptance, ordinary personal-profile persistence, physical-device/assistive-technology acceptance and user-perceived readability remain unverified. No account execution/funding/margin equivalence is claimed. Stop after this delivery for user readability feedback; the broader plan-consolidation package remains queued.
