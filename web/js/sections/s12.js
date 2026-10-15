/* S12 — Coenzimas redox: NAD⁺/NADH y FAD/FADH₂ (diap. 38–39) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  /* E°′ (V, pH 7, 25 °C): valores de libro de texto (tipo Lehninger) — sin verificar en esta sesión. */
  var COUPLES = [
    { id: "nad", name: "NAD⁺ / NADH + H⁺", E: -0.320 }, { id: "fad", name: "FAD / FADH₂ (libre)", E: -0.22 }, { id: "pyr", name: "piruvato / lactato", E: -0.19 },
    { id: "oaa", name: "oxalacetato / malato", E: -0.17 }, { id: "ace", name: "acetaldehído / etanol", E: -0.197 }, { id: "o2", name: "½ O₂ / H₂O", E: 0.82 }
  ];
  var SET = {
    nad: { name: "Derivados de nicotinamida", ox: "nad", red: "nadh", txt: "Transfieren <b>hidruros</b> (H:⁻ = 2 e⁻ + H⁺) al <b>C4</b> del anillo de nicotinamida (cara A o B); el NAD⁺–NADH participa en reacciones catabólicas y el NADP⁺–NADPH en anabólicas (diap. 38). Dinucleótido de adenina y nicotinamida.", hl: "C4 de la nicotinamida (resaltado)" },
    nadp: { name: "NADP⁺ / NADPH", ox: "nadp", red: "nadph", txt: "Igual que el NAD, pero con un fosfato extra en el OH 2′ de la ribosa de la adenina («In NADP⁺ this hydroxyl group is esterified with phosphate»).", hl: "C4 de la nicotinamida (resaltado)" },
    fad: { name: "Derivados de flavina", ox: "fad", red: "fadh2", txt: "Transfieren <b>átomos de hidrógeno</b> (2 e⁻ + 2 H⁺), en dos pasos monoelectrónicos: FAD ⇌ FADH• (semiquinona) ⇌ FADH₂ (diap. 39). El anillo reactivo es la <b>isoaloxazina</b> (N1 y N5, resaltados).", hl: "N1 y N5 de la isoaloxazina (resaltados)" }
  };
  TC.addSection({
    id: "s12", title: "Coenzimas redox: NAD⁺/NADH y FAD/FADH₂", short: "Coenzimas redox", diaps: "Diap. 38–39 (derivados de nicotinamida y de flavina)",
    essentials: [
      "Los <b>derivados de nicotinamida</b> (NAD⁺–NADH en reacciones catabólicas; NADP⁺–NADPH en anabólicas) funcionan transfiriendo <b>hidruros</b> (H:⁻) (diap. 38).",
      "Los <b>derivados de flavina</b> (FAD–FADH₂) transfieren <b>átomos de hidrógeno</b> y también participan en reacciones catabólicas y anabólicas (diap. 39). La diapositiva muestra el anillo de isoaloxazina y los estados FAD, FADH• (semiquinona) y FADH₂.",
      "Una oxidorreductasa necesita muchas veces un cofactor que se oxida o reduce como NAD⁺, NADP⁺ o FAD (diap. 42): la oxidación de un alcohol a cetona acopla la reducción de NAD⁺ a NADH.",
      "<b>Más allá del profe:</b> ΔG°′ = −nFΔE°′. Con los potenciales de reducción tabulados (−0,32 y −0,17 V), la malato deshidrogenasa da ΔG°′ ≈ +28,9 kJ/mol: del orden del +29,7 de la diapositiva 42 (la diferencia es el redondeo de los E°′ a dos cifras)."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">A · Oxidado ⇄ reducido</h3><div class="row"><b>Coenzima:</b><span id="s1"></span><b>Estado:</b><span id="s2"></span></div><div class="grid2" style="align-items:start"><div id="mol" style="text-align:center"></div><div id="info"></div></div>' +
        '<h3>B · ΔG°′ = −nFΔE°′ (reacción redox acoplada)</h3><div class="row"><b>Donador de electrones (se oxida):</b><span id="d"></span><b>Aceptor (se reduce):</b><span id="a"></span></div><div id="out" class="readout"></div><div id="pre" class="row"></div>';
      var which = "nad", st = "ox";
      var s1 = TC.seg([["nad", "NAD⁺ / NADH"], ["nadp", "NADP⁺ / NADPH"], ["fad", "FAD / FADH₂"]], "nad", function (v) { which = v; draw(); }, "coenzima"), s2 = TC.seg([["ox", "Oxidado"], ["red", "Reducido"]], "ox", function (v) { st = v; draw(); }, "estado");
      root.querySelector("#s1").appendChild(s1.el); root.querySelector("#s2").appendChild(s2.el);
      function draw() {
        var d = SET[which];
        root.querySelector("#mol").innerHTML = TC.mol(st === "ox" ? d.ox : d.red, { w: 470 });
        root.querySelector("#info").innerHTML = TC.callout("note", d.name, "<p>" + d.txt + "</p><p class=\"small\">" + d.hl + ".</p>") +
          (which === "fad" ? '<p class="small">El estado intermedio <b>FADH•</b> (semiquinona, diap. 39) no se dibuja aquí: no existe un SMILES contrastado de él en CCD/PubChem <span class="unverified">[no verificado]</span>.</p>' : "") +
          TC.table(["", "Se transfiere", "Electrones y H⁺"], [["NAD(P)⁺ → NAD(P)H", "hidruro H:⁻", "2 e⁻ + 1 H⁺ (más 1 H⁺ liberado al medio)"], ["FAD → FADH₂", "2 átomos de H", "2 e⁻ + 2 H⁺ (en 2 pasos de 1 e⁻)"]]);
      }
      draw();
      var optsC = COUPLES.map(function (c) { return [c.id, c.name + "  (E°′ = " + c.E.toString().replace(".", ",") + " V)"]; });
      var D = TC.select(optsC, "nad", upd), A = TC.select(optsC, "oaa", upd);
      root.querySelector("#d").appendChild(D); root.querySelector("#a").appendChild(A);
      function upd() {
        var cd = COUPLES.filter(function (c) { return c.id === D.value; })[0], ca = COUPLES.filter(function (c) { return c.id === A.value; })[0], dE = ca.E - cd.E, g = M.dGfromE(2, dE);
        root.querySelector("#out").innerHTML = TC.stat("ΔE°′ = E°′(aceptor) − E°′(donador)", TC.num(dE, 3), "V") + TC.stat("ΔG°′ = −nFΔE°′ (n = 2)", TC.num(g, 3), "kJ/mol", g < 0 ? "neg" : "pos") + TC.stat("¿Espontánea (condiciones estándar)?", g < -0.05 ? "sí (ΔG°′ < 0)" : g > 0.05 ? "no (ΔG°′ > 0)" : "equilibrio", "");
      }
      upd();
      root.querySelector("#pre").innerHTML = "<b>Casos:</b> ";
      root.querySelector("#pre").appendChild(TC.button("Malato DH: malato + NAD⁺ → OAA + NADH (diap. 42)", function () { D.value = "oaa"; A.value = "nad"; var cd = COUPLES[3], ca = COUPLES[0]; upd(); root.querySelector("#out").innerHTML += TC.callout("good", "Comprobación con el profe", "<p>Donador: par malato/oxalacetato (E°′ = −0,17 V); aceptor: NAD⁺ (−0,32 V). ΔG°′ = −2·96,485·(−0,32 − (−0,17)) = <b>+28,9 kJ/mol</b>, del orden del valor de la diapositiva 42 (+29,7 kJ/mol); la diferencia (≈ 0,8 kJ) viene del redondeo de los E°′ tabulados a dos cifras (con −0,166 V daría +29,7). Los E°′ de NAD⁺, FAD, piruvato/lactato, oxalacetato/malato y O₂/H₂O están <span class=\"verified\">[verificados]</span> contra la tabla de potenciales aparentes a pH 7 (Berg/Voet, vía Wikipedia, fuente secundaria).</p>"); }, "small"));
      root.querySelector("#pre").appendChild(TC.button("NADH + ½O₂ → NAD⁺ + H₂O", function () { D.value = "nad"; A.value = "o2"; upd(); }, "small"));
    },
    example: function (root) {
      root.innerHTML = "<p><b>Tres enzimas reales con su coenzima unida</b> (estructuras verificadas): LDH-A humana con <b>NADH</b> y oxamato (1I10), alcohol deshidrogenasa de caballo con <b>NAD⁺</b> y Zn (6ADH), D-aminoácido oxidasa con <b>FAD</b> y benzoato (1KIF). El botón «Resaltar anillo reactivo» marca el C4 del nicotinamida o el N5 de la isoaloxazina.</p><div class=\"row\" id=\"sel\"><b>Estructura:</b></div><div id=\"vw\"></div>";
      var viewer = null, cfgs = {
        "1I10": { label: "LDH-A + NADH (1I10)", cfg: { id: "1I10", focus: [{ chain: "A", resi: 192, label: "His192 (=193 UniProt)", atom: "NE2" }, { chain: "A", resi: 168, label: "Arg168", atom: "NH1" }], ligands: [{ resn: "NAI", label: "NADH", color: "purpleCarbon" }, { resn: "OXM", label: "oxamato" }], distances: ["nadh_c4_oxm_c1", "his192_oxm_o1"], toggles: [{ label: "Resaltar C4 del NADH", on: true, apply: function (v) { v.addStyle({ chain: "A", resn: ["NAI"], atom: ["C4N"] }, { sphere: { radius: 0.5, color: "#ff9f1a" } }); } }] } },
        "6ADH": { label: "ADH + NAD⁺ (6ADH)", cfg: { id: "6ADH", focus: [{ chain: "A", resi: 46, label: "Cys46", atom: "SG" }, { chain: "A", resi: 67, label: "His67", atom: "NE2" }, { chain: "A", resi: 174, label: "Cys174", atom: "SG" }], ligands: [{ resn: "NAD", label: "NAD⁺", color: "purpleCarbon" }, { resn: "ZN", label: "Zn²⁺" }], distances: ["zn_cys46", "zn_his67", "zn_cys174"], toggles: [{ label: "Resaltar C4 del NAD⁺", on: true, apply: function (v) { v.addStyle({ chain: "A", resn: ["NAD"], atom: ["C4N"] }, { sphere: { radius: 0.5, color: "#ff9f1a" } }); } }] } },
        "1KIF": { label: "D-aminoácido oxidasa + FAD (1KIF)", cfg: { id: "1KIF", focus: [{ chain: "A", resi: 224, label: "Tyr224", atom: "OH" }, { chain: "A", resi: 283, label: "Arg283", atom: "NH1" }], ligands: [{ resn: "FAD", label: "FAD", color: "purpleCarbon" }, { resn: "BEZ", label: "benzoato" }], distances: ["fad_n5_bez"], toggles: [{ label: "Resaltar N5 del FAD", on: true, apply: function (v) { v.addStyle({ chain: "A", resn: ["FAD"], atom: ["N5", "N1"] }, { sphere: { radius: 0.5, color: "#ff9f1a" } }); } }] } }
      };
      function open(k) { if (viewer) viewer.destroy(); var h = root.querySelector("#vw"); h.innerHTML = ""; viewer = TC.viewer(h, cfgs[k].cfg); }
      var sel = root.querySelector("#sel"); Object.keys(cfgs).forEach(function (k) { sel.appendChild(TC.button(cfgs[k].label, function () { open(k); }, "small")); }); open("1I10");
      root.appendChild(TC.h("<p class=\"small\">Roles mecanísticos (His192 como ácido/base en la LDH, etc.) <span class=\"unverified\">[rol de la literatura, sin verificar]</span>; lo medido son los contactos mostrados. En 1I10 el C4 del NADH está a 3,29 Å del C del oxamato (análogo del C=O del piruvato).</p>"));
      root.appendChild(TC.h("<div><p><b>Reacciones con su coenzima</b> (moléculas desde SMILES contrastados):</p>" + TC.rxn(["mol:etanol|130", "txt:+ NAD⁺", { arrow: { top: "alcohol deshidrogenasa", bottom: "E.C. 1.1.1.1", dir: "→" } }, "mol:acetaldehido|130", "txt:+ NADH + H⁺"]) + TC.doubt(5) + "</div>"));
    },
    quiz: [
      { q: "El NAD⁺ transfiere…", o: ["Átomos de hidrógeno (2 H)", "Hidruros (H:⁻) al C4 de la nicotinamida", "Grupos fosfato", "Grupos acilo"], c: 1, e: "Diap. 38: los derivados de nicotinamida transfieren hidruros." },
      { q: "¿Qué estados redox distingue la diapositiva 39 para la flavina?", o: ["FAD y FADH₂ solamente", "FAD, FADH• (semiquinona) y FADH₂", "Solo FADH•", "FAD⁺ y FAD²⁺"], c: 1, e: "Con H⁺ + e⁻ en dos pasos: FAD ⇌ FADH• ⇌ FADH₂." },
      { make: function (r) { var dE = Math.round((0.1 + r() * 0.9) * 1000) / 1000; return { q: "Una reacción redox de 2 e⁻ tiene ΔE°′ = " + dE + " V (aceptor − donador). Calcula ΔG°′ (kJ/mol), F = 96,485 kJ/(V·mol).", ans: -2 * 96.485 * dE, unit: "kJ/mol", tol: 0.01, abs: 0.2, e: function () { return "ΔG°′ = −nFΔE°′ = −2·96,485·" + dE + " = " + TC.num(-2 * 96.485 * dE, 4) + " kJ/mol."; } }; } },
      { prac: true, q: "<b>Encuentra el error (duda 5, diap. 42):</b> «NAD: dinucleótido de adenina y nicotinamida (vitamina B12)».", o: ["Deriva de la niacina (vitamina B₃)", "Es correcto", "Deriva de la riboflavina", "Deriva de la biotina"], c: 0, e: "La propia diapositiva menciona pelagra y niacina: el NAD⁺ deriva de la niacina (B₃) <span class=\"unverified\">[no verificado]</span> en esta sesión (conocimiento de libro)." }
    ],
    beyondTitle: "Potenciales de reducción y por qué flavina ≠ nicotinamida",
    beyond: function (el) {
      el.innerHTML = "<p>La nicotinamida es un transportador <i>difusible</i> de 2 e⁻ (hidruro), por eso NAD⁺/NADH circula entre enzimas; la flavina suele estar unida firmemente (grupo prostético) y puede pasar por el radical semiquinona, lo que la hace útil para acoplar donadores de 2 e⁻ con aceptores de 1 e⁻ (cadena respiratoria). Los E°′ de las flavoproteínas varían mucho con la proteína: el valor «libre» de la tabla (−0,219 V) es solo una referencia.</p><p>Comprobación interna: la malato deshidrogenasa da ΔG°′ = −2F(−0,320 − (−0,166)) = +29,7 kJ/mol con los E°′ de libro, como en la diapositiva 42.</p>" + TC.doubt(5);
    },
    sources: "<p>Diap. 38–39 y 42 del profe. E°′ (V, pH 7, 25 °C): NAD⁺/NADH −0,320; FAD/FADH₂ −0,22 (varía mucho según la proteína); piruvato/lactato −0,19; oxalacetato/malato −0,17; O₂/H₂O +0,82: tabla de potenciales de reducción aparentes en bioquímica (Berg y Voet), reproducida en Wikipedia (fuente secundaria) <span class=\"verified\">[verificado]</span>. Acetaldehído/etanol (−0,197 V): HyperPhysics (tabla 5.1 de Karp) y una tabla en PMC (−197 mV) <span class=\"verified\">[verificado]</span>. Estructuras: 1I10 (Read <i>et al.</i> 2001, doi:10.1002/1097-0134(20010501)43:2&lt;175::AID-PROT1029&gt;3.0.CO;2-#), 6ADH, 1KIF (Mattevi 1996, doi:10.1073/pnas.93.15.7496) " + TC.badge("verificado") + ". Moléculas 2D: NAD⁺, NADH, NADP⁺, NADPH, FAD, FADH₂ " + TC.badge("verificado") + " (resaltados por SMARTS).</p>"
  });
})(window.TC);
