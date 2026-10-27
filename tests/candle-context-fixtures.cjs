'use strict';
const STEP=300000,DAY=Date.UTC(2026,9,28);
const series=(count=15,last={o:100,h:106,l:98,c:104,v:150})=>Array.from({length:count},(_,i)=>({t:DAY+i*STEP,o:100,h:102,l:98,c:100,v:100,...(i===count-1?last:{})}));
module.exports={series,DAY,STEP};
