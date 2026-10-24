# Calculation contract 1.0.0 — predeclared

Resumed clean local `main` at audit commit `ffa1d61`, fetched origin and fast-forwarded to the newer handoff/review checkpoint `6c3210bfe55ac53676f97e204339e2ec8e8bf5ab`. Read the current STATUS start-here/roadmap/board and audit report before starting this single bounded task. No unfinished local changes were present. The completed audit and independent check were reused.

## Delivered declaration

- `research/contract/v1.json`: version 1.0.0, **predeclared-awaiting-independent-review**; SHA-256 `04d2c9dbbba6fb3d84b692c4410496f03e280dad82bb8357b44a443527b66156`.
- `research/contract/README.md`: finite-origin assumptions, preparation/exclusions, per-feature units/budgets, M/W replay/resumption and explicit limits.
- `research/calculation-contract.cjs`: source/declaration checks and small preparation/exact-replay policy helpers consuming trusted existing-adapter snapshots. No indicator formulas, alternate calculation engine, bootstrap, storage or episode implementation.
- Required npm/CI adds only nine generated contract fixtures; no new dependencies or acquired files required.

| Decision | Predeclared rule |
| --- | --- |
| Canonical input | Existing CLI-verified BTCUSDT 5m Q3 identity, 26,496 complete rows; canonical hash `436dc49807c729b27f917819cc808aff2d7ff6ef137ca566a0c78943bac232e1` |
| Calculation origin | Always 2026-07-01 00:00 UTC; use the complete confirmed prefix through the decision candle |
| Preparation | Exclude initial 3999 decision timestamps; 4000th candle closes 2026-07-14 21:20 UTC; preserve all preceding bars/events as inputs |
| Availability | Preserve actual score validity, undefined RSI and zero-reference states; require UTC day-open coverage; retain a valid WAIT |
| Feature error budgets | Zero same-origin feature/state/vote/plan differences; price/ATR, RSI points and dimensionless RR stay separate; EMA800 is context-only |
| Different origin | Diagnostic only, outside this contract; no rolling 1000/4000-bar substitution approved |
| M/W and interruption | Revalidate identities and reconstruct every alternating pivot/confirmation from the original prefix; no serialized parser/indicator cache accepted |

The preparation cutoff is an engineering choice made **after** the sensitivity audit and **before** any episode/outcome work. It is not a universal convergence assertion, trading threshold optimization or retrospective pre-registration of the completed audit. Zero replay error refers to the pinned finite-origin calculation, not absolute market accuracy. Pre-origin parser/seeding history remains unknown.

## Checks actually performed

`npm run test:contract` passed **9/9**, zero failures. Fixtures cover the exact preparation boundary, warmed wrong-origin rejection, close/end coordinates, actual undefined RSI/zero-volume/zero-ATR inputs, valid WAIT retention, tiny context-price/RSI/RR/state disagreements, older-pivot M/W dependence, restart and future parity. The M/W fixture produces a recent M whose contributing pivots are hundreds of bars earlier; truncating to the recent reporting window loses it.

`node research/calculation-contract.cjs` verified declaration consistency and all five pinned source hashes on Node 24. It read no acquired data and executed no application bootstrap. `git diff --check` passed. Preservation checks verified **24 protected tracked files byte-for-byte** and all **six retained dataset/checkpoint byte hashes** against their historical manifest. The app remains 0.4.3 and CLI 1.0.1/schema 1. The original audit/source/protocol/results, package lock and historical manifests are unchanged. Evidence: `fixtures.log`, `local-manifest.json`, `preservation-and-validation.json`; new-only source hashes: `qa/calculation-contract-v1-sha256.json`.

No completed real Q3 audit, application/research/browser suite or market acquisition was repeated locally. Actual publication commit `f6236523fd5e560bdd6beeed3b0fcf956434d514` passed [Actions run 40116748389](https://github.com/artimeNFT/hybrid-terminal/actions/runs/40116748389), both jobs: nine app suites, 18 research cases, nine audit fixtures, nine contract fixtures and five mocked Chromium suites. Metadata and filtered passing logs are tracked alongside this report. No success is inferred from workflow configuration alone.

## Exact next action and limitations

Independently review the JSON contract, explanation and focused tests before accepting the origin, preparation and M/W state choices. After acceptance, separately predeclare one episode/control protocol with event ordering, horizon/censoring, untouched chronological holdout and costs before outcomes. The helpers assume trusted validated adapter input; they do not authenticate caller-fabricated snapshots. No streaming-state proof, cross-runtime tolerance study, episode generation, matched controls, trading outcomes or strategy changes were performed. Broader data review and actual midnight/long-session/physical-touch observations remain pending separately.
