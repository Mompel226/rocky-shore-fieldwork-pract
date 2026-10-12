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
  /* Every answer survives a reload (12 Oct 2026, Daniel: "if I have answered the questions and then I reload the website,
     all of my answers are gone … it needs to survive a reload"). The lesson record (js/lesson.js) keeps only HOW each
     question went, for the teacher; this keeps WHAT the pupil typed or chose, by the question's board id, in this browser
     (rocky-shore.answers): words, numbers and written answers as they are typed, each Check's marks, each choice, an
     answer shown. A question is drawn again exactly as it was, and nothing is told to the lesson record again. ↺ Start
     again forgets its questions; ↺ Start the whole page again forgets them all (every rocky-shore.* key). */
  const ANS = store.get('answers', {});
  const ans = {
    get: id => (ANS[id] && typeof ANS[id] === 'object') ? ANS[id] : null,
    put: (id, o) => { if (!id) return; ANS[id] = Object.assign({}, ANS[id] || {}, o); store.set('answers', ANS); },
    drop: ids => { (ids || []).forEach(i => { delete ANS[i]; }); store.set('answers', ANS); }
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
    quadrat: 'Quadrat: a square frame of known area, for example 0.5 m × 0.5 m, often strung into 25 or 100 smaller squares. Organisms inside it are counted, or their percentage cover is estimated.',
    sessile: 'Sessile: fixed in one place, not able to move from place to place. Barnacles, mussels and seaweeds are sessile.',
    motile: 'Motile: able to move from place to place, for example crabs, fish and shrimps.',
    cover: 'Percentage cover: the percentage of the area of a quadrat covered by one species, seen from above. Count the small squares that are at least half covered, and multiply by the % of one square (4 % for 25 squares, 1 % for 100).',
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
    L.restartAll();   /* every question opens a new round; what was done stays in the teacher's record */
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
  /* zoom: a part of the photograph, enlarged with its drawing (the random area, 11 Oct 2026: Daniel, "don't be afraid of
     making the quadrat bigger"). The photograph is then drawn inside the drawing, so both enlarge together. */
  let zoomed = null;
  function clear(zoom) {
    while (ov.firstChild) ov.removeChild(ov.firstChild);
    zoomed = zoom || null;
    ov.setAttribute('viewBox', zoom ? zoom.join(' ') : '0 0 ' + PW + ' ' + PH);
    ov.classList.toggle('zoomed', !!zoom);
    if (zoom) el('image', { href: 'img/shore.jpg', x: 0, y: 0, width: PW, height: PH }, ov);
  }
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
    const x = zoomed ? zoomed[0] + 24 : 60, y = zoomed ? zoomed[1] + zoomed[3] - 26 : 1300;
    el('line', { class: 'scale', x1: x, y1: y, x2: x + M, y2: y }, ov);
    el('text', { class: 'lab-s', x: x + M + 12, y: y + 9 }, ov, '1 m');
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

  /* Each method in the same order: what you do, then what you record, its strength and its weakness, each in its own
     box (11 Oct 2026, Daniel: "strength with one colour, weakness with another"). */
  const METHODS = {
    line: { name: 'Line transect', what: 'Lay a tape from the top of the shore to the water\'s edge. At regular points along it (here every 1 m), record every species that touches the tape.',
      rec: 'which species are present at each point', pro: 'quick, and it shows where along the gradient each species starts and stops',
      con: 'a narrow line misses organisms between the points, and it gives no percentage cover or numbers' },
    cont: { name: 'Belt transect, continuous', what: 'Place <button class="term" data-t="quadrat">quadrats</button> side by side along the whole tape. A 10 m tape and 0.5 m quadrats give 10 ÷ 0.5 = 20 quadrats.',
      rec: 'the <button class="term" data-t="cover">percentage cover</button> or the number of each species in every quadrat', pro: 'the most complete record of the shore: nothing between the quadrats is missed',
      con: 'slow: the tide may come back before you finish, so the lower shore may not be sampled' },
    inter: { name: 'Belt transect, interrupted', what: 'Place a quadrat at regular intervals along the tape: here every 1 m, which gives 11 quadrats (0 m to 10 m).',
      rec: 'the percentage cover or the number of each species in every quadrat', pro: 'much faster than a continuous belt, and it still shows how each species changes along the gradient',
      con: 'it misses what lies between the quadrats, so a narrow band of one species can be missed', part: 3 },
    random: { name: 'Random quadrats', what: 'Choose positions with random numbers inside one area where conditions are about the same everywhere.',
      rec: 'the number, the percentage cover or the presence of each species in each quadrat', pro: 'no <button class="term" data-t="bias">bias</button> in where the quadrats go; the mean per quadrat estimates the <button class="term" data-t="density">density</button> of the whole area, and the <button class="term" data-t="sd">standard deviation</button> shows how much the quadrats differ (C4.1.3)',
      con: 'it does not show a change along a gradient, so it is used inside one zone only', part: 4 }
  };
  function methodHTML(x) {
    return `<p><b>${x.name}.</b> ${x.what}</p><div class="facts">` +
      `<div class="fact rec"><span class="fk">You record</span>${x.rec}</div>` +
      `<div class="fact pro"><span class="fk">Strength</span>${x.pro}</div>` +
      `<div class="fact con"><span class="fk">Weakness</span>${x.con}</div></div>` +
      (x.part ? `<p class="note">This is the method you use in part ${x.part}.</p>` : '');
  }
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
    $('#method-text').innerHTML = methodHTML(METHODS[m]);
    $$('#method-choices button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
  }
  $$('#method-choices button').forEach(b => b.addEventListener('click', () => drawMethod(b.dataset.m)));

  /* ---------------- part 3: the transect ---------------- */
  /* Percentage cover by pressing squares (12 Oct 2026, Daniel and his students: the photo close-ups could not be read, and
     a guess is not a measurement). Each quadrat is a diagram (tools/make-shore.py); the page lays a 10 × 10 grid over it,
     and each square at least half covered by a species is 1 %. Limpets are counted in the random quadrats (part 4). */
  const SP = [
    { k: 'barn', name: 'Barnacles', unit: '%', col: 'var(--barn)', hex: '#F5F5F0', ink: '#5B5446', note: 'with the seaweed lifted' },
    { k: 'green', name: 'Sea lettuce', unit: '%', col: 'var(--green)', hex: '#6BE34B', ink: '#23731A' },
    { k: 'brown', name: 'Brown seaweed', unit: '%', col: 'var(--brown)', hex: '#E0A030', ink: '#6E430A' }
  ];
  let mine = store.get('transect4', {});       // {d: {v: {barn, green, brown: the % cover typed}, tries, done, filled}}
  const tDone = d => !!(mine[d] && mine[d].done);
  const tVal = (d, k) => { const m = mine[d]; if (!m || !m.done) return ''; return m.filled ? ST.find(s => s.d === d)[k] : m.v[k]; };
  function drawTransect(sel) {
    clear(); scaleBar(); tape();
    ST.forEach(s => {
      const done = tDone(s.d);
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
      const done = tDone(s.d);
      const b = h('button', { type: 'button', class: done ? 'done' : '', 'aria-label': 'Quadrat at ' + s.d + ' m' + (done ? ', recorded' : '') }, s.d + ' m');
      b.addEventListener('click', () => openQuad('t', s.d));
      $('#t-pick').appendChild(b);
    });
  }
  /* part 6: beside each quadrat its rock temperature and the value of the species chosen, so the scatter graph's points can
     be found on the shore; the square is shaded by that value */
  function drawCorr() {
    clear(); scaleBar(); tape();
    const S = series(true), p = SP.find(x => x.k === sp), max = 100;
    ST.forEach((s, i) => {
      const v = S[i][sp];
      el('rect', { class: 'q', x: TX(s), y: s.py - Q / 2, width: Q, height: Q, style: `fill:${p.hex};fill-opacity:${Math.min(1, v / max) * 0.9}` }, ov);
      el('text', { class: 'lab-s', x: s.px + 50, y: s.py + 12 }, ov, `${fmt(s.temp, 1)} °C · ${v} %`);
    });
    el('text', { class: 'lab', x: TX(ST[10]) - 20, y: ST[10].py - 70, 'text-anchor': 'middle' }, ov, p.name);
  }
  /* part 7: the three zones beside the transect, for describing the kite diagram */
  function drawWrite() {
    clear(); scaleBar(); tape();
    ST.forEach(s => el('rect', { class: 'q', x: TX(s), y: s.py - Q / 2, width: Q, height: Q }, ov));
    [[1117, 'Upper shore', 1240], [597, 'Middle shore', 870], [222, 'Lower shore', 420]].forEach(([y, name, ly]) => {
      el('line', { class: 'zline', x1: 0, y1: y, x2: PW, y2: y }, ov);
      label(1180, ly, name, 'middle');
    });
    /* every 2 m, so the distances of the kite diagram can be found on the shore */
    ST.forEach(s => {
      if (s.d % 2) return;
      if (s.d === 0 || s.d === 10) label(s.px + 60, s.py + 14, s.d + ' m');
      else el('text', { class: 'lab-s', x: s.px + 60, y: s.py + 12 }, ov, s.d + ' m');
    });
  }
  function tableT() {
    const t = $('#t-table');
    let html = '<thead><tr><th>Distance<br>/ m</th><th>Rock temperature<br>/ °C</th>' + SP.map(p => `<th><span class="sw" style="background:${p.col}"></span>${p.name}<br>/ %</th>`).join('') + '</tr></thead><tbody>';
    ST.forEach(s => {
      html += `<tr><td>${s.d}</td><td>${fmt(s.temp, 1)}</td>` + SP.map(p => { const v = tVal(s.d, p.k); return v === '' ? '<td class="miss">—</td>' : `<td>${v}</td>`; }).join('') + '</tr>';
    });
    t.innerHTML = html + '</tbody>';
  }
  /* each row: distance, temperature, then each species' cover: the pupil's own where recorded, else ours (useKey) */
  function rowsT(useKey) {
    return ST.map(s => [s.d, s.temp].concat(SP.map(p => { const v = tVal(s.d, p.k); return v === '' ? (useKey ? s[p.k] : '') : v; })));
  }
  const HEAD_T = ['distance_m', 'temperature_C', 'barnacles_pct', 'sea_lettuce_pct', 'brown_seaweed_pct'];
  const HEAD_T_SHEETS = ['Distance / m', 'Rock temperature / °C', 'Barnacles / %', 'Sea lettuce / %', 'Brown seaweed / %'];
  function download(name, text) {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  /* Copy and Download give exactly the numbers parts 6 and 7 use (yours, and ours in a quadrat you have not recorded),
     so r in Google Sheets is the r on this page. Before 12 Oct 2026 they left those cells empty: CORREL then used only the
     quadrats a pupil had done, and one pupil's r had the opposite sign to the page's. */
  const missingT = () => ST.filter(s => !tDone(s.d)).length;
  $('#t-copy').addEventListener('click', async () => {
    const txt = [HEAD_T_SHEETS].concat(rowsT(true)).map(r => r.join('\t')).join('\n'), n = missingT();
    const said = n ? ` ${n} quadrat${n > 1 ? 's' : ''} you have not recorded use${n > 1 ? '' : 's'} our counts, as in part 6.` : '';
    try { await navigator.clipboard.writeText(txt); $('#t-msg').textContent = 'Copied. In Google Sheets, click cell A1 and paste.' + said; }
    catch (e) { $('#t-msg').textContent = 'Your browser blocked copying. Use Download as CSV, then File ▸ Import in Google Sheets.'; }
  });
  $('#t-csv').addEventListener('click', () => download('transect.csv', [HEAD_T].concat(rowsT(true)).map(r => r.join(',')).join('\n')));
  $('#t-fill').addEventListener('click', () => {
    ST.forEach(s => { if (!tDone(s.d)) { mine[s.d] = { v: (mine[s.d] || {}).v || {}, done: true, filled: true }; store.set('tfilled', true); } });
    store.set('transect4', mine); tableT(); drawTransect(); $('#t-msg').textContent = 'The empty rows now hold our counts. Your own quadrats are unchanged.';
  });
  $('#t-clear').addEventListener('click', () => { if (!confirm('Delete all your transect records?')) return; L.restart(ST.map(s => 'p3-c' + s.d)); mine = {}; store.set('transect4', mine); store.set('tfilled', false); tableT(); drawTransect(); });

  /* ---------------- part 4: random quadrats ---------------- */
  const A = D.area, AX = A.x0 * PW, AY = A.y0 * PH, CELL = 50;
  const RQ = D.random.filter(r => !r.skip);
  let rmine = store.get('random3', {});        // {q: {marks: [the animals pressed, in order], green: 'yes'|'no', done, filled}}
  const rDone = q => !!(rmine[q] && rmine[q].done);
  const rLimp = r => rmine[r.q].filled ? r.limp : rmine[r.q].marks.length;              /* the limpets the pupil counted */
  const rGreen = r => rmine[r.q].filled ? (r.green > 0 ? 'yes' : 'no') : rmine[r.q].green;
  let rnext = store.get('rnext', 0);
  const ZOOM = [AX - 140, AY - 52, 760, 641];          /* the 5 m × 5 m area with its labels, about twice as large */
  const POOLQ = D.random.filter(r => r.skip);           /* the square skipped because it is mostly a rock pool */
  function poolMark(i, j) { if (POOLQ.some(r => r.gx === i && r.gy === j)) el('text', { class: 'lab-pool', x: AX + i * CELL + CELL / 2, y: AY + j * CELL + CELL / 2 + 1 }, ov, 'pool'); }
  function areaFrame() {
    el('rect', { class: 'area', x: AX, y: AY, width: 10 * CELL, height: 10 * CELL }, ov);
    label(AX, AY - 18, '5 m × 5 m');
    for (let i = 0; i < 10; i++) el('text', { class: 'lab-xs', x: AX + i * CELL + 25, y: AY + 10 * CELL + 30, 'text-anchor': 'middle' }, ov, i);
    for (let j = 0; j < 10; j++) el('text', { class: 'lab-xs', x: AX - 12, y: AY + j * CELL + 33, 'text-anchor': 'end' }, ov, j);
    el('text', { class: 'lab-s', x: AX + 5 * CELL, y: AY + 10 * CELL + (zoomed ? 58 : 70), 'text-anchor': 'middle' }, ov, 'across →');
    el('text', { class: 'lab-s', x: AX - 46, y: AY + 5 * CELL + 12, 'text-anchor': 'end' }, ov, 'down ↓');
  }
  function drawArea(methodView) {
    clear(methodView ? null : ZOOM); scaleBar();
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const r = RQ.find(q => q.gx === i && q.gy === j);
      const cls = 'cell' + (methodView ? (r ? ' pick' : '') : r && rDone(r.q) ? ' seen' : r && RQ.indexOf(r) === rnext - 1 ? ' pick' : '');
      const c = el('rect', { class: cls, x: AX + i * CELL, y: AY + j * CELL, width: CELL, height: CELL }, ov);
      if (!methodView && r && (rDone(r.q) || RQ.indexOf(r) < rnext)) { c.style.cursor = 'pointer'; c.addEventListener('click', () => openQuad('r', r.q)); }
    }
    areaFrame();
  }
  /* part 5: every quadrat of part 4 in its group, in the colours of the tables (11 Oct 2026, Daniel: "use the image on the
     left to visualize the results … link the theory and the practice") */
  const CAT = { yy: { c: '#8B5CF6', l: 'L+S', w: 'limpets and sea lettuce' }, yn: { c: '#F97316', l: 'L', w: 'limpets only' },
                ny: { c: '#22C55E', l: 'S', w: 'sea lettuce only' }, nn: { c: '#E5E7EB', l: '–', w: 'neither' } };
  function catOf(r) {
    const m = rDone(r.q), L = m ? rLimp(r) > 0 : r.limp > 0, G = m ? rGreen(r) === 'yes' : r.green > 0;
    return (L ? 'y' : 'n') + (G ? 'y' : 'n');
  }
  function drawChiArea() {
    clear(ZOOM); scaleBar();
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const r = RQ.find(q => q.gx === i && q.gy === j), x = AX + i * CELL, y = AY + j * CELL;
      if (!r) { el('rect', { class: 'cell', x, y, width: CELL, height: CELL }, ov); poolMark(i, j); continue; }
      const k = CAT[catOf(r)];
      el('rect', { class: 'catcell', x: x + 2, y: y + 2, width: CELL - 4, height: CELL - 4, fill: k.c, stroke: k.c }, ov);
      el('text', { class: 'lab-cat' + (k === CAT.nn ? ' dark' : ''), x: x + CELL / 2, y: y + CELL / 2 + 1 }, ov, k.l);
    }
    areaFrame();
  }
  /* part 8: the limpets counted in each quadrat (the numbers of the challenge) */
  function drawCounts() {
    clear(ZOOM); scaleBar();
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const r = RQ.find(q => q.gx === i && q.gy === j), x = AX + i * CELL, y = AY + j * CELL;
      el('rect', { class: r ? 'cntcell' + (r.limp ? ' some' : '') : 'cell', x: x + (r ? 2 : 0), y: y + (r ? 2 : 0), width: CELL - (r ? 4 : 0), height: CELL - (r ? 4 : 0) }, ov);
      if (r) el('text', { class: 'lab-cnt' + (r.limp ? '' : ' zero'), x: x + CELL / 2, y: y + CELL / 2 + 1 }, ov, r.limp);
      else poolMark(i, j);
    }
    areaFrame();
  }
  function counts(useKey) {
    const o = { yy: 0, yn: 0, ny: 0, nn: 0, n: 0 };
    RQ.forEach(r => {
      let L, G;
      if (rDone(r.q)) { L = rLimp(r) > 0; G = rGreen(r) === 'yes'; }
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
    let html = '<thead><tr><th>Quadrat</th><th>Across</th><th>Down</th><th>Limpets<br>/ number</th><th>Limpets</th><th>Sea lettuce</th></tr></thead><tbody>';
    RQ.forEach(r => { if (rDone(r.q)) { const n = rLimp(r); html += `<tr><td>${r.q}</td><td>${r.gx}</td><td>${r.gy}</td><td>${n}</td><td>${n > 0 ? 'present' : 'absent'}</td><td>${rGreen(r) === 'yes' ? 'present' : 'absent'}</td></tr>`; } });
    $('#r-table').innerHTML = html + '</tbody>';
    $('#r-status').textContent = c.n === 30 ? 'All 30 quadrats are recorded. Go on to part 5.' : `${c.n} of 30 quadrats recorded.`;
    $('#r-next').disabled = rnext >= RQ.length;
    progressSoon();
  }
  $('#r-next').addEventListener('click', () => {
    if (rnext >= RQ.length) return;
    const r = RQ[rnext]; rnext++; store.set('rnext', rnext); drawArea(false); tableR();
    openQuad('r', r.q);
  });
  $('#r-fill').addEventListener('click', () => {
    RQ.forEach(r => { if (!rDone(r.q)) { rmine[r.q] = { marks: [], green: '', done: true, filled: true }; store.set('rfilled', true); } });
    rnext = RQ.length; store.set('random3', rmine); store.set('rnext', rnext); drawArea(false); tableR();
  });
  $('#r-clear').addEventListener('click', () => { if (!confirm('Delete all your random-quadrat records?')) return; L.restart(RQ.map(r => 'p4-n' + r.q)); rmine = {}; rnext = 0; store.set('random3', rmine); store.set('rnext', 0); store.set('rfilled', false); drawArea(false); tableR(); });
  $('#r-csv').addEventListener('click', () => {
    const rows = RQ.map(r => { const n = rDone(r.q) ? rLimp(r) : r.limp, g = rDone(r.q) ? rGreen(r) : (r.green > 0 ? 'yes' : 'no');
      return [r.q, r.gx, r.gy, n, n > 0 ? 'present' : 'absent', g === 'yes' ? 'present' : 'absent']; });
    download('random-quadrats.csv', [['quadrat', 'across', 'down', 'limpets_n', 'limpets', 'sea_lettuce']].concat(rows).map(r => r.join(',')).join('\n'));
  });

  /* ---------------- the quadrat window ----------------
     Each quadrat is a diagram (img/quad/*.svg, tools/make-shore.py), put into the page so that the page can draw on it.
     Transect (12 Oct 2026, Daniel: the students "were trying all of the different values", then "clicking blindly … it
     doesn't really provide any learning"): the quadrat is strung 5 × 5, as many school quadrats are, so each square is
     4 %; every square is drawn clearly covered (at least 70 %) or clearly not (at most 30 %). A pupil counts the squares
     at least half covered by each species and types the % cover (squares × 4). After the second wrong Check, our count
     and "Show our squares" appear, so trying every value does not pay. Random quadrat: the pupil presses each limpet as it is counted (a periwinkle is not a
     limpet; a limpet on the frame counts only if more than half of it is inside), and says whether sea lettuce is there. */
  const dlg = $('#quad'), QD = D.quad, SVGS = {};                /* NS: the SVG namespace, defined above */
  const VQ = (($('script[src*="js/app.js"]') || {}).src || '').split('v=')[1] || '1';
  let cur = null, lifted = false, active = 'barn', showKey = false;
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  async function quadSvg(name) {
    if (!SVGS[name]) SVGS[name] = await fetch(`img/quad/${name}.svg?v=${VQ}`).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
    return SVGS[name];
  }
  /* the key beside every quadrat: each thing drawn, its name, and what to do with it here */
  function legend(kind) {
    const it = (pic, name, what) => `<li><svg viewBox="0 0 60 60" aria-hidden="true">${pic}</svg><span><b>${name}</b>${what}</span></li>`;
    const rock = '<rect width="60" height="60" rx="8" fill="#CBC4B5"/>';
    const barn = rock + '<rect x="6" y="6" width="48" height="48" rx="12" fill="#E9E3D5" stroke="#A9A08C" stroke-width="1.5"/>' +
      [[19, 19], [41, 19], [30, 30], [19, 41], [41, 41]].map(([x, y]) => `<use href="#q-b" transform="translate(${x} ${y}) scale(.6)"/>`).join('');
    const green = rock + '<path d="M8,30 C8,12 26,6 38,10 C54,14 56,32 48,44 C40,56 18,54 10,44 Z" fill="#7FBF4A" stroke="#356F1E" stroke-width="2"/>';
    const brown = rock + '<path d="M8,30 C8,12 26,6 38,10 C54,14 56,32 48,44 C40,56 18,54 10,44 Z" fill="#A07F3A" stroke="#5A4413" stroke-width="2"/><path d="M20,40 L30,26 L24,16 M30,26 L40,18 M34,44 L40,32 L48,30" fill="none" stroke="#6B5219" stroke-width="2"/>';
    const limpet = rock + '<use href="#q-limpet" x="7" y="10" width="46" height="40"/>';
    const snail = rock + '<use href="#q-snail" x="14" y="14" width="32" height="32"/>';
    const pool = rock + '<path d="M8,30 C8,14 24,8 36,10 C52,13 54,30 48,42 C40,54 16,54 10,42 Z" fill="#9CC2D6" stroke="#557F98" stroke-width="2"/>';
    const frame = '<rect width="60" height="60" rx="8" fill="#CBC4B5"/><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FBFBF8" stroke-width="6"/><rect x="5" y="5" width="50" height="50" fill="none" stroke="#8F8C83" stroke-width="1"/>';
    const items = kind === 't'
      ? [it(barn, 'Barnacles', 'a crowd of small plated cones: estimate their cover'), it(green, 'Sea lettuce', 'thin green sheets: estimate their cover'),
         it(brown, 'Brown seaweed', 'olive fronds with air bladders: estimate their cover'), it(frame, 'The quadrat', 'the white frame, 0.5 m × 0.5 m inside')]
      : [it(limpet, 'Limpet', 'a ribbed cone, no coil: count each one'), it(snail, 'Periwinkle', 'a snail with a coiled shell: not a limpet'),
         it(green, 'Sea lettuce', 'present or absent?'), it(barn, 'Barnacles', 'not recorded here'), it(pool, 'Rock pool', 'water: nothing to record')];
    return `<p class="qkey__h">Key</p><ul class="qkey">${items.join('')}</ul>`;
  }
  const GQ = QD.grid, SQ = QD.inside / GQ;                    /* 5 squares across, 200 drawing units each */
  function paintGrid() {
    const svg = $('#quad-pic svg'); if (!svg || !cur || cur.kind !== 't') return;
    const s = ST.find(x => x.d === cur.id), g = $('.qkeysq', svg); g.innerHTML = '';
    if (showKey) { const p = SP.find(q => q.k === active);
      s.sq[active].split('').forEach((c, i) => { if (c === '1') svgEl('rect', { x: QD.frame + (i % GQ) * SQ + 8, y: QD.frame + Math.floor(i / GQ) * SQ + 8, width: SQ - 16, height: SQ - 16, fill: p.ink, 'fill-opacity': .28, class: 'qkeyr' }, g); }); }
    $$('#quad-msg .qsp button').forEach(b => b.setAttribute('aria-pressed', String(showKey && b.dataset.k === active)));
  }
  function paintAnimals() {
    const pic = $('#quad-pic'), svg = $('svg', pic); if (!svg || !cur || cur.kind !== 'r') return;
    const r = RQ.find(x => x.q === cur.id), m = rmine[cur.id], g = $('.qmarks', svg); g.innerHTML = '';
    m.marks.forEach((j, n) => { const [x, y] = r.an[j]; svgEl('circle', { cx: x, cy: y - 46, r: 19, class: 'qbadge' }, g); svgEl('text', { x, y: y - 45, class: 'qbadge-t' }, g).textContent = n + 1; });
    if (showKey) r.an.forEach(([x, y, k, c]) => { if (k === 'L' && c) svgEl('circle', { cx: x, cy: y, r: 52, class: 'qring' }, g); });
    $('#q-n').textContent = m.marks.length;
    $$('#quad-form .qgreen button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === m.green)));
  }
  async function openQuad(kind, id) {
    cur = { kind, id }; lifted = false; showKey = false;
    const own = () => { if (rmine[id].filled) rmine[id] = { marks: [], green: '' }; };   /* a filled random quadrat becomes the pupil's own on first touch */
    const pic = $('#quad-pic'), form = $('#quad-form'); form.innerHTML = ''; $('#quad-msg').innerHTML = ''; pic.innerHTML = '';
    $('#quad-lift').setAttribute('aria-pressed', 'false'); $('#quad-lift').textContent = 'Lift the seaweed';
    $('#quad-key').innerHTML = '';
    const strip = $('#quad-strip'); strip.innerHTML = '';
    if (kind === 't') {
      ST.forEach(x => { const b = h('button', { type: 'button', class: (x.d === id ? 'cur' : '') + (tDone(x.d) ? ' done' : ''), 'aria-label': 'Quadrat at ' + x.d + ' m' + (tDone(x.d) ? ', recorded' : '') }, x.d);
        b.addEventListener('click', () => openQuad('t', x.d)); strip.appendChild(b); });
      strip.appendChild(h('span', { class: 'note' }, 'm along the tape'));
    } else strip.appendChild(h('span', { class: 'note' }, `Recorded so far: ${RQ.filter(r => rDone(r.q)).length} of 30`));
    if (kind === 't') {
      const s = ST.find(x => x.d === id);
      mine[id] = mine[id] || { v: {} }; mine[id].v = mine[id].v || {};
      $('#quad-title').textContent = `Quadrat at ${id} m`;
      $('#quad-sub').innerHTML = `Rock temperature from the probe: <b>${fmt(s.temp, 1)} °C</b>.`;
      $('#quad-how').innerHTML = 'The quadrat is strung into <b>25 squares</b>, so each square is <b>4 %</b>. For each species, count the squares that are <u>at least half covered</u> by it, then type its percentage cover: squares × 4.';
      $('#quad-lift').style.display = s.lifted ? '' : 'none';
      $('#quad-tag').textContent = `${id} m`;
      const m = mine[id];
      SP.forEach(p => {
        const row = h('div', { class: 'row' });
        row.innerHTML = `<label for="f-${p.k}"><span class="sw" style="background:${p.col}"></span>${p.name}${p.note ? ' <span class="note">(' + p.note + ')</span>' : ''}</label>
          <input id="f-${p.k}" type="number" inputmode="numeric" min="0" max="100" step="4" value="${m.filled || m.v[p.k] == null ? '' : m.v[p.k]}" aria-label="${p.name}: percentage cover"><span class="key">%</span>`;
        form.appendChild(row);
      });
      form.addEventListener('input', () => { const mm = mine[id]; if (mm.filled) { mm.filled = false; mm.done = false; } SP.forEach(p => { const v = $('#f-' + p.k).value; mm.v[p.k] = v === '' ? null : Number(v); }); store.set('transect4', mine); });
      if (s.lifted) form.appendChild(h('p', { class: 'note' }, 'Barnacles also grow under the seaweed: press <b>Lift the seaweed</b> to count their squares.'));
      if (!PHONE.matches) setTimeout(() => { const f = $('#f-barn'); if (f && cur && cur.id === id) f.focus({ preventScroll: true }); }, 60);
    } else {
      const r = RQ.find(x => x.q === id);
      rmine[id] = rmine[id] || { marks: [], green: '' };
      $('#quad-title').textContent = `Random quadrat ${id}`;
      $('#quad-sub').innerHTML = `Position: across <b>${r.gx}</b>, down <b>${r.gy}</b>.`;
      $('#quad-how').innerHTML = 'Press each <u>limpet</u> as you count it (press it again to undo). A limpet on the frame counts only if <u>more than half</u> of it is inside. Then say whether sea lettuce is in the quadrat.';
      $('#quad-lift').style.display = 'none';
      $('#quad-tag').textContent = `across ${r.gx}, down ${r.gy}`;
      form.appendChild(h('p', { class: 'qcount' }, 'Limpets counted: <b id="q-n">0</b>'));
      const gr = h('div', { class: 'qgreen', role: 'group', 'aria-label': 'Sea lettuce' }, '<span>Sea lettuce:</span>');
      [['yes', 'present'], ['no', 'absent']].forEach(([v, w]) => { const b = h('button', { type: 'button', 'data-v': v, 'aria-pressed': 'false' }, w);
        b.addEventListener('click', () => { own(); rmine[id].green = v; store.set('random3', rmine); paintAnimals(); }); gr.appendChild(b); });
      form.appendChild(gr);
    }
    $('#quad-nextq').textContent = kind === 't' ? 'Next quadrat' : 'Next random quadrat';
    if (!dlg.open) dlg.showModal();
    let text;
    try { text = await quadSvg((kind === 't' ? 't' : 'r') + String(id).padStart(2, '0')); }
    catch (e) { pic.innerHTML = '<p class="bad">The drawing did not load. Close this window and open the quadrat again.</p>'; return; }
    if (!cur || cur.kind !== kind || cur.id !== id) return;                 /* another quadrat was opened meanwhile */
    pic.innerHTML = text;
    $('#quad-key').innerHTML = legend(kind);                                /* after the drawing: the key uses its symbols */
    const svg = $('svg', pic);
    if (kind === 't') {
      svgEl('g', { class: 'qkeysq' }, svg);
      const g = svgEl('g', { class: 'qstrings', 'aria-hidden': 'true' }, svg);       /* the strings of the quadrat: 5 × 5 */
      for (let i = 1; i < GQ; i++) {
        svgEl('line', { x1: QD.frame + i * SQ, y1: QD.frame, x2: QD.frame + i * SQ, y2: QD.frame + QD.inside }, g);
        svgEl('line', { x1: QD.frame, y1: QD.frame + i * SQ, x2: QD.frame + QD.inside, y2: QD.frame + i * SQ }, g);
      }
    } else {
      const r = RQ.find(x => x.q === id), g = svgEl('g', { class: 'qan' }, svg);
      r.an.forEach(([x, y], j) => svgEl('circle', { cx: x, cy: y, r: 48, 'data-j': j, class: 'qhit', tabindex: 0, role: 'button', 'aria-label': `Animal ${j + 1}: press to count it as a limpet, or to undo` }, g));
      g.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('data-j') != null) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
      svgEl('g', { class: 'qmarks' }, svg);
      g.addEventListener('click', e => {
        const j = e.target.getAttribute && e.target.getAttribute('data-j'); if (j == null) return;
        own(); const a = rmine[id].marks, n = a.indexOf(+j);
        if (n >= 0) a.splice(n, 1); else a.push(+j);
        store.set('random3', rmine); paintAnimals();
      });
      paintAnimals();
    }
  }
  $('#quad-lift').addEventListener('click', () => {
    lifted = !lifted; const svg = $('#quad-pic svg'); if (svg) svg.classList.toggle('lifted', lifted);
    $('#quad-lift').setAttribute('aria-pressed', String(lifted));
    $('#quad-lift').textContent = lifted ? 'Put the seaweed back' : 'Lift the seaweed';
    $('#quad-tag').textContent = `${cur.id} m${lifted ? ' · seaweed lifted' : ''}`;
  });
  function keyButton(label) {
    const b = h('button', { type: 'button', class: 'linkish' }, label);
    b.addEventListener('click', () => { showKey = !showKey; b.textContent = showKey ? 'Hide ours' : label; cur.kind === 't' ? paintGrid() : paintAnimals(); });
    return b;
  }
  $('#quad-check').addEventListener('click', () => {
    const msg = $('#quad-msg');
    if (cur.kind === 't') {
      const s = ST.find(x => x.d === cur.id), m = mine[cur.id];
      const vals = SP.map(p => { const v = $('#f-' + p.k).value.trim(); return v === '' ? null : Number(v); });
      if (vals.some(v => v == null || isNaN(v))) { msg.textContent = 'Type a percentage cover for each species first: 0 if it is not in the quadrat.'; return; }
      SP.forEach((p, i) => { m.v[p.k] = vals[i]; });
      m.tries = (m.tries || 0) + 1; m.done = true; m.filled = false; store.set('transect4', mine);
      const res = SP.map((p, i) => ({ p, v: vals[i], ok: vals[i] === s[p.k] })), all = res.every(x => x.ok), shown = all || m.tries >= 2;
      L.check('p3-c' + cur.id, all, res.filter(x => !x.ok).map(x => x.p.name + ': ' + x.v));
      const why = x => x.v * 4 === s[x.p.k] && x.v !== s[x.p.k] ? ' That is the number of squares: each square is 4 %.' : x.v % 4 ? ' Each square is 4 %, so the cover is a multiple of 4.' : '';
      msg.innerHTML = res.map(x => `<span class="${x.ok ? 'ok' : 'bad'}">${x.ok ? '✓' : '✗'}</span> ${x.p.name}: you ${x.v} %` +
        (x.ok ? '' : shown ? `, our count ${s[x.p.k]} % (${s[x.p.k] / 4} squares).` : '. Count again.' + why(x))).join('<br>') +
        (shown ? '<br><span class="note">Show our squares for:</span>' : '<br><span class="note">Count the squares at least half covered, species by species. Our count shows after your second try.</span>');
      if (shown) {
        const bar = h('div', { class: 'qsp', role: 'group', 'aria-label': 'Show our squares' });
        SP.forEach(p => { const b = h('button', { type: 'button', 'data-k': p.k, 'aria-pressed': 'false' }, `<span class="sw" style="background:${p.col}"></span>${p.name}`);
          b.addEventListener('click', () => { showKey = !(showKey && active === p.k); active = p.k; paintGrid(); }); bar.appendChild(b); });
        msg.appendChild(bar);
      }
      const sb = $$('#quad-strip button')[cur.id]; if (sb) sb.classList.add('done');
      tableT(); drawTransect(cur.id);
    } else {
      const r = RQ.find(x => x.q === cur.id), m = rmine[cur.id];
      if (!m.green) { msg.textContent = 'Say whether sea lettuce is present or absent first.'; return; }
      m.done = true; store.set('random3', rmine);
      const right = m.marks.filter(j => r.an[j][2] === 'L' && r.an[j][3]).length, snails = m.marks.filter(j => r.an[j][2] === 'P').length;
      const edge = m.marks.filter(j => r.an[j][2] === 'L' && !r.an[j][3]).length, okL = right === r.limp && !snails && !edge;
      const okG = m.green === (r.green > 0 ? 'yes' : 'no');
      L.check('p4-n' + cur.id, okL && okG, [okL ? '' : 'limpets: ' + m.marks.length, okG ? '' : 'sea lettuce: ' + (m.green === 'yes' ? 'present' : 'absent')].filter(Boolean));
      const why = [];
      if (snails) why.push(`You pressed ${snails > 1 ? snails + ' periwinkles' : 'a periwinkle'}: a snail with a coiled shell. A limpet is a cone with ridges and no coil.`);
      if (edge) why.push('You counted a limpet that is less than half inside the frame.');
      if (!snails && !edge && right < r.limp) why.push(`Look again: you have not pressed every limpet.`);
      msg.innerHTML = `<span class="${okL ? 'ok' : 'bad'}">${okL ? '✓' : '✗'}</span> Limpets: you counted ${m.marks.length}, our count ${r.limp}<br>` +
        `<span class="${okG ? 'ok' : 'bad'}">${okG ? '✓' : '✗'}</span> Sea lettuce: ${r.green > 0 ? 'present' : 'absent'}` +
        (why.length ? '<br><span class="note">' + why.join(' ') + '</span>' : '') + '<br>';
      if (!okL) msg.appendChild(keyButton('Show the limpets we counted'));
      drawArea(false); tableR();
    }
  });
  $('#quad-nextq').addEventListener('click', () => {
    if (cur.kind === 't') openQuad('t', (cur.id + 1) % 11);
    else if (rnext < RQ.length) { const r = RQ[rnext]; rnext++; store.set('rnext', rnext); drawArea(false); tableR(); openQuad('r', r.q); }
    else dlg.close();
  });
  $('#quad-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('#quad-form input')) { e.preventDefault(); $('#quad-check').click(); } });
  dlg.addEventListener('close', () => { if (!dlg.open) cur = null; show(currentPart, true); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  /* ---------------- part 5: chi-squared, step by step ---------------- */
  const CSTEPS = ['Question', 'Hypotheses', 'Observed', 'Expected', 'χ²', 'Critical value', 'Conclusion', 'Biology', 'Google Sheets'];
  let cstep = Math.max(0, Math.min(CSTEPS.length - 1, Number(store.get('cstep', 0)) || 0));   /* the step survives a reload */
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
  function tbl(rows, head, cats) {
    return '<div class="tablewrap"><table class="data"><thead><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map((r, ri) => '<tr>' + r.map((x, i) => i === 0 ? `<th>${x}</th>` : `<td${cats ? ` class="cat c-${cats[ri][i - 1]}"` : ''}>${x}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  const CATS = [['yy', 'yn'], ['ny', 'nn']];
  /* the steps whose quick check is done: their table shows (after a reload too: from the kept answers) */
  const qcDone = id => { const s = ans.get(id); return !!(s && (s.ok || s.shown)); };
  let chiGate = { 3: qcDone('p5-qc-1'), 4: qcDone('p5-qc-2'), 5: qcDone('p5-qc-3') };
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
      `<p>The observed counts (O): how many of the ${k.N} quadrats fell into each group. The photograph shows each quadrat in the colour of its group.</p>` + tbl([['Limpets present', O[0][0], O[0][1]], ['Limpets absent', O[1][0], O[1][1]]], head, CATS) + `<p class="note">Row totals: ${k.R[0]} and ${k.R[1]}. Column totals: ${k.C[0]} and ${k.C[1]}. Grand total: ${k.N}.</p>`,
      `<p>The expected counts (E) are the numbers you would get if the two species were independent.</p><div class="formula">E = row total × column total ÷ grand total</div><p>For example, limpets present and sea lettuce present: ${k.R[0]} × ${k.C[0]} ÷ ${k.N} = <b>${fmt(E[0][0], 2)}</b></p><div data-chiqc="3"></div>` +
        `<div class="gate"${chiGate[3] ? '' : ' hidden'}>` + tbl([['Limpets present', fmt(E[0][0], 2), fmt(E[0][1], 2)], ['Limpets absent', fmt(E[1][0], 2), fmt(E[1][1], 2)]], head, CATS) + `<p class="note">The test is valid only if every expected value is at least 5. ${Math.min(E[0][0], E[0][1], E[1][0], E[1][1]) >= 5 ? 'Here they all are.' : 'Here one is below 5: sample more quadrats.'}</p></div>`,
      `<div class="formula">χ² = Σ (O − E)² ÷ E</div><p>Calculate (O − E)² ÷ E for each of the four cells, then find their sum (Σ means "the sum of"). For example, limpets present and sea lettuce present: (${O[0][0]} − ${fmt(E[0][0], 2)})² ÷ ${fmt(E[0][0], 2)} = <b>${fmt(k.parts[0], 2)}</b></p><div data-chiqc="4"></div>` +
        `<div class="gate"${chiGate[4] ? '' : ' hidden'}>` + tbl([['Limpets present', fmt(k.parts[0], 2), fmt(k.parts[1], 2)], ['Limpets absent', fmt(k.parts[2], 2), fmt(k.parts[3], 2)]], head, CATS) + `<p>χ² = ${k.parts.map(x => fmt(x, 2)).join(' + ')} = <b>${fmt(k.X, 2)}</b></p></div>`,
      `<p><b>Degrees of freedom</b> = (number of rows − 1) × (number of columns − 1) = (2 − 1) × (2 − 1) = <b>1</b>.</p><div data-chiqc="5"></div><p>The <button class="term" data-t="critical">critical value</button> of χ² for 1 degree of freedom at p = 0.05 is <b>3.84</b>.</p>` + tbl([['1 degree of freedom', '2.71', '3.84', '6.63']], ['p', '0.10', '0.05', '0.01']) + `<p>Compare: our χ² = ${fmt(k.X, 2)} is ${big ? '<b>larger</b>' : '<b>smaller</b>'} than 3.84.</p>`,
      `<p>${big ? `χ² = ${fmt(k.X, 2)} is larger than the critical value 3.84, so <b>reject the null hypothesis</b>. There is a <button class="term" data-t="significant">significant</button> association between limpets and sea lettuce (p &lt; 0.05).` : `χ² = ${fmt(k.X, 2)} is smaller than the critical value 3.84, so <b>do not reject the null hypothesis</b>. There is no significant association (p &gt; 0.05).`}</p>` +
        (big ? `<p><b>Which direction?</b> Compare O with E. Limpets and sea lettuce together: observed ${O[0][0]}, expected ${fmt(E[0][0], 1)}. They were found together <u>${neg ? 'less' : 'more'} often</u> than expected: a <b>${neg ? 'negative' : 'positive'} association</b>.</p>` : '') +
        `<div class="box"><div class="k">Reading p</div><p>p = ${k.p < 0.001 ? 'less than 0.001' : fmt(k.p, 3)}. If the two species were really independent, chance alone would give a χ² this large ${k.p < 0.001 ? 'less than 1 time in 1,000' : k.p < 0.01 ? 'about ' + Math.round(k.p * 1000) + ' times in 1,000' : 'about ' + Math.round(k.p * 100) + ' times in 100'}. If p is below 0.05, the result is significant. <b>Small p, big news. Big p, no news.</b></p></div>`,
      `<p>The test shows an association. <u>It does not show the cause.</u> Possible explanations for a negative association:</p><ul><li><b>Grazing (herbivory):</b> limpets graze young seaweed, so the rock where limpets feed stays bare.</li><li><b>Different niches:</b> the two species need different conditions, for example sea lettuce where the rock stays wet, and limpets on rock that dries out.</li><li><b>Competition:</b> C4.1.15 notes that a χ² association can be evidence for interspecific competition between two species that need the same resource, such as space on the rock. In the strongest case, one species excludes the other: <button class="term" data-t="exclusion">competitive exclusion</button>.</li></ul><div class="box sea"><div class="k">How to test a cause</div><p>An experiment: fix small mesh cages that keep limpets out of some squares of rock, and leave other squares open. If sea lettuce cover becomes higher inside the cages, this supports grazing as a cause.</p></div>`,
      `<p>Do the same test in Google Sheets (or Excel), and check each answer against this page.</p>` +
        `<p><b>1. The observed counts.</b> In a new sheet, type the headings and the four counts (they are under the photograph):</p>` +
        `<div class="tablewrap"><table class="data sheetgrid"><thead><tr><th></th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>` +
        `<tr><th>1</th><td></td><td>Sea lettuce present</td><td>Sea lettuce absent</td></tr>` +
        `<tr><th>2</th><td class="l">Limpets present</td><td>${O[0][0]}</td><td>${O[0][1]}</td></tr>` +
        `<tr><th>3</th><td class="l">Limpets absent</td><td>${O[1][0]}</td><td>${O[1][1]}</td></tr></tbody></table></div>` +
        `<p><b>2. The expected counts.</b> Click <b>F2</b>, type this and press Enter:</p><div class="formula">=SUM($B2:$C2)*SUM(B$2:B$3)/SUM($B$2:$C$3)</div>` +
        `<p>Copy F2 (⌘C, or Ctrl+C) and paste it into <b>G2</b>, <b>F3</b> and <b>G3</b>. The $ signs keep each total in its place, so each cell uses its own row and column. F2 should show <b>${fmt(E[0][0], 2)}</b>.</p>` +
        `<p><b>3. χ²</b>, the same sum as in step 5. In <b>F5</b>:</p><div class="formula">=SUMPRODUCT((B2:C3-F2:G3)^2/F2:G3)</div><p>It should show <b>${fmt(k.X, 2)}</b>.</p>` +
        `<p><b>4. The p-value</b>, in <b>F6</b>:</p><div class="formula">=CHISQ.TEST(B2:C3, F2:G3)</div><p>It should show <b>${k.p < 0.001 ? 'a number below 0.001' : fmt(k.p, 4)}</b>.</p>` +
        `<p><b>5. The critical value</b> for p = 0.05 and 1 degree of freedom, in <b>F7</b>:</p><div class="formula">=CHISQ.INV.RT(0.05, 1)</div><p>It shows <b>3.84</b>. Compare F5 with F7, or F6 with 0.05.</p>` +
        `<p class="note">If a number differs from this page, check the cell names in the formula and that each count is in the right cell. Excel uses the same formulas.</p>`
    ];
    $('#c-body').innerHTML = B[cstep];
    /* the quick checks inside the steps: the student works out one value; the step's table then shows (or after two tries) */
    const CQ = {
      3: { id: 'p5-qc-1', part: 5, short: 'E', title: 'An expected value', kind: 'num', tol: 0.006, dp: 2, ans: () => E[1][1],
           q: `Now you: the expected value for limpets absent and sea lettuce absent. Give it to 2 decimal places.`,
           why: () => `${k.R[1]} × ${k.C[1]} ÷ ${k.N} = ${fmt(E[1][1], 2)}.` },
      4: { id: 'p5-qc-2', part: 5, short: 'χ²', title: 'One cell of χ²', kind: 'num', tol: 0.015, dp: 2, ans: () => k.parts[1],
           q: `Now you: (O − E)² ÷ E for limpets present and sea lettuce absent (O = ${O[0][1]}, E = ${fmt(E[0][1], 2)}). Give it to 2 decimal places.`,
           why: () => `(${O[0][1]} − ${fmt(E[0][1], 2)})² ÷ ${fmt(E[0][1], 2)} = ${fmt(k.parts[1], 2)}.` },
      5: { id: 'p5-qc-3', part: 5, short: 'df', title: 'Degrees of freedom of a 3 × 2 table', kind: 'num', tol: 0, ans: 2,
           q: 'Another student records whether one species is present or absent in quadrats in three zones of the shore. The table has 3 rows (the zones) and 2 columns (present, absent). How many degrees of freedom does it have?',
           why: '(3 − 1) × (2 − 1) = 2. The critical value at p = 0.05 is then 5.99.' }
    };
    const qb = $('[data-chiqc]', $('#c-body'));
    if (qb && CQ[cstep]) { const st = cstep; quick(qb, CQ[st], () => { chiGate[st] = true; const g = $('.gate', $('#c-body')); if (g) g.hidden = false; stageChi(k); }); }
    stageChi(k);
    $('#c-key').innerHTML = Object.keys(CAT).map(c => `<span class="catk"><i style="background:${CAT[c].c}"></i><b>${CAT[c].l}</b> ${CAT[c].w}: ${k.O[c[0] === 'y' ? 0 : 1][c[1] === 'y' ? 0 : 1]}</span>`).join('');
    $('#c-prev').disabled = cstep === 0; $('#c-next').disabled = cstep === CSTEPS.length - 1;
    store.set('cstep', cstep);
    progressSoon();
  }
  /* the tables under the photograph (12 Oct 2026, Daniel: "show the table with the data … so you don't have to go back
     and forth"): the observed counts always, the expected ones once their quick check is done */
  function stageChi(k) {
    const cell = (c, v) => `<td class="cat c-${c}">${v}</td>`, O = k.O, E = k.E;
    /* 12 Oct 2026, Daniel: the photo and the observed data should be seen together, with no scrolling: the two tables sit
       side by side (columns "SL present / absent" with a key line), and the photo shrinks to leave them room (css) */
    let t = `<div class="sd__b"><p class="sd__h">Observed (O): 30 random quadrats</p><div class="tablewrap"><table class="data"><thead><tr><th></th><th>SL present</th><th>SL absent</th><th>Total</th></tr></thead><tbody>` +
      `<tr><th>Limpets present</th>${cell('yy', O[0][0])}${cell('yn', O[0][1])}<td>${k.R[0]}</td></tr>` +
      `<tr><th>Limpets absent</th>${cell('ny', O[1][0])}${cell('nn', O[1][1])}<td>${k.R[1]}</td></tr>` +
      `<tr><th>Total</th><td>${k.C[0]}</td><td>${k.C[1]}</td><td>${k.N}</td></tr></tbody></table></div></div>`;
    if (chiGate[3]) t += `<div class="sd__b"><p class="sd__h">Expected (E)</p><div class="tablewrap"><table class="data"><thead><tr><th></th><th>SL present</th><th>SL absent</th></tr></thead><tbody>` +
      `<tr><th>Limpets present</th>${cell('yy', fmt(E[0][0], 2))}${cell('yn', fmt(E[0][1], 2))}</tr>` +
      `<tr><th>Limpets absent</th>${cell('ny', fmt(E[1][0], 2))}${cell('nn', fmt(E[1][1], 2))}</tr></tbody></table></div></div>`;
    t += '<p class="sd__k">SL = sea lettuce.</p>';
    $('#stageData').innerHTML = t;
    $('#stageData').classList.toggle('two', !!chiGate[3]);
  }
  $('#c-prev').addEventListener('click', () => { cstep = Math.max(0, cstep - 1); renderChi(); });
  $('#c-next').addEventListener('click', () => { cstep = Math.min(CSTEPS.length - 1, cstep + 1); renderChi(); });

  /* ---------------- part 6: correlation and the kite ---------------- */
  const CRIT = [[8, 0.707], [9, 0.666], [10, 0.632], [11, 0.602], [12, 0.576], [15, 0.514], [20, 0.444]];
  $('#crit-r').innerHTML = '<thead><tr><th>Number of quadrats</th>' + CRIT.map(c => `<th>${c[0]}</th>`).join('') + '</tr></thead><tbody><tr><th>Critical r</th>' + CRIT.map(c => `<td>${c[1].toFixed(3)}</td>`).join('') + '</tr></tbody>';
  let sp = 'barn';
  function series(useKey) {
    const rows = rowsT(true);
    return rows.map(r => ({ d: r[0], t: r[1], barn: r[2], green: r[3], brown: r[4] }));
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
    brown: k => `<p><b>Brown seaweed.</b> r = ${fmt(k.r, 2)}: a strong negative correlation, and ${Math.abs(k.r) > 0.602 ? 'significant' : 'not significant'} by the critical value. <u>But look at the graph</u>: the points do not follow a straight line. The cover is near 0 % over most of the shore, then rises steeply near the water.</p><div class="box amber"><div class="k">Always look at the scatter graph first</div><p>Pearson's r measures how close the points are to a <u>straight line</u>, so for a curve it can mislead. Spearman's rank correlation (beyond the guide) uses only the order of the values. Here ρ = ${fmt(k.rho, 2)}; its own critical value for 11 pairs is 0.618. ρ is weaker than r, partly because ${k.zeros} quadrats tie at 0 %.</p></div>`,
    green: k => `<p><b>Sea lettuce.</b> r = ${fmt(k.r, 2)}: ${Math.abs(k.r) > 0.602 ? 'significant' : 'weak, and <b>not significant</b>'}. Yet sea lettuce clearly lives in a zone: it is in the middle of the transect only.</p><div class="box sea"><div class="k">A hump: the realized niche</div><p>The cover is high at middle temperatures and low at both ends. Above, the rock is too hot and dry: an abiotic limit, set by its range of tolerance. Below, brown seaweed occupies the space: a biotic limit, as in Connell's barnacles (part 1). The hump shows its realized niche on this shore. A hump-shaped pattern can give r close to 0 even when the abiotic variable matters a lot: r measures only straight-line patterns.</p></div>`
  };
  function drawScatter() {
    const S = series(true), x = S.map(s => s.t), y = S.map(s => s[sp]);
    const k = pearson(x, y), svg = $('#k-chart'); svg.innerHTML = ''; k.rho = pearson(ranks(x), ranks(y)).r; k.zeros = y.filter(v => v === 0).length;
    const X0 = 62, X1 = 540, Y0 = 290, Y1 = 22, xmin = 22, xmax = 36;
    const ymax = 100;
    const sx = v => X0 + (v - xmin) / (xmax - xmin) * (X1 - X0), sy = v => Y0 - v / ymax * (Y0 - Y1);
    for (let v = xmin; v <= xmax; v += 2) { el('line', { class: 'gr', x1: sx(v), y1: Y0, x2: sx(v), y2: Y1 }, svg); el('text', { x: sx(v), y: Y0 + 18, 'text-anchor': 'middle' }, svg, v); }
    for (let v = 0; v <= ymax; v += ymax / 5) { el('line', { class: 'gr', x1: X0, y1: sy(v), x2: X1, y2: sy(v) }, svg); el('text', { x: X0 - 8, y: sy(v) + 4, 'text-anchor': 'end' }, svg, v); }
    el('line', { class: 'ax', x1: X0, y1: Y0, x2: X1, y2: Y0 }, svg); el('line', { class: 'ax', x1: X0, y1: Y0, x2: X0, y2: Y1 }, svg);
    el('text', { x: (X0 + X1) / 2, y: 330, 'text-anchor': 'middle' }, svg, 'Rock temperature / °C');
    const name = SP.find(p => p.k === sp);
    el('text', { x: 16, y: (Y0 + Y1) / 2, 'text-anchor': 'middle', transform: `rotate(-90 16 ${(Y0 + Y1) / 2})` }, svg, name.name + ' / % cover');
    const col = getComputedStyle(document.documentElement).getPropertyValue(sp === 'barn' ? '--barn' : sp === 'green' ? '--green' : '--brown');
    const lo = Math.min(...x), hi = Math.max(...x);
    el('line', { class: 'fit', x1: sx(lo), y1: sy(Math.max(0, Math.min(ymax, k.a + k.b * lo))), x2: sx(hi), y2: sy(Math.max(0, Math.min(ymax, k.a + k.b * hi))), stroke: col }, svg);
    S.forEach(s => el('circle', { class: 'pt', cx: sx(s.t), cy: sy(s[sp]), r: 6.5, fill: col }, svg));
    el('text', { x: X1 - 6, y: Y1 + 14, 'text-anchor': 'end' }, svg, `r = ${fmt(k.r, 2)}   R² = ${fmt(k.r * k.r, 2)}   n = ${S.length}`);
    $('#k-text').innerHTML = SPTXT[sp](k);
    $$('#k-choices button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sp === sp)));
    const own = ST.every(s => tDone(s.d));
    $('#k-source').textContent = !own ? 'The empty cells of your table use our counts. Finish part 3 to use only your own.'
      : store.get('tfilled', false) ? 'These graphs use your estimates from part 3, and our counts where you pressed Fill.' : 'These graphs use your own estimates from part 3.';
  }
  $$('#k-choices button').forEach(b => b.addEventListener('click', () => { sp = b.dataset.sp; drawScatter(); if (currentPart === 6) drawCorr(); }));
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

  /* ---------------- the lesson record (labs-shared/practical/lesson.js) and this page's list of questions ----------------
     Every Check, choice and ↺ Start again is told to Lesson, which keeps it for the teacher's 🔬 Practicals board when the
     pupil is signed in. Each question registers itself as it is drawn (reg, group): manifest() is data/questions.json,
     and on a local server the page says when that file no longer matches (practice.js, at the end). */
  const L0 = window.Lesson || { check() {}, done() {}, restart() {}, restartAll() {} };
  const L = { check: (...a) => { L0.check(...a); progressSoon(); }, done: (...a) => { L0.done(...a); progressSoon(); },
              restart: (...a) => { L0.restart(...a); ans.drop(a[0]); progressSoon(); }, restartAll: (...a) => { L0.restartAll(...a); progressSoon(); } };
  /* ---------------- progress (12 Oct 2026, the layout audit): each part's tab shows a bar of what is done in this round,
     and each part opens with "Your task" and a tally. A question is done when its newest round is right (or written);
     ↺ Start again opens a new round, so its ring starts again too. The quadrats count as one task each part: done at the
     minimum the task asks for (4 transect quadrats, 10 random ones) or when the table is filled. */
  var progT = 0;                                   /* var: the tables call progressSoon() before this line runs */
  function progressSoon() { clearTimeout(progT); progT = setTimeout(progress, 60); }
  function qDone(rec, id) { const x = rec.q[id], r = x && x.r[x.r.length - 1]; return !!(r && !r.e && (r.s === 'f' || r.s === '1' || r.s === 'd')); }
  const ownT = () => ST.filter(s => tDone(s.d) && !mine[s.d].filled).length, ownR = () => RQ.filter(r => rDone(r.q) && !rmine[r.q].filled).length;
  function partProgress(n, rec) {
    const qs = QREG.filter(q => q.part === n && !q.group); let done = qs.filter(q => qDone(rec, q.id)).length, all = qs.length;
    if (n === 3) { all++; if (ownT() >= 4 || ST.every(s => tDone(s.d))) done++; }
    if (n === 4) { all++; if (ownR() >= 10 || RQ.every(r => rDone(r.q))) done++; }
    return { done, all };
  }
  function progress() {
    const rec = L0.record ? L0.record() : { q: {} };
    $$('.tabs button').forEach((b, i) => {
      const n = i + 1, p = partProgress(n, rec), c = $('.n', b), pct = p.all ? Math.round(100 * p.done / p.all) : 0;
      let pb = $('.pb', b);   /* the bar under the part's name (css: .pb) */
      if (!pb) { pb = h('span', { class: 'pb', 'aria-hidden': 'true' }, '<i></i>'); b.appendChild(pb); }
      pb.style.setProperty('--p', pct); b.classList.toggle('prog', p.done > 0 && pct < 100); c.classList.toggle('full', p.all > 0 && pct === 100);
      b.setAttribute('aria-label', `${n}. ${b.textContent.replace(/^\d+/, '').trim()}: ${p.done} of ${p.all} done`);
      const t = $(`#part-${n} .task__n`); if (!t) return;
      t.textContent = n === 3 ? (ST.every(s => tDone(s.d)) ? 'Table complete' : `Quadrats recorded: ${ownT()} of at least 4`)
        : n === 4 ? (RQ.every(r => rDone(r.q)) ? 'All 30 in the table' : `Recorded: ${ownR()} of at least 10`)
        : n === 5 ? `Step ${cstep + 1} of ${CSTEPS.length}` : p.all ? `Done: ${p.done} of ${p.all}` : '';
      t.classList.toggle('full', p.all > 0 && p.done === p.all);
    });
  }
  const QREG = [], GREG = [];
  const reg = q => { if (!QREG.some(x => x.id === q.id)) QREG.push(q); };
  const group = g => { if (!GREG.some(x => x.id === g.id)) GREG.push(g); };
  const PARTS = [[1, 'The shore'], [2, 'Methods'], [3, 'Transect'], [4, 'Random quadrats'], [5, 'Chi-squared'], [6, 'Correlation'], [7, 'Write it up'], [8, 'Challenge']];
  function manifest() {
    const qs = QREG.map((q, i) => [q, i]).sort((a, b) => a[0].part - b[0].part || a[1] - b[1]).map(x => x[0]);
    const used = new Set(qs.map(q => q.part));
    return { id: 'rocky-shore-fieldwork-pract', v: 1, parts: PARTS.filter(p => used.has(p[0])).map(p => ({ n: p[0], title: p[1] })),
             groups: GREG.slice(), questions: qs };
  }
  ST.forEach(s => reg({ id: 'p3-c' + s.d, part: 3, title: 'Cover in the quadrat at ' + s.d + ' m', kind: 'quad', group: 'p3-transect' }));
  group({ id: 'p3-transect', part: 3, title: 'Transect quadrats', short: 'T' });

  /* ---------------- quick checks ---------------- */
  /* Multiple choice (11 Oct 2026, Daniel: "make sure that the longest is not the right one, that you randomize them … not
     aligned left … it's very obvious"): the options are written to the same length and detail, shown as one left-aligned
     list (A, B, C, D) in a new random order every time the page opens. A wrong choice says only "not this one"; the
     reason comes with the right answer (effort first). The record keeps each option by its place in the list, not on screen. */
  function mcq(d, it, seed, id) {
    const order = it.a.map((txt, i) => [txt, i]);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const list = h('div', { class: 'opts', role: 'group', 'aria-label': 'Choose one answer' }), out = h('p', { 'aria-live': 'polite' }), bs = [], byI = {};
    const say = good => { out.innerHTML = good ? '<span class="ok">✓ Correct.</span> ' + it.why : '<span class="bad">✗ Not this one.</span> Think again, then try another answer.'; };
    order.forEach(([txt, i], k) => {
      const b = h('button', { class: 'opt', type: 'button' }, `<span class="opt__l" aria-hidden="true">${'ABCDE'[k]}</span><span class="opt__t"></span>`);
      b.querySelector('.opt__t').textContent = txt; bs.push(b); byI[i] = b;
      b.addEventListener('click', () => {
        L.check(id, i === it.c, i === it.c ? [] : ['o' + i]);
        b.classList.add(i === it.c ? 'chosen-right' : 'chosen-wrong');
        say(i === it.c);
        const s = ans.get(id) || {}, w = (s.w || []).slice();   /* kept by the option's place in the list, not on screen */
        if (i !== it.c && w.indexOf(i) < 0) w.push(i);
        ans.put(id, { w: w, ok: !!s.ok || i === it.c, last: i === it.c ? 1 : 0 });
      });
      list.appendChild(b);
    });
    d.appendChild(list); d.appendChild(out);
    const s0 = ans.get(id);
    if (s0) {
      (s0.w || []).forEach(i => { if (byI[i]) byI[i].classList.add('chosen-wrong'); });
      if (s0.ok && byI[it.c]) byI[it.c].classList.add('chosen-right');
      if (s0.ok || (s0.w || []).length) say(!!s0.last);
    }
    return () => { bs.forEach(b => b.classList.remove('chosen-right', 'chosen-wrong')); out.innerHTML = ''; L.restart([id]); };   // start again
  }
  /* ---------------- quick checks: a question after each piece of theory (11 Oct 2026, Daniel: "all the time that … there is
     theory, you ask a question … so it's constantly interactive, and you just don't read") ----------------
     Typed (words or a number) or multiple choice; the same rules as everywhere on the page: the answer only after two
     tries, the reason only with the right answer, every try kept in the lesson record (ids p<part>-qc-<n>). */
  const normA = x => String(x).normalize('NFKC').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[‐‑‒–—−-]/g, ' ').replace(/[.,;:!?]+$/, '').replace(/\s+/g, ' ').trim().replace(/^(the|a|an) /, '');
  function quick(box, q, onDone) {
    box.classList.add('qc'); box.innerHTML = '';
    box.appendChild(h('div', { class: 'qc__k' }, 'Quick check'));
    box.appendChild(h('p', { class: 'qc__q' }, q.q));
    reg({ id: q.id, part: q.part, title: q.title, short: q.short, kind: q.kind === 'mcq' ? 'mcq' : 'num', opts: q.kind === 'mcq' ? q.a : undefined });
    if (q.kind === 'mcq') { mcq(box, q, 0, q.id); return; }
    const row = h('div', { class: 'qc__row' });
    const inp = h('input', { type: 'text', class: 'gapin', size: q.kind === 'num' ? 8 : 18, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Your answer' });
    if (q.kind === 'num') inp.setAttribute('inputmode', 'decimal');
    const b = h('button', { class: 'btn', type: 'button' }, 'Check'), out = h('p', { 'aria-live': 'polite' });
    let wrong = 0, done = false;
    const answer = () => typeof q.ans === 'function' ? q.ans() : q.ans;
    const ok = v => q.kind === 'num' ? (() => { const x = parseFloat(String(v).replace(/[−–]/g, '-').replace(',', '.')); return !isNaN(x) && Math.abs(x - answer()) <= (q.tol || 0) + 1e-9; })()
                                     : q.acc.map(normA).includes(normA(v));
    function finish() { if (!done) { done = true; if (onDone) onDone(); } }
    const whyT = () => typeof q.why === 'function' ? q.why() : q.why;
    const sayRight = () => { out.innerHTML = '<span class="ok">✓ Correct.</span> ' + whyT(); };
    const showAns = () => { out.innerHTML = '<b>' + (q.kind === 'num' ? fmt(answer(), q.dp || 0) : q.acc[0]) + '.</b> ' + whyT(); finish(); };
    function sayWrong() {
      out.innerHTML = '<span class="bad">✗ Not yet.</span> ' + (wrong >= 2 ? 'Or <button class="linkish" type="button">show the answer</button>.' : 'Think again and try once more.');
      const l = out.querySelector('.linkish');
      if (l) l.addEventListener('click', () => { showAns(); ans.put(q.id, { shown: 1 }); });
    }
    b.addEventListener('click', () => {
      const v = inp.value.trim();
      if (!v) { out.textContent = 'Type your answer first.'; return; }
      const good = ok(v);
      L.check(q.id, good, good ? [] : [v.slice(0, 30)]);
      inp.classList.toggle('right', good); inp.classList.toggle('wrong', !good);
      if (good) { ans.put(q.id, { v: v, st: 'r', ok: 1, wrong: wrong }); sayRight(); finish(); return; }
      wrong++;
      ans.put(q.id, { v: v, st: 'w', wrong: wrong });
      sayWrong();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); b.click(); } });
    inp.addEventListener('input', () => { inp.classList.remove('right', 'wrong'); ans.put(q.id, { v: inp.value, st: '' }); });
    row.appendChild(inp); if (q.unit) row.appendChild(h('span', { class: 'qc__u' }, q.unit)); row.appendChild(b);
    box.appendChild(row); box.appendChild(out);
    const s0 = ans.get(q.id);   /* drawn again as it was: nothing is told to the lesson record again */
    if (s0) {
      inp.value = s0.v || ''; wrong = s0.wrong || 0;
      if (s0.st === 'r') inp.classList.add('right'); else if (s0.st === 'w') inp.classList.add('wrong');
      if (s0.shown) showAns();
      else if (s0.ok) { sayRight(); finish(); }
      else if (wrong) sayWrong();
    }
  }
  const QC = {
    'p1-qc-1': { part: 1, short: 'q1', title: 'Which band dries out most?', kind: 'text', acc: ['upper shore', 'upper', 'top of the shore', 'high shore', 'upper zone'],
      q: 'A seaweed dies when it loses more than half of its water. In which band of the shore is it least likely to survive? Type the band’s name.',
      why: 'The upper shore is out of the water for the longest time at each low tide, so the rock and the seaweed on it dry out most.' },
    'p1-qc-2': { part: 1, short: 'q2', title: 'What sets the two limits?', kind: 'mcq', c: 0, q: 'On a rocky shore, which pair most often limits where a species lives?',
      a: ['Its upper limit by an abiotic variable such as drying out; its lower limit by biotic interactions such as competition.',
          'Its upper limit by biotic interactions such as competition; its lower limit by an abiotic variable such as drying out.',
          'Both of its limits by abiotic variables such as drying out, because biotic interactions do not change along the shore.',
          'Both of its limits by biotic interactions such as grazing, because abiotic variables are the same all along the shore.'],
      why: 'Higher on the shore the stress is physical (drying, heat); lower down, where conditions are easier, other species compete, graze or prey.' },
    'p2-qc-1': { part: 2, short: 'q1', title: 'Quadrats on a 6 m tape', kind: 'num', ans: 5, tol: 0,
      q: 'An interrupted belt transect on a 6 m tape has a quadrat every 1.5 m, starting at 0 m. How many quadrats is that?',
      why: 'Quadrats at 0, 1.5, 3, 4.5 and 6 m: 6 ÷ 1.5 = 4 gaps, so 5 quadrats. Count the one at 0 m.' },
    'p2-qc-2': { part: 2, short: 'q2', title: 'How to sample periwinkles', kind: 'mcq', c: 0,
      q: 'Periwinkles are small snails that move slowly over the rock and hide in cracks at low tide. How should you sample them?',
      a: ['Count them in each quadrat, as for limpets, and search the cracks inside the quadrat as well.',
          'Estimate their percentage cover, as for barnacles, because they are too small to count one by one.',
          'Use capture–mark–release–recapture, because every animal that lives on the shore is motile.',
          'Leave them out, because a quadrat can be used only for sessile organisms such as the seaweeds.'],
      why: 'At low tide periwinkles move very little, so, like limpets, they are counted in the quadrat (abundance), cracks included.' },
    'p3-qc-1': { part: 3, short: 'q1', title: 'Counting squares for cover', kind: 'num', ans: 28, tol: 0, unit: '%',
      q: 'A quadrat is strung into 25 squares. Sea lettuce covers 4 squares completely, more than half of 3 other squares, and less than half of 2 other squares. What is its percentage cover?',
      why: 'Count the squares at least half covered: 4 + 3 = 7. Each square is 100 ÷ 25 = 4 %, so 7 × 4 = 28 %. The 2 squares with less than half are not counted.' },
    'p3-qc-2': { part: 3, short: 'q2', title: 'Cover with the seaweed not lifted', kind: 'mcq', c: 0,
      q: 'Along the same transect, student A lifts the seaweed before estimating barnacle cover; student B does not. Which statement about B’s data is correct?',
      a: ['B’s estimates are too low wherever seaweed grows, so B’s data show barnacles falling too steeply towards the sea.',
          'B’s estimates are better, because only the barnacles that can be seen from above count towards the percentage cover.',
          'B’s estimates are as valid as A’s, because the two students simply make different random errors in their counting.',
          'B’s estimates are too high, because seaweed that lies on the rock looks like barnacles when it is seen from above.'],
      why: 'Seaweed hides barnacles, and there is more seaweed lower on the shore. So the error is not random: it becomes larger towards the sea, and it makes the gradient look steeper than it is.' },
    'p4-qc-1': { part: 4, short: 'q1', title: 'Random squares that cluster', kind: 'mcq', c: 0,
      q: 'Your first five pairs of random numbers all give squares in the top row of the area (down = 0), on pale rock. What do you do?',
      a: ['Keep them: random positions can fall close together by chance, and moving them by choice would bring back bias.',
          'Move the next quadrats lower in the area, so that the 30 quadrats are spread evenly over all of the 5 m × 5 m area.',
          'Start again with new numbers, because a random sample is not valid unless its quadrats are spread out evenly.',
          'Add five quadrats on the green patches by choice, so that both species have a fair chance of being recorded.'],
      why: 'Random means every square has the same chance each time, so clusters happen. Choosing positions yourself, even to "spread them out", brings back bias. With 30 quadrats the sample usually covers the area.' },
    'p6-qc-1': { part: 6, short: 'q1', title: 'Is r = −0.55 significant?', kind: 'text', acc: ['no', 'not significant', 'no it is not'],
      q: 'From the same 11 quadrats, a student finds r = −0.55 for another species against rock temperature. Is this correlation significant at p = 0.05? Type yes or no.',
      why: 'No: the size of r (0.55) is less than the critical value for 11 quadrats (0.602), so the correlation is not significant.' },
    'p6-qc-2': { part: 6, short: 'q2', title: 'R² from r', kind: 'num', ans: 9, tol: 0.5, unit: '%',
      q: 'On another shore, r = −0.30 for the number of limpets against rock temperature. About what percentage of the variation in limpet numbers does the straight line account for?',
      why: 'R² = r² = (−0.30)² = 0.09, so about 9 %. R² is never negative. The other 91 % of the variation comes from other variables, or from chance.' },
    'p9-qc-1': { part: 9, short: 'q1', title: 'The R function for SD', kind: 'text', acc: ['sd', 'sd()', 'sd(x)'],
      q: 'Which R function gives the standard deviation of a set of numbers? Type its name.', why: '<code>sd()</code>, as in step 1: <code>sd(limpets)</code>.' },
    'p10-qc-1': { part: 10, short: 'q1', title: 'An empty shell in a quadrat', kind: 'mcq', c: 0,
      q: 'An empty limpet shell lies upside down in one of your quadrats, pearly side up. Do you count it as a limpet?',
      a: ['No: an empty shell is not a living animal, so it is not part of the population you are sampling.',
          'Yes: every shell in the quadrat counts, because a shell shows that the species lives in that place.',
          'Yes, but only as half an animal, because the shell is in the quadrat but the body of the limpet is not.',
          'No, but record it as percentage cover instead, because an empty shell cannot be counted as one animal.'],
      why: 'You sample the living population. A living limpet clamps tightly to the rock; an empty shell moves easily and often lies upside down.' },
    'p10-qc-2': { part: 10, short: 'q2', title: 'The uncertainty of a pH probe', kind: 'num', ans: 0.01, tol: 0.0001, dp: 2,
      q: 'A pH probe shows 7.96 on its screen, and its manual gives no other uncertainty. What is the uncertainty of this reading? Type the number after ±.',
      why: '± 0.01: the smallest step the screen shows (the last digit). In the column heading: pH ± 0.01.' },
    'p10-qc-3': { part: 10, short: 'q3', title: 'Raw data, not means', kind: 'mcq', c: 0,
      q: 'A student correlates the MEAN count at each of the 10 distances with the mean salinity there, instead of using every quadrat. Why should r be calculated from the raw data?',
      a: ['Means hide the variation between quadrats, so r usually looks stronger than the data show, and n falls to 10.',
          'Means are less accurate than raw data, because a mean is rounded to fewer decimal places than a reading.',
          'Pearson’s r can be calculated only from whole numbers, and the mean of a set of counts is often a decimal.',
          'Means make r look weaker than the data show, because a mean adds the errors of all the quadrats together.'],
      why: 'A mean of three quadrats removes most of their scatter, so the points lie closer to a line, and the test then uses n = 10 instead of every quadrat. The raw data show the real spread.' }
  };
  $$('[data-qc]').forEach(b => { const q = QC[b.dataset.qc]; if (q) quick(b, Object.assign({ id: b.dataset.qc }, q)); });
  /* the chi-squared steps' own quick checks are drawn with their step; listed here so the teacher's board names them */
  [['p5-qc-1', 'E', 'An expected value'], ['p5-qc-2', 'χ²', 'One cell of χ²'], ['p5-qc-3', 'df', 'Degrees of freedom of a 3 × 2 table']].forEach(x => reg({ id: x[0], part: 5, title: x[2], short: x[1], kind: 'num' }));

  const QUIZ = {
    q1: [{ t: 'Barnacles X and Y: which niche?', q: 'Barnacle X lives only on the upper shore. When barnacle Y is removed from the middle shore, X extends down into the middle shore, but X never extends into the lower shore. Which conclusion is best supported?',
      a: ['Competition with Y keeps X on the upper shore: the middle shore is in its fundamental niche, not its realized niche.',
          'Drying out keeps X on the upper shore: the middle shore is outside its range of tolerance and its fundamental niche.',
          'Y preys on X on the middle shore: the middle shore is in its realized niche, but not in its fundamental niche.',
          'X and Y share one realized niche: X moves down only because the middle shore becomes drier when Y is removed.'], c: 0,
      why: 'X can live on the middle shore when Y is absent, so the middle shore is inside its fundamental niche. With Y present, X is restricted to the upper shore: its realized niche. Something else (another species, or an abiotic variable) excludes X from the lower shore, but it cannot be desiccation: the lower shore is the wettest part.' },
    { t: 'Sea lettuce missing at both ends', q: 'Along the transect, sea lettuce is absent from the top 2 m and from the bottom 3 m. Which pair of explanations is most consistent with B4.1.4 and B4.2.12?',
      a: ['Top: drying out at low tide is outside its range of tolerance. Bottom: brown seaweed outcompetes it for space.',
          'Top: brown seaweed outcompetes it for space. Bottom: drying out at low tide is outside its range of tolerance.',
          'Both ends: limpets graze it faster than it grows, because limpets are found all along the transect.',
          'Both ends: the rock temperature is outside its range of tolerance: too hot at the top, too cold at the bottom.'], c: 0,
      why: 'The upper limit of a species is usually set by an abiotic variable (drying out high on the shore); the lower limit is often set by biotic interactions, such as competition with the brown seaweed that covers the lower shore.' },
    { t: 'A range of tolerance at 34 °C', q: 'At low tide the rock on the upper shore reaches 34 °C. A seaweed survives rock temperatures from 5 °C to 30 °C. Which prediction is best supported?',
      a: ['Its upper limit is set by an abiotic variable: it can live only where the rock stays at or below about 30 °C.',
          'Its upper limit is set by grazing: with no limpets it could grow on the upper shore, even at 34 °C at low tide.',
          'Its realized niche reaches higher than its fundamental niche, because there is less competition on the upper shore.',
          'Its upper limit is set by its competitors: with them removed, it could survive the 34 °C of the upper shore.'], c: 0,
      why: '34 °C is outside its range of tolerance, so removing competitors or grazers cannot make the upper shore part of its niche. A realized niche is never larger than the fundamental niche.' }],
    q2: [{ t: 'Biased quadrat placement', q: 'To save time, a student places quadrats only where seaweed is growing. What is the main effect on the estimate of mean seaweed cover for the area?',
      a: ['The mean is too high, because bare rock is never sampled: the positions are chosen, so they are biased.',
          'The mean is less precise but still unbiased, because every quadrat is still divided into 100 small squares of cover.',
          'The mean cannot be calculated, because percentage cover needs quadrats placed side by side along a belt.',
          'The mean is unchanged, because the same quadrat size and the same way of counting are used every time.'], c: 0,
      why: 'Choosing "interesting" spots is bias: bare rock is never sampled, so the mean cover is too high. Random positions give every point an equal chance.' },
    { t: 'Transect time and quadrats', q: 'A 20 m interrupted belt transect has a quadrat every 2 m, starting at 0 m, and each quadrat takes 3 minutes to record. How long does the recording take, and how many 0.5 m quadrats would a continuous belt transect of the same tape need?',
      a: ['33 minutes; 40 quadrats', '30 minutes; 40 quadrats', '33 minutes; 20 quadrats', '30 minutes; 20 quadrats'], c: 0,
      why: 'Quadrats at 0, 2, 4 … 20 m: 11 quadrats, 11 × 3 = 33 minutes (remember the one at 0 m). A continuous belt needs 20 ÷ 0.5 = 40 quadrats.' },
    { t: 'Cover or count for limpets', q: 'Why is percentage cover not a good way to estimate the population density of limpets?',
      a: ['Limpets are separate individuals, and density is a number of individuals per unit area, so they are counted.',
          'Limpets move about during the low tide, so their cover changes while it is estimated, but a count does not.',
          'Percentage cover is used only for plants and seaweeds, never for animals such as limpets or barnacles.',
          'Percentage cover can be estimated only along a continuous belt transect, never in quadrats placed at random.'], c: 0,
      why: 'Cover measures area, not the number of individuals. Count the limpets and divide by the area sampled (per m²).' },
    { t: 'Lincoln index: an estimate too high', q: 'In a capture–mark–release–recapture study of shore crabs, which of these would make the Lincoln index estimate of the population too HIGH?',
      a: ['Some crabs lose their marks before the second sample, so fewer marked crabs are caught again.',
          'Marked crabs are easier to catch than unmarked crabs, so more marked crabs are caught again.',
          'The second sample is larger than the first, so more crabs in total are caught on the second day.',
          'No crabs are born or die between the two samples, so the size of the population stays the same.'], c: 0,
      why: 'Population ≈ (number marked × number in the second sample) ÷ number marked in the second sample. Lost marks make the last number too small, so the estimate is too large. Marked crabs that are easier to catch make it too small.' }]
  };
  $$('.quiz').forEach(box => {
    const set = QUIZ[box.dataset.quiz]; if (!set) return;
    box.innerHTML = '<h3>Check yourself</h3>';
    const part = box.dataset.quiz === 'q1' ? 1 : 2;
    const resets = set.map((it, n) => {
      const d = h('div', { class: 'box' }); d.innerHTML = `<p><b>${n + 1}.</b> ${it.q}</p>`;
      const id = 'p' + part + '-quiz-' + (n + 1);
      reg({ id, part, title: it.t, short: 'Q' + (n + 1), kind: 'mcq', opts: it.a });
      box.appendChild(d); return mcq(d, it, 11 + n * 7 + box.dataset.quiz.length, id);
    });
    const b = h('button', { class: 'btn ghost again', type: 'button' }, '↺ Start these questions again');
    b.addEventListener('click', () => resets.forEach(r => r())); box.appendChild(b);
  });

  /* ---------------- parts: one open at a time, as steps across the top ---------------- */
  let currentPart = 1;
  const NPART = $$('.part').length;
  const partTitle = n => { const b = $('#tab-' + n); return b ? b.textContent.replace(/^\d+/, '').trim() : ''; };
  let seen = store.get('seen', []);
  // under each part: Back and Next, so the way through is plain; above its heading: which part of how many
  $$('.part').forEach((p, i) => {
    const n = i + 1, h2 = $('h2', p);
    if (h2) h2.insertAdjacentHTML('beforebegin', `<p class="partno">Part ${n} of ${NPART}</p>`);
    const nav = h('nav', { class: 'partnav', 'aria-label': 'Move between parts' });
    if (n > 1) { const b = h('button', { type: 'button', class: 'back' }, '← ' + (n - 1) + ' · ' + partTitle(n - 1)); b.addEventListener('click', () => show(n - 1)); nav.appendChild(b); }
    if (n < NPART) { const b = h('button', { type: 'button', class: 'next' }, 'Next: ' + (n + 1) + ' · ' + partTitle(n + 1) + ' →'); b.addEventListener('click', () => show(n + 1)); nav.appendChild(b); }
    p.appendChild(nav);
  });
  function show(n, keepScroll) {
    currentPart = n;
    if (seen.indexOf(n) < 0) { seen.push(n); store.set('seen', seen); }
    $$('.tabs button').forEach((b, i) => { b.setAttribute('aria-selected', String(i + 1 === n)); b.classList.toggle('seen', seen.indexOf(i + 1) >= 0); });
    const tab = $('#tab-' + n); if (tab && tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    $$('.part').forEach((p, i) => p.classList.toggle('open', i + 1 === n));
    const mode = $('#part-' + n).dataset.mode, pin = $('#part-' + n).hasAttribute('data-pin');
    // the photograph stays on the left for every part (Daniel, 11 Oct 2026); on a narrow screen it stays pinned at the top
    // only for the parts that work on it (data-pin)
    document.body.classList.toggle('photo-on', pin);
    // part 10 is about the real field trip, so its picture is a photograph of that kind of shore, not the practice shore
    const trip = mode === 'trip';
    $('#photo').hidden = trip; $('#cap').hidden = trip; $('#tripPhoto').hidden = !trip; $('#tripCap').hidden = !trip;
    $('#stageData').hidden = mode !== 'chi';
    $('.stage').classList.toggle('chi', mode === 'chi');   /* part 5: the photo and its tables fit one screen (css .stage.chi) */
    stageH();
    if (mode === 'zones') drawZones($$('#zone-choices button').find(b => b.getAttribute('aria-pressed') === 'true').dataset.zone);
    else if (mode === 'method') drawMethod($$('#method-choices button').find(b => b.getAttribute('aria-pressed') === 'true').dataset.m);
    else if (mode === 'transect') drawTransect();
    else if (mode === 'random') drawArea(false);
    else if (mode === 'chi') drawChiArea();
    else if (mode === 'corr') drawCorr();
    else if (mode === 'write') drawWrite();
    else if (mode === 'counts') drawCounts();
    else { clear(); scaleBar(); }
    if (n === 5) renderChi();
    if (n === 6) { drawScatter(); drawKite(); }
    // a new part starts at its own top, just under the step bar (and the pinned photograph on a narrow screen)
    if (!keepScroll) $('#part-' + n).scrollIntoView({ block: 'start' });
    try { history.replaceState(null, '', '#part-' + n); } catch (e) { }
    document.dispatchEvent(new CustomEvent('partshown', { detail: n }));
    progressSoon();
  }
  $$('.tabs button').forEach((b, i) => b.addEventListener('click', () => show(i + 1)));
  function wordBank(open) { $('#wb').hidden = !open; $('#wbBtn').setAttribute('aria-expanded', String(open)); }
  $('#wbBtn').addEventListener('click', () => wordBank($('#wb').hidden));
  $('#wbClose').addEventListener('click', () => wordBank(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#wb').hidden) wordBank(false); });
  // Cards (details.fold) open in place, one at a time in a part (Daniel: explore, do not scroll a wall). The card that is
  // pressed stays exactly where it is on the screen while the others close (11 Oct 2026: before, the page jumped up).
  document.addEventListener('click', e => {
    const sum = e.target.closest ? e.target.closest('details.fold > summary') : null;
    if (!sum) return;
    const d = sum.parentElement, part = d.closest('.part');
    if (d.open || !part) return;                         /* closing a card moves nothing above it */
    const before = sum.getBoundingClientRect().top;
    $$('details.fold[open]', part).forEach(o => { if (o !== d && !o.contains(d) && !d.contains(o)) o.open = false; });
    const after = sum.getBoundingClientRect().top;
    if (Math.abs(after - before) > 0.5) window.scrollBy({ top: after - before, left: 0, behavior: 'instant' });
  }, true);
  // the step bar and, on a narrow screen, the pinned photograph: a part's heading and a card must not hide under them
  function stageH() {
    const root = document.documentElement.style, bar = $('#partbar');
    root.setProperty('--bar-h', (bar ? bar.offsetHeight : 0) + 'px');
    root.setProperty('--stage-h', document.body.classList.contains('photo-on') && window.innerWidth <= 1000 ? $('.stage').offsetHeight + 'px' : '0px');
  }
  window.addEventListener('resize', stageH);
  if (PHONE.addEventListener) PHONE.addEventListener('change', () => { const n = +((/#part-(\d+)/.exec(location.hash) || [0, 1])[1]); if ($('#part-' + n).dataset.mode === 'transect') drawTransect(); });
  $('#credits').innerHTML = D.credits.map(c => `${c.what}: ${c.who}, <a href="${c.url}" target="_blank" rel="noopener">${c.licence}</a>`).join(' · ');
  RQ.forEach(r => reg({ id: 'p4-n' + r.q, part: 4, title: 'Limpets in random quadrat ' + r.q + ' (across ' + r.gx + ', down ' + r.gy + ')', kind: 'quad', group: 'p4-random' }));
  group({ id: 'p4-random', part: 4, title: 'Random quadrats', short: 'R' });
  window.ShoreApp = { series, chi, pearson, ranks, fmt, store, h, mcq, L, reg, manifest, ans };
  tableT(); tableR();
  const m0 = /#part-(\d+)/.exec(location.hash);
  show(m0 ? +m0[1] : 1, true);
})();
