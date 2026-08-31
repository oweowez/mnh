# -*- coding: utf-8 -*-
"""Génère data/seed.json depuis la base éditoriale Excel MNH + le document général."""
import json, re, unicodedata, openpyxl, os

XLSX = os.path.join(os.path.dirname(__file__), "..", "docs", "Base_editoriale_MNH_8_groupes_professions.xlsx")
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "seed.json")

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s

# ---- Thématiques canoniques ----
THEMES = [
    {"slug": "sante-mentale-rps", "name": "Santé mentale & RPS", "ordre": 1,
     "description": "Risques psychosociaux : intensité du travail, autonomie, soutien, reconnaissance et leurs effets sur la santé mentale."},
    {"slug": "tms-sante-physique", "name": "TMS & santé physique", "ordre": 2,
     "description": "Troubles musculosquelettiques et contraintes physiques : manutention, gestes répétitifs, postures."},
    {"slug": "violences-securite", "name": "Violences & sécurité", "ordre": 3,
     "description": "Violences verbales, physiques et organisationnelles au travail, signalement et réponse institutionnelle."},
    {"slug": "sommeil-recuperation", "name": "Sommeil & récupération", "ordre": 4,
     "description": "Horaires atypiques, travail de nuit, gardes, fatigue et capacité à récupérer et à prendre soin de soi."},
    {"slug": "addictions", "name": "Addictions & accès aux soins", "ordre": 5,
     "description": "Conduites addictives, accès facilité aux substances, tabou et difficultés à demander de l'aide."},
    {"slug": "grossesse-sante-reproductive", "name": "Grossesse & santé reproductive", "ordre": 6,
     "description": "Grossesse, santé reproductive et santé des femmes professionnelles de santé."},
    {"slug": "cancer-expositions", "name": "Cancer & expositions", "ordre": 7,
     "description": "Incidence des cancers, pratiques de dépistage et expositions professionnelles associées."},
    {"slug": "vieillissement-maintien-emploi", "name": "Vieillissement & maintien en emploi", "ordre": 8,
     "description": "Effets cumulatifs des expositions au fil de la carrière, capacité de travail et maintien en emploi."},
    {"slug": "presenteisme-organisation", "name": "Présentéisme & organisation", "ordre": 9,
     "description": "Absentéisme, présentéisme, coûts organisationnels et leviers d'organisation du travail."},
    {"slug": "exposome", "name": "Expositions professionnelles & exposome", "ordre": 10,
     "description": "Cumul des expositions physiques, chimiques, biologiques, organisationnelles et psychosociales."},
]

def map_theme(label):
    l = label.strip()
    rules = [
        ("TMS", "tms-sante-physique"),
        ("Santé mentale", "sante-mentale-rps"),
        ("Violence", "violences-securite"),
        ("Sommeil", "sommeil-recuperation"),
        ("Addictions", "addictions"),
        ("Grossesse", "grossesse-sante-reproductive"),
        ("Cancer", "cancer-expositions"),
        ("Vieillissement", "vieillissement-maintien-emploi"),
        ("Présentéisme", "presenteisme-organisation"),
        ("Organisation", "presenteisme-organisation"),
        ("Expositions", "exposome"),
        ("Santé globale", "exposome"),
    ]
    for prefix, slug in rules:
        if l.startswith(prefix):
            return slug
    raise ValueError("Thématique non mappée : " + l)

# ---- Professions ----
PROFESSIONS = [
    {"sheet": "Aides-soignants - contenus", "slug": "aides-soignants", "name": "Aides-soignants", "ordre": 1,
     "short_desc": "Fortement exposés aux contraintes physiques, à la charge de travail et aux violences, au contact direct des patients."},
    {"sheet": "Infirmiers - contenus", "slug": "infirmiers", "name": "Infirmiers", "ordre": 2,
     "short_desc": "Parmi les professions les plus exposées au job strain ; manutention, violences et horaires pèsent sur la santé."},
    {"sheet": "Médecins - contenus", "slug": "medecins", "name": "Médecins", "ordre": 3,
     "short_desc": "Charge, gardes et astreintes, charge administrative et difficulté à demander de l'aide marquent la profession."},
    {"sheet": "ASH & employés - contenus", "slug": "ash-employes", "name": "ASH & personnels employés", "ordre": 4,
     "short_desc": "Une population très exposée qui cumule contraintes physiques, psychosociales et sociales, encore peu documentée."},
    {"sheet": "Sages-femmes - contenus", "slug": "sages-femmes", "name": "Sages-femmes", "ordre": 5,
     "short_desc": "Profil de job strain et d'iso-strain particulièrement défavorable ; enjeux forts de santé reproductive."},
    {"sheet": "Rééducation - contenus", "slug": "reeducation", "name": "Métiers de la rééducation", "ordre": 6,
     "short_desc": "Kinésithérapeutes, ergothérapeutes… : des enjeux plausibles mais des données métier encore rares."},
    {"sheet": "Médico-techniques - contenus", "slug": "medico-techniques", "name": "Professions médico-techniques", "ordre": 7,
     "short_desc": "Manipulateurs radio, techniciens de laboratoire… : des expositions spécifiques très dépendantes du poste."},
    {"sheet": "Pharmaciens - contenus", "slug": "pharmaciens", "name": "Pharmaciens", "ordre": 8,
     "short_desc": "L'accès facilité aux médicaments est une spécificité ; la santé mentale reste peu documentée spécifiquement."},
]

# ---- Études / références [1]..[14] (index du document général) ----
STUDIES = [
    {"ref_num": 1, "slug": "soignances", "name": "SOIGNANCES",
     "full_title": "La cohorte des SOIGNants dans constANCES",
     "team": "Descatha A., Singier A., Zins M., Temime L. et consortium SOIGNANCES — CHU Angers / Inserm / CNAM",
     "type": "cohorte", "date_label": "en cours",
     "resume": "Projet fondé sur la cohorte épidémiologique CONSTANCES visant à étudier la santé des professionnels de santé et ses liens avec leur exposome professionnel : pénibilité physique, horaires, facteurs psychosociaux, habitudes de vie, santé mentale, addictions, cancers et santé reproductive."},
    {"ref_num": 2, "slug": "sansas", "name": "SANSAS",
     "full_title": "Étude qualitative sur la santé des soignants — attitudes et pratiques des soignants vis-à-vis de leur santé",
     "team": "EHESP", "type": "étude qualitative", "date_label": "en cours",
     "resume": "Étude qualitative auprès de médecins, infirmiers et aides-soignants portant sur les habitudes de vie, les obstacles professionnels, la santé physique et mentale, la charge de travail, le présentéisme, les violences et les conditions d'adhésion aux programmes de promotion de la santé."},
    {"ref_num": 3, "slug": "sops", "name": "SOPS",
     "full_title": "Santé Orale des Professionnels de Santé — les soignants hospitaliers face à la santé bucco-dentaire",
     "team": "Tenenbaum A., Bas A.-C., Manganelli M. et al. — Université Paris Cité / GH Pitié-Salpêtrière",
     "type": "étude qualitative", "date_label": "en cours",
     "resume": "Étude qualitative sur les trajectoires de soins bucco-dentaires, le recours à la prévention, les arbitrages de santé et les contraintes d'accès aux soins chez les aides-soignantes et infirmières."},
    {"ref_num": 4, "slug": "trailss", "name": "TRAILSS",
     "full_title": "Trajectoires des infirmières entre le libéral et le salariat, santé mentale et addiction — le fardeau des facteurs de risques psychosociaux",
     "team": "Augé E., Mousquès J. — IRDES / EHESP", "type": "projet de recherche", "date_label": "en cours",
     "resume": "Travail consacré aux effets des risques psychosociaux sur la santé des professionnels hospitaliers et au rôle protecteur potentiel de l'autonomie, du soutien social et de la reconnaissance."},
    {"ref_num": 5, "slug": "tms-evrest", "name": "Projet TMS (EVREST)",
     "full_title": "Troubles musculosquelettiques chez les soignants — travaux à partir de l'observatoire EVREST, données 2020–2024",
     "team": "CHU de Rouen / Université de Lille", "type": "étude observationnelle", "date_label": "2020–2024",
     "resume": "Étude de la prévalence et des déterminants des TMS chez les professionnels de santé, portant sur plus de 26 000 salariés dont environ 1 800 soignants : douleurs dorso-lombaires, atteintes des membres supérieurs, contraintes biomécaniques et psychosociales et leur évolution selon l'âge et le métier."},
    {"ref_num": 6, "slug": "wocapreg", "name": "WOCAPREG",
     "full_title": "WOmen CAregivers and PREGnancy — impact des professions et des conditions de travail sur la santé des femmes enceintes professionnelles de santé",
     "team": "CHU de Toulouse / Inserm UMR 1295", "type": "étude observationnelle", "date_label": "en cours",
     "resume": "Étude portant sur la consommation médicamenteuse, la santé maternelle, les complications et les issues de grossesse selon les groupes professionnels et leurs conditions de travail."},
    {"ref_num": 7, "slug": "capessa", "name": "CAPESSA",
     "full_title": "Incidence et mortalité par cancer chez le personnel du secteur de la santé, pratiques de dépistage",
     "team": "Viprey M., Havet A., Lamouroux C., Charbotel B. et al. — CRPPE Lyon / UMRESTTE / Hospices Civils de Lyon",
     "type": "étude observationnelle", "date_label": "en cours",
     "resume": "Étude consacrée à l'incidence et à la mortalité par cancer ainsi qu'aux pratiques de dépistage chez les personnels du secteur de la santé, avec des analyses par groupes professionnels."},
    {"ref_num": 8, "slug": "soignants-oublies", "name": "« Soignants oubliés »",
     "full_title": "Les personnels employés du soin du secteur sanitaire et médico-social — revue de la littérature 2000–2025 des déterminants de santé",
     "team": "Sanchez M.-A., Lelouvier M., Jaouen A., Sanchez S., Botton C., Vercambre-Jacquot M.-N., de Normandie P., Boscardin H. — Coalition Fondations & Santé",
     "type": "revue de littérature", "date_label": "2025",
     "resume": "Revue systématique consacrée notamment aux aides-soignants, ASH et autres personnels employés du sanitaire et médico-social : TMS, risques psychosociaux, violence, conditions de travail et autres déterminants de santé."},
    {"ref_num": 9, "slug": "vieillissement", "name": "Vieillissement en santé",
     "full_title": "Le vieillissement en santé des professionnels de santé — scoping review",
     "team": "Gérontopôle Centre-Val de Loire", "type": "scoping review", "date_label": "juillet 2026",
     "resume": "Scoping review de 156 études publiées entre 2016 et 2026 portant sur les professionnels de santé de 45 ans et plus : santé globale, inégalités, trajectoires professionnelles, conditions d'exercice, maintien en emploi et facteurs de risque et de protection associés au vieillissement professionnel."},
    {"ref_num": 10, "slug": "valoris", "name": "VALORIS",
     "full_title": "Coût de la mauvaise santé des professionnels de santé",
     "team": "Chen E., Sirven N. — EHESP", "type": "étude médico-économique", "date_label": "en cours",
     "resume": "Travail médico-économique visant à mesurer le coût complet de l'absentéisme et du présentéisme en intégrant les conséquences sur l'activité, l'organisation des équipes et la qualité des soins. Enquête auprès d'environ 1 400 cadres et décideurs hospitaliers et données PMSI."},
    {"ref_num": 11, "slug": "sante-femmes", "name": "Santé des femmes professionnelles de santé",
     "full_title": "Santé des femmes professionnelles de santé : panorama exploratoire de la littérature",
     "team": "Veyrier C.-A., Pere-ere Ajuwa M.-E., Cousin Cabrolier L., Duracinsky M. — URC-ECO AP-HP / PROQOL, Université Paris Cité, Inserm",
     "type": "revue exploratoire", "date_label": "octobre 2022",
     "resume": "Revue exploratoire consacrée aux différences de sexe et de genre dans la santé des professionnelles de santé : risques physiques, psychosociaux, biologiques et chimiques, santé mentale, santé physique, santé sexuelle et reproductive et qualité de vie."},
    {"ref_num": 12, "slug": "colloque-mnh", "name": "3e colloque Fondation MNH",
     "full_title": "Synthèse du 3e colloque « Recherches et innovations sur la santé des professionnels de santé »",
     "team": "Fondation MNH", "type": "synthèse", "date_label": "8 avril 2026",
     "resume": "Document transversal synthétisant les avancées des principaux projets de recherche, les enjeux d'investissement dans la santé des professionnels et plusieurs initiatives de terrain."},
    {"ref_num": 13, "slug": "diu-soigner-les-soignants", "name": "DIU Soigner les Soignants",
     "full_title": "Synthèse « littérature grise » des mémoires du DIU Soigner les Soignants",
     "team": "Jullian B. et groupe d'experts", "type": "littérature grise", "date_label": "2026",
     "resume": "Analyse de 104 mémoires du DIU portant sur la santé des soignants : santé mentale et addictions, actions de prévention, dispositifs d'accompagnement, conditions de travail et reconnaissance professionnelle."},
    {"ref_num": 14, "slug": "addictions-ps", "name": "Addictions chez les professionnels de santé",
     "full_title": "Revue de littérature sur les addictions des professionnels de santé",
     "team": "Felix H., Amirouche A., Marbois C., Serreau R. — UR PSYCOMADD, AP-HP / Université Paris-Saclay",
     "type": "revue de littérature", "date_label": "2026",
     "resume": "Revue de la littérature consacrée aux conduites addictives chez les médecins et les autres professionnels de santé, à leurs liens avec l'épuisement professionnel, le stress et les conditions de travail, ainsi qu'aux difficultés de dépistage, d'accès aux soins et de maintien dans l'emploi."},
]

# ---- Lecture de l'Excel ----
wb = openpyxl.load_workbook(XLSX, data_only=True)
contents = []
for prof in PROFESSIONS:
    ws = wb[prof["sheet"]]
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[1]:
            continue
        ordre, label, titre, message_cle, dev_court, corps_web, nuance, decideur, refs, priorite = row[:10]
        ref_nums = [int(n) for n in re.findall(r"\[(\d+)\]", str(refs or ""))]
        contents.append({
            "profession": prof["slug"],
            "theme": map_theme(str(label)),
            "display_theme_label": str(label).strip(),
            "ordre": int(ordre),
            "titre": (titre or "").strip(),
            "message_cle": (message_cle or "").strip(),
            "dev_court": (dev_court or "").strip(),
            "corps_web": (corps_web or "").strip(),
            "nuance": (nuance or "").strip(),
            "decideur": (decideur or "").strip(),
            "priorite": (priorite or "").strip(),
            "refs": ref_nums,
        })

# ---- Pages transversales (contenu du document général) ----
PAGES = [
    {"slug": "accueil", "title": "De la recherche aux réalités de chaque métier",
     "body": "Comprendre ce que la recherche nous apprend aujourd'hui sur la santé des professionnels de santé.\n\nFace aux enjeux croissants liés à la santé des soignants, la Fondation MNH a soutenu de nombreux travaux de recherche visant à mieux comprendre leurs expositions, leurs difficultés et leurs besoins. Mais produire de la connaissance ne suffit pas : encore faut-il qu'elle puisse être comprise, partagée et utilisée par le plus grand nombre.\n\nCette plateforme restitue de manière claire les principaux enseignements de ces travaux, sans prétendre à l'exhaustivité, à partir des études et rapports soutenus avant août 2026."},
    {"slug": "comprendre-intro", "title": "Prendre soin des soignants : un enjeu de santé publique et de fonctionnement du système de soins",
     "body": "Les professionnels de santé sont exposés, tout au long de leur carrière, à des contraintes qui peuvent affecter durablement leur santé : charge physique, horaires atypiques, intensité du travail, exigences émotionnelles, violences, manque d'autonomie, de soutien ou de reconnaissance [1,4,8,9].\n\nCes expositions peuvent se cumuler et produire des effets sur la santé physique, la santé mentale, la qualité de vie et la capacité à poursuivre son activité dans de bonnes conditions [1,9].\n\nLa santé des soignants ne constitue donc pas uniquement un enjeu individuel. Elle concerne aussi directement les équipes, les établissements de santé et, plus largement, la continuité et la qualité des soins [9,10,11]."},
    {"slug": "enjeu-humain", "title": "Un enjeu humain",
     "body": "Les travaux disponibles décrivent des problématiques multiples : troubles musculosquelettiques, fatigue, risques psychosociaux, anxiété, dépression, épuisement professionnel, troubles du sommeil, conduites addictives, exposition aux violences ou encore difficultés à préserver sa propre santé [2,4,5,8,9,13,14].\n\nCertaines dimensions touchent aussi des moments spécifiques du parcours de vie, comme la grossesse, la santé reproductive, les cancers ou le vieillissement professionnel [6,7,9,11]."},
    {"slug": "enjeu-organisationnel", "title": "Un enjeu organisationnel",
     "body": "Une dégradation de la santé peut conduire à des arrêts de travail, mais aussi au présentéisme, c'est-à-dire au fait de continuer à travailler malgré un état de santé dégradé [10,12].\n\nDans les organisations de soins, ces situations peuvent entraîner des remplacements difficiles, des modifications de planning, une désorganisation des équipes et une charge supplémentaire pour les professionnels présents [10].\n\nLe projet VALORIS montre que le coût de la mauvaise santé des professionnels ne se limite pas au salaire correspondant à une journée d'absence : les effets indirects sur l'activité, l'organisation et la qualité des soins peuvent être importants [10]."},
    {"slug": "enjeu-systeme", "title": "Un enjeu pour le système de soins",
     "body": "La question de la santé des soignants est également liée à des enjeux plus larges de maintien en emploi, d'attractivité des métiers et de pérennité des équipes [8,9].\n\nLes travaux sur le vieillissement professionnel montrent notamment que les expositions accumulées au cours de la carrière peuvent influencer les trajectoires de santé, les capacités de travail et les sorties prématurées du métier [9]."},
    {"slug": "expositions-multiples", "title": "Une santé façonnée par des expositions multiples",
     "body": "La santé des professionnels ne dépend pas d'un seul facteur. Elle résulte d'un ensemble d'expositions physiques, psychosociales, organisationnelles et liées aux modes de vie, qui peuvent se cumuler au cours de la carrière [1,9]. Le projet SOIGNANCES mobilise pour cela la notion d'exposome professionnel, c'est-à-dire l'ensemble des expositions auxquelles un professionnel est soumis dans son activité et son environnement de travail [1].\n\n**Des contraintes physiques importantes.** Manutention, gestes répétitifs, postures contraignantes, travail debout ou efforts intenses peuvent favoriser les troubles musculosquelettiques, les douleurs et l'usure physique [1,5,8].\n\n**L'organisation du travail comme déterminant de santé.** Charge de travail, horaires décalés, travail de nuit, faible autonomie, manque de soutien ou de reconnaissance ressortent régulièrement comme des déterminants importants de la santé des soignants [2,4,9].\n\n**Des risques psychosociaux étroitement liés au travail.** L'intensité du travail, les exigences émotionnelles, les violences ou le déséquilibre entre les efforts fournis et les ressources disponibles peuvent affecter la santé mentale [4,8,9].\n\n**Les conduites addictives peuvent aussi être liées aux conditions de travail.** Les addictions peuvent être favorisées par le stress, l'épuisement professionnel, les troubles du sommeil ou certaines conditions de travail. L'accès facilité à certains médicaments constitue également un risque spécifique dans certaines professions [14].\n\n**Prendre soin de soi peut devenir plus difficile.** Être professionnel de santé ne garantit pas un meilleur recours aux soins. Les contraintes de temps, la fatigue, les horaires ou l'organisation du travail peuvent compliquer l'accès aux consultations [2,3]. La peur du jugement et le caractère tabou de certaines situations peuvent retarder la demande d'aide [14].\n\n**Des effets qui s'inscrivent dans le parcours de vie.** Certaines problématiques apparaissent ou se renforcent à des étapes particulières : grossesse, santé reproductive, cancer, vieillissement, maintien en emploi [6,7,9,11]. Les recherches sur le vieillissement soulignent une logique cumulative : les conditions d'exercice du début et du milieu de carrière peuvent influencer la santé et la capacité de travail plusieurs années plus tard [9]."},
    {"slug": "prudence", "title": "Des résultats à interpréter avec prudence",
     "body": "L'ensemble de ces travaux apporte des enseignements importants, mais plusieurs limites doivent être gardées en tête :\n\n- certaines études portent sur une profession précise, d'autres sur des groupes de professions ;\n- certains résultats sont quantitatifs, d'autres qualitatifs ;\n- plusieurs travaux sont encore intermédiaires ou exploratoires ;\n- les données disponibles ne permettent pas toujours d'isoler précisément l'effet propre d'un métier ;\n- les résultats ne sont donc pas systématiquement généralisables à tous les professionnels ni à tous les contextes d'exercice [1,3,8,9] ;\n- certains travaux reposent sur de la littérature grise ou sur des études locales et présentent des méthodologies hétérogènes [13].\n\nCes limites ne réduisent pas l'intérêt des travaux. Elles permettent au contraire de mieux comprendre où les connaissances sont solides et où des besoins de recherche persistent."},
]

CHAIN = [
    {"title": "Expositions professionnelles", "detail": "Charge physique · Horaires · Organisation · Risques psychosociaux · Violences"},
    {"title": "Santé du professionnel", "detail": "Santé physique · Santé mentale · Qualité de vie"},
    {"title": "Capacité à travailler", "detail": "Fatigue · Présentéisme · Arrêts · Maintien en emploi"},
    {"title": "Fonctionnement de l'équipe", "detail": "Réorganisation · Remplacements · Report de charge"},
    {"title": "Qualité et continuité des soins", "detail": ""},
]

seed = {
    "professions": [{k: v for k, v in p.items() if k != "sheet"} for p in PROFESSIONS],
    "themes": THEMES,
    "studies": STUDIES,
    "contents": contents,
    "pages": PAGES,
    "chain": CHAIN,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(seed, f, ensure_ascii=False, indent=1)
print("contents:", len(contents), "| professions:", len(seed["professions"]), "| studies:", len(STUDIES))
empty = [c for c in contents if not c["corps_web"]]
print("contenus sans corps web:", len(empty))
