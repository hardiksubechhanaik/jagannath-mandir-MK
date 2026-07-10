import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/home.module.css';

export default function HomeDonateBand({ donationAmounts }) {
  const { t } = useTranslation();
  const amounts = donationAmounts ?? ['501', '1,100', '2,100', '5,100', '11,000', '21,000'];
  const [donationType, setDonationType] = useState('one-time');
  const [selectedAmount, setSelectedAmount] = useState('2,100');

  return (
    <section className={styles.donateBand}>
      <div className={styles.donateInner}>
        <div className={styles.donateLeft}>
          <div className={styles.donateOdia}>{t('home.donateOdia')}</div>
          <h2 className={styles.donateH2}>
            {t('home.donateTitle').split('\n').map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p className={styles.donateBody}>{t('home.donateBody')}</p>
        </div>

        <div className={styles.donateForm}>
          <div className={styles.donateTypeToggle}>
            <div
              className={`${styles.donateTypeBtn} ${donationType === 'one-time' ? styles.donateTypeActive : ''}`}
              onClick={() => setDonationType('one-time')}
            >
              {t('home.oneTime')}
            </div>
            <div
              className={`${styles.donateTypeBtn} ${donationType === 'monthly' ? styles.donateTypeActive : ''}`}
              onClick={() => setDonationType('monthly')}
            >
              {t('home.monthly')}
            </div>
          </div>

          <div className={styles.amountGrid}>
            {amounts.map((a) => (
              <div
                key={a}
                className={`${styles.amountBtn} ${selectedAmount === a ? styles.amountActive : ''}`}
                onClick={() => setSelectedAmount(a)}
              >
                ₹{a}
              </div>
            ))}
          </div>

          <Link to="/donate" className={styles.proceedBtn}>{t('home.proceedDonate')}</Link>
          <div className={styles.donateMeta}>{t('home.donateMeta')}</div>
        </div>
      </div>
    </section>
  );
}
