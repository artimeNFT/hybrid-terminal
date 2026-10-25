# Actual one-hour acceptance observation — application 0.4.4

**Measured result: soak accepted. Separate midnight-mode acceptance, physical-device touch and user-perceived readability remain pending.** No application/tool fix was warranted, and neither source was changed. No local completed regression suite, research acquisition, audit or cohort was repeated.

Started on clean main, safely fetched/fast-forwarded to review documentation `7e5134940f3bb2139184c3f76b3977433e26af7c`. A subsequent safe fetch after continuation found no newer remote work. Used the existing `tests/browser-observe-context.cjs`, project-local browser libraries and an isolated temporary Chromium context. The root application was loaded directly, outside the frozen research context, with actual Binance public REST/WebSocket access and no feed interception.

## Measured evidence

| Check | Result |
| --- | --- |
| Active source | `hybrid-terminal.html`, runtime **0.4.4**, SHA-256 `f89f6f48a725d3f3e354a651b7a627e60ad7c1270105f6936b44803030f51cfa` |
| Existing observer SHA-256 | `4cdc73e4e9654de1faab7791959d88efaebd9ce28bd53cbab338103ce303c05d` |
| Sampling | **2026-10-24 23:00:07.262Z → 2026-10-25 00:00:07.281Z** |
| Elapsed | Tool records **3600.018 s**; UTC timestamps independently give **3600.019 s** (millisecond rounding differs) |
| Samples | 733 regular/initial/final snapshots; 735 journal snapshots checked including offline/resync |
| Actual confirmed frames | **12** unique consecutive BTCUSDT 5m closes, 23:05 through 00:00 UTC, all matched to confirmed state and retained journal records |
| Confirmed state | Latest close 22:55 UTC initially, 23:00 after reconnect, 00:00 finally; loaded closed-candle count 999 → 1011 |
| Feed | Offline explicitly visible during injection; healthy after resync and at final sample; zero unhealthy regular samples |
| Daily context | Healthy after resync and finally; one sampled `loading` state at 00:00:01.239Z, ready again by 00:00:05.284Z |
| Journal | 1 initial → 2 after reconnect → **14 final**; all previously seen IDs/signature strings preserved across all 735 snapshots; no retirements/conflict flags |
| Duplicates | **0 duplicate IDs; 0 duplicate configuration/confirmed-candle keys**, checked separately in every snapshot |
| Errors | **0 page errors, 0 console errors, 0 unexplained recorded errors** |

Deduplication keys use symbol, timeframe, rule version, minimum score, execution version and confirmed candle-close time. Composite IDs supply the symbol/timeframe/candle-open/rule/minimum fields; their close times were checked against 5m boundaries. Source and configuration remained fixed. Existing record signatures were compared as exact strings, not just as counts. Each received close also matched a subsequent confirmed context price and final journal entry.

The network fault was explicitly `context.setOffline(true)`/`false` before sampling. Offline health was false, epoch advanced 1 → 3, and feed/daily context were ready after guarded reload. The separate synchronous quota-style storage fixture preserved stored bytes and IDs, exposed unavailable persistence, then recovered persistence. It was **injected in the temporary profile**, not an actual disk-full incident or a test of the user's ordinary journal.

## Evidence locations and limits

Full 4,758,917-byte raw evidence is retained, unchanged and ignored, at:

`.qa-results/observations/soak-0.4.4-2026-10-24T22-59-50Z/evidence.json`

SHA-256: `236e3ed7ac3204bc33b73e57ee93caa807031f257d3aadbaffb4f6ed1a93ba99`.

The same directory contains `launch.json`, `observation.log` and `final.png`. Tracked `verified-observation.json` contains verification results, initial/offline/resync/final and rollover excerpts, all real close frames and daily requests. `sample-checks.csv` projects every checked snapshot with signature-pair hashes and explicit duplicate/preservation checks. These are static evidence projections, not a new diagnostic tool or framework. The raw evidence remains the authoritative complete record.

Progress was polled during the first 14 minutes. The background observer then completed at its fixed deadline; evidence was inspected after the user continued the session. Continuous human supervision is not claimed. This is one headless Chromium BTCUSDT 5m run, not universal reliability, physical-device or account/order acceptance. Sampled health does not prove continuous health between snapshots. The short daily refresh state is disclosed rather than classified as an unexplained error.

## Pending and exact next action

The raw tool reports `observedMidnight=true` because this soak crossed 00:00 UTC and its daily context advanced. **That is not counted as midnight acceptance.** The soak had only approximately seven seconds after the boundary, and no separate 420-second midnight-mode run started in its actual bounded window. At evidence review, that window was unavailable; no all-day wait or simulated rollover was used.

Next bounded start window: **2026-10-25 23:57:00–23:59:00 UTC**, recommended **23:58:00 UTC**, for the boundary at **2026-10-26 00:00:00 UTC**. Use a new ignored output directory and the existing documented command:

```sh
LD_LIBRARY_PATH="$PWD/.tools/browser-libs/root/usr/lib/x86_64-linux-gnu" HYBRID_OBSERVE_MODE=midnight HYBRID_OBSERVE_SECONDS=420 node tests/browser-observe-context.cjs
```

If that actual window is missed, leave acceptance pending and record the next UTC window. Physical-device touch and the user's perceived readability/colors require actual separate checks. Stop this task after publishing evidence and verifying the resulting actual CI; no features or research work are queued automatically.
