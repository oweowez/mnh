import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import { getPageById } from "@/lib/repo";
import { savePage } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const page = getPageById(Number(id));
  if (!page) notFound();
  return (
    <>
      <AdminHead title={page.title || page.slug} back={{ href: "/admin/pages", label: "Pages générales" }} sub={`Identifiant : ${page.slug}`} />
      {saved && <p className="badge badge-ok" style={{ marginBottom: 16 }}>Enregistré</p>}
      <form action={savePage} className="form form-card">
        <input type="hidden" name="id" value={page.id} />
        <div><label>Titre</label><input type="text" name="title" defaultValue={page.title} /></div>
        <div><label>Contenu</label><textarea name="body" defaultValue={page.body} style={{ minHeight: 320 }} /></div>
        <div><button type="submit" className="btn btn-primary">Enregistrer</button></div>
      </form>
    </>
  );
}
