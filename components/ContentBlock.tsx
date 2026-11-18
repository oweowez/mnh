import Link from "next/link";
import type { ContentFull, RefIndex, Study } from "@/lib/repo";
import Icon from "./Icon";
import RefBadges from "./RefBadges";
import RichText, { renderInline } from "./RichText";

/**
 * Fiche profession × thématique. Le titre et le message clé restent toujours visibles ;
 * le détail (corps, nuance, repères décideur, sources) se déplie à la demande.
 */
export default function ContentBlock({
  content, refs, refIndex = {}, open = false, tag, more,
}: {
  content: ContentFull;
  refs: Study[];
  refIndex?: RefIndex;
  open?: boolean;
  /** Étiquette affichée au-dessus du titre (par défaut : la thématique). */
  tag?: string;
  /** Lien complémentaire en pied de fiche (ex. vers la fiche profession). */
  more?: { href: string; label: string };
}) {
  return (
    <details className="fiche" open={open} id={`contenu-${content.id}`}>
      <summary>
        <span className="tag tag--theme">{tag ?? (content.display_theme_label || content.theme_name)}</span>
        <h3>{content.titre}</h3>
        {content.message_cle && <span className="fiche-key">{renderInline(content.message_cle, refIndex)}</span>}
        <span className="fiche-more" aria-hidden="true">
          <span className="when-closed">Lire le détail</span>
          <span className="when-open">Replier</span>
        </span>
        <span className="fiche-toggle" aria-hidden="true"><Icon name="chevron" /></span>
      </summary>
      <div className="fiche-body">
        {content.corps_web && <RichText text={content.corps_web} refs={refIndex} />}
        {(content.nuance || content.decideur) && (
          <div className="callouts">
            {content.nuance && (
              <div className="callout callout--nuance">
                <div className="callout-title"><Icon name="scale" />Nuance scientifique</div>
                {renderInline(content.nuance, refIndex)}
              </div>
            )}
            {content.decideur && (
              <div className="callout callout--decideur">
                <div className="callout-title"><Icon name="eye" />Ce que le décideur doit regarder</div>
                {renderInline(content.decideur, refIndex)}
              </div>
            )}
          </div>
        )}
        {(refs.length > 0 || more) && (
          <div className="fiche-foot">
            <RefBadges studies={refs} />
            {more && (
              <Link href={more.href} className="link-arrow">
                {more.label}<Icon name="arrow" />
              </Link>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
