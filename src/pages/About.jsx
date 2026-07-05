import PageShell from '../components/layout/PageShell';
import PageHero from '../components/layout/PageHero';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import CtaBand from '../components/layout/CtaBand';
import DarshanGallery from '../components/DarshanGallery';
import OurTempleSection from '../components/about/OurTempleSection';
import TraditionSection from '../components/about/TraditionSection';
import ValuesSection from '../components/about/ValuesSection';
import GanapatiSpotlight from '../components/about/GanapatiSpotlight';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/about.module.css';

export default function About() {
  const { t } = useTranslation();
  const { data, loading, error } = usePageData(endpoints.about);

  if (loading && !data) {
    return (
      <PageShell active="about" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="about" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="about" className={styles.page}>
      <PageHero
        eyebrow={t('about.heroEyebrow')}
        title={t('about.heroTitle')}
        odia={t('about.heroOdia')}
      />
      <OurTempleSection images={data.images} />
      <TraditionSection images={data.images} />
      <ValuesSection />
      <DarshanGallery items={data.gallery} />
      <GanapatiSpotlight images={data.images} />
      <CtaBand
        odia={t('about.ctaOdia')}
        title={t('about.ctaTitle')}
        body={t('about.ctaBody')}
        buttonLabel={t('about.ctaButton')}
        buttonTo="/donate"
      />
    </PageShell>
  );
}
