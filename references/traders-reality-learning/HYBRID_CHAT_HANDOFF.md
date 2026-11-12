# Hybrid System — ChatGPT continuity handoff

**As-of:** 2026-11-12 (Asia/Jerusalem) · **Scope:** Hybrid System / Hybrid Terminal ONLY · **Status:** handoff/checkpoint, **NOT** an implementation authorization, research approval or replacement for the source-of-truth files.

## 0. Start here — instructions for a replacement ChatGPT window

1. Work in **Hebrew**. The owner wants precise, evidence-backed project management and trading research, with a short project checklist at the end: **בוצע / כעת / נותר / פעולה מומלצת ומה נדרש מהמשתמש**. No reassuring guesses, repetitive audits or new feature roadmaps without a real gap.
2. Verify the **current** repository state; the hashes below are historical snapshots, not perpetual claims. Do **not** infer access to VS Code/WSL, screenshots, local ignored datasets or active WORK from GitHub access.
3. Read in order: [main/START_HERE.md](https://github.com/artimeNFT/hybrid-terminal/blob/main/START_HERE.md), [main/STATUS.md](https://github.com/artimeNFT/hybrid-terminal/blob/main/STATUS.md), [research README / WORK handoff](README.md), [OPERATING_STRATEGY.md §11](OPERATING_STRATEGY.md), [DECISION_CONTRACT.md](DECISION_CONTRACT.md), then [PLAYBOOK.md](PLAYBOOK.md), [EVIDENCE.md](EVIDENCE.md), [DECISIONS.md](DECISIONS.md) **only if relevant**. Older next-task text is not the current task board.
4. On a new turn, ask for the **latest WORK/Codex response only if it has not been supplied**. Classify each claim as **source-verified / reported by the user or agent / proposed / unknown**. Do not claim to remember earlier chats verbatim.
5. Keep **VECTOR LAB**, **Polymarket**, and other repositories separate; an older ETH-developing-candle/VECTOR LAB exchange was mistakenly pasted into the Hybrid discussion and is not a Hybrid instruction.

## 1. Project status at this checkpoint

- Repository: [artimeNFT/hybrid-terminal](https://github.com/artimeNFT/hybrid-terminal) — GitHub currently reports **PUBLIC**, despite older START_HERE text saying private. Do not upload private notes, account data or local research without approval and disclosure review.
- Verified remote **main** HEAD: `bfa8f5ffa9dee5e34c2df4ee0c07f75b89f5ecf1`. Active root `hybrid-terminal.html` **0.4.25 RC**; documented SHA-256 `f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57`. Branch [docs/traders-reality-learning-2026-11-08](https://github.com/artimeNFT/hybrid-terminal/tree/docs/traders-reality-learning-2026-11-08) is separate from main, not merged; it contains the research and latest decision handoff.
- QA/release: **regional retention/reload intermittent failure remains UNKNOWN/BLOCKED** for full acceptance. `main/STATUS.md` expressly states **diagnostic budget exhausted**: no blind reruns, speculative fix, test relaxation or automatic new bounded QA investigation. Some CI paths passed without closing this defect. The separate planning-fee reload problem is parked.
- Existing unmerged candidates: [decision economics](https://github.com/artimeNFT/hybrid-terminal/tree/candidate/decision-economics-overview-2026-11-08), originally tested under Node 22 with Node 24/full QA/Help review outstanding; [draft PR #1 modeled-risk-budget sizing](https://github.com/artimeNFT/hybrid-terminal/pull/1), which GitHub reported open/draft/unmerged and non-auto-mergeable at handoff. Both touch `updatePlanningCosts`; avoid a second implementation or automatic merge. PR #1 is **planning arithmetic only**, NOT executable quantity, margin/liquidation or guaranteed risk cap. Review a prominent adjacent label “מודל לתכנון, לא לביצוע”.
- Other research: `perp-support-v1` was **RESOURCE-REFUSED**; later `perp-support-v2` was **INCOMPLETE** at output interface `F.tally`, with no valid scientific support result. Do not revive either study implicitly. Historical tested D/mean-reversion variants have **no demonstrated positive modeled net edge** under evaluated assumptions. Do not imply any live profitability.

## 2. Confirmed product boundaries and decision-workflow agreement

- Product goal: **decision support for a human trader**, not automatic prediction or order execution. Reduce manual information gathering, improve explanation, clarify costs and risk, and measure whether the workflow helps. Reliability/usability and net trading advantage are separate claims.
- Trading-decision sequence: **market/source eligibility → context → location at a level known in advance → scenario/closed-candle trigger → stop/target/net costs → budget/sizing/exposure → human choice, including WAIT, and journal**. Context can create an asymmetric *burden of proof*; 4h/1h/15m/5m are roles, **not four equal direction votes**.
- Preserve **four original chart TFs** and setup families: **A continuation**, **B reversal**, **C session handoff**, **D current mean-reversion baseline**. A/B/C are **NOT implemented automated signal engines**. Current code includes BTC/ETH/SOL Spot and USDⓈ-M Perpetual OHLCV, vectors, EMA, contextual levels/sessions, modeled costs, and a **manual** PERP_NOW snapshot of OI/funding/Mark/index/bid/ask; it has **no continuous CVD/DOM/order flow**. NEAR/1m screenshots illustrated a manual analytical problem, not existing app support or a verified setup.
- Each indicator must answer a particular decision question; Vector colors/OI alone **do not** reveal trader identity or intent. Source time, event time and **confirmation/availability time** are distinct; pivots determined after N bars cannot be backdated in signals or tests. A provisional candle is not a confirmed signal.
- Constraints: no new auto-scanner, broad market-data recorder, new scoring engine, leverage/order automation, extra chart TFs or new research simply because ideas arose. Human safety: funding, margin, liquidation, Mark versus Last stop trigger, execution rounding and correlated risk remain **explicit limitations**, not zero-cost/verified assumptions.

## 3. Agreed sequencing — not a blanket work order

1. **WORK review/readback first:** verify current branch/HEAD/CI/ownership, documentation and code; compare reality with §11, register agreement/objections with evidence. One scoped recommendation with acceptance/stop conditions; **no changes by virtue of this handoff**.
2. Preserve the QA budget stop; any new QA investigation needs new evidence, a specific scope and user authorization. When appropriate and authorized, inspect economics candidate then PR #1 and their integration conflict. Do not demand exchange-executable sizing within the existing PR contract.
3. **Usability baseline proposed, not yet run or approved:** five fixed market/decision cases (trend, countertrend, mid-range, failed breakout, stale feed); at most one 90-minute session, with prewritten reference decisions. Track completion, timing, automatic fields and critical errors. Proposed 6-minute/20%-improvement thresholds are **NOT owner-ratified empirical facts**. A new decision card is justified only by an observed usability gap and must reuse existing UI/data.
4. **Research candidate, not authorized:** BTCUSDT USDⓈ-M, family A breakout→retest→hold with previous completed UTC day high/low (PDH/PDL); possible 15m closed trigger, earliest next-bar entry, proposed `CONTRACT_PRICE` stop trigger. Breakout/retest/hold, expiry, stop, target, horizon, costs, overlap, data gaps and parameters are **not frozen**. Base research should avoid an undisclosed HTF context gate; a “with/without one gate” comparison is a separately prespecified hypothesis.
5. Before any event count, freeze a **one-paragraph research contract and minimum detectable effect** and obtain explicit owner consent. New historical event counts = **new research**, even if no PnL is calculated. Example IID planning power at σ≈1.5R: n≈441 for δ=0.2R, n≈1764 for δ=0.1R (α=0.05 two-sided, 80% power); assumptions unverified for A, effective N may be lower. Insufficient data → **NO-GO for this design / INSUFFICIENT EVIDENCE**, not proof of losses. New PnL study requires separate authorization.

## 4. Local VS Code/Codex audit — reported, NOT independently read here

The owner brought a **read-only Codex-in-WSL report**. Codex reported correct local WSL repository root (see START_HERE for location), `main` at `bfa8f5f`, no tracked/staged changes, active HTML 0.4.25 RC matching its documented SHA, and **exactly four untracked Markdown research files** in local `משימות פיתוח/`:

- `HYBRID_CONFIRMATION_REVIEW_2026-11-07.md` — independent confirmation/logic review.
- `HYBRID_PERP_EXECUTION_FEASIBILITY_2026-11-07.md` — outcome-blind execution/cost geometry with externally referenced supporting evidence **not yet inspected**.
- `HYBRID_PERPETUAL_STOPPING_VOLUME_SUPPORT_REVIEW_2026-11-07.md` — separate exploratory stopping-volume review; do **not** conflate with failed perp-support-v2.
- `HYBRID_TR_LEARNING_LEDGER.md` — three-source learning ledger; not a development order.

Codex also reported `.qa-clean-checkout/` is a **separate historical Git clone**, not a registered worktree, at `cdebf5326db63f67e66421016a1287d4f942c1bd` (old 0.4.3), clean in tracked/non-ignored state and intentionally ignored by main; **not 0.4.25 QA acceptance**. Stale `/tmp` worktree registrations can remain; do not prune or clean simply for neatness.

**Important outstanding knowledge-preservation gap:** the **four files' full bytes have NOT been compared with current remote docs**. The docs branch does not appear locally in Codex's report; it **does exist remotely** and WORK has read it via GitHub. No evidence of lost/misplaced work was identified. Do not commit, copy to a public repo, delete, reset, clean, checkout, fetch or sync automatically. After approval, compare four local files with remote research docs in a strictly **read-only, bounded provenance/privacy review**; output `file | source | duplicate/new/conflict/UNKNOWN | sensitivity | preserve recommendation`, no new experiments. See the [Codex audit recorded in the research README](README.md).

## 5. Tool roles, ownership and authorization

- **WORK cloud** has read GitHub and issued a sound independent review. It **did not have access to the user's Windows/WSL local directory** from its isolated scratch runtime. **Codex inside VS Code/WSL** confirmed local access. GitHub permission ≠ filesystem permission.
- WORK confirmed high-level agreement with the decision process and warned: QA investigation budget already stopped; economics/PR1 need controlled integration, not redesign; five UX cases cannot prove net edge. Its last transmitted audit correctly distinguished resource-refused v1 from incomplete v2 and requested local verification; **Codex local audit was then delivered and recorded**.
- New ChatGPT window must distinguish its own file access, remote repo state, WORK assertions and user-provided Codex report. Do not claim local files were read or that the owner approved 6-minute/20% UX gates, family A research, new QA runs, a commit/merge or any implementation.
- Most recent **active user preference**: establish a fast and safe **cross-chat continuity handoff** to replace this long conversation without losing decisions. Work on the handoff is authorized; other code/research changes are not.

## 6. On return: decision protocol, NOT another planning loop

- Determine what changed **since the handoff** in WORK, local Codex and GitHub; present only the delta and real blockers.
- If asked to advance the project, the first source-bound action is the **read-only comparison of four local untracked notes to remote docs** (needs file access and approval) or the next separately authorized existing P0/candidate gate. No unsanctioned QA/research run.
- If no new evidence or approval exists: explain the known state concisely and stop. A new chat is **not** permission to reopen Claude discussion, regenerate a roadmap, create multiple task documents or label theoretical work “completed”.
- Any unresolved finding has a named owner, required evidence and STOP condition. Never claim “safe for live leveraged trading” or proven positive edge.

**Maintenance:** This document is a snapshot and should be revised only when a verified material state or user decision changes. In any conflict, current main/STATUS + signed test evidence outrank this handoff; §11 is the decision-design authority, and unpublished local bytes remain unknown until reviewed.
