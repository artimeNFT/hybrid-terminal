# Hybrid System — project status and maintained task board

Date: 2026-10-24, Asia/Jerusalem.
**Application remains 0.4.3**, authoritative `hybrid-terminal.html`, byte-for-byte unchanged:
`fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.
**Independent CLI tool 1.0.0 / dataset schema 1:** `research/klines.cjs`.
Final tool SHA-256: `7200e575ba74206dc70a82cdfb7159e9d9596fc5d01e8b0c75215ce30d30d1c5`.

## Maintained task board

This is the project's **single task board**. Keep one active implementation task. Every completed increment must update its status, next action and evidence/limitations here; do not create a competing roadmap.

| Priority | Task | Status | Next action | Evidence / limitations |
| --- | --- | --- | --- | --- |
| P1 | Application, navigation and day context | Implemented — app **0.4.3** | Preserve reviewed source while building separate research infrastructure | `qa/source-checksums.json`; `tests/results/0.4.3/`; earlier live limitations remain |
| P1 | Research-data foundation | Implemented locally — tool **1.0.0 / schema 1**; external review pending | Obtain independent external review of the tool/schema/fixtures before treating local checks as external acceptance | `tests/results/research-data-v1/`; Python oracle is a separate **local** implementation, not an independent external review |
| P0 | Git / private GitHub / reproducible CI | **Implemented — private repository published; actual CI green** | Maintain the scoped checks and single board on future authorized increments | [Successful GitHub run](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40095837948); `tests/results/ci-publication/` |
| P1 | CLI credential storage | Follow-up queued — plaintext CLI configuration, file mode `0600` | Migrate to an OS-backed credential store when available; keep secrets out of repository/chat | Publication receipt records storage type only; no credential values are displayed or committed |
| P2 | Episode definitions, warm-up/origin analysis and matched-control pilot | Queued | Define protocol, origin/warm-up policy and matched controls before generating episodes | Research data is an engineering foundation, not strategy evidence; see limits below |
| P2 | Actual UTC-midnight rollover / one-hour reconnect-storage / physical touch check | Pending observations | Run the bounded observations in their real windows; use a physical device for touch | README bounded-observation commands; `tests/browser-observe-context.cjs`; deterministic/emulated results do not complete these observations |
| P3 | Additional indicators and derivatives/context features | Deferred | Resolve source/configuration/parity requirements in a separate increment | README follow-up requirements; no approximations or score changes authorized here |

## Git / GitHub / reproducible CI setup — 2026-10-24

Initialized Git in this exact Hybrid folder on `main`, using existing configured identity `artime` / `shlomics@gmail.com`; no global identity/configuration change. No existing repository/remotes were present. `.gitignore` retains acquired datasets/checkpoints, local tools/dependencies, historical ZIPs, generated browser images/traces and personal exports on disk while excluding them from commits. Source, schemas, tests, required baselines, small textual evidence and documentation are tracked. `.gitattributes` preserves exact HTML bytes.

QA-only dependencies are pinned in package.json/package-lock.json: Playwright 1.64.1 and optional native-rendering QA helper @napi-rs/canvas 1.0.13. The HTML and research CLI/schema are unchanged. `npm test` runs the scoped reviewed-source check, nine existing deterministic app suites and the 12-case research suite. `npm run test:browser` runs the five existing mocked Chromium suites, saves logs/screenshots/traces under ignored `.qa-results/`, and rejects any HTTP/WebSocket request not fulfilled by their page fixtures. No old /tmp QA installation or acquired market dataset is required.

The workflow uses Node 24, standard Ubuntu 24.04 runners, separate deterministic/Chromium jobs, push-main/PR-main/manual triggers, concurrency cancellation, bounded job/test timeouts, read-only contents permission and three-day failure artifacts. Official current action releases/commit pins were checked: checkout v7.0.0, setup-node v7.0.0, upload-artifact v7.0.2 (`tests/results/ci-setup/tool-versions.json`). There is no deployment, scheduled data collection, larger/paid runner or automatic merge.

Publication resumed after WSL authentication. Verified actual CLI account **artimeNFT**, exact local root/main and clean history, then confirmed the target was absent using authenticated GitHub API lookup. Created **private** repository https://github.com/artimeNFT/hybrid-terminal and configured origin as `https://github.com/artimeNFT/hybrid-terminal.git`. A host-specific HTTPS credential helper is configured only in this repository; global Git configuration is byte-identical to its pre-publication checksum. Initial main push was non-force and remote main matched `f20cebb732e48b320cfc0406a023b195d0dd025f`.

Actual push-triggered Actions run: https://github.com/artimeNFT/hybrid-terminal/actions/runs/40095837948 — **completed successfully**, both Node 24 deterministic and mocked Chromium jobs green. This is remote execution evidence, separate from the earlier local clean-clone checks. Private visibility/default main/admin permission were confirmed through GitHub; no visibility change, unrelated history overwrite or branch deletion occurred. Plaintext CLI credential storage (mode `0600`) is a queued follow-up above; credential values were not printed or written to project evidence. Prior unauthenticated handoff evidence remains in `tests/results/ci-setup/` and Git history.

The standard Playwright system-dependency installer requires sudo on this WSL host. The documented rootless Ubuntu 24.04 fallback downloaded/extracted the missing NSS/NSPR/ALSA libraries into ignored `.tools/browser-libs`, with no system changes. Normal CI uses Playwright's official --with-deps installation. Application/research/source and frozen-data semantics remain unchanged; old delivery manifests are preserved. CI checks only tracked reviewed sources and synthetic fixtures, and never claims full verification of intentionally untracked delivery files.

## Local setup verification and publication handoff

Completed locally on Node v24.15.0:

- Locked npm installation; all nine original deterministic application suites, all 12 research cases and all five original mocked Chromium suites passed. Existing suite sources were unchanged. New QA hooks/runner hashes are recorded separately; old manifests were not rewritten.
- A **tracked-only clean Git clone of `cdebf5326db63f67e66421016a1287d4f942c1bd`**, initially without acquired datasets, node_modules or local tools, passed fresh `npm ci`, `npm test`, rootless browser setup and all five browser suites. Legacy NODE_PATH and LD_LIBRARY_PATH were unset; packages/libraries came from the documented installation commands. Browser cache may be shared, as with normal Playwright installation. Evidence: `tests/results/ci-setup/fresh-checkout.json` and `fresh-*.log`.
- All browser fallback network guards recorded zero unmocked external requests. A separate guard check deliberately attempted an unmocked invalid-host URL and was rejected before public network access. Workflow YAML and trigger/job/permission/pin/timeout/artifact policy assertions passed; this is local validation, **not a GitHub Actions run**.
- Staged names/sizes and targeted credential patterns were reviewed. Dataset/checkpoint/lock/dependency/tool/browser-artifact exclusions were verified without deleting local files. Initial checkpoint review receipt: `staged-review.json`. Legacy whitespace warnings in untouched notes/diff archives were preserved, not represented as a successful whitespace-clean historical audit.
- Reviewed app/research/schema and required baselines passed scoped source hashes; original local frozen datasets and earlier evidence also retain their prior delivery byte hashes. The latter is a **local preservation check**, not a CI/full-delivery claim about an intentionally incomplete checkout. Original app hash remains `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.

The login blocker is resolved and setup is complete. No implementation task is active after this increment; episode/pilot work stays queued. The published code/setup checkpoint is `f20cebb732e48b320cfc0406a023b195d0dd025f`, verified by successful push-triggered run [40095837948](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40095837948): **nine app suites, 12 research cases and five mocked Chromium suites passed**. No CI setup fix or source/test change was needed.

Repository: **https://github.com/artimeNFT/hybrid-terminal**, verified PRIVATE, default branch main. The later documentation/evidence commit records these fixed checkpoint/run references; the latest local/remote main SHA is available with `git rev-parse HEAD` / `git ls-remote origin refs/heads/main`, and [main's workflow history](https://github.com/artimeNFT/hybrid-terminal/actions/workflows/ci.yml?query=branch%3Amain) identifies its exact run. After the final documentation push, its run is also checked before delivery; a local post-push receipt goes to ignored `.qa-results/ci-publication/final-verification.json` to avoid a self-referencing commit loop.

Tracked publication evidence: `tests/results/ci-publication/repository.json`, `initial-successful-run.json`, filtered `initial-run-test-summary.log`, `publication-start.json` and `verification.json`. Global Git configuration remains unchanged, and the successful push used a host-specific helper configured only in this repository. Plaintext CLI credential storage (mode `0600`) remains a separate queued follow-up; no credential values are printed, committed or included in evidence. No remaining publication blocker. Actual UTC-midnight/one-hour/physical-device observations and external research review remain pending separately.

## Research-data increment: scope and preservation (historical)


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
