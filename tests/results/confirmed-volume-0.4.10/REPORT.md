# Confirmed Volume summary — 0.4.10

Start: clean published main `5cfa6210250c1bb757f22080ec08a3b96117f069`. Worktree `/tmp/hybrid-confirmed-volume-0.4.10`, branch `work/confirmed-volume-0.4.10`. Exact pre-edit 0.4.9 preserved internally as `baseline/hybrid-terminal.0.4.9.html` / `3d8cc67d458d24f8bc20870aa24078ad32749b8c95fc500c6f311bdfe0fd6139`. Delivered HTML SHA-256 **`5dded54c4a79ab7f38c13a793e359969b2b507497d6a062ea241e882ca540fd2`**.

## Scope and inventory

`volumeReference` already computes current volume / mean of prior ten candles, excluding current. `analyze` already produces Normal / Rising volume / Vector, with a volume×range alternative; inspector already shows percentage of prior-ten mean. Those functions, thresholds and inspector are unchanged. New heading uses the existing reference on S.k / S.closedIndex and existing c.cls. It displays confirmed candle UTC close, × vs prior 10 candles, existing class and own open/close direction with arrows/equality text. Full ISO open/close and unrounded ratio are in the Canvas accessible description. No buy/sell-flow measurement, probability, new indicator or score.

Default anchor is independent of hover, historical panning, chart-only backfill and provisional ticks. Only confirmation advances it; existing stale configuration guards remain exact. Warm-up, zero denominator, invalid data/arithmetic produce unavailable; zero volume against a positive mean is 0×. Normal (default) discloses existing fallback when reference is unavailable. Tests include a <1× Vector from volume×range and a prior-close counterexample for own direction.

Header packs one row wide, up to three rows at 320–430px. Narrow bars reserve text space; tested 64px pane still has >=20px bar area, with no change to pane height, zero, price/time coordinates or linear scale/Auto/reset controls. Wide legacy bar height remains when heading fits. Clipped count appears on axis; caps remain. Visible developing bars are faded, dashed and labelled Partial with a contrasting backing: raw incomplete volume, not completed comparable activity, with no completed-candle ratio/extrapolation. RSI/None hide summary. No new preference or persistence write. Equivalent Hebrew/English Help updated.

## Checks actually performed

Final `npm test` passed: nine app suites, 18 CLI / nine audit / nine contract / 13 preparation fixtures in frozen source context, seven presentation suites (5+6+7+7+6+8+5 cases). All twelve local mocked Chromium suites passed at source 6ab27… before the final isolated Partial-label background refinement. Fresh full npm and focused actual-browser checks passed on final source; `validation-source-identities.json` records this distinction. Exact published CI must verify every required group on final source; no claim that the earlier full browser source is identical.

Actual rendered glyph pixels and controls at 1440/430/390/320 verify summary rows/clearance/no overflow, hover inspector, real History +1,000, provisional stream isolation, confirmation advance, visible Partial-label pixels, manual ceiling/zero and restore, RSI/None transitions, warm-up/zero-reference and actual stale ETH→SOL / 15m transition. Page/console errors zero, unexpected external requests zero. Final screenshots:16, traces:7. Six source-bound desktop/narrow/partial/clipped/Help images were actually inspected. Synthetic feed; no physical/user/live acceptance.

An initial stale UI report-version expectation was updated to 0.4.10; a floating subtraction uses 1e-9 geometry tolerance. The old narrow bar-height assertion now checks unchanged linear scaling against the header-reserved bar area, while wide bar-area parity, all price/time/pane coordinates and zero remain asserted. A final screenshot revealed Partial text merging into clipped bars; a small dark text backing fixed contrast, followed by fresh final checks. No strategy arithmetic changed for tests.

## Preservation and delivery

116 of 118 prior functions remain byte-identical; only draw and presentation volumeRange change. Actual volumeReference/analyze, rules/execution/RSI, feed/calculation/decision/targets/sizing/backtest/journal remain exact. Existing stored record/preference bytes and new-summary no-write behavior are tested. All **448** protected tracked files, six frozen dataset/checkpoint hashes, original midnight inputs/observer/wrapper, prior manifests/seals/evidence, historical STATUS archive and latest session design match. No data acquisition, cohort, midnight or hour-soak repeat; CLI 1.0.1/schema1 and frozen 0.4.3 binding remain unchanged.

Single STATUS board holds current scope and queued sessions. Publish the locally checked successor by safe main fast-forward, no force. Verify actual source-commit Actions, retain receipt, then verify exact final handoff CI through ignored root `.qa-results/confirmed-volume-0.4.10/ci-verification.json` to avoid self-reference. Stop after this increment; no automatic next feature.

Limitations: measured synthetic desktop/narrow rendering is not physical touch, screen-reader/human bilingual review or user readability. 0.4.4 hour-soak and observed 0.4.7 midnight acceptance remain source-bound and do not validate 0.4.10 live behavior. At narrow minimum height the summary uses part of the Volume region; existing resize control restores more bar space. No new market-performance or volume-flow inference.
