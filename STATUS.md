# Hybrid Terminal — current status
Updated: 2026-10-27, Asia/Jerusalem. This is the single current task board.
Start with [START_HERE.md](START_HERE.md). Earlier dated plans are historical, not active instructions.

## Verified current application
- Repository: [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main.
- WSL root: `/mnt/c/users/shlom/desktop/the hybrid-terminal`; sole active app: `hybrid-terminal.html`. VECTOR LAB is separate.
- App **0.4.15 RC**, SHA-256 `2e6d8b71ca08348c875723e1b82ce511726d11dd1b1220c2bfe6f1dcd0a4928a`.
- Previous verified0.4.14 application baseline: `91463edc31eee0767ab3901db2b12cd961b47f94`; [exact CI40411203307 passed](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40411203307), both application QA jobs.
- Delivered: confirmed/provisional decisions, history/navigation, palette/body modes, target-path/cost scenarios, bilingual Help, Volume controls/confirmed ratio, regional clocks, ADR20, Candles/Line and manual trend lines.
- Current source/evidence: `tests/results/chart-usability-0.4.15/`; exact final push CI is verified at delivery and stored in ignored root `.qa-results/chart-usability-0.4.15/ci-verification.json` / `ci-test-summary.log`. Read actual HEAD/run; queued/skipped is not passed.
- These workflow/UI checks do not establish predictive accuracy or profitability.

## Active ownership and next action
**Authorized consolidated package:** this Codex session is the single owner, isolated worktree `/tmp/hybrid-chart-usability-0.4.15`, branch `work/chart-usability-0.4.15`, starting clean/fetched **f64756a52c94dd0ac7e507473b49f003ce530915**. Earlier wheel-only drafts and queued/not-issued statements are superseded by the user's consolidated instruction. No parallel implementation, maintenance restart or journal-review feature.
**Source/Help/package complete in this commit.** Local source/app/frozen checks, final12 presentation suites/87 cases and17 mocked Chromium suites cover the bounded changes; source report distinguishes the corrected legacy precision expectation. Inspected desktop/390/320 menu/precision/tiny-price and Hebrew/English Help screenshots are ignored in that worktree `.qa-results/browser/browser-chart-usability/`; full group traces are `.qa-results/browser/browser-chart-usability/`.
**Delivery procedure:** safely publish this one code/Help/STATUS package without force, verify actual exact-HEAD CI selects full QA and all3 jobs pass, save its ignored final receipt, then stop. No second publication solely to announce CI. Future resumes inspect current HEAD/run/receipt before treating verification as unfinished. Recorded-decision review is queued separately, not started automatically.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| P0 | CI and concise handoff | Completed: eight scope regression cases; actual full maintenance CI40442554371 passed. Old STATUS archived byte-identically. Documentation-only jobs may be intentionally skipped, never described as executed. |
| P1 | Chart usability package | Implemented0.4.15 in this package: Slow/Standard wheel, Reset menu, context Volume, adaptive prices/Help. Final release gate is exact published full CI; ignored receipt/result reported at delivery. Stop after this package. |
| P1 | Recorded-decision review | Next package: read-only browsing/filtering + recorded details/reasons/versions + Help. Inspect legacy fields first; absent as-of context remains unavailable. No outcome calculation or journal rewrite. |
| P2 | One analytical-context question | Choose one useful price/volume or cost-to-target description; confirm required data/zero-denominator handling before building. No automatic extra score. |
| P2 | Data/source parity | Exact Psy/TR/session configuration, richer taker/derivatives feeds and daily/1m views remain conditional. Seconds/30s/monthly deferred. |
| P2 | Research inference | Frozen preparation preserved:99/964 V retained, subgroup imbalance/overlap unresolved. No outcome inference, strategy retuning or profitability result. |
| P2 | User/data reliability | Keep bounded physical-touch, screen-reader/translation/readability checks and file-origin portability limitation. No repeat user reload test or origin migration by default. |
| P2 | CLI credential storage | Existing plaintext CLI storage finding retained; do not print secrets or change unrelated/global config. |

## Delivery method
- One implementation owner. Bundle 2–4 related items around one user outcome; documentation/Help/tests belong to that package.
- Focused checks during development; required full checks/actual CI on final relevant code. Repeat when failures/changes justify it, not as a ritual.
- Prepare release documentation with code; avoid a second publish cycle solely to announce the first passed. Keep final run receipts in existing ignored QA output; never fabricate source-bound CI.
- CI keeps workflow triggers/check names: the scope job tests its classifier on every run. Only changes limited to README.md, STATUS.md, START_HERE.md and STATUS_HISTORY.md may skip application/browser jobs. Code/test/workflow/schema/evidence/unknown paths, invalid comparison and manual dispatch select full QA. Missing classification must not become a successful release.
- No new runtime dependencies, no reacquired research data, repeated cohorts, hour soak or midnight observation for this chart package.
- Replace this current snapshot/board after delivery rather than appending another entire history. Detailed evidence stays at named existing result paths; START_HERE is the stable entry protocol.

## Accepted evidence and remaining boundaries
- Exact0.4.4 hour soak:3600.018s,12 confirmed closes; `tests/results/real-session-0.4.4/`.
- Exact0.4.7 midnight PASS:420.007s independent,2 closes, actual source-day rollover, no duplicate/unexplained recorded errors; `tests/results/midnight-0.4.7-20261026/`. These do not transfer to later versions.
- User0.4.12 reload screenshot retained ADR+UTC; provided journal export had183 records/no duplicate IDs/missing signatures. No post-reload signature comparison or universal file-origin acceptance. Personal journal remains outside GitHub.
- Preserve frozen0.4.3 source context, CLI1.0.1/schema1 and26496-row BTC5m Q3 dataset hash `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`.
- Preserve app/rules/execution/old records for display work. Distinguish verified source/public/live/user evidence; scores are not probabilities, OHLCV is not true order flow, unavailable is not zero.
- UI language: English chart/header, Hebrew panel, bilingual Help. Discuss in Hebrew with exact steps, short checklist and final מעקב line.

## Delivered chart usability contract — 2026-10-27
- Display → Wheel zoom: Slow defaults; ±100 normalized pixels gives exp(±0.08), per-event absolute log cap0.12. Line=16CSSpx, page=current price-plot height; Standard preserves previous pixel response. Cursor anchoring, limits, manual price bounds, Shift/horizontal, axes and +/− remain. Choice isolated/guarded; no animation/timer.
- Right-click opens only the viewport-bounded Reset chart view menu. Action calls existing Reset (150/latest/auto price); committed drawings/type/layers/preferences remain. Escape/outside dismissal, keyboard/focus and browser menus outside canvas preserved. Draft/edit opening is cancelled without saving; Pointer/Manual · selected/two-click creation explained in Help.
- Volume still uses source candles for the chosen timeframe. New contexts Auto; manual ceiling only own symbol/timeframe, height shared. v2 isolated/bounded32 contexts/16KiB; valid legacy height may be reused, unscoped ceiling never guessed, v1 bytes never written. Malformed/read-failed/external-changed v2 is retained with session-only edits. Auto/reset/zero/clipping/RSI/None remain.
- Normal absolute prices share adaptive formatting: PP101.19 / R1102.49 / S199.64; small prices retain nonzero significant digits/scientific notation, axes use step precision. Exact daily details, tooltips and JSON remain; distinct values never merge by rounded text or tick-snap. ADR/non-price metrics retain their own unit formatting.
- New bindings `qa/source-checksums.0.4.15.json`, `qa/chart-usability-0.4.15-sha256.json`; exact0.4.14 baseline retained.174 prior named functions:162 exact,12 view hooks changed, fmt presentation only. No calculation/feed/rule/execution/journal/frozen change. Existing maintenance workflow/classifier and STATUS_HISTORY unchanged; full QA must execute for this code package.

## Recorded-journal inventory for the next package
The user-supplied 183-record export was inspected read-only outside GitHub. Every record contains the five selected-side condition items, recorded side/score/plan field, app/rule version, observation/close time, source OHLCV and basic window coverage. No record contains a full two-side candidate diagnosis; old execution/RSI policy fields are absent in some versions. Historical review must show only recorded data, retain unavailable/version-specific states and never recompute old decisions using current inputs. No user journal records, prices or signatures were uploaded to GitHub.

## History and audit trail
[STATUS_HISTORY.md](STATUS_HISTORY.md) preserves the complete previous STATUS byte-for-byte, including its original read-only archive, dated sources, hashes, links, decisions and superseded plans. Older root-relative links remain valid because the archive stays at repository root.
Historical source baselines/reports/manifests and completed maintenance remain unchanged. This chart package advances only the active application to0.4.15; inspect the current HEAD/full Actions run and ignored final receipt.
