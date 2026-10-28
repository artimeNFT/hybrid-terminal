'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const D=require('../derivatives/schema.cjs'),contract=require('./contract.json'),protocol=require('./protocol.json');
const verified=new WeakSet();
function decodeTradeDocument(document){
 const q=D.verifySeries(document);assert.equal(document.payload.series,'trade','Only trade OHLC/volume may enter this pilot');assert.equal(q.state,'complete','Complete closed trade grid required');
 const bars=document.payload.rows.map(r=>Object.freeze({t:r[0],o:Number(r[1]),h:Number(r[2]),l:Number(r[3]),c:Number(r[4]),v:Number(r[5])}));
 assert.ok(bars.length>0&&bars.length<=contract.state.maximumBars);assert.ok(bars.every(b=>Object.values(b).every(Number.isFinite)),'Finite Number conversion required');
 const result=Object.freeze({kind:'verified-usdm-trade-bars',bars:Object.freeze(bars),dataIdentity:Object.freeze({schema:document.payload.schema,contract:document.payload.contract,series:'trade',dataHash:document.dataHash,range:document.payload.range,rowCount:bars.length,volumeSource:'trade tuple[5] in BTC; never Mark placeholders',conversion:'Verified original decimal strings/hash before binary Number conversion'})});verified.add(result);return result;
}
function assertInput(input){assert.ok(verified.has(input),'Typed validated derivatives trade input required; no plain/Spot/Mark bars');assert.equal(input.dataIdentity.series,'trade')}
function loadPinnedTrade(file){
 const bytes=fs.readFileSync(file),document=JSON.parse(bytes),input=decodeTradeDocument(document),d=contract.data;
 assert.equal(document.dataHash,d.tradeHash,'Wrong reviewed derivatives trade hash');assert.equal(input.bars.length,d.rows);assert.equal(document.payload.range.startInclusive,d.startInclusive);assert.equal(document.payload.range.endExclusive,d.endExclusive);
 const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(file),'bundle.json'),'utf8'));
 assert.equal(manifest.kind,'hybrid-usdm-public-bundle');assert.equal(manifest.state,'verified');assert.equal(manifest.dataBundleHash,d.bundleHash);assert.equal(manifest.metadataHash,protocol.provenanceOnly.metadataHash);
 assert.equal(D.canonical(manifest.contract),D.canonical(D.CONTRACT));assert.equal(D.canonical(manifest.range),D.canonical(document.payload.range));
 const hashes=Object.fromEntries(['trade','mark','funding'].map(s=>[s,manifest.series[s].dataHash]));assert.equal(D.hash(hashes),d.bundleHash);assert.equal(hashes.trade,d.tradeHash);assert.equal(hashes.mark,protocol.provenanceOnly.markHash);assert.equal(hashes.funding,protocol.provenanceOnly.fundingHash);
 // Companions are provenance references, not input arrays. Never read Mark/funding rows.
 return{input,identity:{...input.dataIdentity,fileSha256:D.sha(bytes),bundleHash:d.bundleHash,companionProvenance:protocol.provenanceOnly}};
}
module.exports={decodeTradeDocument,assertInput,loadPinnedTrade};
