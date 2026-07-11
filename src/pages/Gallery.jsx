import { useCallback, useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import { loadGalleryPageData } from '../data/gallery.js';
import { useRefetchOnFocus } from '../hooks/usePageData.js';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/galleryPage.module.css';

function GalleryLightbox({ photo, photos, onClose, onPrev, onNext }) {
  const { t } = useTranslation();
  const index = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={photo.label}
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label={t('galleryPage.closeView')}
      >
        ×
      </button>

      {hasPrev ? (
        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label={t('galleryPage.prevPhoto')}
        >
          ‹
        </button>
      ) : null}

      <figure
        className={styles.lightboxFigure}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image}
          alt={photo.alt}
          className={styles.lightboxImage}
        />
        <figcaption className={styles.lightboxCaption}>
          <span className={styles.lightboxTitle}>{photo.label}</span>
          <span className={styles.lightboxCategory}>{photo.category}</span>
        </figcaption>
      </figure>

      {hasNext ? (
        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxNext}`}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label={t('galleryPage.nextPhoto')}
        >
          ›
        </button>
      ) : null}
    </div>
  );
}

function GalleryCard({ photo, onOpen }) {
  const clickable = Boolean(photo.image);

  return (
    <article className={styles.card}>
      {clickable ? (
        <button
          type="button"
          className={styles.mediaBtn}
          style={{ aspectRatio: photo.ratio }}
          onClick={() => onOpen(photo)}
          aria-label={`View ${photo.label} full size`}
        >
          <img
            src={photo.image}
            alt={photo.alt}
            className={styles.photo}
            loading="lazy"
          />
        </button>
      ) : (
        <div className={styles.media} style={{ aspectRatio: photo.ratio }}>
          <p className={styles.mediaLabel} aria-hidden="true">
            [ {photo.label} ]
          </p>
        </div>
      )}
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{photo.label}</h2>
        <p className={styles.cardCategory}>{photo.category}</p>
      </div>
    </article>
  );
}

export default function Gallery() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState(null);
  const [filterCategories, setFilterCategories] = useState(['all']);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);

  const loadPhotos = useCallback(() => {
    return loadGalleryPageData()
      .then((result) => {
        setPhotos(result.photos);
        setFilterCategories(result.categories);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err);
      });
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useRefetchOnFocus(loadPhotos);

  const categories = filterCategories;

  const visiblePhotos = useMemo(() => {
    if (!photos) return [];
    if (filter === 'all') return photos;
    return photos.filter((p) => p.category === filter);
  }, [photos, filter]);

  const openablePhotos = useMemo(
    () => visiblePhotos.filter((p) => p.image),
    [visiblePhotos],
  );

  const closeLightbox = useCallback(() => setActivePhoto(null), []);

  const showPrev = useCallback(() => {
    if (!activePhoto) return;
    const idx = openablePhotos.findIndex((p) => p.id === activePhoto.id);
    if (idx > 0) setActivePhoto(openablePhotos[idx - 1]);
  }, [activePhoto, openablePhotos]);

  const showNext = useCallback(() => {
    if (!activePhoto) return;
    const idx = openablePhotos.findIndex((p) => p.id === activePhoto.id);
    if (idx >= 0 && idx < openablePhotos.length - 1) {
      setActivePhoto(openablePhotos[idx + 1]);
    }
  }, [activePhoto, openablePhotos]);

  useEffect(() => {
    setActivePhoto(null);
  }, [filter]);

  useEffect(() => {
    if (activePhoto) {
      document.body.dataset.galleryLightbox = 'true';
    } else {
      delete document.body.dataset.galleryLightbox;
    }
    return () => {
      delete document.body.dataset.galleryLightbox;
    };
  }, [activePhoto]);

  const heroImage = photos?.find((p) => p.image)?.image ?? null;

  if (loadError) {
    return (
      <PageShell active="gallery" className={styles.page}>
        <PageError message={loadError.message} />
      </PageShell>
    );
  }

  if (!photos) {
    return (
      <PageShell active="gallery" className={styles.page}>
        <div className={styles.loadingWrap}>
          <PageLoading />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="gallery" className={styles.page}>
      <section className={styles.hero} aria-labelledby="gallery-hero-title">
        {heroImage ? (
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden="true"
          />
        ) : (
          <div className={styles.heroBgPlaceholder} aria-hidden="true">
            <span className={styles.heroBgLabel}>[ adorned trinity — wide ]</span>
          </div>
        )}
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>{t('gallery.eyebrow')}</p>
          <h1 id="gallery-hero-title" className={styles.heroTitle}>
            {t('gallery.title')}
          </h1>
          <p className={styles.heroOdia}>{t('galleryPage.heroOdia')}</p>
        </div>
      </section>

      <section className={styles.filtersSection} aria-label={t('galleryPage.filterAria')}>
        <div className={styles.filters} role="group">
          {categories.map((category) => {
            const active = filter === category;
            return (
              <button
                key={category}
                type="button"
                className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
                aria-pressed={active}
                onClick={() => setFilter(category)}
              >
                {category === 'all' ? t('galleryPage.allPhotos') : category}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.gridSection} aria-labelledby="gallery-grid-title">
        <h2 id="gallery-grid-title" className="visually-hidden">
          {t('gallery.title')}
        </h2>

        {visiblePhotos.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('galleryPage.emptyTitle')}</p>
            <p className={styles.emptyText}>{t('galleryPage.emptyText')}</p>
          </div>
        ) : (
          <div className={styles.masonry}>
            {visiblePhotos.map((photo) => (
              <div key={photo.id} className={styles.masonryItem}>
                <GalleryCard photo={photo} onOpen={setActivePhoto} />
              </div>
            ))}
          </div>
        )}
      </section>

      {activePhoto ? (
        <GalleryLightbox
          photo={activePhoto}
          photos={openablePhotos}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </PageShell>
  );
}
