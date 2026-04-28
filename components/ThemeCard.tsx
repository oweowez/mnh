"use client";

import { useState } from "react";
import type { Theme } from "@/lib/data/aide-soignant";

const NAVY = "#22357a";
const TEAL = "#88aead";
const GOLD = "#ffc200";
const MIST = "#cbd3d3";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: TEAL }}
      >
        {label}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: NAVY, opacity: 0.75 }}>
        {value}
      </p>
    </div>
  );
}

export default function ThemeCard({ theme, index }: { theme: Theme; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${MIST}` }}>
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-6 flex items-start gap-5 focus:outline-none"
        style={{ color: NAVY, backgroundColor: "transparent" }}
      >
        {/* Numéro */}
        <span
          className="text-xs font-bold tabular-nums mt-0.5 w-5 shrink-0"
          style={{ color: NAVY, opacity: 0.28 }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ backgroundColor: MIST, color: NAVY }}
            >
              {theme.domaine}
            </span>
          </div>
          <h3 className="text-base font-bold leading-snug pr-4" style={{ color: NAVY }}>
            {theme.titre}
          </h3>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: NAVY, opacity: 0.5 }}>
            {theme.description}
          </p>
        </div>

        {/* Flèche toggle */}
        <span
          className={`shrink-0 mt-1 transition-transform duration-300 text-base font-bold ${open ? "rotate-180" : ""}`}
          style={{ color: TEAL }}
        >
          ↓
        </span>
      </button>

      {/* Contenu expandé */}
      {open && (
        <div className="pb-8 pl-10">
          {/* Trait doré */}
          <div
            className="h-0.5 w-8 mb-6 rounded-full"
            style={{ backgroundColor: GOLD }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
            <DetailRow label="Facteurs explicatifs" value={theme.facteursExplicatifs} />
            <DetailRow label="Indicateurs clés" value={theme.indicateurs} />
            <DetailRow label="Population concernée" value={theme.population} />
            <DetailRow label="Conséquences potentielles" value={theme.consequences} />
            <DetailRow label="Leviers d'action" value={theme.leviersAction} />
            <DetailRow label="Projet / Étude MNH" value={theme.projetMNH} />
          </div>

          {/* Source */}
          <div
            className="mt-6 pt-4"
            style={{ borderTop: `1px solid ${MIST}` }}
          >
            <p className="text-xs" style={{ color: NAVY, opacity: 0.38 }}>
              <span className="font-semibold">{theme.typeSource}</span> — {theme.reference}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
