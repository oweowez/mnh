import type { ContentFull, Study } from "@/lib/repo";
import RefBadges from "./RefBadges";

export default function ContentBlock({
  content, refs, open = false,
}: { content: ContentFull; refs: Study[]; open?: boolean }) {
  return (
    <details className="content-block" open={open} id={`contenu-${content.id}`}>
      <summary>
        <span className="pill theme-pill">{content.display_theme_label || content.theme_name}</span>
        <h3>{content.titre}</h3>
      </summary>
      <div className="body">
        {content.message_cle && <p className="lead">{content.message_cle}</p>}
        {content.corps_web && <div className="corps">{content.corps_web}</div>}
        {content.nuance && (
          <div className="notice notice-nuance">
            <div className="notice-title">Nuance scientifique</div>
            {content.nuance}
          </div>
        )}
        {content.decideur && (
          <div className="notice notice-decideur">
            <div className="notice-title">Ce que le décideur doit regarder</div>
            {content.decideur}
          </div>
        )}
        <RefBadges studies={refs} />
      </div>
    </details>
  );
}
