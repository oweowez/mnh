import AdminHead from "@/components/AdminHead";
import StudyForm from "@/components/StudyForm";

export const dynamic = "force-dynamic";

export default function NewStudy() {
  return (
    <>
      <AdminHead title="Nouvelle étude / projet" back={{ href: "/admin/etudes", label: "Études & projets" }} />
      <StudyForm />
    </>
  );
}
