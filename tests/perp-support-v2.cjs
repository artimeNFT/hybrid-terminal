'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const D=require('../research/derivatives/schema.cjs'),P=require('../research/perp-support-v2/protocol.json'),P1=require('../research/perp-support-v1/protocol.json'),F=require('../research/perp-support-v1/design.cjs');
const original=require('../research/perp-support-v1/calculations.cjs').createCalculations,restricted=require('../research/perp-support-v2/calculations.cjs').createCalculations,{exactFrame}=require('../research/perp-support-v2/parity.cjs');
const T=Date.UTC(2026,6,1),dt=300000,bar=(i,p=100,v=100,range=2)=>({t:T+i*dt,o:p,c:p,h:p+range/2,l:p-range/2,v,closed:true,end:T+(i+1)*dt-1});
test('v2 changes execution only; original protocol, engine, design and pinned identities remain exact',()=>{
 assert.equal(D.hash(P1),P.v1ProtocolCanonicalHash);for(const [k,v]of Object.entries(P.scientificDesign))assert.deepStrictEqual(v,P1[k],k);
 for(const [file,hash]of Object.entries(P.pinnedSources))assert.equal(D.sha(fs.readFileSync(file)),hash,file);
 assert.deepStrictEqual(P.resources.admissionIndices,P1.resources.admissionIndices);assert.equal(P.resources.maximumMonotonicMs,1200000);assert.equal(P.resources.rssBytes,1073741824);
});
test('EXACT original frame, feature and census parity: seed, gap, invalid arithmetic, zero, doji and qualification; no future leakage',()=>{
 const cases=[];
 const seed=Array.from({length:18},(_,i)=>bar(i));seed[14]={...bar(14,104),h:105,l:103};cases.push(seed);
 const volume=Array.from({length:18},(_,i)=>bar(i,100,i===11?150:i===12?210:100,i<10?4:1));cases.push(volume);
 cases.push(volume.map((b,i)=>({...b,v:i<10?0:i===11?0:100})));
 const invalid=volume.map(b=>({...b}));invalid[2].h=NaN;invalid[4].v=Infinity;invalid[6].o=undefined;invalid[8].closed=false;invalid[10]={...bar(10,100,100,0)};cases.push(invalid);
 const overflow=volume.map(b=>({...b}));overflow[10].v=Number.MAX_VALUE;overflow[11].v=-1;overflow[12].t=-1;cases.push(overflow);
 let frames=0;for(const bars of cases){const a=original(bars),b=restricted(bars);for(let i=0;i<bars.length;i++){exactFrame(a,b,i);frames++}assert.deepStrictEqual(a.deniedCalls(),[]);assert.deepStrictEqual(b.deniedCalls(),[]);assert.equal(b.identity.unusedEvaluated,false)}
 const s=restricted(seed);assert.equal(s.at(0).atr,2);assert.equal(s.at(13).atr,2);assert.equal(s.at(14).atr,31/14);
 const v=restricted(volume).at(12);assert.equal(v.recent[10].cls,0);assert.equal(v.recent[11].cls,1);assert.equal(v.recent[12].cls,2);assert.equal(v.recent[12].up,true);
 const prefix=restricted(volume),future=restricted([...volume,{...bar(18,999,1e15,1000),h:NaN}]);assert.deepStrictEqual(prefix.at(12),future.at(12));assert.deepStrictEqual(prefix.census(),future.census());assert.equal(frames,90);
});
test('complete synthetic first episodes/IDs and matching are EXACT against oracle; independent all-zone and global-first/tail expectations',()=>{
 const n=4449,bars=Array.from({length:n},(_,i)=>bar(i,100,100,4));bars[3997]=bar(3997,100,400,.5);bars[3998]=bar(3998,101,100,.5);
 for(let i=3999;i<n;i++)bars[i]=bar(i,104+2*(i-3999),(i-3999)%10===0?400:100,.5);
 const a=original(bars),b=restricted(bars),sa=new Set(),sb=new Set(),ea=[],eb=[];
 for(let i=3999;i<n;i++){const fa=a.at(i),fb=b.at(i);assert.deepStrictEqual(fb,fa);const ra=F.frameRows(fa),rb=F.frameRows(fb);assert.deepStrictEqual(rb,ra);ea.push(...F.takeFirst(ra.rows,sa,n));eb.push(...F.takeFirst(rb.rows,sb,n))}
 assert.deepStrictEqual(eb,ea);assert.deepStrictEqual(b.census(),a.census());
 const expected=Array.from({length:451},(_,j)=>{const sourceIndex=3997+j,decisionIndex=Math.max(3999,sourceIndex+1),block=Math.floor((decisionIndex-3999)/150);return{sourceIndex,decisionIndex,block}});
 const wanted=expected.map(({sourceIndex,decisionIndex,block})=>({id:`BINANCE:USD-M:BTCUSDT:5m:${T+sourceIndex*dt}:SHORT`,sourceIndex,sourceTime:T+sourceIndex*dt,decisionIndex,decisionCloseTime:T+(decisionIndex+1)*dt,side:'SHORT',arm:sourceIndex===3997||(sourceIndex>=3999&&(sourceIndex-3999)%10===0)?'V':'C',block,exclusion:decisionIndex+120>=3999+(block+1)*150?'reserved-tail':null}));
 assert.deepStrictEqual(eb.map(r=>Object.fromEntries(Object.keys(wanted[0]).map(k=>[k,r[k]]))),wanted);
 assert.equal(eb.filter(r=>r.arm==='V').length,46);assert.equal(eb.filter(r=>r.arm==='C').length,405);assert.equal(eb.filter(r=>!r.exclusion).length,91);assert.equal(eb.filter(r=>!r.exclusion&&r.arm==='V').length,10);assert.equal(eb.filter(r=>r.exclusion).length,360);
 const ma=F.match(ea.filter(r=>!r.exclusion)),mb=F.match(eb.filter(r=>!r.exclusion));assert.deepStrictEqual(mb,ma);assert.equal(D.hash(mb),D.hash(ma));assert.deepStrictEqual(F.summarize(eb,mb),F.summarize(ea,ma));
});
test('complete CEM output independently specified: type7 equality lower, constants, all-row weights and unsupported cells',()=>{
 const row=(id,arm,x)=>({id,arm,side:'SHORT',priorEdgeTouch:false,weekend:false,utcSixHourBucket:0,block:0,midpointDistanceAtr:x,zoneWidthAtr:1,logAge:0,atrPercentile:.5,logAtrClose:-5});
 const groups=[{v:['va1','va2'],c:['ca1','ca2','ca3'],x:1,w:2/3},{v:['vb'],c:['cb1','cb2','cb3','cb4'],x:2,w:.25},{v:['vc'],c:['cc1','cc2'],x:3,w:null}],rows=groups.flatMap(g=>[...g.v.map(id=>row(id,'V',g.x)),...g.c.map(id=>row(id,'C',g.x))]);
 const cuts={midpointDistanceAtr:{state:'terciles',cuts:[1,2],constant:null},...Object.fromEntries([['zoneWidthAtr',1],['logAge',0],['atrPercentile',.5],['logAtrClose',-5]].map(([k,v])=>[k,{state:'constant-one-bin',cuts:[],constant:v}]))};
 const cells=[],weighted=[],unmatched=[];for(let j=0;j<groups.length;j++){const g=groups[j],key=`SHORT|0|0|0|0|${j}|0|0|0|0`,retained=j<2;cells.push({key,nV:g.v.length,nC:g.c.length,retained,controlWeight:g.w,weightSumV:retained?g.v.length:0,weightSumC:retained?g.c.length*g.w:0});for(const r of rows.filter(r=>r.midpointDistanceAtr===g.x))(retained?weighted:unmatched).push({...r,cell:key,weight:retained?(r.arm==='V'?1:g.w):null,unmatchedReason:retained?null:'fewer-than-3-distinct-C'})}
 const expected={cutpoints:cuts,cells,weighted,unmatched};assert.deepStrictEqual(F.match(rows),expected);assert.equal(D.hash(F.match(rows)),D.hash(expected));
});
test('same eligibility boundaries and unavailable states are exact, no narrowed population',()=>{
 for(const side of ['LONG','SHORT'])for(const age of [0,1,300,301])for(const cls of [0,1,2]){
  const z={index:3999-age,t:T+(3999-age)*dt,o:side==='SHORT'?100:104,c:side==='SHORT'?104:100,h:104,l:100,cls,up:side==='SHORT',reference:{state:'ready'}},c={index:3999,t:T+3999*dt,o:side==='SHORT'?105:99,c:side==='SHORT'?105:99,h:side==='SHORT'?106:99.5,l:side==='SHORT'?104.2:98.5,cls:0,reference:{state:'ready'}},f={index:3999,closeTime:T+4000*dt,validDecision:true,atr:1,priorAtr:Array(288).fill(1),recent:[z,c]},r=F.frameRows(f).rows;
  assert.equal(r.length,(age>=1&&age<=300&&cls!==1)?1:0);if(r.length){assert.equal(r[0].side,side);assert.equal(r[0].arm,cls===2?'V':'C')}
 }
 // Unchanged scientific boundary logic is also verified independently in tests/perp-support.cjs.
 assert.deepStrictEqual(F.blocks(35424),[[3999,14474],[14474,24949],[24949,35424]]);
});
test('v2 has no alternate paths/resume/resource overrides and incomplete receipts cannot pass',()=>{
 const C=require('../research/perp-support-v2.cjs'),before=fs.existsSync(C.OUT),r=spawnSync(process.execPath,['research/perp-support-v2.cjs','--resume'],{encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/No resume/);assert.equal(fs.existsSync(C.OUT),before);
 assert.equal(C.terminalState(0,{state:'PARITY-FAILED'},false),'PARITY-FAILED');assert.equal(C.terminalState(0,{preparationComplete:true,state:'DESIGN-GATES-PASS'},true),'INCOMPLETE-RESOURCE-STOP');
});
