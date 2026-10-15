/* S3 — ΔG°′, Keq, Q y dirección de la reacción (diap. 8–9, 16–17; profundización) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  TC.addSection({
    id: "s03", title: "ΔG°′, Keq, Q y dirección de la reacción", short: "ΔG°′, Keq y Q", diaps: "Diap. 8–9, 16–17 (equilibrio, reversibilidad); el desarrollo con Keq y Q es <b>más allá del profe</b>",
    essentials: [
      "La diapositiva 9 muestra el estado inicial (reactantes, G<sub>A</sub>) y el final (productos, G<sub>B</sub>) con la diferencia <b>ΔG°</b>: si G<sub>B</sub> &lt; G<sub>A</sub>, ΔG° &lt; 0.",
      "En el <b>equilibrio</b> ΔG = 0 (diap. 8 y 16): el proceso es reversible y el sistema está en un estado de baja energía.",
      "<b>Más allá del profe:</b> la energía libre estándar se relaciona con la constante de equilibrio, $\\Delta G^{\\circ\\prime}=-RT\\ln K'_{eq}$, y la real con el cociente de reacción: $\\Delta G=\\Delta G^{\\circ\\prime}+RT\\ln Q$.",
      "Una reacción con ΔG°′ &gt; 0 <b>sí puede avanzar</b> si Q es suficientemente pequeño (se retiran los productos): ejemplo, malato → oxalacetato con ΔG°′ = +29,7 kJ/mol (diap. 42)."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row" id="pre"><b>Casos:</b></div><div id="ctl"></div><div id="out" class="readout"></div><div id="barw"></div><div id="ch"></div>';
      var ctl = root.querySelector("#ctl"), out = root.querySelector("#out"), barw = root.querySelector("#barw");
      var sG = TC.slider({ label: "ΔG°′", unit: "kJ/mol", min: -60, max: 60, step: 0.1, value: 29.7, dec: 1, onChange: upd });
      var sQ = TC.slider({ label: "log₁₀ Q  (Q = [productos]/[reactivos])", unit: "", min: -10, max: 10, step: 0.05, value: -6, dec: 2, onChange: upd });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 330, step: 0.05, value: 298.15, dec: 2, onChange: upd });
      [sG, sQ, sT].forEach(function (s) { ctl.appendChild(s.el); });
      var pre = root.querySelector("#pre");
      pre.appendChild(TC.button("Malato → oxalacetato (+29,7)", function () { sG.set(29.7, true); sQ.set(-6, true); upd(); }, "small"));
      pre.appendChild(TC.button("ΔG°′ = 0", function () { sG.set(0, true); sQ.set(0, true); upd(); }, "small"));
      pre.appendChild(TC.button("Hidrólisis de ATP (−30,5)", function () { sG.set(-30.5, true); sQ.set(-3, true); sT.set(310.15, true); upd(); }, "small"));
      var cw = root.querySelector("#ch"), ch = new TC.Chart(cw, { xlim: [-10, 10], ylim: [-80, 80], xlabel: "log₁₀ Q", ylabel: "ΔG (kJ/mol)", aria: "ΔG frente a log Q" });
      function upd() {
        var g0 = sG.get(), lq = sQ.get(), T = sT.get(), Q = Math.pow(10, lq), K = M.keq(g0, T), g = M.dGrxn(g0, Q, T), lk = Math.log10(K);
        var dir = Math.abs(g) < 0.05 ? "equilibrio: no hay flujo neto" : g < 0 ? "hacia los productos →" : "← hacia los reactivos";
        out.innerHTML = TC.stat("K′eq = e^(−ΔG°′/RT)", TC.num(K, 3), "") + TC.stat("log₁₀ K′eq", TC.num(lk, 3), "") + TC.stat("ΔG = ΔG°′ + RT ln Q", TC.num(g, 3), "kJ/mol", Math.abs(g) < 0.05 ? "zero" : g < 0 ? "neg" : "pos") + TC.stat("Dirección neta", dir, "");
        // barra de distancia al equilibrio: ΔG/RT en escala ±20 kJ/mol
        var frac = TC.clamp(g / 40, -1, 1), pos = 50 + frac * 50;
        barw.innerHTML = '<p class="small" style="margin:6px 0 2px"><b>Distancia al equilibrio</b> (ΔG; el centro es ΔG = 0)</p><div style="position:relative;height:22px;border:1px solid var(--border);border-radius:99px;background:linear-gradient(90deg,var(--good-soft),var(--surface2) 45%,var(--surface2) 55%,var(--bad-soft))"><div style="position:absolute;left:50%;top:0;bottom:0;border-left:2px solid var(--muted)"></div><div style="position:absolute;left:calc(' + pos + '% - 9px);top:1px;width:18px;height:18px;border-radius:50%;background:var(--c1);border:2px solid var(--surface)"></div></div><div class="row small" style="justify-content:space-between;color:var(--muted)"><span>← espontánea (ΔG &lt; 0)</span><span>ΔG = 0</span><span>no espontánea (ΔG &gt; 0) →</span></div>';
        var xs = [], ys = []; for (var l = -10; l <= 10; l += 0.2) { xs.push(l); ys.push(M.dGrxn(g0, Math.pow(10, l), T)); }
        ch.update({ lines: [{ x: xs, y: ys, color: "c1", label: "ΔG(Q)" }], hlines: [{ y: 0, label: "ΔG = 0", dash: "dash" }], vlines: Math.abs(lk) <= 10 ? [{ x: lk, label: "equilibrio: Q = K′eq", color: "c5" }] : [],
          points: [{ x: lq, y: TC.clamp(g, -80, 80), color: "c2", label: "estado actual", anchor: "start", dy: -10 }] });
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Malato → oxalacetato (diap. 42).</b> La malato deshidrogenasa cataliza esta oxidación con NAD⁺ aunque ΔG°′ = +29,7 kJ/mol: en la célula el oxalacetato se consume rápido (p. ej., la citrato sintasa), así que Q es minúsculo y ΔG real &lt; 0. Con el deslizador de log Q (−6) del caso predefinido, ΔG ≈ −4,5 kJ/mol a 298 K. <span class=\"illustr\">modelo didáctico, valores ilustrativos</span> de Q.</p>" +
        TC.rxn(["mol:malato", "txt:NAD⁺", { arrow: { top: "malato deshidrogenasa", bottom: "ΔG°′ = +29,7 kJ/mol", dir: "⇌" } }, "mol:oxalacetato", "txt:NADH + H⁺"]) +
        "<p class=\"small\">Moléculas: L-malato y oxalacetato, dibujados desde SMILES contrastados en 2 fuentes " + TC.badge("verificado") + "; ΔG°′ del profe (diap. 42).</p>";
    },
    quiz: [
      { q: "Una reacción tiene ΔG°′ = +20 kJ/mol. ¿Puede ocurrir en la célula?", o: ["No, nunca", "Sí, si Q es lo bastante pequeño (los productos se retiran)", "Solo si se calienta", "Solo si no hay enzima"], c: 1, e: "ΔG = ΔG°′ + RT ln Q: con Q ≪ 1 el término RT ln Q es muy negativo y ΔG puede ser &lt; 0." },
      { q: "En el equilibrio, ¿cuánto vale Q?", o: ["Q = 1", "Q = K′eq y ΔG = 0", "Q = 0", "Q = ΔG°′"], c: 1, e: "En el equilibrio el cociente de reacción coincide con la constante de equilibrio y ΔG = 0 (aunque ΔG°′ ≠ 0)." },
      { make: function (r) { var g0 = Math.round((r() * 40 - 20) * 10) / 10, T = 298.15, K = M.keq(g0, T); return { q: "Para ΔG°′ = " + g0 + " kJ/mol a 298,15 K, calcula log₁₀ K′eq.", ans: Math.log10(K), unit: "", tol: 0.03, abs: 0.02, e: function () { return "log₁₀K = −ΔG°′/(2,303·RT) = " + TC.num(Math.log10(K), 4) + ". (RT = 2,479 kJ/mol a 298 K.)"; } }; } }
    ],
    beyondTitle: "Derivación y estado estándar bioquímico",
    beyond: function (el) {
      el.innerHTML = "<p>Para A ⇌ B: el potencial químico de cada especie es μ = μ° + RT ln c. En el equilibrio μ<sub>A</sub> = μ<sub>B</sub> ⇒ ΔG°′ = −RT ln K′eq. Para cualquier mezcla, ΔG = μ<sub>B</sub> − μ<sub>A</sub> = ΔG°′ + RT ln Q.</p><p>El <b>estado estándar bioquímico</b> (ΔG°′) toma pH 7, y el agua y los H⁺ a actividad 1; por eso difiere del ΔG° químico. Un ΔG°′ de ±5,7 kJ/mol corresponde a un factor 10 en K′eq a 298 K.</p>" + TC.doubt(13);
    },
    sources: "<p>Diap. 8, 9, 16, 17 y 42 del profe. Las ecuaciones de ΔG°′ y Q son de libro de texto (p. ej., Nelson &amp; Cox, <i>Lehninger</i>; Voet) y se comprueban numéricamente en <code>web/js/math_tests.js</code> (ΔG = 0 en Q = K, ida y vuelta ΔG°′ ↔ K).</p>"
  });
})(window.TC);
