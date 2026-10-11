/* Rocky shore fieldwork · the practice: key words, sentence frames, challenge questions and the R steps.
   Every check happens in the browser; nothing is sent anywhere. */
(function () {
  'use strict';
  const A = window.ShoreApp, $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const h = A.h, fmt = A.fmt, L = A.L;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  /* A card the student opens in place (one open at a time in a part: app.js) */
  function fold(kind, title, open) {
    const d = h('details', { class: 'fold' }); if (open) d.open = true;
    d.innerHTML = `<summary><span class="fk">${kind}</span><span class="ft">${title}</span></summary><div class="fold-in"></div>`;
    return d;
  }

  /* ↺ Start again: clears one set of questions so the pupil can try it from the beginning (Daniel, 11 Oct). */
  const again = fn => { const b = h('button', { class: 'btn ghost again', type: 'button' }, '↺ Start again'); b.addEventListener('click', fn); return b; };

  /* A typed gap. Daniel (11 Oct): IB pupils type every word, never choose it from a list. data-acc holds every accepted
     answer (the first is the one shown); a number gap holds its value and tolerance. Capital letters, a leading "the"
     and a final full stop do not matter; spelling does. */
  const escA = s => esc(s).replace(/"/g, '&quot;');
  const norm = s => String(s).normalize('NFKC').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[‐‑‒–—−-]/g, ' ')
    .replace(/[.,;:!?]+$/, '').replace(/\s+/g, ' ').trim().replace(/^(the|a|an) /, '');
  function gap(acc, size, label) {
    return `<input class="gapin" type="text" data-acc="${escA(JSON.stringify(acc))}"${label ? ` data-label="${escA(label)}"` : ''} size="${size || 14}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the missing word">`;
  }
  function num(v, tol, dp, size, label) {
    return `<input class="gapin" type="text" inputmode="decimal" data-num="${v}"${label ? ` data-label="${escA(label)}"` : ''} data-tol="${tol}" data-show="${escA(fmt(v, dp))}" size="${size || 6}" autocomplete="off" aria-label="Type the missing number">`;
  }
  function right(inp) {
    if (inp.dataset.num != null) {
      const x = parseFloat(inp.value.replace(/[−–]/g, '-').replace(',', '.').replace(/[^0-9.\-]/g, ''));
      return !isNaN(x) && Math.abs(x - Number(inp.dataset.num)) <= Number(inp.dataset.tol) + 1e-9;
    }
    return JSON.parse(inp.dataset.acc).map(norm).includes(norm(inp.value));
  }
  function shown(inp) { return inp.dataset.num != null ? inp.dataset.show : JSON.parse(inp.dataset.acc)[0]; }
  /* Check marks each gap. The answers can be shown only after two complete tries (effort before answers). */
  /* id: the set's question id on the teacher's board; reg: its words there (part, title, short) */
  function checker(box, after, id, meta) {
    if (meta) A.reg(Object.assign({ id, kind: 'gaps', gaps: $$('input.gapin', box).map(i => i.dataset.label || shown(i)) }, meta));
    const out = h('p', { 'aria-live': 'polite' }), b = h('button', { class: 'btn', type: 'button' }, 'Check');
    const show = h('button', { class: 'btn ghost', type: 'button' }, 'Show the answers'); show.hidden = true;
    let tries = 0;
    b.addEventListener('click', () => {
      const g = $$('input.gapin', box);
      if (g.some(i => !i.value.trim())) { out.innerHTML = 'Type an answer in every gap first.'; return; }
      tries++; let ok = 0; const wrongs = [];
      g.forEach((i, k) => { const good = right(i); if (good) ok++; else wrongs.push((k + 1) + '=' + i.value.trim());
        i.classList.toggle('right', good); i.classList.toggle('wrong', !good); });
      if (id) L.check(id, ok === g.length, wrongs);
      if (ok === g.length) { out.innerHTML = `<span class="ok">✓ All ${g.length} correct.</span>${after ? ' ' + after : ''}`; show.hidden = true; return; }
      out.innerHTML = `<span class="bad">${ok} of ${g.length} correct.</span> Change the ones marked in red, then check again.` +
        (tries < 2 ? ' Check your spelling too.' : '');
      show.hidden = tries < 2;
    });
    show.addEventListener('click', () => {
      $$('input.gapin.wrong', box).forEach(i => { if (!(i.nextElementSibling && i.nextElementSibling.classList.contains('ans'))) i.insertAdjacentHTML('afterend', `<span class="ans">${esc(shown(i))}</span>`); });
      show.hidden = true;
    });
    box.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input.gapin')) { e.preventDefault(); b.click(); } });
    box.addEventListener('input', e => { if (e.target.matches('input.gapin')) e.target.classList.remove('right', 'wrong'); });
    const restart = again(() => {
      $$('input.gapin', box).forEach(i => { i.value = ''; i.classList.remove('right', 'wrong'); });
      $$('.ans', box).forEach(a => a.remove()); tries = 0; show.hidden = true; out.innerHTML = '';
      if (id) L.restart([id]);
    });
    box.appendChild(b); box.appendChild(show); box.appendChild(restart); box.appendChild(out);
  }

  /* A model answer opens only after the pupil has written their own (at least 30 words). */
  function wroteEnough(d, out) {
    const n = ($('textarea', d).value.trim().match(/\S+/g) || []).length;
    if (n >= 30) return true;
    out.innerHTML = `Write your own answer first: at least 30 words (you have ${n}). Then compare it with the model answer.`;
    return false;
  }

  /* ---------- 1. type the word for each meaning ---------- */
  const WORDS = [
    ['Attached to the rock for the whole of its adult life, so it cannot move to a new place.', ['sessile']],
    ['Able to move from one place to another, like a shore crab.', ['motile', 'mobile']],
    ['The arrangement of species in bands across a habitat, each band following a change in an abiotic variable.', ['zonation']],
    ['A non-living factor that can be measured, such as the time a rock spends out of the water.', ['abiotic variable', 'abiotic factor', 'abiotic']],
    ['Loss of water from an organism: the main abiotic stress high on the shore at low tide.', ['desiccation', 'dehydration']],
    ['The values of an abiotic variable between which a species can survive.', ['range of tolerance', 'tolerance range', 'limits of tolerance', 'tolerance limits']],
    ['An effect of one living organism on another, such as grazing, predation or competition.', ['biotic interaction', 'biotic interactions', 'biotic factor']],
    ['All the conditions and resources a species could use, given its adaptations, if no other species competed with it.', ['fundamental niche']],
    ['The part of its potential niche that a species actually occupies when other species compete with it.', ['realized niche', 'realised niche']],
    ['Competition for the same limited resource between individuals of two different species.', ['interspecific competition']],
    ['When two species need exactly the same resources in one place, one of them is eventually eliminated there.', ['competitive exclusion', 'competitive exclusion principle', 'principle of competitive exclusion']]
  ];
  function match1(box) {
    box.innerHTML = '<h3>Type the words</h3><p class="note">Type the term for each meaning. Spelling counts; capital letters do not.</p>';
    const t = h('div'); t.innerHTML = WORDS.map(([d, w], i) => `<p class="mrow">${i + 1}. ${d} ${gap(w, 22)}</p>`).join('');
    box.appendChild(t); checker(box, 'Use these words in your answers: they are the words in the mark schemes.', 'p1-words', { part: 1, title: 'Type the words', short: 'W' });
  }

  /* ---------- 2. fill the gaps: typed, no word bank ---------- */
  function gap2(box) {
    box.innerHTML = '<h3>Fill the gaps</h3><p class="note">Type each missing word or number. There is no word bank.</p>';
    const s = [
      `Sampling at regular intervals along a line is called ${gap(['systematic'])} sampling. It is used where an abiotic variable changes along an environmental ${gap(['gradient'])}.`,
      `In a ${gap(['continuous'])} belt transect the quadrats are placed side by side. When the quadrats are placed at regular intervals instead, the belt transect is ${gap(['interrupted', 'discontinuous'])}.`,
      `Inside one zone, quadrat positions come from random numbers, so every position has an equal chance of being chosen. This avoids ${gap(['bias', 'sampling bias', 'selection bias'])} in where the quadrats are placed.`,
      `Quadrats suit ${gap(['sessile'])} organisms such as barnacles. For ${gap(['motile', 'mobile'])} animals such as shore crabs, use capture–mark–release–recapture and the ${gap(['Lincoln', 'Lincoln index'])} index.`,
      `For seaweed that grows as a sheet, estimate the percentage ${gap(['cover'])}. For limpets, count the individuals and divide by the area sampled: this gives the population ${gap(['density'])}.`,
      `24 limpets were found in 20 quadrats, each 0.5 m × 0.5 m. The population density is ${num(4.8, 0.001, 1)} limpets per m².`,
      `On a 12 m tape, an interrupted belt transect with one quadrat every 1.5 m, starting at 0 m, needs ${num(9, 0, 0, 4)} quadrats.`
    ];
    const t = h('div'); t.innerHTML = s.map((x, i) => `<p class="mrow">${i + 1}. ${x}</p>`).join(''); box.appendChild(t);
    checker(box, 'Use these words in your answers: they are the words in the mark schemes.', 'p2-gaps', { part: 2, title: 'Fill the gaps', short: 'G' });
  }

  /* ---------- 7. sentence frames, built from the student's own numbers: every gap typed ---------- */
  function frames(box) {
    const S = A.series(true), x = S.map(s => s.t);
    const rb = A.pearson(x, S.map(s => s.barn)).r;
    const k = A.chi(), neg = k.O[0][0] < k.E[0][0], sig = k.X > 3.84, big = Math.abs(rb) > 0.602;
    const peakG = S.reduce((a, s) => s.green > a.green ? s : a, S[0]);
    const gZone = S.filter(s => s.green >= 50).map(s => s.d), gFrom = gZone.length ? Math.min(...gZone) : peakG.d, gTo = gZone.length ? Math.max(...gZone) : peakG.d;
    // a pupil's typed work survives a visit to another part: draw again only when the numbers behind the frames change
    const key = JSON.stringify([rb, k.X, gFrom, gTo]); if (box.dataset.key === key) return; box.dataset.key = key;
    const strength = r => Math.abs(r) >= 0.9 ? ['very strong', 'strong'] : Math.abs(r) >= 0.7 ? ['strong'] : Math.abs(r) >= 0.4 ? ['moderate'] : ['weak'];
    const MORE = ['greater than', 'larger than', 'bigger than', 'higher than', 'more than'], LESS = ['less than', 'smaller than', 'lower than'];
    const F = [
      { t: 'A. Describe the kite diagram', n: 'Describe where each species is found along the transect. Use the kite diagram in part 6.',
        s: `Barnacles have their highest cover on the ${gap(['upper', 'top', 'high'])} shore, and their cover ${gap(['decreases', 'falls', 'declines'])} towards the water's edge. Sea lettuce is found mainly between ${num(gFrom, 0, 0, 4, 'from (m)')} m and ${num(gTo, 0, 0, 4, 'to (m)')} m. Brown seaweed is found mainly on the ${gap(['lower', 'low', 'bottom'])} shore, near the water. This pattern of bands is called ${gap(['zonation'])}.` },
      { t: 'B. State a correlation, with its evidence', n: 'Barnacle cover and rock temperature (part 6). Give r to 2 decimal places.',
        s: `There is a ${gap(strength(rb), 14, 'strength')} ${gap([rb > 0 ? 'positive' : 'negative'], 14, 'direction')} correlation between rock temperature and barnacle cover: r = ${num(rb, 0.006, 2, 6, 'r')}. The size of r is ${gap(big ? MORE : LESS, 14, 'greater or less than')} the critical value for 11 quadrats, ${num(0.602, 0.0005, 3)}, so the correlation is ${gap(big ? ['significant', 'statistically significant'] : ['not significant', 'not statistically significant', 'insignificant'], 14, 'significant or not')} at the 5 % level.` },
      { t: 'C. Correlation is not cause', n: 'Say what the correlation does not show, and why.',
        s: `A correlation does not show ${gap(['causation', 'cause', 'a causal relationship', 'cause and effect'])}. Another variable that changes along the shore, such as the time the rock is out of the ${gap(['water', 'sea'])}, may cause the change in barnacle cover. A ${gap(['controlled', 'manipulative'])} experiment that changes only the temperature, and keeps every other variable the same, would give stronger evidence.` },
      { t: 'D. Conclude from a chi-squared test', n: 'Limpets and sea lettuce in the random quadrats (part 5). Give χ² to 2 decimal places.',
        s: `The calculated χ² value is ${num(k.X, 0.006, 2, 6, 'χ²')}. It is ${gap(sig ? MORE : LESS, 14, 'greater or less than')} the critical value of ${num(3.84, 0.005, 2)} for ${num(1, 0, 0, 3)} degree(s) of freedom at p = 0.05, so the null hypothesis is ${gap(sig ? ['rejected'] : ['not rejected', 'accepted', 'retained'], 14, 'rejected or not')}.` +
          (sig ? ` Limpets and sea lettuce were found in the same quadrat ${gap(neg ? ['less', 'less often'] : ['more', 'more often'], 14, 'less or more')} often than expected: a ${gap(neg ? ['negative'] : ['positive'], 14, 'negative or positive')} association.` : '') },
      { t: 'E. A limitation and an improvement', n: 'Evaluate the method.',
        s: `One limitation is that only ${gap(['one', '1', 'a single', 'single'])} transect was sampled, so the results may not be ${gap(['representative'])} of the whole shore. To improve the investigation, repeat the transect at three places along the shore and calculate the ${gap(['mean', 'average'])} cover at each distance. Measure the rock temperature at every quadrat at about the ${gap(['same'])} time, because the rock heats up during the low tide.` },
      { t: 'F. Link the data to niches', n: 'Use the words of B4.1.4 and B4.2.12.',
        s: `The upper limit of brown seaweed on the shore is probably set by ${gap(['abiotic'])} variables, such as ${gap(['desiccation', 'drying out', 'drying', 'dehydration', 'water loss'])} at low tide. Lower limits are more often set by ${gap(['biotic'])} interactions, such as interspecific ${gap(['competition'])}. Where a species actually lives when other species are present is its ${gap(['realized', 'realised'])} niche. With no competitors it could often live in a wider zone: its ${gap(['fundamental'])} niche.` }
    ];
    box.innerHTML = '';
    F.forEach((f, i) => {
      const d = fold('Frame', f.t, i === 0), inn = $('.fold-in', d); inn.innerHTML = `<p class="note">${f.n}</p><p class="frame-s">${f.s}</p>`;
      checker(inn, '', 'p7-frame-' + 'abcdef'[i], { part: 7, title: f.t, short: 'ABCDEF'[i] }); box.appendChild(d);
    });
  }

  /* ---------- 7b. write it yourself, then compare ---------- */
  function write(box) {
    const S = A.series(true), x = S.map(s => s.t), rbr = A.pearson(x, S.map(s => s.brown)).r, rg = A.pearson(x, S.map(s => s.green)).r;
    const key = JSON.stringify([rbr, rg]); if (box.dataset.key === key) return; box.dataset.key = key;
    const tasks = [
      { t: 'Describe a relationship: brown seaweed and rock temperature', q: 'Describe the relationship between rock temperature and brown seaweed cover. Use the sentence pattern of frame B, and comment on the shape of the scatter graph (part 6).',
        model: `There is a strong negative correlation between rock temperature and brown seaweed cover (r = ${fmt(rbr, 2)}, which is further from 0 than the critical value of 0.602). However, the points do not follow a straight line: the cover is close to 0 % above about 27 °C and rises steeply only at the coolest quadrats, near the water's edge. Pearson's r assumes a straight-line pattern, so Spearman's rank correlation would be a better test.`,
        check: ['names the direction and strength (strong negative)', 'gives r with its value', 'compares r with the critical value', 'says the pattern is not a straight line'] },
      { t: 'Evaluate a statement about sea lettuce', q: 'Sea lettuce has r = ' + fmt(rg, 2) + ' with rock temperature. A student writes: "Temperature has no effect on sea lettuce." Evaluate this statement.',
        model: `The statement is not supported. r is close to 0 because the relationship is not a straight line: sea lettuce has its highest cover at middle temperatures (about 28–31 °C) and is absent at both ends of the transect. Pearson's r measures only straight-line relationships, so a low r does not show that temperature has no effect. The upper limit may be set by temperature and drying out (its range of tolerance); the lower limit may be set by competition with brown seaweed. The band where it lives shows its realized niche.`,
        check: ['says the statement is not supported', 'describes the hump (highest in the middle)', 'explains that r measures only straight-line relationships', 'links the limits to tolerance and competition, or to the realized niche'] }
    ];
    box.innerHTML = '';
    tasks.forEach((t, i) => {
      const f = fold('Write', `Your turn ${i + 1}. ${t.t}`), d = $('.fold-in', f), id = 'p7-write-' + (i + 1); box.appendChild(f);
      A.reg({ id, part: 7, title: 'Your turn ' + (i + 1) + ': ' + t.t, short: 'Y' + (i + 1), kind: 'text' });
      d.innerHTML = `<p>${t.q}</p><textarea rows="5" aria-label="Your answer"></textarea>`;
      const b = h('button', { class: 'btn ghost', type: 'button' }, 'Show a model answer'), out = h('div');
      b.addEventListener('click', () => {
        if (!wroteEnough(d, out)) return;
        L.done(id);
        out.innerHTML = `<div class="box sea"><div class="k">A model answer</div><p>${t.model}</p><p class="note">Tick what your answer has:</p>${t.check.map(c => `<label class="tick"><input type="checkbox"> ${c}</label>`).join('')}</div>`;
      });
      d.appendChild(b); d.appendChild(again(() => { $('textarea', d).value = ''; out.innerHTML = ''; L.restart([id]); })); d.appendChild(out);
    });
  }

  /* ---------- 8. challenge ---------- */
  const slopeBarn = () => { const S = A.series(true); return A.pearson(S.map(x => x.t), S.map(x => x.barn)).b; };
  const LIMP = [0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 0, 1, 0, 3, 0, 3, 1, 0, 2, 0, 0, 4, 0, 0, 1, 4, 1];
  function challenge(box) {
    const C = [
      { type: 'num', t: 'The mean number of limpets', q: `Calculate the <b>mean</b> number of limpets per quadrat (the 30 counts above). Give your answer to 2 decimal places.`, ans: 0.90, tol: 0.006, why: 'Mean = sum ÷ number of quadrats = 27 ÷ 30 = 0.90. In Google Sheets: =AVERAGE(range).' },
      { t: 'The standard deviation', type: 'num', q: 'Calculate the <b>standard deviation</b> of the limpet counts. Give your answer to 2 decimal places.', ans: 1.27, tol: 0.006, why: 'SD = 1.27. In Google Sheets: =STDEV(range). The IB does not ask you to learn the formula (C4.1.3).' },
      { t: 'Clumped or spread at random?', type: 'mcq', q: 'For individuals spread at random, the variance (SD²) is about equal to the mean. Here the variance is 1.27² = 1.61, larger than the mean (0.90). What does this suggest about the limpets?', a: ['They are clumped: many quadrats hold none and a few hold several, so the counts vary more than chance gives.', 'They are spread evenly: most quadrats hold about one limpet, so the counts vary less than chance gives.', 'They are spread at random: each limpet settles by chance alone, so the counts vary about as much as chance gives.'], c: 0, why: 'A variance larger than the mean means the counts vary more than chance would give: the limpets are clumped. An even spread gives a variance smaller than the mean (C4.1.3: the SD shows how evenly a population is spread).' },
      { t: 'The density of limpets', type: 'num', q: 'Each quadrat is 0.5 m × 0.5 m. Calculate the <b>density</b> of limpets, in limpets per m². Give your answer to 1 decimal place.', ans: 3.6, tol: 0.051, why: 'Area of one quadrat = 0.5 m × 0.5 m = 0.25 m². Density = 0.90 ÷ 0.25 = 3.6 limpets per m².' },
      { t: 'All the limpets in the area', type: 'num', q: 'Estimate the total number of limpets in the whole 5 m × 5 m area. Give a whole number.', ans: 90, tol: 1.5, why: 'Area = 25 m². 3.6 × 25 = 90 limpets. This is an estimate: the 30 quadrats are a sample of the 100 squares in the area.' },
      { t: 'Chi-squared: expected values', type: 'mcq', q: 'Why must every expected value in a chi-squared test be at least 5?', a: ['With expected values below 5, one quadrat more or less changes χ² a lot, so the test is unreliable.', 'With expected values below 5, χ² can never pass the critical value of 3.84, so the result is never significant.', 'With expected values below 5, there are no degrees of freedom, so no critical value can be read from the table.'], c: 0, why: 'Each cell adds (O − E)² ÷ E. When E is small, dividing by it makes χ² very sensitive to chance.' },
      { t: 'A bigger quadrat', type: 'mcq', q: 'The class repeats the random sampling with 1 m × 1 m quadrats. What will probably happen?', a: ['More quadrats will hold both species, so a negative association becomes harder to detect.', 'Fewer quadrats will hold both species, so the negative association will look stronger than it is.', 'Nothing will change, because presence and absence do not depend on the size of the quadrat.'], c: 0, why: 'A bigger quadrat is more likely to include patches of both species even when they never touch. The choice of quadrat size affects presence and absence data.' },
      { t: 'When to measure the temperature', type: 'mcq', q: 'The rock temperature was measured at 0 m at the start of the low tide and at 10 m an hour later. Why is this a problem?', a: ['The rock heats up during the low tide, so the time of each reading changes it, not only the place on the shore.', 'Temperature probes read too low on wet rock, so the readings near the water’s edge are wrong, not the timing.', 'There is no problem, because an abiotic variable such as the rock temperature stays the same all through a low tide.'], c: 0, why: 'Time is an uncontrolled variable. Measure all the quadrats within a short time, or record the time and take it into account.' },
      { t: 'The gradient of the trendline', type: 'num', q: 'Use the trendline for barnacle cover against rock temperature (part 6, or =SLOPE in Google Sheets). By how many percentage points does barnacle cover increase for each 1 °C rise in rock temperature? Give your answer to 1 decimal place.', ans: () => Math.round(slopeBarn() * 10) / 10, tol: 0.06, why: () => `The gradient of the line of best fit in part 6 is ${fmt(slopeBarn(), 1)} percentage points per °C (it uses your table from part 3). In Google Sheets: =SLOPE(C2:C12, B2:B12).` },
      { t: 'Crabs: the Lincoln index', type: 'num', q: 'Shore crabs are motile, so quadrats cannot sample them (C4.1.4). On the first day you catch and mark 24 crabs, then release them. The next day you catch 30 crabs; 6 of them are marked. Use the Lincoln index to estimate the size of the crab population.', ans: 120, tol: 0.5, why: 'Population ≈ M × N ÷ R = 24 × 30 ÷ 6 = 120 crabs (M = marked first, N = caught second, R = marked recaptures).' },
      { t: 'The Lincoln index: its assumptions', type: 'mcq', q: 'Which assumption of the Lincoln index is LEAST likely to be true for these crabs?', a: ['No crabs enter or leave the area between the first sample and the second sample.', 'The marks stay on the crabs overnight and can still be seen clearly in the second sample.', 'Marked crabs mix fully with the unmarked crabs in the area before the second sample is taken.'], c: 0, why: 'A shore is open: crabs move in and out with every tide, so the population is not closed between the samples.' },
      { t: 'Design an experiment', type: 'text', q: 'Design an experiment to test whether grazing by limpets causes the negative association between limpets and sea lettuce.',
        model: 'Mark out 20 squares of rock, 0.5 m × 0.5 m, at the same height on the shore, so that abiotic conditions are similar. Choose 10 squares at random and fix a small mesh cage over each one that keeps limpets out without harming them; leave the other 10 open as controls (an empty cage frame on them controls for shade). After several weeks, estimate the percentage cover of sea lettuce in every square. If the cover is significantly higher inside the cages (for example with a t-test), this supports grazing by limpets as a cause. Remove the cages at the end.',
        check: ['an independent variable: limpets removed or present', 'a dependent variable: sea lettuce cover, with how it is measured', 'controlled variables: same shore height, same size of square', 'replicates and a control group', 'how the results show the cause'] }
    ];
    box.innerHTML = '';
    const ll = $('#limp-list'); if (ll) ll.textContent = LIMP.join(', ');
    const KIND = { num: 'Calculate', mcq: 'Choose', text: 'Design' };
    C.forEach((c, i) => {
      const f = fold(KIND[c.type], `${i + 1}. ${c.t}`), d = $('.fold-in', f), id = 'p8-c' + (i + 1); box.appendChild(f);
      A.reg(Object.assign({ id, part: 8, title: c.t, short: String(i + 1), kind: c.type }, c.type === 'mcq' ? { opts: c.a } : {}));
      d.innerHTML = `<p>${c.q}</p>`;
      const out = h('p', { 'aria-live': 'polite' });
      if (c.type === 'num') {
        const inp = h('input', { type: 'number', step: 'any', class: 'numin', 'aria-label': 'Your answer' }), b = h('button', { class: 'btn', type: 'button' }, 'Check');
        let wrong = 0;   // the working is offered only after two wrong answers
        b.addEventListener('click', () => {
          const v = parseFloat(inp.value); const ans = typeof c.ans === 'function' ? c.ans() : c.ans, why = typeof c.why === 'function' ? c.why() : c.why;
          if (isNaN(v)) { out.innerHTML = 'Type a number first.'; return; }
          L.check(id, Math.abs(v - ans) <= c.tol, [String(inp.value).trim().slice(0, 20)]);
          if (Math.abs(v - ans) <= c.tol) { out.innerHTML = `<span class="ok">✓ Correct.</span> ${why}`; return; }
          wrong++;
          out.innerHTML = `<span class="bad">✗ Not yet.</span> Try again.` + (wrong >= 2 ? ` Or <button class="linkish" type="button">show the working</button>.` : '');
          const l = out.querySelector('.linkish'); if (l) l.addEventListener('click', () => { out.innerHTML = why; });
        });
        d.appendChild(inp); d.appendChild(b); d.appendChild(again(() => { inp.value = ''; wrong = 0; out.innerHTML = ''; L.restart([id]); }));
      } else if (c.type === 'mcq') {
        const reset = A.mcq(d, c, 31 + i * 5, id); d.appendChild(again(reset)); return;
      } else {
        d.insertAdjacentHTML('beforeend', '<textarea rows="6" aria-label="Your answer"></textarea>');
        const b = h('button', { class: 'btn ghost', type: 'button' }, 'Show a model answer');
        b.addEventListener('click', () => { if (!wroteEnough(d, out)) return; L.done(id); out.innerHTML = `<div class="box sea"><div class="k">A model answer</div><p>${c.model}</p><p class="note">Tick what your answer has:</p>${c.check.map(x => `<label class="tick"><input type="checkbox"> ${x}</label>`).join('')}</div>`; });
        d.appendChild(b); d.appendChild(again(() => { $('textarea', d).value = ''; out.innerHTML = ''; L.restart([id]); }));
      }
      d.appendChild(out);
    });
  }

  /* ---------- 9. the R steps ---------- */
  const RS = [
    { t: 'Numbers in, statistics out', p: 'Type the limpet counts from the challenge into R, then find the mean, the standard deviation and the density per m².',
      code: 'limpets <- c(0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 0, 1, 0, 3, 0, 3, 1,\n             0, 2, 0, 0, 4, 0, 0, 1, 4, 1)\nmean(limpets)\nsd(limpets)\nvar(limpets)              # compare with the mean\nmean(limpets) / 0.25      # each quadrat is 0.25 m²',
      out: '[1] 0.9\n[1] 1.268994\n[1] 1.610345\n[1] 3.6', note: '<code>c()</code> joins numbers into one object. <code>&lt;-</code> gives it a name. Everything after <code>#</code> is a comment for people, not for R.' },
    { t: 'Read your transect', p: 'Download transect.csv (part 3) into the folder of your R script. Then read it and look at the first rows.',
      code: 'transect <- read.csv("transect.csv")\nhead(transect, 3)',
      out: '  distance_m temperature_C barnacles_pct sea_lettuce_pct brown_seaweed_pct limpets_n\n1          0          33.6            56               0                 2         1\n2          1          32.9            50               0                 6         3\n3          2          31.4            45              89                 0         2', note: 'A column is <code>transect$name</code>, for example <code>transect$barnacles_pct</code>.' },
    { t: 'A scatter graph and Pearson\'s r', p: 'Plot barnacle cover against rock temperature, add the line of best fit, and test the correlation.',
      code: 'plot(transect$temperature_C, transect$barnacles_pct, pch = 19,\n     xlab = "Rock temperature / °C", ylab = "Barnacle cover / %")\nabline(lm(barnacles_pct ~ temperature_C, data = transect), lty = 2)\ncor.test(transect$temperature_C, transect$barnacles_pct)',
      out: "\tPearson's product-moment correlation\n\nt = 11.109, df = 9, p-value = 1.481e-06\n...\n      cor \n0.9654182", note: 'p-value = 1.481e-06 means 0.000001481: much smaller than 0.05. Small p, big news.' },
    { t: 'Spearman\'s rank for a curved pattern', p: 'Brown seaweed does not follow a straight line. Spearman\'s rank uses only the order of the values.',
      code: 'cor.test(transect$temperature_C, transect$brown_seaweed_pct,\n         method = "spearman", exact = FALSE)',
      out: "\tSpearman's rank correlation rho\n\nS = 356.35, p-value = 0.04197\n...\n       rho \n-0.6197507", note: 'Compare with Pearson\'s r for the same data (part 6). Which one describes the graph better?' },
    { t: 'Chi-squared for an association', p: 'Put the four observed counts into a 2 × 2 table, then test it.',
      code: 'observed <- matrix(c(4, 14, 9, 3), nrow = 2,\n   dimnames = list(Limpets = c("present", "absent"),\n                   Sea_lettuce = c("present", "absent")))\ntest <- chisq.test(observed, correct = FALSE)\ntest\ntest$expected',
      out: "\tPearson's Chi-squared test\n\nX-squared = 8.1674, df = 1, p-value = 0.004265\n\n         Sea_lettuce\nLimpets   present absent\n  present     7.8    5.2\n  absent     10.2    6.8", note: '<code>matrix()</code> fills the table column by column. <code>correct = FALSE</code> gives the χ² you calculate by hand; R\'s default adds a correction the IB does not use. Use your own counts from part 4.' }
  ];
  function rsteps(box) {
    box.innerHTML = '';
    RS.forEach((s, i) => {
      const d = fold('Step ' + (i + 1), s.t, i === 0);
      $('.fold-in', d).innerHTML = `<p>${s.p}</p><pre class="code"><code>${esc(s.code)}</code></pre>` +
        `<button class="btn ghost copy" type="button">Copy the code</button>` +
        (s.out ? `<p class="note">What you should see (with this page's data):</p><pre class="code out"><code>${esc(s.out)}</code></pre>` : '') + `<p class="note">${s.note}</p>`;
      d.querySelector('.copy').addEventListener('click', async e => { try { await navigator.clipboard.writeText(s.code); e.target.textContent = 'Copied'; } catch (err) { e.target.textContent = 'Select the code and copy it'; } });
      box.appendChild(d);
    });
  }

  const R = { match1, gap2, frames, write, challenge, rsteps };
  $$('.practice').forEach(b => { if (R[b.dataset.p]) R[b.dataset.p](b); });
  document.addEventListener('partshown', e => { if (e.detail === 7) { frames($('[data-p="frames"]')); write($('[data-p="write"]')); } });
  /* The teacher's board names the questions from data/questions.json (the labs script reads it). On a local server only,
     the page compares it with its own list and says when it must be written again: copy(JSON.stringify(ShoreApp.manifest(), null, 1)). */
  /* tools/make-questions.mjs opens the page with ?manifest=1 in headless Chrome and writes data/questions.json from this */
  if (/[?&]manifest=1(&|$)/.test(location.search)) { const pre = h('pre', { id: 'manifest' }); pre.textContent = JSON.stringify(A.manifest(), null, 1); document.body.appendChild(pre); }
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    fetch('data/questions.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
      const want = JSON.stringify(A.manifest());
      if (!j || JSON.stringify(j) !== want) console.warn('data/questions.json does not match this page: write it again from ShoreApp.manifest()');
      else console.info('data/questions.json matches this page');
    }).catch(() => console.warn('data/questions.json could not be read'));
  }
})();
