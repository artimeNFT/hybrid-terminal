# Volume-pane / narrow-legend successor — 0.4.9 candidate

Predecessor: preserved published `30432aba73c3b6a5112999f2d0448e9835dfdeaa`, 0.4.8 SHA-256 `49267248f1808133c52e2331fa9d6f7b325be7580a71867177c5dd5d12323858`.
Successor branch: `candidate/volume-legend-0.4.9`, worktree `/tmp/hybrid-volume-legend-0.4.9`.
Successor HTML SHA-256: `043f952a58166e5bdeced32efa2d38a5857c2166b009da9eeb4898f5d745b64a`.
Authoritative root remains clean published 0.4.7 / `4bafacddf8d726fc48601471c7a7fe713c2fb2038f0908264131ba864f7aa8e8`. Neither candidate integrated. Existing timer/observer/wrapper unchanged.

## Delivered scope

Default Volume height (the larger of 64px and 22% of canvas) and visible-bar automatic extent remain until explicit input. Divider drag and Display Height slider resize Volume while retaining price space: 64px minimum Volume, 60% maximum, price floor normally 180px wide /160px narrow where feasible. At 280px canvas this gives 64–82px Volume. Short canvases clamp to feasible bounds; the height range can become fixed when space is exhausted. Height persists as a viewport-clamped fraction; the slider displays actual pixels.

Volume right-axis drag/wheel or Ceiling input changes only a linear, nonnegative scale anchored at visible zero. There is no vertical volume translation or independent time offset. Clipped bars end at the ceiling, carry light ▲ caps and are counted in the pane title. Auto volume refits visible bars and preserves height; axis double-click also restores Auto. Reset volume restores default height/Auto; main Reset keeps existing time/price behavior. Horizontal pan/zoom/crosshair mapping stays shared. RSI retains original height and 0–100 scale; None removes lower-pane rendering without losing Volume settings.

Isolated `hybridTerminal.volumePane.v1`, schema1: nullable height fraction and base-volume ceiling. Primitive finite values only; ratio0.01–0.6, manual ceiling1e-12–1e18, tighter geometry bounds. Malformed saved bytes are preserved with fallback/notice until explicit input. Storage failure is session-only, no automatic initial write, no other preference/journal clearing. Settings persist through feed updates and across symbols/timeframes; Auto refits the current view. Invalid/empty/zero-size interactions are guarded.

All six exact indicator names use measured spacing/wrapping, including DO/DO*, within the price header. Desktop positions stay when they fit; wrapped header/daily-label clearance is consistent. Price/time transforms are unchanged. A verified 320px defect was fixed within this interaction scope: crosshair inspector wrapping moved the canvas between pointer movement and down, causing a divider miss. Its existing height is held during chart pointer interaction and restored afterward. No default layout reset.

Hebrew typo מחנה → מכנה; QA-only emulated/physical acceptance wording removed from user Help and retained in this report. Both languages explain controls, RSI/None, independent resets and persistence; ordered RSI range uses LTR markup. No relative-volume formula, taker feed, strategy/score/indicator arithmetic/backtest/journal/execution change.

## Checks actually performed

Full local `npm test` passed: nine app suites; explicit frozen-context 18 CLI/nine audit/nine contract/13 preparation fixtures; six presentation suites (5+6+7+7+6+8). All eleven mocked Chromium suites passed. Final Help-only LTR range refinement received a fresh source check, 14 focused cases (eight Volume/legend + six prior Help) and final new browser suite across all four widths. Local full/final-focused source identities remain distinct in `validation-source-identities.json`; exact published-source CI is required after push.

Actual Chromium mouse/axis wheel/keyboard/native range controls and narrow touch-emulated divider gestures verify min/max height, capture/cancel, drag-start geometry, zero-baseline raster, linear/clipped bar bounds and cap pixels, Auto/reset, shared 32px horizontal displacement with price/volume pixels after pan/zoom, crosshair identity, actual 20px price-candle displacement after resizing, pane transitions, stored/faulted settings, provisional updates and unchanged decision/backtest/journal bytes. DO and DO* glyph pixels and all legend bounds verified at 1440/430/390/320px; daily labels stay below headers. No console/page errors or unexpected external requests.

Initial test refinements addressed native slider 1px quantization, fractional CSS pointer rounding and anti-aliased cap pixels; application calculations were not changed to satisfy those assertions. The original regression DOM stub needed only a bounding-box method for the new UI initialization; formulas/fixtures stayed unchanged. The actual 320px divider miss was traced to layout shift and fixed in production interaction code, then rechecked.

`browser-evidence.json` records measured geometry/pixels; `screenshots.json` identifies 24 source-bound current images. Inspected desktop controls, narrow controls/clip/legend and both Help languages; only viewed images carry inspection flags. Raw images/traces remain ignored in this successor worktree. Emulation is not physical touch; screen-reader, user perceived readability and physical acceptance remain pending.

Only five prior chart-view functions change (`chartGeometry`, `draw`, `bindChart`, `endChartDrag`, `dailyLabelLayout`); all other 100 prior function bodies, rule/execution/RSI versions and calculations/decisions/feed/sizing/backtest/journal functions stay identical. Preserved predecessor, frozen manifests/evidence/baselines/seals/payloads, six acquired dataset/checkpoint hashes and historical STATUS archive verify unchanged. Read-only original audit/preparation verification passed in frozen0.4.3 context; no acquisition/cohort/live-soak rerun.

## Publication and integration order

Publish only the successor branch, manually dispatch the existing unchanged CI workflow at that exact branch SHA, verify actual run/jobs/logs and record receipt. Final evidence commit gets its own candidate CI verification via an ignored receipt; no root switch, candidate merge, new workflow or next feature.

The existing 0.4.7 midnight receipt says observer-finished, 420.006s and raw rollover/pass true. This task read only the receipt, leaving acceptance pending full raw-evidence review; no result transfers to a candidate. Separate next task: inspect actual loaded version/hash, elapsed/boundary/context/feed/journal uniqueness/injected-fault evidence and update main CURRENT STATUS. Review 0.4.8 first, successor delta second; successor already contains `30432ab`. Reconcile any newer main documentation on the successor, preserving measured 0.4.7 identity, then verify exact successor CI and integrate the complete successor once only when separately authorized. Stop/reconcile on divergence; no force. Do not independently merge both candidates or launch another feature.
