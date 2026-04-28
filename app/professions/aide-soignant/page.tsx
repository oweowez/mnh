import Link from "next/link";
import ThemeCard from "@/components/ThemeCard";
import { aidesoignantThemes } from "@/lib/data/aide-soignant";

export const metadata = {
  title: "Aide-soignant — Santé au travail | MNH",
  description:
    "Profil santé complet de la profession aide-soignant : risques, épidémiologie, actions à mettre en place.",
};

const stats = [
  { label: "Thématiques de santé", value: "9" },
  { label: "Études & projets MNH", value: "9" },
  { label: "Domaines couverts", value: "7" },
];

export default function AideSoignantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z"
                clipRule="evenodd"
              />
            </svg>
            Choisir une autre profession
          </Link>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            MNH — Santé au travail
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🏥</span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
                  Profil professionnel
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                Aide-soignant·e
              </h1>
              <p className="text-base text-gray-500 max-w-2xl leading-relaxed">
                Découvrez les principales problématiques de santé qui touchent
                les aides-soignants : risques identifiés, données
                épidémiologiques, populations concernées et leviers d'action
                concrets. Cliquez sur une thématique pour en savoir plus.
              </p>
            </div>

            {/* Stats rapides */}
            <div className="flex gap-4 md:gap-6 shrink-0">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black text-blue-600">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight max-w-[70px]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Filtres domaines */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm text-gray-400 self-center mr-1">
            Domaines :
          </span>
          {[...new Set(aidesoignantThemes.map((t) => t.domaine))].map(
            (domaine) => {
              const theme = aidesoignantThemes.find(
                (t) => t.domaine === domaine
              )!;
              return (
                <span
                  key={domaine}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center gap-1.5"
                >
                  {theme.domaineIcon} {domaine}
                </span>
              );
            }
          )}
        </div>

        {/* Grille des thématiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {aidesoignantThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>

        {/* Note de bas de page */}
        <p className="mt-10 text-xs text-center text-gray-400">
          Données issues de projets et études MNH / Inserm / EHESP / IRDES.
          Pour toute question, contactez la MNH.
        </p>
      </main>
    </div>
  );
}
