# Decision economics overview — isolated focused browser verification (2026-11-08)

**Disposition:** Candidate implementation remains **unmerged / NOT QA-cleared**. No production change, new trade rule, study, data collection, PR, CI rerun, or full QA closure. Scope: display only, on `candidate/decision-economics-overview-2026-11-08`, prior candidate commit `c2f21f5f164f6319365f936ff6997f44f26b7f2e` from `main` `bfa8f5ffa9dee5e34c2df4ee0c07f75b89f5ecf1`.

## Source identity and test environment

- The **locally executed HTML** was rebuilt byte-for-byte from a retained user-provided `hybrid-terminal.html` whose SHA-256 is `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`, by applying the exact candidate patch. Its Git blob SHA was independently computed as **`5565c4c53ef3667fbc0c316fe75a8ad3782f7484`**, exactly matching the HTML blob on the candidate branch.
- Chromium via **Python Playwright** in an isolated local test runner; document loaded with `page.set_content` because direct file/HTTP navigation was blocked by the runtime administrator. **Mocked Binance REST responses**, 300 contiguous closed OHLCV candles and a minimal **mock `localStorage` object**. Synthetic programmatic confirmed LONG/SHORT plans were anchored to the last closed candle. No live exchange, account, market-data fetch, real persisted browser storage or user personal data.
- **17/17 targeted Chromium assertions PASS; 0 uncaught JavaScript errors on the final run.** Initial local fixture-only failures were corrected by populating the synthetic candidate diagnostics, reading text from collapsed details via `textContent`, and using exactly representable arithmetic for the zero-net fixture; none required a product code correction.

## Final passed checks

1. Application initializes with 300 mocked closed candles and no uncaught JS error.
2. LONG and SHORT each: ordinary break-even summary exactly matches expanded `binaryresult`, gross/after-cost values and default scenario fee-to-R math.
3. LONG and SHORT each: edited fee and slippage update the existing plan and summary consistently, preserve the fixed 10bps diagnostic separately, and leave `S.sig`, `S.bt` and the journal unchanged.
4. Separate stress-case break-even row appears only for positive gap and matches the expanded stress result; reverting to zero clears it without affecting TP2 payoff.
5. Empty/invalid cost input clears summary numbers and expanded break-even instead of retaining stale values.
6. Negative-net target and exactly zero-net target show the existing impossible-/100%-break-even messages rather than a plausible success probability.
7. WAIT, no plan, misanchored entry, and Spot → USDⓈ-M product switch do not expose a substitute or stale confirmed economic summary.
8. New IDs remain unique, caveats distinguish technical eligibility from trade edge, and the new summary fits Chromium layouts at **320, 390 and 1440 CSS px**, with no new viewport clipping in the inspected summary elements.

## Independent baseline parity

One separate local **Chromium source-versus-candidate comparison** loaded the *same* 300 mocked candles into the exact retained root HTML and candidate HTML. All compared data matched: `S.sig`, `S.bt`, `S.st`, ATR, RSI, EMA arrays, vector zones, M/W, stopping-volume events, closed index, rule version, journal IDs/signatures and `toString()` of `sigAt`, `backtest`, `planningCostScenario`, `binaryBreakEvenRequirement`, `recordDecision`, `notify`, and `plannedRiskDisplay`. The no-plan view was unavailable as required. **No differences were observed in this mocked case.** This is not a proof of equivalence across all market conditions.

## Explicit limitations and next gate

- The four **committed Node harness tests** in `tests/decision-economics-overview.cjs` were **subsequently executed on Node v22.16.0: 4/4 PASS** in an isolated, source-verified local harness. **Node 24 and the repository's complete npm/CI pipeline were not executed**; the separate 17 passing Chromium assertions were run earlier via Python Playwright, not via `npm run test:browser`. See the chronological follow-up below.
- No mock-websocket candle-close lifecycle, persistent-storage reload, real Binance traffic, fee-model calibration, comprehensive accessibility testing, mobile device hardware testing, or full QA was run. **The existing `STATUS.md` regional retention/reload blocker remains open**, and its STOP/no-blind-retry instruction stands.
- No PR was created because the GitHub CI workflow triggers full QA on PR to `main`. When Work returns, inspect this candidate and report before starting another version. Any merge, full QA or release requires separate approval and must not be inferred from this PASS.

## Node focused follow-up — executed after the initial Chromium report (2026-11-08)

**Outcome: 4/4 original committed Node tests PASS, plus 5/5 independent supplementary local tests PASS.** Node `v22.16.0` and built-in `node --test` were used; the project declares `>=24 <25`, so this is **focused behavioral evidence, not Node 24/CI acceptance**. Execution ran *only* the candidate tests and supplementary local tests; no full QA, retry of the known regional reload blocker, network acquisition or benchmark.

### Exact source identities

- Executed application `hybrid-terminal.html`: Git blob SHA `5565c4c53ef3667fbc0c316fe75a8ad3782f7484`, identical to candidate branch. It was recreated from the user's original root HTML, whose SHA-256 `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57` and Git blob `d01bcf6cf237d28800f1f14186fbe8100ab90327` matched `main`, with the exact candidate patch.
- **Unmodified original test** `tests/decision-economics-overview.cjs`: Git blob `9f5587752e2a76a2bc166d691f6116e6e1a3f073` (same as branch).
- **Exact repository dependency files** `tests/app-harness.cjs` Git blob `b2ffc2a8e679e5ec0b8a3b551ceed23a236e4aa8`, `tests/target-path-fixtures.cjs` Git blob `387b9e9cc0d11f96fc3bd5253aec869f06391c80`, same as branch.
- The harness imports `replacementFixture` from `tests/regression.cjs`, but these focused cases **always supply `bars()` explicitly**; a local placeholder satisfied that unused import. The full `regression.cjs` file and other repository suites were **not** run. The extra five test cases were local only and were **not** committed to the candidate branch.

### Tests and outcomes

- **4/4 exact committed tests pass:** LONG/SHORT gross/net and break-even parity with expanded details; edited fees/slippage with fixed 10bps baseline kept separate; gap-stressed required-hit-rate visibility; WAIT/invalid inputs clear stale results; repeated render leaves signal, backtest, journal and request count unchanged.
- **5/5 additional local tests pass:** negative net TP2 displays the existing impossibility text rather than a positive probability; exactly zero net TP2 displays the required 100% outcome; invalid cost/WAIT clears a previously visible stressed row; root-vs-candidate parity checks closed-candle indicators, signal, backtest, selection and journal with `observedAt` normalized; and product change clears old plan while the new USDⓈ-M feed is intentionally held pending.
- Two initial **supplementary-test** failures came from incorrect expectations, **not from a product change**: raw journal text includes time-varying `observedAt` between two runs, and an unblocked mocked product switch completed instantaneously so a new confirmed plan was valid. The verification was corrected to compare the same stable journal fields and to hold the new feed pending while verifying no stale plan. After these causal corrections: **9/9 combined PASS**.
- The target was a Node VM harness with mocked 500-bar fixture, REST calls, storage and sockets, not an actual browser or live exchange. Previous **17/17** Chromium browser checks remain separate evidence in the earlier section. No evidence of an engine regression appeared in either set; no production/app code correction was necessary.

**Disposition:** candidate remains isolated, unmerged and **NOT QA-cleared**. The original `main/STATUS.md` QA blockers, unmerged PR1 and incomplete Perp support v2 are unchanged. Next permissioned engineering gate is Node 24 source-selected focused tests and an appropriate review of the persistent full-QA blocker, **not an automatic full QA rerun or merge**. Work should read this updated report rather than repeat the tests as though no evidence existed.
