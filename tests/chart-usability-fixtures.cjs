'use strict';
// Explicit view/source-routing/storage exceptions. Product-context golden checks
// compare all algorithm bodies/outputs and legacy journal bytes against0.4.17.
// No indicator, selection, plan or execution function is excepted.
const productChanges=["updatePlanningCosts", "updateSystemUI", "updateManualControls", "updateVolumeControls", "calc", "confirmedTargetPath", "jsonFetch", "serverClock", "load", "htf", "connect", "notify", "recordDecision", "jrQuery", "jrRecordHTML", "updateJournalReview", "initJournalReview", "bindSystem", "loadOlder", "dailyAt", "refreshPivots", "confirmedADR20", "adr20HTML", "dailyContextHTML", "saveVolumePanePrefs", "initVolumePane", "draw", "syncManualContext", "saveManualCollection", "manualPointerUp", "initManualDrawings", "syncChartMenu", "openChartMenu", "initChartUsability", "syncVolumeContext", "sizingSnapshot", "sizingHTML", "researchExport", "panel"];
const changedView=['updatePlanningCosts','dailyContextHTML','volumeRange','saveVolumePanePrefs','setVolumeHeight','setVolumeCeiling','resetVolumePane','updateVolumeControls','initVolumePane','draw','bindChart','targetPathHTML','panel','updateSystemUI'];
function candlePlotPixels(app){const g=app.read('S.chartMetrics'),top=Math.ceil(g.headerHeight+12),width=Math.floor(g.pw),height=Math.floor(g.ph)-top;return Buffer.from(app.nativeCanvas.getContext('2d').getImageData(0,top,width,height).data)}
module.exports={productChanges,changedView:[...new Set([...changedView,...productChanges])],candlePlotPixels};
