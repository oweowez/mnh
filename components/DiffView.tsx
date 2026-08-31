import { wordDiff } from "@/lib/diff";

export default function DiffView({ before, after }: { before: string; after: string }) {
  const parts = wordDiff(before, after);
  return (
    <div className="diff">
      {parts.map((p, i) =>
        p.type === "same" ? (
          <span key={i}>{p.text}</span>
        ) : p.type === "add" ? (
          <ins key={i}>{p.text}</ins>
        ) : (
          <del key={i}>{p.text}</del>
        )
      )}
    </div>
  );
}
