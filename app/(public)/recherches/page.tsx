import Link from "next/link";
import PageHead from "@/components/PageHead";
import { listStudies } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recherches & projets" };

export default async function RecherchesPage() {
  const studies = await listStudies();
  return (
    <>
      <PageHead
        crumbs={[{ label: "Recherches & projets" }]}
        title="Recherches et projets soutenus"
        lead="La bibliothèque des travaux soutenus ou valorisés par la Fondation MNH. Ces projets n'ont pas tous le même objectif ni le même niveau de maturité, mais ils permettent progressivement de construire une vision plus large de la santé des professionnels."
      >
        <div className="page-meta">
          <span className="tag tag--white">{studies.length} travaux référencés</span>
        </div>
      </PageHead>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            {studies.map((s) => (
              <Link key={s.id} href={`/recherches/${s.slug}`} className="card study-card">
                {s.ref_num !== null && <span className="study-num" aria-label={`Référence ${s.ref_num}`}>{s.ref_num}</span>}
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.full_title}</p>
                  <div className="study-meta">
                    {s.type && <span className="tag tag--theme">{s.type}</span>}
                    {s.date_label && <span className="tag">{s.date_label}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
