# Bounded QA closure — retained CI41834060172 failures

2026-11-04. Test/evidence-only package, based on scope `bdd8d80`. Root HTML remains **0.4.25 RC**, SHA-256 `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`. No funding-fix reimplementation or application change.

## Retained evidence first

Downloaded original Chromium artifact13325375403 was already retained locally; its full ZIP SHA-256 was reverified as `4bac38fe7a198482267111262f7524d23f6795041117e90e010ddd6e70fb5543`. Inspected the actual regional JSON and three candle traces. [Compact extracted observations](retained-findings.json); original remains ignored at `.qa-results/next-funding-cutoff-0.4.25/chromium-failure.zip`.

- Regional: enabled bytes existed before reload; the key was absent after fixture preparation and before app initialization, without a storage access error. Across1800 polls, `S.sig` remained truthy and `S.regionalEnabled` false (no recorded transitions). This identifies the failed operand and the missing pre-app bytes, not why they disappeared.
- Candle: desktop1440 and390 completed. On320px, the state wait completed at trace5022.716ms; model read at5026.799ms had asOf1793154900000 and ratio0; DOM read at5031.717ms still returned1.5×. The old state-only wait did not establish render readiness.

## One controlled render-boundary capture

Ran the focused candle suite once, with one opt-in test-only native-frame hold at320px. Before the event both anchors were1793154600000 and ratio1.5. After confirmed input, the model was1793154900000/0 while the held DOM remained1793154600000/1.5×. Exactly one pending original callback was released through the native requestAnimationFrame. After rendering, DOM and model agreed on1793154900000/0×. [Measured capture](render-boundary.json).

This demonstrates the state-before-render race and supports repairing the test's readiness condition. It is not evidence of persistently wrong application rendering. The test now waits for the actual rendered confirmed close, symbol/timeframe **and exact0× text**, alongside model asOf. All original arithmetic/DOM assertions remain; the same default30-second timeout applies. No forced panel()/draw(), sleep, timeout increase, skipped assertion or production instrumentation. The diagnostic hold is opt-in and not enabled in CI.

Focused `browser-confirmed-candle-context.cjs` PASS:1440/390/320, original geometry/zero/warm-up/invalid cases, anchors, history/provisional/selection isolation, transitions, preserved open state, storage/journal and bilingual Help. Raw focused output/traces: `.qa-results/qa-closure-0.4.25/candle-render/` and `candle-render.log`.

## One supplemental regional retention pair

Ran exactly one isolated file-URL / stable mocked-HTTP pair, one reload per origin, same synthetic120-bar clock fixture and initially absent regional key. The real checkbox wrote on/off/on; source moved to ETH/15m before reload, matching the retained failing sequence's source transition. Recorded before/after each explicit write, before/after the fixture's unrelated-key write, before app initialization and after initialization. The regional key was never seeded on reload. [Scoped observations](regional-pair.json).

**Both origins retained and restored the enabled bytes.** The file test was not replaced with HTTP; the production origin and user storage were not touched. Original `browser-regional-windows.cjs` and `regional-reload-capture.cjs`, including file URL, combined predicate, assertions and timeout, remain byte-exact. No whole-suite reproduction or repeat of the paired comparison. The one-shot diagnostic retains a start marker and refuses to overwrite an existing attempt directory; it is not added as an automatically recurring CI suite.

The historical failure's cause remains **UNKNOWN**. These successful observations cannot show file-origin causality, universal persistence, or a fix for the distinct historical planning-fee reload issue. No speculative application patch is justified.

## Validation / publication boundary

- Static syntax/diff checks PASS; active source checksum PASS. All pre-existing root/scientific/baseline/reference/checksum/result identities checked unchanged; compact new evidence is additive.
- Focused candle check PASS with one controlled capture; paired diagnostic completed file+HTTP once, both restored. Network guard observed no unmocked public requests. No user profile, storage clearing, origin migration, market capture, research, new timer/dependency or app release.
- One required full change-selected CI invocation is requested on the exact settled publication. Its actual conclusion/attempt/jobs are read after push and retained in ignored `.qa-results/qa-closure-0.4.25/ci-verification.json` and final handoff. No result is inferred from local success; original CI41834060172 remains FAIL, and a later successful run would not establish a native-retention fix.

Stop after this package. Remaining reliability gap: intermittent pre-initialization regional storage absence remains unexplained; no claim of universal file-URL persistence or repaired historical planning-fee reload. If required CI naturally fails again, retain its exact new evidence; do not retry merely for green.
