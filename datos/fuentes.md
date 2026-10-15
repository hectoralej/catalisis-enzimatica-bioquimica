# Fuentes y estado de verificación (documento vivo)

Estado: **[verificado]** = comprobado por programa o leyendo el resumen/registro oficial; **[pendiente]** = aún sin comprobar (no se usará como hecho hasta verificarlo); **[no verificado]** = se intentó y no se pudo; se mostrará así en la interfaz.
Fecha de esta versión: 2026-10-14 (Fase 2).

## 1. Estructuras de proteínas (PDB) — [verificado] por `scripts/verify_structures.py`
Detalle por entrada (título, organismo, resolución, ligandos, residuos, distancias medidas, DOI): `reportes/verificacion_estructuras.md` y `datos/estructuras_manifest.json`.
Fuente: RCSB PDB (API `data.rcsb.org`, archivos mmCIF `files.rcsb.org`; datos CC0). Numeración de residuos = **numeración de autor del mmCIF**.

**Alcance de "verificado" en estructuras:** el ID existe, título/organismo/resolución/ligandos coinciden con RCSB, cada residuo citado es del tipo correcto en esa posición y las distancias están medidas en el mmCIF. Los **roles catalíticos** del campo `rol` (p. ej. "ácido/base general") son anotaciones mías de la literatura: solo los respaldados por las diapositivas (Glu165/His95 de la TIM) o por un contacto medido se mostrarán como hecho; el resto irá rotulado `[rol de la literatura, sin verificar]` en la interfaz.

Entradas verificadas (27): 1NEY, 7TIM, 4AKE, 1AKE, 2YHX*, 1IG8*, 1I10, 6ADH, 1EMD, 1KIF, 5CPA, 4V40, 1ONE, 1IAT, 3BG3, 1CA2, 1QIN, 1DGF, 1ATP, 1U72, 4PH9, 1BT3, 4CHA, 1A49, 5FPQ, 5F19, 1VRT. (*2YHX y 1IG8 se conservan solo como registro: no se usarán.)
No usar: 1HKG (resolución baja, ligando desconocido) y 1BGL (obsoleto, reemplazado por 4V40).

Correcciones de la Fase 2 respecto del brief (ver notas en el manifiesto):
- **1NEY (DHAP, código CCD `13P`)**: la numeración atómica del CCD pone el fosfato en C1 y el CH₂OH en C3 (inversa a la IUPAC del DHAP). Distancias medidas (átomos pesados): Glu165 O – C3(CH₂OH) 3,06 Å; His95 Nε2 – O2 (carbonilo) 2,72 Å; Lys12 Nζ – O2 3,07 Å.
- **1QIN (glioxalasa I)**: el dímero tiene **2 Zn** (A401 y B301), uno por sitio activo; cada Zn lo coordinan Gln33 y Glu99 de una subunidad y His126 de la otra (≈2,0 Å). Glu172 queda a 3,25 Å (no coordina directamente en este complejo con inhibidor). Los ligandos GIP son A300 y B400.
- **1I10 (LDH-A)**: el archivo empieza en Ala1 (sin Met inicial): la His catalítica es **His192 del archivo = His193 de UniProt P00338** [verificado en UniProt: "Active site 193, proton acceptor"].
- **4PH9 (COX-2 de ratón)**: Arg, Tyr y Ser son **Arg121, Tyr356, Ser531 en el archivo** (convención de la literatura COX: 120/355/530). La equivalencia no se pudo comprobar en el artículo (no es acceso abierto) → **[no verificado]**; el contacto con el carboxilato del ibuprofeno sí está medido (Arg121 NE–O 2,97 Å; Tyr356 OH–O 2,42 Å).
- **1ONE (enolasa)**: Glu211 NO coordina Mg²⁺ (7,4 Å). Mg 438 lo coordinan Asp246, Glu295, Asp320 (1,9–2,1 Å) y Mg 439 Ser39 (2,2 Å).
- **3BG3 (piruvato carboxilasa)**: la biotina de la cadena A está a 3,7 Å del piruvato del sitio activo de la **cadena B** (la propia cadena A la tiene a 76 Å): la biotina de una subunidad actúa en el sitio de la vecina.
- **1VRT (nevirapina–RT)**: la nevirapina está a 12,9 Å (Asp110) y 14,6 Å (Asp185) de los carboxilatos del sitio activo de la polimerasa.
- **Pares abierto/cerrado (4AKE→1AKE)**: alineamiento con PyMOL (`scripts/pymol/ak_align.py`) sobre los Cα del CORE (residuos 1–29, 60–121, 160–214): RMSD 1,98 Å (146 Cα), confirmado con Biopython (1,98 Å). Se mueven los segmentos 32–66 (máx. 18,2 Å) y 120–162 (máx. 23,6 Å); RMS NMP(30–59) = 11,3 Å, LID(122–159) = 15,5 Å. Cadena B coincide (1,96 Å).

Candidatos buscados en la Fase 2 (los que el brief pedía encontrar):
| Necesidad | Elegida | Por qué |
|---|---|---|
| Piruvato quinasa con PEP/análogo y ATP | **1A49** (conejo, 2,1 Å, Mg-ATP-K-**oxalato**) | Oxalato como análogo del enolato; la analogía viene del título del PDB, no se comprobó en el artículo **[no verificado]**. Alternativa con PEP real: 8IAX (*S. pneumoniae*, 1,8 Å) sin ATP. |
| AChE inhibida por organofosforado | **5FPQ** (humana, 2,4 Å, Ser203 fosfonilada por sarín, residuo `SGB`) | Aducto covalente visible; His447 a 3,3 Å y hueco del oxianión (Gly121, Gly122, Ala204). |
| COX acetilada por aspirina | **5F19** (humana COX-2, 2,04 Å, Ser530 = `OAS`) | El archivo conserva la numeración convencional 530. Ref. clásica: Loll *et al.* 1995 (1PTH, ovina). |
| Inhibición **no competitiva** con estructura | **1VRT** (nevirapina–RT del VIH-1) | Spence *et al.* 1995 la describen como inhibidor no competitivo. |
| Inhibición **acompetitiva** con estructura | **ninguna estructura adecuada** | Li⁺–inositol monofosfatasa es el ejemplo clásico (acompetitivo frente a Ins-1-P, Hallcher & Sherman 1980) pero los PDB de IMPasa encontrados (2BJI, 2HHM…) no contienen Li⁺ como inhibidor. **Tarjeta sin 3D**, con esquema 2D y nombre. |

## 2. Moléculas 2D — `datos/moleculas.json`, `reportes/verificacion_moleculas.md`
55 moléculas; **53 [verificado]** con ≥2 fuentes externas independientes (CCD del PDB, PubChem, resolvedor NCI/CADD) coincidentes en el InChIKey de conectividad y coherentes con RDKit. Dos no:
- **cis-Enediol (intermediario de la TIM)**: no existe en CCD/PubChem; SMILES construido a mano (isómero C₃H₇O₆P); estereoquímica cis no codificada → **[no verificado]**.
- **Fosfocreatina**: PubChem y NCI difieren en la posición del H móvil (tautómero N–P); misma fórmula → **[no verificado]**; solo se usa en la escala de potencial de transferencia (S11); se mostrará con aviso.
Notas: en 2 casos (DHAP y PGH) el resolvedor NCI discrepaba y se descartó por consenso de CCD + PubChem + RDKit. Los SMILES de dibujo a pH ~7 (fosfatos y carboxilos desprotonados) conservan el InChIKey de conectividad.
Errores de las diapositivas que se corrigen **señalizados**: 2-fosfoglicerato (no 2-fosfolactato, diap. 45) y G6P ⇌ F6P (no los "1-fosfato", diap. 46); en el malato se usa **L-malato** (el código CCD `MLT` es D-malato).

## 3. Literatura comprobada (resumen/registro consultado)
| Tema | Referencia | Qué se verificó | Estado |
|---|---|---|---|
| Vida media del enlace fosfodiéster | Schroeder *et al.* 2006, PNAS, doi:10.1073/pnas.0510879103 | Resumen: dineopentilfosfato (diéster modelo) t½ = **30 000 000 años** a 25 °C (límite P–O). **No** aparece "6 millones de años" de la diap. 15; la cifra para ADN propiamente dicho no se ha verificado. | verificado (resumen) / cifra de ADN **[pendiente]** |
| Nevirapina: no competitiva | Spence *et al.* 1995, Science, doi:10.1126/science.7532321 | Resumen: "noncompetitive inhibitors" que se unen a un bolsillo hidrofóbico del complejo enzima–ADN | verificado (resumen) |
| Li⁺ acompetitivo | Hallcher & Sherman 1980, JBC, doi:10.1016/s0021-9258(19)70391-3 | Resumen: Li⁺ es inhibidor **acompetitivo** frente a Ins-1-P y no competitivo frente a Mg²⁺ (enzima de cerebro bovino) | verificado (resumen) |
| Metotrexato competitivo | Resumen en doi:10.1074/jbc.M109.018010 (DHFR humana F31R/Q35E) | "slow, tight-binding, competitive inhibitor of human DHFR" (frente al sustrato dihidrofolato) | verificado (resumen) |
| Metotrexato (clásico) | Werkheiser 1961, JBC, doi:10.1016/s0021-9258(18)64324-8 | DOI localizado en Crossref; resumen no disponible | **[pendiente]** |
| Aspirina acetila Ser530 | Loll *et al.* 1995, Nat Struct Biol, doi:10.1038/nsb0895-637 | Resumen: acetilación selectiva de Ser530 de PGHS | verificado (resumen) |
| TIM "enzima perfecta" | Albery & Knowles 1976, Biochemistry, doi:10.1021/bi00670a032 | DOI localizado; sin resumen | **[pendiente]** |

## 3b. Verificado en la segunda sesión (2026-10-15)
- **H₂O₂ (diap. 12–14):** ΔH° = 2·ΔfH°(H₂O,l) − 2·ΔfH°(H₂O₂,l) = 2(−285,83) − 2(−187,80) = **−196,06 kJ** ≈ −196,0 del profe. H₂O: NIST WebBook (ΔfH° −285,83; S° 69,95); H₂O₂: ficha de datos (Wikipedia, tabulación tipo CRC; fuente secundaria). ΔS° = **+126,0 J/K** *deducida de los números del profe* con ΔG° = 2·(−116,78) = −233,56 kJ; con −116,78 por la ecuación escrita saldría −265,7 J/K (absurdo con un gas liberado). Esto confirma la duda 1. NIST WebBook no tiene H₂O₂ líquido.
- **Hielo:** ΔH_fus = 6,01 kJ/mol, ΔS_fus = 22,0 J/(mol·K) a 273,15 K (Wikipedia, «Water (data page)», fuente secundaria); 6010/22,0 = 273,2 K.
- **TIM limitada por difusión:** Blacklow *et al.* 1988, Biochemistry (doi:10.1021/bi00404a013, título/resumen) y resumen de Davenport *et al.* 1991 (doi:10.1021/bi00238a002). El valor numérico del límite de difusión sigue [no verificado].
- ATP ΔG°′ = −30,5 kJ/mol aparece en el resumen de doi:10.1093/pcp/pcm126 (coincide con el profe).
- **Segunda ronda (sin reCAPTCHA, vía fichas de Wikipedia, fuente SECUNDARIA que cita a Berg/Voet/Nelson & Cox/Mathews):**
  - **kcat/Km:** fila de Mathews *et al.* 1999 (reproducida en «Michaelis–Menten kinetics»): quimotripsina (Km 1,5×10⁻² M; kcat 0,14 s⁻¹), pepsina (3,0×10⁻⁴; 0,50), tRNA sintetasa (9,0×10⁻⁴; 7,6), ribonucleasa (7,9×10⁻³; 7,9×10²), **anhidrasa carbónica (2,6×10⁻²; 4,0×10⁵)**, fumarasa (5,0×10⁻⁶; 8,0×10²). **Corrección:** mi fila anterior de la anhidrasa carbónica (kcat 10⁶, Km 0,012) era de memoria y no coincidía; ya está sustituida. AChE, catalasa, crotonasa, TIM y β-lactamasa siguen [no verificado].
  - **E°′ (pH 7, 25 °C):** NAD⁺/NADH −0,320 V (también «midpoint potential −0,32 V» en la ficha del NAD); FAD/FADH₂ −0,22; piruvato/lactato −0,19; oxalacetato/malato −0,17; O₂/H₂O +0,82. Con −0,32 y −0,17 la malato DH da ΔG°′ = +28,9 kJ/mol (≈ +29,7 del profe; la diferencia es redondeo). Acetaldehído/etanol (−0,197) sigue [no verificado] (no está en la tabla).
  - **ΔG°′:** PEP −61,9 kJ/mol (ficha del PEP); ATP −30,5 (ficha del ATP, cita a Nelson & Cox; también en el resumen doi:10.1093/pcp/pcm126). 1,3-BPG, fosfocreatina, G1P, F6P, G6P y glicerol-3-fosfato siguen [no verificado].
- **Tercera ronda (con búsqueda web, sin reCAPTCHA):**
  - **ΔG°′ de hidrólisis** (kJ/mol; fuentes: hoja de problemas CHE 472, Buffalo State, y tabla «A Few Standard Free Energy Changes» de la Univ. Estatal de Florida; ficha del PEP en Wikipedia): PEP −61,9; 1,3-BPG −49 (−49,4/−49,6 según fuente); fosfocreatina −43; ATP −30,5; glucosa-1-P −21; glucosa-6-P −14; glicerol-3-P −9. Mis decimales son conversión de kcal/mol (±0,2 kJ). **Fructosa-6-fosfato (−15,9): sigue [no verificado]** (ninguna fuente lo da; podría ser la fructosa-1-fosfato).
  - **kcat/Km — corrección de mi corrección:** la tabla de Nelson & Cox (*Lehninger* 4.ª ed., tabla 6-8; copia de curso de H. Jakubowski, CSB/SJU; BioNumbers 105087/103917) da: AChE 1,4×10⁴ s⁻¹ / 9×10⁻⁵ M; **anhidrasa carbónica con CO₂ 1×10⁶ / 1,2×10⁻² y con HCO₃⁻ 4×10⁵ / 2,6×10⁻²** (mi fila original con CO₂ era correcta y la de Wikipedia/Mathews corresponde al HCO₃⁻; ambas están ahora en la tabla); catalasa 4×10⁷ / 1,1; crotonasa 5,7×10³ / 2×10⁻⁵; fumarasa 800 / 5×10⁻⁶; **TIM 4,3×10³ / 4,7×10⁻⁴ (kcat/Km 2,4×10⁸; mi Km de 1,8×10⁻⁵ estaba mal)**; **β-lactamasa 2×10³ / 2×10⁻⁴ (mi Km de 2×10⁻⁵ estaba mal)**. Los valores de memoria erróneos ya están sustituidos.
  - **Límite de difusión ≈ 10⁸–10⁹ M⁻¹s⁻¹:** Stryer *et al.*, *Biochemistry* 5.ª ed., tabla 8.8 (primaria: Fersht 1999, tabla 4.5), vía BioNumbers 105087.
  - **E°′ acetaldehído/etanol −0,197 V:** HyperPhysics (tabla 5.1 de Karp) y tabla en PMC (−197 mV).
  - **pH óptimos:** amilasa salival ≈ 6–7 (≈ 6,8), pepsina ≈ 1,5–2, arginasa ≈ 9,2–9,5 (**no 10**; varía con el organismo). Fuentes secundarias (material docente, ficha del fabricante, artículos).
  - **ADN (duda 2):** Schroeder 2006 (PMC1449644): ~30 millones de años para dineopentilfosfato (ruptura P–O); el valor anterior de 130 000–140 000 años (fosfato de dimetilo, Science 1995) estaba dominado por ruptura C–O. El «6 millones de años» de la diapositiva sigue [no verificado].
  - **Duda 11:** fisostigmina se descarbamila espontáneamente (inhibición reversible, acción corta; Dawson 1994/1995); cianuro: unión muy fuerte (Kd ≤ 50 nM) pero reversible al lavar mitocondrias de hígado de rata (Nuskova 2010).
  - **Sigue sin fuente:** aceleración de la catalasa (10⁹) y del Fe³⁺ (10³) de la diap. 13; fructosa-6-fosfato.
- **PyMOL:** sigue siendo evaluación sin licencia. El usuario aceptó que las imágenes lleven la marca de agua: se renderizaron las 26 (`web/assets/img/`, 8,5 MB) y el botón del visor lo indica («versión de evaluación, con marca de agua»).

## 4. Pendientes para la Fase 3 (no se usarán como hecho hasta verificarlos)
1. Termodinámica del H₂O₂ (NIST/CRC): ΔG°, ΔH°, ΔS° para la ecuación escrita (mis cálculos con valores de memoria: −233,4 kJ, −196,0 kJ, +125,7 J/K; **[pendiente de fuente]**).
2. Aceleración por catalasa (10⁹) y por Fe³⁺ (10³) de las diap. 13: kcat y reacción no catalizada.
3. Constantes reales (Km, kcat, kcat/Km) de BRENDA/SABIO-RK: hexoquinasa vs glucoquinasa, anhidrasa carbónica II, catalasa, quimotripsina, TIM.
4. Escala de potencial de transferencia de grupo (Lehninger/Voet) y E°′ de NAD⁺/NADH, NADP⁺/NADPH, FAD/FADH₂.
5. pH óptimos numéricos de amilasa salival, pepsina y arginasa (diap. 58 solo tiene curvas cualitativas).
6. E.C. en ExplorEnz: 1.1.1.1; 2.7.1.1 vs 2.7.1.2 (hexoquinasa/glucoquinasa); 3.2.1.23; 3.4.17.1; 4.1.1.1; 4.2.1.11 (enolasa); 5.3.1.1; 5.3.1.9; 5.2.1.1; 6.4.1.1. **Ninguno comprobado aún.**
7. Matiz cianuro/fisostigmina (diap. 61) y orden de magnitud de kcat/Km de la TIM.

## 5. Sección 21 — práctica de glucólisis (2026-10-16)
- **Fuente del esquema:** `contenido/glicolisis/fuente_glicolisis.pdf` (= `MetWebProjGlycolysis.pdf`, «Glycolysis 10A», aportado por el usuario; sin autoría en el archivo). De ahí salen los pasos, los textos (inglés literal + traducción mía), el orden, los reguladores y los **ΔG° / ΔG en kcal/mol** (paso 1: −4/−8; 3: −3,4/−5,3; 4: +5,7/−0,3; 6: ΔG° +1,5; 7: −4,5/+0,3 [el PDF rotula «0.3» sin signo]; 10: −7,5/−4).
- **Estructuras:** redibujadas con RDKit desde SMILES contrastados (F-1,6-BP: CCD FBP + PubChem + NCI; 3PG: CCD 3PG + PubChem + NCI; L-lactato: PubChem + NCI, el CCD `LAC` es el enantiómero D; 1,3-BPG, PEP, 2PG, G3P, DHAP, piruvato, glucosa, G6P, F6P ya verificados). DHAP en rojo y G3P en azul como en el PDF (C1–C3 / C4–C6 de la F-1,6-BP).
- **Números E.C.** verificados en Expasy ENZYME: 2.7.1.1, 5.3.1.9, 2.7.1.11, 4.1.2.13, 5.3.1.1, 1.2.1.12, 2.7.2.3, 5.4.2.11 (también existe 5.4.2.12, independiente de 2,3-BPG), 4.2.1.11, 2.7.1.40, 1.1.1.27.
- **Comprobación cruzada (verificada con la escala de la sección 11):** ΔG° de los pasos 1, 7 y 10 = ΔG° hidrólisis(donador) − ΔG° hidrólisis(ATP): −16,7 / −18,9 / −31,4 kJ = −4,0 / −4,5 / −7,5 kcal, igual que el PDF.
- **Duda nueva (para el profe):** el PDF marca AMP como activador de la piruvato quinasa; lo habitual (mamíferos) es F-1,6-BP como activador. [no verificado] si el AMP la activa en alguna isoforma/organismo.
