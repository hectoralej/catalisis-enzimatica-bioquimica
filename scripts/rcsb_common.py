"""Utilidades compartidas para consultar RCSB y leer mmCIF (numeración de autor)."""
import json
import os
import requests
from Bio.PDB import MMCIFParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "datos", "pdb_raw")
os.makedirs(CACHE, exist_ok=True)
API = "https://data.rcsb.org/rest/v1/core"
S = requests.Session()


def get_json(url):
    r = S.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


def entry_info(pdb_id):
    """Título, método, resolución, organismos y ligandos declarados por RCSB."""
    e = get_json(f"{API}/entry/{pdb_id}")
    res = (e.get("rcsb_entry_info") or {}).get("resolution_combined")
    out = {
        "titulo_rcsb": e["struct"]["title"],
        "metodo": e["exptl"][0]["method"],
        "resolucion_A": res[0] if res else None,
        "doi": (e.get("rcsb_primary_citation") or {}).get("pdbx_database_id_DOI"),
        "cita": None,
        "fecha_deposito": e["rcsb_accession_info"]["deposit_date"][:10],
        "organismos": [],
        "polimeros": [],
        "ligandos_ccd": [],
        "obsoleto_reemplazo": (e.get("rcsb_accession_info") or {}).get("superseded_by"),
    }
    c = e.get("rcsb_primary_citation") or {}
    if c:
        out["cita"] = f"{c.get('rcsb_authors', ['?'])[0]} et al. {c.get('title','')}. {c.get('rcsb_journal_abbrev','')} {c.get('year','')};{c.get('journal_volume','')}:{c.get('page_first','')}"
    ids = e["rcsb_entry_container_identifiers"]
    for eid in ids.get("polymer_entity_ids", []):
        p = get_json(f"{API}/polymer_entity/{pdb_id}/{eid}")
        orgs = [o.get("ncbi_scientific_name") for o in p.get("rcsb_entity_source_organism", [])]
        out["polimeros"].append({
            "entidad": eid,
            "descripcion": p["rcsb_polymer_entity"]["pdbx_description"],
            "organismo": orgs,
            "cadenas_auth": p["rcsb_polymer_entity_container_identifiers"].get("auth_asym_ids"),
            "longitud": p["entity_poly"]["rcsb_sample_sequence_length"],
        })
        out["organismos"] += [o for o in orgs if o and o not in out["organismos"]]
    for eid in ids.get("non_polymer_entity_ids", []) or []:
        n = get_json(f"{API}/nonpolymer_entity/{pdb_id}/{eid}")
        out["ligandos_ccd"].append(n["pdbx_entity_nonpoly"]["comp_id"])
    return out


def fetch_cif(pdb_id):
    path = os.path.join(CACHE, f"{pdb_id}.cif")
    if not os.path.exists(path) or os.path.getsize(path) < 1000:
        r = S.get(f"https://files.rcsb.org/download/{pdb_id}.cif", timeout=120)
        r.raise_for_status()
        with open(path, "wb") as f:
            f.write(r.content)
    return path


def load(pdb_id):
    return MMCIFParser(QUIET=True).get_structure(pdb_id, fetch_cif(pdb_id))


def residues(structure, model=0):
    """Itera (cadena, residuo) con numeración de autor."""
    for ch in structure[model]:
        for r in ch:
            yield ch.id, r


def find_res(structure, chain, resi, model=0):
    for ch, r in residues(structure, model):
        if ch == chain and r.id[1] == resi and r.id[0].strip() != "W":
            return r
    return None


def hetero_summary(structure, model=0):
    """{cadena: {resname: [resi,...]}} sin aguas."""
    d = {}
    for ch, r in residues(structure, model):
        if r.id[0].startswith("H_"):
            d.setdefault(ch, {}).setdefault(r.get_resname(), []).append(r.id[1])
    return d


def dist(a, b):
    return float(a - b)
