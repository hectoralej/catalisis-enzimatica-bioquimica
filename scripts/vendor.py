# -*- coding: utf-8 -*-
"""Descarga las librerías JS fijadas a web/assets/vendor/ (se copian al proyecto: la versión final no usa CDN)."""
import os
import re
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, "web", "assets", "vendor")
os.makedirs(os.path.join(V, "katex", "fonts"), exist_ok=True)
os.makedirs(os.path.join(V, "3dmol"), exist_ok=True)
S = requests.Session()
KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/"
DMOL = "https://cdn.jsdelivr.net/npm/3dmol@2.4.2/build/3Dmol-min.js"


def get(url, dest, binary=False):
    r = S.get(url, timeout=120)
    r.raise_for_status()
    with open(dest, "wb") as f:
        f.write(r.content)
    print(f"{len(r.content):>9}  {os.path.relpath(dest, ROOT)}")
    return r.content


get(DMOL, os.path.join(V, "3dmol", "3Dmol-min.js"))
get(KATEX + "katex.min.js", os.path.join(V, "katex", "katex.min.js"))
get(KATEX + "contrib/auto-render.min.js", os.path.join(V, "katex", "auto-render.min.js"))
css = S.get(KATEX + "katex.min.css", timeout=120).text
fonts = sorted(set(re.findall(r"url\(fonts/([^)]+?\.woff2)\)", css)))
for f in fonts:
    get(KATEX + "fonts/" + f, os.path.join(V, "katex", "fonts", f))
# solo woff2 (todos los navegadores actuales); se eliminan las alternativas woff/ttf del CSS
css = re.sub(r",url\(fonts/[^)]+?\.woff\) format\(\"woff\"\)", "", css)
css = re.sub(r",url\(fonts/[^)]+?\.ttf\) format\(\"truetype\"\)", "", css)
open(os.path.join(V, "katex", "katex.min.css"), "w", encoding="utf-8").write(css)
print("katex.min.css reescrito (solo woff2)")
