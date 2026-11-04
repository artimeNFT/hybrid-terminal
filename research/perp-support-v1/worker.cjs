'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const D=require('../derivatives/schema.cjs'),P=require('./protocol.json'),{load}=require('../candidate-context/input.cjs'),{createCalculations}=require('./calculations.cjs'),F=require('./design.cjs'),{admission,limitState}=require('./resources.cjs');
const now=()=>process.hrtime.bigint(),ms=n=>Number(n)/1e6,hwm=pid=>Number(fs.readFileSync('/proc/'+pid+'/status','utf8').match(/^VmHWM:\s+(\d+)/m)?.[1]||0)*1024;
function write(out,name,value){fs.writeFileSync(path.join(out,name),D.canonical(value)+'\n',{flag:'wx'})}
async function execute(out,startNs,deadlineNs){
 const guard=()=>{if(now()>=deadlineNs-2000000000n)throw Error('Time allowance insufficient for bounded completion');if(hwm(process.pid)>P.resources.rssBytes)throw Error('Process RSS exceeded1GiB')};
 guard();for(const [file,hash]of Object.entries(P.pinnedDependencies))assert.equal(D.sha(fs.readFileSync(file)),hash,'Pinned dependency mismatch '+file);assert.equal(D.sha(fs.readFileSync(P.authoritativeApplication.path)),P.authoritativeApplication.sha256,'Authoritative HTML changed');const sourceSeal=JSON.parse(fs.readFileSync(path.join(out,'source-seal.json')));for(const [file,hash]of Object.entries(sourceSeal.payload.sources))assert.equal(D.sha(fs.readFileSync(file)),hash,'Source identity mismatch '+file);
 for(const file of [P.data.q3File,P.data.octoberFile])assert.ok(fs.existsSync(file),'Missing retained reference: '+file);
 let input;try{input=load(P.data.q3File,P.data.octoberFile)}catch(e){throw Error('Retained input validation failed ['+P.data.q3File+'; '+P.data.octoberFile+']: '+e.message)}const id=input.identity;
 assert.equal(id.q3.fileSha256,P.data.q3FileSha256,'File identity '+P.data.q3File);assert.equal(id.q3.dataHash,P.data.q3Hash);assert.equal(id.october.fileSha256,P.data.octoberFileSha256,'File identity '+P.data.octoberFile);assert.equal(id.october.dataHash,P.data.octoberHash);assert.equal(id.joinedRows,P.data.rows);assert.equal(id.joinedRawRowsHash,P.data.joinedRawRowsHash);assert.equal(id.origin,P.data.origin);assert.equal(id.endExclusive,P.data.endExclusive);
 input.bars.forEach((b,i)=>{assert.equal(b.t,P.data.origin+i*P.data.step);assert.equal(b.closed,true);assert.equal(b.end,b.t+P.data.step-1)});
 write(out,'input-seal.json',{payload:id,sha256:D.hash(id)});guard();
 let calc=createCalculations(input.bars),samples=[];const sampleStart=now();
 for(const index of P.resources.admissionIndices){guard();const begin=now(),frame=calc.at(index);F.frameRows(frame);const sample={index,ms:ms(now()-begin),rssBytes:process.memoryUsage().rss};samples.push(sample);console.log(JSON.stringify({stage:'benchmark',...sample}));guard()}
 const memory=process.memoryUsage(),parentRss=hwm(process.ppid),workerHwm=hwm(process.pid),decisionCount=input.bars.length-P.calculation.firstDecisionIndex,a=admission(samples,decisionCount,ms(deadlineNs-now()),Math.max(...samples.map(s=>s.rssBytes),memory.rss,workerHwm)+parentRss);
 write(out,'admission.json',{...a,samples,benchmarkElapsedMs:ms(now()-sampleStart),elapsedIncludingValidationMs:ms(now()-startNs),calculation:calc.identity,dataHash:id.joinedRawRowsHash});
 if(!a.admitted){assert.deepEqual(calc.deniedCalls(),[]);const result={study:P.study,state:'RESOURCE-REFUSED',preparationComplete:false,reason:a.reason,admission:a,verifiedData:id,benchmarkSamples:samples,calculation:calc.identity,episodes:null,cutpoints:null,weights:null,retention:null,balance:null,designGates:'NOT-EVALUATED',outcomesComputed:false};write(out,'result.json',result);return result}
 // New full preparation starts at3999. No benchmark episode rows are reused.
 calc=createCalculations(input.bars);const seen=new Set(),episodes=[],decisions={examined:0,invalid:{},invalidDescriptors:0};
 for(let i=P.calculation.firstDecisionIndex;i<input.bars.length;i++){
  guard();const f=calc.at(i),r=F.frameRows(f);decisions.examined++;decisions.invalidDescriptors+=r.invalidDescriptors||0;if(r.invalid)decisions.invalid[r.invalid]=(decisions.invalid[r.invalid]||0)+1;episodes.push(...F.takeFirst(r.rows,seen,input.bars.length));
  if((i+1)%100===0){console.log(JSON.stringify({stage:'preparation',decisionIndex:i,firstEpisodes:episodes.length,elapsedMs:ms(now()-startNs),rssBytes:process.memoryUsage().rss}));await new Promise(resolve=>setImmediate(resolve))}
 }
 assert.deepEqual(calc.deniedCalls(),[]);guard();const pool=episodes.filter(r=>!r.exclusion),cuts=F.cutpoints(pool);write(out,'cutpoints-seal.json',{payload:cuts,sha256:D.hash(cuts),rule:P.matching.cutpoints});
 const matched=F.match(pool,cuts),summary=F.summarize(episodes,matched),census=calc.census();guard();
 const result={study:P.study,state:summary.state,preparationComplete:true,data:id,calculation:calc.identity,decisions,sourceCensus:{total:census.length,qualifiedArms:Object.fromEntries(['V','C'].map(arm=>[arm,census.filter(c=>c.referenceState==='ready'&&!c.zeroRange&&c.cls===(arm==='V'?2:0)).length])),withoutFirstValid:Object.fromEntries(['V','C'].map(arm=>[arm,census.filter(c=>c.referenceState==='ready'&&!c.zeroRange&&c.cls===(arm==='V'?2:0)).length-episodes.filter(r=>r.arm===arm).length])),classification:FIELDS(census),doji:census.filter(c=>c.doji).length,dojiQualified:FIELDS(census.filter(c=>c.doji&&c.referenceState==='ready'&&!c.zeroRange))},summary,cutpoints:cuts,cells:matched.cells,outputHashes:{episodes:D.hash(episodes),weightedRows:D.hash(matched.weighted),unmatchedRows:D.hash(matched.unmatched)},outcomesComputed:false};
 write(out,'episodes.json',episodes);write(out,'weighted.json',matched.weighted);write(out,'unmatched.json',matched.unmatched);guard();write(out,'result.json',result);guard();return result;
}
function FIELDS(census){return F.tally(census,c=>[c.cls,c.referenceState,c.zeroRange?'zero-range':'range'].join('|'))}
if(require.main===module){const[out,start,deadline]=process.argv.slice(2);execute(out,BigInt(start),BigInt(deadline)).then(r=>console.log(JSON.stringify({terminal:r.state,complete:r.preparationComplete}))).catch(e=>{try{write(out,'failure.json',{state:'INCOMPLETE',message:e.message,stack:e.stack,outcomesComputed:false})}catch{}console.error(e.stack);process.exitCode=2})}
module.exports={execute};
