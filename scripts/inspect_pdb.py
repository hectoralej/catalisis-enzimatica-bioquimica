"""Inspección rápida de IDs del PDB: imprime lo que declara RCSB y lo que contiene el mmCIF."""
import sys
from rcsb_common import entry_info, load, hetero_summary

for pid in sys.argv[1:]:
    pid = pid.upper()
    print("=" * 70)
    try:
        info = entry_info(pid)
    except Exception as ex:  # entrada inexistente u obsoleta
        print(pid, "ERROR RCSB:", ex)
        continue
    print(pid, "|", info["titulo_rcsb"])
    print("   ", info["metodo"], info["resolucion_A"], "Å | organismos:", info["organismos"], "| depósito", info["fecha_deposito"])
    print("    doi:", info["doi"])
    for p in info["polimeros"]:
        print("    entidad", p["entidad"], p["descripcion"], p["cadenas_auth"], "len", p["longitud"])
    print("    ligandos (RCSB):", info["ligandos_ccd"])
    try:
        st = load(pid)
        het = hetero_summary(st)
        print("    modelos:", len(st), "| cadenas:", [c.id for c in st[0]])
        for ch, d in het.items():
            print("     hetero", ch, {k: (v if len(v) <= 3 else f"{len(v)}x") for k, v in d.items()})
    except Exception as ex:
        print("    mmCIF ERROR:", ex)
