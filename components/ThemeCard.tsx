"use client";

import { useState } from "react";
import type { Theme, DomainColor } from "@/lib/data/aide-soignant";

const colorMap: Record<
  DomainColor,
  { bg: string; border: string; badge: string; icon: string; accent: string; text: string }
> = {
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    icon: "bg-amber-100",
    accent: "bg-amber-500",
    text: "text-amber-700",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    icon: "bg-purple-100",
    accent: "bg-purple-500",
    text: "text-purple-700",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-800",
    icon: "bg-teal-100",
    accent: "bg-teal-500",
    text: "text-teal-700",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    icon: "bg-rose-100",
    accent: "bg-rose-500",
    text: "text-rose-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    icon: "bg-red-100",
    accent: "bg-red-500",
    text: "text-red-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    icon: "bg-green-100",
    accent: "bg-green-500",
    text: "text-green-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    icon: "bg-blue-100",
    accent: "bg-blue-500",
    text: "text-blue-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-800",
    icon: "bg-indigo-100",
    accent: "bg-indigo-500",
    text: "text-indigo-700",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-800",
    icon: "bg-slate-100",
    accent: "bg-slate-500",
    text: "text-slate-700",
  },
};

interface DetailRowProps {
  label: string;
  value: string;
  icon: string;
}

function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <div className="flex gap-3">
      <span className="text-lg mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

export default function ThemeCard({ theme }: { theme: Theme }) {
  const [open, setOpen] = useState(false);
  const c = colorMap[theme.domaineColor];

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${c.border} ${open ? c.bg : "bg-white hover:bg-gray-50"}`}
    >
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start gap-4 focus:outline-none group"
      >
        <span
          className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${c.icon}`}
        >
          {theme.domaineIcon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}
            >
              {theme.domaine}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 leading-snug">
            {theme.titre}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {theme.description}
          </p>
        </div>

        <span
          className={`shrink-0 mt-1 transition-transform duration-300 text-gray-400 ${open ? "rotate-180" : ""}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Contenu expandé */}
      {open && (
        <div className="px-5 pb-6">
          {/* Séparateur coloré */}
          <div className={`h-0.5 ${c.accent} rounded-full mb-5 opacity-30`} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DetailRow
              label="Facteurs explicatifs"
              value={theme.facteursExplicatifs}
              icon="⚙️"
            />
            <DetailRow
              label="Indicateurs clés"
              value={theme.indicateurs}
              icon="📊"
            />
            <DetailRow
              label="Population concernée"
              value={theme.population}
              icon="👥"
            />
            <DetailRow
              label="Conséquences potentielles"
              value={theme.consequences}
              icon="⚠️"
            />
            <DetailRow
              label="Leviers d'action"
              value={theme.leviersAction}
              icon="✅"
            />
            <DetailRow
              label="Projet / Étude MNH"
              value={theme.projetMNH}
              icon="🔭"
            />
          </div>

          {/* Source */}
          <div
            className={`mt-5 px-4 py-3 rounded-xl ${c.bg} border ${c.border}`}
          >
            <p className="text-xs text-gray-500">
              <span className={`font-semibold ${c.text}`}>
                {theme.typeSource}
              </span>{" "}
              — {theme.reference}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
