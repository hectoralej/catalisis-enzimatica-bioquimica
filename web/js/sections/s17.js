/* S17 — Factores que afectan la actividad: pH, temperatura y desnaturalización (diap. 58–59) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  TC.addSection({
    id: "s17", title: "pH, temperatura y desnaturalización", short: "pH y temperatura", diaps: "Diap. 58–59 (factores que influyen en la cinética; pardeamiento del aguacate)",
    essentials: [
      "Los factores que afectan la cinética son (diap. 58): los que <b>desnaturalizan proteínas</b> — <b>pH</b> (concepto de <i>pH óptimo</i>), <b>temperatura</b> (<i>temperatura óptima</i>) y <b>sustancias químicas</b> — y los <b>inhibidores</b> (secciones 18–19).",
      "Temperatura: una reacción no enzimática acelera sin límite al calentar; una enzima acelera hasta un óptimo y luego <b>pierde actividad por desnaturalización</b> (diap. 58, gráfica temperatura).",
      "pH: cada enzima tiene un pH óptimo (diap. 58: amilasa salival, pepsina y arginasa con óptimos distintos). El perfil en forma de campana refleja el estado de ionización de grupos del sitio activo y la estabilidad de la proteína.",
      "Caso del <b>pardeamiento del aguacate</b> (diap. 59): la polifenol oxidasa convierte el catecol (un polifenol) en <b>1,2-benzoquinona</b> con O₂; las quinonas polimerizan y forman melaninas pardas. Limón/lima o enfriar retrasan el proceso porque inhiben la enzima; tapar bloquea el O₂."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">A · Perfil de pH (dos grupos ionizables)</h3><p class="small">Modelo didáctico: $v\\propto 1/(1+[H^+]/K_{a1}+K_{a2}/[H^+])$ (activa solo la forma con el 1.er grupo desprotonado y el 2.º protonado).</p><div id="ctlA"></div><div id="outA" class="readout"></div><div id="chA"></div>' +
        '<h3>B · Perfil de temperatura: aceleración + desnaturalización</h3><div id="ctlB"></div><div id="outB" class="readout"></div><div id="chB"></div>';
      TC.renderMath(root);
      /* A */
      var p1 = TC.slider({ label: "pK<sub>a1</sub> (grupo ácido)", unit: "", min: 1, max: 9, step: 0.05, value: 5.0, dec: 2, onChange: updA });
      var p2 = TC.slider({ label: "pK<sub>a2</sub> (grupo básico)", unit: "", min: 3, max: 13, step: 0.05, value: 8.0, dec: 2, onChange: updA });
      var ph = TC.slider({ label: "pH del medio", unit: "", min: 0, max: 14, step: 0.05, value: 7, dec: 2, onChange: updA });
      var cA = root.querySelector("#ctlA"); [p1, p2, ph].forEach(function (s) { cA.appendChild(s.el); });
      var showQ = false, bq = TC.button("Superponer esquema cualitativo de la diap. 58 (amilasa, pepsina, arginasa)", function () { showQ = !showQ; bq.setAttribute("aria-pressed", showQ); updA(); }, "small"); bq.setAttribute("aria-pressed", "false"); cA.appendChild(bq);
      var chA = new TC.Chart(root.querySelector("#chA"), { w: 720, h: 330, xlim: [0, 14], ylim: [0, 1.05], xlabel: "pH", ylabel: "actividad relativa", aria: "Actividad frente a pH" });
      function updA() {
        var a = Math.min(p1.get(), p2.get()), b = Math.max(p1.get(), p2.get()), x = [], y = [], i, mx = 0;
        for (i = 0; i <= 280; i++) { var pH = i / 20; x.push(pH); y.push(M.phActivity(pH, a, b)); if (y[i] > mx) mx = y[i]; }
        var yn = y.map(function (v) { return v / mx; }), cur = M.phActivity(ph.get(), a, b) / mx;
        var lines = [{ x: x, y: yn, color: "c1", width: 3, label: "su enzima" }];
        if (showQ) [["amilasa salival", 5.5, 8.0, "c3"], ["pepsina", 0.8, 3.0, "c5"], ["arginasa", 7.0, 12.0, "c4"]].forEach(function (q) { var yy = x.map(function (pH) { return M.phActivity(pH, q[1], q[2]); }), m = Math.max.apply(null, yy); lines.push({ x: x, y: yy.map(function (v) { return v / m; }), color: q[3], dash: "dash", width: 2, label: q[0] }); });
        chA.update({ lines: lines, points: [{ x: ph.get(), y: cur, color: "c2", marker: "circle", r: 6, label: "actividad " + TC.numPlain(cur * 100, 3) + " %", anchor: "start", dy: -12 }], vlines: [{ x: (a + b) / 2, label: "pH óptimo = (pKa₁+pKa₂)/2", color: "c5" }] });
        root.querySelector("#outA").innerHTML = TC.stat("pH óptimo", TC.num((a + b) / 2, 3), "") + TC.stat("Actividad relativa en el pH elegido", TC.num(cur * 100, 3), "% del máximo") + (showQ ? '<div class="stat"><div class="k">Aviso</div><div class="v" style="font-size:.95rem">Curvas cualitativas con óptimos de la literatura: amilasa salival ≈ 6,8, pepsina ≈ 1,5–2 y arginasa ≈ 9,4–9,5 <span class="verified">[verificado en fuentes secundarias]</span></div></div>' : "");
      }
      updA();
      /* B */
      var q = { dH: 60, dS: -40, Tm: 323.15, dHu: 400 };
      var sH = TC.slider({ label: "ΔH‡ de la reacción", unit: "kJ/mol", min: 20, max: 120, step: 0.5, value: 60, dec: 1, onChange: function (v) { q.dH = v; updB(); } });
      var sS = TC.slider({ label: "ΔS‡", unit: "J/(mol·K)", min: -150, max: 50, step: 0.5, value: -40, dec: 1, onChange: function (v) { q.dS = v; updB(); } });
      var sT = TC.slider({ label: "T<sub>m</sub> (50 % desnaturalizada)", unit: "°C", min: 30, max: 100, step: 0.5, value: 50, dec: 1, onChange: function (v) { q.Tm = v + 273.15; updB(); } });
      var sU = TC.slider({ label: "ΔH de desnaturalización", unit: "kJ/mol", min: 100, max: 800, step: 5, value: 400, dec: 0, onChange: function (v) { q.dHu = v; updB(); } });
      var cB = root.querySelector("#ctlB"); [sH, sS, sT, sU].forEach(function (s) { cB.appendChild(s.el); });
      var chB = new TC.Chart(root.querySelector("#chB"), { w: 720, h: 360, xlim: [0, 90], ylim: [0, 1.05], xlabel: "Temperatura (°C)", ylabel: "velocidad relativa", aria: "Actividad frente a temperatura" });
      function updB() {
        var xs = [], hot = [], fN = [], act = [], i, mx = 0, mxno = 0, no = [];
        for (i = 0; i <= 180; i++) { var C = i * 0.5, T = C + 273.15, r = M.tempActivity(T, { dHdd: q.dH, dSdd: q.dS, Tm: q.Tm, dHu: q.dHu }); xs.push(C); hot.push(r.k); fN.push(r.fN); act.push(r.v); mx = Math.max(mx, r.v); }
        var kmax = Math.max.apply(null, hot), iop = act.indexOf(mx), q10 = M.tempActivity(308.15, { dHdd: q.dH, dSdd: q.dS, Tm: q.Tm, dHu: q.dHu }).k / M.tempActivity(298.15, { dHdd: q.dH, dSdd: q.dS, Tm: q.Tm, dHu: q.dHu }).k;
        chB.update({ lines: [{ x: xs, y: hot.map(function (v) { return v / kmax; }), color: "c7", dash: "dash", label: "reacción sin desnaturalización (Eyring)" }, { x: xs, y: fN, color: "c3", dash: "dot", label: "fracción nativa" }, { x: xs, y: act.map(function (v) { return v / mx; }), color: "c1", width: 3, label: "enzima real = producto" }], vlines: [{ x: xs[iop], label: "T óptima ≈ " + TC.numPlain(xs[iop], 3) + " °C", color: "c5" }, { x: q.Tm - 273.15, label: "T_{m}", color: "c3", dy: 14 }] });
        root.querySelector("#outB").innerHTML = TC.stat("Temperatura óptima", TC.num(xs[iop], 3), "°C") + TC.stat("Q₁₀ (25 → 35 °C, sin desnaturalización)", TC.num(q10, 3), "×") + TC.stat("T<sub>m</sub>", TC.num(q.Tm - 273.15, 3), "°C") + '<div class="stat"><div class="k">Modelo</div><div class="v" style="font-size:.95rem"><span class="illustr">modelo didáctico, valores ilustrativos</span></div></div>';
      }
      updB();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Pardeamiento del aguacate (diap. 59).</b> El esquema de la infografía de <i>Compound Interest</i> (2014): catecol (un polifenol) → 1,2-benzoquinona por la <b>polifenol oxidasa</b> con O₂; las quinonas reaccionan entre sí y forman melaninas. Estructuras 2D desde SMILES contrastados (se resaltan los dos O–H por SMARTS):</p>" +
        TC.rxn(["mol:catecol|170", { arrow: { top: "polifenol oxidasa (Cu)", bottom: "O₂", dir: "→" } }, "mol:benzoquinona|170"]) +
        "<p><b>La enzima real, con una advertencia:</b> el archivo 1BT3 es la <b>catecol oxidasa de camote</b> (<i>Ipomoea batatas</i>), no la del aguacate; es un modelo de polifenol oxidasa con un centro de dos cobres. Distancias medidas: Cu–His88 2,17 Å, Cu–His240 2,08 Å.</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "1BT3", focus: [{ chain: "A", resi: 88, label: "His88", atom: "NE2" }, { chain: "A", resi: 109, label: "His109", atom: "NE2" }, { chain: "A", resi: 118, label: "His118", atom: "NE2" }, { chain: "A", resi: 240, label: "His240", atom: "NE2" }, { chain: "A", resi: 244, label: "His244", atom: "NE2" }, { chain: "A", resi: 274, label: "His274", atom: "NE2" }], ligands: [{ resn: "C2O", label: "Cu–Cu", color: "orangeCarbon" }], distances: ["cu_his88", "cu_his240"], ligandToggle: "Mostrar centro de Cu" });
      root.appendChild(TC.h('<div id="av"></div>'));
      var av = root.querySelector("#av");
      av.innerHTML = '<h3>¿Por qué el limón y el frío retrasan el pardeamiento?</h3><p class="small">La infografía afirma que el jugo de limón o lima y enfriar el aguacate retrasan el pardeamiento porque inhiben la actividad de la polifenol oxidasa (y que tapar con film bloquea el O₂). Aquí, un modelo cualitativo con parámetros ilustrativos (<span class="illustr">modelo didáctico, valores ilustrativos</span>): pH óptimo ≈ 6,5 y T óptima ≈ 35 °C asumidos.</p><div id="ctl"></div><div id="out" class="readout"></div>';
      var sp = TC.slider({ label: "pH de la pulpa", unit: "", min: 2, max: 8, step: 0.05, value: 6.5, dec: 2, onChange: u }), st = TC.slider({ label: "Temperatura", unit: "°C", min: 0, max: 45, step: 0.5, value: 25, dec: 1, onChange: u });
      av.querySelector("#ctl").appendChild(sp.el); av.querySelector("#ctl").appendChild(st.el);
      function rate(pH, C) { var a = M.phActivity(pH, 4.8, 8.2), a0 = M.phActivity(6.5, 4.8, 8.2), t = M.tempActivity(C + 273.15, { dHdd: 60, dSdd: -40, Tm: 333.15, dHu: 400 }).v, t0 = M.tempActivity(298.15, { dHdd: 60, dSdd: -40, Tm: 333.15, dHu: 400 }).v; return a / a0 * t / t0; }
      function u() { var r = rate(sp.get(), st.get()); av.querySelector("#out").innerHTML = TC.stat("Velocidad relativa de pardeamiento (control: pH 6,5 y 25 °C = 100 %)", TC.num(r * 100, 3), "%", r < 0.5 ? "neg" : "") + TC.stat("Retraso esperado (1/velocidad)", r > 0.001 ? TC.num(1 / r, 3) + " ×" : "enorme", ""); }
      u();
      root.appendChild(TC.h("<div>" + TC.doubt(12) + "</div>"));
    },
    quiz: [
      { make: function (r) { var a = Math.round((2 + r() * 3) * 10) / 10, b = Math.round((6 + r() * 4) * 10) / 10; return { q: "Una enzima con dos grupos ionizables de pK<sub>a</sub> = " + a + " y " + b + " sigue el modelo de campana. ¿Cuál es su pH óptimo?", ans: (a + b) / 2, unit: "", tol: 0.01, abs: 0.05, e: function () { return "pH óptimo = (pKa₁ + pKa₂)/2 = (" + a + " + " + b + ")/2 = " + TC.num((a + b) / 2, 4) + "."; } }; } },
      { q: "Por encima de la temperatura óptima, la actividad enzimática cae porque…", o: ["La reacción se vuelve endergónica", "La proteína se desnaturaliza (pierde su estructura nativa)", "El sustrato desaparece", "Km se hace cero"], c: 1, e: "Diap. 58: los factores que desnaturalizan proteínas (pH, T, sustancias químicas) reducen la actividad; una reacción no enzimática no tiene ese límite." },
      { q: "En la infografía del aguacate, ¿qué hace la polifenol oxidasa?", o: ["Reduce quinonas a fenoles", "Convierte catecol (polifenol) en 1,2-benzoquinona usando O₂", "Hidroliza lípidos", "Fija nitrógeno"], c: 1, e: "Diap. 59: catecol → 1,2-benzoquinona; las quinonas forman polímeros pardos (melaninas)." },
      { prac: true, q: "<b>Encuentra el error posible (duda 12, diap. 58):</b> si uno cita pH óptimos numéricos de la figura (amilasa 7, pepsina 2, arginasa 10)…", o: ["Hace falta una fuente: las curvas de la diapositiva son cualitativas", "Son datos de la diapositiva", "Siempre son exactos", "Dependen solo de T"], c: 0, e: "Las curvas son cualitativas; cualquier valor numérico debe llevar fuente. Las fuentes consultadas dan: amilasa salival ≈ 6–7 (≈ 6,8), pepsina ≈ 1,5–2 y arginasa ≈ 9,2–9,5 (no 10)." }
    ],
    beyondTitle: "Modelo de dos estados y por qué hay una temperatura óptima",
    beyond: function (el) {
      el.innerHTML = "<p>En el modelo del perfil de temperatura, la velocidad es v = k(T)·f<sub>nativa</sub>(T): k(T) crece según Eyring (ΔH‡, ΔS‡) y la fracción nativa cae como una sigmoide con T<sub>m</sub> y ΔH de desnaturalización; el máximo del producto es la «temperatura óptima». La T óptima <i>no</i> es una constante de la enzima: depende del tiempo de ensayo (una enzima puede desnaturalizarse lentamente). El Q₁₀ (cociente de velocidades para +10 °C) suele valer 2–3 para reacciones químicas con ΔH‡ de 50–80 kJ/mol; aquí se calcula con tus parámetros.</p>" + TC.doubt(12);
    },
    sources: "<p>Diap. 58–59 del profe; la diap. 59 reproduce una infografía de <i>Compound Interest</i> (2014, CC BY-NC-ND), que no se copia: se redibuja con SMILES contrastados. 1BT3: Klabunde <i>et al.</i> 1998, Nat Struct Biol 5:1084 (doi:10.1038/4193) " + TC.badge("verificado") + " (enzima de camote). Los perfiles de pH y T son <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>; los pH óptimos de amilasa salival, pepsina y arginasa <span class=\"unverified\">[no verificado]</span>.</p>"
  });
})(window.TC);
