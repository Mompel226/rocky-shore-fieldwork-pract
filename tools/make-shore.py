#!/usr/bin/env python3
"""Virtual rocky shore, built on a real drone photograph (Boris Izmaylov, Unsplash, UFHcOip6GJA).
Each quadrat close-up takes the shape of its seaweed patches from the photograph at that spot (green and brown
classified by colour, upsampled) and the look of each species from licensed photographs (credits.json).
Barnacles and limpets are too small to see from the air: their numbers are designed (see BARN, LIMP).
% cover = the grid count a careful student makes: squares at least half covered (C4.1, B4.1 decks)."""
import json, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance, ImageOps
from scipy.ndimage import gaussian_filter, zoom, binary_fill_holes, label
OUT = "out2"; os.makedirs(f"{OUT}/img", exist_ok=True); os.makedirs(f"{OUT}/data", exist_ok=True)
rng = np.random.default_rng(20261014)
S = 1000; F = 46; PX = 100          # close-up px; frame px; aerial px per metre (estimated from people on the shore)
AER = Image.open("full/us_UF_orig.jpg").convert("RGB"); AW, AH = AER.size
hsv = np.asarray(AER.convert("HSV")).astype(float) / 255; hh = hsv[..., 0] * 360; ss = hsv[..., 1]; vv = hsv[..., 2]
GREEN = ((hh >= 55) & (hh <= 110) & (ss > .30) & (vv > .40)).astype(float)
BROWN = ((hh >= 10) & (hh < 55) & (ss > .30) & (vv < .62)).astype(float)
POOL = ((vv < .45) & (ss < .35)).astype(float)
# rock-pool water seen from above: blue-grey, little colour (used to draw the pool part of a close-up; no random numbers)
from scipy.ndimage import binary_opening, binary_closing, binary_dilation
WATER = binary_closing(binary_opening((hh >= 170) & (hh <= 290) & (ss < .35) & (vv < .72), iterations=2), iterations=3)
WATER = binary_dilation(WATER, iterations=4).astype(float)
CROP = (int(.55 * AW), int(.40 * AH), int(.95 * AW), AH)        # the part of the photo shown on the page

def load(k): return Image.open(f"full/{k}.jpg").convert("RGB")
# ---------- textures from licensed photographs
rock = ImageOps.grayscale(load("rock")); rock = ImageEnhance.Contrast(rock).enhance(1.25)
rock = ImageOps.colorize(rock, (58, 54, 48), (196, 188, 172))          # tinted to the pale rock of the drone photo
barn = load("barnacles"); barn = barn.resize((int(barn.width * .62), int(barn.height * .62)), Image.LANCZOS)
barn = ImageEnhance.Color(barn).enhance(.45); barn = ImageEnhance.Brightness(barn).enhance(1.12)
ulv = load("ulva"); W_, H_ = ulv.size; ulv = ulv.crop((int(.12 * W_), int(.10 * H_), int(.62 * W_), int(.62 * H_)))
ulv = ulv.resize((int(ulv.width * .78), int(ulv.height * .78)), Image.LANCZOS); ulv = ImageEnhance.Brightness(ulv).enhance(1.12)
fuc = load("rockweed"); W_, H_ = fuc.size; fuc = fuc.crop((0, int(.05 * H_), int(.78 * W_), int(.50 * H_)))
fuc = fuc.resize((int(fuc.width * .62), int(fuc.height * .62)), Image.LANCZOS); fuc = ImageEnhance.Color(fuc).enhance(.85)
def cutout(k):
    im = load(k); a = np.asarray(im).astype(float)
    bg = np.median(np.concatenate([a[:20].reshape(-1, 3), a[-20:].reshape(-1, 3)]), axis=0)
    m = gaussian_filter((np.sqrt(((a - bg) ** 2).sum(axis=2)) > 38).astype(float), 2) > .5
    m = binary_fill_holes(m); lab, n = label(m)
    if n > 1: m = lab == (1 + int(np.argmax([(lab == i).sum() for i in range(1, n + 1)])))
    ys, xs = np.where(m); alpha = Image.fromarray((gaussian_filter(m.astype(float), 1.2) * 255).astype(np.uint8))
    rgba = im.copy(); rgba.putalpha(alpha); return rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
limpets = [cutout("limpet1"), cutout("limpet2")]

def tile(tex, size):
    t = tex.rotate(90 * int(rng.integers(0, 4)), expand=True)
    k = max(size / t.width, size / t.height, 1.0)
    if k > 1: t = t.resize((int(t.width * k) + 1, int(t.height * k) + 1), Image.LANCZOS)
    x = rng.integers(0, t.width - size + 1); y = rng.integers(0, t.height - size + 1)
    return t.crop((x, y, x + size, y + size))
def grid_count(m): return int((m.reshape(10, S // 10, 10, S // 10).mean(axis=(1, 3)) >= .5).sum())
def from_aerial(cls, cx, cy):
    """The 0.5 m window of a class map round (cx, cy), upsampled to the close-up with natural edges."""
    h = PX // 4; win = cls[cy - h:cy + h, cx - h:cx + h]
    up = zoom(gaussian_filter(win, .8), S / win.shape[0], order=1)[:S, :S]
    n = gaussian_filter(rng.normal(size=(S, S)), 9); n = n / n.std() * .12
    return ((up + n) > .5).astype(float)
def noise_mask(cover, sigma):
    if cover <= 0: return np.zeros((S, S))
    n = gaussian_filter(rng.normal(size=(S + 200, S + 200)), sigma)[100:100 + S, 100:100 + S]; n = n / n.std()
    n = n + .45 * (lambda f: f / f.std())(gaussian_filter(rng.normal(size=(S, S)), sigma / 4))
    lo, hi = float(n.min()), float(n.max()); best = None
    for _ in range(60):
        mid = (lo + hi) / 2; g = grid_count((n >= mid).astype(float))
        if best is None or abs(g - cover) < abs(best[1] - cover): best = (mid, g)
        if g == cover: break
        lo, hi = (mid, hi) if g > cover else (lo, mid)
    return (n >= best[0]).astype(float)

def compose(cx, cy, barn_cover, n_limp, green=None, open_rock=False):
    mg = from_aerial(GREEN, cx, cy) if green is None else green
    mbr = from_aerial(BROWN, cx, cy); mbr = mbr * (1 - mg)
    mb = noise_mask(barn_cover, 30)
    img = tile(rock, S).filter(ImageFilter.GaussianBlur(.5))
    if mb.any(): img = Image.composite(tile(barn, S), img, Image.fromarray((gaussian_filter(mb, 1.5) * 255).astype(np.uint8)))
    pos = []; tries = 0
    while len(pos) < n_limp and tries < 5000:
        tries += 1; x, y = rng.integers(70, S - 70, 2)
        if open_rock and (mg[y, x] >= .5 or mbr[y, x] >= .5): continue      # random quadrats: no limpet hidden under seaweed
        if any((x - a) ** 2 + (y - b) ** 2 < 90 ** 2 for a, b in pos): continue
        pos.append((int(x), int(y)))
    for (x, y) in pos:
        L = limpets[rng.integers(0, 2)]; s = rng.uniform(58, 74) / max(L.size)
        L2 = L.resize((int(L.width * s), int(L.height * s)), Image.LANCZOS).rotate(rng.uniform(0, 360), expand=True, resample=Image.BICUBIC)
        sa = L2.split()[3].filter(ImageFilter.GaussianBlur(4)).point(lambda v: int(v * .55))
        img.paste((0, 0, 0), (int(x - L2.width / 2) + 4, int(y - L2.height / 2) + 5), sa)
        img.paste(L2, (int(x - L2.width / 2), int(y - L2.height / 2)), L2)
    under = img; over = img
    for m, tex, blur in ((mbr, fuc, 1.4), (mg, ulv, 1.6)):
        if m.any(): over = Image.composite(tile(tex, S), over, Image.fromarray((gaussian_filter(m, blur) * 255).astype(np.uint8)))
    return over, under, mb, mg, mbr, pos

def pool_from_aerial(cx, cy):
    """The rock-pool part of a 0.5 m window, upsampled like from_aerial but with no random edge (it uses no random numbers)."""
    h = PX // 4; win = WATER[cy - h:cy + h, cx - h:cx + h]
    return (zoom(gaussian_filter(win, 1.0), S / win.shape[0], order=1)[:S, :S] > .5).astype(float)
def water(img, pm):
    """Pool water over the close-up: the rock below seen darker, bluer and softer, a wet dark rim, faint glints."""
    a = np.asarray(img.filter(ImageFilter.GaussianBlur(3))).astype(float)
    deep = gaussian_filter(pm, 22)                                   # deeper towards the middle of the pool
    tint = np.array([52, 66, 78], float)
    w = a * (.50 - .22 * deep[..., None]) + tint * (.50 + .22 * deep[..., None])
    g = np.random.default_rng(31).normal(size=(S, S)); g = gaussian_filter(g, 6); g = (g - g.mean()) / g.std()
    w += (np.clip(g - 1.6, 0, None) * 22)[..., None]                    # soft glints on the surface
    edge = np.clip(gaussian_filter(pm, 3) - gaussian_filter(pm, 10), 0, None) * 2.2
    out = np.asarray(img).astype(float); al = gaussian_filter(pm, 2.5)[..., None]
    out = out * (1 - al) + w * al
    out = out * (1 - np.clip(edge, 0, .45)[..., None])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
def frame(img, out, size):
    Wf = S + 2 * F; can = Image.new("RGB", (Wf, Wf), (238, 238, 232)); can.paste(img, (F, F)); d = ImageDraw.Draw(can, "RGBA")
    for i in range(1, 10):
        p = F + i * S // 10
        d.line([(p + 3, F), (p + 3, F + S)], fill=(0, 0, 0, 90), width=3); d.line([(F, p + 3), (F + S, p + 3)], fill=(0, 0, 0, 90), width=3)
        d.line([(p, F), (p, F + S)], fill=(245, 245, 240, 235), width=3); d.line([(F, p), (F + S, p)], fill=(245, 245, 240, 235), width=3)
    d.rectangle([F - 2, F - 2, F + S + 2, F + S + 2], outline=(0, 0, 0, 70), width=4); d.rectangle([4, 4, Wf - 5, Wf - 5], outline=(205, 205, 198, 255), width=8)
    can.resize((size, size), Image.LANCZOS).save(out, quality=82, optimize=True, progressive=True)

# ---------- the transect: 10 m from the top of the shore (0 m) to the water's edge, a quadrat every 1 m
X = int(.70 * AW); Y0 = int(.965 * AH)
TEMP = [33.6, 32.9, 31.4, 31.0, 29.4, 28.9, 27.7, 26.9, 25.6, 25.0, 24.2]      # rock-surface temperature at low tide / °C
BARN = [56, 50, 45, 30, 34, 20, 24, 10, 13, 5, 1]                               # barnacle cover with the seaweed lifted
LIMP = [1, 3, 2, 1, 0, 1, 2, 4, 3, 2, 1]
stations = []
for k in range(11):
    cx, cy = X, Y0 - k * PX
    over, under, mb, mg, mbr, pos = compose(cx, cy, BARN[k], LIMP[k])
    frame(over, f"{OUT}/img/t{k:02d}.jpg", 760)
    seaweed = mg.any() or mbr.any()
    if seaweed: frame(under, f"{OUT}/img/t{k:02d}-lifted.jpg", 760)
    hidden = sum(1 for (x, y) in pos if mg[y, x] >= .5 or mbr[y, x] >= .5)
    stations.append({"d": k, "temp": TEMP[k], "barn": grid_count(mb), "green": grid_count(mg), "brown": grid_count(mbr),
                     "limp": len(pos), "limpHidden": hidden, "lifted": bool(seaweed),
                     "x": round((cx - CROP[0]) / (CROP[2] - CROP[0]), 4), "y": round((cy - CROP[1]) / (CROP[3] - CROP[1]), 4)})
    print("station", stations[-1])

# ---------- random quadrats: a 5 m x 5 m area, 10 x 10 grid of 0.5 m squares; 30 random squares (a rock pool is skipped)
AX0, AY0 = int(.76 * AW), int(.672 * AH)
def chi2(O):
    R = [sum(r) for r in O]; Cc = [O[0][j] + O[1][j] for j in range(2)]; N = sum(R)
    E = [[R[i] * Cc[j] / N for j in range(2)] for i in range(2)]
    return sum((O[i][j] - E[i][j]) ** 2 / E[i][j] for i in range(2) for j in range(2)), min(min(e) for e in E)
# choose the random squares and limpet numbers first (a separate generator), so that every expected value is at least 5
for seed in range(1, 400):
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
rand = []; n = 0
for p in plan:
    if p["skip"]: rand.append({"skip": True, "gx": p["gx"], "gy": p["gy"]}); continue
    mg = from_aerial(GREEN, p["cx"], p["cy"])
    if p["g"] and grid_count(mg) == 0: mg = noise_mask(int(rng.integers(3, 9)), 40)      # a small patch the colour test saw
    if not p["g"]: mg = np.zeros((S, S))
    over, under, mb, mg, mbr, pos = compose(p["cx"], p["cy"], int(rng.integers(8, 40)), p["nl"], green=mg, open_rock=True)
    pm = pool_from_aerial(p["cx"], p["cy"])
    if pm.mean() > .03:                                              # part of this square is a rock pool on the photograph
        assert not any(pm[y, x] for (x, y) in pos), "a limpet would be under the pool water"
        over = water(over, pm); print("pool water in quadrat", n + 1, round(pm.mean(), 2))
    n += 1; frame(over, f"{OUT}/img/r{n:02d}.jpg", 600)
    rand.append({"q": n, "gx": p["gx"], "gy": p["gy"], "limp": len(pos), "green": grid_count(mg), "brown": grid_count(mbr), "barn": grid_count(mb)})
crop = AER.crop(CROP); crop = crop.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
crop.save(f"{OUT}/img/shore.jpg", quality=86, optimize=True, progressive=True)
area = {"x0": round((AX0 - CROP[0]) / (CROP[2] - CROP[0]), 4), "y0": round((AY0 - CROP[1]) / (CROP[3] - CROP[1]), 4),
        "w": round(500 / (CROP[2] - CROP[0]), 4), "h": round(500 / (CROP[3] - CROP[1]), 4), "metres": 5, "cells": 10}
json.dump({"pxPerMetre": PX, "crop": CROP, "stations": stations, "random": rand, "area": area}, open(f"{OUT}/data/shore.json", "w"), indent=1)
q = [r for r in rand if not r.get("skip")]
O = [[sum(1 for r in q if r["limp"] and r["green"]), sum(1 for r in q if r["limp"] and not r["green"])],
     [sum(1 for r in q if not r["limp"] and r["green"]), sum(1 for r in q if not r["limp"] and not r["green"])]]
print("2x2 (limpets yes/no by green yes/no):", O, "skipped:", sum(1 for r in rand if r.get("skip")))
