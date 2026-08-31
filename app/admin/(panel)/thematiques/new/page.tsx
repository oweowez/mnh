import AdminHead from "@/components/AdminHead";
import ThemeForm from "@/components/ThemeForm";

export const dynamic = "force-dynamic";

export default function NewTheme() {
  return (
    <>
      <AdminHead title="Nouvelle thématique" back={{ href: "/admin/thematiques", label: "Thématiques" }} />
      <ThemeForm />
    </>
  );
}
