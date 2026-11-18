"use client";

import { useEffect, useState } from "react";

export interface FicheNavItem { id: string; label: string }

/**
 * Sommaire d'une page de fiches : suit la lecture au défilement,
 * déplie la fiche ciblée par l'ancre (#contenu-12) et permet de tout déplier / replier.
 */
export default function FicheNav({ title, items }: { title: string; items: FicheNavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement && !el.open) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-96px 0px -65% 0px" }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      observer.disconnect();
    };
  }, [items]);

  const toggleAll = () => {
    const next = !allOpen;
    document.querySelectorAll<HTMLDetailsElement>("details.fiche").forEach((d) => { d.open = next; });
    setAllOpen(next);
  };

  return (
    <nav className="toc" aria-label={title}>
      <p className="toc-title">{title}</p>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={active === it.id ? "active" : undefined}>{it.label}</a>
          </li>
        ))}
      </ol>
      <button type="button" className="toc-action" onClick={toggleAll}>
        {allOpen ? "Tout replier" : "Tout déplier"}
      </button>
    </nav>
  );
}
