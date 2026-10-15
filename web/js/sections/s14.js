/* S14 — Cinética clásica y velocidad inicial (diap. 49–52) */
(function (TC) {
  "use strict";
  var M = window.TCMath, FR = [0.1, 0.25, 0.5, 0.75, 1];
  TC.addSection({
    id: "s14", title: "Cinética clásica y velocidad inicial", short: "Velocidad inicial", diaps: "Diap. 49–52 (reacción reversible de 1.er orden; velocidades iniciales; v₀ = k₁[A]₀)",
    essentials: [
      "Para una reacción <b>reversible y de primer orden</b> en ambos sentidos, A ⇌ P (k₁, k₋₁), se estudia la <b>aparición del producto en el tiempo</b> a distintas concentraciones iniciales de sustrato [A]₀ (diap. 50).",
      "En cada curva [P] vs t se traza la <b>tangente en t = 0</b>: su pendiente es la <b>velocidad inicial v₀ = [dP/dt]₀</b> (diap. 50). Con las v₀ para cada [A]₀ se grafica v₀ vs [A]₀ (diap. 52).",
      "Para una reacción <b>sin catálisis</b>, v₀ = k₁[A]₀: una <b>recta</b> que pasa por el origen (diap. 52). Con una enzima, v₀ <i>deja de ser lineal</i> y se satura (sección 15).",
      "Primer orden (diap. 51a): [A] cae exponencialmente y cada <b>vida media</b> t<sub>½</sub> reduce [A] a la mitad: ½, ¼, ⅛, 1/16 de [A]₀. Se usan velocidades <b>iniciales</b> para que [S] ≈ [S]₀, la reacción inversa sea despreciable y no haya inhibición por producto ni pérdida de enzima."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Reacción:</b><span id="md"></span></div><div id="ctl"></div><div id="out" class="readout"></div><div id="legend"></div><div id="ch1"></div><div class="row" id="tools" style="margin:8px 0"></div><div id="est"></div><h3>v₀ frente a [A]₀ (diap. 52)</h3><div id="ch2"></div><h3>Vidas medias de una reacción de primer orden (diap. 51a)</h3><div id="ctl3"></div><div id="ch3"></div>';
      var mode = "unc", ctl = root.querySelector("#ctl"), showTan = true, pick = 4, drag = null, est = null;
      var sg = TC.seg([["unc", "Sin catálisis: A ⇌ P (1.er orden)"], ["enz", "Con enzima (Michaelis–Menten)"]], "unc", function (v) { mode = v; est = null; setup(); upd(); }, "tipo de reacción"); root.querySelector("#md").appendChild(sg.el);
      var s1 = TC.slider({ label: "k₁ (sin catálisis)", unit: "min⁻¹", min: 0.02, max: 2, log: true, value: 0.3, onChange: upd });
      var s2 = TC.slider({ label: "k₋₁", unit: "min⁻¹", min: 0, max: 1, step: 0.01, value: 0.05, dec: 2, onChange: upd });
      var sV = TC.slider({ label: "Vmax (enzima)", unit: "µM/min", min: 5, max: 500, log: true, value: 80, onChange: upd });
      var sK = TC.slider({ label: "Km (enzima)", unit: "µM", min: 10, max: 2000, log: true, value: 150, onChange: upd });
      var sA = TC.slider({ label: "[A]₀ máximo", unit: "µM", min: 50, max: 2000, log: true, value: 500, onChange: upd });
      var all = [s1, s2, sV, sK, sA];
      function setup() { ctl.innerHTML = ""; (mode === "unc" ? [s1, s2, sA] : [sV, sK, sA]).forEach(function (s) { ctl.appendChild(s.el); }); }
      setup();
      var ch1 = new TC.Chart(root.querySelector("#ch1"), { w: 720, h: 380, xlim: [0, 1], ylim: [0, 1], xlabel: "t (min)", ylabel: "[P] (µM)", aria: "Aparición del producto" });
      var ch2 = new TC.Chart(root.querySelector("#ch2"), { w: 720, h: 330, xlim: [0, 1], ylim: [0, 1], xlabel: "[A]_{0} (µM)", ylabel: "v_{0} (µM/min)", aria: "v0 frente a [A]0" });
      var ch3 = new TC.Chart(root.querySelector("#ch3"), { w: 720, h: 300, xlim: [0, 1], ylim: [0, 1.05], xlabel: "t", ylabel: "[A]/[A]_{0}", aria: "Decaimiento de primer orden con vidas medias" });
      var S3 = TC.slider({ label: "k (decaimiento de 1.er orden)", unit: "min⁻¹", min: 0.01, max: 5, log: true, value: 0.2, onChange: upd3 }); root.querySelector("#ctl3").appendChild(S3.el);
      var tools = root.querySelector("#tools");
      var sel = TC.select(FR.map(function (f, i) { return [String(i), "curva " + (i + 1) + " ([A]₀ = " + TC.numPlain(f, 2) + "·máx.)"]; }), "4", function (v) { pick = +v; est = null; upd(); }); tools.appendChild(TC.h("<b>Curva a medir con tu tangente:</b>")); tools.appendChild(sel);
      var bt = TC.button("Tangentes exactas: sí", function () { showTan = !showTan; bt.textContent = "Tangentes exactas: " + (showTan ? "sí" : "no"); upd(); }, "small"); tools.appendChild(bt);
      var model = {};
      function curves() {
        var A0 = FR.map(function (f) { return f * sA.get(); }), P = {}, tmax, ts = [], i, k;
        if (mode === "unc") { var k1 = s1.get(), km1 = s2.get(), kk = k1 + km1; tmax = 3 / kk; }
        else { var V = sV.get(), Km = sK.get(); tmax = 1.6 * A0[A0.length - 1] * (Km + A0[A0.length - 1]) / (V * A0[A0.length - 1]); }
        for (i = 0; i <= 120; i++) ts.push(tmax * i / 120);
        var curves_ = A0.map(function (a0) {
          if (mode === "unc") { var k1 = s1.get(), km1 = s2.get(), kk = k1 + km1, peq = a0 * k1 / kk; return { a0: a0, y: ts.map(function (t) { return peq * (1 - Math.exp(-kk * t)); }), v0: k1 * a0 }; }
          var V = sV.get(), Km = sK.get(), r = M.integrate(function (t, y) { return [-V * y[0] / (Km + y[0])]; }, [a0], ts);
          return { a0: a0, y: r.map(function (z) { return a0 - z[0]; }), v0: V * a0 / (Km + a0) };
        });
        return { ts: ts, tmax: tmax, A0: A0, C: curves_ };
      }
      function upd() {
        var d = curves(), top = 0; d.C.forEach(function (c) { top = Math.max(top, c.y[c.y.length - 1]); });
        var ymax = Math.max(top, d.C[d.C.length - 1].v0 * d.tmax * 0.55) * 1.05; ymax = Math.min(ymax, d.A0[d.A0.length - 1] * 1.05);
        model = { d: d, ymax: ymax, tmax: d.tmax };
        var lines = d.C.map(function (c, i) { return { x: d.ts, y: c.y, color: "c" + (i < 5 ? [1, 3, 5, 2, 4][i] : 1), width: i === pick ? 3.4 : 2, dash: i === pick ? "" : "", label: "[A]₀ = " + TC.numPlain(c.a0, 3), labelAt: 120, dy: 4 }; });
        if (showTan) d.C.forEach(function (c, i) { lines.push({ x: [0, d.tmax], y: [0, c.v0 * d.tmax], color: "c7", dash: "dash", width: 1.4 }); });
        if (est != null) lines.push({ x: [0, d.tmax], y: [0, est * d.tmax], color: "c4", width: 3, dash: "dot", label: "tu tangente" });
        ch1.update({ xlim: [0, d.tmax], ylim: [0, ymax], lines: lines, points: [{ x: 0, y: 0, color: "c2", marker: "square", r: 4.5 }] });
        var c = d.C[pick], estTxt = est == null ? "Arrastra sobre la gráfica (desde el origen) para fijar la pendiente de tu tangente en t = 0 y compárala." : "Tu v₀ = <b>" + TC.num(est, 3) + "</b> µM/min; v₀ exacta = <b>" + TC.num(c.v0, 3) + "</b> µM/min; error = <b>" + TC.num(Math.abs(est / c.v0 - 1) * 100, 2) + " %</b>.";
        root.querySelector("#est").innerHTML = '<p class="small">' + estTxt + "</p>";
        root.querySelector("#out").innerHTML = mode === "unc" ? TC.stat("v₀ = k₁[A]₀ (curva elegida)", TC.num(c.v0, 3), "µM/min") + TC.stat("[P] en el equilibrio (curva elegida)", TC.num(c.a0 * s1.get() / (s1.get() + s2.get()), 3), "µM") + TC.stat("t½ hacia el equilibrio = ln 2/(k₁ + k₋₁)", TC.num(Math.LN2 / (s1.get() + s2.get()), 3), "min") :
          TC.stat("v₀ = Vmax[A]₀/(Km + [A]₀) (curva elegida)", TC.num(c.v0, 3), "µM/min") + TC.stat("Fracción de Vmax", TC.num(c.v0 / sV.get() * 100, 3), "%") + TC.stat("Régimen", c.a0 < 0.2 * sK.get() ? "≈ 1.er orden" : c.a0 > 5 * sK.get() ? "≈ orden cero" : "mixto", "");
        // gráfica v0 vs A0
        var A0max = d.A0[d.A0.length - 1], xs = [], ys = [], i2;
        for (i2 = 0; i2 <= 60; i2++) { var a = A0max * 1.1 * i2 / 60; xs.push(a); ys.push(mode === "unc" ? s1.get() * a : sV.get() * a / (sK.get() + a)); }
        var pts = d.C.map(function (cc) { return { x: cc.a0, y: cc.v0, color: "c1", marker: "circle", r: 5 }; });
        if (est != null) pts.push({ x: c.a0, y: est, color: "c4", marker: "cross", r: 6, label: "tu estimación", dx: 10 });
        ch2.update({ xlim: [0, A0max * 1.1], ylim: [0, Math.max(ys[ys.length - 1], d.C[4].v0) * 1.12], lines: [{ x: xs, y: ys, color: "c7", dash: "dash", label: mode === "unc" ? "v_{0} = k_{1}[A]_{0}: recta" : "hipérbola: se satura" }], points: pts });
      }
      function upd3() {
        var k = S3.get(), th = Math.LN2 / k, tmax = 4.6 * th, xs = [], ys = [], i, marks = [];
        for (i = 0; i <= 120; i++) { xs.push(tmax * i / 120); ys.push(Math.exp(-k * tmax * i / 120)); }
        for (i = 1; i <= 4; i++) marks.push({ x: i * th, y: Math.pow(0.5, i), color: "c2", marker: "circle", r: 5, label: i + "t_{½}: " + ["½", "¼", "⅛", "1/16"][i - 1] + " [A]_{0}", dx: 8, dy: -8 });
        ch3.update({ xlim: [0, tmax], ylim: [0, 1.05], lines: [{ x: xs, y: ys, color: "c1" }], points: marks, hlines: [{ y: 0.5, dash: "dot" }, { y: 0.25, dash: "dot" }, { y: 0.125, dash: "dot" }], notes: [{ x: tmax * 0.55, y: 0.92, text: "t_{½} = ln 2/k = " + TC.numPlain(th, 3) + " min", color: "c7" }] });
      }
      // arrastrar la tangente
      var svg = root.querySelector("#ch1 svg");
      function move(e) { var p = ch1.toData(e.clientX, e.clientY); if (p.x > model.tmax * 0.02) { est = Math.max(0, p.y / p.x); upd(); } }
      svg.addEventListener("pointerdown", function (e) { drag = true; svg.setPointerCapture(e.pointerId); move(e); }); svg.addEventListener("pointermove", function (e) { if (drag) move(e); }); svg.addEventListener("pointerup", function () { drag = false; });
      upd(); upd3();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Un ensayo real mide aparición de producto en el tiempo.</b> En las deshidrogenasas, por ejemplo, se sigue la aparición de NADH (en la práctica, por su absorbancia) <span class=\"unverified\">[no verificado]</span> en esta sesión, y la pendiente inicial es v₀. Aquí, la LDH-A humana con NADH unido (1I10): el producto que se «cuenta» en un ensayo de este tipo es el NADH.</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "1I10", focus: [{ chain: "A", resi: 192, label: "His192", atom: "NE2" }], ligands: [{ resn: "NAI", label: "NADH", color: "purpleCarbon" }, { resn: "OXM", label: "oxamato" }], distances: ["nadh_c4_oxm_c1"] });
      root.appendChild(TC.h("<p class=\"small\">Los datos reales de un ensayo de velocidades iniciales (los 10 tubos de la diap. 54) están en las secciones 15 y 16.</p>"));
    },
    quiz: [
      { q: "¿Por qué se mide la velocidad <i>inicial</i>?", o: ["Porque la reacción es más rápida al principio y se mide mejor", "Para que [S] ≈ [S]₀ y se desprecien la reacción inversa, la inhibición por producto y la inactivación de la enzima", "Porque la velocidad inicial es siempre Vmax", "Porque el producto se acumula"], c: 1, e: "Con t → 0, [S] ≈ [S]₀ y [P] ≈ 0: se evitan los efectos que complican la curva." },
      { make: function (r) { var k = Math.round((0.02 + r() * 0.3) * 100) / 100, a = Math.round(2 + r() * 8) * 100; return { q: "Reacción sin catálisis con k₁ = " + k + " min⁻¹ y [A]₀ = " + a + " µM. Calcula v₀ (µM/min).", ans: k * a, unit: "µM/min", tol: 0.01, abs: 0.05, e: function () { return "v₀ = k₁[A]₀ = " + k + " × " + a + " = " + TC.num(k * a, 4) + " µM/min."; } }; } },
      { make: function (r) { var k = Math.round((0.05 + r() * 0.5) * 100) / 100; return { q: "Para un decaimiento de primer orden con k = " + k + " min⁻¹, ¿cuánto vale la vida media (min)?", ans: Math.LN2 / k, unit: "min", tol: 0.02, abs: 0.02, e: function () { return "t½ = ln 2 / k = 0,693/" + k + " = " + TC.num(Math.LN2 / k, 4) + " min; tras 3 t½ queda 1/8 de [A]₀."; } }; } }
    ],
    beyondTitle: "Integrales de velocidad y orden de reacción",
    beyond: function (el) {
      el.innerHTML = "<p>Para A → P de primer orden, ln[A] = ln[A]₀ − kt (una recta con pendiente −k); de ahí t<sub>½</sub> = ln 2/k, independiente de [A]₀. Para A ⇌ P, [P](t) = [P]<sub>eq</sub>(1 − e<sup>−(k₁+k₋₁)t</sup>), con [P]<sub>eq</sub> = [A]₀k₁/(k₁+k₋₁); la tangente en t = 0 es k₁[A]₀. En la regresión de velocidades iniciales, la pendiente de la recta v₀ vs [A]₀ es la constante de velocidad de la reacción no catalizada (k₁).</p>";
    },
    sources: "<p>Diap. 49–52 del profe (redibujadas; la 51 es una figura de un texto). Modelo A ⇌ P resuelto analíticamente; el modelo enzimático se integra con Dormand–Prince RK45 (<code>math.js</code>). Parámetros: <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>. Estructura 1I10: Read <i>et al.</i> 2001 " + TC.badge("verificado") + ".</p>"
  });
})(window.TC);
