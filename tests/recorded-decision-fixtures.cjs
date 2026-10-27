'use strict';
// Synthetic recorded observations only. Never copied from a user journal.
const DAY=Date.UTC(2023,10,14),STEP=300000;
function records(n=25){return Array.from({length:n},(_,i)=>{
 const side=['LONG','SHORT','WAIT'][i%3],entry=100+i,stop=side==='SHORT'?entry+2:entry-2;
 const r={id:'synthetic-'+i,signature:'synthetic-signature-'+i,observedAt:new Date(DAY+i*STEP+STEP+1234).toISOString(),applicationVersion:i%3===0?'0.3.1':i%3===1?'0.4.0':'0.4.15',ruleVersion:'recorded-rule-'+i,symbol:['BTCUSDT','ETHUSDT','SOLUSDT'][i%3],timeframe:['5m','15m','1h','4h'][i%4],candleOpenTime:DAY+i*STEP,candleCloseTime:DAY+(i+1)*STEP,config:{minimumScore:3,roundTripFee:.001},dataContext:{firstCandle:DAY-200*STEP,closedCandleCount:201+i},reference:{o:entry-1,h:entry+1,l:entry-2,c:entry,v:100+i},feedPhase:'rest-snapshot',signal:{side,score:i%6,items:[['exact recorded reason '+i,true],['condition not met',false]],plan:side==='WAIT'?null:{entry,stop,tp1:entry+(side==='SHORT'?-1:1)*3,tp2:entry+(side==='SHORT'?-1:1)*5}}};
 if(i%3!==0)r.config.executionVersion='recorded-execution-'+i;
 if(i%3===2){r.config.rsiPolicy='recorded-RSI';r.candidateDiagnostics={candidates:{LONG:{score:3,items:[['recorded long',true]],eligible:true},SHORT:{score:3,items:[['recorded short',false]],eligible:false}},selection:{reason:'literal-recorded-selection',tied:true},validity:{ready:true,reasons:[]}}}
 return r;
})}
function malformed(){return [
 {id:'missing',signature:'keep-missing',candleCloseTime:DAY+26*STEP},
 {id:'malformed',signature:'keep-malformed',candleCloseTime:DAY+27*STEP,observedAt:'2026-02-30T12:00:00Z',symbol:['BTCUSDT'],timeframe:5,applicationVersion:{bad:true},config:{executionVersion:null},dataContext:{firstCandle:'0',closedCandleCount:0},signal:{side:'WAIT',score:'0',items:[['<img src=x onerror=alert(1)>',null],null,['literal & "quote"',false]],plan:{entry:99,stop:98,tp2:101}},candidateDiagnostics:{candidates:{LONG:{bad:true},SHORT:{bad:true}}}},
 {id:'text',signature:'keep-text',candleCloseTime:DAY+28*STEP,observedAt:'2026-10-20T16:00:00+02:00',symbol:'<img src=x onerror=alert(1)>',timeframe:'<script>bad()</script>',signal:{side:'LONG',score:0,items:[['<svg onload=bad()>literal & "quote"',true]],plan:{entry:1.23456789e-12,stop:null,tp1:'0',tp2:-1}},ruleVersion:'<b>recorded-rule</b>'}
]}
module.exports={records,malformed,DAY,STEP};
