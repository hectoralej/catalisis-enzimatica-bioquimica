# Bases termodinámicas y cinéticas de la catálisis enzimática

Recurso interactivo de estudio de **Bioquímica** (UNA, Semana 6): termodinámica, cinética enzimática, inhibición y energía, con estructuras reales del PDB, simulaciones que se manipulan en tiempo real, autoevaluación y una práctica de glucólisis para completar arrastrando fichas.

## ▶ Abrir el recurso

**https://hectoralej.github.io/catalisis-enzimatica-bioquimica/**

(Funciona en computadora, tableta y celular; no necesita instalar nada.) También se puede descargar el repositorio y abrir `web/index.html` con doble clic: funciona sin internet.

## Qué contiene

21 secciones con la misma plantilla (*Lo esencial → Interactivo → Ejemplo real → Compruébalo → Más allá del profe → Fuentes y estado de verificación*):

| | |
|---|---|
| 1–5 | Mapa del recurso, energía libre de Gibbs, ΔG°′/Keq/Q, perfil de energía y estado de transición (Eyring), termodinámica vs cinética |
| 6–10 | Qué hacen las enzimas, sitio activo y ajuste inducido (adenilato quinasa 4AKE↔1AKE), modelo E+S⇌ES→E+P (simulación), cofactores, mecanismo de la triosafosfato isomerasa |
| 11–13 | Acoplamiento energético y ATP, coenzimas redox, clasificación E.C. (con modo «adivina la clase») |
| 14–17 | Velocidad inicial, Michaelis–Menten, linealizaciones y ajuste de datos, pH y temperatura |
| 18–19 | Inhibición reversible (competitiva, acompetitiva, no competitiva, mixta) e irreversible |
| 20 | Autoevaluación (82 preguntas con valores aleatorios) y hoja de fórmulas imprimible |
| 21 | **Práctica: completa la glucólisis** (esquema en blanco, arrastrar y soltar) |

- Visor 3D (3Dmol.js) con **25 estructuras reales del PDB**, verificadas por programa contra RCSB (título, organismo, ligandos, residuos y distancias medidas en el archivo).
- Moléculas 2D dibujadas con RDKit desde SMILES contrastados en 2–3 fuentes (PDB Chemical Component Dictionary, PubChem, NCI).
- Todo lo que va más allá de las diapositivas está etiquetado **«Más allá del profe»** (con interruptor); las **20 dudas/imprecisiones** detectadas se señalan con «⚠ Verificar con el profe».
- Lo que no pudo verificarse se muestra con **`[no verificado]`**; los valores de simulaciones propias, como *modelo didáctico, valores ilustrativos*.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `web/` | El recurso (HTML + CSS + JS; sin paso de compilación) |
| `datos/` | Manifiesto de estructuras, moléculas, números E.C. y `fuentes.md` (fuentes y estado de verificación) |
| `scripts/` | Verificación contra RCSB, dibujo 2D, recorte de estructuras, QA, pruebas de matemática |
| `reportes/` | Informes de verificación y de QA |

Pruebas de la matemática: `node scripts/test_math.mjs` (o abrir `web/tests.html`) → 18 pruebas.

## Notas importantes

- Es material de **estudio** de un estudiante; no sustituye al profesor ni al libro de texto. Para el examen, usar las versiones del profesor.
- Las **figuras de las diapositivas y de Nelson & Cox no se incluyen**: todo se redibujó. Las diapositivas del curso y los PDF fuente no forman parte del repositorio.
- Las imágenes de respaldo del visor 3D (`web/assets/img/`) llevan la marca de agua de una versión de evaluación de PyMOL.
- Varias fuentes de datos de la última revisión son **secundarias** (fichas de Wikipedia, material docente, BioNumbers, resúmenes de artículos); si vas a citarlos en un trabajo, contrástalos con el libro (detalle en `datos/fuentes.md`).
- Datos estructurales: RCSB PDB (CC0). Bibliotecas incluidas localmente: 3Dmol.js 2.4.2 y KaTeX 0.16.9.
