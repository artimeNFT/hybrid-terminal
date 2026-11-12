'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const {bars,day,step,dailyRows}=require('./target-path-fixtures.cjs');
const SOURCE=path.resolve('hybrid-terminal.html'),HASH='3deca059295efcf960b3177b28c27a2f5ccd752976e47d0842154f81178ebcfd',OUT=process.env.HYBRID_INTEGRATION_QA_DIR||'.qa-results/economics-sizing-supplement-pass1',NOW=day+500*step+1;
const assertions=[],captures=[],errors=[];let current=null,browser=null;
const sourceHash=()=>crypto.createHash('sha256').update(fs.readFileSync(SOURCE)).digest('hex');
function equal(label,actual,expected){assert.deepEqual(actual,expected,label);assertions.push({...current,label,actual,expected,pass:true})}
function near(label,actual,expected,tolerance=1e-12){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);assertions.push({...current,label,actual,expected,tolerance,pass:true})}
const number=text=>Number(text.replace(/≈|%|USDT|BTC/g,'').trim());
// Independent literal oracle: no application calculation function is called here.
function expected(side,account,risk,fee,slippage,gap){const E=100,S=side==='LONG'?99:101,D=1,B=account*risk/100,F=E*(fee+slippage)/10000,G=S*gap/10000,L=D+F+G;return{riskBudget:B,unitLoss:L,quantity:B/L,notional:E*B/L,nominalQuantity:B/D,nominalLoss:B*L/D,payoff:(2-F)/D,costR:F/D,ordinaryPercent:100*(D+F)/(2+D),gapPercent:100*(D+F+G)/(2+D+G)}}
async function expand(p,id){if(!await p.locator('#'+id).evaluate(e=>e.open)){await p.locator('#'+id+' > summary').focus();await p.keyboard.press('Enter')}}
async function economics(p){return p.evaluate(()=>Object.fromEntries(['planpayoff','planscenariocost','planrequired','planrequiredgap'].map(id=>[id,document.getElementById(id).textContent])))}
async function typed(p,id,value){const e=p.locator('#'+id);await e.fill('');await e.pressSequentially(value);equal(id+' native value',await e.inputValue(),value);equal(id+' focus after typing',await p.evaluate(()=>document.activeElement.id),id);await p.evaluate(()=>{for(let i=0;i<3;i++)updatePlanningCosts()});equal(id+' value after refresh',await e.inputValue(),value);equal(id+' focus after refresh',await p.evaluate(()=>document.activeElement.id),id)}
async function fit(p){equal('document horizontal fit',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);for(const id of ['planeconomics','sz','modeledrisksizing'])equal(id+' horizontal fit',await p.locator('#'+id).evaluate(e=>e.scrollWidth<=e.clientWidth+1),true)}
async function shots(p,phase){for(const id of ['planeconomics','sz']){const file=`${current.width}-${current.side}-${phase}-${id}.png`;await p.locator('#'+id).screenshot({path:path.join(OUT,file)});captures.push({...current,phase,section:id,file});await p.locator('#'+id).evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest'}));const viewport=`${current.width}-${current.side}-${phase}-${id}-viewport.png`;await p.screenshot({path:path.join(OUT,viewport)});captures.push({...current,phase,section:id,file:viewport,kind:'viewport'})}await fit(p)}
async function verify(p,e,gap){const v=await p.locator('#modeledriskexact').evaluate(x=>JSON.parse(x.textContent));for(const k of ['riskBudget','unitLoss','quantity','notional','nominalQuantity','nominalLoss'])near(k,v[k],e[k]);
 for(const [id,k,tol]of [['planpayoff','payoff',6e-5],['planscenariocost','costR',6e-5],['planrequired','ordinaryPercent',6e-7]])near(id,number(await p.locator('#'+id).innerText()),e[k],tol);
 for(const k of ['quantity','notional','nominalLoss'])near('display '+k,number(await p.locator(`[data-modeled-metric="${k}"]`).innerText()),e[k],6e-6);
 equal('gap row visibility',await p.locator('#planrequiredgaprow').evaluate(x=>!x.hidden),gap>0);if(gap>0)near('gap requirement',number(await p.locator('#planrequiredgap').innerText()),e.gapPercent,6e-7);
 equal('planning/execution warning',/אינה כמות מומלצת או לביצוע/.test(await p.locator('#modeledrisksizing').innerText()),true);equal('funding exclusion warning',/לא מניחים שהם אפס/.test(await p.locator('#modeledrisksizing').innerText()),true);equal('technical eligibility warning',/אינה ראיה ליתרון מסחרי או אישור ביצוע/.test(await p.locator('#planeconomics').innerText()),true);
}
async function noSizing(p){equal('sizing unavailable',await p.locator('[data-modeled-sizing="unavailable"]').count(),1);equal('no stale sizing metrics',await p.locator('[data-modeled-metric]').count(),0)}
async function noEconomics(p){for(const id of ['planpayoff','planscenariocost','planrequired','planrequiredgap'])equal(id+' unavailable',await p.locator('#'+id).textContent(),'לא זמין');equal('gap row cleared',await p.locator('#planrequiredgaprow').evaluate(e=>e.hidden),true)}
function receipt(state,failure=null){return{state,sourceSha256:sourceHash(),requiredSha256:HASH,node:process.version,assertions,captures,errors,failure,scope:'One independent-arithmetic, mocked browser supplement; 1440/320 LONG/SHORT only. No live data, previous six-scenario rerun, full QA or integration approval.'}}
(async()=>{
 assert.equal(sourceHash(),HASH,'HTML changed before run');fs.mkdirSync(OUT); // Exclusive: existing evidence is never overwritten.
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const width of [1440,320])for(const side of ['LONG','SHORT']){
   current={width,side,phase:'initial'};const ctx=await browser.newContext({viewport:{width,height:1100}}),p=await ctx.newPage();
   p.on('pageerror',e=>errors.push({...current,message:e.message}));p.on('console',m=>{if(m.type()==='error')errors.push({...current,message:m.text()})});
   const data=bars().map(b=>side==='SHORT'?{...b,o:200-b.o,c:200-b.c,h:200-b.l,l:200-b.h}:b);
   await p.addInitScript(now=>{Date.now=()=>now;localStorage['hybridTerminal.marketProduct.v1']=JSON.stringify({schemaVersion:1,product:'usdm'})},NOW);
   await p.routeWebSocket(/wss:\/\/(stream|fstream)\.binance\.com/,()=>{});
   for(const host of ['api','fapi'])await p.route('https://'+host+'.binance.com/**',async r=>{const u=new URL(r.request().url()),tf=u.searchParams.get('interval'),dt=({'5m':step,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000})[tf];let value;if(u.pathname.endsWith('/time'))value={serverTime:NOW};else if(tf==='1d'&&u.searchParams.has('startTime'))value=dailyRows(u.href);else{const source=tf==='5m'?data:Array.from({length:70},(_,i)=>({t:Math.floor(NOW/dt)*dt-(70-i)*dt,o:100,h:102,l:98,c:101,v:100}));value=source.map(b=>[b.t,b.o,b.h,b.l,b.c,b.v,b.t+dt-1])}await r.fulfill({contentType:'application/json',body:JSON.stringify(value)})});
   await p.goto('file://'+SOURCE);await p.waitForFunction(()=>S.sig&&S.connected);
   await p.evaluate(side=>{const d=side==='LONG'?1:-1;Object.assign(S.k[S.closedIndex],{o:100,h:110,l:90,c:100,closed:true});for(const name of ['LONG','SHORT'])if(!Array.isArray(S.sig.candidates?.[name]?.items)||S.sig.candidates[name].items.length!==5)throw Error('Initialized candidate diagnostics unavailable: '+name);S.sig={...S.sig,side,short:side==='SHORT',validity:{...S.sig.validity,ready:true},candidates:{LONG:{...S.sig.candidates.LONG,eligible:true},SHORT:{...S.sig.candidates.SHORT,eligible:true}},plan:{entry:100,stop:100-d,tp1:100+d,tp2:100+2*d,rr:2}};updatePlanningCosts()},side);
   await expand(p,'sz');await expand(p,'planningcosts');await verify(p,expected(side,1000,1,10,0,0),0);await shots(p,'initial');
   const unchanged=await economics(p);
   current.phase='capital';await typed(p,'acc','2000');await verify(p,expected(side,2000,1,10,0,0),0);equal('account leaves economics unchanged',await economics(p),unchanged);
   await typed(p,'rk','2');await verify(p,expected(side,2000,2,10,0,0),0);equal('risk leaves economics unchanged',await economics(p),unchanged);await shots(p,'capital');
   current.phase='costs';await typed(p,'planningfee','20');await verify(p,expected(side,2000,2,20,0,0),0);
   await typed(p,'planningslippage','5');await verify(p,expected(side,2000,2,20,5,0),0);
   await typed(p,'planninggap','100');await verify(p,expected(side,2000,2,20,5,100),100);await shots(p,'costs');
   current.phase='invalid-capital';const validEconomics=await economics(p);
   for(const id of ['acc','rk']){await p.locator('#'+id).fill('');await p.locator('#'+id).pressSequentially('1e');equal(id+' native partial input',await p.locator('#'+id).evaluate(e=>e.validity.badInput),true);await noSizing(p);equal(id+' invalid keeps valid economics',await economics(p),validEconomics);await p.evaluate(()=>{for(let i=0;i<3;i++)updatePlanningCosts()});equal(id+' partial focus retained',await p.evaluate(()=>document.activeElement.id),id);equal(id+' partial state retained',await p.locator('#'+id).evaluate(e=>e.validity.badInput),true);await p.locator('#'+id).fill(id==='acc'?'2000':'2');await verify(p,expected(side,2000,2,20,5,100),100)}
   current.phase='invalid-costs';for(const [id,value]of [['planningfee','20'],['planningslippage','5'],['planninggap','100']]){await p.locator('#'+id).fill('');await noSizing(p);await noEconomics(p);equal(id+' cleared input focus',await p.evaluate(()=>document.activeElement.id),id);equal(id+' empty native value',await p.locator('#'+id).inputValue(),'');await p.locator('#'+id).fill(value);await verify(p,expected(side,2000,2,20,5,100),100)}
   await p.locator('#planningfee').fill('');await p.screenshot({path:path.join(OUT,`${width}-${side}-invalid-cost.png`)});captures.push({...current,file:`${width}-${side}-invalid-cost.png`});await p.locator('#planningfee').fill('20');
   current.phase='WAIT';await p.evaluate(()=>{S.sig.side='WAIT';updatePlanningCosts()});await noSizing(p);await noEconomics(p);equal('WAIT economics hidden',await p.locator('#planeconomics').evaluate(e=>e.hidden),true);await p.locator('#planworkspace').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,`${width}-${side}-WAIT.png`)});captures.push({...current,file:`${width}-${side}-WAIT.png`});
   console.log(`PASS ${width}px ${side}: independent economics+sizing arithmetic, capital/cost inputs, native typing, invalid clearing and WAIT`);
   // Keep contexts open: existing guard saves traces before browser.close closes them.
  }
  equal('no page/console errors',errors,[]);equal('HTML unchanged after scenarios',sourceHash(),HASH);
  await browser.close();browser=null; // Existing guard records any unmocked requests and saves traces first.
  fs.writeFileSync(path.join(OUT,'assertions.json'),JSON.stringify(receipt('PASS'),null,2)+'\n',{flag:'wx'});
  console.log(`PASS ${assertions.length} assertions, ${captures.length} captures; four supplement scenarios only.`);
 }catch(e){try{fs.writeFileSync(path.join(OUT,'assertions.json'),JSON.stringify(receipt('FAIL',{message:e.message,stack:e.stack,current}),null,2)+'\n',{flag:'wx'})}catch{}throw e}
 finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
