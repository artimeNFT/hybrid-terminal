'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const F=require('../research/perp-support-v1/design.cjs'),D=require('../research/derivatives/schema.cjs'),{createCalculations}=require('../research/perp-support-v1/calculations.cjs'),{admission,limitState}=require('../research/perp-support-v1/resources.cjs'),{terminalState,OUT}=require('../research/perp-support-v1.cjs');
const T=Date.UTC(2026,6,1),dt=300000,near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
const row=(id,arm='V',extra={})=>({id,arm,side:'SHORT',priorEdgeTouch:false,weekend:false,utcSixHourBucket:0,block:0,midpointDistanceAtr:1,zoneWidthAtr:1,logAge:Math.log(10),atrPercentile:.5,logAtrClose:-5,ageBars:10,nearEdgeDistanceAtr:.5,bodyFraction:.5,upperWickFraction:.25,lowerWickFraction:.25,weekday:3,period:'Q3',decisionIndex:4000,decisionDayUtc:'2026-07-15',source:{doji:false},...extra});
function frame(side='SHORT'){
 const z={index:3900,t:T+3900*dt,o:side==='SHORT'?100:104,c:side==='SHORT'?104:100,h:104,l:100,cls:2,reference:{state:'ready'}},c={index:3999,t:T+3999*dt,o:side==='SHORT'?105:99,c:side==='SHORT'?105:99,h:side==='SHORT'?106:99.5,l:side==='SHORT'?104.2:98.5,cls:0,reference:{state:'ready'}};
 return{index:3999,closeTime:T+4000*dt,validDecision:true,atr:1,priorAtr:Array(288).fill(1),recent:[z,c]};
}
test('Local all-zone qualification, exclusive arms, doji direction and strict/equality touches use frozen helpers',()=>{
 for(const side of ['LONG','SHORT']){const f=frame(side),r=F.frameRows(f).rows;assert.equal(r.length,1);assert.equal(r[0].side,side);assert.equal(r[0].arm,'V');assert.equal(r[0].original.midpoint,102);assert.equal(r[0].ageBars,99);assert.equal(r[0].atrPercentile,.5);assert.equal(r[0].midpointDistanceAtr,3);f.recent[0].cls=0;assert.equal(F.frameRows(f).rows[0].arm,'C');f.recent[0].cls=1;assert.equal(F.frameRows(f).rows.length,0);f.recent[0].cls=2;f.recent[0].reference.state='zero-reference';assert.equal(F.frameRows(f).rows.length,0)}
 const f=frame();f.recent[0].c=f.recent[0].o;assert.equal(F.frameRows(f).rows[0].side,'SHORT');const path={...f.recent[1],index:3998,l:104};f.recent.splice(1,0,path);assert.equal(F.frameRows(f).rows[0].priorEdgeTouch,true);path.l=102;assert.equal(F.frameRows(f).rows.length,0);path.l=104;f.recent.at(-1).c=110;assert.equal(F.frameRows(f).rows.length,1);f.recent.at(-1).c=110.00001;assert.equal(F.frameRows(f).rows.length,0);
 f.recent[0].h=f.recent[0].l;assert.equal(F.frameRows(f).rows.length,0);
});
test('pinned actual functions classify climax once, preserve Local doji and source qualification; future append cannot enter prefix',()=>{
 const b=Array.from({length:13},(_,i)=>({t:T+i*dt,o:100,c:100,h:i<10?102:100.5,l:i<10?98:99.5,v:i===11?150:i===12?210:100,closed:true,end:T+(i+1)*dt-1})),calc=createCalculations(b),f=calc.at(12);
 assert.equal(f.recent[10].cls,0);assert.equal(f.recent[11].cls,1);assert.equal(f.recent[12].cls,2);assert.equal(f.recent[12].up,true);assert.equal(F.sourceArm(f.recent[12]),'V');assert.equal(F.sourceArm(f.recent[0]),null);assert.equal(calc.identity.selectionExtracted,false);assert.deepEqual(calc.deniedCalls(),[]);
 const later=b.concat([{t:T+13*dt,o:999,h:9999,l:1,c:777,v:1e10,closed:true}]);assert.deepEqual(createCalculations(later).at(12),f);
 const zeros=b.map((x,i)=>({...x,v:i<10?0:100}));assert.equal(F.sourceArm(createCalculations(zeros).at(10).recent[10]),null);
});
test('GLOBAL first valid episode precedes block-tail exclusion; no later resurrection and exact three blocks',()=>{
 assert.deepEqual(F.blocks(35424),[[3999,14474],[14474,24949],[24949,35424]]);const seen=new Set(),n=4389;
 const first=F.takeFirst([row('one','V',{decisionIndex:4110})],seen,n);assert.equal(first[0].exclusion,'reserved-tail');const next=F.takeFirst([row('one','V',{decisionIndex:4130}),row('two','C',{decisionIndex:4130})],seen,n);assert.equal(next.length,1);assert.equal(next[0].id,'two');assert.equal(next[0].exclusion,null);
 const f=frame();f.priorAtr.pop();assert.equal(F.frameRows(f).invalid,'prior288-ATR-unavailable');f.priorAtr.push(1);f.validDecision=false;assert.equal(F.frameRows(f).invalid,'decision-unavailable');
});
test('V type7 terciles, deduplication, equality-lower bins and constants are deterministic',()=>{
 assert.equal(F.type7([0,3,6,9],1/3),3);assert.equal(F.type7([0,3,6,9],2/3),6);const a=[1,1,1,2].map((x,i)=>row('v'+i,'V',{midpointDistanceAtr:x})),cuts=F.cutpoints(a);assert.deepEqual(cuts.midpointDistanceAtr.cuts,[1]);assert.equal(F.bin(1,[1]),0);assert.equal(F.bin(1.001,[1]),1);assert.equal(cuts.zoneWidthAtr.state,'constant-one-bin');assert.deepEqual(cuts.zoneWidthAtr.cuts,[]);assert.equal(F.cutpoints([]).logAge.state,'no-V');
});
test('one cell uses all rows, distinct controls and declared weight sums; no substitute matching',()=>{
 const rows=[row('v1'),row('v2'),row('c1','C'),row('c2','C'),row('c3','C')],m=F.match(rows);assert.equal(m.weighted.length,5);assert.equal(m.cells[0].controlWeight,2/3);near(m.weighted.filter(r=>r.arm==='C').reduce((s,r)=>s+r.weight,0),2);assert.equal(m.weighted.filter(r=>r.arm==='V').reduce((s,r)=>s+r.weight,0),2);assert.equal(F.match(rows.slice(0,4)).weighted.length,0);assert.throws(()=>F.match(rows.concat(rows[2])),/Duplicate|equal/);assert.equal(D.hash(m),D.hash(F.match(rows)));
});
test('balance denominator is frozen pre-match sample SD; neutral constants/missing/insufficient/absent are qualified',()=>{
 const v=[row('v1','V',{ageBars:0}),row('v2','V',{ageBars:2})],c=[row('c1','C',{ageBars:0}),row('c2','C',{ageBars:4})],pv=v.map(r=>({...r,weight:1})),pc=c.map(r=>({...r,weight:.5}));const b=F.balance(v,c,pv,pc,'ageBars');near(b.pooledSd,Math.sqrt(5));near(b.smd,-1/Math.sqrt(5));assert.equal(b.pass,false);
 assert.equal(F.balance(v,c,pv,pc,'bodyFraction').state,'zero-variance-equal');assert.equal(F.balance(v,c,pv,pc,'bodyFraction').pass,true);assert.equal(F.balance(v,c,pv,pc.map(r=>({...r,bodyFraction:.6})),'bodyFraction').pass,false);assert.equal(F.balance(v,c,pv,[],'ageBars').state,'absent-post-arm');assert.equal(F.balance(v.slice(0,1),c,pv,pc,'ageBars').state,'insufficient-pre');assert.equal(F.balance(v,c,pv,pc.map(r=>({...r,ageBars:null})),'ageBars').state,'missing');
});
test('reserved windows account for same/cross-arm overlaps, equal times, endpoint equality, ESS and gate failure',()=>{
 const a=[row('a','V',{decisionIndex:4000,weight:1}),row('b','C',{decisionIndex:4000,weight:.5}),row('c','C',{decisionIndex:4119,weight:.5}),row('d','V',{decisionIndex:4239,weight:1})],o=F.overlaps(a);assert.equal(o.overlappingPairs,3);assert.equal(o.crossArmPairs,2);assert.equal(o.sameArmPairs,1);assert.equal(o.sharedDecisionPairs,1);assert.equal(o.distinctSharedDecisionTimes,1);near(F.concentration(a.slice(1,3)).weightedEss,2);
 const summary=F.summarize([row('only','V',{exclusion:null})],F.match([row('only')]));assert.equal(summary.state,'NOT-INTERPRETABLE');assert.equal(summary.designGatePass,false);assert.ok(summary.populations.October.flagged.length>0);assert.equal(summary.populations.October.bothArms,false);
});
test('resource admission includes remaining time, doubles measured maxima, refuses caps and never calls an incomplete result success',()=>{
 assert.equal(admission([{ms:1}],31425,1100000,100000000).admitted,true);assert.equal(admission([{ms:40}],31425,1100000,100000000).reason,'insufficient-remaining-time');assert.equal(admission([{ms:1}],31425,1100000,600000000).reason,'insufficient-RSS-margin');assert.equal(limitState(1200000,1).stop,true);assert.equal(limitState(10,1073741825).rssExceeded,true);
 assert.equal(terminalState(0,{state:'RESOURCE-REFUSED'},false),'RESOURCE-REFUSED');assert.equal(terminalState(0,{state:'DESIGN-GATES-PASS',preparationComplete:true},false),'DESIGN-GATES-PASS');assert.equal(terminalState(0,{state:'NOT-INTERPRETABLE',preparationComplete:true},false),'NOT-INTERPRETABLE');assert.equal(terminalState(2,{state:'DESIGN-GATES-PASS',preparationComplete:true},false),'INCOMPLETE');assert.equal(terminalState(0,{state:'DESIGN-GATES-PASS',preparationComplete:true},true),'INCOMPLETE-RESOURCE-STOP');
 const before=fs.existsSync(OUT),r=spawnSync(process.execPath,['research/perp-support-v1.cjs','--resume'],{encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/No resume/);assert.equal(fs.existsSync(OUT),before);
});
test('a completely balanced synthetic population can pass every required gate; this computes no outcomes',()=>{
 const rows=[];for(const side of ['LONG','SHORT'])for(const period of ['Q3','October'])for(const arm of ['V','C'])for(let i=0;i<(arm==='V'?2:6);i++)rows.push(row([side,period,arm,i].join(':'),arm,{side,period,decisionDayUtc:period==='Q3'?'2026-07-15':'2026-10-15',weekday:period==='Q3'?3:4,exclusion:null}));
 const s=F.summarize(rows,F.match(rows));assert.equal(s.retention,1);assert.equal(s.designGatePass,true);assert.equal(s.state,'DESIGN-GATES-PASS');assert.ok(Object.values(s.populations).filter(p=>p.required).every(p=>p.bothArms&&p.pass));
});
