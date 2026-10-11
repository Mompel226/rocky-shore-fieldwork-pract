# Rocky shore fieldwork — IB Biology

**Live:** https://nlcsbiology.com/rocky-shore-fieldwork-pract/

**Where it sits:** a *practical* — the documents and practice for a real practical, here the Year 12 IB
ecology field trip — listed under the IB toggle of the [Biology Hub](https://nlcsbiology.com/biology-hub/)
(Life on Earth door).

Students practise the field trip on a virtual shore before they go: a real drone photograph of a rocky
shore at low tide, with a 10 m transect and a 5 m × 5 m random-quadrat area drawn on it. Each quadrat
opens as a close-up whose seaweed patches follow the photograph at that spot; they estimate percentage
cover, lift the seaweed, count limpets, and then analyse their own numbers: a chi-squared test for
association (limpets and sea lettuce), Pearson correlation with rock temperature (three species, three
lessons: a straight line, a curve, a hump), a kite diagram, sentence frames for writing about data (every word and number typed, never chosen), harder
challenge questions (including the Lincoln index) and an R extension. Parts 1–7 take about 50 minutes; part 8
fills any time left; then about 20 minutes of real IB questions on paper, which the teacher hands out
(IB copyright, so they are not in this repository).

IB Biology guide (first assessment 2025): B4.1.4, C4.1.3, C4.1.4, C4.1.15, B4.2.12–13.

## Downloads (in `downloads/`)
- `fieldwork-recording-sheet.docx` — the recording sheet for the shore.
- `fieldwork-workbook.xlsx` — opens in Google Sheets: yellow cells for data; CORREL, RSQ, CHISQ.TEST and
  CHISQ.INV.RT set up and shown as text beside each result.
- `fieldwork.R` — kite diagram, cor.test() and chisq.test(correct = FALSE); reads the two CSV files the
  page exports, or uses the page's data.

## The data
Simulated, and the page says so. The drone photograph is real; everything drawn on it is made for the
page. `tools/make-shore.py` builds every quadrat image and `js/shore-data.js`: green and brown seaweed
cover come from the photograph's colours at each quadrat (so the close-ups agree with the view from above,
and a random quadrat that is partly a rock pool on the photograph shows the pool water in that part);
barnacle cover, limpet numbers and rock temperatures are designed. Percentage cover is the grid count a
careful student makes (squares at least half covered). The random quadrats were chosen so that every
expected value is at least 5 (χ² = 8.17, p = 0.0043), inside one zone (the middle shore), as part 2 teaches. The source photographs are not in this repository:
`tools/source-credits.json` lists each one with its licence and page.

`tools/make-workbook.py`, `tools/make-recording-sheet.py` and `tools/make-r.py` build the workbook, the recording
sheet and `fieldwork.R`.

## Pictures
- Drone photograph of the shore: Boris Izmaylov, [Unsplash](https://unsplash.com/photos/vibrant-blue-ocean-meets-a-rocky-moss-covered-coastline-UFHcOip6GJA) (Unsplash Licence).
- Textures in the quadrats: barnacles (Stickpen, public domain), rock (Vestman, CC BY 2.0), sea lettuce
  (W.carter, CC0), brown seaweed (Ryan Hodnett, CC BY-SA 4.0), limpets *Cellana toreuma* (Jan Delsing,
  public domain); pages in `tools/source-credits.json`.

Made by Dr Daniel Mompel Riera, NLCS Jeju. Code: AGPL-3.0 (LICENSE). Teaching material: CC BY-NC-SA 4.0
(LICENSE-CONTENT). See NOTICE.
