/* S2 — Termodinámica esencial y energía libre de Gibbs (diap. 4–8) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  var PRESETS = {
    hielo: { name: "Fusión del hielo (diap. 16–17)", dH: 6.01, dS: 22.0, T: 298.15, note: "H₂O(s) → H₂O(l): ΔH>0 y ΔS>0 → espontánea por encima de ≈ 273 K (a 0 °C: equilibrio, ΔG = 0; a 25 °C el hielo se funde: proceso irreversible). ΔH<sub>fus</sub> = 6,01 kJ/mol y ΔS<sub>fus</sub> = 22,0 J/(mol·K) a 273,15 K: página de datos del agua (Wikipedia, tabulación tipo CRC) <span class=\"verified\">[verificado: fuente secundaria]</span>; coherentes entre sí: 6010/22,0 = 273,2 K." },
    h2o2: { name: "Descomposición del H₂O₂ (diap. 12–14)", dH: -196.0, dS: 126.0, T: 298.15, note: "2 H₂O₂(l) → 2 H₂O(l) + O₂(g), ecuación <b>tal como está escrita</b>. ΔH° = −196,0 kJ es el valor del profe (diap. 14) y coincide con 2·ΔfH°(H₂O, l) − 2·ΔfH°(H₂O₂, l) = 2(−285,83) − 2(−187,80) = −196,06 kJ <span class=\"verified\">[verificado: NIST para el agua; H₂O₂ de una ficha de datos tipo CRC, fuente secundaria]</span>. ΔS° = +126,0 J/K se <b>deduce de los números del profe</b> con ΔS = (ΔH − ΔG)/T, usando ΔG° = 2·(−116,78) = −233,56 kJ por la ecuación escrita: es positiva porque se libera O₂ gas. Si −116,78 fuera por la ecuación escrita, saldría ΔS = −265,7 J/K, absurdo con un gas liberado. Ver la duda 1." },
    atp: { name: "Hidrólisis del ATP", dH: -20.0, dS: 34.0, T: 310.15, note: "ATP + H₂O → ADP + Pᵢ. <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>: ΔH ≈ −20 kJ/mol y ΔS ≈ +34 J/(mol·K) dan ΔG ≈ −30,5 kJ/mol, el valor que cita el profe (diap. 33). Los componentes reales dependen de pH, Mg²⁺ y fuerza iónica." }
  };
  function quadrantSvg(dH, dS) {
    var w = 300, h = 250, ox = 150, oy = 125, sx = 150 / 250, sy = 125 / 300;
    var px = TC.clamp(ox + dH * sx, 8, w - 8), py = TC.clamp(oy - dS * sy, 8, h - 8);
    return '<svg viewBox="0 0 300 250" class="chart" role="img" aria-label="Cuadrantes de ΔH y ΔS">' +
      '<rect x="0" y="0" width="150" height="125" fill="var(--good-soft)"/><rect x="150" y="0" width="150" height="125" fill="var(--warn-soft)"/><rect x="0" y="125" width="150" height="125" fill="var(--warn-soft)"/><rect x="150" y="125" width="150" height="125" fill="var(--bad-soft)"/>' +
      '<g class="axis"><line x1="0" x2="300" y1="125" y2="125"/><line x1="150" x2="150" y1="0" y2="250"/></g>' +
      '<text x="8" y="22" font-size="12" font-weight="700">ΔH&lt;0, ΔS&gt;0</text><text x="8" y="38" font-size="11.5">espontánea a toda T</text>' +
      '<text x="292" y="22" font-size="12" font-weight="700" text-anchor="end">ΔH&gt;0, ΔS&gt;0</text><text x="292" y="38" font-size="11.5" text-anchor="end">espontánea a T alta</text>' +
      '<text x="8" y="222" font-size="12" font-weight="700">ΔH&lt;0, ΔS&lt;0</text><text x="8" y="238" font-size="11.5">espontánea a T baja</text>' +
      '<text x="292" y="222" font-size="12" font-weight="700" text-anchor="end">ΔH&gt;0, ΔS&lt;0</text><text x="292" y="238" font-size="11.5" text-anchor="end">no espontánea nunca</text>' +
      '<text x="296" y="119" font-size="11" text-anchor="end" fill="var(--muted)">ΔH (kJ/mol) →</text><text x="154" y="12" font-size="11" fill="var(--muted)">↑ ΔS (J/mol·K)</text>' +
      '<circle cx="' + px + '" cy="' + py + '" r="8" fill="var(--c1)" stroke="var(--surface)" stroke-width="2"/><circle cx="' + px + '" cy="' + py + '" r="3" fill="var(--surface)"/></svg>';
  }
  TC.addSection({
    id: "s02", title: "Termodinámica esencial y energía libre de Gibbs", short: "Termodinámica y Gibbs", diaps: "Diap. 4–8 (leyes de la termodinámica; función y signo de ΔrG)",
    essentials: [
      "La termodinámica estudia los intercambios de energía para decidir si un proceso es <b>espontáneo o no</b> (y en qué dirección). <b>Ley cero:</b> definición de temperatura; <b>primera:</b> conservación de la energía; <b>segunda:</b> la entropía del universo tiende a aumentar; <b>tercera:</b> a 0 K la entropía tiende a un mínimo constante (diap. 4–6).",
      "En una reacción hay tres cantidades: entalpía ΔH, entropía ΔS y energía libre ΔG, ligadas por la <b>función de Gibbs</b>: $\\Delta_r G=\\Delta_r H-T\\,\\Delta_r S$ a T y P constantes (diap. 7).",
      "Signo de ΔrG (diap. 8): <b>ΔrG = 0</b> equilibrio; <b>ΔrG &gt; 0</b> no espontánea (no ocurre sin aportar energía); <b>ΔrG &lt; 0</b> espontánea (libera energía libre).",
      "ΔG depende de <i>dos</i> contribuciones: la entalpía (ΔH) y el término entrópico (TΔS). Por eso un proceso endotérmico puede ser espontáneo si aumenta bastante la entropía (el hielo que se funde)."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row" id="pre" style="margin-bottom:6px"><b>Casos:</b></div><div class="grid2"><div id="ctl"></div><div id="quad"></div></div><div id="out" class="readout"></div><div id="note"></div><div id="ch"></div>';
      var ctl = root.querySelector("#ctl"), quad = root.querySelector("#quad"), out = root.querySelector("#out"), note = root.querySelector("#note");
      var sH = TC.slider({ label: "ΔH", unit: "kJ/mol", min: -300, max: 300, step: 0.1, value: 6.01, dec: 2, onChange: upd });
      var sS = TC.slider({ label: "ΔS", unit: "J/(mol·K)", min: -300, max: 300, step: 0.1, value: 22, dec: 1, onChange: upd });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 150, max: 450, step: 0.05, value: 298.15, dec: 2, onChange: upd });
      [sH, sS, sT].forEach(function (s) { ctl.appendChild(s.el); });
      var cw = root.querySelector("#ch"), ch = new TC.Chart(cw, { xlim: [150, 450], ylim: [-100, 100], xlabel: "Temperatura T (K)", ylabel: "ΔG (kJ/mol)", aria: "ΔG frente a T" });
      var pre = root.querySelector("#pre");
      Object.keys(PRESETS).forEach(function (k) {
        pre.appendChild(TC.button(PRESETS[k].name, function () { var p = PRESETS[k]; sH.set(p.dH, true); sS.set(p.dS, true); sT.set(p.T, true); note.innerHTML = TC.callout("note", "Caso: " + p.name, "<p>" + p.note + "</p>") + (k === "h2o2" ? TC.doubt(1) : ""); TC.renderMath(note); upd(); }, "small"));
      });
      function upd() {
        var dH = sH.get(), dS = sS.get(), T = sT.get(), dG = M.gibbs(dH, dS, T), q = M.quadrant(dH, dS), Tc = M.crossT(dH, dS);
        var cls = Math.abs(dG) < 0.05 ? "zero" : dG < 0 ? "neg" : "pos";
        out.innerHTML = TC.stat("ΔG = ΔH − TΔS", TC.num(dG, 3), "kJ/mol", cls) + TC.stat("Signo", M.signLabel(dG), "") + TC.stat("TΔS", TC.num(T * dS / 1000, 3), "kJ/mol") +
          TC.stat("T de cruce (ΔG = 0)", isFinite(Tc) && Tc > 0 ? TC.num(Tc, 4) : "no existe", isFinite(Tc) && Tc > 0 ? "K" : "");
        quad.innerHTML = quadrantSvg(dH, dS) + '<div class="small" style="margin-top:4px"><b>' + q.q + ":</b> " + q.txt + "</div>";
        var xs = [], ys = []; for (var t = 150; t <= 450; t += 3) { xs.push(t); ys.push(M.gibbs(dH, dS, t)); }
        var vl = (isFinite(Tc) && Tc > 150 && Tc < 450) ? [{ x: Tc, label: "T = ΔH/ΔS = " + TC.numPlain(Tc, 4) + " K", color: "c5" }] : [];
        var L = Math.max(10, Math.ceil(1.25 * Math.max.apply(null, ys.map(Math.abs).concat([Math.abs(dG)])) / 10) * 10);
        ch.update({ ylim: [-L, L], lines: [{ x: xs, y: ys, color: "c1", label: "ΔG(T)" }], points: [{ x: T, y: TC.clamp(dG, -L, L), color: "c2", marker: "circle", label: "ΔG = " + TC.numPlain(dG, 3), anchor: "start", dy: -10 }], hlines: [{ y: 0, label: "ΔG = 0: equilibrio", dash: "dash" }], vlines: vl, areas: [{ x: xs, y: ys.map(function (v) { return Math.min(v, 0); }), y0: ys.map(function () { return 0; }), color: "c3", opacity: 0.2 }], notes: [{ x: 160, y: -L * 0.88, text: "zona sombreada: espontánea (ΔG < 0)", color: "c3" }] });
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Hielo y agua (diap. 16–17).</b> A 0 °C el hielo coexiste con el agua líquida: es un proceso <i>reversible</i> con ΔG = 0 (equilibrio, «un estado de baja energía que confiere estabilidad»). A 25 °C el hielo está por encima de su punto de fusión: se funde espontáneamente (proceso <i>irreversible</i>, con ganancia de entropía). En la gráfica de arriba carga el caso «hielo» y mueve T: cruza ΔG = 0 en ≈ 273 K.</p>" +
        "<p><b>Reacción biológica con una molécula real.</b> La descomposición del peróxido de hidrógeno, que ahora se redibuja a partir de un SMILES contrastado:</p>" +
        TC.rxn(["mol:h2o2", "txt:2", "mol:h2o2", { arrow: { top: "catalasa / Fe³⁺ / sin catalizar", bottom: "ΔH° = −196,0 kJ (profe)", dir: "→" } }, "txt:2 H₂O + O₂"]) +
        TC.doubt(1);
    },
    quiz: [
      { q: "Un proceso tiene ΔH &gt; 0 y ΔS &gt; 0. ¿Cuándo es espontáneo?", o: ["Siempre", "Nunca", "A temperatura alta (T &gt; ΔH/ΔS)", "A temperatura baja"], c: 2, e: "ΔG = ΔH − TΔS se vuelve negativa cuando TΔS supera a ΔH, es decir, para T &gt; ΔH/ΔS." },
      { q: "Si ΔrG = 0, la reacción…", o: ["Está en el equilibrio", "No es espontánea", "Es muy rápida", "Libera energía libre"], c: 0, e: "Diap. 8: ΔrG = 0 → equilibrio (hielo a 0 °C). El signo de ΔG no dice nada de la velocidad (sección 5)." },
      { make: function (r) { var dH = Math.round((r() * 120 - 80) * 10) / 10, dS = Math.round((r() * 300 - 100)), T = 280 + Math.round(r() * 60), g = M.gibbs(dH, dS, T); return { q: "Calcula ΔG (kJ/mol) para ΔH = " + dH + " kJ/mol, ΔS = " + dS + " J/(mol·K) a T = " + T + " K.", ans: g, unit: "kJ/mol", tol: 0.02, abs: 0.2, e: function () { return "ΔG = ΔH − TΔS = " + dH + " − " + T + "·" + dS + "/1000 = " + TC.num(g, 4) + " kJ/mol (¡cuidado con las unidades de ΔS!)."; } }; } }
    ],
    beyondTitle: "De dónde sale ΔG y qué corrige la diapositiva",
    beyond: function (el) {
      el.innerHTML = "<p>A T y P constantes, ΔS<sub>universo</sub> = −ΔG/T: la segunda ley (ΔS<sub>universo</sub> &gt; 0) equivale a ΔG &lt; 0. Por eso ΔG, y no ΔH o ΔS por separado, decide la espontaneidad.</p><p>Un ΔG negativo indica <i>tendencia</i> termodinámica, no velocidad: la descomposición del H₂O₂ o la hidrólisis del ADN son espontáneas y lentas (sección 5).</p>" + TC.doubt(17) + TC.doubt(13);
    },
    sources: "<p>Diap. 4–8 y 12–17 del profe. Hielo: ΔH<sub>fus</sub> = 6,01 kJ/mol y ΔS<sub>fus</sub> = 22,0 J/(mol·K) (Wikipedia, «Water (data page)», fuente secundaria). Agua líquida: NIST WebBook, ΔfH° = −285,83 kJ/mol y S° = 69,95 J/(mol·K). H₂O₂(l): ΔfH° = −187,80 kJ/mol (ficha de datos del H₂O₂ en Wikipedia, fuente secundaria). ΔS° del H₂O₂ = 126,0 J/K: deducida de los números del profe (no es un dato de tabla). NIST WebBook no tiene el H₂O₂ líquido. Los valores del ATP son <span class=\"illustr\">ilustrativos</span>.</p>"
  });
})(window.TC);
