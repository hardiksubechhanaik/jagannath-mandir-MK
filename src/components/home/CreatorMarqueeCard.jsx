import { resolveMediaUrl } from '../../api/client';
import {
  formatInstagramHandle,
  instagramProfileUrl,
  isOfficialCreator,
} from '../../lib/creatorSpotlight';
import styles from './CreatorMarqueeCard.module.css';

export default function CreatorMarqueeCard({ creator }) {
  const official = isOfficialCreator(creator);

  return (
    <a
      href={instagramProfileUrl(creator.instagramHandle)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.item}
      title={`${creator.name} ${formatInstagramHandle(creator.instagramHandle)}`}
    >
      <div className={`${styles.circle} ${official ? styles.circleOfficial : ''}`}>
        {official ? <span className={styles.badge}>★</span> : null}
        {creator.photoUrl ? (
          <img
            src={resolveMediaUrl(creator.photoUrl)}
            alt=""
            className={styles.avatar}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true">
            {official ? '★' : '🎥'}
          </span>
        )}
      </div>
      <span className={`${styles.name} ${official ? styles.nameOfficial : ''}`}>{creator.name}</span>
      <span className={`${styles.handle} ${official ? styles.handleOfficial : ''}`}>
        {formatInstagramHandle(creator.instagramHandle)}
      </span>
    </a>
  );
}
