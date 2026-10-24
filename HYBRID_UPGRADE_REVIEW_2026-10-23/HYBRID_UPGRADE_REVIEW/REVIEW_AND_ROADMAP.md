# Hybrid System: upgrade review and implementation order

Review date: 2026-10-23. Application reviewed: **0.4.0**. This is a review packet, not an application release.

## Evidence and scope

The attached HTML matches the reported authoritative 0.4.0 after CRLF-to-LF normalization:

- LF SHA-256: 0593c0096957d295628d267f1f3b16dd90a6478832d61bf39d2e9ed1959bc7d9.
- Raw attachment SHA-256: 996b50a4fecea7b6945fdf1152413c670fc9f29183bbe7149ab09a10dde37089.
- Local authoritative project reported by the user: /mnt/c/Users/shlom/Desktop/THE hybrid-terminal.
- The review changed no application source, preferences, journal or project files.

I inspected the supplied source and screenshot, researched primary documentation, and ran five synthetic probes against extracted application functions. These are mathematical counterexamples, not estimates of their frequency in real markets. They do not replace the six suites, browser checks or public-feed checks reported by local Codex; those original suites were not supplied or rerun here.

The screenshot is MEXC OP/USDT perpetual futures on 1h. The app requests Binance Spot data. Differences in exchange, contract, price, volume and indicator settings prevent a direct parity conclusion. The lower red plot is not identified from appearance alone.

The professional target is a terminal that explains: **what is happening, what qualifies, what invalidates the idea, what execution could cost, and how much evidence supports the claim.** More displayed conditions do not automatically provide independent evidence.

## Reproduced findings

| Finding | Actual 0.4.0 result | Required treatment |
|---|---|---|
| Nominal sizing | Account 1,000, risk 1%, entry 100, stop 99.9 produces about 100 units / 10,000 notional, displayed 10.0x | Identify geometric sizing as a nominal estimate. Add explicit product, affordability, costs and venue constraints before describing a quantity as executable. |
| No losing trades | A one-winner synthetic run returns Profit Factor 99 | Replace the sentinel with a structured no-loss state; a zero denominator does not produce a measured PF of 99. |
| No trades | N=0 still produces an upper win-rate interval near 79.35% | Use unavailable statistics when N=0. The on-screen empty branch hides these values, but the report path formats them. |
| Direction eligibility | Tied scores select SHORT first, despite its missing target; an otherwise eligible LONG is suppressed and the output is WAIT | Display both candidates and their eligibility. Preserve the current decision rule while auditing it; a different tie/selection policy requires a separate rule version and comparison. |
| Degenerate input | 100 flat zero-volume bars yield RSI 100, ATR 0, VWAP unavailable and 90 vector classifications after warm-up | Define invalid/zero-reference states and test them. Do not interpret absent activity as evidence of strong volume. RSI handling needs an explicit reference policy, not an unannounced replacement with 50. |

The aggregate probes inject controlled signal outputs solely to test the actual backtest aggregation. The direction probe supplies controlled indicator state to the actual sigAt function. This is not an end-to-end market replay.

Other source findings:

- The 4/5 score counts conditions; it is not an 80% success probability.
- Recovery percentages use varying follow-up lengths; their median time is conditional on recovery. The existing UI already warns about this limitation.
- Initial 1,000 bars on 5m cover only about 3.47 days, before warm-up and outcome windows. Extra chart history is isolated from the core calculations, so scrolling further back does not extend research coverage.
- The journal records observed confirmed decisions, not executed trades or a complete immutable research dataset.
- The current fee model is an explicitly simplified 0.1% of entry notional per round trip. One deduction is not evidence of a missing second fee.
- The corrected gap-stop model is present. Preserve it and its execution version.
- Cumulative closed-trade R drawdown is not the same as account-equity or mark-to-market drawdown.

## What the trader should see

| Area | Recommended content | Purpose |
|---|---|---|
| Header | Exchange/product, symbol/timeframe, latest confirmed close, freshness, connection state, research/paper mode | Establish which market and timestamp the view describes |
| Chart | Price, selectable EMA/vector layers, labeled nearby day/session levels, frozen plan with invalidation | Read structure without opening several cards |
| Right panel, first card | Context, LONG and SHORT condition counts, missing prerequisites, conflict/WAIT reason, setup age | Explain the decision rather than showing only a verdict |
| Right panel, risk card | Entry/stop/targets, distance in price/%/ATR/R, nominal versus feasible size, cost assumptions | Make the consequences of the plan visible |
| Lower pane | Existing Volume / RSI14 / None; optional MACD later | Keep one synchronized analysis pane by default |
| Research card | Setup definition, sample period/N, net expectancy, interval, tested execution version | Make historical claims inspectable |
| Journal/paper view | Frozen plan, confirmation and execution times, invalidation, actual modeled outcomes | Learn from decisions and execution separately |

Keep English controls/chart/header/inspector and Hebrew analysis panel/Help. Preserve independently selectable candle palette and body fill, including bright PVSRA + Hollow up. Add text, glyphs and line styles where color currently carries meaning alone [S6]. A small visible legend should distinguish direction, volume class and zone state.

Useful chart interactions: pan both directions, adjustable right-side empty space, reliable backfill with loading/error boundaries, fit-to-data and follow-live buttons, clear return to latest, synchronized crosshair and optional price/ATR measurement. Avoid auto-snapping back while the user inspects history. Group layers and prioritize nearby labels so PP, session lines and zones do not obscure candles.

## Quantitative definitions worth adding

### Risk and execution

For a linear instrument measured in base units:

    planned risk budget B = account equity E × selected risk fraction r
    nominal quantity = B / |entry - stop|
    cost-aware quantity = B / (|entry - stop| + estimated fees/unit + adverse execution allowance/unit)

Use a consistent price convention. Do not count spread/slippage twice if already included in modeled fill prices. Gaps and uncertain execution can exceed the planned budget; this is not a guaranteed loss cap.

Feasible size must respect cash or product-specific margin, venue limits, liquidity and total portfolio exposure, then be rounded down to the permitted quantity step. A cash-only Spot LONG needs a cash cap; a Spot SHORT needs an explicitly different borrowing/execution product. Contract multipliers and inverse products require different arithmetic.

Public Binance filters define tick sizes, quantity steps and notional constraints [S1]. Public metadata alone does not establish account-specific permission or a guaranteed fill. Show the assumptions and unavailable fields rather than inventing fees, borrow availability, leverage or liquidation prices.

A useful live diagnostic is:

    spread_bps = 10,000 × (best ask - best bid) / midpoint

Display its timestamp and estimated costs relative to the stop distance. Top-of-book size is not a fill guarantee. Market depth can affect execution impact [S8]; OI is a different measure.

### Expectancy and uncertainty

Use mean realized **net R** across all resolved outcomes. For an illustrative two-outcome model:

    expectancy = p × average net win - (1-p) × average net loss magnitude
    break-even p = loss magnitude / (win + loss magnitude)

Gross +2R/-1R with 0.1R cost per outcome becomes +1.9R/-1.1R. Break-even is approximately 36.67%; at a hypothetical 40% win rate, expectancy is +0.10R. These are examples, not the system's measured performance.

Display N, observation period, costs, timeout handling and an uncertainty interval. For illustration, 55 wins in 100 independent Bernoulli trials have a Wilson 95% interval of about 45.24%–64.39% [S3]. Correlated trading outcomes require dependence-aware analysis; a large count of overlapping bars does not create the same number of independent opportunities.

Track average win/loss, median net R, payoff distribution, consecutive losses, time in trade, turnover, maximum adverse/favorable excursion and drawdown. MAE/MFE are post-entry outcome statistics, never decision-time inputs. Keep closed-trade R drawdown distinct from a future cash/margin equity ledger.

### Vector recovery and probability

Replace a single eventual-recovery rate with a precisely defined research outcome:

    P(target is reached before stop, and within H bars | setup, timeframe, market context)

Differentiate edge touch, 50% recovery and full recovery; define target/stop/horizon when the candidate is created. Use fixed-horizon cohorts with enough future observation, or explicit censoring. Recent unresolved zones are not automatically failures. A bar that touches both barriers is ambiguous without finer chronological data; retain a documented conservative convention or report bounds.

Compare vectors with matched ordinary zones or entries from comparable distance, volatility, session and market regime. Otherwise ordinary price revisitation can be mistaken for a special vector advantage.

Only later add calibrated probabilities. Store out-of-sample forecasts before their outcomes. Assess reliability plots, bin counts, Brier score and comparison with a base-rate forecast; Brier alone is not a pure calibration measure [S4]. A condition count remains a condition count even after a probability model exists.

### Market context

Keep context as an explanation layer first, then test whether it improves outcomes:

- Trend: existing EMA location; optional normalized slope, (EMA_t - EMA_t-k)/(k × ATR), with positive finite ATR and explicit warm-up.
- Trend/range efficiency: |C_t-C_t-n| / sum(|one-bar changes|). A zero denominator is unavailable.
- Volatility: ATR/price and percentile of a clearly defined past-only volatility window.
- Relative volume: retain the present definition for compatibility; test session/time-of-week adjusted volume only with adequate history.
- Daily range: ADR_n = mean of the previous n complete daily high-low ranges; show today's range / ADR. ADR is not ATR and not a promised price boundary.
- Levels: previous day high/low, Daily Open, existing traditional pivots; previous week levels can be added without introducing a new selectable chart timeframe. Developing and completed ranges need distinct states.
- Sessions/Psy: specify timezone, daylight-saving transitions, exact windows and crypto weekend behavior. A convenient local session box must not be labeled exact TR_MAIN Psy parity without source/settings validation.

The current daily VWAP is HLC3 weighted by bar base volume. Label this source definition. An alternative daily quote-volume/base-volume calculation uses different inputs; it is not an interchangeable silent “fix.” The earliest partial day needs a coverage state.

The public Spot kline response also provides quote volume, trade count and taker-buy volume [S2]. An optional aggressor-volume balance, (2 × taker-buy base volume - total base volume)/total base volume, is venue-specific context. It does not reveal participants' intentions or all-market order flow.

RSI14 is already present. MACD may offer a useful view of price momentum, but shares information with existing price/EMA features. Keep it optional and experimental; measure incremental value before adding another score vote.

For a later derivatives context card, show OI, its change and funding with exchange, contract, units and as-of time. OI alone does not identify average leverage or net directional positioning. Binance's historical OI endpoint currently documents only the latest month, a maximum 500 rows per request and possible omitted periods [S7]; do not fabricate a long backtest or fill missing observations with invented values. Funding must be applied according to the actual instrument and holding timestamps.

Portfolio context can show combined planned risk and correlated exposure across BTC/ETH/SOL using aligned returns. Add a sourced macro-event calendar later if useful. Neither belongs in the score without separate evaluation.

## Research and engineering method

Create a research dataset/replay path separately from display backfill. Start with one narrowly defined setup, BTCUSDT 5m and existing closed 1h context; preserve all four current selectable timeframes. This is a research focus, not evidence that other combinations work.

Use chronological development/validation/untouched evaluation periods. Purge or embargo outcomes crossing boundaries. Log every tried variant, including failed ones; testing many configurations increases the risk of selecting noise [S5]. Compare the frozen baseline, cost-sensitive outcomes, regime stability and incremental feature removal. Use block/day resampling when appropriate, not an assumption that every trade is independent. No automatic Kelly sizing or precision-looking success percentages before adequate evidence.

Separate data acquisition, causal indicator calculation, candidate construction, execution modeling, statistics and rendering through small functions within the existing architecture first. Do not introduce a framework/backend merely to reorganize a working HTML file. Profile before adding workers. Keep bounds on history/cache, reconnect backoff, stale-response guards and visible missing-data states.

Persist reproducible feature snapshots and rule/execution/data versions. Keep existing decision journal bytes and IDs; add paper-trade lifecycle records separately. Provide export/restore and storage-full handling. Use browser storage for local application data, not API secrets.

Observe the outstanding live 5m close, actual UTC rollover and reconnect/storage scenarios. Deterministic fixtures and a short live probe answer different questions. Do not claim an unobserved transition passed.

## Bounded implementation order

| Increment | Deliverable | Exit evidence |
|---|---|---|
| Next: proposed 0.4.1 | Honest empty/no-loss statistics, explicit sizing assumptions/affordability, both-side diagnostics, zero-reference validity states, source/mode labels | New edge-case regressions; existing suites; desktop/mobile inspection; preserved default strategy behavior on valid ordinary inputs |
| Context increment | PDH/PDL and level visibility first; precisely sourced sessions/Psy/ADR later; chart label hierarchy and navigation | Complete-data and partial-data fixtures; UTC/DST tests; source/settings parity status |
| Paper/research increment | Separate frozen paper plans and outcomes; longer reproducible history/replay | Causal snapshots, deterministic replay, export/restore and execution-cost cases |
| Quantitative evaluation | Fixed-horizon recovery study, chronological evaluation, confidence and calibration diagnostics | Out-of-sample results with N, coverage, costs and baseline comparisons |
| Optional additions | MACD, OI/funding, aggressor balance, portfolio/event context | Each addition explains a concrete decision and survives incremental evaluation |

Do not build all increments in one Codex run. The included prompt scopes the first increment. Local Codex can implement it with Sol 6.1 High; a later focused mathematical audit is a sensible point to consider Astra High. This is task allocation guidance, not a model performance guarantee.

## Use this packet

Extract into the Hybrid project, away from VECTOR LAB. Read NEXT_CODEX_PROMPT_EN.md and give it to the existing Hybrid Codex thread.

To reproduce the baseline probes, with Node available:

    node audit-040.cjs "/mnt/c/Users/shlom/Desktop/THE hybrid-terminal/hybrid-terminal.html" findings.reproduced.json

The probe intentionally accepts only the exact normalized 0.4.0 baseline. It should refuse a different release rather than claim to validate changed code. findings.actual.json is the observed baseline output. Reference examples are saved separately and are not historical trading results.

## Sources and access limits

These sources inform definitions and design; they do not prove profitability of this implementation.

- [S1 — Binance Spot filters](https://developers.binance.com/en/docs/products/spot/filters): price/quantity/notional constraints.
- [S2 — Binance Spot market data](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market): public kline fields and book ticker.
- [S3 — NIST confidence intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm): Wilson interval.
- [S4 — scikit-learn probability calibration](https://scikit-learn.org/stable/modules/calibration.html): reliability diagnostics and scoring-rule limitations.
- [S5 — Bailey, Borwein, Lopez de Prado and Zhu, The Probability of Backtest Overfitting](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf): selection risk after trying strategies.
- [S6 — W3C Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): additional visual/text distinctions.
- [S7 — Binance USD-M futures market data](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data): OI endpoints and documented availability.
- [S8 — CME, The Importance of Depth](https://www.cmegroup.com/education/courses/introduction-to-equity-index-products/the-importance-of-depth-volume): accompanying written lesson, not a watched video.
- [S9 — Traders Reality, How To Learn The Hybrid](https://bunny-wp-pullzone-t6yljr7iex.b-cdn.net/wp-content/uploads/2025/04/How-To-Learn-The-Hybrid.pdf): vector recovery and context as hypotheses to specify and test.

I read the Hybrid guide text and the CME lesson text. Full TR_MAIN/Pine source/settings parity was not established. Some Traders Reality course pages failed to load; no full videos or complete video transcripts were reviewed. Claims about market-maker intentions or inevitable recovery are not treated as measured facts.

