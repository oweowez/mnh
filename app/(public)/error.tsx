"use client";

import Link from "next/link";

/** Affiché si le chargement des données échoue (base indisponible, par exemple). */
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container state">
      <div className="state-inner">
        <p className="state-code">Service momentanément indisponible</p>
        <h1>Impossible de charger cette page</h1>
        <p>La base de connaissances ne répond pas pour le moment. Réessayez dans quelques instants.</p>
        <div className="actions-row">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>Réessayer</button>
          <Link href="/" className="btn btn-ghost">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
