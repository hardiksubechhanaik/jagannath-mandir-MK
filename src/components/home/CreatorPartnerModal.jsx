import { useEffect, useRef } from 'react';
import { resolveMediaUrl } from '../../api/client';
import {
  formatInstagramHandle,
  getPartnerTypeLabel,
  hasInstagramHandle,
  instagramProfileUrl,
  isHighlightedCreator,
} from '../../lib/creatorSpotlight';
import styles from './CreatorPartnerModal.module.css';

export default function CreatorPartnerModal({ creator, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!creator) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [creator, onClose]);

  if (!creator) return null;

  const highlighted = isHighlightedCreator(creator);
  const partnerType = getPartnerTypeLabel(creator);
  const details = String(creator.details ?? '').trim();
  const instagramHandle = String(creator.instagramHandle ?? '').trim();
  const showInstagram = hasInstagramHandle(instagramHandle);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${highlighted ? styles.dialogHighlighted : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-name"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close partner details"
        >
          ×
        </button>

        <div className={`${styles.photoWrap} ${highlighted ? styles.photoWrapHighlighted : ''}`}>
          {creator.photoUrl ? (
            <img
              src={resolveMediaUrl(creator.photoUrl)}
              alt=""
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoFallback} aria-hidden="true">
              {highlighted ? '★' : '🎥'}
            </div>
          )}
        </div>

        <span className={`${styles.typeBadge} ${highlighted ? styles.typeBadgeHighlighted : ''}`}>
          {partnerType}
        </span>

        <h3 id="partner-modal-name" className={styles.name}>{creator.name}</h3>

        {details ? (
          <p className={styles.details}>{details}</p>
        ) : (
          <p className={styles.detailsMuted}>Partner of Shree Jagannath Mandir</p>
        )}

        {showInstagram ? (
          <a
            href={instagramProfileUrl(instagramHandle)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramBtn}
          >
            {formatInstagramHandle(instagramHandle)}
          </a>
        ) : null}
      </div>
    </div>
  );
}
