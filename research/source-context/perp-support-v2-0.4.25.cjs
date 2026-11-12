'use strict';
// Opt-in CLOSED perp-support-v2 synthetic QA context only, never app/browser QA.
// Keep the original logical-source seal exact; report the actual candidate separately.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{fileURLToPath}=require('node:url');
const root=path.resolve(__dirname,'../..'),logical=path.join(root,'hybrid-terminal.html'),archive=path.join(root,'baseline/hybrid-terminal.0.4.25.html'),read=fs.readFileSync.bind(fs),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const archivedSha256='f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57',liveSha256=sha(read(logical));
assert.equal(sha(read(archive)),archivedSha256,'Archived perp-support-v2 0.4.25 bytes differ');
const sourceMapping=Object.freeze({'hybrid-terminal.html':'baseline/hybrid-terminal.0.4.25.html'});
const target=file=>{const name=file instanceof URL?fileURLToPath(file):Buffer.isBuffer(file)?file.toString():file;return typeof name==='string'&&path.resolve(name)===logical?archive:file};
fs.readFileSync=(file,...args)=>read(target(file),...args);
const asyncRead=fs.readFile.bind(fs);fs.readFile=(file,...args)=>asyncRead(target(file),...args);
const promises=require('node:fs/promises'),promiseRead=promises.readFile.bind(promises);promises.readFile=(file,...args)=>promiseRead(target(file),...args);
const identity=Object.freeze({contextId:'closed-perp-support-v2-active-0.4.25-archive-v1',liveApplicationSha256:liveSha256,archivedApplicationSha256:archivedSha256,scope:'Closed study synthetic QA only; actual candidate tested separately; no market run, fitting or outcomes'});
process.stderr.write('[archived perp-support-v2 study] '+JSON.stringify(identity)+'\n');module.exports={identity,sourceMapping};
