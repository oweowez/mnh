import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import StudyForm from "@/components/StudyForm";
import { getStudyById, professionsForStudy, themesForStudy } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EditStudy({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const study = await getStudyById(Number(id));
  if (!study) notFound();
  const professions = await professionsForStudy(study.id);
  const themes = await themesForStudy(study.id);
  return (
    <>
      <AdminHead
        title={`${study.ref_num ? `[${study.ref_num}] ` : ""}${study.name}`}
        back={{ href: "/admin/etudes", label: "Études & projets" }}
        sub={
          <>
            {professions.length > 0 && <>Professions : {professions.map((p) => p.name).join(", ")}. </>}
            {themes.length > 0 && <>Thématiques : {themes.map((t) => t.name).join(", ")}.</>}
          </>
        }
      >
        <Link href={`/recherches/${study.slug}`} target="_blank" className="btn btn-ghost">Voir la page publique ↗</Link>
      </AdminHead>
      <StudyForm study={study} />
    </>
  );
}
