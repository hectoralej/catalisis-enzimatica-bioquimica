/* Matemática pura del recurso (sin DOM). UMD: window.TCMath en el navegador, module.exports en Node. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TCMath = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var C = { R: 8.314462618, kB: 1.380649e-23, h: 6.62607015e-34, F: 96485.33212, NA: 6.02214076e23 };

  /* ---------- Termodinámica (kJ/mol, J/(mol·K), K) ---------- */
  function gibbs(dH, dS, T) { return dH - T * dS / 1000; }
  function crossT(dH, dS) { return dS === 0 ? NaN : dH * 1000 / dS; }
  function quadrant(dH, dS) {
    if (dH < 0 && dS > 0) return { q: "ΔH<0, ΔS>0", txt: "espontánea a toda T", spont: "always" };
    if (dH > 0 && dS < 0) return { q: "ΔH>0, ΔS<0", txt: "no espontánea a ninguna T", spont: "never" };
    if (dH < 0 && dS < 0) return { q: "ΔH<0, ΔS<0", txt: "espontánea a T baja (T < ΔH/ΔS)", spont: "low" };
    if (dH > 0 && dS > 0) return { q: "ΔH>0, ΔS>0", txt: "espontánea a T alta (T > ΔH/ΔS)", spont: "high" };
    return { q: "ΔH o ΔS = 0", txt: "caso límite", spont: "edge" };
  }
  function keq(dG0, T) { return Math.exp(-dG0 * 1000 / (C.R * T)); }
  function dG0FromK(K, T) { return -C.R * T * Math.log(K) / 1000; }
  function dGrxn(dG0, Q, T) { return dG0 + C.R * T * Math.log(Q) / 1000; }
  function signLabel(dG, tol) {
    tol = tol == null ? 0.05 : tol;
    return Math.abs(dG) <= tol ? "equilibrio (ΔG ≈ 0)" : dG < 0 ? "espontánea (ΔG < 0)" : "no espontánea (ΔG > 0)";
  }
  /* ΔG real de hidrólisis de ATP: ΔG = ΔG°' + RT ln([ADP][Pi]/[ATP]) (concentraciones en M) */
  function dGatp(dG0, ATP, ADP, Pi, T) { return dG0 + C.R * T * Math.log((ADP * Pi) / ATP) / 1000; }
  /* ΔG°' = -nFΔE°' (kJ/mol, E en V) */
  function dGfromE(n, dE) { return -n * C.F * dE / 1000; }

  /* ---------- Eyring ---------- */
  function eyring(dGdd, T, kappa) { return (kappa == null ? 1 : kappa) * C.kB * T / C.h * Math.exp(-dGdd * 1000 / (C.R * T)); }
  function halfLife(k) { return Math.LN2 / k; }
  function accel(ddGdd, T) { return Math.exp(ddGdd * 1000 / (C.R * T)); }
  function barrierFromK(k, T) { return -C.R * T * Math.log(k * C.h / (C.kB * T)) / 1000; }
  var YEAR = 365.25 * 86400;
  function humanTime(s) {
    if (!isFinite(s)) return "∞";
    var u = [["año", YEAR], ["día", 86400], ["h", 3600], ["min", 60], ["s", 1], ["ms", 1e-3], ["µs", 1e-6], ["ns", 1e-9], ["ps", 1e-12]];
    if (s >= YEAR) {
      var y = s / YEAR;
      return (y >= 1e3 ? y.toExponential(2).replace("e+", " × 10^") : y.toPrecision(3)) + " años";
    }
    for (var i = 1; i < u.length; i++) if (s >= u[i][1]) return (s / u[i][1]).toPrecision(3) + " " + u[i][0];
    return s.toExponential(2) + " s";
  }

  /* ---------- Michaelis–Menten e inhibición reversible ---------- */
  function mm(S, Vmax, Km) { return Vmax * S / (Km + S); }
  function alphas(I, Ki, Kip) {
    return { a: 1 + (isFinite(Ki) ? I / Ki : 0), ap: 1 + (isFinite(Kip) ? I / Kip : 0) };
  }
  function mmInhib(S, Vmax, Km, I, Ki, Kip) {
    var al = alphas(I, Ki, Kip);
    return Vmax * S / (Km * al.a + S * al.ap);
  }
  function apparent(Vmax, Km, I, Ki, Kip) {
    var al = alphas(I, Ki, Kip);
    return { Vmax: Vmax / al.ap, Km: Km * al.a / al.ap, slope: Km * al.a / Vmax, intercept: al.ap / Vmax,
      xint: -al.ap / (Km * al.a), alpha: al.a, alphap: al.ap };
  }
  function inhibType(Ki, Kip) {
    var fi = isFinite(Ki), fp = isFinite(Kip);
    if (fi && !fp) return "competitiva";
    if (!fi && fp) return "acompetitiva";
    if (fi && fp) return Math.abs(Ki - Kip) / Math.min(Ki, Kip) < 1e-9 ? "no competitiva pura" : "mixta";
    return "sin inhibición";
  }
  function kcat(Vmax, Et) { return Vmax / Et; }
  /* Unidades: 1 UI = 1 µmol/min; 1 kat = 1 mol/s = 6×10^7 UI */
  var UI_PER_KAT = 6e7;
  function uiToKat(ui) { return ui / UI_PER_KAT; }
  function katToUi(kat) { return kat * UI_PER_KAT; }

  /* ---------- Ajuste y linealizaciones ---------- */
  function linreg(x, y) {
    var n = x.length, sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0, i;
    for (i = 0; i < n; i++) { sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; sxy += x[i] * y[i]; syy += y[i] * y[i]; }
    var d = n * sxx - sx * sx, m = (n * sxy - sx * sy) / d, b = (sy - m * sx) / n;
    var ssr = 0, sst = 0, my = sy / n;
    for (i = 0; i < n; i++) { var e = y[i] - (m * x[i] + b); ssr += e * e; sst += (y[i] - my) * (y[i] - my); }
    return { slope: m, intercept: b, r2: sst === 0 ? 1 : 1 - ssr / sst };
  }
  function fitLB(S, v) {
    var f = linreg(S.map(function (s) { return 1 / s; }), v.map(function (x) { return 1 / x; }));
    return { Vmax: 1 / f.intercept, Km: f.slope / f.intercept, fit: f };
  }
  function fitEH(S, v) {
    var f = linreg(v.map(function (x, i) { return x / S[i]; }), v);
    return { Vmax: f.intercept, Km: -f.slope, fit: f };
  }
  function fitHW(S, v) {
    var f = linreg(S, S.map(function (s, i) { return s / v[i]; }));
    return { Vmax: 1 / f.slope, Km: f.intercept / f.slope, fit: f };
  }
  /* Ajuste no lineal v = Vmax·S/(Km+S) por Levenberg–Marquardt */
  function fitMM(S, v) {
    var th = fitHW(S, v), V = th.Vmax, K = th.Km;
    if (!(V > 0) || !(K > 0)) { V = Math.max.apply(null, v) * 1.2; K = S[Math.floor(S.length / 2)]; }
    function ssr(V_, K_) { var s = 0; for (var i = 0; i < S.length; i++) { var e = v[i] - V_ * S[i] / (K_ + S[i]); s += e * e; } return s; }
    var lam = 1e-3, cur = ssr(V, K);
    for (var it = 0; it < 200; it++) {
      var a11 = 0, a12 = 0, a22 = 0, g1 = 0, g2 = 0;
      for (var i = 0; i < S.length; i++) {
        var d = K + S[i], j1 = S[i] / d, j2 = -V * S[i] / (d * d), r = v[i] - V * S[i] / d;
        a11 += j1 * j1; a12 += j1 * j2; a22 += j2 * j2; g1 += j1 * r; g2 += j2 * r;
      }
      var A11 = a11 * (1 + lam), A22 = a22 * (1 + lam), det = A11 * A22 - a12 * a12;
      var dV = (g1 * A22 - g2 * a12) / det, dK = (A11 * g2 - a12 * g1) / det;
      var nV = V + dV, nK = K + dK;
      if (nV > 0 && nK > 0 && ssr(nV, nK) < cur) {
        var improv = cur - ssr(nV, nK); V = nV; K = nK; cur = ssr(V, K); lam = Math.max(lam / 3, 1e-12);
        if (improv < 1e-14 * (1 + cur)) break;
      } else { lam *= 4; if (lam > 1e12) break; }
    }
    return { Vmax: V, Km: K, ssr: cur };
  }

  /* ---------- Números aleatorios reproducibles ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- Integración numérica ---------- */
  /* Dormand–Prince RK45 adaptativo; devuelve el estado en cada tiempo de ts (ordenado ascendente). */
  function integrate(f, y0, ts, opt) {
    opt = opt || {}; var rtol = opt.rtol || 1e-8, atol = opt.atol || 1e-12, n = y0.length;
    var c = [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
    var A = [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9], [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
      [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656], [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]];
    var b5 = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0];
    var b4 = [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40];
    var y = y0.slice(), t = 0, out = [], h = (ts[ts.length - 1] || 1) * 1e-6, steps = 0, i, j, k, K;
    var idx = 0;
    while (idx < ts.length && ts[idx] <= 0) { out.push(y.slice()); idx++; }
    while (idx < ts.length) {
      var tEnd = ts[idx];
      if (t + h > tEnd) h = tEnd - t;
      K = [];
      for (k = 0; k < 7; k++) {
        var yt = y.slice();
        for (j = 0; j < k; j++) for (i = 0; i < n; i++) yt[i] += h * A[k][j] * K[j][i];
        K.push(f(t + c[k] * h, yt));
      }
      var y5 = y.slice(), err = 0;
      for (i = 0; i < n; i++) {
        var s5 = 0, s4 = 0;
        for (k = 0; k < 7; k++) { s5 += b5[k] * K[k][i]; s4 += b4[k] * K[k][i]; }
        y5[i] = y[i] + h * s5;
        var sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(y5[i]));
        err = Math.max(err, Math.abs(h * (s5 - s4)) / sc);
      }
      if (err <= 1 || h < 1e-300) {
        t += h; y = y5;
        if (Math.abs(t - tEnd) <= 1e-12 * Math.abs(tEnd)) { out.push(y.slice()); idx++; }
      }
      h *= Math.min(5, Math.max(0.2, 0.9 * Math.pow(Math.max(err, 1e-10), -0.2)));
      if (++steps > 4e6) throw new Error("integrate: demasiados pasos");
    }
    return out;
  }
  /* E + S ⇌ ES → E + P.  Estado: [S, ES, P]; E = E0 − ES.  (k1: M⁻¹s⁻¹, k−1 y k2: s⁻¹, concentraciones en M) */
  function simulateMM(p, ts) {
    var f = function (t, y) {
      var E = p.E0 - y[1], bind = p.k1 * E * y[0], unb = p.km1 * y[1], cat = p.k2 * y[1];
      return [-bind + unb, bind - unb - cat, cat];
    };
    var res = integrate(f, [p.S0, 0, 0], ts);
    return res.map(function (y) { return { S: y[0], ES: y[1], P: y[2], E: p.E0 - y[1] }; });
  }
  function mmConstants(p) { return { Km: (p.km1 + p.k2) / p.k1, Vmax: p.k2 * p.E0, kcat: p.k2, specif: p.k2 * p.k1 / (p.km1 + p.k2) }; }

  /* ---------- Álgebra pequeña: exp(M t) para el sistema lineal de control cinético/termodinámico ---------- */
  function matmul(A, B) { var n = A.length, R = [], i, j, k; for (i = 0; i < n; i++) { R.push([]); for (j = 0; j < n; j++) { var s = 0; for (k = 0; k < n; k++) s += A[i][k] * B[k][j]; R[i].push(s); } } return R; }
  function expm(M, t, stochastic) {
    var n = M.length, i, j, nrm = 0;
    var A = M.map(function (r) { return r.map(function (x) { return x * t; }); });
    for (i = 0; i < n; i++) { var rs = 0; for (j = 0; j < n; j++) rs += Math.abs(A[i][j]); nrm = Math.max(nrm, rs); }
    var sq = Math.max(0, Math.ceil(Math.log2(nrm / 0.5 + 1e-300)));
    var s = Math.pow(2, -sq); A = A.map(function (r) { return r.map(function (x) { return x * s; }); });
    var I = A.map(function (r, a) { return r.map(function (_, b) { return a === b ? 1 : 0; }); }), T = I, S = I;
    for (var k = 1; k <= 20; k++) { T = matmul(T, A).map(function (r) { return r.map(function (x) { return x / k; }); }); S = S.map(function (r, a) { return r.map(function (x, b) { return x + T[a][b]; }); }); }
    for (i = 0; i < sq; i++) {
      S = matmul(S, S);
      if (stochastic) { // el generador tiene columnas de suma cero: exp(Mt) conserva la suma de cada columna (=1); se renormaliza para frenar el redondeo
        for (j = 0; j < n; j++) { var cs = 0, r2; for (r2 = 0; r2 < n; r2++) cs += S[r2][j]; for (r2 = 0; r2 < n; r2++) S[r2][j] /= cs; }
      }
    }
    return S;
  }
  /* A ⇌ P1, A ⇌ P2. Barreras (kJ/mol) y energías libres de producto, relativas a A. */
  function twoPath(q, t) {
    var T = q.T, k1f = eyring(q.dGdd1, T), k1r = eyring(q.dGdd1 - q.G1, T), k2f = eyring(q.dGdd2, T), k2r = eyring(q.dGdd2 - q.G2, T);
    var M = [[-(k1f + k2f), k1r, k2r], [k1f, -k1r, 0], [k2f, 0, -k2r]];
    var E = expm(M, t, true); // x(t) = E · x0, x0 = [1,0,0]
    var x = [E[0][0], E[1][0], E[2][0]];
    return { A: x[0], P1: x[1], P2: x[2], rates: { k1f: k1f, k1r: k1r, k2f: k2f, k2r: k2r } };
  }
  function twoPathEquilibrium(q) {
    var w = [1, Math.exp(-q.G1 * 1000 / (C.R * q.T)), Math.exp(-q.G2 * 1000 / (C.R * q.T))], s = w[0] + w[1] + w[2];
    return { A: w[0] / s, P1: w[1] / s, P2: w[2] / s };
  }

  /* ---------- pH, temperatura, inhibición irreversible ---------- */
  function phActivity(pH, pKa1, pKa2) { var H = Math.pow(10, -pH); return 1 / (1 + H / Math.pow(10, -pKa1) + Math.pow(10, -pKa2) / H); }
  function tempActivity(T, p) {
    // p: dHdd (kJ/mol), dSdd (J/mol/K), Tm (K), dHu (kJ/mol)  — modelo didáctico de dos estados
    var k = C.kB * T / C.h * Math.exp(p.dSdd / C.R) * Math.exp(-p.dHdd * 1000 / (C.R * T));
    var dGu = p.dHu * (1 - T / p.Tm), fN = 1 / (1 + Math.exp(-dGu * 1000 / (C.R * T)));
    return { k: k, fN: fN, v: k * fN };
  }
  function kobs(kinact, KI, I) { return kinact * I / (KI + I); }
  function residualActivity(kobsv, t) { return Math.exp(-kobsv * t); }

  return { C: C, YEAR: YEAR, gibbs: gibbs, crossT: crossT, quadrant: quadrant, keq: keq, dG0FromK: dG0FromK, dGrxn: dGrxn, signLabel: signLabel,
    dGatp: dGatp, dGfromE: dGfromE, eyring: eyring, halfLife: halfLife, accel: accel, barrierFromK: barrierFromK, humanTime: humanTime,
    mm: mm, alphas: alphas, mmInhib: mmInhib, apparent: apparent, inhibType: inhibType, kcat: kcat, UI_PER_KAT: UI_PER_KAT, uiToKat: uiToKat, katToUi: katToUi,
    linreg: linreg, fitLB: fitLB, fitEH: fitEH, fitHW: fitHW, fitMM: fitMM, rng: rng, gauss: gauss, integrate: integrate,
    simulateMM: simulateMM, mmConstants: mmConstants, expm: expm, twoPath: twoPath, twoPathEquilibrium: twoPathEquilibrium,
    phActivity: phActivity, tempActivity: tempActivity, kobs: kobs, residualActivity: residualActivity };
});
