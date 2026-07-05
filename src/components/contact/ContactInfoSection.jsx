import {
  DIRECTIONS_URL,
  TEMPLE_EMAIL,
  WHATSAPP_URL,
} from '../../data/site';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/contact.module.css';

const INFO_LINKS = {
  Address: DIRECTIONS_URL,
  'Call / WhatsApp': WHATSAPP_URL,
  Email: `mailto:${TEMPLE_EMAIL}`,
};

function InfoCardBody({ item }) {
  return (
    <>
      <div className={styles.infoIcon}>{item.icon}</div>
      <div className={styles.infoTitle}>{item.title}</div>
      <div className={styles.infoBody}>
        {item.body.split('\n').map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </div>
    </>
  );
}

export default function ContactInfoSection() {
  const { t } = useTranslation();
  const info = t('contact.info', { object: true });

  return (
    <section className={styles.infoSection}>
      <div className={styles.infoGrid}>
        {info.map((item) => {
          const href = INFO_LINKS[item.title];
          const key = item.title;

          if (!href) {
            return (
              <div className={styles.infoCard} key={key}>
                <InfoCardBody item={item} />
              </div>
            );
          }

          const external = href.startsWith('http');

          return (
            <a
              key={key}
              href={href}
              className={`${styles.infoCard} ${styles.infoCardLink}`}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <InfoCardBody item={item} />
            </a>
          );
        })}
      </div>
    </section>
  );
}
