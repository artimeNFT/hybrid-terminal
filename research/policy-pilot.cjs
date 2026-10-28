#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{Worker}=require('node:worker_threads');
const protocol=require('./policy-pilot/protocol.json'),{canonical,hash,validateTrace}=require('./policy-pilot/summary.cjs');
const {checkSources}=require('./calculation-contract.cjs'),{loadVerifiedDataset}=require('./readiness-audit.cjs');
const root=path.resolve(__dirname,'..'),sealFile=path.join(__dirname,'policy-pilot/seal.json'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=['research/policy-pilot.cjs',...['protocol.json','REVIEW_CONTRACT.md','execution.cjs','summary.cjs','worker.cjs'].map(f=>'research/policy-pilot/'+f),
 'research/preparation/calculations.cjs','research/preparation/protocol.json','research/preparation/features.cjs','research/calculation-contract.cjs','research/contract/v1.json',
 'research/source-context/preload.cjs','research/source-context/html-0.4.3-v1.json','tests/results/calculation-readiness-v1/REPORT.md','tests/policy-pilot.cjs','scripts/run-qa.cjs'];
const writeNew=(file,value)=>fs.writeFileSync(file,canonical(value),{flag:'wx'});
function identities(){
 const c=checkSources(),binding=require('./source-context/preload.cjs').identity;
 assert.equal(c.contractSha256,protocol.source.calculationContractSha256);assert.equal(c.canonicalDataHash,protocol.data.canonicalHash);
 assert.equal(binding.physicalSourceSha256,protocol.source.applicationSha256);
 assert.equal(binding.activeApplicationSha256,'a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a','Active app must remain0.4.17');
 const m=protocol.measurement;assert.equal(m.lastDecisionIndex,protocol.data.rows-121);assert.equal(m.admissibleDecisionIndices,m.lastDecisionIndex-m.firstDecisionIndex+1);
 const width=m.admissibleDecisionIndices/3;assert.ok(Number.isInteger(width));
 assert.equal(canonical(m.blocksHalfOpen),canonical(Array.from({length:3},(_,i)=>[m.firstDecisionIndex+i*width,m.firstDecisionIndex+(i+1)*width])));
 return{protocolHash:hash(protocol),protocolFileSha256:sha(fs.readFileSync(path.join(__dirname,'policy-pilot/protocol.json'))),
  calculationContractHash:c.contractSha256,dataCanonicalHash:c.canonicalDataHash,dataFileSha256:protocol.data.fileSha256,
  frozenSourceSha256:binding.physicalSourceSha256,activeApplicationSha256:binding.activeApplicationSha256,
  sourceBinding:{contextId:binding.contextId,bindingSha256:binding.bindingSha256,loaderSha256:binding.loaderSha256},
  pinnedSourceChecksums:c.sourceChecksums,implementationChecksums:Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]))};
}
function validateSeal(sealed){assert.equal(canonical(sealed.identities),canonical(identities()),'Sealed protocol/source/data identities changed');return sealed.identities}
function checkedSeal(out){const sealed=JSON.parse(fs.readFileSync(sealFile));validateSeal(sealed);assert.equal(canonical(sealed),fs.readFileSync(path.join(out,'seal.json'),'utf8'));return sealed.identities}
function seal(dataset,out){
 const identitiesValue=identities(),{bars,identity}=loadVerifiedDataset(dataset);
 assert.equal(bars.length,protocol.data.rows);assert.equal(sha(fs.readFileSync(dataset)),protocol.data.fileSha256);
 const value={kind:'hybrid-policy-pilot-pre-outcome-seal',writtenAt:new Date().toISOString(),reviewCheckpoint:protocol.reviewCheckpoint,
  identities:identitiesValue,validatedData:identity,realRunsBeforeSeal:0,purpose:'Fixed corrected contract and implementation before new Q3 outcomes; synthetic fixtures are not Q3 outcomes'};
 fs.mkdirSync(out,{recursive:true});writeNew(sealFile,value);writeNew(path.join(out,'seal.json'),value);return value;
}
async function run(dataset,out){
 const identity=checkedSeal(out),{bars,identity:data}=loadVerifiedDataset(dataset);
 assert.equal(bars.length,protocol.data.rows);assert.equal(sha(fs.readFileSync(dataset)),identity.dataFileSha256);
 const started=performance.now(),runtimeFile=path.join(out,'runtime.json');
 // Exclusive claim persists on failure. Never automatically retry a real run.
 writeNew(path.join(out,'attempt.json'),{startedAt:new Date().toISOString(),identity,maximumWallSeconds:protocol.resources.maximumWallSeconds});
 writeNew(runtimeFile,{state:'running',identity});let worker,timer;
 try{
  const result=await new Promise((resolve,reject)=>{
   worker=new Worker(path.join(__dirname,'policy-pilot/worker.cjs'),{workerData:{bars,out},resourceLimits:{maxOldGenerationSizeMb:protocol.resources.workerHeapMb}});
   timer=setTimeout(()=>reject(Error('Declared3600-second calculation cap exceeded')),Math.max(1,protocol.resources.maximumWallSeconds*1000-(performance.now()-started)));
   let complete=false;
   worker.on('message',m=>{if(m.type==='progress'){fs.appendFileSync(path.join(out,'progress.jsonl'),JSON.stringify(m.value)+'\n');console.log(JSON.stringify(m.value))}
    else if(m.type==='complete'){complete=true;resolve(m.value)}});
   worker.on('error',reject);worker.on('exit',code=>{if(code!==0||!complete)reject(Error('Pilot worker incomplete: '+code))});
  });clearTimeout(timer);
  const payload={...result.payload,identity},rawHash=hash(payload),summary=validateTrace(payload);
  assert.equal(canonical(summary),canonical(result.summary));
  const runtime={state:'complete',wallSeconds:(performance.now()-started)/1000,...result.runtime,completedAt:new Date().toISOString(),node:process.version,dataIdentity:data,calculationIdentity:result.calculationIdentity};
  assert.ok(runtime.wallSeconds<=protocol.resources.maximumWallSeconds,'Resource cap exceeded before publication');
  writeNew(path.join(out,'raw.json'),payload);writeNew(path.join(out,'summary.json'),summary);
  writeNew(path.join(out,'result.json'),{state:'complete',identity,rawHash,summaryHash:hash(summary),runtime});
  fs.writeFileSync(runtimeFile,canonical(runtime));return{rawHash,summary,runtime};
 }catch(error){fs.writeFileSync(runtimeFile,canonical({state:'incomplete',wallSeconds:(performance.now()-started)/1000,error:error.message,identity}));throw error}
 finally{clearTimeout(timer);if(worker)await worker.terminate()}
}
function verify(out){
 const identity=checkedSeal(out),result=JSON.parse(fs.readFileSync(path.join(out,'result.json'))),runtime=JSON.parse(fs.readFileSync(path.join(out,'runtime.json')));
 assert.equal(result.state,'complete');assert.equal(runtime.state,'complete');assert.ok(runtime.wallSeconds<=protocol.resources.maximumWallSeconds);
 assert.equal(canonical(result.identity),canonical(identity));
 const rawBytes=fs.readFileSync(path.join(out,'raw.json'),'utf8'),payload=JSON.parse(rawBytes),summary=validateTrace(payload);
 assert.equal(rawBytes,canonical(payload));assert.equal(canonical(payload.identity),canonical(identity));assert.equal(hash(payload),result.rawHash);
 assert.equal(canonical(summary),fs.readFileSync(path.join(out,'summary.json'),'utf8'));assert.equal(hash(summary),result.summaryHash);
 return{state:'verified-without-new-calculations-or-outcomes',rawHash:result.rawHash,summaryHash:result.summaryHash,summary};
}
async function main(){
 const [command,...args]=process.argv.slice(2),options=new Map();assert.ok(['seal','run','verify'].includes(command),'Usage: node --require ./research/source-context/preload.cjs research/policy-pilot.cjs seal|run|verify --out <fresh-ignored-directory> [--dataset <existing-Q3>]');
 for(let i=0;i<args.length;i+=2){assert.ok(['--dataset','--out'].includes(args[i])&&args[i+1]&&!options.has(args[i]));options.set(args[i],args[i+1])}
 assert.ok(options.has('--out'));const out=path.resolve(options.get('--out'));assert.ok(out.startsWith(path.join(root,'.qa-results')+path.sep),'Raw output must stay ignored');
 if(command==='verify')return verify(out);assert.ok(options.has('--dataset'));const dataset=path.resolve(options.get('--dataset'));
 return command==='seal'?seal(dataset,out):run(dataset,out);
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack);process.exitCode=1});
module.exports={protocol,identities,seal,checkedSeal,validateSeal,run,verify};
