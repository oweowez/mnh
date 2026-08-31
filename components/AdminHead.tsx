import Link from "next/link";

export default function AdminHead({
  title, sub, back, children,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode; // boutons d'action
}) {
  return (
    <div className="admin-head">
      <div>
        {back && (
          <div className="breadcrumb" style={{ marginBottom: 8 }}>
            <Link href={back.href}>← {back.label}</Link>
          </div>
        )}
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {children && <div className="head-actions">{children}</div>}
    </div>
  );
}
