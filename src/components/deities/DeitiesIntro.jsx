import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/deities.module.css';

export default function DeitiesIntro() {
  const { t } = useTranslation();

  return (
    <section className={styles.introSection}>
      <p className={styles.introText}>{t('deities.intro')}</p>
    </section>
  );
}
