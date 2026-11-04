# Dependency-scoped causal execution contract — sealed before market data

V2 changes execution only. `protocol.json.scientificDesign` is copied exactly from v1; v1 protocol canonical hash is342c943591abe998d991fe4707969f96859a1daa7e2d9e803e9c3085eceb5df5. The unchanged v1 design module still generates every feature/first episode/tail, bin/cell/weight, diagnostic and gate. No new eligibility, seed, warm-up, bin or outcome rule is authorized.

| Consumed quantity | Exact dependency and causal boundary |
| --- | --- |
|Original OHLC, time, closed state|Immutable validated input; snapshot i exposes only i and its last301 bars.|
|numericBar/reference validity|Unchanged archived0.4.3 function text. Reference uses source j and j−10..j−1, with exact warm-up/invalid/zero/overflow states and arithmetic.|
|Local up/classification|Verbatim analyze forEach block: C≥O including doji; nullable volume×range; mutually exclusive cls2 before cls1; no extra threshold or zero substitution.|
|ATR current/prior288|Verbatim analyze ATR initialization and forEach block. a starts0 at fixed July1 origin; same true-range operations, i<14 average seed, then (a×13+TR)/14; nullable output does not reseed invalid internal a.|
|validDecision|Same closed/numericBar/positive-current-ATR conjunction as ORIGINAL v1 frame. No RSI/day/score gate is introduced.|
|Feature/episode/cohort/statistics|Directly reuse unchanged v1 design.cjs and its frozen qualification helpers. No new science implementation.|
|Source census|Only through the last queried index, exactly matching the v1 oracle; full census only after final decision.|

The restricted path computes these consumed causal series once in index order, from the original first bar. For each j, qualification/classification reads no index above j. Inductively ATR a_j depends only on a_(j−1), current H/L and prior C, starting from the identical original a_0 expression; operation order is copied verbatim, not algebraically reassociated. Class metadata does not mutate OHLCV. Therefore processing later indices cannot alter stored values at earlier j. Query i returns copied slices, never future fields. No rolling reseed, serialized restart state or changed origin exists.

EMA, RSI, VWAP/day context, M/W, stopping volume, vector recovery, sigAt/backtest and bootstrap are neither extracted nor evaluated. The source file itself remains untouched. This is not a general calculation engine or app refactor.

Before any full market preparation, strict assert.deepStrictEqual must pass for EVERY consumed frame field, frameRows feature (including unavailable/invalid numeric states), and census on synthetic cases and the same seven retained indices [3999,9236,14473,19711,24948,30186,35423]. No tolerance, rounded comparison, null coercion or assertion relaxation. Evidence hashes explicitly encode exceptional numeric values only after strict comparison. Complete small synthetic episode IDs/tails and matching outputs receive independent hand-specified checks. Any parity failure closes v2 before market cohort generation.

Fresh grant: one attempt,1200 monotonic seconds including input checks, ORIGINAL oracle calls, restricted construction/parity/benchmark, admission, preparation and output;1GiB RSS ceiling, no v1 time carry-over or resume. Initialization is charged once before admission. Benchmark restricted query+unchanged frameRows, then use the same conservative2×max×31425 +60s reserve against remaining time (minus2s cleanup). All original scientific gates remain binding. No outcomes, data acquisition, fitting or bootstrap may follow automatically.
