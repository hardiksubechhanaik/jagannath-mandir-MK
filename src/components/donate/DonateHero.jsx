import donateHeroImg from '../../assets/donate/hero-darshan.png';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/donate.module.css';

function scrollToGive() {
  const el = document.getElementById('give');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function DonateHero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className="templeHeroBg" aria-hidden="true" />
      <div className="templeHeroOverlay" aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.heroText}>
          <div className={styles.heroEyebrow}>{t('donate.heroEyebrow')}</div>
          <h1 className={styles.heroH1}>
            {t('donate.heroTitle').split('\n').map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className={styles.heroBody}>{t('donate.heroBody')}</p>
          <button className={styles.heroCta} onClick={scrollToGive}>
            {t('donate.heroCta')}
          </button>
        </div>
        <div className={styles.heroImg}>
          <img
            src={donateHeroImg}
            alt={t('donate.heroImgAlt')}
            className={styles.heroPhoto}
          />
        </div>
      </div>
    </section>
  );
}
