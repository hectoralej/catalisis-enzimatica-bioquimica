/* S6 — Qué hacen (y qué NO hacen) las enzimas (diap. 18–19, 27–28, 31) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  /* Curva suave que pasa por puntos clave alternando extremos (pendiente cero en cada uno): interpolación «smoothstep». */
  TC.smooth = function (keys, n) {
    var xs = [], ys = [], i, j, k;
    for (k = 0; k < keys.length - 1; k++) {
      var a = keys[k], b = keys[k + 1];
      for (j = 0; j < n; j++) { var t = j / n, s = t * t * (3 - 2 * t); xs.push(a.x + (b.x - a.x) * t); ys.push(a.y + (b.y - a.y) * s); }
    }
    xs.push(keys[keys.length - 1].x); ys.push(keys[keys.length - 1].y);
    return { x: xs, y: ys };
  };
  TC.addSection({
    id: "s06", title: "Qué hacen (y qué NO hacen) las enzimas", short: "Qué hacen las enzimas", diaps: "Diap. 18–19, 27–28, 31 (enzimas; perfil catalizado vs no catalizado; intermediarios)",
    essentials: [
      "Las enzimas son <b>biocatalizadores</b>: proteínas globulares con actividad catalítica; algunas son solo proteína y otras son <i>apoenzima</i> + <i>grupo prostético</i> (cofactor o coenzima) (diap. 18).",
      "Regulan la velocidad de reacciones <b>espontáneas</b> (ΔG &lt; 0) y <b>no promueven</b> las no espontáneas (ΔG &gt; 0); aumentan la velocidad 10³ a 10¹² veces <b>sin afectar el sentido</b> de la reacción y no forman parte del producto (diap. 19).",
      "En el diagrama (diap. 27): la reacción catalizada tiene una barrera <b>menor</b> en ambos sentidos, pero G<sub>A</sub>, G<sub>B</sub> y por tanto <b>ΔG° y Keq no cambian</b>. «Las enzimas bajan la energía de activación» (diap. 31).",
      "Con intermediarios (diap. 28) el camino enzimático tiene varios picos y valles: los complejos <b>ES</b> y <b>EP</b> son <i>intermediarios</i> (mínimos); cada pico es un <i>estado de transición</i>."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Camino:</b><span id="mode"></span></div><div id="ctl"></div><div id="out" class="readout"></div><div id="ch"></div><div id="msg"></div>';
      var mode = "both", ctl = root.querySelector("#ctl");
      var sG = TC.slider({ label: "ΔG° (igual en ambos caminos)", unit: "kJ/mol", min: -40, max: 20, step: 0.5, value: -15, dec: 1, onChange: upd });
      var sU = TC.slider({ label: "ΔG‡ sin catalizar", unit: "kJ/mol", min: 60, max: 130, step: 0.5, value: 100, dec: 1, onChange: upd });
      var sD = TC.slider({ label: "ΔΔG‡ (reducción por la enzima)", unit: "kJ/mol", min: 0, max: 80, step: 0.5, value: 45, dec: 1, onChange: upd });
      var sI = TC.slider({ label: "Profundidad del intermediario ES/EP (respecto de A)", unit: "kJ/mol", min: -35, max: 5, step: 0.5, value: -12, dec: 1, onChange: upd });
      var sT = TC.slider({ label: "<i>T</i>", unit: "K", min: 273, max: 330, step: 0.05, value: 298.15, dec: 2, onChange: upd });
      [sG, sU, sD, sI, sT].forEach(function (s) { ctl.appendChild(s.el); });
      var sg = TC.seg([["unc", "Sin catalizar"], ["one", "Catalizada (1 paso)"], ["two", "Catalizada con ES y EP (diap. 28)"], ["both", "Comparar"]], "both", function (v) { mode = v; upd(); }, "camino"); root.querySelector("#mode").appendChild(sg.el);
      var ch = new TC.Chart(root.querySelector("#ch"), { w: 720, h: 400, xlim: [0, 1], ylim: [-60, 140], xlabel: "Coordenada de reacción", ylabel: "Energía libre G (kJ/mol, G_{A} = 0)", aria: "Perfiles sin catalizar y catalizado" });
      function upd() {
        var g0 = sG.get(), du = sU.get(), dd = sD.get(), gi = sI.get(), T = sT.get();
        var dc = Math.max(du - dd, Math.max(0, g0) + 1), msg = "";
        var unc = TC.smooth([{ x: 0, y: 0 }, { x: 0.5, y: du }, { x: 1, y: g0 }], 40);
        var one = TC.smooth([{ x: 0, y: 0 }, { x: 0.5, y: dc }, { x: 1, y: g0 }], 40);
        // dos pasos: A → (TS1) → I (ES) → (TS2) → B ; los estados de transición se colocan por encima de sus vecinos
        var I = Math.min(gi, dc - 2);                       // el intermediario queda por debajo del pico más alto
        var TS2 = Math.max(dc, Math.max(0, g0) + 1, I + 2), TS1 = Math.max(0.6 * dc, I + 2, 2);
        var two = TC.smooth([{ x: 0, y: 0 }, { x: 0.2, y: TS1 }, { x: 0.5, y: I }, { x: 0.78, y: TS2 }, { x: 1, y: g0 }], 30);
        var spanFree = Math.max(TS1, TS2), spanES = TS2 - I;  // barrera desde E + S libres (kcat/Km) y desde ES (kcat, sustrato saturante)
        var lines = [], top = du;
        if (mode === "unc" || mode === "both") lines.push({ x: unc.x, y: unc.y, color: "c1", width: 3, dash: mode === "both" ? "" : "", label: "no catalizada" });
        if (mode === "one" || mode === "both") lines.push({ x: one.x, y: one.y, color: "c2", width: 3, label: "catalizada (1 paso)" });
        if (mode === "two" || mode === "both") lines.push({ x: two.x, y: two.y, color: "c4", width: 3, dash: "dash", label: "catalizada con ES y EP" });
        var ymax = Math.max(du, TS2) + 25, ymin = Math.min(g0, I, 0) - 25;
        ch.update({ ylim: [ymin, ymax], lines: lines, hlines: [{ y: 0, color: "c7", dash: "dot" }, { y: g0, color: "c7", dash: "dot" }], notes: [{ x: 0.01, y: -9, text: "A (E + S)", color: "c7" }, { x: 0.99, y: g0 - 10, text: "B (E + P)", color: "c7", anchor: "end" }].concat(mode === "two" || mode === "both" ? [{ x: 0.5, y: I - 12, text: "ES ⇌ EP (intermediarios)", color: "c4", anchor: "middle" }] : []) });
        var ddEff = du - Math.min(dc, 1e9), fac = M.accel(ddEff, T);
        var out = TC.stat("ΔG° (sin y con enzima)", TC.num(g0, 3), "kJ/mol") + TC.stat("K′eq (sin y con enzima)", TC.num(M.keq(g0, T), 3), "idéntica") + TC.stat("ΔG‡ catalizada (1 paso)", TC.num(dc, 3), "kJ/mol") +
          TC.stat("Aceleración e^(ΔΔG‡/RT)", TC.num(fac, 3), "×") + TC.stat("k sin catalizar", TC.num(M.eyring(du, T), 3), "s⁻¹") + TC.stat("k catalizada", TC.num(M.eyring(dc, T), 3), "s⁻¹") +
          (mode === "two" || mode === "both" ? TC.stat("Con ES: barrera desde E+S libres", TC.num(spanFree, 3), "kJ/mol") + TC.stat("Con ES: barrera desde ES (sustrato saturante)", TC.num(spanES, 3), "kJ/mol") : "");
        root.querySelector("#out").innerHTML = out;
        root.querySelector("#msg").innerHTML = (dd > du - Math.max(0, g0) - 1 ? TC.callout("bad", "Aviso", "<p>La barrera no puede quedar por debajo del nivel de los productos; se limita a ΔG‡ = " + TC.numPlain(Math.max(0, g0) + 1) + " kJ/mol.</p>") : "") +
          '<p class="small">La enzima <b>no</b> cambia ΔG° ni K′eq: mueve la reacción hacia el equilibrio más rápido, en ambos sentidos. El factor 10³–10¹² de la diap. 19 equivale a ΔΔG‡ = ' + TC.numPlain(M.C.R * T * Math.log(1e3) / 1000, 3) + " – " + TC.numPlain(M.C.R * T * Math.log(1e12) / 1000, 3) + " kJ/mol a " + TC.numPlain(T, 5) + " K.</p>";
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Triosafosfato isomerasa con un análogo del intermediario (7TIM).</b> El fosfoglicolohidroxamato (PGH) se parece al <i>cis</i>-enediol de la reacción: según el título del PDB es «un análogo del intermediario en la ruta de reacción». Una enzima une el estado de transición/intermediario <i>más fuerte</i> que el sustrato; por eso los análogos de ese tipo son buenos inhibidores y sirven para «ver» el sitio activo en acción. Los dos contactos de abajo están medidos en el archivo.</p>" +
        TC.rxn(["mol:enediol", { arrow: { top: "se parece a", bottom: "", dir: "≈" } }, "mol:pgh"]) +
        '<p class="small">Enediol <span class="unverified">[no verificado]</span> (sin entrada en bases de datos); PGH ' + TC.badge("verificado") + " (CCD + PubChem).</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "7TIM", focus: [{ chain: "A", resi: 165, label: "Glu165" }, { chain: "A", resi: 95, label: "His95" }], ligands: [{ resn: "PGH", label: "PGH" }], distances: ["glu165_n2", "his95_o1"] });
    },
    quiz: [
      { q: "Una enzima acelera una reacción 10⁶ veces. ¿Qué ocurre con su Keq?", o: ["Aumenta 10⁶ veces", "Disminuye 10⁶ veces", "No cambia", "Se invierte"], c: 2, e: "Una enzima no cambia ΔG° ni Keq; solo baja las barreras en ambos sentidos (diap. 27)." },
      { q: "¿Qué distingue un intermediario (ES, EP) de un estado de transición?", o: ["El intermediario es un mínimo local de energía libre; el estado de transición es un máximo", "Son lo mismo", "El estado de transición es más estable", "El intermediario no tiene energía"], c: 0, e: "Diap. 28: el estado de transición es el máximo; el intermediario (A*) es un mínimo en el camino." },
      { q: "¿Puede una enzima hacer que una reacción con ΔG &gt; 0 avance sin acoplarla a otra?", o: ["Sí, bajando la barrera", "No: no promueve reacciones no espontáneas (diap. 19)", "Sí, si hay cofactor", "Solo si hay ATP en cantidad estequiométrica"], c: 1, e: "Las enzimas no cambian el signo de ΔG; las reacciones endergónicas se acoplan a otras exergónicas (sección 11)." }
    ],
    beyondTitle: "Por qué bajar la barrera: unión preferente del estado de transición",
    beyond: function (el) {
      el.innerHTML = "<p>Si la enzima une el estado de transición con constante de disociación K<sub>TS</sub> mucho menor que la del sustrato K<sub>S</sub>, la aceleración es ≈ K<sub>S</sub>/K<sub>TS</sub>. Esto hace que la «energía de unión» no se pierda en un complejo ES excesivamente estable (que de hecho <i>aumentaría</i> la barrera efectiva medida desde ES; el deslizador de «profundidad del intermediario» lo muestra en el camino de dos pasos). En el perfil con intermediarios, la velocidad global la fijan el estado de reposo más estable y el estado de transición más alto después de él (idea de «energy span»).</p><p class=\"small\">Los perfiles son curvas didácticas (interpolación suave entre puntos clave); los valores numéricos de ΔG‡ son los que fijas.</p>";
    },
    sources: "<p>Diap. 18–19, 27–28, 31 del profe (la diap. 31 es una captura de un video de «Education Portal»: no se reproduce). Estructura 7TIM: Davenport <i>et al.</i> 1991, Biochemistry 30:5821 (doi:10.1021/bi00238a002) " + TC.badge("verificado") + ". La frase «análogo del intermediario» es el título del PDB; que los análogos del estado de transición se unan con más afinidad que el sustrato es un principio de la enzimología (Pauling) citado sin verificar en esta sesión.</p>"
  });
})(window.TC);
