# Next-funding cutoff correction —0.4.25 RC

Active root HTML SHA-256 `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`. Exact pre-edit0.4.24 archive `baseline/hybrid-terminal.0.4.24.html`, SHA `4dc829b480fd81080b50549a3d43b5e335c822958d7331c44af0721c854cfa35`. [Preserved pre-edit STATUS/review](STATUS-before.md). Clean main safely fast-forwarded to review3ac263b; no local notes discarded.

The reviewed counterexample is real: at trusted batch cutoff2026-11-04T10:00:00Z, premium source07:55Z and scheduled08:00Z, archived0.4.24 returns captured. It selected source time instead of checking the batch cutoff.

The correction requires valid batch cutoff C and scheduled time N with **N>C**. A supplied source time P must also be valid and satisfy **N>P**. Missing/null P can remain UNKNOWN while future qualification comes from C. Unknown/invalid C, past/equal N, or a nonqualifying supplied P leaves the schedule unavailable. Device/receipt time is never a substitute. Raw scheduled value, source time, endpoint and receipt remain in existing exact details; other projected fields are unchanged.

Only the existing `perpetualNowProjection` function body changes. No formula, request count (max7), request path, timeout (existing12s), scheduler, subscription, strategy, score, zone, plan, cost/sizing, journal/export or scientific change. English/Hebrew Help clarifies the corrected condition; application metadata advances to0.4.25 RC. Historical manifests/reports/seals remain unchanged.

## Focused validation

Six new deterministic groups plus the existing nine context groups PASS. Independent literal UTC cases cover the reported stale source, schedule before/equal/1ms after cutoff, unknown/invalid cutoff, future schedule, source after/equal schedule, and missing source time. A device receipt later than the scheduled time and device clock2030 do not replace trusted server/source bounds. Rejected input/raw metadata remain byte-equivalent; all other output fields match archived0.4.24 exactly. Function inventory confirms projection is the only changed original body; legacy engine/plan/journal state is preserved.

Actual mocked Chromium1440/320 exercises the five requested scenarios through REST fixtures and the existing Refresh button. Each batch still has7 requests. Past/equal/unknown cutoff produce unavailable; future/missing-source produce captured with UNKNOWN source time where appropriate. Raw scheduled values/receipt details remain inspectable, while Mark/quotes, decisions/journal/preferences stay independent. No public requests. [Counterexample desktop](1440-funding-past-cutoff.png) / [320px](320-funding-past-cutoff.png).

Required `npm test` and `npm run test:browser` PASS (27 scripts) on settled source.825 protected tracked identities and140 prior identities remain unchanged (overlapping sets); original0.4.24 is archived byte-exact. Exact pushed full CI is recorded in the ignored receipt and final handoff. Post-push readback is saved ignored at `.qa-results/next-funding-cutoff-0.4.25/ci-verification.json`; no published result is inferred from local success and no extra commit solely announces CI.

## Limits / stop

No new public smoke, observation, study, acquisition or fitting. The historical0.4.23 reload issue remains UNKNOWN/parked; a passing unchanged assertion is not a fix. Captures remain static until manually refreshed and are qualified as of their batch cutoff, without a perpetual freshness/next-payment guarantee. No physical/long-session acceptance transferred. Stop after this correction; next is the existing short user source/time/readability review.
