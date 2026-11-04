#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),assert=require('node:assert/strict'),D=require('./derivatives/schema.cjs'),P=require('./perp-support-v2/protocol.json'),{limitState}=require('./perp-support-v1/resources.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'.qa-results/perp-support-v2/market-attempt');
function sourceIdentity(){const files=[...Object.keys(P.pinnedSources),'research/perp-support-v2.cjs','tests/perp-support-v2.cjs',...fs.readdirSync(path.join(ROOT,'research/perp-support-v2')).filter(f=>f.endsWith('.cjs')||f==='protocol.json'||f==='DEPENDENCIES.md').map(f=>'research/perp-support-v2/'+f)];return Object.fromEntries([...new Set(files)].sort().map(f=>[f,D.sha(fs.readFileSync(path.join(ROOT,f)))]))}
function terminalState(code,result,stopped){if(stopped)return'INCOMPLETE-RESOURCE-STOP';if(code!==0)return'INCOMPLETE';if(result?.state==='PARITY-FAILED')return'PARITY-FAILED';if(result?.state==='RESOURCE-REFUSED')return'RESOURCE-REFUSED';if(result?.preparationComplete===true&&['DESIGN-GATES-PASS','NOT-INTERPRETABLE'].includes(result.state))return result.state;return'INCOMPLETE'}
function execute(){
 assert.equal(process.argv.length,2,'No resume, alternate inputs, output paths or resource overrides');process.chdir(ROOT);
 const start=process.hrtime.bigint(),deadline=start+BigInt(P.resources.maximumMonotonicMs)*1000000n,startedAt=new Date().toISOString();
 fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.mkdirSync(OUT); // Existing attempt is never replaced/restarted.
 const sources=sourceIdentity(),synthetic=JSON.parse(fs.readFileSync(path.join(ROOT,'.qa-results/perp-support-v2/synthetic-verification.json')));assert.equal(synthetic.passed,true,'Synthetic gate required');assert.deepStrictEqual(synthetic.sources,sources,'Synthetic gate code changed');
 const payload={study:P.study,protocol:P,protocolHash:D.hash(P),sources,synthetic,expectedData:P.scientificDesign.data,resourceGrant:P.resources,sourceContext:'explicit archived0.4.3 Local functions; actual root0.4.25 untouched'};fs.writeFileSync(path.join(OUT,'source-seal.json'),D.canonical({payload,sha256:D.hash(payload)})+'\n',{flag:'wx'});
 const elapsed=()=>Number(process.hrtime.bigint()-start)/1e6,child=spawn(process.execPath,['--max-old-space-size='+P.resources.heapMiB,path.join(__dirname,'perp-support-v2/worker.cjs'),OUT,String(start),String(deadline)],{cwd:ROOT,stdio:['ignore','pipe','pipe']}),log=fs.openSync(path.join(OUT,'worker.log'),'wx');
 let workerPeak=0,combinedPeak=0,reason=null,interrupted=false;const stop=why=>{reason??=why;child.kill('SIGKILL')};
 const sample=()=>{try{const rss=Number(fs.readFileSync('/proc/'+child.pid+'/status','utf8').match(/^VmHWM:\s+(\d+)/m)?.[1]||0)*1024;workerPeak=Math.max(workerPeak,rss);combinedPeak=Math.max(combinedPeak,rss+process.memoryUsage().rss);const s=limitState(elapsed(),combinedPeak);if(s.stop)stop(s.rssExceeded?'RSS-limit':'time-limit')}catch(e){if(!['ENOENT','ESRCH'].includes(e.code))stop('RSS-monitor-unavailable:'+e.message)}};
 const monitor=setInterval(sample,P.resources.pollMs),soft=setTimeout(()=>stop('time-cleanup-bound'),P.resources.maximumMonotonicMs-2000),hard=setTimeout(()=>stop('hard-time-bound'),P.resources.maximumMonotonicMs);
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{interrupted=true;stop('interrupted-no-resume')});
 for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{fs.writeSync(log,b);process.stdout.write(b)});
 child.on('error',e=>{reason='spawn-failed:'+e.message});
 child.on('close',(code,signal)=>{clearInterval(monitor);clearTimeout(soft);clearTimeout(hard);fs.closeSync(log);let result=null;try{result=JSON.parse(fs.readFileSync(path.join(OUT,'result.json')))}catch{}
  const observedElapsedMs=elapsed();if(limitState(observedElapsedMs,combinedPeak).stop)reason??='final-resource-observation';const state=terminalState(code,result,reason!==null),receipt={study:P.study,state,startedAt,finishedAt:new Date().toISOString(),maximumMonotonicMs:P.resources.maximumMonotonicMs,observedElapsedMs,workerRssObservedMax:workerPeak,combinedRssObservedMax:combinedPeak,rssLimit:P.resources.rssBytes,rssSamplingMs:P.resources.pollMs,rssObservation:'Worker VmHWM plus parent RSS, a conservative combined bound; worker separately checks high-water RSS',resourceStopReason:reason,interrupted,code,signal,attempts:1,workers:1,resumeAllowed:false,resultSha256:result?D.hash(result):null,sourceSealSha256:D.sha(fs.readFileSync(path.join(OUT,'source-seal.json'))),outcomesComputed:false};
  fs.writeFileSync(path.join(OUT,'resource-receipt.json'),D.canonical({payload:receipt,sha256:D.hash(receipt)})+'\n',{flag:'wx'});console.log(D.canonical(receipt));process.exitCode=state.startsWith('INCOMPLETE')||state==='PARITY-FAILED'?2:0;
 });
}
if(require.main===module)execute();module.exports={OUT,sourceIdentity,terminalState};
