/* S18 — Inhibición reversible: competitiva, acompetitiva y no competitiva (diap. 60, 62–64) */
(function (TC) {
  "use strict";
  var M = window.TCMath, INF = Infinity;
  var TYPES = { comp: "Competitiva", unc: "Acompetitiva", nc: "No competitiva (pura)", mix: "Mixta" };
  var COL = ["c7", "c1", "c3", "c2"];
  function schemeSvg(type) {
    var a = { ei: type === "comp" || type === "nc" || type === "mix", esi: type === "unc" || type === "nc" || type === "mix" };
    var on = "var(--c1)", off = "var(--border)";
    return '<svg viewBox="0 0 420 190" class="chart" role="img" aria-label="Esquema de la inhibición ' + TYPES[type] + '">' +
      '<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="var(--text)"/></marker></defs>' +
      '<g font-size="15" font-weight="700" fill="var(--text)"><text x="30" y="52">E</text><text x="58" y="52">+ S</text><text x="160" y="52">ES</text><text x="300" y="52">E + P</text>' +
      '<text x="30" y="160" fill="' + (a.ei ? "var(--c1)" : "var(--muted)") + '">EI</text><text x="160" y="160" fill="' + (a.esi ? "var(--c1)" : "var(--muted)") + '">ESI</text></g>' +
      '<g stroke="var(--text)" stroke-width="2" fill="none" marker-end="url(#ar)"><path d="M98 44H150"/><path d="M150 52H98" /><path d="M198 48H292"/></g>' +
      '<text x="100" y="36" font-size="11" fill="var(--muted)">k₁</text><text x="100" y="68" font-size="11" fill="var(--muted)">k₋₁</text><text x="240" y="40" font-size="11" fill="var(--muted)">k₂</text>' +
      '<g stroke="' + (a.ei ? on : off) + '" stroke-width="2.6" stroke-dasharray="' + (a.ei ? "" : "5 4") + '"><path d="M38 62V138"/></g>' +
      '<g stroke="' + (a.esi ? on : off) + '" stroke-width="2.6" stroke-dasharray="' + (a.esi ? "" : "5 4") + '"><path d="M170 62V138"/></g>' +
      '<text x="46" y="106" font-size="12" fill="' + (a.ei ? "var(--c1)" : "var(--muted)") + '">+ I (K_i)</text><text x="178" y="106" font-size="12" fill="' + (a.esi ? "var(--c1)" : "var(--muted)") + '">+ I (K_i′)</text>' +
      (!a.ei ? '<text x="26" y="176" font-size="11" fill="var(--muted)">no se forma</text>' : "") + (!a.esi ? '<text x="150" y="176" font-size="11" fill="var(--muted)">no se forma</text>' : "") + "</svg>";
  }
  function genParams(type, Ki) { return { Ki: type === "unc" ? INF : Ki, Kip: type === "comp" ? INF : type === "nc" ? Ki : type === "unc" ? Ki : Ki * 4 }; }
  TC.addSection({
    id: "s18", title: "Inhibición reversible: competitiva, acompetitiva y no competitiva", short: "Inhibición reversible", diaps: "Diap. 60 (tipos de inhibidores) y 62–64 (competitiva, acompetitiva y no competitiva)",
    essentials: [
      "Los <b>inhibidores enzimáticos</b> «disminuyen, neutralizan o regulan la actividad enzimática»; los hay <b>irreversibles</b> (unión covalente) y <b>reversibles</b>, de tres tipos: competitivo, acompetitivo y no competitivo (diap. 60).",
      "<b>Competitiva</b> (diap. 62): el inhibidor compite con el sustrato por el sitio activo (forma EI); en Lineweaver–Burk el inhibidor <b>incrementa la pendiente pero no la intersección</b>.",
      "<b>Acompetitiva</b> (diap. 63): el inhibidor se une al complejo ES (forma ESI); en LB <b>incrementa la intersección pero no afecta la pendiente</b> (rectas paralelas).",
      "<b>No competitiva</b> (diap. 64): el inhibidor interactúa con E y con ES; en LB <b>afecta la intersección y la pendiente</b>.",
      "<b>Más allá del profe</b>: con α = 1 + [I]/K<sub>i</sub> y α′ = 1 + [I]/K<sub>i</sub>′, $v=\\dfrac{V_{max}[S]}{K_m\\alpha+[S]\\alpha'}$ y $\\dfrac{1}{v}=\\dfrac{K_m\\alpha}{V_{max}}\\dfrac{1}{[S]}+\\dfrac{\\alpha'}{V_{max}}$ (pendiente K<sub>m</sub>α/V<sub>max</sub>, ordenada α′/V<sub>max</sub>)."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Tipo:</b><span id="ty"></span><label class="small"><input type="checkbox" id="cmp"> comparar los tres tipos lado a lado</label></div><div class="grid2"><div id="ctl"></div><div id="sch"></div></div><div id="out" class="readout"></div><div id="tbl"></div><div id="main" class="grid2"><div id="c1"></div><div id="c2"></div></div><div id="cmpw" style="display:none" class="grid3"></div>' +
        '<h3>Modo «identifica el inhibidor»</h3><p class="small">Se muestra una gráfica de Lineweaver–Burk anónima con [I]₀ = 0 (la más baja a la derecha de la pendiente menor) e inhibidor creciente. Clasifica el inhibidor.</p><div id="idf"></div>';
      var type = "comp", ctl = root.querySelector("#ctl"), cmp = false;
      var seg = TC.seg([["comp", "Competitiva"], ["unc", "Acompetitiva"], ["nc", "No competitiva (pura)"], ["mix", "Mixta"]], "comp", function (v) { type = v; upd(); }, "tipo de inhibición"); root.querySelector("#ty").appendChild(seg.el);
      var sV = TC.slider({ label: "Vmax", unit: "µM/min", min: 10, max: 300, step: 1, value: 100, dec: 0, onChange: upd });
      var sK = TC.slider({ label: "Km", unit: "mM", min: 0.02, max: 2, log: true, value: 0.2, onChange: upd });
      var sI = TC.slider({ label: "[I] (paso base; se muestran 0, 1×, 2× y 4×)", unit: "mM", min: 0.01, max: 20, log: true, value: 1, onChange: upd });
      var sKi = TC.slider({ label: "K<sub>i</sub> (inhibidor + E)", unit: "mM", min: 0.05, max: 20, log: true, value: 1, onChange: upd });
      var sKp = TC.slider({ label: "K<sub>i</sub>′ (inhibidor + ES)", unit: "mM", min: 0.05, max: 40, log: true, value: 4, onChange: upd });
      [sV, sK, sI, sKi, sKp].forEach(function (s) { ctl.appendChild(s.el); });
      root.querySelector("#cmp").addEventListener("change", function () { cmp = this.checked; root.querySelector("#main").style.display = cmp ? "none" : ""; root.querySelector("#cmpw").style.display = cmp ? "" : "none"; upd(); });
      var c1 = new TC.Chart(root.querySelector("#c1"), { w: 440, h: 330, xlim: [0, 1], ylim: [0, 1], xlabel: "[S] (mM)", ylabel: "v_{0} (µM/min)", title: "Directa", m: { l: 58, r: 22, t: 28, b: 46 } });
      var c2 = new TC.Chart(root.querySelector("#c2"), { w: 440, h: 330, xlim: [-1, 1], ylim: [0, 1], xlabel: "1/[S] (mM^{-1})", ylabel: "1/v_{0} (min/µM)", title: "Lineweaver–Burk", zeroAxes: true, m: { l: 58, r: 22, t: 28, b: 46 } });
      function ki(t) { var Ki = sKi.get(), Kp = sKp.get(); return t === "comp" ? [Ki, INF] : t === "unc" ? [INF, Kp] : t === "nc" ? [Ki, Ki] : [Ki, Kp]; }
      function lbPlot(chart, t, V, K, I, Kis, big, anon) {
        var Is = [0, I, 2 * I, 4 * I], smax = 8 * K, smin = 0.12 * K, lines = [], x0 = -2.4 / K, x1 = 1 / smin, ymax = 0, ymin = 0, i;
        var ap = M.apparent(V, K, I, Kis[0], Kis[1]);
        Is.forEach(function (Ii, k) {
          var a = M.apparent(V, K, Ii, Kis[0], Kis[1]), y0 = a.intercept + a.slope * x0, y1 = a.intercept + a.slope * x1;
          ymax = Math.max(ymax, y1); ymin = Math.min(ymin, y0);
          lines.push({ x: [x0, x1], y: [y0, y1], color: COL[k], width: k ? 2.4 : 2.2, dash: k ? "" : "dash", label: big ? "[I] = " + TC.numPlain(Ii, 2) : (anon ? (k === 0 ? "[I] = 0" : null) : null), labelAt: "end", dy: k * 12 - 14 });
        });
        var notes = [], pts = [];
        var xs = (Kis[1] === INF) ? null : -Kis[0] / (K * Kis[1]), ys = (Kis[1] === INF) ? null : (1 - Kis[0] / Kis[1]) / V;
        if (Kis[0] === INF) { xs = null; } else if (Kis[1] !== INF) { xs = -Kis[0] / (K * Kis[1]); ys = (1 - Kis[0] / Kis[1]) / V; } else { xs = 0; ys = 1 / V; }
        if (!anon && xs != null && isFinite(xs) && xs >= x0 * 2.2) { pts.push({ x: xs, y: ys, color: "c4", marker: "square", r: 6, label: "punto de corte", dx: 8, dy: -10 }); x0 = Math.min(x0, xs * 1.25); ymin = Math.min(ymin, ys * 1.3); ymax = Math.max(ymax, ys * 1.3); lines.forEach(function (l, k) { var a = M.apparent(V, K, Is[k], Kis[0], Kis[1]); l.x[0] = x0; l.y[0] = a.intercept + a.slope * x0; ymin = Math.min(ymin, l.y[0]); }); }
        var tt = TYPES[t]; var h = ymax * 1.05, lo = Math.min(ymin * 1.1, 0);
        chart.update({ xlim: [x0, x1 * 1.04], ylim: [lo, h], lines: lines, points: pts, title: anon ? "Lineweaver–Burk (anónima)" : big ? "Lineweaver–Burk · " + tt : tt, vlines: anon ? [] : [{ x: -1 / K, label: "−1/K_{m}", color: "c5", dash: "dot" }] });
        return { ap: ap, xs: xs, ys: ys };
      }
      function upd() {
        var V = sV.get(), K = sK.get(), I = sI.get(), Kis = ki(type), Ki = Kis[0], Kp = Kis[1];
        sKi.el.style.display = type === "unc" ? "none" : ""; sKp.el.style.display = type === "comp" || type === "nc" ? "none" : "";
        root.querySelector("#sch").innerHTML = schemeSvg(type);
        var Is = [0, I, 2 * I, 4 * I], rows = Is.map(function (Ii) { var a = M.apparent(V, K, Ii, Ki, Kp); return ["[I] = " + TC.numPlain(Ii, 3) + " mM", TC.num(a.Vmax, 4), TC.num(a.Km, 4), TC.num(a.slope, 4), TC.num(a.intercept, 4), TC.num(a.xint, 4)]; });
        var a1 = M.apparent(V, K, I, Ki, Kp), kind = M.inhibType(Ki, Kp);
        root.querySelector("#out").innerHTML = TC.stat("Tipo (según Ki, Ki′)", kind, "") + TC.stat("α = 1 + [I]/Ki", TC.num(a1.alpha, 3), "") + TC.stat("α′ = 1 + [I]/Ki′", TC.num(a1.alphap, 3), "") + TC.stat("Vmax aparente (con [I])", TC.num(a1.Vmax, 4), "µM/min") + TC.stat("Km aparente (con [I])", TC.num(a1.Km, 4), "mM");
        root.querySelector("#tbl").innerHTML = TC.table(["", "Vmax_ap = Vmax/α′", "Km_ap = Km·α/α′", "pendiente = Km·α/Vmax", "ordenada = α′/Vmax", "corte x = −α′/(Km·α)"], rows);
        if (!cmp) {
          var smax = 8 * K, xs = [], ys = Is.map(function () { return []; }), i;
          for (i = 0; i <= 120; i++) { var s = smax * i / 120; xs.push(s); Is.forEach(function (Ii, k) { ys[k].push(M.mmInhib(s, V, K, Ii, Ki, Kp)); }); }
          c1.update({ xlim: [0, smax], ylim: [0, V * 1.1], lines: Is.map(function (Ii, k) { return { x: xs, y: ys[k], color: COL[k], dash: k ? "" : "dash", width: k ? 2.6 : 2.2, label: "[I] = " + TC.numPlain(Ii, 2), labelAt: 100, dy: 14 * k - 20 }; }), hlines: [{ y: V, label: "Vmax", dash: "dot", color: "c7" }] });
          lbPlot(c2, type, V, K, I, Kis, true);
        } else {
          var cw = root.querySelector("#cmpw"); cw.innerHTML = '<div id="k1"></div><div id="k2"></div><div id="k3"></div>';
          [["comp", "#k1"], ["unc", "#k2"], ["nc", "#k3"]].forEach(function (z) { var ch = new TC.Chart(cw.querySelector(z[1]), { w: 330, h: 290, xlim: [-1, 1], ylim: [0, 1], zeroAxes: true, xlabel: "1/[S]", ylabel: "1/v_{0}", m: { l: 50, r: 14, t: 26, b: 42 } }); lbPlot(ch, z[0], V, K, I, z[0] === "comp" ? [Ki, INF] : z[0] === "unc" ? [INF, Ki] : [Ki, Ki], false); });
        }
      }
      upd();
      /* identificación */
      var idf = root.querySelector("#idf"), cur = null, score = 0, tried = 0, rnd = M.rng(Math.floor(Math.random() * 1e6));
      function newQ() {
        var ks = ["comp", "unc", "nc", "mix"], t = ks[Math.floor(rnd() * 4)], V = Math.round(40 + rnd() * 140), K = Math.round((0.05 + rnd() * 0.5) * 100) / 100, I = 1, Ki = 0.5 + rnd() * 1.5, Kis = t === "comp" ? [Ki, INF] : t === "unc" ? [INF, Ki] : t === "nc" ? [Ki, Ki] : (rnd() < 0.5 ? [Ki, Ki * 5] : [Ki * 5, Ki]);
        cur = { t: t, V: V, K: K, I: I, Kis: Kis }; paintQ(false);
      }
      function paintQ(reveal) {
        idf.innerHTML = '<p class="small">Aciertos: <b>' + score + "</b> de " + tried + '</p><div id="qc"></div><div class="row" id="qb"></div><div id="qf"></div>';
        var ch = new TC.Chart(idf.querySelector("#qc"), { w: 520, h: 330, xlim: [-1, 1], ylim: [0, 1], zeroAxes: true, xlabel: "1/[S]", ylabel: "1/v_{0}", m: { l: 58, r: 14, t: 24, b: 44 } });
        lbPlot(ch, cur.t, cur.V, cur.K, cur.I, cur.Kis, false, true);
        Object.keys(TYPES).forEach(function (k) {
          var b = TC.button(TYPES[k], function () {
            if (cur.done) return; cur.done = true; tried++; var ok = k === cur.t; if (ok) score++;
            var why = { comp: "las rectas se cortan <b>en el eje y</b> (misma ordenada 1/Vmax): sube la pendiente y no la intersección (diap. 62).", unc: "las rectas son <b>paralelas</b>: sube la ordenada y la pendiente no cambia (diap. 63).", nc: "las rectas se cortan <b>sobre el eje x</b> (−1/Km): Vmax baja y Km no cambia; cambian pendiente e intersección (diap. 64).", mix: "las rectas se cortan <b>fuera de los ejes</b> (Ki ≠ Ki′): afecta pendiente y ordenada, y también Km aparente (mixta; la más común en la práctica)." }[cur.t];
            idf.querySelector("#qf").innerHTML = TC.callout(ok ? "good" : "bad", ok ? "Correcto" : "No: era " + TYPES[cur.t], "<p>" + why + "</p>" + '<p class="small">Parámetros: Vmax = ' + cur.V + ", Km = " + cur.K + ", Ki = " + (cur.Kis[0] === INF ? "∞" : TC.numPlain(cur.Kis[0], 3)) + ", Ki′ = " + (cur.Kis[1] === INF ? "∞" : TC.numPlain(cur.Kis[1], 3)) + " (mM).</p>");
            paintScore();
          }); idf.querySelector("#qb").appendChild(b);
        });
        idf.querySelector("#qb").appendChild(TC.button("Otra gráfica", function () { newQ(); }, "small"));
      }
      function paintScore() { var p = idf.querySelector("p.small b"); if (p) { idf.querySelector("p.small").innerHTML = "Aciertos: <b>" + score + "</b> de " + tried; } }
      newQ();
      root.appendChild(TC.h("<div><h3>Lo que dice el profe, frente a las ecuaciones</h3>" + TC.table(["Tipo (diap.)", "Esquema", "Lineweaver–Burk según el profe", "Por las ecuaciones (α, α′)"], [["Competitiva (62)", "E + I ⇌ EI", "incrementa la pendiente, no la intersección", "α′ = 1 → ordenada 1/Vmax igual; pendiente Kmα/Vmax sube; Vmax igual, Km aparente = Kmα"], ["Acompetitiva (63)", "ES + I ⇌ ESI", "incrementa la intersección, no afecta la pendiente", "α = 1 → pendiente igual; ordenada α′/Vmax sube; Vmax_ap = Vmax/α′, Km_ap = Km/α′"], ["No competitiva (64)", "E + I ⇌ EI y ES + I ⇌ ESI", "afecta la intersección y la pendiente", "α = α′ (pura): Vmax_ap = Vmax/α, Km igual (corte en el eje x). Mixta: α ≠ α′"]]) + TC.doubt(14) + "</div>"));
    },
    example: function (root) {
      root.innerHTML = "<p><b>Tres inhibidores reales con estructura verificada.</b> Elige uno:</p><div class=\"row\" id=\"sw\"></div><div id=\"mols\"></div><div id=\"vw\"></div>";
      var viewer = null, data = {
        mtx: { b: "Metotrexato · DHFR humana (1U72)", mols: ["metotrexato|330", "dihidrofolato|330"], txt: "El <b>metotrexato</b> se parece al sustrato <b>dihidrofolato</b> y ocupa su sitio: es un inhibidor <b>competitivo</b> frente a él. El resumen de la literatura (doi:10.1074/jbc.M109.018010) lo describe como «inhibidor lento, de unión fuerte y competitivo de la DHFR humana» " + TC.badge("verificado") + " (resumen).", cfg: { id: "1U72", focus: [{ chain: "A", resi: 30, label: "Glu30", atom: "OE2" }, { chain: "A", resi: 70, label: "Arg70", atom: "NH1" }, { chain: "A", resi: 34, label: "Phe34", atom: "CZ" }], ligands: [{ resn: "MTX", label: "metotrexato" }, { resn: "NDP", label: "NADPH", color: "purpleCarbon" }], distances: ["glu30_mtx", "ndph_c4_mtx"] } },
        nvp: { b: "Nevirapina · transcriptasa inversa del VIH-1 (1VRT)", mols: ["nevirapina|300"], txt: "La <b>nevirapina</b> se une a un bolsillo hidrofóbico <i>alostérico</i>, distinto del sitio de los dNTP y a unos 13–15 Å de los carboxilatos del sitio activo (medido). Spence <i>et al.</i> 1995 la describen como inhibidor <b>no competitivo</b> (doi:10.1126/science.7532321) " + TC.badge("verificado") + " (resumen).", cfg: { id: "1VRT", focus: [{ chain: "A", resi: 181, label: "Tyr181", atom: "OH" }, { chain: "A", resi: 188, label: "Tyr188", atom: "OH" }, { chain: "A", resi: 110, label: "Asp110", atom: "CG" }, { chain: "A", resi: 185, label: "Asp185", atom: "CG" }], ligands: [{ resn: "NVP", label: "nevirapina" }], distances: ["nvp_tyr181", "nvp_asp185", "nvp_asp110"], note: "" } },
        ibp: { b: "Ibuprofeno · COX-2 de ratón (4PH9)", mols: ["ibuprofeno|260"], txt: "El <b>ibuprofeno</b> se une de forma <i>no covalente</i> en el canal de la ciclooxigenasa (contactos con Arg121 y Tyr356 del archivo, equivalentes a los Arg120 y Tyr355 convencionales <span class=\"unverified\">[no verificado]</span>). Es la <b>COX-2 de ratón</b>, no la COX-1. El tipo exacto de inhibición cinética frente al araquidonato <span class=\"unverified\">[no verificado]</span> en esta sesión.", cfg: { id: "4PH9", focus: [{ chain: "A", resi: 121, label: "Arg121", atom: "NE" }, { chain: "A", resi: 356, label: "Tyr356", atom: "OH" }, { chain: "A", resi: 531, label: "Ser531", atom: "OG" }], ligands: [{ resn: "IBP", label: "ibuprofeno" }, { resn: "HEM", label: "hemo", color: "purpleCarbon" }], distances: ["arg121_ibp", "tyr356_ibp", "ser531_ibp"] } },
        li: { b: "Litio · inositol monofosfatasa (sin estructura)", mols: [], txt: "Ejemplo clásico de inhibición <b>acompetitiva</b>: en la IMPasa de cerebro bovino, el Li⁺ es un inhibidor acompetitivo frente a inositol-1-fosfato (y no competitivo frente a Mg²⁺) (Hallcher &amp; Sherman 1980, doi:10.1016/s0021-9258(19)70391-3) " + TC.badge("verificado") + " (resumen). <b>No hay una estructura de esta enzima con Li⁺ como inhibidor entre las verificadas</b> (2BJI, 2HHM… no lo contienen), así que no se dibuja 3D.", cfg: null }
      };
      function open(k) {
        if (viewer) { viewer.destroy(); viewer = null; } var d = data[k]; root.querySelector("#mols").innerHTML = "<div class=\"row\" style=\"align-items:flex-start\">" + d.mols.map(function (m) { var p = m.split("|"); return TC.mol(p[0], { w: +p[1] }); }).join("") + "</div>" + TC.callout("note", d.b, "<p>" + d.txt + "</p>");
        var h = root.querySelector("#vw"); h.innerHTML = ""; if (d.cfg) viewer = TC.viewer(h, d.cfg);
      }
      var sw = root.querySelector("#sw"); Object.keys(data).forEach(function (k) { sw.appendChild(TC.button(data[k].b, function () { open(k); }, "small")); }); open("mtx");
      root.appendChild(TC.h("<p class=\"small\">La <b>no competitiva pura</b> (rectas que se cortan exactamente sobre el eje x) es rara; lo más común es la inhibición <b>mixta</b>. Ningún inhibidor de esta lista se clasifica con una constante medida aquí: el tipo proviene de los resúmenes citados.</p>"));
    },
    quiz: [
      { q: "En un gráfico de Lineweaver–Burk, el inhibidor aumenta la pendiente y no cambia la ordenada en el origen. Es…", o: ["Competitivo", "Acompetitivo", "No competitivo puro", "Irreversible"], c: 0, e: "Diap. 62: α′ = 1 (el inhibidor solo se une a E) → misma ordenada 1/Vmax, mayor pendiente." },
      { q: "Rectas paralelas en Lineweaver–Burk indican inhibición…", o: ["Competitiva", "Acompetitiva", "No competitiva pura", "Mixta"], c: 1, e: "Diap. 63: α = 1 → pendiente igual; solo sube la ordenada (α′/Vmax)." },
      { make: function (r) { var V = Math.round(50 + r() * 150), K = Math.round((0.1 + r() * 0.8) * 100) / 100, I = Math.round(1 + r() * 4), Ki = Math.round(1 + r() * 4); return { q: "Inhibición competitiva: Vmax = " + V + " µM/min, Km = " + K + " mM, [I] = " + I + " mM y Ki = " + Ki + " mM. Calcula Km aparente (mM).", ans: K * (1 + I / Ki), unit: "mM", tol: 0.01, abs: 0.005, e: function () { return "Km_ap = Km·α = " + K + "·(1 + " + I + "/" + Ki + ") = " + TC.num(K * (1 + I / Ki), 4) + " mM; Vmax no cambia."; } }; } },
      { make: function (r) { var V = Math.round(50 + r() * 150), I = Math.round(1 + r() * 4), Kp = Math.round(1 + r() * 4); return { q: "Inhibición acompetitiva: Vmax = " + V + " µM/min, [I] = " + I + " mM y Ki′ = " + Kp + " mM. Calcula Vmax aparente (µM/min).", ans: V / (1 + I / Kp), unit: "µM/min", tol: 0.01, abs: 0.1, e: function () { return "Vmax_ap = Vmax/α′ = " + V + "/(1 + " + I + "/" + Kp + ") = " + TC.num(V / (1 + I / Kp), 4) + " µM/min (y Km_ap = Km/α′)."; } }; } },
      { q: "En la inhibición no competitiva pura, el inhibidor…", o: ["Solo se une a E", "Solo se une a ES", "Se une a E y a ES con la misma afinidad (Ki = Ki′): Vmax baja y Km no cambia", "No se une"], c: 2, e: "α = α′: Vmax_ap = Vmax/α y Km igual; las rectas de LB se cortan en el eje x (−1/Km)." }
    ],
    beyondTitle: "Ecuación general, constantes de inhibición y cómo distinguir mixta de no competitiva",
    beyond: function (el) {
      el.innerHTML = "<p>La ecuación de la inhibición mixta cubre los demás casos: Ki′ → ∞ (competitiva), Ki → ∞ (acompetitiva) y Ki = Ki′ (no competitiva pura). Si Ki &lt; Ki′ (el inhibidor prefiere E) las rectas se cortan en el 2.º cuadrante; si Ki &gt; Ki′ (prefiere ES), por debajo del eje x. Punto de corte: x = −Ki/(Km·Ki′), y = (1 − Ki/Ki′)/Vmax (calculado y dibujado arriba). Para determinar Ki y Ki′ se grafican pendiente vs [I] (corte −Ki) y ordenada vs [I] (corte −Ki′) (replots secundarios).</p>" + TC.doubt(14);
    },
    sources: "<p>Diap. 60 y 62–64 del profe (esquemas y gráficas redibujados). Ecuaciones: estándar de cinética enzimática, verificadas numéricamente (los 4 tipos, pendiente e intercepto de LB) en <code>web/js/math_tests.js</code>. Ejemplos: 1U72 (Cody 2005, doi:10.1107/S0907444904030422), 1VRT (Ren 1995, doi:10.1038/nsb0495-293), 4PH9 (Orlando 2015, doi:10.1016/j.jsb.2014.11.005) " + TC.badge("verificado") + ". Tipos de inhibición: resúmenes de JBC 2009 (metotrexato), Science 1995 (nevirapina) y JBC 1980 (Li⁺), consultados vía Europe PMC.</p>"
  });
})(window.TC);
