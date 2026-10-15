# -*- coding: utf-8 -*-
"""Genera con PyMOL un PNG de respaldo (trazado de rayos) y una sesión .pse por cada estructura verificada.

Ejecutar desde la raíz del proyecto:
    (opcional) $env:TC_ONLY="1NEY,7TIM"  para limitar; sin variable: todas\n    PyMOL2\\Scripts\\pymol.exe -cq scripts\\pymol\\render_all.py
AVISO: la instalación de PyMOL de esta máquina es una versión de evaluación sin licencia ("No License File - For Evaluation Only (0 days remaining)"):
los PNG salen con una marca de agua. Con una licencia activa este script produce las imágenes limpias; sin ella, NO publicar los PNG.
Salida: web/assets/img/<ID>.png (se muestra si el navegador no tiene WebGL) y reportes/pymol/<ID>.pse (abrible en PyMOL).
Contenido: cartoon de las cadenas usadas, ligandos orgánicos en barras (naranja), metales como esferas, residuos destacados
(celeste, con etiqueta), distancias medidas (valores del manifiesto verificado). Numeración de autor (cif_use_auth).
"""
import json
import os
import sys

from pymol import cmd

ROOT = os.environ.get("TC_ROOT", os.getcwd())
RAW = os.path.join(ROOT, "datos", "pdb_raw")
IMG = os.path.join(ROOT, "web", "assets", "img")
PSE = os.path.join(ROOT, "reportes", "pymol")
os.makedirs(IMG, exist_ok=True)
os.makedirs(PSE, exist_ok=True)
NO_USAR = {"2YHX", "1IG8"}
CADENAS = {"4CHA": ["A", "B", "C"], "1ATP": ["E", "I"], "3BG3": ["A", "B"], "1QIN": ["A", "B"]}
JUNK = "resn HOH+EDO+BOG+NAG+GOL+SO4+ACT+BME+1PE+PGE+P4G+P6G+AKR+MAN+MES+PEG+NO3"
METALS = "ZN+MG+MN+CU+FE+K+CA+NA+CO"

man = json.load(open(os.path.join(ROOT, "datos", "estructuras_manifest.json"), encoding="utf-8"))["entradas"]
only = {a.strip().upper() for a in os.environ.get("TC_ONLY", "").split(",") if a.strip()}  # PyMOL interpreta los argumentos como archivos: se usa la variable TC_ONLY


def style():
    cmd.bg_color("white")
    cmd.set("ray_opaque_background", 1)
    cmd.set("antialias", 2)
    cmd.set("cartoon_fancy_helices", 1)
    cmd.set("cartoon_transparency", 0.45)
    cmd.set("ray_trace_mode", 1)
    cmd.set("ray_shadow", 0)
    cmd.set("stick_radius", 0.22)
    cmd.set("label_size", 16)
    cmd.set("label_position", (1.5, 1.5, 3))
    cmd.set("label_color", "black")
    cmd.set("label_outline_color", "white")
    cmd.set("dash_gap", 0.25)
    cmd.set("dash_radius", 0.07)


def render(e):
    pid = e["pdb_id"]
    cmd.reinitialize()
    style()
    cmd.load(os.path.join(RAW, pid + ".cif"), pid)
    chains = CADENAS.get(pid, e["cadenas_usadas"])
    cmd.remove(f"{pid} and (solvent or {JUNK})")
    cmd.remove(f"{pid} and not chain {'+'.join(chains)}")
    cmd.hide("everything")
    cmd.show("cartoon", f"{pid} and polymer")
    cmd.color("lightblue", f"{pid} and polymer")
    # ligandos declarados (orgánicos) y metales
    lig = [x for x in e.get("ligandos_ccd", []) if x not in METALS.split("+")]
    metals = [x for x in e.get("ligandos_ccd", []) if x in METALS.split("+")]
    for L in lig:
        cmd.show("sticks", f"{pid} and resn {L} and not polymer")
        cmd.color("orange", f"{pid} and resn {L} and not polymer and elem C")
    cmd.show("spheres", f"{pid} and (elem Zn+Mg+Mn+Cu+Fe+K+Ca+Na+Co) and not polymer")
    cmd.set("sphere_scale", 0.5)
    cmd.color("gray60", f"{pid} and (elem Zn+Mg+Mn+Cu+Fe+K+Ca+Na+Co) and not polymer")
    foc = []
    for r in e.get("residuos_destacados", []):
        sel = f"{pid} and chain {r['chain']} and resi {r['resi']} and not hetatm" if r["resname"] not in ("SGB", "OAS", "KCX") else f"{pid} and chain {r['chain']} and resi {r['resi']}"
        cmd.show("sticks", sel)
        cmd.color("cyan", f"{sel} and elem C")
        cmd.label(f"{sel} and name CA", f"'{r['resname'].capitalize()}{r['resi']}'")
        foc.append(sel)
    for L in e.get("ligandos_ccd", []):
        pass
    # distancias medidas (valores del manifiesto)
    for k, d in enumerate(e.get("distancias_medidas", [])):
        par = d.get("par")
        if not par:
            continue
        a, b = par
        sa = f"{pid} and chain {a['chain']} and resn {a['resname']} and resi {a['resi']} and name {a['atom']}"
        sb = f"{pid} and chain {b['chain']} and resn {b['resname']} and resi {b['resi']} and name {b['atom']}"
        try:
            cmd.distance(f"d{k}", sa, sb)
            cmd.hide("labels", f"d{k}")
        except Exception:
            pass
    cmd.color("yellow", "d*")
    # vista
    focus = " or ".join(["(" + s + ")" for s in foc] + [f"({pid} and resn {'+'.join(e.get('ligandos_ccd', []) or ['XXX'])} and not polymer)"])
    try:
        cmd.orient(focus)
        cmd.zoom(focus, 9)
    except Exception:
        cmd.orient(pid)
    cmd.save(os.path.join(PSE, pid + ".pse"))
    cmd.png(os.path.join(IMG, pid + ".png"), 900, 680, dpi=150, ray=1)
    print("OK", pid, os.path.getsize(os.path.join(IMG, pid + ".png")) // 1024, "KB")


def render_pair():
    cmd.reinitialize()
    style()
    cmd.load(os.path.join(RAW, "4AKE.cif"), "abierta")
    cmd.load(os.path.join(RAW, "1AKE.cif"), "cerrada")
    for o in ("abierta", "cerrada"):
        cmd.remove(f"{o} and (solvent or not chain A)")
    cmd.align("abierta and name CA and resi 1-29+60-121+160-214", "cerrada and name CA and resi 1-29+60-121+160-214", cycles=0)
    cmd.hide("everything")
    cmd.show("cartoon", "abierta or cerrada")
    cmd.color("marine", "abierta")
    cmd.color("salmon", "cerrada")
    cmd.show("sticks", "cerrada and resn AP5")
    cmd.color("yellow", "cerrada and resn AP5 and elem C")
    cmd.set("cartoon_transparency", 0.25, "abierta")
    cmd.orient("abierta or cerrada")
    cmd.zoom("abierta or cerrada", 4)
    cmd.save(os.path.join(PSE, "4AKE_1AKE.pse"))
    cmd.png(os.path.join(IMG, "4AKE_1AKE.png"), 900, 680, dpi=150, ray=1)
    print("OK 4AKE_1AKE")


for e in man:
    if e["pdb_id"] in NO_USAR or e["estado"] != "verificado":
        continue
    if only and e["pdb_id"] not in only:
        continue
    try:
        render(e)
    except Exception as ex:
        print("FALLO", e["pdb_id"], ex)
if not only or "4AKE_1AKE" in only:
    render_pair()
