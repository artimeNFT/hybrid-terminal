'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const protocol=require('./protocol.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function sources(){
 const html=fs.readFileSync(path.resolve(__dirname,'../../baseline/hybrid-terminal.0.4.3.html'),'utf8');
 assert.equal(sha(html),protocol.source.applicationSha256);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1],start=script.indexOf('function backtest('),end=script.indexOf('\nfunction ',start+8),body=script.slice(start,end);
 assert.equal(sha(body),protocol.source.backtestSha256);
 const helpers=['^const finite=.*$','^function numericBar.*$','^function closedEnd.*$'].map(p=>{const m=script.match(new RegExp(p,'m'));assert.ok(m);return m[0]}).join('\n');
 return{body,helpers};
}
function simulate(bars,decisionAt,{first=protocol.measurement.firstDecisionIndex,last=bars.length-121,original=false}={}){
 const {body,helpers}=sources();let code=body;
 if(!original){
  const changes=[['let i=60;','let i=__first;'],['while(i<n-2)','while(i<=__last)'],['T.push({R:', 'T.push({decisionIndex:i,entryIndex:i+1,exitIndex:j>i+120?i+120:j,loopExitCursor:j,nextDecisionIndex:j+1,R:']];
  for(const [from,to] of changes){assert.equal(code.split(from).length,2);code=code.replace(from,to)}
  assert.ok(Number.isSafeInteger(first)&&first>=0&&Number.isSafeInteger(last)&&last<=bars.length-121&&last>=first,'Complete follow-up bounds required');
 }
 const context=vm.createContext({__Math:Math,__Number:Number,__first:first,__last:last,
  S:{k:bars.map(b=>({...b,closed:true}))},sigAt:decisionAt,summarizeTrades:trades=>trades});
 // Calculation decisions enter only through the existing full-past-prefix adapter.
 // The frozen execution expressions and cursor are not rewritten.
 const result=new vm.Script("'use strict';const Math=__Math,Number=__Number;\n"+helpers+'\n'+code+'\nbacktest()',{filename:'frozen-policy-execution'}).runInContext(context,{timeout:protocol.resources.maximumWallSeconds*1000});
 assert.ok(Array.isArray(result),'Frozen execution rejected invalid input');
 return JSON.parse(JSON.stringify(result));
}
function annotate(trades,bars,decisions){
 const byIndex=new Map(decisions.map(d=>[d.index,d]));
 return trades.map(t=>{
  const frame=byIndex.get(t.decisionIndex),p=frame.decision.plan,b=bars[t.exitIndex],risk=Math.abs(p.stop-t.entry),expiry=t.loopExitCursor>t.decisionIndex+120;
  const stopHit=!expiry&&(t.sh?b.h>=p.stop:b.l<=p.stop),targetHit=t.sh?b.l<=p.tp2:b.h>=p.tp2;
  assert.ok(expiry||stopHit||targetHit,'Unexplained frozen execution exit');
  assert.ok(Number.isFinite(risk)&&risk>0);assert.equal(t.R,t.grossR-.001*t.entry/risk);
  return{...t,risk,side:t.sh?'SHORT':'LONG',decisionCloseTime:frame.closeTime,entryOpenTime:bars[t.entryIndex].t,
   exitBarOpenTime:b.t,exitBarCloseTime:b.t+protocol.data.stepMs,nextDecisionBarOpenTime:bars[t.nextDecisionIndex]?.t??(bars[0].t+t.nextDecisionIndex*protocol.data.stepMs),
   exitReason:expiry?'expiry':stopHit?'stop':'TP2',stopAtOpen:stopHit&&(t.sh?b.o>=p.stop:b.o<=p.stop),sameBarStopTp2:stopHit&&targetHit,
   holdingBars:t.exitIndex-t.entryIndex+1,plan:p};
 });
}
module.exports={simulate,annotate,sources};
