import Link from "next/link";
import { listStudies } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recherches & projets — Fondation MNH" };

export default async function RecherchesPage() {
  const studies = await listStudies();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Accueil</Link> / Recherches &amp; projets</div>
          <h1>Recherches et projets soutenus</h1>
          <p>
            La bibliothèque des travaux soutenus ou valorisés par la Fondation MNH.
            Ces projets n&apos;ont pas tous le même objectif ni le même niveau de maturité,
            mais ils permettent progressivement de construire une vision plus large de la santé des professionnels.
          </p>
        </div>
      </div>
      <div className="container section">
        <div className="grid grid-2">
          {studies.map((s) => (
            <Link key={s.id} href={`/recherches/${s.slug}`} className="card">
              <div className="study-meta">
                {s.ref_num && <span className="pill">[{s.ref_num}]</span>}
                <span className="pill theme-pill">{s.type}</span>
                {s.date_label && <span className="pill">{s.date_label}</span>}
              </div>
              <h3>{s.name}</h3>
              <p>{s.full_title}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
