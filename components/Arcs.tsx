/**
 * Motif décoratif repris des arcs du logo Fondation MNH.
 * `dark` : sur fond marine · `light` : sur fond pastel.
 */
export default function Arcs({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ring = tone === "dark" ? "rgba(255,255,255,.13)" : "rgba(8,50,100,.09)";
  const jaune = "#fec700";
  const turquoise = "#79c7c7";
  const arc = (r: number, start: number, sweep: number, color: string, width: number) => {
    const c = 2 * Math.PI * r;
    return (
      <circle
        cx={300} cy={300} r={r} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={`${(sweep / 360) * c} ${c}`} transform={`rotate(${start} 300 300)`}
      />
    );
  };
  return (
    <svg className="arcs" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <circle cx={300} cy={300} r={285} fill="none" stroke={ring} strokeWidth={1.5} />
      <circle cx={300} cy={300} r={215} fill="none" stroke={ring} strokeWidth={1.5} />
      <circle cx={300} cy={300} r={145} fill="none" stroke={ring} strokeWidth={1.5} />
      {arc(285, 118, 34, turquoise, 12)}
      {arc(215, 150, 78, jaune, 16)}
      {arc(145, 92, 62, turquoise, 16)}
      {arc(145, 268, 46, jaune, 12)}
      {arc(75, 180, 110, turquoise, 12)}
    </svg>
  );
}
