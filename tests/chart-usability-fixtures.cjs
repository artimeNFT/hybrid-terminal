'use strict';
// Explicit presentation-only exception list. The new package test checks this exact
// list against 0.4.14; earlier baselines still verify every other function body.
const changedView=['dailyContextHTML','volumeRange','saveVolumePanePrefs','setVolumeHeight','setVolumeCeiling','resetVolumePane','updateVolumeControls','initVolumePane','draw','bindChart','targetPathHTML','panel'];
function candlePlotPixels(app){const g=app.read('S.chartMetrics'),top=Math.ceil(g.headerHeight+12),width=Math.floor(g.pw),height=Math.floor(g.ph)-top;return Buffer.from(app.nativeCanvas.getContext('2d').getImageData(0,top,width,height).data)}
module.exports={changedView,candlePlotPixels};
