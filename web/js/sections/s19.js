/* S19 — Inhibición irreversible y casos (diap. 60–61, 65) */
(function (TC) {
  "use strict";
  var M = window.TCMath;
  TC.addSection({
    id: "s19", title: "Inhibición irreversible y casos", short: "Inhibición irreversible", diaps: "Diap. 60–61 (inhibidores irreversibles; Tabla 11.4) y 65 (fosfolipasa A₂ y ácido araquidónico)",
    essentials: [
      "El inhibidor <b>irreversible</b> «se une covalentemente a la enzima y la inutiliza permanentemente» (diap. 60): la actividad no se recupera al diluir ni al dializar.",
      "Tabla 11.4 (diap. 61): <b>cianuro</b> (reacciona con iones metálicos de enzimas; blanco principal: la cadena respiratoria), <b>DFP</b>, <b>sarín</b>, <b>fisostigmina</b> y <b>paratión</b> (los cuatro últimos inhiben enzimas con serina en el sitio activo, como la acetilcolinesterasa).",
      "Cinética: mientras haya inhibidor, la actividad cae en el tiempo (modelo simple: $k_{obs}=\\dfrac{k_{inact}[I]}{K_I+[I]}$; actividad residual $e^{-k_{obs}t}$). La inhibición <b>reversible</b> alcanza un equilibrio rápido y se revierte al diluir.",
      "Caso (diap. 65): la <b>fosfolipasa A₂</b> libera <b>ácido araquidónico</b> de los fosfolípidos de membrana, que sigue la vía de la <b>lipoxigenasa</b> (leucotrienos, lipoxinas, hepoxilinas), de la <b>ciclooxigenasa</b> (prostaglandinas, prostaciclina, tromboxano, ácidos grasos hidroxilados) o la del citocromo P450 (ácidos epoxieicosatrienoicos…). <b>Más allá del profe:</b> la <b>aspirina</b> acetila la Ser530 de la COX (irreversible) y el <b>ibuprofeno</b> se une sin enlace covalente."
    ],
    interactive: function (root) {
      root.innerHTML = '<h3 style="margin-top:0">A · Irreversible (dependiente del tiempo) frente a reversible (se recupera al diluir)</h3><div id="ctl"></div><div id="out" class="readout"></div><div id="ch"></div>' +
        '<h3>B · Tabla 11.4 del profe, con estructuras 2D verificadas</h3><div id="tab"></div>';
      var ctl = root.querySelector("#ctl");
      var sk = TC.slider({ label: "k<sub>inact</sub> (irreversible)", unit: "min⁻¹", min: 0.01, max: 3, log: true, value: 0.5, onChange: upd });
      var sKI = TC.slider({ label: "K<sub>I</sub>", unit: "µM", min: 0.1, max: 1000, log: true, value: 20, onChange: upd });
      var sI = TC.slider({ label: "[I]", unit: "µM", min: 0.1, max: 2000, log: true, value: 20, onChange: upd });
      var sKi = TC.slider({ label: "K<sub>i</sub> (reversible, equilibrio rápido)", unit: "µM", min: 0.1, max: 1000, log: true, value: 20, onChange: upd });
      var sTd = TC.slider({ label: "Momento de la dilución 100×", unit: "min", min: 0, max: 20, step: 0.1, value: 8, dec: 1, onChange: upd });
      [sk, sKI, sI, sKi, sTd].forEach(function (s) { ctl.appendChild(s.el); });
      var ch = new TC.Chart(root.querySelector("#ch"), { w: 720, h: 360, xlim: [0, 20], ylim: [0, 1.05], xlabel: "tiempo (min)", ylabel: "actividad residual", aria: "Actividad residual: irreversible y reversible" });
      function upd() {
        var k = M.kobs(sk.get(), sKI.get(), sI.get()), I = sI.get(), Ki = sKi.get(), td = sTd.get(), xs = [], irr = [], rev = [], none = [], i, tmax = 20;
        for (i = 0; i <= 240; i++) {
          var t = tmax * i / 240, rr = t < td ? 1 / (1 + I / Ki) : 1 / (1 + I / 100 / Ki);
          xs.push(t); none.push(1); rev.push(rr);
          var a1 = t < td ? M.residualActivity(k, t) : M.residualActivity(k, td) * 1;  // tras diluir 100×, kobs cae ≈ 100 veces: la actividad perdida NO se recupera
          if (t >= td) { var kd = M.kobs(sk.get(), sKI.get(), I / 100); a1 = M.residualActivity(k, td) * M.residualActivity(kd, t - td); }
          irr.push(a1);
        }
        ch.update({ lines: [{ x: xs, y: none, color: "c7", dash: "dot", label: "sin inhibidor" }, { x: xs, y: irr, color: "c2", width: 3, label: "irreversible (covalente)", labelAt: 160 }, { x: xs, y: rev, color: "c1", width: 3, dash: "dash", label: "reversible", labelAt: 200, dy: 14 }], vlines: [{ x: td, label: "dilución 100×", color: "c5" }] });
        root.querySelector("#out").innerHTML = TC.stat("k<sub>obs</sub> = k<sub>inact</sub>[I]/(K<sub>I</sub> + [I])", TC.num(k, 3), "min⁻¹") + TC.stat("t½ de inactivación = ln 2/k<sub>obs</sub>", TC.num(Math.LN2 / k, 3), "min") + TC.stat("Reversible: actividad antes de diluir", TC.num(100 / (1 + I / Ki), 3), "%") + TC.stat("Reversible: tras diluir 100×", TC.num(100 / (1 + I / 100 / Ki), 3), "%") + TC.stat("Irreversible: actividad al diluir", TC.num(100 * M.residualActivity(k, td), 3), "% (no se recupera)") +
          '<div class="stat"><div class="k">Modelo</div><div class="v" style="font-size:.95rem"><span class="illustr">modelo didáctico, valores ilustrativos</span></div></div>';
      }
      upd();
      var T = [
        ["Cianuro", "cianuro|110", "Almendras amargas", "Reacciona con iones metálicos de enzimas (p. ej., Fe, Zn, Cu); sus dianas primarias son las enzimas de la cadena respiratoria"],
        ["Diisopropil fluorofosfato (DFP)", "dfp|230", "Sintético", "Inhibe enzimas con serina en el lugar activo, como la acetilcolinesterasa"],
        ["Sarín", "sarin|200", "Sintético (gas nervioso)", "Como el DFP"], ["Fisostigmina", "fisostigmina|250", "Semillas de <i>Physostigma venenosum</i>", "Como el DFP"],
        ["Paratión", "paration|260", "Sintético (insecticida)", "Como el DFP, pero especialmente inhibidor de la acetilcolinesterasa de insectos"]];
      root.querySelector("#tab").innerHTML = TC.table(["Nombre", "Estructura", "Origen", "Modo de acción (profe)"], T.map(function (r) { var p = r[1].split("|"); return ["<b>" + r[0] + "</b>", TC.mol(p[0], { w: +p[1], name: "" }), r[2], r[3]]; })) + TC.doubt(11);
    },
    example: function (root) {
      root.innerHTML = "<h3 style=\"margin-top:0\">Sarín y la acetilcolinesterasa (5FPQ)</h3><p>En 5FPQ la serina del sitio activo (<b>Ser203</b>) está <b>fosfonilada por sarín</b> (residuo modificado <code>SGB</code> en el PDB): el O de la serina forma un enlace covalente con el fósforo (distancia medida <b>1,62 Å</b>); el oxígeno P=O queda en el <i>hueco del oxianión</i> (N de Gly122 a 2,53 Å y de Ala204 a 3,0 Å) y la His447 está a 3,3 Å. Es el mecanismo del DFP/sarín de la diap. 61 visto en un cristal.</p>" +
        TC.rxn(["txt:Ser–OH +", "mol:sarin|190", { arrow: { top: "acetilcolinesterasa", bottom: "", dir: "→" } }, "txt:Ser–O–P(=O)(CH₃)(O–iPr) + HF"]);
      var d = TC.h("<div></div>"); root.appendChild(d);
      TC.viewer(d, { id: "5FPQ", focus: [{ chain: "A", resi: 447, label: "His447", atom: "NE2" }, { chain: "A", resi: 122, label: "Gly122", atom: "N" }, { chain: "A", resi: 204, label: "Ala204", atom: "N" }, { chain: "A", resi: 334, label: "Glu334", atom: "OE1" }], ligands: [{ resn: "SGB", label: "Ser203–sarín", color: "orangeCarbon" }], distances: ["sgb_og_p1", "his447_sgb", "gly122_sgb", "ala204_sgb"], ligandToggle: "Mostrar Ser203 modificada", metals: false });
      root.appendChild(TC.h("<div><h3>Aspirina vs ibuprofeno (COX)</h3><p>La aspirina <b>acetila la Ser530</b> de la ciclooxigenasa (Loll <i>et al.</i> 1995, resumen: «acetilación selectiva de la serina 530») " + TC.badge("verificado") + " (resumen). En 5F19 (COX-2 humana acetilada por aspirina, 2,04 Å) el residuo 530 es <b>O-acetilserina (OAS)</b>; su acetilo está a 3,08 Å de la Tyr385. El ibuprofeno, en cambio, se une <b>sin enlace covalente</b> (4PH9, sección 18).</p>" + TC.rxn(["mol:aspirina|240", { arrow: { top: "COX–Ser530–OH", bottom: "acetilación", dir: "→" } }, "txt:COX–Ser530–O–C(=O)CH₃ +", "mol:salicilato|200"]) + "</div>"));
      var d2 = TC.h("<div></div>"); root.appendChild(d2);
      TC.viewer(d2, { id: "5F19", focus: [{ chain: "A", resi: 385, label: "Tyr385", atom: "OH" }, { chain: "A", resi: 530, label: "Ser530 acetilada", atom: "OG" }], ligands: [{ resn: "OAS", label: "Ser530–acetilo" }], distances: ["oas_tyr385"], ligandToggle: "Mostrar Ser530 acetilada", metals: false });
      var cas = TC.h("<div></div>"); root.appendChild(cas);
      cas.innerHTML = "<h3>Caso de la diap. 65: de los fosfolípidos de membrana al ácido araquidónico</h3>" + TC.mol("araquidonico", { w: 360, cap: "Ácido araquidónico (20:4, Δ5,8,11,14) — SMILES contrastado" }) +
        '<div class="tablewrap"><table class="data"><thead><tr><th>Enzima (diap. 65)</th><th>Vía</th><th>Productos</th></tr></thead><tbody><tr><td>Fosfolipasa A₂</td><td>Fosfolípidos de membrana → <b>ácido araquidónico</b></td><td>—</td></tr><tr><td>Lipoxigenasa</td><td>Ruta de la lipoxigenasa</td><td>Leucotrienos, lipoxinas, hepoxilinas</td></tr><tr><td>Ciclooxigenasa</td><td>Ruta de la ciclooxigenasa</td><td>Prostaglandinas, prostaciclina, tromboxano, ácidos grasos hidroxilados</td></tr><tr><td>Citocromo P450 epoxigenasa</td><td>Ruta de la epoxigenasa</td><td>Ácidos epoxieicosatrienoicos, ácidos grasos hidroxilados</td></tr></tbody></table></div>' +
        "<p class=\"small\">Aspirina e ibuprofeno actúan sobre la ciclooxigenasa (aquí, la vía de prostaglandinas y tromboxano); la diapositiva no los menciona (es contenido <b>más allá del profe</b>).</p>";
    },
    quiz: [
      { q: "Tras diluir 100× una mezcla enzima + inhibidor, la actividad se recupera. El inhibidor era…", o: ["Irreversible", "Reversible", "Covalente", "Un desnaturalizante"], c: 1, e: "La inhibición reversible alcanza un equilibrio dependiente de [I]; al diluir, E libre aumenta. La irreversible no se recupera (diap. 60)." },
      { make: function (r) { var kk = Math.round(5 + r() * 60) / 100, I = Math.round(5 + r() * 50), KI = Math.round(5 + r() * 50); return { q: "k<sub>inact</sub> = " + kk + " min⁻¹, K<sub>I</sub> = " + KI + " µM y [I] = " + I + " µM. Calcula k<sub>obs</sub> (min⁻¹).", ans: kk * I / (KI + I), unit: "min⁻¹", tol: 0.02, abs: 0.002, e: function () { return "kobs = kinact·[I]/(KI + [I]) = " + kk + "·" + I + "/(" + KI + " + " + I + ") = " + TC.num(kk * I / (KI + I), 4) + " min⁻¹."; } }; } },
      { q: "En 5FPQ, el sarín está unido…", o: ["Por un enlace covalente O(Ser203)–P (distancia medida 1,62 Å)", "Solo por enlaces de hidrógeno", "A un metal", "Al sustrato"], c: 0, e: "Es el aducto Ser203–metilfosfonato (residuo SGB): inhibición irreversible por modificación covalente de la serina del sitio activo." },
      { prac: true, q: "<b>Matiz (duda 11, diap. 61):</b> la diapositiva clasifica cianuro y fisostigmina como irreversibles. ¿Qué hay que saber?", o: ["Para el examen: la clasificación del profe; en la literatura, el cianuro se une muy fuerte pero de forma reversible y la fisostigmina es pseudo-irreversible", "Que son competitivos", "Que no inhiben nada", "Que son lo mismo que el ibuprofeno"], c: 0, e: "Se muestra la versión del profe y el matiz de la literatura: la fisostigmina se descarbamila espontáneamente (inhibición reversible, de acción corta) y el cianuro se une muy fuerte al citocromo c oxidasa, aunque en mitocondrias aisladas la inhibición resultó reversible al lavar (resúmenes consultados; ver la duda 11)." }
    ],
    beyondTitle: "Modelo de dos pasos, inhibidores suicidas y selectividad",
    beyond: function (el) {
      el.innerHTML = "<p>El modelo más simple de inhibición irreversible: E + I ⇌ EI (K<sub>I</sub>) → E–I (k<sub>inact</sub>). Con [I] ≫ [E], la actividad decae exponencialmente con k<sub>obs</sub> = k<sub>inact</sub>[I]/(K<sub>I</sub> + [I]); la eficiencia se compara con k<sub>inact</sub>/K<sub>I</sub>. Los inhibidores «suicidas» son activados por la propia enzima. La aspirina es un ejemplo de acetilación irreversible <i>de una serina concreta</i>; los organofosforados fosfonilan la serina catalítica de las serina hidrolasas y, con el tiempo, pueden «envejecer» (pérdida de un grupo alquilo) y hacer la inhibición aún más estable.</p>" + TC.doubt(11);
    },
    sources: "<p>Diap. 60–61 y 65 del profe (Tabla 11.4 transcrita; la fisostigmina, etc., con SMILES contrastados). 5FPQ: Allgardsson <i>et al.</i> 2016, PNAS 113:5514 (doi:10.1073/pnas.1523362113); 5F19: Lucido <i>et al.</i> 2016, Biochemistry 55:1226 (doi:10.1021/acs.biochem.5b01378) " + TC.badge("verificado") + ". Loll <i>et al.</i> 1995 (doi:10.1038/nsb0895-637), resumen consultado vía Europe PMC. El modelo cinético es <span class=\"illustr\">modelo didáctico, valores ilustrativos</span>. El caso de las vías del araquidonato sigue la diap. 65; los efectos de aspirina e ibuprofeno sobre la COX son más allá del profe.</p>"
  });
})(window.TC);
