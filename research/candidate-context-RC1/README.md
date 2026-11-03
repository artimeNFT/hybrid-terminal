# hybrid-candidate-context-v1 / resource continuation RC1

Resource-only continuation of [parent delivery](../../tests/results/hybrid-candidate-context-v1/REPORT.md), authorized at planning `e63dd6a3457a64b4fcda6518c34f40538ef50d58`. [Exact handoff](HANDOFF.md), [immutable grant](grant.json). No statistical revision, optimization, new dataset, application release or change to any original file in `research/candidate-context/`.

Controller lives outside that fingerprinted folder: `research/candidate-context-continuation.cjs`. Grant canonical hash `1155971c1bf9838889f4ef9ec8f82b93fc80e372386663a26d85befcd4060149`; controller SHA-256 `e2f375164973b2638a70373ad2cfbe832575dba208414e8726d035e1b0050baf`. It binds parent seal, original protocol/data/source identities, starting checkpoint/receipt bytes and exactly600,000 additional milliseconds. The original900,000ms allowance stays fully charged/exhausted; its897,790ms wall observation remains separate. Maximum total authorized allowance1,500,000ms, one calculation worker, unchanged2GiB observed RSS limit.

The immutable starting snapshots are ignored under `.qa-results/hybrid-candidate-context-v1/market-run/RC1/`:

- `starting-checkpoint.json`: original canonical payload hash82dc72fa…; actual1,092 feature rows and904 training rows, index31,400.
- `parent-resource-receipt.json` and `parent-source-seal.json`: byte-exact copies; originals never rewritten.
- `grant.json`: identical grant envelope; mutable hash-checked `ledger.json` is reconciled against immutable numbered intent/observation/receipt records.

`seal` has already issued RC1; it refuses a second grant. The single authorized launch command is:

```
node research/candidate-context-continuation.cjs run
```

Do not rerun this command after completion or while active. Only a recorded safe interruption, no inFlight work and remaining cumulative allowance may use:

```
node research/candidate-context-continuation.cjs resume
```

Both commands target the **same original run directory and inputs** through the unmodified worker. A per-run exclusive lock and exact Node-process check prevent overlapping controllers/workers. Neither missing ledger nor incomplete/uncertain segment records reset the allowance; stale locks are never stolen automatically. Unknown fit/evaluation intent blocks restart. Original `run.cjs --resume` still rejects under its exhausted original contract.

Each segment records monotonic observed elapsed time and wall observations separately. Normal/interrupted consumption charges the ceiling of monotonic milliseconds; a budget stop consumes the remaining grant, including termination reserve, to prevent repeated reuse of its margin. The controller sends soft stop with up to1second reserve and hard kill up to100ms before the remaining allowance ends; RSS/interruption also receive bounded termination. No new grant is automatic. Final receipts link the final checkpoint, frozen source/data and preserved row/ID/training prefixes. Scope failure blocks continuation without repairing history.

The initial resource receipt remains historical `incomplete` even if RC1 completes the study. CURRENT STATUS and the separate RC1 ledger/report establish the continued result. No market work is restarted merely to obtain green CI.

Post-run checks use the original verifier and a separate independent aggregator:

```
node research/candidate-context/verify.cjs .qa-results/hybrid-candidate-context-v1/market-run
node research/candidate-context-RC1-verify.cjs .qa-results/hybrid-candidate-context-v1/market-run
```

The latter checks stored scores/labels, ambiguity outer bounds, calendar sum/count resampling, sections, fixed thinning, reliability and screening without importing the engine, label generator, prediction or fitting functions. Synthetic controller/aggregation checks: `node --test tests/candidate-context-continuation.cjs`, included in `test:preparation`; no new browser suite/dependency.

[Linked continuation report](../../tests/results/hybrid-candidate-context-v1-RC1/REPORT.md) records the actual result or block. Candidate context remains exploratory, not approved-plan probabilities or profitability; funding/other effects unknown, not zero. No automatic follow-up experiment or forecast deployment.
