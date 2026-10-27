# Recorded-decision review — 0.4.16 RC

One bounded read-only presentation package from clean/fetched main `81899ffea348d02e938005a675ccf2bc9cf0fdae`. The previous0.4.15 chart package is complete ([exact full CI40490229073](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40490229073)); it was not rebuilt. Implementation owner/worktree: this Codex session, `/tmp/hybrid-recorded-decision-0.4.16`, `work/recorded-decision-0.4.16`. Root HTML is the sole active app after safe publication.

## Identities and preservation

Active0.4.16 RC SHA-256: `20fd3e34cd83b19081e2aa1c4237d872ec2074ef3407fcb9e24c9c2b911e0339`.
Exact pre-edit0.4.15 reference: `baseline/hybrid-terminal.0.4.15.html`, SHA-256 `2e6d8b71ca08348c875723e1b82ce511726d11dd1b1220c2bfe6f1dcd0a4928a`. It is an internal immutable reference, not another active application.

All186 prior named functions were compared through the actual application test harness:185 remain source-identical. Only `updateSystemUI` adds `updateJournalReview()`; ten new read-only helpers/control functions and one initialization call are added. The five journal functions (`initJournal`, `recordDecision`, `persistJournal`, `journalExport`, `exportJournal`) are exact. APP_VERSION advances; rule `hybrid-v2-validity-closed`, execution `ohlc-market-stop-v2-gap-open`, RSI policy, CLI1.0.1/schema1 and all calculation/feed/indicator/backtest/sizing/drawing/chart functions are unchanged.

`preservation.json` binds655 unchanged tracked files, six retained frozen datasets/checkpoints and three original observation inputs, plus exact START_HERE/STATUS_HISTORY. No personal journal, ordinary browser profile, timer/wrapper change, acquisition, cohort, outcome study, profitability result or live observation was used. Old reports/seals/manifests stay byte-identical; new bindings honestly name the changed UI.

## Existing journal inventory

Source review preceded editing. This task used synthetic records only; the historical user-export inventory in STATUS was not reopened or uploaded.

| Variant | Stored fields relevant to review | What review must not invent |
| --- | --- | --- |
| 0.3.1 schema1 | id/signature, observation ISO, app/rule, symbol/timeframe, candle-open/close epochs, config minimum/fee, firstCandle/count, source OHLCV, feed phase, signal side/score/condition tuples/optional plan | Execution/RSI metadata and full opposite-side rationale absent |
| 0.4.0 schema1 | Same, plus config executionVersion | No automatic RSI policy or two-side candidate completion |
| 0.4.1 through 0.4.15 schema1 | candidateDiagnostics candidates/selection/validity and config RSI policy added; older records coexist | Fields may still be absent/malformed; producer version is not proof of field contents |

The existing loader admits records with string id/signature and finite candleCloseTime, retains at most1000 and protects malformed/unknown storage. The browser projects only its accepted in-memory records; it does not broaden admission or repair rejected records. Existing recording can create session-only observations when saving is blocked; the existing warning and new review notice disclose this. No claim that all original malformed storage can be browsed or repaired.

## User operation and recorded meaning

1. In **יומן החלטות מאושרות**, expand **עיון בהחלטות שנרשמו · קריאה בלבד**. Default remains collapsed, with no automatic record selection.
2. Filter **סמל שנרשם**, **מסגרת זמן שנרשמה**, **כיוון שנרשם**; **הכול** removes a filter. Counts are filtered/loaded totals, row range and page count. Ten per page maximum; **הבא · ישן יותר** and **הקודם · חדש יותר** navigate. Sort is descending recorded decision close; ties use reverse existing storage order. Invalid timestamp values are unavailable/last. Sorting never sorts the journal array.
3. Click a row, or focus it and press Enter/Space. Conditions retain their recorded text and strict true/false/unknown status; score is a recorded condition count, not probability. Valid recorded LONG/SHORT price fields show exact numeric values. WAIT has no substitute plan; a contradictory saved plan is only visible in original details. No selection/threshold/price validation is recomputed using current rules or market data.
4. Decision-candle close and device observation/recording time are separate explicit UTC values, independent of chart timezone. Expand versions/source/window, diagnostics or original record for secondary data. Missing/malformed text, timestamps, counts, prices and metadata show unavailable, never coerced zero. Recorded zero score/volume remain zero. Original malformed fields remain available as escaped text in deliberate raw details.
5. **הורד יומן JSON** keeps its previous full export, independent of page/filter/selection. Original records/order/IDs/signatures are unchanged; normal export observation/app metadata retain their existing behavior.

Selection stays stable through paging and normal appends; a normally retired selection remains a labelled session-only reference. Filter changes explicitly clear selection/reset the page. A focused row keeps focus through list refresh; if a new first record pushes that row onto another page, focus stays within pagination. No filter/selection preference or storage key is added. Expanders are keyboard accessible, exact JSON scroll regions focusable, and equivalent Hebrew/English Help explains local/origin limitations, missing historical diagnostics and absence of replay/outcomes/signature re-verification.

First candle/count/OHLCV are recorded source/window facts, not proof of continuous coverage, convergence, supplier identity or fixed-origin research parity. No absent supplier/UTC-day/target-path fields are manufactured. Current live panel and charts remain current; journal selection does not replay or pan them.

## Performed validation

Final commands use Node24, pinned QA dependencies and compact synthetic/mocked inputs. `source-identities.json`, group manifests/logs and `browser-evidence.json` bind the exact final HTML. No acquired datasets are needed by required tests/CI.

- `npm test`: PASS — app9; frozen research18/audit9/contract9/preparation13; presentation13 suites/99 cases, including12 focused review cases.
- `npm run test:browser`: PASS —18 actual mocked Chromium suites, with guard rejecting unmocked public requests. New browser suite checks desktop1440,390 and320, native keyboard/filter/page/select/JSON-download interactions, escaped hostile-looking strings, UTC timestamps and counts, mixed legacy/current/WAIT/malformed/empty records, native storage read/write/malformed/unsupported faults and three mocked confirmed appends per width.
- Focused review checks verify exact source scope, independent synthetic expected fields, valid zero versus missing/malformed, offset-to-UTC observation handling, duplicate-ID row identity, normal1000-record retention, unchanged export ordering/bytes, no browsing storage/network/analysis calls and baseline-matching engine/backtest/chart pixels. Existing suites cover shared Volume/regional/ADR/Line/drawing/navigation semantics.
- Browser selection/expanded details survive normal confirmation updates. Native focus stays on a stable row token and on pagination when a row is displaced; no new timers or engine calls arise from clock refresh/review.
- Final desktop/narrow screenshots were inspected as named in `screenshots.json`. Oversized element captures used during development were not treated as full visible-layout evidence; final captures show actual viewport content in the existing scrolling layout. Raw images/traces stay ignored/local.
- `git diff --check`, current source checksums, protected-file/data/observation hashes: PASS.

Development evidence is kept separately: the first full npm run failed a stale0.4.15 report-version assertion; version assertions were updated to0.4.16 with no corresponding application change. Additional focused work tightened strict malformed-value display and actual newest-first keyboard displacement; earlier mixed-source development runs are not claimed as the final bound run. No failure was hidden by dropping an assertion or changing strategy. Initial log is retained as `initial-npm-test.log`.

## Publication gate and evidence availability

Code/Help/short STATUS/evidence are one package. Safe main fast-forward/push without force follows local validation. Exact resulting Actions must select full QA and all three jobs must actually complete successfully. At delivery, decoded logs, current remote main SHA and CI URL/conclusions are saved in ignored root `.qa-results/recorded-decision-review-0.4.16/ci-verification.json` / `ci-test-summary.log`; final protected/clean-main verification is `final-preservation.json`. No second publication solely to announce CI passed. The report does not preclaim an unknown run/commit.

Raw final browser images/traces: implementation worktree `.qa-results/browser/browser-recorded-decision-review/`. Registry/evidence checksums are tracked. For repository-only readers those local artifacts are not guaranteed available; do not equate a missing ignored image with an executed/inspected check.

## Remaining limitations and next unfinished action

No physical-device, screen-reader/translation or user's perceived-readability acceptance is claimed. Existing local-storage/browser-origin durability and retained-window limitations remain. This is not an execution ledger, signature-verification tool, historical simulation, opposite-side reconstruction or outcome/profitability study. Historical0.4.4 hour and0.4.7 midnight observations remain accepted only for their exact old source; none transfers to0.4.16 and none was repeated.

After exact published CI verification, stop. Next unfinished action is bounded user/device/assistive-technology acceptance of this browser; analytical-context or other features stay separately queued. No personal journal upload or repeated reload request is required for this delivery.
