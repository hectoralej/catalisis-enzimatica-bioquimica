/* S15 — Ecuación de Michaelis–Menten (diap. 53–56) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  /* Tabla de kcat/Km. Fila 1–6: Mathews et al. (1999), reproducida en Wikipedia («Michaelis–Menten kinetics»).
     Filas 7–14: tabla de enzimas cercanas al límite de difusión (Nelson & Cox, Lehninger 4.ª ed., tabla 6-8; copia de curso en
     employees.csbsju.edu/hjakubowski/.../tablediffcontrol.htm; BioNumbers ids 105087/103917). Ambas fuentes son secundarias. */
  var REAL = [
    { enz: "Quimotripsina", s: "(ver fuente)", kcat: 0.14, Km: 1.5e-2 }, { enz: "Pepsina", s: "(ver fuente)", kcat: 0.50, Km: 3.0e-4 },
    { enz: "tRNA sintetasa", s: "(ver fuente)", kcat: 7.6, Km: 9.0e-4 }, { enz: "Ribonucleasa", s: "(ver fuente)", kcat: 7.9e2, Km: 7.9e-3 },
    { enz: "Acetilcolinesterasa", s: "acetilcolina", kcat: 1.4e4, Km: 9e-5 }, { enz: "Anhidrasa carbónica", s: "CO₂", kcat: 1e6, Km: 1.2e-2 },
    { enz: "Anhidrasa carbónica", s: "HCO₃⁻", kcat: 4e5, Km: 2.6e-2 }, { enz: "Catalasa", s: "H₂O₂", kcat: 4e7, Km: 1.1 },
    { enz: "Crotonasa", s: "crotonil-CoA", kcat: 5.7e3, Km: 2e-5 }, { enz: "Fumarasa", s: "fumarato", kcat: 8e2, Km: 5e-6 },
    { enz: "Triosafosfato isomerasa", s: "gliceraldehído-3-fosfato", kcat: 4.3e3, Km: 4.7e-4 }, { enz: "β-Lactamasa", s: "bencilpenicilina", kcat: 2.0e3, Km: 2e-4 }
  ];
  TC.addSection({
    id: "s15", title: "Ecuación de Michaelis–Menten", short: "Michaelis–Menten", diaps: "Diap. 53–56 (modelo de Michaelis–Menten; ensayo de 10 tubos; Km, Vmax, kcat, UI y katal)",
    essentials: [
      "Michaelis–Menten: $v_0=\\dfrac{V_{max}[S]}{K_m+[S]}$. La curva de v₀ vs [S] es una <b>hipérbola</b> con asíntota V<sub>max</sub> (diap. 55).",
      "<b>K<sub>m</sub></b>: concentración de sustrato a la que la velocidad es ½ V<sub>max</sub>. <b>V<sub>max</sub></b>: velocidad cuando <i>todos</i> los centros activos están ocupados (velocidad máxima teórica) (diap. 56).",
      "<b>k<sub>cat</sub></b> (número de recambio): moléculas de sustrato convertidas por molécula de enzima y unidad de tiempo en saturación; equivale a la constante de velocidad del paso limitante. Entonces V<sub>max</sub> = k<sub>cat</sub>[E]<sub>t</sub>.",
      "<b>Unidad de enzima (UI)</b>: cantidad que transforma 1 µmol de sustrato por minuto. <b>Katal</b>: la que transforma 1 mol por segundo. <b>1 kat = 6×10⁷ UI</b> (diap. 56).",
      "A [S] ≪ K<sub>m</sub> la reacción es de <b>primer orden</b> en [S] (v ≈ (V<sub>max</sub>/K<sub>m</sub>)[S]); a [S] ≫ K<sub>m</sub> es de <b>orden cero</b> (v ≈ V<sub>max</sub>)."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Parámetros:</b><span id="md"></span></div><div id="ctl"></div><div id="out" class="readout"></div><div id="ch"></div><details class="src"><summary>Derivación (estado estacionario de Briggs–Haldane)</summary><div class="inner" id="der"></div></details>' +
        '<h3>Conversor de unidades de actividad (diap. 56)</h3><div class="row" id="cv"></div><div id="cvo" class="readout"></div>';
      var mode = "vk", ctl = root.querySelector("#ctl");
      var sg = TC.seg([["vk", "Vmax y Km"], ["ke", "kcat y [E]t"]], "vk", function (v) { mode = v; setup(); upd(); }, "parametrización"); root.querySelector("#md").appendChild(sg.el);
      var sV = TC.slider({ label: "V<sub>max</sub>", unit: "µM/min", min: 1, max: 1000, log: true, value: 80, onChange: upd });
      var sKc = TC.slider({ label: "k<sub>cat</sub>", unit: "s⁻¹", min: 0.1, max: 1e6, log: true, value: 1000, onChange: upd });
      var sE = TC.slider({ label: "[E]<sub>t</sub>", unit: "nM", min: 0.01, max: 1000, log: true, value: 1.3, onChange: upd });
      var sK = TC.slider({ label: "K<sub>m</sub>", unit: "µM", min: 1, max: 10000, log: true, value: 100, onChange: upd });
      var sS = TC.slider({ label: "[S]", unit: "µM", min: 0.1, max: 100000, log: true, value: 100, onChange: upd });
      function setup() { ctl.innerHTML = ""; (mode === "vk" ? [sV, sK, sS] : [sKc, sE, sK, sS]).forEach(function (s) { ctl.appendChild(s.el); }); }
      setup();
      var ch = new TC.Chart(root.querySelector("#ch"), { w: 720, h: 400, xlim: [0, 1], ylim: [0, 1], xlabel: "[S] (µM)", ylabel: "v_{0} (µM/min)", aria: "Hipérbola de Michaelis–Menten" });
      function par() { var K = sK.get(), V = mode === "vk" ? sV.get() : sKc.get() * 60 * sE.get() * 1e-3; return { V: V, K: K, S: sS.get(), kcat: mode === "vk" ? null : sKc.get() }; }
      function upd() {
        var p = par(), v = M.mm(p.S, p.V, p.K), xmax = Math.max(8 * p.K, p.S * 1.15), xs = [], ys = [], i;
        for (i = 0; i <= 200; i++) { var x = xmax * i / 200; xs.push(x); ys.push(M.mm(x, p.V, p.K)); }
        ch.update({ xlim: [0, xmax], ylim: [0, p.V * 1.12], lines: [{ x: xs, y: ys, color: "c1", width: 3, label: "v₀(S)", labelAt: 150, dy: 16 }, { x: [0, Math.min(xmax, 2.2 * p.K)], y: [0, Math.min(xmax, 2.2 * p.K) * p.V / p.K], color: "c5", dash: "dash", width: 1.6, label: "pendiente V_{max}/K_{m} (1.er orden)", labelAt: "end", dy: 14 }],
          hlines: [{ y: p.V, label: "V_{max}", color: "c2", dash: "dash" }, { y: p.V / 2, label: "V_{max}/2", color: "c3", dash: "dot" }], vlines: [{ x: p.K, label: "K_{m}", color: "c3", dash: "dot" }],
          points: [{ x: p.K, y: p.V / 2, color: "c3", marker: "square", r: 5 }, { x: p.S, y: v, color: "c4", marker: "circle", r: 6, label: "[S] = " + TC.numPlain(p.S, 3), anchor: "start", dx: 8, dy: 18 }],
          areas: [{ x: [0, 0.1 * p.K], y: [p.V * 1.12, p.V * 1.12], y0: [0, 0], color: "c5", opacity: 0.15 }, { x: [Math.min(10 * p.K, xmax), xmax], y: [p.V * 1.12, p.V * 1.12], y0: [0, 0], color: "c2", opacity: 0.12 }] });
        var kc = p.kcat != null ? p.kcat : null, tag = p.S < 0.2 * p.K ? "≈ 1.er orden (S ≪ Km)" : p.S > 5 * p.K ? "≈ orden cero (S ≫ Km)" : "régimen mixto";
        root.querySelector("#out").innerHTML = TC.stat("v₀ en [S]", TC.num(v, 3), "µM/min") + TC.stat("v₀ / Vmax = [S]/(Km + [S])", TC.num(v / p.V * 100, 3), "%") + TC.stat("Régimen", tag, "") + (kc != null ? TC.stat("Vmax = kcat[E]t", TC.num(p.V, 3), "µM/min") + TC.stat("kcat/Km", TC.num(kc / (p.K * 1e-6), 3), "M⁻¹s⁻¹", "") + TC.stat("¿Cerca del límite de difusión?", kc / (p.K * 1e-6) > 1e7 ? "sí (kcat/Km ≳ 10⁷–10⁸ M⁻¹s⁻¹; cifra de libro, no verificada)" : "no", "") : "");
      }
      upd();
      root.querySelector("#der").innerHTML = "<p>Con $E+S\\overset{k_1}{\\underset{k_{-1}}{\\rightleftharpoons}}ES\\overset{k_2}{\\to}E+P$ y estado estacionario $\\frac{d[ES]}{dt}=0$:</p><p>$k_1[E][S]=(k_{-1}+k_2)[ES]$ y $[E]_t=[E]+[ES]$, de donde $[ES]=\\dfrac{[E]_t[S]}{K_m+[S]}$ con $K_m=\\dfrac{k_{-1}+k_2}{k_1}$. Como $v=k_2[ES]$: $v=\\dfrac{k_2[E]_t[S]}{K_m+[S]}=\\dfrac{V_{max}[S]}{K_m+[S]}$, con $V_{max}=k_2[E]_t=k_{cat}[E]_t$.</p>"; TC.renderMath(root.querySelector("#der"));
      var unit = TC.select([["ui", "UI (µmol/min)"], ["umol", "µmol/min"], ["kat", "kat (mol/s)"], ["mol", "mol/s"], ["nkat", "nkat"]], "ui", cv), val = TC.slider({ label: "Cantidad", unit: "", min: 1e-9, max: 1e9, log: true, value: 1, onChange: cv });
      var cvw = root.querySelector("#cv"); cvw.appendChild(val.el); cvw.appendChild(TC.h("<span>en</span>")); cvw.appendChild(unit);
      function cv() { var q = val.get(), ui = { ui: q, umol: q, kat: M.katToUi(q), mol: M.katToUi(q), nkat: M.katToUi(q * 1e-9) }[unit.value]; root.querySelector("#cvo").innerHTML = TC.stat("UI = µmol/min", TC.num(ui, 4), "") + TC.stat("katal (mol/s)", TC.num(M.uiToKat(ui), 4), "kat") + TC.stat("nanokatal", TC.num(M.uiToKat(ui) * 1e9, 4), "nkat") + TC.stat("1 kat = 6×10⁷ UI", "✔", "(diap. 56)"); }
      cv();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Enzimas reales: kcat, Km y kcat/Km.</b> " + TC.badge("verificado") + " contra dos tablas de libro de texto: las 4 primeras filas son de Mathews <i>et al.</i> 1999 (reproducida en Wikipedia) y el resto, de la tabla de enzimas cercanas al límite de difusión de Nelson &amp; Cox (<i>Lehninger</i>, 4.ª ed., tabla 6-8; copia de curso de H. Jakubowski, CSB/SJU, y BioNumbers). Son fuentes secundarias; los valores dependen de condiciones (pH, T, organismo) que las tablas no detallan, y otras fuentes dan cifras algo distintas (p. ej., kcat de la AChE ≈ 2,5×10⁴ s⁻¹). La lección es el ordenamiento (cerca o lejos del límite de difusión), no el decimal.</p>" +
        '<div class="row"><label><input type="checkbox" id="flt"> mostrar solo kcat/Km ≥ 10⁷ M⁻¹s⁻¹</label></div><div id="tb"></div>' +
        "<p class=\"small\">Comprobación interna: kcat/Km se recalcula de las dos columnas y coincide con la tabla (AChE 1,6×10⁸; CA con CO₂ 8,3×10⁷; fumarasa 1,6×10⁸; TIM 2,4×10⁸; β-lactamasa 1×10⁸). <b>Límite de difusión ≈ 10⁸–10⁹ M⁻¹s⁻¹</b> <span class=\"verified\">[verificado]</span>: Stryer <i>et al.</i>, <i>Biochemistry</i> 5.ª ed., tabla 8.8 (fuente primaria: Fersht 1999, tabla 4.5), vía BioNumbers; la catalasa (4×10⁷) queda «cerca» pero por debajo.</p>";
      function tab() { var f = root.querySelector("#flt").checked; root.querySelector("#tb").innerHTML = TC.table(["Enzima", "Sustrato", "kcat (s⁻¹)", "Km (M)", "kcat/Km (M⁻¹s⁻¹)"], REAL.filter(function (r) { return !f || r.kcat / r.Km >= 1e7; }).map(function (r) { return [r.enz, r.s, TC.num(r.kcat, 2), TC.num(r.Km, 2), "<b>" + TC.num(r.kcat / r.Km, 2) + "</b>"]; })); }
      root.querySelector("#flt").addEventListener("change", tab); tab();
      root.appendChild(TC.h("<div><h3>Hexoquinasa vs glucoquinasa: Km muy distintos para la glucosa</h3><p>Idea clásica: la hexoquinasa tiene alta afinidad por la glucosa (K<sub>m</sub> ≈ décimas de mM o menos) y se satura incluso con glucemia baja; la glucoquinasa tiene baja afinidad (≈ 8 mM) y su actividad sigue la glucosa hasta valores altos. Gráfica con valores <span class=\"illustr\">modelo didáctico, valores ilustrativos</span> (K<sub>m</sub> 0,1 mM y 8 mM; la glucoquinasa real es cooperativa: se muestra una hipérbola por simplicidad). Cifras reales <span class=\"unverified\">[no verificado]</span>.</p><div id=\"hk\"></div></div>"));
      var hc = new TC.Chart(root.querySelector("#hk"), { w: 640, h: 300, xlim: [0, 20], ylim: [0, 1.05], xlabel: "[glucosa] (mM)", ylabel: "v/V_{max}", aria: "Hexoquinasa vs glucoquinasa" });
      var xs = [], a = [], b = []; for (var x = 0; x <= 20; x += 0.2) { xs.push(x); a.push(M.mm(x, 1, 0.1)); b.push(M.mm(x, 1, 8)); }
      hc.update({ lines: [{ x: xs, y: a, color: "c1", label: "hexoquinasa (K_{m} = 0,1 mM)", labelAt: 60, dy: 16 }, { x: xs, y: b, color: "c2", dash: "dash", label: "glucoquinasa (K_{m} = 8 mM)", labelAt: 90, dy: 18 }], vlines: [{ x: 5, label: "≈ 5 mM (glucemia, ilustrativo)", color: "c7", dash: "dot" }] });
      root.appendChild(TC.h("<div><p>Dos enzimas con estructura verificada de este tema: la <b>anhidrasa carbónica II</b> (1CA2) y la <b>quimotripsina</b> (4CHA; tríada Ser195–His57–Asp102). Elige una:</p><div class=\"row\" id=\"sw\"></div><div id=\"vw\"></div></div>"));
      var viewer = null;
      function open(k) { if (viewer) viewer.destroy(); var h = root.querySelector("#vw"); h.innerHTML = ""; viewer = TC.viewer(h, k === "ca" ? { id: "1CA2", focus: [{ chain: "A", resi: 94, label: "His94", atom: "NE2" }, { chain: "A", resi: 96, label: "His96", atom: "NE2" }, { chain: "A", resi: 119, label: "His119", atom: "ND1" }], ligands: [{ resn: "ZN", label: "Zn²⁺" }], distances: ["zn_his94", "zn_his96", "zn_his119"] } : { id: "4CHA", focus: [{ chain: "B", resi: 57, label: "His57", atom: "NE2" }, { chain: "B", resi: 102, label: "Asp102", atom: "OD1" }, { chain: "C", resi: 195, label: "Ser195", atom: "OG" }], ligands: [], distances: ["his57_ser195", "asp102_his57"], note: TC.callout("note", "Sin sustrato", "<p>4CHA es la α-quimotripsina sin ligando; la tríada se mide en el archivo (numeración del quimotripsinógeno: las tres cadenas B y C llevan los residuos 57, 102 y 195).</p>") }); }
      var sw = root.querySelector("#sw"); sw.appendChild(TC.button("Anhidrasa carbónica II (1CA2)", function () { open("ca"); }, "small")); sw.appendChild(TC.button("Quimotripsina (4CHA)", function () { open("ch"); }, "small")); open("ca");
    },
    quiz: [
      { q: "Si [S] = Km, ¿cuánto vale v₀?", o: ["Vmax", "Vmax/2", "Vmax/10", "Km"], c: 1, e: "v₀ = Vmax·Km/(Km + Km) = Vmax/2: es la definición operativa de Km (diap. 56)." },
      { make: function (r) { var V = Math.round(20 + r() * 180), K = Math.round(20 + r() * 300), S = Math.round(K * (0.2 + r() * 4)); return { q: "Vmax = " + V + " µM/min, Km = " + K + " µM y [S] = " + S + " µM. Calcula v₀ (µM/min).", ans: M.mm(S, V, K), unit: "µM/min", tol: 0.01, abs: 0.05, e: function () { return "v₀ = " + V + "·" + S + "/(" + K + " + " + S + ") = " + TC.num(M.mm(S, V, K), 4) + " µM/min."; } }; } },
      { make: function (r) { var ui = Math.round(1 + r() * 9) * 1e7; return { q: "Una muestra tiene " + ui.toExponential(0).replace("e+", "×10^") + " UI. ¿Cuántos katal son? (1 kat = 6×10⁷ UI)", ans: ui / 6e7, unit: "kat", tol: 0.01, abs: 0.002, e: function () { return ui + " / 6×10⁷ = " + TC.num(ui / 6e7, 4) + " kat."; } }; } },
      { q: "A [S] ≫ Km la cinética es…", o: ["De primer orden en [S]", "De orden cero en [S] (v ≈ Vmax)", "De segundo orden", "Independiente de la enzima"], c: 1, e: "Saturada: aumentar [S] casi no cambia v." }
    ],
    beyondTitle: "kcat/Km, especificidad y límite de difusión",
    beyond: function (el) {
      el.innerHTML = "<p>A [S] ≪ Km, v ≈ (kcat/Km)[E]t[S]: kcat/Km es la <i>constante de especificidad</i> (M⁻¹s⁻¹) y compara el aprovechamiento de sustratos competidores. Su valor máximo lo impone la frecuencia de encuentro por difusión (≈ 10⁸–10⁹ M⁻¹s⁻¹ <span class=\"unverified\">[no verificado]</span>). Km no es una constante de disociación salvo que k₋₁ ≫ k₂. Un valor mayor de Km no «es peor»: depende de la [S] fisiológica (hexoquinasa vs glucoquinasa).</p>";
    },
    sources: "<p>Diap. 53–56 del profe (curva, Km, Vmax, kcat, UI, katal). Derivación y propiedades: texto estándar; las ecuaciones se verifican numéricamente en <code>math_tests.js</code> (límites S ≪ Km, S = Km, S ≫ Km). Tabla de enzimas reales: Mathews <i>et al.</i> 1999 (vía Wikipedia) y Nelson &amp; Cox, <i>Lehninger</i>, tabla 6-8 (vía material de curso y BioNumbers). Estructuras 1CA2 (Eriksson 1988) y 4CHA (Tsukada 1985, doi:10.1016/0022-2836(85)90314-6) " + TC.badge("verificado") + ".</p>"
  });
})(window.TC);
