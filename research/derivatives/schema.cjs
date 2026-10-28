'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
// Only these immutable Spot helpers have matching decimal semantics. No Spot schema extension.
const {decimal,compare,utc,TOOL_VERSION}=require('../klines.cjs');assert.equal(TOOL_VERSION,'1.0.1');
const VERSION='1.0.0',SCHEMA='hybrid-binance-usdm-public/v1',BASE='https://fapi.binance.com',STEP=300000,START=Date.UTC(2026,6,1),END=Date.UTC(2026,9,1);
const CONTRACT=Object.freeze({venue:'BINANCE',market:'USD-M',symbol:'BTCUSDT',pair:'BTCUSDT',contractType:'PERPETUAL',baseAsset:'BTC',quoteAsset:'USDT',marginAsset:'USDT',settlementAsset:'USDT',payoff:'linear',contractUnit:'1 BTC',priceUnit:'USDT/BTC',quantityUnit:'BTC'});
const SERIES=Object.freeze({trade:{endpoint:'/fapi/v1/klines',interval:'5m',prices:'USDT/BTC',volume:'BTC',quoteVolume:'USDT',takerVolumes:'BTC and USDT',rawFields:12},mark:{endpoint:'/fapi/v1/markPriceKlines',interval:'5m',prices:'USDT/BTC',nonPriceFields:'opaque placeholders; not volume, taker flow or trade counts',rawFields:12},funding:{endpoint:'/fapi/v1/fundingRate',interval:null,rateUnit:'signed fraction per returned event',associatedMarkUnit:'USDT/BTC',calendar:'not assumed'}});
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
function canonical(value){function visit(v,depth=0){assert.ok(depth<24,'JSON nesting limit');if(v===null||typeof v==='string'||typeof v==='boolean')return v;if(typeof v==='number'){assert.ok(Number.isFinite(v),'Nonfinite number');return v}if(Array.isArray(v))return v.map(x=>visit(x,depth+1));assert.ok(plain(v),'JSON object required');return Object.fromEntries(Object.keys(v).sort().map(k=>[k,visit(v[k],depth+1)]))}return JSON.stringify(visit(value))}
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex'),hash=value=>sha(canonical(value));
function config({symbol='BTCUSDT',timeframe='5m',start=START,end=END,baseUrl=BASE}={}){
 assert.ok(typeof symbol==='string'&&symbol==='BTCUSDT'&&typeof timeframe==='string'&&timeframe==='5m','Only primitive BTCUSDT/5m reference supported');assert.equal(baseUrl,BASE,'Exact official base required');
 const a=typeof start==='string'?utc(start):start,b=typeof end==='string'?utc(end):end;
 assert.ok(Number.isSafeInteger(a)&&Number.isSafeInteger(b)&&a>=START&&b<=END&&b>a&&a%STEP===0&&b%STEP===0,'Aligned nonempty UTC range within declared Q3 required');
 return{symbol,timeframe,startInclusive:a,endExclusive:b,baseUrl,pageSize:1000};
}
function cutoff(t){assert.ok(Number.isSafeInteger(t)&&t>=START&&t<Date.UTC(2100,0,1),'Invalid server cutoff');return t}
function contract(metadata){assert.ok(plain(metadata)&&metadata.futuresType==='U_MARGINED'&&metadata.timezone==='UTC'&&Array.isArray(metadata.symbols),'USD-M exchange snapshot required');const found=metadata.symbols.filter(s=>s?.symbol==='BTCUSDT');assert.equal(found.length,1,'Unique BTCUSDT required');const s=found[0];for(const k of ['symbol','pair','contractType','baseAsset','quoteAsset','marginAsset'])assert.equal(s[k],CONTRACT[k],'Wrong contract '+k);assert.equal(s.underlyingType,'COIN');assert.ok(Number.isSafeInteger(s.onboardDate)&&s.onboardDate<=START,'Reference existed before requested range');return s}
function price(s){decimal(s);assert.ok(compare(s,'0')>0,'Positive decimal price required')}
function rowErrors(row,series){const errors=[];try{
 assert.ok(Object.hasOwn(SERIES,series),'Unknown series');
 if(series==='funding'){
  assert.ok(plain(row)&&row.symbol==='BTCUSDT','Wrong funding symbol/object');assert.ok(Number.isSafeInteger(row.fundingTime)&&row.fundingTime>=START&&row.fundingTime<END,'Invalid funding timestamp');
  assert.ok(typeof row.fundingRate==='string'&&row.fundingRate.length<=129&&/^-?(0|[1-9]\d*)(\.\d+)?$/.test(row.fundingRate),'Signed decimal funding rate required');decimal(row.fundingRate.replace(/^-/,''));
  // Missing event metadata remains absent; present malformed fields are rejected, never defaulted.
  if(Object.hasOwn(row,'markPrice'))price(row.markPrice);
  if(Object.hasOwn(row,'rateType'))assert.ok(typeof row.rateType==='string'&&row.rateType.length>0&&row.rateType.length<=128,'Invalid rateType');
  canonical(row); // Preserve every returned JSON field, including unknown future fields.
 }else{
  assert.ok(Array.isArray(row)&&row.length===12,'Exactly12 raw fields required');
  for(const i of [0,6,8])assert.ok(Number.isSafeInteger(row[i])&&row[i]>=0,'Nonnegative safe integer field '+i);
  assert.ok(row[0]>=START&&row[0]<END&&row[0]%STEP===0&&row[6]===row[0]+STEP-1,'Open/close grid mismatch');
  for(const i of [1,2,3,4])price(row[i]);for(const i of [5,7,9,10,11])decimal(row[i]);
  assert.ok(compare(row[2],row[1])>=0&&compare(row[2],row[4])>=0&&compare(row[3],row[1])<=0&&compare(row[3],row[4])<=0&&compare(row[2],row[3])>=0,'Invalid OHLC geometry');
  if(series==='trade')assert.ok(compare(row[9],row[5])<=0&&compare(row[10],row[7])<=0,'Taker volume exceeds total');
 }
 }catch(e){errors.push(e.message)}return errors}
const timestamp=(r,s)=>s==='funding'?r?.fundingTime:r?.[0];
const eventKey=r=>canonical([r.symbol,r.fundingTime,Object.hasOwn(r,'rateType')?['present',r.rateType]:['absent']]);
function orderRows(rows,series){return [...rows].sort((a,b)=>timestamp(a,series)-timestamp(b,series)||(series==='funding'?(eventKey(a)<eventKey(b)?-1:eventKey(a)>eventKey(b)?1:0):0))}
function payload(c,series,rows){assert.ok(typeof series==='string'&&Object.hasOwn(SERIES,series));config({symbol:c.symbol,timeframe:c.timeframe,start:c.startInclusive,end:c.endExclusive,baseUrl:c.baseUrl});return{schema:SCHEMA,contract:{...CONTRACT},series,source:{baseUrl:BASE,...SERIES[series],timeZone:'UTC',timestampUnit:'ms'},range:{startInclusive:c.startInclusive,endExclusive:c.endExclusive},rows:orderRows(rows,series)}}
function validatePayload(p){assert.ok(plain(p));assert.equal(p.schema,SCHEMA);assert.ok(typeof p.series==='string'&&Object.hasOwn(SERIES,p.series));assert.ok(Array.isArray(p.rows)&&p.rows.length<=100000,'Bounded rows required');const c=config({start:p.range?.startInclusive,end:p.range?.endExclusive});assert.equal(canonical(p),canonical(payload(c,p.series,p.rows)),'Payload identity/schema/order mismatch');return c}
function quality(p,serverCutoff,{retrievalComplete=false}={}){
 const c=validatePayload(p),s=p.series;cutoff(serverCutoff);const errors=[],duplicates=[],seen=new Map(),times=new Set();let issues=0,conflicts=0,duplicateRows=0;
 const issue=(index,message)=>{issues++;if(errors.length<100)errors.push({index,message})};
 p.rows.forEach((r,index)=>{rowErrors(r,s).forEach(e=>issue(index,e));const t=timestamp(r,s);if(!Number.isSafeInteger(t))return;
  if(t<c.startInclusive||t>=c.endExclusive)issue(index,'Outside requested range');if(s==='funding'?t>=serverCutoff:r[6]>=serverCutoff)issue(index,'Developing/future row');
  const key=s==='funding'?eventKey(r):String(t),value=canonical(r);
  if(seen.has(key)){duplicateRows++;const conflict=seen.get(key)!==value;if(conflict)conflicts++;if(duplicates.length<100)duplicates.push({index,key,conflict});issue(index,conflict?'Conflicting duplicate':'Duplicate identity')}else seen.set(key,value);
  if(!rowErrors(r,s).length&&t>=c.startInclusive&&t<c.endExclusive&&(s==='funding'?t<serverCutoff:r[6]<serverCutoff))times.add(t);
 });
 const sorted=[...times].sort((a,b)=>a-b),common={rowCount:p.rows.length,uniqueIdentities:seen.size,duplicateRows,conflictingRows:conflicts,duplicates,issueCount:issues,issues:errors,issuesTruncated:issues>errors.length,firstTime:sorted[0]??null,lastTime:sorted.at(-1)??null,retrievalComplete};
 if(s==='funding'){
  const spacings=[];for(let i=1;i<sorted.length;i++)spacings.push(sorted[i]-sorted[i-1]);
  const typeCounts=new Map();for(const row of p.rows){const key=Object.hasOwn(row,'rateType')?'present:'+row.rateType:'absent';typeCounts.set(key,(typeCounts.get(key)||0)+1)}
  return{...common,state:issues?'invalid':retrievalComplete&&serverCutoff>=c.endExclusive?'retrieved':'incomplete',requestedRangeFullyPastCutoff:serverCutoff>=c.endExclusive,calendarCompleteness:'unknown-no-historical-calendar',expectedEvents:null,absentEventsAreZero:false,
   observedUniqueTimes:sorted.length,observedSpacingMs:{min:spacings.length?spacings.reduce((a,b)=>Math.min(a,b)):null,max:spacings.length?spacings.reduce((a,b)=>Math.max(a,b)):null,distinct:[...new Set(spacings)].sort((a,b)=>a-b)},
   missingAssociatedMark:p.rows.filter(r=>!Object.hasOwn(r,'markPrice')).length,missingRateType:p.rows.filter(r=>!Object.hasOwn(r,'rateType')).length,
   eventTypes:Object.fromEntries([...typeCounts].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0))};
 }
 const gaps=[];let cursor=c.startInclusive;for(const t of sorted){if(t>cursor)gaps.push({startInclusive:cursor,endExclusive:t,missingRows:(t-cursor)/STEP});cursor=t+STEP}if(cursor<c.endExclusive)gaps.push({startInclusive:cursor,endExclusive:c.endExclusive,missingRows:(c.endExclusive-cursor)/STEP});
 const expectedRows=(c.endExclusive-c.startInclusive)/STEP,missingRows=gaps.reduce((n,g)=>n+g.missingRows,0),eligibleEnd=Math.max(c.startInclusive,Math.min(c.endExclusive,Math.floor(serverCutoff/STEP)*STEP));
 assert.ok([expectedRows,missingRows,sorted.length].every(n=>Number.isSafeInteger(n)&&n>=0)&&expectedRows>0&&sorted.length+missingRows===expectedRows,'Nonfinite/empty coverage');
 return{...common,state:issues?'invalid':retrievalComplete&&sorted.length===expectedRows&&p.rows.length===expectedRows?'complete':'incomplete',expectedRows,validUniqueTimes:sorted.length,missingRows,gaps,eligibleClosedRows:(eligibleEnd-c.startInclusive)/STEP,excludedDevelopingOrFutureRows:(c.endExclusive-eligibleEnd)/STEP};
}
function verifySeries(d){assert.ok(plain(d)&&d.kind==='hybrid-usdm-public-series'&&d.collectorVersion===VERSION,'Distinct derivatives dataset required');validatePayload(d.payload);assert.equal(hash(d.payload),d.dataHash,'Data hash mismatch');assert.ok(typeof d.acquisition?.retrievalComplete==='boolean');const q=quality(d.payload,d.acquisition.cutoffServerTime,{retrievalComplete:d.acquisition.retrievalComplete});assert.equal(canonical(q),canonical(d.quality),'Quality mismatch');return q}
module.exports={VERSION,SCHEMA,BASE,STEP,START,END,CONTRACT,SERIES,canonical,hash,sha,config,cutoff,contract,rowErrors,timestamp,eventKey,orderRows,payload,validatePayload,quality,verifySeries};
