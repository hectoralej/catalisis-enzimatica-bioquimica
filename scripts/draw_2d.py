# -*- coding: utf-8 -*-
"""Dibuja con RDKit las moléculas de datos/moleculas.json (SMILES contrastados) → web/assets/svg/<id>.svg y web/assets/js/svgs.js.

Los resaltados se aplican por ÍNDICE de átomo encontrado con SMARTS (nunca a ojo). Los SVG usan currentColor para el trazo
(siguen el tema claro/oscuro) y una paleta de heteroátomos legible en ambos temas.
"""
import json
import os
import re
import sys

from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "web", "assets", "svg")
JS = os.path.join(ROOT, "web", "assets", "js", "svgs.js")
os.makedirs(OUT, exist_ok=True)

SIZES = {"atp": (520, 300), "adp": (480, 280), "nad": (560, 340), "nadh": (560, 340), "nadp": (600, 360), "nadph": (600, 360),
         "fad": (560, 420), "fadh2": (560, 420), "fmn": (440, 380), "ap5a": (700, 320), "metotrexato": (520, 280), "folato": (500, 280),
         "dihidrofolato": (500, 280), "lactosa": (460, 260), "araquidonico": (520, 220), "fisostigmina": (320, 240), "nevirapina": (300, 240)}
DEFAULT = (300, 220)

# SMARTS con mapa de átomos → índices a resaltar (color, etiqueta)
HL_ATOMS = {
    "nad": ("[NH2]C(=O)[#6]1~[#6]~[#7]~[#6]~[#6]~[#6:4]1", (4,), (0.95, 0.6, 0.1)),   # C4 del nicotinamida (aceptor del hidruro)
    "nadh": ("[NH2]C(=O)[#6]1~[#6]~[#7]~[#6]~[#6]~[#6:4]1", (4,), (0.95, 0.6, 0.1)),
    "nadp": ("[NH2]C(=O)[#6]1~[#6]~[#7]~[#6]~[#6]~[#6:4]1", (4,), (0.95, 0.6, 0.1)),
    "nadph": ("[NH2]C(=O)[#6]1~[#6]~[#7]~[#6]~[#6]~[#6:4]1", (4,), (0.95, 0.6, 0.1)),
    "catecol": ("[OH]c1c([OH])cccc1", (0, 2), (0.95, 0.6, 0.1)),
}
# isoaloxazina: N5 y N1 (átomos que reciben H en la reducción)
ISO = "[#7:5]1~[#6]2~[#6](=O)~[#7]~[#6](=O)~[#7:1]~[#6]2~[#7]~[#6]2~[#6]~[#6]~[#6]~[#6]~[#6]~12"


def find_idx(mol, smarts, wanted):
    patt = Chem.MolFromSmarts(smarts)
    m = mol.GetSubstructMatch(patt)
    if not m:
        return []
    maps = {a.GetAtomMapNum(): a.GetIdx() for a in patt.GetAtoms() if a.GetAtomMapNum()}
    if maps:
        return [m[maps[w]] for w in wanted if w in maps]
    return [m[i] for i in wanted]


def bond_sets_atp(mol):
    """Enlaces fosfoanhidro (P–O–P) y fosfoéster (C–O–P) por SMARTS."""
    anh, est = set(), set()
    for m in mol.GetSubstructMatches(Chem.MolFromSmarts("P~O~P")):
        for i in (0, 2):
            anh.add(mol.GetBondBetweenAtoms(m[i], m[1]).GetIdx())
    for m in mol.GetSubstructMatches(Chem.MolFromSmarts("[#6]-O-P")):
        est.add(mol.GetBondBetweenAtoms(m[1], m[2]).GetIdx())
        est.add(mol.GetBondBetweenAtoms(m[0], m[1]).GetIdx())
    return sorted(anh), sorted(est - set(anh))


F16BP = "[CH2:1]([O][P])[C:2]1([OH])[CH:3]([OH])[CH:4]([OH])[CH:5]([O]1)[CH2:6][O][P]"
RED, BLUE = (0.86, 0.15, 0.15), (0.12, 0.32, 0.85)


def dual_colors(mol):
    """Fructosa-1,6-bisfosfato: C1–C3 (+ sustituyentes) en rojo = futuro DHAP; C4–C6 en azul = futuro G3P (como en el PDF del usuario)."""
    patt = Chem.MolFromSmarts(F16BP)
    m = mol.GetSubstructMatch(patt)
    if not m:
        return {}, {}
    maps = {a.GetAtomMapNum(): m[i] for i, a in enumerate(patt.GetAtoms()) if a.GetAtomMapNum()}
    col = {}
    for k in (1, 2, 3):
        col[maps[k]] = RED
    for k in (4, 5, 6):
        col[maps[k]] = BLUE
    queue = list(col)
    while queue:                        # propaga el color a los heteroátomos unidos (el O del anillo queda del lado de C2: rojo)
        i = queue.pop(0)
        for nb in mol.GetAtomWithIdx(i).GetNeighbors():
            j = nb.GetIdx()
            if j not in col:
                col[j] = col[i]
                queue.append(j)
    bcol = {}
    for b in mol.GetBonds():
        a, c = b.GetBeginAtomIdx(), b.GetEndAtomIdx()
        if col.get(a) == col.get(c):
            bcol[b.GetIdx()] = col[a]
    return col, bcol


def draw(rec, variant=None):
    smi = rec.get("smiles_dibujo_ph7") or rec["smiles"]
    mol = Chem.MolFromSmiles(smi)
    if mol is None:
        return None
    rdDepictor.SetPreferCoordGen(True)
    rdDepictor.Compute2DCoords(mol)
    w, h = SIZES.get(rec["id"], DEFAULT)
    d = rdMolDraw2D.MolDraw2DSVG(w, h)
    o = d.drawOptions()
    o.clearBackground = False
    o.bondLineWidth = 2
    o.minFontSize = 13
    o.padding = 0.08
    o.setHighlightColour((0.95, 0.6, 0.1, 0.55))
    o.updateAtomPalette({7: (0.18, 0.4, 0.85), 8: (0.84, 0.18, 0.18), 15: (0.8, 0.45, 0.05), 16: (0.6, 0.5, 0.0), 9: (0.1, 0.6, 0.3), 26: (0.8, 0.4, 0.1)})
    if variant in ("rojo", "azul"):                        # toda la molécula de un color (DHAP rojo / G3P azul, como en el PDF)
        c = RED if variant == "rojo" else BLUE
        o.updateAtomPalette({6: c, 7: c, 8: c, 15: c, 1: c})
    hat, hb, hbc = [], [], {}
    if rec["id"] in HL_ATOMS:
        sm, want, col = HL_ATOMS[rec["id"]]
        hat = find_idx(mol, sm, want)
    if rec["id"] in ("fad", "fadh2", "fmn"):
        hat = find_idx(mol, ISO, (5, 1))
    if rec["id"] in ("atp", "adp", "amp", "ppi", "ap5a"):
        anh, est = bond_sets_atp(mol)
        hb = anh + est
        hbc = {**{i: (0.84, 0.18, 0.18) for i in anh}, **{i: (0.18, 0.4, 0.85) for i in est}}
    if rec["id"] == "f16bp" and variant is None:
        acol, bcol = dual_colors(mol)
        o.highlightBondWidthMultiplier = 10           # solo bandas de color bajo los enlaces (sin círculos en los átomos)
        bcol = {k: (v[0], v[1], v[2], 0.6) for k, v in bcol.items()}
        d.DrawMolecule(mol, highlightAtoms=[], highlightBonds=list(bcol), highlightBondColors=bcol)
    else:
        d.DrawMolecule(mol, highlightAtoms=hat or None, highlightBonds=hb or None, highlightBondColors=hbc or None)
    d.FinishDrawing()
    svg = d.GetDrawingText()
    svg = re.sub(r"<rect[^>]*style='opacity:1\.0;fill:#FFFFFF[^>]*/>", "", svg)          # fondo blanco
    svg = svg.replace("#000000", "currentColor").replace("#FFFFFF", "none")
    svg = svg.replace("<svg ", "<svg role='img' aria-label='%s' " % rec["nombre"].replace("'", ""), 1)
    return svg, bool(hat), bool(hb)


def main():
    data = json.load(open(os.path.join(ROOT, "datos", "moleculas.json"), encoding="utf-8"))["moleculas"]
    svgs = {}
    for rec in data:
        res = draw(rec)
        if not res:
            print("SIN DIBUJO", rec["id"])
            continue
        svg, had_hl, had_b = res
        open(os.path.join(OUT, rec["id"] + ".svg"), "w", encoding="utf-8").write(svg)
        for vid, base, var in (("dhap_rojo", "dhap", "rojo"), ("g3p_azul", "g3p", "azul")):
            if rec["id"] == base:
                vs = draw(rec, var)
                open(os.path.join(OUT, vid + ".svg"), "w", encoding="utf-8").write(vs[0])
                svgs[vid] = {"svg": vs[0], "nombre": rec["nombre"], "estado": rec["estado"], "smiles": rec["smiles"], "fuentes": rec.get("fuentes_externas", []), "ccd": (rec["ccd"] or {}).get("codigo"), "cid": (rec["pubchem"] or {}).get("cid")}
        svgs[rec["id"]] = {"svg": svg, "nombre": rec["nombre"], "estado": rec["estado"], "smiles": rec["smiles"],
                           "fuentes": rec.get("fuentes_externas", []), "ccd": (rec["ccd"] or {}).get("codigo"),
                           "cid": (rec["pubchem"] or {}).get("cid")}
        print(f"{rec['id']:<14} {len(svg)/1024:5.1f} KB  resalt_atomos={had_hl}  resalt_enlaces={had_b}")
    with open(JS, "w", encoding="utf-8") as f:
        f.write("window.MOLS = " + json.dumps(svgs, ensure_ascii=False) + ";\n")


if __name__ == "__main__":
    main()
