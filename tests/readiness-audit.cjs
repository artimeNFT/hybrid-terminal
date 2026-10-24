'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createAdapter}=require('../research/audit/adapter.cjs');
const {runAudit,compareSnapshots,causalDifference,numericDifference,sampleTimes,loadVerifiedDataset,protocol}=require('../research/readiness-audit.cjs');
const {randomBars,replacementFixture,reflect}=require('./regression.cjs');
const STEP=300000,DAY=86400000,START=Date.UTC(2026,6,1);
const timed=bars=>bars.map((b,i)=>({...b,t:START+i*STEP}));
function snap(bars,time=bars.at(-1).t,capture=true){const a=createAdapter({captureTargets:capture});a.load(bars);return a.snapshot(time)}

test('adapter uses hash-checked actual functions without bootstrap/storage/backtest and target capture preserves decisions',()=>{
 for(const bars of [timed(randomBars(13,400)),timed(replacementFixture()),timed(reflect(replacementFixture()))]){
  const a=createAdapter(),plain=createAdapter({captureTargets:false});a.load(bars);plain.load(bars);
  for(const i of [59,93,bars.length-1])assert.deepEqual(a.snapshot(bars[i].t).decision,plain.snapshot(bars[i].t).decision);
  assert.deepEqual(a.deniedCalls(),[]);assert.equal(a.identity.bootstrapExecuted,false);assert.equal(a.identity.backtestExecuted,false);assert.ok(!a.identity.functions.includes('calc'));
 }
});

test('same timestamps, not local array indices, align finite volume/UTC metrics and eligible zone identities',()=>{
 const bars=timed(randomBars(8,650)),reference=snap(bars),window=snap(bars.slice(-400)),d=compareSnapshots(reference,window);
 assert.equal(reference.openTime,window.openTime);assert.notEqual(reference.pastBars,window.pastBars);assert.deepEqual(reference.volume,window.volume);assert.equal(d.disagreements.volumeClass,false);
 for(const side of ['LONG','SHORT'])for(const z of window.zones[side]){assert.ok(z.id.startsWith(String(z.openTime)));assert.ok(z.openTime>=window.historyStart&&z.openTime<window.openTime);assert.ok(!('i' in z));}
 assert.deepEqual(reference.mw,window.mw);assert.deepEqual(reference.zones,window.zones);
});

test('UTC boundaries distinguish a midnight close from a new-day opening candle and partial-day origins',()=>{
 const bars=timed(randomBars(22,580));
 const oldDay=snap(bars.slice(0,288)),newDay=snap(bars.slice(0,289)),partial=snap(bars.slice(240,288));
 assert.equal(oldDay.closeTime,START+DAY);assert.equal(oldDay.openTime,START+DAY-STEP);assert.equal(oldDay.dayCoverage,'from-UTC-open');assert.equal(newDay.closeTime,START+DAY+STEP);assert.equal(newDay.dayCoverage,'from-UTC-open');assert.equal(newDay.metrics.vwap.value,(bars[288].h+bars[288].l+bars[288].c)/3);
 assert.equal(partial.dayCoverage,'partial-first-day');assert.notEqual(partial.metrics.vwap.value,oldDay.metrics.vwap.value);assert.notEqual(partial.metrics.dayOpen.value,oldDay.metrics.dayOpen.value);
 const d=compareSnapshots(oldDay,partial);assert.equal(d.disagreements.dayCoverage,true);assert.ok(d.metrics.vwap.absoluteDelta>0);
});

test('known recursive-origin sensitivity separates minimum availability, flat-RSI state and context-only EMA800',()=>{
 const bars=Array.from({length:4500},(_,i)=>{const c=i<3300?100+i*.02+Math.sin(i/9):200;return{t:START+i*STEP,o:c-.1,c,h:c+.5,l:c-.5,v:100}});
 const ref=snap(bars),short=snap(bars.slice(-1000)),d=compareSnapshots(ref,short);
 assert.equal(short.metrics.ema800.state,'available');assert.ok(d.metrics.ema800.absoluteDelta>0);assert.equal(ref.metrics.rsi14.state,'ready');assert.equal(short.metrics.rsi14.state,'undefined-no-change');assert.equal(short.metrics.rsi14.value,null);
 assert.equal(d.metrics.rsi14.deltaInReferenceAtr,null);assert.equal(d.metrics.ema800.unit,'price');assert.ok(d.causes.some(c=>c.includes('context-only')));
 const minimum=snap(timed(randomBars(24,60)));assert.equal(minimum.metrics.ema50.state,'available');assert.equal(minimum.metrics.ema800.value,null);assert.equal(minimum.decision.validity.ready,true);
});

test('short history loses eligible old targets without a future leak',()=>{
 const bars=Array.from({length:500},(_,i)=>{if(i===300)return{t:START+i*STEP,o:104,c:103,h:104.5,l:102.5,v:10000};const c=i===499?96:100;return{t:START+i*STEP,o:c-.1,c,h:c+.5,l:c-.5,v:100}});
 const full=snap(bars),short=snap(bars.slice(-60));assert.ok(full.zones.LONG.length>short.zones.LONG.length);assert.equal(compareSnapshots(full,short).disagreements.eligibleTargetState,true);
 assert.ok(full.zones.LONG.some(z=>z.openTime===bars[300].t));assert.equal(full.decision.side,'LONG');assert.equal(short.decision.side,'WAIT');assert.equal(compareSnapshots(full,short).disagreements.eligibility,true);
 const extended=snap([...bars,{t:START+500*STEP,o:104.9,c:105,h:105.5,l:104.5,v:100}],bars.at(-1).t);assert.deepEqual(causalDifference(full,extended),[]);
});

test('M/W confirmation and future supersession are projected as known at t, not raw future caches',()=>{
 for(const original of [replacementFixture(),reflect(replacementFixture())]){
  const bars=timed(original),a=createAdapter();a.load(bars.slice(0,94));const before=a.snapshot(bars[93].t);assert.ok(before.mw.some(e=>e.pivotOpenTime===bars[90].t&&e.confirmedCloseTime===bars[93].t+STEP&&e.active));
  a.load(bars);const after=a.snapshot(bars[93].t);assert.deepEqual(causalDifference(before,after),[]);const later=a.snapshot(bars[100].t);assert.ok(later.mw.some(e=>e.pivotOpenTime===bars[90].t&&!e.active&&e.supersededCloseTime===bars[100].t+STEP));
  assert.ok(!a.snapshot(bars[92].t).mw.some(e=>e.pivotOpenTime===bars[90].t));
 }
});

test('causality detector flags deliberately altered votes/values, separately from seed drift',()=>{
 const bars=timed(randomBars(8,400)),s=snap(bars),changed=structuredClone(s);changed.decision.side='LONG';changed.metrics.ema50.value+=1;
 assert.deepEqual(causalDifference(s,changed),['metrics','decision']);
 const shorter=snap(bars.slice(-60));assert.throws(()=>causalDifference(s,shorter),/history origin/);assert.ok(compareSnapshots(s,shorter).metrics.ema50.absoluteDelta>0);
 const r=numericDifference({state:'available',value:10},{state:'available',value:12},'price',2);assert.equal(r.deltaInReferenceAtr,1);assert.equal(numericDifference({state:'ready',value:50},{state:'ready',value:52},'RSI-points',2).deltaInReferenceAtr,null);
});

test('compact generated synthetic audit covers every window, fixed-origin future checks, and bounded sampling',()=>{
 const bars=timed(randomBars(19,4400)),r=runAudit(bars,[bars[4031].t+STEP]);assert.equal(r.sample.length,1);assert.equal(r.causality.failures.length,0);assert.equal(r.causality.checks,22);assert.deepEqual(Object.keys(r.summaryByWindow).map(Number),[60,100,300,1000,2000,4000]);assert.ok(r.source.applicationSha256===protocol.applicationSha256);
 assert.throws(()=>runAudit(bars,Array(25).fill(bars[4031].t+STEP)));assert.equal(sampleTimes().length,24);assert.equal(new Set(sampleTimes()).size,24);assert.equal(sampleTimes()[0],Date.UTC(2026,6,15));assert.equal(sampleTimes().at(-1),Date.UTC(2026,8,30,23,55));
});

test('the real-data command validates CLI schema/hash before analysis and never accepts fabricated input',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hybrid-readiness-'));try{const file=path.join(dir,'bad.json');fs.writeFileSync(file,JSON.stringify({kind:'hybrid-acquisition-checkpoint'}));assert.throws(()=>loadVerifiedDataset(file),/Not a supported frozen dataset/)}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
