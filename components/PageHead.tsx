import Link from "next/link";
import Arcs from "./Arcs";

export interface Crumb { href?: string; label: string }

/** En-tête commun des pages intérieures : fil d'Ariane, titre, chapô, zone libre (méta, recherche…). */
export default function PageHead({
  crumbs, title, lead, children,
}: {
  crumbs: Crumb[];
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <Arcs tone="light" />
      <div className="container">
        <nav aria-label="Fil d'Ariane">
          <ol className="breadcrumb">
            <li><Link href="/">Accueil</Link></li>
            {crumbs.map((c, i) => (
              <li key={i}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1>{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
