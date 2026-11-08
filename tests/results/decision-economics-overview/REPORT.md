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

- The four **committed Node harness tests** in `tests/decision-economics-overview.cjs` have **not** been executed; the project Node 24 test harness/dependencies were not available in this local environment. The 17 passing checks were separately executed via Python Playwright and are not the existing `npm run test:browser` suite.
- No mock-websocket candle-close lifecycle, persistent-storage reload, real Binance traffic, fee-model calibration, comprehensive accessibility testing, mobile device hardware testing, or full QA was run. **The existing `STATUS.md` regional retention/reload blocker remains open**, and its STOP/no-blind-retry instruction stands.
- No PR was created because the GitHub CI workflow triggers full QA on PR to `main`. When Work returns, inspect this candidate and report before starting another version. Any merge, full QA or release requires separate approval and must not be inferred from this PASS.
