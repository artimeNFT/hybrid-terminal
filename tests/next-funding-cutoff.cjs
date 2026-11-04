'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp}=require('./app-harness.cjs'),F=require('./perpetual-context-fixtures.cjs'),{bars}=require('./target-path-fixtures.cjs');
const BASE='baseline/hybrid-terminal.0.4.24.html',CUTOFF=Date.parse('2026-11-04T10:00:00Z'),SOURCE=Date.parse('2026-11-04T07:55:00Z'),PAST=Date.parse('2026-11-04T08:00:00Z'),FUTURE=Date.parse('2026-11-04T11:00:00Z'),RECEIPT=Date.parse('2026-11-04T12:00:00Z'),CTX={product:'usdm',symbol:'BTCUSDT',timeframe:'5m',epoch:1};
function fixture(source=SOURCE,next=PAST){const r=F.results();r.premium.raw.time=source;r.premium.raw.nextFundingTime=next;r.premium.receivedAt=RECEIPT;return r}
function project(a,r,...cutoffs){const cutoff=cutoffs.length?cutoffs[0]:CUTOFF;a.set('__r',r);a.set('__cutoff',cutoff);a.set('__ctx',CTX);return a.read('perpetualNowProjection(__ctx,__r,__cutoff)')}
function withoutNext(f){const {nextFunding,...rest}=f;return rest}
test('reproduced stale07:55 source/08:00 schedule at10:00 cutoff is unavailable; original baseline demonstrates defect',async()=>{
 const a=await openApp(),old=await openApp({file:BASE}),r=fixture(),bytes=JSON.stringify(r),p=project(a,r),original=project(old,r);assert.equal(original.nextFunding.state,'captured');assert.equal(p.nextFunding.state,'unavailable');assert.equal(p.nextFunding.value,null);assert.equal(p.nextFunding.sourceTime,SOURCE);assert.equal(p.nextFunding.receivedAt,RECEIPT);assert.equal(p.nextFunding.endpoint,r.premium.url);assert.equal(JSON.stringify(r),bytes);assert.deepEqual(withoutNext(p),withoutNext(original));
});
test('equal-cutoff and earlier schedules are rejected; strictly future schedule qualifies',async()=>{
 const a=await openApp();for(const t of [PAST,CUTOFF-1,CUTOFF])assert.equal(project(a,fixture(SOURCE,t)).nextFunding.state,'unavailable');for(const t of [CUTOFF+1,FUTURE]){const f=project(a,fixture(SOURCE,t)).nextFunding;assert.equal(f.state,'captured');assert.equal(f.value,t);assert.equal(f.scheduledTime,t)}
});
test('unknown/invalid cutoffs never fall back to premium source or receipt/device time; independent fields match baseline',async()=>{
 const a=await openApp(),old=await openApp({file:BASE});for(const cutoff of [null,undefined,NaN,Infinity,-1,1.5,String(CUTOFF),false,[],{}]){const r=fixture(SOURCE,FUTURE),f=project(a,r,cutoff);assert.equal(f.nextFunding.state,'unavailable');assert.equal(f.nextFunding.value,null);assert.equal(f.nextFunding.sourceTime,SOURCE);assert.equal(f.nextFunding.receivedAt,RECEIPT);assert.deepEqual(withoutNext(f),withoutNext(project(old,r,cutoff)))}
});
test('supplied source time is a second strict bound, not a substitute for the cutoff',async()=>{
 const a=await openApp();for(const source of [FUTURE,FUTURE+1,'invalid',Infinity])assert.equal(project(a,fixture(source,FUTURE)).nextFunding.state,'unavailable');assert.equal(project(a,fixture(FUTURE-1,FUTURE)).nextFunding.state,'captured');
});
test('missing source time can qualify against a valid cutoff and remains UNKNOWN despite later device receipt',async()=>{
 const a=await openApp();a.exec('Date.now=()=>Date.UTC(2030,0,1)');for(const source of [null,undefined]){const r=fixture(source,FUTURE);if(source===undefined)delete r.premium.raw.time;const f=project(a,r).nextFunding;assert.equal(f.state,'captured');assert.equal(f.value,FUTURE);assert.equal(f.sourceTime,null);assert.equal(f.receivedAt,RECEIPT);assert.ok(f.value<f.receivedAt)}
});
test('only projection body changes; raw rejected schedule remains inspectable without network/storage or engine changes',async()=>{
 const old=await openApp({file:BASE,bars:bars()}),a=await openApp({bars:bars(),localStorage:{...old.localStorage}}),names=[...fs.readFileSync(BASE,'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);assert.deepEqual(names.filter(n=>a.read(n+'.toString()')!==old.read(n+'.toString()')),['perpetualNowProjection']);
 const snapshot=x=>x.read('({sig:S.sig,bt:S.bt,z:S.z,k:S.k,journal:localStorage[JOURNAL_KEY],rules:[RULE_VERSION,EXECUTION_VERSION,RSI_POLICY]})');assert.deepEqual(snapshot(a),snapshot(old));const before=snapshot(a),stored={...a.localStorage},requests=a.requests.length,r=fixture();
 a.set('__results',r);a.exec('S.product="usdm";syncPerpetualContext();Object.assign(PERP_NOW,{results:__results,cutoff:Date.parse("2026-11-04T10:00:00Z"),requests:7});renderPerpetualContext()');assert.match(a.element('perpfields').innerHTML,/data-perp-field="nextFunding" data-state="unavailable"/);const detail=JSON.parse(a.element('perpexact').textContent);assert.equal(detail.raw.premium.raw.nextFundingTime,PAST);assert.equal(detail.raw.premium.raw.time,SOURCE);assert.equal(detail.raw.premium.receivedAt,RECEIPT);assert.equal(detail.fields.nextFunding.sourceTime,SOURCE);assert.equal(detail.fields.nextFunding.receivedAt,RECEIPT);assert.equal(a.requests.length,requests);assert.deepEqual(a.localStorage,stored);assert.deepEqual(snapshot(a),before);
});
