"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";

const LINKS = [
  { href: "/professions", label: "Professions" },
  { href: "/thematiques", label: "Thématiques" },
  { href: "/comprendre", label: "Comprendre les enjeux" },
  { href: "/recherches", label: "Recherches & projets" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Le menu mobile se referme à chaque changement de page.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <Icon name={open ? "close" : "menu"} />
      </button>
      <nav id="site-nav" className={`site-nav${open ? " is-open" : ""}`} aria-label="Navigation principale">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
        <form className="nav-search" action="/recherche" method="get" role="search">
          <Icon name="search" />
          <input type="search" name="q" placeholder="Rechercher" aria-label="Rechercher dans la base de connaissances" />
        </form>
      </nav>
    </>
  );
}
