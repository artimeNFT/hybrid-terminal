# Hybrid Reader prototype — shared status

## Objective and disposition

A standalone factual Binance BTCUSDT USDⓈ-M perpetual trade-candle reader across 4h / 1h / 15m / 5m. Prototype preservation only; no merge, deployment or trading approval.

The existing root `hybrid-terminal.html` remains unchanged. This reader has no trading signals, scores, predictions, recommendations, journal, automated decisions or performance claims.

## Implemented

- Manual refresh only; no backend, chart, polling, WebSocket, external runtime library or persistent storage.
- One Binance server-time-derived UTC cutoff; latest closed candle per timeframe, with inclusive exchange close timestamp and exclusive closing boundary distinguished from server/cutoff/device receipt times.
- Closed OHLC, qualified Climax/Rising/Regular classification, explicit candle direction, source-derived remaining vector-zone bounds and nearest-edge distances above/below.
- EMA5/13/50/200/800 with price position, loaded/consecutive counts and calculation origin. Bounded pagination targets 3,000 consecutive closed candles per timeframe; at most 17 requests per refresh, no automatic retry.
- EMA800 initial-seed weight disclosed as a mathematical weight, not price error. Even 3,000 candles do not establish TradingView parity.
- Daily Open verified from its UTC-opening 5m candle; PP/R1/S1 require all 288 previous-day closed 5m candles.
- Separate provisional sampled rows; provisional values never enter closed-history calculations. Missing, invalid, stale and partial states remain explicit.

## Validation already performed during prototype construction

- 40 focused deterministic assertions passed, including EMA seeds, PVSRA thresholds, source-zone arrays/shrinking/cap ordering, provisional isolation and daily coverage/pivot arithmetic.
- Numerical parity with the terminal's existing pure functions on identical 3,000-bar inputs, including real collected inputs. No claim of equivalence to the terminal's separate Local target zones.
- One public Chromium refresh loaded 3,000 consecutive closed candles for all four timeframes using 17 requests. No page errors; desktop 1440px and narrow 320px layouts checked without horizontal overflow.
- Mocked browser checks covered partial-history failure, missing trusted server time clearing prior values, provisional isolation and manual-only requests. Final narrow-screen EMA labels were checked after a layout correction.
- This preservation step performs byte/hash comparison, HTML/JavaScript parsing and a scoped privacy review only. It does not rerun full terminal QA, research or live observations. Physical-device acceptance is not established.

## TradingView comparison and remaining differences

Owner-reported external observation: one historical 15m candle's OHLC and EMAs matched or closely matched TradingView. The comparison specimen and source-bound numerical receipt are not supplied here; this observation is not independently verified by the preservation task and establishes no general parity.

Vector-zone parity remains **unverified**. The reader uses the terminal's qualified closed-only source-derived projection: body bounds, wick-based updates, previous-bar creation, both arrays and cap-before-cleanup. Closed-only delay, invalid/zero-reference guards, zero-body exclusion and safe cleanup differ from literal intrabar Pine/runtime behavior. The file documents these limitations and exact reused functions. Supplied Pine files are not copied into this reader.

## Pending — separately controlled work

1. Controlled vector-zone validation against identified reference specimens.
2. A two-week usability evaluation; not completed by prototype checks.

Neither item authorizes strategy optimization, trading or a performance claim.

PR #2 remains separate, draft and unmerged. It must not be merged as part of reader work; reader validation does not clear its acceptance blockers.

## File identities

- Reader SHA-256: `0c21a3b9eaa223f20fc0c486bf5e0033f56c1254417b79f434854285dccea14c` (byte-identical preservation of the standalone prototype).
- Existing terminal SHA-256: `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`.
- Branch base: main `bfa8f5ffa9dee5e34c2df4ee0c07f75b89f5ecf1`.

Open `hybrid-reader.html` in a browser and click **Refresh snapshot**. Public endpoint/browser access can fail; unavailable data must not be substituted.
