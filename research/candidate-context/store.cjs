'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs');
function writeNew(out,name,payload){const doc={payload,sha256:D.hash(payload)},file=path.join(out,name);if(fs.existsSync(file)){assert.equal(fs.readFileSync(file,'utf8'),D.canonical(doc),'Immutable artifact mismatch')}else fs.writeFileSync(file,D.canonical(doc),{flag:'wx'});return doc}
function read(out,name){const d=JSON.parse(fs.readFileSync(path.join(out,name)));assert.equal(D.hash(d.payload),d.sha256,'Artifact hash mismatch '+name);return d}
function save(out,cp){const doc={payload:cp,sha256:D.hash(cp)};fs.writeFileSync(path.join(out,'checkpoint.tmp'),D.canonical(doc));fs.renameSync(path.join(out,'checkpoint.tmp'),path.join(out,'checkpoint.json'))}
function sources(){const names=['research/candidate-context/protocol.json','research/candidate-context/SPECIFICATION.md',...fs.readdirSync('research/candidate-context').filter(n=>n.endsWith('.cjs')).map(n=>'research/candidate-context/'+n),'hybrid-terminal.html','research/derivatives/schema.cjs','research/klines.cjs','research/derivatives-pilot/input.cjs','research/derivatives-pilot/contract.json','research/derivatives-pilot/protocol.json'];return Object.fromEntries(names.sort().map(f=>[f,D.sha(fs.readFileSync(f))]))}
module.exports={writeNew,read,save,sources};
