import Link from "next/link";
import { listProfessions } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explorer par profession — Fondation MNH" };

export default function ProfessionsPage() {
  const professions = listProfessions();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Accueil</Link> / Professions</div>
          <h1>Explorer par profession</h1>
          <p>
            Que nous apprend aujourd&apos;hui la recherche sur la santé de cette profession ?
            Chaque fiche restitue les principaux résultats disponibles, les chiffres les plus utiles,
            les facteurs professionnels associés et les points encore insuffisamment documentés.
          </p>
        </div>
      </div>
      <div className="container section">
        <div className="grid grid-3">
          {professions.map((p) => (
            <Link key={p.id} href={`/professions/${p.slug}`} className="card">
              <h3>{p.name}</h3>
              <p>{p.short_desc}</p>
              <span className="arrow">Voir la fiche →</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
