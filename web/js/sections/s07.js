/* S7 — Sitio activo y modelos de unión (diap. 20–22) */
(function (TC) {
  "use strict";
  var N = 60;
  function shape(r0, a, k, rot) { var pts = []; for (var i = 0; i < N; i++) { var th = i / N * 2 * Math.PI, r = r0 + a * Math.cos(k * (th - rot)); pts.push([r * Math.cos(th), r * Math.sin(th)]); } return pts; }
  var SUB = shape(25, 9, 3, 0.4), BLOB = shape(38, 0, 3, 0);
  function lerpPts(A, B, t) { return A.map(function (p, i) { return [p[0] + (B[i][0] - p[0]) * t, p[1] + (B[i][1] - p[1]) * t]; }); }
  function poly(pts, cx, cy) { return pts.map(function (p, i) { return (i ? "L" : "M") + (cx + p[0]).toFixed(1) + " " + (cy + p[1]).toFixed(1); }).join("") + "Z"; }
  /* t en [0,1]: 0 libre · .5 el sustrato llega · .78 ES→EP · 1 se liberan los productos */
  function scheme(induced, t, id) {
    var px = 190, py = 100, approach = TC.clamp(t / 0.5, 0, 1), ease = approach * approach * (3 - 2 * approach), sx = 345 - (345 - px) * ease, sy = py + (1 - ease) * 30;
    var open = induced ? (1 - TC.clamp((t - 0.3) / 0.25, 0, 1)) : 0;                    // en el ajuste inducido el sitio se cierra alrededor del sustrato
    var leave = TC.clamp((t - 0.78) / 0.22, 0, 1), phase = t < 0.05 ? "E libre + S" : t < 0.5 ? "S se aproxima" : t < 0.78 ? "ES → EP" : "E + P";
    var pocket = lerpPts(SUB, BLOB, open), bodyW = induced ? 150 - 16 * (1 - open) : 150, shiftX = induced ? 10 * open : 0;
    var h = '<svg viewBox="0 0 400 200" class="chart" role="img" aria-label="' + (induced ? "Esquema del ajuste inducido" : "Esquema cerradura-llave") + '"><defs><mask id="mk' + id + '"><rect x="10" y="15" width="' + (bodyW + 30) + '" height="170" rx="30" fill="#fff"/><path d="' + poly(pocket, px - shiftX, py) + '" fill="#000"/></mask></defs>';
    h += '<rect x="10" y="15" width="' + (bodyW + 30) + '" height="170" rx="30" fill="var(--c4)" mask="url(#mk' + id + ')"/>';
    h += '<text x="70" y="108" font-size="26" font-weight="700" fill="var(--bg)">E</text>';
    if (leave < 0.01) h += '<path d="' + poly(SUB, sx, sy) + '" fill="var(--c3)" stroke="var(--text)" stroke-width="2"/><text x="' + sx + '" y="' + (sy + 6) + '" text-anchor="middle" font-size="18" font-weight="700" fill="var(--bg)">S</text>';
    else {
      var ax = px + 60 + leave * 90, ay = py - 40 - leave * 25, bx = px + 60 + leave * 70, by = py + 45 + leave * 25;
      h += '<circle cx="' + ax + '" cy="' + ay + '" r="20" fill="var(--c3)" stroke="var(--text)" stroke-width="2"/><text x="' + ax + '" y="' + (ay + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="var(--bg)">P₁</text>';
      h += '<path d="M' + bx + " " + (by - 22) + "l22 22l-22 22l-22 -22z" + '" fill="var(--c3)" stroke="var(--text)" stroke-width="2"/><text x="' + bx + '" y="' + (by + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="var(--bg)">P₂</text>';
    }
    h += '<text x="200" y="196" text-anchor="middle" font-size="12.5" fill="var(--muted)">' + phase + (induced && t > 0.3 && t < 0.78 ? " · la enzima cambia de forma" : !induced && t >= 0.05 && t < 0.78 ? " · enzima rígida" : "") + "</text></svg>";
    return h;
  }
  var AK = { core: 1.98, n: 146, segs: [[32, 66, 18.2], [120, 162, 23.6]], nmp: 11.3, lid: 15.5 };
  TC.addSection({
    id: "s07", title: "Sitio activo y modelos de unión", short: "Sitio activo y unión", diaps: "Diap. 20–22 (centro activo y especificidad; llave-cerradura vs ajuste inducido)",
    essentials: [
      "El <b>centro activo</b> es «una zona tridimensional en la que encaja el (o los) sustrato(s)»: una <b>pequeña porción</b> de la enzima, y de ahí la <b>especificidad por el sustrato</b> (diap. 20).",
      "<b>Modelo cerradura-llave</b>: el sitio activo ya tiene la forma del sustrato. <b>Ajuste inducido</b>: la unión del sustrato <i>cambia la conformación</i> de la enzima, que se acomoda al estado de transición (diap. 21).",
      "La diap. 22 muestra una enzima de dos dominios que se <b>cierra</b> alrededor de la glucosa al unirla: «before/after glucose binding». La proteína no está identificada en la diapositiva (duda 19); aquí se usa una pareja de estructuras reales y verificadas: la <b>adenilato quinasa</b> abierta (4AKE) y cerrada con un inhibidor bisustrato (1AKE).",
      "Tras la unión, el complejo ES se transforma y se libera el producto (diap. 21 y 26): E + S ⇌ ES → E + P."
    ],
    interactive: function (root) {
      root.innerHTML = '<p class="small">Esquemas propios (no se copia la figura de Nelson &amp; Cox). Recorre la reacción con el control; en el ajuste inducido observa cómo la enzima y su sitio cambian de forma.</p><div class="row"><div id="play"></div><div style="flex:1;min-width:240px" id="sl"></div></div><div class="grid2"><div><b>(a) Modelo cerradura-llave</b><div id="a"></div></div><div><b>(b) Modelo del ajuste inducido</b><div id="b"></div></div></div>';
      var t = 0, raf = null, playing = false, last = null;
      var sl = TC.slider({ label: "Progreso de la reacción", unit: "", min: 0, max: 1, step: 0.01, value: 0, dec: 2, onChange: function (v) { t = v; draw(); } });
      root.querySelector("#sl").appendChild(sl.el);
      var play = TC.button("▶ Reproducir", function () { playing = !playing; play.textContent = playing ? "⏸ Pausar" : "▶ Reproducir"; if (playing) { if (t >= 1) t = 0; last = null; raf = requestAnimationFrame(step); } else cancelAnimationFrame(raf); });
      root.querySelector("#play").appendChild(play);
      function step(ts) { if (last == null) last = ts; t = Math.min(1, t + (ts - last) / 7000); last = ts; sl.set(t, true); draw(); if (t < 1 && playing) raf = requestAnimationFrame(step); else { playing = false; play.textContent = "▶ Reproducir"; } }
      TC.cleanups.push(function () { playing = false; cancelAnimationFrame(raf); });
      function draw() { root.querySelector("#a").innerHTML = scheme(false, t, "a"); root.querySelector("#b").innerHTML = scheme(true, t, "b"); }
      draw();
    },
    example: function (root) {
      root.innerHTML = "<p><b>Adenilato quinasa de <i>E. coli</i>: forma abierta (4AKE) y cerrada (1AKE, con el inhibidor bisustrato Ap5A).</b> Las dos estructuras se superpusieron con PyMOL (<code>align</code> sobre los Cα del núcleo, residuos 1–29, 60–121 y 160–214) y se comprobó con Biopython. Elige <i>Abierta</i>, <i>Cerrada</i>, <i>Superpuestas</i> o la <i>Interpolación</i> (solo ilustrativa).</p>";
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { ids: ["4AKE", "1AKE"], focus: [{ chain: "A", resi: 13, label: "Lys13" }, { chain: "A", resi: 88, label: "Arg88" }], ligands: [{ resn: "AP5", label: "Ap5A" }], distances: ["arg88_ap5", "lys13_ap5"], zoom: {}, zoomOut: 1.15, ligandToggle: "Mostrar Ap5A" });
      root.appendChild(TC.h("<div class=\"callout good\"><span class=\"tag\">Medido: qué se mueve</span><p>Tras superponer el núcleo (RMSD " + AK.core + " Å, " + AK.n + " Cα), los <b>segmentos que se desplazan más de 4 Å</b> son los residuos <b>32–66</b> (hasta " + AK.segs[0][2] + " Å) y <b>120–162</b> (hasta " + AK.segs[1][2] + " Å). RMS de los Cα: región 30–59 = " + AK.nmp + " Å y región 122–159 = " + AK.lid + " Å.</p><p class=\"small\">Los límites 30–59 y 122–159 corresponden a los dominios que la literatura llama <i>NMP-binding</i> y <i>LID</i> (Müller <i>et al.</i> 1996, la referencia del PDB 4AKE); los nombres de dominio <span class=\"unverified\">[no verificado]</span> en el artículo. La <b>medición</b> (segmentos móviles y RMSD) sí es propia y reproducible: <code>scripts/pymol/ak_align.py</code>, sesión <code>reportes/ak_4AKE_1AKE.pse</code>.</p></div>"));
      root.appendChild(TC.h(TC.doubt(19)));
    },
    quiz: [
      { q: "En el modelo del ajuste inducido…", o: ["El sitio activo es rígido y complementario al sustrato", "El sustrato induce un cambio conformacional en la enzima (que se acomoda al estado de transición)", "La enzima no interactúa con el sustrato", "Solo ocurre con cofactores"], c: 1, e: "Diap. 21: en (b) la enzima cambia de forma al unir S («conformación del estado de transición»)." },
      { q: "¿Qué segmentos se mueven al pasar la adenilato quinasa de abierta a cerrada, según la medición de esta sección?", o: ["Solo el núcleo (CORE)", "Los segmentos ≈ 32–66 y ≈ 120–162", "Ninguno: la proteína es rígida", "El extremo C-terminal únicamente"], c: 1, e: "Tras superponer el núcleo (RMSD 1,98 Å), esos dos segmentos se desplazan hasta 18 y 24 Å." },
      { q: "El centro activo de una enzima es…", o: ["Toda la proteína", "Una pequeña porción tridimensional donde se une el sustrato y ocurre la catálisis", "El cofactor", "El extremo N-terminal"], c: 1, e: "Diap. 20: una pequeña porción de la enzima, con especificidad por el sustrato." }
    ],
    beyondTitle: "Selección conformacional vs ajuste inducido",
    beyond: function (el) {
      el.innerHTML = "<p>En la práctica, muchas enzimas muestrean sus conformaciones abierta y cerrada <i>antes</i> de unir ligando (selección conformacional); el ligando estabiliza la cerrada. Las dos imágenes límite (llave-cerradura y ajuste inducido) son extremos de un continuo. En la adenilato quinasa, la dinámica de los dominios móviles se ha relacionado con la velocidad catalítica en la literatura <span class=\"unverified\">[no verificado]</span> (no se consultó ninguna fuente en esta sesión).</p><p class=\"small\">La interpolación lineal entre 4AKE y 1AKE es solo ilustrativa: no es una trayectoria real.</p>";
    },
    sources: "<p>Diap. 20–22 del profe. 4AKE: Müller <i>et al.</i> 1996, Structure 4:147 (doi:10.1016/S0969-2126(96)00018-4); 1AKE: Müller <i>et al.</i> 1992, J Mol Biol 224:159 (doi:10.1016/0022-2836(92)90582-5) " + TC.badge("verificado") + ". Alineamiento: PyMOL 3.1.6.1 y Biopython (ambos RMSD 1,98 Å). Datos medidos en <code>datos/estructuras_manifest.json</code>.</p>"
  });
})(window.TC);
