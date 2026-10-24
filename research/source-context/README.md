# Frozen 0.4.3 research source context v1

The root `hybrid-terminal.html` is the **only active user application**. `baseline/hybrid-terminal.0.4.3.html` is an internal immutable reference. It preserves reviewed SHA-256 `fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9`.

Historical audit/contract/preparation modules pin the logical path `hybrid-terminal.html`, including its full bytes. Their source, declarations, seals, canonical payloads, hashes and evidence are not rewritten. Instead, an **explicit separate Node process** binds that one logical read path to the checked internal 0.4.3 file. All original hash checks still execute and must match. Other file reads are untouched. The loader verifies the physical bytes against an independent literal hash, reports binding/loader identities and the actual active-app hash, and does not affect file writes. This process-local binding covers synchronous, callback and promise source reads used by the historical modules/tests; it is not a general filesystem sandbox.

```sh
node research/run-frozen.cjs check
node research/run-frozen.cjs contract
# Verify existing ignored payloads, without regenerating them:
node research/run-frozen.cjs prepare verify --out .qa-results/preparation-v1/q3-v1
```

For other historical commands, use `audit`, `prepare` or `verify-preparation` followed by their original arguments. No Q3 data acquisition, audit calculation or preparation cohort generation was performed for 0.4.4. The unchanged CLI research regressions also pin the original HTML: research/audit/contract/preparation npm suites therefore explicitly preload this context, including their Node test children and workers. The acquisition CLI itself remains independent of the HTML. The original source files retain their historical hashes. A fresh checkout needs no acquired dataset for required CI.

Running those original research adapters directly against the evolving root HTML continues to **fail** their old hash checks. There is no fallback, accepted-hash expansion, new indicator engine or automatic active-app substitution. To study a future calculation source, declare a new reviewed source context rather than relabeling old outputs. Old payload source identities refer to the original logical namespace; the separate v1 binding is new provenance, not a claim that the active root still has 0.4.3 bytes.

Active app/browser QA runs outside this context and uses `qa/source-checksums.0.4.4.json`. Historical `qa/source-checksums.json` and all old research manifests remain byte-identical. The new binding and active source receive separate current checksums/evidence.
