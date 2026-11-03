'use strict';
const assert=require('node:assert/strict'),P=require('./protocol.json');
const finite=Number.isFinite,sigmoid=z=>z>=0?1/(1+Math.exp(-z)):Math.exp(z)/(1+Math.exp(z));
function scales(X){assert.ok(X.length&&X.every(r=>r.length===X[0].length&&r.every(finite)));return X[0].map((_,j)=>{const mean=X.reduce((s,r)=>s+r[j]/X.length,0),sd=Math.sqrt(X.reduce((s,r)=>s+(r[j]-mean)**2/X.length,0));assert.ok(finite(mean)&&finite(sd));return{mean,sd: X.every(r=>r[j]===X[0][j])?0:sd,zeroSD:X.every(r=>r[j]===X[0][j])}})}
function transform(x,s){assert.equal(x.length,s.length);return[1,...x.map((v,j)=>s[j].zeroSD?0:(v-s[j].mean)/s[j].sd)]}
function objective(beta,X,y,{derivatives=true}={}){const p=beta.length,g=Array(p).fill(0),H=Array.from({length:p},()=>Array(p).fill(0));let loss=0;
 for(let i=0;i<X.length;i++){const x=X[i],z=x.reduce((s,v,j)=>s+v*beta[j],0);assert.ok(finite(z));const pr=sigmoid(z);loss+=(Math.max(z,0)-y[i]*z+Math.log1p(Math.exp(-Math.abs(z))))/X.length;if(derivatives)for(let j=0;j<p;j++){g[j]+=(pr-y[i])*x[j]/X.length;for(let k=0;k<=j;k++)H[j][k]+=pr*(1-pr)*x[j]*x[k]/X.length}}
 for(let j=1;j<p;j++){loss+=P.ridge/2*beta[j]**2;g[j]+=P.ridge*beta[j];H[j][j]+=P.ridge}for(let j=0;j<p;j++)for(let k=0;k<j;k++)H[k][j]=H[j][k];assert.ok(finite(loss)&&g.every(finite)&&H.flat().every(finite));return{loss,g,H}}
function cholesky(H,b){const n=b.length,L=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let v=H[i][j];for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];if(i===j){assert.ok(v>0&&finite(v),'Non-SPD Newton system; no fallback');L[i][j]=Math.sqrt(v)}else L[i][j]=v/L[j][j]}
 const y=Array(n).fill(0),x=Array(n).fill(0);for(let i=0;i<n;i++){let v=b[i];for(let j=0;j<i;j++)v-=L[i][j]*y[j];y[i]=v/L[i][i]}for(let i=n-1;i>=0;i--){let v=y[i];for(let j=i+1;j<n;j++)v-=L[j][i]*x[j];x[i]=v/L[i][i]}assert.ok(x.every(finite));return x}
function fit(raw,y,s){assert.ok(raw.length===y.length&&y.includes(0)&&y.includes(1)&&y.every(v=>v===0||v===1),'Both training classes required');const X=raw.map(r=>transform(r,s));let beta=Array(X[0].length).fill(0);const trace=[];
 for(let iteration=0;iteration<=P.solver.maxIterations;iteration++){const f=objective(beta,X,y),gradient=Math.max(...f.g.map(Math.abs));trace.push({iteration,loss:f.loss,gradient});if(gradient<=P.solver.gradientInfinityTolerance)return{coefficients:beta,scalers:s,iterations:iteration,loss:f.loss,gradient,zeroSDColumns:s.flatMap((v,i)=>v.zeroSD?[i]:[]),trace};assert.ok(iteration<P.solver.maxIterations,'Nonconvergence');const step=cholesky(f.H,f.g),dot=f.g.reduce((n,v,j)=>n+v*step[j],0);assert.ok(dot>0&&finite(dot));let accepted=false;
  for(let half=0;half<=P.solver.maxHalvings;half++){const alpha=2**-half,trial=beta.map((v,j)=>v-alpha*step[j]),loss=objective(trial,X,y,{derivatives:false}).loss;if(loss<=f.loss-P.solver.armijo*alpha*dot){beta=trial;accepted=true;break}}assert.ok(accepted,'Armijo exhausted; no fallback');
 }throw Error('Nonconvergence')}
function predict(model,x){const z=transform(x,model.scalers).reduce((n,v,j)=>n+v*model.coefficients[j],0);assert.ok(finite(z));return sigmoid(z)}
function quantile(a,p){if(!a.length)return null;const s=[...a].sort((a,b)=>a-b),v=(s.length-1)*p,i=Math.floor(v);return s[i]+(s[Math.min(i+1,s.length-1)]-s[i])*(v-i)}
module.exports={sigmoid,scales,transform,objective,cholesky,fit,predict,quantile};
