import Link from "next/link";
import Image from "next/image";

const NAVY = "#22357a";
const TEAL = "#88aead";
const GOLD = "#ffc200";
const MIST = "#cbd3d3";

const professions = [
  {
    slug: "aide-soignant",
    label: "Aide-soignant·e",
    description: "Soins, hygiène et confort des patients",
    available: true,
    themes: 9,
  },
  {
    slug: "infirmier",
    label: "Infirmier·ère",
    description: "Soins infirmiers, coordination médicale",
    available: false,
  },
  {
    slug: "medecin",
    label: "Médecin",
    description: "Diagnostic, traitement, suivi des patients",
    available: false,
  },
  {
    slug: "pharmacien",
    label: "Pharmacien·ne",
    description: "Dispensation et conseil pharmaceutique",
    available: false,
  },
  {
    slug: "kinesitherapeute",
    label: "Kinésithérapeute",
    description: "Rééducation fonctionnelle et motrice",
    available: false,
  },
  {
    slug: "sage-femme",
    label: "Sage-femme",
    description: "Suivi de grossesse et accouchement",
    available: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ color: NAVY, backgroundColor: "#fff" }}>

      {/* Header */}
      <header
        className="px-6 sm:px-10 h-14 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${MIST}` }}
      >
        <Image
          src="/assets/logo/logoFondationMnh.png"
          alt="Fondation MNH"
          width={140}
          height={40}
          className="h-8 w-auto"
          priority
        />
        <span className="text-xs font-semibold" style={{ color: TEAL }}>
          Santé des professionnels de santé
        </span>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto w-full px-6 sm:px-10 pt-20 pb-14">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: TEAL }}
        >
          Outil de santé au travail
        </p>
        <h1
          className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5"
          style={{ color: NAVY }}
        >
          Votre santé au travail,
          <br />
          par profession.
        </h1>
        <p className="text-base leading-relaxed max-w-xl" style={{ color: NAVY, opacity: 0.55 }}>
          Sélectionnez votre métier pour accéder aux risques identifiés,
          données épidémiologiques et actions adaptées à votre pratique
          professionnelle.
        </p>
      </section>

      {/* Grille professions */}
      <section className="max-w-4xl mx-auto w-full px-6 sm:px-10 pb-24 flex-1">
        <div className="mb-8" style={{ borderTop: `1px solid ${MIST}` }} />

        {/* Grille à joints */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ backgroundColor: MIST }}
        >
          {professions.map((p) =>
            p.available ? (
              <Link
                key={p.slug}
                href={`/professions/${p.slug}`}
                className="group flex flex-col gap-4 p-6 transition-colors hover:bg-[#eef3f3]"
                style={{ backgroundColor: "#fff", color: NAVY }}
              >
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    {p.themes} thématiques
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: NAVY }}>
                    {p.label}
                  </h3>
                  <p className="text-sm" style={{ color: NAVY, opacity: 0.5 }}>
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: TEAL }}>
                  Voir le profil santé
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </Link>
            ) : (
              <div
                key={p.slug}
                className="flex flex-col gap-4 p-6 cursor-not-allowed"
                style={{ backgroundColor: "#fff", opacity: 0.38 }}
              >
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded"
                    style={{ backgroundColor: MIST, color: NAVY }}
                  >
                    Bientôt disponible
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: NAVY }}>
                    {p.label}
                  </h3>
                  <p className="text-sm" style={{ color: NAVY, opacity: 0.5 }}>
                    {p.description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

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
          Mutuelle Nationale des Hospitaliers — Données Inserm, EHESP, IRDES, CNAM
        </p>
      </footer>
    </div>
  );
}
