'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp}=require('./app-harness.cjs'),{bars,step}=require('./target-path-fixtures.cjs');
const key='hybridTerminal.helpLanguage.v1',file='baseline/hybrid-terminal.0.4.7.html';
const engine=a=>a.read('({sig:S.sig,bt:S.bt,window:decisionDataWindow(),journal:localStorage[JOURNAL_KEY],sizing:sizingSnapshot(),cost:readPlanningCostInputs()})');

test('paired Help facts cover actual policies in both languages and isolate readable formulas',async()=>{
 const a=await openApp(),data=a.read('HELP_CONTENT');assert.equal(data.start.steps.length,3);assert.deepEqual(data.sections.map(s=>s.id),['health','decisions','candles','navigation','context','risk','records']);
 const facts=data.start.steps.concat(data.sections.flatMap(s=>s.facts));assert.equal(new Set(facts.map(f=>f.id)).size,facts.length);
 for(const f of facts){assert.ok(f.he.length>20,f.id);assert.ok(f.en.length>20,f.id);assert.deepEqual([...f.he.matchAll(/<bdi dir='ltr'>(.*?)<\/bdi>/g)].map(m=>m[1]),[...f.en.matchAll(/<bdi dir='ltr'>(.*?)<\/bdi>/g)].map(m=>m[1]),f.id)}
 const fact=id=>facts.find(f=>f.id===id);assert.match(fact('score-selection').en,/SHORT on a tie before eligibility/);assert.match(fact('score-selection').he,/בשוויון נבחר SHORT לפני/);assert.match(fact('risk-coordinates').en,/TP1 is a touch statistic, not a partial exit/);assert.match(fact('risk-coordinates').he,/TP1 הוא נתון מגע, לא יציאה חלקית/);
 for(const language of ['he','en']){a.exec(`selectHelpLanguage('${language}',false)`);assert.equal(a.element('hp').lang,language);assert.equal(a.element('helpdialog').dir,language==='he'?'rtl':'ltr');assert.equal((a.element('helpcontent').innerHTML.match(/data-help-fact=/g)||[]).length,facts.length)}
 assert.match(fact('existing-countdown').en,/0:00 is not feed-confirmed closure/);assert.match(fact('utc-coverage').en,/not an authenticated full-day open/);assert.match(fact('density-history').en,/chart-only candles without extending the decision window/);assert.match(fact('cost-formulas').en,/backtest enters at the next open and is not numerically identical/);
});
test('language and internal navigation keep Help open; only explicit close/backdrop/Escape close and restore focus/background',async()=>{
 const a=await openApp(),before=engine(a);let returned=0,prevented=0,stopped=0;const opener={isConnected:true,focus(){returned++}},header={inert:false},main={inert:true};a.set('__opener',opener);a.exec('document.activeElement=__opener');a.selectors['body > header, body > main']=[header,main];
 a.element('hq').onclick();assert.equal(a.element('hp').hidden,false);assert.equal(header.inert,true);a.element('helplangen').onclick();assert.equal(a.element('hp').hidden,false);a.element('hp').onclick({target:a.element('helplangen')});assert.equal(a.element('hp').hidden,false);a.element('helpstart').onclick();assert.equal(a.element('hp').hidden,false);
 a.element('hp').onkeydown({key:'Escape',preventDefault(){prevented++},stopPropagation(){stopped++}});assert.equal(a.element('hp').hidden,true);assert.equal(returned,1);assert.equal(prevented,1);assert.equal(stopped,1);assert.equal(header.inert,false);assert.equal(main.inert,true);
 a.element('hq').onclick();a.element('helpclose').onclick();assert.equal(a.element('hp').hidden,true);a.element('hq').onclick();a.element('hp').onclick({target:a.element('hp')});assert.equal(a.element('hp').hidden,true);assert.deepEqual(engine(a),before);
});
test('Hebrew fresh default never writes; isolated language restores and preserves unrelated preferences and old journal bytes',async()=>{
 const old=await openApp({file}),storage=old.localStorage;storage['hybridTerminal.view.v2']=JSON.stringify({schemaVersion:2,palette:'standard',body:'filled',volumeTags:true,annotationDensity:'focus',unknown:9});storage['hybridTerminal.planningCosts.v1']=JSON.stringify({schemaVersion:1,feeBps:7,slippageBps:2,gapBps:10});storage['unrelated']='retain';const original={...storage};
 const a=await openApp({localStorage:storage});assert.equal(a.read('S.helpLanguage'),'he');assert.equal(storage[key],undefined);assert.deepEqual(storage,original);const before=engine(a),requests=a.requests.length;
 a.element('hq').onclick();a.element('helplangen').onclick();assert.deepEqual(JSON.parse(storage[key]),{schemaVersion:1,language:'en'});for(const [k,v]of Object.entries(original))assert.equal(storage[k],v,k);assert.equal(a.requests.length,requests);assert.deepEqual(engine(a),before);
 const restored=await openApp({localStorage:storage});assert.equal(restored.read('S.helpLanguage'),'en');assert.equal(restored.element('helpdialog').dir,'ltr');assert.deepEqual(restored.read('[S.palette,S.body,S.volumeTags,S.annotationDensity]'),['standard','filled',true,'focus']);for(const [k,v]of Object.entries(original))assert.equal(storage[k],v,k);
});
test('malformed or unsupported saved language falls back without clearing bytes; storage read/write failures remain session-only',async()=>{
 for(const value of ['','{bad','null','[]','"en"',JSON.stringify({schemaVersion:1,language:['en']}),JSON.stringify({schemaVersion:2,language:'en'}),JSON.stringify({schemaVersion:1,language:'fr'})]){
  const storage={[key]:value,unrelated:'keep'},a=await openApp({localStorage:storage});assert.equal(a.read('S.helpLanguage'),'he');assert.equal(a.read('S.helpStorage'),'invalid-saved');assert.equal(storage[key],value);assert.equal(storage.unrelated,'keep');a.element('helplangen').onclick();assert.equal(a.read('S.helpLanguage'),'en');assert.equal(JSON.parse(storage[key]).language,'en');assert.equal(storage.unrelated,'keep');
 }
 for(const fault of ['read','write']){const raw={unrelated:'keep'},storage=new Proxy(raw,{get(t,k){if(fault==='read'&&k===key)throw Error('Injected Help-only storage read failure');return t[k]},set(t,k,v){if(k===key)throw Error('Injected Help-only storage write failure');t[k]=v;return true}}),a=await openApp({localStorage:storage}),before=engine(a);
  a.element('hq').onclick();a.element('helplangen').onclick();assert.equal(a.read('S.helpLanguage'),'en');assert.equal(a.read('S.helpStorage'),'session-only');assert.match(a.element('helpstorage').textContent,/session only/);assert.equal(a.element('hp').hidden,false);assert.deepEqual(engine(a),before);assert.equal(raw.unrelated,'keep');assert.equal(raw[key],undefined);
 }
 const a=await openApp();for(const value of [null,[],{},'fr',true,1]){a.set('__invalid',value);assert.equal(a.read('selectHelpLanguage(__invalid)'),false)}assert.equal(a.read('S.helpLanguage'),'he');assert.equal(a.localStorage[key],undefined);
});
test('palette option values/colors/defaults/body/tags and all existing calculation behavior match 0.4.7',async()=>{
 for(const series of [bars(),bars().map(b=>({...b,o:200-b.o,c:200-b.c,h:200-b.l,l:200-b.h}))]){
  const a=await openApp({bars:series}),old=await openApp({bars:series,file});assert.deepEqual(a.read('PALETTES'),old.read('PALETTES'));assert.deepEqual(a.read('[S.palette,S.body,S.volumeTags]'),['accessible','filled',false]);
  for(const mode of ['standard','accessible','pvsra']){a.element('palette').onchange({target:{value:mode}});assert.match(a.element('candlelegend').innerHTML,/C &gt; O|C > O|Normal ↑/);assert.match(a.element('candlelegend').innerHTML,mode==='standard'?/Green up \/ Red down/:mode==='accessible'?/Blue up \/ Orange down/:/Direction \+ volume/)}
  assert.deepEqual(a.read('S.sig'),old.read('S.sig'));assert.deepEqual(a.read('S.bt'),old.read('S.bt'));
  const names=[...fs.readFileSync(file,'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);for(const name of names.filter(n=>!['updateLegend','draw','chartGeometry','bindChart','endChartDrag','dailyLabelLayout','bindSystem'].includes(n)))assert.equal(a.read(name+'.toString()'),old.read(name+'.toString()'),name);for(const name of ['RULE_VERSION','EXECUTION_VERSION','RSI_POLICY'])assert.equal(a.read(name),old.read(name));
 }
});
test('existing countdown and partial-day Daily Open are retained as original draw/calculation behavior',async()=>{
 const series=bars().slice(0,100).map((b,i)=>({...b,t:Date.UTC(2026,9,21,3)+i*step})),a=await openApp({bars:series}),old=await openApp({bars:series,file});assert.equal(a.read('S.dayCoverage[0]'),'partial-first-day');assert.equal(a.read('S.dop[0]'),series[0].o);assert.deepEqual(a.read('S.dop'),old.read('S.dop'));assert.ok(a.drawCalls.some(c=>c.method==='fillText'&&c.args[0]==='DO*'));
 const last=series.at(-1);a.sockets[0].receive({...last,t:last.t+step},false);await a.flush();assert.ok(a.drawCalls.some(c=>c.method==='fillText'&&/^\d+:\d{2}$/.test(c.args[0])));assert.equal(a.read('S.k.at(-1).closed'),false);
});
