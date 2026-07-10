import { resolveMediaUrl } from '../../api/client';
import {
  formatInstagramHandle,
  getPartnerTypeLabel,
  hasInstagramHandle,
  isHighlightedCreator,
} from '../../lib/creatorSpotlight';
import styles from './CreatorMarqueeCard.module.css';

export default function CreatorMarqueeCard({ creator, onSelect }) {
  const highlighted = isHighlightedCreator(creator);
  const partnerType = getPartnerTypeLabel(creator);

  return (
    <button
      type="button"
      className={styles.item}
      title={`${creator.name} — ${partnerType}`}
      onClick={() => onSelect?.(creator)}
    >
      <div className={`${styles.circle} ${highlighted ? styles.circleOfficial : ''}`}>
        {highlighted ? <span className={styles.badge}>★</span> : null}
        {creator.photoUrl ? (
          <img
            src={resolveMediaUrl(creator.photoUrl)}
            alt=""
            className={styles.avatar}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true">
            {highlighted ? '★' : '🎥'}
          </span>
        )}
      </div>
      <span className={`${styles.name} ${highlighted ? styles.nameOfficial : ''}`}>{creator.name}</span>
      {hasInstagramHandle(creator.instagramHandle) ? (
        <span className={`${styles.handle} ${highlighted ? styles.handleOfficial : ''}`}>
          {formatInstagramHandle(creator.instagramHandle)}
        </span>
      ) : null}
    </button>
  );
}
