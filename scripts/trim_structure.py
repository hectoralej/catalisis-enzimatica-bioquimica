# -*- coding: utf-8 -*-
"""Recorta cada estructura verificada y la incrusta como web/assets/structures/<ID>.js  (window.STRUCTS["ID"] = "...").

Reglas (brief §7.1): solo las cadenas usadas + ligandos/metales relevantes, sin aguas ni aditivos de cristalización;
átomos completos cerca del sitio activo (radio_full), solo esqueleto (N,CA,C,O) a media distancia (radio_bb), nada más lejos
(salvo proteínas pequeñas, que conservan todo el esqueleto). Se conserva la numeración de AUTOR y el encabezado con el ID.
La 4AKE (abierta) se superpone sobre la 1AKE (cerrada) con los Cα del CORE para que ambas compartan el mismo marco.
Genera además web/assets/js/structmeta.js con los metadatos (para mostrar ID, título, organismo, resolución, enlace RCSB).
"""
import json
import os
import sys

import numpy as np
from Bio.PDB import Superimposer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rcsb_common import ROOT, load  # noqa: E402

OUTDIR = os.path.join(ROOT, "web", "assets", "structures")
META = os.path.join(ROOT, "web", "assets", "js", "structmeta.js")
os.makedirs(OUTDIR, exist_ok=True)
os.makedirs(os.path.dirname(META), exist_ok=True)

JUNK = {"HOH", "EDO", "BOG", "NAG", "GOL", "SO4", "ACT", "BME", "1PE", "PGE", "P4G", "P6G", "AKR", "MAN", "MES", "PEG", "NO3", "CL", "NA"}
NO_USAR = {"2YHX", "1IG8"}
CADENAS = {"4CHA": ["A", "B", "C"], "1ATP": ["E", "I"], "3BG3": ["A", "B"]}
# (radio_full, radio_bb, limite_de_tamaño_aprox_bytes)
AJUSTE = {"4V40": (9, 16), "3BG3": (9, 14), "1DGF": (9, 16), "4PH9": (9, 16), "5FPQ": (9, 16), "5F19": (9, 16), "1VRT": (9, 16),
          "1QIN": (10, 18), "1CA2": (12, 99), "1KIF": (9, 20), "1ONE": (10, 20), "1IAT": (9, 20), "1A49": (9, 18), "1I10": (10, 99), "6ADH": (10, 99)}
BB = {"N", "CA", "C", "O"}


def fmt_atom(serial, a, res, chain, rectype):
    name = a.get_name().strip()
    el = (a.element or name[0]).strip().upper()
    nm = (" " + name.ljust(3)) if len(el) == 1 and len(name) < 4 else name.ljust(4)
    x, y, z = a.coord
    return (f"{rectype:<6}{serial:>5} {nm}{' '}{res.get_resname():>3} {chain}{res.id[1]:>4}{res.id[2] if res.id[2].strip() else ' '}   "
            f"{x:8.3f}{y:8.3f}{z:8.3f}{1.0:6.2f}{min(a.get_bfactor(), 99.99):6.2f}          {el:>2}")


def is_polymer(res):
    names = {a.get_name().strip() for a in res}
    return {"N", "CA", "C"} <= names


def build(entry, aligned=None):
    pid = entry["pdb_id"]
    st = load(pid)
    model = st[0]
    chains = CADENAS.get(pid, entry["cadenas_usadas"])
    keep_lig = set(entry.get("ligandos_ccd", []))
    focal_res = {(r["chain"], r["resi"]) for r in entry.get("residuos_destacados", [])}
    if aligned is not None:
        for a in model["A"].get_atoms():
            a.coord = np.dot(a.coord, aligned[0]) + aligned[1]
    kept = []
    for ch in chains:
        for r in model[ch]:
            hf = r.id[0]
            if hf == "W" or r.get_resname() == "HOH":
                continue
            if hf.startswith("H_") and not is_polymer(r):
                if r.get_resname() in JUNK and r.get_resname() not in keep_lig:
                    continue
            kept.append((ch, r))
    focal_atoms = [a for ch, r in kept for a in r if a.element != "H" and
                   (((ch, r.id[1]) in focal_res) or (r.id[0].startswith("H_") and not is_polymer(r)))]
    F = np.array([a.coord for a in focal_atoms]) if focal_atoms else None
    rf, rb = AJUSTE.get(pid, (10, 99))
    lines, serial = [], 1
    nres_poly = sum(1 for _, r in kept if is_polymer(r))
    for ch, r in kept:
        poly = is_polymer(r)
        atoms = [a for a in r if a.element != "H"]
        if poly and F is not None:
            dmin = min(np.min(np.linalg.norm(F - a.coord, axis=1)) for a in atoms)
            if dmin <= rf or (ch, r.id[1]) in focal_res:
                sel = atoms
            elif dmin <= rb or nres_poly < 350:
                sel = [a for a in atoms if a.get_name().strip() in BB]
            else:
                continue
        else:
            sel = atoms
        rec = "ATOM" if poly else "HETATM"
        for a in sel:
            lines.append(fmt_atom(serial, a, r, ch, rec))
            serial += 1
    org = "; ".join(entry.get("organismo", []))
    hdr = [f"REMARK   1 PDB ID {pid} | {entry['titulo_rcsb'][:80]} | {org} | {entry['metodo'][:5]} {entry['resolucion_A']} A",
           f"REMARK   2 Recortado de RCSB (CC0) con scripts/trim_structure.py. Cadenas {','.join(chains)}; numeracion de autor; sin aguas."]
    if pid == "4AKE":
        hdr.append("REMARK   3 Superpuesta sobre 1AKE con los CA del CORE (res. 1-29, 60-121, 160-214).")
    return "\n".join(hdr + lines + ["END"])


def main():
    man = json.load(open(os.path.join(ROOT, "datos", "estructuras_manifest.json"), encoding="utf-8"))["entradas"]
    # transformación 4AKE -> 1AKE
    a = load("4AKE")[0]["A"]
    b = load("1AKE")[0]["A"]
    core = list(range(1, 30)) + list(range(60, 122)) + list(range(160, 215))
    fa = [a[i]["CA"] for i in core if i in a and i in b]
    fb = [b[i]["CA"] for i in core if i in a and i in b]
    sup = Superimposer()
    sup.set_atoms(fb, fa)
    rot, tran = sup.rotran
    meta = {}
    total = 0
    for e in man:
        pid = e["pdb_id"]
        if pid in NO_USAR or e["estado"] != "verificado":
            continue
        txt = build(e, aligned=(rot, tran) if pid == "4AKE" else None)
        path = os.path.join(OUTDIR, f"{pid}.js")
        with open(path, "w", encoding="utf-8") as f:
            f.write('window.STRUCTS = window.STRUCTS || {};\nwindow.STRUCTS["%s"] = %s;\n' % (pid, json.dumps(txt)))
        size = os.path.getsize(path)
        total += size
        flag = "  <-- >300 KB" if size > 300_000 else ""
        print(f"{pid}  {size/1024:7.1f} KB{flag}")
        meta[pid] = {
            "id": pid, "titulo": e["titulo_rcsb"], "organismo": e["organismo"], "metodo": e["metodo"], "res": e["resolucion_A"],
            "ligandos": e["ligandos_rcsb"], "doi": (e.get("referencia_primaria") or {}).get("doi"),
            "cita": (e.get("referencia_primaria") or {}).get("cita"),
            "residuos": e.get("residuos_verificados", []),
            "distancias": [{"id": d["id"], "desc": d["descripcion"], "valor": d["valor_A"], "atomos": d["atomos"], "par": d.get("par")} for d in e.get("distancias_medidas", [])],
            "nota": e.get("numeracion_nota"), "afirmacion": e.get("afirmacion_que_respalda"),
        }
    with open(META, "w", encoding="utf-8") as f:
        f.write("window.STRUCTMETA = " + json.dumps(meta, ensure_ascii=False) + ";\n")
    print(f"TOTAL estructuras: {total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
