"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ role, pending }: { role: string; pending: number }) {
  const pathname = usePathname();
  const item = (href: string, label: React.ReactNode, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} className={active ? "active" : ""}>
        {label}
      </Link>
    );
  };
  return (
    <nav>
      <span className="side-label">Pilotage</span>
      {item("/admin", "Tableau de bord", true)}
      {item("/admin/publications", <>Publications &amp; IA</>)}
      <span className="side-label">Éditorial</span>
      {item("/admin/contenus", "Contenus")}
      {item("/admin/professions", "Professions")}
      {item("/admin/thematiques", "Thématiques")}
      {item("/admin/etudes", "Études & projets")}
      {item("/admin/pages", "Pages générales")}
      {role === "superadmin" && (
        <>
          <span className="side-label">Administration</span>
          {item(
            "/admin/utilisateurs",
            <>
              Utilisateurs
              {pending > 0 && <span className="badge badge-attente" style={{ marginLeft: 8 }}>{pending}</span>}
            </>
          )}
        </>
      )}
    </nav>
  );
}
