# Hybrid Terminal: notes, logic spec and roadmap
(סיכום מלא של מה נבנה, איך זה עובד ומה מתוכנן. כתוב באנגלית כדי שאפשר יהיה לשלוח למודל אחר לביקורת.)

**What it is:** a single-file HTML terminal (`hybrid-terminal.html`, vanilla JS + canvas, no dependencies). Live Binance spot data (REST klines + WebSocket) for BTC/ETH/SOL on 5m/15m/1h/4h. It re-implements the public logic of the Traders Reality "Hybrid System" (PVSRA vector candles, vector zones, EMAs) and adds a rule-based signal, a backtest and decision tools. It must be opened locally (the chat sandbox blocks network calls).

## Source verification
- PVSRA thresholds verified against the official open-source library `Traders_Reality_Lib` (TradingView): Climax = volume >= 200% of the average of the previous 10 candles OR volume x spread >= the highest of the previous 10; "rising volume" = >= 150% of that average. Bull climax green, bear climax red, bull rising blue, bear rising violet.
- Strategy rules (M/W, stopping volume, 50% vector) come from the official PDF "Learning The Hybrid System". The source does not publish exact entry/exit code, so those parts here are **my approximations**.
- Differences from the original: volume is Binance spot only; "psychological levels" in TR are session-based (Sydney session high/low), mine are round numbers (labelled as such); no ADR/AWR/session boxes yet.

## Logic implemented
1. **PVSRA candle classes** (cls 2 = climax vector, 1 = rising volume, 0 = normal).
2. **Vector zones:** every climax candle creates a zone [low, high] with a 50% line. Recovery status: 1 = touched, 2 = 50% reached, 3 = fully recovered. A zone is drawn until fully recovered; for signals it counts as "open" until the 50% level is reached. First-recovery indexes are stored so the backtest uses only information available at each bar.
3. **Averages:** EMA 13/50/200/800, VWAP (daily reset, UTC), daily open (UTC). ATR14 and RSI14 (Wilder).
4. **Swings:** pivots with 3 bars each side. **M/W:** two swing highs/lows within 0.8 ATR of each other with an opposite swing at least 1.2 ATR away. Approximation, confirmed only 3 bars after the pivot.
5. **Stopping volume candle:** candle with cls >= 1, a new 20-bar extreme, and a wick >= 50% of the candle range.
6. **Signal (score 0-5, direction with the higher score):**
   - extension from EMA50 >= 2 ATR (above for short, below for long)
   - open opposite-colour vector (green below price for short, red above for long) within 6 ATR
   - stopping volume candle in the last 6 bars
   - M (short) or W (long) formed in the last 15 bars
   - RSI > 65 (short) or < 35 (long)
   Signal exists when score >= threshold (selectable 3/4/5) AND a target vector exists.
7. **Plan:** entry = last close; stop = max(20-bar extreme +/- 0.3 ATR, 1 ATR from entry); TP1 = touch of the vector edge; TP2 = vector 50%; R:R to TP2.
8. **Backtest (on the ~1000 loaded candles):** same signal function evaluated per bar, entry at next open, stop checked before target within the same bar (conservative), max 120 bars, round-trip fee 0.1%, no overlapping trades. Output: trades, win rate with Wilson 95% interval, average net R, profit factor, max drawdown in R, TP1 touch rate, equity curve, long/short split.
9. **Context and tools:** higher-timeframe trend (EMA13/50 on 1h for 5m, 4h for 15m/1h, 1d for 4h; informational only), position sizing (account x risk% / stop distance), vector recovery statistics (touch/50%/full rates and median bars to 50%), alerts (beep + browser notification on a new signal), copy-report button.

## UI
TradingView-style price axis with nice ticks, crosshair with price label, last-price tag with candle countdown, time axis, hover info (candle class and volume as % of the 10-bar average), layer toggles, zoom (wheel) and pan (drag), "?" help modal in Hebrew, RTL side panel.

## Validation done
Syntax check and a smoke test on synthetic data (all functions run; on pure-noise data win rate lands around 20-30% with negative net R after fees, as expected; on strongly trending synthetic data the counter-trend rules lose, which is expected). **Not yet validated on real Binance history.** The stop was originally too tight (median 0.7 ATR) and was widened to a 1 ATR minimum after the first test.

## Known weaknesses (please review)
- Only ~1000 candles of history, so few trades; the 95% interval is wide.
- Signals are counter-trend by design (fade extension toward an open vector). The HTF trend is shown but not used as a filter.
- No look-ahead in the signal, but the backtest and live code share parameters chosen by judgment, not optimised or out-of-sample tested.
- M/W and stopping-volume detection are rough heuristics.
- Binance spot volume differs from the volume source of the official indicator.

## Roadmap (suggested order)
1. Longer history (paginate klines back several thousand candles) and a walk-forward split (fit on the first part, report the second).
2. Use the HTF trend as an optional filter and compare results with and without it.
3. Parameter sensitivity table (extension threshold, RSI levels, max target distance, stop multiple).
4. ADR/AWR levels, session boxes (Asia/London/NY) and Sydney-based psychological levels as in TR_MAIN.
5. Per-vector tooltip (age, recovery %, time to 50% historically) and a "trade only the nearest vector" mode.
6. Trade journal export (CSV) and a live paper-trading log.
7. Optional second data source for volume (futures/aggregated) to be closer to the original PVSRA.

Not financial advice. The tool is a decision framework; test before relying on any signal.
