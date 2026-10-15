/* S21 — Práctica: completa la glucólisis (esquema del PDF «MetWebProjGlycolysis», en blanco; arrastrar y soltar) */
(function (TC) {
  "use strict";
  var M = window.TCMath, KJ = 4.184;

  /* ---------- Fichas (chips) ---------- */
  var CHIPS = {
    comp: [
      ["glc", "Glucosa"], ["g6p", "Glucosa-6-fosfato (G6P)"], ["f6p", "Fructosa-6-fosfato (F6P)"], ["f16bp", "Fructosa-1,6-bisfosfato (F-1,6-BP)"],
      ["dhap", "Dihidroxiacetona fosfato (DHAP)"], ["g3p", "Gliceraldehído-3-fosfato (G3P)"], ["bpg", "1,3-Bisfosfoglicerato (1,3-BPG)"], ["pg3", "3-Fosfoglicerato (3PG)"],
      ["pg2", "2-Fosfoglicerato (2PG)"], ["pep", "Fosfoenolpiruvato (PEP)"], ["pyr", "Piruvato"], ["lac", "Lactato"],
      ["g1p", "Glucosa-1-fosfato"], ["f1p", "Fructosa-1-fosfato"], ["bpg23", "2,3-Bisfosfoglicerato"], ["oaa", "Oxalacetato"], ["glyc3p", "Glicerol-3-fosfato"], ["mal", "Malato"], ["acald", "Acetaldehído"]],
    enz: [
      ["hk", "Hexoquinasa"], ["pgi", "Fosfoglucosa isomerasa"], ["pfk1", "Fosfofructoquinasa-1"], ["ald", "Aldolasa"], ["tpi", "Triosafosfato isomerasa"],
      ["gapdh", "Gliceraldehído-3-fosfato deshidrogenasa"], ["pgk", "Fosfoglicerato quinasa"], ["pgm", "Fosfoglicerato mutasa"], ["eno", "Enolasa"], ["pk", "Piruvato quinasa"], ["ldh", "Lactato deshidrogenasa"],
      ["pfk2", "Fosfofructoquinasa-2"], ["fbpasa", "Fructosa-1,6-bisfosfatasa"], ["g6pasa", "Glucosa-6-fosfatasa"], ["pgmut", "Fosfoglucomutasa"], ["pc", "Piruvato carboxilasa"], ["pdh", "Complejo de la piruvato deshidrogenasa"], ["adh", "Alcohol deshidrogenasa"], ["cs", "Citrato sintasa"]],
    cof: [["atp", "ATP"], ["adp", "ADP"], ["nad", "NAD⁺"], ["nadh", "NADH"], ["pi", "Pᵢ (fosfato inorgánico)"], ["h2o", "H₂O"], ["nadp", "NADP⁺"], ["nadph", "NADPH"], ["co2", "CO₂"], ["fad", "FAD"]],
    reg: [["f26bp", "Fructosa-2,6-bisfosfato (F-2,6-BP)"], ["amp", "AMP"], ["cit", "Citrato"], ["ala", "Alanina"], ["acoa", "Acetil-CoA"]]
  };
  var LABEL = {}, KIND = {};
  Object.keys(CHIPS).forEach(function (k) { CHIPS[k].forEach(function (c) { LABEL[c[0]] = c[1]; KIND[c[0]] = k; }); });
  var EC = { hk: "2.7.1.1", pgi: "5.3.1.9", pfk1: "2.7.1.11", ald: "4.1.2.13", tpi: "5.3.1.1", gapdh: "1.2.1.12", pgk: "2.7.2.3", pgm: "5.4.2.11", eno: "4.2.1.11", pk: "2.7.1.40", ldh: "1.1.1.27" };
  var KINDNAME = { comp: "compuesto", enz: "enzima", cof: "cofactor / molécula pequeña", reg: "regulador" };
  /* Equivalencias aceptadas (el PDF dibuja «NADH + H⁺» y «NAD⁺ + H⁺»; el H⁺ ya está escrito junto al hueco) */
  var EQUIV = {};

  /* ---------- Notas del PDF (inglés literal) + traducción ---------- */
  var NOTES = {
    1: ["Charges and traps Glc in cell; provide binding interactions", "Carga y atrapa la Glc en la célula; aporta interacciones de unión."],
    2: ["Open chain form of F6P has C=O at C2.  Provide electron sink for electron flow for step 4", "La forma de cadena abierta de F6P tiene C=O en C2. Aporta un sumidero de electrones para el flujo de electrones del paso 4."],
    3: ["Ensures that 3C cleavage products in next step charged and remain in the cell.", "Asegura que los productos de 3 C de la escisión del paso siguiente estén cargados y permanezcan en la célula."],
    4: ["First C-C bond cleavage ultimately necessary for oxidation of C atoms", "Primera ruptura de enlace C–C, necesaria en último término para la oxidación de los átomos de C."],
    5: ["Only 1, 3C molecule proceeds through pathway", "Solo 1 molécula de 3 C continúa por la vía."],
    6: ["First and only oxidation step in glycolysis..  Use energy release to pay for synthesis of mixed anhydride for subsequent ATP synthesis", "Primer y único paso de oxidación de la glucólisis. Usa la energía liberada para pagar la síntesis de un anhídrido mixto para la posterior síntesis de ATP."],
    7: ["Make 1 ATP for each 3 C intermediate.  Paid for my cleavage of mixed anhydride.  “Substrate”-level phosphorylation.  With previous step, shows coupling of oxidation and phosphorylation.", "Produce 1 ATP por cada intermediario de 3 C. Se paga con la escisión del anhídrido mixto. Fosforilación «a nivel de sustrato». Junto con el paso previo, muestra el acoplamiento entre oxidación y fosforilación."],
    8: ["Allow for creation of thermodynamically unstable molecule in next step for subsequent ATP synthesis.", "Permite la creación de una molécula termodinámicamente inestable en el paso siguiente para la posterior síntesis de ATP."],
    9: ["Creates thermodynamically unstable molecule whose breakdown is coupled to ATP synthesis.", "Crea una molécula termodinámicamente inestable cuya ruptura se acopla a la síntesis de ATP."],
    10: ["Couple breakdown  of therm. unstable molecule to ATP synthesis.", "Acopla la ruptura de la molécula termodinámicamente inestable a la síntesis de ATP."],
    11: ["This step occurs if NAD+ is depleted in anaerobic respiration, allowing for the continuation of anaerobic energy production in glycolysis..", "Este paso ocurre si el NAD⁺ se agota en la respiración anaerobia, lo que permite continuar la producción anaerobia de energía en la glucólisis."]
  };
  /* ΔG° y ΔG en kcal/mol, tal como están en el PDF */
  var DG = { 1: [-4, -8], 3: [-3.4, -5.3], 4: [5.7, -0.3], 6: [1.5, null], 7: [-4.5, 0.3], 10: [-7.5, -4] };

  var uid = 0;
  /* ---------- Registro de huecos ---------- */
  function Board(root) {
    var self = this;
    self.slots = {}; self.mode = "now"; self.ok = 0; self.err = 0; self.sel = null; self.units = "kcal"; self.lang = "en";
    self.groupUsed = function (g, chip, except) { return Object.keys(self.slots).some(function (k) { var s = self.slots[k]; return s.group === g && k !== except && s.value === chip; }); };
  }

  function slotHtml(B, kind, accept, o) {
    o = o || {};
    var id = "sl" + (++uid);
    B.slots[id] = { id: id, kind: kind, accept: accept, group: o.group || null, anyKind: !!o.anyKind, value: null, locked: false, revealed: false };
    return '<span class="slot k-' + kind + (o.cls ? " " + o.cls : "") + '" data-slot="' + id + '" role="button" tabindex="0" aria-label="Hueco de ' + KINDNAME[kind] + (o.aria ? ": " + o.aria : "") + '"><span class="ph">' + (o.ph || KINDNAME[kind]) + '</span><span class="val"></span></span>';
  }
  function molBox(id, w) { var m = (window.MOLS || {})[id]; return '<div class="gly-mol" style="max-width:' + (w || 230) + 'px" title="Fuentes: ' + ((m && m.fuentes) || []).join(" + ") + '">' + (m ? m.svg : "[sin dibujo: " + id + "]") + "</div>"; }
  function note(n) { return '<p class="gly-note"><span class="en">' + NOTES[n][0] + '</span><span class="es">' + NOTES[n][1] + "</span></p>"; }
  function dgHtml(n) {
    var d = DG[n]; if (!d) return "";
    function f(v) { return '<span class="kc">' + (v > 0 && v !== 0 ? "+" : "") + String(v).replace("-", "−") + ' kcal/mol</span><span class="kj">' + (v * KJ > 0 ? "+" : "") + (v * KJ).toFixed(1).replace("-", "−") + " kJ/mol</span>"; }
    return '<div class="gly-dg"><div>ΔG° = ' + f(d[0]) + "</div>" + (d[1] != null ? "<div>ΔG = " + f(d[1]) + "</div>" : "") + "</div>";
  }

  /* Un paso (flecha) entre dos nodos */
  function step(B, n, enz, inC, outC, reg, extra) {
    var h = '<div class="gly-step"><div class="gly-arrowcol">';
    h += '<div class="gly-cof gly-in">' + inC.map(function (c) { return slotHtml(B, "cof", [c], { aria: "paso " + n + ", entra" }); }).join('<span class="plus">+</span>') + "</div>";
    h += '<div class="gly-arrow" aria-hidden="true"></div>';
    h += '<div class="gly-cof gly-out">' + outC.map(function (c) { return slotHtml(B, "cof", [c], { aria: "paso " + n + ", sale" }); }).join('<span class="plus">+</span>') + (extra && extra.post ? '<span class="plus">+</span><span class="fixed">' + extra.post + "</span>" : "") + "</div></div>";
    h += '<div class="gly-enzcol"><div class="gly-enz">' + (n <= 10 ? '<span class="num">' + n + ".</span>" : "") + slotHtml(B, "enz", [enz], { aria: n <= 10 ? "paso " + n : "lactato deshidrogenasa" }) + "</div>" + dgHtml(n);
    if (reg) {
      if (reg.act) h += '<div class="gly-reg"><span class="ar up" title="activa">▲ activa</span>' + reg.actSlots(B) + "</div>";
      if (reg.inh) h += '<div class="gly-reg"><span class="ar down" title="inhibe">▼ inhibe</span>' + reg.inhSlots(B) + "</div>";
    }
    h += "</div>" + (note(n) ? '<div class="gly-notecol">' + note(n) + "</div>" : "") + "</div>";
    return h;
  }
  function regs(act, inh, gA, gI) {
    return {
      act: act, inh: inh,
      actSlots: function (B) { return (act || []).map(function () { return slotHtml(B, "reg", act, { group: gA, aria: "activador" }); }).join(""); },
      inhSlots: function (B) { return (inh || []).map(function () { return slotHtml(B, "reg", inh, { group: gI, aria: "inhibidor" }); }).join(""); }
    };
  }
  function node(B, mol, ans, w, extra) { return '<div class="gly-node">' + molBox(mol, w) + '<div class="gly-name">' + slotHtml(B, "comp", [ans], { aria: "nombre del compuesto" }) + "</div>" + (extra || "") + "</div>"; }

  TC.addSection({
    id: "s21", title: "Práctica: completa la glucólisis", short: "Práctica: glucólisis", diaps: "Esquema «Glycolysis 10A» del PDF MetWebProjGlycolysis (aportado por el usuario) · repasa S11–S13 y S15",
    essentials: [
      "El esquema es el del PDF <b>«Glycolysis 10A»</b>, <b>tal cual</b> pero con los nombres en blanco: <b>compuestos, enzimas, cofactores (ATP/ADP, NAD⁺/NADH, Pᵢ, H₂O), reguladores y la reacción neta</b>. Se conservan las <b>estructuras</b>, los <b>ΔG</b> y los <b>textos</b> explicativos.",
      "<b>Cómo se juega:</b> arrastra una ficha del banco (abajo) a un hueco; también sirve <i>tocar la ficha y luego el hueco</i> (o usar el teclado: Enter sobre la ficha y sobre el hueco). Si es correcta, se fija en verde; si no, rebota. Hay <b>fichas de más</b> (distractores).",
      "Puedes cambiar a <b>modo examen</b> (sin avisos hasta pulsar «Revisar»), mostrar los ΔG en <b>kcal o kJ</b> y ver las notas del PDF en inglés (literal) o en español.",
      "Ideas para ir pensando: <b>inversión</b> de ATP (pasos 1 y 3), <b>escisión</b> en dos triosas (4–5), el <b>único paso redox</b> (6), <b>fosforilación a nivel de sustrato</b> (7 y 10), y qué pasa con el NAD⁺ si falta O₂ (lactato)."
    ],
    interactive: function (root) {
      var B = new Board(root);
      var left = "", right = "", net = "";
      left += node(B, "glucosa", "glc", 240);
      left += step(B, 1, "hk", ["atp"], ["adp"], regs(null, ["g6p"], null, "hk_i"));
      left += node(B, "g6p", "g6p", 240);
      left += step(B, 2, "pgi", [], [], null);
      left += node(B, "f6p", "f6p", 240);
      left += step(B, 3, "pfk1", ["atp"], ["adp"], regs(["f26bp", "amp"], ["atp", "cit"], "pfk_a", "pfk_i"));
      left += node(B, "f16bp", "f16bp", 250);
      left += step(B, 4, "ald", [], [], null);
      left += '<div class="gly-split"><div class="gly-node">' + molBox("dhap_rojo", 210) + '<div class="gly-name">' + slotHtml(B, "comp", ["dhap"], { aria: "DHAP" }) + '</div></div><div class="gly-eq" aria-hidden="true">⇄</div><div class="gly-node">' + molBox("g3p_azul", 210) + '<div class="gly-name">' + slotHtml(B, "comp", ["g3p"], { aria: "G3P (izquierda)" }) + "</div></div></div>";
      left += '<div class="gly-step gly-step5"><div class="gly-enzcol"><div class="gly-enz"><span class="num">5.</span>' + slotHtml(B, "enz", ["tpi"], { aria: "paso 5" }) + '</div></div><div class="gly-notecol">' + note(5) + "</div></div>";

      right += node(B, "g3p_azul", "g3p", 230);
      right += step(B, 6, "gapdh", ["nad", "pi"], ["nadh"], null, { post: "H⁺" });
      right += node(B, "bpg13", "bpg", 260);
      right += step(B, 7, "pgk", ["adp"], ["atp"], null);
      right += node(B, "3pg", "pg3", 230);
      right += step(B, 8, "pgm", [], [], null);
      right += node(B, "2pg", "pg2", 230);
      right += step(B, 9, "eno", [], ["h2o"], null);
      right += node(B, "pep", "pep", 230);
      right += step(B, 10, "pk", ["adp"], ["atp"], regs(["f16bp", "amp"], ["atp", "ala", "acoa"], "pk_a", "pk_i"));
      right += node(B, "piruvato", "pyr", 190);
      right += step(B, 11, "ldh", ["nadh"], ["nad"], null, { post: "H⁺" });
      right += node(B, "lactato", "lac", 190);

      var G = ["glc", "pi", "adp", "nad"], P = ["pyr", "atp", "nadh", "h2o"];
      net = '<div class="gly-net"><b>Reacción neta:</b> ' + slotHtml(B, "comp", G, { group: "netL", ph: "molécula", anyKind: true }) + ' + ' + slotHtml(B, "comp", G, { group: "netL", ph: "molécula", anyKind: true }) + ' + 2 ' + slotHtml(B, "comp", G, { group: "netL", ph: "molécula", anyKind: true }) + ' + 2 ' + slotHtml(B, "comp", G, { group: "netL", ph: "molécula", anyKind: true }) +
        ' <span class="arrowtxt">→</span> 2 ' + slotHtml(B, "comp", P, { group: "netR", ph: "molécula", anyKind: true }) + ' + 2 ' + slotHtml(B, "comp", P, { group: "netR", ph: "molécula", anyKind: true }) + ' + 2 ' + slotHtml(B, "comp", P, { group: "netR", ph: "molécula", anyKind: true }) + ' + 2 H⁺ + 2 ' + slotHtml(B, "comp", P, { group: "netR", ph: "molécula", anyKind: true }) + "</div>";

      root.innerHTML =
        '<div class="gly-bar row"><b>Modo:</b><span id="g-mode"></span><b>ΔG en:</b><span id="g-un"></span><b>Notas del PDF:</b><span id="g-lang"></span></div>' +
        '<div class="gly-status readout" id="g-stat" role="status"></div>' +
        '<div class="gly-board lang-en un-kcal" id="g-board"><h2 class="gly-title">Glycolysis <small>(esquema del PDF, nombres en blanco)</small></h2><div class="gly-cols"><div class="gly-col" id="g-left">' + left + '</div><div class="gly-col" id="g-right">' + right + "</div></div>" + net + "</div>" +
        '<div class="gly-bank" id="g-bank" aria-label="Banco de fichas"><div class="gly-bank-head"><b>Banco de fichas</b> <span class="small" id="g-sel">Arrastra una ficha a un hueco, o tócala y luego toca el hueco.</span><span class="gly-actions" id="g-act"></span></div><div class="gly-tabs" id="g-tabs"></div><div class="gly-chips" id="g-chips"></div></div>';

      var board = root.querySelector("#g-board"), bank = root.querySelector("#g-bank"), chipsEl = root.querySelector("#g-chips"), statEl = root.querySelector("#g-stat");
      var total = Object.keys(B.slots).length, tab = "comp";
      function anyRev() { return Object.keys(B.slots).some(function (k) { return B.slots[k].revealed; }); }
      function status() {
        var done = Object.keys(B.slots).filter(function (k) { return B.slots[k].value != null && B.slots[k].locked; }).length, filled = Object.keys(B.slots).filter(function (k) { return B.slots[k].value != null; }).length;
        statEl.innerHTML = TC.stat("Huecos", total, "") + TC.stat("Rellenos", filled, "de " + total) + (B.mode === "now" ? TC.stat("Correctos fijados", done, "") + TC.stat("Errores", B.err, "") : TC.stat("Modo examen", "sin avisos", "pulsa «Revisar»")) + (done === total && B.mode === "now" && !anyRev() ? '<div class="stat pos"><div class="k">Resultado</div><div class="v" style="color:var(--good)">¡Completo! ✔ (' + B.err + ' errores)</div></div>' : (done === total && anyRev() ? '<div class="stat"><div class="k">Resultado</div><div class="v">Respuestas mostradas</div></div>' : ""));
      }
      function paint(sid) {
        var s = B.slots[sid], el = board.querySelector('[data-slot="' + sid + '"]'); if (!el) return;
        var v = el.querySelector(".val"); v.textContent = s.value ? LABEL[s.value] : "";
        el.classList.toggle("filled", !!s.value); el.classList.toggle("locked", s.locked); el.classList.toggle("revealed", s.revealed);
        el.classList.remove("bad", "good");
        if (s.value && s.locked && !s.revealed) el.classList.add("good");
        if (s.value && s.kind === "enz" && s.locked && EC[s.value]) el.title = "E.C. " + EC[s.value]; else el.removeAttribute("title");
      }
      function flash(el, cls) { el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, 650); }
      function msg(t) { root.querySelector("#g-sel").textContent = t; }
      function place(sid, chip) {
        var s = B.slots[sid]; if (!s || s.locked) return;
        var el = board.querySelector('[data-slot="' + sid + '"]');
        if (B.mode === "exam") { s.value = chip; s.locked = false; paint(sid); status(); return; }
        var okAns = s.accept.indexOf(chip) >= 0 && !(s.group && B.groupUsed(s.group, chip, sid));
        if (okAns) { s.value = chip; s.locked = true; B.ok++; paint(sid); flash(el, "pop"); msg("✔ Correcto: " + LABEL[chip] + (EC[chip] ? " (E.C. " + EC[chip] + ")" : "")); }
        else {
          B.err++; flash(el, "shake"); el.classList.add("bad"); setTimeout(function () { el.classList.remove("bad"); }, 700);
          var why = (!s.anyKind && KIND[chip] !== s.kind) ? "Ese es un " + KINDNAME[KIND[chip]] + "; este hueco es de " + KINDNAME[s.kind] + "." : (s.group && s.accept.indexOf(chip) >= 0 ? "Ya lo usaste en este grupo." : "No es ese.");
          msg("✘ " + why);
        }
        status();
      }
      /* banco */
      function tabs() {
        var el = root.querySelector("#g-tabs"); el.innerHTML = "";
        [["comp", "Compuestos"], ["enz", "Enzimas"], ["cof", "Cofactores y moléculas pequeñas"], ["reg", "Reguladores"]].forEach(function (t) { var b = TC.h('<button type="button" class="btn small" aria-pressed="' + (tab === t[0]) + '">' + t[1] + "</button>"); b.addEventListener("click", function () { tab = t[0]; tabs(); chips(); }); el.appendChild(b); });
      }
      function chips() {
        chipsEl.innerHTML = "";
        CHIPS[tab].forEach(function (c) {
          var b = TC.h('<button type="button" class="chip" data-chip="' + c[0] + '">' + c[1] + "</button>");
          if (B.sel === c[0]) b.classList.add("sel");
          chipsEl.appendChild(b);
        });
      }
      tabs(); chips();
      /* arrastrar / tocar */
      var drag = null;
      function slotAt(x, y) { var e = document.elementFromPoint(x, y); return e && e.closest ? e.closest(".slot") : null; }
      function onDown(ev) {
        var c = ev.target.closest(".chip"); if (!c) return;
        drag = { chip: c.dataset.chip, x: ev.clientX, y: ev.clientY, moved: false, ghost: null, el: c };
        ev.preventDefault();
      }
      function onMove(ev) {
        if (!drag) return;
        if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) > 6) { drag.moved = true; drag.ghost = TC.h('<div class="chip ghost">' + LABEL[drag.chip] + "</div>"); document.body.appendChild(drag.ghost); }
        if (drag.moved) {
          drag.ghost.style.left = ev.clientX + 10 + "px"; drag.ghost.style.top = ev.clientY + 8 + "px";
          TC.$$(".slot.over", board).forEach(function (s) { s.classList.remove("over"); }); var s = slotAt(ev.clientX, ev.clientY); if (s) s.classList.add("over");
        }
      }
      function onUp(ev) {
        if (!drag) return;
        var d = drag; drag = null; if (d.ghost) d.ghost.remove(); TC.$$(".slot.over", board).forEach(function (s) { s.classList.remove("over"); });
        if (d.moved) { var s = slotAt(ev.clientX, ev.clientY); if (s) place(s.dataset.slot, d.chip); }
        else { lastToggle = Date.now(); toggleSel(d.chip, "Ahora toca un hueco."); }
      }
      var lastToggle = 0;
      function toggleSel(c, tail) { B.sel = B.sel === c ? null : c; chips(); msg(B.sel ? "Ficha elegida: «" + LABEL[B.sel] + "». " + tail : "Selección quitada."); }
      chipsEl.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (c && Date.now() - lastToggle > 500) toggleSel(c.dataset.chip, "Ahora toca un hueco."); });
      bank.addEventListener("pointerdown", onDown); document.addEventListener("pointermove", onMove); document.addEventListener("pointerup", onUp);
      TC.cleanups.push(function () { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); var g = document.querySelector(".chip.ghost"); if (g) g.remove(); });
      chipsEl.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("chip")) { e.preventDefault(); var c = e.target.dataset.chip; B.sel = B.sel === c ? null : c; chips(); var f = chipsEl.querySelector('[data-chip="' + c + '"]'); if (f) f.focus(); msg(B.sel ? "Ficha elegida: «" + LABEL[B.sel] + "». Ahora activa un hueco." : "Selección quitada."); } });
      function clickSlot(el) {
        var sid = el.dataset.slot, s = B.slots[sid];
        if (s.locked) return;
        if (B.sel) { place(sid, B.sel); }
        else if (s.value) { s.value = null; paint(sid); status(); }
        else msg("Primero elige una ficha del banco.");
      }
      board.addEventListener("click", function (e) { var s = e.target.closest(".slot"); if (s) clickSlot(s); });
      board.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("slot")) { e.preventDefault(); clickSlot(e.target); } });
      /* controles */
      root.querySelector("#g-mode").appendChild(TC.seg([["now", "Con retroalimentación"], ["exam", "Examen (revisar al final)"]], "now", function (v) { B.mode = v; reset(); }, "modo").el);
      root.querySelector("#g-un").appendChild(TC.seg([["kcal", "kcal/mol (como el PDF)"], ["kj", "kJ/mol"]], "kcal", function (v) { board.classList.remove("un-kcal", "un-kj"); board.classList.add("un-" + v); }, "unidades").el);
      root.querySelector("#g-lang").appendChild(TC.seg([["en", "Inglés (literal)"], ["es", "Español"]], "en", function (v) { board.classList.remove("lang-en", "lang-es"); board.classList.add("lang-" + v); }, "idioma de las notas").el);
      var act = root.querySelector("#g-act");
      act.appendChild(TC.button("Revisar", function () {
        Object.keys(B.slots).forEach(function (k) { var s = B.slots[k]; if (!s.value) return; var okAns = s.accept.indexOf(s.value) >= 0 && !(s.group && Object.keys(B.slots).some(function (o) { var t = B.slots[o]; return o !== k && t.group === s.group && t.value === s.value && o < k; }));
          var el = board.querySelector('[data-slot="' + k + '"]'); el.classList.toggle("good", okAns); el.classList.toggle("bad", !okAns); if (okAns) { s.locked = true; B.ok++; } else { B.err++; } });
        status(); var good = Object.keys(B.slots).filter(function (k) { return board.querySelector('[data-slot="' + k + '"]').classList.contains("good"); }).length; msg("Revisión: " + good + " de " + total + " correctos. Pulsa un hueco rojo para vaciarlo y reintenta.");
      }, "small"));
      act.appendChild(TC.button("Mostrar respuestas", function () { Object.keys(B.slots).forEach(function (k) { var s = B.slots[k]; if (s.value == null || !s.locked) { var used = {}; Object.keys(B.slots).forEach(function (o) { if (B.slots[o].group === s.group && B.slots[o].value) used[B.slots[o].value] = 1; }); var pick = s.accept.filter(function (a) { return !(s.group && used[a]); })[0] || s.accept[0]; s.value = pick; s.locked = true; s.revealed = true; paint(k); } }); status(); msg("Respuestas mostradas (no cuentan como aciertos)."); }, "small"));
      act.appendChild(TC.button("Reiniciar", function () { reset(); }, "small"));
      function reset() { Object.keys(B.slots).forEach(function (k) { B.slots[k].value = null; B.slots[k].locked = false; B.slots[k].revealed = false; paint(k); }); B.ok = 0; B.err = 0; B.sel = null; chips(); msg("Arrastra una ficha a un hueco, o tócala y luego toca el hueco."); status(); }
      status();
      if (/[?&]reveal=1/.test(location.search)) { var rb = TC.$$("#g-act button", root).filter(function (b) { return b.textContent === "Mostrar respuestas"; })[0]; if (rb) rb.click(); }   // para capturas de QA
    },
    example: function (root) {
      root.innerHTML = "<p>Cinco de las diez enzimas de la vía tienen estructura <b>real y verificada</b> en este recurso (sin sustrato natural en algunos casos; los ligandos que ves son los del cristal). Elige una:</p><div class=\"row\" id=\"sw\"></div><div id=\"info\"></div><div id=\"vw\"></div>";
      var viewer = null, EX = {
        pgi: { b: "Paso 2 · fosfoglucosa isomerasa humana (1IAT)", t: "Isomeriza G6P ⇌ F6P (E.C. 5.3.1.9). El archivo 1IAT no contiene sustrato, solo sulfato y β-mercaptoetanol.", cfg: { id: "1IAT", focus: [], ligands: [] } },
        tpi: { b: "Paso 5 · triosafosfato isomerasa (1NEY, con DHAP)", t: "G3P ⇌ DHAP (E.C. 5.3.1.1); detalle del mecanismo en la sección 10.", cfg: { id: "1NEY", focus: [{ chain: "A", resi: 165, label: "Glu165" }, { chain: "A", resi: 95, label: "His95" }], ligands: [{ resn: "13P", label: "DHAP" }], distances: ["glu165_c3", "his95_o2"] } },
        eno: { b: "Paso 9 · enolasa de levadura (1ONE, con 2-PG y PEP)", t: "2PG ⇌ PEP + H₂O (E.C. 4.2.1.11); dos Mg²⁺ y el equilibrio 2-fosfoglicerato/fosfoenolpiruvato en el sitio activo.", cfg: { id: "1ONE", focus: [{ chain: "A", resi: 345, label: "Lys345", atom: "NZ" }], ligands: [{ resn: "2PG", label: "2-PG" }, { resn: "PEP", label: "PEP" }], distances: ["lys345_2pg_c2", "mg438_asp246"] } },
        pk: { b: "Paso 10 · piruvato quinasa de conejo (1A49, Mg-ATP-K-oxalato)", t: "PEP + ADP → piruvato + ATP (E.C. 2.7.1.40); el oxalato imita al enolato del piruvato (título del PDB).", cfg: { id: "1A49", focus: [{ chain: "A", resi: 269, label: "Lys269", atom: "NZ" }], ligands: [{ resn: "OXL", label: "oxalato" }, { resn: "ATP", label: "ATP", color: "purpleCarbon" }], distances: ["lys269_oxl", "atp_pg_oxl"] } },
        ldh: { b: "Lactato deshidrogenasa humana (1I10, NADH + oxamato)", t: "Piruvato + NADH ⇌ lactato + NAD⁺ (E.C. 1.1.1.27); el oxamato es análogo del piruvato.", cfg: { id: "1I10", focus: [{ chain: "A", resi: 192, label: "His192", atom: "NE2" }], ligands: [{ resn: "NAI", label: "NADH", color: "purpleCarbon" }, { resn: "OXM", label: "oxamato" }], distances: ["nadh_c4_oxm_c1", "his192_oxm_o1"] } }
      };
      function open(k) { if (viewer) viewer.destroy(); root.querySelector("#info").innerHTML = TC.callout("note", EX[k].b, "<p>" + EX[k].t + "</p>"); var h = root.querySelector("#vw"); h.innerHTML = ""; viewer = TC.viewer(h, EX[k].cfg); }
      var sw = root.querySelector("#sw"); Object.keys(EX).forEach(function (k) { sw.appendChild(TC.button(EX[k].b, function () { open(k); }, "small")); }); open("tpi");
      root.appendChild(TC.h('<p class="small">Sin estructura verificada aquí: hexoquinasa (2YHX se verificó pero no se usa), fosfofructoquinasa-1, aldolasa, GAPDH, fosfoglicerato quinasa y mutasa. No se dibuja nada de memoria.</p>'));
    },
    quiz: [
      { q: "¿Cuál es el único paso de oxidación de la glucólisis (según el esquema)?", o: ["Paso 1 (hexoquinasa)", "Paso 6 (gliceraldehído-3-fosfato deshidrogenasa)", "Paso 7 (fosfoglicerato quinasa)", "Paso 10 (piruvato quinasa)"], c: 1, e: "El paso 6 reduce NAD⁺ a NADH y usa esa energía para formar el anhídrido mixto (1,3-BPG) (nota del paso 6)." },
      { q: "¿En qué pasos se sintetiza ATP por fosforilación a nivel de sustrato?", o: ["1 y 3", "7 y 10", "4 y 5", "6 y 9"], c: 1, e: "En 7 (1,3-BPG → 3PG) y 10 (PEP → piruvato): 1 ATP por cada intermediario de 3 C, o 2 ATP por glucosa en cada paso." },
      { q: "Balance neto: Glc + Pᵢ + 2 ADP + 2 NAD⁺ → …", o: ["2 Pir + 2 ATP + 2 NADH + 2 H⁺ + 2 H₂O", "1 Pir + 4 ATP + 1 NADH", "2 lactato + 4 ATP", "2 Pir + 2 ATP + 2 NAD⁺"], c: 0, e: "Se invierten 2 ATP (pasos 1 y 3), se obtienen 4 (pasos 7 y 10): neto 2 ATP, 2 NADH y 2 piruvato por glucosa." },
      { q: "Si falta O₂ y el NAD⁺ se agota, ¿qué paso permite seguir con la glucólisis?", o: ["Piruvato → lactato (lactato deshidrogenasa), regenera NAD⁺", "Paso 9 (enolasa)", "Paso 2 (isomerasa)", "Paso 3"], c: 0, e: "La LDH usa NADH y regenera NAD⁺, que el paso 6 necesita (nota de la LDH)." },
      { q: "Pasos con ΔG muy negativo (−8, −5,3 y −4 kcal/mol) en el esquema:", o: ["1, 3 y 10 (los puntos de regulación)", "2, 5 y 8", "4, 6 y 9", "7, 8 y 9"], c: 0, e: "Hexoquinasa, fosfofructoquinasa-1 y piruvato quinasa: lejos del equilibrio, muy regulados (flechas de activación/inhibición del esquema)." }
    ],
    beyondTitle: "ΔG° frente a ΔG, comprobación con la escala de la sección 11 y una duda sobre el PDF",
    beyond: function (el) {
      var T = 310.15, RT = 0.0019872 * T, rows = [[1, "Hexoquinasa", -4, -8], [3, "Fosfofructoquinasa-1", -3.4, -5.3], [4, "Aldolasa", 5.7, -0.3], [7, "Fosfoglicerato quinasa", -4.5, 0.3], [10, "Piruvato quinasa", -7.5, -4]];
      var h = "<p>ΔG = ΔG° + RT ln Q ⇒ <b>Q implícito = e<sup>(ΔG − ΔG°)/RT</sup></b> (con RT = " + RT.toFixed(3) + " kcal/mol a " + T + " K: <span class=\"illustr\">temperatura supuesta, el PDF no la da</span>). Con los valores del PDF:</p>" +
        TC.table(["Paso", "Enzima", "ΔG° (kcal/mol)", "ΔG (kcal/mol)", "Q = [productos]/[reactivos] implícito"], rows.map(function (r) { return [r[0], r[1], String(r[2]).replace("-", "−"), String(r[3]).replace("-", "−"), TC.num(Math.exp((r[3] - r[2]) / RT), 2)]; })) +
        "<p>Ejemplo: en el paso 4, ΔG° = +5,7 pero ΔG ≈ −0,3: la aldolasa funciona porque la célula mantiene Q ≈ 10⁻⁴ (triosas fosfato muy diluidas), no porque la reacción sea favorable en condiciones estándar (sección 3).</p>";
      var chk = [[1, "G + ATP → G6P + ADP", -30.5 - (-13.8)], [7, "1,3-BPG + ADP → 3PG + ATP", -49.4 - (-30.5)], [10, "PEP + ADP → piruvato + ATP", -61.9 - (-30.5)]], pdf = { 1: -4, 7: -4.5, 10: -7.5 };
      h += "<p><b>Comprobación cruzada con la escala de la sección 11</b> (ΔG°′ de hidrólisis verificados): ΔG° del paso = ΔG°(hidrólisis del donador) − ΔG°(hidrólisis del ATP).</p>" + TC.table(["Paso", "Reacción", "Por la escala (kJ/mol)", "En kcal/mol", "PDF (kcal/mol)"], chk.map(function (c) { return [c[0], c[1], TC.num(c[2], 3), TC.num(c[2] / KJ, 3), String(pdf[c[0]]).replace("-", "−")]; })) + "<p class=\"small\">Los tres coinciden con el PDF dentro del redondeo: los números del esquema son coherentes con los ΔG°′ de hidrólisis (G6P −13,8, 1,3-BPG −49,4, PEP −61,9, ATP −30,5 kJ/mol; <span class=\"verified\">[verificados]</span> en la sección 11).</p>";
      h += TC.callout("doubt", "⚠ Verificar con el profe · AMP y la piruvato quinasa", "<p>El PDF marca <b>AMP</b> como activador de la piruvato quinasa (flecha verde junto a «F-1,6-BP; AMP»). Lo habitual en los textos para la PK de mamíferos es la activación por <b>F-1,6-BP</b> (alimentación adelantada) y la inhibición por ATP, alanina y acetil-CoA; que el AMP la active depende de la isoforma/organismo <span class=\"unverified\">[no verificado]</span>. Se conserva tal como está en el PDF (para el examen usa la versión del curso). También: el PDF escribe «phosphglycerate» y «phosphoglyceratemutase» con erratas (se corrigen en las fichas) y rotula «ΔG = 0.3» en el paso 7 sin signo +.</p>");
      el.innerHTML = h;
    },
    sources: "<p>Esquema, textos, ΔG y orden de los pasos: <b>PDF «MetWebProjGlycolysis.pdf»</b> («Glycolysis 10A»), aportado por el usuario y copiado a <code>contenido/glicolisis/</code> (la autoría/fuente original del PDF no figura en el archivo). Las estructuras no se copian del PDF: se redibujan con RDKit desde SMILES contrastados " + TC.badge("verificado") + " (F-1,6-BP, 3PG y lactato añadidos; DHAP/G3P con el código de color del PDF: rojo = C1–C3, azul = C4–C6). Números E.C. verificados en Expasy ENZYME " + TC.badge("verificado") + ": 2.7.1.1, 5.3.1.9, 2.7.1.11, 4.1.2.13, 5.3.1.1, 1.2.1.12, 2.7.2.3, 5.4.2.11, 4.2.1.11, 2.7.1.40, 1.1.1.27. Las traducciones de las notas son mías.</p>"
  });
})(window.TC);
