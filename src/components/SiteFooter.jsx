import { FOOTER_SOCIAL_LINKS } from '../data/site';
import { getFooterLinks } from '../i18n/getNav';
import { useTranslation } from '../i18n/useTranslation';
import ScrollLink from './ScrollLink';
import TempleLogo from './TempleLogo';
import TempleMapEmbed from './TempleMapEmbed';
import styles from '../styles/siteFooter.module.css';

export default function SiteFooter() {
  const { t } = useTranslation();
  const footerLinks = getFooterLinks(t);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>
              <TempleLogo className={styles.footerLogoImage} size={40} alt="" />
              <div className={styles.footerLogoName}>{t('site.templeNameShort')}</div>
            </div>
            <p className={styles.footerTagline}>{t('site.footerTagline')}</p>
            <div className={styles.socialRow}>
              {FOOTER_SOCIAL_LINKS.map(({ id, href, icon, ariaKey }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label={t(`site.${ariaKey}`)}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.footerColHead}>{t('site.footerExplore')}</div>
            <div className={styles.footerLinks}>
              {footerLinks.map(({ path, label }) => (
                <ScrollLink key={path} to={path}>{label}</ScrollLink>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.footerColHead}>{t('site.footerHours')}</div>
            <div className={styles.footerHours}>
              {t('site.footerHoursMorning')}<br />
              {t('site.footerHoursEvening')}<br />
              {t('site.footerHoursOpen')}<br />
              <span className={styles.footerHoursNote}>{t('site.footerHoursNote')}</span>
            </div>
          </div>

          <div>
            <div className={styles.footerColHead}>{t('site.footerVisitUs')}</div>
            <div className={styles.footerAddress}>{t('site.address')}</div>
            <div className={styles.footerMap}>
              <TempleMapEmbed className={styles.footerMapEmbed} title={t('site.mapTitle')} />
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerJay}>{t('site.footerJay')}</div>
          <div className={styles.footerCopy}>{t('site.footerCopyright')}</div>
        </div>
      </div>
    </footer>
  );
}
