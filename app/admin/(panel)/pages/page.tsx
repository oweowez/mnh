import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import { listPages } from "@/lib/repo";

export const dynamic = "force-dynamic";

const WHERE: Record<string, string> = {
  accueil: "Accueil — bloc « La démarche »",
  "comprendre-intro": "Comprendre — introduction",
  "enjeu-humain": "Comprendre — carte « Enjeu humain »",
  "enjeu-organisationnel": "Comprendre — carte « Enjeu organisationnel »",
  "enjeu-systeme": "Comprendre — carte « Enjeu système de soins »",
  "expositions-multiples": "Comprendre — dimensions de l'exposome",
  prudence: "Comprendre — encart « Prudence »",
};

export default function AdminPages() {
  const pages = listPages();
  return (
    <>
      <AdminHead title="Pages générales" sub="Les contenus transversaux affichés sur l'accueil et la page « Comprendre les enjeux »." />
      <table className="data">
        <thead><tr><th>Titre</th><th>Emplacement</th><th style={{ width: 100 }}></th></tr></thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/pages/${p.id}`}>{p.title || p.slug}</Link>
                <div className="cell-muted">{p.body.slice(0, 100)}…</div>
              </td>
              <td className="cell-muted">{WHERE[p.slug] ?? p.slug}</td>
              <td><Link href={`/admin/pages/${p.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
