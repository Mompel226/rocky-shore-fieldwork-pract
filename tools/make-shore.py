#!/usr/bin/env python3
"""Virtual rocky shore: the drone photograph (Boris Izmaylov, Unsplash, UFHcOip6GJA) for the map, and a DIAGRAM for
each quadrat (12 Oct 2026, Daniel and his students: the photo close-ups were impossible to read; "generate diagrams …
much easier to count individuals or surface area").

Each quadrat is a 0.5 m x 0.5 m frame lying on pale rock, drawn from above at true size (1000 units inside the frame,
so 1 cm = 20 units): sea lettuce as bright green sheets, brown seaweed as olive fronds, barnacles as a crowd of small
cones, limpets as ribbed cone shells, periwinkles as coiled snails. No grid is drawn: the page lays its own grid over
a transect quadrat (press the squares that are at least half covered) and lets a pupil press each limpet as it is
counted in a random quadrat.

The numbers are the first build's and do not change: % cover in each transect quadrat (the grid count a careful pupil
makes: squares at least half covered, C4.1 and B4.1 decks), and the limpets and sea lettuce of each random quadrat.
The count is taken from the drawn shapes themselves, so what a pupil sees is what is counted.
Run it in the folder that holds full/us_UF_orig.jpg; it writes out4/quad/*.svg, out4/shore.jpg and out4/shore-data.js,
which go to the page's img/quad/, img/ and js/."""
import json, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, zoom, binary_opening, binary_closing, binary_dilation
from skimage.measure import find_contours, approximate_polygon
OUT = "out4"; os.makedirs(f"{OUT}/quad", exist_ok=True)
S = 1000; M = 80; C = S + 2 * M; PX = 100        # inside the frame (0.5 m); rock round it; canvas; drone px per metre
AER = Image.open("full/us_UF_orig.jpg").convert("RGB"); AW, AH = AER.size
hsv = np.asarray(AER.convert("HSV")).astype(float) / 255; hh = hsv[..., 0] * 360; ss = hsv[..., 1]; vv = hsv[..., 2]
GREEN = ((hh >= 55) & (hh <= 110) & (ss > .30) & (vv > .40)).astype(float)
BROWN = ((hh >= 10) & (hh < 55) & (ss > .30) & (vv < .62)).astype(float)
POOL = ((vv < .45) & (ss < .35)).astype(float)
WATER = binary_closing(binary_opening((hh >= 170) & (hh <= 290) & (ss < .35) & (vv < .72), iterations=2), iterations=3)
WATER = binary_dilation(WATER, iterations=4).astype(float)
CROP = (int(.55 * AW), int(.40 * AH), int(.95 * AW), AH)        # the part of the photo shown on the page

# ---------- shapes: a smooth patch, its outline as an SVG path, and the grid count of what is drawn
def cells(m, n=10):
    """the fraction of each of the n x n squares inside the frame that a mask covers"""
    return m[M:M + S, M:M + S].reshape(n, S // n, n, S // n).mean(axis=(1, 3))
def count(m, n=10): return int((cells(m, n) >= .5).sum())
G = 5               # a transect quadrat is strung 5 x 5, as many school quadrats are: each square 4 % (12 Oct 2026)
def outline(mask):
    """the mask's edge as closed polygons (holes included), smoothed a little"""
    f = gaussian_filter(np.pad(mask.astype(float), 2), 1.5)
    polys = []
    for c in find_contours(f, .5):
        c = approximate_polygon(c - 2, tolerance=1.6)
        if len(c) < 4: continue
        x, y = c[:, 1], c[:, 0]
        if abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))) / 2 < 900: continue     # no specks under 1.5 cm across
        polys.append([(float(x_), float(y_)) for y_, x_ in c])
    return polys
def drawn(polys):
    """what the outline covers when drawn with the even-odd rule: the mask the count is taken from"""
    acc = np.zeros((C, C), bool)
    for p in polys:
        im = Image.new("1", (C, C), 0); ImageDraw.Draw(im).polygon(p, fill=1); acc ^= np.asarray(im, bool)
    return acc.astype(float)
def path_d(polys): return " ".join("M" + "L".join(f"{x:.0f},{y:.0f}" for x, y in p) + "Z" for p in polys)
def aerial_bias(cls, cx, cy):
    h = int(PX * .3); win = cls[cy - h:cy + h, cx - h:cx + h]
    return np.clip(zoom(gaussian_filter(win, 1.2), C / win.shape[0], order=1)[:C, :C], 0, 1)
def patch(target, sigma, rng, bias=None, keep_out=None, under=None):
    """A smooth patch whose drawn outline covers exactly `target` squares (seen from above: minus `under`, the parts
    hidden beneath another species). Returns (polygons, mask)."""
    if target <= 0: return [], np.zeros((C, C))
    for attempt in range(40):
        n = gaussian_filter(rng.normal(size=(C, C)), sigma); n /= n.std()
        n += .35 * (lambda f: f / f.std())(gaussian_filter(rng.normal(size=(C, C)), sigma / 3))
        if bias is not None and bias.std() > .02: n += 1.2 * (bias - bias.mean()) / bias.std()
        if keep_out is not None: n -= 6 * keep_out
        lo, hi = float(n.min()), float(n.max())
        for _ in range(60):
            mid = (lo + hi) / 2; polys = outline(n >= mid); m = drawn(polys)
            seen = m * (1 - under) if under is not None else m
            g = count(seen)
            if g == target: return polys, m
            lo, hi = (mid, hi) if g > target else (lo, mid)
    raise SystemExit(f"no patch of exactly {target} squares")

LO, HI = .3, .7     # a square a pupil must press is at least 70 % covered; any other square at most 30 % (12 Oct 2026)
def clear_squares(frac, chosen):
    """True when every chosen square is clearly covered and every other square clearly not"""
    return bool((frac[chosen] >= HI).all() and (frac[~chosen] <= LO).all())
def cell_patch(target, rng, bias=None, allowed=None, under=None):
    """A patch for a TRANSECT quadrat, where pupils press the squares at least half covered (Daniel, 12 Oct 2026: "make
    sure that it is very, very clear when a square is half covered … for all of the species"). `target` squares are
    chosen (clustered, following the drone photo where `bias` is given, only where `allowed`); the outline follows them
    with soft, wavy edges, and is kept only if each chosen square is at least 70 % covered and each other square at
    most 30 % (seen from above: minus `under`, the sea lettuce lying over it). Returns (polygons, mask)."""
    if target <= 0: return [], np.zeros((C, C))
    hide = under if under is not None else np.zeros((C, C))
    for attempt in range(400):
        sc = gaussian_filter(rng.normal(size=(G, G)), .8); sc = (sc - sc.mean()) / sc.std()
        if bias is not None and bias.std() > .02: b = cells(bias, G); sc = sc + 1.2 * (b - b.mean()) / (b.std() + 1e-9)
        if allowed is not None: sc = np.where(allowed, sc, -99)
        order = np.argsort(-sc.ravel()); chosen = np.zeros(G * G, bool); chosen[order[:target]] = True; chosen = chosen.reshape(G, G)
        if allowed is not None and not (chosen <= allowed).all(): raise SystemExit("not enough room for the patch")
        I = np.kron(chosen.astype(float), np.ones((S // G, S // G)))
        I = np.pad(I, M, mode="edge")                                   # the patch carries on under the frame and beyond
        amp = .16 if attempt < 200 else .10
        n = gaussian_filter(rng.normal(size=(C, C)), 20); n = n / n.std() * amp
        f = gaussian_filter(I, 22) + n
        polys = outline(f > .5); m = drawn(polys)
        if clear_squares(cells(m * (1 - hide), G), chosen): return polys, m
    raise SystemExit(f"no clear patch of {target} squares")

# ---------- the drawings, in one field-guide style: muted natural colours, a thin dark outline, one highlight
def _limpet_symbol():
    """a limpet from above: an egg-shaped cone, its apex towards the front, ribs running out to a scalloped rim"""
    pts, ribs = [], []
    for i in range(96):
        t = 2 * math.pi * i / 96; r = 1 + .045 * math.sin(24 * t)
        x = 38 * r * math.cos(t) * (1 - .10 * math.cos(t)); y = 31 * r * math.sin(t); pts.append((x, y))
    for i in range(0, 96, 4): ribs.append(f'M-8,-2L{pts[i][0] * .95:.1f},{pts[i][1] * .95:.1f}')
    rim = "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    return (f'<symbol id="q-limpet" viewBox="-46 -39 92 78" overflow="visible">'
            f'<path d="{rim}" transform="translate(4,5)" fill="#000" opacity=".22"/>'
            f'<path d="{rim}" fill="url(#q-lg)" stroke="#4A2A10" stroke-width="2.2"/>'
            f'<path d="{" ".join(ribs)}" stroke="#7A4A22" stroke-width="1.8" opacity=".7" fill="none"/>'
            f'<ellipse cx="-8" cy="-2" rx="6" ry="5" fill="#F1E2C4" stroke="#7A4A22" stroke-width="1.4"/></symbol>')
DEFS = """<defs>
<radialGradient id="q-lg" cx="38%" cy="46%" r="70%"><stop offset="0" stop-color="#EEDCB6"/><stop offset=".5" stop-color="#C08549"/><stop offset="1" stop-color="#7E4E23"/></radialGradient>
<radialGradient id="q-pg" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#A39383"/><stop offset=".6" stop-color="#5E4E40"/><stop offset="1" stop-color="#2F261F"/></radialGradient>
""" + _limpet_symbol() + """
<symbol id="q-snail" viewBox="-28 -28 56 56" overflow="visible">
 <circle cx="3" cy="4" r="21" fill="#000" opacity=".22"/>
 <circle r="21" fill="url(#q-pg)" stroke="#231B15" stroke-width="2.2"/>
 <path d="M2,1 a3,3 0 1,1 -5,-2 a7,7 0 1,1 12,4 a12,12 0 1,1 -19,-9 a17,17 0 0,1 27,-4" fill="none" stroke="#1B1511" stroke-width="2.2"/>
 <path d="M2,1 a3,3 0 1,1 -5,-2 a7,7 0 1,1 12,4 a12,12 0 1,1 -19,-9" fill="none" stroke="#B9AA98" stroke-width="1" transform="translate(-1.5,-1.5)" opacity=".7"/>
 <ellipse cx="12" cy="11" rx="7.5" ry="5.5" fill="#E9DFD2" stroke="#231B15" stroke-width="1.4"/>
</symbol>
<g id="q-b"><circle r="11.5" fill="#F3EFE6" stroke="#776F60" stroke-width="1.8"/><path d="M0,-11.5V-5.5M10,-5.8L4.8,-2.8M10,5.8L4.8,2.8M0,11.5V5.5M-10,5.8L-4.8,2.8M-10,-5.8L-4.8,-2.8" stroke="#A79F8F" stroke-width="1.2"/><circle r="5.5" fill="#D8D0BF" stroke="#776F60" stroke-width="1.2"/><path d="M-3,0H3" stroke="#4F483C" stroke-width="1.8" stroke-linecap="round"/></g>
<pattern id="q-rock" width="260" height="260" patternUnits="userSpaceOnUse">
 <rect width="260" height="260" fill="#CBC4B5"/>
 <g fill="#B5AD9C" opacity=".45">""" + "".join(
    f'<circle cx="{(37 * i * 7) % 260}" cy="{(53 * i * 3) % 260}" r="{1.5 + (i % 3)}"/>' for i in range(1, 40)) + """</g>
</pattern>
</defs>"""
def frame():
    """the quadrat: a white frame 0.5 m across inside, lying on the rock, with its shadow. No grid inside it."""
    a, b = M - 10, M + S + 10; w = b - a
    return (f'<rect x="{a + 5}" y="{a + 7}" width="{w}" height="{w}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="20"/>'
            f'<rect x="{a}" y="{a}" width="{w}" height="{w}" fill="none" stroke="#FBFBF8" stroke-width="20"/>'
            f'<rect x="{a - 10}" y="{a - 10}" width="{w + 20}" height="{w + 20}" fill="none" stroke="#8F8C83" stroke-width="1.6"/>'
            f'<rect x="{a + 10}" y="{a + 10}" width="{w - 20}" height="{w - 20}" fill="none" stroke="#8F8C83" stroke-width="1.6"/>'
            + "".join(f'<rect x="{x - 15}" y="{y - 15}" width="30" height="30" rx="4" fill="#E6E4DD" stroke="#8F8C83" stroke-width="1.6"/>'
                      for x, y in ((a, a), (b, a), (a, b), (b, b))))
def barnacle_crowd(mask, rng, spacing=27):
    """barnacles packed over a patch, a plated cone every ~1.4 cm, none overlapping"""
    out = []; grid = {}
    ys, xs = np.where(mask[::6, ::6] > 0)
    for i in rng.permutation(len(xs)):
        x, y = xs[i] * 6 + rng.uniform(0, 6), ys[i] * 6 + rng.uniform(0, 6); gx, gy = int(x // spacing), int(y // spacing)
        if any((x - a) ** 2 + (y - b) ** 2 < spacing ** 2
               for u in (gx - 1, gx, gx + 1) for v in (gy - 1, gy, gy + 1) for a, b in grid.get((u, v), ())): continue
        grid.setdefault((gx, gy), []).append((x, y))
        out.append(f'<use href="#q-b" x="{x:.0f}" y="{y:.0f}"/>')
    return out
def barnacles(polys, mask, rng):
    return (f'<path d="{path_d(polys)}" fill="#E9E3D5" fill-rule="evenodd" stroke="#A9A08C" stroke-width="1.8"/>' + "".join(barnacle_crowd(mask, rng)))
def sea_lettuce(polys, rng):
    d = path_d(polys)
    return (f'<path d="{d}" fill="#1E3A0E" fill-opacity=".2" fill-rule="evenodd" transform="translate(6,8)"/>'
            f'<path d="{d}" fill="#7FBF4A" fill-rule="evenodd" stroke="#356F1E" stroke-width="2.6" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="#C3E79A" stroke-width="7" stroke-opacity=".5" transform="translate(-3,-4)" fill-rule="evenodd"/>')
def brown_area(polys, mask, rng, cid):
    """brown seaweed as one clear area, with fine forked frond lines and paired air bladders inside it"""
    d = path_d(polys); lines, bl = [], []
    ys, xs = np.where(mask[::46, ::46] > 0)
    for i in rng.permutation(len(xs)):
        x, y = xs[i] * 46 + rng.uniform(0, 46), ys[i] * 46 + rng.uniform(0, 46); a = rng.uniform(0, 2 * math.pi); L = rng.uniform(34, 52)
        x2, y2 = x + L * math.cos(a), y + L * math.sin(a)
        lines.append(f"M{x:.0f},{y:.0f}L{x2:.0f},{y2:.0f}l{26 * math.cos(a - .55):.0f},{26 * math.sin(a - .55):.0f}"
                     f"M{x2:.0f},{y2:.0f}l{26 * math.cos(a + .55):.0f},{26 * math.sin(a + .55):.0f}")
        if rng.random() < .45:
            mx, my = (x + x2) / 2, (y + y2) / 2; px, py = -math.sin(a) * 7, math.cos(a) * 7; deg = math.degrees(a)
            for sx in (1, -1): bl.append(f'<ellipse cx="{mx + sx * px:.0f}" cy="{my + sx * py:.0f}" rx="6" ry="4" transform="rotate({deg:.0f} {mx + sx * px:.0f} {my + sx * py:.0f})"/>')
    return (f'<clipPath id="{cid}"><path d="{d}" clip-rule="evenodd"/></clipPath>'
            f'<path d="{d}" fill="#2A1E05" fill-opacity=".2" fill-rule="evenodd" transform="translate(6,8)"/>'
            f'<path d="{d}" fill="#A07F3A" fill-rule="evenodd" stroke="#5A4413" stroke-width="2.6" stroke-linejoin="round"/>'
            f'<g clip-path="url(#{cid})"><path d="{"".join(lines)}" fill="none" stroke="#6B5219" stroke-width="3" stroke-linecap="round" stroke-opacity=".75"/>'
            f'<g fill="#C7A55E" stroke="#6B5219" stroke-width="1.4">{"".join(bl)}</g></g>'
            f'<path d="{d}" fill="none" stroke="#D9BE84" stroke-width="6" stroke-opacity=".35" transform="translate(-3,-4)" fill-rule="evenodd"/>')
def pool_shape(pm):
    polys = outline(pm > .5)
    if not polys: return [], ""
    d = path_d(polys)
    return polys, (f'<path d="{d}" fill="#9CC2D6" fill-rule="evenodd" stroke="#557F98" stroke-width="3.5"/>'
                   f'<path d="{d}" fill="none" stroke="#E2F0F6" stroke-width="6" stroke-opacity=".55" transform="translate(-4,-5)" fill-rule="evenodd"/>')
def svg(body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {C}" role="img" aria-label="{title}">' + DEFS +
            f'<rect width="{C}" height="{C}" fill="url(#q-rock)"/>' + body + '</svg>\n')

# ---------- the transect: 10 m from the top of the shore (0 m) to the water's edge, a quadrat every 1 m
X = int(.70 * AW); Y0 = int(.965 * AH)
TEMP = [33.6, 32.9, 31.4, 31.0, 29.4, 28.9, 27.7, 26.9, 25.6, 25.0, 24.2]      # rock-surface temperature at low tide / °C
BARN_T = [14, 13, 11, 8, 8, 5, 6, 3, 3, 1, 0]          # barnacle squares (of 25) with the seaweed lifted: x 4 = % cover
GREEN_T = [0, 0, 22, 22, 25, 25, 25, 7, 0, 0, 0]        # sea lettuce squares
BROWN_T = [1, 0, 0, 0, 0, 0, 0, 7, 16, 21, 21]          # brown seaweed squares, as seen from above (Spearman's rho
#   -0.71, clearly significant: [1, 1, …] gave -0.613 against a critical value of 0.618, with R's p = 0.045)
def flags(m): return "".join("1" if v >= .5 else "0" for v in cells(m, G).ravel())
stations = []
for k in range(11):
    rng = np.random.default_rng(3000 + k); cx, cy = X, Y0 - k * PX
    pb, mb = cell_patch(BARN_T[k], rng)
    pg, mg = cell_patch(GREEN_T[k], rng, aerial_bias(GREEN, cx, cy))
    free = cells(mg, G) <= .02                                              # brown seen from above only where no sea lettuce lies
    pr, mr = cell_patch(BROWN_T[k], rng, aerial_bias(BROWN, cx, cy), allowed=free, under=mg)
    vis_r = mr * (1 - mg)
    body = ""
    if pb: body += '<g class="q-barn">' + barnacles(pb, mb, rng) + "</g>"
    weed = (brown_area(pr, mr, rng, f"q-c{k}") if pr else "") + (sea_lettuce(pg, rng) if pg else "")
    if weed: body += f'<g class="q-weed">{weed}</g>'
    body += frame()
    open(f"{OUT}/quad/t{k:02d}.svg", "w").write(svg(body, f"Quadrat at {k} m"))
    st = {"d": k, "temp": TEMP[k], "barn": 4 * count(mb, G), "green": 4 * count(mg, G), "brown": 4 * count(vis_r, G), "lifted": bool(pg or pr),
          "x": round((cx - CROP[0]) / (CROP[2] - CROP[0]), 4), "y": round((cy - CROP[1]) / (CROP[3] - CROP[1]), 4),
          "sq": {"barn": flags(mb), "green": flags(mg), "brown": flags(vis_r)}}
    assert (st["barn"], st["green"], st["brown"]) == (4 * BARN_T[k], 4 * GREEN_T[k], 4 * BROWN_T[k]), st
    for m_ in (mb, mg, vis_r):                                           # no square in between, for any species
        fr = cells(m_, G); assert ((fr <= LO) | (fr >= HI)).all(), (k, fr[(fr > LO) & (fr < HI)])
    stations.append(st); print("station", k, st["barn"], st["green"], st["brown"])

# ---------- random quadrats: a 5 m x 5 m area, 10 x 10 grid of 0.5 m squares; 30 random squares (a rock pool is skipped)
AX0, AY0 = int(.76 * AW), int(.672 * AH)
def chi2(O):
    R = [sum(r) for r in O]; Cc = [O[0][j] + O[1][j] for j in range(2)]; N = sum(R)
    E = [[R[i] * Cc[j] / N for j in range(2)] for i in range(2)]
    return sum((O[i][j] - E[i][j]) ** 2 / E[i][j] for i in range(2) for j in range(2)), min(min(e) for e in E)
for seed in range(1, 400):          # the squares and limpet numbers, chosen so that every expected value is at least 5
    r2 = np.random.default_rng(seed); used = set(); plan = []
    while len([p for p in plan if not p["skip"]]) < 30:
        gx, gy = int(r2.integers(0, 10)), int(r2.integers(0, 10))
        if (gx, gy) in used: continue
        used.add((gx, gy)); cx, cy = AX0 + gx * 50 + 25, AY0 + gy * 50 + 25
        if POOL[cy - 25:cy + 25, cx - 25:cx + 25].mean() > .3: plan.append({"skip": True, "gx": gx, "gy": gy}); continue
        g = GREEN[cy - 25:cy + 25, cx - 25:cx + 25].mean() >= .06
        nl = int(r2.integers(1, 5)) if r2.random() < (0.25 if g else 0.82) else 0
        plan.append({"skip": False, "gx": gx, "gy": gy, "cx": cx, "cy": cy, "g": bool(g), "nl": nl})
    q = [p for p in plan if not p["skip"]]
    O = [[sum(1 for p in q if p["nl"] and p["g"]), sum(1 for p in q if p["nl"] and not p["g"])],
         [sum(1 for p in q if not p["nl"] and p["g"]), sum(1 for p in q if not p["nl"] and not p["g"])]]
    c, emin = chi2(O)
    if emin >= 5 and 5 < c < 12: break
print("seed", seed, O, round(c, 2))
R_GREEN = [50, 0, 63, 55, 93, 69, 0, 24, 0, 8, 13, 0, 0, 10, 0, 87, 0, 26, 64, 38, 29, 0, 0, 72, 0, 0, 78, 12, 37, 0]   # first build
R_BARN = [39, 21, 28, 30, 9, 18, 37, 15, 30, 8, 37, 35, 16, 9, 13, 20, 12, 33, 10, 37, 9, 19, 37, 28, 10, 21, 26, 20, 11, 8]
def inside_fraction(x, y, rx=41, ry=35):
    xs, ys = np.meshgrid(np.linspace(-rx, rx, 41), np.linspace(-ry, ry, 41)); e = (xs / rx) ** 2 + (ys / ry) ** 2 <= 1
    px, py = xs[e] + x, ys[e] + y
    return float(((px >= M) & (px <= M + S) & (py >= M) & (py <= M + S)).mean())
rand = []; n = 0
for p in plan:
    if p["skip"]: rand.append({"skip": True, "gx": p["gx"], "gy": p["gy"]}); continue
    rng = np.random.default_rng(4000 + n); cx, cy = p["cx"], p["cy"]
    pm = (zoom(gaussian_filter(WATER[cy - 30:cy + 30, cx - 30:cx + 30], 1.0), C / 60, order=1)[:C, :C] > .5).astype(float)
    pp, pool_svg = pool_shape(pm) if pm[M:M + S, M:M + S].mean() > .03 else ([], "")
    pmask = drawn(pp) if pp else np.zeros((C, C))
    gt = R_GREEN[n] if p["g"] else 0
    pb, mb = patch(R_BARN[n], 34, rng, keep_out=pmask)
    pg, mg = patch(gt, 42, rng, aerial_bias(GREEN, cx, cy), keep_out=pmask)
    free = gaussian_filter(np.maximum(np.maximum(mg, pmask), mb), 8) < .02          # open rock, for the animals
    animals = []                                                                     # [x, y, kind, counts?, angle]
    def room(x, y, r=90):
        if not (0 <= x < C and 0 <= y < C): return False
        return all((x - a) ** 2 + (y - b) ** 2 >= r ** 2 for a, b, *_ in animals)
    # a limpet on the frame in about half the quadrats: more than half inside (it counts) or less (it does not)
    if rng.random() < .55:
        counted = bool(p["nl"]) and rng.random() < .5
        for _ in range(600):
            side = int(rng.integers(0, 4)); t = float(rng.uniform(M + 120, M + S - 120)); off = 14 if counted else -14
            x, y = [(M + off, t), (M + S - off, t), (t, M + off), (t, M + S - off)][side]
            f = inside_fraction(x, y)
            if ((f > .62) if counted else (0 < f < .38)) and free[int(y), int(x)] and room(x, y):
                animals.append([float(x), float(y), "L", counted, float(rng.uniform(0, 360))]); break
    tries = 0
    while sum(1 for a in animals if a[2] == "L" and a[3]) < p["nl"]:                  # the other limpets, well inside
        tries += 1; assert tries < 30000
        x, y = rng.uniform(M + 45, M + S - 45, 2)
        if free[int(y), int(x)] and room(x, y): animals.append([float(x), float(y), "L", True, float(rng.uniform(0, 360))])
    # periwinkles: snails that are NOT limpets (identify before you count)
    for _ in range(int(rng.integers(0, 3))):
        for _ in range(400):
            x, y = rng.uniform(M + 40, M + S - 40, 2)
            if free[int(y), int(x)] and room(x, y, 70): animals.append([float(x), float(y), "P", False, float(rng.uniform(0, 360))]); break
    assert sum(1 for a in animals if a[2] == "L" and a[3]) == p["nl"]
    body = pool_svg
    if pb: body += barnacles(pb, mb, rng)
    if pg: body += sea_lettuce(pg, rng)
    for x, y, kind, _, ang in animals:
        if kind == "L": body += f'<use href="#q-limpet" x="{x - 46:.0f}" y="{y - 39:.0f}" width="92" height="78" transform="rotate({ang:.0f} {x:.0f} {y:.0f})"/>'
        else: body += f'<use href="#q-snail" x="{x - 26:.0f}" y="{y - 26:.0f}" width="52" height="52" transform="rotate({ang:.0f} {x:.0f} {y:.0f})"/>'
    body += frame(); n += 1
    open(f"{OUT}/quad/r{n:02d}.svg", "w").write(svg(body, f"Random quadrat {n}"))
    rand.append({"q": n, "gx": p["gx"], "gy": p["gy"], "limp": p["nl"], "green": count(mg), "barn": count(mb),
                 "an": [[round(x), round(y), k, 1 if c else 0] for x, y, k, c, _ in animals]})
    assert (rand[-1]["green"] > 0) == p["g"], rand[-1]
crop = AER.crop(CROP).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
crop.save(f"{OUT}/shore.jpg", quality=86, optimize=True, progressive=True)
area = {"x0": round((AX0 - CROP[0]) / (CROP[2] - CROP[0]), 4), "y0": round((AY0 - CROP[1]) / (CROP[3] - CROP[1]), 4),
        "w": round(500 / (CROP[2] - CROP[0]), 4), "h": round(500 / (CROP[3] - CROP[1]), 4), "metres": 5, "cells": 10}
CREDITS = [("Drone photograph of the shore", "Boris Izmaylov", "Unsplash Licence", "https://unsplash.com/photos/vibrant-blue-ocean-meets-a-rocky-moss-covered-coastline-UFHcOip6GJA")]
data = {"stations": stations, "random": rand, "area": area, "quad": {"canvas": C, "frame": M, "inside": S, "grid": G},
        "credits": [{"what": a, "who": b, "licence": c, "url": d} for a, b, c, d in CREDITS]}
open(f"{OUT}/shore-data.js", "w").write("/* The virtual shore: generated by tools/make-shore.py; do not edit by hand. */\nwindow.SHORE = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
q = [r for r in rand if not r.get("skip")]
O = [[sum(1 for r in q if r["limp"] and r["green"]), sum(1 for r in q if r["limp"] and not r["green"])],
     [sum(1 for r in q if not r["limp"] and r["green"]), sum(1 for r in q if not r["limp"] and not r["green"])]]
print("2x2 (limpets yes/no by green yes/no):", O, "skipped:", sum(1 for r in rand if r.get("skip")))
