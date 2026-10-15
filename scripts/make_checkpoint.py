# -*- coding: utf-8 -*-
"""Crea _checkpoints/termo-cinetica_checkpoint_<fecha>.zip (sin .venv, datos/pdb_raw ni _checkpoints). Uso: python scripts/make_checkpoint.py 2026-10-16"""
import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tag = sys.argv[1] if len(sys.argv) > 1 else "ultimo"
out = os.path.join(ROOT, "_checkpoints", f"termo-cinetica_checkpoint_{tag}.zip")
os.makedirs(os.path.dirname(out), exist_ok=True)
SKIP_DIRS = {".venv", "_checkpoints", "__pycache__", "pdb_raw"}
n = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            p = os.path.join(base, f)
            z.write(p, os.path.relpath(p, ROOT))
            n += 1
print(f"{n} archivos -> {out} ({os.path.getsize(out)/1024/1024:.1f} MB)")
