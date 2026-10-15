/* S8 — Modelo de reacción enzimática: E + S ⇌ ES → E + P (diap. 26) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  TC.addSection({
    id: "s08", title: "Modelo de reacción enzimática: E + S ⇌ ES → E + P", short: "Modelo E + S ⇌ ES → E + P", diaps: "Diap. 26 (unión del sustrato, conversión, liberación del producto; ciclo de la sacarasa)",
    essentials: [
      "Primero la enzima se asocia con el sustrato y forma el complejo <b>ES</b> (constantes k₁ y k₋₁); luego ES se transforma en <b>EP</b> y finalmente EP se disocia en E y P (diap. 26). El profe rotula tres etapas: <i>unión del sustrato</i>, <i>conversión del sustrato a producto</i> y <i>liberación del producto</i>.",
      "En el esquema simplificado de este recurso: $E+S\\;\\underset{k_{-1}}{\\overset{k_1}{\\rightleftharpoons}}\\;ES\\;\\overset{k_2}{\\longrightarrow}\\;E+P$ con $K_m=\\dfrac{k_{-1}+k_2}{k_1}$ y $V_{max}=k_2[E]_0$ (aquí k₂ resume conversión + liberación; ver duda 15).",
      "Si [S]₀ ≫ [E]₀, tras un breve <b>régimen transitorio</b> (se forma ES) aparece el <b>estado estacionario</b>: d[ES]/dt ≈ 0 y la velocidad es casi constante (Briggs–Haldane).",
      "La sacarasa (ciclo de la diapositiva) hidroliza sacarosa a glucosa + fructosa: ① enzima y sustrato disponibles, ② el sustrato se une, ③ se convierte en productos (+H₂O), ④ se liberan los productos."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row" id="pre"><b>Casos:</b></div><div id="ctl"></div><div id="out" class="readout"></div><div id="chA"></div><div id="chB"></div><div id="msg"></div>';
      var P = { k1: 1e6, km1: 50, k2: 100, E0: 1e-8, S0: 1e-3 }, ctl = root.querySelector("#ctl"), sl = {};
      function mk(key, label, unit, min, max, val, dec) { sl[key] = TC.slider({ label: label, unit: unit, min: min, max: max, log: true, value: val, onChange: function (v) { P[key] = v; upd(); } }); ctl.appendChild(sl[key].el); }
      mk("k1", "k₁ (unión)", "M⁻¹s⁻¹", 1e3, 1e9, 1e6); mk("km1", "k₋₁ (disociación de ES)", "s⁻¹", 0.1, 1e5, 50); mk("k2", "k₂ (catálisis y liberación)", "s⁻¹", 0.1, 1e5, 100);
      mk("E0", "[E]₀", "M", 1e-10, 1e-5, 1e-8); mk("S0", "[S]₀", "M", 1e-7, 1e-1, 1e-3);
      var pre = root.querySelector("#pre");
      [["Régimen clásico", { k1: 1e6, km1: 50, k2: 100, E0: 1e-8, S0: 1e-3 }], ["[S]₀ ≈ Km (v ≈ Vmax/2)", { k1: 1e6, km1: 50, k2: 100, E0: 1e-8, S0: 1.5e-4 }], ["Unión muy rápida y catálisis lenta", { k1: 1e8, km1: 10, k2: 1, E0: 1e-7, S0: 1e-4 }], ["[E]₀ comparable a [S]₀ (¡no vale Briggs–Haldane!)", { k1: 1e6, km1: 50, k2: 100, E0: 1e-6, S0: 2e-6 }]].forEach(function (c) { pre.appendChild(TC.button(c[0], function () { Object.keys(c[1]).forEach(function (k) { P[k] = c[1][k]; sl[k].set(c[1][k], true); }); upd(); }, "small")); });
      var chA = new TC.Chart(root.querySelector("#chA"), { w: 720, h: 330, xlog: true, xlim: [1e-6, 1e3], ylim: [0, 1], xlabel: "tiempo t (s)", ylabel: "concentración (µM)", aria: "Sustrato y producto" });
      var chB = new TC.Chart(root.querySelector("#chB"), { w: 720, h: 330, xlog: true, xlim: [1e-6, 1e3], ylim: [0, 1], xlabel: "tiempo t (s)", ylabel: "concentración (nM)", aria: "Enzima libre y complejo ES" });
      function upd() {
        var c = M.mmConstants(P), v0 = c.Vmax * P.S0 / (c.Km + P.S0), tau = 1 / (P.k1 * (P.S0 + c.Km) + P.km1 * 0), tEnd = Math.min(1e9, Math.max(20 * tau, 3 * P.S0 / Math.max(v0, 1e-30)));
        var tMin = Math.min(tau / 30, tEnd / 1e6), ts = [], n = 160, i;
        for (i = 0; i <= n; i++) ts.push(tMin * Math.pow(tEnd / tMin, i / n));
        var res = M.simulateMM(P, ts), uS = res.map(function (r) { return r.S * 1e6; }), uP = res.map(function (r) { return r.P * 1e6; }), nE = res.map(function (r) { return r.E * 1e9; }), nES = res.map(function (r) { return r.ES * 1e9; });
        var tTrans = 3 / (P.k1 * P.S0 + P.km1 + P.k2);       // ≈ 3 × tiempo de relajación de ES hacia el estado estacionario
        var tDep = P.S0 / Math.max(v0, 1e-30);
        var j = 0; for (i = 0; i < ts.length; i++) if (ts[i] <= Math.sqrt(tTrans * tDep)) j = i;
        var ja = Math.max(j - 1, 0), jb = Math.min(j + 1, ts.length - 1);
        var dES = (res[jb].ES - res[ja].ES) / (ts[jb] - ts[ja]), cat = P.k2 * res[j].ES;
        var vSim = (res[jb].P - res[ja].P) / (ts[jb] - ts[ja]), massE = Math.max.apply(null, res.map(function (r) { return Math.abs(P.E0 - r.E - r.ES) / P.E0; })), massS = Math.max.apply(null, res.map(function (r) { return Math.abs(P.S0 - r.S - r.ES - r.P) / P.S0; }));
        var ok = P.S0 > 10 * P.E0;
        root.querySelector("#out").innerHTML = TC.stat("Km = (k₋₁ + k₂)/k₁", TC.num(c.Km * 1e6, 3), "µM") + TC.stat("Vmax = k₂[E]₀", TC.num(c.Vmax * 1e6, 3), "µM/s") + TC.stat("kcat/Km", TC.num(c.specif, 3), "M⁻¹s⁻¹") +
          TC.stat("Fin del transitorio ≈ 3/(k₁[S]₀ + k₋₁ + k₂)", M.humanTime(tTrans), "") + TC.stat("v estacionaria simulada", TC.num(vSim * 1e6, 3), "µM/s") + TC.stat("v de Michaelis–Menten (S₀)", TC.num(v0 * 1e6, 3), "µM/s") +
          TC.stat("|d[ES]/dt| / (k₂[ES]) en el estado estacionario", TC.num(Math.abs(dES) / cat, 2), "≪ 1 ⇒ d[ES]/dt ≈ 0") + TC.stat("Conservación de masa (máx. error relativo)", TC.numPlain(Math.max(massE, massS), 2), "[E]₀ = [E]+[ES]; [S]₀ = [S]+[ES]+[P]");
        var yS = Math.max(P.S0 * 1e6, 1e-9);
        var vl = [{ x: tTrans, label: "fin del transitorio (≈)", color: "c5" }, { x: tDep, label: "S se agota (≈)", color: "c2", dy: 16 }].filter(function (z) { return z.x > ts[0] && z.x < ts[ts.length - 1]; });
        chA.update({ xlim: [ts[0], ts[ts.length - 1]], ylim: [0, yS * 1.08], lines: [{ x: ts, y: uS, color: "c1", label: "[S]" }, { x: ts, y: uP, color: "c3", dash: "dash", label: "[P]" }], vlines: vl });
        var yE = Math.max(P.E0 * 1e9, 1e-9);
        chB.update({ xlim: [ts[0], ts[ts.length - 1]], ylim: [0, yE * 1.15], lines: [{ x: ts, y: nE, color: "c4", label: "[E] libre" }, { x: ts, y: nES, color: "c2", dash: "dash", label: "[ES]" }], hlines: [{ y: yE, dash: "dot" }],
          vlines: vl.slice(0, 1) });
        root.querySelector("#msg").innerHTML = (ok ? "" : TC.callout("bad", "Aviso: [S]₀ no es ≫ [E]₀", "<p>La aproximación de estado estacionario (Briggs–Haldane) requiere [S]₀ ≫ [E]₀. Con tus valores no se cumple: el sustrato libre se agota por la unión a E y Michaelis–Menten deja de describir la cinética.</p>")) + TC.doubt(15);
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p><b>β-galactosidasa de <i>E. coli</i> (4V40) y la lactosa (diap. 44).</b> Es un caso de E + S → E + P con hidrólisis. El archivo del PDB contiene la enzima y Mg²⁺ pero <b>no sustrato</b>: no se ve el complejo ES. Los dos Glu de abajo se muestran porque el esquema de la literatura los nombra (nucleófilo y ácido/base) <span class=\"unverified\">[rol de la literatura, sin verificar]</span>; lo medido es que el Glu461 es del tipo correcto en esa posición y coordina el Mg²⁺ a 2,36 Å.</p>" +
        TC.rxn(["mol:lactosa", "txt:+ H₂O", { arrow: { top: "β-galactosidasa", bottom: "E.C. 3.2.1.23 (diap. 44)", dir: "→" } }, "mol:galactosa", "+", "mol:glucosa"]);
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "4V40", focus: [{ chain: "A", resi: 461, label: "Glu461" }, { chain: "A", resi: 537, label: "Glu537" }], ligands: [], metals: true, distances: ["mg_glu461"], note: TC.callout("note", "Qué ves", "<p>Solo la cadena A (de 16 en el archivo) y la región cercana a Glu461/Glu537; recortado.</p>") });
    },
    quiz: [
      { make: function (r) { var k1 = Math.round(1 + r() * 9) * 1e5, km1 = Math.round(1 + r() * 9) * 20, k2 = Math.round(1 + r() * 9) * 30; return { q: "k₁ = " + k1.toExponential(0).replace("e+", "×10^") + " M⁻¹s⁻¹, k₋₁ = " + km1 + " s⁻¹ y k₂ = " + k2 + " s⁻¹. Calcula Km en µM.", ans: (km1 + k2) / k1 * 1e6, unit: "µM", tol: 0.01, abs: 0.05, e: function () { return "Km = (k₋₁ + k₂)/k₁ = (" + km1 + " + " + k2 + ")/" + k1 + " = " + TC.num((km1 + k2) / k1 * 1e6, 4) + " µM."; } }; } },
      { q: "¿Qué condición exige la aproximación de estado estacionario de Briggs–Haldane?", o: ["[E]₀ ≫ [S]₀", "[S]₀ ≫ [E]₀ (y d[ES]/dt ≈ 0)", "k₂ = 0", "La reacción debe estar en equilibrio"], c: 1, e: "Con S en gran exceso, [ES] se estabiliza pronto y su variación es casi nula mientras queda sustrato." },
      { q: "Vmax se alcanza cuando…", o: ["Todos los centros activos están ocupados por S (diap. 56)", "[S] = Km", "[E] = 0", "k₁ = k₋₁"], c: 0, e: "Vmax = k₂[E]₀ corresponde a enzima saturada." }
    ],
    beyondTitle: "Transitorio, «burst» y el modelo completo de tres pasos",
    beyond: function (el) {
      el.innerHTML = "<p>Michaelis–Menten (equilibrio rápido) supone k₋₁ ≫ k₂, de modo que K<sub>m</sub> ≈ K<sub>s</sub> = k₋₁/k₁. Briggs–Haldane solo pide estado estacionario. En el esquema de tres pasos del profe, E + S ⇌ ES ⇌ EP → E + P, k₂ del modelo simple agrupa la conversión y la liberación: k<sub>cat</sub> = k<sub>conv</sub>·k<sub>lib</sub>/(k<sub>conv</sub> + k<sub>lib</sub> + …). Un auténtico <i>burst</i> de producto (liberación inicial rápida seguida de una fase lenta de recambio) aparece cuando la liberación del producto es mucho más lenta que la conversión; el modelo simple del deslizador muestra la fase transitoria de acumulación de ES, no ese burst de producto.</p>" + TC.doubt(15);
    },
    sources: "<p>Diap. 26 (el esquema E/S/ES/EP/P con k₁, k₋₁, k₂ y el ciclo de la sacarasa). Integración numérica: Dormand–Prince RK45 en <code>web/js/math.js</code> (<code>simulateMM</code>), probada para conservación de masa y convergencia al estado estacionario (<code>math_tests.js</code>). 4V40: Jacobson <i>et al.</i> 1994, Nature 369:761 (doi:10.1038/369761a0) " + TC.badge("verificado") + ". Todos los parámetros cinéticos de los casos son <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>.</p>"
  });
})(window.TC);
