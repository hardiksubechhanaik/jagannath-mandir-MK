import PageShell from '../components/layout/PageShell';
import PageHero from '../components/layout/PageHero';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import DeitiesIntro from '../components/deities/DeitiesIntro';
import TrinitySection from '../components/deities/TrinitySection';
import SudarshanSection from '../components/deities/SudarshanSection';
import ParivarSection from '../components/deities/ParivarSection';
import DeitiesMantraBand from '../components/deities/DeitiesMantraBand';
import DarshanCtaSection from '../components/deities/DarshanCtaSection';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/deities.module.css';

export default function Deities() {
  const { t } = useTranslation();
  const { data, loading, error } = usePageData(endpoints.deities);

  if (loading && !data) {
    return (
      <PageShell active="deities" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="deities" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="deities" className={styles.page}>
      <PageHero
        eyebrow={t('deities.heroEyebrow')}
        title={t('deities.heroTitle')}
        odia={t('deities.heroOdia')}
      />
      <DeitiesIntro />
      <TrinitySection trinity={data.trinity} />
      <SudarshanSection />
      <ParivarSection parivar={data.parivar} />
      <DeitiesMantraBand mantra={data.mantra} />
      <DarshanCtaSection />
    </PageShell>
  );
}
