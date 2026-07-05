import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/deities.module.css';

export default function DarshanCtaSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner}>
        <div className={styles.eyebrow}>{t('deities.ctaEyebrow')}</div>
        <h2 className={styles.ctaH2}>{t('deities.ctaTitle')}</h2>
        <p className={styles.ctaBody}>{t('deities.ctaBody')}</p>
        <div className={styles.ctaBtns}>
          <Link to="/visit" className={styles.btnMaroon}>{t('deities.ctaVisit')}</Link>
          <Link to="/#timings" className={styles.btnOutlineMaroon}>{t('deities.ctaTimings')}</Link>
        </div>
      </div>
    </section>
  );
}
