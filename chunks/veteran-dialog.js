import{c as r,m as t,f as o,b as c,e as l,d as m}from"./ui.js";function i(n,s,e){const a=n.lineage[s];return`<article class="lineage-node"><small>${e}</small><div class="lineage-identity">${r(a.cardId,a.name,"sm")}<span><b>${l(a.name)}</b><span>card ${a.cardId}</span></span></div><div class="factor-cloud">${c(a.factors,30)}</div></article>`}function u(n,s){const e=n.find(d=>d.id===s);if(!e)return;const a=document.querySelector("#veteran-dialog");document.querySelector("#dialog-avatar").innerHTML=r(e.cardId,e.name,"lg"),document.querySelector("#dialog-title").textContent=`${e.name} · #${e.id}`,document.querySelector("#dialog-subtitle").textContent=`${e.scenario} · ${e.date} · card ${e.cardId}`,document.querySelector("#dialog-content").innerHTML=`
    <section class="dialog-metrics">
      ${t(o(e.mainBlue),"Main blue")}${t(o(e.mainPink),"Main pink")}
      ${t(e.ownMetrics.whiteCount,"Own whites")}${t(e.activeMetrics.whiteCount,"Active whites")}
      ${t(`${e.activeMetrics.blueStars}★`,"Active blue")}${t(e.raceAffinity,"G1 score")}
    </section>
    <section><h3>Own factors <small>Used when this veteran is a grandparent</small></h3><div class="factor-cloud">${c(e.ownFactors,100)}</div></section>
    <section><h3>Active parent line <small>Veteran + direct parents</small></h3>
      <div class="lineage-grid three"><article class="lineage-node main-node"><div class="lineage-identity">${r(e.cardId,e.name,"sm")}<span><b>${l(e.name)}</b><small>#${e.id}</small></span></div><div class="factor-cloud">${c(e.ownFactors,40)}</div></article>${i(e,10,"Left parent")}${i(e,20,"Right parent")}</div>
    </section>
    <section><h3>Grandparents</h3><div class="lineage-grid four">${i(e,11,"L-L")}${i(e,12,"L-R")}${i(e,21,"R-L")}${i(e,22,"R-R")}</div></section>
    <details><summary>Raw veteran JSON</summary><pre>${l(JSON.stringify(e.raw,null,2))}</pre></details>
  `,m(a),a.showModal()}export{u as o};