'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs');
const {loadPinnedTrade}=require('../derivatives-pilot/input.cjs'),P=require('./protocol.json');
function load(file){
 // Unchanged typed derivatives validation/hash/complete-grid gate only. No
 // application, old calculation adapter, signal or simulator is imported.
 const {identity}=loadPinnedTrade(file),bytes=fs.readFileSync(file);assert.equal(D.sha(bytes),identity.fileSha256);
 const doc=JSON.parse(bytes);assert.equal(doc.dataHash,P.data.tradeHash);assert.equal(identity.bundleHash,P.data.bundleHash);assert.equal(doc.payload.series,'trade');assert.equal(doc.payload.rows.length,P.data.rows);
 const rows=doc.payload.rows.map(r=>Object.freeze({t:r[0],o:Number(r[1]),h:Number(r[2]),l:Number(r[3]),c:Number(r[4]),v:Number(r[5]),buy:Number(r[9])}));
 assert.ok(rows.every(r=>Object.values(r).every(Number.isFinite)),'Finite conversion required');return{byTime:new Map(rows.map(r=>[r.t,r])),identity:{...identity,aggressionVolumeSource:'trade tuple[9]/tuple[5], both BTC; never Mark/quote substitution'}};
}
module.exports={load};
