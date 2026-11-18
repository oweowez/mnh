/** Icônes au trait (24×24), héritent de la couleur du texte. */
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  back: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  external: <><path d="M14 5h5v5" /><path d="M19 5 10 14" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  scale: <><path d="M12 4v16" /><path d="M7 20h10" /><path d="M5 7h14" /><path d="m5 7-2.5 6a2.7 2.7 0 0 0 5 0L5 7Z" /><path d="m19 7-2.5 6a2.7 2.7 0 0 0 5 0L19 7Z" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
} satisfies Record<string, React.ReactNode>;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
