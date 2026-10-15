// Ejecutar con Node:  node scripts/test_math.mjs
// (o abrir web/tests.html en el navegador: son las mismas pruebas).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../web/js/math.js");
const run = require("../web/js/math_tests.js");
const r = run(M);
for (const x of r.results) console.log((x.ok ? "OK  " : "FAIL") + " " + x.name + (x.detail ? "  -> " + x.detail : ""));
console.log(`\n${r.total} pruebas, ${r.fallos} fallos`);
process.exit(r.fallos ? 1 : 0);
