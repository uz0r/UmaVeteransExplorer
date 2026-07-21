import{P as h}from"./chunks/constants.js";import{r as te,p as ae}from"./chunks/parser.js";import{c as ne,l as re}from"./chunks/resources.js";import{r as $,b as ie,f as oe}from"./chunks/scoring.js";import{e as se,a as ce,b as le}from"./chunks/exports.js";import{o as D}from"./chunks/veteran-dialog.js";import{d as B,e as o,m as g,c as S,f as v,a as M}from"./chunks/ui.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const u of r.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();const de=document.querySelector("#app");let d=ne(),i=[],R="",f=location.hash.slice(1)||"overview",y="universal-parent",p=w(y);function w(e){const t=h.find(a=>a.id===e)??h[1];return{role:t.role,distance:t.distance,strategy:t.strategy,weights:{...t.weights}}}function G(){de.innerHTML=`
    <header class="topbar">
      <a class="brand" href="#overview" aria-label="Uma Veterans Explorer home">
        <span class="brand-mark">U</span>
        <span><strong>Uma Veterans Explorer</strong><small>Inheritance analytics lab</small></span>
      </a>
      <nav class="tabs" aria-label="Main navigation">
        ${x("overview","Overview")}
        ${x("explorer","Raw Explorer")}
        ${x("rankings","Rankings")}
        ${x("pairs","Pair Builder")}
      </nav>
      <div class="top-actions">
        <span id="resource-status" class="status-pill">Loading uma.moe data…</span>
        <label class="button button-primary file-button">
          Import data.json
          <input id="file-input" type="file" accept="application/json,.json" hidden />
        </label>
      </div>
    </header>

    <main>
      <section id="drop-zone" class="drop-zone ${i.length?"drop-zone-compact":""}">
        <div>
          <strong>${i.length?`${i.length} veterans loaded from ${o(R)}`:"Drop an UmaExtractor data.json here"}</strong>
          <span>${i.length?"Import another dump to replace the current collection.":"The file is processed only in your browser and is never uploaded."}</span>
        </div>
        <label class="button file-button">Choose file<input id="drop-file-input" type="file" accept="application/json,.json" hidden /></label>
      </section>
      <section id="view"></section>
    </main>

    <dialog id="veteran-dialog" class="dialog">
      <div class="dialog-header">
        <div class="dialog-title-row"><span id="dialog-avatar"></span><div><h2 id="dialog-title"></h2><p id="dialog-subtitle"></p></div></div>
        <button id="dialog-close" class="icon-button" aria-label="Close">×</button>
      </div>
      <div id="dialog-content" class="dialog-content"></div>
    </dialog>

    <div id="toast" class="toast" role="status"></div>
  `,pe(),z(),T()}function x(e,t){return`<a href="#${e}" data-tab="${e}" class="tab ${f===e?"active":""}">${t}</a>`}function pe(){for(const t of["file-input","drop-file-input"])document.querySelector(`#${t}`)?.addEventListener("change",a=>{const n=a.target.files?.[0];n&&P(n)});const e=document.querySelector("#drop-zone");for(const t of["dragenter","dragover"])e.addEventListener(t,a=>{a.preventDefault(),e.classList.add("dragging")});for(const t of["dragleave","drop"])e.addEventListener(t,a=>{a.preventDefault(),e.classList.remove("dragging")});e.addEventListener("drop",t=>{const a=t.dataTransfer?.files?.[0];a&&P(a)}),document.querySelector("#dialog-close")?.addEventListener("click",()=>{document.querySelector("#veteran-dialog")?.close()})}async function P(e){E(`Reading ${e.name}…`);try{i=await ae(e,d),R=e.name,f="overview",location.hash="overview",G(),E(`Loaded ${i.length} veterans.`,"success")}catch(t){E(t instanceof Error?t.message:String(t),"error",6500)}}function z(){const e=document.querySelector("#resource-status");if(!e)return;const t=d.loaded,a=[t.factors?`${d.factorNames.size} factor names`:"",t.characters?`${d.characterNames.size} characters`:"",t.affinity?"affinity":""].filter(Boolean);a.length?(e.textContent=a.join(" · "),e.className=`status-pill ${d.source==="uma.moe"?"status-ok":"status-warn"}`,e.title=d.error?`Some reference sources failed:
${d.error}`:"Reference data loaded from uma.moe."):d.error?(e.textContent="Offline reference mode",e.className="status-pill status-warn",e.title=d.error):e.textContent="Loading reference data…"}function E(e,t="neutral",a=3200){const n=document.querySelector("#toast");n&&(n.textContent=e,n.className=`toast visible toast-${t}`,window.setTimeout(()=>n.classList.remove("visible"),a))}function T(){if(document.querySelectorAll("[data-tab]").forEach(e=>e.classList.toggle("active",e.dataset.tab===f)),!i.length){ue();return}f==="overview"?me():f==="explorer"?fe():f==="rankings"?K():J(),window.requestAnimationFrame(()=>B())}function ue(){const e=document.querySelector("#view");e.innerHTML=`
    <section class="hero-grid">
      <article class="hero-card">
        <p class="eyebrow">Local-first analytics</p>
        <h1>Find the veterans that are actually worth breeding forward.</h1>
        <p>Raw spark exploration, role-aware rankings, exact base affinity from uma.moe, G1 intersection scoring, and pair recommendations in one static web app.</p>
        <div class="hero-points">
          <span>Nothing uploaded</span><span>No account required</span><span>Works on GitHub Pages</span>
        </div>
      </article>
      <article class="panel getting-started">
        <h2>Expected input</h2>
        <ol>
          <li>Generate <code>data.json</code> with <a href="https://github.com/xancia/UmaExtractor" target="_blank" rel="noreferrer">UmaExtractor</a>.</li>
          <li>Drop the file above or press <b>Import data.json</b>.</li>
          <li>Start with Raw Explorer, then compare role-specific rankings.</li>
        </ol>
        <p class="muted">The parser supports <code>factor_info_array</code> and the older <code>factor_id_array</code> shape.</p>
      </article>
    </section>
    <section class="feature-grid">
      ${L("Raw Explorer","Filter and sort by any factor, stars, scope, scenario, character, and collection metric.")}
      ${L("Role-aware scoring","Grandparents are scored from their own factors; direct parents use the active three-factor line.")}
      ${L("Pair Builder","Rank pairs for a target character using parent quality, affinity, shared G1 wins, and factor coverage.")}
    </section>
  `}function L(e,t){return`<article class="panel feature-card"><h3>${e}</h3><p>${t}</p></article>`}function he(){return{total:i.length,scenarios:new Set(i.map(e=>e.scenario)).size,nineBlue:i.filter(e=>e.activeMetrics.blueStars>=9).length,ownWhite10:i.filter(e=>e.ownMetrics.whiteCount>=10).length,activeWhite25:i.filter(e=>e.activeMetrics.whiteCount>=25).length,oneGuts:i.filter(e=>e.mainBlue?.baseId===40&&e.mainBlue.stars===1).length,uniqueCharacters:new Set(i.map(e=>e.baseCharacterId)).size,unresolvedFactors:new Set(i.flatMap(e=>e.fullFactors.filter(t=>t.name.startsWith("Factor ")).map(t=>t.baseId))).size}}function me(){const e=he(),t=w("universal-parent"),a=w("universal-grandparent"),n=$(i,t,d.affinity).slice(0,6),s=$(i,a,d.affinity).slice(0,6),r=i.filter(l=>l.ownMetrics.whiteCount>=10&&(l.mainBlue?.stars??0)<=1).sort((l,b)=>b.ownMetrics.whiteQuality-l.ownMetrics.whiteQuality).slice(0,8),u=[...new Map(i.map(l=>[l.scenario,0])).keys()].map(l=>({scenario:l,count:i.filter(b=>b.scenario===l).length})).sort((l,b)=>b.count-l.count),ee=Math.max(...u.map(l=>l.count));document.querySelector("#view").innerHTML=`
    <section class="page-heading">
      <div><p class="eyebrow">Collection health</p><h1>${o(R)}</h1><p>High-level coverage and the strongest breeding assets under two different roles.</p></div>
      <button id="overview-export" class="button">Export normalized CSV</button>
    </section>
    <section class="metric-grid">
      ${g(e.total,"Veterans")}${g(e.uniqueCharacters,"Characters")}${g(e.nineBlue,"9★ active blue lines")}
      ${g(e.ownWhite10,"10+ own whites")}${g(e.activeWhite25,"25+ active whites")}${g(e.unresolvedFactors,"Unresolved factor IDs")}
    </section>
    <section class="dashboard-grid">
      <article class="panel span-7"><div class="panel-title"><div><h2>Best direct parents</h2><p>Veteran + both direct parents.</p></div><a href="#rankings">Open rankings</a></div>${F(n)}</article>
      <article class="panel span-5"><div class="panel-title"><div><h2>Scenario coverage</h2><p>Where the current collection came from.</p></div></div>
        <div class="bar-chart">${u.map(l=>`<div class="bar-row"><span>${o(l.scenario)}</span><div><i style="width:${l.count/ee*100}%"></i></div><b>${l.count}</b></div>`).join("")}</div>
      </article>
      <article class="panel span-7"><div class="panel-title"><div><h2>Best grandparent donors</h2><p>Only the veteran's own factors matter here.</p></div></div>${F(s)}</article>
      <article class="panel span-5"><div class="panel-title"><div><h2>Hidden value</h2><p>White-rich veterans suppressed by a weak main blue factor.</p></div></div>
        <div class="compact-list">${r.map(l=>`<button class="compact-row" data-veteran="${l.id}">${S(l.cardId,l.name,"xs")}<span><b>${o(l.name)}</b><small>#${l.id} · ${v(l.mainBlue)}</small></span><strong>${l.ownMetrics.whiteCount} whites</strong></button>`).join("")||'<p class="muted">No obvious hidden-value lines found.</p>'}</div>
      </article>
    </section>
  `,Y(),document.querySelector("#overview-export")?.addEventListener("click",()=>se(i))}function F(e){return`<div class="rank-card-list">${e.map((t,a)=>`
    <button class="rank-card" data-veteran="${t.veteran.id}">
      <span class="rank-number">${a+1}</span>
      ${S(t.veteran.cardId,t.veteran.name,"xs")}
      <span class="rank-main"><b>${o(t.veteran.name)}</b><small>#${t.veteran.id} · ${v(t.veteran.mainBlue)} · ${t.veteran.ownMetrics.whiteCount} own whites</small></span>
      <strong>${M(t.score)}</strong>
    </button>`).join("")}</div>`}let c={query:"",scenario:"",scope:"own",factorId:0,factorMode:"stars",sort:"id",direction:"desc",limit:100};function fe(){const e=U(),t=[...new Set(i.map(a=>a.scenario))].sort();document.querySelector("#view").innerHTML=`
    <section class="page-heading"><div><p class="eyebrow">Raw data</p><h1>Veteran Explorer</h1><p>No composite score unless you explicitly choose one. Sort the collection by any measurable field or factor.</p></div><button id="explorer-export" class="button">Export current rows</button></section>
    <section class="panel filters">
      <label>Search<input id="ex-query" value="${o(c.query)}" placeholder="Name, veteran ID, factor name or ID" /></label>
      <label>Scenario<select id="ex-scenario"><option value="">All scenarios</option>${t.map(a=>`<option ${a===c.scenario?"selected":""}>${o(a)}</option>`).join("")}</select></label>
      <label>Factor scope<select id="ex-scope"><option value="own" ${c.scope==="own"?"selected":""}>Own / grandparent</option><option value="active" ${c.scope==="active"?"selected":""}>Active parent line</option><option value="full" ${c.scope==="full"?"selected":""}>Full 7-uma lineage</option></select></label>
      <label>Selected factor<select id="ex-factor"><option value="0">None</option>${e.map(a=>`<option value="${a.baseId}" ${a.baseId===c.factorId?"selected":""}>${o(a.name)} [${a.baseId}]</option>`).join("")}</select></label>
      <label>Factor metric<select id="ex-factor-mode"><option value="stars" ${c.factorMode==="stars"?"selected":""}>Total stars</option><option value="count" ${c.factorMode==="count"?"selected":""}>Copies</option></select></label>
      <label>Sort by<select id="ex-sort">${ge()}</select></label>
      <label>Order<select id="ex-direction"><option value="desc" ${c.direction==="desc"?"selected":""}>Descending</option><option value="asc" ${c.direction==="asc"?"selected":""}>Ascending</option></select></label>
      <label>Rows<select id="ex-limit">${[50,100,250,1e3].map(a=>`<option value="${a}" ${a===c.limit?"selected":""}>${a}</option>`).join("")}</select></label>
    </section>
    <section class="panel table-panel"><div id="explorer-summary" class="table-summary"></div><div class="table-scroll"><table><thead><tr>
      <th>Veteran</th><th>Scenario</th><th>Main blue</th><th>Main pink</th><th>Own whites</th><th>Active blue</th><th>Active whites</th><th>G1 score</th><th id="selected-factor-heading">Selected factor</th><th>Stats</th>
    </tr></thead><tbody id="explorer-body"></tbody></table></div></section>
  `,ve(),Q()}function U(){const e=new Map;for(const t of i)for(const a of t.fullFactors)e.set(a.baseId,a);return[...e.values()].sort((t,a)=>t.category.localeCompare(a.category)||t.name.localeCompare(a.name))}function ge(){return[["id","Veteran ID"],["name","Character name"],["date","Date"],["rankScore","Training rank score"],["mainBlueStars","Main blue stars"],["ownBlueStars","Own blue stars"],["activeBlueStars","Active blue stars"],["ownWhiteCount","Own white count"],["ownWhiteStars","Own white stars"],["activeWhiteCount","Active white count"],["activeWhiteStars","Active white stars"],["raceAffinity","G1 affinity score"],["factor","Selected factor metric"]].map(([t,a])=>`<option value="${t}" ${c.sort===t?"selected":""}>${a}</option>`).join("")}function ve(){const e=[["ex-query","query","input"],["ex-scenario","scenario","change"],["ex-scope","scope","change"],["ex-factor","factorId","change"],["ex-factor-mode","factorMode","change"],["ex-sort","sort","change"],["ex-direction","direction","change"],["ex-limit","limit","change"]];for(const[t,a,n]of e)document.querySelector(`#${t}`)?.addEventListener(n,s=>{const r=s.target.value;a==="factorId"||a==="limit"?c[a]=Number(r):c[a]=r,Q()});document.querySelector("#explorer-export")?.addEventListener("click",()=>ce(_(),O))}function O(e){if(!c.factorId)return 0;const t=oe(e,c.scope).filter(a=>a.baseId===c.factorId);return c.factorMode==="count"?t.length:t.reduce((a,n)=>a+n.stars,0)}function W(e){return{id:e.id,name:e.name,date:e.date,rankScore:e.rankScore,mainBlueStars:e.mainBlue?.stars??0,ownBlueStars:e.ownMetrics.blueStars,activeBlueStars:e.activeMetrics.blueStars,ownWhiteCount:e.ownMetrics.whiteCount,ownWhiteStars:e.ownMetrics.whiteStars,activeWhiteCount:e.activeMetrics.whiteCount,activeWhiteStars:e.activeMetrics.whiteStars,raceAffinity:e.raceAffinity,factor:O(e)}[c.sort]??0}function _(){const e=c.query.trim().toLowerCase(),t=i.filter(n=>c.scenario&&n.scenario!==c.scenario?!1:e?[n.name,n.id,n.cardId,...n.fullFactors.flatMap(r=>[r.name,r.baseId])].join(" ").toLowerCase().includes(e):!0),a=c.direction==="asc"?1:-1;return t.sort((n,s)=>{const r=W(n),u=W(s);return typeof r==="string"&&typeof u==="string"?a*r.localeCompare(u):a*(Number(r)-Number(u))}),t}function Q(){const e=_(),t=e.slice(0,c.limit),a=U().find(n=>n.baseId===c.factorId);document.querySelector("#selected-factor-heading").textContent=a?`${a.name} (${c.factorMode})`:"Selected factor",document.querySelector("#explorer-summary").textContent=`${e.length} matching veterans · showing ${t.length}`,document.querySelector("#explorer-body").innerHTML=t.map(n=>`
    <tr data-veteran="${n.id}">
      <td><div class="table-character">${S(n.cardId,n.name,"xs")}<span><b>${o(n.name)}</b><small>#${n.id} · card ${n.cardId}</small></span></div></td>
      <td>${o(n.scenario)}<small>${o(n.date)}</small></td>
      <td>${o(v(n.mainBlue))}</td><td>${o(v(n.mainPink))}</td>
      <td><b>${n.ownMetrics.whiteCount}</b><small>${n.ownMetrics.whiteStars}★ · ${n.ownMetrics.whiteDistinct} distinct</small></td>
      <td><b>${n.activeMetrics.blueStars}★</b><small>Guts ${n.activeMetrics.gutsStars}★</small></td>
      <td><b>${n.activeMetrics.whiteCount}</b><small>${n.activeMetrics.whiteStars}★</small></td>
      <td><b>${n.raceAffinity}</b><small>${n.g1OverlapLeft}+${n.g1OverlapRight} overlaps</small></td>
      <td><b>${O(n)}</b></td>
      <td>${n.stats.speed}/${n.stats.stamina}/${n.stats.power}/${n.stats.guts}/${n.stats.wit}</td>
    </tr>`).join(""),X("#explorer-body")}let N=0,A=100;function K(){const e=h.find(a=>a.id===y)??h[1],t=Z(N);document.querySelector("#view").innerHTML=`
    <section class="page-heading"><div><p class="eyebrow">Role-aware scoring</p><h1>Rankings</h1><p>Scores are collection-relative percentiles. Every component remains visible and adjustable.</p></div><button id="ranking-export" class="button">Export ranking CSV</button></section>
    <section class="panel ranking-controls">
      <label>Preset<select id="ranking-profile">${h.map(a=>`<option value="${a.id}" ${a.id===y?"selected":""}>${o(a.label)}</option>`).join("")}</select></label>
      <label>Role<select id="ranking-role"><option value="grandparent" ${p.role==="grandparent"?"selected":""}>Grandparent donor</option><option value="parent" ${p.role==="parent"?"selected":""}>Direct parent</option><option value="foundation" ${p.role==="foundation"?"selected":""}>Foundation / both</option></select></label>
      <label>Distance<select id="ranking-distance">${V(["universal","sprint","mile","medium","long"],p.distance)}</select></label>
      <label>Strategy<select id="ranking-strategy">${V(["universal","front","pace","late","end"],p.strategy)}</select></label>
      <label>Target character<select id="ranking-target"><option value="0">No target affinity</option>${t}</select></label>
      <label>Rows<select id="ranking-limit">${[50,100,250].map(a=>`<option value="${a}" ${a===A?"selected":""}>${a}</option>`).join("")}</select></label>
      <p id="profile-description" class="control-description">${o(e.description)}</p>
      <div class="weight-grid">${be(p.weights)}</div>
    </section>
    <section class="panel table-panel"><div id="ranking-summary" class="table-summary"></div><div class="table-scroll"><table><thead><tr>
      <th>#</th><th>Veteran</th><th>Score</th><th>Blue</th><th>White</th><th>Pink</th><th>Affinity / G1</th><th>Own factors</th><th>Active line</th><th>Why</th>
    </tr></thead><tbody id="ranking-body"></tbody></table></div></section>
  `,$e(),m()}function V(e,t){return e.map(a=>`<option value="${a}" ${a===t?"selected":""}>${a[0].toUpperCase()+a.slice(1)}</option>`).join("")}function be(e){return Object.keys(e).map(t=>`<label>${t}<div class="range-line"><input type="range" min="0" max="75" value="${e[t]}" data-weight="${t}" /><output>${e[t]}</output></div></label>`).join("")}function Z(e){return[...new Set(i.flatMap(a=>[a.baseCharacterId,...Object.values(a.lineage).map(n=>n.baseCharacterId)]))].sort((a,n)=>(d.characterNames.get(a)??"").localeCompare(d.characterNames.get(n)??"")).map(a=>`<option value="${a}" ${a===e?"selected":""}>${o(d.characterNames.get(a)??`Chara ${a}`)} (${a})</option>`).join("")}function $e(){document.querySelector("#ranking-profile")?.addEventListener("change",e=>{y=e.target.value,p=w(y),K()}),document.querySelector("#ranking-role")?.addEventListener("change",e=>{p.role=e.target.value,m()}),document.querySelector("#ranking-distance")?.addEventListener("change",e=>{p.distance=e.target.value,m()}),document.querySelector("#ranking-strategy")?.addEventListener("change",e=>{p.strategy=e.target.value,m()}),document.querySelector("#ranking-target")?.addEventListener("change",e=>{N=Number(e.target.value),p.targetCharacterId=N||void 0,m()}),document.querySelector("#ranking-limit")?.addEventListener("change",e=>{A=Number(e.target.value),m()}),document.querySelectorAll("[data-weight]").forEach(e=>e.addEventListener("input",t=>{const a=t.target,n=a.dataset.weight;p.weights[n]=Number(a.value),a.nextElementSibling.textContent=a.value,m()})),document.querySelector("#ranking-export")?.addEventListener("click",()=>le($(i,p,d.affinity)))}function m(){const e=$(i,p,d.affinity),t=e.slice(0,A),a=p.role==="grandparent"?"own-factor donor":p.role==="parent"?"active parent line":"combined foundation";document.querySelector("#ranking-summary").innerHTML=`${e.length} veterans ranked as <b>${a}</b>${p.targetCharacterId?` · target affinity for <b>${o(d.characterNames.get(p.targetCharacterId)??p.targetCharacterId)}</b>`:""}`,document.querySelector("#ranking-body").innerHTML=t.map((n,s)=>{const r=n.veteran,u=p.role==="grandparent"?r.ownMetrics:r.activeMetrics;return`<tr data-veteran="${r.id}">
      <td class="rank-index">${s+1}</td>
      <td><div class="table-character">${S(r.cardId,r.name,"xs")}<span><b>${o(r.name)}</b><small>#${r.id} · ${o(r.scenario)}</small></span></div></td>
      <td><strong class="score-value">${M(n.score)}</strong><small>${o(n.weaknesses[0]??"No major warning")}</small></td>
      <td>${q(n.components.blue)}<small>raw ${n.components.rawBlue.toFixed(2)}</small></td>
      <td>${q(n.components.white)}<small>raw ${n.components.rawWhite.toFixed(2)}</small></td>
      <td>${q(n.components.pink)}<small>raw ${n.components.rawPink.toFixed(2)}</small></td>
      <td><b>${n.components.targetAffinity??r.raceAffinity}</b><small>${n.components.targetAffinity?"target line total":"G1 component"}</small></td>
      <td>${o(v(r.mainBlue))}<small>${r.ownMetrics.whiteCount} whites · ${r.ownMetrics.whiteStars}★</small></td>
      <td>${u.blueStars}★ blue<small>${u.whiteCount} whites · ${u.scenarioCount} scenario</small></td>
      <td>${o(n.strengths.slice(0,2).join(" · ")||"Balanced collection-relative profile")}</td>
    </tr>`}).join(""),X("#ranking-body")}function q(e){return`<div class="component-bar"><i style="width:${Math.round(e*100)}%"></i><span>${Math.round(e*100)}</span></div>`}let k="pace-parent",C=0,j=40;function J(){const e=h.find(t=>t.id===k)??h[2];document.querySelector("#view").innerHTML=`
    <section class="page-heading"><div><p class="eyebrow">Breeding search</p><h1>Pair Builder</h1><p>Searches combinations inside your own collection. The result is a transparent heuristic, not a guarantee of inspiration rolls.</p></div></section>
    <section class="panel pair-controls">
      <label>Target character<select id="pair-target"><option value="0">Choose target…</option>${Z(C)}</select></label>
      <label>Ranking profile<select id="pair-profile">${h.filter(t=>t.role!=="grandparent").map(t=>`<option value="${t.id}" ${t.id===k?"selected":""}>${o(t.label)}</option>`).join("")}</select></label>
      <label>Candidate pool<select id="pair-candidates">${[20,40,60,100].map(t=>`<option value="${t}" ${t===j?"selected":""}>Top ${t}</option>`).join("")}</select></label>
      <div class="pair-status ${d.affinity?"status-good":"status-warning"}">${d.affinity?"Exact aff2/aff3 base affinity available from uma.moe.":"Base affinity unavailable. Pair scores currently use G1 and factor quality only."}</div>
      <p class="control-description">${o(e.description)}</p>
    </section>
    <section id="pair-results"></section>
  `,document.querySelector("#pair-target")?.addEventListener("change",t=>{C=Number(t.target.value),I()}),document.querySelector("#pair-profile")?.addEventListener("change",t=>{k=t.target.value,J()}),document.querySelector("#pair-candidates")?.addEventListener("change",t=>{j=Number(t.target.value),I()}),I()}function I(){const e=document.querySelector("#pair-results");if(!e)return;if(!C){e.innerHTML='<section class="panel empty-state"><h2>Select the target character</h2><p>The builder excludes the target character and duplicate character identities from the two parent slots.</p></section>';return}const t=w(k);t.targetCharacterId=C;const a=$(i,t,d.affinity),n=ie(a,t,d.affinity,j,50);if(!n.length){e.innerHTML='<section class="panel empty-state"><h2>No valid pairs</h2><p>Increase the candidate pool or import a larger collection.</p></section>';return}e.innerHTML=`<section class="pair-grid">${n.map((s,r)=>ye(s,r)).join("")}</section>`,Y()}function ye(e,t){return`<article class="panel pair-card">
    <div class="pair-rank"><span>#${t+1}</span><strong>${M(e.score)}</strong></div>
    <div class="pair-parents">
      ${H(e.left,"Parent A")}
      <div class="pair-plus">+</div>
      ${H(e.right,"Parent B")}
    </div>
    <div class="pair-metrics">
      <span><b>${e.targetAffinity}</b> affinity package</span>
      <span><b>${e.parentSynergy}</b> parent synergy</span>
      <span><b>${e.factorCoverage}</b> relevant-factor coverage</span>
      <span><b>${e.sharedWins}</b> shared G1 wins</span>
    </div>
    ${e.warnings.length?`<p class="pair-warning">${o(e.warnings.join(" · "))}</p>`:""}
  </article>`}function H(e,t){return`<button class="pair-parent" data-veteran="${e.veteran.id}"><small>${t}</small><div class="pair-parent-identity">${S(e.veteran.cardId,e.veteran.name,"sm")}<span><b>${o(e.veteran.name)}</b><span>#${e.veteran.id} · score ${M(e.score)}</span><span>${o(v(e.veteran.mainBlue))} · ${e.veteran.activeMetrics.whiteCount} active whites</span></span></div></button>`}function X(e){document.querySelectorAll(`${e} tr[data-veteran]`).forEach(t=>t.addEventListener("click",()=>D(i,Number(t.dataset.veteran)))),B(document.querySelector(e)??document)}function Y(){document.querySelectorAll("[data-veteran]").forEach(e=>e.addEventListener("click",()=>D(i,Number(e.dataset.veteran)))),B()}window.addEventListener("hashchange",()=>{const e=location.hash.slice(1);["overview","explorer","rankings","pairs"].includes(e)&&(f=e),T()});G();re().then(e=>{d=e,i.length&&(i=te(i,d)),z(),T()});