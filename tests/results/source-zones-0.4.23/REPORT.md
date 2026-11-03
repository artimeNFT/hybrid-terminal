# Optional supplied-source CLOSED vector zones —0.4.23 RC

Sole active app: root `hybrid-terminal.html`. Internal exact0.4.22 archive: `baseline/hybrid-terminal.0.4.22.html`, SHA-256 `e037089b4044aff4fee18b696646126c53f024c155076daae3be96240d13dc16`. Actual0.4.23 source SHA-256 `51b77ffe1ef79457d9bc3d1aa99c917e3e3d8b6f839ae32010dac5b518eb78c3`. The [pre-edit STATUS](HANDOFF-before.md) is historical, superseded by the current board.

## Operation and source boundary

Open **Display → Zone view → Source-derived closed**; **Vectors** shows/hides only the selected zone layer. **Local** remains the default. Selection is session-only: no new storage key, migration or write; reload returns to Local. Existing candle, drawing, chart, Volume and other saved choices are untouched.

ABOVE boxes have dashed boundaries; BELOW boxes dotted boundaries. English chart status identifies the view, qualified state, counts and exclusions, with Local-plan independence. The Hebrew panel's **אזורי מקור · סגורים בלבד · לא יעדי תוכנית** expands to explanation and exact JSON: selected product/symbol/timeframe/epoch, loaded origin/confirmed UTC anchor, pending source time, qualifications and each original/remaining bound. No reference boxes enter Local target selection, scores or planning.

Pinned [source/profile/comparison](../../../references/tr-main/README.md):

- Main SHA-256 `992f91f45eaad0604473fed2e4d10012c4accbc26397603f9440cbfd44eed1fd` (original CRLF/no-final-newline bytes retained).
- Library SHA-256 `5a0f368cf597d38792439b48d1787399f78522ff96959f96baa562722be5c36b`.
- Observed profile: Body only creation, Body with wicks updates, cap500 per direction, source override off. Reference uses the terminal's selected-product chart OHLCV, not an asserted matching TradingView feed.
- Supplied text/name/arity do not authenticate library publication2, Pine compilation, runtime drawing/garbage collection, pixels or feed parity. It defines context, not a complete trading strategy or profitability evidence.

## Adapter contract and deliberate safeguards

`sourceClosedZones`/`sourceZoneClass`/`sourceZoneStep` are a separate pure path. They read raw bars and existing pure `volumeReference`, never write candle `up`/`cls`, legacy zones or analytical arrays. Strict source direction is C>O, preserving legacy C>=O and neutral doji appearance. Both rising and climax sources qualify; no Local origin-color target restriction is imposed.

Each valid previous source enters BOTH arrays on the next valid CLOSED processing bar. Body bounds are min/max(O,C). Current wicks shrink only strictly inside remaining bounds; far-boundary equality/crossing removes. Original bounds, source timestamp/direction/class and first processing timestamp remain separately available. Provisional bars terminate the projection's input prefix; clock passage never processes a source. The latest qualifying closed source remains pending until the next closed bar, unlike intrabar TradingView drawing.

For each direction, update/delete marking precedes the500-entry cap; the cap precedes unavailable-entry cleanup. A deleted newest slot can therefore still cause eviction of a valid oldest slot. Safe full compaction deliberately replaces supplied cleanup/index-removal quirks; no literal indexing-defect parity is claimed.

Creation needs10 valid contiguous prior closed bars, positive finite mean/current volume and finite arithmetic. Zero prior spread-product maximum cannot independently trigger climax: volume-ratio thresholds remain usable, without raw0>=0 strength. Zero-body vector sources are disclosed and omitted rather than widened. Valid closed price bars still update existing boxes when their volume classification is unavailable. Invalid/nonmonotonic bars clear projection state; history gaps reset and rewarm rather than assume boxes survived missing observations. No old-history coverage, convergence, strength or clear-path claim follows from an empty array.

Input is selected-product loaded chart history, including explicit chart-only History. Cache keys use actual source epoch/product/symbol/timeframe, k/history identities, confirmed end/bar and revision; provisional replacement, clock, hover and navigation do not invalidate it. History prepend, a newly confirmed bar or source reload does. Existing feed/history guards reject stale responses; source loading clears the context. No requests, timers, dependencies or automatic acquisition were added.

## Verification actually performed

- Nine focused synthetic groups: literal prior10 threshold equalities and volume×range climax; strict doji; rising previous-bar creation; both arrays independent of origin direction; [100,104]→[103.5,104] golden with original bounds retained; near/far equality, partials, multiple deletion and cap-before-compaction; warm-up/invalid/zero/body/gap handling; closed/provisional/clock/cache isolation; product/symbol/timeframe/epoch/history and stale callbacks; storage failure/session-only selector; paired Help.
- Exact default Local Canvas raster parity with archived0.4.22; all preexisting function bodies remain exact except `draw`. Literal analyze/sigAt/backtest/plan/selection/cost/sizing/journal/export algorithms are unchanged. Synthetic LONG/SHORT/random contexts match baseline; old journal bytes/signatures and export numeric meanings persist (new application-version metadata only). A render-only check replaces analysis/journal functions with throwing sentinels: Source display still works, without network/storage writes.
- Actual isolated mocked Chromium at1440px/320px: Canvas stroke coordinates independently computed from known source body bounds and candle-center transforms; no Local-zone stroke in Source mode; shared pan/zoom/hover/history coordinates; provisional then source-confirmed close; layer toggle, Candles/Line, product/symbol/timeframe transitions, held/stale source callbacks, session reload, keyboard selector, overflow and both Help languages. Screenshots and raw evidence are ignored under `.qa-results/source-zones-0.4.23/browser/`; compact evidence/screenshots are retained beside this report.
- Required deterministic groups completed locally. Initial `npm test` exposed an old active-version regex and Hebrew explanation mistakenly placed in chart chrome; both corrected, then failed/unstarted checks resumed without repeating seven successful core app suites. Source-only final refinements were rechecked with the nine focused groups. Research/audit/contract/preparation/presentation groups passed;14 presentation suites. Only synthetic historical fixtures ran, never acquired-data study replay/fitting/evaluation.
- Existing browser manual-drawing check exposed insufficient Volume geometry at a shorter desktop height with the first verbose selector row. The selector was compacted into the existing Chart display row; the failed/interrupted/unstarted checks were resumed while retaining sixteen successful browser suites. Final exact-commit CI is the whole settled-source validation, not an extrapolation from an earlier source.
-795 prior protected tracked identities and140 prior protected identities verified unchanged (overlapping sets): historical manifests/reports, frozen engines/data/seals and supplied Pine bytes. No user browser profile or personal journal accessed.

## Explicit archived QA context

Only `tests/candidate-context.cjs` and `tests/candidate-context-continuation.cjs` opt into new `research/source-context/candidate-0.4.22.cjs` (SHA-256 `143f963652f025aa4b7e175dd2a68e4318101c63086ae2a82bfd7def3695aa8b`). It verifies the literal archive hash, reports actual root hash separately and binds only process-local logical source reads. All original scientific files and source checks still execute unchanged; the original adapter rejects the new root when unbound. Actual current app/browser QA uses the new root with no archived preload. Prior0.4.3/0.4.17 contexts/manifests remain unchanged. No scientific source/seal was rewritten or hash assertion weakened.

## Publication and limits

One coherent code/Help/tests/report/STATUS publication. Exact head/Actions URL/conclusions are verified after push and saved locally in `.qa-results/source-zones-0.4.23/ci-verification.json` and the final handoff; no extra publication merely announcing CI. Current source identity is independently pinned in `qa/source-checksums.0.4.23.json`.

Synthetic engineering acceptance only. No TradingView-runtime/public-feed/live/physical-device acceptance or predictive/trading authority. Historical hour/midnight receipts remain bound to their own old sources. Source visibility/history origin and safe-compaction safeguards can differ from a TradingView instance;500 is per array, not emulated global drawing-object GC. This feature remains independent of Local plan targets. Further source alignment/operational policy or research requires its own bounded authorization; none started.
