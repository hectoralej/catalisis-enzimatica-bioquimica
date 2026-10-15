/* S20 — Autoevaluación y hoja de fórmulas */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  /* Preguntas adicionales (las demás se toman de los cuestionarios de las secciones 2–19) */
  var EXTRA = [
    { sec: "s05", make: function (r) { var k = 3 + Math.round(r() * 6); return { q: "Una enzima acelera una reacción 10<sup>" + k + "</sup> veces a 298,15 K. ¿Cuánto bajó la barrera (ΔΔG‡, kJ/mol)?", ans: M.C.R * 298.15 * Math.log(Math.pow(10, k)) / 1000, unit: "kJ/mol", tol: 0.02, abs: 0.2, e: function () { return "ΔΔG‡ = RT ln(10^" + k + ") = " + TC.num(M.C.R * 298.15 * Math.log(Math.pow(10, k)) / 1000, 4) + " kJ/mol."; } }; } },
    { sec: "s15", make: function (r) { var V = Math.round(30 + r() * 150), E = Math.round(1 + r() * 9); return { q: "Vmax = " + V + " µM/min con [E]<sub>t</sub> = " + E + " nM. Calcula k<sub>cat</sub> (s⁻¹).", ans: V / 60 / (E * 1e-3), unit: "s⁻¹", tol: 0.02, abs: 0.05, e: function () { return "kcat = Vmax/[E]t = (" + V + "/60 µM/s)/(" + E + " nM = " + E * 1e-3 + " µM) = " + TC.num(V / 60 / (E * 1e-3), 4) + " s⁻¹."; } }; } },
    { sec: "s18", make: function (r) { var K = Math.round((0.1 + r() * 0.8) * 100) / 100, I = Math.round(1 + r() * 4), Kp = Math.round(1 + r() * 4); return { q: "Inhibición acompetitiva: Km = " + K + " mM, [I] = " + I + " mM, Ki′ = " + Kp + " mM. ¿Cuánto vale la Km aparente (mM)?", ans: K / (1 + I / Kp), unit: "mM", tol: 0.01, abs: 0.003, e: function () { return "Km_ap = Km/α′ = " + K + "/(1 + " + I + "/" + Kp + ") = " + TC.num(K / (1 + I / Kp), 4) + " mM."; } }; } },
    { sec: "s18", make: function (r) { var V = Math.round(40 + r() * 160), K = Math.round((0.1 + r() * 0.8) * 100) / 100; return { q: "En Lineweaver–Burk (competitiva con α = 3): Vmax = " + V + " µM/min y Km = " + K + " mM. ¿Cuánto vale la <i>pendiente</i> (en min·mM/µM)?", ans: 3 * K / V, unit: "min·mM/µM", tol: 0.02, abs: 0.0002, e: function () { return "pendiente = Km·α/Vmax = " + K + "·3/" + V + " = " + TC.num(3 * K / V, 4) + "; la ordenada (1/Vmax) no cambia."; } }; } },
    { sec: "s11", make: function (r) { var g = Math.round(r() * 40 + 5); return { q: "Una reacción endergónica con ΔG°′ = +" + g + " kJ/mol se acopla a la hidrólisis de ATP (ΔG°′ = −30,5 kJ/mol). ¿Cuánto vale ΔG°′ total (kJ/mol)?", ans: g - 30.5, unit: "kJ/mol", tol: 0.01, abs: 0.1, e: function () { return "Suma de ΔG°′: " + g + " + (−30,5) = " + (g - 30.5) + " kJ/mol: " + (g - 30.5 < 0 ? "el acople funciona." : "no funciona en condiciones estándar."); } }; } },
    { sec: "s16", q: "En Eadie–Hofstee (v frente a v/[S]), la pendiente vale…", o: ["Vmax", "−Km", "1/Vmax", "Km/Vmax"], c: 1, e: "v = Vmax − Km·(v/[S]): pendiente −Km, ordenada Vmax." },
    { sec: "s12", q: "En la célula, ¿cuál de estos pares transfiere <i>hidruros</i> según el profe?", o: ["NAD⁺/NADH", "FAD/FADH₂", "ADP/ATP", "Mg²⁺/Mg"], c: 0, e: "Diap. 38: derivados de nicotinamida, transferencia de hidruros; la flavina transfiere átomos de hidrógeno (diap. 39)." },
    { sec: "s09", q: "La parte proteica de una enzima, sin su cofactor, se llama…", o: ["Holoenzima", "Apoenzima", "Grupo prostético", "Coenzima"], c: 1, e: "Apoenzima + cofactor = holoenzima (diap. 23 y 25)." },
    /* «Encuentra el error» (práctica: no cuentan para el puntaje) basadas en las dudas */
    { prac: true, sec: "s02", q: "<b>Duda 1 (diap. 12–14):</b> «2 H₂O₂ → 2 H₂O + O₂: ΔG° = −116,78 kJ/mol y ΔH° = −196,0 kJ/mol». ¿Cuál es el problema?", o: ["−116,78 es por 1 mol de H₂O₂ y −196,0 por la ecuación escrita (2 H₂O₂): bases distintas", "ΔH debería ser positivo", "Falta el signo de ΔS", "Ninguno"], c: 0, e: "Por la ecuación escrita ΔG° = 2·(−116,78) = −233,56 kJ; ΔH° calculado de tablas de formación (−196,06 kJ) coincide con la ecuación escrita." },
    { prac: true, sec: "s05", q: "<b>Duda 2 (diap. 15):</b> «La hidrólisis del enlace fosfodiéster del ADN tiene una vida media de 6 millones de años».", o: ["La cifra no se corresponde con la del artículo citado en la literatura (30 millones de años para un diéster modelo) y falta la referencia", "Es exacta", "Es 6 segundos", "Es 6 años"], c: 0, e: "Schroeder 2006 (resumen): dineopentilfosfato, t½ = 30 000 000 años a 25 °C." },
    { prac: true, sec: "s13", q: "<b>Duda 6 (diap. 45):</b> la enolasa se dibuja con el sustrato CH₃–CH(OPO₃²⁻)–COO⁻.", o: ["El sustrato real es 2-fosfoglicerato (CH₂OH en C3)", "Es 3-fosfoglicerato", "Es piruvato", "Es correcto"], c: 0, e: "Solo con CH₂OH la deshidratación a PEP + H₂O queda balanceada." },
    { prac: true, sec: "s13", q: "<b>Duda 7 (diap. 46):</b> «glucosa-1-fosfato ⇌ fructosa-1-fosfato» con «fosfohexosa isomerasa».", o: ["Es glucosa-6-fosfato ⇌ fructosa-6-fosfato (E.C. 5.3.1.9)", "Es correcto", "Es glucosa-1-fosfato ⇌ glucosa-6-fosfato", "Es una ligasa"], c: 0, e: "Lo dibujado y la enzima corresponden a G6P ⇌ F6P." },
    { prac: true, sec: "s09", q: "<b>Duda 9 (diap. 23):</b> «La glioxalasa I humana necesita dos iones de zinc».", o: ["Es correcto para el dímero: 2 Zn, uno por sitio activo (medido en 1QIN)", "Es falso: tiene 4", "Es falso: no tiene Zn", "Es falso: tiene 1 por dímero"], c: 0, e: "En 1QIN: Zn A401 y B301, cada uno coordinado por residuos de las dos subunidades." },
    { prac: true, sec: "s03", q: "<b>Duda 13 (diap. 7):</b> «ΔrG es el cambio de energía a condiciones estándares».", o: ["La energía libre estándar es ΔrG° (ΔrG°′ a pH 7); ΔrG es la real y es la que vale 0 en el equilibrio", "Es exacto", "ΔG = ΔG° siempre", "ΔG° vale 0 en el equilibrio"], c: 0, e: "ΔG = ΔG° + RT ln Q." },
    { prac: true, sec: "s16", q: "<b>Duda 16 (diap. 57):</b> la ecuación aparece como «v = V_mx·s/(Km + s)».", o: ["Es una errata: debe ser Vmax·[S]/(Km + [S])", "Es correcta", "Debería ser Vmin", "Debería llevar [E]"], c: 0, e: "Errata tipográfica." },
    { prac: true, sec: "s02", q: "<b>Duda 17 (diap. 6):</b> «un sistema llega al equilibrio con máxima entropía y mínima entalpía».", o: ["A T y P constantes el equilibrio es el mínimo de G = H − TS, no de H y S por separado", "Es exacto", "Es el máximo de G", "Es el mínimo de S"], c: 0, e: "Simplificación de la diapositiva." },
    { prac: true, sec: "s07", q: "<b>Duda 19 (diap. 22):</b> «before/after glucose binding» muestra…", o: ["Una enzima sin nombre en la diapositiva (se atribuye a la hexoquinasa); aquí se usa la adenilato quinasa 4AKE→1AKE", "La TIM", "La catalasa", "El ribosoma"], c: 0, e: "La figura no identifica la proteína." },
    { prac: true, sec: "s18", q: "<b>Duda 14 (diap. 64):</b> el profe describe un único esquema «no competitivo».", o: ["La pura (Ki = Ki′) es rara; lo común es la inhibición mixta", "La pura es la más común", "No existen inhibidores no competitivos", "Es lo mismo que competitiva"], c: 0, e: "En la mixta las rectas de Lineweaver–Burk se cortan fuera de los ejes." }
  ];
  var FORM = [
    ["Termodinámica", [
      ["\\Delta_rG=\\Delta_rH-T\\,\\Delta_rS", "ΔrG, ΔrH en kJ/mol; ΔrS en J/(mol·K) (dividir entre 1000); T en K"],
      ["\\Delta G=0\\ (\\text{equilibrio}),\\quad \\Delta G<0\\ (\\text{espontánea}),\\quad \\Delta G>0\\ (\\text{no espontánea})", "diap. 8"],
      ["\\Delta G^{\\circ\\prime}=-RT\\ln K'_{eq}", "R = 8,314 J/(mol·K); T en K"],
      ["\\Delta G=\\Delta G^{\\circ\\prime}+RT\\ln Q,\\quad Q=\\dfrac{[\\text{productos}]}{[\\text{reactivos}]}", "kJ/mol; ΔG = 0 cuando Q = K′eq"],
      ["\\Delta G^{\\circ\\prime}_{T}=\\Delta G^{\\circ\\prime}_{1}+\\Delta G^{\\circ\\prime}_{2}+\\dots", "aditividad en reacciones secuenciales/acopladas (diap. 32)"],
      ["\\Delta G_{hidr}=\\Delta G^{\\circ\\prime}+RT\\ln\\dfrac{[ADP][P_i]}{[ATP]}", "ΔG°′(ATP) = −30,5 kJ/mol (profe); concentraciones en M"],
      ["\\Delta G^{\\circ\\prime}=-nF\\,\\Delta E^{\\circ\\prime}", "n = nº de electrones; F = 96,485 kJ/(V·mol); ΔE°′ en V"]]],
    ["Velocidad y barreras", [
      ["k=\\dfrac{k_BT}{h}\\,e^{-\\Delta G^{\\ddagger}/RT}", "Eyring; k en s⁻¹; k_BT/h = 6,21×10¹² s⁻¹ a 298,15 K"],
      ["t_{1/2}=\\dfrac{\\ln 2}{k}", "1.er orden"],
      ["K=\\dfrac{k_1}{k_{-1}},\\quad \\Delta G^{\\ddagger}_{1}-\\Delta G^{\\ddagger}_{-1}=\\Delta G^{\\circ}", "diap. 10"],
      ["\\text{aceleración}=e^{\\Delta\\Delta G^{\\ddagger}/RT}", "ΔΔG‡ = reducción de la barrera por la enzima (la enzima no cambia ΔG° ni K)"],
      ["v_0=k_1[A]_0\\ (\\text{sin catálisis})", "diap. 52; µM/min si k en min⁻¹ y [A] en µM"],
      ["[P](t)=[P]_{eq}\\left(1-e^{-(k_1+k_{-1})t}\\right)", "A ⇌ P, 1.er orden"]]],
    ["Cinética enzimática", [
      ["v_0=\\dfrac{V_{max}[S]}{K_m+[S]}", "Michaelis–Menten; v₀ y Vmax en µM/min (o M/s); Km y [S] en la misma unidad"],
      ["K_m=\\dfrac{k_{-1}+k_2}{k_1},\\quad V_{max}=k_{cat}[E]_t,\\quad k_{cat}=k_2", "Briggs–Haldane; kcat en s⁻¹; Km en M"],
      ["\\dfrac{k_{cat}}{K_m}", "constante de especificidad; M⁻¹ s⁻¹ (límite de difusión ≈ 10⁸–10⁹, cifra de libro)"],
      ["1\\,\\text{UI}=1\\,\\mu\\text{mol/min};\\ 1\\,\\text{kat}=1\\,\\text{mol/s}=6\\times10^{7}\\,\\text{UI}", "diap. 56"],
      ["\\dfrac{1}{v}=\\dfrac{K_m}{V_{max}}\\dfrac{1}{[S]}+\\dfrac{1}{V_{max}}", "Lineweaver–Burk: pendiente Km/Vmax; ordenada 1/Vmax; corte en x = −1/Km (diap. 57)"],
      ["v=V_{max}-K_m\\dfrac{v}{[S]},\\qquad \\dfrac{[S]}{v}=\\dfrac{[S]}{V_{max}}+\\dfrac{K_m}{V_{max}}", "Eadie–Hofstee y Hanes–Woolf"]]],
    ["Inhibición", [
      ["\\alpha=1+\\dfrac{[I]}{K_i},\\quad \\alpha'=1+\\dfrac{[I]}{K_i'}", "Ki (con E) y Ki′ (con ES) en la misma unidad que [I]"],
      ["v=\\dfrac{V_{max}[S]}{K_m\\alpha+[S]\\alpha'}", "caso general (mixta)"],
      ["\\dfrac{1}{v}=\\dfrac{K_m\\alpha}{V_{max}}\\dfrac{1}{[S]}+\\dfrac{\\alpha'}{V_{max}}", "pendiente Kmα/Vmax; ordenada α′/Vmax"],
      ["\\text{Competitiva}(\\alpha'=1):\\ V_{max,ap}=V_{max},\\ K_{m,ap}=K_m\\alpha", "rectas LB se cortan en el eje y"],
      ["\\text{Acompetitiva}(\\alpha=1):\\ V_{max,ap}=V_{max}/\\alpha',\\ K_{m,ap}=K_m/\\alpha'", "rectas LB paralelas"],
      ["\\text{No competitiva pura}(\\alpha=\\alpha'):\\ V_{max,ap}=V_{max}/\\alpha,\\ K_{m,ap}=K_m", "rectas LB se cortan en el eje x"],
      ["k_{obs}=\\dfrac{k_{inact}[I]}{K_I+[I]},\\quad \\text{actividad}=e^{-k_{obs}t}", "inhibición irreversible (modelo simple); k en min⁻¹"]]],
    ["pH y temperatura (modelos didácticos)", [
      ["v\\propto \\dfrac{1}{1+[H^+]/K_{a1}+K_{a2}/[H^+]},\\quad pH_{opt}=\\dfrac{pK_{a1}+pK_{a2}}{2}", "dos grupos ionizables"],
      ["v(T)=k(T)\\cdot f_{nativa}(T),\\quad f_{nativa}=\\dfrac{1}{1+e^{-\\Delta G_u/RT}},\\ \\Delta G_u=\\Delta H_u(1-T/T_m)", "dos estados; k(T) de Eyring"]]]
  ];
  TC.addSection({
    id: "s20", title: "Autoevaluación y hoja de fórmulas", short: "Autoevaluación y fórmulas", diaps: "Repaso de todo el recurso (diap. 1–65)",
    essentials: [
      "El banco reúne <b>todas las preguntas de las secciones 2–19</b> y otras adicionales: opción múltiple, <b>numéricas con valores aleatorios</b> (cada variante recalcula) y «<b>encuentra el error</b>», basadas en las imprecisiones de las diapositivas (marcadas como <i>práctica</i>: no cuentan para el puntaje).",
      "Cada respuesta da retroalimentación inmediata, con la explicación y un enlace a la sección.",
      "Al final hay una <b>hoja de fórmulas de una página</b> para imprimir, con todas las ecuaciones del recurso, sus variables y sus unidades.",
      "Recuerda: para el examen usa las <b>versiones del profe</b>; las dudas se estudian para saber en qué difieren de la literatura."
    ],
    interactive: function (root) {
      root.innerHTML = '<div class="row"><b>Modo:</b><span id="md"></span><span id="flt"></span></div><div id="score" class="readout"></div><div id="qz"></div>';
      var all = [], i, j;
      TC.sections.forEach(function (s) { if (s.id === "s01" || s.id === "s20") return; (s.quiz || []).forEach(function (q, k) { var c = Object.assign({}, q); c.sec = s.id; all.push(c); }); });
      EXTRA.forEach(function (q) { all.push(q); });
      var nTotal = all.length, mode = "exam", sec = "all", right = 0, tried = 0, key = 0;
      var sg = TC.seg([["exam", "Examen aleatorio (12)"], ["all", "Todas las preguntas"], ["prac", "Solo «encuentra el error»"]], "exam", function (v) { mode = v; build(); }, "modo");
      root.querySelector("#md").appendChild(sg.el);
      var opts = [["all", "todas las secciones"]].concat(TC.sections.filter(function (s) { return s.id !== "s01" && s.id !== "s20"; }).map(function (s) { return [s.id, "S" + s.n + " " + (s.short || s.title)]; }));
      var sel = TC.select(opts, "all", function (v) { sec = v; build(); }); root.querySelector("#flt").appendChild(sel);
      function pick() {
        var pool = all.filter(function (q) { return (sec === "all" || q.sec === sec) && (mode === "prac" ? q.prac : mode === "exam" ? !q.prac : true); });
        if (mode === "exam") { pool = pool.slice(); for (i = pool.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; } pool = pool.slice(0, 12); }
        return pool;
      }
      function score() { root.querySelector("#score").innerHTML = TC.stat("Banco", nTotal, "preguntas (" + all.filter(function (q) { return q.prac; }).length + " de práctica «encuentra el error»)") + TC.stat("Aciertos en esta sesión", right + " de " + tried, "(sin contar práctica)") + TC.stat("Puntaje", tried ? TC.num(100 * right / tried, 3) : "—", "%"); }
      function build() { right = 0; tried = 0; score(); var qz = root.querySelector("#qz"); qz.innerHTML = ""; var pool = pick(); if (!pool.length) { qz.innerHTML = "<p>No hay preguntas con ese filtro.</p>"; return; } TC.quiz(qz, pool, "x" + (++key), { noStore: true, onAnswer: function (ok, prac) { if (!prac) { tried++; if (ok) right++; score(); } } }); }
      build();
      root.appendChild(TC.h('<div style="margin-top:14px"><button type="button" class="btn" id="re">Nuevo examen</button></div>'));
      root.querySelector("#re").addEventListener("click", function () { build(); });
    },
    example: function (root) {
      var meta = window.STRUCTMETA || {}, ids = Object.keys(meta), SEC = { "1NEY": "S10", "7TIM": "S6, S10", "4AKE": "S7", "1AKE": "S7", "1I10": "S12", "6ADH": "S9, S12", "1EMD": "S13", "1KIF": "S12", "5CPA": "S9, S13", "4V40": "S8, S13", "1ONE": "S13", "1IAT": "S13", "3BG3": "S13", "1CA2": "S9, S15", "1QIN": "S9", "1DGF": "S5, S9", "1ATP": "S11", "1U72": "S18", "4PH9": "S18", "1BT3": "S17", "4CHA": "S15", "1A49": "S9, S10", "5FPQ": "S19", "5F19": "S19", "1VRT": "S18" };
      root.innerHTML = "<p><b>Índice de las estructuras reales usadas</b> (todas verificadas por programa contra RCSB; enlace a la entrada y a la publicación):</p>" +
        TC.table(["ID", "Proteína (título RCSB)", "Organismo", "Resolución (Å)", "Ligandos", "Secciones", "Publicación"], ids.map(function (id) { var m = meta[id]; return ['<a href="https://www.rcsb.org/structure/' + id + '" target="_blank" rel="noopener"><b>' + id + "</b></a>", m.titulo.replace(/\s+/g, " ").slice(0, 70), "<i>" + m.organismo.join("; ") + "</i>", m.res, m.ligandos.join(", "), SEC[id] || "", m.doi ? '<a href="https://doi.org/' + m.doi + '" target="_blank" rel="noopener">doi</a>' : ""]; })) +
        "<p class=\"small\">Estado de verificación: " + TC.badge("verificado") + " (existencia, título, organismo, ligandos, residuos y distancias). Detalle: <code>reportes/verificacion_estructuras.md</code>.</p>";
    },
    quiz: [
      { q: "Para el examen, cuando una diapositiva contiene una imprecisión señalada con «⚠ Verificar con el profe», ¿qué conviene usar?", o: ["La versión de la literatura siempre", "La versión del profe, conociendo en qué difiere de la literatura", "Ninguna", "La versión de otro libro"], c: 1, e: "El recurso muestra ambas: la del profe es la que se evaluará; la otra sirve para entender la diferencia." },
      { q: "¿Qué parte del recurso agrupa las ecuaciones con sus unidades para estudiar?", o: ["La hoja de fórmulas de esta sección", "La sección 4", "Solo las diapositivas", "El visor 3D"], c: 0, e: "Hoja de fórmulas imprimible, abajo." }
    ],
    beyondTitle: "Cómo estudiar con este recurso",
    beyond: function (el) {
      el.innerHTML = "<p>Sugerencia: (1) lee «Lo esencial» y compara con las diapositivas; (2) mueve los deslizadores hasta predecir el efecto <i>antes</i> de verlo; (3) contesta «Compruébalo» y repasa los errores; (4) usa «encuentra el error» para entrenar la lectura crítica; (5) imprime la hoja de fórmulas y repasa unidades (kJ/mol vs J/(mol·K), µM/min vs M/s).</p>" + TC.callout("note", "Ver también", "<p>Todas las dudas se indexan en la sección 1 (bloque «Más allá del profe»).</p>");
    },
    sources: "<p>Las preguntas derivan del contenido de las secciones 2–19 (con sus fuentes). Valores numéricos aleatorios: calculados con <code>web/js/math.js</code>. Las preguntas «encuentra el error» están basadas en las dudas 1, 2, 6, 7, 9, 13, 14, 16, 17 y 19 (y las que ya aparecen en cada sección: 4, 5, 8, 10, 11, 12).</p>"
  });
  /* Hoja de fórmulas imprimible: se inyecta como bloque adicional */
  var def = TC.sections[TC.sections.length - 1], baseExample = def.example;
  def.example = function (root) {
    baseExample(root);
    var sheet = TC.h('<div id="fx-sheet" class="fx-page" style="margin-top:26px"><div class="row" style="justify-content:space-between"><h2 style="border:0;margin:0">Hoja de fórmulas</h2><button type="button" class="btn" id="prn">🖨 Imprimir esta hoja</button></div><p class="small">Bioquímica · Semana 6 — bases termodinámicas y cinéticas de la catálisis enzimática. Unidades: energía en kJ/mol, entropía en J/(mol·K), T en K, R = 8,314 J/(mol·K), F = 96,485 kJ/(V·mol).</p></div>');
    FORM.forEach(function (g) {
      sheet.appendChild(TC.h("<h2>" + g[0] + "</h2>"));
      sheet.appendChild(TC.h('<div class="tablewrap"><table class="data"><tbody>' + g[1].map(function (r) { return "<tr><td style=\"width:48%\">$$" + r[0] + "$$</td><td class=\"small\">" + r[1] + "</td></tr>"; }).join("") + "</tbody></table></div>"));
    });
    root.appendChild(sheet); TC.renderMath(sheet);
    sheet.querySelector("#prn").addEventListener("click", function () { document.body.classList.add("print-fx"); window.print(); setTimeout(function () { document.body.classList.remove("print-fx"); }, 500); });
  };
})(window.TC);
