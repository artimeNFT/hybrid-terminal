# Hybrid System — frozen research-data foundation

Date: 2026-10-24, Asia/Jerusalem.
**Application remains 0.4.3**, authoritative `hybrid-terminal.html`, byte-for-byte unchanged:
`fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.
**Independent CLI tool 1.0.0 / dataset schema 1:** `research/klines.cjs`.
Final tool SHA-256: `7200e575ba74206dc70a82cdfb7159e9d9596fc5d01e8b0c75215ce30d30d1c5`.

## Scope and preservation

Read the attached data-foundation request, applicable instruction paths, current README/STATUS and project conventions. Workspace `/mnt/c/users/shlom/desktop/the hybrid-terminal`; no applicable AGENTS.md or active Git repository. Starting HTML matched reviewed 0.4.3; preserved the previous STATUS at `baseline/STATUS.before-research-data-v1.md`. No app edits, version bump, subagents, other-project work, dependencies or new UI. Old sources, releases, archives, baselines, notes, diffs and evidence remain.

The CLI is independent of terminal imports/state and uses only Node built-ins (Node >=22; actual tests: v24.15.0). It does not access the user's browser journal. The strategy/selection/thresholds/plans, rule `hybrid-v2-validity-closed`, execution `ohlc-market-stop-v2-gap-open`, fee assumptions, indicators, navigation, day context, preferences and existing research-snapshot export are untouched. No strategy evaluation, episodes, controls, archive ingestion, paper trading or profitability analysis was added.

## Implemented tool

- Explicit supported symbol/timeframe and interval-aligned UTC [start,end) boundaries, public Binance Spot REST, trusted initial server cutoff and complete-candle exclusion. Sequential <=1,000-row windows, strict progress, bounded page/row budgets and 15-second request/body timeout.
- All 12 fields retained; original decimal strings never pass through binary floating point. Exact BigInt OHLC/volume/taker-buy comparisons, safe integer times/counts, chronology/bounds/close checks, explicit gaps/duplicates/conflicts and complete/incomplete/invalid quality. Invalid source pages block with raw evidence retained; missing rows are never synthesized.
- Conservative pacing and used-weight logging, three retries maximum, Retry-After/exponential backoff, persisted cooldown and immediate HTTP 418 stop. Cancellation and checksummed atomic page checkpoints; exact-configuration resume and concurrent-writer locks. Checkpoints are explicitly not datasets. Frozen output publication is atomic/exclusive and never silently overwrites an existing file.
- Canonical SHA-256 covers schema/source/symbol/timeframe/requested range/ordered tuples only. Request timestamps, logs, retries and other volatile metadata are separate. Offline `validate` reconstructs schema/hash/quality; `compare` reports changed/added/removed timestamps without forcing hashes to agree.

Exact schema, units, normalization, hash bytes, validation/rate policy, resource/lock limits and official documentation links: `research/SCHEMA.md`. Official Binance contract checked 2026-10-24; receipt `tests/results/research-data-v1/official-docs.json`.

## Actual public-data acceptance

Frozen dataset: **`research/datasets/btcusdt-5m-2026-q3.json`**.

| Item | Observed result |
| --- | --- |
| Source | Public HTTPS `data-api.binance.vision`, Binance Spot `/api/v3/klines` |
| Requested / actual coverage | **[2026-07-01T00:00:00Z, 2026-10-01T00:00:00Z)** |
| Last candle open / close | 2026-09-30T23:55:00Z / 23:59:59.999Z |
| Quality | **complete**, issue count 0 |
| Expected / actual / unique rows | **26,496 / 26,496 / 26,496** |
| Gaps / duplicates / conflicts | **0 / 0 / 0** |
| Acquisition cutoff | Trusted server time **2026-10-24T05:43:01.498Z** |
| Acquisition run | 2026-10-24T05:42:56.430Z–05:43:41.287Z UTC |
| Requests | 27 kline pages + 1 server-time request; all HTTP 200, no retries |
| Canonical data SHA-256 | `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1` |

Two separate fixed-range acquisitions for [2026-07-01T00:00:00Z, 2026-07-02T00:00:00Z) each contain **288 complete rows**: `research/datasets/btcusdt-5m-2026-07-01-repeat-a.json` and `...-repeat-b.json`. Despite different acquisition metadata, both data hashes equal `2912a020aaff86d529f1cc5af148478c48bf99c617c84a9db89b93abb166e34c`; comparison reports no added/removed/changed rows. Both match that day's Q3 subset. A full second Q3 download was unnecessary.

Acquisition-time tool source is archived in `tests/results/research-data-v1/acquisition-tool.cjs` (hash `9f3348962cbe9ba77223eb127ba201fb3484bcec774116ea5fc332a8f22bbdec`). After those runs, ordinary immediate-resume pacing was refined to wait rather than reject; long server cooldowns still stop. Final tool offline validation and resumption regressions pass; canonical schema/normalization did not change. Datasets were not rewritten.

## Checks actually performed

- **12 deterministic Node tests passed**, including 1,000-row pagination, short/empty pages, invalid/backward/duplicate/conflicting pages, missing/developing rows and exact UTC boundaries, decimal precision, bounded timeout/429/5xx/418 behavior, cancellation and immediate resumption with fixed cutoff, configuration/checkpoint tamper rejection, concurrent locks and no overwrite, stable hashes across metadata changes, changed-candle hashes, offline data/quality tampering and actual CLI exit codes for incomplete/invalid/different data.
- Actual public acceptance download and two separate small downloads passed. Final Node offline validation passed for all three frozen datasets; real CLI comparison found identical small datasets.
- **Independent Python stdlib oracle** recomputed all three canonical hashes and validated every 12-field row with Decimal comparisons, exact timestamps and the full expected grids. No acquisition-tool helper was imported. Evidence: `independent-verification.json` and `subset-comparison.json`.
- Existing **ui-smoke** and **navigation** Node suites passed; unchanged application hash verified. No full browser rerun was needed for this independent CLI. Prior browser/live results remain historical.
- The restricted sandbox prevented child-process test execution and public DNS access; the actual CLI tests/acquisitions ran outside it with isolated test files and explicit public read-only requests. `deterministic.initial.txt` retains the initial sandbox runner failure; the final `deterministic.txt` records all 12 passing tests.

Logs/manifests: `tests/results/research-data-v1/`. Whole-file/tool/schema/test checksums: `RESEARCH_DATA_SHA256SUMS.txt` (distinct from canonical data hashes). Application/baseline checksums remain in `SHA256SUMS.txt`. No acquisition/test process remains running.

## Exact reproduction

From the project root, use a fresh output filename; an existing frozen dataset is refused:

```sh
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json

# Same configuration/output after interruption; respects persisted server cooldown.
node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3-new.json --resume

node research/klines.cjs validate --file research/datasets/btcusdt-5m-2026-q3.json
node research/klines.cjs compare --first research/datasets/btcusdt-5m-2026-07-01-repeat-a.json --second research/datasets/btcusdt-5m-2026-07-01-repeat-b.json
node --test tests/research-data.cjs
python3 tests/verify-research-data.py research/datasets/btcusdt-5m-2026-q3.json research/datasets/btcusdt-5m-2026-07-01-repeat-a.json research/datasets/btcusdt-5m-2026-07-01-repeat-b.json
sha256sum -c RESEARCH_DATA_SHA256SUMS.txt
```

Use end `2026-07-02T00:00:00Z` and a fresh name to reproduce the one-day acquisition. Optional explicit `--base-url https://api.binance.com` must remain identical on resume. Exit codes: 0 complete/identical; 2 valid incomplete/different; 1 error/invalid; 130 cancelled. Repeated acquisitions may reveal later source revisions; the comparison reports them.

## Remaining limits

This Q3 sample validates the engineering pipeline, not trading advantage or adequate market-regime coverage. Real rate-limit bans, network failure/cancellation and incomplete upstream feeds were exercised with deterministic fixtures, not induced against the public API. The checksum does not authenticate an independently rehashed payload or volatile acquisition metadata. Large archives, broader venue coverage and strategy evaluation remain future work. Checkpoint persistence is page-based; a hard crash may leave a lock requiring manual process verification before removal. No new actual UTC-midnight, one-hour session or physical-device observation occurred; those earlier app checks remain pending.

Stop after this data-foundation increment.
