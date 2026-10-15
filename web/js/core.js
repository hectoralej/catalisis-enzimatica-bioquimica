/* Núcleo del recurso: utilidades, componentes de interfaz, plantilla de sección, navegación y progreso. */
(function (TC) {
  "use strict";
  TC.sections = []; TC.cleanups = []; TC.viewers = [];
  var uid = 0;
  TC.$ = function (s, r) { return (r || document).querySelector(s); };
  TC.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  TC.h = function (html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  TC.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  TC.store = {
    get: function (k, d) { try { var v = localStorage.getItem("tc." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("tc." + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: la página funciona igual */ } }
  };

  /* ---------- formato de números ---------- */
  TC.num = function (v, sig) {
    sig = sig || 3;
    if (v === 0) return "0"; if (!isFinite(v)) return v > 0 ? "∞" : v < 0 ? "−∞" : "—";
    var a = Math.abs(v);
    if (a >= 1e6 || a < 1e-3) { var e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e); return m.toFixed(sig - 1).replace(/\.?0+$/, "") + "×10<sup>" + e.toString().replace("-", "−") + "</sup>"; }
    var s = v.toPrecision(sig); if (s.indexOf("e") >= 0) s = String(parseFloat(s));
    if (s.indexOf(".") >= 0) s = s.replace(/\.?0+$/, "");
    return s.replace("-", "−");
  };
  TC.numPlain = function (v, sig) { return TC.num(v, sig).replace(/<sup>(.*?)<\/sup>/, "e$1").replace("×10e", "e").replace("−", "-"); };
  TC.tex = function (s, display) {
    try { return window.katex ? window.katex.renderToString(s, { displayMode: !!display, throwOnError: false }) : esc(s); } catch (e) { return esc(s); }
  };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  TC.renderMath = function (el) {
    if (!window.renderMathInElement) return;
    try { window.renderMathInElement(el || document.body, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }], throwOnError: false }); } catch (e) { /* KaTeX no disponible */ }
  };

  /* ---------- componentes ---------- */
  TC.callout = function (kind, title, html) {
    var cls = { doubt: "doubt", beyond: "beyondc", good: "good", bad: "bad", note: "" }[kind] || "";
    var tag = title || { doubt: "⚠ Verificar con el profe", beyond: "Más allá del profe", good: "Correcto", bad: "Ojo", note: "Nota" }[kind];
    return '<div class="callout ' + cls + '"><span class="tag">' + tag + "</span>" + html + "</div>";
  };
  TC.doubt = function (n, extra) {
    var d = (TC.DOUBTS || {})[n]; if (!d) return "";
    return TC.callout("doubt", "⚠ Verificar con el profe · duda " + n + " (" + d.diap + ")",
      "<p><b>" + d.titulo + "</b></p><p><b>Versión del profe:</b> " + d.profe + "</p><p><b>Lo que dice la literatura:</b> " + d.lit + "</p>" + (extra ? "<p>" + extra + "</p>" : "") +
      '<p class="small"><i>Para el examen usa la versión del profe; aquí solo se muestra la diferencia.</i></p>');
  };
  TC.stat = function (k, v, u, cls) { return '<div class="stat ' + (cls || "") + '"><div class="k">' + k + '</div><div class="v">' + v + (u ? ' <span class="u">' + u + "</span>" : "") + "</div></div>"; };
  TC.table = function (head, rows, cls) {
    return '<div class="tablewrap"><table class="data ' + (cls || "") + '"><thead><tr>' + head.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  };
  TC.badge = function (estado) {
    if (estado === "verificado") return '<span class="verified">[verificado]</span>';
    if (estado === "ilustrativo") return '<span class="illustr">modelo didáctico, valores ilustrativos</span>';
    return '<span class="unverified">[no verificado]</span>';
  };

  /* Molécula 2D (SVG de RDKit a partir de SMILES contrastados) */
  TC.mol = function (id, opt) {
    opt = opt || {}; var m = (window.MOLS || {})[id];
    if (!m) return '<figure class="mol"><span class="unverified">sin dibujo: ' + id + "</span></figure>";
    var tip = "Fuentes: " + (m.fuentes || []).join(" + ") + (m.ccd ? " · CCD " + m.ccd : "") + (m.cid ? " · PubChem CID " + m.cid : "");
    var w = opt.w ? ' style="width:' + opt.w + 'px"' : "";
    return '<figure class="mol"' + w + ' title="' + tip + '">' + m.svg + "<figcaption>" + (opt.name || m.nombre) + (m.estado !== "verificado" ? ' <span class="unverified">[no verificado]</span>' : "") + (opt.cap ? "<br>" + opt.cap : "") + "</figcaption></figure>";
  };
  /* Fila de reacción: ["mol:id"|"+"|{arrow:{top,bottom,dir}}|"txt:..."] */
  TC.rxn = function (items) {
    return '<div class="rxn">' + items.map(function (i) {
      if (i === "+") return '<span class="plus">+</span>';
      if (typeof i === "string" && i.indexOf("mol:") === 0) { var p = i.slice(4).split("|"); return TC.mol(p[0], { w: p[1] ? +p[1] : 0 }); }
      if (typeof i === "string" && i.indexOf("txt:") === 0) return '<span class="plus" style="font-size:1.05rem;color:var(--text)">' + i.slice(4) + "</span>";
      if (i.arrow) return '<div class="arrow"><span>' + (i.arrow.top || "") + "</span><b>" + (i.arrow.dir || "→") + "</b><span>" + (i.arrow.bottom || "") + "</span></div>";
      return "";
    }).join("") + "</div>";
  };

  /* Control deslizante + entrada numérica sincronizados, con validación de rango */
  TC.slider = function (o) {
    var id = "sl" + (++uid), dec = o.dec == null ? 3 : o.dec;
    var el = TC.h('<div class="ctl"><label for="' + id + '">' + o.label + '</label><input id="' + id + '" type="range" min="0" max="1000" step="1"><div class="numwrap"><input type="number" aria-label="' + esc(o.label.replace(/<[^>]*>/g, "")) + '" step="' + (o.step || "any") + '" inputmode="decimal"><span class="unit">' + (o.unit || "") + '</span></div><div class="msg" role="alert"></div></div>');
    var rg = el.querySelector("input[type=range]"), nm = el.querySelector("input[type=number]"), msg = el.querySelector(".msg");
    var val = o.value, lo = o.min, hi = o.max;
    function toPos(v) { return o.log ? (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * 1000 : (v - lo) / (hi - lo) * 1000; }
    function fromPos(p) {
      var v = o.log ? Math.exp(Math.log(lo) + p / 1000 * (Math.log(hi) - Math.log(lo))) : lo + p / 1000 * (hi - lo);
      if (o.step && !o.log) v = Math.round(v / o.step) * o.step;
      return parseFloat(v.toPrecision(10));
    }
    function show() { rg.value = toPos(val); nm.value = o.log ? parseFloat(val.toPrecision(4)) : parseFloat(val.toFixed(dec)); nm.classList.remove("invalid"); msg.textContent = ""; }
    function set(v, silent) { val = TC.clamp(v, lo, hi); show(); if (!silent && o.onChange) o.onChange(val); }
    rg.addEventListener("input", function () { val = fromPos(+rg.value); nm.value = o.log ? parseFloat(val.toPrecision(4)) : parseFloat(val.toFixed(dec)); nm.classList.remove("invalid"); msg.textContent = ""; if (o.onChange) o.onChange(val); });
    nm.addEventListener("input", function () {
      var v = parseFloat(nm.value.replace(",", "."));
      if (!isFinite(v) || v < lo || v > hi) { nm.classList.add("invalid"); msg.textContent = "Valor fuera de rango: " + TC.numPlain(lo) + " a " + TC.numPlain(hi) + (o.unit ? " " + o.unit.replace(/<[^>]*>/g, "") : ""); return; }
      val = v; rg.value = toPos(val); nm.classList.remove("invalid"); msg.textContent = ""; if (o.onChange) o.onChange(val);
    });
    nm.addEventListener("blur", show);
    show();
    return { el: el, get: function () { return val; }, set: set, setRange: function (a, b) { lo = a; hi = b; set(TC.clamp(val, a, b), true); } };
  };
  TC.seg = function (opts, value, onChange, label) {
    var el = TC.h('<div class="seg" role="group" aria-label="' + (label || "opciones") + '">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === value) + '">' + o[1] + "</button>"; }).join("") + "</div>");
    var cur = value;
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; cur = b.dataset.v;
      TC.$$("button", el).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); onChange(cur);
    });
    return { el: el, get: function () { return cur; }, set: function (v) { cur = v; TC.$$("button", el).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.v === v); }); } };
  };
  TC.select = function (opts, value, onChange) {
    var el = TC.h('<select class="sel">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === value ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>");
    el.addEventListener("change", function () { onChange(el.value); }); return el;
  };
  TC.button = function (text, onClick, cls) { var b = TC.h('<button type="button" class="btn ' + (cls || "") + '">' + text + "</button>"); b.addEventListener("click", onClick); return b; };

  /* ---------- Cuestionarios ---------- */
  TC.quizDone = function () { return TC.store.get("quiz", {}); };
  TC.quiz = function (mount, qs, secId, opts) {
    opts = opts || {};
    var seedBase = Math.floor(Math.random() * 1e6);
    mount.classList.add("quiz");
    qs.forEach(function (q0, qi) {
      var key = secId + ":" + qi, box = TC.h('<div class="q"></div>'); mount.appendChild(box);
      var seed = seedBase + qi * 7919;
      function paint() {
        var q = q0.make ? q0.make(TC.TCMath.rng(seed)) : q0;
        box.className = "q"; box.innerHTML = "";
        box.appendChild(TC.h('<p class="stem">' + (qi + 1) + ". " + q.q + (q0.prac ? '<span class="practice">práctica: no cuenta</span>' : "") + "</p>"));
        var fb = TC.h('<div class="fb" role="status"></div>');
        function done(ok) {
          box.classList.add(ok ? "ok" : "no");
          fb.innerHTML = (ok ? "<b>✔ Correcto.</b> " : "<b>✘ No.</b> ") + (typeof q.e === "function" ? q.e() : (q.e || "")) + (q0.sec ? ' <a href="#/' + q0.sec + '">Ver sección ' + q0.sec.replace("s", "") + "</a>" : "");
          if (opts.onAnswer) opts.onAnswer(ok, !!q0.prac, q0);
          if (!q0.prac && !opts.noStore) { var st = TC.quizDone(); if (st[key] == null || (ok && !st[key])) { st[key] = ok ? 1 : 0; TC.store.set("quiz", st); } TC.updateProgress(); }
          TC.renderMath(fb);
        }
        if (q.o) {
          var opts = TC.h('<div class="opts"></div>');
          q.o.forEach(function (txt, i) {
            var b = TC.h("<button type=\"button\">" + txt + "</button>");
            b.addEventListener("click", function () {
              TC.$$("button", opts).forEach(function (x) { x.disabled = true; });
              var ok = i === q.c; b.classList.add(ok ? "right" : "wrong");
              if (!ok) TC.$$("button", opts)[q.c].classList.add("right");
              done(ok);
            }); opts.appendChild(b);
          });
          box.appendChild(opts);
        } else {
          var row = TC.h('<div class="row"><input class="ans" type="text" inputmode="decimal" aria-label="respuesta" placeholder="tu respuesta"><span>' + (q.unit || "") + "</span></div>");
          var inp = row.querySelector("input"), chk = TC.button("Comprobar", function () {
            var v = parseFloat(inp.value.replace(",", ".")); if (!isFinite(v)) { fb.innerHTML = "Escribe un número."; return; }
            var tol = q.tol == null ? 0.03 : q.tol, ok = Math.abs(v - q.ans) <= Math.max(tol * Math.abs(q.ans), q.abs || 0);
            inp.disabled = true; chk.disabled = true; fb.innerHTML = ""; done(ok);
            if (!ok) fb.innerHTML += " Respuesta esperada: <b>" + TC.num(q.ans, 4) + "</b> " + (q.unit || "") + ".";
          }, "small");
          inp.addEventListener("keydown", function (e) { if (e.key === "Enter") chk.click(); });
          row.appendChild(chk);
          if (q0.make) row.appendChild(TC.button("Otra variante", function () { seed += 104729; paint(); }, "small"));
          box.appendChild(row);
        }
        box.appendChild(fb); TC.renderMath(box);
      }
      paint();
    });
  };

  /* ---------- Plantilla de sección (6 bloques del brief §8) ---------- */
  var BLOCKS = ["Lo esencial", "Interactivo", "Ejemplo real", "Compruébalo", "Más allá del profe", "Fuentes y estado de verificación"];
  function renderSection(def, root) {
    TC.cleanups.forEach(function (f) { try { f(); } catch (e) { /* ignorar */ } }); TC.cleanups = []; TC.viewers = [];
    root.innerHTML = "";
    var head = TC.h('<header class="sec-head"><div class="kicker">Sección ' + def.n + " de " + TC.sections.length + '</div><h1>' + def.title + '</h1><div class="diaps">' + def.diaps + (def.extraHead || "") + "</div></header>");
    root.appendChild(head);
    function block(i, bodyEl, cls) {
      var b = TC.h('<section class="block ' + (cls || "") + '" aria-labelledby="b' + i + '"><h2 id="b' + i + '"><span class="num">' + (i + 1) + "</span>" + BLOCKS[i] + "</h2></section>");
      b.appendChild(bodyEl); root.appendChild(b); return b;
    }
    function safe(fn, el, label) { try { fn(el); } catch (e) { el.innerHTML += TC.callout("bad", "Error en " + label, "<code>" + esc(e.message) + "</code>"); if (window.console) console.error(label, e); } }
    var ess = TC.h('<ul class="essentials"></ul>'); def.essentials.forEach(function (t) { ess.appendChild(TC.h("<li>" + t + "</li>")); }); block(0, ess);
    var inter = TC.h('<div class="card"></div>'); safe(def.interactive, inter, "el interactivo"); block(1, inter);
    var ex = TC.h("<div></div>"); if (def.example) safe(def.example, ex, "el ejemplo real"); block(2, ex);
    var qz = TC.h("<div></div>"); TC.quiz(qz, def.quiz, def.id); block(3, qz);
    var bey = TC.h('<div class="beyond-wrap"><details class="beyond"><summary><span class="tagb">Más allá del profe</span>' + (def.beyondTitle || "Profundización") + '</summary><div class="inner"></div></details></div>');
    var inner = bey.querySelector(".inner"); if (typeof def.beyond === "function") safe(def.beyond, inner, "la profundización"); else inner.innerHTML = def.beyond || "";
    var sec5 = TC.h('<section class="block beyond-wrap" aria-labelledby="b4"><h2 id="b4"><span class="num">5</span>' + BLOCKS[4] + "</h2></section>"); sec5.appendChild(bey.firstElementChild); root.appendChild(sec5);
    var src = TC.h('<details class="src"><summary>Mostrar fuentes</summary><div class="inner"></div></details>'); src.querySelector(".inner").innerHTML = def.sources || ""; block(5, src);
    TC.renderMath(root);
    var idx = TC.sections.indexOf(def), pg = TC.h('<nav class="pager" aria-label="Navegación entre secciones"></nav>');
    var prev = TC.sections[idx - 1], next = TC.sections[idx + 1];
    pg.appendChild(prev ? TC.h('<a class="btn" href="#/' + prev.id + '">← ' + prev.n + ". " + prev.title + "</a>") : TC.h("<span></span>"));
    pg.appendChild(next ? TC.h('<a class="btn" href="#/' + next.id + '">' + next.n + ". " + next.title + " →</a>") : TC.h("<span></span>"));
    root.appendChild(pg);
  }
  TC.addSection = function (def) { def.n = TC.sections.length + 1; TC.sections.push(def); };

  /* ---------- Navegación, progreso, tema ---------- */
  TC.updateProgress = function () {
    var vis = TC.store.get("visited", {}), q = TC.quizDone(), n = TC.sections.length, v = Object.keys(vis).length;
    var bar = TC.$("#prog-bar"), txt = TC.$("#prog-txt"); if (!bar) return;
    bar.style.width = (100 * v / n) + "%"; txt.textContent = v + " de " + n + " secciones vistas · " + Object.keys(q).filter(function (k) { return q[k]; }).length + " respuestas correctas";
    TC.$$(".nav a").forEach(function (a) { var t = a.querySelector(".tick"); if (t) t.textContent = vis[a.dataset.id] ? "✓" : ""; });
  };
  function route() {
    var id = (location.hash.replace(/^#\/?/, "") || "s01"), def = TC.sections.filter(function (s) { return s.id === id; })[0] || TC.sections[0];
    var root = TC.$("#view"); renderSection(def, root);
    TC.$$(".nav a").forEach(function (a) { if (a.dataset.id === def.id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var vis = TC.store.get("visited", {}); vis[def.id] = 1; TC.store.set("visited", vis); TC.updateProgress();
    document.title = def.n + ". " + def.title + " · Catálisis enzimática"; window.scrollTo(0, 0); document.body.classList.remove("nav-open");
    var a = TC.$(".nav a[aria-current]"); if (a && a.scrollIntoView) a.scrollIntoView({ block: "nearest" });
  }
  function setTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    TC.store.set("theme", t || null);
    (TC.themeListeners || []).forEach(function (f) { f(); });
  }
  TC.isDark = function () {
    var t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  TC.themeListeners = [];
  TC.start = function () {
    var nav = TC.$("#nav"), nh = TC.$("#navh"); if (nh) nh.textContent = TC.sections.length + " secciones";
    nav.innerHTML = TC.sections.map(function (s) { return '<a href="#/' + s.id + '" data-id="' + s.id + '"><span class="n">' + s.n + '</span><span>' + (s.short || s.title) + '</span><span class="tick" aria-hidden="true"></span></a>'; }).join("");
    var th = TC.store.get("theme", null); if (th) setTheme(th);
    TC.$("#btn-theme").addEventListener("click", function () { setTheme(TC.isDark() ? "light" : "dark"); this.setAttribute("aria-pressed", TC.isDark()); });
    TC.$("#btn-theme").setAttribute("aria-pressed", TC.isDark());
    var bey = TC.$("#btn-beyond"), on = TC.store.get("beyond", true);
    document.body.classList.toggle("hide-beyond", !on); bey.setAttribute("aria-pressed", on);
    bey.addEventListener("click", function () { var now = document.body.classList.toggle("hide-beyond"); bey.setAttribute("aria-pressed", !now); TC.store.set("beyond", !now); });
    TC.$("#btn-nav").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    window.addEventListener("hashchange", route); route();
  };
})(window.TC = window.TC || {});
