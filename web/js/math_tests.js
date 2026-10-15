/* Pruebas de web/js/math.js. Se ejecutan en Node (scripts/test_math.mjs) o en el navegador (web/tests.html). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TCMathTests = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  return function run(M, report) {
    var results = [];
    function near(a, b, rel, abs) { rel = rel == null ? 1e-9 : rel; abs = abs || 0; return Math.abs(a - b) <= Math.max(abs, rel * Math.max(Math.abs(a), Math.abs(b))); }
    function t(name, fn) {
      try { var r = fn(); results.push({ name: name, ok: r === true || r === undefined, detail: r === true || r === undefined ? "" : String(r) }); }
      catch (e) { results.push({ name: name, ok: false, detail: "EXCEPCIÓN: " + e.message }); }
    }
    function chk(cond, msg) { if (!cond) throw new Error(msg); }

    t("Gibbs: ΔG = ΔH − TΔS (hielo, fusión: ΔH=6,01 kJ, ΔS=22,0 J/K → T de cruce ≈ 273 K)", function () {
      chk(near(M.crossT(6.01, 22.0), 273.18, 1e-3), "T cruce " + M.crossT(6.01, 22.0));
      chk(M.gibbs(6.01, 22.0, 298.15) < 0 && M.gibbs(6.01, 22.0, 263.15) > 0, "signo de ΔG");
    });
    t("Keq y ΔG°': ΔG°' = −RT ln K y ΔG = ΔG°' + RT ln Q (ΔG=0 en el equilibrio)", function () {
      var T = 298.15, K = M.keq(-10, T); chk(near(M.dG0FromK(K, T), -10, 1e-12), "ida y vuelta");
      chk(Math.abs(M.dGrxn(-10, K, T) - 0) < 1e-9, "ΔG(Q=K) = " + M.dGrxn(-10, K, T));
      chk(near(M.keq(0, T), 1, 1e-12), "K(ΔG°'=0)=1");
    });
    t("Malato → oxalacetato (ΔG°'=+29,7): puede ir hacia adelante si Q es muy pequeño", function () {
      var T = 298.15; chk(M.dGrxn(29.7, 1e-6, T) < 0, "ΔG con Q=1e-6 = " + M.dGrxn(29.7, 1e-6, T)); chk(M.dGrxn(29.7, 1, T) > 0, "ΔG con Q=1");
    });
    t("Eyring: k = (kB·T/h)·exp(−ΔG‡/RT); a 298,15 K con ΔG‡=0 → kB·T/h = 6,21×10¹² s⁻¹", function () {
      chk(near(M.eyring(0, 298.15), 6.2125e12, 1e-3), "kBT/h = " + M.eyring(0, 298.15));
      chk(near(M.eyring(80, 298.15), M.eyring(0, 298.15) * Math.exp(-80000 / (M.C.R * 298.15)), 1e-12), "exp");
    });
    t("Eyring: K = k₁/k₋₁ y ΔG‡(A→B) − ΔG‡(B→A) = ΔG°", function () {
      var T = 310, dG0 = -12.5, ddf = 70, ddr = ddf - dG0; // barrera inversa = barrera directa − ΔG°
      var K = M.eyring(ddf, T) / M.eyring(ddr, T);
      chk(near(K, M.keq(dG0, T), 1e-10), "K=" + K + " vs " + M.keq(dG0, T));
      chk(near(ddf - ddr, dG0, 1e-12), "diferencia de barreras");
    });
    t("Aceleración enzimática: exp(ΔΔG‡/RT); ΔΔG‡=30 kJ/mol a 298 K ≈ 1,8×10⁵", function () { chk(near(M.accel(30, 298.15), 1.8e5, 0.05), String(M.accel(30, 298.15))); });
    t("Michaelis–Menten: S≪Km (orden 1), S=Km → Vmax/2, S≫Km → Vmax", function () {
      var V = 80, K = 0.1;
      chk(near(M.mm(K, V, K), 40, 1e-12), "S=Km"); chk(near(M.mm(1e-5, V, K), V * 1e-5 / K, 1e-3), "S≪Km"); chk(near(M.mm(1e3, V, K), V, 1e-3), "S≫Km");
    });
    t("Linealizaciones (LB, Eadie–Hofstee, Hanes–Woolf) devuelven los mismos Vmax y Km con datos sin ruido", function () {
      var S = [0.02, 0.05, 0.1, 0.2, 0.4, 0.8, 1.6], V = 81.4, K = 0.103, v = S.map(function (s) { return M.mm(s, V, K); });
      [M.fitLB, M.fitEH, M.fitHW, M.fitMM].forEach(function (f, i) { var r = f(S, v); chk(near(r.Vmax, V, 1e-8) && near(r.Km, K, 1e-8), "método " + i + ": " + r.Vmax + ", " + r.Km); });
    });
    t("Datos de la diap. 54: ajuste no lineal ≈ (81,4 µM/min; 0,103 mM); LB ≈ (85,7; 0,120)", function () {
      var S = [.05, .10, .15, .20, .25, .30, .35, .40, .45], v = [25, 40, 48, 55, 60, 62, 63, 64, 64];
      var nl = M.fitMM(S, v), lb = M.fitLB(S, v);
      chk(near(nl.Vmax, 81.4, 0.01) && near(nl.Km, 0.103, 0.02), "NL " + nl.Vmax + ", " + nl.Km);
      chk(near(lb.Vmax, 85.7, 0.01) && near(lb.Km, 0.120, 0.02), "LB " + lb.Vmax + ", " + lb.Km);
    });
    t("Inhibición: v = Vmax·S/(Km·α + S·α′) y parámetros aparentes de los 4 tipos", function () {
      var V = 100, K = 2, I = 3, Ki = 1.5, S = 1.7, a = 1 + I / Ki;
      // competitiva (α′=1): Vmax igual, Km_app = Km·α
      var c = M.apparent(V, K, I, Ki, Infinity); chk(near(c.Vmax, V, 1e-12) && near(c.Km, K * a, 1e-12), "competitiva");
      chk(near(M.mmInhib(S, V, K, I, Ki, Infinity), M.mm(S, c.Vmax, c.Km), 1e-12), "v competitiva");
      // acompetitiva (α=1): Vmax_app = Vmax/α′, Km_app = Km/α′; pendiente sin cambio
      var u = M.apparent(V, K, I, Infinity, Ki); chk(near(u.Vmax, V / a, 1e-12) && near(u.Km, K / a, 1e-12) && near(u.slope, K / V, 1e-12), "acompetitiva");
      chk(near(M.mmInhib(S, V, K, I, Infinity, Ki), M.mm(S, u.Vmax, u.Km), 1e-12), "v acompetitiva");
      // no competitiva pura (α=α′): Vmax_app = Vmax/α, Km igual
      var n = M.apparent(V, K, I, Ki, Ki); chk(near(n.Vmax, V / a, 1e-12) && near(n.Km, K, 1e-12), "no competitiva");
      chk(near(n.xint, -1 / K, 1e-12), "la intersección con el eje x de la no competitiva pura es −1/Km");
      // mixta
      var m = M.apparent(V, K, I, Ki, 4 * Ki); chk(m.alpha !== m.alphap && M.inhibType(Ki, 4 * Ki) === "mixta", "mixta");
      chk(near(M.mmInhib(S, V, K, I, Ki, 4 * Ki), M.mm(S, m.Vmax, m.Km), 1e-12), "v mixta");
    });
    t("Lineweaver–Burk con inhibidor: 1/v = (Km·α/Vmax)(1/S) + α′/Vmax (pendiente e intercepto)", function () {
      var V = 50, K = 0.4, I = 2, Ki = 1, Kip = 5, S = [0.1, 0.2, 0.5, 1, 2, 4], v = S.map(function (s) { return M.mmInhib(s, V, K, I, Ki, Kip); });
      var f = M.linreg(S.map(function (s) { return 1 / s; }), v.map(function (x) { return 1 / x; })), ap = M.apparent(V, K, I, Ki, Kip);
      chk(near(f.slope, ap.slope, 1e-10) && near(f.intercept, ap.intercept, 1e-10), "pendiente " + f.slope + " vs " + ap.slope);
    });
    t("EDO de E + S ⇌ ES → E + P: conserva masa y converge al estado estacionario (Briggs–Haldane)", function () {
      var p = { k1: 1e6, km1: 50, k2: 100, E0: 1e-8, S0: 1e-4 }, c = M.mmConstants(p); // Km = 150/1e6 = 1,5e-4 M
      chk(near(c.Km, 1.5e-4, 1e-12), "Km");
      var ts = [1e-6, 1e-4, 1e-3, 1e-2, 1e-1, 1], r = M.simulateMM(p, ts), last;
      r.forEach(function (x) { chk(near(p.E0, x.E + x.ES, 1e-6, 1e-15), "[E]0 = [E]+[ES] falla"); chk(near(p.S0, x.S + x.ES + x.P, 1e-6, 1e-15), "[S]0 = [S]+[ES]+[P] falla"); });
      last = r[r.length - 1]; var esSS = p.E0 * last.S / (c.Km + last.S);
      chk(near(last.ES, esSS, 1e-3), "ES=" + last.ES + " vs ES_ss=" + esSS);
      var dPdt = (r[5].P - r[4].P) / 0.9, vSS = c.Vmax * last.S / (c.Km + last.S);
      chk(near(dPdt, vSS, 0.05), "v=" + dPdt + " vs " + vSS);
    });
    t("Control cinético/termodinámico: conserva masa y tiende al equilibrio de Boltzmann", function () {
      var q = { T: 298.15, dGdd1: 70, G1: -5, dGdd2: 85, G2: -20 }, e = M.twoPathEquilibrium(q);
      var a = M.twoPath(q, 1e-3); chk(near(a.A + a.P1 + a.P2, 1, 1e-9), "masa corto");
      var b = M.twoPath(q, 1e8); chk(near(b.A + b.P1 + b.P2, 1, 1e-9), "masa largo");
      chk(near(b.P1, e.P1, 1e-5, 1e-9) && near(b.P2, e.P2, 1e-5, 1e-9), "equilibrio: " + b.P1 + " vs " + e.P1);
      var s = M.twoPath(q, 0.01 / M.twoPath(q, 0).rates.k1f); chk(near(s.P1 / s.P2, Math.exp(15000 / (M.C.R * 298.15)), 0.03), "a tiempo corto P1/P2 = k1f/k2f = exp(ΔΔG‡/RT) = " + s.P1 / s.P2);
      chk(b.P2 > b.P1, "en el equilibrio domina P2 (más estable)");
    });
    t("Acoplamiento ATP: ΔG = ΔG°′ + RT ln([ADP][Pi]/[ATP]); más negativa en la célula que en condiciones estándar", function () {
      var g = M.dGatp(-30.5, 3e-3, 0.4e-3, 3e-3, 310.15); chk(g < -45 && g > -60, "ΔG ATP celular = " + g);
    });
    t("Unidades: 1 kat = 6×10⁷ UI", function () { chk(near(M.katToUi(1), 6e7, 1e-12) && near(M.uiToKat(6e7), 1, 1e-12), "conversión"); });
    t("pH: máximo en el promedio de pKa y modelo de temperatura con desnaturalización", function () {
      var best = 0, bp = 0; for (var pH = 2; pH <= 12; pH += 0.01) { var a = M.phActivity(pH, 5, 8); if (a > best) { best = a; bp = pH; } }
      chk(Math.abs(bp - 6.5) < 0.02, "pH óptimo " + bp);
      var p = { dHdd: 50, dSdd: -60, Tm: 330, dHu: 300 }, lo = M.tempActivity(300, p).v, mid = M.tempActivity(325, p).v, hi = M.tempActivity(345, p).v;
      chk(mid > lo && hi < mid, "perfil con óptimo: " + [lo, mid, hi].join(", "));
    });
    t("Inhibición irreversible: kobs = kinact·[I]/(KI+[I]) y actividad residual exp(−kobs·t)", function () {
      chk(near(M.kobs(0.1, 5, 5), 0.05, 1e-12), "kobs"); chk(near(M.residualActivity(0.05, Math.LN2 / 0.05), 0.5, 1e-12), "t½");
    });
    t("humanTime formatea escalas desde ps hasta millones de años", function () {
      chk(/ps/.test(M.humanTime(1e-12)) && /años/.test(M.humanTime(1e14)) && /min/.test(M.humanTime(120)), M.humanTime(1e-12) + " | " + M.humanTime(1e14));
    });

    var fails = results.filter(function (r) { return !r.ok; });
    if (report) report(results);
    return { total: results.length, fallos: fails.length, results: results };
  };
});
