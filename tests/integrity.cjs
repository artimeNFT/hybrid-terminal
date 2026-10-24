'use strict';
const assert=require('node:assert/strict');
const {openApp}=require('./app-harness.cjs');
const {randomBars,replacementFixture,reflect}=require('./regression.cjs');
const core=({side,score,items,plan,short})=>({side,score,items,plan,short});
const near=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
function finiteTree(value){if(typeof value==='number')return Number.isFinite(value);if(value&&typeof value==='object')return Object.values(value).every(finiteTree);return true}
const day=Date.UTC(2026,9,20),flat=Array.from({length:100},(_,i)=>({t:day+i*300000,o:100,h:100,l:100,c:100,v:0}));
(async()=>{
 const a=await openApp();
 const cases=[
  {R:[],state:'empty',pfState:'unavailable',pf:null,wr:null,avg:null,dd:null,win:'לא זמין',mean:'לא זמין',pfText:'לא זמין'},
  {R:[0,0],state:'all-zero',pfState:'all-zero',pf:null,wr:0,avg:0,dd:0,win:'0%',mean:'0.00',pfText:'כל התוצאות אפס · היחס לא מוגדר'},
  {R:[1.9,0,2],state:'no-losses',pfState:'no-losses',pf:null,wr:2/3,avg:1.3,dd:0,win:'67%',mean:'1.30',pfText:'אין הפסדים במדגם · היחס לא מוגדר'},
  {R:[-1,-2],state:'all-losses',pfState:'finite',pf:0,wr:0,avg:-1.5,dd:3,win:'0%',mean:'-1.50',pfText:'0.00'},
  {R:[2,-1,0,1,-3],state:'mixed',pfState:'finite',pf:.75,wr:.4,avg:-.2,dd:3,win:'40%',mean:'-0.20',pfText:'0.75'}
 ];
 for(const c of cases){a.set('__trades',c.R.map(R=>({R,sh:false,t1:false})));a.exec('S.bt=summarizeTrades(__trades);S.panelKey=null;panel()');
  const b=a.read('S.bt'),snapshot=a.read('researchExport()');assert.equal(b.N,c.R.length);assert.equal(b.state,c.state);assert.equal(b.pfState,c.pfState);
  for(const key of ['pf','wr','avg','dd']){if(c[key]===null)assert.equal(b[key],null);else near(b[key],c[key])}
  if(!c.R.length){assert.equal(b.lo,null);assert.equal(b.hi,null);assert.equal(b.t1,null)}else assert.ok(b.lo>=0&&b.hi<=1&&b.lo<=b.wr&&b.hi>=b.wr);
  for(const [field,text] of [['win',c.win],['mean',c.mean],['pf',c.pfText]])assert.ok(a.element('pn2').innerHTML.includes(`data-stat="${field}">${text}</b>`));
  assert.ok(a.element('pn2').innerHTML.includes(`data-statistics-state="${c.state}"`));assert.ok(a.read('S.rep').includes('state '+c.state));
  const line=a.read('S.rep').split('\n').find(l=>l.startsWith('Statistics JSON: ')),reported=JSON.parse(line.slice('Statistics JSON: '.length));
  for(const key of ['state','N','wr','lo','hi','pf','pfState','avg','dd'])assert.deepEqual(reported[key],b[key]);
  assert.deepEqual(snapshot.statistics,b);assert.equal(snapshot.presentation.he.pf,c.pfText);assert.ok(a.read('S.rep').includes('PF '+snapshot.presentation.en.pf));assert.ok(finiteTree(a.exec('researchExport()')));assert.doesNotMatch(a.element('pn2').innerHTML+a.read('S.rep'),/NaN|Infinity/);
 }
 a.set('__trades',Array.from({length:100},(_,i)=>({R:i<55?1:-1,sh:false,t1:false})));const wilson=a.read('summarizeTrades(__trades)');near(wilson.lo,.4524442703164345,1e-10);near(wilson.hi,.6438562489359659,1e-10);
 for(const value of [NaN,Infinity]){a.set('__trades',[{R:value}]);const bad=a.exec('summarizeTrades(__trades)');assert.equal(bad.state,'invalid-outcomes');assert.equal(bad.pf,null);assert.equal(bad.wr,null);assert.ok(finiteTree(bad))}
 a.set('__trades',[{R:1e300},{R:-1e-300}]);assert.equal(a.read('summarizeTrades(__trades).pfState'),'invalid-arithmetic');assert.ok(finiteTree(a.exec('summarizeTrades(__trades)')));
 // Exercise actual backtest entry/exit aggregation, not only the summary helper.
 a.exec("S.k=Array.from({length:65},(_,i)=>({t:i*300000,o:100,h:100.5,l:99.5,c:100,v:100,closed:true}));S.k[62]={...S.k[62],h:103,l:100,c:102};__sigAt=sigAt;sigAt=i=>i===60?{side:'LONG',short:false,plan:{stop:99,tp1:101,tp2:102}}:{side:'WAIT'}");
 assert.equal(a.read('backtest().pf'),null);assert.equal(a.read('backtest().pfState'),'no-losses');near(a.read('backtest().avg'),1.9);a.exec("sigAt=()=>({side:'WAIT'})");assert.equal(a.read('backtest().wr'),null);assert.equal(a.read('backtest().hi'),null);a.exec('sigAt=__sigAt');
 console.log('PASS: empty/all-zero/no-loss/all-loss/mixed net-R states agree in actual UI, copied report and serialized research export; known Wilson reference, ratio overflow and invalid outcomes; actual backtest no-loss/empty aggregation.');

 const s=await openApp(),plan={entry:100,stop:99.9,tp1:102,tp2:103,rr:30};s.set('__plan',plan);
 const size=s.read("nominalSizing(__plan,'LONG',1000,1,'cash-spot-long','1000')");near(size.quantity,100,1e-8);near(size.notional,10000,1e-7);near(size.notionalToAccount,10,1e-9);assert.equal(size.affordability,'insufficient-cash');assert.equal(size.executableQuantity,null);assert.equal(size.venueFilters,'not-checked');
 assert.equal(s.read("nominalSizing(__plan,'LONG',1000,1,'cash-spot-long','20000').affordability"),'covered-before-costs');
 assert.equal(s.read("nominalSizing(__plan,'SHORT',1000,1,'cash-spot-long','20000').affordability"),'unsupported-short');
 for(const [cash,state] of [['','cash-unconfigured'],['-1','invalid-cash'],['Infinity','invalid-cash']]){s.set('__cash',cash);assert.equal(s.read("nominalSizing(__plan,'LONG',1000,1,'cash-spot-long',__cash).affordability"),state)}
 assert.equal(s.read("nominalSizing(__plan,'LONG',1000,1,'unconfigured','20000').affordability"),'scenario-unconfigured');
 for(const value of [0,-1,NaN,Infinity,101]){s.set('__risk',value);assert.equal(s.read("nominalSizing(__plan,'LONG',1000,__risk,'cash-spot-long','1000').quantity"),null)}
 for(const bad of [{entry:100,stop:100},{entry:NaN,stop:99},{entry:0,stop:99},{entry:100,stop:Infinity}]){s.set('__bad',bad);assert.equal(s.read("nominalSizing(__bad,'LONG',1000,1,'cash-spot-long','1000').quantity"),null)}
 // Extreme intermediate overflow is conservatively unavailable, never a fabricated finite quantity.
 assert.equal(s.read("nominalSizing({entry:1,stop:1e-308},'LONG',1e308,100,'cash-spot-long','1000').state"),'invalid-arithmetic');
 assert.equal(s.read("nominalSizing({entry:100,stop:99.99},'LONG',1e308,100,'cash-spot-long','1000').state"),'invalid-arithmetic');
 s.exec("S.sig={...S.sig,side:'LONG',short:false,plan:__plan};S.panelKey=null");s.element('sizeproduct').value='cash-spot-long';s.element('cashbalance').value='1000';s.element('sizeproduct').onchange();await s.flush();
 assert.match(s.element('szo').innerHTML,/insufficient-cash/);assert.match(s.element('szo').innerHTML,/10.0×/);assert.match(s.element('szo').innerHTML,/לא נבדקו/);assert.equal(s.read('researchExport().sizing.executableQuantity'),null);
 const restored=await openApp({localStorage:s.localStorage});assert.equal(restored.element('sizeproduct').value,'cash-spot-long');assert.equal(restored.element('cashbalance').value,'1000');
 console.log('PASS: reviewed 1000/1%/100/99.9 sizing, nominal 100 units/10000 notional/10x, explicit cash scenario and balance, insufficient/covered-before-costs/SHORT/unconfigured/invalid/overflow states; no feasible/executable quantity or venue approval invented.');

 const t=await openApp();t.exec("S.min=3;S.k=Array.from({length:101},(_,i)=>({t:i*300000,o:100,h:101,l:99,c:100,v:100,closed:true}));Object.assign(S,analyze(S.k));S.atr=Array(101).fill(1);S.e=[[],Array(101).fill(100),[],[]];S.rsi=Array(101).fill(70);S.z=[{i:50,hi:104,lo:102,mid:103,up:false,i2:Infinity}];S.sv=[{i:98,t:'top'},{i:99,t:'bot'}];S.mw=[{i:90,t:'M',confirmedAt:93,supersededAt:null},{i:91,t:'W',confirmedAt:94,supersededAt:null}];S.closedIndex=100;S.sig=sigAt(100);S.bt=summarizeTrades([]);S.panelKey=null;panel()");
 const tie=t.read('S.sig');assert.equal(tie.side,'WAIT');assert.equal(tie.short,true);assert.equal(tie.plan,null);assert.equal(tie.score,3);assert.equal(tie.candidates.LONG.score,3);assert.equal(tie.candidates.SHORT.score,3);assert.equal(tie.candidates.LONG.eligible,true);assert.equal(tie.candidates.LONG.targetAvailable,true);assert.equal(tie.candidates.LONG.geometryEligible,true);assert.equal(tie.candidates.SHORT.targetAvailable,false);assert.equal(tie.selection.suppressedOther,true);assert.match(t.element('pn').innerHTML,/כלל הבחירה גרם להמתנה/);assert.equal(t.read('researchExport().confirmedCandidate.selection.suppressedOther'),true);
 t.exec('S.rsi[100]=50');assert.equal(t.read('sigAt(100).side'),'LONG');near(t.read('sigAt(100).plan.rr'),2.307692307692313);
 // Frozen diagnostics cannot be rewritten by a developing candle; maintained live-chart tests also cover this.
 const frozen=t.read('S.sig');t.exec('S.k.push({...S.k.at(-1),t:30300000,c:100.2,h:101,closed:false});S.rsi.push(50)');assert.deepEqual(t.read('S.sig'),frozen);
 console.log('PASS: review tie fixture exposes eligible LONG but deliberately retains selected SHORT/WAIT; no fallback or threshold tuning, clear conflict reason and frozen confirmed versus provisional diagnostics.');

 const f=await openApp({bars:flat});assert.equal(f.read('S.atr.at(-1)'),0);assert.equal(f.read('S.rsiRaw.at(-1)'),100);assert.equal(f.read('S.rsi.at(-1)'),null);assert.equal(f.read('S.rsiState.at(-1)'),'undefined-no-change');assert.equal(f.read('S.k.filter(c=>c.cls===2).length'),0);assert.equal(f.read('S.vw.at(-1)'),null);assert.equal(f.read('S.sig.side'),'WAIT');assert.equal(f.read('S.sig.validity.ready'),false);assert.ok(f.read('S.sig.validity.reasons').includes('volume-zero-reference'));assert.doesNotMatch(f.element('pn').innerHTML+f.read('S.rep'),/NaN|Infinity/);assert.ok(finiteTree(f.exec('researchExport()')));
 const noAtr=await openApp({bars:flat.map(b=>({...b,v:100}))});assert.equal(noAtr.read('S.k.filter(c=>c.cls===2).length'),0);assert.equal(noAtr.read('S.sig.validity.ready'),false);
 const warm=await openApp({bars:randomBars(2,40)});assert.equal(warm.read('S.sig.side'),'WAIT');assert.ok(warm.read('S.sig.validity.reasons').includes('warm-up'));assert.match(warm.element('pn').innerHTML,/חימום חסר/);
 f.set('__data',randomBars(1,100));f.exec('__data[99].h=NaN;S.k=__data.map(b=>({...b,closed:true}));Object.assign(S,analyze(S.k))');assert.equal(f.read('sigAt(99).side'),'WAIT');assert.equal(f.read('backtest().state'),'invalid-data');assert.ok(finiteTree(f.exec('sigAt(99)')));
 f.set('__data',flat.map(b=>({...b,v:100})));f.exec('__data[99]={...__data[99],c:100.5,h:101};const __a=analyze(__data)');assert.equal(f.read('__data[99].cls'),0);assert.equal(f.read('__a.rsi[99]'),100);
 f.set('__data',flat.map(b=>({...b,v:5e-324})));f.exec('__data[99]={...__data[99],v:1e300}');assert.equal(f.read("volumeReference(__data,99).state"),'invalid-arithmetic');
 const journalBefore=f.localStorage['hybridTerminal.journal.v1'];f.exec('S.closedIndex=99;S.sig=sigAt(99);recordDecision()');assert.equal(f.localStorage['hybridTerminal.journal.v1'],journalBefore);f.exec('S.k[99].t=Infinity');assert.equal(f.read('sigAt(99).side'),'WAIT');
 const partial=await openApp({bars:randomBars(3,320).map((b,i)=>({...b,t:day+300000+i*300000}))});assert.equal(partial.read('S.dayCoverage[0]'),'partial-first-day');assert.equal(partial.read('S.dayCoverage[287]'),'from-UTC-open');assert.match(partial.element('pn2').innerHTML,/HLC3/);
 console.log('PASS: flat zero-volume has no vectors, zero ATR and undefined RSI are non-actionable, warm-up/invalid arithmetic/overflow are explicit, one-sided RSI remains 100, zero-product references are not strength and partial-day coverage is labeled without replacing VWAP.');

 let comparisons=0;
 for(const bars of [replacementFixture(),reflect(replacementFixture()),...Array.from({length:12},(_,i)=>randomBars(i+1,240))]){
  const current=await openApp({bars}),old=await openApp({bars,file:'baseline/hybrid-terminal.0.4.0.html'});assert.deepEqual(current.read('S.k.map(c=>c.cls)'),old.read('S.k.map(c=>c.cls)'));
  for(const threshold of [3,4,5]){current.set('__min',threshold);old.set('__min',threshold);current.exec('S.min=__min');old.exec('S.min=__min');for(let i=59;i<bars.length;i++){const result=current.read(`sigAt(${i})`);assert.equal(result.validity.ready,true);assert.deepEqual(core(result),core(old.read(`sigAt(${i})`)));comparisons++}}
 }
 console.log(`PASS: ${comparisons} ordinary valid-input decisions exactly match actual 0.4.0 legacy fields, plans, items, thresholds and direction policy across 14 datasets; volume classes unchanged.`);
 const old=await openApp({file:'baseline/hybrid-terminal.0.4.0.html'}),oldBytes=old.localStorage['hybridTerminal.journal.v1'],oldRecords=JSON.parse(oldBytes).records;old.localStorage['hybridTerminal.view.v2']='{"schemaVersion":2,"palette":"pvsra","body":"hollow","pane":"rsi","zone":"UTC","other":17}';
 const upgraded=await openApp({localStorage:old.localStorage});for(const record of oldRecords){const stored=upgraded.read('S.journal.records').find(r=>r.id===record.id);assert.equal(JSON.stringify(stored),JSON.stringify(record))}assert.ok(upgraded.read('S.journal.records').some(r=>r.ruleVersion==='hybrid-v2-validity-closed'));assert.equal(upgraded.read('EXECUTION_VERSION'),'ohlc-market-stop-v2-gap-open');
 const beforeBytes=old.localStorage['hybridTerminal.journal.v1'];upgraded.element('body').onchange({target:{value:'filled'}});upgraded.element('cashbalance').value='1000';upgraded.element('cashbalance').oninput();await upgraded.flush();assert.equal(old.localStorage['hybridTerminal.journal.v1'],beforeBytes);assert.equal(JSON.parse(old.localStorage['hybridTerminal.view.v2']).other,17);assert.equal(upgraded.read('S.palette'),'pvsra');assert.equal(upgraded.read('S.zone'),'UTC');assert.equal(upgraded.read('S.pane'),'rsi');upgraded.handlers.click({target:{id:'exportresearch'}});assert.ok(upgraded.downloads.at(-1).download.startsWith('hybrid-research-'));assert.equal(old.localStorage['hybridTerminal.journal.v1'],beforeBytes);
 console.log('PASS: prior journal record bytes/IDs/versions retained, new semantics identified separately, execution version/fees retained, sizing/appearance/export leave journal bytes unchanged and preference migration retains unrelated fields.');
 console.log('Scope: synthetic fixtures and mocked DOM/network, distinct from real browser/live-close evidence.');
})().catch(e=>{console.error(e);process.exitCode=1});
