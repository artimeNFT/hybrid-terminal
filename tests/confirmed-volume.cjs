'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {openApp}=require('./app-harness.cjs');
const file='baseline/hybrid-terminal.0.4.9.html',step=300000,start=Date.UTC(2026,9,26);
const bars=(count=60,volume=100,direction='up',range=.4)=>Array.from({length:count},(_,i)=>({t:start+i*step,o:100,c:i===count-1?(direction==='down'?99.9:direction==='doji'?100:100.1):100,h:i===count-1?100+range/2:101,l:i===count-1?100-range/2:99,v:i===count-1?volume:100}));
const engine=a=>a.read('({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY],preferences:localStorage[VIEW_KEY],rule:RULE_VERSION,execution:EXECUTION_VERSION})');
test('existing prior-ten mean excludes current volume; exact Normal/Rising/Vector class and own direction are reused',async()=>{
 for(const [volume,range,expected,direction] of [[100,.4,'Normal','up'],[150,.4,'Rising volume','down'],[200,.4,'Vector','doji'],[80,4,'Vector','up']]){
  const input=bars(60,volume,direction,range);if(direction==='down')input[58]={...input[58],o:90,c:90,h:91,l:89};const a=await openApp({bars:input}),s=a.read('confirmedVolumeSummary()');
  assert.equal(s.mean,100);assert.equal(s.ratio,volume/100);assert.equal(s.classification,expected);assert.equal(s.confirmedClose,start+60*step);assert.equal(s.candleOpen,start+59*step);assert.equal(s.status,'closed');assert.match(s.direction,new RegExp(direction==='down'?'↓ Down':direction==='doji'?'= Doji':'↑ Up'));assert.equal(s.ratio,a.read('volumeReference(S.k,S.closedIndex).relative'));
 }
});
test('warm-up, zero reference, zero volume and invalid arithmetic retain actual availability states, never a fabricated ratio',async()=>{
 const warm=await openApp({bars:bars(10)});assert.equal(warm.read('confirmedVolumeSummary().state'),'warm-up');assert.equal(warm.read('confirmedVolumeSummary().ratio'),null);assert.match(warm.element('confirmedvolumetext').textContent,/Normal \(default\)/);
 const exact=await openApp({bars:bars(11,150)});assert.equal(exact.read('confirmedVolumeSummary().ratio'),1.5);
 const zero=await openApp({bars:bars().map((b,i)=>({...b,v:i===59?100:0}))});assert.equal(zero.read('confirmedVolumeSummary().state'),'zero-reference');assert.equal(zero.read('confirmedVolumeSummary().ratio'),null);assert.match(zero.element('confirmedvolumetext').textContent,/zero reference/);
 const emptyVolume=await openApp({bars:bars(60,0)});assert.equal(emptyVolume.read('confirmedVolumeSummary().state'),'zero-volume');assert.equal(emptyVolume.read('confirmedVolumeSummary().ratio'),0);assert.match(emptyVolume.element('confirmedvolumetext').textContent,/0× vs prior 10 candles/);
 const a=await openApp({bars:bars()});a.exec('S.k[S.closedIndex-1].v=NaN');assert.equal(a.read('confirmedVolumeSummary().state'),'invalid-data');assert.equal(a.read('confirmedVolumeSummary().ratio'),null);a.exec('S.k.forEach(c=>c.v=Number.MAX_VALUE)');assert.equal(a.read('confirmedVolumeSummary().state'),'invalid-arithmetic');assert.equal(a.read('confirmedVolumeSummary().ratio'),null);
 a.exec('S.k=[];S.history=[];S.chart=null;S.closedIndex=-1;draw()');assert.equal(a.read('confirmedVolumeSummary().status'),'unavailable');assert.match(a.element('confirmedvolumetext').textContent,/no confirmed candle/);a.exec('S.k=[{t:1e30,closed:true}];S.closedIndex=0');assert.equal(a.read('confirmedVolumeSummary().confirmedClose'),null);
});
test('confirmed anchor ignores hover, history-only candles and provisional volume, then advances only on real confirmation',async()=>{
 const a=await openApp({bars:bars(60,150)}),before=a.read('confirmedVolumeSummary()'),initial=engine(a),last=bars().at(-1);
 a.exec('S.mouse={x:20,y:50};panBars(-12);S.history=Array.from({length:20},(_,i)=>({...S.k[0],t:S.k[0].t-(20-i)*TFMS[S.tf],v:1e6}));draw()');assert.deepEqual(a.read('confirmedVolumeSummary()'),before);assert.deepEqual(engine(a),initial);
 a.sockets[0].receive({...last,t:last.t+step,v:100000},false);await a.flush();assert.deepEqual(a.read('confirmedVolumeSummary()'),before);assert.deepEqual(engine(a),initial);
 a.sockets[0].receive({...last,t:last.t+step,v:300},true);await a.flush();const next=a.read('confirmedVolumeSummary()');assert.equal(next.confirmedClose,before.confirmedClose+step);assert.equal(next.ratio,a.read('volumeReference(S.k,S.closedIndex).relative'));
});
test('responsive summary reserves only needed header space, preserves zero, time/price geometry and RSI/None behavior',async()=>{
 for(const width of [1440,430,390,320]){const a=await openApp({bars:bars(60,150,'down'),width,height:width<800?280:760,nativeCanvas:true}),old=await openApp({bars:bars(60,150,'down'),width,height:width<800?280:760,file,nativeCanvas:true});assert.deepEqual(a.read('chartGeometry()'),old.read('chartGeometry()'));const s=a.read('S.chartMetrics.volumeSummary'),v=a.read('S.chartMetrics.volume');assert.ok(s.lines.some(l=>l.includes('vs prior 10 candles')));assert.ok(s.lines.some(l=>l.includes('Rising volume')));assert.ok(s.lines.length<=3);assert.ok(v.top>=s.top+s.height+4);assert.ok(v.height>=20);assert.equal(v.zero,old.read('S.chartMetrics.volume.zero'));if(width===1440)assert.ok(Math.abs(v.height-old.read('S.chartMetrics.volume.height'))<1e-9);
  for(const pane of ['rsi','none','volume']){a.element('pane').onchange({target:{value:pane}});old.element('pane').onchange({target:{value:pane}});await a.flush();await old.flush();assert.equal(a.element('confirmedvolumetext').hidden,pane!=='volume');assert.deepEqual(a.read('chartGeometry()'),old.read('chartGeometry()'));if(pane==='rsi')assert.deepEqual(a.read('S.chartMetrics.rsiY'),old.read('S.chartMetrics.rsiY'));}
 }
});
test('presentation keeps prior journal/preferences bytes and every non-view 0.4.9 function, including actual reference/classification, identical',async()=>{
 const old=await openApp({bars:bars(),file}),storage={...old.localStorage};storage['hybridTerminal.volumePane.v1']=JSON.stringify({schemaVersion:1,heightRatio:.3,ceiling:90});storage.unrelated='keep';const bytes=JSON.stringify(storage),a=await openApp({bars:bars(),localStorage:storage}),base=await openApp({bars:bars(),file,localStorage:{...storage}});assert.equal(JSON.stringify(storage),bytes);
 const before=engine(a);a.exec('setVolumeHeight(200);setVolumeCeiling(30);draw()');assert.deepEqual(engine(a),before);const names=[...fs.readFileSync(file,'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);for(const name of names.filter(n=>!['draw','volumeRange','panel','bindSystem','refreshPivots'].includes(n)))assert.equal(a.read(name+'.toString()'),base.read(name+'.toString()'),name);assert.deepEqual(a.read('S.sig'),base.read('S.sig'));assert.deepEqual(a.read('S.bt'),base.read('S.bt'));
 const fact=a.read('HELP_CONTENT.sections.flatMap(s=>s.facts).find(f=>f.id==="confirmed-volume")');for(const language of ['he','en'])for(const term of ['10','Normal','Rising volume','Vector','RSI','None'])assert.ok(fact[language].includes(term));assert.match(fact.en,/not measured buy\/sell flow/);
});
