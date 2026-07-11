import useTempleStatusCopy from '../../hooks/useTempleStatusCopy';
import { DEITY_IMAGES } from '../../data/home';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

function scrollToTimings() {
  const el = document.getElementById('timings');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}

function DwarapaalaLabel({ name }) {
  const [odia, latin] = name.split(' · ');
  return (
    <div className={styles.dwarapaalaName}>
      <span className={styles.dwarapaalaOdia}>{odia}</span>
      {latin ? <span className={styles.dwarapaalaLatin}>{latin}</span> : null}
    </div>
  );
}

export default function HomeHero({ deityImages = DEITY_IMAGES, status }) {
  const { t } = useTranslation();
  const fallback = useTempleStatusCopy();
  const { statusDot, statusGlow, statusHead, statusSub } = status ?? fallback;

  return (
    <section className={styles.hero}>
      <div className="templeHeroBg" aria-hidden="true" />
      <div className="templeHeroOverlay" aria-hidden="true" />
      <div className={styles.heroContent}>
        <div className={styles.heroOdia}>{t('home.heroOdia')}</div>
        <div className={styles.heroWelcome}>{t('home.welcome')}</div>
        <h1 className={styles.heroH1}>
          <span className={styles.heroH1Name}>{t('home.heroTitleLine1')}</span>
          <span className={styles.heroH1Location}>{t('home.heroTitleLine2')}</span>
        </h1>
        <p className={styles.heroSubtitle}>{t('home.subtitle')}</p>

        <div className={styles.heroCards}>
          <div className={styles.dwarapaala}>
            <div className={styles.dwarapaalaImg}>
              <img src={deityImages.jaya} alt={t('home.jayaAlt')} className={styles.deityImg} />
            </div>
            <DwarapaalaLabel name={t('home.jayaName')} />
          </div>

          <div className={styles.statusCard}>
            <div
              className={styles.statusCardLeft}
              style={{ '--status-color': statusDot, '--status-glow': statusGlow }}
            >
              <div className={styles.statusBadge} aria-live="polite">
                <span className={styles.statusDotLg} aria-hidden="true" />
                <span className={styles.statusBadgeText}>{statusHead}</span>
              </div>
              <p className={styles.statusCardSub}>{statusSub}</p>
              <div className={styles.statusCardHours}>
                <div className={styles.statusCardHoursLabel}>{t('status.openDaily')}</div>
                <div className={styles.statusCardHoursVal}>{t('status.hoursRange')}</div>
              </div>
            </div>
            <button type="button" className={styles.statusCardCta} onClick={scrollToTimings}>
              <div className={styles.statusCardCtaText}>
                {t('status.viewSchedule').split('\n').map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </div>
              <div className={styles.statusCardCtaArrow}>{t('status.fullTimetable')}</div>
            </button>
          </div>

          <div className={styles.dwarapaala}>
            <div className={styles.dwarapaalaImg}>
              <img src={deityImages.vijaya} alt={t('home.vijayaAlt')} className={styles.deityImg} />
            </div>
            <DwarapaalaLabel name={t('home.vijayaName')} />
          </div>
        </div>
      </div>
    </section>
  );
}
