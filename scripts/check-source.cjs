'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),checks=JSON.parse(fs.readFileSync(path.join(root,'qa/source-checksums.0.4.23.json'),'utf8'));
for(const [file,expected]of Object.entries(checks)){
 const absolute=path.resolve(root,file);assert.ok(absolute.startsWith(root+path.sep),'Checksum path must be inside project');
 const actual=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');assert.equal(actual,expected,file+' differs from reviewed source');console.log('PASS source SHA-256: '+file);
}
console.log('Scope: tracked application/research source and required HTML baselines only; no claim about ignored delivery datasets or historical browser artifacts.');
