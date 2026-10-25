'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {randomBars}=require('./regression.cjs');
const qaDirectory=process.env.HYBRID_QA_DIR||'tests/results/browser';
const DAY=86400000,step=300000,day=Date.UTC(2026,9,20),bars=randomBars(8,600).map((b,i)=>({...b,t:day+i*step})),now=bars.at(-1).t+step+1;
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 let socket;
 await page.routeWebSocket('wss://stream.binance.com:9443/ws/**',ws=>{socket=ws});
 await page.route('https://api.binance.com/**',async route=>{
  const u=new URL(route.request().url());let data;
  if(u.pathname.endsWith('/time'))data={serverTime:now};
  else if(u.searchParams.get('interval')==='1d'&&u.searchParams.has('startTime')){data=[];for(let t=+u.searchParams.get('startTime');t<=+u.searchParams.get('endTime');t+=DAY)data.push([t,'100','110','90','100','1000',t+DAY-1])}
  else {const interval=u.searchParams.get('interval'),dt=({'5m':step,'15m':9e5,'1h':36e5,'4h':144e5,'1d':DAY})[interval];let source=interval==='5m'?bars:Array.from({length:100},(_,i)=>({t:Math.floor(now/dt)*dt-(99-i)*dt,o:100,h:102,l:98,c:101,v:100}));
   if(u.searchParams.has('endTime')){const end=+u.searchParams.get('endTime');source=Array.from({length:1000},(_,i)=>({t:end+1-(1000-i)*dt,o:100,h:102,l:98,c:101,v:100}))}
   data=source.map(b=>[b.t,''+b.o,''+b.h,''+b.l,''+b.c,''+b.v,b.t+dt-1]);}
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('file://'+path.resolve('hybrid-terminal.html'));await page.waitForFunction(()=>S.k.length===600&&S.sig);
 const original=await page.evaluate(()=>({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]}));
 await page.locator('#palette').selectOption('pvsra');await page.locator('#body').selectOption('hollow');await page.locator('#displaybtn').click();await page.locator('#pane').selectOption('rsi');await page.locator('#pivots').click();await page.waitForFunction(()=>S.pivotStatus==='ready'&&document.getElementById('dailyexact').textContent.includes('PP 100.00'));
 await page.locator('#dailydetails > summary').click();assert.match(await page.locator('#dailyexact').innerText(),/PP 100.00/);await page.locator('#dailydetails > summary').click();assert.deepEqual(await page.evaluate(()=>({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]})),original);
 await page.locator('#cv').hover({position:{x:500,y:300}});await page.mouse.wheel(0,-140);await page.locator('#back').click();assert.equal(await page.evaluate(()=>S.follow),false);
 await page.locator('#cv').focus();await page.keyboard.press('Home');await page.keyboard.press('End');assert.equal(await page.evaluate(()=>S.follow),true);
 await page.locator('#hq').click();assert.match(await page.locator('#hp').innerText(),/Hollow up/);assert.match(await page.locator('#hp').innerText(),/RSI14/);await page.locator('#hp button').click();
 fs.mkdirSync(qaDirectory,{recursive:true});
 async function checkLayout(name,width,height){await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const layout=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,canvas:document.querySelector('#cv').getBoundingClientRect().toJSON(),controls:['palette','body','pane','pivots'].map(id=>({id,...document.getElementById(id).getBoundingClientRect().toJSON()})),chartText:document.getElementById('cw').innerText,aside:document.querySelector('aside').lang}));
  assert.ok(layout.scroll<=width+1,`${name}: horizontal overflow`);assert.ok(layout.canvas.height>=120,`${name}: canvas too short ${layout.canvas.height}`);assert.ok(layout.controls.every(c=>c.x>=0&&c.right<=width&&c.height>0));assert.doesNotMatch(layout.chartText,/[\u0590-\u05ff]/);assert.equal(layout.aside,'he');
  await page.screenshot({path:path.join(qaDirectory,`${name}.png`),fullPage:true});console.log('PASS layout',name,JSON.stringify({width,height,canvasHeight:layout.canvas.height}));
 }
 await checkLayout('desktop',1440,1000);await checkLayout('narrow',430,1000);await checkLayout('phone',390,844);
 await page.locator('#volumetags').check();await page.locator('#displaybtn').click();
 await page.reload();await page.waitForFunction(()=>S.k.length===600&&S.pivotStatus==='ready');assert.deepEqual(await page.evaluate(()=>[S.palette,S.body,S.pane,S.pivots,S.volumeTags]),['pvsra','hollow','rsi',true,true]);
 const last=bars.at(-1);socket.send(JSON.stringify({s:'BTCUSDT',k:{t:last.t+step,o:''+last.c,h:''+(last.h+2),l:''+last.l,c:''+(last.c+1),v:'100',x:false,s:'BTCUSDT',i:'5m'}}));await page.waitForFunction(()=>S.preview!==null);await page.waitForTimeout(50);assert.equal(await page.evaluate(()=>S.k.at(-1).closed),false);
 await page.locator('#historybtn').click();await page.waitForFunction(()=>S.history.length===1000&&!S.historyBusy);assert.equal(await page.evaluate(()=>S.follow),false);
 assert.deepEqual(errors,[]);console.log('PASS: actual Chromium/Canvas, independent appearance controls, synchronized RSI, daily pivot labels, desktop/430/390px layouts, navigation, Hebrew Help/panel, storage restoration, provisional WebSocket and older history; no page/console errors. Network data mocked.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
