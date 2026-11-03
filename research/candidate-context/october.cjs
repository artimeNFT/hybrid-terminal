'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{setTimeout:sleep}=require('node:timers/promises');
const Q=require('../derivatives/schema.cjs'),{decimal,compare}=require('../klines.cjs'),P=require('./protocol.json');
const START=P.data.octoberStart,END=P.data.octoberEnd,STEP=P.data.step,BASE='https://fapi.binance.com',SCHEMA='hybrid-candidate-october-trade/v1';
const hash=Q.hash,sha=Q.sha,canonical=Q.canonical;
function newFile(f,v){fs.writeFileSync(f,canonical(v),{flag:'wx'})}
function validateRows(rows,start=START,end=END,cutoff=END){
 assert.ok(Array.isArray(rows)&&rows.length===(end-start)/STEP,'Exact complete grid required');
 rows.forEach((r,j)=>{assert.ok(Array.isArray(r)&&r.length===12);assert.equal(r[0],start+j*STEP,'Missing/duplicate/conflicting/unordered open');assert.equal(r[6],r[0]+STEP-1);assert.ok(r[6]<cutoff,'Closed rows only');for(const i of [0,6,8])assert.ok(Number.isSafeInteger(r[i])&&r[i]>=0);
 for(const i of [1,2,3,4]){decimal(r[i]);assert.ok(compare(r[i],'0')>0)}for(const i of [5,7,9,10,11])decimal(r[i]);assert.ok(compare(r[2],r[1])>=0&&compare(r[2],r[4])>=0&&compare(r[3],r[1])<=0&&compare(r[3],r[4])<=0&&compare(r[2],r[3])>=0);assert.ok(compare(r[9],r[5])<=0&&compare(r[10],r[7])<=0);assert.ok(r.slice(1,6).map(Number).every(Number.isFinite));});return{state:'complete',rows:rows.length,expectedRows:(end-start)/STEP,gaps:0,duplicates:0,conflicts:0,startInclusive:start,endExclusive:end};
}
function payload(rows){return{schema:SCHEMA,contract:Q.CONTRACT,series:'trade',symbol:'BTCUSDT',timeframe:'5m',source:BASE+'/fapi/v1/klines',range:{startInclusive:START,endExclusive:END},rows}}
function verify(doc){assert.equal(doc?.kind,'hybrid-candidate-october-trade');assert.equal(canonical(doc.payload),canonical(payload(doc.payload.rows)),'Wrong study/series/range');assert.equal(doc.dataHash,hash(doc.payload));assert.ok(Number.isSafeInteger(doc.acquisition?.cutoff)&&doc.acquisition.cutoff>=END);const quality=validateRows(doc.payload.rows,START,END,doc.acquisition.cutoff);assert.equal(canonical(doc.quality),canonical(quality));return quality}
function retryMs(value,now){if(value==null)return 0;const n=Number(value);return Number.isFinite(n)&&n>=0?n*1000:Math.max(0,Date.parse(value)-now)}
async function acquire(out,{resume=false,fetcher=fetch,wait=sleep,now=Date.now}={}){
 out=path.resolve(out);assert.ok([path.resolve('research/datasets')+path.sep,path.resolve('.qa-results')+path.sep].some(p=>out.startsWith(p)),'Ignored project output only');const identity=hash({reader:sha(fs.readFileSync(__filename)),protocol:sha(fs.readFileSync(path.join(__dirname,'protocol.json')))});let cp;
 if(fs.existsSync(out)){assert.ok(resume,'Explicit resume required');cp=JSON.parse(fs.readFileSync(path.join(out,'checkpoint.json')));const {checkpointHash,...rest}=cp;assert.equal(hash(rest),checkpointHash);assert.equal(cp.identity,identity);assert.ok(!cp.terminal&&!cp.complete,'Terminal/complete intake cannot restart');assert.ok(cp.requests.length<=32);validateRows(cp.rows,START,cp.cursor,cp.cutoff??END)}else{fs.mkdirSync(out,{recursive:true});cp={identity,cursor:START,cutoff:null,rows:[],requests:[],notBefore:0,complete:false,terminal:false}}
 const save=()=>{delete cp.checkpointHash;cp.checkpointHash=hash(cp);fs.writeFileSync(path.join(out,'checkpoint.tmp'),canonical(cp));fs.renameSync(path.join(out,'checkpoint.tmp'),path.join(out,'checkpoint.json'))};save();
 async function request(endpoint,parameters){const url=new URL(BASE+endpoint);for(const [k,v]of Object.entries(parameters))url.searchParams.set(k,String(v));
  const prior=cp.requests.filter(r=>r.url===url.href).length;for(let attempt=prior;attempt<3;attempt++){
   assert.ok(cp.requests.length<32,'32-request cap reached');const delay=Math.max(0,cp.notBefore-now());if(delay>60000)throw Object.assign(Error('Cooldown requires later explicit resume'),{resumable:true});if(delay)await wait(delay);
   const r={sequence:cp.requests.length,url:url.href,parameters,attempt,startedAt:new Date(now()).toISOString()};cp.requests.push(r);save();let response,text,error;
   try{response=await fetcher(url.href,{method:'GET',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});r.status=response.status;r.headers=Object.fromEntries(['retry-after','date','x-mbx-used-weight-1m'].map(k=>[k,response.headers.get(k)]));const chunks=[];let bytes=0;for await(const b of response.body){bytes+=b.byteLength;assert.ok(bytes<=4000000,'Body cap');chunks.push(Buffer.from(b))}text=Buffer.concat(chunks).toString('utf8');r.responseSha256=sha(text);r.bodyFile='response-'+r.sequence+'.json';newFile(path.join(out,r.bodyFile),{url:r.url,rawBody:text,status:r.status,sha256:r.responseSha256})}catch(e){error=e;r.error=e.message}
   r.finishedAt=new Date(now()).toISOString();cp.notBefore=now()+1000;save();
   if([403,418,451].includes(response?.status)){cp.terminal=true;save();throw Error('Public source unavailable HTTP'+response.status+'; no fallback/retry')}
   if(response?.ok&&!error){let d;try{d=JSON.parse(text)}catch{cp.terminal=true;save();throw Error('Invalid JSON')}return d}
   const retryable=!!error||response?.status===429||response?.status>=500;const cooldown=Math.max(1000*2**attempt,retryMs(r.headers?.['retry-after'],now()));assert.ok(Number.isFinite(cooldown));cp.notBefore=now()+cooldown;save();if(!retryable){cp.terminal=true;save();throw Error('HTTP'+response?.status)}if(cooldown>60000||attempt===2)throw Object.assign(Error('Bounded request stop; not-before '+new Date(cp.notBefore).toISOString()),{resumable:true});
  }throw Error('Three attempts for this exact window already consumed');
 }
 try{if(cp.cutoff===null){const d=await request('/fapi/v1/time',{});assert.ok(Number.isSafeInteger(d.serverTime)&&d.serverTime>=END,'October not closed');cp.cutoff=d.serverTime;save()}
  while(cp.cursor<END){const start=cp.cursor,end=Math.min(END,start+1000*STEP),rows=await request('/fapi/v1/klines',{symbol:'BTCUSDT',interval:'5m',startTime:start,endTime:end-1,limit:1000});validateRows(rows,start,end,cp.cutoff);cp.rows.push(...rows);cp.cursor=end;save()}
  const p=payload(cp.rows),doc={kind:'hybrid-candidate-october-trade',payload:p,dataHash:hash(p),quality:validateRows(cp.rows,START,END,cp.cutoff),acquisition:{cutoff:cp.cutoff,requests:cp.requests,readerIdentity:identity,observedAt:new Date(now()).toISOString()}};verify(doc);newFile(path.join(out,'trade.json'),doc);cp.complete=true;save();return doc;
 }catch(e){cp.lastError={message:e.message,resumable:e.resumable===true};if(!e.resumable)cp.terminal=true;save();throw e}
}
module.exports={START,END,STEP,SCHEMA,validateRows,payload,verify,acquire,retryMs};
if(require.main===module)acquire(process.argv[2],{resume:process.argv[3]==='--resume'}).then(d=>console.log(JSON.stringify({hash:d.dataHash,quality:d.quality,requests:d.acquisition.requests.length}))).catch(e=>{console.error(e.stack);process.exitCode=1});
