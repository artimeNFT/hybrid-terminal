# Supplied TR_MAIN reference — comparison and bounded next task

User-provided2026-11-03. Reference inputs only; no Pine compiler/TradingView runtime executed. Preserve original bytes/comments.

| File | Original | Raw SHA-256 | Lines |
| --- | --- | --- | --- |
| main.pine | Pasted text(2).txt | 992f91f45eaad0604473fed2e4d10012c4accbc26397603f9440cbfd44eed1fd |720|
| library.pine | Pasted text(3).txt | 5a0f368cf597d38792439b48d1787399f78522ff96959f96baa562722be5c36b |916|

Main imports TradersReality/Traders_Reality_Lib/2. The supplied library declares that name and the reviewed arities match. This does NOT independently authenticate publication2: Pine language version5 and compatible signatures are not a publication identity. Claims below are tied to supplied hashes, not blanket official-version/pixel/realtime parity. Publisher pages: https://www.tradingview.com/script/Etj1ixAs-Traders-Reality-Main/ and https://www.tradingview.com/script/8zgJTM9u-Traders-Reality-Lib/ .

## Profile observed in user screenshots

Override OFF; use current chart OHLCV, not inactive INDEX text. VCZ ON,500 maximum zones, Body only bounds, clearing prefix Body wi... uniquely matches Body with wicks among Main's two options. No chart instrument/product is visible, so numeric-feed equality is not established. ADR14/DO-off was also observed but is outside this package.

## Completed core comparison

| Area | Supplied library | Local0.4.22 |
| --- | --- | --- |
| PVSRA | Previous10 mean; climax >=2x OR current V*(H-L)>=prior10 max; rising >=1.5x | Same ordinary mathematical formula on complete valid references |
| Direction | C>O bullish; equality bearish | C>=O analytical up; neutral doji appearance is separate |
| Qualification | No equivalent explicit zero-reference guard | Explicit warm-up/invalid/zero-volume/reference guards; preserve them |
| Zone creation | Prior candle flags +/-2 or +/-3, hence rising AND climax; both above/below arrays | Climax only; legacy target selection additionally restricts origin color |
| Selected bounds | min(O,C),max(O,C) | Full L,H |
| Partial recovery | Shrink remaining above bottom to interior high; below top to interior low; delete at far-boundary equality/cross | Original bounds fixed; near/mid/full touch times; local eligibility ends at original midpoint |

Reviewed functions: calcPvsra lines58–78; getPvsraFlagByColor510–525; updateZones546–637. Creation reads previous bar [1]; updates read the processing bar. Both arrays receive qualifying prior candles. Do not add legacy origin-color selection to source-context boxes. Partial comparisons are STRICT interior; full deletion uses >=/<=. Keep original source bounds/time/class separate from remaining bounds. Source does not define TP1/TP2 or trading entries.

Maximum500 is per direction array, not a500-bar lookback or the legacy300-bar/6ATR policy. The supplied cap precedes cleanup. Preserve that ordering in the derived state projection. Global TradingView drawing-object GC is outside parity claims.

Source quirks must be explicit: Body-only CLEARING still has unconditional wick-based far-edge deletion; only partial branches are gated by Body with wicks. Implement only the user's selected profile, not extra generalized modes. cleanarr removes entries in a forward loop; Pine-v5 end-bound/index semantics require qualification. Use safe unavailable-entry compaction and document it as deliberate adapter behavior, not literal runtime equivalence. Reference: https://www.tradingview.com/pine-script-docs/migration-guides/to-pine-version-6/ . Do not derive logical class from adjustable display colors or claim color-collision parity.

## Independent arithmetic examples

- Prior meanV100/max-product200, currentV160/range1 => rising, not climax. Reference creates its zone on the next processing bar; legacy does not.
- High-volume doji: source bullish comparison false, local up comparison true.
- Bearish source O104,C100,H107,L99: body[100,104], legacy wick midpoint103. Following(H,C,L)=(102,101,100.5), then(103.5,103,102.5) leave reference ABOVE[103.5,104], while legacy midpoint103 is already reached. No new trading target is implied.
- All-zero reference/currentV0 satisfies raw0>=0. Keep explicit qualification guards; never manufacture actionable strength merely to match this raw edge case.

## Next package: optional qualified CLOSED source-derived zone context

Add one English zone-view selector Local(default) / Source-derived closed. Only one zone layer is drawn at once. Reference profile fixed to observed Body-only bounds/Body-with-wicks updates/cap500 per direction, rising+climax. New pure state projection from qualified market OHLCV; preserve existing data-validity safeguards and disclose differences outside qualified history. New context uses strict C>O, without mutating original up/class/candle arrays. Empty/zero-body states must not create fabricated width or targets.

Process CLOSED bars only. Previous qualifying vector becomes a zone on the next CLOSED processing bar; clearly disclose this confirmation delay versus TradingView intrabar drawing. Current/developing data must not advance confirmed reference state. Derive from the chosen product's own loaded chart history, with source/history-origin/as-of disclosure and context/epoch guards. Cache by data/closed-history revision, not hover/pan/countdown. No new network/timer/dependency.

Leave current analyze/sigAt/backtest/legacy S.z, candle palettes/bodies, scores, selector, original targets/stops, sizing/costs, journal/export and old research exact. Remaining reference boxes never become local-plan targets. A visible Hebrew note and bilingual Help must state the reference layer/local-plan independence; no probability/profitability claim. Preserve existing preferences; any saved selector state is display-only.

Before app edits preserve exact0.4.22. Reuse the existing explicit archived-QA source-context pattern for closed-study fixtures; do not rewrite old scientific sources/protocols/seals or weaken assertions. Actual new-app/browser QA must stay distinct from archived historical-source checks. No market replay is authorized.

Validate reference classifications/previous-bar creation/both arrays/body bounds, strict partial/far equality, repeated/multiple deletions and cap-before-cleanup, qualification/zero-body/closed separation; verify old engine/plan/journal equality and product/history/cache isolation. Desktop/narrow browser coverage for the new selector/context is appropriate. No new model, cohort, acquisition, live soak, midnight wait, session/ADR expansion or unrelated refactor.
