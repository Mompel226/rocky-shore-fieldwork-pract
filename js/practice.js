/* Rocky shore fieldwork · the practice: key words, sentence frames, challenge questions and the R steps.
   Every check happens in the browser; nothing is sent anywhere. */
(function () {
  'use strict';
  const A = window.ShoreApp, $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const h = A.h, fmt = A.fmt;
  const shuffle = (a, seed) => { const b = a.slice(); let s = seed || 7; for (let i = b.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  /* A card the student opens in place (one open at a time in a part: app.js) */
  function fold(kind, title, open) {
    const d = h('details', { class: 'fold' }); if (open) d.open = true;
    d.innerHTML = `<summary><span class="fk">${kind}</span><span class="ft">${title}</span></summary><div class="fold-in"></div>`;
    return d;
  }

  /* A select with its options; data-ans holds the right one */
  function sel(opts, ans, seed) {
    const o = shuffle(opts.includes(ans) ? opts : opts.concat([ans]), seed);
    return `<select class="gap" data-ans="${esc(ans)}"><option value="">…</option>${o.map(x => `<option>${esc(x)}</option>`).join('')}</select>`;
  }
  function checker(box, after) {
    const out = h('p', { 'aria-live': 'polite' }), b = h('button', { class: 'btn', type: 'button' }, 'Check');
    b.addEventListener('click', () => {
      let ok = 0, n = 0;
      $$('select.gap', box).forEach(s => { n++; const good = s.value === s.dataset.ans; if (good) ok++; s.classList.toggle('right', good); s.classList.toggle('wrong', !good && s.value !== ''); });
      out.innerHTML = ok === n ? `<span class="ok">✓ All ${n} correct.</span>${after ? ' ' + after : ''}` : `<span class="bad">${ok} of ${n} correct.</span> Change the ones marked in red, then check again.`;
    });
    box.appendChild(b); box.appendChild(out);
  }

  /* ---------- 1. match each meaning to its word ---------- */
  const TERMS = ['sessile', 'motile', 'percentage cover', 'abundance', 'zonation', 'abiotic variable', 'range of tolerance', 'realized niche'];
  const MATCH = [
    ['Fixed in one place: it cannot move from place to place.', 'sessile'],
    ['Able to move from place to place.', 'motile'],
    ['The percentage of the area of a quadrat covered by one species, seen from above.', 'percentage cover'],
    ['The number of individuals of a species in a sample.', 'abundance'],
    ['Species found in bands across an area, following a gradient.', 'zonation'],
    ['A non-living factor that can be measured, such as temperature.', 'abiotic variable'],
    ['The range of an abiotic variable in which a species can survive.', 'range of tolerance'],
    ['The part of its potential niche that a species actually occupies when it competes with other species.', 'realized niche']
  ];
  function match1(box) {
    box.innerHTML = '<h3>Practise the words</h3><p class="note">Choose the word for each meaning.</p>';
    const t = h('div'); t.innerHTML = MATCH.map(([d, w], i) => `<p class="mrow">${i + 1}. ${d} ${sel(TERMS, w, i + 3)}</p>`).join('');
    box.appendChild(t); checker(box, 'Use these words in your answers: they are the words in the mark schemes.');
  }

  /* ---------- 2. fill the gaps from a word bank ---------- */
  const BANK = ['transect', 'gradient', 'continuous', 'interrupted', 'random', 'bias', 'motile', 'sessile', 'percentage cover', 'count'];
  function gap2(box) {
    box.innerHTML = '<h3>Fill the gaps</h3><p class="note">Word bank: ' + BANK.join(' · ') + '</p>';
    const s = [
      `A ${sel(BANK, 'transect', 1)} is used to sample along a ${sel(BANK, 'gradient', 2)}, such as the shore from the sea to the land.`,
      `A ${sel(BANK, 'continuous', 3)} belt transect places quadrats side by side; an ${sel(BANK, 'interrupted', 4)} belt transect places them at regular intervals.`,
      `In an area with no gradient, quadrats are placed at ${sel(BANK, 'random', 5)} positions to avoid ${sel(BANK, 'bias', 6)}.`,
      `Crabs are ${sel(BANK, 'motile', 7)}, so they are not sampled with quadrats. Barnacles are ${sel(BANK, 'sessile', 8)}.`,
      `For seaweed, estimate the ${sel(BANK, 'percentage cover', 9)}; for limpets, ${sel(BANK, 'count', 10)} the individuals.`
    ];
    const t = h('div'); t.innerHTML = s.map((x, i) => `<p class="mrow">${i + 1}. ${x}</p>`).join(''); box.appendChild(t); checker(box);
  }

  /* ---------- 7. sentence frames, built from the student's own numbers ---------- */
  function frames(box) {
    const S = A.series(true), x = S.map(s => s.t);
    const rb = A.pearson(x, S.map(s => s.barn)).r, rbr = A.pearson(x, S.map(s => s.brown)).r;
    const k = A.chi(), neg = k.O[0][0] < k.E[0][0], sig = k.X > 3.84;
    const strength = r => Math.abs(r) >= 0.7 ? 'strong' : Math.abs(r) >= 0.4 ? 'moderate' : 'weak';
    const peakG = S.reduce((a, s) => s.green > a.green ? s : a, S[0]);
    const gZone = S.filter(s => s.green >= 50).map(s => s.d), gFrom = gZone.length ? Math.min(...gZone) : peakG.d, gTo = gZone.length ? Math.max(...gZone) : peakG.d;
    const F = [
      { t: 'A. Describe the kite diagram', n: 'Describe where each species is found along the transect. Use the kite diagram in part 6.',
        s: `Barnacles have their highest cover at the ${sel(['top of the shore', "water's edge", 'middle of the shore'], 'top of the shore', 11)}, and their cover ${sel(['decreases', 'increases', 'stays the same'], 'decreases', 12)} towards the water's edge. Sea lettuce is found mainly between ${sel([`${gFrom} m and ${gTo} m`, '0 m and 2 m', '8 m and 10 m'], `${gFrom} m and ${gTo} m`, 13)}. Brown seaweed is found ${sel(["mainly near the water's edge", 'evenly along the whole transect', 'mainly at the top of the shore'], "mainly near the water's edge", 14)}. This pattern of bands is called ${sel(['zonation', 'succession', 'competition'], 'zonation', 15)}.` },
      { t: 'B. State a correlation, with its evidence', n: 'Barnacle cover and rock temperature.',
        s: `There is a ${sel(['strong', 'moderate', 'weak'], strength(rb), 21)} ${sel(['positive', 'negative'], rb > 0 ? 'positive' : 'negative', 22)} correlation between rock temperature and barnacle cover (r = ${sel([fmt(rb, 2), fmt(-rb, 2), fmt(rb * rb, 2)], fmt(rb, 2), 23)}). Because r is ${sel(['further from 0 than', 'closer to 0 than'], Math.abs(rb) > 0.602 ? 'further from 0 than' : 'closer to 0 than', 24)} the critical value of ${sel(['0.602', '3.84', '0.05'], '0.602', 25)}, the correlation is ${sel(['significant', 'not significant'], Math.abs(rb) > 0.602 ? 'significant' : 'not significant', 26)} (p ${Math.abs(rb) > 0.602 ? '<' : '>'} 0.05).` },
      { t: 'C. Correlation is not cause', n: 'Say what the correlation does not show, and why.',
        s: `This correlation ${sel(['does not show', 'proves'], 'does not show', 31)} that temperature causes the change in barnacle cover, because ${sel(['another variable, such as the time out of the water, also changes along the shore', 'r is less than 1', 'barnacles are animals'], 'another variable, such as the time out of the water, also changes along the shore', 32)}. A ${sel(['controlled experiment', 'larger quadrat', 'kite diagram'], 'controlled experiment', 33)} that changes only the temperature would give stronger evidence.` },
      { t: 'D. Conclude from a chi-squared test', n: 'Limpets and sea lettuce in the random quadrats.',
        s: `The calculated χ² value (${sel([fmt(k.X, 2), '3.84', fmt(k.p, 3)], fmt(k.X, 2), 41)}) is ${sel(['greater than', 'less than'], sig ? 'greater than' : 'less than', 42)} the critical value (${sel(['3.84', '0.602', '5.99'], '3.84', 43)}) at ${sel(['1 degree of freedom', '2 degrees of freedom', '4 degrees of freedom'], '1 degree of freedom', 44)}, so the null hypothesis is ${sel(['rejected', 'not rejected'], sig ? 'rejected' : 'not rejected', 45)}.` +
          (sig ? ` Limpets and sea lettuce are found together ${sel(['less', 'more'], neg ? 'less' : 'more', 46)} often than expected: a ${sel(['negative', 'positive'], neg ? 'negative' : 'positive', 47)} association.` : '') },
      { t: 'E. A limitation and an improvement', n: 'Evaluate the method.',
        s: `One limitation is that only ${sel(['one transect', 'one species', 'one quadrat size'], 'one transect', 51)} was sampled, so the results may not be ${sel(['representative of the whole shore', 'accurate to 1 %', 'motile'], 'representative of the whole shore', 52)}. To improve the investigation, ${sel(['repeat the transect at three places along the shore and calculate the mean cover at each distance', 'use a bigger tape measure', 'measure the temperature once at the start'], 'repeat the transect at three places along the shore and calculate the mean cover at each distance', 53)}.` },
      { t: 'F. Link the data to niches', n: 'Use the words of B4.2.12.',
        s: `The upper limit of brown seaweed on the shore is probably set by ${sel(['an abiotic variable, such as drying out at low tide', 'grazing by limpets', 'the size of the quadrat'], 'an abiotic variable, such as drying out at low tide', 61)}. Where a species actually lives, when it competes with other species, is its ${sel(['realized', 'fundamental'], 'realized', 62)} niche. With no competitors it could often live in a wider zone: its ${sel(['fundamental', 'realized'], 'fundamental', 63)} niche.` }
    ];
    box.innerHTML = '';
    F.forEach((f, i) => {
      const d = fold('Frame', f.t, i === 0), inn = $('.fold-in', d); inn.innerHTML = `<p class="note">${f.n}</p><p class="frame-s">${f.s}</p>`;
      checker(inn); box.appendChild(d);
    });
  }

  /* ---------- 7b. write it yourself, then compare ---------- */
  function write(box) {
    const S = A.series(true), x = S.map(s => s.t), rbr = A.pearson(x, S.map(s => s.brown)).r, rg = A.pearson(x, S.map(s => s.green)).r;
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
      const f = fold('Write', `Your turn ${i + 1}. ${t.t}`), d = $('.fold-in', f); box.appendChild(f);
      d.innerHTML = `<p>${t.q}</p><textarea rows="5" aria-label="Your answer"></textarea>`;
      const b = h('button', { class: 'btn ghost', type: 'button' }, 'Show a model answer'), out = h('div');
      b.addEventListener('click', () => {
        out.innerHTML = `<div class="box sea"><div class="k">A model answer</div><p>${t.model}</p><p class="note">Tick what your answer has:</p>${t.check.map(c => `<label class="tick"><input type="checkbox"> ${c}</label>`).join('')}</div>`;
      });
      d.appendChild(b); d.appendChild(out);
    });
  }

  /* ---------- 8. challenge ---------- */
  const slopeBarn = () => { const S = A.series(true); return A.pearson(S.map(x => x.t), S.map(x => x.barn)).b; };
  const LIMP = [0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 0, 1, 0, 3, 0, 3, 1, 0, 2, 0, 0, 4, 0, 0, 1, 4, 1];
  function challenge(box) {
    const C = [
      { type: 'num', t: 'The mean number of limpets', q: `Calculate the <b>mean</b> number of limpets per quadrat (the 30 counts above). Give your answer to 2 decimal places.`, ans: 0.90, tol: 0.006, why: 'Mean = sum ÷ number of quadrats = 27 ÷ 30 = 0.90. In Google Sheets: =AVERAGE(range).' },
      { t: 'The standard deviation', type: 'num', q: 'Calculate the <b>standard deviation</b> of the limpet counts. Give your answer to 2 decimal places.', ans: 1.27, tol: 0.006, why: 'SD = 1.27. In Google Sheets: =STDEV(range). The IB does not ask you to learn the formula (C4.1.3).' },
      { t: 'Clumped or spread at random?', type: 'mcq', q: 'For individuals spread at random, the variance (SD²) is about equal to the mean. Here the variance is 1.27² = 1.61, larger than the mean (0.90). What does this suggest about the limpets?', a: ['They are clumped: many quadrats have none and a few have several.', 'They are spread evenly over the rock.', 'They are spread at random.'], c: 0, why: 'A variance larger than the mean means the counts vary more than chance would give: the limpets are clumped. An even spread gives a variance smaller than the mean (C4.1.3: the SD shows how evenly a population is spread).' },
      { t: 'The density of limpets', type: 'num', q: 'Each quadrat is 0.5 m × 0.5 m. Calculate the <b>density</b> of limpets, in limpets per m². Give your answer to 1 decimal place.', ans: 3.6, tol: 0.051, why: 'Area of one quadrat = 0.5 m × 0.5 m = 0.25 m². Density = 0.90 ÷ 0.25 = 3.6 limpets per m².' },
      { t: 'All the limpets in the area', type: 'num', q: 'Estimate the total number of limpets in the whole 5 m × 5 m area. Give a whole number.', ans: 90, tol: 1.5, why: 'Area = 25 m². 3.6 × 25 = 90 limpets. This is an estimate: the 30 quadrats are a sample of the 100 squares in the area.' },
      { t: 'Chi-squared: expected values', type: 'mcq', q: 'Why must every expected value in a chi-squared test be at least 5?', a: ['With small expected values, one quadrat more or less changes χ² a lot, so the test is unreliable.', 'Because the critical value is 3.84.', 'Because a quadrat has 100 squares.'], c: 0, why: 'Each cell adds (O − E)² ÷ E. When E is small, dividing by it makes χ² very sensitive to chance.' },
      { t: 'A bigger quadrat', type: 'mcq', q: 'The class repeats the random sampling with 1 m × 1 m quadrats. What will probably happen?', a: ['More quadrats will hold both species, so an association is harder to detect.', 'Nothing changes: quadrat size does not matter.', 'There will be fewer limpets in each quadrat.'], c: 0, why: 'A bigger quadrat is more likely to include patches of both species even when they never touch. The choice of quadrat size affects presence and absence data.' },
      { t: 'When to measure the temperature', type: 'mcq', q: 'The rock temperature was measured at 0 m at the start of the low tide and at 10 m an hour later. Why is this a problem?', a: ['The rock heats up during the low tide, so the time of measurement changes the temperature, not only the position on the shore.', 'Temperature probes do not work on wet rock.', 'There is no problem: temperature is an abiotic variable.'], c: 0, why: 'Time is an uncontrolled variable. Measure all the quadrats within a short time, or record the time and take it into account.' },
      { t: 'The gradient of the trendline', type: 'num', q: 'Use the trendline for barnacle cover against rock temperature (part 6, or =SLOPE in Google Sheets). By how many percentage points does barnacle cover increase for each 1 °C rise in rock temperature? Give your answer to 1 decimal place.', ans: () => Math.round(slopeBarn() * 10) / 10, tol: 0.06, why: () => `The gradient of the line of best fit in part 6 is ${fmt(slopeBarn(), 1)} percentage points per °C (it uses your table from part 3). In Google Sheets: =SLOPE(C2:C12, B2:B12).` },
      { t: 'Crabs: the Lincoln index', type: 'num', q: 'Shore crabs are motile, so quadrats cannot sample them (C4.1.4). On the first day you catch and mark 24 crabs, then release them. The next day you catch 30 crabs; 6 of them are marked. Use the Lincoln index to estimate the size of the crab population.', ans: 120, tol: 0.5, why: 'Population ≈ M × N ÷ R = 24 × 30 ÷ 6 = 120 crabs (M = marked first, N = caught second, R = marked recaptures).' },
      { t: 'The Lincoln index: its assumptions', type: 'mcq', q: 'Which assumption of the Lincoln index is LEAST likely to be true for these crabs?', a: ['No crabs enter or leave the area between the two samples.', 'The marks do not fall off overnight.', 'Marked crabs mix with unmarked crabs before the second sample.'], c: 0, why: 'A shore is open: crabs move in and out with every tide, so the population is not closed between the samples.' },
      { t: 'Design an experiment', type: 'text', q: 'Design an experiment to test whether grazing by limpets causes the negative association between limpets and sea lettuce.',
        model: 'Mark out 20 squares of rock, 0.5 m × 0.5 m, at the same height on the shore, so that abiotic conditions are similar. Choose 10 squares at random and fix a small mesh cage over each one that keeps limpets out without harming them; leave the other 10 open as controls (an empty cage frame on them controls for shade). After several weeks, estimate the percentage cover of sea lettuce in every square. If the cover is significantly higher inside the cages (for example with a t-test), this supports grazing by limpets as a cause. Remove the cages at the end.',
        check: ['an independent variable: limpets removed or present', 'a dependent variable: sea lettuce cover, with how it is measured', 'controlled variables: same shore height, same size of square', 'replicates and a control group', 'how the results show the cause'] }
    ];
    box.innerHTML = '';
    const ll = $('#limp-list'); if (ll) ll.textContent = LIMP.join(', ');
    const KIND = { num: 'Calculate', mcq: 'Choose', text: 'Design' };
    C.forEach((c, i) => {
      const f = fold(KIND[c.type], `${i + 1}. ${c.t}`), d = $('.fold-in', f); box.appendChild(f);
      d.innerHTML = `<p>${c.q}</p>`;
      const out = h('p', { 'aria-live': 'polite' });
      if (c.type === 'num') {
        const inp = h('input', { type: 'number', step: 'any', class: 'numin', 'aria-label': 'Your answer' }), b = h('button', { class: 'btn', type: 'button' }, 'Check');
        b.addEventListener('click', () => { const v = parseFloat(inp.value); const ans = typeof c.ans === 'function' ? c.ans() : c.ans, why = typeof c.why === 'function' ? c.why() : c.why; out.innerHTML = isNaN(v) ? 'Type a number first.' : Math.abs(v - ans) <= c.tol ? `<span class="ok">✓ Correct.</span> ${why}` : `<span class="bad">✗ Not yet.</span> Try again, or <button class="linkish" type="button">show the working</button>.`; const l = out.querySelector('.linkish'); if (l) l.addEventListener('click', () => { out.innerHTML = why; }); });
        d.appendChild(inp); d.appendChild(b);
      } else if (c.type === 'mcq') {
        c.a.forEach((txt, j) => { const b = h('button', { class: 'btn ghost', type: 'button' }, txt); b.addEventListener('click', () => { out.innerHTML = (j === c.c ? '<span class="ok">✓ Correct.</span> ' : '<span class="bad">✗ Not this one.</span> ') + c.why; }); d.appendChild(b); });
      } else {
        d.insertAdjacentHTML('beforeend', '<textarea rows="6" aria-label="Your answer"></textarea>');
        const b = h('button', { class: 'btn ghost', type: 'button' }, 'Show a model answer');
        b.addEventListener('click', () => { out.innerHTML = `<div class="box sea"><div class="k">A model answer</div><p>${c.model}</p><p class="note">Tick what your answer has:</p>${c.check.map(x => `<label class="tick"><input type="checkbox"> ${x}</label>`).join('')}</div>`; });
        d.appendChild(b);
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
      out: "\tPearson's Chi-squared test\n\nX-squared = 8.1674, df = 1, p-value = 0.004265\n\n         Sea_lettuce\nLimpets   present absent\n  present     7.8    5.2\n  absent     10.2    6.8", note: '<code>matrix()</code> fills the table column by column. <code>correct = FALSE</code> gives the χ² you calculate by hand; R\'s default adds a correction the IB does not use. Use your own counts from part 4.' },
    { t: 'The whole analysis in one file', p: 'fieldwork.R (below) also draws the kite diagram. In section 3, change barnacles_pct to sea_lettuce_pct in all three places, and explain what the new graph shows.',
      code: '# in fieldwork.R, section 3: barnacles_pct  →  sea_lettuce_pct (three places)', out: '', note: 'A hump-shaped scatter graph and r close to 0: the same lesson as part 6.' }
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
})();
