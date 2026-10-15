# Verificación de moléculas 2D (SMILES / InChIKey)

Generado por `scripts/build_2d.py` el 2026-10-14.

Criterio: se exigen ≥2 fuentes externas independientes (CCD del PDB, PubChem, resolvedor NCI/CADD) con el mismo InChIKey de conectividad (bloque 1), coherentes con el SMILES recalculado en RDKit. Una fuente discrepante se descarta si las demás concuerdan.

| Estado | id | Nombre | Fuentes externas | CCD | CID PubChem | Notas |
|---|---|---|---|---|---|---|
| **verificado** | glucosa | D-Glucosa (α-D-glucopiranosa) | ccd+pubchem+nci | GLC | 79025 |  |
| **verificado** | g6p | D-Glucosa-6-fosfato | ccd+pubchem+nci | G6P | 439284 |  |
| **verificado** | f6p | D-Fructosa-6-fosfato | ccd+pubchem+nci | F6P | 440641 |  |
| **verificado** | g3p | D-Gliceraldehído-3-fosfato (G3P) | ccd+pubchem+nci | G3H | 439168 |  |
| **verificado** | dhap | Dihidroxiacetona fosfato (DHAP) | ccd+pubchem+nci | 13P | 668 | Fuente(s) discrepante(s) descartada(s) por consenso de las demás: ['nci'] -> ['CIEYFQRZEULHJV-UHFFFAOYSA-N'] |
| **no verificado** | enediol | cis-Enediol fosfato (intermediario de la TIM) |  | - | - | Intermediario inestable sin entrada en CCD/PubChem: SMILES construido a mano (isómero de G3P/DHAP, C3H7O6P); estereoquímica cis NO codificada. [no verificado] Ninguna fuente externa pudo contrastarse. |
| **verificado** | pgh | Fosfoglicolohidroxamato (análogo del intermediario) | ccd+pubchem+nci | PGH | 4797 | Fuente(s) discrepante(s) descartada(s) por consenso de las demás: ['nci'] -> ['GDXKREPQSRTJRF-UHFFFAOYSA-N'] |
| **verificado** | 2pg | 2-Fosfoglicerato (2-PG) | ccd+pubchem+nci | 2PG | 59 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | pep | Fosfoenolpiruvato (PEP) | ccd+pubchem+nci | PEP | 1005 |  |
| **verificado** | enolpiruvato | Enolpiruvato (2-hidroxiacrilato) | pubchem+nci | - | 37873 |  |
| **verificado** | piruvato | Piruvato | ccd+pubchem+nci | PYR | 1060 |  |
| **verificado** | oxalato | Oxalato (análogo del enolato) | ccd+pubchem+nci | OXL | 971 | Fórmulas distintas por estado de protonación/carga: CCD C2 O4 vs PubChem C2H2O4. |
| **verificado** | malato | L-Malato | pubchem+nci | - | 222656 |  |
| **verificado** | oxalacetato | Oxalacetato | ccd+pubchem+nci | OAA | 970 | Fórmulas distintas por estado de protonación/carga: CCD C4 H3 O5 vs PubChem C4H4O5. |
| **verificado** | lactosa | Lactosa (β-D-galactopiranosil-(1→4)-D-glucosa) | pubchem+nci | - | 6134 |  |
| **verificado** | galactosa | D-Galactosa | ccd+pubchem+nci | GAL | 439353 |  |
| **verificado** | atp | ATP | ccd+pubchem+nci | ATP | 5957 |  |
| **verificado** | adp | ADP | ccd+pubchem+nci | ADP | 6022 |  |
| **verificado** | amp | AMP | ccd+pubchem+nci | AMP | 6083 |  |
| **verificado** | pi | Fosfato inorgánico (Pi) | ccd+pubchem+nci | PO4 | 1061 | Fórmulas distintas por estado de protonación/carga: CCD O4 P vs PubChem O4P-3. |
| **verificado** | ppi | Pirofosfato (PPi) | ccd+pubchem+nci | POP | 644102 | Fórmulas distintas por estado de protonación/carga: CCD H2 O7 P2 vs PubChem O7P2-4. |
| **verificado** | bpg13 | 1,3-Bisfosfoglicerato | pubchem+nci | - | 439191 |  |
| **no verificado** | fosfocreatina | Fosfocreatina | pubchem+nci | - | 9548602 | DISCREPANCIA de conectividad (posible tautomería/isomería si la fórmula coincide): {'pubchem': 'DRBBFCLWYRJSJZ-UHFFFAOYSA-N', 'nci': 'CFPWPNDPUSLDPF-UHFFFAOYSA-N', 'rdkit': 'DRBBFCLWYRJSJZ-UHFFFAOYSA- |
| **verificado** | ap5a | Ap5A (P1,P5-di(adenosina-5')-pentafosfato) | ccd+pubchem+nci | AP5 | 440210 |  |
| **verificado** | nad | NAD⁺ | ccd+pubchem+nci | NAD | 5892 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | nadh | NADH | ccd+pubchem+nci | NAI | 439153 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | nadp | NADP⁺ | ccd+pubchem+nci | NAP | 5885 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | nadph | NADPH | ccd+pubchem+nci | NDP | 5884 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | fad | FAD | ccd+pubchem+nci | FAD | 643975 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | fadh2 | FADH₂ | ccd+pubchem+nci | FDA | 446013 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | fmn | FMN | ccd+pubchem | FMN | 643976 |  |
| **verificado** | etanol | Etanol | ccd+pubchem+nci | EOH | 702 |  |
| **verificado** | acetaldehido | Acetaldehído | pubchem+nci | - | 177 |  |
| **verificado** | maleato | Maleato | ccd+pubchem+nci | MAE | 444266 |  |
| **verificado** | fumarato | Fumarato | ccd+pubchem+nci | FUM | 444972 |  |
| **verificado** | oxamato | Oxamato (análogo del piruvato) | ccd+pubchem+nci | OXM | 974 |  |
| **verificado** | citrato | Citrato | ccd+pubchem+nci | CIT | 311 |  |
| **verificado** | benzoato | Benzoato | ccd+pubchem+nci | BEZ | 243 |  |
| **verificado** | biotina | Biotina | ccd+pubchem+nci | BTN | 171548 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | h2o2 | Peróxido de hidrógeno | ccd+pubchem+nci | PEO | 784 |  |
| **verificado** | catecol | Catecol | ccd+pubchem+nci | CAQ | 289 |  |
| **verificado** | benzoquinona | 1,2-Benzoquinona | pubchem+nci | - | 11421 |  |
| **verificado** | metotrexato | Metotrexato | ccd+pubchem+nci | MTX | 126941 |  |
| **verificado** | folato | Ácido fólico | ccd+pubchem+nci | FOL | 135398658 |  |
| **verificado** | dihidrofolato | 7,8-Dihidrofolato | ccd+pubchem+nci | DHF | 135398604 |  |
| **verificado** | ibuprofeno | Ibuprofeno | ccd+pubchem+nci | IBP | 3672 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | aspirina | Aspirina (ácido acetilsalicílico) | ccd+pubchem+nci | AIN | 2244 |  |
| **verificado** | salicilato | Ácido salicílico | ccd+pubchem+nci | SAL | 338 |  |
| **verificado** | nevirapina | Nevirapina | ccd+pubchem+nci | NVP | 4463 |  |
| **verificado** | cianuro | Cianuro | ccd+pubchem+nci | CYN | 5975 | Fórmulas distintas por estado de protonación/carga: CCD C N vs PubChem CN-. |
| **verificado** | dfp | Diisopropil fluorofosfato (DFP) | pubchem+nci | - | 5936 |  |
| **verificado** | sarin | Sarín | pubchem+nci | - | 7871 |  |
| **verificado** | fisostigmina | Fisostigmina | pubchem+nci | - | 5983 |  |
| **verificado** | paration | Paratión | pubchem+nci | - | 991 |  |
| **verificado** | araquidonico | Ácido araquidónico | ccd+pubchem+nci | ACD | 444899 |  |
| **verificado** | f16bp | Fructosa-1,6-bisfosfato (F-1,6-BP) | ccd+pubchem+nci | FBP | 10267 |  |
| **verificado** | 3pg | 3-Fosfoglicerato (3PG) | ccd+pubchem+nci | 3PG | 724 | Alguna fuente no especifica estereoquímica (UHFFFAOYSA); se conserva la de la fuente que sí la define. |
| **verificado** | lactato | L-Lactato | pubchem+nci | - | 107689 |  |