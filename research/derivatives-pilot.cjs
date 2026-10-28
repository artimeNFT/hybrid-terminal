#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{Worker}=require('node:worker_threads');
const protocol=require('./derivatives-pilot/protocol.json'),{canonical,hash,validateTrace}=require('./derivatives-pilot/model.cjs');
const contract=require('./derivatives-pilot/contract.json'),{loadPinnedTrade}=require('./derivatives-pilot/input.cjs');
const root=path.resolve(__dirname,'..'),sealFile=path.join(__dirname,'derivatives-pilot/seal.json'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=['research/derivatives-pilot.cjs',...['protocol.json','contract.json','REVIEW_CONTRACT.md','input.cjs','calculations.cjs','model.cjs','worker.cjs'].map(f=>'research/derivatives-pilot/'+f), 'research/derivatives/schema.cjs','research/klines.cjs','research/policy-pilot/execution.cjs','research/policy-pilot/summary.cjs','research/policy-pilot/protocol.json','research/preparation/features.cjs','research/preparation/protocol.json','research/preparation/calculations.cjs','research/calculation-contract.cjs','research/contract/v1.json','research/readiness-audit.cjs','research/audit/adapter.cjs','research/audit/protocol.json','tests/results/calculation-readiness-v1/REPORT.md'];
const writeNew=(file,value)=>fs.writeFileSync(file,canonical(value),{flag:'wx'});
function identities(){
 assert.equal(Number(process.versions.node.split('.')[0]),24);
 const engine=sha(fs.readFileSync(path.join(root,contract.source.engineFile)));assert.equal(engine,contract.source.engineSha256);
 assert.equal(sha(fs.readFileSync(path.join(__dirname,'derivatives-pilot/contract.json'))),protocol.calculationContractSha256);
 const m=protocol.measurement;assert.equal(m.lastDecisionIndex,contract.data.rows-121);assert.equal(m.admissibleDecisionIndices,m.lastDecisionIndex-m.firstDecisionIndex+1);
 assert.equal(canonical(m.blocksHalfOpen),canonical(Array.from({length:3},(_,i)=>[m.firstDecisionIndex+i*m.admissibleDecisionIndices/3,m.firstDecisionIndex+(i+1)*m.admissibleDecisionIndices/3])));
 return{kind:'separate-usdm-calculation-protocol-binding',protocolHash:hash(protocol),protocolFileSha256:sha(fs.readFileSync(path.join(__dirname,'derivatives-pilot/protocol.json'))),calculationContractHash:protocol.calculationContractSha256,dataTradeHash:contract.data.tradeHash,dataBundleHash:contract.data.bundleHash,frozenEngineSha256:engine,components:protocol.components,companionProvenance:protocol.provenanceOnly,
 implementationChecksums:Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]))};
}
function validateSeal(sealed){assert.equal(canonical(sealed.identities),canonical(identities()),'Sealed derivatives protocol/source/data identities changed');return sealed.identities}
function checkedSeal(out){const sealed=JSON.parse(fs.readFileSync(sealFile));validateSeal(sealed);assert.equal(canonical(sealed),fs.readFileSync(path.join(out,'seal.json'),'utf8'));return sealed.identities}
function seal(dataset,out){
 const identitiesValue=identities(),{input,identity}=loadPinnedTrade(dataset);
 assert.equal(input.bars.length,protocol.data.rows);
 const value={kind:'hybrid-usdm-gross-fee-pre-outcome-seal',writtenAt:new Date().toISOString(),reviewCheckpoint:protocol.reviewCheckpoint,
  identities:identitiesValue,validatedData:identity,realRunsBeforeSeal:0,purpose:'Separate derivatives trade-only protocol/data/source before outcomes; funding is unapplied/unknown, never zero'};
 fs.mkdirSync(out,{recursive:true});writeNew(sealFile,value);writeNew(path.join(out,'seal.json'),value);return value;
}
async function run(dataset,out){
 const identity=checkedSeal(out),{input,identity:data}=loadPinnedTrade(dataset);
 assert.equal(input.bars.length,protocol.data.rows);assert.equal(data.fileSha256,JSON.parse(fs.readFileSync(sealFile)).validatedData.fileSha256);
 const started=performance.now(),runtimeFile=path.join(out,'runtime.json');
 // Exclusive claim persists on failure. Never automatically retry a real run.
 writeNew(path.join(out,'attempt.json'),{startedAt:new Date().toISOString(),identity,maximumWallSeconds:protocol.resources.maximumWallSeconds});
 writeNew(runtimeFile,{state:'running',identity});let worker,timer;
 try{
  const result=await new Promise((resolve,reject)=>{
   worker=new Worker(path.join(__dirname,'derivatives-pilot/worker.cjs'),{workerData:{file:dataset,out},resourceLimits:{maxOldGenerationSizeMb:protocol.resources.workerHeapMb}});
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
 const [command,...args]=process.argv.slice(2),options=new Map();assert.ok(['seal','run','verify'].includes(command),'Usage: node research/derivatives-pilot.cjs seal|run|verify --out <fresh-ignored-directory> [--dataset <existing-Q3>]');
 for(let i=0;i<args.length;i+=2){assert.ok(['--dataset','--out'].includes(args[i])&&args[i+1]&&!options.has(args[i]));options.set(args[i],args[i+1])}
 assert.ok(options.has('--out'));const out=path.resolve(options.get('--out'));assert.ok(out.startsWith(path.join(root,'.qa-results')+path.sep),'Raw output must stay ignored');
 if(command==='verify')return verify(out);assert.ok(options.has('--dataset'));const dataset=path.resolve(options.get('--dataset'));
 return command==='seal'?seal(dataset,out):run(dataset,out);
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack);process.exitCode=1});
module.exports={protocol,identities,seal,checkedSeal,validateSeal,run,verify};
