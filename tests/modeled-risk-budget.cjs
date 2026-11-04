'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp}=require('./app-harness.cjs'),{bars,step,settle}=require('./target-path-fixtures.cjs');
const BASE='baseline/hybrid-terminal.0.4.25.html',product={schemaVersion:1,product:'usdm'},costs={feeBps:10,slippageBps:0,gapBps:0},near=(x,y)=>assert.ok(Math.abs(x-y)<=1e-12*Math.max(1,Math.abs(y)),`${x} != ${y}`);
const open=options=>openApp({bars:bars(),localStorage:{'hybridTerminal.marketProduct.v1':JSON.stringify(product)},...options});
function literal(a,side='LONG'){
 a.set('__side',side);a.exec(`Object.assign(S.k[S.closedIndex],{o:100,h:110,l:90,c:100});S.sig={...S.sig,side:__side,short:__side==='SHORT',validity:{ready:true},candidates:{LONG:{eligible:true},SHORT:{eligible:true}},plan:{entry:100,stop:__side==='LONG'?99:101,tp1:__side==='LONG'?101:99,tp2:__side==='LONG'?102:98,rr:2}};$('acc').value='1000';$('rk').value='1';updatePlanningCosts()`);
}
function calc(a,side,values=costs){a.set('__values',values);literal(a,side);return a.read('modeledRiskBudgetSizing(planningCostScenario(S.sig.plan,S.sig.side,__values),1000,1,sizingSnapshot())')}
function input(a,id,value){a.element(id).value=value;if(['acc','rk'].includes(id))a.handlers.input({target:a.element(id)});else a.element(id).oninput()}
const snapshot=a=>a.read('({k:S.k,e:S.e,z:S.z,atr:S.atr,rsi:S.rsi,mw:S.mw,sig:S.sig,bt:S.bt,size:sizingSnapshot(),journal:localStorage[JOURNAL_KEY],rule:RULE_VERSION,execution:EXECUTION_VERSION})');
test('independent LONG/SHORT fee-only and zero-cost literals retain nominal sizing and conserve the modeled budget',async()=>{
 const a=await open();for(const side of ['LONG','SHORT']){
  const r=calc(a,side);assert.equal(r.riskBudget,10);assert.equal(r.unitLoss,1.1);near(r.quantity,10/1.1);near(r.notional,1000/1.1);assert.equal(r.nominalQuantity,10);assert.equal(r.nominalLoss,11);near(r.quantity*r.unitLoss,10);
  const zero=calc(a,side,{feeBps:0,slippageBps:0,gapBps:0});assert.equal(zero.quantity,10);assert.equal(zero.quantity,a.read('sizingSnapshot().quantity'));assert.equal(zero.nominalLoss,10);
 }
});
test('gap shock uses the stop-price basis, and nonnegative fee/slippage/gap never increase quantity above nominal',async()=>{
 const a=await open();for(const side of ['LONG','SHORT'])for(const values of [costs,{feeBps:10,slippageBps:0,gapBps:100},{feeBps:7.5,slippageBps:2.5,gapBps:25},{feeBps:100,slippageBps:100,gapBps:1000}]){
  const r=calc(a,side,values);assert.equal(r.state,'available');near(r.quantity*r.unitLoss,10);assert.ok(r.quantity<=r.nominalQuantity);assert.ok(r.nominalLoss>=r.riskBudget);
  if(values.gapBps===100){near(r.unitLoss,side==='LONG'?2.09:2.11);near(r.quantity,10/(side==='LONG'?2.09:2.11))}
 }
});
test('unavailable, coercion, empty and nonfinite/nonpositive arithmetic produce no numeric suggestion',async()=>{
 const a=await open();literal(a);const run=(account=1000,risk=1,override={})=>{a.set('__account',account);a.set('__risk',risk);a.set('__override',override);return a.read('modeledRiskBudgetSizing({...planningCostScenario(S.sig.plan,S.sig.side,PLANNING_COST_DEFAULTS),...__override},__account,__risk,sizingSnapshot())')};
 for(const value of [null,undefined,'',[],{},true,'1000',NaN,Infinity,-1,0,Number.MAX_VALUE]){a.set('__bad',value);const r=a.read('modeledRiskBudgetSizing(planningCostScenario(S.sig.plan,S.sig.side,PLANNING_COST_DEFAULTS),__bad,1,sizingSnapshot())');assert.equal(r.state,'unavailable');assert.ok(Object.entries(r).every(([k,v])=>k==='state'||v===null))}
 for(const risk of [0,-1,101,NaN,Infinity,'1'])assert.equal(run(1000,risk).state,'unavailable');
 for(const override of [{state:'unavailable'},{distance:0},{distance:Infinity},{entry:Infinity},{gapStopR:0},{gapStopR:-.5},{gapStopR:-Infinity},{gapStopR:-Number.MAX_VALUE}])assert.equal(run(1000,1,override).state,'unavailable');
 for(const values of [{feeBps:NaN,slippageBps:0,gapBps:0},{feeBps:-1,slippageBps:0,gapBps:0},{feeBps:0,slippageBps:0,gapBps:1001}])assert.equal(calc(a,'LONG',values).state,'unavailable');
});
test('live integration clears on partial inputs, WAIT, invalid eligibility/entry and unsupported product/symbol without stale values',async()=>{
 const a=await open();literal(a);assert.match(a.element('modeledriskresult').innerHTML,/data-modeled-sizing="available"/);
 for(const id of ['planningfee','planningslippage','planninggap','acc','rk'])for(const value of ['', '-', '1e', 'Infinity','-1']){
  literal(a);for(const x of ['planningfee','planningslippage','planninggap'])a.element(x).value=x==='planningfee'?'10':'0';a.exec('updatePlanningCosts()');input(a,id,value);assert.match(a.element('modeledriskresult').innerHTML,/data-modeled-sizing="unavailable"/);assert.doesNotMatch(a.element('modeledriskresult').innerHTML,/data-modeled-metric/);
 }
 for(const code of ['S.sig.side="WAIT"','S.sig.candidates.LONG.eligible=false','S.sig.plan.entry=101','S.sig=null','S.product="spot"','S.sym="UNKNOWNUSDT"']){
  a.exec('S.product="usdm";S.sym="BTCUSDT"');literal(a);a.exec(code+';updatePlanningCosts()');assert.match(a.element('modeledriskresult').innerHTML,/data-modeled-sizing="unavailable"/);
 }
});
test('confirmed anchor survives provisional/history/hover/selection; refreshes do not calculate, fetch or write',async()=>{
 const a=await open(),confirmed=x=>x.read('({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY],size:sizingSnapshot()})');const before=confirmed(a),html=a.element('modeledriskresult').innerHTML,storage={...a.localStorage},requests=a.requests.length,b=bars().at(-1);
 a.sockets[0].receive({...b,t:b.t+step,o:100,h:150,l:90,c:130},false);await settle(a);assert.equal(a.element('modeledriskresult').innerHTML,html);assert.deepEqual(confirmed(a),before);
 a.exec('S.mouse={x:8,y:7};S.price=[80,120];S.history=[{c:888}];JR.selected={record:{plan:{entry:777}}};calc=analyze=backtest=recordDecision=persistJournal=()=>{throw Error("read-only UI must not calculate/write")};for(let i=0;i<5;i++)updatePlanningCosts()');assert.equal(a.element('modeledriskresult').innerHTML,html);assert.deepEqual(a.localStorage,storage);assert.equal(a.requests.length,requests);
});
test('only original UI composer differs from exact0.4.25; sizing/scenario/engine/journal/export and chart pixels are preserved',async()=>{
 const old=await open({file:BASE,nativeCanvas:true}),a=await open({localStorage:{...old.localStorage},nativeCanvas:true}),names=[...fs.readFileSync(BASE,'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);assert.deepEqual(names.filter(n=>a.read(n+'.toString()')!==old.read(n+'.toString()')),['updatePlanningCosts']);assert.deepEqual(snapshot(a),snapshot(old));
 for(const name of ['nominalSizing','sizingSnapshot','planningCostScenario','analyze','sigAt','backtest','recordDecision','researchExport','exportJournal'])assert.equal(a.read(name+'.toString()'),old.read(name+'.toString()'),name);
 const x=a.read('researchExport()'),y=old.read('researchExport()');delete x.exportedAt;delete y.exportedAt;assert.deepEqual(x,y);assert.deepEqual(Buffer.from(a.nativeCanvas.toBuffer('image/png')),Buffer.from(old.nativeCanvas.toBuffer('image/png')));
 const s=fs.readFileSync('hybrid-terminal.html','utf8'),base=fs.readFileSync(BASE,'utf8');for(const re of [/setInterval\(/g,/new WebSocket\(/g,/localStorage\[/g])assert.equal((s.match(re)||[]).length,(base.match(re)||[]).length);
 const h=a.read('HELP_CONTENT.sections.find(s=>s.id==="risk").facts.find(f=>f.id==="modeled-risk-budget")');for(const lang of ['he','en'])assert.ok(h[lang].includes('q=B/L'));assert.match(h.he,/לא מניחים שהם אפס/);assert.match(h.en,/excluded, not assumed zero/);
});
