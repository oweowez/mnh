import Link from "next/link";
import Icon from "@/components/Icon";
import PageHead from "@/components/PageHead";
import { listThemes, publishedCounts } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explorer par thématique" };

export default async function ThemesPage() {
  const [themes, counts] = await Promise.all([listThemes(), publishedCounts()]);
  return (
    <>
      <PageHead
        crumbs={[{ label: "Thématiques" }]}
        title="Explorer par thématique"
        lead="Une lecture croisée des travaux : pour chaque sujet, ce que la recherche apprend d'une profession à l'autre."
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {themes.map((t) => {
              const n = counts.byTheme[t.id] ?? 0;
              return (
                <Link key={t.id} href={`/thematiques/${t.slug}`} className="card">
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  <span className="card-foot">
                    <span>{n > 0 ? `${n} profession${n > 1 ? "s" : ""} documentée${n > 1 ? "s" : ""}` : "À venir"}</span>
                    <span className="go"><Icon name="arrow" /></span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
