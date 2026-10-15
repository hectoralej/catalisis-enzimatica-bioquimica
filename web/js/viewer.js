/* Visor 3D (3Dmol.js vendorizado) para estructuras verificadas del PDB, con distancias MEDIDAS en el mmCIF (manifiesto). */
(function (TC) {
  "use strict";
  var loading = {};
  function loadStruct(id, cb) {
    if (window.STRUCTS && window.STRUCTS[id]) return cb();
    if (loading[id]) { loading[id].push(cb); return; }
    loading[id] = [cb];
    var s = document.createElement("script"); s.src = "assets/structures/" + id + ".js";
    s.onload = function () { loading[id].forEach(function (f) { f(); }); delete loading[id]; };
    s.onerror = function () { loading[id].forEach(function (f) { f(new Error("No se pudo cargar la estructura " + id)); }); delete loading[id]; };
    document.head.appendChild(s);
  }
  function bg() { return TC.isDark() ? "#10161e" : "#ffffff"; }
  function cartoonColor() { return TC.isDark() ? "#8fa5bf" : "#8ea6c0"; }
  function link(u, t) { return '<a href="' + u + '" target="_blank" rel="noopener">' + t + "</a>"; }

  /* cfg: { id | ids:[abierta,cerrada], focus:[{chain,resi,label,atom}], ligands:[{resn,label,chain?,color?}], metals:true,
            distances:[idsMedidos]|"all", toggles:[{label, on, apply(viewer, on)}], png:"assets/img/X.png", surface:false, note:"html" } */
  TC.viewer = function (mount, cfg) {
    var ids = cfg.ids || [cfg.id], meta = ids.map(function (i) { return (window.STRUCTMETA || {})[i]; }), m0 = meta[0];
    if (!m0) { mount.innerHTML = TC.callout("bad", "Estructura no disponible", "<p>" + ids[0] + " no está en el manifiesto verificado.</p>"); return; }
    var pair = ids.length === 2;
    var head = ids.map(function (i, k) {
      var m = meta[k]; return "<b>" + link("https://www.rcsb.org/structure/" + i, i) + "</b> — " + m.titulo.replace(/\s+/g, " ").slice(0, 90) + " · <i>" + m.organismo.join("; ") + "</i> · " + m.metodo.replace("X-RAY DIFFRACTION", "rayos X") + " " + m.res + " Å · ligandos: " + (m.ligandos.join(", ") || "ninguno");
    }).join("<br>");
    var box = TC.h('<div class="viewer"><div class="vhead">' + head + '</div><div class="vwrap"><div class="mol3d"></div><img class="fallback" alt="Imagen de respaldo (PyMOL, trazado de rayos)"></div><div class="vtools"></div><div class="vinfo"></div></div>');
    mount.appendChild(box);
    var div = box.querySelector(".mol3d"), img = box.querySelector("img.fallback"), tools = box.querySelector(".vtools"), info = box.querySelector(".vinfo");
    var state = { labels: !!cfg.labelsOn, dist: cfg.distances ? true : false, surf: !!cfg.surface, lig: true, v: null, extra: {}, extraFn: {}, mode: "both", t: 0 };

    // información verificada
    var rows = [];
    meta.forEach(function (m, k) {
      (m.distancias || []).forEach(function (d) {
        if (cfg.distances === "all" || (cfg.distances || []).indexOf(d.id) >= 0) rows.push([ids[k], d.desc, "<b>" + d.valor + " Å</b>", '<span class="mono">' + d.atomos + "</span>"]);
      });
    });
    var h = "";
    if (rows.length) h += "<p><b>Distancias medidas en el archivo del PDB</b> (átomos pesados, Biopython; <code>scripts/verify_structures.py</code>)</p>" + TC.table(["ID", "Medida", "Valor", "Átomos"], rows);
    var notes = meta.map(function (m) { return m.nota; }).filter(Boolean);
    if (notes.length) h += TC.callout("note", "Numeración / aviso", "<p>" + notes.join("</p><p>") + "</p>");
    if (cfg.note) h += cfg.note;
    h += '<p class="small">Estructura recortada de RCSB (datos CC0): ' + meta.map(function (m, k) { return ids[k] + (m.doi ? " — " + link("https://doi.org/" + m.doi, "doi:" + m.doi) : ""); }).join(" · ") + ". " + TC.badge("verificado") + " (existencia, residuos y distancias comprobados por programa).</p>";
    info.innerHTML = h;

    function webgl() { try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; } }
    function showPng(on) { img.style.display = on ? "block" : "none"; div.style.visibility = on ? "hidden" : "visible"; }
    var pngSrc = cfg.png || ("assets/img/" + (cfg.pngName || ids.join("_")) + ".png");
    img.src = pngSrc; img.onerror = function () { img.removeAttribute("src"); var b = box.querySelector("[data-png]"); if (b) b.remove(); };

    function button(label, pressed, fn, attrs) {
      var b = TC.h('<button type="button" class="btn small" aria-pressed="' + pressed + '"' + (attrs || "") + ">" + label + "</button>");
      b.addEventListener("click", function () { var now = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", now); fn(now); }); tools.appendChild(b); return b;
    }

    function build(v) {
      v.removeAllLabels(); v.removeAllShapes(); v.removeAllSurfaces(); v.setBackgroundColor(bg());
      var nM = pair ? 3 : 1;
      for (var k = 0; k < nM; k++) {
        var sel = { model: k }, visible = true;
        if (pair) visible = state.mode === "both" ? k < 2 : state.mode === "open" ? k === 0 : state.mode === "closed" ? k === 1 : k === 2;
        if (!visible) { v.setStyle(sel, {}); continue; }
        var colr = pair ? (k === 0 ? "#3b7fc4" : k === 1 ? "#d9663a" : "#6a5acd") : cartoonColor();
        v.setStyle(sel, { cartoon: { color: colr, opacity: pair && state.mode === "both" ? 0.75 : 1, thickness: 0.35 } });
        if (state.lig) (cfg.ligands || []).forEach(function (L) {
          if (pair && k !== 1) return;                       // el ligando solo existe en la forma cerrada
          var s = { model: k, resn: [L.resn] }; if (L.chain) s.chain = L.chain;
          v.setStyle(s, { stick: { radius: 0.22, colorscheme: L.color || "orangeCarbon" } });
        });
        if (cfg.metals !== false && state.lig) v.setStyle({ model: k, elem: ["Zn", "Mg", "Mn", "Cu", "Fe", "K", "Ca", "Na", "Co"], hetflag: true }, { sphere: { radius: 0.62, colorscheme: "Jmol" } });
        (cfg.focus || []).forEach(function (f) {
          if (pair && k === 2) return;
          v.addStyle({ model: k, chain: f.chain, resi: f.resi }, { stick: { radius: 0.2, colorscheme: f.color || "cyanCarbon" } });
        });
      }
      var lm = pair ? (state.mode === "open" ? 0 : 1) : 0;
      if (state.labels) (cfg.focus || []).forEach(function (f) {
        v.addLabel(f.label || (f.chain + f.resi), { fontSize: 13, fontColor: TC.isDark() ? "#e6ebf2" : "#1b2330", backgroundColor: TC.isDark() ? "#202a37" : "#ffffff", backgroundOpacity: 0.82, borderColor: "#7a8aa0", borderThickness: 1, showBackground: true, alignment: "center" },
          { model: lm, chain: f.chain, resi: f.resi, atom: f.atom || "CA" });
      });
      if (state.lig) (cfg.ligands || []).forEach(function (L) {
        if (!L.label) return;
        v.addLabel(L.label, { fontSize: 13, fontColor: "#7a3b00", backgroundColor: "#fff3dc", backgroundOpacity: 0.9, borderColor: "#c77d12", borderThickness: 1, showBackground: true },
          { model: pair ? 1 : 0, resn: [L.resn], chain: L.chain });
      });
      if (state.dist) {
        meta.forEach(function (m, k) {
          (m.distancias || []).forEach(function (d) {
            if (!(cfg.distances === "all" || (cfg.distances || []).indexOf(d.id) >= 0) || !d.par) return;
            var A = d.par[0], B = d.par[1], mi = pair ? k : 0;
            var a = v.selectedAtoms({ model: mi, chain: A.chain, resn: [A.resname], resi: A.resi, atom: A.atom })[0];
            var b = v.selectedAtoms({ model: mi, chain: B.chain, resn: [B.resname], resi: B.resi, atom: B.atom })[0];
            if (!a || !b) return;
            v.addCylinder({ start: { x: a.x, y: a.y, z: a.z }, end: { x: b.x, y: b.y, z: b.z }, radius: 0.07, dashed: true, dashLength: 0.25, gapLength: 0.18, color: TC.isDark() ? "#ffd479" : "#222", fromCap: 1, toCap: 1 });
            v.addLabel(d.valor + " Å", { position: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }, fontSize: 12, fontColor: "#000", backgroundColor: "#ffe9a8", backgroundOpacity: 0.92, showBackground: true, borderColor: "#c99a00", borderThickness: 1 });
          });
        });
      }
      Object.keys(state.extra).forEach(function (kk) { if (state.extra[kk] && state.extraFn[kk]) state.extraFn[kk](v, true); });
      if (state.surf) v.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.55, color: "#c9d6e6" }, { model: pair ? 1 : 0, hetflag: false });
      v.render();
    }

    function morphSetup(v) {
      var ms = v.getModel(0).selectedAtoms({}), mc = v.getModel(1).selectedAtoms({}), mm = v.getModel(2).selectedAtoms({}), key = function (a) { return a.chain + ":" + a.resi + ":" + a.atom; };
      var cl = {}; mc.forEach(function (a) { cl[key(a)] = a; });
      var pairs = mm.map(function (a, i) { var b = cl[key(a)]; return b ? [a, ms[i], b] : null; }).filter(Boolean);
      return function (t) { pairs.forEach(function (p) { p[0].x = p[1].x + t * (p[2].x - p[1].x); p[0].y = p[1].y + t * (p[2].y - p[1].y); p[0].z = p[1].z + t * (p[2].z - p[1].z); }); };
    }

    function init() {
      if (!window.$3Dmol || !webgl()) { showPng(true); tools.innerHTML = '<span class="small">Tu navegador no tiene WebGL: se muestra la imagen de respaldo (PyMOL).</span>'; return; }
      var v = $3Dmol.createViewer(div, { backgroundColor: bg(), antialias: true }); state.v = v;
      ids.forEach(function (i) { v.addModel(window.STRUCTS[i], "pdb"); });
      if (pair) { v.addModel(window.STRUCTS[ids[0]], "pdb"); state.morph = morphSetup(v); }
      build(v);
      var zsel = cfg.zoom || ((cfg.focus && cfg.focus.length) ? { model: pair ? 1 : 0, or: cfg.focus.map(function (f) { return { chain: f.chain, resi: f.resi }; }).concat((cfg.ligands || []).map(function (l) { return { resn: [l.resn] }; })) } : {});
      v.zoomTo(zsel); v.zoom(cfg.zoomOut || 0.68); v.render();
      var rs = function () { try { v.resize(); v.render(); } catch (e) { /* visor eliminado */ } }; window.addEventListener("resize", rs);
      state.destroy = function () { window.removeEventListener("resize", rs); try { v.clear(); } catch (e) { /* ya liberado */ } div.innerHTML = ""; state.v = null; };
      TC.cleanups.push(state.destroy);
      TC.themeListeners.push(function () { try { if (state.v) build(v); } catch (e) { /* visor eliminado */ } });
    }

    // botones
    var slWrap = null, applyT = function () {};
    if (pair) {
      var sg = TC.seg([["open", "Abierta (" + ids[0] + ")"], ["closed", "Cerrada (" + ids[1] + ")"], ["both", "Superpuestas"], ["morph", "Interpolación"]], "both", function (v) { state.mode = v; slWrap.style.display = v === "morph" ? "flex" : "none"; if (v === "morph") applyT(state.t); if (state.v) build(state.v); }, "Conformación");
      tools.appendChild(sg.el);
      slWrap = TC.h('<span class="row" style="display:none;gap:8px"><label class="small">abierta</label><input type="range" min="0" max="100" value="0" aria-label="Interpolación abierta–cerrada" style="width:140px"><label class="small">cerrada</label><span class="illustr">interpolación lineal ilustrativa, no es una trayectoria real</span></span>');
      tools.appendChild(slWrap); var rg = slWrap.querySelector("input");
      applyT = function (t) { state.t = t; if (state.morph) { state.morph(t); if (state.v) { state.v.setStyle({ model: 2 }, { cartoon: { color: "#6a5acd", thickness: 0.35 } }); state.v.render(); } } };
      rg.addEventListener("input", function () { applyT(+rg.value / 100); });
    }
    if ((cfg.focus || []).length) button("Etiquetar residuos", state.labels, function (on) { state.labels = on; if (state.v) build(state.v); });
    if (cfg.distances) button("Distancias medidas", true, function (on) { state.dist = on; if (state.v) build(state.v); });
    if ((cfg.ligands || []).length) button(cfg.ligandToggle || "Mostrar ligando/cofactor", true, function (on) { state.lig = on; if (state.v) build(state.v); });
    button("Superficie", state.surf, function (on) { state.surf = on; if (state.v) build(state.v); });
    (cfg.toggles || []).forEach(function (t, i) { state.extra[i] = !!t.on; state.extraFn[i] = t.apply; button(t.label, !!t.on, function (on) { state.extra[i] = on; if (state.v) { build(state.v); if (!on && t.off) { t.off(state.v); state.v.render(); } } }); });
    button("Restablecer vista", false, function () { if (state.v) { state.v.zoomTo(); state.v.render(); } }).setAttribute("aria-pressed", "false");
    var pb = button("Imagen PyMOL (trazada; versión de evaluación, con marca de agua)", false, function (on) { showPng(on); }); pb.setAttribute("data-png", "1");
    loadStruct(ids[0], function (e1) {
      if (e1) { info.innerHTML = TC.callout("bad", "Error", "<p>" + e1.message + "</p>"); return; }
      if (pair) loadStruct(ids[1], function (e2) { if (e2) info.innerHTML = TC.callout("bad", "Error", "<p>" + e2.message + "</p>"); else init(); }); else init();
    });
    return { destroy: function () { if (state.destroy) state.destroy(); box.remove(); }, state: state };
  };
})(window.TC = window.TC || {});
