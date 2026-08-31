import AdminHead from "@/components/AdminHead";
import ProfessionForm from "@/components/ProfessionForm";

export const dynamic = "force-dynamic";

export default function NewProfession() {
  return (
    <>
      <AdminHead title="Nouvelle profession" back={{ href: "/admin/professions", label: "Professions" }} />
      <ProfessionForm />
    </>
  );
}
