# Rocky shore fieldwork — IB Biology

**Live:** https://nlcsbiology.com/rocky-shore-fieldwork-pract/

**Where it sits:** a *practical* — the documents and practice for a real practical, here the Year 12 IB
ecology field trip — listed under the IB toggle of the [Biology Hub](https://nlcsbiology.com/biology-hub/)
(Life on Earth door).

Students practise the skills of the field trip on a practice shore before they go (not the shore of their trip): a real drone photograph of a rocky
shore at low tide, with a 10 m transect and a 5 m × 5 m random-quadrat area drawn on it. Each quadrat
opens as a close-up whose seaweed patches follow the photograph at that spot; they estimate percentage
cover, lift the seaweed, count limpets, and then analyse their own numbers: a chi-squared test for
association (limpets and sea lettuce), Pearson correlation with rock temperature (three species, three
lessons: a straight line, a curve, a hump), a kite diagram, sentence frames for writing about data (every word and number typed, never chosen), harder
challenge questions (including the Lincoln index) and an R extension. Parts 1–7 take about 50 minutes; part 8
fills any time left; then about 20 minutes of real IB questions on paper, which the teacher hands out
(IB copyright, so they are not in this repository).

The ten parts are tabs along the top. The photograph stays on the left in every part and shows that part's
results: the transect, the random area zoomed in, each random quadrat in the colour of its chi-squared group,
the limpet counts of the challenge, and the temperature and cover beside each transect quadrat. After each
piece of theory a **Quick check** asks a typed or multiple-choice question (options in a new random order
each time, of similar length); in part 5, each table opens only after its quick check.

Part 10, **Your field trip**, is about the real trip, taken from the teacher's workbook (which changes every year and
is not published): a rocky shore of dark volcanic rock with shallow pools; the animals students may find (top shell
*Monodonta labio*, limpet *Cellana toreuma*, chiton *Acanthopleura japonica*), with the teacher's own photographs; what
is measured (distance, counts, water temperature, pH, salinity) and each instrument's uncertainty; belt transects of
10 quadrats, three repeats, raw data shared and processed alone; and the mini IA's three criteria by name, with links
to the Write-Up Lab. It gives no research question, no results table and no analysis of the students' own data:
those are their mini IA (memory: never do the assessment). The practice shore's downloads went to the Archive on
11 Oct 2026 for that reason.

IB Biology guide (first assessment 2025): B4.1.4, C4.1.3, C4.1.4, C4.1.15, B4.2.12–13.

## For the teacher: how each student is doing
A student who signs in with their school Google account (the line under the title; the same sign-in as the Biology Hub)
has every Check, every choice and every ↺ Start again kept for their teacher, question by question: how many checks, whether
they were right at the first check, and the wrong answers they typed or chose. It is saved a minute after their last
answer, and only for students on the teacher's class list. The teacher sees it on the teacher page's **🔬 Practicals** tab:
one square per question for each student, the questions the class finds hardest, and **● Live** during the lesson. It is
not homework and not a mark. Signed out, the page works exactly the same and nothing leaves the browser.

Behind it: `js/lesson.js` and `js/signin.js` are copies of `labs-shared/` (made by `tools/practicals-sync.mjs` in the
workspace), `js/config.js` names this practical, and `data/questions.json` lists its questions for the board
(`node tools/make-questions.mjs` writes it from the page itself; `--check` says when it is out of date). Keep a question's
id when you reword it, or its students' records move to a new square.

## The data
Simulated, and the page says so. The drone photograph is real; everything drawn on it is made for the
page. `tools/make-shore.py` builds every quadrat image and `js/shore-data.js`: green and brown seaweed
cover come from the photograph's colours at each quadrat (so the close-ups agree with the view from above,
and a random quadrat that is partly a rock pool on the photograph shows the pool water in that part);
barnacle cover, limpet numbers and rock temperatures are designed. Percentage cover is the grid count a
careful student makes (squares at least half covered). The random quadrats were chosen so that every
expected value is at least 5 (χ² = 8.17, p = 0.0043), inside one zone (the middle shore), as part 2 teaches. The source photographs are not in this repository:
`tools/source-credits.json` lists each one with its licence and page.

## Pictures
- Drone photograph of the shore: Boris Izmaylov, [Unsplash](https://unsplash.com/photos/vibrant-blue-ocean-meets-a-rocky-moss-covered-coastline-UFHcOip6GJA) (Unsplash Licence).
- Textures in the quadrats: barnacles (Stickpen, public domain), rock (Vestman, CC BY 2.0), sea lettuce
  (W.carter, CC0), brown seaweed (Ryan Hodnett, CC BY-SA 4.0), limpets *Cellana toreuma* (Jan Delsing,
  public domain); pages in `tools/source-credits.json`.
- Part 10's photographs of the top shell, limpet and chiton (`img/species/`): Dr Daniel Mompel Riera, CC BY-NC-SA 4.0,
  cropped from his own photographs; no camera or place data kept.

Made by Dr Daniel Mompel Riera, NLCS Jeju. Code: AGPL-3.0 (LICENSE). Teaching material: CC BY-NC-SA 4.0
(LICENSE-CONTENT). See NOTICE.
