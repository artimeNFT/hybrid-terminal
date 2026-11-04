# Perp Local support v1 — RESOURCE-REFUSED

**The single market attempt ended at resource admission.** Data validation succeeded. The frozen conservative projection did not fit the remaining1200-second allowance, so the full preparation never started. No support-gate verdict, partial-success claim or hypothesis/edge conclusion follows.

## Measured run

| Item | Actual observation |
| --- | --- |
| UTC start / finish |2026-11-04 19:09:33.777 /19:09:37.499 |
| Monotonic elapsed, validation/benchmark/output included |3.722105399s |
| Authorized maximum |1200s; one attempt; no resume/extension |
| Worker high-water RSS observation |294,019,072 bytes |
| Conservative worker+controller RSS observation |348,577,792 bytes (~332.43MiB) |
| RSS ceiling |1,073,741,824 bytes; no observed violation |
| Largest of seven full-prefix+feature samples |106.897204ms at index19711 |
| Complete decision range |[3999,35424):31,425 decisions |
| Frozen projection |31,425 ×106.897204ms ×2 +60,000ms =6,778,489.2714ms (~112.975 minutes) |
| Remaining allowance at admission |1,196,334.707955ms (~19.939 minutes), minus2s cleanup reservation |
| Admission |REFUSED: insufficient remaining time |

The projection is a conservative engineering estimate, not observed full-run time. The grant was not exhausted; the one-attempt rule still closes this attempt. No second benchmark, faster substitute, truncation, stateful approximation or resource extension was attempted. Memory was not the refusal reason. RSS uses Linux high-water observation plus controller RSS as a conservative combined bound, sampled every50ms; the worker also checks its own high-water mark. See [admission samples](admission.json) and [resource receipt](resource-receipt.json).

## Verified retained data — no acquisition

| Series/file | Rows | Canonical data hash |
| --- | ---: | --- |
|`research/datasets/binance-usdm-btcusdt-5m-2026-q3-v1/trade.json`|26,496|`84a4396bd3534859f663c2b5d08ab2cc1221749eb461cd54d593c3ddf7669397`|
|`research/datasets/hybrid-candidate-context-v1-october/trade.json`|8,928|`aa96d6649a19effcaec2eb9a20871927a994c7b51a531b57329c6c3e8c75532c`|
|Joined original12-field rows|35,424|`982412ebcf98b08e0278c625e3a3684e9dbdefba707a94102506b681a614cd71`|

Exact bytes: Q3 SHA-256 `d3fe4e7db46ceccc6b17f35298577fc1072c1298602cf22c535ba0b7ec48bbca`; October `470ca1240d970d94e5271e6466781644ab5f418ab4d5c4f3b16e5f4eec129e06`. Existing typed loaders verified schemas, contract identity, decimal fields/hashes, closed/canonical grids and the join: [2026-07-01,2026-11-01)UTC at5m, no gaps/duplicates/conflicts. Trade base volume is BTC; Mark/funding rows were not read as inputs. Companion hashes are provenance only. [Input identity seal](input-seal.json) retains coverage and units. Raw datasets remain ignored and unchanged.

## Scope actually reached

| Requested preparation output | State |
| --- | --- |
|Dataset/source identity and coverage|VERIFIED|
|Protocol, source binding and resource grant before market computation|SEALED|
|Seven declared admission samples|COMPUTED; timing/memory only, no retained episode rows|
|GLOBAL first episodes, arm counts and population exclusions/doji census|NOT COMPUTED|
|V cutpoints/constants, cells, all weights, retention/unmatched composition|NOT COMPUTED|
|Balance/SMD/undefined flags globally/by side/period/block|NOT COMPUTED|
|Days, weighted ESS, concentration, same/cross-arm window overlap|NOT COMPUTED|
|Design gates≥50% retention /≤0.10 SMD|NOT EVALUATED|
|Outcome labels, future target/barrier resolution, returns, fitting/bootstrap/inference|NOT COMPUTED / NOT AUTHORIZED|

The coordinate-only block boundaries are [[3999,14474),[14474,24949),[24949,35424)], with120-bar tails reserved inside each block. These coordinates are protocol arithmetic, not measured episode counts. Benchmark frames were discarded; episodes/weighted/unmatched/cutpoint files are absent. [Terminal result](result.json) explicitly keeps those fields null and preparationComplete=false. Exit code0 denotes a handled refusal, not scientific completion.

## Frozen definition / identities

The chosen population is Local, not source-derived boxes: qualified mutually exclusive cls2 vectors versus qualified cls0 controls, excluding cls1/zero-range/unavailable sources; Local C≥O doji polarity; original full[L,H]/midpoint, age1–300, directional strict near-edge rule≤6ATR and midpoint untouched through the decision. All zones and global first valid eligibility precede coordinate tails; no nearest/score/M/W/stopping-volume/tie selection. No previous99-pair cohort is reused.

The new explicit wrapper reuses archived0.4.3 mathematical functions, SHA `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`; full-prefix reconstruction from July1 remains intact. It does not extract sigAt/backtest or execute bootstrap/storage/network. The frozen CEM recipe, exact strata, V type7 deduplicated terciles/equality-lower rule, all-row weights and fixed pre-match pooled sample SD are in [the protocol](../../../research/perp-support-v1/protocol.json) and [pre-computation source seal](source-seal.json). No post-support rule changes occurred; support was not observed.

- Protocol canonical hash: `342c943591abe998d991fe4707969f96859a1daa7e2d9e803e9c3085eceb5df5`.
- Source-seal canonical payload hash: `47a3a6941034615ac7c57d53b38553f0a0c61703f81c92ca4e8c28c7c0d9c4d0`.
- Input-seal hash: `b6feb8da1963b38bdf9fb8862a6d056bf1709c25e137a5097f8ffa8dfba31016`.
- Terminal result canonical hash: `68124f0607a52033bbe3e3f3ecf6ab08b7391ca941a45a58fc5f726bd892d59f`.
- Resource-receipt payload hash: `bcdeab3f282c7e70662fc887ee7ff19e6d8171292763a4099c93de56a9365a69`.

Source/data/result/receipt hashes were independently reconciled after termination without repeating market calculations or data acquisition. [Verification receipt](verification.json) records file hashes and preserved tracked identities. Code/Node24 fixture tests are separate from the market resource allowance.

## Validation and finish

Nine focused synthetic groups cover exclusive arms/doji/touches, original-prefix causality, global-first-before-tail order, tercile ties/constants, all-row weights/distinct controls, fixed-denominator and undefined balance states, overlaps/ESS, resource refusal/completion and a positive synthetic gate case. Deterministic hashes repeat on small fixtures. Existing source checks pass. Required exact-published change-selected CI is read after push and recorded in ignored `.qa-results/perp-support-v1/ci-verification.json` and final handoff; no result is inferred and no retry for green is permitted.

Authoritative main HTML remains0.4.25 SHA `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`; draft sizing PR1/6c66e608 stays unmerged. Old sources/protocols/seals/studies remain exact. No provider acquisition, app/strategy change, live/browser/storage investigation or unrelated-project work. Required product QA is separate from research feasibility and cannot turn this refusal into preparation success.

**This version ends here, resource-refused.** Q3/October remain exploratory/exposed. Support/power/independence/exchangeability and the central hypothesis are not established or disproved. No outcome stage or continuation is authorized; no automatic optimization, relaxation or new consultation loop.
