/* Rocky shore fieldwork · IB Biology · the page's behaviour.
   One part open at a time; the photograph on the left shows what the open part is about.
   Photo coordinates: 1600 x 1350 px, 100 px = 1 m. Data: window.SHORE (js/shore-data.js). */
(function () {
  'use strict';
  const D = window.SHORE;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const PW = 1600, PH = 1350, M = 100;
  const ov = $('#ov');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('rocky-shore.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rocky-shore.' + k, JSON.stringify(v)); } catch (e) { /* private window: keep going */ } }
  };
  function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  const fmt = (x, n) => (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n).replace('-', '−');
  const ST = D.stations.map(s => ({ ...s, px: s.x * PW, py: s.y * PH }));

  /* ---------------- words that open their meaning in place ---------------- */
  const DEF = {
    zonation: 'Zonation: the distribution of species in bands (zones) across an area, following a gradient in an abiotic variable. On a rocky shore the bands run along the shore, parallel to the sea.',
    tolerance: 'Range of tolerance: the range of an abiotic variable in which a species can survive. Outside it, the species cannot live. Within it, there is often an optimum where it does best.',
    abiotic: 'Abiotic variable: a non-living factor that can be measured, for example temperature, light intensity, salinity or the time a rock is out of the water.',
    biotic: 'Biotic interaction: an effect of one living organism on another, for example competition, grazing (herbivory), predation or mutualism.',
    competition: 'Interspecific competition: competition between individuals of different species for the same limited resource, for example space on the rock or light.',
    realized: 'Realized niche: the actual extent of the niche of a species when it is in competition with other species (B4.2.12).',
    fundamental: 'Fundamental niche: the potential niche of a species, based on its adaptations and tolerance limits, with no competition (B4.2.12).',
    transect: 'Transect: a line across an area, along which samples are taken at regular intervals. It shows how the distribution of species changes along a gradient.',
    quadrat: 'Quadrat: a square frame of known area, for example 0.5 m × 0.5 m, often divided into 100 small squares. Organisms inside it are counted, or their percentage cover is estimated.',
    sessile: 'Sessile: fixed in one place, not able to move from place to place. Barnacles, mussels and seaweeds are sessile.',
    motile: 'Motile: able to move from place to place, for example crabs, fish and shrimps.',
    cover: 'Percentage cover: the percentage of the area of a quadrat covered by one species, seen from above. Count the small squares that are at least half covered.',
    abundance: 'Abundance: the number of individuals of a species in a sample, for example the number of limpets in a quadrat.',
    association: 'Association: two species are found together more often (positive association) or less often (negative association) than chance would give.',
    correlation: 'Correlation: a relationship in which two variables change together. Positive: both increase together. Negative: one increases while the other decreases. A correlation does not show that one variable causes the change in the other.',
    null: 'Null hypothesis (H0): the statement that there is no effect, no association or no correlation. A statistical test checks whether the data give enough evidence to reject it.',
    gradient: 'Gradient: a gradual change in an abiotic variable across an area, for example from the sea to the top of the shore.',
    bias: 'Bias: a result that is pushed one way by the method, for example because you chose where to put your quadrats.',
    significant: 'Significant: the result is unlikely to come from chance alone. If p is below 0.05 (5 %), the result is significant.',
    critical: 'Critical value: the value from a table that a test result must pass to be significant at p = 0.05.',
    sd: 'Standard deviation (SD): a measure of how far the values are spread around the mean. A large SD means the values vary a lot.',
    density: 'Density: the number of individuals per unit area, for example limpets per m².',
    exclusion: 'Competitive exclusion: when two species compete for exactly the same resources in the same place, one excludes the other (B4.2.13).'
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('.term');
    if (!b) return;
    const open = b.getAttribute('aria-expanded') === 'true';
    $$('.def').forEach(d => d.remove());
    $$('.term[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    if (open) return;
    b.setAttribute('aria-expanded', 'true');
    const d = h('span', { class: 'def', role: 'note' }, DEF[b.dataset.t] || '');
    const block = b.closest('.words') || b.closest('p') || b;
    block.after(d);
  });

  /* ↺ Start the whole page again: deletes this page's saved records (transect, random quadrats) and every answer. */
  $('#btnRestart').addEventListener('click', () => {
    if (!confirm('Start the whole page again? Your transect estimates, your random quadrats and every answer on this page will be deleted.')) return;
    try { Object.keys(localStorage).filter(k => k.indexOf('rocky-shore.') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) { /* private window: nothing was saved */ }
    location.replace(location.pathname);
  });

  /* ☀ Bright / ☾ Dark: the computer's own setting until the reader chooses; the choice is the site's own key,
     biology.theme (the Cells Lab and the hub's teacher pages use it too). The <head> script applies it before the first paint. */
  (function () {
    const tb = $('#btnTheme'); if (!tb) return;
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const nowDark = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : !!(mq && mq.matches); };
    const paint = () => { const d = nowDark(); tb.textContent = d ? '☀ Bright' : '☾ Dark'; tb.setAttribute('aria-label', d ? 'Switch to the bright version' : 'Switch to the dark version'); };
    tb.addEventListener('click', () => {
      const next = nowDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('biology.theme', next); } catch (e) { /* private window: this visit only */ }
      paint(); document.dispatchEvent(new Event('themechange'));
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', paint);
    tb.hidden = false; paint();
  })();

  /* ---------------- the drawing on the photograph ---------------- */
  function clear() { while (ov.firstChild) ov.removeChild(ov.firstChild); }
  // The tape runs along the left edge of the quadrats. Each quadrat is drawn exactly where its close-up comes from:
  // the 0.5 m square centred on its mark (tools/make-shore.py).
  const Q = 50, TX = s => s.px - Q / 2;
  const PHONE = window.matchMedia ? window.matchMedia('(max-width:640px)') : { matches: false };
  function tape(upTo) {
    const a = ST[0], b = ST[upTo == null ? 10 : upTo];
    el('line', { class: 'tape-edge', x1: TX(a), y1: a.py + 40, x2: TX(b), y2: b.py - 40 }, ov);
    el('line', { class: 'tape', x1: TX(a), y1: a.py + 40, x2: TX(b), y2: b.py - 40 }, ov);
  }
  function scaleBar() {
    el('line', { class: 'scale', x1: 60, y1: 1300, x2: 60 + M, y2: 1300 }, ov);
    el('text', { class: 'lab-s', x: 60 + M + 16, y: 1310 }, ov, '1 m');
  }
  function label(x, y, text, anchor) { return el('text', { class: 'lab', x, y, 'text-anchor': anchor || 'start' }, ov, text); }

  const ZONES = {
    upper: { y1: 1120, y2: 1345, ly: 1255, name: 'Upper shore', text: '<p><b>Upper shore.</b> Out of the water for the longest time at each low tide, so the rock becomes hot and dry. Much of the pale rock is covered by <b>barnacles</b>; <b>limpets</b> graze on it. Seaweed grows here mainly in wet hollows and small pools.</p><p class="note">Barnacles and limpets are too small to see from the drone. You will see them in the quadrats.</p>' },
    middle: { y1: 600, y2: 1115, ly: 880, name: 'Middle shore', text: '<p><b>Middle shore.</b> Covered by the sea for part of each day. Here much of the rock is covered by <b>sea lettuce</b> (<i>Ulva</i>), a green seaweed. Barnacles and limpets also live here, under and between the sea lettuce.</p><p class="note">On this page the green seaweed is always called sea lettuce.</p>' },
    lower: { y1: 225, y2: 590, ly: 330, name: 'Lower shore', text: '<p><b>Lower shore.</b> Out of the water only for a short time at low tide. Much of the rock is covered by <b>brown seaweed</b>, with patches of bright green seaweed. The water\'s edge is at the top of this band.</p><p class="note">On Jeju, common brown seaweeds of the lower shore include hijiki (<i>Sargassum fusiforme</i>).</p>' },
    pools: { pools: [[360, 470, 70, 95], [745, 540, 95, 65], [985, 505, 110, 85], [1400, 470, 150, 95], [960, 640, 60, 45], [880, 705, 50, 35], [1090, 1050, 80, 55], [420, 728, 38, 45]], name: 'Rock pools',
      text: '<p><b>Rock pools</b> hold sea water when the tide is out. A pool is a different habitat from the rock around it: the temperature and salinity of its water change during the low tide.</p><p class="note">If more than half of a quadrat is in a pool, do not use it: take new numbers. Do not mix pool and rock data in one test.</p>' }
  };
  function drawZones(which) {
    clear();
    const z = ZONES[which];
    // dim everything outside the zone, so the zone stands out
    const mk = el('mask', { id: 'zmask' }, el('defs', {}, ov));
    el('rect', { x: 0, y: 0, width: PW, height: PH, fill: '#fff' }, mk);
    if (z.pools) z.pools.forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx: rx + 22, ry: ry + 22, fill: '#000' }, mk));
    else el('rect', { x: 0, y: z.y1, width: PW, height: z.y2 - z.y1, fill: '#000' }, mk);
    el('rect', { x: 0, y: 0, width: PW, height: PH, fill: 'rgba(5,15,20,.58)', mask: 'url(#zmask)' }, ov);
    if (z.pools) z.pools.forEach(([x, y, rx, ry]) => el('ellipse', { class: 'zone', cx: x, cy: y, rx: rx + 22, ry: ry + 22 }, ov));
    if (z.pools) label(800, 1250, 'Rock pools: inside the rings', 'middle').setAttribute('class', 'lab big');
    else label(800, z.ly, z.name, 'middle').setAttribute('class', 'lab big');
    scaleBar();
    $('#zone-text').innerHTML = z.text;
    $$('#zone-choices button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.zone === which)));
  }
  $$('#zone-choices button').forEach(b => b.addEventListener('click', () => drawZones(b.dataset.zone)));

  const METHODS = {
    line: '<p><b>Line transect.</b> Lay a tape from the top of the shore to the water\'s edge. At regular points along it (here every 1 m), record every species that touches the tape.</p><p><b>You record:</b> which species are present at each point.</p><p><b>Strength:</b> quick. <b>Weakness:</b> a narrow line misses organisms between the points, and it gives no percentage cover.</p>',
    cont: '<p><b>Belt transect, continuous.</b> Place quadrats side by side along the whole tape. A 10 m tape and 0.5 m quadrats give 10 ÷ 0.5 = 20 quadrats.</p><p><b>You record:</b> the percentage cover or the number of each species in every quadrat.</p><p><b>Strength:</b> the most complete record of the shore. <b>Weakness:</b> slow; the tide may come back before you finish.</p>',
    inter: '<p><b>Belt transect, interrupted.</b> Place a quadrat at regular intervals along the tape: here every 1 m, which gives 11 quadrats (0 m to 10 m).</p><p><b>You record:</b> the percentage cover or the number of each species in every quadrat.</p><p><b>Strength:</b> much faster than a continuous belt, and it still shows how each species changes along the gradient. <b>Weakness:</b> it misses what is between the quadrats. <u>This is the method in part 3.</u></p>',
    random: '<p><b>Random quadrats.</b> Choose positions with random numbers inside one area where conditions are about the same everywhere.</p><p><b>You record:</b> the number, the percentage cover or the presence of each species in each quadrat.</p><p><b>Strength:</b> no bias in where the quadrats go. The mean per quadrat estimates the density of the whole area; the standard deviation shows how much the quadrats differ (C4.1.3). <b>Weakness:</b> it does not show a change along a gradient. <u>This is the method in part 4.</u></p>'
  };
  function drawMethod(m) {
    clear(); scaleBar();
    const a = ST[0], b = ST[10];
    if (m === 'random') { drawArea(true); }
    else {
      tape();
      if (m === 'line') ST.forEach(s => el('circle', { class: 'pt', cx: TX(s), cy: s.py, r: 13 }, ov));
      if (m === 'cont') for (let i = 0; i < 20; i++) el('rect', { class: 'q', x: TX(a), y: a.py - (i + 1) * Q, width: Q, height: Q }, ov);
      if (m === 'inter') ST.forEach(s => el('rect', { class: 'q', x: TX(s), y: s.py - Q / 2, width: Q, height: Q }, ov));
      label(a.px + 60, a.py + 14, '0 m'); label(b.px + 60, b.py + 14, '10 m');
    }
    $('#method-text').innerHTML = METHODS[m];
    $$('#method-choices button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
  }
  $$('#method-choices button').forEach(b => b.addEventListener('click', () => drawMethod(b.dataset.m)));

  /* ---------------- part 3: the transect ---------------- */
  const SP = [
    { k: 'barn', name: 'Barnacles', unit: '%', col: 'var(--barn)', note: 'with the seaweed lifted' },
    { k: 'green', name: 'Sea lettuce', unit: '%', col: 'var(--green)' },
    { k: 'brown', name: 'Brown seaweed', unit: '%', col: 'var(--brown)' },
    { k: 'limp', name: 'Limpets', unit: 'number', col: 'var(--limp)', note: 'with the seaweed lifted' }
  ];
  let mine = store.get('transect', {});        // {d: {barn, green, brown, limp}}
  function drawTransect(sel) {
    clear(); scaleBar(); tape();
    ST.forEach(s => {
      const done = mine[s.d] && SP.every(p => mine[s.d][p.k] !== '' && mine[s.d][p.k] != null);
      el('rect', { class: 'q' + (sel === s.d ? ' on' : done ? ' done' : ''), x: TX(s), y: s.py - Q / 2, width: Q, height: Q }, ov);
      const g = el('g', { class: 'stn' + (done ? ' done' : ''), tabindex: 0, role: 'button', 'aria-label': 'Quadrat at ' + s.d + ' m' }, ov);
      el('line', { class: 'leader', x1: s.px - 72, y1: s.py, x2: TX(s), y2: s.py }, g);
      el('circle', { cx: s.px - 72, cy: s.py, r: PHONE.matches ? 38 : 27 }, g); el('text', { x: s.px - 72, y: s.py + 1 }, g, s.d);
      g.addEventListener('click', () => openQuad('t', s.d));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQuad('t', s.d); } });
    });
    label(ST[0].px + 60, ST[0].py + 14, '0 m: top of the shore');
    label(ST[10].px + 60, ST[10].py + 14, '10 m: near the sea');
    $('#t-pick').innerHTML = '';
    ST.forEach(s => {
      const done = mine[s.d] && SP.every(p => mine[s.d][p.k] !== '' && mine[s.d][p.k] != null);
      const b = h('button', { type: 'button', class: done ? 'done' : '', 'aria-label': 'Quadrat at ' + s.d + ' m' + (done ? ', recorded' : '') }, s.d + ' m');
      b.addEventListener('click', () => openQuad('t', s.d));
      $('#t-pick').appendChild(b);
    });
  }
  function tableT() {
    const t = $('#t-table');
    let html = '<thead><tr><th>Distance<br>/ m</th><th>Rock temperature<br>/ °C</th>' + SP.map(p => `<th><span class="sw" style="background:${p.col}"></span>${p.name}<br>/ ${p.unit === '%' ? '%' : 'number'}</th>`).join('') + '</tr></thead><tbody>';
    ST.forEach(s => {
      const m = mine[s.d] || {};
      html += `<tr><td>${s.d}</td><td>${fmt(s.temp, 1)}</td>` + SP.map(p => { const v = m[p.k]; return v === '' || v == null ? '<td class="miss">—</td>' : `<td>${v}</td>`; }).join('') + '</tr>';
    });
    t.innerHTML = html + '</tbody>';
  }
  function rowsT(useKey) {
    return ST.map(s => {
      const m = mine[s.d] || {};
      return [s.d, s.temp].concat(SP.map(p => (m[p.k] !== '' && m[p.k] != null) ? Number(m[p.k]) : (useKey ? s[p.k] : '')));
    });
  }
  const HEAD_T = ['distance_m', 'temperature_C', 'barnacles_pct', 'sea_lettuce_pct', 'brown_seaweed_pct', 'limpets_n'];
  const HEAD_T_SHEETS = ['Distance / m', 'Rock temperature / °C', 'Barnacles / %', 'Sea lettuce / %', 'Brown seaweed / %', 'Limpets / number'];
  function download(name, text) {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  $('#t-copy').addEventListener('click', async () => {
    const txt = [HEAD_T_SHEETS].concat(rowsT(false)).map(r => r.join('\t')).join('\n');
    try { await navigator.clipboard.writeText(txt); $('#t-msg').textContent = 'Copied. In Google Sheets, click cell A1 and paste.'; }
    catch (e) { $('#t-msg').textContent = 'Your browser blocked copying. Use Download as CSV, then File ▸ Import in Google Sheets.'; }
  });
  $('#t-csv').addEventListener('click', () => download('transect.csv', [HEAD_T].concat(rowsT(false)).map(r => r.join(',')).join('\n')));
  $('#t-fill').addEventListener('click', () => {
    ST.forEach(s => { mine[s.d] = mine[s.d] || {}; SP.forEach(p => { if (mine[s.d][p.k] === '' || mine[s.d][p.k] == null) { mine[s.d][p.k] = s[p.k]; store.set('tfilled', true); } }); });
    store.set('transect', mine); tableT(); drawTransect(); $('#t-msg').textContent = 'The empty cells now hold our counts. Your own estimates are unchanged.';
  });
  $('#t-clear').addEventListener('click', () => { if (!confirm('Delete all your transect estimates?')) return; mine = {}; store.set('transect', mine); store.set('tfilled', false); tableT(); drawTransect(); });

  /* ---------------- part 4: random quadrats ---------------- */
  const A = D.area, AX = A.x0 * PW, AY = A.y0 * PH, CELL = 50;
  const RQ = D.random.filter(r => !r.skip);
  let rmine = store.get('random', {});         // {q: {limp: 'yes'|'no', green: 'yes'|'no'}}
  let rnext = store.get('rnext', 0);
  function drawArea(methodView) {
    clear(); scaleBar();
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const r = RQ.find(q => q.gx === i && q.gy === j);
      const cls = 'cell' + (methodView ? (r ? ' pick' : '') : r && rmine[r.q] ? ' seen' : r && RQ.indexOf(r) === rnext - 1 ? ' pick' : '');
      const c = el('rect', { class: cls, x: AX + i * CELL, y: AY + j * CELL, width: CELL, height: CELL }, ov);
      if (!methodView && r && (rmine[r.q] || RQ.indexOf(r) < rnext)) { c.style.cursor = 'pointer'; c.addEventListener('click', () => openQuad('r', r.q)); }
    }
    el('rect', { class: 'area', x: AX, y: AY, width: 10 * CELL, height: 10 * CELL }, ov);
    label(AX, AY - 22, '5 m × 5 m');
    for (let i = 0; i < 10; i++) el('text', { class: 'lab-xs', x: AX + i * CELL + 25, y: AY + 10 * CELL + 30, 'text-anchor': 'middle' }, ov, i);
    for (let j = 0; j < 10; j++) el('text', { class: 'lab-xs', x: AX - 12, y: AY + j * CELL + 33, 'text-anchor': 'end' }, ov, j);
    el('text', { class: 'lab-s', x: AX + 5 * CELL, y: AY + 10 * CELL + 70, 'text-anchor': 'middle' }, ov, 'across →');
    el('text', { class: 'lab-s', x: AX - 46, y: AY + 5 * CELL + 12, 'text-anchor': 'end' }, ov, 'down ↓');
  }
  function counts(useKey) {
    const o = { yy: 0, yn: 0, ny: 0, nn: 0, n: 0 };
    RQ.forEach(r => {
      let L, G;
      if (rmine[r.q]) { L = rmine[r.q].limp === 'yes'; G = rmine[r.q].green === 'yes'; }
      else if (useKey) { L = r.limp > 0; G = r.green > 0; }
      else return;
      o.n++; o[(L ? 'y' : 'n') + (G ? 'y' : 'n')]++;
    });
    return o;
  }
  function tableR() {
    const c = counts(false);
    $('#r-two').innerHTML = `<thead><tr><th></th><th>Sea lettuce present</th><th>Sea lettuce absent</th><th>Total</th></tr></thead><tbody>
      <tr><th>Limpets present</th><td>${c.yy}</td><td>${c.yn}</td><td>${c.yy + c.yn}</td></tr>
      <tr><th>Limpets absent</th><td>${c.ny}</td><td>${c.nn}</td><td>${c.ny + c.nn}</td></tr>
      <tr><th>Total</th><td>${c.yy + c.ny}</td><td>${c.yn + c.nn}</td><td>${c.n}</td></tr></tbody>`;
    let html = '<thead><tr><th>Quadrat</th><th>Across</th><th>Down</th><th>Limpets</th><th>Sea lettuce</th></tr></thead><tbody>';
    RQ.forEach(r => { const m = rmine[r.q]; if (m) html += `<tr><td>${r.q}</td><td>${r.gx}</td><td>${r.gy}</td><td>${m.limp === 'yes' ? 'present' : 'absent'}</td><td>${m.green === 'yes' ? 'present' : 'absent'}</td></tr>`; });
    $('#r-table').innerHTML = html + '</tbody>';
    $('#r-status').textContent = c.n === 30 ? 'All 30 quadrats are recorded. Go on to part 5.' : `${c.n} of 30 quadrats recorded.`;
    $('#r-next').disabled = rnext >= RQ.length;
  }
  $('#r-next').addEventListener('click', () => {
    if (rnext >= RQ.length) return;
    const r = RQ[rnext]; rnext++; store.set('rnext', rnext); drawArea(false); tableR();
    openQuad('r', r.q);
  });
  $('#r-fill').addEventListener('click', () => {
    RQ.forEach(r => { if (!rmine[r.q]) { rmine[r.q] = { limp: r.limp > 0 ? 'yes' : 'no', green: r.green > 0 ? 'yes' : 'no' }; store.set('rfilled', true); } });
    rnext = RQ.length; store.set('random', rmine); store.set('rnext', rnext); drawArea(false); tableR();
  });
  $('#r-clear').addEventListener('click', () => { if (!confirm('Delete all your random-quadrat records?')) return; rmine = {}; rnext = 0; store.set('random', rmine); store.set('rnext', 0); store.set('rfilled', false); drawArea(false); tableR(); });
  $('#r-csv').addEventListener('click', () => {
    const rows = RQ.map(r => { const m = rmine[r.q] || { limp: r.limp > 0 ? 'yes' : 'no', green: r.green > 0 ? 'yes' : 'no' }; return [r.q, r.gx, r.gy, m.limp === 'yes' ? 'present' : 'absent', m.green === 'yes' ? 'present' : 'absent']; });
    download('random-quadrats.csv', [['quadrat', 'across', 'down', 'limpets', 'sea_lettuce']].concat(rows).map(r => r.join(',')).join('\n'));
  });

  /* ---------------- the quadrat window ---------------- */
  const dlg = $('#quad');
  let cur = null, lifted = false;
  function openQuad(kind, id) {
    cur = { kind, id }; lifted = false;
    const form = $('#quad-form'); form.innerHTML = ''; $('#quad-msg').textContent = '';
    $('#quad-lift').setAttribute('aria-pressed', 'false');
    if (kind === 't') {
      const s = ST.find(x => x.d === id), m = mine[id] || {};
      $('#quad-title').textContent = `Quadrat at ${id} m`;
      $('#quad-sub').innerHTML = `0.5 m × 0.5 m, 100 small squares. Rock temperature from the probe: <b>${fmt(s.temp, 1)} °C</b>.`;
      $('#quad-lift').style.display = s.lifted ? '' : 'none';
      $('#quad-img').src = `img/t${String(id).padStart(2, '0')}.jpg`;
      $('#quad-img').alt = `The quadrat at ${id} m along the transect`;
      $('#quad-tag').textContent = `${id} m`;
      SP.forEach(p => {
        const row = h('div', { class: 'row' });
        row.innerHTML = `<label for="f-${p.k}"><span class="sw" style="background:${p.col}"></span>${p.name}${p.note ? ' <span class="note">(' + p.note + ')</span>' : ''}</label>
          <input id="f-${p.k}" type="number" inputmode="numeric" min="0" max="${p.unit === '%' ? 100 : 50}" step="1" value="${m[p.k] != null ? m[p.k] : ''}" aria-label="${p.name} ${p.unit === '%' ? 'percentage cover' : 'number'}">
          <span class="key">${p.unit}</span>`;
        form.appendChild(row);
      });
      drawTransect(id);
    } else {
      const r = RQ.find(x => x.q === id), m = rmine[id] || {};
      $('#quad-title').textContent = `Random quadrat ${id}`;
      $('#quad-sub').innerHTML = `Position: across <b>${r.gx}</b>, down <b>${r.gy}</b>. Record only whether each species is present.`;
      $('#quad-lift').style.display = 'none';
      $('#quad-img').src = `img/r${String(id).padStart(2, '0')}.jpg`;
      $('#quad-img').alt = `Random quadrat ${id}`;
      $('#quad-tag').textContent = `across ${r.gx}, down ${r.gy}`;
      [['limp', 'Limpets', 'var(--limp)'], ['green', 'Sea lettuce', 'var(--green)']].forEach(([k, name, col]) => {
        const row = h('div', { class: 'row' });
        row.innerHTML = `<label for="f-${k}"><span class="sw" style="background:${col}"></span>${name}</label>
          <select id="f-${k}"><option value="">choose</option><option value="yes"${m[k] === 'yes' ? ' selected' : ''}>present</option><option value="no"${m[k] === 'no' ? ' selected' : ''}>absent</option></select><span></span>`;
        form.appendChild(row);
      });
    }
    $('#quad-nextq').textContent = kind === 't' ? 'Next quadrat' : 'Next random quadrat';
    if (!dlg.open) dlg.showModal();
  }
  $('#quad-lift').addEventListener('click', () => {
    lifted = !lifted; const id = cur.id;
    $('#quad-img').src = `img/t${String(id).padStart(2, '0')}${lifted ? '-lifted' : ''}.jpg`;
    $('#quad-img').alt = `The quadrat at ${id} m along the transect${lifted ? ', with the seaweed lifted' : ''}`;
    $('#quad-lift').setAttribute('aria-pressed', String(lifted));
    $('#quad-lift').textContent = lifted ? 'Put the seaweed back' : 'Lift the seaweed';
    $('#quad-tag').textContent = `${id} m${lifted ? ' · seaweed lifted' : ''}`;
  });
  function save() {
    if (cur.kind === 't') {
      const m = mine[cur.id] || {};
      SP.forEach(p => { const v = $('#f-' + p.k).value; m[p.k] = v === '' ? '' : Math.max(0, Math.min(p.unit === '%' ? 100 : 50, Math.round(Number(v)))); });
      mine[cur.id] = m; store.set('transect', mine); tableT();
    } else {
      const L = $('#f-limp').value, G = $('#f-green').value;
      if (L && G) { rmine[cur.id] = { limp: L, green: G }; store.set('random', rmine); }
      tableR();
    }
  }
  $('#quad-form').addEventListener('change', save);
  $('#quad-check').addEventListener('click', () => {
    save();
    const msg = $('#quad-msg');
    if (cur.kind === 't') {
      const s = ST.find(x => x.d === cur.id), m = mine[cur.id];
      const lines = SP.map(p => {
        const v = m[p.k];
        if (v === '' || v == null) return `${p.name}: enter a value first.`;
        const tol = p.unit === '%' ? 5 : 0, ok = Math.abs(v - s[p.k]) <= tol;
        return `<span class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'}</span> ${p.name}: you ${v}, our count ${s[p.k]}${p.unit === '%' ? ' %' : ''}`;
      });
      msg.innerHTML = lines.join('<br>') + (s.limpHidden ? `<br><span class="note">${s.limpHidden} of the ${s.limp} limpets are under the seaweed.</span>` : '') +
        '<br><span class="note">Within 5 % counts as a good estimate.</span>';
      drawTransect(cur.id);
    } else {
      const r = RQ.find(x => x.q === cur.id), m = rmine[cur.id];
      if (!m) { msg.textContent = 'Choose present or absent for both species first.'; return; }
      const a = m.limp === (r.limp > 0 ? 'yes' : 'no'), b = m.green === (r.green > 0 ? 'yes' : 'no');
      msg.innerHTML = `<span class="${a ? 'ok' : 'bad'}">${a ? '✓' : '✗'}</span> Limpets: ${r.limp > 0 ? 'present (' + r.limp + ')' : 'absent'}<br><span class="${b ? 'ok' : 'bad'}">${b ? '✓' : '✗'}</span> Sea lettuce: ${r.green > 0 ? 'present (' + r.green + ' % cover)' : 'absent'}`;
      drawArea(false);
    }
  });
  $('#quad-nextq').addEventListener('click', () => {
    save();
    if (cur.kind === 't') { const n = (cur.id + 1) % 11; openQuad('t', n); }
    else { if (rnext < RQ.length) { const r = RQ[rnext]; rnext++; store.set('rnext', rnext); drawArea(false); tableR(); openQuad('r', r.q); } else { dlg.close(); } }
  });
  $('#quad-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { save(); show(currentPart, true); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  /* ---------------- part 5: chi-squared, step by step ---------------- */
  const CSTEPS = ['Question', 'Hypotheses', 'Observed', 'Expected', 'χ²', 'Critical value', 'Conclusion', 'Biology', 'Google Sheets'];
  let cstep = 0;
  function chi() {
    const mineAll = counts(false).n === 30;
    const c = counts(true);
    const O = [[c.yy, c.yn], [c.ny, c.nn]];
    const R = [O[0][0] + O[0][1], O[1][0] + O[1][1]], C = [O[0][0] + O[1][0], O[0][1] + O[1][1]], N = R[0] + R[1];
    const E = [[R[0] * C[0] / N, R[0] * C[1] / N], [R[1] * C[0] / N, R[1] * C[1] / N]];
    let X = 0; const parts = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const v = Math.pow(O[i][j] - E[i][j], 2) / E[i][j]; parts.push(v); X += v; }
    return { O, R, C, N, E, X, parts, mineAll, p: chiP(X) };
  }
  function chiP(x) { // upper tail of chi-squared with 1 degree of freedom = erfc(sqrt(x/2))
    const z = Math.sqrt(x / 2), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return r;
  }
  function tbl(rows, head) {
    return '<div class="tablewrap"><table class="data"><thead><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map((x, i) => i === 0 ? `<th>${x}</th>` : `<td>${x}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  function renderChi() {
    const k = chi(), O = k.O, E = k.E;
    $('#c-source').textContent = !k.mineAll ? 'Part 4 is not finished, so the empty quadrats use our records. Finish part 4 to use only your own.'
      : store.get('rfilled', false) ? 'These are the 30 records from part 4: yours, and ours where you pressed Fill.' : 'These are your own 30 records from part 4.';
    $('#c-steps').innerHTML = CSTEPS.map((s, i) => `<button class="${i < cstep ? 'done' : i === cstep ? 'now' : ''}" data-i="${i}">${i + 1} ${s}</button>`).join('');
    $$('#c-steps button').forEach(b => b.addEventListener('click', () => { cstep = +b.dataset.i; renderChi(); }));
    const head = ['', 'Sea lettuce present', 'Sea lettuce absent'];
    const big = k.X > 3.84, neg = O[0][0] < E[0][0];
    const B = [
      `<p>On the shore, limpets and sea lettuce sometimes share a quadrat and sometimes do not.</p><p><b>The question:</b> are the two species found together <u>more often</u>, or <u>less often</u>, than chance alone would give? If so, there is an <button class="term" data-t="association">association</button> between them.</p><p class="note">Analogy: if two friends choose their seats at random, they sit together only by chance. If they sit together most days, or never, their seats are associated.</p>`,
      `<p><b>Null hypothesis (H<sub>0</sub>):</b> there is no association between the distribution of limpets and the distribution of sea lettuce. The two species are distributed independently.</p><p><b>Alternative hypothesis (H<sub>1</sub>):</b> there is an association between the distribution of limpets and the distribution of sea lettuce.</p>`,
      `<p>The observed counts (O): how many of the ${k.N} quadrats fell into each group.</p>` + tbl([['Limpets present', O[0][0], O[0][1]], ['Limpets absent', O[1][0], O[1][1]]], head) + `<p class="note">Row totals: ${k.R[0]} and ${k.R[1]}. Column totals: ${k.C[0]} and ${k.C[1]}. Grand total: ${k.N}.</p>`,
      `<p>The expected counts (E) are the numbers you would get if the two species were independent.</p><div class="formula">E = row total × column total ÷ grand total</div><p>For example, limpets present and sea lettuce present: ${k.R[0]} × ${k.C[0]} ÷ ${k.N} = <b>${fmt(E[0][0], 2)}</b></p>` + tbl([['Limpets present', fmt(E[0][0], 2), fmt(E[0][1], 2)], ['Limpets absent', fmt(E[1][0], 2), fmt(E[1][1], 2)]], head) + `<p class="note">The test is valid only if every expected value is at least 5. ${Math.min(E[0][0], E[0][1], E[1][0], E[1][1]) >= 5 ? 'Here they all are.' : 'Here one is below 5: sample more quadrats.'}</p>`,
      `<div class="formula">χ² = Σ (O − E)² ÷ E</div><p>Calculate (O − E)² ÷ E for each of the four cells, then find their sum (Σ means "the sum of").</p>` + tbl([['Limpets present', fmt(k.parts[0], 2), fmt(k.parts[1], 2)], ['Limpets absent', fmt(k.parts[2], 2), fmt(k.parts[3], 2)]], head) + `<p>χ² = ${k.parts.map(x => fmt(x, 2)).join(' + ')} = <b>${fmt(k.X, 2)}</b></p>`,
      `<p><b>Degrees of freedom</b> = (number of rows − 1) × (number of columns − 1) = (2 − 1) × (2 − 1) = <b>1</b>.</p><p>The <button class="term" data-t="critical">critical value</button> of χ² for 1 degree of freedom at p = 0.05 is <b>3.84</b>.</p>` + tbl([['1 degree of freedom', '2.71', '3.84', '6.63']], ['p', '0.10', '0.05', '0.01']) + `<p>Compare: our χ² = ${fmt(k.X, 2)} is ${big ? '<b>larger</b>' : '<b>smaller</b>'} than 3.84.</p>`,
      `<p>${big ? `χ² = ${fmt(k.X, 2)} is larger than the critical value 3.84, so <b>reject the null hypothesis</b>. There is a <button class="term" data-t="significant">significant</button> association between limpets and sea lettuce (p &lt; 0.05).` : `χ² = ${fmt(k.X, 2)} is smaller than the critical value 3.84, so <b>do not reject the null hypothesis</b>. There is no significant association (p &gt; 0.05).`}</p>` +
        (big ? `<p><b>Which direction?</b> Compare O with E. Limpets and sea lettuce together: observed ${O[0][0]}, expected ${fmt(E[0][0], 1)}. They were found together <u>${neg ? 'less' : 'more'} often</u> than expected: a <b>${neg ? 'negative' : 'positive'} association</b>.</p>` : '') +
        `<div class="box"><div class="k">Reading p</div><p>p = ${k.p < 0.001 ? 'less than 0.001' : fmt(k.p, 3)}. If the two species were really independent, chance alone would give a χ² this large ${k.p < 0.001 ? 'less than 1 time in 1,000' : k.p < 0.01 ? 'about ' + Math.round(k.p * 1000) + ' times in 1,000' : 'about ' + Math.round(k.p * 100) + ' times in 100'}. If p is below 0.05, the result is significant. <b>Small p, big news. Big p, no news.</b></p></div>`,
      `<p>The test shows an association. <u>It does not show the cause.</u> Possible explanations for a negative association:</p><ul><li><b>Grazing (herbivory):</b> limpets graze young seaweed, so the rock where limpets feed stays bare.</li><li><b>Different niches:</b> the two species need different conditions, for example sea lettuce where the rock stays wet, and limpets on rock that dries out.</li><li><b>Competition:</b> C4.1.15 notes that a χ² association can be evidence for interspecific competition between two species that need the same resource, such as space on the rock. In the strongest case, one species excludes the other: <button class="term" data-t="exclusion">competitive exclusion</button>.</li></ul><div class="box sea"><div class="k">How to test a cause</div><p>An experiment: fix small mesh cages that keep limpets out of some squares of rock, and leave other squares open. If sea lettuce cover becomes higher inside the cages, this supports grazing as a cause.</p></div>`,
      `<p>Put the observed counts in a 2 × 2 block, for example cells B2:C3 (rows: limpets present, absent; columns: sea lettuce present, absent).</p><p>1. Expected value for cell B2, in F2:</p><div class="formula">=SUM(B2:C2)*SUM(B2:B3)/SUM(B2:C3)</div><p>Complete F2:G3 the same way, changing the row and the column.</p><p>2. The p-value directly:</p><div class="formula">=CHISQ.TEST(B2:C3, F2:G3)</div><p>3. The χ² value, from the p-value:</p><div class="formula">=CHISQ.INV.RT(CHISQ.TEST(B2:C3, F2:G3), 1)</div><p>4. The critical value, to compare:</p><div class="formula">=CHISQ.INV.RT(0.05, 1)</div><p class="note">The workbook in part 10 has all of this set up. Excel uses the same formulas.</p>`
    ];
    $('#c-body').innerHTML = B[cstep];
    $('#c-prev').disabled = cstep === 0; $('#c-next').disabled = cstep === CSTEPS.length - 1;
  }
  $('#c-prev').addEventListener('click', () => { cstep = Math.max(0, cstep - 1); renderChi(); });
  $('#c-next').addEventListener('click', () => { cstep = Math.min(CSTEPS.length - 1, cstep + 1); renderChi(); });

  /* ---------------- part 6: correlation and the kite ---------------- */
  const CRIT = [[8, 0.707], [9, 0.666], [10, 0.632], [11, 0.602], [12, 0.576], [15, 0.514], [20, 0.444]];
  $('#crit-r').innerHTML = '<thead><tr><th>Number of quadrats</th>' + CRIT.map(c => `<th>${c[0]}</th>`).join('') + '</tr></thead><tbody><tr><th>Critical r</th>' + CRIT.map(c => `<td>${c[1].toFixed(3)}</td>`).join('') + '</tr></tbody>';
  let sp = 'barn';
  function series(useKey) {
    const rows = rowsT(true);
    return rows.map(r => ({ d: r[0], t: r[1], barn: r[2], green: r[3], brown: r[4], limp: r[5] }));
  }
  function ranks(v) { const s = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]), r = new Array(v.length);
    for (let i = 0; i < s.length;) { let j = i; while (j + 1 < s.length && s[j + 1][0] === s[i][0]) j++; for (let k = i; k <= j; k++) r[s[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; }
  function pearson(x, y) {
    const n = x.length, mx = x.reduce((a, b) => a + b) / n, my = y.reduce((a, b) => a + b) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    return { r: sxy / Math.sqrt(sxx * syy), b: sxy / sxx, a: my - (sxy / sxx) * mx };
  }
  const SPTXT = {
    barn: k => `<p><b>Barnacles.</b> r = ${fmt(k.r, 2)}: a <b>strong positive correlation</b>. The points lie close to a straight line. ${Math.abs(k.r) > 0.602 ? 'r is further from 0 than the critical value 0.602 (11 quadrats), so the correlation is <b>significant</b> (p &lt; 0.05).' : 'r is closer to 0 than the critical value 0.602, so the correlation is not significant.'}</p><p>R² = ${fmt(k.r * k.r, 2)}: about ${Math.round(k.r * k.r * 100)} % of the variation in barnacle cover is accounted for by the straight line.</p><div class="box amber"><div class="k">Correlation is not cause</div><p>Barnacle cover is higher where the rock is hotter. But higher on the shore the rock is also out of the water for longer, and there is less seaweed to compete with. The data cannot separate these. An experiment that changes only the temperature would give stronger evidence.</p></div>`,
    brown: k => `<p><b>Brown seaweed.</b> r = ${fmt(k.r, 2)}: a strong negative correlation, and ${Math.abs(k.r) > 0.602 ? 'significant' : 'not significant'} by the critical value. <u>But look at the graph</u>: the points do not follow a straight line. The cover is near 0 % over most of the shore, then rises steeply near the water.</p><div class="box amber"><div class="k">Always look at the scatter graph first</div><p>Pearson's r measures how close the points are to a <u>straight line</u>, so for a curve it can mislead. Spearman's rank correlation (beyond the guide) uses only the order of the values. Here ρ = ${fmt(k.rho, 2)}; its own critical value for 11 pairs is 0.618. ρ is weaker than r, partly because five quadrats tie at 0 %.</p></div>`,
    green: k => `<p><b>Sea lettuce.</b> r = ${fmt(k.r, 2)}: ${Math.abs(k.r) > 0.602 ? 'significant' : 'weak, and <b>not significant</b>'}. Yet sea lettuce clearly lives in a zone: it is in the middle of the transect only.</p><div class="box sea"><div class="k">A hump: the realized niche</div><p>The cover is high at middle temperatures and low at both ends. Above, the rock is too hot and dry: an abiotic limit, set by its range of tolerance. Below, brown seaweed occupies the space: a biotic limit, as in Connell's barnacles (part 1). The hump shows its realized niche on this shore. A hump-shaped pattern can give r close to 0 even when the abiotic variable matters a lot: r measures only straight-line patterns.</p></div>`,
    limp: k => `<p><b>Limpets.</b> r = ${fmt(k.r, 2)}: no significant correlation with rock temperature. Limpets live along most of the transect. Their numbers are small, so a few limpets more or less change the pattern a lot: count more quadrats for a clearer answer.</p>`
  };
  function drawScatter() {
    const S = series(true), x = S.map(s => s.t), y = S.map(s => s[sp]);
    const k = pearson(x, y), svg = $('#k-chart'); svg.innerHTML = ''; k.rho = pearson(ranks(x), ranks(y)).r;
    const X0 = 62, X1 = 540, Y0 = 290, Y1 = 22, xmin = 22, xmax = 36;
    const ymax = sp === 'limp' ? 10 : 100;
    const sx = v => X0 + (v - xmin) / (xmax - xmin) * (X1 - X0), sy = v => Y0 - v / ymax * (Y0 - Y1);
    for (let v = xmin; v <= xmax; v += 2) { el('line', { class: 'gr', x1: sx(v), y1: Y0, x2: sx(v), y2: Y1 }, svg); el('text', { x: sx(v), y: Y0 + 18, 'text-anchor': 'middle' }, svg, v); }
    for (let v = 0; v <= ymax; v += ymax / 5) { el('line', { class: 'gr', x1: X0, y1: sy(v), x2: X1, y2: sy(v) }, svg); el('text', { x: X0 - 8, y: sy(v) + 4, 'text-anchor': 'end' }, svg, v); }
    el('line', { class: 'ax', x1: X0, y1: Y0, x2: X1, y2: Y0 }, svg); el('line', { class: 'ax', x1: X0, y1: Y0, x2: X0, y2: Y1 }, svg);
    el('text', { x: (X0 + X1) / 2, y: 330, 'text-anchor': 'middle' }, svg, 'Rock temperature / °C');
    const name = SP.find(p => p.k === sp);
    el('text', { x: 16, y: (Y0 + Y1) / 2, 'text-anchor': 'middle', transform: `rotate(-90 16 ${(Y0 + Y1) / 2})` }, svg, name.name + (sp === 'limp' ? ' / number' : ' / % cover'));
    const col = getComputedStyle(document.documentElement).getPropertyValue(sp === 'barn' ? '--barn' : sp === 'green' ? '--green' : sp === 'brown' ? '--brown' : '--limp');
    const lo = Math.min(...x), hi = Math.max(...x);
    el('line', { class: 'fit', x1: sx(lo), y1: sy(Math.max(0, Math.min(ymax, k.a + k.b * lo))), x2: sx(hi), y2: sy(Math.max(0, Math.min(ymax, k.a + k.b * hi))), stroke: col }, svg);
    S.forEach(s => el('circle', { class: 'pt', cx: sx(s.t), cy: sy(s[sp]), r: 6.5, fill: col }, svg));
    el('text', { x: X1 - 6, y: Y1 + 14, 'text-anchor': 'end' }, svg, `r = ${fmt(k.r, 2)}   R² = ${fmt(k.r * k.r, 2)}   n = ${S.length}`);
    $('#k-text').innerHTML = SPTXT[sp](k);
    $$('#k-choices button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sp === sp)));
    const own = ST.every(s => mine[s.d] && SP.every(p => mine[s.d][p.k] !== '' && mine[s.d][p.k] != null));
    $('#k-source').textContent = !own ? 'The empty cells of your table use our counts. Finish part 3 to use only your own.'
      : store.get('tfilled', false) ? 'These graphs use your estimates from part 3, and our counts where you pressed Fill.' : 'These graphs use your own estimates from part 3.';
  }
  $$('#k-choices button').forEach(b => b.addEventListener('click', () => { sp = b.dataset.sp; drawScatter(); }));
  document.addEventListener('themechange', () => { if ($('#k-chart').firstChild) { drawScatter(); drawKite(); } });
  function drawKite() {
    const S = series(true), svg = $('#kite'); svg.innerHTML = '';
    const X0 = 120, X1 = 480, row = 70, top = 30;
    const sx = d => X0 + d / 10 * (X1 - X0);
    ['barn', 'green', 'brown'].forEach((k, i) => {
      const yc = top + i * row + row / 2, p = SP.find(q => q.k === k);
      const col = getComputedStyle(document.documentElement).getPropertyValue(k === 'barn' ? '--barn' : k === 'green' ? '--green' : '--brown');
      el('text', { x: X0 - 10, y: yc + 4, 'text-anchor': 'end' }, svg, p.name);
      el('line', { class: 'ax', x1: X0, y1: yc, x2: X1, y2: yc }, svg);
      const up = S.map(s => `${sx(s.d)},${yc - s[k] / 100 * (row - 12) / 2}`), dn = S.slice().reverse().map(s => `${sx(s.d)},${yc + s[k] / 100 * (row - 12) / 2}`);
      el('polygon', { points: up.concat(dn).join(' '), fill: col, 'fill-opacity': .85, stroke: col }, svg);
    });
    const yb = top + 3 * row + 8;
    el('line', { class: 'ax', x1: X0, y1: yb, x2: X1, y2: yb }, svg);
    for (let d = 0; d <= 10; d++) { el('line', { class: 'ax', x1: sx(d), y1: yb, x2: sx(d), y2: yb + 5 }, svg); el('text', { x: sx(d), y: yb + 20, 'text-anchor': 'middle' }, svg, d); }
    el('text', { x: (X0 + X1) / 2, y: yb + 42, 'text-anchor': 'middle' }, svg, 'Distance from the top of the shore / m');
    el('line', { class: 'ax', x1: X1 + 22, y1: top + row / 2 - (row - 12) / 2, x2: X1 + 22, y2: top + row / 2 + (row - 12) / 2 }, svg);
    el('text', { x: X1 + 28, y: top + row / 2 + 4 }, svg, '100 %');
  }

  /* ---------------- quick checks ---------------- */
  // Options are shown in a fixed shuffled order, so the right answer is never always first.
  const shuffle = (a, seed) => { const b = a.slice(); let s = seed || 7; for (let i = b.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  // Multiple choice: a wrong choice says only "not this one"; the reason appears with the right answer (effort first).
  function mcq(d, it, seed) {
    const out = h('p', { 'aria-live': 'polite' });
    // the wrong options in a shuffled order, the right one at a position that changes from question to question
    const opts = shuffle(it.a.map((txt, i) => [txt, i]).filter(([, i]) => i !== it.c), seed);
    opts.splice((seed * 7 + 3) % it.a.length, 0, [it.a[it.c], it.c]);
    const bs = [];
    opts.forEach(([txt, i]) => {
      const b = h('button', { class: 'btn ghost', type: 'button' }, txt); bs.push(b);
      b.addEventListener('click', () => {
        b.classList.add(i === it.c ? 'chosen-right' : 'chosen-wrong');
        out.innerHTML = i === it.c ? '<span class="ok">✓ Correct.</span> ' + it.why : '<span class="bad">✗ Not this one.</span> Think again, then try another answer.';
      });
      d.appendChild(b);
    });
    d.appendChild(out);
    return () => { bs.forEach(b => b.classList.remove('chosen-right', 'chosen-wrong')); out.innerHTML = ''; };   // start again
  }
  const QUIZ = {
    q1: [{ q: 'Barnacle X lives only on the upper shore. When barnacle Y is removed from the middle shore, X extends down into the middle shore, but X never extends into the lower shore. Which conclusion is best supported?',
      a: ['The fundamental niche of X includes the middle shore; competition with Y restricts its realized niche to the upper shore.', 'The fundamental niche of X is the upper shore only.', 'X is absent from the lower shore because of desiccation.', 'The realized niche of X is larger than its fundamental niche.'], c: 0,
      why: 'X can live on the middle shore when Y is absent, so the middle shore is inside its fundamental niche. With Y present, X is restricted to the upper shore: its realized niche. Something else (another species, or an abiotic variable) excludes X from the lower shore, but it cannot be desiccation: the lower shore is the wettest part.' },
    { q: 'Along the transect, sea lettuce is absent from the top 2 m and from the bottom 3 m. Which pair of explanations is most consistent with B4.1.4 and B4.2.12?',
      a: ['Top: outside its range of tolerance for desiccation. Bottom: competition, for example with brown seaweed.', 'Top: competition with brown seaweed. Bottom: desiccation.', 'Both ends: grazing by limpets only.', 'Both ends: the rock temperature is outside its range of tolerance.'], c: 0,
      why: 'The upper limit of a species is usually set by an abiotic variable (drying out high on the shore); the lower limit is often set by biotic interactions, such as competition with the brown seaweed that covers the lower shore.' },
    { q: 'At low tide the rock on the upper shore reaches 34 °C. A seaweed survives rock temperatures from 5 °C to 30 °C. Which prediction is best supported?',
      a: ['Its upper limit on the shore is set by an abiotic variable: it can grow only where the rock stays below about 30 °C.', 'It would grow on the upper shore if there were no limpets there.', 'Its realized niche reaches higher on the shore than its fundamental niche.', 'It would survive at 34 °C if competitors were removed.'], c: 0,
      why: '34 °C is outside its range of tolerance, so removing competitors or grazers cannot make the upper shore part of its niche. A realized niche is never larger than the fundamental niche.' }],
    q2: [{ q: 'To save time, a student places quadrats only where seaweed is growing. What is the main effect on the estimate of mean seaweed cover for the area?',
      a: ['It is biased upwards: the quadrats are not a random sample of the area.', 'It is less precise, but not biased.', 'It cannot be calculated, because percentage cover needs a continuous belt transect.', 'It is unaffected, because every quadrat has 100 squares.'], c: 0,
      why: 'Choosing "interesting" spots is bias: bare rock is never sampled, so the mean cover is too high. Random positions give every point an equal chance.' },
    { q: 'A 20 m interrupted belt transect has a quadrat every 2 m, starting at 0 m, and each quadrat takes 3 minutes to record. How long does the recording take, and how many 0.5 m quadrats would a continuous belt transect of the same tape need?',
      a: ['33 minutes; 40 quadrats', '30 minutes; 40 quadrats', '33 minutes; 20 quadrats', '30 minutes; 20 quadrats'], c: 0,
      why: 'Quadrats at 0, 2, 4 … 20 m: 11 quadrats, 11 × 3 = 33 minutes (remember the one at 0 m). A continuous belt needs 20 ÷ 0.5 = 40 quadrats.' },
    { q: 'Why is percentage cover not a good way to estimate the population density of limpets?',
      a: ['Limpets are separate individuals that can be counted, and density is a number of individuals per unit area.', 'Limpets move too fast to be inside a quadrat.', 'Percentage cover can be used only on a continuous belt transect.', 'A limpet is smaller than one small square of the quadrat.'], c: 0,
      why: 'Cover measures area, not the number of individuals. Count the limpets and divide by the area sampled (per m²).' },
    { q: 'In a capture–mark–release–recapture study of shore crabs, which of these would make the Lincoln index estimate of the population too HIGH?',
      a: ['Some crabs lose their marks before the second sample.', 'Marked crabs are easier to catch than unmarked crabs.', 'The second sample is larger than the first.', 'No crabs are born or die between the two samples.'], c: 0,
      why: 'Population ≈ (number marked × number in the second sample) ÷ number marked in the second sample. Lost marks make the last number too small, so the estimate is too large. Marked crabs that are easier to catch make it too small.' }]
  };
  $$('.quiz').forEach(box => {
    const set = QUIZ[box.dataset.quiz]; if (!set) return;
    box.innerHTML = '<h3>Check yourself</h3>';
    const resets = set.map((it, n) => {
      const d = h('div', { class: 'box' }); d.innerHTML = `<p><b>${n + 1}.</b> ${it.q}</p>`;
      box.appendChild(d); return mcq(d, it, 11 + n * 7 + box.dataset.quiz.length);
    });
    const b = h('button', { class: 'btn ghost again', type: 'button' }, '↺ Start these questions again');
    b.addEventListener('click', () => resets.forEach(r => r())); box.appendChild(b);
  });

  /* ---------------- parts: one open at a time ---------------- */
  let currentPart = 1;
  function show(n, keepScroll) {
    currentPart = n;
    $$('.tabs button').forEach((b, i) => b.setAttribute('aria-selected', String(i + 1 === n)));
    $$('.part').forEach((p, i) => p.classList.toggle('open', i + 1 === n));
    const mode = $('#part-' + n).dataset.mode;
    document.body.classList.toggle('photo-on', $('#part-' + n).hasAttribute('data-pin'));
    stageH();
    if (mode === 'zones') drawZones($$('#zone-choices button').find(b => b.getAttribute('aria-pressed') === 'true').dataset.zone);
    else if (mode === 'method') drawMethod($$('#method-choices button').find(b => b.getAttribute('aria-pressed') === 'true').dataset.m);
    else if (mode === 'transect') drawTransect();
    else if (mode === 'random') drawArea(false);
    else { clear(); scaleBar(); }
    if (n === 5) renderChi();
    if (n === 6) { drawScatter(); drawKite(); }
    if (!keepScroll && window.innerWidth <= 1000) $('#part-' + n).scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#part-' + n); } catch (e) { }
    document.dispatchEvent(new CustomEvent('partshown', { detail: n }));
  }
  $$('.tabs button').forEach((b, i) => b.addEventListener('click', () => show(i + 1)));
  // Cards (details.fold) open in place, one at a time in a part (Daniel: explore, do not scroll a wall).
  // If closing a card above moves the open one off the screen, bring it back into view.
  document.addEventListener('toggle', e => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.classList.contains('fold') || !d.open) return;
    const part = d.closest('.part'); if (!part) return;
    $$('details.fold[open]', part).forEach(o => { if (o !== d && !o.contains(d) && !d.contains(o)) o.open = false; });
    const top = d.getBoundingClientRect().top, pin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stage-h')) || 0;
    if (top < pin) d.scrollIntoView({ block: 'start' });
  }, true);
  // a part's heading must not hide under the photograph pinned at the top of a narrow screen
  function stageH() { document.documentElement.style.setProperty('--stage-h', document.body.classList.contains('photo-on') ? $('.stage').offsetHeight + 'px' : '0px'); }
  window.addEventListener('resize', stageH);
  if (PHONE.addEventListener) PHONE.addEventListener('change', () => { const n = +((/#part-(\d+)/.exec(location.hash) || [0, 1])[1]); if ($('#part-' + n).dataset.mode === 'transect') drawTransect(); });
  $('#credits').innerHTML = D.credits.map(c => `${c.what}: ${c.who}, <a href="${c.url}" target="_blank" rel="noopener">${c.licence}</a>`).join(' · ');
  window.ShoreApp = { series, chi, pearson, ranks, fmt, store, h, mcq };
  tableT(); tableR();
  const m0 = /#part-(\d+)/.exec(location.hash);
  show(m0 ? +m0[1] : 1, true);
})();
