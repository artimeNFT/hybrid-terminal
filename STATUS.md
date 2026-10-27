# Hybrid Terminal — current status
Updated: 2026-10-27, Asia/Jerusalem. This is the single current task board.
Start with [START_HERE.md](START_HERE.md). Earlier dated plans are historical, not active instructions.

## Verified current application
- Repository: [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main.
- WSL root: `/mnt/c/users/shlom/desktop/the hybrid-terminal`; sole active app: `hybrid-terminal.html`. VECTOR LAB is separate.
- App **0.4.14 RC**, SHA-256 `f6b072c4ef074cc3a12184bc1b759d1d009a525dab1e2ca6cf07d200be9bb334`.
- Verified application checkpoint: `91463edc31eee0767ab3901db2b12cd961b47f94`; [exact CI40411203307 passed](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40411203307), both application QA jobs.
- Delivered: confirmed/provisional decisions, history/navigation, palette/body modes, target-path/cost scenarios, bilingual Help, Volume controls/confirmed ratio, regional clocks, ADR20, Candles/Line and manual trend lines.
- These workflow/UI checks do not establish predictive accuracy or profitability.

## Active ownership and next action
**User correction, 2026-10-27:** the wheel-zoom prompt has NOT been given to Codex. It is **queued, not running**. Earlier statements that it was active are superseded.
CI/documentation maintenance is delivered and its full run passed at 9d56334f1ba100ce7446caf8f5611997211cf82d: [run40442554371](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40442554371). No new app feature is running based on the latest user report; verify local state before writes rather than inferring it from GitHub.
**Next:** issue ONE consolidated Chart usability prompt: gentle wheel zoom, right-click Reset menu, context-correct Volume auto scale, compact price labels, and matching Help. This supersedes prior wheel-only drafts. Still queued/not issued; no overlapping task.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| P0 | CI and concise handoff | Completed: eight scope regression cases; actual full maintenance CI40442554371 passed. Old STATUS archived byte-identically. Documentation-only jobs may be intentionally skipped, never described as executed. |
| P1 | Chart usability package | Queued, NOT issued. Slow/Standard wheel zoom; right-click menu invoking existing Reset semantics; Volume Auto for unvisited symbol/timeframe with scoped manual overrides and shared height; compact price labels with deliberate exact-value access; drawing-control Help. Preserve source calculations/drawings/journal. |
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
- No new runtime dependencies, no reacquired research data, repeated cohorts, hour soak or midnight observation for this maintenance.
- Replace this current snapshot/board after delivery rather than appending another entire history. Detailed evidence stays at named existing result paths; START_HERE is the stable entry protocol.

## Accepted evidence and remaining boundaries
- Exact0.4.4 hour soak:3600.018s,12 confirmed closes; `tests/results/real-session-0.4.4/`.
- Exact0.4.7 midnight PASS:420.007s independent,2 closes, actual source-day rollover, no duplicate/unexplained recorded errors; `tests/results/midnight-0.4.7-20261026/`. These do not transfer to later versions.
- User0.4.12 reload screenshot retained ADR+UTC; provided journal export had183 records/no duplicate IDs/missing signatures. No post-reload signature comparison or universal file-origin acceptance. Personal journal remains outside GitHub.
- Preserve frozen0.4.3 source context, CLI1.0.1/schema1 and26496-row BTC5m Q3 dataset hash `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1`.
- Preserve app/rules/execution/old records for display work. Distinguish verified source/public/live/user evidence; scores are not probabilities, OHLCV is not true order flow, unavailable is not zero.
- UI language: English chart/header, Hebrew panel, bilingual Help. Discuss in Hebrew with exact steps, short checklist and final מעקב line.

## Chart usability scope — 2026-10-27
- Right-click should OPEN a small menu with Reset chart view, not reset immediately. Its action reuses current Reset behavior (150 bars/latest/auto price); committed drawings, indicator layers, chart type and preferences stay. Existing Reset remains accessible.
- Volume is already based on the selected timeframe's source candles. The defect is manual scale reuse across symbol/timeframe. New contexts default to Auto; explicit manual ceilings belong only to their own symbol/timeframe, while pane height remains shared. Do not infer the context of an old unscoped saved ceiling or silently erase legacy bytes.
- Compact daily status already exists. Raw pivot decimals remain intentionally available in dailyInspector/exact details via dayPrice. Audit the actual display path before editing: normal labels/summaries should be concise/adaptive, while deliberate exact details/tooltips/export preserve underlying values. Example normal display: PP101.19 / R1102.49 / S199.64. Never round analytical values, tick-snap computed pivots, or merge distinct levels by rounded text.
- This package and its Help/tests are one release. Journal review remains next, not part of this package.

## Recorded-journal inventory for the next package
The user-supplied 183-record export was inspected read-only outside GitHub. Every record contains the five selected-side condition items, recorded side/score/plan field, app/rule version, observation/close time, source OHLCV and basic window coverage. No record contains a full two-side candidate diagnosis; old execution/RSI policy fields are absent in some versions. Historical review must show only recorded data, retain unavailable/version-specific states and never recompute old decisions using current inputs. No user journal records, prices or signatures were uploaded to GitHub.

## History and audit trail
[STATUS_HISTORY.md](STATUS_HISTORY.md) preserves the complete previous STATUS byte-for-byte, including its original read-only archive, dated sources, hashes, links, decisions and superseded plans. Older root-relative links remain valid because the archive stays at repository root.
App source and historical reports/manifests are unchanged by this maintenance. Inspect latest main HEAD/Actions for the maintenance result; application version/hash intentionally remain0.4.14.
