# Hybrid Spot frozen research dataset — schema 1

Tool: `research/klines.cjs`, **1.0.0**, Node.js >=22, built-ins only. The application remains **0.4.3**. This tool neither loads nor changes the terminal, journal, indicators or research-snapshot export.

## Source contract

Checked against current official Binance Spot documentation on **2026-10-24**:

- [Kline REST contract](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market#klinecandlestick-data): `/api/v3/klines`, 12 fields, UTC default, limit up to 1,000, request weight 2.
- [Server clock](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/general#check-server-time): `/api/v3/time`.
- [General REST behavior and limits](https://developers.binance.com/en/docs/products/spot/rest-api): chronological bounded queries, millisecond defaults, HTTP 429/418 and Retry-After.
- [Market-data-only host](https://developers.binance.com/en/docs/products/spot/faqs/market_data_only): public Spot REST at `https://data-api.binance.vision` (default). Explicit `--base-url https://api.binance.com` is also supported. No automatic host switching, authentication or API secrets.

Every query explicitly sends `timeZone=0`, `startTime`, inclusive `endTime = pageEndExclusive - 1`, `limit=1000`, and `X-MBX-TIME-UNIT: MILLISECOND`. Inputs are BTCUSDT/ETHUSDT/SOLUSDT and 5m/15m/1h/4h, matching the terminal. Date strings require `YYYY-MM-DDTHH:mm:ss[.sss]Z`, real calendar dates and interval alignment. Ranges are start-inclusive/end-exclusive, within 2017–2100, at most 1,000,000 nominal candles per run.

## Candle tuple (zero-based indices)

All **12 fields** are retained in their returned order; none are synthesized.

| Index | Field | Stored type / unit |
| --- | --- | --- |
| 0 | Open time | Safe integer, Unix milliseconds |
| 1 | Open | Original decimal string, quote units per base unit |
| 2 | High | Original decimal string, quote units per base unit |
| 3 | Low | Original decimal string, quote units per base unit |
| 4 | Close | Original decimal string, quote units per base unit |
| 5 | Total base volume | Original decimal string, base units |
| 6 | Close time | Safe integer, Unix milliseconds, exactly open + interval − 1 |
| 7 | Total quote volume | Original decimal string, quote units |
| 8 | Number of trades | Nonnegative safe integer, trades |
| 9 | Taker-buy base volume | Original decimal string, base units |
| 10 | Taker-buy quote volume | Original decimal string, quote units |
| 11 | Unused field | Original nonnegative decimal string, semantically unspecified |

Normalization **`decimal-text-v1`** requires nonnegative plain decimal text matching `(0|[1-9][0-9]*)(\.[0-9]+)?`, maximum 128 characters. Whitespace, signs, exponent notation, missing fields, NaN/Infinity and numeric substitutes for decimal strings are rejected. Trailing zeros and every fractional digit are preserved, including in field 11. Decimal strings never pass through binary floating point. Numeric timestamp/count fields must be safe integers and serialize using JSON integer notation. A decimal spelling change such as `101.00` → `101.0` deliberately changes the data hash, even if its mathematical value is equal.

Prices must be positive; low ≤ min(open, close) ≤ max(open, close) ≤ high. All volumes must be nonnegative. **Exact, zero-tolerance decimal comparisons** use BigInt coefficients aligned to a common scale. Taker-buy base ≤ total base and taker-buy quote ≤ total quote: there is no epsilon or silent clamping. If the source violates this conservative policy, acquisition blocks and retains the rejected raw page for investigation; it does not silently round or relax the rule.

## Canonical payload and hash

The frozen envelope has exactly `kind`, `toolVersion`, `payload`, `dataHash`, `quality`, `acquisition`. Kind is `hybrid-frozen-spot-dataset`. Payload key order for hashing is:

```json
{
  "schemaVersion": 1,
  "source": {
    "venue": "BINANCE",
    "market": "SPOT",
    "endpoint": "/api/v3/klines",
    "timeZone": "UTC",
    "timestampUnit": "ms",
    "normalization": "decimal-text-v1"
  },
  "symbol": "BTCUSDT",
  "timeframe": "5m",
  "range": {"startInclusive": 1782864000000, "endExclusive": 1790812800000},
  "candles": []
}
```

`dataHash = SHA256(UTF8(JSON.stringify(canonicalPayload)))`, lowercase hex, **no whitespace or final newline**. The example has an empty placeholder candle list; real exports contain all acquired closed tuples in order. The validator reconstructs the fixed object key order, so JSON indentation or payload key reordering does not change the data identity. Schema/source extras are rejected. Array order and the original decimal strings are significant. Requested range is part of the hash, including an unfilled/developing tail; the observation clock is not.

Fetch timestamps, selected host, HTTP/request/weight/retry logs, original server cutoff, resumes, tool version and computed quality are outside this hash. The whole exported file has a different byte checksum in `RESEARCH_DATA_SHA256SUMS.txt`. A data hash detects accidental edits and supports comparison; it is not a signature authenticating a server or publisher. Volatile acquisition metadata is not authenticated by the data hash. Offline verification recomputes schema, hash, closed-row validation and quality, and checks the saved quality against that result.

## Coverage and quality

Acquisition captures HTTPS server time **before** the first kline query. Its immutable cutoff survives resumption. Eligible candle opens are before `floor(serverTime / interval) * interval`; every saved close must be strictly earlier than the cutoff. Thus a boundary exactly at midnight admits the just-completed interval, while a one-millisecond earlier cutoff excludes it. A resumed run never quietly extends its cutoff. Future/developing portions of a requested range remain explicit missing coverage.

Quality is computed against the **entire requested grid**, independently of HTTP success or page count:

- `complete`: every requested candle exists exactly once, with valid data and no gaps.
- `incomplete`: valid available rows, but one or more missing intervals, including a developing/future tail; can contain zero rows.
- `invalid`: row/schema/chronology/bounds/closedness errors or duplicate timestamps. The offline report retains duplicate indices, conflict status and all original tuples.

Reports contain actual/unique/valid row counts, expected and eligible counts, explicit missing intervals `[startInclusive,endExclusive)`, duplicate/conflict counts, first/last open and coverage end-exclusive. No filling, deduplication, sorting of received tuples or conflicting-row replacement occurs. An invalid response page is retained in `rejectedPages` in the blocked checkpoint and is never promoted to a frozen dataset. Valid incomplete datasets are saved and return exit 2. Diagnostic row issues are capped at 1,000 details with a full issue count; raw rows are retained.

## Bounded acquisition, cancellation and resumption

Requests are sequential, at most 1,000 candle intervals per query window. A short page continues at its last open + interval; an empty page advances to that window's end and leaves an explicit gap. A backward/out-of-window, duplicate/conflicting or unordered page blocks with its raw rows retained. Cursor advance must be a valid integer and strictly positive. A total page budget is bounded by nominal eligible candles plus one, and input size is capped.

Each request, including its body, has a 15-second timeout. Network/timeouts, 429 and 5xx allow at most **three retries** (four attempts), exponential backoff 1/2/4/8 seconds, and at least any Retry-After seconds/date delay. Other 4xx fail without retry. A required wait over 60 seconds stops with the persisted not-before time instead of truncating the server wait. **418 stops immediately**, with no automatic retry; a missing ban duration conservatively sets a 24-hour resume cooldown. Explicit resume still enforces any persisted cooldown before making another request.

Successful requests are paced at least one second apart. The tool records `X-MBX-USED-WEIGHT-1M`; at ≥1,000 it conservatively defers until the next UTC minute plus one second, possibly stopping if that exceeds the bounded wait. This is a conservative local policy, not a claim to control traffic from other clients sharing an IP. 429/418 remain authoritative.

`OUT.checkpoint.json` has kind `hybrid-acquisition-checkpoint`, a checksum over its own state, original configuration/cutoff, committed rows/cursor, request history and explicit in-progress/blocked/cancelled/frozen-written status. **It is never a frozen dataset**, even after an output was written. Every accepted page is committed via same-directory temporary write, fsync and atomic rename. Cancellation interrupts in-flight fetch/backoff, saves state and releases the lock; an uncommitted page is refetched on resume. Resume requires exactly the same symbol/timeframe/range/base URL/page size, verifies checkpoint integrity and refuses rejected source pages. Preserve such evidence and use a new output for source-data investigation.

The default checkpoint is adjacent to output. `--resume` does not fetch an expanded time window or erase an existing frozen output. A `.lock` prevents concurrent writers. After a hard kill, check that its recorded PID/process is no longer running before manually removing only that stale `.lock`; retain the checkpoint. Same-directory hard-link publication creates the frozen output atomically and exclusively; a filesystem without that facility must fail rather than overwrite. Full checkpoint rewrites and in-memory validation target bounded research acquisitions, not archive-scale ingestion.

Exit codes: **0** complete/identical, **2** valid incomplete/different, **1** invalid/error, **130** cancelled. Comparison requires the same canonical source/symbol/timeframe/range, reports added/removed/changed open timestamps and both hashes, and refuses invalid datasets. A changed upstream response is reported; hashes are never forced to match. Repeating a small fixed range cannot rule out revisions elsewhere or later.
