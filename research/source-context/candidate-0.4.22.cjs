'use strict';
// Opt-in CLOSED-study QA binding only. Never loaded by application/browser QA.
// The old source seal still checks exact0.4.22; the actual new root is reported,
// not relabelled. All historical scientific code and seals remain unchanged.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{fileURLToPath}=require('node:url');
const root=path.resolve(__dirname,'../..'),logical=path.join(root,'hybrid-terminal.html'),archive=path.join(root,'baseline/hybrid-terminal.0.4.22.html'),read=fs.readFileSync.bind(fs),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const archivedSha256='e037089b4044aff4fee18b696646126c53f024c155076daae3be96240d13dc16',liveSha256=sha(read(logical));assert.equal(sha(read(archive)),archivedSha256,'Archived candidate0.4.22 bytes differ');
const target=file=>{const name=file instanceof URL?fileURLToPath(file):Buffer.isBuffer(file)?file.toString():file;return typeof name==='string'&&path.resolve(name)===logical?archive:file};
fs.readFileSync=(file,...args)=>read(target(file),...args);
const asyncRead=fs.readFile.bind(fs);fs.readFile=(file,...args)=>asyncRead(target(file),...args);
const promises=require('node:fs/promises'),promiseRead=promises.readFile.bind(promises);promises.readFile=(file,...args)=>promiseRead(target(file),...args);
const identity=Object.freeze({contextId:'closed-candidate-context-active-0.4.22-archive-v1',liveApplicationSha256:liveSha256,archivedApplicationSha256:archivedSha256,scope:'Closed study synthetic fixtures only; actual root tested separately; no replay/fitting/outcomes'});
process.stderr.write('[archived candidate study] '+JSON.stringify(identity)+'\n');module.exports={identity};
