import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import Icon from "@/components/Icon";
import ThemeForm from "@/components/ThemeForm";
import { getThemeById, contentsForTheme } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EditTheme({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = await getThemeById(Number(id));
  if (!theme) notFound();
  const contents = await contentsForTheme(theme.id);
  return (
    <>
      <AdminHead
        title={theme.name}
        back={{ href: "/admin/thematiques", label: "Thématiques" }}
        sub={`${contents.length} contenu(s) publié(s) sur cette thématique.`}
      >
        <Link href={`/thematiques/${theme.slug}`} target="_blank" className="btn btn-ghost">Voir la page publique<Icon name="external" /></Link>
      </AdminHead>
      <ThemeForm theme={theme} />
      {contents.length > 0 && (
        <>
          <h2>Contenus sur cette thématique</h2>
          <table className="data">
            <tbody>
              {contents.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/contenus/${c.id}`}>{c.profession_name}</Link>
                    <div className="cell-muted">{c.titre}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
