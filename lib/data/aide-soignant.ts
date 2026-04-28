export type DomainColor =
  | "amber"
  | "purple"
  | "teal"
  | "rose"
  | "red"
  | "green"
  | "blue"
  | "indigo"
  | "slate";

export interface Theme {
  id: string;
  domaine: string;
  domaineColor: DomainColor;
  domaineIcon: string;
  titre: string;
  description: string;
  facteursExplicatifs: string;
  indicateurs: string;
  population: string;
  consequences: string;
  leviersAction: string;
  projetMNH: string;
  typeSource: string;
  reference: string;
}

export const aidesoignantThemes: Theme[] = [
  {
    id: "tms",
    domaine: "Physique",
    domaineColor: "amber",
    domaineIcon: "🦴",
    titre: "Troubles musculo-squelettiques (TMS)",
    description:
      "Pathologies fréquentes liées aux contraintes physiques du métier (dos, épaules, membres supérieurs).",
    facteursExplicatifs:
      "Manutention de patients, gestes répétitifs, postures contraignantes, manque d'aides techniques.",
    indicateurs:
      "≈ 25 % souffrent de douleurs aux membres supérieurs ; ≈ 70 % subissent des contraintes physiques élevées ; risque multiplié par 3 à 6 en présence de contraintes fortes.",
    population: "Aides-soignants, ASH, aides à domicile",
    consequences:
      "Douleurs chroniques, arrêts de travail, inaptitude professionnelle",
    leviersAction:
      "Aides techniques (lève-personne), formation aux gestes et postures, réorganisation du travail",
    projetMNH: "EVREST TMS / CNAM prévention",
    typeSource: "Étude observationnelle + données institutionnelles",
    reference: "Étude EVREST 2020–2024 ; CNAM AT-MP",
  },
  {
    id: "sante-mentale",
    domaine: "Psychique",
    domaineColor: "purple",
    domaineIcon: "🧠",
    titre: "Santé mentale (stress, anxiété, dépression)",
    description:
      "Forte prévalence de troubles psychiques liés aux conditions de travail.",
    facteursExplicatifs:
      "Charge émotionnelle, surcharge de travail, manque de reconnaissance.",
    indicateurs:
      "Prévalence plus élevée de symptômes anxieux et dépressifs chez les hospitaliers par rapport à la population générale.",
    population: "Personnel hospitalier dont aides-soignants",
    consequences: "Burnout, désengagement professionnel, erreurs de soins",
    leviersAction:
      "Groupes de parole, soutien psychologique, management adapté et bienveillant",
    projetMNH: "TRAILSS / DREES",
    typeSource: "Études quantitatives et qualitatives",
    reference: "TRAILSS IRDES ; Enquête EpiCov DREES",
  },
  {
    id: "addictions",
    domaine: "Comportement",
    domaineColor: "teal",
    domaineIcon: "💊",
    titre: "Addictions et automédication",
    description:
      "Recours accru aux médicaments et substances comme réponse au stress professionnel.",
    facteursExplicatifs:
      "Accès facilité aux médicaments, culture professionnelle du « tenir malgré tout ».",
    indicateurs:
      "Surconsommation d'antalgiques et d'anxiolytiques observée au sein des professionnels de santé.",
    population: "Professionnels de santé exposés au stress chronique",
    consequences: "Dépendance, aggravation de la santé mentale",
    leviersAction:
      "Prévention des addictions, accompagnement psychologique individualisé",
    projetMNH: "Revue addictions MNH",
    typeSource: "Revue de littérature",
    reference: "Synthèse MNH addictions",
  },
  {
    id: "sante-femmes",
    domaine: "Genre",
    domaineColor: "rose",
    domaineIcon: "🤰",
    titre: "Santé des femmes et grossesse",
    description:
      "Risques spécifiques liés aux conditions de travail chez les femmes aides-soignantes.",
    facteursExplicatifs:
      "Horaires atypiques, pénibilité physique, expositions professionnelles.",
    indicateurs:
      "Augmentation du diabète gestationnel, de la prématurité et des IVG selon les métiers exercés.",
    population: "Aides-soignantes, femmes du secteur hospitalier",
    consequences: "Complications de grossesse, impact sur la santé reproductive",
    leviersAction:
      "Aménagement du poste de travail, suivi médical renforcé pendant la grossesse",
    projetMNH: "WOCAPREG",
    typeSource: "Étude populationnelle (EDP-SNDS)",
    reference: "Projet WOCAPREG Inserm",
  },
  {
    id: "cancers",
    domaine: "Physique long terme",
    domaineColor: "red",
    domaineIcon: "🔬",
    titre: "Cancers et expositions professionnelles",
    description:
      "Risque lié aux expositions professionnelles (rayonnements, travail de nuit).",
    facteursExplicatifs:
      "Exposition chimique, radiologique, rythmes de travail décalés.",
    indicateurs:
      "Augmentation de certains cancers (sein, prostate, etc.) chez les professionnels exposés.",
    population: "Professionnels de santé selon spécialités",
    consequences: "Maladies chroniques graves, impact sur l'espérance de vie",
    leviersAction:
      "Suivi médical régulier, prévention des expositions à risque",
    projetMNH: "CAPESSA",
    typeSource: "Étude épidémiologique",
    reference: "Projet CAPESSA Lyon",
  },
  {
    id: "recours-soins",
    domaine: "Prévention",
    domaineColor: "green",
    domaineIcon: "🩺",
    titre: "Recours aux soins insuffisant",
    description:
      "Tendance à négliger sa propre santé malgré un métier dans le domaine médical.",
    facteursExplicatifs:
      "Manque de temps, contraintes organisationnelles, culture professionnelle.",
    indicateurs:
      "Faible recours aux soins dentaires et aux consultations médicales parmi les aides-soignants.",
    population: "Aides-soignants et personnel hospitalier",
    consequences: "Retard au diagnostic, aggravation des pathologies",
    leviersAction:
      "Faciliter l'accès aux soins, dédier du temps à la santé personnelle",
    projetMNH: "SANSAS / étude dentaire",
    typeSource: "Étude qualitative + revue",
    reference: "SANSAS EHESP ; étude bucco-dentaire",
  },
  {
    id: "impact-organisationnel",
    domaine: "Organisation",
    domaineColor: "blue",
    domaineIcon: "🏥",
    titre: "Impact organisationnel",
    description:
      "La mauvaise santé des soignants impacte directement les établissements de soins.",
    facteursExplicatifs:
      "Absentéisme, présentéisme, désorganisation des équipes.",
    indicateurs:
      "Coût de l'absentéisme ≈ 2× le salaire d'un agent ; présentéisme fréquent (66 % des soignants).",
    population: "Établissements hospitaliers et équipes soignantes",
    consequences:
      "Perte de qualité des soins, surcharge pour les équipes en place",
    leviersAction:
      "Démarches QVT (Qualité de Vie au Travail), réorganisation du travail",
    projetMNH: "VALORIS",
    typeSource: "Étude économique",
    reference: "Projet VALORIS EHESP",
  },
  {
    id: "usure-professionnelle",
    domaine: "Carrière",
    domaineColor: "indigo",
    domaineIcon: "⏳",
    titre: "Usure professionnelle et départs",
    description:
      "Fatigue et conditions de travail entraînent des sorties précoces du métier.",
    facteursExplicatifs:
      "Pénibilité physique, stress chronique, manque de reconnaissance.",
    indicateurs:
      "Transitions vers le secteur libéral ou arrêt d'activité observées de façon croissante.",
    population: "Infirmiers et profils assimilés (transposable aux aides-soignants)",
    consequences: "Turnover élevé, pénurie de personnel soignant",
    leviersAction:
      "Amélioration des conditions de travail, valorisation des parcours professionnels",
    projetMNH: "TRAILSS / EHESP carrière",
    typeSource: "Étude longitudinale",
    reference: "TRAILSS + projet EHESP carrières",
  },
  {
    id: "exposome",
    domaine: "Risque global",
    domaineColor: "slate",
    domaineIcon: "🌐",
    titre: "Exposome professionnel",
    description:
      "Accumulation des expositions professionnelles tout au long de la carrière.",
    facteursExplicatifs:
      "Facteurs physiques, chimiques, psychosociaux et organisationnels combinés.",
    indicateurs:
      "Exposition multi-factorielle sur plusieurs années avec effets cumulatifs sur la santé.",
    population: "Tous les soignants, quelle que soit la spécialité",
    consequences: "Effets cumulés sur la santé globale et le bien-être",
    leviersAction:
      "Approche globale de prévention intégrant tous les facteurs d'exposition",
    projetMNH: "SOIGNANCES",
    typeSource: "Matrice emploi-exposition",
    reference: "Projet SOIGNANCES Inserm",
  },
];
