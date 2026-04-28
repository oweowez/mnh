import Link from "next/link";
import Image from "next/image";
import ThemeCard from "@/components/ThemeCard";
import { aidesoignantThemes } from "@/lib/data/aide-soignant";

export const metadata = {
  title: "Aide-soignant — Santé au travail | MNH",
  description:
    "Profil santé complet de la profession aide-soignant : risques, épidémiologie, actions à mettre en place.",
};

const NAVY = "#22357a";
const TEAL = "#88aead";
const GOLD = "#ffc200";
const MIST = "#cbd3d3";

export default function AideSoignantPage() {
  const domaines = [...new Set(aidesoignantThemes.map((t) => t.domaine))];

  return (
    <div className="min-h-screen flex flex-col" style={{ color: NAVY, backgroundColor: "#fff" }}>

      {/* Header */}
      <header
        className="px-6 sm:px-10 h-14 flex items-center justify-between sticky top-0 z-10"
        style={{ borderBottom: `1px solid ${MIST}`, backgroundColor: "#fff" }}
      >
        <Link
          href="/"
          className="text-sm font-medium transition-opacity hover:opacity-100"
          style={{ color: NAVY, opacity: 0.45 }}
        >
          ← Toutes les professions
        </Link>
        <Image
          src="/assets/logo/logoFondationMnh.png"
          alt="Fondation MNH"
          width={140}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </header>

      {/* Hero */}
      <section
        className="px-6 sm:px-10 py-12 md:py-16"
        style={{ borderBottom: `1px solid ${MIST}` }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-5"
            style={{ color: TEAL }}
          >
            Profil professionnel
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-10">
            <div className="flex-1">
              <h1
                className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4"
                style={{ color: NAVY }}
              >
                Aide-soignant·e
              </h1>
              <p className="text-base leading-relaxed max-w-xl" style={{ color: NAVY, opacity: 0.55 }}>
                Retrouvez les principales problématiques de santé identifiées
                pour cette profession. Cliquez sur une thématique pour accéder
                aux données, facteurs de risque et leviers d'action.
              </p>
            </div>

            {/* Chiffres clés */}
            <div
              className="flex gap-10 shrink-0 pl-10"
              style={{ borderLeft: `1px solid ${MIST}` }}
            >
              <div>
                <p className="text-5xl font-black" style={{ color: GOLD }}>
                  {aidesoignantThemes.length}
                </p>
                <p className="text-xs mt-1 leading-tight max-w-[80px]" style={{ color: NAVY, opacity: 0.45 }}>
                  thématiques de santé
                </p>
              </div>
              <div>
                <p className="text-5xl font-black" style={{ color: GOLD }}>
                  {domaines.length}
                </p>
                <p className="text-xs mt-1 leading-tight max-w-[80px]" style={{ color: NAVY, opacity: 0.45 }}>
                  domaines couverts
                </p>
              </div>
            </div>
          </div>

          {/* Badges domaines */}
          <div className="flex flex-wrap gap-2 mt-8">
            {domaines.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold px-3 py-1 rounded"
                style={{ backgroundColor: MIST, color: NAVY }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des thématiques */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-10 py-4">
        {aidesoignantThemes.map((theme, i) => (
          <ThemeCard key={theme.id} theme={theme} index={i} />
        ))}

        <p
          className="text-xs py-10 text-center"
          style={{ color: NAVY, opacity: 0.3 }}
        >
          Données issues de projets MNH / Inserm / EHESP / IRDES / CNAM.
        </p>
      </main>

      {/* Footer */}
      <footer
        className="px-6 sm:px-10 py-5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${MIST}` }}
      >
        <Image
          src="/assets/logo/logoFondationMnh.png"
          alt="Fondation MNH"
          width={110}
          height={32}
          className="h-7 w-auto"
        />
        <p className="text-xs" style={{ color: NAVY, opacity: 0.35 }}>
          Mutuelle Nationale des Hospitaliers
        </p>
      </footer>
    </div>
  );
}
