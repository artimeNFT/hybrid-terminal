# Confirmed-plan target-path context — 0.4.5 RC

The sole active application is root `hybrid-terminal.html`, version **0.4.5**, SHA-256 `ec03f24021ac71008ee8196927c2c188b98c9bf0105e89f7e25902c951f561ba`. Started from clean main at `3e9f65b`, safely fetched/fast-forwarded to authorization checkpoint `a15f8c2`. No unfinished work was discarded; no completed task was rebuilt.

## User-visible behavior

The existing eligible confirmed plan now contains compact Hebrew **רמות בדרך ליעד**. It shows the first three groups of existing reference levels strictly between plan entry and TP2, sorted along LONG/SHORT direction. Remaining groups and source/endpoint details expand on demand. Rows say before TP1, exactly TP1, or between TP1 and TP2. WAIT has neither a substitute plan nor a path. The existing nearest-day-level card is unchanged; there are no new chart lines, feeds or indicators.

For entry E, TP2 T and d=sign(T−E), inclusion is exactly `0 < d*(L-E) < abs(T-E)`. Exact entry/TP2 equality is an endpoint coincidence, never an intervening level. Only exact numeric equality groups labels. Distinct values remain separate even if rounded prices match; summary collisions display precise values, and details/tooltips retain precise values throughout.

Distances use the confirmed coordinates: percentage from entry, distance/confirmed ATR, distance/`abs(entry-stop)` in R. Each denominator is guarded independently; an unavailable ATR does not erase valid percent/R. Invalid TP1 makes its position label unavailable without discarding the other geometry. These are descriptive presentation calculations, not sizing, execution, new targets, score votes, resistance evidence or probabilities. Averages are decision-time references, not fixed future barriers.

## Sources and anchor

Only existing validated PDH/PDL/PP/R1/S1 and confirmed EMA50/EMA200/UTC VWAP are considered. Day levels and Pivots retain independent visibility; the EMA/VWAP layer controls the three averages. Disabled/loading/unavailable/invalid sources are excluded and named in coverage details. Partial-day VWAP is excluded because it lacks full UTC-open coverage. No displayed levels among a subset is not a clear-path claim.

The anchor reads the actual confirmed close/time, plan/ATR, symbol/timeframe/epoch and validated daily identity. Daily source/validity must match that confirmed UTC period, with the existing request/cache lifecycle and stale-response guards retained. Provisional prices, real pointer/crosshair/panning, manual chart scaling and backfill do not move the anchor. A source response may complete for the same anchored period; validation is not replaced by a provisional price.

## Validation actually performed

- Full `npm test` passed: nine application suites; unchanged 18 CLI / nine audit / nine contract / 13 preparation cases under the explicit frozen context; five presentation and six new target-path fixtures.
- Focused presentation checks then passed after adding assertions for precise near-price rendering and mismatched daily identity. All **83 existing 0.4.4 functions other than panel are source-identical**. The existing finite synthetic indicator/signal/backtest comparisons across thresholds remain green, and old journal bytes/IDs/preferences are preserved.
- All **seven actual mocked Chromium suites** passed. Target-path coverage includes desktop/narrow rows, exact grouping/endpoints, disabled/partial sources, preserved open details, actual pointer/crosshair/diagonal dragging, provisional WebSocket input, WAIT isolation and unchanged confirmed signal/backtest/journal. Additional expanded-container assertions passed against the same unchanged app source.
- Geometry/state fixtures cover LONG/SHORT ordering, TP1 equality, both endpoints, exact duplicate labels, distinct near prices, invalid inputs/denominators, missing clock/data, partial coverage and actual delayed obsolete symbol/timeframe responses.
- Desktop 1440×1100 and narrow 390×844 screenshots were visually inspected for compact/expanded presentation and disabled/partial coverage. Expanded client/scroll widths match: 335/335 desktop and 344/344 narrow; no document overflow. Feed data is synthetic; one browser branch deliberately changes only the coverage flag to inspect the exclusion UI.
- Read-only historical verification passed using `node research/run-frozen.cjs check --preparation-output .qa-results/preparation-v1/q3-v1 --audit-output .qa-results/calculation-readiness-v1/q3-audit.json`. Original source hashes, audit bytes/source identity, preparation seal and canonical feature/pair hashes remain valid. No Q3 calculation/cohort was regenerated.

Final logs, manifests, browser evidence and source-bound screenshot registry accompany this report. Images/traces remain ignored locally under `.qa-results/browser/browser-target-path/`. Initial diagnostics remain ignored under `.qa-results/target-path-0.4.5/`; an old copied-report version expectation was updated to the new metadata, and visual inspection led to compact price labels and isolated metric direction. No strategy defect or policy change was introduced.

## Preservation and acceptance limits

`preservation.json` records **256 protected historical tracked files**, all six frozen dataset/checkpoint byte hashes and the unchanged historical STATUS archive. Frozen research modules/context/declarations/seals/payloads, old QA manifests, datasets, CLI/schema, dependency lock and observation tool are intact. New active/scoped checksums are separate; no old seal was relabeled.

Exact pre-edit 0.4.4 is preserved internally as `baseline/hybrid-terminal.0.4.4.html`, SHA-256 `f89f6f48a725d3f3e354a651b7a627e60ad7c1270105f6936b44803030f51cfa`. The accepted one-hour soak and user's desktop-readability acceptance remain attributed to that version/hash. **Neither is transferred to 0.4.5.** The hour observation was not repeated. Physical touch and user readability of the new section remain pending; browser emulation is not device acceptance. Fixture parity is finite evidence, not universal reliability or strategy performance.

Publish without force and verify actual Actions. The implementation run receipt is added separately after the run completes; CURRENT STATUS records its commit/run. The final post-push receipt stays ignored in `.qa-results/target-path-0.4.5/ci-verification.json` to avoid self-reference.

Stop after this increment. Next unfinished action is the separate **420-second midnight mode**, in the actual **2026-10-25 23:57–23:59 UTC** start window, recommended **23:58 UTC**. Record the exact version/hash loaded and attribute the result to that source. If the window is unavailable, leave pending and record the next exact window; no indefinite wait, automatic hour rerun, research utility or additional feature.
