import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import ProfessionForm from "@/components/ProfessionForm";
import { getProfessionById, contentsForProfession } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EditProfession({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profession = await getProfessionById(Number(id));
  if (!profession) notFound();
  const contents = await contentsForProfession(profession.id, false);
  return (
    <>
      <AdminHead
        title={profession.name}
        back={{ href: "/admin/professions", label: "Professions" }}
        sub={`${contents.length} contenu(s) rattaché(s) à cette profession.`}
      >
        <Link href={`/professions/${profession.slug}`} target="_blank" className="btn btn-ghost">Voir la page publique ↗</Link>
      </AdminHead>
      <ProfessionForm profession={profession} />
      {contents.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, margin: "30px 0 12px" }}>Contenus de cette profession</h2>
          <table className="data">
            <tbody>
              {contents.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/contenus/${c.id}`}>{c.display_theme_label || c.theme_name}</Link>
                    <div className="cell-muted">{c.titre}</div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {c.statut === "publie" ? <span className="badge badge-ok">Publié</span> : <span className="badge badge-attente">Brouillon</span>}
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
