import sudarshanImg from '../../assets/deities/sudarshan.png';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/deities.module.css';

export default function SudarshanSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.sudarshanSection}>
      <div className={styles.sudarshanInner}>
        <div className={styles.sudarshanCircle}>
          <img
            src={sudarshanImg}
            alt={t('deities.sudarshanName')}
            className={styles.sudarshanPhoto}
          />
        </div>
        <div className={styles.sudarshanText}>
          <div className={styles.sudarshanOdia}>{t('deities.sudarshanOdia')}</div>
          <h3 className={styles.sudarshanName}>{t('deities.sudarshanName')}</h3>
          <p className={styles.sudarshanDesc}>{t('deities.sudarshanDesc')}</p>
        </div>
      </div>
    </section>
  );
}
