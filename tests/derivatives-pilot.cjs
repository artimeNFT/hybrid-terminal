'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const D=require('../research/derivatives/schema.cjs'),{decodeTradeDocument,loadPinnedTrade}=require('../research/derivatives-pilot/input.cjs'),{createCalculations}=require('../research/derivatives-pilot/calculations.cjs');
const M=require('../research/derivatives-pilot/model.cjs'),{identities,validateSeal}=require('../research/derivatives-pilot.cjs'),original=require('../research/policy-pilot/execution.cjs');
const contract=require('../research/derivatives-pilot/contract.json'),protocol=require('../research/derivatives-pilot/protocol.json'),START=D.START,STEP=D.STEP;
const bars=(n=310)=>Array.from({length:n},(_,i)=>({t:START+i*STEP,o:100,h:101,l:99,c:100,v:100}));
function typed(data,series='trade'){
 const c=D.config({end:START+data.length*STEP}),rows=data.map(b=>[b.t,''+b.o,''+b.h,''+b.l,''+b.c,''+b.v,b.t+STEP-1,''+(b.v*b.c),4,''+(b.v/2),''+(b.v*b.c/2),'0']);
 const payload=D.payload(c,series,rows);return{kind:'hybrid-usdm-public-series',collectorVersion:D.VERSION,payload,dataHash:D.hash(payload),quality:D.quality(payload,D.END,{retrievalComplete:true}),acquisition:{cutoffServerTime:D.END,retrievalComplete:true}};
}
const WAIT={side:'WAIT',plan:null},plan=(sh=false)=>({side:sh?'SHORT':'LONG',short:sh,plan:{entry:100,stop:sh?110:90,tp1:sh?95:105,tp2:sh?90:110}});
function fixture({short=false,edit=()=>{},choose=i=>i===60?plan(short):WAIT,last=189}={}){
 const data=bars();edit(data);const input=decodeTradeDocument(typed(data)),decisions=[];
 const raw=M.execute(input,i=>{const decision=choose(i);decisions.push({index:i,closeTime:START+(i+1)*STEP,decision});return decision},{first:60,last});
 return{input,raw,trades:M.annotate(raw,input,decisions),decisions};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,JSON.stringify({a,b}));
test('separate typed trade gate rejects Mark, Spot, malformed/rehashed source and unbranded inputs',()=>{
 const data=bars(),good=typed(data);assert.equal(decodeTradeDocument(good).dataIdentity.volumeSource,'trade tuple[5] in BTC; never Mark placeholders');
 assert.throws(()=>decodeTradeDocument(typed(data,'mark')),/trade OHLC/);assert.throws(()=>decodeTradeDocument({...good,kind:'hybrid-frozen-spot-dataset'}));
 const wrong=JSON.parse(JSON.stringify(good));wrong.payload.contract.marginAsset='BTC';wrong.dataHash=D.hash(wrong.payload);assert.throws(()=>decodeTradeDocument(wrong));
 assert.throws(()=>createCalculations({kind:'verified-usdm-trade-bars',bars:data,dataIdentity:{series:'trade'}}),/Typed validated/);
 assert.throws(()=>M.execute({bars:data},()=>WAIT),/Typed validated/);
 const input=decodeTradeDocument(good);assert.ok(Object.isFrozen(input.bars[0]));assert.throws(()=>{input.bars[0].v=0});
});
test('frozen original expression/trade parity, next-open LONG/SHORT risk and fee once',()=>{
 for(const sh of [false,true]){const f=fixture({short:sh,edit:b=>{b[61]={...b[61],o:sh?98:102,c:sh?98:102,h:sh?99:103,l:sh?97:101};b[62][sh?'l':'h']=sh?89:111}}),t=f.trades[0];
  assert.equal(t.risk,12);near(t.grossR,8/12);near(t.modeledFee10R,8/12-.001*t.entry/12);assert.equal(t.R,undefined);assert.equal(t.entryIndex,61);
  const old=original.simulate(f.input.bars,i=>i===60?plan(sh):WAIT,{original:true});assert.equal(t.grossR,old[0].grossR);assert.equal(t.modeledFee10R,old[0].R);
 }
});
test('stop-first ambiguity, adverse gap, no favorable target improvement and TP1 touch only',()=>{
 for(const sh of [false,true]){let t=fixture({short:sh,edit:b=>{b[61].l=89;b[61].h=111}}).trades[0];assert.equal(t.exitReason,'stop');assert.equal(t.t1,false);assert.equal(t.sameBarStopTp2,true);assert.equal(t.grossR,-1);
  t=fixture({short:sh,edit:b=>{b[62]={...b[62],o:sh?115:85,c:sh?114:86,h:sh?116:87,l:sh?113:84}}}).trades[0];assert.equal(t.grossR,-1.5);assert.equal(t.stopAtOpen,true);
 }
 const t=fixture({edit:b=>{b[62]={...b[62],o:120,h:122,l:119,c:121}}}).trades[0];assert.equal(t.exit,110);assert.equal(t.exitReason,'TP2');
 const touch=fixture({edit:b=>{b[70].h=106}}).trades[0];assert.equal(touch.t1,true);assert.equal(touch.exitReason,'expiry');
});
test('expiry versus final-bar stop/TP2 preserves separate exit and next-decision bars',()=>{
 const expiry=fixture().trades[0];assert.equal(expiry.exitIndex,180);assert.equal(expiry.nextDecisionIndex,182);assert.equal(expiry.loopExitCursor,181);
 for(const reason of ['stop','TP2']){const t=fixture({edit:b=>{b[180][reason==='stop'?'l':'h']=reason==='stop'?89:111}}).trades[0];assert.equal(t.exitIndex,180);assert.equal(t.nextDecisionIndex,181);assert.equal(t.exitReason,reason)}
});
test('invalid entry/WAIT skip, zone reuse, non-overlap and calendar tail remain exact',()=>{
 const invalid=fixture({edit:b=>{b[61]={...b[61],o:110,c:110,h:111,l:109}}});assert.equal(invalid.trades.length,0);assert.equal(invalid.decisions[1].index,61);
 const reuse=fixture({choose:i=>[60,61,62].includes(i)?plan():WAIT,edit:b=>{b[61].l=89;b[63].h=111}});assert.deepEqual(reuse.trades.map(t=>t.decisionIndex),[60,62]);assert.equal(reuse.decisions.some(d=>d.index===61),false);
 const tail=fixture({last:188,choose:i=>i>=189?plan():WAIT});assert.equal(tail.trades.length,0);assert.equal(tail.decisions.at(-1).index,188);
});
test('fee-only labels, fixed costs, zero/PF availability and deterministic fixture serialization',()=>{
 const f=fixture({edit:b=>{b[61].h=111}}),t=f.trades[0],p=M.population([t]);near(p.afterModeledFees[5].mean,.995);near(p.afterModeledFees[10].mean,.99);near(p.afterModeledFees[20].mean,.98);
 assert.equal(p.afterModeledFees[10].mean,t.modeledFee10R);assert.equal(p.components.funding.valueR,null);assert.equal(p.components.fullyAdjustedReturn.valueR,null);assert.equal(p.label,protocol.label);assert.equal(p.net,undefined);assert.equal(p.costs,undefined);
 const zero=M.population([{...t,grossR:.01}]);assert.equal(zero.afterModeledFees[10].zeros,1);assert.equal(zero.afterModeledFees[10].profitFactor,null);assert.equal(M.population([]).gross.mean,null);
 assert.equal(M.hash(f.trades),M.hash(fixture({edit:b=>{b[61].h=111}}).trades));
});
test('funding zero/missing labels are rejected rather than implying fully adjusted returns',()=>{
 const components=M.components();components.funding.valueR=0;assert.throws(()=>M.validateComponents(components),/explicit null/);
 const t=fixture().trades[0];delete t.components.funding;assert.throws(()=>M.population([t]));
 const bad=fixture().trades[0];bad.components.fullyAdjustedReturn.valueR=bad.modeledFee10R;assert.throws(()=>M.population([bad]));
});
test('typed full-prefix engine matches the reviewed original on two synthetic snapshots',()=>{
 const data=bars(4100).map((b,i)=>{const c=100+Math.sin(i/7)+2*Math.sin(i/23);return{...b,o:c-.1,c:c+.1,h:c+.4,l:c-.4,v:i%17===0?300:100}}),input=decodeTradeDocument(typed(data)),calc=createCalculations(input),plain=createCalculations(input,{memoizeVolumeReference:false}),frames=[3999,4099].map(i=>calc.at(i));
 assert.equal(calc.identity.kind,'usdm-trade-calculation');assert.equal(calc.identity.functionBodiesSha256,contract.source.functionBodiesSha256);assert.notEqual(calc.identity.calculationContractSha256,require('../research/policy-pilot/protocol.json').source.calculationContractSha256);
 for(const f of frames){assert.equal(f.pastBars,f.index+1);assert.equal(M.canonical(f),M.canonical(plain.at(f.index)));assert.equal(f.decision.selection.policy,'higher-score-short-on-tie-before-eligibility')}
 const directory=process.env.HYBRID_QA_DIR||'.qa-results/derivatives-pilot-v1/fixtures';fs.mkdirSync(directory,{recursive:true});const file=path.resolve(directory,'synthetic-bars.json');fs.writeFileSync(file,JSON.stringify(data));
 const code='const fs=require("node:fs"),{createCalculations}=require("./research/preparation/calculations.cjs");const c=createCalculations(JSON.parse(fs.readFileSync(process.argv[1])));console.log(JSON.stringify([3999,4099].map(i=>c.at(i))))';
 const child=spawnSync(process.execPath,['--require',path.resolve('research/source-context/preload.cjs'),'-e',code,file],{encoding:'utf8',timeout:30000});assert.equal(child.status,0,child.stderr);const old=JSON.parse(child.stdout);for(let i=0;i<2;i++)for(const key of ['metrics','decision','volume','dayCoverage'])assert.equal(M.canonical(frames[i][key]),M.canonical(old[i][key]),key);
 assert.deepEqual(calc.deniedCalls(),[]);
});
test('continuous trace/blocks, explicit omitted components and costR/risk distributions',()=>{
 const base={entry:100,risk:10,plan:plan().plan,side:'LONG',t1:true,sameBarStopTp2:false,stopAtOpen:false,components:M.components()};
 const trades=[{...base,decisionIndex:3999,exitIndex:4119,nextDecisionIndex:4121,exitReason:'expiry',grossR:0,modeledFee10R:-.01},{...base,decisionIndex:11457,exitIndex:11500,nextDecisionIndex:11501,exitReason:'TP2',grossR:1,modeledFee10R:.99}].map(t=>({...t,entryIndex:t.decisionIndex+1,entryOpenTime:START+(t.decisionIndex+1)*STEP,exitBarOpenTime:START+t.exitIndex*STEP,holdingBars:t.exitIndex-t.decisionIndex}));
 const map=new Map(trades.map(t=>[t.decisionIndex,t])),decisions=[];for(let i=3999;i<=26375;){const t=map.get(i);decisions.push({index:i,pastBars:i+1,historyStart:START,openTime:START+i*STEP,closeTime:START+(i+1)*STEP,assessment:{calculationState:'ready'},decision:t?plan():WAIT});i=t?t.nextDecisionIndex:i+1}
 const payload={kind:'hybrid-usdm-gross-fee-pilot-raw',label:M.LABEL,components:M.components(),decisions,trades},s=M.validateTrace(payload);assert.equal(s.counts.considered,22213);assert.equal(s.counts.heldSkippedIndices,163);assert.equal(s.counts.expiryCursorSkippedIndices,1);assert.equal(s.blocks[0].n,2);assert.equal(s.all.crossBlockHoldings,1);near(s.all.afterModeledFees[10].mean,.49);assert.equal(s.all.riskBps.median,1000);assert.equal(s.all.costR[10].median,.01);
 assert.equal(s.all.components.funding.valueR,null);payload.components.funding.valueR=0;assert.throws(()=>M.validateTrace(payload));
});
test('all historical sources/seals are unchanged and new seal rejects identity tampering',()=>{
 const old=JSON.parse(fs.readFileSync('research/policy-pilot/seal.json','utf8'));for(const [file,h]of Object.entries(old.identities.implementationChecksums))assert.equal(D.sha(fs.readFileSync(file)),h,file);
 const sealed={identities:identities()};validateSeal(sealed);assert.notEqual(sealed.identities.calculationContractHash,old.identities.calculationContractHash);sealed.identities.dataTradeHash='wrong';assert.throws(()=>validateSeal(sealed));
 assert.equal(protocol.resources.maximumWallSeconds,3600);assert.equal(protocol.resources.realRuns,1);
});
