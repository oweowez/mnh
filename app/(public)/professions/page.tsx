import PageHead from "@/components/PageHead";
import ProfessionCard from "@/components/ProfessionCard";
import { listProfessions, publishedCounts } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explorer par profession" };

export default async function ProfessionsPage() {
  const [professions, counts] = await Promise.all([listProfessions(), publishedCounts()]);
  return (
    <>
      <PageHead
        crumbs={[{ label: "Professions" }]}
        title="Explorer par profession"
        lead="Que nous apprend aujourd'hui la recherche sur la santé de chaque profession ? Chaque fiche restitue les principaux résultats disponibles, les chiffres les plus utiles, les facteurs professionnels associés et les points encore insuffisamment documentés."
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {professions.map((p) => (
              <ProfessionCard key={p.id} profession={p} count={counts.byProfession[p.id]} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
