/* S13 — Clasificación de las enzimas (E.C. 1–6) (diap. 40–48) */
(function (TC) {
  "use strict";
  var V = " " + "<span class=\"verified\">E.C. verificado</span>"; // números E.C. comprobados en Expasy ENZYME (scripts/verify_ec.py)
  var CLASSES = [
    { n: 1, name: "Oxidorreductasas", rule: "Cambia el estado de oxidación: aparecen coenzimas redox (NAD⁺/NADH, NADP⁺, FAD) u O₂. «La oxidación de un alcohol a cetona» (diap. 42).", ex: [
      { enz: "Alcohol deshidrogenasa", ec: "1.1.1.1", rxn: ["mol:etanol|130", "txt:+ NAD⁺", { arrow: { top: "ADH", bottom: "E.C. 1.1.1.1", dir: "→" } }, "mol:acetaldehido|130", "txt:+ NADH + H⁺"], pdb: { id: "6ADH", focus: [{ chain: "A", resi: 46, label: "Cys46", atom: "SG" }, { chain: "A", resi: 67, label: "His67", atom: "NE2" }, { chain: "A", resi: 174, label: "Cys174", atom: "SG" }], ligands: [{ resn: "NAD", label: "NAD⁺", color: "purpleCarbon" }, { resn: "ZN", label: "Zn²⁺" }], distances: ["zn_cys46", "zn_his67", "zn_cys174"] } },
      { enz: "Malato deshidrogenasa", ec: "1.1.1.37", rxn: ["mol:malato|140", "txt:+ NAD⁺", { arrow: { top: "MDH", bottom: "E.C. 1.1.1.37", dir: "⇌" } }, "mol:oxalacetato|140", "txt:+ NADH + H⁺"], pdb: { id: "1EMD", focus: [{ chain: "A", resi: 177, label: "His177", atom: "NE2" }], ligands: [{ resn: "NAD", label: "NAD⁺", color: "purpleCarbon" }, { resn: "CIT", label: "citrato" }], distances: ["his177_cit", "nad_c4_cit"] } },
      { enz: "Lactato deshidrogenasa", ec: "1.1.1.27", rxn: null, pdb: { id: "1I10", focus: [{ chain: "A", resi: 192, label: "His192", atom: "NE2" }], ligands: [{ resn: "NAI", label: "NADH", color: "purpleCarbon" }, { resn: "OXM", label: "oxamato" }], distances: ["nadh_c4_oxm_c1", "his192_oxm_o1"] } }] },
    { n: 2, name: "Transferasas", rule: "Un grupo funcional (fosfato, amino, metilo…) pasa de un donador a un aceptor (diap. 43).", ex: [
      { enz: "Hexoquinasa (según la diap. 48: E.C. 2.7.1.2)", ec: "2.7.1.1", note: TC.doubt(8), rxn: ["mol:glucosa|150", "txt:+ ATP", { arrow: { top: "hexoquinasa", bottom: "2.7.1.1 (glucoquinasa: 2.7.1.2)", dir: "→" } }, "mol:g6p|170", "txt:+ ADP"], pdb: null },
      { enz: "Piruvato quinasa", ec: "2.7.1.40", rxn: ["mol:pep|160", "txt:+ ADP", { arrow: { top: "piruvato quinasa", bottom: "E.C. 2.7.1.40", dir: "→" } }, "mol:piruvato|130", "txt:+ ATP"], pdb: { id: "1A49", focus: [{ chain: "A", resi: 269, label: "Lys269", atom: "NZ" }, { chain: "A", resi: 271, label: "Glu271" }], ligands: [{ resn: "OXL", label: "oxalato" }, { resn: "ATP", label: "ATP", color: "purpleCarbon" }], distances: ["lys269_oxl", "atp_pg_oxl"] } }] },
    { n: 3, name: "Hidrolasas", rule: "Rompen un enlace con el agua como reactivo (la molécula se divide en dos partes) (diap. 44).", ex: [
      { enz: "β-Galactosidasa", ec: "3.2.1.23", rxn: ["mol:lactosa|230", "txt:+ H₂O", { arrow: { top: "β-galactosidasa", bottom: "E.C. 3.2.1.23", dir: "→" } }, "mol:galactosa|140", "+", "mol:glucosa|140"], pdb: { id: "4V40", focus: [{ chain: "A", resi: 461, label: "Glu461" }, { chain: "A", resi: 537, label: "Glu537" }], ligands: [], distances: ["mg_glu461"] } },
      { enz: "Carboxipeptidasa A", ec: "3.4.17.1", rxn: null, pdb: { id: "5CPA", focus: [{ chain: "A", resi: 69, label: "His69", atom: "ND1" }, { chain: "A", resi: 72, label: "Glu72", atom: "OE1" }, { chain: "A", resi: 196, label: "His196", atom: "ND1" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }], distances: ["zn_his69", "zn_glu72", "zn_his196"] } }] },
    { n: 4, name: "Liasas", rule: "Añaden o eliminan un grupo (H₂O, CO₂, NH₃) a/de un doble enlace, sin hidrólisis ni redox. «Son las más difíciles de reconocer» (diap. 45).", ex: [
      { enz: "Enolasa (fosfopiruvato hidratasa)", ec: "4.2.1.11", note: TC.doubt(6), rxn: ["mol:2pg|170", { arrow: { top: "enolasa", bottom: "E.C. 4.2.1.11", dir: "⇌" } }, "mol:pep|160", "txt:+ H₂O"], pdb: { id: "1ONE", focus: [{ chain: "A", resi: 345, label: "Lys345", atom: "NZ" }, { chain: "A", resi: 246, label: "Asp246" }, { chain: "A", resi: 295, label: "Glu295" }, { chain: "A", resi: 320, label: "Asp320" }], ligands: [{ resn: "2PG", label: "2-PG" }, { resn: "PEP", label: "PEP" }], distances: ["lys345_2pg_c2", "mg438_asp246", "mg438_glu295", "mg438_asp320"] } },
      { enz: "Piruvato descarboxilasa (tabla 11.7)", ec: "4.1.1.1", rxn: ["mol:piruvato|130", "txt:+ H⁺", { arrow: { top: "piruvato descarboxilasa", bottom: "E.C. 4.1.1.1", dir: "→" } }, "txt:CO₂ +", "mol:acetaldehido|130"], pdb: null }] },
    { n: 5, name: "Isomerasas", rule: "Misma fórmula, distinto arreglo de átomos (isomerización). «Son las más fáciles de reconocer» (diap. 46).", ex: [
      { enz: "Fosfoglucosa isomerasa (fosfohexosa isomerasa)", ec: "5.3.1.9", note: TC.doubt(7), rxn: ["mol:g6p|170", { arrow: { top: "fosfoglucosa isomerasa", bottom: "E.C. 5.3.1.9", dir: "⇌" } }, "mol:f6p|170"], pdb: { id: "1IAT", focus: [], ligands: [], distances: [], note: TC.callout("bad", "Sin sustrato", "<p>1IAT es la fosfoglucosa isomerasa humana con sulfato y β-mercaptoetanol, <b>sin sustrato</b>: solo se ve la enzima.</p>") } },
      { enz: "Triosafosfato isomerasa", ec: "5.3.1.1", rxn: ["mol:g3p|140", { arrow: { top: "TIM", bottom: "E.C. 5.3.1.1", dir: "⇌" } }, "mol:dhap|140"], pdb: { id: "7TIM", focus: [{ chain: "A", resi: 165, label: "Glu165" }, { chain: "A", resi: 95, label: "His95" }], ligands: [{ resn: "PGH", label: "PGH" }], distances: ["glu165_n2", "his95_o1"] } },
      { enz: "Maleato isomerasa (tabla 11.7)", ec: "5.2.1.1", rxn: ["mol:maleato|130", { arrow: { top: "maleato isomerasa", bottom: "E.C. 5.2.1.1 (cis–trans)", dir: "⇌" } }, "mol:fumarato|130"], pdb: null }] },
    { n: 6, name: "Ligasas", rule: "Unen dos moléculas a costa de la hidrólisis de un enlace de alta energía (ATP) (diap. 47). El ATP aporta energía (se hidroliza) pero no se incorpora al producto.", ex: [
      { enz: "Piruvato carboxilasa", ec: "6.4.1.1", rxn: ["mol:piruvato|130", "txt:+ HCO₃⁻ + ATP", { arrow: { top: "piruvato carboxilasa (biotina, Mg²⁺)", bottom: "E.C. 6.4.1.1", dir: "→" } }, "mol:oxalacetato|140", "txt:+ ADP + Pᵢ"], pdb: { id: "3BG3", focus: [{ chain: "A", resi: 741, label: "Lys741 (carboxilada)", atom: "NZ" }], ligands: [{ resn: "BTI", label: "biotina" }, { resn: "PYR", label: "piruvato" }, { resn: "MN", label: "Mn²⁺" }], distances: ["mn_pyr", "bti_a_pyr_b"] } }] }
  ];
  var QS = [
    { rx: ["mol:etanol|120", "txt:+ NAD⁺", { arrow: { dir: "→" } }, "mol:acetaldehido|120", "txt:+ NADH + H⁺"], c: 1, hint: "Fíjate en el cofactor: NAD⁺ pasa a NADH.", e: "Oxidorreductasa: el etanol se oxida (y el NAD⁺ se reduce)." },
    { rx: ["mol:glucosa|140", "txt:+ ATP", { arrow: { dir: "→" } }, "mol:g6p|160", "txt:+ ADP"], c: 2, hint: "El ATP dona un fosfato.", e: "Transferasa: se transfiere un fosfato del ATP a la glucosa (hexoquinasa)." },
    { rx: ["mol:pep|150", "txt:+ ADP", { arrow: { dir: "→" } }, "mol:piruvato|120", "txt:+ ATP"], c: 2, hint: "Se transfiere un grupo fosfato entre moléculas.", e: "Transferasa (piruvato quinasa): el fosfato pasa del PEP al ADP." },
    { rx: ["mol:lactosa|220", "txt:+ H₂O", { arrow: { dir: "→" } }, "mol:galactosa|130", "+", "mol:glucosa|130"], c: 3, hint: "El agua es un reactivo y el disacárido se divide.", e: "Hidrolasa (β-galactosidasa): hidrólisis del enlace glicosídico." },
    { rx: ["mol:2pg|160", { arrow: { dir: "⇌" } }, "mol:pep|150", "txt:+ H₂O"], c: 4, hint: "Se elimina agua formando un doble enlace; no hay oxidación ni hidrólisis.", e: "Liasa (enolasa): deshidratación que genera un doble enlace C=C." },
    { rx: ["mol:piruvato|120", { arrow: { dir: "→" } }, "txt:CO₂ +", "mol:acetaldehido|120"], c: 4, hint: "Sale CO₂ sin que intervenga el agua ni un cofactor redox.", e: "Liasa (piruvato descarboxilasa): eliminación de CO₂." },
    { rx: ["mol:g6p|160", { arrow: { dir: "⇌" } }, "mol:f6p|160"], c: 5, hint: "Compara las fórmulas: C₆H₁₃O₉P a ambos lados.", e: "Isomerasa (fosfoglucosa isomerasa): aldosa ⇌ cetosa, misma fórmula." },
    { rx: ["mol:g3p|130", { arrow: { dir: "⇌" } }, "mol:dhap|130"], c: 5, hint: "Los dos tienen la misma fórmula (C₃H₇O₆P).", e: "Isomerasa (TIM): aldehído ⇌ cetona." },
    { rx: ["mol:maleato|120", { arrow: { dir: "⇌" } }, "mol:fumarato|120"], c: 5, hint: "Solo cambia la geometría del doble enlace (cis → trans).", e: "Isomerasa (maleato isomerasa): isomerización cis–trans." },
    { rx: ["mol:piruvato|120", "txt:+ CO₂ + ATP", { arrow: { dir: "→" } }, "mol:oxalacetato|130", "txt:+ ADP + Pᵢ"], c: 6, hint: "Se forma un enlace C–C nuevo gastando ATP, que no se incorpora al producto.", e: "Ligasa (piruvato carboxilasa): une CO₂ al piruvato a costa de ATP." },
    { rx: ["mol:malato|130", "txt:+ NAD⁺", { arrow: { dir: "⇌" } }, "mol:oxalacetato|130", "txt:+ NADH + H⁺"], c: 1, hint: "Cofactor redox otra vez.", e: "Oxidorreductasa (malato deshidrogenasa): alcohol secundario → cetona." }
  ];
  TC.addSection({
    id: "s13", title: "Clasificación de las enzimas (E.C. 1–6)", short: "Clasificación E.C.", diaps: "Diap. 40–48 (IUPAC/IUBMB «Enzyme Commission Number»; ejemplos de cada clase y Tabla 11.7)",
    essentials: [
      "Las enzimas se clasifican por su función (IUPAC–IUBMB) con las siglas <b>E.C.</b> seguidas de un número propio de la categoría catalítica (diap. 40): <b>1</b> oxidorreductasas, <b>2</b> transferasas, <b>3</b> hidrolasas, <b>4</b> liasas, <b>5</b> isomerasas, <b>6</b> ligasas (diap. 41).",
      "Ejemplos del profe: alcohol/malato deshidrogenasa (1), hexoquinasa (2), β-galactosidasa E.C. 3.2.1.23 (3), enolasa (4), isomerasa de fosfohexosas (5), piruvato carboxilasa (6) (diap. 42–47); la Tabla 11.7 (diap. 48) usa además carboxipeptidasa A (3.4.17.1), piruvato descarboxilasa (4.1.1.1) y maleato isomerasa (5.2.1.1).",
      "Reglas prácticas: ¿cambia el estado de oxidación? → 1; ¿pasa un grupo de una molécula a otra? → 2; ¿rompe con agua? → 3; ¿añade/elimina un grupo a un doble enlace? → 4; ¿mismo número de átomos, otro arreglo? → 5; ¿une dos moléculas con ATP? → 6.",
      "<b>Atención a tres errores de las diapositivas</b> (marcados abajo): el sustrato de la enolasa es 2-fosfoglicerato (duda 6), la isomerasa convierte glucosa-6-fosfato en fructosa-6-fosfato (duda 7) y 2.7.1.2 es glucoquinasa (la hexoquinasa es 2.7.1.1; duda 8)."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Modo:</b><span id="md"></span></div><div id="body" style="margin-top:10px"></div>';
      var mode = "ex", cur = 0, curEx = 0, viewer = null;
      var seg = TC.seg([["ex", "Explorar las 6 clases"], ["gu", "Adivina la clase"]], "ex", function (v) { mode = v; draw(); }, "modo"); root.querySelector("#md").appendChild(seg.el);
      function destroy() { if (viewer) { viewer.destroy(); viewer = null; } }
      function draw() { destroy(); if (mode === "ex") explore(); else guess(); }
      function explore() {
        var b = root.querySelector("#body"), C = CLASSES[cur], E = C.ex[curEx] || C.ex[0];
        b.innerHTML = '<div class="grid3" id="cards"></div><div id="det" style="margin-top:12px"></div>';
        CLASSES.forEach(function (c, i) { var card = TC.h('<button type="button" class="card" style="text-align:left;' + (i === cur ? "outline:3px solid var(--accent);" : "") + '"><b>E.C. ' + c.n + "</b><br>" + c.name + "</button>"); card.addEventListener("click", function () { cur = i; curEx = 0; draw(); }); b.querySelector("#cards").appendChild(card); });
        var det = b.querySelector("#det");
        det.innerHTML = "<h3 style=\"margin:0 0 4px\">E.C. " + C.n + " · " + C.name + "</h3><p><b>Cómo reconocerla:</b> " + C.rule + "</p><div class=\"row\" id=\"exb\"></div>";
        C.ex.forEach(function (e, i) { var btn = TC.button(e.enz + " (E.C. " + e.ec + ")", function () { curEx = i; draw(); }, "small"); if (i === curEx) btn.setAttribute("aria-pressed", "true"); det.querySelector("#exb").appendChild(btn); });
        det.appendChild(TC.h("<div style=\"margin:10px 0\"><b>" + E.enz + "</b> — E.C. " + E.ec + V + "</div>"));
        if (E.rxn) det.appendChild(TC.h("<div>" + TC.rxn(E.rxn) + "</div>")); else det.appendChild(TC.h("<p class=\"small\">(La reacción no se dibuja aquí: no hay una molécula verificada para representarla; el sustrato es, p. ej., un péptido o el par lactato/piruvato.)</p>"));
        if (E.note) det.appendChild(TC.h("<div>" + E.note + "</div>"));
        if (E.pdb) { var host = TC.h("<div style=\"margin-top:10px\"></div>"); det.appendChild(host); viewer = TC.viewer(host, E.pdb); }
        else det.appendChild(TC.h("<p class=\"small\">No hay una estructura verificada de esta enzima en el recurso: no se muestra 3D (no se dibuja de memoria).</p>"));
      }
      var qi = 0, order = [], answered = false, score = 0, tried = 0;
      function shuffle() { order = QS.map(function (_, i) { return i; }); for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; } qi = 0; }
      function guess() {
        if (!order.length) shuffle();
        var q = QS[order[qi % QS.length]], b = root.querySelector("#body"); answered = false;
        b.innerHTML = '<p class="small">Aciertos: <b>' + score + "</b> de " + tried + "</p>" + TC.rxn(q.rx) + '<p><b>¿Qué clase de enzima cataliza esta reacción?</b></p><div class="row" id="ops"></div><div id="fb" class="fb" style="margin-top:8px"></div><div class="row" style="margin-top:8px"><button type="button" class="btn small" id="hint">Pista</button><button type="button" class="btn small" id="nx">Otra reacción</button></div>';
        CLASSES.forEach(function (c) {
          var btn = TC.button(c.n + " · " + c.name, function () {
            if (answered) return; answered = true; tried++; var ok = c.n === q.c; if (ok) score++; btn.style.outline = "3px solid " + (ok ? "var(--good)" : "var(--bad)");
            b.querySelector("#fb").innerHTML = TC.callout(ok ? "good" : "bad", ok ? "Correcto" : "No: es " + q.c + " · " + CLASSES[q.c - 1].name, "<p>" + q.e + "</p><p class=\"small\"><b>Regla:</b> " + CLASSES[q.c - 1].rule + "</p>");
          }); b.querySelector("#ops").appendChild(btn);
        });
        b.querySelector("#hint").addEventListener("click", function () { b.querySelector("#fb").innerHTML = TC.callout("note", "Pista", "<p>" + q.hint + "</p>"); });
        b.querySelector("#nx").addEventListener("click", function () { qi++; guess(); });
      }
      TC.cleanups.push(destroy); draw();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Tabla 11.7 (diap. 48) — ejemplos de cada clase</b>, con los números E.C. comprobados en Expasy ENZYME (nomenclatura vigente de la IUBMB). Las marcadas ⚠ difieren de la diapositiva:</p>" +
        TC.table(["Clase", "Ejemplo (diap. 48)", "E.C. de la diapositiva", "E.C. vigente (Expasy)", "Reacción"], [
          ["1. Oxidorreductasas", "Alcohol deshidrogenasa", "1.1.1.1", "1.1.1.1 " + TC.badge("verificado"), "etanol + NAD⁺ → acetaldehído + NADH + H⁺"],
          ["2. Transferasas", "Hexoquinasa", "2.7.1.2", "⚠ 2.7.1.1 (2.7.1.2 = glucoquinasa) " + TC.badge("verificado"), "D-glucosa + ATP → D-glucosa-6-fosfato + ADP"],
          ["3. Hidrolasas", "Carboxipeptidasa A", "3.4.17.1", "3.4.17.1 " + TC.badge("verificado"), "péptido + H₂O → péptido acortado + aminoácido C-terminal"],
          ["4. Liasas", "Piruvato descarboxilasa", "4.1.1.1", "4.1.1.1 " + TC.badge("verificado"), "piruvato + H⁺ → CO₂ + acetaldehído"],
          ["5. Isomerasas", "Maleato isomerasa", "5.2.1.1", "5.2.1.1 " + TC.badge("verificado"), "maleato ⇌ fumarato (cis–trans)"],
          ["6. Ligasas", "Piruvato carboxilasa", "6.4.1.1", "6.4.1.1 " + TC.badge("verificado"), "piruvato + CO₂ + ATP → oxalacetato + ADP + Pᵢ"]]) +
        "<p class=\"small\">Fuente de los números vigentes: <code>datos/ec_verificados.json</code> (generado por <code>scripts/verify_ec.py</code> contra enzyme.expasy.org). La enolasa es 4.2.1.11 (fosfopiruvato hidratasa) y la fosfoglucosa isomerasa 5.3.1.9 (glucosa-6-fosfato isomerasa).</p>";
    },
    quiz: [
      { q: "La conversión de glucosa-6-fosfato en fructosa-6-fosfato la cataliza una…", o: ["Hidrolasa", "Isomerasa", "Ligasa", "Oxidorreductasa"], c: 1, e: "Misma fórmula, distinto arreglo: isomerasa (E.C. 5)." },
      { q: "Una enzima añade agua a un doble enlace sin hidrolizar ni oxidar. Es una…", o: ["Hidrolasa", "Liasa", "Transferasa", "Ligasa"], c: 1, e: "Liasa (E.C. 4): adición/eliminación de un grupo a un doble enlace, como la enolasa." },
      { q: "En la piruvato carboxilasa, el ATP…", o: ["Se incorpora al producto", "Aporta energía por hidrólisis pero no es un reactivo que se incorpore al producto", "Se regenera", "Es el sustrato"], c: 1, e: "Diap. 47: las ligasas unen dos grupos a costa de la hidrólisis de enlaces de alta energía como el del ATP." },
      { prac: true, q: "<b>Encuentra el error (duda 8, diap. 48):</b> «Hexoquinasa, E.C. 2.7.1.2».", o: ["2.7.1.2 es la glucoquinasa; la hexoquinasa es 2.7.1.1", "Es correcto", "La hexoquinasa es 2.7.1.40", "Es una hidrolasa"], c: 0, e: "Verificado en Expasy ENZYME: 2.7.1.1 = hexokinase, 2.7.1.2 = glucokinase." }
    ],
    beyondTitle: "Cómo se lee un número E.C.",
    beyond: function (el) {
      el.innerHTML = "<p>El número tiene cuatro campos: clase.subclase.sub-subclase.número de serie. Ej.: 3.2.1.23 = hidrolasa (3) que actúa sobre enlaces glicosídicos (3.2) → glicosidasas (3.2.1) → β-galactosidasa (23). Una misma enzima puede catalizar reacciones de varias clases en sitios distintos. Ejemplos de la lista verificada: piruvato quinasa 2.7.1.40, proteína quinasa A 2.7.11.11 (transferasas), 1.1.1.37 malato deshidrogenasa.</p>" + TC.doubt(6) + TC.doubt(7);
    },
    sources: "<p>Diap. 40–48 del profe. Números E.C.: Expasy ENZYME (SIB), verificados por programa (<code>scripts/verify_ec.py</code>, resultado en <code>datos/ec_verificados.json</code>). Estructuras: 6ADH, 1EMD, 1I10, 1A49, 4V40, 5CPA, 1ONE, 1IAT, 7TIM, 3BG3 " + TC.badge("verificado") + " (ver <code>reportes/verificacion_estructuras.md</code>). Moléculas 2D desde SMILES contrastados; la enolasa muestra 2-fosfoglicerato (no 2-fosfolactato como en la diap. 45).</p>"
  });
})(window.TC);
