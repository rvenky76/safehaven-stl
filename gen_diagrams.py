#!/usr/bin/env python3
"""Generate SafeHaven STL architecture diagrams for the CAC deck + video.
Run: uv run --with pillow python assets/gen_diagrams.py  -> demo/diagrams/
Palette matches the app (src/ui/theme.tsx).
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'demo', 'diagrams')
os.makedirs(OUT, exist_ok=True)

BG = (14, 26, 43)
SURFACE = (23, 38, 59)
SURFACE2 = (31, 50, 80)
ACCENT = (78, 168, 222)
TEXT = (242, 246, 252)
MUTED = (157, 176, 204)
BORDER = (42, 60, 88)
WARM = (242, 153, 74)
COOL = (86, 204, 242)
ACTIVE = (46, 204, 113)
W, H = 1600, 900


def font(sz, bold=False):
    for p in (['/System/Library/Fonts/SFNSRounded.ttf', '/Library/Fonts/Arial Bold.ttf'] if bold
              else ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc']):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def canvas():
    img = Image.new('RGB', (W, H), BG)
    return img, ImageDraw.Draw(img)


def box(d, x, y, w, h, fill=SURFACE, outline=BORDER, width=2, r=18):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=width)


def ctext(d, cx, y, s, f, fill=TEXT):
    b = d.textbbox((0, 0), s, font=f); d.text((cx - (b[2] - b[0]) / 2, y), s, font=f, fill=fill)


def ltext(d, x, y, s, f, fill=TEXT):
    d.text((x, y), s, font=f, fill=fill)


def arrow(d, x1, y1, x2, y2, color=ACCENT, width=4):
    import math
    d.line([(x1, y1), (x2, y2)], fill=color, width=width)
    ang = math.atan2(y2 - y1, x2 - x1); L = 16
    for deg in (150, -150):
        da = math.radians(deg)
        d.line([(x2, y2), (x2 - L * math.cos(ang + da), y2 - L * math.sin(ang + da))], fill=color, width=width)


def title(d, s, sub=None):
    ctext(d, W / 2, 46, s, font(52, True), TEXT)
    if sub:
        ctext(d, W / 2, 112, sub, font(26), ACCENT)


# ---- Diagram 1: data pipeline + honest scope ----
def d1():
    img, d = canvas()
    title(d, 'Live where it exists, curated where it doesn\u2019t', 'Honestly-labeled, works offline')
    box(d, 120, 200, 420, 250, fill=SURFACE2)
    ctext(d, 330, 222, 'St. Louis sources', font(28, True))
    ltext(d, 150, 274, '• MO DHSS cooling feed (LIVE)', font(20), ACTIVE)
    ltext(d, 150, 308, '• City warming list (curated)', font(20), WARM)
    ltext(d, 150, 342, '• no warming API — "call 2-1-1"', font(19), MUTED)
    ltext(d, 150, 388, 'scattered, no single app', font(20), WARM)
    arrow(d, 540, 325, 640, 325)
    box(d, 640, 230, 320, 190, fill=SURFACE, outline=ACCENT, width=3)
    ctext(d, 800, 252, 'Merge + "open now"', font(24, True), ACCENT)
    ctext(d, 800, 296, '58 live cooling +', font(21), TEXT)
    ctext(d, 800, 326, 'curated warming', font(21), TEXT)
    ctext(d, 800, 360, 'open/closed from hours', font(19), MUTED)
    arrow(d, 960, 325, 1060, 325)
    box(d, 1060, 230, 420, 190, fill=SURFACE, outline=ACTIVE, width=3)
    ctext(d, 1270, 252, 'SafeHaven app', font(26, True), ACTIVE)
    ctext(d, 1270, 296, 'ships in the bundle', font(21), TEXT)
    ctext(d, 1270, 330, 'works 100% offline', font(21), TEXT)
    ctext(d, 1270, 362, 'nearest-first, 1-tap help', font(19), MUTED)
    box(d, 300, 560, 1000, 240, fill=SURFACE2)
    ctext(d, 800, 582, 'Honest by design', font(28, True), TEXT)
    ltext(d, 340, 636, '• A community reference, NOT an official City feed', font(22), MUTED)
    ltext(d, 340, 676, '• "Call 2-1-1 to confirm" shown on every center', font(22), MUTED)
    ltext(d, 340, 716, '• Live feed labeled live; warming labeled curated', font(22), MUTED)
    ltext(d, 340, 756, '• "Open now" = per listed hours; falls back offline', font(22), MUTED)
    img.save(os.path.join(OUT, '01-data.png'))


# ---- Diagram 2: crisis-first design ----
def d2():
    img, d = canvas()
    title(d, 'Built for the person in crisis', 'Not a caseworker at a desk with wifi')
    rows = [
        ('Works offline', 'centers in the bundle — a dying prepaid phone with no data still works', ACTIVE),
        ('Two actions only', 'big Directions + Call buttons — no forms, no account, no typing', ACCENT),
        ('Nearest first', 'GPS near-me, 3/5/10 mi, so the closest safe place is on top', COOL),
        ('Readable under stress', 'large tap targets, light/dark, full screen-reader support', WARM),
        ('Emergency banner', 'surfaces Code Blue / heat-emergency activation at the top', ACTIVE),
    ]
    y = 200
    for h, sub, col in rows:
        box(d, 200, y, 1200, 110, fill=SURFACE, outline=col, width=2)
        ctext_left = 250
        ltext(d, ctext_left, y + 22, h, font(28, True), col)
        ltext(d, ctext_left, y + 62, sub, font(21), MUTED)
        y += 130
    img.save(os.path.join(OUT, '02-crisis.png'))


# ---- Diagram 3: architecture seams ----
def d3():
    img, d = canvas()
    title(d, 'Clean, extensible architecture', 'TypeScript · Expo · the same seams, swappable')
    box(d, 300, 190, 1000, 100, fill=SURFACE2)
    ctext(d, 800, 212, 'Screens: Find · Center detail · About · Settings', font(27, True))
    ctext(d, 800, 254, 'read only from the store', font(20), MUTED)
    arrow(d, 800, 290, 800, 345)
    box(d, 300, 345, 1000, 95, fill=BG, outline=ACCENT, width=3)
    ctext(d, 800, 365, 'AppStore (React context)', font(26, True), ACCENT)
    ctext(d, 800, 405, 'settings · favorites · location · activation', font(20), MUTED)
    arrow(d, 640, 440, 520, 530)
    arrow(d, 960, 440, 1080, 530)
    box(d, 250, 530, 540, 250, fill=SURFACE, outline=BORDER, width=2)
    ctext(d, 520, 552, 'Data layer', font(26, True), TEXT)
    ltext(d, 290, 604, '• centers.ts — curated dataset', font(21), MUTED)
    ltext(d, 290, 640, '• dataset.ts — + activation state', font(21), MUTED)
    ltext(d, 290, 676, '• storage.ts — AsyncStorage cache', font(21), MUTED)
    ltext(d, 290, 724, 'swap in a live City feed later', font(20), ACTIVE)
    box(d, 1020, 530, 330, 250, fill=SURFACE, outline=BORDER, width=2)
    ctext(d, 1185, 552, 'UI layer', font(26, True), TEXT)
    ltext(d, 1055, 604, '• theme.tsx (light/dark/system)', font(20), MUTED)
    ltext(d, 1055, 640, '• geo.ts (haversine)', font(20), MUTED)
    ltext(d, 1055, 676, '• components.tsx', font(20), MUTED)
    ltext(d, 1055, 724, 'unit-tested logic', font(20), ACTIVE)
    img.save(os.path.join(OUT, '03-arch.png'))


d1(); d2(); d3()
print('Wrote 3 diagrams to', OUT)
