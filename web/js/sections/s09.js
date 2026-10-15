/* S9 — Cofactores, coenzimas, apoenzima y holoenzima (diap. 23–25) */
(function (TC) {
  "use strict";
  /* Tabla 6-1 (diap. 23), transcrita tal cual (nombres de enzimas en inglés, como en la diapositiva) + estructuras verificadas disponibles */
  var ION = [
    { id: "cu", ion: "Cu²⁺", enz: "Cytochrome oxidase", ex: [] },
    { id: "fe", ion: "Fe²⁺ o Fe³⁺", enz: "Cytochrome oxidase, catalase, peroxidase", ex: [{ pdb: "1DGF", name: "Catalasa humana (hemo con Fe)", cfg: { id: "1DGF", focus: [{ chain: "A", resi: 358, label: "Tyr358", atom: "OH" }, { chain: "A", resi: 75, label: "His75", atom: "NE2" }], ligands: [{ resn: "HEM", label: "hemo (grupo prostético)" }, { resn: "NDP", label: "NADPH", color: "purpleCarbon" }], distances: ["fe_tyr358", "fe_his75"] } }] },
    { id: "k", ion: "K⁺", enz: "Pyruvate kinase", ex: [{ pdb: "1A49", name: "Piruvato quinasa de conejo (K⁺, Mg²⁺, ATP, oxalato)", cfg: { id: "1A49", focus: [{ chain: "A", resi: 271, label: "Glu271" }, { chain: "A", resi: 295, label: "Asp295" }], ligands: [{ resn: "ATP", label: "ATP" }, { resn: "OXL", label: "oxalato" }, { resn: "K", label: "K⁺" }], distances: ["mg534_glu271", "mg534_asp295", "mg534_oxl"] } }] },
    { id: "mg", ion: "Mg²⁺", enz: "Hexokinase, glucose 6-phosphatase, pyruvate kinase", ex: [{ pdb: "1A49", name: "Piruvato quinasa de conejo (dos Mg²⁺ con ATP)", cfg: { id: "1A49", focus: [{ chain: "A", resi: 271, label: "Glu271" }, { chain: "A", resi: 295, label: "Asp295" }], ligands: [{ resn: "ATP", label: "ATP" }, { resn: "MG", label: "Mg²⁺" }], distances: ["mg534_glu271", "mg534_asp295", "mg534_oxl"] } }] },
    { id: "mn", ion: "Mn²⁺", enz: "Arginase, ribonucleotide reductase", ex: [] },
    { id: "mo", ion: "Mo", enz: "Dinitrogenase", ex: [] },
    { id: "ni", ion: "Ni²⁺", enz: "Urease", ex: [] },
    { id: "se", ion: "Se", enz: "Glutathione peroxidase", ex: [] },
    { id: "zn", ion: "Zn²⁺", enz: "Carbonic anhydrase, alcohol dehydrogenase, carboxypeptidases A and B", ex: [
      { pdb: "1CA2", name: "Anhidrasa carbónica II humana", cfg: { id: "1CA2", focus: [{ chain: "A", resi: 94, label: "His94", atom: "NE2" }, { chain: "A", resi: 96, label: "His96", atom: "NE2" }, { chain: "A", resi: 119, label: "His119", atom: "ND1" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }], distances: ["zn_his94", "zn_his96", "zn_his119"] } },
      { pdb: "5CPA", name: "Carboxipeptidasa A bovina", cfg: { id: "5CPA", focus: [{ chain: "A", resi: 69, label: "His69", atom: "ND1" }, { chain: "A", resi: 72, label: "Glu72", atom: "OE1" }, { chain: "A", resi: 196, label: "His196", atom: "ND1" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }], distances: ["zn_his69", "zn_glu72", "zn_his196"] } },
      { pdb: "6ADH", name: "Alcohol deshidrogenasa de hígado de caballo (Zn catalítico + NAD⁺)", cfg: { id: "6ADH", focus: [{ chain: "A", resi: 46, label: "Cys46", atom: "SG" }, { chain: "A", resi: 67, label: "His67", atom: "NE2" }, { chain: "A", resi: 174, label: "Cys174", atom: "SG" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }, { resn: "NAD", label: "NAD⁺", color: "purpleCarbon" }], distances: ["zn_cys46", "zn_his67", "zn_cys174"] } },
      { pdb: "1QIN", name: "Glioxalasa I humana (dímero: 2 Zn)", cfg: { id: "1QIN", focus: [{ chain: "A", resi: 33, label: "Gln33(A)", atom: "OE1" }, { chain: "A", resi: 99, label: "Glu99(A)", atom: "OE1" }, { chain: "B", resi: 126, label: "His126(B)", atom: "NE2" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }, { resn: "GIP", label: "inhibidor", color: "greenCarbon" }], distances: ["zn401_gln33", "zn401_glu99", "zn401_his126"], gly: true } }
    ] }
  ];
  TC.addSection({
    id: "s09", title: "Cofactores, coenzimas, apoenzima y holoenzima", short: "Cofactores y coenzimas", diaps: "Diap. 23–25 (Tabla 6-1; glioxalasa I; apoenzima vs holoenzima; cofactor vs coenzima)",
    essentials: [
      "Un <b>cofactor</b> es un componente no proteico, termoestable y de baja masa molecular, necesario para la acción de una enzima. Se une a la <b>apoenzima</b> (parte proteica) y el complejo se llama <b>holoenzima</b> (diap. 23 y 25): holoenzima = apoenzima + cofactor.",
      "Diap. 24: <b>cofactor</b> = bajo peso molecular (iones como Cu²⁺ o Fe³⁺); <b>coenzima</b> = mayor peso molecular (moléculas orgánicas; «algunas vitaminas actúan como coenzimas»); el <b>grupo prostético</b> (parte no proteica) puede ser cofactor o coenzima (diap. 18).",
      "La Tabla 6-1 (diap. 23) enumera elementos inorgánicos que sirven de cofactor: Cu²⁺, Fe²⁺/Fe³⁺, K⁺, Mg²⁺, Mn²⁺, Mo, Ni²⁺, Se y Zn²⁺, con ejemplos de enzimas.",
      "La diapositiva 23 dice que la <b>glioxalasa I humana necesita dos iones de zinc</b>: en la estructura (1QIN, medida) el dímero tiene 2 Zn, uno por sitio activo (duda 9)."
    ],
    interactive: function (root) {
      root.innerHTML = '<p class="small">Tabla 6-1 de la diapositiva 23. Elige un elemento; si hay una enzima real con estructura verificada, se abre en 3D. Con <i>«Quitar cofactor»</i> (botón del visor) ves la <b>apoenzima</b>; con él, la <b>holoenzima</b>.</p><div class="row"><b>Elemento:</b><span id="selw"></span></div><div id="info" style="margin:10px 0"></div><div id="exs" class="row" style="margin-bottom:8px"></div><div id="vw"></div><div class="tablewrap" id="tbl"></div>';
      var cur = ION[ION.length - 1], viewer = null;
      var sel = TC.select(ION.map(function (i) { return [i.id, i.ion]; }), "zn", function (v) { cur = ION.filter(function (i) { return i.id === v; })[0]; pick(); }); root.querySelector("#selw").appendChild(sel);
      root.querySelector("#tbl").innerHTML = TC.table(["Elemento", "Enzimas (como en la diap. 23)"], ION.map(function (i) { return ["<b>" + i.ion + "</b>", i.enz]; }));
      function open(ex) {
        if (viewer) viewer.destroy(); var host = root.querySelector("#vw"); host.innerHTML = ""; var cfg = Object.assign({}, ex.cfg); cfg.ligandToggle = "Quitar / poner cofactor (apoenzima ↔ holoenzima)";
        viewer = TC.viewer(host, cfg);
        if (ex.pdb === "1QIN") host.appendChild(TC.h(TC.doubt(9, "<b>Conteo medido en 1QIN:</b> 2 Zn en el archivo (A401 y B301); cada Zn está a ≈ 2,0 Å de Gln33 y Glu99 de una cadena y de His126 de la otra. Glu172 (cadena B) queda a 3,25 Å del Zn A401: no lo coordina directamente en este complejo con inhibidor.")));
      }
      function pick() {
        root.querySelector("#info").innerHTML = TC.callout("note", cur.ion, "<p>Enzimas según la diap. 23: " + cur.enz + ".</p>" + (cur.ex.length ? "" : "<p class=\"small\">No hay una estructura de este elemento entre las verificadas en este recurso: se muestra solo la tabla (no se dibuja nada de memoria).</p>"));
        var exs = root.querySelector("#exs"); exs.innerHTML = ""; if (viewer) { viewer.destroy(); viewer = null; }
        cur.ex.forEach(function (ex, i) { exs.appendChild(TC.button(ex.name + " (" + ex.pdb + ")", function () { open(ex); }, "small")); });
        if (cur.ex.length) open(cur.ex[0]);
      }
      pick();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Coenzimas orgánicas</b> (diap. 24: «algunas vitaminas actúan como coenzimas»). Estructuras 2D generadas desde SMILES contrastados:</p><div class=\"row\" style=\"align-items:flex-start\">" + TC.mol("nad", { w: 320, cap: "NAD⁺ (coenzima redox). Su precursor vitamínico es la niacina (diap. 42 menciona niacina y pelagra)" }) + TC.mol("fad", { w: 320, cap: "FAD (grupo prostético de flavoproteínas)" }) + TC.mol("biotina", { w: 220, cap: "Biotina (coenzima de carboxilasas, diap. 47)" }) + "</div>" +
        "<p class=\"small\">Los precursores vitamínicos (niacina → NAD⁺; riboflavina → FAD/FMN) son conocimiento de libro de texto <span class=\"unverified\">[no verificado]</span> en esta sesión; la diapositiva 24 solo dice que algunas vitaminas actúan como coenzimas.</p>" +
        "<p><b>Holoenzima real (diap. 24–25, duda 20):</b> las diapositivas muestran una holoenzima y su apoenzima con un cofactor de tipo porfirina, sin identificar la proteína. El ejemplo verificado de este recurso es la <b>catalasa humana</b> (1DGF, sección 5), con hemo (grupo prostético) y NADPH: usa el botón «Quitar / poner cofactor» del visor del Interactivo (elige Fe²⁺/Fe³⁺).</p>" + TC.doubt(20);
    },
    quiz: [
      { q: "Clasifica el Zn²⁺ de la anhidrasa carbónica según la diap. 24:", o: ["Coenzima", "Cofactor (ion de baja masa molecular)", "Apoenzima", "Holoenzima"], c: 1, e: "Los iones inorgánicos son cofactores (baja masa molecular); las moléculas orgánicas de mayor masa se llaman coenzimas." },
      { q: "La holoenzima es…", o: ["La parte proteica sola", "El complejo apoenzima–cofactor (activo)", "El cofactor solo", "El sustrato unido"], c: 1, e: "Holoenzima = apoenzima + cofactor/coenzima (diap. 23 y 25)." },
      { q: "En 1QIN (glioxalasa I) se cuentan…", o: ["1 Zn por dímero", "2 Zn por dímero (uno por sitio activo)", "4 Zn por dímero", "Ningún Zn"], c: 1, e: "Medido: Zn A401 y B301; la diapositiva «dos iones de zinc» es correcta para el dímero." }
    ],
    beyondTitle: "Cofactores: papeles catalíticos y estructurales",
    beyond: function (el) {
      el.innerHTML = "<p>Un metal puede (i) actuar como ácido de Lewis (el Zn²⁺ de la anhidrasa carbónica baja el pK<sub>a</sub> de un agua unida), (ii) mediar redox (Fe, Cu, Mo), (iii) orientar sustratos fosforilados (Mg²⁺ con ATP) o (iv) estabilizar la estructura. Las <i>distancias de coordinación</i> medidas (≈ 1,9–2,4 Å para Zn/Mg con N/O/S) son típicas de enlaces de coordinación. Los papeles mecanísticos concretos de cada metal son de la literatura y no se verificaron aquí <span class=\"unverified\">[no verificado]</span>.</p>";
    },
    sources: "<p>Diap. 23–25 del profe (Tabla 6-1 transcrita). Estructuras: 1CA2 (Eriksson 1988, doi:10.1002/prot.340040406), 5CPA (Rees 1983, doi:10.1016/S0022-2836(83)80024-2), 6ADH (Eklund 1981, doi:10.1016/0022-2836(81)90047-4), 1QIN (Cameron 1999, doi:10.1021/bi990696c), 1DGF (Putnam 2000, doi:10.1006/jmbi.1999.3458), 1A49 (Larsen 1998, doi:10.1021/bi980243s) " + TC.badge("verificado") + ". Distancias y conteo medidos en el archivo (<code>reportes/verificacion_estructuras.md</code>). Mo, Ni, Se, Cu y Mn de la Tabla 6-1 no tienen estructura verificada aquí.</p>"
  });
})(window.TC);
