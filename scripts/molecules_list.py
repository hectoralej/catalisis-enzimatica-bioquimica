# -*- coding: utf-8 -*-
"""Moléculas que el recurso dibujará en 2D. Cada una se contrasta contra DOS fuentes independientes:
  (1) el Chemical Component Dictionary del PDB (RCSB), cuando existe un código CCD, y
  (2) PubChem.
Nada se dibuja de memoria: solo se declara aquí QUÉ buscar y qué palabras debe contener el nombre devuelto
(para que un código CCD equivocado, p. ej. 'G3P' = glicerol-3-fosfato, falle en vez de colarse).

Campos:  id, nombre (español), ccd (lista de candidatos), clave (palabras que debe contener el nombre CCD,
en minúsculas, cualquiera de ellas basta), pubchem (nombre de búsqueda) o cid, usos (diapositivas/secciones).
"""

M = [
    # --- glúcidos y fosfatos de la glucólisis (diap. 29–30, 43–46, 48) ---
    dict(id="glucosa", nombre="D-Glucosa (α-D-glucopiranosa)", ccd=["GLC"], clave=["glucopyranose"], pubchem="alpha-D-glucopyranose", usos="diap. 43, 44, 48; S11, S13"),
    dict(id="g6p", nombre="D-Glucosa-6-fosfato", ccd=["G6P"], clave=["phosphono-alpha-d-glucopyranose"], pubchem="alpha-D-glucose 6-phosphate", usos="diap. 43, 46, 48; S11, S13"),
    dict(id="f6p", nombre="D-Fructosa-6-fosfato", ccd=["F6P", "FBP"], clave=["phosphono-beta-d-fructofuranose"], pubchem="beta-D-fructose 6-phosphate", usos="diap. 46 (corregida); S13"),
    dict(id="g3p", nombre="D-Gliceraldehído-3-fosfato (G3P)", ccd=["G3H", "GAP"], clave=["glyceraldehyde"], pubchem="D-glyceraldehyde 3-phosphate", usos="diap. 29–30; S10"),
    dict(id="dhap", nombre="Dihidroxiacetona fosfato (DHAP)", ccd=["13P"], clave=["dihydroxyacetone"], pubchem="dihydroxyacetone phosphate", usos="diap. 29–30; S10"),
    dict(id="enediol", nombre="cis-Enediol fosfato (intermediario de la TIM)", ccd=[], clave=[], pubchem="cis-enediol phosphate", usos="diap. 29–30; S10", nota="Intermediario inestable sin entrada en CCD/PubChem: SMILES construido a mano (isómero de G3P/DHAP, C3H7O6P); estereoquímica cis NO codificada. [no verificado]", smiles_manual="OC=C(O)COP(=O)(O)O"),
    dict(id="pgh", nombre="Fosfoglicolohidroxamato (análogo del intermediario)", ccd=["PGH"], clave=["phosphoglycolohydroxamic"], pubchem="phosphoglycolohydroxamate", usos="7TIM; S6, S10"),
    dict(id="2pg", nombre="2-Fosfoglicerato (2-PG)", ccd=["2PG"], clave=["2-phosphoglyceric", "2-phosphoglycerate"], pubchem="2-phosphoglyceric acid", usos="diap. 45 (corregida); S13"),
    dict(id="pep", nombre="Fosfoenolpiruvato (PEP)", ccd=["PEP"], clave=["phosphoenolpyruvate"], pubchem="phosphoenolpyruvate", usos="diap. 45; S10, S11, S13"),
    dict(id="enolpiruvato", nombre="Enolpiruvato (2-hidroxiacrilato)", ccd=[], clave=[], pubchem="2-hydroxyacrylic acid", usos="S10 (PK)"),
    dict(id="piruvato", nombre="Piruvato", ccd=["PYR"], clave=["pyruvic", "pyruvate"], pubchem="pyruvic acid", usos="diap. 47, 48; S10, S13"),
    dict(id="oxalato", nombre="Oxalato (análogo del enolato)", ccd=["OXL"], clave=["oxalate"], pubchem="oxalic acid", usos="1A49; S10"),
    dict(id="malato", nombre="L-Malato", ccd=[], clave=[], pubchem="L-malic acid", usos="diap. 42; S3, S13"),
    dict(id="oxalacetato", nombre="Oxalacetato", ccd=["OAA"], clave=["oxaloacetate", "oxaloacetic"], pubchem="oxaloacetic acid", usos="diap. 42, 47; S3, S13"),
    dict(id="lactosa", nombre="Lactosa (β-D-galactopiranosil-(1→4)-D-glucosa)", ccd=[], clave=[], pubchem="beta-lactose", usos="diap. 44; S13"),
    dict(id="galactosa", nombre="D-Galactosa", ccd=["GAL", "GLA"], clave=["galactopyranose"], pubchem="beta-D-galactopyranose", usos="diap. 44; S13"),
    # --- nucleótidos y energía (diap. 33–37, 43, 47) ---
    dict(id="atp", nombre="ATP", ccd=["ATP"], clave=["adenosine-5'-triphosphate"], pubchem="adenosine triphosphate", usos="diap. 35–37, 43, 47; S11"),
    dict(id="adp", nombre="ADP", ccd=["ADP"], clave=["adenosine-5'-diphosphate"], pubchem="adenosine diphosphate", usos="diap. 36, 43; S11"),
    dict(id="amp", nombre="AMP", ccd=["AMP"], clave=["adenosine monophosphate"], pubchem="adenosine monophosphate", usos="S11"),
    dict(id="pi", nombre="Fosfato inorgánico (Pi)", ccd=["PO4"], clave=["phosphate"], pubchem="phosphate", usos="diap. 36; S11"),
    dict(id="ppi", nombre="Pirofosfato (PPi)", ccd=["POP", "2HP"], clave=["pyrophosphate", "diphosphate"], pubchem="pyrophosphate", usos="diap. 15; S11"),
    dict(id="bpg13", nombre="1,3-Bisfosfoglicerato", ccd=[], clave=[], pubchem="1,3-bisphosphoglyceric acid", nci="3-phospho-D-glyceroyl phosphate", usos="S11 (escala de potencial de transferencia)"),
    dict(id="fosfocreatina", nombre="Fosfocreatina", ccd=[], clave=[], pubchem="phosphocreatine", usos="S11 (escala de potencial de transferencia)"),
    dict(id="ap5a", nombre="Ap5A (P1,P5-di(adenosina-5')-pentafosfato)", ccd=["AP5"], clave=["pentaphosphate"], pubchem="diadenosine pentaphosphate", usos="1AKE; S7"),
    # --- coenzimas redox (diap. 38–39) ---
    dict(id="nad", nombre="NAD⁺", ccd=["NAD"], clave=["nicotinamide-adenine-dinucleotide"], pubchem="NAD+", usos="diap. 38, 42; S12"),
    dict(id="nadh", nombre="NADH", ccd=["NAI"], clave=["1,4-dihydronicotinamide", "dihydro-nicotinamide", "nadh"], pubchem="NADH", usos="diap. 38; S12"),
    dict(id="nadp", nombre="NADP⁺", ccd=["NAP"], clave=["nicotinamide-adenine-dinucleotide phosphate"], pubchem="NADP+", usos="diap. 38; S12"),
    dict(id="nadph", nombre="NADPH", ccd=["NDP"], clave=["nadph", "dihydro-nicotinamide-adenine-dinucleotide phosphate"], pubchem="NADPH", usos="1U72; S12, S18"),
    dict(id="fad", nombre="FAD", ccd=["FAD"], clave=["flavin-adenine dinucleotide"], pubchem="flavin adenine dinucleotide", usos="diap. 39; S12"),
    dict(id="fadh2", nombre="FADH₂", ccd=["FDA"], clave=["dihydroflavine", "dihydro"], pubchem="FADH2", usos="diap. 39; S12"),
    dict(id="fmn", nombre="FMN", ccd=["FMN"], clave=["flavin mononucleotide"], pubchem="flavin mononucleotide", usos="diap. 39; S12"),
    dict(id="etanol", nombre="Etanol", ccd=["EOH"], clave=["ethanol"], pubchem="ethanol", usos="diap. 48; S12, S13"),
    dict(id="acetaldehido", nombre="Acetaldehído", ccd=[], clave=[], pubchem="acetaldehyde", usos="diap. 48; S13"),
    dict(id="maleato", nombre="Maleato", ccd=["MAE"], clave=["maleic", "maleate"], pubchem="maleic acid", usos="diap. 48; S13"),
    dict(id="fumarato", nombre="Fumarato", ccd=["FUM"], clave=["fumaric", "fumarate"], pubchem="fumaric acid", usos="diap. 48; S13"),
    dict(id="oxamato", nombre="Oxamato (análogo del piruvato)", ccd=["OXM"], clave=["oxamic"], pubchem="oxamic acid", usos="1I10; S12"),
    dict(id="citrato", nombre="Citrato", ccd=["CIT"], clave=["citric"], pubchem="citric acid", usos="1EMD; S13"),
    dict(id="benzoato", nombre="Benzoato", ccd=["BEZ"], clave=["benzoic"], pubchem="benzoic acid", usos="1KIF; S12"),
    dict(id="biotina", nombre="Biotina", ccd=["BTN"], clave=["biotin"], pubchem="biotin", usos="diap. 47; S13"),
    dict(id="h2o2", nombre="Peróxido de hidrógeno", ccd=["PEO"], clave=["hydrogen peroxide", "peroxide"], pubchem="hydrogen peroxide", usos="diap. 12–14; S2, S5"),
    # --- caso aguacate (diap. 59) ---
    dict(id="catecol", nombre="Catecol", ccd=["CAQ", "CAT"], clave=["catechol", "benzene-1,2-diol"], pubchem="catechol", usos="diap. 59; S17"),
    dict(id="benzoquinona", nombre="1,2-Benzoquinona", ccd=[], clave=[], pubchem="1,2-benzoquinone", usos="diap. 59; S17"),
    # --- inhibidores (diap. 60–65) ---
    dict(id="metotrexato", nombre="Metotrexato", ccd=["MTX"], clave=["methotrexate"], pubchem="methotrexate", usos="1U72; S18"),
    dict(id="folato", nombre="Ácido fólico", ccd=["FOL"], clave=["folic"], pubchem="folic acid", usos="S18"),
    dict(id="dihidrofolato", nombre="7,8-Dihidrofolato", ccd=["DHF"], clave=["dihydrofolic"], pubchem="dihydrofolic acid", usos="S18"),
    dict(id="ibuprofeno", nombre="Ibuprofeno", ccd=["IBP"], clave=["ibuprofen"], pubchem="ibuprofen", usos="4PH9; S18, S19"),
    dict(id="aspirina", nombre="Aspirina (ácido acetilsalicílico)", ccd=["AIN"], clave=["acetyloxy)benzoic"], pubchem="aspirin", usos="5F19; S19"),
    dict(id="salicilato", nombre="Ácido salicílico", ccd=["SAL"], clave=["hydroxybenzoic"], pubchem="salicylic acid", usos="S19"),
    dict(id="nevirapina", nombre="Nevirapina", ccd=["NVP"], clave=["dipyrido"], pubchem="nevirapine", usos="1VRT; S18"),
    dict(id="cianuro", nombre="Cianuro", ccd=["CYN"], clave=["cyanide"], pubchem="cyanide", usos="diap. 61; S19"),
    dict(id="dfp", nombre="Diisopropil fluorofosfato (DFP)", ccd=[], clave=[], pubchem="diisopropyl fluorophosphate", usos="diap. 61; S19"),
    dict(id="sarin", nombre="Sarín", ccd=[], clave=[], pubchem="sarin", usos="diap. 61; S19"),
    dict(id="fisostigmina", nombre="Fisostigmina", ccd=[], clave=[], pubchem="physostigmine", usos="diap. 61; S19"),
    dict(id="paration", nombre="Paratión", ccd=[], clave=[], pubchem="parathion", usos="diap. 61; S19"),
    dict(id="araquidonico", nombre="Ácido araquidónico", ccd=["ACD"], clave=["arachidonic"], pubchem="arachidonic acid", usos="diap. 65; S19"),
    # --- glucólisis (PDF MetWebProjGlycolysis; S21) ---
    dict(id="f16bp", nombre="Fructosa-1,6-bisfosfato (F-1,6-BP)", ccd=["FBP"], clave=["fructofuranose", "bisphosphate", "fructose 1,6"], pubchem="beta-D-fructose 1,6-bisphosphate", usos="PDF glucólisis; S21"),
    dict(id="3pg", nombre="3-Fosfoglicerato (3PG)", ccd=["3PG"], clave=["3-phosphoglyceric", "3-phosphoglycerate"], pubchem="3-phosphoglyceric acid", usos="PDF glucólisis; S21"),
    dict(id="lactato", nombre="L-Lactato", ccd=[], clave=[], pubchem="L-lactic acid", usos="PDF glucólisis; S21"),
]
