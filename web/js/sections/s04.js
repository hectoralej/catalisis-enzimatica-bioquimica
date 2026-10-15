/* S4 — Perfil de energía y estado de transición (diap. 9–11) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  function profile(dG0, dGdd) {
    // G(x) = s(x)·ΔG° + B·exp(−((x−xt)/w)²); B se ajusta por bisección para que el máximo valga exactamente ΔG‡ (G_A = 0)
    var xt = TC.clamp(0.5 - dG0 / 200, 0.3, 0.7), w = 0.17, xs = [], i;
    for (i = 0; i <= 200; i++) xs.push(i / 200);
    function G(x, B) { return dG0 * (x * x * (3 - 2 * x)) + B * Math.exp(-Math.pow((x - xt) / w, 2)); }
    function maxG(B) { var m = -1e9; xs.forEach(function (x) { m = Math.max(m, G(x, B)); }); return m; }
    var lo = 0, hi = 4 * Math.abs(dGdd) + 200;
    for (i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (maxG(mid) < dGdd) lo = mid; else hi = mid; }
    var B = (lo + hi) / 2, ys = xs.map(function (x) { return G(x, B); }), imax = 0;
    ys.forEach(function (y, k) { if (y > ys[imax]) imax = k; });
    return { x: xs, y: ys, xts: xs[imax] };
  }
  TC.addSection({
    id: "s04", title: "Perfil de energía y estado de transición", short: "Perfil de energía", diaps: "Diap. 9–11 (diagrama G vs coordenada de reacción; ΔG‡; k₁ y k₋₁)",
    essentials: [
      "En A ⇌ B la diapositiva 9 compara solo los <b>estados inicial y final</b> (ΔG°); la 10 añade el <b>estado de transición</b>: el máximo de energía libre en el camino, con barreras ΔG°‡₁ (directa, desde A) y ΔG°‡₋₁ (inversa, desde B) y constantes <b>k₁</b> y <b>k₋₁</b>.",
      "Las barreras y ΔG° están ligadas: $\\Delta G^{\\circ\\ddagger}_{1}-\\Delta G^{\\circ\\ddagger}_{-1}=\\Delta G^{\\circ}$ y $K=k_1/k_{-1}$. La <b>termodinámica</b> (ΔG°) fija el equilibrio; las barreras fijan la <b>rapidez</b> (sección 5).",
      "Teoría del estado de transición (Eyring, <b>más allá del profe</b>): $k=\\dfrac{k_BT}{h}\\,e^{-\\Delta G^{\\ddagger}/RT}$. Cada 5,7 kJ/mol de barrera cambian k en un factor 10 a 298 K.",
      "<b>Estado de transición ≠ intermediario</b> (diap. 11 y 28): el estado de transición es un <i>máximo</i> (no se aísla, dura ≈ una vibración); un intermediario es un <i>mínimo local</i> con vida propia. La diap. 11 muestra bote → <b>semi-silla</b> (estado de transición) → silla."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Perfil:</b><span id="mode"></span></div><div id="ctl"></div><div id="out" class="readout"></div><div id="ch"></div><div id="chk"></div>';
      var ctl = root.querySelector("#ctl"), out = root.querySelector("#out"), chk = root.querySelector("#chk"), mode = "gen";
      var sG = TC.slider({ label: "ΔG° (G<sub>B</sub> − G<sub>A</sub>)", unit: "kJ/mol", min: -40, max: 30, step: 0.5, value: -15, dec: 1, onChange: upd });
      var sB = TC.slider({ label: "ΔG‡ directo (A → B)", unit: "kJ/mol", min: 5, max: 120, step: 0.5, value: 70, dec: 1, onChange: upd });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 330, step: 0.05, value: 298.15, dec: 2, onChange: upd });
      [sG, sB, sT].forEach(function (s) { ctl.appendChild(s.el); });
      var sg = TC.seg([["gen", "Genérico A ⇌ B (diap. 10)"], ["sug", "Conformaciones de un azúcar (diap. 11)"]], "gen", function (v) { mode = v; upd(); }, "tipo de perfil");
      root.querySelector("#mode").appendChild(sg.el);
      var ch = new TC.Chart(root.querySelector("#ch"), { w: 720, h: 400, xlim: [0, 1], ylim: [-50, 130], xlabel: "Coordenada de reacción", ylabel: "Energía libre G (kJ/mol, G_{A} = 0)", aria: "Perfil de energía libre" });
      function upd() {
        var g0 = sG.get(), dd = sB.get(), T = sT.get(), warn = "";
        if (dd < Math.max(0, g0) + 1) { warn = "El estado de transición no puede quedar por debajo de B: se usa ΔG‡ = " + TC.numPlain(Math.max(0, g0) + 1) + " kJ/mol."; dd = Math.max(0, g0) + 1; }
        var P = profile(g0, dd), rev = dd - g0, k1 = M.eyring(dd, T), km1 = M.eyring(rev, T), K = k1 / km1, Kth = M.keq(g0, T);
        var top = dd, bot = Math.min(0, g0);
        var labA = mode === "gen" ? "A (reactantes)" : "bote (1)", labB = mode === "gen" ? "B (productos)" : "silla (3)", labT = mode === "gen" ? "estado de transición" : "semi-silla (2) = estado de transición";
        var ymin = bot - 25, ymax = top + 30;
        ch.update({ ylim: [ymin, ymax], lines: [{ x: P.x, y: P.y, color: "c1", width: 3 }],
          hlines: [{ y: 0, color: "c7", dash: "dot" }, { y: g0, color: "c7", dash: "dot" }, { y: dd, color: "c7", dash: "dot" }],
          arrows: [{ x1: 0.12, y1: 0, x2: 0.12, y2: dd, color: "c2", label: "ΔG‡₁ = " + TC.numPlain(dd, 3), dx: 6 }, { x1: 0.9, y1: g0, x2: 0.9, y2: dd, color: "c4", label: "ΔG‡₋₁ = " + TC.numPlain(rev, 3), dx: -150 }, { x1: 0.97, y1: 0, x2: 0.97, y2: g0, color: "c3", label: "ΔG° = " + TC.numPlain(g0, 3), dx: -112, dy: 26 }],
          notes: [{ x: 0.02, y: -12, text: labA, color: "c1" }, { x: 0.98, y: g0 - 10, text: labB, color: "c1", anchor: "end" }, { x: P.xts, y: dd + 10, text: labT, color: "c1", anchor: "middle" }] });
        out.innerHTML = TC.stat("ΔG‡₋₁ = ΔG‡₁ − ΔG°", TC.num(rev, 3), "kJ/mol") + TC.stat("k₁ (Eyring)", TC.num(k1, 3), "s⁻¹") + TC.stat("k₋₁ (Eyring)", TC.num(km1, 3), "s⁻¹") + TC.stat("t½ directo", M.humanTime(M.halfLife(k1)), "") + TC.stat("K = k₁/k₋₁", TC.num(K, 3), "");
        chk.innerHTML = (warn ? TC.callout("bad", "Aviso", "<p>" + warn + "</p>") : "") + '<p class="small">Comprobación: K = k₁/k₋₁ = ' + TC.num(K, 4) + ' y K′ = e<sup>−ΔG°/RT</sup> = ' + TC.num(Kth, 4) + (Math.abs(K / Kth - 1) < 1e-9 ? " ✔ coinciden" : " ✘") + ". ΔG‡₁ − ΔG‡₋₁ = " + TC.num(dd - rev, 4) + " = ΔG° ✔." + (mode === "sug" ? ' <span class="illustr">modelo didáctico, valores ilustrativos</span> (la diapositiva 11 no da números).' : "") + "</p>";
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Isomerización de triosas (diap. 29–30).</b> La triosafosfato isomerasa interconvierte G3P y DHAP pasando por un <i>cis</i>-enediol. En el diagrama de la diapositiva 28 ese enediol es un <b>intermediario</b> (mínimo local) entre dos estados de transición; en la sección 6 lo verás con la enzima, y en la 10, a nivel de residuos.</p>" +
        TC.rxn(["mol:g3p", { arrow: { top: "TIM", bottom: "", dir: "⇌" } }, "mol:enediol", { arrow: { top: "", bottom: "", dir: "⇌" } }, "mol:dhap"]) +
        "<p class=\"small\">G3P y DHAP: SMILES contrastados " + TC.badge("verificado") + "; el <i>cis</i>-enediol <span class=\"unverified\">[no verificado]</span> (intermediario inestable, sin entrada en CCD/PubChem; SMILES construido a mano sin estereoquímica).</p>";
    },
    quiz: [
      { q: "En el diagrama de energía libre, el estado de transición es…", o: ["Un mínimo local con vida propia", "El máximo de energía libre en el camino de reacción", "El estado final", "El complejo enzima–sustrato"], c: 1, e: "Es el máximo (diap. 10 y 28). Un intermediario, en cambio, es un mínimo local (diap. 28)." },
      { make: function (r) { var g0 = Math.round(r() * 30 - 25), f = 60 + Math.round(r() * 30); return { q: "Una reacción tiene ΔG‡ directo = " + f + " kJ/mol y ΔG° = " + g0 + " kJ/mol. ¿Cuánto vale la barrera inversa ΔG‡₋₁ (kJ/mol)?", ans: f - g0, unit: "kJ/mol", tol: 0.01, abs: 0.1, e: function () { return "ΔG‡₋₁ = ΔG‡₁ − ΔG° = " + f + " − (" + g0 + ") = " + (f - g0) + " kJ/mol."; } }; } },
      { q: "Si se baja la barrera ΔG‡ en 5,7 kJ/mol a 298 K, la constante de velocidad…", o: ["no cambia", "aumenta unas 10 veces", "disminuye 10 veces", "se duplica"], c: 1, e: "k ∝ e<sup>−ΔG‡/RT</sup>; RT ln 10 = 5,7 kJ/mol a 298 K." }
    ],
    beyondTitle: "Eyring, energía de activación y el estado de transición",
    beyond: function (el) {
      el.innerHTML = "<p>La teoría del estado de transición supone un equilibrio cuasi-térmico entre reactivos y el complejo activado; la frecuencia de cruce de la barrera es ≈ k<sub>B</sub>T/h (6,2×10¹² s⁻¹ a 298 K) y k = κ(k<sub>B</sub>T/h)e<sup>−ΔG‡/RT</sup>, con κ ≈ 1 (coeficiente de transmisión). La energía de activación de Arrhenius se relaciona con la entalpía de activación: E<sub>a</sub> = ΔH‡ + RT.</p><p>Con ΔG‡ en kJ/mol a 298 K: 60 → k ≈ 2×10² s⁻¹; 80 → 6×10⁻² s⁻¹; 100 → 2×10⁻⁵ s⁻¹ (compruébalo con el deslizador de ΔG‡).</p>";
    },
    sources: "<p>Diap. 9–11 (esquemas redibujados; las originales son figuras de Nelson &amp; Cox que no se copian). Eyring: física química estándar; implementado y probado en <code>web/js/math.js</code> (<code>eyring</code>, K = k₁/k₋₁, diferencia de barreras). Los perfiles son curvas didácticas: la forma entre los extremos es ilustrativa, los valores de los extremos y el máximo son exactamente los que fijas.</p>"
  });
})(window.TC);
