import maaLakshmiImg from '../../assets/donate/maa-lakshmi.png';
import maaBhudeviImg from '../../assets/donate/maa-bhudevi.png';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/donate.module.css';

export default function DonateQuoteBand() {
  const { t } = useTranslation();

  return (
    <section className={styles.quoteSection}>
      <div className={styles.quoteInner}>
        <div className={styles.quoteDeity}>
          <div className={styles.quoteDeityImg}>
            <img
              src={maaLakshmiImg}
              alt={t('donate.laxmiAlt')}
              className={styles.quoteDeityPhoto}
            />
          </div>
          <div className={styles.quoteDeityOdia}>{t('donate.laxmiOdia')}</div>
        </div>

        <div className={styles.quoteText}>
          <div className={styles.quoteItalic}>{t('donate.quote')}</div>
          <div className={styles.quoteAttrib}>{t('donate.quoteAttrib')}</div>
        </div>

        <div className={styles.quoteDeity}>
          <div className={styles.quoteDeityImg}>
            <img
              src={maaBhudeviImg}
              alt={t('donate.bhudeviAlt')}
              className={styles.quoteDeityPhoto}
            />
          </div>
          <div className={styles.quoteDeityOdia}>{t('donate.bhudeviOdia')}</div>
        </div>
      </div>
    </section>
  );
}
