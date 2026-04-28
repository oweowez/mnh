import Link from "next/link";

const professions = [
  {
    slug: "aide-soignant",
    label: "Aide-soignant·e",
    icon: "🏥",
    description: "Soins, hygiène et confort des patients",
    available: true,
    themes: 9,
  },
  {
    slug: "infirmier",
    label: "Infirmier·ère",
    icon: "💉",
    description: "Soins infirmiers, coordination médicale",
    available: false,
    themes: null,
  },
  {
    slug: "medecin",
    label: "Médecin",
    icon: "🩻",
    description: "Diagnostic, traitement, suivi des patients",
    available: false,
    themes: null,
  },
  {
    slug: "pharmacien",
    label: "Pharmacien·ne",
    icon: "💊",
    description: "Dispensation et conseil pharmaceutique",
    available: false,
    themes: null,
  },
  {
    slug: "kinesitherapeute",
    label: "Kinésithérapeute",
    icon: "🦾",
    description: "Rééducation fonctionnelle et motrice",
    available: false,
    themes: null,
  },
  {
    slug: "sage-femme",
    label: "Sage-femme",
    icon: "👶",
    description: "Suivi de grossesse et accouchement",
    available: false,
    themes: null,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-black text-blue-600 text-lg tracking-tight">
            MNH
          </span>
          <span className="text-xs text-gray-400">
            Santé des professionnels de santé
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          Outil de santé au travail
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Votre santé au travail,{" "}
          <span className="text-blue-600">par profession</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Sélectionnez votre métier pour accéder aux risques de santé
          identifiés, aux données épidémiologiques et aux actions concrètes
          adaptées à votre profession.
        </p>
      </section>

      {/* Grille des professions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 text-center">
          Choisissez votre profession
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professions.map((p) =>
            p.available ? (
              <Link
                key={p.slug}
                href={`/professions/${p.slug}`}
                className="group bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-400 p-6 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-xs bg-blue-600 text-white font-semibold px-2.5 py-0.5 rounded-full">
                    {p.themes} thématiques
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {p.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500 text-sm font-medium mt-auto pt-2">
                  Voir le profil santé
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="currentColor"
                    className="group-hover:translate-x-0.5 transition-transform"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 7a.75.75 0 01.75-.75h5.44L7.47 4.53a.75.75 0 011.06-1.06l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06-1.06l1.72-1.72H3.75A.75.75 0 013 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
            ) : (
              <div
                key={p.slug}
                className="bg-white/50 rounded-2xl border-2 border-gray-100 p-6 flex flex-col gap-3 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl grayscale">{p.icon}</span>
                  <span className="text-xs bg-gray-100 text-gray-400 font-semibold px-2.5 py-0.5 rounded-full">
                    Bientôt disponible
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 text-lg">{p.label}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{p.description}</p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-black text-blue-600">MNH</span>
          <p className="text-xs text-gray-400 text-center">
            Mutuelle Nationale des Hospitaliers — Données issues de projets
            Inserm, EHESP, IRDES et CNAM.
          </p>
        </div>
      </footer>
    </div>
  );
}
