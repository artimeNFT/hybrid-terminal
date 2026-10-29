'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp}=require('./app-harness.cjs'),{bars,step,settle}=require('./target-path-fixtures.cjs');
const defaults={feeBps:10,slippageBps:0,gapBps:0},key='hybridTerminal.planningCosts.v1';
async function open(options={}){return openApp({bars:bars(),...options})}
const engine=a=>a.read('({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY],risk:plannedRiskDisplay(S.sig?.plan,S.k[S.closedIndex]?.c,S.atr?.[S.closedIndex]),sizing:sizingSnapshot()})');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);

test('LONG/SHORT zero-cost identities and total 10-bps baseline arithmetic are symmetric',async()=>{
 const a=await open();for(const side of ['LONG','SHORT']){const p={entry:100,stop:side==='LONG'?98:102,tp2:side==='LONG'?106:94};a.set('__p',p);a.set('__side',side);
  const zero=a.read('planningCostScenario(__p,__side,{feeBps:0,slippageBps:0,gapBps:0})');assert.equal(zero.netTP2R,3);assert.equal(zero.ordinaryStopR,-1);assert.equal(zero.gapStopR,-1);
  const baseline=a.read('planningCostScenario(__p,__side,{feeBps:10,slippageBps:0,gapBps:0})');close(baseline.frictionAmount,.1);close(baseline.netTP2R,2.95);close(baseline.ordinaryStopR,-1.05);assert.equal(baseline.gapStopR,baseline.ordinaryStopR);assert.equal(a.read('plannedRiskDisplay(__p,100,2).costR'),baseline.frictionAmount/baseline.distance);
  const slipped=a.read('planningCostScenario(__p,__side,{feeBps:10,slippageBps:5,gapBps:0})');close(slipped.frictionAmount,.15);close(slipped.netTP2R,2.925);close(slipped.ordinaryStopR,-1.075);
 }
});
test('opening-gap shock uses stop notional, moves adversely on each side and affects only stressed stop R',async()=>{
 const a=await open();const long=a.read('planningCostScenario({entry:100,stop:98,tp2:106},"LONG",{feeBps:10,slippageBps:0,gapBps:100})'),short=a.read('planningCostScenario({entry:100,stop:102,tp2:94},"SHORT",{feeBps:10,slippageBps:0,gapBps:100})');
 close(long.gapAmount,.98);close(short.gapAmount,1.02);close(long.gapStopR,-1.54);close(short.gapStopR,-1.56);assert.equal(long.gapDirection,'below-stop');assert.equal(short.gapDirection,'above-stop');assert.equal(long.netTP2R,short.netTP2R);assert.equal(long.ordinaryStopR,short.ordinaryStopR);
 assert.ok(long.gapStopR<long.ordinaryStopR);assert.ok(short.gapStopR<short.ordinaryStopR);
});
test('nonfinite/negative/excessive/coercible assumptions and invalid directional geometry produce no numeric R',async()=>{
 const a=await open();for(const value of [null,[],{}, {feeBps:'10',slippageBps:0,gapBps:0},{...defaults,feeBps:-1},{...defaults,feeBps:100.001},{...defaults,slippageBps:100.001},{...defaults,gapBps:1000.001},...['feeBps','slippageBps','gapBps'].flatMap(k=>[NaN,Infinity,-Infinity].map(x=>({...defaults,[k]:x})))]){
  a.set('__v',value);assert.equal(a.read('validPlanningCostInputs(__v)'),false);const r=a.read('planningCostScenario({entry:100,stop:98,tp2:106},"LONG",__v)');assert.equal(r.state,'unavailable');assert.deepEqual([r.netTP2R,r.ordinaryStopR,r.gapStopR],[null,null,null]);
 }
 assert.equal(a.read('validPlanningCostInputs({feeBps:100,slippageBps:100,gapBps:1000})'),true);
 for(const [p,side]of [[null,'LONG'],[{entry:0,stop:98,tp2:106},'LONG'],[{entry:100,stop:0,tp2:106},'LONG'],[{entry:100,stop:100,tp2:106},'LONG'],[{entry:100,stop:102,tp2:106},'LONG'],[{entry:100,stop:98,tp2:94},'LONG'],[{entry:100,stop:102,tp2:106},'SHORT'],[{entry:100,stop:Infinity,tp2:106},'LONG'],[{entry:100,stop:98,tp2:106},'WAIT'],[{entry:1e-300,stop:5e-301,tp2:1e300},'LONG']]){a.set('__p',p);a.set('__side',side);const r=a.read('planningCostScenario(__p,__side,{feeBps:10,slippageBps:0,gapBps:0})');assert.equal(r.state,'unavailable');assert.deepEqual([r.netTP2R,r.ordinaryStopR,r.gapStopR],[null,null,null])}
});
test('confirmed anchor survives provisional/view changes and assumptions never mutate decisions, baseline risk, sizing or journal',async()=>{
 const a=await open(),before=engine(a),context=a.read('confirmedPlanningCostPlan()');assert.equal(context.side,'LONG');assert.equal(a.element('planningcosts').hidden,false);
 for(const [id,value]of [['planningfee','15'],['planningslippage','5'],['planninggap','100']]){a.element(id).value=value;a.element(id).oninput()}
 assert.deepEqual(engine(a),before);assert.deepEqual(a.read('confirmedPlanningCostPlan()'),context);const result=a.element('planningresult').innerHTML;assert.match(result,/ordinaryStop/);assert.equal(a.element('planpayoff').textContent,Number(a.read('planningCostScenario(S.sig.plan,S.sig.side,readPlanningCostInputs()).netTP2R').toPrecision(5)).toString());
 const b=bars().at(-1);a.sockets[0].receive({...b,t:b.t+step,o:b.c,h:110,l:90,c:108},false);await settle(a);assert.deepEqual(engine(a),before);assert.equal(a.element('planningresult').innerHTML,result);
 a.exec('S.mouse={x:100,y:120};S.follow=false;S.price=[80,120];S.off=10;panel()');assert.deepEqual(a.read('confirmedPlanningCostPlan()'),context);assert.deepEqual(engine(a),before);
 a.exec('S.sig.side="WAIT";panel()');assert.equal(a.element('planningcosts').hidden,false);assert.equal(a.element('planpayoff').textContent,'לא זמין');assert.equal(a.element('plangeometry').innerHTML,'');assert.equal(a.element('planningresult').innerHTML,'');assert.equal(a.read('confirmedPlanningCostPlan()'),null);
 a.exec('S.sig.side="LONG";S.sig.plan.stop=S.sig.plan.entry;panel()');assert.equal(a.element('planningcosts').hidden,false);assert.equal(a.element('planpayoff').textContent,'לא זמין');assert.equal(a.element('plangeometry').innerHTML,'');assert.equal(a.element('planningresult').innerHTML,'');
});
test('separate assumptions restore without changing old preferences or journal, including explicit recovery from malformed saved input',async()=>{
 const old=await openApp({bars:bars(),file:'baseline/hybrid-terminal.0.4.6.html'}),storage=old.localStorage,bytes=storage['hybridTerminal.journal.v1'];storage['hybridTerminal.view.v2']=JSON.stringify({schemaVersion:2,palette:'pvsra',body:'hollow',annotationDensity:'focus',other:19});const other=storage['hybridTerminal.view.v2'];
 let a=await open({localStorage:storage});assert.deepEqual(a.read('readPlanningCostInputs()'),defaults);assert.equal(storage[key],undefined);a.element('planningfee').value='7.5';a.element('planningfee').oninput();a.element('planninggap').value='25';a.element('planninggap').oninput();a=await open({localStorage:storage});assert.deepEqual(a.read('readPlanningCostInputs()'),{feeBps:7.5,slippageBps:0,gapBps:25});assert.equal(storage['hybridTerminal.view.v2'],other);assert.equal(storage['hybridTerminal.journal.v1'],bytes);
 for(const malformed of ['{bad',JSON.stringify({schemaVersion:1,feeBps:-1,slippageBps:0,gapBps:0}),JSON.stringify({schemaVersion:2,...defaults})]){storage[key]=malformed;a=await open({localStorage:storage});assert.equal(a.read('S.planningCostStorage'),'invalid-saved');assert.ok(!a.element('planningresult').innerHTML.includes('data-cost-r'));assert.equal(storage[key],malformed);a.element('planningreset').onclick();assert.deepEqual(a.read('readPlanningCostInputs()'),defaults);assert.ok(a.element('planningresult').innerHTML.includes('data-cost-r'));assert.equal(storage['hybridTerminal.journal.v1'],bytes)}
});
test('invalid typing clears previous output and quota-style scenario storage failure stays session-only',async()=>{
 const a=await open(),before=engine(a);a.element('planningfee').value='';a.element('planningfee').oninput();assert.ok(!a.element('planningresult').innerHTML.includes('data-cost-r'));a.element('planningreset').onclick();const storage=a.localStorage;
 a.set('__blocked',new Proxy(storage,{set(target,k,value){if(k===key)throw Error('Injected planning-only storage failure');target[k]=value;return true}}));a.exec('localStorage=__blocked');a.element('planningfee').value='20';a.element('planningfee').oninput();assert.equal(a.read('S.planningCostStorage'),'session-only');assert.ok(a.element('planningresult').innerHTML.includes('data-cost-r'));assert.deepEqual(engine(a),before);
});
test('every nonpresentation 0.4.6 function except panel/legend and all rule/execution/RSI identities remain exact',async()=>{
 const a=await open(),old=await openApp({bars:bars(),file:'baseline/hybrid-terminal.0.4.6.html'}),names=[...fs.readFileSync('baseline/hybrid-terminal.0.4.6.html','utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);for(const name of names.filter(n=>![...require('./chart-usability-fixtures.cjs').changedView,'panel','updateLegend','draw','chartGeometry','bindChart','endChartDrag','dailyLabelLayout','bindSystem','refreshPivots'].includes(n)))assert.equal(a.read(name+'.toString()'),old.read(name+'.toString()'),name);for(const name of ['RULE_VERSION','EXECUTION_VERSION','RSI_POLICY'])assert.equal(a.read(name),old.read(name));assert.deepEqual(a.read('S.sig'),old.read('S.sig'));assert.deepEqual(a.read('S.bt'),old.read('S.bt'));
});
