import { RIDE_PROVIDERS, getRideHref } from '../data/rideLinks';
import { DIRECTIONS_URL } from '../data/site';
import { useTranslation } from '../i18n/useTranslation';
import TempleMapEmbed from './TempleMapEmbed';
import styles from './FindUsCard.module.css';

const RIDE_TILES = [
  { id: 'uber', name: 'Uber', initial: 'U', chipBg: '#111', chipFg: '#fff' },
  { id: 'ola', name: 'Ola', initial: 'O', chipBg: '#1C5A38', chipFg: '#fff' },
  { id: 'rapido', name: 'Rapido', initial: 'R', chipBg: '#F5C518', chipFg: '#1a1a1a' },
];

function getProviderHref(id) {
  const provider = RIDE_PROVIDERS.find((item) => item.id === id);
  return provider ? getRideHref(provider) : '#';
}

export default function FindUsCard({ heading, address }) {
  const { t } = useTranslation();

  const title = heading ?? t('forms.findUs');
  const addressText = address ?? t('site.address');

  return (
    <article className={styles.card}>
      <div className={styles.mapWrap}>
        <TempleMapEmbed className={styles.mapEmbed} title={t('site.mapTitle')} />
      </div>

      <div className={styles.body}>
        <h2 className={styles.heading}>{title}</h2>

        <p className={styles.address}>{addressText}</p>

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.directionsBtn}
          aria-label={t('findUs.directionsAria')}
        >
          <span className={styles.directionsIcon} aria-hidden="true">
            ◎
          </span>
          {t('findUs.getDirections')}
        </a>

        <div className={styles.rideDivider}>
          <span className={styles.rideDividerLine} aria-hidden="true" />
          <span className={styles.rideDividerLabel}>{t('findUs.bookRide')}</span>
          <span className={styles.rideDividerLine} aria-hidden="true" />
        </div>

        <div className={styles.rideGrid}>
          {RIDE_TILES.map((ride) => (
            <a
              key={ride.id}
              href={getProviderHref(ride.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rideTile}
              aria-label={t('findUs.rideAria', { name: ride.name })}
            >
              <span
                className={styles.rideChip}
                style={{ background: ride.chipBg, color: ride.chipFg }}
                aria-hidden="true"
              >
                {ride.initial}
              </span>
              <span className={styles.rideName}>{ride.name}</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
