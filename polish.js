const POLISH = {
  raw: [],
  byId: new Map(),
  factorNames: new Map(),
  skills: new Map(),
  affinity: null,
  filters: { position: 'any', blueMin: 0, blueMax: 3, ownMin: 0, ownMax: 99, activeMin: 0, activeMax: 99, rankMin: 0, rankMax: 999999 },
  busy: false,
};

const POSITIONS = [10, 20, 11, 12, 21, 22];
const RESOURCE_ROOT = 'https://uma.moe/resources';
const ASSET_ROOT = 'https://uma.moe/assets/images';

function baseCharacterId(cardId) { return Math.floor(Number(cardId || 0) / 100); }
function rawFactors(node) {
  const values = node?.factor_info_array ?? node?.factor_id_array ?? [];
  return values.map(value => Number(value?.factor_id ?? value)).filter(Number.isFinite).map(rawId => ({ rawId, baseId: Math.floor(rawId / 10), stars: rawId % 10 }));
}
function lineageMap(record) { return new Map((record?.succession_chara_array ?? []).map(node => [Number(node.position_id), node])); }
function uniqueWins(node) { return new Set((node?.win_saddle_id_array ?? []).map(Number)); }
function intersectionCount(left, right) { let count = 0; for (const value of left) if (right.has(value)) count += 1; return count; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }

function rankIndex(score) {
  const thresholds = [0,300,600,900,1300,1800,2300,2900,3500,4900,6500,8200,10000,12100,14500,15900,17500,19200,19600,20000,20400,20800,21200,21600];
  let index = 0;
  if (score < 22100) {
    for (let i = thresholds.length - 1; i >= 0; i -= 1) if (score >= thresholds[i]) { index = i; break; }
  } else index = 24 + Math.floor((score - 22100) / 400);
  return Math.min(index, 97);
}
function rankMarkup(record, compact = false) {
  const score = Number(record?.rank_score ?? 0);
  const index = rankIndex(score).toString().padStart(2, '0');
  return `<span class="game-rank ${compact ? 'game-rank-compact' : ''}" title="Training score ${score.toLocaleString()}"><img src="${ASSET_ROOT}/icon/ranks/utx_txt_rank_${index}.webp" alt="Rank" loading="lazy"><b>${score.toLocaleString()}</b></span>`;
}

function affinity2(left, right) {
  const data = POLISH.affinity;
  if (!data) return null;
  const i = data.index.get(Number(left)), j = data.index.get(Number(right));
  if (i == null || j == null) return null;
  return data.aff2[i * data.chars.length + j] ?? 0;
}

async function json(url) {
  const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}
async function loadResource(name) {
  try {
    const manifest = await json(`${RESOURCE_ROOT}/manifest.json`);
    const artifact = manifest?.artifacts?.find(item => item.name === name);
    const urls = [artifact?.path && `https://uma.moe${artifact.path}`, artifact?.current_path && `https://uma.moe${artifact.current_path}`, `${RESOURCE_ROOT}/current/${name}.gz`, `${RESOURCE_ROOT}/current/${name}`].filter(Boolean);
    for (const url of urls) try { return await json(url); } catch {}
  } catch {}
  return null;
}
function ingestFactorNames(payload) {
  for (const item of Array.isArray(payload) ? payload : payload?.items ?? []) {
    const id = Number(item.id ?? item.factor_id), name = String(item.text ?? item.name ?? '').trim();
    if (Number.isFinite(id) && name) POLISH.factorNames.set(id, name);
  }
}
function ingestSkills(payload) {
  for (const item of Array.isArray(payload) ? payload : payload?.items ?? []) {
    const id = Number(item.skill_id ?? item.id), name = String(item.name ?? '').trim();
    if (Number.isFinite(id) && name && !name.startsWith('Skill_')) POLISH.skills.set(id, item);
  }
}
function resolveFactorName(baseId) {
  if (POLISH.factorNames.has(baseId)) return POLISH.factorNames.get(baseId);
  if (baseId >= 200000 && baseId < 300000) {
    const candidates = [baseId, ...Array.from({ length: 9 }, (_, index) => baseId + index + 1), Math.floor(baseId / 10)];
    for (const id of candidates) {
      const skill = POLISH.skills.get(id);
      if (skill?.name) return skill.name;
    }
  }
  return null;
}
async function loadReferences() {
  const [factors, skills, affinity] = await Promise.all([loadResource('factors.json'), loadResource('skills.json'), loadResource('affinity.json')]);
  if (factors) ingestFactorNames(factors);
  if (skills) ingestSkills(skills);
  if (affinity?.chars && affinity?.aff2) POLISH.affinity = { ...affinity, chars: affinity.chars.map(Number), aff2: affinity.aff2.map(Number), index: new Map(affinity.chars.map((id, index) => [Number(id), index])) };
  scheduleEnhance();
}

async function captureFile(file) {
  if (!file?.name?.toLowerCase().endsWith('.json')) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) return;
    POLISH.raw = parsed;
    POLISH.byId = new Map(parsed.map(record => [Number(record.trained_chara_id), record]));
    scheduleEnhance();
  } catch {}
}
document.addEventListener('change', event => {
  const input = event.target;
  if (input instanceof HTMLInputElement && input.type === 'file' && input.files?.[0]) captureFile(input.files[0]);
}, true);
document.addEventListener('drop', event => { if (event.dataTransfer?.files?.[0]) captureFile(event.dataTransfer.files[0]); }, true);

function replaceFactorLabels(root = document) {
  root.querySelectorAll('.factor[title*="Factor ID"], option').forEach(element => {
    const match = (element.getAttribute('title') ?? element.textContent ?? '').match(/(?:Factor ID |\[)(\d+)/);
    if (!match) return;
    const id = Number(match[1]), name = resolveFactorName(id);
    if (!name || !(element.textContent ?? '').includes(`Factor ${id}`)) return;
    if (element.tagName === 'OPTION') element.textContent = `${name} [${id}]`;
    else {
      const bold = element.querySelector('b')?.outerHTML ?? '';
      element.innerHTML = `${escapeHtml(name)} ${bold}`;
    }
  });
}

function cleanTechnicalIds(root = document) {
  root.querySelectorAll('.table-character small, .rank-main small, .compact-row small, .pair-parent span span, .lineage-identity > span > span, .lineage-identity > span > small').forEach(element => {
    const row = element.closest('[data-veteran]');
    const id = Number(row?.dataset.veteran);
    const record = POLISH.byId.get(id);
    if (record && (element.textContent ?? '').includes(`#${id}`)) {
      const remainder = (element.textContent ?? '').replace(new RegExp(`^#${id}\\s*[·•-]?\\s*`), '').replace(/card\s+\d+/gi, '').replace(/^\s*[·•-]\s*/, '').trim();
      element.innerHTML = `${rankMarkup(record, true)}${remainder ? `<span class="rank-context">${escapeHtml(remainder)}</span>` : ''}`;
    } else if (/^card\s+\d+$/i.test((element.textContent ?? '').trim())) element.remove();
  });
}

function nodeFactorIds(node) { return new Set(rawFactors(node).map(factor => factor.baseId)); }
function selectedFactorAt(record, position, factorId) {
  if (!factorId) return true;
  const map = lineageMap(record);
  const has = node => nodeFactorIds(node).has(factorId);
  if (position === 'main') return has(record);
  if (position === 'left') return has(map.get(10));
  if (position === 'right') return has(map.get(20));
  if (position === 'parents') return has(map.get(10)) || has(map.get(20));
  if (position === 'grandparents') return [11,12,21,22].some(pos => has(map.get(pos)));
  return has(record) || POSITIONS.some(pos => has(map.get(pos)));
}
function activeWhiteCount(record) {
  const map = lineageMap(record);
  return [record, map.get(10), map.get(20)].flatMap(rawFactors).filter(factor => factor.baseId >= 100000 && factor.baseId < 1000000).length;
}
function enhanceExplorer() {
  const filters = document.querySelector('.filters');
  if (!filters || !document.querySelector('#explorer-body')) return;
  if (!document.querySelector('#polish-filters')) {
    filters.insertAdjacentHTML('afterend', `<section id="polish-filters" class="panel polish-filters">
      <label>Factor position<select id="pf-position"><option value="any">Anywhere</option><option value="main">Main veteran only</option><option value="parents">Either direct parent</option><option value="left">Left parent</option><option value="right">Right parent</option><option value="grandparents">Grandparents only</option></select></label>
      <label>Main blue ★<span class="range-pair"><input id="pf-blue-min" type="number" min="0" max="3" value="0"><input id="pf-blue-max" type="number" min="0" max="3" value="3"></span></label>
      <label>Own whites<span class="range-pair"><input id="pf-own-min" type="number" min="0" value="0"><input id="pf-own-max" type="number" min="0" value="99"></span></label>
      <label>Active whites<span class="range-pair"><input id="pf-active-min" type="number" min="0" value="0"><input id="pf-active-max" type="number" min="0" value="99"></span></label>
      <label>Training score<span class="range-pair"><input id="pf-rank-min" type="number" min="0" value="0"><input id="pf-rank-max" type="number" min="0" value="999999"></span></label>
      <button id="pf-reset" class="button">Reset ranges</button>
    </section>`);
    const ids = ['position','blue-min','blue-max','own-min','own-max','active-min','active-max','rank-min','rank-max'];
    for (const id of ids) document.querySelector(`#pf-${id}`)?.addEventListener('input', applyExplorerFilters);
    document.querySelector('#pf-reset')?.addEventListener('click', () => {
      Object.assign(POLISH.filters, { position:'any', blueMin:0, blueMax:3, ownMin:0, ownMax:99, activeMin:0, activeMax:99, rankMin:0, rankMax:999999 });
      document.querySelector('#polish-filters').remove(); enhanceExplorer(); applyExplorerFilters();
    });
    const limit = document.querySelector('#ex-limit');
    if (limit && limit.value !== '1000') { limit.value = '1000'; limit.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  document.querySelectorAll('#explorer-body').forEach(applyExplorerFilters);
  const sortMap = ['name','scenario','mainBlueStars','mainPinkStars','ownWhiteCount','activeBlueStars','activeWhiteCount','g1','factor','rankScore'];
  document.querySelectorAll('.table-panel thead th').forEach((th, index) => {
    if (th.dataset.polishSort) return;
    th.dataset.polishSort = sortMap[index] ?? '';
    if (!th.dataset.polishSort) return;
    th.classList.add('sortable-heading');
    th.addEventListener('click', () => {
      const sort = document.querySelector('#ex-sort'), direction = document.querySelector('#ex-direction');
      if (!sort || !direction) return;
      const same = sort.value === th.dataset.polishSort;
      sort.value = th.dataset.polishSort;
      direction.value = same && direction.value === 'desc' ? 'asc' : 'desc';
      sort.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}
function applyExplorerFilters() {
  const panel = document.querySelector('#polish-filters');
  if (panel) {
    const value = id => Number(document.querySelector(`#pf-${id}`)?.value ?? 0);
    POLISH.filters = { position: document.querySelector('#pf-position')?.value ?? 'any', blueMin:value('blue-min'), blueMax:value('blue-max'), ownMin:value('own-min'), ownMax:value('own-max'), activeMin:value('active-min'), activeMax:value('active-max'), rankMin:value('rank-min'), rankMax:value('rank-max') };
  }
  const factorId = Number(document.querySelector('#ex-factor')?.value ?? 0);
  let visible = 0;
  document.querySelectorAll('#explorer-body tr[data-veteran]').forEach(row => {
    const record = POLISH.byId.get(Number(row.dataset.veteran));
    if (!record) return;
    const ownWhite = rawFactors(record).filter(factor => factor.baseId >= 100000 && factor.baseId < 1000000).length;
    const blue = rawFactors(record).find(factor => [10,20,30,40,50].includes(factor.baseId))?.stars ?? 0;
    const activeWhite = activeWhiteCount(record), rank = Number(record.rank_score ?? 0), f = POLISH.filters;
    const show = blue >= f.blueMin && blue <= f.blueMax && ownWhite >= f.ownMin && ownWhite <= f.ownMax && activeWhite >= f.activeMin && activeWhite <= f.activeMax && rank >= f.rankMin && rank <= f.rankMax && selectedFactorAt(record, f.position, factorId);
    row.hidden = !show; if (show) visible += 1;
  });
  const summary = document.querySelector('#explorer-summary');
  if (summary && POLISH.byId.size) summary.dataset.polishCount = `${visible} visible after position/range filters`;
}

function enhanceOverview() {
  const grid = document.querySelector('.dashboard-grid');
  if (!grid || document.querySelector('#collection-insights') || !POLISH.raw.length) return;
  const factorUsage = new Map();
  for (const record of POLISH.raw) for (const factor of rawFactors(record)) {
    if (factor.baseId < 200000 || factor.baseId >= 1000000) continue;
    const entry = factorUsage.get(factor.baseId) ?? { count: 0, veterans: [], stars: 0 };
    entry.count += 1; entry.stars += factor.stars; entry.veterans.push(record); factorUsage.set(factor.baseId, entry);
  }
  const scenario = [...factorUsage.entries()].filter(([id]) => id >= 300000).sort((a,b) => a[1].count-b[1].count).slice(0,8);
  const rareSkills = [...factorUsage.entries()].filter(([id]) => id >= 200000 && id < 300000).sort((a,b) => a[1].count-b[1].count || b[1].stars-a[1].stars).slice(0,10);
  const render = entries => entries.map(([id, info]) => `<span class="insight-chip" title="${info.veterans.map(v => v.trained_chara_id).join(', ')}"><b>${escapeHtml(resolveFactorName(id) ?? `Factor ${id}`)}</b><small>${info.count} copy${info.count === 1 ? '' : 'ies'} · ${info.stars}★</small></span>`).join('') || '<p class="muted">No matching factors.</p>';
  grid.insertAdjacentHTML('afterend', `<section id="collection-insights" class="insights-grid">
    <article class="panel"><div class="panel-title"><div><h2>Rare scenario sparks</h2><p>Low-frequency scenario factors on the main veterans.</p></div></div><div class="insight-cloud">${render(scenario)}</div></article>
    <article class="panel"><div class="panel-title"><div><h2>Rare skill sparks</h2><p>Useful outliers that are easy to miss in a blue-first sort.</p></div></div><div class="insight-cloud">${render(rareSkills)}</div></article>
  </section>`);
}

function enhanceDialog() {
  const dialog = document.querySelector('#veteran-dialog');
  if (!dialog?.open || dialog.dataset.polished === 'true') return;
  const id = Number((document.querySelector('#dialog-title')?.textContent ?? '').match(/#(\d+)/)?.[1]);
  const record = POLISH.byId.get(id);
  if (!record) return;
  dialog.dataset.polished = 'true';
  document.querySelector('#dialog-title').textContent = (document.querySelector('#dialog-title').textContent ?? '').replace(/\s*·\s*#\d+/, '');
  const subtitle = document.querySelector('#dialog-subtitle');
  if (subtitle) subtitle.innerHTML = `${escapeHtml(String(record.scenario_id === 4 ? 'Trackblazer' : subtitle.textContent?.split('·')[0]?.trim() ?? ''))} · ${escapeHtml(String(record.register_time ?? '').slice(0,10))} ${rankMarkup(record)}`;
  const map = lineageMap(record), left = map.get(10), right = map.get(20), mainWins = uniqueWins(record), leftWins = uniqueWins(left), rightWins = uniqueWins(right);
  const ml = intersectionCount(mainWins,leftWins), mr = intersectionCount(mainWins,rightWins), lr = intersectionCount(leftWins,rightWins);
  const mainBase = baseCharacterId(record.card_id), leftBase = baseCharacterId(left?.card_id), rightBase = baseCharacterId(right?.card_id);
  const aML = affinity2(mainBase,leftBase), aMR = affinity2(mainBase,rightBase), aLR = affinity2(leftBase,rightBase);
  const activeSection = [...dialog.querySelectorAll('#dialog-content > section')].find(section => section.querySelector('h3')?.textContent?.includes('Active parent line'));
  if (activeSection) activeSection.insertAdjacentHTML('afterbegin', `<div class="inheritance-summary">
    <div><small>Veteran G1</small><b>${mainWins.size}</b></div><div><small>Left parent G1</small><b>${leftWins.size}</b></div><div><small>Right parent G1</small><b>${rightWins.size}</b></div>
    <div><small>Main ↔ left</small><b>${ml} shared · +${ml*3} G1</b><span>base affinity ${aML ?? '—'}</span></div>
    <div><small>Main ↔ right</small><b>${mr} shared · +${mr*3} G1</b><span>base affinity ${aMR ?? '—'}</span></div>
    <div><small>Left ↔ right</small><b>${lr} shared</b><span>base affinity ${aLR ?? '—'} · not counted in this line</span></div>
    <div class="inheritance-total"><small>Active-line G1 affinity</small><b>+${(ml+mr)*3}</b><span>Future target adds two aff3 terms.</span></div>
  </div>`);
  const nodes = activeSection?.querySelectorAll('.lineage-node') ?? [];
  [[nodes[0],mainWins.size,null,null],[nodes[1],leftWins.size,ml,aML],[nodes[2],rightWins.size,mr,aMR]].forEach(([node,wins,shared,aff]) => {
    if (!node) return;
    node.insertAdjacentHTML('beforeend', `<div class="node-insights"><span>${wins} unique G1</span>${shared == null ? '' : `<span>${shared} shared with veteran</span><span>base affinity ${aff ?? '—'}</span>`}</div>`);
  });
  const grandSection = [...dialog.querySelectorAll('#dialog-content > section')].find(section => section.querySelector('h3')?.textContent?.trim() === 'Grandparents');
  if (grandSection) {
    const details = document.createElement('details'); details.className = 'grandparent-details';
    details.innerHTML = '<summary>Show full grandparents (not active when this veteran is used as a parent)</summary>';
    while (grandSection.children.length > 1) details.append(grandSection.children[1]);
    grandSection.replaceWith(details);
  }
  cleanTechnicalIds(dialog); replaceFactorLabels(dialog);
}

function enhanceEverything() {
  POLISH.busy = false;
  replaceFactorLabels(); cleanTechnicalIds(); enhanceExplorer(); enhanceOverview(); enhanceDialog();
}
function scheduleEnhance() {
  if (POLISH.busy) return; POLISH.busy = true;
  requestAnimationFrame(enhanceEverything);
}
new MutationObserver(scheduleEnhance).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
loadReferences(); scheduleEnhance();
