/* S10 — Mecanismo catalítico a nivel de residuos (diap. 29–30): triosafosfato isomerasa (+ piruvato quinasa opcional) */
(function (TC) {
  "use strict";
  var TIM = [
    { t: "1 · El G3P se une al lugar activo", mol: "g3p", glu: "Glu165–COO⁻ (carboxilato, base general)", his: "His95 imidazol N–H (ácido general)", txt: "El sustrato G3P entra al sitio: el H de C₂ (junto al OH) queda cerca del carboxilato del Glu165 y el oxígeno del carbonilo (C₁=O) cerca de la His95.", g: 0 },
    { t: "2 · Enediol: Glu165 toma el H de C₂; His95 entrega un H al carbonilo", mol: "enediol", glu: "Glu165–COOH (ha tomado el protón de C₂)", his: "His95 imidazolato (sin N–H: ha entregado su protón al carbonilo)", txt: "Equilibrio ceto-enólico: el protón de C₂ pasa al Glu165 y el protón de la His95 al oxígeno carbonílico; se forma el intermediario <i>cis</i>-enediol (HO–CH=C(OH)–CH₂OPO₃²⁻), estabilizado por los dos contactos.", g: 1 },
    { t: "3 · DHAP unida al lugar activo", mol: "dhap", glu: "Glu165–COO⁻ (regenerado al devolver el protón a C₁)", his: "His95 imidazol N–H (regenerada)", txt: "El Glu165 devuelve el protón al carbono vecino (C₁), el enediol se reorganiza a cetona y se obtiene la DHAP (C₂=O); la His95 queda lista para el siguiente ciclo.", g: 2 }
  ];
  var PK = [
    { t: "1 · PEP (fosfoenolpiruvato)", mol: "pep", txt: "La piruvato quinasa transfiere el fosfato del PEP al ADP (formando ATP), con Mg²⁺ y K⁺; queda el <b>enolpiruvato</b>.", g: 0 },
    { t: "2 · Enolpiruvato", mol: "enolpiruvato", txt: "El enolpiruvato es el enol del piruvato: forma inestable que se tautomeriza.", g: 1 },
    { t: "3 · Piruvato (tautomería ceto-enólica)", mol: "piruvato", txt: "La tautomería enol → ceto hacia el piruvato es muy favorable y por eso la fosforilación del ADP queda impulsada (concepto de libro de texto <span class=\"unverified\">[no verificado]</span> en esta sesión).", g: 2 }
  ];
  TC.addSection({
    id: "s10", title: "Mecanismo catalítico a nivel de residuos", short: "Mecanismo: TIM", diaps: "Diap. 29–30 (triosafosfato isomerasa: estructura y mecanismo, Glu165, His95, enediol)",
    essentials: [
      "La <b>triosafosfato isomerasa</b> (TIM) interconvierte G3P ⇌ <i>cis</i>-enediol ⇌ DHAP (diap. 29). Los dos residuos más cruciales son <b>Glu165</b> e <b>His95</b>; el sitio activo incluye también Lys12 y Glu97 (diap. 29, enzima de levadura con DHAP).",
      "Mecanismo (diap. 30): <b>① </b>el G3P se une; <b>② </b>el enediol se forma por transferencia del protón de C₂ al Glu165, y la His95 entrega su protón al carbonilo; <b>③ </b>queda DHAP unida al sitio.",
      "Esto es una <b>tautomería ceto-enólica</b> con catálisis ácido-base general: el Glu165 actúa como base y la His95 como ácido (el intermediario enediol se estabiliza por los contactos con el sitio).",
      "Estructura mostrada: 1NEY (TIM de levadura con DHAP, 1,2 Å). Es un complejo con el producto/sustrato de la dirección inversa, no con G3P: sirve como modelo del sitio; las distancias son medidas en el archivo."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Reacción:</b><span id="rsel"></span></div><div class="grid2" style="margin-top:8px"><div><div id="steps"></div><div id="mol" style="text-align:center"></div><div id="st"></div><div id="ch"></div></div><div id="vw"></div></div>';
      var mode = "tim", step = 0, viewer = null;
      var rs = TC.seg([["tim", "Triosafosfato isomerasa (diap. 30)"], ["pk", "Piruvato quinasa (opcional)"]], "tim", function (v) { mode = v; step = 0; draw(); view(); }, "reacción"); root.querySelector("#rsel").appendChild(rs.el);
      var seg = null, ch = null;
      function steps() { return mode === "tim" ? TIM : PK; }
      function view() {
        if (viewer) viewer.destroy(); var vw = root.querySelector("#vw"); vw.innerHTML = "";
        if (mode === "tim") viewer = TC.viewer(vw, { id: "1NEY", focus: [{ chain: "A", resi: 165, label: "Glu165" }, { chain: "A", resi: 95, label: "His95" }, { chain: "A", resi: 12, label: "Lys12" }, { chain: "A", resi: 97, label: "Glu97" }], ligands: [{ resn: "13P", label: "DHAP" }], distances: ["glu165_c3", "his95_o2", "lys12_o2"], labelsOn: true });
        else viewer = TC.viewer(vw, { id: "1A49", focus: [{ chain: "A", resi: 269, label: "Lys269" }, { chain: "A", resi: 271, label: "Glu271" }, { chain: "A", resi: 295, label: "Asp295" }], ligands: [{ resn: "OXL", label: "oxalato (análogo del enolato)" }, { resn: "ATP", label: "ATP", color: "purpleCarbon" }], distances: ["lys269_oxl", "atp_pg_oxl", "mg534_oxl"], labelsOn: true, note: TC.callout("note", "Qué ves", "<p>PK de conejo con Mg-ATP, K⁺ y <b>oxalato</b> (no hay PEP ni enolpiruvato en este archivo). Que el oxalato imite al enolato del piruvato lo sugiere el título del PDB <span class=\"unverified\">[no verificado]</span> en el artículo; el fósforo γ del ATP está a 3,42 Å de un O del oxalato (medido).</p>") });
      }
      function draw() {
        var S = steps(), s = S[step];
        root.querySelector("#steps").innerHTML = "";
        seg = TC.seg(S.map(function (x, i) { return [String(i), "Paso " + (i + 1)]; }), String(step), function (v) { step = +v; draw(); }, "paso del mecanismo"); root.querySelector("#steps").appendChild(seg.el);
        var nx = TC.button("Siguiente ▶", function () { step = (step + 1) % S.length; draw(); }, "small"); root.querySelector("#steps").appendChild(nx);
        root.querySelector("#mol").innerHTML = TC.mol(s.mol, { w: 300 });
        root.querySelector("#st").innerHTML = "<h3 style=\"margin:6px 0\">" + s.t + "</h3><p>" + s.txt + "</p>" + (mode === "tim" ? '<div class="tablewrap"><table class="data"><tbody><tr><th>Glu165</th><td>' + s.glu + "</td></tr><tr><th>His95</th><td>" + s.his + "</td></tr></tbody></table></div>" : "");
        var keys = [{ x: 0, y: 0 }, { x: 0.22, y: 70 }, { x: 0.5, y: 12 }, { x: 0.78, y: 62 }, { x: 1, y: 8 }];
        var P = TC.smooth(keys, 40), pos = [[0, 0], [0.5, 12], [1, 8]][s.g];
        if (!ch) ch = new TC.Chart(root.querySelector("#ch"), { w: 460, h: 250, xlim: [0, 1], ylim: [-10, 90], xlabel: "Coordenada de reacción", ylabel: "G (esquema)", aria: "Perfil de energía de la TIM" });
        ch.update({ lines: [{ x: P.x, y: P.y, color: "c1", width: 2.6 }], points: [{ x: pos[0], y: pos[1], color: "c2", r: 7, label: mode === "tim" ? ["G3P", "enediol", "DHAP"][s.g] : ["PEP", "enolpiruvato", "piruvato"][s.g], anchor: "middle", dy: -12, dx: 0 }], notes: [{ x: 0.5, y: 82, text: "esquema cualitativo (sin valores) · " + (mode === "tim" ? "enediol = intermediario (diap. 28)" : "perfil ilustrativo"), color: "c7", anchor: "middle", size: 11 }] });
      }
      draw(); view();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Lo medido en el archivo 1NEY</b> (átomos pesados; numeración CCD de <code>13P</code>: fosfato en C1 y CH₂OH en C3):</p>" +
        TC.table(["Contacto", "Distancia (Å)", "Lectura"], [["Glu165 (O del carboxilato) – C3 (CH₂OH) del DHAP", "3,06", "el carboxilato está sobre el carbono del que se toma/devuelve el protón"], ["His95 (Nε2) – O2 (carbonilo) del DHAP", "2,72", "enlace de hidrógeno con el oxígeno carbonílico"], ["Lys12 (Nζ) – O2 del DHAP", "3,07", "contacto con el carbonilo"]]) +
        "<p>Tres de los residuos que el profe rotula (Glu165, His95, Lys12) están a distancias de contacto del ligando. Con el <b>análogo del intermediario</b> (7TIM, PGH) los mismos residuos están a 2,66 Å de N2 y O1 (sección 6).</p>";
    },
    quiz: [
      { q: "Según la diapositiva 30, ¿qué residuo toma el protón de C₂ para formar el enediol?", o: ["His95", "Glu165", "Lys12", "Ser195"], c: 1, e: "El Glu165 (carboxilato) toma el protón de C₂; la His95 entrega su protón al carbonilo." },
      { q: "El enediol de la TIM es…", o: ["El estado de transición", "Un intermediario de reacción (mínimo local)", "El producto final", "El inhibidor"], c: 1, e: "Es un intermediario: está entre dos estados de transición (diap. 28)." },
      { q: "En el archivo 1NEY, ¿qué hay unido al sitio activo?", o: ["G3P", "DHAP (dihidroxiacetona fosfato)", "Un análogo del estado de transición", "ATP"], c: 1, e: "1NEY es la TIM con DHAP (código CCD 13P); 7TIM tiene el análogo PGH." }
    ],
    beyondTitle: "TIM como «enzima perfecta» y catálisis ácido-base general",
    beyond: function (el) {
      el.innerHTML = "<p>Se dice que la TIM es una enzima «cinéticamente perfecta»: su reacción está <b>limitada por la difusión</b> del sustrato hacia la enzima. Esto sí está respaldado: Blacklow <i>et al.</i> 1988, «Triosephosphate isomerase catalysis is diffusion controlled» (doi:10.1021/bi00404a013), cuyo resumen muestra que la viscosidad del medio (polímeros) no cambia el comportamiento esperado de k<sub>cat</sub>/K<sub>m</sub> salvo por la difusión; y el resumen de Davenport <i>et al.</i> 1991 (7TIM, doi:10.1021/bi00238a002) dice que la TIM cataliza la interconversión «a una velocidad limitada por la difusión del sustrato» <span class=\"verified\">[verificado (resumen)]</span>. El límite de difusión es ≈ 10<sup>8</sup>–10<sup>9</sup> M⁻¹s⁻¹ y la TIM tiene k<sub>cat</sub>/K<sub>m</sub> ≈ 2,4×10<sup>8</sup> M⁻¹s⁻¹ con gliceraldehído-3-fosfato (k<sub>cat</sub> 4,3×10³ s⁻¹, K<sub>m</sub> 4,7×10⁻⁴ M): tabla 6-8 de Nelson &amp; Cox (<i>Lehninger</i>), vía copia de curso y BioNumbers <span class=\"verified\">[verificado: fuente secundaria]</span> (ver sección 15). La idea de «perfección» es que ya no puede mejorarse mucho: cada paso químico y de transporte tiene barreras comparables.</p><p>En la catálisis ácido-base general la enzima coloca grupos cuyo pK<sub>a</sub> se ajusta in situ y que donan/aceptan protones en el estado de transición; el Glu165 y la His95 son el ejemplo clásico. El aumento de la polarización del carbonilo por la His95 (enlace de hidrógeno de 2,72 Å medido) facilita la enolización.</p>";
    },
    sources: "<p>Diap. 29–30 (Figura 11.9 de un texto; no se copia: se redibuja). 1NEY: Jogl <i>et al.</i> 2003, PNAS 100:50 (doi:10.1073/pnas.0233793100); 7TIM: Davenport <i>et al.</i> 1991; 1A49: Larsen <i>et al.</i> 1998 " + TC.badge("verificado") + ". Los pasos del mecanismo siguen la diapositiva 30; los textos del paso 3 y de la piruvato quinasa son explicaciones de libro de texto <span class=\"unverified\">[no verificado]</span>. G3P y DHAP: " + TC.badge("verificado") + "; <i>cis</i>-enediol: <span class=\"unverified\">[no verificado]</span> (SMILES propio sin estereoquímica).</p>"
  });
})(window.TC);
