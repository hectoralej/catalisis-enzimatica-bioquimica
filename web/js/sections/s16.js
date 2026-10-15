/* S16 — Linealizaciones y ajuste de datos (diap. 54, 57) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  var SLIDE = { S: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45], v: [25, 40, 48, 55, 60, 62, 63, 64, 64] };   // diap. 54: [S] mM, v₀ µM/min
  TC.addSection({
    id: "s16", title: "Linealizaciones y ajuste de datos", short: "Linealizaciones y ajuste", diaps: "Diap. 57 (dobles recíprocos, Lineweaver–Burk) y datos de la diap. 54",
    essentials: [
      "Invirtiendo la ecuación de Michaelis–Menten (diap. 57): $\\dfrac{1}{v}=\\dfrac{K_m}{V_{max}}\\cdot\\dfrac{1}{[S]}+\\dfrac{1}{V_{max}}$: una <b>recta</b> y = ax + b con <b>pendiente K<sub>m</sub>/V<sub>max</sub></b>, <b>ordenada 1/V<sub>max</sub></b> y <b>abscisa en el origen −1/K<sub>m</sub></b>.",
      "Otras linealizaciones (<b>más allá del profe</b>): <b>Eadie–Hofstee</b> (v vs v/[S]: pendiente −K<sub>m</sub>, ordenada V<sub>max</sub>) y <b>Hanes–Woolf</b> ([S]/v vs [S]: pendiente 1/V<sub>max</sub>, ordenada K<sub>m</sub>/V<sub>max</sub>).",
      "Con datos <i>sin ruido</i> todos los métodos dan lo mismo; con datos reales, la inversión <b>distorsiona</b> los puntos de [S] baja (1/v grande) y el ajuste de Lineweaver–Burk sesga los parámetros. El ajuste <b>no lineal</b> directo suele ser preferible.",
      "En el ensayo de 10 tubos (diap. 54), leer V<sub>max</sub> en la «meseta» visible (≈ 65 µM/min) la <b>subestima</b> (duda 10): el ajuste da ≈ 81 µM/min."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row" id="pre"><b>Datos:</b></div><div class="grid2"><div id="ctl"></div><div id="res"></div></div><div class="row" id="tl" style="margin:6px 0"></div><p class="small" id="hint"></p><div class="grid2"><div><div id="c1"></div></div><div><div id="c2"></div></div><div><div id="c3"></div></div><div><div id="c4"></div></div></div><div id="cmp"></div>';
      var T = { V: 80, K: 0.10, noise: 5, n: 9, rng: 3, seed: 7 }, pts = [], slideMode = false, ctl = root.querySelector("#ctl");
      var sV = TC.slider({ label: "Vmax verdadera", unit: "µM/min", min: 10, max: 300, step: 1, value: 80, dec: 0, onChange: function (v) { T.V = v; regen(); } });
      var sK = TC.slider({ label: "Km verdadera", unit: "mM", min: 0.01, max: 1, log: true, value: 0.10, onChange: function (v) { T.K = v; regen(); } });
      var sN = TC.slider({ label: "Ruido experimental (σ relativa en v)", unit: "%", min: 0, max: 30, step: 0.5, value: 5, dec: 1, onChange: function (v) { T.noise = v; regen(); } });
      var sP = TC.slider({ label: "Número de puntos", unit: "", min: 4, max: 14, step: 1, value: 9, dec: 0, onChange: function (v) { T.n = Math.round(v); regen(); } });
      var sR = TC.slider({ label: "[S] máx. (en múltiplos de Km)", unit: "× Km", min: 1, max: 10, step: 0.1, value: 4.5, dec: 1, onChange: function (v) { T.rng = v; regen(); } });
      [sV, sK, sN, sP, sR].forEach(function (s) { ctl.appendChild(s.el); });
      var pre = root.querySelector("#pre");
      pre.appendChild(TC.button("Simulados", function () { slideMode = false; regen(); }, "small")); pre.appendChild(TC.button("Cargar los datos de la diap. 54", function () { slideMode = true; pts = SLIDE.S.map(function (s, i) { return [s, SLIDE.v[i]]; }); upd(); }, "small"));
      var tl = root.querySelector("#tl"); tl.appendChild(TC.button("Nuevo muestreo de ruido", function () { T.seed = Math.floor(Math.random() * 1e6); slideMode = false; regen(); }, "small"));
      tl.appendChild(TC.button("Borrar último punto", function () { pts.pop(); upd(); }, "small")); tl.appendChild(TC.h('<span class="small">Haz clic en la gráfica directa para añadir un punto; arrastra un punto para moverlo.</span>'));
      var W = 360, H = 270, mk = function (id, o) { return new TC.Chart(root.querySelector(id), Object.assign({ w: W, h: H, m: { l: 58, r: 14, t: 14, b: 46 }, xlim: [0, 1], ylim: [0, 1] }, o)); };
      var c1 = mk("#c1", { xlabel: "[S] (mM)", ylabel: "v_{0} (µM/min)", title: "Directa (v frente a [S])" }), c2 = mk("#c2", { xlabel: "1/[S] (mM^{-1})", ylabel: "1/v_{0} (min/µM)", title: "Lineweaver–Burk", zeroAxes: true });
      var c3 = mk("#c3", { xlabel: "v_{0}/[S] (µM/min/mM)", ylabel: "v_{0} (µM/min)", title: "Eadie–Hofstee" }), c4 = mk("#c4", { xlabel: "[S] (mM)", ylabel: "[S]/v_{0} (mM·min/µM)", title: "Hanes–Woolf" });
      function regen() {
        var r = M.rng(T.seed), S = []; for (var i = 0; i < T.n; i++) S.push(T.K * (0.15 + (T.rng - 0.15) * i / Math.max(T.n - 1, 1)));
        pts = S.map(function (s) { var v = M.mm(s, T.V, T.K) * (1 + T.noise / 100 * M.gauss(r)); return [s, Math.max(v, 1e-6)]; }); upd();
      }
      function fits() {
        var S = pts.map(function (p) { return p[0]; }), v = pts.map(function (p) { return p[1]; });
        if (pts.length < 3) return null;
        return { S: S, v: v, nl: M.fitMM(S, v), lb: M.fitLB(S, v), eh: M.fitEH(S, v), hw: M.fitHW(S, v), plateau: Math.max.apply(null, v) };
      }
      function ln(f, a, b) { return { x: [a, b], y: [f.intercept + f.slope * a, f.intercept + f.slope * b] }; }
      function upd() {
        var F = fits(); if (!F) { root.querySelector("#res").innerHTML = "<p>Se necesitan ≥ 3 puntos.</p>"; return; }
        var smax = Math.max.apply(null, F.S), vmax = Math.max.apply(null, F.v), Vn = F.nl.Vmax, Kn = F.nl.Km, xs = [], ys = [], i;
        for (i = 0; i <= 120; i++) { var x = Math.max(smax, Kn * 3) * 1.1 * i / 120; xs.push(x); ys.push(M.mm(x, Vn, Kn)); }
        var lines1 = [{ x: xs, y: ys, color: "c1", label: "ajuste no lineal", labelAt: 95, dy: -4 }];
        if (!slideMode) { var yt = xs.map(function (x) { return M.mm(x, T.V, T.K); }); lines1.push({ x: xs, y: yt, color: "c7", dash: "dash", label: "verdadera", labelAt: 50, dy: 30 }); }
        c1.update({ xlim: [0, Math.max(smax, Kn * 3) * 1.1], ylim: [0, Math.max(Vn, vmax) * 1.12], lines: lines1, points: pts.map(function (p) { return { x: p[0], y: p[1], color: "c2", marker: "circle", r: 5 }; }), hlines: [{ y: Vn, label: "V_{max} (ajuste)", dash: "dot", color: "c1" }] });
        var iS = F.S.map(function (s) { return 1 / s; }), iV = F.v.map(function (x) { return 1 / x; }), xl = -1.25 / Math.max(F.lb.Km, 1e-9);
        var f2 = ln(F.lb.fit, Math.min(xl, -0.2 / Math.max(F.lb.Km, 1e-9)) , Math.max.apply(null, iS) * 1.05);
        c2.update({ xlim: [Math.min(f2.x[0], 0), Math.max.apply(null, iS) * 1.08], ylim: [Math.min(0, F.lb.fit.intercept * 1.3), Math.max.apply(null, iV) * 1.12], lines: [{ x: f2.x, y: f2.y, color: "c1", label: "recta de regresión" }], points: iS.map(function (x, k) { return { x: x, y: iV[k], color: "c2", marker: "circle", r: 5 }; }), notes: [{ x: 0, y: F.lb.fit.intercept, text: "ordenada 1/Vmax", color: "c3", anchor: "start" }] });
        var ev = F.v.map(function (x, k) { return x / F.S[k]; });
        var f3 = ln(F.eh.fit, 0, Math.max.apply(null, ev) * 1.1);
        c3.update({ xlim: [0, Math.max.apply(null, ev) * 1.12], ylim: [0, Math.max(F.eh.Vmax, vmax) * 1.12], lines: [{ x: f3.x, y: f3.y, color: "c1" }], points: ev.map(function (x, k) { return { x: x, y: F.v[k], color: "c2", marker: "circle", r: 5 }; }) });
        var hw = F.S.map(function (s, k) { return s / F.v[k]; }), f4 = ln(F.hw.fit, 0, smax * 1.1);
        c4.update({ xlim: [0, smax * 1.12], ylim: [0, Math.max.apply(null, hw.concat([F.hw.fit.intercept])) * 1.2], lines: [{ x: f4.x, y: f4.y, color: "c1" }], points: F.S.map(function (s, k) { return { x: s, y: hw[k], color: "c2", marker: "circle", r: 5 }; }) });
        var err = function (est, tru) { return slideMode ? "—" : TC.num((est / tru - 1) * 100, 2) + " %"; };
        root.querySelector("#res").innerHTML = TC.table(["Método", "Vmax (µM/min)", "Km (mM)", slideMode ? "—" : "error Vmax / Km"], [["<b>No lineal (LM)</b>", TC.num(F.nl.Vmax, 4), TC.num(F.nl.Km, 3), slideMode ? "referencia" : err(F.nl.Vmax, T.V) + " / " + err(F.nl.Km, T.K)], ["Lineweaver–Burk", TC.num(F.lb.Vmax, 4), TC.num(F.lb.Km, 3), slideMode ? "" : err(F.lb.Vmax, T.V) + " / " + err(F.lb.Km, T.K)], ["Eadie–Hofstee", TC.num(F.eh.Vmax, 4), TC.num(F.eh.Km, 3), slideMode ? "" : err(F.eh.Vmax, T.V) + " / " + err(F.eh.Km, T.K)], ["Hanes–Woolf", TC.num(F.hw.Vmax, 4), TC.num(F.hw.Km, 3), slideMode ? "" : err(F.hw.Vmax, T.V) + " / " + err(F.hw.Km, T.K)], ["«Meseta» (máx. v observada)", TC.num(F.plateau, 4), "—", slideMode ? "subestima Vmax en " + TC.num((1 - F.plateau / F.nl.Vmax) * 100, 3) + " %" : err(F.plateau, T.V)]]);
        root.querySelector("#hint").innerHTML = slideMode ? "Datos de la diap. 54 (9 puntos, [S] 0,05–0,45 mM). " + "<b>Ajuste no lineal:</b> Vmax ≈ " + TC.num(F.nl.Vmax, 3) + " µM/min, Km ≈ " + TC.num(F.nl.Km, 3) + " mM; <b>LB:</b> " + TC.num(F.lb.Vmax, 3) + " y " + TC.num(F.lb.Km, 3) + "." : "Datos simulados con ruido multiplicativo gaussiano (semilla " + T.seed + "). <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>";
        root.querySelector("#cmp").innerHTML = slideMode ? TC.doubt(10) : "";
      }
      // clic y arrastre en la gráfica directa
      var svg = root.querySelector("#c1 svg"), drag = -1;
      function near(e) { var best = -1, bd = 14, r = svg.getBoundingClientRect(); pts.forEach(function (p, i) { var q = c1.toPx(p[0], p[1]), px = r.left + q[0] * r.width / W, py = r.top + q[1] * r.height / H, d = Math.hypot(px - e.clientX, py - e.clientY); if (d < bd) { bd = d; best = i; } }); return best; }
      svg.addEventListener("pointerdown", function (e) { var i = near(e); if (i >= 0) { drag = i; svg.setPointerCapture(e.pointerId); } else { var d = c1.toData(e.clientX, e.clientY); if (d.inside && d.x > 0 && d.y > 0) { pts.push([d.x, d.y]); slideMode = false; upd(); } } });
      svg.addEventListener("pointermove", function (e) { if (drag >= 0) { var d = c1.toData(e.clientX, e.clientY); pts[drag] = [Math.max(d.x, 1e-4), Math.max(d.y, 1e-4)]; upd(); } });
      svg.addEventListener("pointerup", function () { drag = -1; });
      regen();
    },
    example: function (root) {
      var S = SLIDE.S, v = SLIDE.v, nl = M.fitMM(S, v), lb = M.fitLB(S, v);
      root.innerHTML = "<p><b>El ensayo de 10 tubos de la diapositiva 54</b> (la diapositiva no nombra la enzima ni el sustrato, por eso no hay una estructura asociada). Tubo 0 es el blanco; los tubos 1–9 dan:</p>" +
        TC.table(["Tubo", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], [["[S] (mM)", "0", "0,05", "0,10", "0,15", "0,20", "0,25", "0,30", "0,35", "0,40", "0,45"], ["v₀ (µM/min)", "0", "25", "40", "48", "55", "60", "62", "63", "64", "64"]]) +
        "<p><b>Lo que pasa al analizarlos</b> (cálculo reproducible: <code>math.js</code>, <code>fitMM</code>/<code>fitLB</code>): ajuste no lineal → V<sub>max</sub> = " + TC.num(nl.Vmax, 3) + " µM/min, K<sub>m</sub> = " + TC.num(nl.Km, 3) + " mM; Lineweaver–Burk → " + TC.num(lb.Vmax, 3) + " µM/min y " + TC.num(lb.Km, 3) + " mM; leyendo la «meseta» se obtiene ≈ 64–65. Cada método responde algo distinto: el sesgo de LB es el precio de linealizar.</p>" +
        "<p class=\"small\">En las gráficas interactivas pulsa «Cargar los datos de la diap. 54»; ahí puedes mover los puntos y ver cómo cambian los cuatro ajustes.</p>" + TC.doubt(10);
    },
    quiz: [
      { q: "En Lineweaver–Burk (1/v frente a 1/[S]), la intersección con el eje x vale…", o: ["−1/Vmax", "−1/Km", "Km/Vmax", "1/Km"], c: 1, e: "Con 1/v = 0 → 1/[S] = −1/Km (diap. 57)." },
      { make: function (r) { var V = Math.round(30 + r() * 170), K = Math.round(20 + r() * 200) / 100; return { q: "En una gráfica de Lineweaver–Burk la ordenada es " + TC.numPlain(1 / V, 3) + " (min/µM) y la pendiente " + TC.numPlain(K / V, 3) + ". Calcula Km (mM, pues [S] en mM).", ans: K, unit: "mM", tol: 0.03, abs: 0.01, e: function () { return "Km = pendiente/ordenada = " + TC.numPlain(K / V, 3) + "/" + TC.numPlain(1 / V, 3) + " = " + TC.num(K, 4) + " mM."; } }; } },
      { q: "¿Por qué Lineweaver–Burk puede sesgar la estimación de Vmax y Km?", o: ["Porque invierte los datos y da más peso a los puntos de [S] baja (1/v grande y más ruidosos)", "Porque cambia las unidades", "Porque elimina la enzima", "Porque solo vale para inhibidores"], c: 0, e: "La inversión amplifica el error en v pequeño; el ajuste no lineal evita esa distorsión." },
      { prac: true, q: "<b>Encuentra el error (duda 10, diap. 54):</b> «Vmax ≈ 65 µM/min porque ahí está la meseta».", o: ["La meseta visible subestima Vmax: el ajuste da ≈ 81 µM/min", "Es correcto", "Vmax es 25 µM/min", "Vmax debería ser 0,45"], c: 0, e: "Con [S] hasta 0,45 mM (≈ 4,5 Km) la curva aún no llega a Vmax; el ajuste no lineal da ≈ 81 µM/min." },
      { q: "En Hanes–Woolf ([S]/v frente a [S]), ¿qué da la pendiente?", o: ["Km", "1/Vmax", "−Km", "Vmax"], c: 1, e: "[S]/v = [S]/Vmax + Km/Vmax: pendiente 1/Vmax, ordenada Km/Vmax." }
    ],
    beyondTitle: "Pesos estadísticos, errores y mejores prácticas",
    beyond: function (el) {
      el.innerHTML = "<p>Las linealizaciones ponderan mal el error: en Lineweaver–Burk la varianza de 1/v es ≈ (σ/v²)², muy grande a [S] baja, así que sin pesos el ajuste está dominado por los puntos menos fiables. Eadie–Hofstee tiene error en ambos ejes (v aparece en x e y). Hanes–Woolf es en general el menos sesgado de los tres. Buenas prácticas: diseñar [S] entre ≈ 0,2 y 5 Km, medir v₀, ajustar por regresión no lineal y dar intervalos de confianza; las gráficas de dobles recíprocos sirven para <i>visualizar</i> (p. ej., el tipo de inhibición, sección 18), no para estimar.</p><p>Implementación: ajuste no lineal por Levenberg–Marquardt (<code>fitMM</code>), regresión simple para las linealizaciones (<code>linreg</code>), ambos probados con datos sin ruido (<code>math_tests.js</code>).</p>" + TC.doubt(16);
    },
    sources: "<p>Diap. 54 (datos transcritos tal cual de la figura) y diap. 57 del profe. Eadie–Hofstee y Hanes–Woolf: texto estándar de cinética enzimática. Todos los números calculados se reproducen con <code>web/js/math.js</code>; ver también <code>contenido/01_extraccion_diapositivas.md</code>. Los datos simulados son <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>.</p>"
  });
})(window.TC);
