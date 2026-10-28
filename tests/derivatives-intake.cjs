'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),sync=require('node:fs'),path=require('node:path');
const D=require('../research/derivatives.cjs'),spot=require('../research/klines.cjs');
const ROOT=process.env.HYBRID_QA_DIR||path.resolve('.qa-results/derivatives-intake-fixtures'),C=D.config({end:D.START+4*D.STEP});
const row=t=>[t,'100.00','102.00','99.00','101.00','10.000',t+D.STEP-1,'1000.000',4,'4.000','400.000','0'];
const metadata=()=>({futuresType:'U_MARGINED',timezone:'UTC',serverTime:0,symbols:[{symbol:'BTCUSDT',pair:'BTCUSDT',contractType:'PERPETUAL',baseAsset:'BTC',quoteAsset:'USDT',marginAsset:'USDT',underlyingType:'COIN',onboardDate:Date.UTC(2019,8,8),status:'TRADING',filters:[{filterType:'LOT_SIZE',stepSize:'0.001'}]}]});
const event=(time,type='Regular')=>({symbol:'BTCUSDT',fundingTime:time,fundingRate:'-0.00001230',markPrice:'100.0000',...(type===null?{}:{rateType:type}),extra:{kept:true}});
async function directory(){await fs.mkdir(ROOT,{recursive:true});return path.join(await fs.mkdtemp(path.join(ROOT,'case-')),'bundle')}
function transport({cutoff=D.END+86400000,funding=[event(D.START)],change=()=>{},responses=[],fail=()=>null}={}){
 const requests=[],waits=[];const fetch=async url=>{const u=new URL(url);requests.push(u);const failed=fail(u,requests.length);if(failed)throw failed;
  if(responses.length){const response=responses.shift();if(response)return response}
  let data;
  if(u.pathname.endsWith('/time'))data={serverTime:cutoff};else if(u.pathname.endsWith('/exchangeInfo'))data=metadata();else{
   const a=+u.searchParams.get('startTime'),b=+u.searchParams.get('endTime'),limit=+u.searchParams.get('limit');
   if(u.pathname.endsWith('/fundingRate'))data=funding.filter(r=>r.fundingTime>=a&&r.fundingTime<=b).slice(0,limit);
   else{data=[];for(let t=a;t<=b&&data.length<limit;t+=D.STEP){const r=row(t);if(u.pathname.endsWith('/markPriceKlines')){for(const i of [5,7,9,10,11])r[i]='0';r[8]=300}data.push(r)}}
  }
  change(data,u);return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
 };
 return{fetch,now:()=>D.END+86400000,wait:async ms=>{waits.push(ms)},requests,waits};
}
const read=async(out,file)=>JSON.parse(await fs.readFile(path.join(out,file),'utf8'));
test('exact primitive contract/range configuration fails before FS/network activity',async()=>{
 const out=await directory();let calls=0;
 for(const input of [{symbol:['BTCUSDT']},{timeframe:['5m']},{timeframe:'constructor'},{symbol:'BTCUSD_PERP'},{baseUrl:'https://api.binance.com'},{start:D.START,end:D.START}])await assert.rejects(D.acquire({...input,out},{fetch:async()=>{calls++}}));
 assert.equal(calls,0);assert.equal(sync.existsSync(out),false);
 for(const key of ['contractType','baseAsset','marginAsset','quoteAsset','pair']){const m=metadata();m.symbols[0][key]='wrong';assert.throws(()=>D.contract(m))}
 const m=metadata();m.futuresType='COIN_MARGINED';assert.throws(()=>D.contract(m));
});
test('trade fields and Mark placeholders retain distinct units and exact decimals',()=>{
 const trade=D.payload(C,'trade',[row(D.START)]),mark=D.payload(C,'mark',[row(D.START)]);assert.notEqual(D.hash(trade),D.hash(mark));assert.equal(mark.source.volume,undefined);assert.match(mark.source.nonPriceFields,/not volume/);
 const zero=row(D.START);zero[5]='0';zero[9]='0';assert.deepEqual(D.rowErrors(zero,'trade'),[]);zero[9]='0.000000000000000001';assert.ok(D.rowErrors(zero,'trade').length);assert.deepEqual(D.rowErrors(zero,'mark'),[]);
 assert.throws(()=>spot.verify({kind:'hybrid-usdm-public-series',payload:trade}));
});
test('grid quality reports full expected counts, missing gaps, duplicates and conflicts',()=>{
 const a=row(D.START),b=row(D.START+2*D.STEP),other=[...a];other[4]='100.50';const p=D.payload(C,'trade',[a,b,other]);const q=D.quality(p,D.END,{retrievalComplete:true});assert.equal(q.expectedRows,4);assert.equal(q.missingRows,2);assert.equal(q.duplicateRows,1);assert.equal(q.conflictingRows,1);assert.equal(q.state,'invalid');
 const empty=D.quality(D.payload(C,'mark',[]),D.END,{retrievalComplete:true});assert.equal(empty.state,'incomplete');assert.equal(empty.validUniqueTimes,0);assert.equal(empty.missingRows,4);assert.ok(Number.isFinite(empty.expectedRows));
});
test('signed funding and absent metadata remain intact; distinct same-time types survive',()=>{
 const events=[event(D.START,'Regular'),event(D.START,'Special'),event(D.START,null)];delete events[2].markPrice;
 const p=D.payload(C,'funding',events),q=D.quality(p,D.END,{retrievalComplete:true});assert.equal(q.state,'retrieved');assert.equal(q.rowCount,3);assert.equal(q.observedUniqueTimes,1);assert.equal(q.missingRateType,1);assert.equal(q.missingAssociatedMark,1);assert.equal(q.expectedEvents,null);assert.equal(q.calendarCompleteness,'unknown-no-historical-calendar');assert.equal(p.rows[0].fundingRate,'-0.00001230');assert.deepEqual(p.rows[0].extra,{kept:true});assert.equal(Object.hasOwn(p.rows.find(r=>!Object.hasOwn(r,'rateType')),'markPrice'),false);
 const duplicate=D.quality(D.payload(C,'funding',[event(D.START),event(D.START)]),D.END,{retrievalComplete:true});assert.equal(duplicate.duplicateRows,1);assert.equal(duplicate.state,'invalid');
 const changed=event(D.START);changed.fundingRate='0.00001000';assert.equal(D.quality(D.payload(C,'funding',[event(D.START),changed]),D.END,{retrievalComplete:true}).conflictingRows,1);
 const empty=D.quality(D.payload(C,'funding',[]),D.END,{retrievalComplete:true});assert.equal(empty.state,'retrieved');assert.equal(empty.rowCount,0);assert.equal(empty.expectedEvents,null);assert.equal(empty.absentEventsAreZero,false);
 const bad=event(D.START);bad.fundingRate='NaN';assert.ok(D.rowErrors(bad,'funding').length);bad.fundingRate='0';bad.rateType=null;assert.ok(D.rowErrors(bad,'funding').length);
});
test('independent1001-row pagination and immutable output round trip',async()=>{
 const out=await directory(),end=D.START+1001*D.STEP,t=transport();const result=await D.acquire({out,end},t);assert.equal(result.state,'verified');for(const s of ['trade','mark'])assert.equal(result.series[s].quality.rowCount,1001);
 const requests=t.requests.filter(u=>u.pathname.endsWith('/klines'));assert.equal(requests.length,2);assert.equal(+requests[1].searchParams.get('startTime'),D.START+1000*D.STEP);assert.equal(+requests[0].searchParams.get('endTime'),D.START+1000*D.STEP-1);
 assert.equal((await D.verify(out)).dataBundleHash,result.dataBundleHash);const bytes=await fs.readFile(path.join(out,'bundle.json'),'utf8');await assert.rejects(D.acquire({out,end},t),/already exists/);assert.equal(await fs.readFile(path.join(out,'bundle.json'),'utf8'),bytes);
 const snapshot=await read(out,'metadata.json');assert.match(snapshot.payload.interpretation,/never historical/);assert.equal(snapshot.payload.selectedContract.baseAsset,'BTC');assert.equal(snapshot.payload.verifiedUnits.contractUnit,'1 BTC');
});
test('funding full pages split time ranges without losing same-time event types',async()=>{
 const funding=Array.from({length:1000},(_,i)=>event(D.START+(i<500?0:D.STEP),'type'+i)),out=await directory(),t=transport({funding});const result=await D.acquire({out,end:C.endExclusive},t);
 assert.equal(result.series.funding.quality.rowCount,1000);assert.equal(result.series.funding.quality.observedUniqueTimes,2);assert.equal(result.series.funding.quality.retrievalComplete,true);assert.ok(t.requests.filter(u=>u.pathname.endsWith('/fundingRate')).length>1);assert.throws(()=>D.splitWindow(D.START,D.START+1),/ambiguous/);
});
test('cutoff excludes developing klines without shortening the requested denominator',async()=>{
 const out=await directory(),t=transport({cutoff:D.START+2*D.STEP+1000,funding:[]});const r=await D.acquire({out,end:C.endExclusive},t);assert.equal(r.state,'incomplete');const q=r.series.trade.quality;assert.equal(q.rowCount,2);assert.equal(q.expectedRows,4);assert.equal(q.excludedDevelopingOrFutureRows,2);assert.equal(q.missingRows,2);assert.equal(r.series.funding.quality.state,'incomplete');
 assert.ok(t.requests.filter(u=>u.pathname.endsWith('Klines')||u.pathname.endsWith('/klines')).every(u=>+u.searchParams.get('endTime')===D.START+2*D.STEP-1));
});
test('interrupted page checkpoints resume same source/range with no duplicates',async()=>{
 const out=await directory(),abort=new AbortController(),end=D.START+1001*D.STEP;
 await assert.rejects(D.acquire({out,end},{...transport(),signal:abort.signal,onPage:p=>{if(p.series==='trade')abort.abort()}}),/Cancelled/);
 const cp=await read(out,'checkpoint.json');assert.equal(cp.pages.trade.rows.length,1000);assert.equal(cp.status,'incomplete');const t=transport(),r=await D.acquire({out,end,resume:true},t);assert.equal(r.state,'verified');assert.equal(r.series.trade.quality.duplicateRows,0);assert.equal(r.series.trade.quality.rowCount,1001);assert.equal(+t.requests.find(u=>u.pathname.endsWith('/klines')).searchParams.get('startTime'),D.START+1000*D.STEP);
});
test('malformed/wrong-contract checkpoints are rejected even with recomputed checksum',async()=>{
 const out=await directory(),abort=new AbortController();await assert.rejects(D.acquire({out,end:C.endExclusive},{...transport(),signal:abort.signal,onPage:()=>abort.abort()}));
 const cp=await read(out,'checkpoint.json');cp.contract.marginAsset='BTC';const {checkpointHash,...rest}=cp;cp.checkpointHash=D.hash(rest);await fs.writeFile(path.join(out,'checkpoint.json'),D.canonical(cp));let calls=0;await assert.rejects(D.acquire({out,end:C.endExclusive,resume:true},{fetch:async()=>{calls++}}));assert.equal(calls,0);
});
test('stale checkpoint cutoff is terminal rather than silently refreshed',async()=>{
 const out=await directory(),abort=new AbortController();await assert.rejects(D.acquire({out,end:C.endExclusive},{...transport(),signal:abort.signal,onPage:()=>abort.abort()}));
 await assert.rejects(D.acquire({out,end:C.endExclusive,resume:true},transport({cutoff:D.END+2*86400000+1})),/Stale/);assert.equal((await read(out,'checkpoint.json')).lastError.resumable,false);
});
test('429 cooldown, bounded5xx/network retries, and access restriction stop',async()=>{
 const out=await directory(),t=transport({responses:[new Response('{}',{status:429,headers:{'retry-after':'2'}})]});assert.equal((await D.acquire({out,end:C.endExclusive},t)).state,'verified');assert.ok(t.waits.includes(2000));
 for(const status of [418,451]){const target=await directory(),f=transport({responses:[new Response('{}',{status})]});await assert.rejects(D.acquire({out:target,end:C.endExclusive},f),/access unavailable/);assert.equal(f.requests.length,1);assert.equal(sync.existsSync(path.join(target,'bundle.json')),false)}
 const target=await directory(),f=transport({responses:Array.from({length:3},()=>new Response('{}',{status:503}))});await assert.rejects(D.acquire({out:target,end:C.endExclusive},f),/retries exhausted/);assert.equal(f.requests.length,3);assert.equal((await read(target,'checkpoint.json')).lastError.resumable,true);
 const network=await directory(),n=transport({fail:()=>new TypeError('Injected network failure')});await assert.rejects(D.acquire({out:network,end:C.endExclusive},n),/retries exhausted/);assert.equal(n.requests.length,3);
 const cooldown=await directory(),c=transport({responses:[new Response('{}',{status:429,headers:{'retry-after':'120'}})]});await assert.rejects(D.acquire({out:cooldown,end:C.endExclusive},c),/bounded wait/);assert.equal(c.requests.length,1);
});
test('rejected page/metadata retained, no invalid bundle or Spot fallback',async()=>{
 for(const kind of ['duplicate','wrong-contract','bad-json']){const out=await directory(),t=transport({change:(d,u)=>{if(kind==='duplicate'&&u.pathname.endsWith('/klines'))d.push([...d.at(-1)]);if(kind==='wrong-contract'&&u.pathname.endsWith('/exchangeInfo'))d.symbols[0].quoteAsset='USDC'},responses:kind==='bad-json'?[new Response('{bad',{status:200})]:[]});await assert.rejects(D.acquire({out,end:C.endExclusive},t));assert.equal(sync.existsSync(path.join(out,'bundle.json')),false);assert.equal((await read(out,'checkpoint.json')).status,'incomplete');assert.ok((await fs.readdir(path.join(out,'responses'))).length);assert.ok(t.requests.every(u=>u.origin==='https://fapi.binance.com'))}
});
test('data hashes ignore current metadata timestamps; unknown funding fields hash faithfully',async()=>{
 const a=await directory(),b=await directory();const first=await D.acquire({out:a,end:C.endExclusive},transport()),second=await D.acquire({out:b,end:C.endExclusive},{...transport(),now:()=>D.END+86400100});assert.equal(first.dataBundleHash,second.dataBundleHash);assert.notEqual(first.metadataHash,second.metadataHash);
 const p=D.payload(C,'funding',[event(D.START)]),changed=JSON.parse(JSON.stringify(p));changed.rows[0].extra.kept=false;assert.notEqual(D.hash(p),D.hash(changed));
 const doc=await read(a,'trade.json');doc.payload.contract.marginAsset='BTC';doc.dataHash=D.hash(doc.payload);assert.throws(()=>D.verifySeries(doc),/identity/);
});
test('all historical pilot sealed dependencies and frozen Spot schema remain exact',()=>{
 const seal=JSON.parse(sync.readFileSync('research/policy-pilot/seal.json','utf8'));
 for(const [file,expected]of Object.entries(seal.identities.implementationChecksums))assert.equal(D.sha(sync.readFileSync(file)),expected,file+' must remain verifiable under historical seal');
 assert.equal(D.sha(sync.readFileSync('research/klines.cjs')),'50104e76ec7209b058bc26f129d42ed59d615ed2f48efb0e4454e481287c1b1d');assert.equal(D.sha(sync.readFileSync('research/SCHEMA.md')),'041a8f3841ebb3859f8c1e680ddcb0a29e5ee846828372841785721f2e61a74a');
});
