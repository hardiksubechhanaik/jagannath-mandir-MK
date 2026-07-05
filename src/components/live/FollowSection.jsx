import { useMemo } from 'react';
import { SOCIAL_APPS } from '../../data/liveDarshan';
import { SOCIAL_LOGOS } from '../../data/socialLogos';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

export default function FollowSection() {
  const { t } = useTranslation();

  const apps = useMemo(() => {
    const localeApps = t('live.apps', { object: true });
    return SOCIAL_APPS.map((app, index) => ({
      ...app,
      logo: SOCIAL_LOGOS[app.id],
      ...(localeApps[index] ?? {}),
      name: localeApps[index]?.name ?? app.name,
      handle: localeApps[index]?.handle ?? app.handle,
      cta: localeApps[index]?.cta ?? app.cta,
    }));
  }, [t]);

  return (
    <section className={styles.followSection}>
      <div className={styles.followInner}>
        <div className={styles.followHeader}>
          <div className={styles.eyebrow}>{t('live.followEyebrow')}</div>
          <h2 className={styles.followTitle}>{t('live.followTitle')}</h2>
          <p className={styles.followBody}>
            {t('live.followBodyBefore')}
            <strong>{t('live.followBodyHighlight')}</strong>
            {t('live.followBodyAfter')}
          </p>
        </div>

        <div className={styles.appsGrid}>
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appCard}
              aria-label={t('live.followAppAria', { name: app.name, cta: app.cta })}
            >
              <span className={styles.appChip} aria-hidden="true">
                <img src={app.logo} alt="" className={styles.appLogo} />
              </span>
              <span className={styles.appText}>
                <span className={styles.appName}>{app.name}</span>
                <span className={styles.appHandle}>{app.handle}</span>
              </span>
              <span className={styles.appCta}>{app.cta} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
