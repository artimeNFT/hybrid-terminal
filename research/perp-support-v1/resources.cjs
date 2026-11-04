'use strict';
const assert=require('node:assert/strict'),P=require('./protocol.json');
function admission(samples,decisions,remainingMs,observedCombinedRss){
 assert.ok(samples.length&&samples.every(x=>Number.isFinite(x.ms)&&x.ms>0));
 const maximumSampleMs=Math.max(...samples.map(x=>x.ms)),projectedMs=decisions*maximumSampleMs*2+60000,memoryProjection=observedCombinedRss*2;
 return{admitted:projectedMs<=remainingMs-2000&&memoryProjection<=P.resources.rssBytes,maximumSampleMs,decisions,projectedMs,remainingMs,memoryProjection,reason:projectedMs>remainingMs-2000?'insufficient-remaining-time':memoryProjection>P.resources.rssBytes?'insufficient-RSS-margin':'admitted',rule:P.resources.projectedMs};
}
function limitState(elapsedMs,rssBytes,maximumMs=P.resources.maximumMonotonicMs,rssLimit=P.resources.rssBytes){return{timeExceeded:elapsedMs>=maximumMs,rssExceeded:rssBytes>rssLimit,stop:elapsedMs>=maximumMs||rssBytes>rssLimit}}
module.exports={admission,limitState};
