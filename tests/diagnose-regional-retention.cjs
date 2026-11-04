'use strict';
// One bounded supplemental pair, not a replacement for the original file test.
// Same 120-bar/clock/empty-regional-key fixture as browser-regional-windows.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const {fixtureThenCapture,reloadPoll,captureReload,key}=require('./regional-reload-capture.cjs');
const output=process.env.HYBRID_QA_DIR||'.qa-results/qa-closure-0.4.25/regional-pair',source=path.resolve('hybrid-terminal.html'),initialNow=Date.UTC(2026,6,13,8),steps={'5m':300000,'15m':900000,'1h':3600000,'4h':14400000},bytes=JSON.stringify({schemaVersion:1,enabled:true});
const bars=tf=>Array.from({length:120},(_,i)=>{const center=100+Math.sin(i/7),o=center-.1,c=center+.1;return{t:initialNow-(120-i)*steps[tf],o,c,h:center+.4,l:center-.4,v:i===119?150:100}});
async function sample(page){return page.evaluate(key=>{
 const read=fn=>{try{const value=fn();return{type:typeof value,value:value===undefined?null:value}}catch(e){return{error:{name:e.name,message:e.message}}}};
 return{url:location.href,origin:location.origin,performanceMs:performance.now(),raw:read(()=>localStorage[key]),getItem:read(()=>localStorage.getItem(key)),unrelated:read(()=>localStorage.unrelated),enabled:S.regionalEnabled,storage:S.regionalStorage,sigPresent:!!S.sig,symbol:S.sym,timeframe:S.tf};
},key)}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 // An interrupted comparison is retained, never silently repeated as a new try.
 fs.writeFileSync(path.join(output,'comparison-started.json'),JSON.stringify({startedAt:new Date().toISOString(),maxPairs:1,maxReloadsPerOrigin:1})+'\n',{flag:'wx'});
 const sourceSha256=crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),browser=await chromium.launch({headless:true,args:['--no-sandbox']}),results=[];
 try{
  for(const origin of ['file','mocked-http']){
   const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[],requests=[],writes=[];let socket;
   page.on('pageerror',e=>errors.push(e.message));
   await context.addInitScript(fixtureThenCapture(({now,key})=>{
    const snap=()=>{const read=fn=>{try{const value=fn();return{type:typeof value,value:value===undefined?null:value}}catch(e){return{error:{name:e.name,message:e.message}}}};return{raw:read(()=>localStorage[key]),getItem:read(()=>localStorage.getItem(key)),unrelated:read(()=>localStorage.unrelated)}};
    window.__retentionBeforeFixtureWrite=snap();
    window.__regionalDevice=now;Date.now=()=>window.__regionalDevice;window.__intervalCalls=[];const interval=window.setInterval;window.setInterval=function(fn,delay,...args){window.__intervalCalls.push(delay);return interval.call(this,fn,delay,...args)};
    // No regional seed, especially not on reload. Same unrelated seed as original.
    localStorage.unrelated='retain';window.__retentionAfterFixtureWrite=snap();
   },{now:initialNow,key}));
   if(origin==='mocked-http')await page.route('http://hybrid.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(source,'utf8')}));
   await page.routeWebSocket('wss://stream.binance.com:9443/ws/**',ws=>{socket=ws});
   await page.route('https://api.binance.com/**',async route=>{
    const u=new URL(route.request().url());requests.push(u.href);let result;
    if(u.pathname.endsWith('/time'))result={serverTime:initialNow};else{
     const tf=u.searchParams.get('interval'),dt=steps[tf]||86400000,end=u.searchParams.get('endTime'),data=end?Array.from({length:1000},(_,i)=>({t:+end+1-(1000-i)*dt,o:100,c:100.1,h:100.5,l:99.5,v:200})):u.searchParams.get('limit')==='1000'?bars(tf):Array.from({length:70},(_,i)=>({t:initialNow-(70-i)*dt,o:100,c:100.1,h:101,l:99,v:100}));result=data.map(b=>[b.t,''+b.o,''+b.h,''+b.l,''+b.c,''+b.v,b.t+dt-1]);
    }await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});
   });
   const url=origin==='file'?pathToFileURL(source).href:'http://hybrid.test/';await page.goto(url);await page.waitForFunction(()=>S.sig&&S.chartMetrics?.volumeSummary&&S.connected);
   const last=bars('5m').at(-1);socket.send(JSON.stringify({s:'BTCUSDT',k:{s:'BTCUSDT',i:'5m',t:last.t,T:last.t+steps['5m']-1,o:''+last.o,h:''+last.h,l:''+last.l,c:''+last.c,v:''+last.v,x:true}}));await page.waitForFunction(()=>feedHealth().ready);
   const initial={fixture:await page.evaluate(()=>({beforeWrites:window.__retentionBeforeFixtureWrite,afterWrites:window.__retentionAfterFixtureWrite,preInit:window.__regionalReloadCapture.preApp})),postInit:await sample(page)};
   assert.equal(initial.fixture.beforeWrites.raw.value,null);assert.equal(initial.fixture.afterWrites.raw.value,null);assert.equal(initial.postInit.enabled,false);
   await page.locator('#displaybtn').click();
   for(const enabled of [true,false,true]){
    const before=await sample(page);await page.locator('#regionalenabled').setChecked(enabled);const after=await sample(page);writes.push({enabled,before,after});
    assert.equal(after.raw.value,JSON.stringify({schemaVersion:1,enabled}));assert.equal(after.enabled,enabled);
   }
   await page.locator('#displaybtn').click();await page.locator('#sym').selectOption('ETHUSDT');await page.waitForFunction(()=>S.sym==='ETHUSDT'&&S.sig);await page.locator('[data-tf="15m"]').click();await page.waitForFunction(()=>S.tf==='15m'&&S.sig);
   const beforeReload=await sample(page),beforeSource=await page.evaluate(()=>({sig:S.sig,bt:S.bt}));assert.equal(beforeReload.raw.value,bytes);
   const file=path.join(output,origin+'-reload.json');let originalError=null;
   try{await captureReload(page,file,async()=>{await page.reload();await page.waitForFunction(reloadPoll);assert.equal(await page.locator('#regionalwindows').isVisible(),true)})}catch(e){if(e.name!=='TimeoutError')throw e;originalError={name:e.name,message:e.message}}
   const stored=JSON.parse(fs.readFileSync(file)),postInit=await sample(page),fixture=await page.evaluate(()=>({beforeWrites:window.__retentionBeforeFixtureWrite,afterWrites:window.__retentionAfterFixtureWrite,preInit:window.__regionalReloadCapture.preApp}));
   // Compare observations, not assumptions of universal file-origin persistence.
   assert.equal(postInit.url,url);assert.equal(postInit.sigPresent,true);assert.equal(postInit.unrelated.value,'retain');assert.deepEqual(errors,[]);
   assert.equal(stored.afterReload.capture.preApp.getItem.value,fixture.preInit.getItem.value);assert.equal(stored.afterReload.capture.poll.last.sig.truthy,true);
   if(!originalError){assert.equal(postInit.raw.value,bytes);assert.equal(postInit.enabled,true)}
   results.push({origin,url,initial,writes,beforeReload,fixtureOnReload:fixture,postInit,result:originalError?'retention-not-restored':'retained-and-restored',originalError,actualPoll:stored.afterReload.capture.poll,sourceBeforeReload:{symbol:beforeReload.symbol,timeframe:beforeReload.timeframe,side:beforeSource.sig.side},requests,errors});
   fs.writeFileSync(path.join(output,'comparison.json'),JSON.stringify({sourceSha256,results,scope:'One isolated paired comparison; native storage, no regional reseed on reload; same synthetic clock/bars/empty seed; no user-origin change or personal profile; differing outcome alone cannot prove file-origin causality'},null,2)+'\n');
  }
  assert.equal(results.length,2);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),sourceSha256);
  console.log('Regional one-pair evidence: '+results.map(r=>r.origin+'='+r.result).join(', '));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
