/* Gráficas SVG ligeras (sin dependencias). TC.Chart(contenedor, cfg) → { update(cfg), toData(px,py), toPx(x,y), svg } */
(function (TC) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* Texto con sub/superíndices: _{x} y ^{x} */
  function rich(s) {
    return esc(s).replace(/_\{([^}]*)\}/g, '<tspan dy="3" font-size="75%">$1</tspan><tspan dy="-3">​</tspan>')
      .replace(/\^\{([^}]*)\}/g, '<tspan dy="-5" font-size="75%">$1</tspan><tspan dy="5">​</tspan>');
  }
  function fmt(v) {
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) { var e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e); return (Math.abs(m - Math.round(m)) < 1e-9 ? Math.round(m) : m.toFixed(1)) + "×10^{" + e + "}"; }
    var s = parseFloat(v.toPrecision(6)); return String(s);
  }
  function niceStep(range, n) {
    var raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function linTicks(a, b, n) {
    var st = niceStep(b - a, n || 6), out = [], v = Math.ceil(a / st - 1e-9) * st;
    for (; v <= b + st * 1e-9; v += st) out.push(Math.abs(v) < st * 1e-9 ? 0 : parseFloat(v.toPrecision(12)));
    return out;
  }
  function logTicks(a, b) {
    var out = [], e0 = Math.ceil(Math.log10(a) - 1e-9), e1 = Math.floor(Math.log10(b) + 1e-9), step = Math.max(1, Math.ceil((e1 - e0) / 8));
    for (var e = e0; e <= e1; e += step) out.push(Math.pow(10, e));
    return out;
  }
  function colorOf(c) { return /^c\d$/.test(c || "") ? "var(--" + c + ")" : (c || "var(--c1)"); }
  var DASH = { "": "", dash: "7 5", dot: "2 5", dashdot: "9 4 2 4" };

  function Chart(el, cfg0) {
    var self = this, svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "chart"); svg.setAttribute("role", "img");
    el.appendChild(svg);
    var cfg = null, sx, sy, W, H, M;

    function build(c) {
      cfg = c; W = c.w || 640; H = c.h || 380; M = Object.assign({ l: 62, r: 22, t: 16, b: 52 }, c.m || {});
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("aria-label", c.aria || c.title || "gráfica");
      var x0 = c.xlim[0], x1 = c.xlim[1], y0 = c.ylim[0], y1 = c.ylim[1], pw = W - M.l - M.r, ph = H - M.t - M.b;
      sx = c.xlog ? function (v) { return M.l + (Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0)) * pw; }
        : function (v) { return M.l + (v - x0) / (x1 - x0) * pw; };
      sy = c.ylog ? function (v) { return M.t + ph - (Math.log10(v) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0)) * ph; }
        : function (v) { return M.t + ph - (v - y0) / (y1 - y0) * ph; };
      var xt = c.xticks || (c.xlog ? logTicks(x0, x1) : linTicks(x0, x1, c.nx || 6)), yt = c.yticks || (c.ylog ? logTicks(y0, y1) : linTicks(y0, y1, c.ny || 6));
      var h = "";
      h += '<defs><clipPath id="cp' + (c._id = c._id || Math.random().toString(36).slice(2, 8)) + '"><rect x="' + M.l + '" y="' + M.t + '" width="' + pw + '" height="' + ph + '"/></clipPath></defs>';
      h += '<g class="grid">';
      xt.forEach(function (v) { h += '<line x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + M.t + '" y2="' + (M.t + ph) + '"/>'; });
      yt.forEach(function (v) { h += '<line y1="' + sy(v) + '" y2="' + sy(v) + '" x1="' + M.l + '" x2="' + (M.l + pw) + '"/>'; });
      h += "</g>";
      // ejes (en x=0 / y=0 si caen dentro del rango, para linealizaciones con cortes negativos)
      var ax = c.zeroAxes ? Math.min(Math.max(c.xlog ? x0 : 0, x0), x1) : x0, ay = c.zeroAxes ? Math.min(Math.max(c.ylog ? y0 : 0, y0), y1) : y0;
      h += '<g class="axis"><line x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + sy(ay) + '" y2="' + sy(ay) + '"/><line x1="' + sx(ax) + '" x2="' + sx(ax) + '" y1="' + M.t + '" y2="' + (M.t + ph) + '"/>';
      h += '<rect x="' + M.l + '" y="' + M.t + '" width="' + pw + '" height="' + ph + '" fill="none" stroke="var(--border)"/></g>';
      h += '<g class="tick">';
      xt.forEach(function (v) { h += '<text x="' + sx(v) + '" y="' + (M.t + ph + 17) + '" text-anchor="middle">' + rich(c.xlog ? "10^{" + Math.round(Math.log10(v)) + "}" : fmt(v)) + "</text>"; });
      yt.forEach(function (v) { h += '<text x="' + (M.l - 7) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + rich(c.ylog ? "10^{" + Math.round(Math.log10(v)) + "}" : fmt(v)) + "</text>"; });
      h += "</g>";
      if (c.xlabel) h += '<text x="' + (M.l + pw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="13.5">' + rich(c.xlabel) + "</text>";
      if (c.ylabel) h += '<text transform="translate(15 ' + (M.t + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="13.5">' + rich(c.ylabel) + "</text>";
      if (c.title) h += '<text x="' + (M.l + 6) + '" y="' + (M.t + 14) + '" font-size="13" font-weight="700">' + rich(c.title) + "</text>";
      h += '<g clip-path="url(#cp' + c._id + ')">';
      (c.areas || []).forEach(function (a) {
        var p = a.x.map(function (x, i) { return (i ? "L" : "M") + sx(x) + " " + sy(a.y[i]); }).join(""), q = "";
        for (var i = a.x.length - 1; i >= 0; i--) q += "L" + sx(a.x[i]) + " " + sy(a.y0 ? a.y0[i] : y0);
        h += '<path d="' + p + q + 'Z" fill="' + colorOf(a.color) + '" opacity="' + (a.opacity || 0.18) + '"/>';
      });
      (c.hlines || []).forEach(function (l) {
        h += '<line x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + sy(l.y) + '" y2="' + sy(l.y) + '" stroke="' + colorOf(l.color || "c7") + '" stroke-width="' + (l.width || 1.4) + '" stroke-dasharray="' + (DASH[l.dash == null ? "dash" : l.dash]) + '"/>';
      });
      (c.vlines || []).forEach(function (l) {
        h += '<line y1="' + M.t + '" y2="' + (M.t + ph) + '" x1="' + sx(l.x) + '" x2="' + sx(l.x) + '" stroke="' + colorOf(l.color || "c7") + '" stroke-width="' + (l.width || 1.4) + '" stroke-dasharray="' + (DASH[l.dash == null ? "dash" : l.dash]) + '"/>';
      });
      (c.lines || []).forEach(function (l) {
        var d = "", pen = false;
        for (var i = 0; i < l.x.length; i++) {
          var ok = isFinite(l.y[i]) && isFinite(l.x[i]) && (!c.ylog || l.y[i] > 0) && (!c.xlog || l.x[i] > 0);
          if (!ok) { pen = false; continue; }
          d += (pen ? "L" : "M") + sx(l.x[i]).toFixed(2) + " " + sy(l.y[i]).toFixed(2); pen = true;
        }
        h += '<path d="' + d + '" fill="none" stroke="' + colorOf(l.color) + '" stroke-width="' + (l.width || 2.4) + '" stroke-dasharray="' + (DASH[l.dash || ""]) + '" stroke-linejoin="round" stroke-linecap="round"/>';
      });
      (c.points || []).forEach(function (p) { h += marker(sx(p.x), sy(p.y), p.marker || "circle", p.r || 4.5, colorOf(p.color)); });
      (c.lines || []).forEach(function (l) {
        if (!l.marker) return;
        l.x.forEach(function (x, i) { if (isFinite(l.y[i])) h += marker(sx(x), sy(l.y[i]), l.marker, 3.6, colorOf(l.color)); });
      });
      h += "</g>";
      // etiquetas directas (no dependen del color)
      (c.lines || []).forEach(function (l) {
        if (!l.label) return;
        var i = l.labelAt == null || l.labelAt === "end" ? l.x.length - 1 : l.labelAt === "start" ? 0 : l.labelAt;
        var X = sx(l.x[i]), Y = sy(l.y[i]);
        if (!isFinite(X) || !isFinite(Y)) return;
        var anchor = X > M.l + pw - 80 ? "end" : "start";
        h += '<text class="lab" x="' + (X + (anchor === "end" ? -6 : 6) + (l.dx || 0)) + '" y="' + (Y - 6 + (l.dy || 0)) + '" text-anchor="' + anchor + '" fill="' + colorOf(l.color) + '">' + rich(l.label) + "</text>";
      });
      (c.hlines || []).forEach(function (l) { if (l.label) h += '<text class="lab" x="' + (M.l + pw - 6) + '" y="' + (sy(l.y) - 6) + '" text-anchor="end" fill="' + colorOf(l.color || "c7") + '">' + rich(l.label) + "</text>"; });
      (c.vlines || []).forEach(function (l) { if (l.label) h += '<text class="lab" x="' + (sx(l.x) + 5) + '" y="' + (M.t + 28 + (l.dy || 0)) + '" fill="' + colorOf(l.color || "c7") + '">' + rich(l.label) + "</text>"; });
      (c.points || []).forEach(function (p) { if (p.label) h += '<text class="lab" x="' + (sx(p.x) + (p.dx == null ? 8 : p.dx)) + '" y="' + (sy(p.y) + (p.dy == null ? -8 : p.dy)) + '" text-anchor="' + (p.anchor || "start") + '" fill="' + colorOf(p.color) + '">' + rich(p.label) + "</text>"; });
      (c.notes || []).forEach(function (n) { h += '<text class="lab" x="' + sx(n.x) + '" y="' + sy(n.y) + '" text-anchor="' + (n.anchor || "start") + '" fill="' + colorOf(n.color || "c7") + '" font-size="' + (n.size || 12.5) + '">' + rich(n.text) + "</text>"; });
      (c.arrows || []).forEach(function (a) {
        var x1_ = sx(a.x1), y1_ = sy(a.y1), x2_ = sx(a.x2), y2_ = sy(a.y2), ang = Math.atan2(y2_ - y1_, x2_ - x1_), L = 9;
        var col = colorOf(a.color || "c7");
        h += '<line x1="' + x1_ + '" y1="' + y1_ + '" x2="' + x2_ + '" y2="' + y2_ + '" stroke="' + col + '" stroke-width="2"' + (a.dash ? ' stroke-dasharray="' + DASH[a.dash] + '"' : "") + "/>";
        h += '<path d="M' + x2_ + " " + y2_ + "L" + (x2_ - L * Math.cos(ang - 0.4)) + " " + (y2_ - L * Math.sin(ang - 0.4)) + "L" + (x2_ - L * Math.cos(ang + 0.4)) + " " + (y2_ - L * Math.sin(ang + 0.4)) + 'Z" fill="' + col + '"/>';
        if (a.both) { h += '<path d="M' + x1_ + " " + y1_ + "L" + (x1_ + L * Math.cos(ang - 0.4)) + " " + (y1_ + L * Math.sin(ang - 0.4)) + "L" + (x1_ + L * Math.cos(ang + 0.4)) + " " + (y1_ + L * Math.sin(ang + 0.4)) + 'Z" fill="' + col + '"/>'; }
        if (a.label) h += '<text class="lab" x="' + ((x1_ + x2_) / 2 + (a.dx || 8)) + '" y="' + ((y1_ + y2_) / 2 + (a.dy || 4)) + '" fill="' + col + '">' + rich(a.label) + "</text>";
      });
      svg.innerHTML = h;
      if (c.onRender) c.onRender(svg, { sx: sx, sy: sy });
    }
    function marker(x, y, kind, r, col) {
      if (kind === "square") return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" fill="' + col + '" stroke="var(--surface)" stroke-width="1"/>';
      if (kind === "tri") return '<path d="M' + x + " " + (y - r * 1.25) + "L" + (x + r * 1.2) + " " + (y + r) + "L" + (x - r * 1.2) + " " + (y + r) + 'Z" fill="' + col + '" stroke="var(--surface)" stroke-width="1"/>';
      if (kind === "cross") return '<path d="M' + (x - r) + " " + (y - r) + "L" + (x + r) + " " + (y + r) + "M" + (x - r) + " " + (y + r) + "L" + (x + r) + " " + (y - r) + '" stroke="' + col + '" stroke-width="2.4"/>';
      if (kind === "open") return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="var(--surface)" stroke="' + col + '" stroke-width="2.2"/>';
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '" stroke="var(--surface)" stroke-width="1"/>';
    }
    self.svg = svg;
    self.update = function (c) { build(Object.assign({}, cfg || {}, c)); };
    self.toPx = function (x, y) { return [sx(x), sy(y)]; };
    self.toData = function (clientX, clientY) {
      var r = svg.getBoundingClientRect(), px = (clientX - r.left) * W / r.width, py = (clientY - r.top) * H / r.height;
      var c = cfg, pw = W - M.l - M.r, ph = H - M.t - M.b, fx = (px - M.l) / pw, fy = 1 - (py - M.t) / ph;
      var x = c.xlog ? Math.pow(10, Math.log10(c.xlim[0]) + fx * (Math.log10(c.xlim[1]) - Math.log10(c.xlim[0]))) : c.xlim[0] + fx * (c.xlim[1] - c.xlim[0]);
      var y = c.ylog ? Math.pow(10, Math.log10(c.ylim[0]) + fy * (Math.log10(c.ylim[1]) - Math.log10(c.ylim[0]))) : c.ylim[0] + fy * (c.ylim[1] - c.ylim[0]);
      return { x: x, y: y, inside: fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1 };
    };
    build(cfg0);
  }

  /* Leyenda textual con estilo de trazo (no depende solo del color) */
  function legend(items) {
    return '<div class="legend">' + items.map(function (i) {
      return '<span class="' + (i.dash || "") + '" style="color:' + colorOf(i.color) + '"><b style="color:var(--text);font-weight:600">' + i.text + "</b></span>";
    }).join("") + "</div>";
  }
  TC.Chart = Chart; TC.legend = legend; TC.chartUtil = { fmt: fmt, linTicks: linTicks };
})(window.TC = window.TC || {});
