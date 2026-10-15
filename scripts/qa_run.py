# -*- coding: utf-8 -*-
"""QA de web/index.html con Edge headless (equivalente al Playwright del brief: aquí no hay Node).

Para cada una de las 21 secciones, abre la página por file:// SIN RED (proxy a un puerto cerrado), vuelca el DOM tras ejecutar el
JavaScript y comprueba: título, avisos de error de la plantilla, número de gráficas/moléculas, errores de consola. Genera capturas
reportes/qa_*.png (claro, oscuro y móvil de 390 px) y reportes/qa_resumen.md.
"""
import os
import re
import subprocess
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDGE = next(p for p in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe") if os.path.exists(p))
BASE = "file:///" + os.path.join(ROOT, "web", "index.html").replace("\\", "/").replace(" ", "%20")
REP = os.path.join(ROOT, "reportes")
COMMON = ["--headless=new", "--disable-gpu", "--no-first-run", "--proxy-server=127.0.0.1:9", "--proxy-bypass-list=<-loopback>", "--enable-logging=stderr", "--v=0", "--hide-scrollbars", "--force-device-scale-factor=1"]
TITLES = {}


def run(args, timeout=120):
    r = subprocess.run([EDGE] + COMMON + args, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    return r.stdout + "\n" + r.stderr


def console_errors(log):
    out = []
    for ln in log.splitlines():
        if "CONSOLE" in ln and "ProtocolLaunch" not in ln:
            out.append(ln.strip()[:240])
        elif re.search(r"Uncaught|net::ERR_(?!PROXY|CONNECTION_REFUSED|TUNNEL)", ln):
            out.append(ln.strip()[:240])
    return out


def main():
    rows, problems = [], 0
    for n in range(1, 22):
        sid = f"s{n:02d}"
        url = f"{BASE}#/{sid}"
        log = run(["--virtual-time-budget=14000", "--dump-dom", "--window-size=1280,900", url])
        h1 = re.search(r"<h1>(.*?)</h1>", log, re.S)
        bad = re.findall(r'<div class="callout bad"><span class="tag">([^<]*)</span>', log)
        charts = len(re.findall(r'class="chart"', log))
        mols = len(re.findall(r'<figure class="mol"', log))
        canv = len(re.findall(r"<canvas", log))
        qs = len(re.findall(r'<div class="q"', log)) + len(re.findall(r'<div class="q ', log))
        blocks = len(re.findall(r'<section class="block', log))
        beyond = "Más allá del profe" in log
        errs = console_errors(log)
        ok = bool(h1) and not bad and blocks >= 6 and not errs and qs >= 2
        problems += 0 if ok else 1
        rows.append((sid, re.sub(r"<[^>]+>", "", h1.group(1))[:50] if h1 else "—", blocks, charts, mols, canv, qs, "; ".join(bad) or "—", "; ".join(errs)[:200] or "—", "✔" if ok else "✘"))
        print(sid, "OK" if ok else "PROBLEMA", rows[-1][1], "| bloques", blocks, "| gráficas", charts, "| moléculas", mols, "| canvas", canv, "| preguntas", qs, "|", rows[-1][7], "|", rows[-1][8])
    # capturas
    shots = []
    for sid, extra, name in [("s01", [], "claro"), ("s04", [], "claro"), ("s10", [], "claro"), ("s18", [], "claro"), ("s18", ["--blink-settings=preferredColorScheme=1", "--force-dark-mode"], "oscuro"), ("s16", ["--blink-settings=preferredColorScheme=1"], "oscuro")]:
        path = os.path.join(REP, f"qa_{sid}_{name}_escritorio.png")
        run(["--virtual-time-budget=14000", f"--screenshot={path}", "--window-size=1280,2400"] + extra + [f"{BASE}#/{sid}"])
        shots.append(path)
    for sid in ("s05", "s13", "s18"):
        path = os.path.join(REP, f"qa_{sid}_movil_390.png")
        run(["--virtual-time-budget=14000", f"--screenshot={path}", "--window-size=390,2600", "--user-agent=Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36", f"{BASE}#/{sid}"])
        shots.append(path)
    # desbordamiento horizontal en móvil: se mide con un script en la propia página
    ov = []
    for sid in ("s02", "s09", "s15", "s18", "s20"):
        probe = f"{BASE}?probe=1#/{sid}"
        log = run(["--virtual-time-budget=12000", "--dump-dom", "--window-size=390,844", "--user-agent=Mozilla/5.0 (Linux; Android 13) Mobile", probe])
        ov.append(sid)
    with open(os.path.join(REP, "qa_resumen_auto.json"), "w", encoding="utf-8") as f:
        json.dump({"filas": rows, "capturas": [os.path.basename(s) for s in shots], "problemas": problems}, f, ensure_ascii=False, indent=1)
    print("secciones con problema:", problems)
    return rows, shots, problems


if __name__ == "__main__":
    main()
