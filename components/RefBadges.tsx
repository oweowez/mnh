import Link from "next/link";
import type { Study } from "@/lib/repo";

export default function RefBadges({ studies, label = "Sources" }: { studies: Study[]; label?: string | null }) {
  if (studies.length === 0) return null;
  return (
    <div className="refs">
      {label && <span className="label">{label}</span>}
      {studies.map((s) => (
        <Link key={s.id} href={`/recherches/${s.slug}`} className="ref-badge" title={s.full_title}>
          {s.ref_num !== null && <span className="n">{s.ref_num}</span>}
          {s.name}
        </Link>
      ))}
    </div>
  );
}
