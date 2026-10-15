# -*- coding: utf-8 -*-
"""Contrasta cada molécula de molecules_list.py contra el CCD del PDB y PubChem y escribe datos/moleculas.json.

Criterio de verificación (por molécula):
  - 'verificado'  : el InChIKey (bloque de conectividad, 14 caracteres) coincide entre CCD, PubChem y el SMILES elegido
                    (recalculado con RDKit). El bloque de conectividad es insensible al estado de protonación.
  - 'parcial'     : solo hay UNA fuente externa (CCD o PubChem) y es coherente con el SMILES elegido.
  - 'no verificado': ninguna fuente o hay discrepancia de conectividad.
Se anotan aparte las diferencias de estereoquímica (2.º bloque del InChIKey) y de fórmula (estados de protonación).
"""
import json
import os
import re
import sys
import time
from collections import Counter

import requests
from rdkit import Chem
from rdkit.Chem import inchi, rdMolDescriptors

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from molecules_list import M  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "datos", "moleculas.json")
S = requests.Session()
S.headers["User-Agent"] = "termo-cinetica/1.0"


def ccd_lookup(codes, claves):
    for code in codes:
        r = S.get(f"https://data.rcsb.org/rest/v1/core/chemcomp/{code}", timeout=60)
        if r.status_code != 200:
            continue
        j = r.json()
        name = (j["chem_comp"].get("name") or "")
        if claves and not any(k.lower() in name.lower() for k in claves):
            continue  # el código existe pero NO es la molécula buscada
        d = j.get("rcsb_chem_comp_descriptor") or {}
        return {"codigo": code, "nombre": name, "formula": j["chem_comp"].get("formula"),
                "inchikey": d.get("InChIKey"), "smiles": d.get("SMILES_stereo") or d.get("SMILES"),
                "carga_formal": j["chem_comp"].get("pdbx_formal_charge")}
    return None


def ccd_by_inchikey(key):
    """Localiza en el CCD una entrada con el MISMO grafo molecular (búsqueda por descriptor InChIKey)."""
    q = {"query": {"type": "terminal", "service": "chemical", "parameters": {"value": key, "type": "descriptor", "descriptor_type": "InChIKey", "match_type": "graph-exact"}},
         "return_type": "mol_definition", "request_options": {"paginate": {"start": 0, "rows": 5}}}
    r = S.post("https://search.rcsb.org/rcsbsearch/v2/query", json=q, timeout=60)
    if r.status_code != 200:
        return None
    for h in r.json().get("result_set", []):
        j = S.get(f"https://data.rcsb.org/rest/v1/core/chemcomp/{h['identifier']}", timeout=60)
        if j.status_code != 200:
            continue
        j = j.json(); d = j.get("rcsb_chem_comp_descriptor") or {}
        return {"codigo": h["identifier"], "nombre": j["chem_comp"].get("name"), "formula": j["chem_comp"].get("formula"),
                "inchikey": d.get("InChIKey"), "smiles": d.get("SMILES_stereo") or d.get("SMILES"),
                "carga_formal": j["chem_comp"].get("pdbx_formal_charge"), "localizado_por": "InChIKey de PubChem (graph-exact)"}
    return None


def pubchem_lookup(name):
    base = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" + requests.utils.quote(name)
    r = S.get(base + "/property/MolecularFormula,InChIKey,SMILES,Title/JSON", timeout=60)
    time.sleep(0.25)
    if r.status_code != 200:
        return None
    p = r.json()["PropertyTable"]["Properties"][0]
    return {"cid": p["CID"], "titulo": p.get("Title"), "formula": p["MolecularFormula"], "inchikey": p["InChIKey"],
            "smiles": p.get("SMILES") or p.get("IsomericSMILES")}


def nci_lookup(name):
    """Segunda fuente externa independiente de PubChem/CCD: resolvedor químico del NCI/CADD (cactus)."""
    out = {}
    for rep_, k in (("stdinchikey", "inchikey"), ("formula", "formula")):
        try:
            r = S.get(f"https://cactus.nci.nih.gov/chemical/structure/{requests.utils.quote(name)}/{rep_}", timeout=40)
        except Exception:
            return None
        if r.status_code != 200:
            return None
        out[k] = r.text.strip().replace("InChIKey=", "")
    time.sleep(0.25)
    return out


def rd_info(smiles):
    m = Chem.MolFromSmiles(smiles)
    if m is None:
        return None
    return {"formula": rdMolDescriptors.CalcMolFormula(m), "inchikey": inchi.MolToInchiKey(m)}


_ACIDOS = [Chem.MolFromSmarts("[OX2H][P]"), Chem.MolFromSmarts("[OX2H][CX3]=O")]


def ionizar(smiles):
    """Forma de dibujo a pH fisiológico: fosfatos y carboxilos desprotonados (el resto no se toca).
    Devuelve (smiles, conectividad_igual) donde el 2.º valor comprueba que el InChIKey (bloque 1) no cambió."""
    m = Chem.MolFromSmiles(smiles)
    if m is None:
        return None, False
    rw = Chem.RWMol(m)
    idx = {a for patt in _ACIDOS for match in rw.GetSubstructMatches(patt) for a in match[:1]}
    for i in idx:
        at = rw.GetAtomWithIdx(i)
        at.SetFormalCharge(-1)
        at.SetNumExplicitHs(0)
        at.SetNoImplicit(True)
    try:
        Chem.SanitizeMol(rw)
    except Exception:
        return None, False
    out = Chem.MolToSmiles(rw)
    ok = block1(inchi.MolToInchiKey(rw)) == block1(inchi.MolToInchiKey(m))
    return out, ok


def block1(k):
    return k.split("-")[0] if k else None


def block2(k):
    return k.split("-")[1] if k and "-" in k else None


def main():
    out = []
    for m in M:
        rec = {"id": m["id"], "nombre": m["nombre"], "usos": m["usos"]}
        ccd = ccd_lookup(m["ccd"], m["clave"]) if m["ccd"] else None
        pc = pubchem_lookup(m["pubchem"]) if m.get("pubchem") else None
        if ccd is None and pc:
            ccd = ccd_by_inchikey(pc["inchikey"])
        nci = nci_lookup(m.get("nci") or m["pubchem"]) if m.get("pubchem") else None
        rec["ccd"] = ccd
        rec["pubchem"] = pc
        rec["nci_cadd"] = nci
        chosen = (ccd and ccd["smiles"]) or (pc and pc["smiles"]) or m.get("smiles_manual")
        rec["fuente_smiles"] = "CCD" if ccd and ccd["smiles"] else ("PubChem" if pc else ("manual (sin fuente externa)" if chosen else None))
        notas = [m["nota"]] if m.get("nota") else []
        rd = rd_info(chosen) if chosen else None
        rec["smiles"] = chosen
        rec["rdkit"] = rd
        keys = {k: v for k, v in {"ccd": ccd and ccd["inchikey"], "pubchem": pc and pc["inchikey"], "nci": nci and nci["inchikey"], "rdkit": rd and rd["inchikey"]}.items() if v}
        externas = [k for k in ("ccd", "pubchem", "nci") if k in keys]
        rec["fuentes_externas"] = externas
        # Consenso: el bloque de conectividad más frecuente entre las fuentes externas debe coincidir con RDKit.
        ext_b1 = {k: block1(keys[k]) for k in externas}
        best, cnt = (Counter(ext_b1.values()).most_common(1)[0] if ext_b1 else (None, 0))
        agree = [k for k in externas if ext_b1[k] == best]
        outliers = [k for k in externas if ext_b1[k] != best]
        rd_ok = bool(rd) and block1(rd["inchikey"]) == best
        if cnt >= 2 and rd_ok:
            rec["estado"] = "verificado"
            if outliers:
                notas.append(f"Fuente(s) discrepante(s) descartada(s) por consenso de las demás: {outliers} -> {[keys[k] for k in outliers]}")
        elif cnt == 1 and len(externas) == 1 and rd_ok:
            rec["estado"] = "parcial"
            notas.append("Solo una fuente externa disponible; coherente con RDKit.")
        else:
            forms = {re.sub(r"\s+", "", f) for f in [ccd and ccd["formula"], pc and pc["formula"], nci and nci["formula"]] if f}
            forms |= {rd["formula"]} if rd else set()
            rec["estado"] = "no verificado"
            if len(externas) == 0:
                notas.append("Ninguna fuente externa pudo contrastarse.")
            else:
                notas.append(f"DISCREPANCIA de conectividad (posible tautomería/isomería si la fórmula coincide): {keys}")
        # estereoquímica: solo entre las fuentes que coinciden en conectividad
        stereo = {k: block2(keys[k]) for k in (agree + (["rdkit"] if rd_ok else [])) if block2(keys[k]) != "UHFFFAOYSA"}
        if len(set(stereo.values())) > 1:
            rec["estado"] = "no verificado"
            notas.append(f"CONFLICTO de estereoquímica entre fuentes: {stereo}")
        elif stereo and any(block2(keys[k]) == "UHFFFAOYSA" for k in agree):
            notas.append("Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define.")
        if ccd and pc and ccd["formula"] and pc["formula"] and ccd["formula"].replace(" ", "") != pc["formula"].replace(" ", ""):
            notas.append(f"Fórmulas distintas por estado de protonación/carga: CCD {ccd['formula']} vs PubChem {pc['formula']}.")
        if chosen:
            fis, ok_fis = ionizar(chosen)
            rec["smiles_dibujo_ph7"] = fis
            if not ok_fis:
                notas.append("OJO: la forma ionizada no conserva el InChIKey de conectividad; dibujar con el SMILES original.")
        rec["notas"] = notas
        out.append(rec)
        print(f"{rec['estado']:<14} {m['id']:<14} ext={'+'.join(externas):<18} CCD={ccd['codigo'] if ccd else '-':<4} CID={pc['cid'] if pc else '-'}  {'; '.join(notas)[:110]}", flush=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"generado": time.strftime("%Y-%m-%d"), "criterio": __doc__.strip(), "moleculas": out}, f, ensure_ascii=False, indent=2)
    L = ["# Verificación de moléculas 2D (SMILES / InChIKey)", "", f"Generado por `scripts/build_2d.py` el {time.strftime('%Y-%m-%d')}.", "",
         "Criterio: se exigen ≥2 fuentes externas independientes (CCD del PDB, PubChem, resolvedor NCI/CADD) con el mismo "
         "InChIKey de conectividad (bloque 1), coherentes con el SMILES recalculado en RDKit. Una fuente discrepante se descarta si las demás concuerdan.", "",
         "| Estado | id | Nombre | Fuentes externas | CCD | CID PubChem | Notas |", "|---|---|---|---|---|---|---|"]
    for r in out:
        L.append(f"| **{r['estado']}** | {r['id']} | {r['nombre']} | {'+'.join(r.get('fuentes_externas', []))} | "
                 f"{r['ccd']['codigo'] if r['ccd'] else '-'} | {r['pubchem']['cid'] if r['pubchem'] else '-'} | {' '.join(r['notas'])[:200]} |")
    with open(os.path.join(ROOT, "reportes", "verificacion_moleculas.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L))


if __name__ == "__main__":
    main()
