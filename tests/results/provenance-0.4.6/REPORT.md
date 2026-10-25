# Decision-data provenance and chart readability — 0.4.6 RC

Active root `hybrid-terminal.html`: **0.4.6**, SHA-256 `7c12ba003d8a03bff8322c7d9143c8bc926aa6847b62dbaf065d80b3d55e5195`.

Started with clean main at `19935d6`, safely fetched/fast-forwarded to current authorization checkpoint `d38dab2`. After interruption, inspected the existing unfinished implementation and successful logs; fetched remote without integrating over the dirty tree, found no newer work, and continued without rebuilding or repeating completed suites. Work stayed inside Hybrid Terminal.

## Delivered behavior

Near the confirmed LONG/SHORT/WAIT decision, the panel identifies the actual symbol/timeframe, participating closed-candle count and first input candle **open** in UTC. The existing confirmed UTC **close** timestamp remains immediately above. Expandable text distinguishes the calculation prefix from the older chart-only bars loaded by History +1,000. The new metadata reads the existing confirmed prefix; it never extends/reseeds it. Provisional candles do not increment the confirmed count. Loading a new symbol/timeframe clears old provenance until that configuration has confirmed data.

Feed health remains separate. The window is a description of inputs, not a converged/fully warmed badge or equivalence with fixed-origin research. The finite BTCUSDT 5m audit does not establish 15m equivalence. Chart indicators may have an older origin after chart-only backfill; the decision calculations retain their existing input window.

Display now has optional **Annotation density: Full / Focus**. **Full remains the default**, preserving existing M/W annotations. Focus shows the latest active confirmed M and W known at the confirmed chart index, if visible in the viewport. It filters only M/W text annotations; decisions, plan/SL/TP lines, current price, stopping-volume marks, other layers and level inspection remain under their existing controls. The preference is added to existing schema-2 display preferences without removing unrelated fields or changing journal bytes. Returning to Full restores the same Canvas pixels in the deterministic fixture.

The Daily UTC summary and chart/nearest-level prices are compact. Deliberate **Details · exact values** and the Hebrew nearest-level details retain exact unrounded values, source and validity. Dense label bundles marked `distinct` retain their individual numeric levels; rounded display strings never become grouping keys. Computed prices are not snapped to an order tick. English chart labels and Hebrew Help explain these distinctions.

## Checks actually performed

- Full `npm test` passed: nine application suites; unchanged 18 CLI, nine audit, nine contract and 13 preparation cases under the explicit frozen source context; five presentation, six target-path and **seven provenance/readability cases**.
- All **eight mocked Chromium suites passed**. The new suite checks exact confirmed coordinates/counts, provisional separation, chart-only history, symbol/timeframe transitions, preference restoration, retained confirmed plans/current price, Full/Focus Canvas differences and exact pixel restoration when returning to Full.
- The fixture reduced 13 visible M/W text calls to at most two without changing other Canvas text, signals, backtest or journal. History adds 1,000 chart-only candles while the original 500-candle decision window stays identical. The ETHUSDT 15m transition reports its actual 200-candle prefix and timestamps; those counts are fixture data, not production minimums.
- Exact numeric pivot identities remain distinct, including `100.00000999999999`, `100.00006999999998` and nearby values that round alike. Tests read the actual unrounded computed values rather than assuming decimal rounding. A real narrow-summary activation issue was corrected by using a noninteractive status span in the native details summary. Older exact-value assertions moved into deliberate details, and an old fixed-coordinate drag fixture now uses actual canvas bounds plus a chart-focus assertion.
- Desktop 1440×1100 and narrow 390×844 images were visually inspected for Full/Focus, exact inspection, eligible decision and calculation-window/chart-history explanation. Synthetic REST/WebSocket routes reject unmocked external requests. These are actual Chromium/Canvas checks, not physical-device or live-session acceptance.
- **81 existing 0.4.5 function bodies remain identical.** The seven changed functions are presentation/UI only: panel, draw, daily-label layout, nearest-level HTML, display preference load/save and UI binding. Rule/execution/RSI policies, indicators/seeds, target selection, sizing, backtest, calculation-history length and journal behavior remain unchanged. Navigation binding is source-identical.

Original audit bytes/source identity and preparation seal/canonical payloads verified read-only in the unchanged frozen research context. No dataset acquisition, Q3 calculation/cohort, outcome analysis or hour soak was run. Required CI uses synthetic fixtures and needs no acquired data.

## Provenance, artifacts and limits

`preservation.json` records **279 protected historical tracked files**, six frozen dataset/checkpoint byte hashes and an unchanged historical STATUS archive. The exact pre-edit 0.4.5 HTML is internally retained as `baseline/hybrid-terminal.0.4.5.html`, SHA-256 `ec03f24021ac71008ee8196927c2c188b98c9bf0105e89f7e25902c951f561ba`. The 0.4.3 research baseline/context and all historical manifests stay intact. New source checksums are separate.

Logs/manifests, source-bound screenshot registry, browser evidence and read-only frozen verification accompany this report. Visually inspected images are local under `.qa-results/provenance-0.4.6/browser-focused/`; the full suite also retains images/traces under `.qa-results/browser/browser-provenance-readability/`. All images use deterministic synthetic data. Prior 0.4.4 hour-soak acceptance applies only to exact `f89f6f…`, and is neither repeated nor transferred to 0.4.6. Physical touch and user readability acceptance remain separate.

## Publication and tonight's observation

Publish without force and inspect actual GitHub Actions. The implementation run receipt is added separately after success; CURRENT STATUS records the source commit/run. The final post-push receipt stays ignored in `.qa-results/provenance-0.4.6/ci-verification.json` to avoid self-reference.

Tonight's separate **420-second midnight mode** is authorized for the actual **2026-10-25 23:57–23:59 UTC** start window, recommended **23:58 UTC**. An existing native user timer will invoke the unchanged observer once, outside frozen context, against the then-active settled published root. The ignored one-shot guard checks the actual window/clean source, preserves unfinished work, records the version/hash actually loaded and limits execution. It does not wait all day, modify the application or automatically grant acceptance from `passed` alone.

The timer registration/result receipt is recorded separately once installed. It requires the WSL host/user service manager and network to remain available. A missed window or unsettled/unpublished source stays pending; no late/simulated run or automatic hour soak. Review the resulting actual timestamps, daily-source/context transition, source/runtime identity and journal evidence after execution. Scheduled is not observed acceptance. No further product/research increment is started.
