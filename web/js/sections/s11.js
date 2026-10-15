/* S11 — Acoplamiento energético, ATP y compuestos ricos en energía (diap. 32–37) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  /* Energía libre estándar de hidrólisis (ΔG°′, kJ/mol). Valores de libro de texto (tipo Lehninger/Voet), sin verificar en esta sesión,
     salvo ATP = −30,5 kJ/mol y el umbral de 25 kJ/mol, que son los del profe (diap. 33–34). */
  var LAD = [
    { id: "pep", name: "Fosfoenolpiruvato (PEP)", g: -61.9, prof: false, ver: true }, { id: "bpg", name: "1,3-Bisfosfoglicerato", g: -49.4, prof: false, ver: true },
    { id: "pcr", name: "Fosfocreatina", g: -43.1, prof: false, ver: true }, { id: "atp", name: "ATP → ADP + Pᵢ", g: -30.5, prof: true },
    { id: "g1p", name: "Glucosa-1-fosfato", g: -20.9, prof: false, ver: true }, { id: "f6p", name: "Fructosa-6-fosfato", g: -15.9, prof: false },
    { id: "g6p", name: "Glucosa-6-fosfato", g: -13.8, prof: false, ver: true }, { id: "gl3p", name: "Glicerol-3-fosfato", g: -9.2, prof: false, ver: true }
  ];
  TC.addSection({
    id: "s11", title: "Acoplamiento energético, ATP y compuestos ricos en energía", short: "Acoplamiento y ATP", diaps: "Diap. 32–37 (aditividad de ΔG°′, intermediarios de alta energía, ATP como intermediario común)",
    essentials: [
      "<b>Las ΔG°′ de reacciones secuenciales son aditivas</b>: A → B → C → D tiene ΔG°′<sub>total</sub> = ΔG°′₁ + ΔG°′₂ + ΔG°′₃ (diap. 32). Una reacción exergónica (ΔG°′ &lt; 0) se <b>acopla</b> a una endergónica (ΔG°′ &gt; 0) para que ésta ocurra si ΔG°′<sub>T</sub> &lt; 0.",
      "El acoplamiento está mediado por <b>intermediarios de alta energía</b> (compuestos ricos en energía), normalmente <b>ATP</b>: liberan energía por hidrólisis y transferencia de grupo, en una sola reacción, con un potencial de transferencia de grupo &gt; 25 kJ/mol; <b>ATP = 30,5 kJ/mol</b> (diap. 33–34). Se transfieren fosfatos o acilos.",
      "La hidrólisis del ATP libera mucha energía porque los <b>productos son más estables</b>: hay menos repulsión de cargas, más formas resonantes y más isómeros de ionización (diap. 35). Tiene enlaces <b>fosfoanhidro</b> (entre fosfatos) y un enlace <b>fosfoéster</b> (con la ribosa).",
      "El ATP se sintetiza en procesos exergónicos y se hidroliza en los <b>endergónicos</b> (la diap. 36 dice «exergónicos»: duda 4); es el nexo entre catabolismo y anabolismo y participa en síntesis molecular, bombeo iónico, contracción muscular, movimiento de vesículas, flujo núcleo~citoplasma y producción/eliminación de compuestos (diap. 37)."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">A · Acoplador: reacción endergónica + hidrólisis de ATP</h3><div id="ctlA"></div><div id="outA" class="readout"></div><div id="barsA"></div>' +
        '<h3>B · Escala del potencial de transferencia de grupo</h3><p class="small">ΔG°′ de hidrólisis. El umbral «rico en energía» del profe es &gt; 25 kJ/mol (diap. 33); ATP = 30,5. PEP, 1,3-BPG, fosfocreatina, glucosa-1-fosfato, glucosa-6-fosfato y glicerol-3-fosfato: <span class="verified">[verificados]</span> contra dos tablas de libro de texto (hoja de problemas de CHE 472, Buffalo State, con kcal y kJ redondeados; tabla de energías libres de la Universidad Estatal de Florida), y PEP también en la ficha de Wikipedia; mis valores con un decimal son la conversión de kcal/mol (±0,2 kJ entre fuentes; p. ej. 1,3-BPG entre −49 y −49,6). La fructosa-6-fosfato (−15,9) <span class="unverified">[no verificado]</span>: ninguna fuente la confirma (el −15,9 podría pertenecer a la fructosa-1-fosfato). ATP = −30,5: del profe y de la ficha del ATP.</p><div id="ladder"></div><div class="row" id="don"></div><div id="outB"></div>';
      /* ---- A ---- */
      var c = root.querySelector("#ctlA");
      var sE = TC.slider({ label: "ΔG°′ de la reacción endergónica", unit: "kJ/mol", min: 0, max: 60, step: 0.1, value: 20, dec: 1, onChange: updA });
      var sQ = TC.slider({ label: "log₁₀ Q de la endergónica", unit: "", min: -4, max: 4, step: 0.05, value: 0, dec: 2, onChange: updA });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 330, step: 0.05, value: 310.15, dec: 2, onChange: updA });
      var sATP = TC.slider({ label: "[ATP]", unit: "mM", min: 0.01, max: 20, log: true, value: 3, onChange: updA });
      var sADP = TC.slider({ label: "[ADP]", unit: "mM", min: 0.001, max: 20, log: true, value: 0.4, onChange: updA });
      var sPi = TC.slider({ label: "[Pᵢ]", unit: "mM", min: 0.01, max: 50, log: true, value: 3, onChange: updA });
      [sE, sQ, sT, sATP, sADP, sPi].forEach(function (s) { c.appendChild(s.el); });
      function updA() {
        var T = sT.get(), ge0 = sE.get(), ge = M.dGrxn(ge0, Math.pow(10, sQ.get()), T), gh0 = -30.5, gh = M.dGatp(gh0, sATP.get() * 1e-3, sADP.get() * 1e-3, sPi.get() * 1e-3, T), tot0 = ge0 + gh0, tot = ge + gh;
        root.querySelector("#outA").innerHTML = TC.stat("ΔG°′ total = ΔG°′₁ + ΔG°′₂", TC.num(tot0, 3), "kJ/mol", tot0 < 0 ? "neg" : "pos") + TC.stat("ΔG real de la hidrólisis de ATP", TC.num(gh, 3), "kJ/mol", "neg") + TC.stat("ΔG real de la endergónica", TC.num(ge, 3), "kJ/mol", ge > 0 ? "pos" : "neg") + TC.stat("ΔG real total (acoplada 1:1)", TC.num(tot, 3), "kJ/mol", tot < 0 ? "neg" : "pos") + TC.stat("¿Funciona el acople?", tot < 0 ? "sí: ΔG total < 0" : "no: ΔG total ≥ 0", "");
        var vals = [["endergónica (real)", ge, "var(--c2)"], ["hidrólisis ATP (real)", gh, "var(--c1)"], ["total", tot, tot < 0 ? "var(--c3)" : "var(--bad)"]], mx = Math.max(60, Math.max.apply(null, vals.map(function (v) { return Math.abs(v[1]); })));
        root.querySelector("#barsA").innerHTML = '<div class="small" style="margin:6px 0">ΔG real (kJ/mol; izquierda = libera energía, derecha = consume)</div>' + vals.map(function (v) {
          var w = Math.abs(v[1]) / mx * 50, left = v[1] < 0;
          return '<div class="row" style="gap:8px;margin:3px 0;flex-wrap:nowrap"><span class="small" style="width:11em">' + v[0] + '</span><div style="position:relative;flex:1;height:22px;background:var(--surface2);border:1px solid var(--border);border-radius:5px"><div style="position:absolute;left:50%;top:0;bottom:0;border-left:2px solid var(--muted)"></div><div style="position:absolute;top:2px;bottom:2px;background:' + v[2] + ';' + (left ? "right:50%" : "left:50%") + ";width:" + w + '%;border-radius:3px"></div></div><b class="small" style="width:5.5em;text-align:right">' + TC.numPlain(v[1], 3) + "</b></div>";
        }).join("") + '<p class="small"><span class="illustr">modelo didáctico, valores ilustrativos</span> de concentraciones y de la endergónica; ΔG°′ de la hidrólisis = −30,5 kJ/mol (profe, diap. 33). Los valores celulares reales dependen de pH, Mg²⁺ y fuerza iónica.</p>';
      }
      updA();
      /* ---- B ---- */
      var lad = root.querySelector("#ladder"), sorted = LAD.slice();
      lad.innerHTML = sorted.map(function (x) {
        var w = Math.abs(x.g) / 65 * 100, rich = Math.abs(x.g) > 25;
        return '<div class="row" style="gap:8px;margin:3px 0;flex-wrap:nowrap"><span class="small" style="width:12em">' + x.name + '</span><div style="position:relative;flex:1;height:20px;background:var(--surface2);border:1px solid var(--border);border-radius:5px"><div style="width:' + w + '%;height:100%;background:' + (x.prof ? "var(--c5)" : rich ? "var(--c1)" : "var(--c7)") + ';border-radius:4px 0 0 4px;' + (x.prof ? "" : "") + '"></div><div style="position:absolute;left:' + (25 / 65 * 100) + '%;top:0;bottom:0;border-left:2px dashed var(--bad)" title="umbral 25 kJ/mol"></div></div><b class="small" style="width:6.5em;text-align:right">' + TC.numPlain(x.g, 3) + "</b><span class=\"small\" style=\"width:9em\">" + (rich ? "rico en energía" : "no rico") + (x.prof ? " (profe)" : x.ver ? ' <span class="verified">[verif.]</span>' : ' <span class="unverified">[no verif.]</span>') + "</span></div>";
      }).join("") + '<div class="small" style="margin-left:12em">línea discontinua: umbral de 25 kJ/mol (diap. 33)</div>';
      var don = root.querySelector("#don"), selD = TC.select(LAD.map(function (x) { return [x.id, x.name]; }), "pep", updB), selA = TC.select(LAD.map(function (x) { return [x.id, x.name]; }), "atp", updB);
      don.innerHTML = "<b>Transferencia de fosfato:</b> donador "; don.appendChild(selD); don.appendChild(TC.h("<span> → aceptor (el ADP forma ATP; elige «ATP» para ADP → ATP) </span>")); don.appendChild(selA);
      function updB() {
        var d = LAD.filter(function (x) { return x.id === selD.value; })[0], a = LAD.filter(function (x) { return x.id === selA.value; })[0], g = d.g - a.g;
        root.querySelector("#outB").innerHTML = TC.callout(g < 0 ? "good" : "bad", "ΔG°′ de la transferencia", "<p>Donador–P + aceptor → donador + aceptor–P: ΔG°′ = ΔG°′(hidrólisis del donador) − ΔG°′(hidrólisis del aceptor) = (" + d.g + ") − (" + a.g + ") = <b>" + TC.numPlain(g, 3) + " kJ/mol</b> → " + (g < -0.05 ? "el donador transfiere el grupo espontáneamente (condiciones estándar)." : g > 0.05 ? "no es espontánea en condiciones estándar." : "equilibrio.") + " <span class=\"unverified\">[no verificado]</span> excepto ATP.</p>");
      }
      updB();
    },
    example: function (root) {
      root.innerHTML = "<p><b>ATP: enlaces fosfoéster y fosfoanhidro (diap. 35).</b> Se resaltan por SMARTS: en rojo, los enlaces <b>fosfoanhidro</b> (P–O–P); en azul, el <b>fosfoéster</b> (C–O–P). Fosfatos α, β, γ del extremo ribosa al extremo libre (duda 18).</p>" +
        TC.rxn(["mol:atp|440", { arrow: { top: "H₂O", bottom: "ΔG°′ ≈ −30,5 kJ/mol (profe)", dir: "→" } }, "mol:adp|380", "+", "mol:pi|120"]) +
        "<p><b>ATP real unido a una quinasa (1ATP):</b> subunidad catalítica de la proteína quinasa A de ratón con ATP, dos Mn²⁺ y un péptido inhibidor. En el cristal el metal es <b>Mn²⁺</b>, no el Mg²⁺ fisiológico.</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "1ATP", focus: [{ chain: "E", resi: 72, label: "Lys72", atom: "NZ" }, { chain: "E", resi: 184, label: "Asp184", atom: "CG" }], ligands: [{ resn: "ATP", label: "ATP" }, { resn: "MN", label: "Mn²⁺" }], distances: ["lys72_atp", "mn_atp"], ligandToggle: "Mostrar ATP y Mn²⁺" });
      root.appendChild(TC.h("<div>" + TC.doubt(4) + TC.doubt(18) + "</div>"));
    },
    quiz: [
      { q: "ΔG°′₁ = −30,5 kJ/mol (hidrólisis de ATP) acoplada a ΔG°′₂ = +20 kJ/mol. ¿Cuánto vale ΔG°′ total?", o: ["+50,5 kJ/mol", "−10,5 kJ/mol", "−50,5 kJ/mol", "+10,5 kJ/mol"], c: 1, e: "Las ΔG°′ de reacciones secuenciales son aditivas (diap. 32): −30,5 + 20 = −10,5 kJ/mol &lt; 0: el acople funciona." },
      { q: "Según el profe, ¿cuál es el umbral de potencial de transferencia de grupo para considerar un compuesto «rico en energía»?", o: ["&gt; 5 kJ/mol", "&gt; 25 kJ/mol", "&gt; 100 kJ/mol", "&gt; 1 kJ/mol"], c: 1, e: "Diap. 33–34: ceden energía &gt; 25 kJ/mol; el ATP tiene 30,5 kJ/mol." },
      { q: "¿Cuál de estas NO es una razón dada para la alta energía de hidrólisis del ATP (diap. 35)?", o: ["Menos repulsión de cargas en los productos", "Más formas resonantes en los productos", "Más isómeros de ionización", "El enlace fosfoéster es el más débil"], c: 3, e: "Las tres razones de la diapositiva son las primeras; el fosfoéster no es la causa." },
      { prac: true, q: "<b>Encuentra el error (duda 4, diap. 36):</b> «El ATP se sintetiza en los procesos exergónicos y se hidroliza en los procesos exergónicos». ¿Qué debería decir?", o: ["Se hidroliza en los procesos endergónicos", "Se sintetiza en los procesos endergónicos", "Nada: es correcto", "Se hidroliza en procesos reversibles"], c: 0, e: "La hidrólisis es exergónica y se acopla a procesos endergónicos (biosíntesis, transporte, trabajo)." }
    ],
    beyondTitle: "ΔG real del ATP en la célula y escalera de grupos fosfato",
    beyond: function (el) {
      el.innerHTML = "<p>Con ΔG = ΔG°′ + RT ln([ADP][Pᵢ]/[ATP]), la concentración mantiene al sistema ATP/ADP lejos del equilibrio: con valores celulares típicos (del orden de mM; ilustrativos) ΔG ≈ −50 kJ/mol, bastante más negativo que −30,5. La escala de potencial de transferencia explica el orden de la glucólisis: el PEP (−61,9) puede fosforilar ADP; el ATP puede fosforilar glucosa (−13,8) pero no al revés.</p>" + TC.doubt(4);
    },
    sources: "<p>Diap. 32–37 del profe (ATP = 30,5 kJ/mol y el umbral de 25 kJ/mol son valores del profe). ΔG°′ de hidrólisis: ATP (profe y ficha del ATP), PEP, 1,3-BPG, fosfocreatina, G1P, G6P y glicerol-3-fosfato verificados en tablas de libro/curso universitario (Buffalo State CHE 472 problem set 2; Univ. Estatal de Florida «A Few Standard Free Energy Changes»; ficha del PEP en Wikipedia) <span class=\"verified\">[verificado]</span>. Fructosa-6-fosfato (−15,9) <span class=\"unverified\">[no verificado]</span>. 1ATP: Zheng <i>et al.</i> 1993, Acta Cryst D49:362 (doi:10.1107/S0907444993000423) " + TC.badge("verificado") + "; ATP/ADP/Pᵢ 2D: " + TC.badge("verificado") + ". La ecuación ΔG = ΔG°′ + RT ln Q se prueba en <code>math_tests.js</code>.</p>"
  });
})(window.TC);
