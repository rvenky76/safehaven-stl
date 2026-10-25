#!/usr/bin/env python3
"""Generate SafeHaven STL app assets.

Run: uv run --with pillow python assets/gen_assets.py
Design: a house/roof (shelter) over a split warm(orange)/cool(blue) base —
the two things the app finds — on the brand navy.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
BG = (14, 26, 43)        # #0E1A2B
SURFACE = (23, 38, 59)
WARM = (242, 153, 74)    # #F2994A
COOL = (86, 204, 242)    # #56CCF2
TEXT = (242, 246, 252)
ACCENT = (78, 168, 222)


def font(sz, bold=True):
    for p in ['/System/Library/Fonts/SFNSRounded.ttf', '/System/Library/Fonts/Helvetica.ttc',
              '/Library/Fonts/Arial.ttf']:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_mark(img, d, S, inset=0.0):
    pad = S * (0.26 + inset)
    # House body
    bx0, bx1 = pad, S - pad
    by1 = S - pad
    roof_y = S * (0.40 + inset / 2)
    body_top = S * 0.52
    # roof (triangle)
    cx = S / 2
    d.polygon([(bx0 - S * 0.03, body_top), (cx, roof_y), (bx1 + S * 0.03, body_top)],
              fill=TEXT)
    # body split warm (left) / cool (right)
    midx = cx
    d.rectangle([bx0, body_top, midx, by1], fill=WARM)
    d.rectangle([midx, body_top, bx1, by1], fill=COOL)
    # door
    dw = (bx1 - bx0) * 0.18
    d.rectangle([cx - dw / 2, by1 - (by1 - body_top) * 0.5, cx + dw / 2, by1], fill=BG)


def icon(S, adaptive=False):
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if not adaptive:
        d.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=BG)
    draw_mark(img, d, S, inset=0.06 if adaptive else 0.0)
    return img


def splash(W=1284, H=2778):
    img = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(img)
    S = int(min(W, H) * 0.4)
    ic = icon(S)
    img.alpha_composite(ic, ((W - S) // 2, int(H * 0.33)))
    f = font(int(S * 0.2))
    t = 'SafeHaven'
    b = d.textbbox((0, 0), t, font=f)
    d.text(((W - (b[2] - b[0])) // 2, int(H * 0.33) + S + int(S * 0.1)), t, font=f, fill=TEXT)
    fs = font(int(S * 0.09))
    s = 'St. Louis warming & cooling centers'
    bs = d.textbbox((0, 0), s, font=fs)
    d.text(((W - (bs[2] - bs[0])) // 2, int(H * 0.33) + S + int(S * 0.36)), s, font=fs, fill=ACCENT)
    return img


icon(1024).save(os.path.join(OUT, 'icon.png'))
icon(1024, adaptive=True).save(os.path.join(OUT, 'adaptive-icon.png'))
icon(48).save(os.path.join(OUT, 'favicon.png'))
splash().save(os.path.join(OUT, 'splash.png'))
print('Wrote icon.png, adaptive-icon.png, favicon.png, splash.png')
