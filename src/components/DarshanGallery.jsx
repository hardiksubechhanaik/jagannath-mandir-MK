import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/gallery.module.css';

export default function DarshanGallery({ items = [] }) {
  const { t } = useTranslation();
  const localeItems = t('gallery.items', { object: true });

  const mergedItems = items.map((item) => {
    const localeItem = localeItems.find((entry) => entry.id === item.id);
    return {
      ...item,
      label: localeItem?.label ?? item.label,
      alt: localeItem?.alt ?? item.alt ?? item.label,
      image: resolveMediaUrl(item.image),
    };
  });

  return (
    <section className={styles.gallerySection}>
      <div className={styles.galleryInner}>
        <div className={styles.galleryHeader}>
          <div className={styles.eyebrow}>{t('gallery.eyebrow')}</div>
          <h2 className={styles.title}>{t('gallery.title')}</h2>
        </div>

        {mergedItems.length === 0 ? (
          <p className={styles.emptyText}>{t('gallery.emptyText')}</p>
        ) : (
          <div className={styles.galleryGrid}>
            {mergedItems.map((item) => (
              <figure
                key={item.id}
                className={styles.galleryItem}
                style={{
                  aspectRatio: item.ratio,
                  gridRow: item.span,
                }}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className={styles.galleryPhoto}
                  style={{ objectPosition: item.focus ?? 'center center' }}
                  loading="lazy"
                />
                <figcaption className={styles.galleryCaption}>[ {item.label} ]</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className={styles.galleryFooter}>
          <Link to="/gallery" className={styles.btnOutlineGold}>
            {t('gallery.viewFull')}
          </Link>
        </div>
      </div>
    </section>
  );
}
