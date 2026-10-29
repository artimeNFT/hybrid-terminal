'use strict';
// Opt-in archival context for the original Spot pilot's0.4.17 active-source
// metadata and0.4.3 calculation source. Never loaded by the app/browser QA.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{fileURLToPath}=require('node:url');
const root=path.resolve(__dirname,'../..'),logical=path.join(root,'hybrid-terminal.html'),archive=path.join(root,'baseline/hybrid-terminal.0.4.17.html'),read=fs.readFileSync.bind(fs),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const archivedSha256='a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a',liveSha256=sha(read(logical));assert.equal(sha(read(archive)),archivedSha256,'Archived pilot0.4.17 bytes differ');
assert.equal(sha(read(path.join(__dirname,'preload.cjs'))),'a34fc16753e3138fc866e3a9929e24b9930f5000273e361dcaf80835b23614b3','Historical calculation loader differs');
// During the original loader's identity capture, its logical root is the exact
// historical active app. That loader then binds calculations to frozen0.4.3.
fs.readFileSync=(file,...args)=>{const name=file instanceof URL?fileURLToPath(file):Buffer.isBuffer(file)?file.toString():file;return read(typeof name==='string'&&path.resolve(name)===logical?archive:file,...args)};
const historical=require('./preload.cjs');
assert.equal(historical.identity.activeApplicationSha256,archivedSha256);
const identity=Object.freeze({contextId:'spot-pilot-active-0.4.17-archive-v1',liveApplicationSha256:liveSha256,archivedActiveApplicationSha256:archivedSha256,calculationSourceSha256:historical.identity.physicalSourceSha256,scope:'Historical fixtures/stored verification only; live root is not relabelled0.4.17'});
process.stderr.write('[archived Spot pilot] '+JSON.stringify(identity)+'\n');
module.exports={identity};
