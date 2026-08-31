const STEPS = [
  { title: "Expositions professionnelles", detail: "Charge physique · Horaires · Organisation · Risques psychosociaux · Violences" },
  { title: "Santé du professionnel", detail: "Santé physique · Santé mentale · Qualité de vie" },
  { title: "Capacité à travailler", detail: "Fatigue · Présentéisme · Arrêts · Maintien en emploi" },
  { title: "Fonctionnement de l'équipe", detail: "Réorganisation · Remplacements · Report de charge" },
  { title: "Qualité et continuité des soins", detail: "" },
];

export default function Chain() {
  return (
    <div className="chain">
      {STEPS.map((s, i) => (
        <div key={s.title}>
          {i > 0 && <div className="chain-arrow">↓</div>}
          <div className="chain-step">
            <strong>{s.title}</strong>
            {s.detail && <span>{s.detail}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
