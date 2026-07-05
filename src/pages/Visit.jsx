import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import PageHero from '../components/layout/PageHero';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import AtAGlanceSection from '../components/visit/AtAGlanceSection';
import DarshanHoursSection from '../components/visit/DarshanHoursSection';
import HowToReachSection from '../components/visit/HowToReachSection';
import DarshanGuidelinesSection from '../components/visit/DarshanGuidelinesSection';
import FacilitiesSection from '../components/visit/FacilitiesSection';
import AnnadanCtaSection from '../components/visit/AnnadanCtaSection';
import RathTrackerCta from '../components/rath/RathTrackerCta';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { isRathYatraSeason } from '../lib/rathSeason';
import { scrollToHash } from '../lib/scrollToHash';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/visit.module.css';

export default function Visit() {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const { loading, error } = usePageData(endpoints.visit);

  useEffect(() => {
    if (!loading && !error && hash) {
      requestAnimationFrame(() => scrollToHash(hash));
    }
  }, [loading, error, hash]);

  if (loading) {
    return (
      <PageShell active="visit" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell active="visit" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="visit" className={styles.page}>
      <PageHero
        eyebrow={t('visit.heroEyebrow')}
        title={t('visit.heroTitle')}
        odia={t('visit.heroOdia')}
      />
      <AtAGlanceSection />
      <DarshanHoursSection />
      <HowToReachSection />
      {isRathYatraSeason() ? <RathTrackerCta /> : null}
      <DarshanGuidelinesSection />
      <FacilitiesSection />
      <AnnadanCtaSection />
    </PageShell>
  );
}
