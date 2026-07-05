import upiQrImg from '../../assets/donate/upi-qr.png';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/donate.module.css';

export default function OtherWaysSection() {
  const { t } = useTranslation();
  const bank = t('donate.bank', { object: true });

  return (
    <section className={styles.otherwaysSection}>
      <div className={styles.otherwaysInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('donate.otherEyebrow')}</div>
          <h2 className={styles.sectionH2}>{t('donate.otherTitle')}</h2>
        </div>
        <div className={styles.otherwaysGrid}>
          <div className={styles.otherwaysCard}>
            <div className={styles.upiTitle}>{t('donate.upiTitle')}</div>
            <div className={styles.qrBox}>
              <img
                src={upiQrImg}
                alt={t('donate.upiQrAlt')}
                className={styles.qrPhoto}
              />
            </div>
            <div className={styles.upiId}>{t('donate.upiId')}</div>
          </div>
          <div className={styles.otherwaysCard}>
            <div className={styles.bankTitle}>{t('donate.bankTitle')}</div>
            <div className={styles.bankRows}>
              {bank.map((row, i) => (
                <div
                  className={styles.bankRow}
                  key={row.label}
                  style={i === bank.length - 1 ? { borderBottom: 'none' } : {}}
                >
                  <span className={styles.bankLabel}>{row.label}</span>
                  <span className={`${styles.bankValue} ${row.mono ? styles.bankMono : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
