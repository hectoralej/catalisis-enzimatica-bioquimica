"""Búsqueda de estructuras candidatas en RCSB (search API v2) y resumen de cada resultado.

Uso: python scripts/search_rcsb.py "texto libre" [--comp PEP] [--max 12] [--maxres 2.5]
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rcsb_common import S, API  # noqa: E402

SEARCH = "https://search.rcsb.org/rcsbsearch/v2/query"


def search(text, comp=None, maxres=None, rows=12):
    nodes = [{"type": "terminal", "service": "full_text", "parameters": {"value": text}}]
    if comp:
        nodes.append({"type": "terminal", "service": "text", "parameters": {
            "attribute": "rcsb_nonpolymer_entity_container_identifiers.nonpolymer_comp_id", "operator": "exact_match", "value": comp}})
    if maxres:
        nodes.append({"type": "terminal", "service": "text", "parameters": {
            "attribute": "rcsb_entry_info.resolution_combined", "operator": "less_or_equal", "value": maxres}})
    q = {"query": {"type": "group", "logical_operator": "and", "nodes": nodes},
         "return_type": "entry",
         "request_options": {"paginate": {"start": 0, "rows": rows}, "sort": [{"sort_by": "score", "direction": "desc"}]}}
    r = S.post(SEARCH, json=q, timeout=60)
    if r.status_code == 204:
        return []
    r.raise_for_status()
    return [h["identifier"] for h in r.json().get("result_set", [])]


def brief(pid):
    e = S.get(f"{API}/entry/{pid}", timeout=60).json()
    res = (e.get("rcsb_entry_info") or {}).get("resolution_combined")
    lig = e["rcsb_entry_info"].get("nonpolymer_bound_components") or []
    org = []
    for eid in e["rcsb_entry_container_identifiers"].get("polymer_entity_ids", [])[:3]:
        p = S.get(f"{API}/polymer_entity/{pid}/{eid}", timeout=60).json()
        org += [o.get("ncbi_scientific_name") for o in p.get("rcsb_entity_source_organism", [])]
    return f"{pid} | {e['struct']['title'][:90]} | {e['exptl'][0]['method'][:5]} {res[0] if res else '?'} | {sorted(set(org))} | {lig}"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("text")
    ap.add_argument("--comp")
    ap.add_argument("--max", type=int, default=12)
    ap.add_argument("--maxres", type=float)
    a = ap.parse_args()
    for pid in search(a.text, a.comp, a.maxres, a.max):
        try:
            print(brief(pid))
        except Exception as ex:
            print(pid, "ERROR", ex)

