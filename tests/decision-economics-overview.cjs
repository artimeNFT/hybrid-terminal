'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {openApp}=require('./app-harness.cjs'),{bars}=require('./target-path-fixtures.cjs');
const open=options=>openApp({bars:bars(),...options});
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-10,`${x} != ${y}`);
const setCost=(a,id,value)=>{a.element(id).value=String(value);a.element(id).oninput()};
const details=a=>a.element('binaryresult').innerHTML;
function literal(a,side){
 a.set('__side',side);
 a.exec("S.k[S.closedIndex]={...S.k[S.closedIndex],o:100,h:110,l:90,c:100,closed:true};S.atr[S.closedIndex]=2;S.sig={...S.sig,side:__side,short:__side==='SHORT',validity:{ready:true},candidates:{LONG:{eligible:true},SHORT:{eligible:true}},plan:{entry:100,stop:__side==='LONG'?98:102,tp1:__side==='LONG'?103:97,tp2:__side==='LONG'?106:94,rr:3}};updatePlanningCosts()");
}
test('LONG and SHORT summary equals the existing binary details and the selected cost scenario, not 10bps baseline',async()=>{
 for(const side of ['LONG','SHORT']){
  const a=await open();literal(a,side);
  assert.equal(a.element('plangross').textContent,'3.00');
  assert.equal(a.element('planpayoff').textContent,'2.95');
  assert.equal(a.element('planscenariocost').textContent,'0.05');
  assert.equal(a.element('planbaselinecost').textContent,'0.050');
  const b=a.read('binaryRequirementText(binaryBreakEvenRequirement(planningCostScenario(S.sig.plan,S.sig.side,readPlanningCostInputs())))');
  assert.equal(a.element('planrequired').textContent,b);
  assert.ok(details(a).includes(b));
  setCost(a,'planningfee',20);setCost(a,'planningslippage',5);
  assert.equal(a.element('planbaselinecost').textContent,'0.050');
  assert.equal(a.element('planscenariocost').textContent,'0.125');
  assert.equal(a.element('planpayoff').textContent,'2.875');
  assert.equal(a.element('planrequired').textContent,a.read('binaryRequirementText(binaryBreakEvenRequirement(planningCostScenario(S.sig.plan,S.sig.side,readPlanningCostInputs())))'));
 }
});
test('gap stress is separately labelled, visible only when selected, and does not change normal plan payoff',async()=>{
 const a=await open();literal(a,'LONG');
 assert.equal(a.element('planrequiredgaprow').hidden,true);
 const plain=a.element('planpayoff').textContent;
 setCost(a,'planninggap',100);
 assert.equal(a.element('planrequiredgaprow').hidden,false);
 assert.equal(a.element('planpayoff').textContent,plain);
 assert.equal(a.element('planrequiredgap').textContent,a.read("binaryRequirementText(binaryBreakEvenRequirement(planningCostScenario(S.sig.plan,S.sig.side,readPlanningCostInputs()),'gapStopR'))"));
 setCost(a,'planninggap',0);
 assert.equal(a.element('planrequiredgaprow').hidden,true);
 assert.equal(a.element('planrequiredgap').textContent,'לא זמין');
});
test('invalid input, no plan and WAIT clear costs and requirements immediately without a substitute signal',async()=>{
 const a=await open();literal(a,'LONG');
 setCost(a,'planningfee','');
 assert.equal(a.element('planscenariocost').textContent,'לא זמין');
 assert.equal(a.element('planrequired').textContent,'לא זמין');
 assert.equal(a.element('planpayoff').textContent,'לא זמין');
 a.exec('S.sig.side="WAIT";updatePlanningCosts()');
 for(const id of ['planscenariocost','planrequired','planrequiredgap'])assert.equal(a.element(id).textContent,'לא זמין');
 assert.equal(a.element('planrequiredgaprow').hidden,true);
});
test('summary changes no engine, journal, network requests or storage beyond existing cost-preference updates',async()=>{
 const a=await open();literal(a,'LONG');
 const before=a.read('JSON.stringify({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]})'),requests=a.requests.length;
 for(let i=0;i<5;i++)a.exec('updatePlanningCosts()');
 assert.equal(a.read('JSON.stringify({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]})'),before);
 assert.equal(a.requests.length,requests);
 const baseline=a.read('planningCostScenario(S.sig.plan,S.sig.side,{feeBps:10,slippageBps:0,gapBps:0})');
 near(baseline.frictionAmount/baseline.distance,.05);
});
