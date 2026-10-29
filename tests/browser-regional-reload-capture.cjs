'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const {key,fixtureThenCapture,reloadPoll,captureReload}=require('./regional-reload-capture.cjs');
const output=process.env.HYBRID_QA_DIR||'.qa-results/browser/browser-regional-reload-capture',source=path.resolve('hybrid-terminal.html'),now=Date.UTC(2026,6,13,8),bytes=JSON.stringify({schemaVersion:1,enabled:true});
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
(async()=>{
 fs.mkdirSync(output,{recursive:true});const beforeHash=hash(),browser=await chromium.launch({headless:true,args:['--no-sandbox']}),checks=[];
 try{
  for(const fault of [false,true]){
   const context=await browser.newContext(),p=await context.newPage(),file=path.join(output,fault?'controlled-failure.json':'normal.json');
   await context.addInitScript(fixtureThenCapture(({now,key,bytes,fault})=>{
    Date.now=()=>now;localStorage[key]=bytes;localStorage.unrelated='capture-fixture-retain';
    if(fault){const real=localStorage;Object.defineProperty(window,'localStorage',{configurable:true,value:new Proxy(real,{get(t,k){if(k===key)throw Error('Controlled capture validation: regional property read');const value=Reflect.get(t,k,t);return typeof value==='function'?value.bind(t):value}})})}
   },{now,key,bytes,fault}));
   await p.routeWebSocket('wss://stream.binance.com:9443/ws/**',()=>{});
   await p.route('https://api.binance.com/**',async route=>{
    const url=new URL(route.request().url()),dt=({'5m':300000,'15m':900000,'1h':3600000,'4h':14400000})[url.searchParams.get('interval')]||86400000;
    const result=url.pathname.endsWith('/time')?{serverTime:now}:Array.from({length:120},(_,i)=>{const t=now-(120-i)*dt;return[t,'100','102','99','101','100',t+dt-1]});
    await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});
   });
   await p.goto('file://'+source);await p.waitForFunction(()=>S.sig);
   let original,caught;
   try{
    await captureReload(p,file,async()=>{
     await p.reload();
     try{await p.waitForFunction(reloadPoll)}catch(e){original=e;throw e}
     assert.equal(await p.locator('#regionalwindows').isVisible(),true);
    });
   }catch(e){caught=e}
   // Evidence must already exist while the browser/context are still alive.
   assert.equal(p.isClosed(),false);assert.ok(fs.existsSync(file));
   const evidence=JSON.parse(fs.readFileSync(file)),capture=evidence.afterReload.capture;
   assert.equal(evidence.sourceSha256,beforeHash);assert.equal(evidence.afterReload.url,pathToFileURL(source).href);
   assert.equal(capture.stage,'after-fixture-before-app');assert.equal(capture.readyState,'loading');
   assert.deepEqual(capture.preApp.getItem,{type:'string',value:bytes});
   assert.ok(capture.poll.count>0);assert.equal(capture.poll.last.sig.truthy,true);
   assert.equal(capture.poll.last.regionalEnabled.truthy,!fault);
   assert.equal(capture.poll.last.regionalEnabled.json,JSON.stringify(!fault));
   assert.ok(['LONG','SHORT','WAIT'].includes(JSON.parse(capture.poll.last.sig.json).side));
   assert.equal(capture.preApp.sig.error.name,'ReferenceError');
   assert.equal(evidence.afterReload.now.getItem.value,bytes);
   assert.equal(await p.evaluate(()=>localStorage.getItem('unrelated')),'capture-fixture-retain');
   assert.equal(evidence.afterReload.now.version.value,'0.4.21');
   if(fault){
    assert.strictEqual(caught,original);assert.equal(caught.name,'TimeoutError');assert.match(caught.message,/30000ms/);
    assert.equal(evidence.result,'failed');assert.equal(evidence.originalError.message,original.message);
    assert.match(capture.preApp.property.error.message,/Controlled capture validation/);
    assert.equal(evidence.afterReload.now.regionalStorage.value,'session-only');
   }else{
    assert.equal(caught,undefined);assert.equal(evidence.result,'passed');
    assert.deepEqual(capture.preApp.property,{type:'string',value:bytes});
   }
   checks.push({case:fault?'controlled property-read fault, expected original 30-second timeout':'normal restoration',pollCount:capture.poll.count,evidenceSavedBeforeTeardown:true,backingBytesPreserved:true,originalErrorPreserved:fault});
  }
  assert.equal(hash(),beforeHash);
  fs.writeFileSync(path.join(output,'validation.json'),JSON.stringify({sourceSha256:beforeHash,checks,scope:'Synthetic isolated file-URL contexts; controlled failure validates capture, not the unresolved intermittent cause'},null,2)+'\n');
  console.log('PASS: regional pre-app preference capture, actual separate reload operands, normal restoration, controlled original 30-second failure saved before teardown/rethrown unchanged; backing bytes and application unchanged.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
