"""Verifica por programa cada entrada de datos/estructuras_manifest.json contra RCSB.

Para cada entrada:
 1. Consulta la API de RCSB (título, organismo, método, resolución, ligandos, cita).
 2. Descarga el mmCIF y comprueba que los residuos citados (numeración de AUTOR) son del tipo declarado.
 3. Mide las distancias declaradas (mínima entre los átomos indicados) y guarda el valor medido.
 4. Si algo no coincide: estado "pendiente" y la lista de problemas (el HTML no debe usar esa estructura).
 5. Escribe reportes/verificacion_estructuras.md.

Uso:  python scripts/verify_structures.py [ID ...]   (sin argumentos: todas)
"""
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rcsb_common import ROOT, API, entry_info, load, find_res, residues  # noqa: E402

MANIFEST = os.path.join(ROOT, "datos", "estructuras_manifest.json")
REPORT = os.path.join(ROOT, "reportes", "verificacion_estructuras.md")
TODAY = datetime.date.today().isoformat()


def atoms_of(residue, names=None):
    heavy = [a for a in residue if a.element not in ("H", "D")]  # solo átomos pesados
    if names:
        return [a for a in heavy if a.get_name().strip() in names]
    return heavy


def select(structure, spec):
    """Devuelve lista de (etiqueta, átomo) para una especificación {chain, resi|het, atoms}."""
    out = []
    for ch, r in residues(structure):
        if spec.get("chain") and ch != spec["chain"]:
            continue
        hetflag = r.id[0].strip()
        if "het" in spec:
            if r.get_resname() != spec["het"] or not hetflag.startswith("H_"):
                continue
            if "resi" in spec and r.id[1] != spec["resi"]:
                continue
        else:
            if r.id[1] != spec["resi"] or hetflag == "W":
                continue
        for a in atoms_of(r, spec.get("atoms")):
            info = {"chain": ch, "resname": r.get_resname(), "resi": r.id[1], "atom": a.get_name().strip()}
            out.append((f"{ch}:{r.get_resname()}{r.id[1]}:{a.get_name().strip()}", a, info))
    return out


def min_distance(structure, a_spec, b_spec):
    A, B = select(structure, a_spec), select(structure, b_spec)
    if not A or not B:
        return None
    best = min(((x[1] - y[1], x[0], y[0], x[2], y[2]) for x in A for y in B), key=lambda t: t[0])
    return {"valor_A": round(float(best[0]), 2), "atomos": f"{best[1]} – {best[2]}", "par": [best[3], best[4]]}


def count_het(structure, comp):
    return sum(1 for _, r in residues(structure) if r.get_resname() == comp and r.id[0].startswith("H_"))


def verify(entry):
    pid = entry["pdb_id"]
    problems, notes = [], []
    try:
        info = entry_info(pid)
    except Exception as ex:
        entry["estado"] = "pendiente"
        entry["problemas"] = [f"RCSB no respondió o la entrada no existe: {ex}"]
        return entry

    entry["titulo_rcsb"] = info["titulo_rcsb"]
    entry["organismo"] = info["organismos"]
    entry["metodo"] = info["metodo"]
    entry["resolucion_A"] = info["resolucion_A"]
    entry["fecha_deposito"] = info["fecha_deposito"]
    entry["referencia_primaria"] = {"doi": info["doi"], "cita": info["cita"]}
    entry["polimeros"] = info["polimeros"]
    entry["ligandos_rcsb"] = info["ligandos_ccd"]
    entry["verificado_el"] = TODAY
    entry["verificado_via"] = f"{API}/entry/{pid}"

    if info.get("obsoleto_reemplazo"):
        problems.append(f"Entrada obsoleta, reemplazada por {info['obsoleto_reemplazo']}")
    for kw in entry.get("titulo_contiene", []):
        if kw.lower() not in info["titulo_rcsb"].lower():
            problems.append(f"El título RCSB no contiene '{kw}': {info['titulo_rcsb']}")
    if entry.get("organismo_esperado") and not any(entry["organismo_esperado"].lower() in o.lower() for o in info["organismos"]):
        problems.append(f"Organismo esperado '{entry['organismo_esperado']}' ≠ {info['organismos']}")
    for lig in entry.get("ligandos_ccd", []):
        if lig not in info["ligandos_ccd"]:
            problems.append(f"Ligando {lig} no figura en RCSB ({info['ligandos_ccd']})")

    st = load(pid)
    entry["n_modelos"] = len(st)

    for lig in entry.get("ligandos_ccd", []):
        if count_het(st, lig) == 0:
            problems.append(f"Ligando {lig} declarado pero ausente en el mmCIF")
    if "conteo_ligandos" in entry:
        entry["conteo_ligandos_medido"] = {}
        for comp, n in entry["conteo_ligandos"].items():
            got = count_het(st, comp)
            entry["conteo_ligandos_medido"][comp] = got
            if got != n:
                problems.append(f"Conteo de {comp}: esperado {n}, medido {got}")

    res_out = []
    for r in entry.get("residuos_destacados", []):
        found = find_res(st, r["chain"], r["resi"])
        got = found.get_resname() if found else None
        ok = got == r["resname"]
        res_out.append({**r, "encontrado": got, "ok": ok})
        if not ok:
            problems.append(f"Residuo {r['chain']}:{r['resname']}{r['resi']} → en el mmCIF hay {got}")
    entry["residuos_verificados"] = res_out

    d_out = []
    for d in entry.get("distancias", []):
        m = min_distance(st, d["a"], d["b"])
        if m is None:
            problems.append(f"No se pudo medir '{d['id']}' (átomos/residuos no encontrados)")
            d_out.append({**d, "valor_A": None, "atomos": None})
        else:
            d_out.append({**d, **m})
    entry["distancias_medidas"] = d_out

    entry["problemas"] = problems
    entry["estado"] = "verificado" if not problems else "pendiente"
    return entry


def write_report(data):
    L = ["# Verificación de estructuras (RCSB PDB)", "",
         f"Generado por `scripts/verify_structures.py` el {TODAY}. Numeración de residuos = numeración de autor del mmCIF.", "",
         "| ID | Título (RCSB) | Organismo | Método / res. (Å) | Ligandos | Secciones | Estado |", "|---|---|---|---|---|---|---|"]
    for e in data["entradas"]:
        L.append(f"| {e['pdb_id']} | {e.get('titulo_rcsb','?')[:70]} | {', '.join(e.get('organismo', []))} | "
                 f"{e.get('metodo','?').replace('X-RAY DIFFRACTION','X-ray')} {e.get('resolucion_A','?')} | "
                 f"{', '.join(e.get('ligandos_rcsb', []))} | {', '.join(e.get('secciones', []))} | **{e['estado']}** |")
    L.append("")
    for e in data["entradas"]:
        L += [f"## {e['pdb_id']} — {e['estado']}", "", f"- Título RCSB: {e.get('titulo_rcsb')}",
              f"- Referencia primaria: DOI {e.get('referencia_primaria', {}).get('doi')} — {e.get('referencia_primaria', {}).get('cita')}",
              f"- Afirmación que respalda: {e.get('afirmacion_que_respalda')}"]
        if e.get("usar") is False:
            L.append("- **No se usará en el recurso** (ver afirmación).")
        for r in e.get("residuos_verificados", []):
            L.append(f"  - {'✔' if r['ok'] else '✘'} {r['chain']}:{r['resname']}{r['resi']} ({r['rol']}) → {r['encontrado']}")
        for d in e.get("distancias_medidas", []):
            L.append(f"  - Distancia `{d['id']}`: {d['valor_A']} Å ({d['atomos']}) — {d['descripcion']}")
        if e.get("conteo_ligandos_medido"):
            L.append(f"  - Conteo de ligandos medido: {e['conteo_ligandos_medido']}")
        if e.get("numeracion_nota"):
            L.append(f"  - Nota de numeración: {e['numeracion_nota']}")
        if e.get("alineamiento"):
            al = e["alineamiento"]
            L.append(f"  - Alineamiento (PyMOL `align` sobre Cα del CORE, cadena A; verificado con Biopython): RMSD CORE {al['A']['rmsd_core_A']} Å "
                     f"({al['A']['n_ca_core']} Cα); desplazamiento máx. {al['A']['desplazamiento_max_ca_A']} Å; "
                     f"segmentos que se mueven >4 Å: {al['A']['segmentos_que_se_mueven_gt4A']}; "
                     f"RMS NMP 30–59 = {al['A']['rmsd_NMPbind_30-59_A']} Å, LID 122–159 = {al['A']['rmsd_LID_122-159_A']} Å. "
                     "Sesión: `reportes/ak_4AKE_1AKE.pse`; script: `scripts/pymol/ak_align.py`.")
        for p in e.get("problemas", []):
            L.append(f"  - ⚠ {p}")
        L.append("")
    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(L))


def main():
    with open(MANIFEST, encoding="utf-8") as f:
        data = json.load(f)
    only = {a.upper() for a in sys.argv[1:]}
    ak_path = os.path.join(ROOT, "reportes", "ak_alineamiento.json")
    ak = json.load(open(ak_path, encoding="utf-8")) if os.path.exists(ak_path) else None
    for i, e in enumerate(data["entradas"]):
        if only and e["pdb_id"] not in only:
            continue
        print("verificando", e["pdb_id"], flush=True)
        data["entradas"][i] = verify(e)
        if ak and e["pdb_id"] in ("4AKE", "1AKE"):
            data["entradas"][i]["alineamiento"] = ak  # RMSD 4AKE→1AKE medido con PyMOL (scripts/pymol/ak_align.py)
        print("   →", data["entradas"][i]["estado"], data["entradas"][i].get("problemas", ""))
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    write_report(data)
    bad = [e["pdb_id"] for e in data["entradas"] if e["estado"] != "verificado"]
    print("\nPendientes/descartadas:", bad or "ninguna")


if __name__ == "__main__":
    main()
