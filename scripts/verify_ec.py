# -*- coding: utf-8 -*-
"""Comprueba los números E.C. del recurso contra Expasy ENZYME (SIB; nomenclatura IUBMB) y escribe datos/ec_verificados.json.

Se compara el nombre aceptado devuelto por la base con el nombre esperado (palabras clave). Las entradas transferidas/borradas
se marcan (p. ej. el E.C. 4.1.1.1 sigue vigente; si alguno cambia, aparecerá aquí).
"""
import json
import os
import re
import sys
import html
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EC = [
    ("1.1.1.1", "alcohol dehydrogenase", "Alcohol deshidrogenasa"), ("1.1.1.27", "lactate dehydrogenase", "Lactato deshidrogenasa"),
    ("1.1.1.37", "malate dehydrogenase", "Malato deshidrogenasa"), ("2.7.1.1", "hexokinase", "Hexoquinasa"), ("2.7.1.2", "glucokinase", "Glucoquinasa"),
    ("3.2.1.23", "galactosidase", "β-Galactosidasa"), ("3.4.17.1", "carboxypeptidase A", "Carboxipeptidasa A"),
    ("4.2.1.11", "phosphopyruvate hydratase", "Enolasa (fosfopiruvato hidratasa)"), ("4.1.1.1", "pyruvate decarboxylase", "Piruvato descarboxilasa"),
    ("5.3.1.1", "triose-phosphate isomerase", "Triosafosfato isomerasa"), ("5.3.1.9", "glucose-6-phosphate isomerase", "Glucosa-6-fosfato isomerasa (fosfoglucosa isomerasa)"),
    ("5.2.1.1", "maleate isomerase", "Maleato isomerasa"), ("6.4.1.1", "pyruvate carboxylase", "Piruvato carboxilasa"),
    ("2.7.1.40", "pyruvate kinase", "Piruvato quinasa"), ("2.7.11.11", "cAMP-dependent protein kinase", "Proteína quinasa A"), ("3.2.1.20", "alpha-glucosidase", "(control: α-glucosidasa)"),
    ("2.7.1.11", "6-phosphofructokinase", "Fosfofructoquinasa-1"), ("4.1.2.13", "fructose-bisphosphate aldolase", "Aldolasa"),
    ("1.2.1.12", "glyceraldehyde-3-phosphate dehydrogenase", "Gliceraldehído-3-fosfato deshidrogenasa"), ("2.7.2.3", "phosphoglycerate kinase", "Fosfoglicerato quinasa"),
    ("5.4.2.11", "phosphoglycerate mutase", "Fosfoglicerato mutasa"), ("5.4.2.12", "phosphoglycerate mutase", "Fosfoglicerato mutasa (independiente de 2,3-BPG)")]


def fetch(ec):
    """Nombre aceptado desde Expasy ENZYME (SIB), que replica la nomenclatura de la IUBMB/ExplorEnz."""
    r = requests.get(f"https://enzyme.expasy.org/EC/{ec}", timeout=60)
    t = html.unescape(re.sub(r"<[^>]+>", " ", r.text))
    t = re.sub(r"\s+", " ", t)
    m = re.search(r"ENZYME - " + re.escape(ec) + r"\s+(.*?)\s+ENZYME Home", t)
    name = m.group(1).strip() if m else None
    if name and re.search(r"Transferred entry|Deleted entry", t):
        name += "  [ENTRADA TRANSFERIDA/BORRADA]"
    return name, t[:300]


def main():
    out, seen = [], set()
    for ec, kw, es in EC:
        if ec in seen:
            continue
        seen.add(ec)
        try:
            name, raw = fetch(ec)
        except Exception as ex:
            out.append({"ec": ec, "esperado": es, "estado": "no verificado", "error": str(ex)})
            print(ec, "ERROR", ex)
            continue
        ok = bool(name) and kw.lower() in name.lower()
        out.append({"ec": ec, "esperado": es, "nombre_aceptado": name, "estado": "verificado" if ok else "no verificado", "fuente": f"https://enzyme.expasy.org/EC/{ec}", "crudo": None if ok else raw})
        print(f"{'OK ' if ok else '???'} {ec:<9} {name}")
    json.dump(out, open(os.path.join(ROOT, "datos", "ec_verificados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()


