# Perp Local support v2 — INCOMPLETE, output-stage error

**The one fresh attempt is closed without a preparation result.** Dependency-scoped execution passed exact oracle parity and resource admission. The worker then failed during terminal census construction: `F.tally is not a function`. This was an interface mistake copied from the unexecuted full-preparation branch of v1; the frozen design module defines `tally` internally but does not export it. V1 itself remains unchanged and resource-refused.

The error is demonstrated by the retained stack and the original module's export list. It is not a resource refusal, a scientific-gate failure, or an application defect. I missed this mismatch before execution. The synthetic checks did not exercise the worker's final serialization branch. No retry, resume, post-failure source repair or extra allowance was used. Executed v2 sources remain exactly as sealed, including the failing helper, for honest reproduction of the failure.

## Execution contract and measured gates

The dependency table and causal argument were written before the attempt in [DEPENDENCIES.md](../../../research/perp-support-v2/DEPENDENCIES.md). [Protocol](../../../research/perp-support-v2/protocol.json) retains v1's scientific sections exactly; `execution` alone replaces the repeated full-analyze implementation. Its scientific `calculation.state` describes the original full-prefix mathematical oracle, not the new runtime's execution cost. No rolling seed, shortened history or numerical reassociation was introduced.

The restricted adapter extracts the archived0.4.3 numeric/reference functions, classification forEach and complete ATR initialization/recurrence verbatim. It computes causal primitives from the same July1 origin once, and returns copied prefix-only snapshots. It does not compute EMA/RSI/VWAP/M/W/stopping-volume/recovery, invoke selection/execution, or modify OHLCV. Unchanged v1 `frameRows`, `takeFirst`, matching, balance and reporting science are reused directly.

| Item | Actual evidence |
| --- | --- |
| Synthetic verification |6 groups PASS, 6.529s Node test duration; no retained input read |
| Exact synthetic parity |90 seed/gap/invalid/overflow/zero/doji/qualification frames and censuses; complete450-decision fixture with451 independently specified first IDs, including360 tail exclusions; complete independently specified CEM result |
| Retained-data parity |EXACT consumed frames, features and censuses at3999,9236,14473,19711,24948,30186,35423; original unchanged full-prefix oracle |
| Restricted causal-series initialization |203.859332ms, charged inside grant |
| Restricted benchmark max |4.437793ms, at index35423; query plus unchanged frameRows |
| Conservative admission projection |31,425 ×4.437793ms ×2 +60,000ms =338,915.29005ms |
| Remaining at admission |1,195,374.838169ms, minus2s cleanup reservation |
| Memory admission projection |747,741,184 bytes;2×observed combined high-water bound |
| Admission |PASS, before full collector |
| UTC start / finish |2026-11-04 19:54:07.283 /19:54:53.254 |
| Actual total monotonic elapsed |48.081520120s of the fresh1200s maximum |
| Worker observed HWM |318,750,720 bytes |
| Conservative worker+controller RSS observation |375,181,312 bytes; cap1,073,741,824; no observed violation |
| Terminal state |INCOMPLETE, exit2; no interruption/resource-limit trigger; one worker/attempt |

The parent samples worker VmHWM plus controller RSS every50ms; worker guards also check its HWM. Initialization, input validation, oracle comparisons, admission, collection and attempted output are all inside this receipt. Observed elapsed is not the authorized maximum or the admission projection. Remaining unused allowance is not a new run authorization.

## Retained input and sealed identities

The unchanged typed loaders verified35,424 closed contiguous Binance USD-M BTCUSDT5m trade bars, [2026-07-01,2026-11-01)UTC, fixed July1 origin. No acquisition, Mark/Spot substitution, historical cohort/model reuse or dataset rewrite occurred. See [input seal](input-seal.json) for coverage,12-field identities and native units.

| Identity | SHA-256 / canonical hash |
| --- | --- |
| Q3 canonical data |`84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`|
| October canonical data |`aa96d6649a19effcaec2eb9a20871927a994c7b51a531b57329c6c3e8c75532c`|
| Joined original rows |`982412ebcf98b08e0278c625e3a3684e9dbdefba707a94102506b681a614cd71`|
| V2 protocol canonical |`e6a19f176e4a9fb1253e397cb24ff5b6fdcea0192b09be0d1f9c287eb589e564`|
| Pre-market source-seal payload |`f65f54bcd41eb9f54da7996b75b7fbfdccd86fd12df04346a3d0295ea7eda8a9`|
| Source-seal file |`8cdde4d997df755934c05753d7dd54f93c372544691ab6c321f50e3770cf2400`|
| Consumed original function text |`318db5a252fb6a68097d7aab163498276afcc3e0bec0c71f5277f071d2d284ce`|
| Restricted VM code |`39fa6a212409f7fc0b3e70fe2c7a62704799e9009df86997c3e7cfd0bdf99637`|

[Pre-market seal](source-seal.json) binds controller, adapter, worker, parity/verification code, dependency document, tests and unchanged pinned scientific dependencies. [Parity](parity.json), [admission](admission.json), [failure](failure.json), [resource receipt](resource-receipt.json), [synthetic receipt](synthetic-verification.json) and [independent stored-evidence reconciliation](verification.json) retain their identities. Q3 file bytes remain d3fe4e7d…; October470ca124…; complete file hashes are in the input seal.

## What is and is not available

The log reached index35399 with8,517 in-memory first episodes; this is a progress observation, **not the final cohort count**. A [cutpoint seal](cutpoints-seal.json) was written after collection. It is retained as a partial forensic artifact, not a successful support result or permission for outcomes. The failure occurred while constructing the result object, before episodes/weighted/unmatched/result files were written.

| Requested result | State |
| --- | --- |
| Final counts/exclusions/composition |UNAVAILABLE: no persisted complete cohort |
| All weights, retention and unmatched composition |UNAVAILABLE |
| Balance/undefined diagnostics and required or supplemental gates |UNAVAILABLE; no persisted verdict; NOT EVALUATED for delivery |
| Days, ESS, concentration and coordinate overlaps |UNAVAILABLE |
| Final cohort/weight/result hashes |UNAVAILABLE; absent files independently verified |
| Outcome labels, future barrier resolution, returns, fits/bootstrap/inference |NOT COMPUTED / NOT AUTHORIZED |

No figures are reconstructed from current market data or another feature pass. The partial cutpoints/progress must not be interpreted as design success/failure, sufficient power, independence or evidence for an effect. Exact parity at declared fixtures/indices supports the restricted consumed dependencies; it is not universal live equivalence. Q3/October remain exposed exploratory data.

## Validation, preservation and stop

`node --test tests/perp-support-v2.cjs`:6 PASS. `npm run check:source`:PASS. New synthetic tests are included in existing `test:preparation`; required change-selected full CI is inspected once on the published commit, recorded in ignored `.qa-results/perp-support-v2/ci-verification.json` and the final handoff. No green retry or extra publication solely announcing CI. CI engineering success cannot convert this failed market preparation into a support result; prior browser-storage causes remain UNKNOWN.

977 pre-existing tracked identities and6 original ignored v1 attempt files verified unchanged. Active HTML stays0.4.25 RC, SHA`f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`. PR1 remains open DRAFT at6c66e608, unmerged. Old scientific files/seals/data, personal storage and other projects untouched. No application, strategy, feed, persistence investigation or live/research outcome run.

Original raw attempt/logs remain ignored at `.qa-results/perp-support-v2/market-attempt/`; compact receipts are published here. The completion-only `verify.cjs` cannot reconcile a missing result; this failure was instead checked directly against sealed hashes, resource receipt, failure stack, unchanged original export list and absent output files.

**STOP.** The smallest corrective step is a separately authorized output-only tally/interface correction plus an end-to-end synthetic terminal-output fixture. Any subsequent retained-data calculation needs a new explicit attempt contract; this attempt may not be resumed or its source/receipt history rewritten. No automatic extension, retuning, outcome stage or extra study.
