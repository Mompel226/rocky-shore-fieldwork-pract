# Rocky shore fieldwork — IB Biology

**Live:** https://nlcsbiology.com/rocky-shore-fieldwork-pract/

**Where it sits:** a *practical* — the documents and practice for a real practical, here the Year 12 IB
ecology field trip — listed under the IB toggle of the [Biology Hub](https://nlcsbiology.com/biology-hub/)
(Life on Earth door).

Students practise the skills of the field trip on a practice shore before they go (not the shore of their trip): a real drone photograph of a rocky
shore at low tide, with a 10 m transect and a 5 m × 5 m random-quadrat area drawn on it. Each quadrat
opens as a diagram of a 0.5 m frame on the rock, with a key. A transect quadrat is strung 5 × 5, as many
school quadrats are: they count the squares at least half covered by each species and type its percentage cover
(squares × 4); every square is drawn clearly covered (at least 70 %) or clearly not (at most 30 %). After a
second wrong try, our count and "Show our squares" appear. They lift the seaweed to count the barnacles. In a random quadrat they count the limpets
by pressing each one (a periwinkle is not a limpet; a limpet on the frame counts only if more than half is
inside) and say whether sea lettuce is present. Then they analyse their own numbers: a chi-squared test for
association (limpets and sea lettuce), Pearson correlation with rock temperature (three species, three
lessons: a straight line, a curve, a hump), a kite diagram, sentence frames for writing about data (every word and number typed, never chosen), harder
challenge questions (including the Lincoln index) and an R extension. Parts 1–7 take about 50 minutes; part 8
fills any time left; then about 20 minutes of real IB questions on paper, which the teacher hands out
(IB copyright, so they are not in this repository).

The ten parts are tabs along the top; a thin bar under each part's name fills as its questions are answered (a green circle when all are done; version 27 replaced a ring that read as a broken circle), and each part opens with "Your task" and a tally. **Every answer survives a reload** (version 27, 12 Oct 2026): typed words and numbers, choices, written answers, model answers opened and their ticks, the marks of each Check, the chi-squared step and its unlocked tables are kept in the browser (`rocky-shore.answers`, by the question's board id) and drawn again exactly as they were; ↺ Start again forgets only its own questions. The photograph stays on the left in every part and shows that part's
results: the transect, the random area zoomed in, each random quadrat in the colour of its chi-squared group,
the limpet counts of the challenge, and the temperature and cover beside each transect quadrat. After each
piece of theory a **Quick check** asks a typed or multiple-choice question (options in a new random order
each time, of similar length); in part 5, each table opens only after its quick check, and the observed and expected tables sit side by side under the photograph, which shrinks on a short screen so the photo and both tables are seen together.

Part 10, **Your field trip**, is about the real trip, taken from the teacher's workbook (which changes every year and
is not published): a rocky shore of dark volcanic rock with shallow pools; the animals students may find (top shell
*Monodonta labio*, limpet *Cellana toreuma*, chiton *Acanthopleura japonica*), with the teacher's own photographs; what
is measured (distance, counts, water temperature, pH, salinity) and each instrument's uncertainty, and why these
non-sessile animals can still be counted in a quadrat at low tide; and the mini IA's three criteria by name, with links
to the Write-Up Lab. Its quick checks stay with that theory. A separately coloured **Get ready** panel follows, with no
questions: how the day works (belt transects of 10 quadrats, three repeats, raw data shared and processed alone), the
things to bring with pictures, safety and care for the shore. It gives no research question, no results table and no analysis of the students' own data:
those are their mini IA (memory: never do the assessment). The practice shore's downloads went to the Archive on
11 Oct 2026 for that reason.

IB Biology guide (first assessment 2025): B4.1.4, C4.1.3, C4.1.4, C4.1.15, B4.2.12–13.

## For the teacher: how each student is doing
A student who signs in with their school Google account (the line under the title; the same sign-in as the Biology Hub)
has every Check, every choice and every ↺ Start again kept for their teacher, question by question: how many checks, whether
they were right at the first check, and the wrong answers they typed or chose. It is saved a minute after their last
answer, and only for students on the teacher's class list. The teacher sees it on the teacher page's **🔬 Practicals** tab:
one square per question for each student, the questions the class finds hardest, and **● Live** during the lesson. It is
not homework and not a mark. Signed out, the page works exactly the same and nothing leaves the browser. The answers themselves stay in the browser either way: on another computer the board still has the record, but the boxes start empty.

Behind it: `js/lesson.js` and `js/signin.js` are copies of `labs-shared/` (made by `tools/practicals-sync.mjs` in the
workspace), `js/config.js` names this practical, and `data/questions.json` lists its questions for the board
(`node tools/make-questions.mjs` writes it from the page itself; `--check` says when it is out of date). Keep a question's
id when you reword it, or its students' records move to a new square.

## The data
Simulated, and the page says so. The drone photograph is real; everything drawn on it is made for the page.
`tools/make-shore.py` draws every quadrat as a diagram (`img/quad/*.svg`) and writes `js/shore-data.js` (12 Oct 2026:
the photo close-ups before it could not be read, and are in the estate's Archive). Seaweed patches follow the drone
photograph's colours at each quadrat; the cover of each species is the grid count of what is drawn (squares at least
half covered, 4 % each), and the generator refuses a drawing with any square between 30 % and 70 % covered. The covers
are the first build's rounded to whole squares (12 Oct 2026, version 26), so the patterns are the same: barnacles
r = 0.98 with temperature, brown seaweed r = −0.82 (Spearman's ρ = −0.71), sea lettuce a hump. `sq` in the data is
our grid for "Show our squares"; `an` lists each animal of a random quadrat (position, limpet or periwinkle, counted
or not). The random quadrats were chosen so that every expected value is at least 5 (χ² = 8.17, p = 0.0043), inside one
zone (the middle shore), as part 2 teaches. Copy and Download in part 3 give exactly the numbers the page uses, so r in
Google Sheets is the page's r. The generator needs the drone photograph in `full/` (not in this repository; its licence
is in `tools/source-credits.json`).

## Pictures
- Drone photograph of the shore: Boris Izmaylov, [Unsplash](https://unsplash.com/photos/vibrant-blue-ocean-meets-a-rocky-moss-covered-coastline-UFHcOip6GJA) (Unsplash Licence).
- The quadrat diagrams: drawn by `tools/make-shore.py` for this page (CC BY-NC-SA 4.0, as the teaching material).
- Part 10's photographs of the top shell, limpet and chiton (`img/species/`): Dr Daniel Mompel Riera, CC BY-NC-SA 4.0,
  cropped from his own photographs; no camera or place data kept.
- Part 10's pictures of the things to bring (`img/kit/`): [Fluent Emoji](https://github.com/microsoft/fluentui-emoji),
  Microsoft, MIT licence (its notice in `img/kit/LICENSE-fluentui-emoji.txt`).

Made by Dr Daniel Mompel Riera, NLCS Jeju. Code: AGPL-3.0 (LICENSE). Teaching material: CC BY-NC-SA 4.0
(LICENSE-CONTENT). See NOTICE.
