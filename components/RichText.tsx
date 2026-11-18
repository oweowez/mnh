import { Fragment } from "react";
import Link from "next/link";
import type { RefIndex } from "@/lib/repo";

/** Gras « **…** » et renvois « [5] » / « [1,4,8] » → liens vers les études. */
export function renderInline(text: string, refs: RefIndex = {}): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(\d+(?:\s*,\s*\d+)*)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={key++}>{m[1]}</strong>);
    } else {
      for (const raw of m[2].split(",")) {
        const n = Number(raw.trim());
        const study = refs[n];
        out.push(
          study ? (
            <Link key={key++} href={`/recherches/${study.slug}`} className="cite" title={`${study.name} — ${study.full_title}`}>
              <span className="sr-only">Référence </span>{n}
            </Link>
          ) : (
            <span key={key++} className="cite">{n}</span>
          )
        );
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isBullet = (line: string) => /^\s*[-•–]\s+/.test(line);

/** Les textes saisis dans un formulaire arrivent avec des fins de ligne Windows (\r\n). */
export const normalizeText = (text: string) => text.replace(/\r\n?/g, "\n").trim();

/** Texte éditorial : paragraphes, listes à puces (« - »), gras et renvois aux études. */
export default function RichText({
  text, refs = {}, className = "",
}: { text: string; refs?: RefIndex; className?: string }) {
  const blocks: React.ReactNode[] = [];
  let key = 0;
  for (const block of normalizeText(text).split(/\n{2,}/)) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let items: string[] = [];
    const flushPara = () => {
      if (para.length === 0) return;
      blocks.push(
        <p key={key++}>
          {para.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {renderInline(line, refs)}
            </Fragment>
          ))}
        </p>
      );
      para = [];
    };
    const flushList = () => {
      if (items.length === 0) return;
      blocks.push(
        <ul key={key++}>
          {items.map((it, i) => <li key={i}>{renderInline(it, refs)}</li>)}
        </ul>
      );
      items = [];
    };
    for (const line of lines) {
      if (isBullet(line)) {
        flushPara();
        items.push(line.replace(/^\s*[-•–]\s+/, ""));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return <div className={`prose ${className}`.trim()}>{blocks}</div>;
}
