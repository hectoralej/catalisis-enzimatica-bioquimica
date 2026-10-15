# QA del recurso (Fase 4) — 2026-10-14

Método: `scripts/qa_run.py` abre `web/index.html` por **`file://` y sin red** (proxy a un puerto cerrado) con Edge headless, ejecuta el JavaScript, vuelca el DOM de cada sección y busca avisos de error de la plantilla y mensajes de consola. Además, revisión manual en el navegador integrado (claro/oscuro, ancho móvil de 375 px). No hay Node/Playwright en la máquina; las pruebas de matemática corren en el navegador (`web/tests.html`).

## Lista de comprobación del brief (§10)
| Punto | Estado | Evidencia / nota |
|---|---|---|
| `verify_structures.py` sin errores; todas las estructuras usadas `verificado` | ✔ | 27 de 27 entradas (`reportes/verificacion_estructuras.md`). Las no verificables llevan `[no verificado]` en la interfaz (p. ej., equivalencia de numeración 4PH9). |
| Residuos y distancias del HTML = lo medido | ✔ | El visor lee los valores de `structmeta.js`, generado del manifiesto medido; sin cifras escritas a mano salvo las citadas en texto (3,06; 2,72; 2,66; 1,62; 3,25 Å…, coinciden con el informe). |
| SMILES contrastados con 2 fuentes | ◐ | 53 de 55 con ≥ 2 fuentes; cis-enediol (hecho a mano) y fosfocreatina (tautómero en discordia) `[no verificado]` y rotulados. |
| `test_math.mjs` / pruebas matemáticas | ✔ | 18 pruebas, 0 fallos con **Node v24.20.0** (`node scripts/test_math.mjs`; Node se instaló en la 2.ª sesión con winget, ámbito de usuario) y en `web/tests.html` (Eyring; K = k₁/k₋₁; límites de MM; LB/EH/HW iguales sin ruido; los 4 tipos de inhibición y sus Vmax_ap/Km_ap; EDO con conservación de masa y estado estacionario). |
| Recorrer las 20 secciones, **cero errores**, capturas, claro/oscuro, móvil | ✔ / ◐ | 20/20 secciones sin errores ni avisos y con las 6 partes de la plantilla; capturas `qa_*.png`. Móvil verificado midiendo desbordamiento horizontal en el navegador integrado (375 px): 0 px tras corregir fórmulas KaTeX y figuras 2D. Las capturas móviles de Edge headless salen recortadas (limitación de `--window-size`), no son prueba del diseño. El modo oscuro se revisó en el navegador integrado; el interruptor de Edge headless no aplicó el esquema, por lo que `qa_*_oscuro_*.png` salen en claro. |
| Funciona **sin internet** | ✔ | El QA se hizo con red bloqueada. Solo enlaces `<a>` a RCSB/DOI salen a internet; 3Dmol y KaTeX están vendorizados. |
| Sin figuras copiadas de las diapositivas | ✔ | Todo redibujado (SVG propio, RDKit, 3Dmol); las figuras de Nelson & Cox no se usan. |
| Cada sección: interactivo, ejemplo real, «Compruébalo» | ✔ | Ver filas de `qa_resumen_auto.json`: 6 bloques y ≥ 3 preguntas por sección. Ejemplos sin 3D: S14 (usa 1I10), S16 (datos de la diap. 54 sin estructura, dicho en pantalla). |
| Las 20 dudas señalizadas | ✔ | Índice en la sección 1; cada una aparece en su sección. |
| Peso ≤ 25 MB | ✔ | `web/` = 6,3 MB; mayor estructura 166 KB (≤ 300 KB). |
| Cobertura de las 65 diapositivas | ✔ | Las referencias «Diap. N» cubren 1–65 (S1: 1–2; S2: 4–8; S5: 3, 12–15; S3: 9, 16–17; S4: 9–11; S6: 18–19, 27–28, 31; S7: 20–22; S8: 26; S9: 23–25; S10: 29–30; S11: 32–37; S12: 38–39; S13: 40–48; S14: 49–52; S15: 53–56; S16: 54, 57; S17: 58–59; S18: 60, 62–64; S19: 61, 65). |
| PNG de respaldo (PyMOL, trazado de rayos) | ◐ | 26 PNG generados (8,5 MB); **llevan la marca de agua de la versión de evaluación de PyMOL**, aceptada por el usuario y declarada en el botón del visor. Con licencia: `scripts/pymol/render_all.py`. |

## Defectos conocidos
- Sin imagen de respaldo si el navegador no tiene WebGL (se avisa en pantalla).
- En S16, las etiquetas «ajuste no lineal» y «verdadera» se pisan cuando las curvas coinciden.
- Valores de libro de texto `[no verificado]`: ΔG°′ de PEP, 1,3-BPG, fosfocreatina, G1P, F6P, G6P, glicerol-3-fosfato; E°′ de los pares redox; tabla de kcat/Km; ΔS y ΔH del hielo/H₂O₂; pH óptimos; vida media del ADN; aceleración de la catalasa.
- Pendiente de fuente (no accesible desde esta máquina): SABIO-RK/BRENDA (sin DNS), NIST WebBook para H₂O₂ (sin datos), Albery & Knowles 1976 (sin resumen).
