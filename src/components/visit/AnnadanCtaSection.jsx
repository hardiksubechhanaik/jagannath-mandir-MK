import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/visit.module.css';

export default function AnnadanCtaSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.annadanSection}>
      <div className={styles.annadanInner}>
        <div className={styles.annadanOdia}>{t('visit.annadanOdia')}</div>
        <h2 className={styles.annadanH2}>{t('visit.annadanTitle')}</h2>
        <p className={styles.annadanBody}>{t('visit.annadanBody')}</p>
        <Link to="/donate" className={styles.annadanBtn}>{t('visit.annadanCta')}</Link>
      </div>
    </section>
  );
}
