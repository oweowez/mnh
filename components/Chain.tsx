const STEPS = [
  { title: "Expositions professionnelles", details: ["Charge physique", "Horaires", "Organisation", "Risques psychosociaux", "Violences"] },
  { title: "Santé du professionnel", details: ["Santé physique", "Santé mentale", "Qualité de vie"] },
  { title: "Capacité à travailler", details: ["Fatigue", "Présentéisme", "Arrêts", "Maintien en emploi"] },
  { title: "Fonctionnement de l'équipe", details: ["Réorganisation", "Remplacements", "Report de charge"] },
  { title: "Qualité et continuité des soins", details: [] },
];

/** Chaîne d'effets : des expositions professionnelles à la qualité des soins. */
export default function Chain() {
  return (
    <ol className="chain">
      {STEPS.map((s, i) => (
        <li key={s.title} className="chain-step">
          <span className="chain-num" aria-hidden="true">{i + 1}</span>
          <div>
            <strong>{s.title}</strong>
            {s.details.length > 0 && (
              <ul>
                {s.details.map((d) => <li key={d}>{d}</li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
