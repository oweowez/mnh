import Link from "next/link";
import type { Study } from "@/lib/repo";

export default function RefBadges({ studies, label = "Sources et études" }: { studies: Study[]; label?: string }) {
  if (studies.length === 0) return null;
  return (
    <div className="refs">
      <span className="label">{label}</span>
      {studies.map((s) => (
        <Link key={s.id} href={`/recherches/${s.slug}`} className="ref-badge" title={s.full_title}>
          {s.ref_num ? `[${s.ref_num}] ` : ""}{s.name}
        </Link>
      ))}
    </div>
  );
}
