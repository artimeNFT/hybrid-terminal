# Hybrid Terminal — current status
Updated: 2026-10-29, Asia/Jerusalem. Single current task board; start with [START_HERE.md](START_HERE.md).

## Verified checkpoint and completed work
- Private repository [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal), main. Sole active app: `/mnt/c/users/shlom/desktop/the hybrid-terminal/hybrid-terminal.html`; VECTOR LAB is separate.
- App **0.4.17 RC remains byte-for-byte unchanged**, SHA-256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`; application commit `1608a5d98bbed55839bec28c22880144cdcb01c0`. No application release/feed/strategy change in this intake.
- Existing pilot `e5198f856d8829621aa16ff576c67c453e0fc63f`, [full CI40733330767](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40733330767), attempt 1 passed all 3 jobs/20 Chromium suites. One 906-trade run remains unchanged; no outcomes/replay in this package. [Report](tests/results/policy-pilot-v1/REPORT.md), [summary](tests/results/policy-pilot-v1/summary.json).
- Read-only economics `fca5bf957a6be66f1d4941778e68719ebd3d1c12`, [documentation CI40767950669](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40767950669) passed scope/regression; deterministic/browser skipped. Accepted/closed: median stop 14.000168bps, modeled 10 bps median cost 0.714277R/ mean 1.013239R. Full table remains at that STATUS commit and ignored economics receipts; no diagnostic repeated.
- Capture `1ea5eac40882178076688378edfd1434d4801c2e`/[CI40673156079](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40673156079) remains installed/monitored, cause unresolved. Chart/journal/context complete; user journal desktop acceptance 2026-10-27 retained.

## Current task — derivatives gross/fee-only pilot
**In progress, same owner/main.** Intake `34b76b47c1ab4592ca5eacdaf28caad9762080d7` / [exact full CI40775631512](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40775631512) is complete; no acquisition repeated. Planning checkpoint `6e839eba7d83000ef4af57610c067d232e6c16f5`. The complete pre-outcome scope is preserved in [REVIEW_CONTRACT.md](research/derivatives-pilot/REVIEW_CONTRACT.md).

Separate typed derivatives trade loader/calculation identity, unchanged frozen 0.4.3 expressions and narrowly reused original execution/statistics helpers. No Spot loader/Spot contract identity for derivatives. Full July1 past prefix, minimum score3, original SHORT tie, next-open entry, stop-first/gap/TP2/TP1-touch policies. Stop/TP2 at j resumes j+1; expiry priced at i+120 resumes i+122; final-bar hit resumes i+121. One continuous flat-at3999 schedule through26375, three fixed blocks. Fixed5/10/20bps replace the original charge.

Protocol/source/data sealed **before outcomes** in [seal.json](research/derivatives-pilot/seal.json), UTC `2026-10-28T22:25:52.913Z`; canonical protocol `4944bd1c272a28b903b5c9b808a77c83e0207ad8850bbc47a8ddf813dba09ef8`, new calculation contract `f740da9b9d456a789abba2e063c95583c52a32950f68d836196ae9fa06b8fe5f`. Existing typed trade26496 rows verified offline: hash `84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`, bundle `8aa007d238f83d85506a46b733f3326d3571b2a385ea29769fb57dea6bc76844`. Mark/funding are provenance references only; their rows never enter calculation or fills.

**Label:** gross / after modeled fees, before funding and other unmodeled execution/account effects. Funding state `not-applied: calendar completeness and account settlement timing unverified`, value unavailable/null, never zero. Fully adjusted return unavailable. Current exchange metadata is not Q3 trading rules. No leverage/margin/liquidation, actual fees, spread/slippage, tick/lot, latency or partial-fill model. Q3 exploratory; no inference/advantage claim.

**Checks already performed:** 10 focused deterministic fixtures passed after correcting the new adapter's VM-object normalization; original frozen expressions untouched. Typed trade/Mark/Spot rejection, synthetic original-engine parity, LONG/SHORT next-open risk, stop/gap/ambiguity, expiry/final-hit scheduling, non-overlap, fee-once and funding-zero rejection covered. Log `.qa-results/derivatives-pilot-v1/fixtures-final.log`. No real run yet at this checkpoint.

**Exact resume:** execute the single sealed run into `.qa-results/derivatives-pilot-v1/run` with hard3600s cap; exclusive attempt receipt prevents retry. Verify stored trace/aggregates without replay, publish compact report/code/seal/STATUS together and verify exact full CI. On failure report incomplete; no retry, truncated history or reseed.

## Current task board
| Priority | Work package | State / completion rule |
| --- | --- | --- |
| P1 | Derivatives gross/fee-only pilot | Sealed before outcomes; focused fixtures passed; one bounded real run next, then report and stop. |
| Done | Contract-matched intake | Trade/Mark26496 each, funding276 retrieved/calendar UNKNOWN; [source-bound report](tests/results/derivatives-intake-v1/REPORT.md), immutable ignored bundle. |
| Done | Spot pilot/economics and app/context | Preserved historical reports, datasets, seals and app0.4.17; no replay or release. |
| Done / monitored | Regional reload capture | Installed; cause unresolved, inspect natural failure artifact only. |
| P2 | Preserved gaps | Live initialization/append/reload equivalence; all-zone99/964 imbalance/overlap; physical touch/accessibility/Psy/TR parity unresolved. |
| P2 | CLI credential storage | Plaintext-storage follow-up; no credential display/global changes. |

## Preserved evidence and limitations
- Intake schema/provenance/quality/delivery: [report](tests/results/derivatives-intake-v1/REPORT.md). Raw existing data ignored at `research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/`; no new requests. Current metadata, returned funding types/millisecond timestamps and unknown calendar remain attached unchanged.
- Pilot raw receipts ignored at `.qa-results/derivatives-pilot-v1/`; no personal journal/browser storage accessed. Required full CI uses synthetic fixtures only, no acquired data. Previous CI is not this package's CI.
- Historical source/checksum manifests remain unchanged. No app/feed/strategy/journal/preference/dependency change. Scores are counts, not probabilities. Contract reference is not a final venue/account/fee selection.
- Exact0.4.4 hour soak and exact0.4.7 midnight evidence remain source-bound; neither repeated/transferred. README correction complete. [STATUS_HISTORY.md](STATUS_HISTORY.md), Git and historical reports retain earlier evidence.
