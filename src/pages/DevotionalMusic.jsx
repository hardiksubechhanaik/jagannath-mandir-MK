import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import MusicSuggestionSection from '../components/music/MusicSuggestionSection';
import styles from '../styles/devotionalMusic.module.css';

function MusicPlayerModal({ track, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!track) return null;

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-label={track.title} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close player">
          ×
        </button>
        <div className={styles.playerWrap}>
          <iframe
            title={track.title}
            src={`${track.embedUrl}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalCategory}>{track.category}</div>
          <h2 className={styles.modalTitle}>{track.title}</h2>
          {track.artist ? <p className={styles.modalArtist}>{track.artist}</p> : null}
          {track.description ? <p className={styles.modalDescription}>{track.description}</p> : null}
          <a
            href={track.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openYoutube}
          >
            Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

function FeaturedTrackHero({ track, onPlay, featuredLabel, playLabel, spotlightLabel }) {
  return (
    <div className={styles.featuredHeroSection}>
      <div className={styles.featuredHeroSpotlight}>{spotlightLabel}</div>
      <div className={styles.featuredHeroFrame}>
        <button type="button" className={styles.featuredHero} onClick={() => onPlay(track)}>
          <div
            className={styles.featuredHeroMedia}
            style={track.thumbnail ? { backgroundImage: `url(${track.thumbnail})` } : undefined}
          >
            <div className={styles.featuredHeroMediaOverlay} aria-hidden="true" />
            <span className={styles.featuredHeroPlay} aria-hidden="true">
              <span className={styles.featuredHeroPlayIcon}>▶</span>
              {playLabel}
            </span>
          </div>
          <div className={styles.featuredHeroBody}>
            <div className={styles.featuredHeroEyebrow}>{featuredLabel}</div>
            {track.category && track.category !== 'Other' ? (
              <div className={styles.featuredHeroCategory}>{track.category}</div>
            ) : null}
            <h2 className={styles.featuredHeroTitle}>{track.title}</h2>
            {track.artist ? <p className={styles.featuredHeroArtist}>{track.artist}</p> : null}
            {track.description ? <p className={styles.featuredHeroDescription}>{track.description}</p> : null}
          </div>
        </button>
      </div>
    </div>
  );
}

function MusicCard({ track, onPlay }) {
  return (
    <button type="button" className={styles.musicCard} onClick={() => onPlay(track)}>
      <div
        className={styles.musicThumb}
        style={track.thumbnail ? { backgroundImage: `url(${track.thumbnail})` } : undefined}
      >
        <span className={styles.playIcon} aria-hidden="true">▶</span>
      </div>
      <div className={styles.musicBody}>
        {track.category && track.category !== 'Other' ? (
          <div className={styles.musicCategory}>{track.category}</div>
        ) : null}
        <div className={styles.musicTitle}>{track.title}</div>
        {track.artist ? <div className={styles.musicArtist}>{track.artist}</div> : null}
      </div>
    </button>
  );
}

export default function DevotionalMusicPage() {
  const { t } = useTranslation();
  const { data, loading, error } = usePageData(endpoints.devotionalMusic);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTrack, setActiveTrack] = useState(null);

  const items = data?.items ?? [];

  const heroTrack = useMemo(
    () => items.find((item) => item.featured) ?? null,
    [items],
  );

  const categories = useMemo(() => {
    const unique = data?.categories?.length
      ? data.categories
      : [...new Set(items.map((item) => item.category))];
    return ['All', ...unique.filter((category) => category && category !== 'Other')];
  }, [data, items]);

  const libraryItems = useMemo(() => {
    const base = heroTrack ? items.filter((item) => item.id !== heroTrack.id) : items;
    if (activeCategory === 'All') return base;
    return base.filter((item) => item.category === activeCategory);
  }, [items, heroTrack, activeCategory]);

  const showFilters = categories.length > 2;

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError message={error.message} />;
  } else if (!items.length) {
    content = (
      <div className={styles.emptyState}>
        <p>{t('music.empty')}</p>
      </div>
    );
  } else {
    content = (
      <>
        {heroTrack ? (
          <FeaturedTrackHero
            track={heroTrack}
            onPlay={setActiveTrack}
            featuredLabel={t('music.featuredEyebrow')}
            playLabel={t('music.playNow')}
            spotlightLabel={t('music.spotlightLabel')}
          />
        ) : null}

        {libraryItems.length ? (
          <section className={styles.librarySection}>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>{t('music.libraryEyebrow')}</div>
              <h2 className={styles.sectionTitle}>
                {heroTrack ? t('music.moreTracksTitle') : t('music.libraryTitle')}
              </h2>
            </div>

            {showFilters ? (
              <div className={styles.filterRow}>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`${styles.filterBtn}${activeCategory === category ? ` ${styles.filterBtnActive}` : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : null}

            <div className={styles.musicGrid}>
              {libraryItems.map((track) => (
                <MusicCard key={track.id} track={track} onPlay={setActiveTrack} />
              ))}
            </div>
          </section>
        ) : null}
      </>
    );
  }

  return (
    <PageShell active="devotional-music" className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{t('music.eyebrow')}</div>
          <h1 className={styles.heroTitle}>{t('music.title')}</h1>
          <p className={styles.heroSub}>{t('music.subtitle')}</p>
        </div>
      </section>

      <div className={styles.content}>
        {content}
        <MusicSuggestionSection />
      </div>

      {activeTrack ? (
        <MusicPlayerModal track={activeTrack} onClose={() => setActiveTrack(null)} />
      ) : null}
    </PageShell>
  );
}
