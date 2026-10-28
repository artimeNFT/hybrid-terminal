'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {simulate,annotate,sources}=require('../research/policy-pilot/execution.cjs');
const {statistics,population,canonical,hash,validateTrace}=require('../research/policy-pilot/summary.cjs');
const {createCalculations}=require('../research/preparation/calculations.cjs'),{createAdapter}=require('../research/audit/adapter.cjs');
const {identities,validateSeal,protocol}=require('../research/policy-pilot.cjs');
const step=300000,origin=Date.UTC(2026,6,1),WAIT={side:'WAIT',plan:null},plan=(short=false)=>({side:short?'SHORT':'LONG',short,plan:{entry:100,stop:short?110:90,tp1:short?95:105,tp2:short?90:110,rr:1}});
const bars=(n=310)=>Array.from({length:n},(_,i)=>({t:origin+i*step,o:100,h:101,l:99,c:100,v:100}));
function fixture({short=false,edit=()=>{},decide=i=>i===60?plan(short):WAIT,first=60,last=189}={}){
 const data=bars();edit(data);const decisions=[];
 const get=i=>{const decision=decide(i);decisions.push({index:i,closeTime:origin+(i+1)*step,decision});return decision};
 const raw=simulate(data,get,{first,last}),trades=annotate(raw,data,decisions);
 return{data,decisions,trades,raw};
}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,JSON.stringify({actual:a,expected:b}));
test('pinned frozen execution body, exact original trade projection and declared bounds',()=>{
 assert.ok(sources().body.includes('i=j+1'));const f=fixture({edit:k=>{k[65].h=111}}),old=simulate(f.data,i=>i===60?plan():WAIT,{original:true});
 const projection=t=>Object.fromEntries(['R','grossR','entry','exit','sh','t1'].map(k=>[k,t[k]]));
 assert.equal(canonical(f.raw.map(projection)),canonical(old));assert.equal(f.trades[0].exitIndex,65);
 assert.throws(()=>simulate(f.data,()=>WAIT,{first:60,last:190}),/follow-up/);
});
test('next-open price and risk denominator, LONG/SHORT symmetry',()=>{
 const results=[false,true].map(short=>fixture({short,edit:k=>{k[61]={...k[61],o:short?98:102,c:short?98:102,h:short?99:103,l:short?97:101};k[62][short?'l':'h']=short?89:111}}).trades[0]);
 for(const t of results){assert.equal(t.risk,12);close(t.grossR,8/12);assert.equal(t.exitReason,'TP2');assert.equal(t.holdingBars,2)}
 close(results[0].R,8/12-.001*102/12);close(results[1].R,8/12-.001*98/12);
});
test('adverse gap stops at open, with no favorable target improvement',()=>{
 for(const short of [false,true]){const t=fixture({short,edit:k=>{k[62]={...k[62],o:short?115:85,c:short?114:86,h:short?116:87,l:short?113:84}}}).trades[0];assert.equal(t.exit,short?115:85);assert.equal(t.stopAtOpen,true);assert.equal(t.grossR,-1.5)}
 const t=fixture({edit:k=>{k[62]={...k[62],o:120,c:121,h:122,l:119}}}).trades[0];assert.equal(t.exit,110);assert.equal(t.exitReason,'TP2');
});
test('stop-first same-bar ambiguity preserves original TP1 flag',()=>{
 for(const short of [false,true]){const t=fixture({short,edit:k=>{k[61]={...k[61],l:89,h:111}}}).trades[0];assert.equal(t.grossR,-1);assert.equal(t.sameBarStopTp2,true);assert.equal(t.t1,false);assert.equal(t.exitReason,'stop')}
});
test('TP1 is touch only; expiry keeps distinct exit and next-decision coordinates',()=>{
 const t=fixture({edit:k=>{k[70].h=106;k[180].c=100.5}}).trades[0];
 assert.equal(t.t1,true);assert.equal(t.exitReason,'expiry');assert.equal(t.exitIndex,180);assert.equal(t.nextDecisionIndex,182);assert.equal(t.loopExitCursor,181);assert.equal(t.holdingBars,120);assert.equal(t.exit,100.5);
});
test('stop/TP2 exactly on final follow-up bar preserve hit cursor',()=>{
 for(const reason of ['stop','TP2']){const t=fixture({edit:k=>{k[180][reason==='stop'?'l':'h']=reason==='stop'?89:111}}).trades[0];assert.equal(t.exitReason,reason);assert.equal(t.exitIndex,180);assert.equal(t.nextDecisionIndex,181);assert.equal(t.loopExitCursor,180)}
});
test('invalid directional next-open entries skip by one without a substitute plan',()=>{
 for(const short of [false,true])for(const opening of [90,110]){
  const f=fixture({short,edit:k=>{k[61]={...k[61],o:opening,c:opening,h:opening+1,l:opening-1}}});assert.equal(f.trades.length,0);assert.equal(f.decisions[1].index,61);
 }
 const f=fixture({decide:i=>i===60?{side:'LONG',plan:null}:WAIT});assert.equal(f.trades.length,0);assert.equal(f.decisions[1].index,61);
});
test('one-position scheduling and repeated use of a zone remain allowed',()=>{
 const f=fixture({edit:k=>{k[61].l=89;k[63].h=111},decide:i=>[60,61,62].includes(i)?{...plan(),zoneId:'same-zone'}:WAIT});
 assert.deepEqual(f.trades.map(t=>t.decisionIndex),[60,62]);assert.equal(f.decisions.some(d=>d.index===61),false);assert.equal(f.trades[1].nextDecisionIndex,64);
});
test('calendar tail exclusion applies even when a late candidate could exit early',()=>{
 const f=fixture({last:188,edit:k=>{k[189].h=111},decide:i=>i>=189?plan():WAIT});assert.equal(f.trades.length,0);assert.equal(f.decisions.at(-1).index,188);
 const last=fixture({decide:i=>i===189?plan():WAIT}).trades[0];assert.equal(last.exitIndex,309);assert.equal(last.nextDecisionIndex,311);
});
test('continuous schedule crosses calendar blocks without a position reset',()=>{
 const f=fixture({decide:i=>i>=100?plan():WAIT});assert.equal(f.trades.length,1);assert.equal(f.trades[0].decisionIndex,100);assert.equal(f.trades[0].exitIndex,220);assert.equal(f.trades[0].nextDecisionIndex,222);
 assert.equal(f.decisions.some(d=>d.index===102||d.index===144),false);
});
test('5/10/20bps replace baseline once; zero and undefined profit-factor states',()=>{
 const t={grossR:1,entry:100,risk:10};
 for(const [bps,expected]of [[5,.995],[10,.99],[20,.98]])close(statistics([t],bps).mean,expected);
 const zero=statistics([{...t,grossR:.01}],10);assert.equal(zero.zeros,1);assert.equal(zero.winFraction,0);assert.equal(zero.profitFactor,null);assert.equal(zero.profitFactorState,'no-loss-denominator');
 const s=statistics([t,{...t,grossR:-1}],10);close(s.gainsR,.99);close(s.lossesR,1.01);close(s.profitFactor,.99/1.01);assert.equal(s.winFraction,.5);
 assert.equal(statistics([],10).profitFactorState,'no-trades');assert.equal(statistics([],10).mean,null);assert.throws(()=>statistics([{...t,risk:0}],10));assert.throws(()=>statistics([t],15));
});
test('identical small-fixture canonical rerun, original baseline10bps and summary flags',()=>{
 const options={edit:k=>{k[61].h=111;k[61].l=89}},a=fixture(options),b=fixture(options);assert.equal(hash(a.trades),hash(b.trades));
 const t=a.trades[0];assert.equal(statistics([t],10).mean,t.R);const p=population(a.trades);assert.equal(p.sameBarStopTp2,1);assert.equal(p.sameBarStopTp2Fraction,1);assert.equal(p.exitReasons.stop,1);assert.equal(p.tp1Touch,0);
 assert.throws(()=>canonical({missing:NaN}));
});
test('actual full-prefix decision snapshot parity with reviewed adapter on deterministic history',()=>{
 const data=bars(4100).map((b,i)=>{const center=100+Math.sin(i/7)+Math.sin(i/23)*2;return{...b,o:center-.1,c:center+.1,h:center+.4,l:center-.4,v:i%17===0?300:100}});
 const calc=createCalculations(data),plain=createCalculations(data,{memoizeVolumeReference:false}),reference=createAdapter();
 for(const index of [3999,4099]){const f=calc.at(index),g=plain.at(index);reference.load(data.slice(0,index+1));const r=reference.snapshot(data[index].t);
  assert.equal(canonical(f),canonical(g));for(const key of ['decision','metrics','volume','dayCoverage'])assert.equal(canonical(f[key]),canonical(r[key]),key);
  assert.equal(f.historyStart,origin);assert.equal(f.pastBars,index+1);assert.equal(f.decision.selection.policy,'higher-score-short-on-tie-before-eligibility');
 }
 assert.deepEqual(calc.deniedCalls(),[]);assert.deepEqual(reference.deniedCalls(),[]);
});
test('declaration identities and seal tamper rejection without modifying a frozen file',()=>{
 const sealed={identities:identities()};validateSeal(sealed);sealed.identities.dataCanonicalHash='altered';assert.throws(()=>validateSeal(sealed),/identities changed/);
 assert.equal(protocol.resources.maximumWallSeconds,3600);assert.equal(protocol.resources.realRuns,1);
 assert.deepEqual(protocol.measurement.blocksHalfOpen,[[3999,11458],[11458,18917],[18917,26376]]);
 const out=process.env.HYBRID_QA_DIR;if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'fixture-contract.json'),JSON.stringify({protocolHash:hash(protocol),applicationBytesChanged:false,acquiredDataUsed:false,scope:'Independent synthetic execution/scheduling/cost expectations plus existing-adapter snapshot parity; not another real origin audit'},null,2)+'\n')}
});
test('independent trace accounting, continuous block attribution and corruption rejection',()=>{
 const trades=[{decisionIndex:3999,exitIndex:4119,nextDecisionIndex:4121,exitReason:'expiry',grossR:0},
  {decisionIndex:11457,exitIndex:11500,nextDecisionIndex:11501,exitReason:'TP2',grossR:1}].map(t=>({...t,entryIndex:t.decisionIndex+1,entry:100,risk:10,plan:{stop:90},R:t.grossR-.01,
   entryOpenTime:origin+(t.decisionIndex+1)*step,exitBarOpenTime:origin+t.exitIndex*step,holdingBars:t.exitIndex-t.decisionIndex,side:'LONG',t1:t.grossR>0,sameBarStopTp2:false,stopAtOpen:false}));
 const map=new Map(trades.map(t=>[t.decisionIndex,t])),decisions=[];
 for(let index=3999;index<=26375;){const trade=map.get(index);decisions.push({index,pastBars:index+1,historyStart:origin,openTime:origin+index*step,closeTime:origin+(index+1)*step,assessment:{calculationState:'ready'},decision:trade?plan():WAIT});index=trade?trade.nextDecisionIndex:index+1}
 const payload={decisions,trades},s=validateTrace(payload);assert.equal(s.counts.considered,22213);assert.equal(s.counts.heldSkippedIndices,163);assert.equal(s.counts.expiryCursorSkippedIndices,1);assert.equal(s.counts.waitOrNoPlan,22211);assert.equal(s.counts.invalidNextOpenEntries,0);
 assert.equal(s.all.crossBlockHoldings,1);assert.equal(s.blocks[0].n,2);assert.equal(s.blocks[1].n,0);close(s.all.costs[10].mean,.49);assert.equal(s.all.holdingBars.mean,81.5);
 decisions[1].index++;assert.throws(()=>validateTrace(payload));
});
