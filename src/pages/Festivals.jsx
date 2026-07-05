import PageShell from '../components/layout/PageShell';
import PageHero from '../components/layout/PageHero';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import FeaturedFestivalSection from '../components/festivals/FeaturedFestivalSection';
import FestivalCalendarSection from '../components/festivals/FestivalCalendarSection';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/festivals.module.css';

export default function Festivals() {
  const { t } = useTranslation();
  const { data, loading, error } = usePageData(endpoints.festivals);

  if (loading && !data) {
    return (
      <PageShell active="festivals" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="festivals" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="festivals" className={styles.page}>
      <PageHero
        eyebrow={t('festivals.heroEyebrow')}
        title={t('festivals.heroTitle')}
        odia={t('festivals.heroOdia')}
      />
      <FeaturedFestivalSection festivals={data.festivals} />
      <FestivalCalendarSection festivals={data.festivals} panjika={data.panjika} />
    </PageShell>
  );
}
