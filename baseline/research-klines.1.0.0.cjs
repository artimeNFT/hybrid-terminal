#!/usr/bin/env node
'use strict';
// Independent data tool. Never imports or executes the terminal application.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {setTimeout:sleep}=require('node:timers/promises');
const TOOL_VERSION='1.0.0',SCHEMA_VERSION=1;
const STEPS={'5m':300000,'15m':900000,'1h':3600000,'4h':14400000};
const BASES=['https://data-api.binance.vision','https://api.binance.com'];
const SOURCE={venue:'BINANCE',market:'SPOT',endpoint:'/api/v3/klines',timeZone:'UTC',timestampUnit:'ms',normalization:'decimal-text-v1'};
const MAX_ROWS=1000000,DECIMAL=/^(0|[1-9]\d*)(\.\d+)?$/;
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const iso=t=>new Date(t).toISOString();
function fail(message,code='VALIDATION'){throw Object.assign(new Error(message),{code})}
function keys(v,wanted){return v&&typeof v==='object'&&!Array.isArray(v)&&JSON.stringify(Object.keys(v).sort())===JSON.stringify([...wanted].sort())}
function utc(value){if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value))fail('Use explicit UTC ISO timestamps ending in Z');const n=Date.parse(value);if(!Number.isSafeInteger(n)||iso(n)!==value.replace(/Z$/,value.includes('.')?'Z':'.000Z'))fail('Invalid UTC date');return n}
function config({symbol,timeframe,start,end,baseUrl=BASES[0]}){
 if(!['BTCUSDT','ETHUSDT','SOLUSDT'].includes(symbol)||!STEPS[timeframe])fail('Supported symbols: BTCUSDT/ETHUSDT/SOLUSDT; timeframes: 5m/15m/1h/4h');
 const a=typeof start==='string'?utc(start):start,b=typeof end==='string'?utc(end):end,step=STEPS[timeframe];
 if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<Date.UTC(2017,0,1)||b>Date.UTC(2100,0,1)||b<=a||a%step||b%step)fail('Require increasing, interval-aligned UTC boundaries in [2017,2100]');
 if((b-a)/step>MAX_ROWS)fail(`Range exceeds ${MAX_ROWS} candles`);if(!BASES.includes(baseUrl))fail('Unsupported public Binance Spot base URL');
 return{symbol,timeframe,startInclusive:a,endExclusive:b,baseUrl,pageSize:1000};
}
function decimal(s){if(typeof s!=='string'||s.length>128||!DECIMAL.test(s))fail('Expected nonnegative plain decimal string (<=128 characters)');const [i,f='']=s.split('.');return{n:BigInt(i+f),scale:f.length}}
function compare(a,b){const x=decimal(a),y=decimal(b),s=Math.max(x.scale,y.scale);const d=x.n*10n**BigInt(s-x.scale)-y.n*10n**BigInt(s-y.scale);return d<0n?-1:d>0n?1:0}
function rowErrors(row,step){const errors=[];if(!Array.isArray(row)||row.length!==12)return['row must contain exactly 12 fields'];
 for(const i of [0,6,8])if(!Number.isSafeInteger(row[i])||row[i]<0)errors.push(`field ${i}: expected nonnegative safe integer`);
 if(!errors.length&&(row[0]<Date.UTC(2017,0,1)||row[0]>=Date.UTC(2100,0,1)||row[0]%step||row[6]!==row[0]+step-1))errors.push('timestamp units/alignment/close time invalid');
 try{for(const i of [1,2,3,4,5,7,9,10,11])decimal(row[i]);for(const i of [1,2,3,4])if(compare(row[i],'0')<=0)errors.push(`field ${i}: price must be positive`);
  if(compare(row[2],row[1])<0||compare(row[2],row[4])<0||compare(row[3],row[1])>0||compare(row[3],row[4])>0||compare(row[2],row[3])<0)errors.push('inconsistent OHLC geometry');
  if(compare(row[9],row[5])>0||compare(row[10],row[7])>0)errors.push('taker-buy exceeds total volume (exact decimal comparison, zero tolerance)');
 }catch(e){errors.push(e.message)}return errors;
}
function payload(c,candles){return{schemaVersion:SCHEMA_VERSION,source:{...SOURCE},symbol:c.symbol,timeframe:c.timeframe,range:{startInclusive:c.startInclusive,endExclusive:c.endExclusive},candles}}
function canonical(p){if(!keys(p,['schemaVersion','source','symbol','timeframe','range','candles'])||p.schemaVersion!==SCHEMA_VERSION||!keys(p.source,Object.keys(SOURCE))||Object.entries(SOURCE).some(([k,v])=>p.source[k]!==v)||!keys(p.range,['startInclusive','endExclusive'])||!Array.isArray(p.candles)||p.candles.length>MAX_ROWS)fail('Unsupported canonical payload schema/source');
 const c=config({symbol:p.symbol,timeframe:p.timeframe,start:p.range.startInclusive,end:p.range.endExclusive});return JSON.stringify(payload(c,p.candles));
}
function quality(p,cutoff){canonical(p);if(!Number.isSafeInteger(cutoff)||cutoff<Date.UTC(2017,0,1)||cutoff>=Date.UTC(2100,0,1))fail('Invalid trusted acquisition cutoff');
 const step=STEPS[p.timeframe],{startInclusive:start,endExclusive:end}=p.range,seen=new Map(),validTimes=new Set(),issues=[],duplicates=[];let issueCount=0,previous=-1,duplicateRows=0,conflictingTimestamps=0;
 const issue=(index,message)=>{issueCount++;if(issues.length<1000)issues.push({index,message})};
 p.candles.forEach((r,i)=>{const errors=rowErrors(r,step);errors.forEach(e=>issue(i,e));if(!Array.isArray(r)||!Number.isSafeInteger(r[0]))return;const t=r[0];
  if(t<previous)issue(i,'timestamps out of order');previous=t;if(t<start||t>=end)issue(i,'outside requested range');if(r[6]>=cutoff)issue(i,'developing/future candle in frozen data');
  const prior=seen.get(t);if(prior){duplicateRows++;const conflict=JSON.stringify(prior.row)!==JSON.stringify(r);if(conflict&&!prior.conflict){prior.conflict=true;conflictingTimestamps++}duplicates.push({openTime:t,firstIndex:prior.index,index:i,conflict});issue(i,conflict?'conflicting duplicate timestamp':'duplicate timestamp')}else seen.set(t,{row:r,index:i,conflict:false});
  if(!errors.length&&t>=start&&t<end&&r[6]<cutoff)validTimes.add(t);
 });
 const times=[...validTimes].sort((a,b)=>a-b),gaps=[];let cursor=start;
 for(const t of times){if(t>cursor)gaps.push({startInclusive:cursor,endExclusive:t,missingRows:(t-cursor)/step});cursor=t+step}if(cursor<end)gaps.push({startInclusive:cursor,endExclusive:end,missingRows:(end-cursor)/step});
 const expectedRows=(end-start)/step,missingRows=gaps.reduce((s,g)=>s+g.missingRows,0),eligibleEnd=Math.max(start,Math.min(end,Math.floor(cutoff/step)*step));
 return{state:issueCount?'invalid':missingRows?'incomplete':'complete',rowCount:p.candles.length,uniqueTimestampCount:seen.size,validUniqueRows:times.length,expectedRows,eligibleRowsAtCutoff:(eligibleEnd-start)/step,excludedDevelopingOrFutureRows:(end-eligibleEnd)/step,missingRows,duplicateRows,conflictingTimestamps,duplicates,gaps,coverage:{firstOpenTime:times[0]??null,lastOpenTime:times.at(-1)??null,endExclusive:times.length?times.at(-1)+step:null,contiguous:times.length>0&&gaps.length===0},issueCount,issues,issuesTruncated:issueCount>issues.length};
}
function verify(d){if(!keys(d,['kind','toolVersion','payload','dataHash','quality','acquisition'])||d.kind!=='hybrid-frozen-spot-dataset'||d.toolVersion!==TOOL_VERSION)fail('Not a supported frozen dataset (checkpoints are not datasets)');
 const actualHash=hash(canonical(d.payload));if(!/^[a-f0-9]{64}$/.test(d.dataHash)||d.dataHash!==actualHash)fail('Data hash mismatch: possible tampering');
 const q=quality(d.payload,d.acquisition?.cutoffServerTime);if(JSON.stringify(d.quality)!==JSON.stringify(q))fail('Stored quality differs from independently recomputed quality');
 return{dataHash:actualHash,...q};
}
function diff(a,b){if(verify(a).state==='invalid'||verify(b).state==='invalid')fail('Cannot compare invalid datasets');const {candles:ac,...ai}=JSON.parse(canonical(a.payload)),{candles:bc,...bi}=JSON.parse(canonical(b.payload));if(JSON.stringify(ai)!==JSON.stringify(bi))fail('Cannot compare different schema/source/symbol/timeframe/range');
 const map=rows=>new Map(rows.map(r=>[r[0],JSON.stringify(r)])),am=map(ac),bm=map(bc),added=[],removed=[],changed=[];
 for(const [t,r]of am)if(!bm.has(t))removed.push(t);else if(bm.get(t)!==r)changed.push(t);for(const t of bm.keys())if(!am.has(t))added.push(t);
 return{identical:a.dataHash===b.dataHash,firstHash:a.dataHash,secondHash:b.dataHash,added,removed,changed,firstQuality:a.quality.state,secondQuality:b.quality.state};
}
async function exists(p){try{await fs.access(p);return true}catch(e){if(e.code==='ENOENT')return false;throw e}}
async function writeAtomic(file,value,exclusive=false){await fs.mkdir(path.dirname(file),{recursive:true});const temp=file+'.tmp-'+crypto.randomUUID(),handle=await fs.open(temp,'wx');try{await handle.writeFile(JSON.stringify(value,null,2)+'\n');await handle.sync()}finally{await handle.close()}
 try{if(exclusive)await fs.link(temp,file);else await fs.rename(temp,file)}finally{await fs.rm(temp,{force:true})}}
function checkpointHash(cp){const {checkpointHash:_,...rest}=cp;return hash(rest)}
async function save(cp,file){cp.updatedAt=iso(Date.now());cp.checkpointHash=checkpointHash(cp);await writeAtomic(file,cp)}
function retryAfter(value,now){if(value===null||value===undefined)return null;if(/^\d+(\.\d+)?$/.test(value)){const n=Number(value)*1000;return Number.isFinite(n)?n:null}const d=Date.parse(value);return Number.isFinite(d)?Math.max(0,d-now):null}
async function acquire(input,deps={}){
 const c=config(input),out=path.resolve(input.out||fail('Output path required')),cpFile=out+'.checkpoint.json',lockFile=out+'.lock';await fs.mkdir(path.dirname(out),{recursive:true});
 if(await exists(out))fail('Frozen output already exists; use a new path','EXISTS');const lock=await fs.open(lockFile,'wx').catch(e=>{if(e.code==='EEXIST')fail('Acquisition lock exists; do not run concurrent writers','LOCKED');throw e});await lock.writeFile(JSON.stringify({pid:process.pid,createdAt:iso(Date.now())}));
 const signal=deps.signal,fetcher=deps.fetch||fetch,wait=deps.wait||((ms,s)=>sleep(ms,undefined,{signal:s})),clock=deps.now||Date.now,pace=deps.paceMs??1000,timeoutMs=deps.timeoutMs??15000,maxRetries=3,maxWait=60000;let cp;
 const check=()=>{if(signal?.aborted)throw signal.reason||Object.assign(new Error('Cancelled'),{name:'AbortError'})};
 const persist=()=>save(cp,cpFile);
 try{
  if(input.resume){const saved=JSON.parse(await fs.readFile(cpFile,'utf8'));if(saved.kind!=='hybrid-acquisition-checkpoint'||saved.toolVersion!==TOOL_VERSION||saved.checkpointHash!==checkpointHash(saved)||JSON.stringify(saved.config)!==JSON.stringify(c))fail('Checkpoint integrity/configuration mismatch');
   if(saved.cutoffServerTime!==null){const q=quality(payload(c,saved.rows),saved.cutoffServerTime);if(q.issueCount)fail('Checkpoint contains invalid rows');}
   if(!Number.isSafeInteger(saved.cursor)||saved.cursor<c.startInclusive||saved.cursor>c.endExclusive||saved.cursor%STEPS[c.timeframe]||saved.rows.some(r=>r[0]>=saved.cursor))fail('Invalid checkpoint cursor');
   if(saved.rejectedPages.length)fail('Checkpoint has rejected source pages; retain evidence and restart at a new output path');
   cp=saved;cp.resumes++;cp.status='in-progress';
  }else{if(await exists(cpFile))fail('Checkpoint exists; use --resume with exactly the same configuration','EXISTS');cp={kind:'hybrid-acquisition-checkpoint',toolVersion:TOOL_VERSION,config:c,status:'in-progress',createdAt:iso(clock()),updatedAt:iso(clock()),cutoffServerTime:null,cursor:c.startInclusive,rows:[],pages:0,resumes:0,requests:[],retryNotBefore:0,rejectedPages:[]}}
  await persist();
  async function request(endpoint,params={}){
   const url=new URL(c.baseUrl+endpoint);for(const [k,v]of Object.entries(params))url.searchParams.set(k,String(v));
   for(let attempt=0;attempt<=maxRetries;attempt++){
    check();const delay=Math.max(0,(cp.retryNotBefore||0)-clock());if(delay>maxWait)fail('Required server cooldown exceeds bounded wait; resume after '+iso(cp.retryNotBefore),'COOLDOWN');if(delay)await wait(delay,signal);check();
    const record={url:url.href,attempt,startedAt:iso(clock())};cp.requests.push(record);let response,body,error;
    const timed=AbortSignal.timeout(timeoutMs),combined=signal?AbortSignal.any([signal,timed]):timed;
    try{response=await fetcher(url.href,{signal:combined,redirect:'error',headers:{Accept:'application/json','X-MBX-TIME-UNIT':'MILLISECOND'}});record.status=response.status;record.usedWeight1m=response.headers.get('x-mbx-used-weight-1m');record.retryAfter=response.headers.get('retry-after');body=await response.text();if(body.length>4000000)fail('Response exceeds page body limit');record.finishedAt=iso(clock())}
    catch(e){check();error=e;record.error=e.message;record.finishedAt=iso(clock())}
    if(response?.status===418){cp.retryNotBefore=clock()+(retryAfter(record.retryAfter,clock())??86400000);record.error='IP ban: no automatic retry';await persist();fail('HTTP 418 ban; stop until '+iso(cp.retryNotBefore),'BANNED')}
    if(response&&response.status>=200&&response.status<300&&!error){let data;try{data=JSON.parse(body)}catch{await persist();fail('Invalid JSON response')}
     cp.retryNotBefore=Math.max(clock()+pace,Number(record.usedWeight1m)>=1000?Math.ceil(clock()/60000)*60000+1000:0);await persist();return data;}
    const retryable=error||response?.status===429||response?.status>=500;
    const required=retryAfter(record.retryAfter,clock()),backoff=Math.max(required??0,1000*2**attempt);cp.retryNotBefore=clock()+backoff;record.backoffMs=backoff;record.error??=body?.slice(0,500)||'HTTP failure';await persist();
    if(!retryable||attempt===maxRetries)fail(`Request stopped: ${record.status||record.error}`,'REQUEST');if(backoff>maxWait)fail('Retry-After exceeds bounded wait; resume after '+iso(cp.retryNotBefore),'COOLDOWN');
   }
  }
  if(cp.cutoffServerTime===null){const time=await request('/api/v3/time');if(!Number.isSafeInteger(time?.serverTime)||time.serverTime<Date.UTC(2017,0,1)||time.serverTime>=Date.UTC(2100,0,1))fail('Trusted server time unavailable');cp.cutoffServerTime=time.serverTime;await persist()}
  const step=STEPS[c.timeframe],effectiveEnd=Math.max(c.startInclusive,Math.min(c.endExclusive,Math.floor(cp.cutoffServerTime/step)*step)),pageBudget=Math.ceil((effectiveEnd-c.startInclusive)/step)+1;
  while(cp.cursor<effectiveEnd){check();if(cp.pages>=pageBudget)fail('Page budget exhausted');const start=cp.cursor,end=Math.min(effectiveEnd,start+1000*step),rows=await request('/api/v3/klines',{symbol:c.symbol,interval:c.timeframe,timeZone:'0',startTime:start,endTime:end-1,limit:1000});
   let errors=[];if(!Array.isArray(rows)||rows.length>1000)errors=['Invalid page structure/size'];else{rows.forEach((r,i)=>{rowErrors(r,step).forEach(e=>errors.push(`row ${i}: ${e}`));if(Array.isArray(r)&&(r[0]<start||r[0]>=end||r[6]>=cp.cutoffServerTime))errors.push(`row ${i}: outside page bounds/cutoff`);if(i&&Array.isArray(r)&&Array.isArray(rows[i-1])&&r[0]<=rows[i-1][0])errors.push(`row ${i}: duplicate/conflicting/unordered timestamps`)});}
   const next=Array.isArray(rows)&&rows.length?rows.at(-1)?.[0]+step:end;if(!Number.isSafeInteger(next)||next<=start||next>end)errors.push('No valid strict forward progress');
   if(errors.length){cp.rejectedPages.push({startInclusive:start,endExclusive:end,rows,errors});await persist();fail('Rejected source page; raw rows retained in checkpoint: '+errors.slice(0,3).join('; '))}
   cp.rows.push(...rows);cp.cursor=next;cp.pages++;await persist();deps.onPage?.({pages:cp.pages,rows:cp.rows.length,cursor:cp.cursor});
  }
  check();const p=payload(c,cp.rows),q=quality(p,cp.cutoffServerTime);const d={kind:'hybrid-frozen-spot-dataset',toolVersion:TOOL_VERSION,payload:p,dataHash:hash(canonical(p)),quality:q,acquisition:{baseUrl:c.baseUrl,startedAt:cp.createdAt,finishedAt:iso(clock()),cutoffServerTime:cp.cutoffServerTime,effectiveEndExclusive:effectiveEnd,pages:cp.pages,resumes:cp.resumes,requests:cp.requests}};
  verify(d);await writeAtomic(out,d,true);cp.status='frozen-written';cp.outputHash=d.dataHash;await persist();return d;
 }catch(e){if(cp){cp.status=signal?.aborted?'cancelled':'blocked';cp.lastError={code:e.code||e.name,message:e.message,at:iso(clock())};await persist()}throw e}
 finally{await lock.close();await fs.rm(lockFile,{force:true})}
}
const HELP=`Hybrid Spot research data tool ${TOOL_VERSION} (schema ${SCHEMA_VERSION}), Node >=22.\nCommands:\n  node research/klines.cjs acquire --symbol BTCUSDT --timeframe 5m --start 2026-07-01T00:00:00Z --end 2026-10-01T00:00:00Z --out research/datasets/btcusdt-5m-2026-q3.json [--resume] [--base-url https://data-api.binance.vision]\n  node research/klines.cjs validate --file DATASET.json\n  node research/klines.cjs compare --first DATASET.json --second REPEATED.json\nExit: 0 valid complete/identical; 2 valid incomplete/different; 1 error/invalid; 130 cancelled. Ctrl+C saves a page checkpoint. Frozen outputs are never overwritten.\n`;
async function main(args){const command=args.shift();if(!command||command==='--help'){console.log(HELP);return}const options={};for(let i=0;i<args.length;i++){const k=args[i];if(!k.startsWith('--')||k in options)fail('Invalid/duplicate option '+k);if(k==='--resume')options[k]=true;else{if(!args[i+1]||args[i+1].startsWith('--'))fail('Missing value '+k);options[k]=args[++i]}}
 const allowed={acquire:['--symbol','--timeframe','--start','--end','--out','--resume','--base-url'],validate:['--file'],compare:['--first','--second']}[command];if(!allowed||Object.keys(options).some(k=>!allowed.includes(k)))fail('Unknown command/option; use --help');
 const read=async k=>{if(!options[k])fail('Missing '+k);return JSON.parse(await fs.readFile(options[k],'utf8'))};let report;
 if(command==='acquire'){const abort=new AbortController(),cancel=()=>abort.abort(Object.assign(new Error('Cancelled; resume with --resume'),{name:'AbortError'}));process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
  try{const d=await acquire({symbol:options['--symbol'],timeframe:options['--timeframe'],start:options['--start'],end:options['--end'],out:options['--out'],resume:!!options['--resume'],baseUrl:options['--base-url']},{signal:abort.signal,onPage:s=>console.error(`checkpoint: page ${s.pages}, ${s.rows} rows, through ${iso(s.cursor)}`)});report={file:path.resolve(options['--out']),...verify(d)}}catch(e){if(abort.signal.aborted)process.exitCode=130;throw e}finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel)}}
 else if(command==='validate')report=verify(await read('--file'));else report=diff(await read('--first'),await read('--second'));
 console.log(JSON.stringify(report,null,2));if(report.state==='invalid')process.exitCode=1;else if(report.state==='incomplete'||report.identical===false)process.exitCode=2;
}
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(JSON.stringify({error:e.message,code:e.code||e.name}));process.exitCode=process.exitCode||1});
module.exports={TOOL_VERSION,SCHEMA_VERSION,SOURCE,STEPS,config,utc,decimal,compare,rowErrors,payload,canonical,quality,verify,diff,hash,acquire,retryAfter,main};
