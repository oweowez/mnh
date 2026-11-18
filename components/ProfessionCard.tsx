import Link from "next/link";
import type { Profession } from "@/lib/repo";
import Icon from "./Icon";

export default function ProfessionCard({ profession, count }: { profession: Profession; count?: number }) {
  return (
    <Link href={`/professions/${profession.slug}`} className="card">
      <h3>{profession.name}</h3>
      <p>{profession.short_desc}</p>
      <span className="card-foot">
        <span>{count ? `${count} thématique${count > 1 ? "s" : ""}` : "Voir la fiche"}</span>
        <span className="go"><Icon name="arrow" /></span>
      </span>
    </Link>
  );
}
