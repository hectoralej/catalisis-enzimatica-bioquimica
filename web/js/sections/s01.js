/* S1 — Mapa del recurso (diap. 1–2) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  var MAP = [
    ["s02", "Termodinámica esencial y energía libre de Gibbs", "Diap. 4–8"], ["s03", "ΔG°′, Keq, Q y dirección de la reacción", "Diap. 8–9, 16–17"],
    ["s04", "Perfil de energía y estado de transición", "Diap. 9–11"], ["s05", "Termodinámica vs cinética", "Diap. 3, 12–15"],
    ["s06", "Qué hacen (y qué no hacen) las enzimas", "Diap. 18–19, 27–28, 31"], ["s07", "Sitio activo y modelos de unión", "Diap. 20–22"],
    ["s08", "Modelo de reacción E + S ⇌ ES → E + P", "Diap. 26"], ["s09", "Cofactores, coenzimas, apoenzima y holoenzima", "Diap. 23–25"],
    ["s10", "Mecanismo catalítico a nivel de residuos", "Diap. 29–30"], ["s11", "Acoplamiento energético, ATP y compuestos ricos en energía", "Diap. 32–37"],
    ["s12", "Coenzimas redox: NAD⁺/NADH y FAD/FADH₂", "Diap. 38–39"], ["s13", "Clasificación de las enzimas (E.C. 1–6)", "Diap. 40–48"],
    ["s14", "Cinética clásica y velocidad inicial", "Diap. 49–52"], ["s15", "Ecuación de Michaelis–Menten", "Diap. 53–56"],
    ["s16", "Linealizaciones y ajuste de datos", "Diap. 54, 57"], ["s17", "pH, temperatura y desnaturalización", "Diap. 58–59"],
    ["s18", "Inhibición reversible", "Diap. 60, 62–64"], ["s19", "Inhibición irreversible y casos", "Diap. 60–61, 65"], ["s20", "Autoevaluación y hoja de fórmulas", "—"], ["s21", "Práctica: completa la glucólisis (arrastrar y soltar)", "PDF Glycolysis 10A"]
  ];
  TC.addSection({
    id: "s01", title: "Mapa del recurso", short: "Mapa del recurso", diaps: "Diap. 1–2 · Semana 6, Prof. Juan J. Araya B., Bioquímica, UNA (II-2026)",
    essentials: [
      "<b>Objetivos del curso (diap. 2):</b> comprender las bases termodinámicas de los procesos enzimáticos; estudiar los tipos de inhibición enzimática; conocer los factores que afectan la cinética en presencia de distintos inhibidores; estudiar los usos del ATP.",
      "<b>Cómo está hecho:</b> cada sección tiene la misma plantilla — <i>Lo esencial</i>, <i>Interactivo</i>, <i>Ejemplo real</i>, <i>Compruébalo</i>, <i>Más allá del profe</i> y <i>Fuentes y estado de verificación</i>.",
      "<b>Qué es del profe y qué es extra:</b> todo lo que va más allá de las diapositivas está en bloques con la etiqueta <span class=\"tagb\" style=\"background:var(--purple);color:var(--bg);padding:0 8px;border-radius:99px;font-size:.75rem\">MÁS ALLÁ DEL PROFE</span>. El botón <b>«Más allá del profe»</b> de la barra superior los oculta todos.",
      "<b>Nada inventado:</b> las estructuras 3D son del PDB, comprobadas por programa; las moléculas 2D se generan desde SMILES contrastados en 2 fuentes. Las simulaciones con parámetros propios se rotulan <i>modelo didáctico, valores ilustrativos</i>; lo que no se pudo verificar lleva <span class=\"unverified\">[no verificado]</span>."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">Índice con progreso</h3><p class="small" style="color:var(--muted)">Las secciones que ya abriste aparecen con ✓. Tu progreso se guarda en este navegador (si el navegador lo permite).</p><div class="grid3" id="idx"></div>' +
        '<h3>Prueba los controles</h3><p>Todos los parámetros se pueden mover con el deslizador <i>o</i> escribiendo el valor (con validación de rango). Aquí, la constante de velocidad máxima posible según la teoría del estado de transición, k<sub>B</sub>T/h, en función de la temperatura:</p><div id="demo"></div>';
      var vis = TC.store.get("visited", {});
      root.querySelector("#idx").innerHTML = MAP.map(function (m, i) {
        return '<a class="card" style="text-decoration:none;color:inherit;display:block" href="#/' + m[0] + '"><b>' + (i + 2) + ". " + m[1] + "</b> " + (vis[m[0]] ? "✓" : "") + '<br><span class="small" style="color:var(--muted)">' + m[2] + "</span></a>";
      }).join("");
      var demo = root.querySelector("#demo"), out = TC.h("<div class=\"readout\"></div>"), cw = TC.h("<div></div>");
      var T = TC.slider({ label: "Temperatura <i>T</i>", unit: "K", min: 250, max: 400, step: 0.5, value: 298.15, dec: 2, onChange: upd });
      demo.appendChild(T.el); demo.appendChild(out); demo.appendChild(cw);
      var ch = new TC.Chart(cw, { xlim: [250, 400], ylim: [4e12, 9e12], xlabel: "T (K)", ylabel: "k_{B}T/h (s^{-1})", lines: [], aria: "kB T/h frente a la temperatura" });
      function upd() {
        var t = T.get(), k = M.C.kB * t / M.C.h, xs = [], ys = [];
        for (var x = 250; x <= 400; x += 5) { xs.push(x); ys.push(M.C.kB * x / M.C.h); }
        out.innerHTML = TC.stat("k<sub>B</sub>T/h", TC.num(k, 3), "s⁻¹") + TC.stat("Tiempo por «intento»", TC.num(1 / k * 1e12, 3), "ps");
        ch.update({ lines: [{ x: xs, y: ys, label: "k_{B}T/h", color: "c1" }], points: [{ x: t, y: k, label: TC.numPlain(k, 3).replace("e+12", "×10^{12}") + " s^{-1}", marker: "circle", color: "c2", dx: -8, anchor: "end" }] });
      }
      upd();
    },
    example: function (root) {
      root.innerHTML = "<p>Un primer vistazo a una estructura real y verificada: la <b>triosafosfato isomerasa</b> (TIM) de levadura con su sustrato DHAP, que estudiaremos en la sección 10. Prueba los botones: <i>etiquetar residuos</i>, <i>distancias medidas</i> (valores medidos en el archivo del PDB), <i>superficie</i> y la imagen de respaldo.</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "1NEY", focus: [{ chain: "A", resi: 165, label: "Glu165" }, { chain: "A", resi: 95, label: "His95" }], ligands: [{ resn: "13P", label: "DHAP" }], distances: ["glu165_c3", "his95_o2"] });
    },
    quiz: [
      { q: "Una cifra del recurso lleva la etiqueta «modelo didáctico, valores ilustrativos». ¿Qué significa?", o: ["Es un dato experimental de una base de datos", "Los parámetros de la simulación son inventados para enseñar el comportamiento, no mediciones", "Es la cifra que el profe usará en el examen", "Es un valor no verificado por error"], c: 1, e: "Se usan para ver cómo cambia una curva al mover un parámetro; los valores reales llevan fuente." },
      { q: "¿Qué hace el botón «Más allá del profe» de la barra superior?", o: ["Añade preguntas de examen", "Oculta o muestra los bloques de profundización que no están en las diapositivas", "Cambia el idioma", "Resetea tu progreso"], c: 1, e: "Así distingues lo que probablemente entra al examen (diapositivas) del enriquecimiento." },
      { q: "En la etiqueta «⚠ Verificar con el profe» aparecen dos versiones. ¿Cuál conviene usar en el examen?", o: ["La de la literatura", "La del profe, conociendo la diferencia", "Ninguna", "La más reciente"], c: 1, e: "Se muestra la versión del profe, la duda y la versión de la literatura; para el examen usa la del profe, sabiendo en qué difiere." }
    ],
    beyondTitle: "Las 20 dudas sobre las diapositivas",
    beyond: function (el) {
      el.innerHTML = "<p>En la extracción de las 65 diapositivas se detectaron imprecisiones. <b>No se corrigen en silencio</b>: cada una aparece en la sección donde corresponde con el aviso «⚠ Verificar con el profe». Índice:</p>" +
        TC.table(["#", "Diap.", "Duda", "Sección"], Object.keys(TC.DOUBTS).map(function (k) {
          var d = TC.DOUBTS[k], where = { 1: "s02", 2: "s05", 3: "s05", 4: "s11", 5: "s12", 6: "s13", 7: "s13", 8: "s13", 9: "s09", 10: "s16", 11: "s19", 12: "s17", 13: "s03", 14: "s18", 15: "s08", 16: "s16", 17: "s02", 18: "s11", 19: "s07", 20: "s09" }[k];
          return [k, d.diap, d.titulo, '<a href="#/' + where + '">' + where.replace("s", "S") + "</a>"];
        }));
    },
    sources: "<p>Contenido de las diapositivas: <code>contenido/01_extraccion_diapositivas.md</code> (65 diapositivas transcritas). Fuentes y verificación de estructuras: <code>datos/fuentes.md</code>, <code>reportes/verificacion_estructuras.md</code> y <code>reportes/verificacion_moleculas.md</code>. Estructura 1NEY: " + TC.badge("verificado") + ".</p><p>Las figuras de Nelson &amp; Cox (<i>Lehninger</i>) de las diapositivas <b>no se copian</b>: todo se redibuja (SVG propio, RDKit, PyMOL, 3Dmol.js).</p>"
  });
})(window.TC);
