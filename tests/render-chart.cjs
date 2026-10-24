'use strict';
const fs=require('node:fs'),path=require('node:path');
const {openApp}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
(async()=>{
 const directory=path.resolve(process.argv[2]||'chart-qa');fs.mkdirSync(directory,{recursive:true});
 const bars=randomBars(13,1000).map(b=>({...b,o:b.o*600,h:b.h*600,l:b.l*600,c:b.c*600}));
 const app=await openApp({bars,nativeCanvas:true,width:1100,height:700});
 app.exec('S.mouse={x:640,y:285};draw()');fs.writeFileSync(path.join(directory,'desktop.png'),app.nativeCanvas.toBuffer('image/png'));
 app.exec('panBars(-500);draw()');fs.writeFileSync(path.join(directory,'history.png'),app.nativeCanvas.toBuffer('image/png'));
 const narrow=await openApp({bars,nativeCanvas:true,width:430,height:430});narrow.exec('draw()');fs.writeFileSync(path.join(directory,'narrow.png'),narrow.nativeCanvas.toBuffer('image/png'));
 console.log('PASS: actual chart drawing code renders on native Canvas at desktop and narrow widths and after historical panning.');
 console.log('This requires @napi-rs/canvas and does not render the full browser DOM or use live data.');
})().catch(error=>{console.error(error);process.exitCode=1});
