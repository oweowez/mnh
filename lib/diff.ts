export type DiffPart = { type: "same" | "add" | "del"; text: string };

/** Diff mot à mot (LCS) entre deux textes — pour visualiser les propositions IA. */
export function wordDiff(a: string, b: string): DiffPart[] {
  const wa = a.split(/(\s+)/).filter((w) => w.length > 0);
  const wb = b.split(/(\s+)/).filter((w) => w.length > 0);
  const n = wa.length, m = wb.length;
  // LCS par programmation dynamique
  const dp: Uint32Array[] = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = wa[i] === wb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  const push = (type: DiffPart["type"], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += text;
    else parts.push({ type, text });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (wa[i] === wb[j]) { push("same", wa[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push("del", wa[i]); i++; }
    else { push("add", wb[j]); j++; }
  }
  while (i < n) { push("del", wa[i]); i++; }
  while (j < m) { push("add", wb[j]); j++; }
  return parts;
}
