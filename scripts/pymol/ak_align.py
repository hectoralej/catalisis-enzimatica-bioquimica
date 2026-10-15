# -*- coding: utf-8 -*-
"""Alinea la adenilato quinasa abierta (4AKE) con la cerrada (1AKE) y mide qué se mueve.

Ejecutar:  PyMOL2\\Scripts\\pymol.exe -cq scripts\\pymol\\ak_align.py
Salida:    reportes/ak_alineamiento.json  y  reportes/ak_4AKE_1AKE.pse (sesión abrible en PyMOL)

Método: (1) se superponen los carbonos α del dominio CORE (por convención de la literatura: residuos 1-29, 60-121 y
160-214); (2) se mide el RMSD del CORE y el desplazamiento de cada Cα del resto; (3) los segmentos que más se mueven
se detectan a partir de los datos (>4 Å), sin asumir los límites de los dominios.
"""
import json
import os

import numpy as np
from pymol import cmd

ROOT = os.environ.get("TC_ROOT", os.getcwd())  # ejecutar desde la raíz del proyecto (PyMOL no define __file__ útil)
RAW = os.path.join(ROOT, "datos", "pdb_raw")
OUT = os.path.join(ROOT, "reportes")
CORE = "resi 1-29+60-121+160-214"

cmd.reinitialize()
cmd.load(os.path.join(RAW, "4AKE.cif"), "open")
cmd.load(os.path.join(RAW, "1AKE.cif"), "closed")

res = {}
for ch in ("A", "B"):
    mob = f"open and chain {ch} and name CA and {CORE}"
    tgt = f"closed and chain {ch} and name CA and {CORE}"
    r = cmd.align(mob, tgt, cycles=0, transform=0)   # RMSD sin rechazo de valores atípicos
    rms_core, n_core = r[0], r[1]
    # aplica la transformación a TODA la cadena abierta
    cmd.align(f"open and chain {ch} and {CORE}", f"closed and chain {ch} and {CORE}", cycles=0, transform=1)
    ca_open = {a.resi: np.array(a.coord) for a in cmd.get_model(f"open and chain {ch} and name CA").atom}
    ca_closed = {a.resi: np.array(a.coord) for a in cmd.get_model(f"closed and chain {ch} and name CA").atom}
    common = sorted(set(ca_open) & set(ca_closed), key=int)
    disp = {int(i): float(np.linalg.norm(ca_open[i] - ca_closed[i])) for i in common}
    # segmentos contiguos con desplazamiento > 4 Å (se admite un hueco de hasta 3 residuos)
    segs, cur = [], None
    for i in sorted(disp):
        if disp[i] > 4.0:
            if cur and i - cur[1] <= 4:
                cur[1] = i
                cur[2] = max(cur[2], disp[i])
            else:
                cur = [i, i, disp[i]]
                segs.append(cur)
    all_ca = np.array([disp[i] for i in sorted(disp)])
    rms_all = float(np.sqrt((all_ca ** 2).mean()))
    res[ch] = {
        "rmsd_core_A": round(float(rms_core), 2), "n_ca_core": int(n_core),
        "rmsd_todos_ca_tras_superponer_core_A": round(rms_all, 2), "n_ca_total": len(all_ca),
        "desplazamiento_max_ca_A": round(float(all_ca.max()), 1),
        "segmentos_que_se_mueven_gt4A": [{"desde": s[0], "hasta": s[1], "max_A": round(s[2], 1)} for s in segs],
    }
    # RMSD de dominios candidatos (límites de la literatura; solo informativo)
    for nombre, rng in (("NMPbind_30-59", (30, 59)), ("LID_122-159", (122, 159))):
        v = [disp[i] for i in disp if rng[0] <= i <= rng[1]]
        res[ch][f"rmsd_{nombre}_A"] = round(float(np.sqrt((np.array(v) ** 2).mean())), 2) if v else None

# sesión para el usuario
cmd.hide("everything"); cmd.show("cartoon", "open or closed")
cmd.color("marine", "open"); cmd.color("salmon", "closed")
cmd.show("sticks", "closed and resn AP5"); cmd.color("yellow", "closed and resn AP5")
cmd.set("cartoon_fancy_helices", 1)
cmd.orient("open and chain A or closed and chain A")
cmd.save(os.path.join(OUT, "ak_4AKE_1AKE.pse"))
json.dump(res, open(os.path.join(OUT, "ak_alineamiento.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("AK_ALIGN_OK", json.dumps(res, ensure_ascii=False))
