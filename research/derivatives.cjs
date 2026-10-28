#!/usr/bin/env node
'use strict';
const fs=require('node:fs/promises'),sync=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{setTimeout:sleep}=require('node:timers/promises');
const S=require('./derivatives/schema.cjs');
const ROOT=path.resolve(__dirname,'..'),LIMITS=Object.freeze({attempts:3,requests:256,resumes:3,wallMs:900000,timeoutMs:15000,paceMs:1000,maxWaitMs:60000,maxBodyBytes:4000000,checkpointAgeMs:86400000});
const DOCS={api:'https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data',units:'https://www.binance.com/en-AE/support/faq/detail/360033161972'};
const fingerprint=()=>S.hash(Object.fromEntries(['research/derivatives.cjs','research/derivatives/schema.cjs','research/klines.cjs'].map(f=>[f,S.sha(sync.readFileSync(path.join(ROOT,f)))])));
const exists=async f=>{try{await fs.access(f);return true}catch(e){if(e.code==='ENOENT')return false;throw e}};
function failure(message,code='VALIDATION',resumable=false){return Object.assign(Error(message),{code,resumable})}
async function writeNew(file,value){const h=await fs.open(file,'wx');try{await h.writeFile(S.canonical(value));await h.sync()}finally{await h.close()}}
async function immutable(file,value){const bytes=S.canonical(value);if(await exists(file)){assert.equal(await fs.readFile(file,'utf8'),bytes,'Existing immutable artifact differs');return}await writeNew(file,value)}
async function save(out,cp){const {checkpointHash:_,...value}=cp;cp.checkpointHash=S.hash(value);const temp=path.join(out,'checkpoint.tmp-'+require('node:crypto').randomUUID());await writeNew(temp,cp);await fs.rename(temp,path.join(out,'checkpoint.json'))}
function effectiveEnd(c,t,series){return Math.max(c.startInclusive,Math.min(c.endExclusive,series==='funding'?t:Math.floor(t/S.STEP)*S.STEP))}
function coverage(windows,start,end){let cursor=start;for(const [a,b] of [...windows].sort((x,y)=>x[0]-y[0])){assert.equal(a,cursor,'Coverage window gap/overlap');assert.ok(Number.isSafeInteger(b)&&b>a&&b<=end);cursor=b}assert.equal(cursor,end,'Unfinished retrieval coverage')}
function splitWindow(a,b){assert.ok(b-a>1,'Funding saturated at one millisecond; completeness ambiguous, STOP');const middle=a+Math.floor((b-a)/2);return[[a,middle],[middle,b]]}
function checkpoint(cp,c){
 const {checkpointHash,...rest}=cp;assert.equal(S.hash(rest),checkpointHash,'Checkpoint hash mismatch');assert.equal(cp.kind,'hybrid-usdm-checkpoint');assert.equal(cp.collectorVersion,S.VERSION);assert.equal(cp.fingerprint,fingerprint(),'Stale collector/checkpoint source');
 assert.equal(S.canonical(cp.config),S.canonical(c),'Wrong checkpoint contract/range');assert.equal(S.canonical(cp.contract),S.canonical(S.CONTRACT));
 assert.ok(Number.isSafeInteger(cp.resumes)&&cp.resumes>=0&&cp.resumes<LIMITS.resumes);assert.ok(Array.isArray(cp.requests)&&cp.requests.length<=LIMITS.requests);
 assert.ok(['running','incomplete'].includes(cp.status),'Invalid checkpoint state');assert.ok(Number.isSafeInteger(cp.retryNotBefore)&&cp.retryNotBefore>=0);
 cp.requests.forEach((r,i)=>{assert.equal(r.sequence,i);assert.ok(['/fapi/v1/time','/fapi/v1/exchangeInfo',...Object.values(S.SERIES).map(s=>s.endpoint)].includes(r.endpoint));const url=new URL(S.BASE+r.endpoint);for(const [k,v]of Object.entries(r.parameters))url.searchParams.set(k,String(v));const observed=new URL(r.url);url.searchParams.sort();observed.searchParams.sort();assert.equal(url.href,observed.href,'Checkpoint endpoint/parameters mismatch');if(r.bodyFile){assert.equal(r.bodyFile,'responses/'+i+'.json');assert.match(r.bodySha256,/^[a-f0-9]{64}$/)}});
 if(cp.cutoff!==null)S.cutoff(cp.cutoff);if(cp.metadata){const selected=S.contract(cp.metadata.exchangeInfo);assert.equal(cp.metadata.kind,'hybrid-usdm-current-exchange-snapshot');assert.equal(S.canonical(selected),S.canonical(cp.metadata.selectedContract));assert.equal(S.canonical(cp.metadata.verifiedUnits),S.canonical(S.CONTRACT));assert.equal(cp.metadata.cutoffServerTime,cp.cutoff);assert.equal(S.hash(cp.metadata),cp.metadataHash)}
 for(const series of ['trade','mark']){
  const p=cp.pages[series],end=cp.cutoff===null?c.startInclusive:effectiveEnd(c,cp.cutoff,series);assert.ok(Number.isSafeInteger(p.cursor)&&p.cursor>=c.startInclusive&&p.cursor<=end&&p.cursor%S.STEP===0);coverage(p.windows,c.startInclusive,p.cursor);
  const q=S.quality(S.payload(c,series,p.rows),cp.cutoff??S.START);assert.equal(q.issueCount,0,'Invalid checkpoint rows');assert.ok(p.rows.every(r=>r[0]<p.cursor));
 }
 const funding=cp.pages.funding;const partitions=[...funding.pending,...funding.windows].sort((a,b)=>a[0]-b[0]);coverage(partitions,c.startInclusive,cp.cutoff===null?c.endExclusive:effectiveEnd(c,cp.cutoff,'funding'));
 const q=S.quality(S.payload(c,'funding',funding.rows),cp.cutoff??S.END);assert.equal(q.issueCount,0);assert.ok(funding.rows.every(r=>funding.windows.some(([a,b])=>r.fundingTime>=a&&r.fundingTime<b)),'Uncovered funding checkpoint event');
 return cp;
}
function retryAfter(value,now){if(value==null)return null;if(/^\d+(\.\d+)?$/.test(value))return Number(value)*1000;const date=Date.parse(value);return Number.isFinite(date)?Math.max(0,date-now):null}
async function body(response,max=LIMITS.maxBodyBytes){const chunks=[];let bytes=0;for await(const chunk of response.body){bytes+=chunk.byteLength;if(bytes>max)throw failure('Response body cap exceeded');chunks.push(Buffer.from(chunk))}return Buffer.concat(chunks).toString('utf8')}
async function acquire(input,deps={}){
 const c=S.config(input),out=path.resolve(input.out||'');assert.ok(input.out&&[path.join(ROOT,'research/datasets')+path.sep,path.join(ROOT,'.qa-results')+path.sep].some(prefix=>out.startsWith(prefix)),'Fresh ignored output directory required');
 if(await exists(path.join(out,'bundle.json')))throw failure('Immutable bundle already exists','EXISTS');
 if(await exists(out)&&!input.resume)throw failure('Output exists; explicit bounded resume required','EXISTS');
 let cp;if(input.resume){cp=checkpoint(JSON.parse(await fs.readFile(path.join(out,'checkpoint.json'),'utf8')),c);if(cp.lastError&&!cp.lastError.resumable)throw failure('Terminal source/validation failure; do not resume','TERMINAL')}
 await fs.mkdir(path.dirname(out),{recursive:true});const lock=await fs.open(out+'.lock','wx');let timer;
 const ownAbort=new AbortController(),signal=deps.signal?AbortSignal.any([deps.signal,ownAbort.signal]):ownAbort.signal;
 const fetcher=deps.fetch||fetch,wait=deps.wait||((ms)=>sleep(ms,undefined,{signal})),now=deps.now||Date.now;
 const check=()=>{if(signal.aborted)throw failure('Cancelled or acquisition wall cap reached','CANCELLED',true)};
 try{
  timer=setTimeout(()=>ownAbort.abort(),LIMITS.wallMs);
  if(!cp){await fs.mkdir(out);cp={kind:'hybrid-usdm-checkpoint',collectorVersion:S.VERSION,fingerprint:fingerprint(),config:c,contract:{...S.CONTRACT},createdAt:new Date(now()).toISOString(),status:'running',resumes:0,cutoff:null,metadata:null,metadataHash:null,retryNotBefore:0,requests:[],pages:{trade:{cursor:c.startInclusive,rows:[],windows:[]},mark:{cursor:c.startInclusive,rows:[],windows:[]},funding:{pending:[[c.startInclusive,c.endExclusive]],windows:[],rows:[]}}}}
  else{cp.resumes++;cp.status='running';delete cp.lastError}
  await fs.mkdir(path.join(out,'responses'),{recursive:true});await save(out,cp);
  async function request(endpoint,params={}){
   assert.ok(['/fapi/v1/time','/fapi/v1/exchangeInfo',...Object.values(S.SERIES).map(s=>s.endpoint)].includes(endpoint));const url=new URL(S.BASE+endpoint);for(const [k,v]of Object.entries(params))url.searchParams.set(k,String(v));
   for(let attempt=0;attempt<LIMITS.attempts;attempt++){
    check();assert.ok(cp.requests.length<LIMITS.requests,'Request budget exhausted');const delay=Math.max(0,cp.retryNotBefore-now());if(delay>LIMITS.maxWaitMs)throw failure('Cooldown exceeds bounded wait','COOLDOWN',true);if(delay)await wait(delay);check();
    const record={sequence:cp.requests.length,url:url.href,endpoint,parameters:{...params},attempt,startedAt:new Date(now()).toISOString()};cp.requests.push(record);await save(out,cp); // Parameters recorded before GET.
    let response,text,networkError;
    try{response=await fetcher(url.href,{method:'GET',redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(LIMITS.timeoutMs)]),headers:{Accept:'application/json'}});record.status=response.status;record.headers=Object.fromEntries(['date','content-type','retry-after','x-mbx-used-weight-1m'].map(k=>[k,response.headers.get(k)]));text=await body(response)}
    catch(error){check();if(error.code==='VALIDATION')throw error;networkError=error;record.error=error.message}
    record.finishedAt=new Date(now()).toISOString();if(text!==undefined){record.bodySha256=S.sha(text);record.bodyFile='responses/'+record.sequence+'.json';await writeNew(path.join(out,record.bodyFile),{url:record.url,status:record.status,rawBody:text,sha256:record.bodySha256})}
    cp.retryNotBefore=now()+LIMITS.paceMs;
    if([403,418,451].includes(response?.status)){await save(out,cp);throw failure('Official endpoint access unavailable HTTP'+response.status,'ACCESS')}
    if(response?.ok&&!networkError){await save(out,cp);let data;try{data=JSON.parse(text)}catch{throw failure('Invalid JSON from official endpoint')}
     if(Number(record.headers['x-mbx-used-weight-1m'])>=1000)cp.retryNotBefore=Math.max(cp.retryNotBefore,Math.ceil(now()/60000)*60000+1000);await save(out,cp);return data}
    const retryable=!!networkError||response?.status===429||response?.status>=500;
    const delayRequired=Math.ceil(Math.max(LIMITS.paceMs,1000*2**attempt,retryAfter(record.headers?.['retry-after'],now())??0));assert.ok(Number.isSafeInteger(delayRequired)&&Number.isSafeInteger(now()+delayRequired),'Invalid cooldown');cp.retryNotBefore=now()+delayRequired;await save(out,cp);
    if(!retryable)throw failure('Official endpoint HTTP'+response?.status,'ENDPOINT');if(attempt===LIMITS.attempts-1)throw failure('Bounded request retries exhausted','NETWORK',true);
    if(delayRequired>LIMITS.maxWaitMs)throw failure('Retry-After exceeds bounded wait','COOLDOWN',true);
   }
  }
  const time=await request('/fapi/v1/time');S.cutoff(time?.serverTime);
  if(cp.cutoff===null){cp.cutoff=time.serverTime;cp.pages.funding.pending=cp.cutoff>c.startInclusive?[[c.startInclusive,effectiveEnd(c,cp.cutoff,'funding')]]:[]}
  else assert.ok(time.serverTime>=cp.cutoff&&time.serverTime-cp.cutoff<=LIMITS.checkpointAgeMs,'Stale/nonmonotonic checkpoint server cutoff');await save(out,cp);
  if(!cp.metadata){const raw=await request('/fapi/v1/exchangeInfo'),selected=S.contract(raw);cp.metadata={kind:'hybrid-usdm-current-exchange-snapshot',capturedAt:new Date(now()).toISOString(),cutoffServerTime:cp.cutoff,interpretation:'Current observation only; never historical Q3 rules/account fees',exchangeInfo:raw,selectedContract:selected,verifiedUnits:{...S.CONTRACT},sourceDocs:DOCS};cp.metadataHash=S.hash(cp.metadata);await save(out,cp)}
  await immutable(path.join(out,'metadata.json'),{payload:cp.metadata,metadataHash:cp.metadataHash});
  for(const series of ['trade','mark']){
   const page=cp.pages[series],end=effectiveEnd(c,cp.cutoff,series);
   while(page.cursor<end){check();const a=page.cursor,b=Math.min(end,a+c.pageSize*S.STEP);const rows=await request(S.SERIES[series].endpoint,{symbol:'BTCUSDT',interval:'5m',startTime:a,endTime:b-1,limit:c.pageSize});
    assert.ok(Array.isArray(rows)&&rows.length<=c.pageSize,'Invalid kline page');
    rows.forEach((r,i)=>{assert.deepEqual(S.rowErrors(r,series),[],'Rejected '+series+' row');assert.ok(r[0]>=a&&r[0]<b&&r[6]<cp.cutoff,'Outside request/cutoff');if(i)assert.ok(r[0]>rows[i-1][0],'Duplicate/conflict/unordered page')});
    page.rows.push(...rows);page.windows.push([a,b]);page.cursor=b;await save(out,cp);deps.onPage?.({series,rows:page.rows.length,cursor:b});
   }
  }
  const funding=cp.pages.funding;
  while(funding.pending.length){check();const [a,b]=funding.pending[0],rows=await request(S.SERIES.funding.endpoint,{symbol:'BTCUSDT',startTime:a,endTime:b-1,limit:c.pageSize});
   assert.ok(Array.isArray(rows)&&rows.length<=c.pageSize,'Invalid funding page');rows.forEach((r,i)=>{assert.deepEqual(S.rowErrors(r,'funding'),[]);assert.ok(r.fundingTime>=a&&r.fundingTime<b&&r.fundingTime<cp.cutoff);if(i)assert.ok(r.fundingTime>=rows[i-1].fundingTime,'Unordered funding page')});
   // Full pages are uncertain. Partition time, never advance lastTime+1 across a tie.
   if(rows.length===c.pageSize){funding.pending.splice(0,1,...splitWindow(a,b))}
   else{funding.pending.shift();funding.windows.push([a,b]);funding.rows.push(...rows)}
   await save(out,cp);deps.onPage?.({series:'funding',rows:funding.rows.length,pending:funding.pending.length});
  }
  check();const manifest={kind:'hybrid-usdm-public-bundle',collectorVersion:S.VERSION,contract:{...S.CONTRACT},range:{startInclusive:c.startInclusive,endExclusive:c.endExclusive},metadataHash:cp.metadataHash,series:{},fundingCalendarCompleteness:'unknown-no-historical-calendar'};
  for(const series of ['trade','mark','funding']){
   const page=cp.pages[series];coverage(page.windows,c.startInclusive,effectiveEnd(c,cp.cutoff,series));
   const p=S.payload(c,series,page.rows),quality=S.quality(p,cp.cutoff,{retrievalComplete:true});assert.notEqual(quality.state,'invalid','Rejected source identities/rows');
   const d={kind:'hybrid-usdm-public-series',collectorVersion:S.VERSION,payload:p,dataHash:S.hash(p),quality,acquisition:{cutoffServerTime:cp.cutoff,retrievalComplete:true,coverageWindows:page.windows,metadataHash:cp.metadataHash,checkpointFingerprint:cp.fingerprint}};
   S.verifySeries(d);await immutable(path.join(out,series+'.json'),d);manifest.series[series]={file:series+'.json',dataHash:d.dataHash,quality};
  }
  manifest.dataBundleHash=S.hash(Object.fromEntries(Object.entries(manifest.series).map(([k,v])=>[k,v.dataHash])));manifest.state=manifest.series.trade.quality.state==='complete'&&manifest.series.mark.quality.state==='complete'&&manifest.series.funding.quality.state==='retrieved'?'verified':'incomplete';
  await immutable(path.join(out,'bundle.json'),manifest);cp.status='published-'+manifest.state;await save(out,cp);return manifest;
 }catch(error){if(cp){cp.status='incomplete';cp.lastError={message:error.message,code:error.code||error.name,resumable:error.resumable===true,at:new Date(now()).toISOString()};await save(out,cp);await writeNew(path.join(out,'failure-'+require('node:crypto').randomUUID()+'.json'),{state:'incomplete',error:cp.lastError,counts:Object.fromEntries(Object.entries(cp.pages).map(([k,v])=>[k,v.rows.length])),requests:cp.requests.length})}throw error}
 finally{clearTimeout(timer);await lock.close();await fs.unlink(out+'.lock')}
}
async function verify(out){
 const manifest=JSON.parse(await fs.readFile(path.join(out,'bundle.json'),'utf8'));assert.equal(manifest.kind,'hybrid-usdm-public-bundle');assert.equal(manifest.collectorVersion,S.VERSION);assert.equal(S.canonical(manifest.contract),S.canonical(S.CONTRACT));
 assert.equal(S.canonical(Object.keys(manifest.series).sort()),S.canonical(['funding','mark','trade']),'Exactly three typed series required');
 const meta=JSON.parse(await fs.readFile(path.join(out,'metadata.json'),'utf8'));assert.equal(meta.payload.kind,'hybrid-usdm-current-exchange-snapshot');assert.equal(S.hash(meta.payload),meta.metadataHash);assert.equal(meta.metadataHash,manifest.metadataHash);const selected=S.contract(meta.payload.exchangeInfo);assert.equal(S.canonical(selected),S.canonical(meta.payload.selectedContract));assert.equal(S.canonical(meta.payload.verifiedUnits),S.canonical(S.CONTRACT));
 const c=S.config({start:manifest.range.startInclusive,end:manifest.range.endExclusive}),hashes={};
 for(const series of ['trade','mark','funding']){assert.equal(manifest.series[series].file,series+'.json');const d=JSON.parse(await fs.readFile(path.join(out,series+'.json'),'utf8'));assert.equal(d.payload.series,series);assert.equal(S.canonical(d.payload.range),S.canonical(manifest.range));assert.equal(d.acquisition.metadataHash,meta.metadataHash);assert.equal(d.acquisition.cutoffServerTime,meta.payload.cutoffServerTime);coverage(d.acquisition.coverageWindows,c.startInclusive,effectiveEnd(c,d.acquisition.cutoffServerTime,series));const q=S.verifySeries(d);assert.equal(q.issueCount,0,'Invalid series cannot be verified');assert.equal(d.dataHash,manifest.series[series].dataHash);assert.equal(S.canonical(q),S.canonical(manifest.series[series].quality));hashes[series]=d.dataHash}
 assert.equal(S.hash(hashes),manifest.dataBundleHash);assert.equal(manifest.fundingCalendarCompleteness,'unknown-no-historical-calendar');const state=manifest.series.trade.quality.state==='complete'&&manifest.series.mark.quality.state==='complete'&&manifest.series.funding.quality.state==='retrieved'?'verified':'incomplete';assert.equal(manifest.state,state);return manifest;
}
async function main(args){const command=args.shift(),options={};assert.ok(['acquire','verify'].includes(command),'Usage: node research/derivatives.cjs acquire|verify --out <fresh ignored directory> [--resume]');for(let i=0;i<args.length;i++){const key=args[i];assert.ok(['--out','--resume'].includes(key)&&!Object.hasOwn(options,key));if(key==='--resume')options[key]=true;else{assert.ok(args[i+1]);options[key]=args[++i]}}assert.ok(options['--out']);const out=path.resolve(options['--out']),abort=new AbortController(),cancel=()=>abort.abort();process.once('SIGINT',cancel);process.once('SIGTERM',cancel);try{const result=command==='acquire'?await acquire({out,resume:!!options['--resume']},{signal:abort.signal,onPage:p=>console.error(JSON.stringify(p))}):await verify(out);console.log(JSON.stringify(result,null,2));if(result.state!=='verified')process.exitCode=2}finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel)}}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(JSON.stringify({error:e.message,code:e.code||e.name}));process.exitCode=1});
module.exports={acquire,verify,checkpoint,coverage,splitWindow,retryAfter,fingerprint,LIMITS,DOCS,...S};
