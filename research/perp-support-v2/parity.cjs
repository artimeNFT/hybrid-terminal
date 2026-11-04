'use strict';
const assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs'),F=require('../perp-support-v1/design.cjs');
// Evidence encoding only: never used to compare or normalize scientific values.
function evidence(v){if(typeof v==='number'&&(!Number.isFinite(v)||Object.is(v,-0)))return{$number:Object.is(v,-0)?'-0':String(v)};if(v===undefined)return{$undefined:true};if(Array.isArray(v))return v.map(evidence);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,evidence(x)]));return v}
function exactFrame(oracle,restricted,index){const a=oracle.at(index),b=restricted.at(index);assert.deepStrictEqual(b,a,'Consumed-frame parity index '+index);const x=F.frameRows(a),y=F.frameRows(b);assert.deepStrictEqual(y,x,'Consumed-feature parity index '+index);assert.deepStrictEqual(restricted.census(),oracle.census(),'Census parity index '+index);return{index,frameHash:D.hash(evidence(a)),featuresHash:D.hash(evidence(x)),censusHash:D.hash(evidence(oracle.census())),featureRows:x.rows.length,exact:true}}
module.exports={exactFrame,evidence};
