# Regional reload capture — 2026-10-28

Completion: **capture installed; cause unresolved and monitored**. Test/documentation package only. Application 0.4.17 RC remains SHA-256 `a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a`, matching application commit `1608a5d98bbed55839bec28c22880144cdcb01c0`. No application release, origin change or personal profile access.

## Retained diagnostic

The complete previously uncommitted notes are preserved in [DIAGNOSTIC_STATUS_20261028.md](DIAGNOSTIC_STATUS_20261028.md). The investigation was not repeated. Attempt1 of [run40552915409](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40552915409) timed out on the combined regional reload predicate; attempt2 passed unchanged. Rendered state implicated regional restoration, but no actual failing-poll operands or immediate pre-app raw-key sample were retained. Storage loss and a general file-origin cause remain unproven. Three prior isolated reproductions passed; these are historical findings, not additional runs in this implementation.

## Installed capture

- `tests/regional-reload-capture.cjs` composes the existing fixture preparation and capture into **one ordered init script**. The capture runs after fixture preparation, before application initialization, reading only `hybridTerminal.regionalWindows.v1` through both the application's named-property access and `getItem`. Each read records a typed value or named access error. An expected pre-app `S` ReferenceError distinguishes this stage from post-init sampling.
- `reloadPoll` reads the actual `S.sig` and `S.regionalEnabled` operands inside each original reload poll, then returns `sig && regionalEnabled`. It retains typed/serialized actual values, truthiness, poll count, first/last samples and up to16 state transitions. Capture errors do not replace the predicate result. No additional timer or retry.
- `captureReload` scopes pre-reload/post-reload snapshots, restoration status, runtime version, symbol/timeframe and separate feed health, bounded page/network error events, source hash and original error. It saves `desktop-reload.json`, `narrow-390-reload.json` or `narrow-320-reload.json` **before browser teardown**, then rethrows the identical original failure. Even an evidence-write error does not replace that original failure.
- The file URL, fixture values/storage faults, all existing assertions, default30,000ms timeout and subsequent feed/clock/layout checks remain unchanged. No storage clearing, origin migration, app bootstrap modifications or personal journal collection.
- The existing CI `chromium-failure` upload already includes `.qa-results/`, including the capture JSON. Workflow, artifact retention and assertion strength are unchanged. New controlled validation is registered in required browser QA (20 suites).

## Local checks actually performed

1. Focused original `tests/browser-regional-windows.cjs` once at1440/390/320: passed all original assertions, normal reloads, storage fault fixtures, timer/engine isolation and layout/Help checks.
2. `tests/browser-regional-reload-capture.cjs`: normal actual-app restoration passed. One controlled regional named-property read fault produced the expected original30-second TimeoutError. Evidence recorded the read error before app initialization, backing bytes still enabled=true, actual `sig=true` / `regionalEnabled=false`, and session-only restoration. The test verified JSON existed while the page was still open and the thrown error was the same object. This demonstrates capture functionality, **not** reproduction of the intermittent cause.
3. A draft assertion initially compared an unencoded file URL to Chromium's encoded URL. Corrected only that new expected value using `pathToFileURL`; final validation then passed. Original navigation stayed `file://` plus the same source path.
4. `npm run check:source`, JavaScript syntax checks and `git diff --check`: passed. An optional sandboxed `node --test tests/ci-scope.cjs` ended with worker-level failure/no subtest evidence; not a pass and not repeatedly rerun. Exact published CI is authoritative for required checks.

Ignored output: `.qa-results/regional-reload-capture-20261028/regional/` and `validation-final/` (normal/failure JSON, validation receipt, screenshots/traces, network guard). Public networks are mocked. App hash remained unchanged. Existing user settings/journal, frozen datasets/research/baselines and historical manifests were not touched.

## Publication and next action

This package selects **full QA**; do not count the prior application run as its validation. Inspect the exact pushed commit's Checks, with actual post-push receipt at ignored `.qa-results/regional-reload-capture-20261028/ci-verification.json`. No second publication solely to announce CI, and no retry merely to obtain green.

On the next naturally failing regional reload, inspect `chromium-failure` → `browser/browser-regional-windows/*-reload.json` alongside the original trace/log. Separate initialization, raw-key/access/restoration, actual operands and feed health. Sampling can affect timing; file-origin causality remains unresolved. Do not wait for recurrence or claim that installing capture fixes persistence.
