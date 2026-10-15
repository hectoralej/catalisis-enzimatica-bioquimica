/* S5 — Termodinámica vs cinética (diap. 3, 12–15) */
(function (TC) {
  "use strict";
  var M = window.TCMath, T0 = 298.15, YEAR = M.YEAR;
  function dGfromT12(t12, T) { return M.barrierFromK(Math.LN2 / t12, T || T0); }
  var T12_H2O2 = 3 * 30 * 86400; // «meses» (diap. 13) → 3 meses, ilustrativo
  var PRE = [
    { id: "h2o2", name: "H₂O₂ sin catalizador (diap. 13: «meses»)", dG: dGfromT12(T12_H2O2), note: "La diapositiva solo dice «pueden pasar meses»; se toma t½ ≈ 3 meses. <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>" },
    { id: "fe", name: "con Fe³⁺ (×10³, diap. 13)", dG: dGfromT12(T12_H2O2 / 1e3), note: "La reacción «es 1000 veces más rápida» con Fe³⁺ (profe) → t½ ÷ 10³. <span class=\"illustr\">ilustrativo</span>" },
    { id: "cat", name: "con catalasa (×10⁹, diap. 13)", dG: dGfromT12(T12_H2O2 / 1e9), note: "«1000 millones de veces» (profe) → t½ ÷ 10⁹. El orden de magnitud real <span class=\"unverified\">[no verificado]</span> (duda 3)." },
    { id: "dna", name: "ADN, enlace fosfodiéster (diap. 15: 6 millones de años)", dG: dGfromT12(6e6 * YEAR), note: "Valor del profe (diap. 15) convertido en ΔG‡ con Eyring a 25 °C. Ver duda 2." },
    { id: "dnp", name: "Dineopentilfosfato (Schroeder 2006: 3×10⁷ años)", dG: dGfromT12(3e7 * YEAR), note: "Diéster modelo medido a temperatura elevada y extrapolado a 25 °C (resumen de Schroeder <i>et al.</i> 2006, doi:10.1073/pnas.0510879103) " + TC.badge("verificado") + " (resumen)." }
  ];
  TC.addSection({
    id: "s05", title: "Termodinámica vs cinética", short: "Termodinámica vs cinética", diaps: "Diap. 3, 12–15 (velocidad de reacción en sistemas biológicos; control termodinámico vs control cinético)",
    essentials: [
      "<b>La espontaneidad y la rapidez son independientes</b> (diap. 12): ΔG dice <i>si</i> y <i>en qué dirección</i> ocurre una reacción; la cinética dice <i>con qué velocidad</i> (diap. 14).",
      "La descomposición del H₂O₂ tiene una ΔG muy negativa y aun así «pueden pasar meses» en un frasco; Fe³⁺ la acelera 10³ veces, y la catalasa «mil millones de veces» (diap. 13). La síntesis del enlace fosfodiéster del ADN está desfavorecida (ΔG ≈ +25 kJ/mol) y su hidrólisis, favorecida (≈ −25 kJ/mol) pero lentísima: eso protege al ADN (diap. 15).",
      "Para la vida importa la velocidad (diap. 3): una bacteria se autorreplica en 20 min y el impulso nervioso viaja a 5–120 m/s: las reacciones deben completarse en tiempos útiles, no en días.",
      "La rapidez la fija la <b>barrera ΔG‡</b>: t<sub>½</sub> = ln 2 / k con $k=\\frac{k_BT}{h}e^{-\\Delta G^\\ddagger/RT}$. Aumentar ΔG‡ en 5,7 kJ/mol multiplica t<sub>½</sub> por 10."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">A · Reloj de vida media: de ΔG‡ a t½</h3><div class="row" id="pre"><b>Casos:</b></div><div id="ctlA"></div><div id="outA" class="readout"></div><div id="noteA"></div><div id="chA"></div>' +
        '<h3>B · Control cinético vs control termodinámico</h3><p class="small">A → P₁ (camino rápido, menos estable) y A → P₂ (camino lento, más estable), ambos reversibles. <span class="illustr">modelo didáctico, valores ilustrativos</span>.</p><div id="ctlB"></div><div id="outB" class="readout"></div><div id="chB"></div><div id="barsB"></div>';
      /* ---- A ---- */
      var sD = TC.slider({ label: "ΔG‡", unit: "kJ/mol", min: 30, max: 190, step: 0.5, value: 75, dec: 1, onChange: updA });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 373, step: 0.05, value: T0, dec: 2, onChange: updA });
      root.querySelector("#ctlA").appendChild(sD.el); root.querySelector("#ctlA").appendChild(sT.el);
      var pre = root.querySelector("#pre"), noteA = root.querySelector("#noteA");
      PRE.forEach(function (p) { pre.appendChild(TC.button(p.name, function () { sT.set(T0, true); sD.set(p.dG, true); noteA.innerHTML = TC.callout("note", p.name, "<p>" + p.note + " ΔG‡ = " + TC.num(p.dG, 4) + " kJ/mol (a 298,15 K).</p>") + (p.id === "dna" ? TC.doubt(2) : p.id === "cat" ? TC.doubt(3) : ""); updA(); }, "small")); });
      var chA = new TC.Chart(root.querySelector("#chA"), { w: 720, h: 400, xlim: [30, 190], ylim: [1e-12, 1e19], ylog: true, xlabel: "ΔG‡ (kJ/mol)", ylabel: "Vida media t_{½} (s)", aria: "Vida media frente a la barrera" });
      var REFS = [{ y: 1, label: "1 s" }, { y: 1200, label: "20 min (bacteria se divide, diap. 3)" }, { y: YEAR, label: "1 año" }, { y: 1.43e17, label: "edad de la Tierra ≈ 4,5×10⁹ años" }];
      function updA() {
        var d = sD.get(), T = sT.get(), k = M.eyring(d, T), th = M.halfLife(k), xs = [], ys = [];
        for (var x = 30; x <= 190; x += 2) { xs.push(x); ys.push(M.halfLife(M.eyring(x, T))); }
        root.querySelector("#outA").innerHTML = TC.stat("k = (k<sub>B</sub>T/h)·e^(−ΔG‡/RT)", TC.num(k, 3), "s⁻¹") + TC.stat("Vida media t½ = ln 2/k", M.humanTime(th), "") + TC.stat("× por cada +5,7 kJ/mol", "10", "(a 298 K)");
        chA.update({ lines: [{ x: xs, y: ys, color: "c1", label: "t_{½}(ΔG‡)", labelAt: 20, dy: 18 }], hlines: REFS.map(function (r) { return { y: r.y, label: r.label, dash: "dot" }; }),
          points: [{ x: d, y: Math.min(Math.max(th, 1e-12), 1e19), color: "c2", marker: "circle", r: 6, label: M.humanTime(th), anchor: "start", dy: -12 }] });
      }
      updA();
      /* ---- B ---- */
      var q = { d1: 65, g1: -10, d2: 85, g2: -30, T: T0, lt: 0 };
      var sB1 = TC.slider({ label: "ΔG‡ hacia P₁", unit: "kJ/mol", min: 40, max: 110, step: 0.5, value: 65, dec: 1, onChange: function (v) { q.d1 = v; updB(); } });
      var sB2 = TC.slider({ label: "ΔG‡ hacia P₂", unit: "kJ/mol", min: 40, max: 120, step: 0.5, value: 85, dec: 1, onChange: function (v) { q.d2 = v; updB(); } });
      var sG1 = TC.slider({ label: "G(P₁) − G(A)", unit: "kJ/mol", min: -60, max: 10, step: 0.5, value: -10, dec: 1, onChange: function (v) { q.g1 = v; updB(); } });
      var sG2 = TC.slider({ label: "G(P₂) − G(A)", unit: "kJ/mol", min: -60, max: 10, step: 0.5, value: -30, dec: 1, onChange: function (v) { q.g2 = v; updB(); } });
      var sTB = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 373, step: 0.05, value: T0, dec: 2, onChange: function (v) { q.T = v; updB(); } });
      var sLT = TC.slider({ label: "log₁₀ tiempo", unit: "(t en s)", min: -3, max: 11, step: 0.05, value: 0, dec: 2, onChange: function (v) { q.lt = v; updB(); } });
      var cb = root.querySelector("#ctlB"); [sB1, sG1, sB2, sG2, sTB, sLT].forEach(function (s) { cb.appendChild(s.el); });
      var chB = new TC.Chart(root.querySelector("#chB"), { w: 720, h: 360, xlim: [-3, 12], ylim: [0, 1], xlabel: "log₁₀ t (s)", ylabel: "fracción", aria: "Fracciones de A, P1 y P2 en el tiempo" });
      function updB() {
        var p = { T: q.T, dGdd1: Math.max(q.d1, Math.max(0, q.g1) + 0.5), G1: q.g1, dGdd2: Math.max(q.d2, Math.max(0, q.g2) + 0.5), G2: q.g2 };
        var t = Math.pow(10, q.lt), r = M.twoPath(p, t), eq = M.twoPathEquilibrium(p), xs = [], A = [], P1 = [], P2 = [];
        for (var l = -3; l <= 12; l += 0.15) { var s = M.twoPath(p, Math.pow(10, l)); xs.push(l); A.push(s.A); P1.push(s.P1); P2.push(s.P2); }
        var kin = Math.exp((p.dGdd2 - p.dGdd1) * 1000 / (M.C.R * q.T)), therm = Math.exp((p.G2 - p.G1) * -1000 / (M.C.R * q.T)); // P1/P2: cinética = k1f/k2f ; equilibrio = exp(−(G1−G2)/RT)
        var thermR = Math.exp(-(p.G1 - p.G2) * 1000 / (M.C.R * q.T));
        var regimen = (r.P1 + r.P2) < 0.05 ? "casi nada ha reaccionado" : (Math.abs(Math.log(r.P1 / Math.max(r.P2, 1e-300)) - Math.log(kin)) < Math.abs(Math.log(r.P1 / Math.max(r.P2, 1e-300)) - Math.log(thermR)) ? "<b>control cinético</b>: domina el producto que se forma más rápido" : "<b>control termodinámico</b>: domina el producto más estable");
        root.querySelector("#outB").innerHTML = TC.stat("t", M.humanTime(t), "") + TC.stat("P₁ / P₂ ahora", TC.num(r.P1 / Math.max(r.P2, 1e-300), 3), "") + TC.stat("Razón cinética k₁/k₂ = e^(ΔΔG‡/RT)", TC.num(kin, 3), "") + TC.stat("Razón en el equilibrio", TC.num(thermR, 3), "") + TC.stat("Régimen", regimen, "");
        chB.update({ lines: [{ x: xs, y: A, color: "c7", dash: "dash", label: "A" }, { x: xs, y: P1, color: "c2", label: "P_{1} (rápido)", labelAt: "end" }, { x: xs, y: P2, color: "c3", dash: "dashdot", label: "P_{2} (estable)", labelAt: "end", dy: 14 }],
          vlines: [{ x: q.lt, label: "t actual", color: "c5" }] });
        root.querySelector("#barsB").innerHTML = '<div class="small" style="margin:6px 0">Fracciones ahora (A, P₁, P₂) y en el equilibrio:</div>' + [["ahora", r], ["equilibrio", eq]].map(function (z) {
          return '<div class="row" style="gap:6px;margin:3px 0"><span style="width:6.5em" class="small">' + z[0] + '</span><div style="flex:1;display:flex;height:20px;border:1px solid var(--border);border-radius:5px;overflow:hidden"><i style="width:' + z[1].A * 100 + '%;background:var(--c7)" title="A"></i><i style="width:' + z[1].P1 * 100 + '%;background:var(--c2)" title="P₁"></i><i style="width:' + z[1].P2 * 100 + '%;background:var(--c3)" title="P₂"></i></div><span class="small">A ' + TC.numPlain(z[1].A * 100, 2) + "% · P₁ " + TC.numPlain(z[1].P1 * 100, 2) + "% · P₂ " + TC.numPlain(z[1].P2 * 100, 2) + "%</span></div>";
        }).join("");
      }
      updB();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Catalasa humana (1DGF).</b> Es la enzima que el cuerpo «ha desarrollado para eliminar inmediatamente el peróxido de hidrógeno» (diap. 13). Su grupo prostético es el <b>hemo</b> con un Fe que, en la estructura, está coordinado por el O del fenolato de la Tyr358 (ligando axial); la His75 queda en el lado distal. Los dos números de abajo están <b>medidos en el archivo del PDB</b>.</p>" +
        TC.rxn(["mol:h2o2", "txt:2", "mol:h2o2", { arrow: { top: "catalasa (hemo)", bottom: "", dir: "→" } }, "txt:2 H₂O + O₂"]);
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "1DGF", focus: [{ chain: "A", resi: 358, label: "Tyr358", atom: "OH" }, { chain: "A", resi: 75, label: "His75", atom: "NE2" }, { chain: "A", resi: 148, label: "Asn148", atom: "ND2" }], ligands: [{ resn: "HEM", label: "hemo", color: "orangeCarbon" }, { resn: "NDP", label: "NADPH", color: "purpleCarbon" }], distances: ["fe_tyr358", "fe_his75"], ligandToggle: "Mostrar hemo y NADPH" });
      root.appendChild(TC.h('<div class="callout"><span class="tag">Qué NO muestra esta estructura</span><p>Es la enzima <i>sin</i> H₂O₂ unido: no se ve la reacción. NADPH está unido en las cadenas A y C (Putnam <i>et al.</i> 2000). La velocidad de la catalasa (kcat) la tratamos en la sección 15 con su fuente.</p></div>'));
    },
    quiz: [
      { q: "La descomposición del H₂O₂ tiene ΔG° muy negativa pero tarda meses. ¿Qué lo explica?", o: ["La reacción no es espontánea", "Una barrera de activación (ΔG‡) alta: es espontánea pero cinéticamente lenta", "Su ΔH es positivo", "El equilibrio está desplazado a reactivos"], c: 1, e: "Espontaneidad (ΔG) y rapidez (ΔG‡) son independientes (diap. 12–14)." },
      { make: function (r) { var d = 70 + Math.round(r() * 30); return { q: "A 298,15 K, una reacción tiene ΔG‡ = " + d + " kJ/mol. Calcula log₁₀ k (k en s⁻¹) con la ecuación de Eyring (k<sub>B</sub>T/h = 6,21×10¹² s⁻¹).", ans: Math.log10(M.eyring(d, T0)), unit: "", tol: 0.02, abs: 0.1, e: function () { return "k = 6,21×10¹²·exp(−" + d + "000/(8,314·298,15)) → log₁₀k = " + TC.num(Math.log10(M.eyring(d, T0)), 4) + "."; } }; } },
      { q: "En un sistema A ⇌ P₁, A ⇌ P₂ donde P₂ es más estable pero se forma más despacio, a tiempos cortos domina…", o: ["P₂ (control termodinámico)", "P₁ (control cinético)", "A", "No se puede saber"], c: 1, e: "A tiempos cortos manda la razón de velocidades de formación (k₁/k₂); en el equilibrio manda la estabilidad." }
    ],
    beyondTitle: "Más sobre control cinético/termodinámico y sobre las cifras de las diapositivas",
    beyond: function (el) {
      el.innerHTML = "<p>El sistema B es un modelo lineal de tres estados resuelto con la exponencial de la matriz de velocidades (<code>expm</code> en <code>math.js</code>), con barreras de Eyring. En el equilibrio las poblaciones siguen la distribución de Boltzmann, <i>independiente de las barreras</i>: P₁/P₂ = e<sup>−(G₁−G₂)/RT</sup>. A tiempos intermedios, la razón cambia de k₁/k₂ a la de equilibrio. Una enzima baja <i>barreras</i>, no cambia G de reactivos ni productos (sección 6).</p>" + TC.doubt(1) + TC.doubt(2) + TC.doubt(3);
    },
    sources: "<p>Diap. 3 y 12–15 del profe. t½ del ADN: Schroeder <i>et al.</i> 2006 (PNAS, doi:10.1073/pnas.0510879103), resumen consultado vía Europe PMC (diéster modelo: 30 000 000 años; la cifra de ADN no está verificada). Presets de H₂O₂: derivados de las frases de la diap. 13 (ilustrativos). Estructura 1DGF: Putnam <i>et al.</i> 2000, J Mol Biol 296:295 (doi:10.1006/jmbi.1999.3458) " + TC.badge("verificado") + ". Edad de la Tierra (4,5×10⁹ años) es un valor de cultura general no citado a fuente.</p>"
  });
})(window.TC);
