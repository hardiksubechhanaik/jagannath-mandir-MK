import { useEffect } from 'react';
import {
  formatInstagramHandle,
  hasInstagramHandle,
  instagramProfileUrl,
} from '../../lib/creatorSpotlight.js';
import { formatRichText } from '../../lib/richText.js';
import styles from '../../styles/blog.module.css';

function PostMedia({ post }) {
  if (post.image) {
    return (
      <img
        src={post.image}
        alt={post.title}
        className={styles.modalImage}
      />
    );
  }

  return (
    <div className={styles.modalPlaceholder} aria-hidden="true">
      <span>[ {post.title} ]</span>
    </div>
  );
}

export default function BlogPostModal({ post, categoryLabel, onClose }) {
  useEffect(() => {
    if (!post) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  const showInstagram = hasInstagramHandle(post.instaId);

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="presentation">
      <article
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="blog-modal-title"
      >
        <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className={styles.modalMedia}>
          <PostMedia post={post} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalMeta}>
            <span className={styles.featuredBadge}>{categoryLabel}</span>
            <time className={styles.featuredDate} dateTime={post.date}>
              {post.date}
            </time>
          </div>
          <h2 id="blog-modal-title" className={styles.modalTitle}>
            {post.title}
          </h2>
          {post.name && (
            <p className={styles.modalAuthor}>
              <span>{post.name}</span>
              {showInstagram && (
                <a
                  href={instagramProfileUrl(post.instaId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.postInsta}
                >
                  {formatInstagramHandle(post.instaId)}
                </a>
              )}
            </p>
          )}
          <div
            className={styles.modalContent}
            dangerouslySetInnerHTML={{ __html: formatRichText(post.body) }}
          />
        </div>
      </article>
    </div>
  );
}
