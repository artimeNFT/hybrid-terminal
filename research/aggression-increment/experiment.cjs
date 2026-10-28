'use strict';
const assert=require('node:assert/strict'),P=require('./protocol.json'),O=require('./ols.cjs'),D=require('./design.cjs');
const {canonical,hash}=require('../derivatives/schema.cjs');
const missingTest=()=>({state:'test-not-evaluated',quality:null,metrics:null,reason:'not reached'});
function experiment(byTime,{sealFit,onStage=()=>{}}){
 const stages=[],stage=name=>{stages.push(name);onStage(name)},cal=D.calendar(),summary={kind:'hybrid-aggression-increment-result',label:P.label,components:P.components,calendar:{train:cal.train.length,test:cal.test.length,exclusions:cal.exclusions},training:{quality:null,models:null,rawAggressionCoefficient:null,standardizedAggressionCoefficient:null},test:missingTest(),fits:{baseline:0,augmented:0}},raw={trainingRows:null,testRows:null,stages};
 const stop=(verdict,reason)=>({summary:{...summary,verdict,reason},raw});
 stage('training-features');const train=D.prepare(byTime,cal.train);summary.training.quality=train.quality;if(!train.quality.coveragePass)return stop('inconclusive','training coverage below95%');
 stage('training-labels');const rows=D.targets(train.rows);raw.trainingRows=rows;const x=rows.map(r=>r.x),y=rows.map(r=>r.y),scalers=O.scales(x);
 if(scalers.some(s=>!Number.isFinite(s.mean)||!Number.isFinite(s.sd)||s.sd<=0))return stop('inconclusive','constant/nonfinite training scale');
 stage('fit-baseline-once');summary.fits.baseline++;const baseline=O.fit(x.map(v=>v.slice(0,5)),y,scalers.slice(0,5));
 stage('fit-augmented-once');summary.fits.augmented++;const augmented=O.fit(x,y,scalers);summary.training.models={baseline,augmented};
 if(baseline.state!=='full-rank'||augmented.state!=='full-rank')return stop('inconclusive','rank-deficient/nonestimable fit; no fallback');
 const a=augmented.rawCoefficients[6],az=augmented.standardizedCoefficients[6];summary.training.rawAggressionCoefficient=a;summary.training.standardizedAggressionCoefficient=az;
 const material={solver:O.VERSION,trainingRows:rows.length,trainingRowsHash:hash(rows),quality:train.quality,models:{baseline,augmented},aggression:{rawUnitBpsPerA:a,standardizedBpsPerTrainingSD:az},trainingGate:a>0?'positive':'nonpositive'};
 stage('write-coefficient-seal');const frozen=sealFit(material);assert.equal(canonical(frozen),canonical(material),'Persisted coefficient/scaler seal did not verify');stage('coefficient-seal-verified');
 if(a<=0){summary.test.reason='nonpositive training aggression coefficient: September labels/results not generated';return stop('training-rejected','augmented raw-unit aggression coefficient <=0')}
 // No September preparation, target, prediction, metric or daily total above here.
 stage('test-features');const test=D.prepare(byTime,cal.test);summary.test.quality=test.quality;
 if(!test.quality.coveragePass){summary.test.reason='September common-valid coverage below95%';return stop('inconclusive',summary.test.reason)}
 stage('test-labels');const targets=D.targets(test.rows);stage('test-evaluation-once');const predictions=targets.map(r=>({...r,baseline:O.predict(frozen.models.baseline,r.x.slice(0,5)),augmented:O.predict(frozen.models.augmented,r.x)}));
 raw.testRows=predictions;const metrics=D.score(predictions);summary.test={state:'evaluated-once',quality:test.quality,metrics,reason:null};return stop(metrics.primaryPass?'exploratory-pass':'primary-rejected',metrics.primaryPass?'positive augmented after10bps and positive paired improvement; untouched-data test only':'augmented after10bps <=0 or paired improvement <=0;5/20bps cannot rescue');
}
module.exports={experiment};
