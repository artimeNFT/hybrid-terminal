'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp,rows}=require('./app-harness.cjs'),{randomBars}=require('./regression.cjs'),{day,step,dailyRows,isDaily,settle}=require('./target-path-fixtures.cjs');
const data=(count=500,dt=step)=>randomBars(31,count).map((b,i)=>({...b,t:day+i*dt}));
const state=a=>a.read('({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]})');
async function open(options={}){return openApp({bars:data(),respond:async req=>isDaily(req)?dailyRows(req.url):undefined,...options})}
test('exact participating closed count/origin/decision time exclude provisional bars and advance only at confirmation',async()=>{
 const k=data(),a=await open({serverNow:k.at(-1).t+step-1000});const v=a.read('decisionDataWindow()');assert.deepEqual(v,{state:'available',symbol:'BTCUSDT',timeframe:'5m',closedCandles:499,inputCandles:499,firstCandleOpen:k[0].t,decisionClose:k[498].t+step});
 a.sockets[0].receive({...k.at(-1),c:k.at(-1).c+.1,h:k.at(-1).h+1},false);await settle(a);assert.deepEqual(a.read('decisionDataWindow()'),v);a.sockets[0].receive(k.at(-1),true);await settle(a);assert.equal(a.read('decisionDataWindow().closedCandles'),500);assert.equal(a.read('decisionDataWindow().decisionClose'),k.at(-1).t+step);
 const confirmed=a.read('decisionDataWindow()');a.sockets[0].receive({...k.at(-1),t:k.at(-1).t+step},false);await settle(a);assert.deepEqual(a.read('decisionDataWindow()'),confirmed);a.exec('S.connected=false');assert.deepEqual(a.read('decisionDataWindow()'),confirmed);assert.equal(a.read('feedHealth().ready'),false);
 a.exec('S.k=[];S.sig=null;S.closedIndex=-1');assert.equal(a.read('decisionDataWindow().state'),'unavailable');
});
test('actual chart-only history load leaves decision-window coordinates, computations and journal unchanged',async()=>{
 const k=data(),older=data(1000).map((b,i)=>({...b,t:k[0].t-(1000-i)*step}));const a=await open({respond:async req=>isDaily(req)?dailyRows(req.url):new URL(req.url).searchParams.has('endTime')?rows(older,step):undefined}),v=a.read('decisionDataWindow()'),before=state(a);
 await a.exec('loadOlder()');await settle(a);assert.equal(a.read('S.history.length'),1000);assert.deepEqual(a.read('decisionDataWindow()'),v);assert.deepEqual(state(a),before);assert.equal(a.read('S.k.length'),500);assert.match(a.element('historynote').textContent,/chart only/);assert.doesNotMatch(a.element('historynote').textContent,/research bars/);assert.match(a.element('pn').innerHTML,/נוספו 1000/);
});
test('pending symbol/timeframe transitions clear old provenance and reject obsolete main-data responses',async()=>{
 const pending=[],a=await open({respond:async req=>isDaily(req)?dailyRows(req.url):req.symbol==='ETHUSDT'&&['5m','15m'].includes(req.interval)?new Promise(resolve=>pending.push({req,resolve})):undefined});
 a.exec('S.sym="ETHUSDT";load()');await settle(a);assert.equal(a.read('decisionDataWindow().state'),'unavailable');assert.equal(a.read('decisionDataWindow().symbol'),'ETHUSDT');
 const k=data(200,900000);a.state.serverNow=k.at(-1).t+900001;a.exec('S.tf="15m";load()');await settle(a);assert.equal(pending.length,2);pending[0].resolve(rows(data(),step));await settle(a);assert.equal(a.read('decisionDataWindow().state'),'unavailable');pending[1].resolve(rows(k,900000));await settle(a);
 assert.deepEqual(a.read('decisionDataWindow()'),{state:'available',symbol:'ETHUSDT',timeframe:'15m',closedCandles:200,inputCandles:200,firstCandleOpen:k[0].t,decisionClose:k.at(-1).t+900000});
});
test('Full retains every original M/W annotation; Focus selects only latest active confirmed M/W without changing other rendering or engine',async()=>{
 const a=await open(),old=await openApp({bars:data(),file:'baseline/hybrid-terminal.0.4.5.html'}),before=state(a),pattern=/^[MW]×?$/;
 const texts=app=>app.drawCalls.filter(q=>q.method==='fillText');for(const app of [old,a]){app.drawCalls.length=0;app.exec('draw()')}
 assert.deepEqual(texts(a).filter(q=>pattern.test(q.args[0])),texts(old).filter(q=>pattern.test(q.args[0])));const full=texts(a),mw=full.filter(q=>pattern.test(q.args[0]));assert.ok(mw.length>2);
 a.drawCalls.length=0;a.element('annotations').onchange({target:{value:'focus'}});await settle(a);a.drawCalls.length=0;a.exec('draw()');assert.ok(texts(a).filter(q=>pattern.test(q.args[0])).length<=2);assert.deepEqual(texts(a).filter(q=>!pattern.test(q.args[0])),full.filter(q=>!pattern.test(q.args[0])));assert.deepEqual(state(a),before);
 a.element('annotations').onchange({target:{value:'full'}});await settle(a);a.drawCalls.length=0;a.exec('draw()');assert.deepEqual(texts(a),full);
 a.set('__events',[{t:'M',i:1,confirmedAt:4,supersededAt:10},{t:'M',i:20,confirmedAt:23,supersededAt:null},{t:'W',i:30,confirmedAt:33,supersededAt:null},{t:'W',i:100,confirmedAt:103,supersededAt:null}]);a.exec('S.annotationDensity="focus"');assert.deepEqual(a.read('mwAnnotationEvents(__events,50).map(q=>q.i)'),[20,30]);
});
test('annotation preference restores independently and preserves legacy preferences, unknown fields and journal bytes',async()=>{
 const old=await openApp({bars:data(),file:'baseline/hybrid-terminal.0.4.5.html'}),storage=old.localStorage,bytes=storage['hybridTerminal.journal.v1'];storage['hybridTerminal.view.v2']=JSON.stringify({schemaVersion:2,palette:'pvsra',body:'hollow',pane:'rsi',zone:'UTC',other:19});let a=await open({localStorage:storage});assert.equal(a.read('S.annotationDensity'),'full');
 a.element('annotations').onchange({target:{value:'focus'}});await settle(a);assert.equal(JSON.parse(storage['hybridTerminal.view.v2']).other,19);assert.equal(storage['hybridTerminal.journal.v1'],bytes);a=await open({localStorage:storage});assert.deepEqual(a.read('[S.annotationDensity,S.palette,S.body,S.pane,S.zone]'),['focus','pvsra','hollow','rsi','UTC']);assert.equal(storage['hybridTerminal.journal.v1'],bytes);
});
test('concise daily/nearest labels keep every exact price and deliberate inspection without snapping or rounded-value merging',async()=>{
 const a=await open();a.element('daylevels').onclick();a.element('pivots').onclick();await settle(a);a.exec('Object.assign(dailyAt(confirmedAsOf()),{pdh:100.00005,pdl:99.99995,pp:100.0000000000123,r1:100.0001,s1:100});S.levelContextKey=null;S.panelKey=null');const before=a.read('[...S.pivotDays]'),engine=state(a);a.exec('draw();panel()');
 assert.ok(a.element('contextstatus').textContent.length<90);assert.ok(!a.element('contextstatus').textContent.includes('100.0000000000123'));assert.ok(a.element('dailyexact').textContent.includes('100.0000000000123'));a.set('__view',{...a.read('nearestDayContext()'),above:{names:['PP'],price:100.0000000000123,distance:.0000000000123,percent:.0000000000123,atr:.0000000000123}});assert.ok(a.exec('dailyContextHTML(__view)').includes('title="100.0000000000123"'));assert.ok(a.element('levelcontext').innerHTML.includes('מחירים מדויקים'));
 a.set('__levels',[{name:'PP',value:100.0000000000123},{name:'PDH',value:100.00005},{name:'S1',value:100}]);const layout=a.read('dailyLabelLayout(__levels,500,300,0,500,p=>150)');assert.equal(layout.labels.length,1);assert.equal(layout.labels[0].levels.length,3);assert.match(layout.labels[0].text,/distinct/);assert.equal(a.read('nearestLevels(__levels,100,1).above.price'),100.0000000000123);assert.deepEqual(a.read('[...S.pivotDays]'),before);assert.deepEqual(state(a),engine);
});
test('all nonpresentation 0.4.5 function bodies and rule/execution/indicator policies remain identical',async()=>{
 const a=await open(),old=await openApp({bars:data(),file:'baseline/hybrid-terminal.0.4.5.html'}),allowed=new Set(['panel','draw','dailyLabelLayout','dailyContextHTML','loadDisplayPrefs','saveDisplayPrefs','bindSystem']);const names=[...fs.readFileSync('baseline/hybrid-terminal.0.4.5.html','utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);for(const name of names.filter(n=>!allowed.has(n)))assert.equal(a.read(name+'.toString()'),old.read(name+'.toString()'),name);
 for(const name of ['RULE_VERSION','EXECUTION_VERSION','RSI_POLICY'])assert.equal(a.read(name),old.read(name));assert.deepEqual(a.read('S.sig'),old.read('S.sig'));assert.deepEqual(a.read('S.bt'),old.read('S.bt'));
});
