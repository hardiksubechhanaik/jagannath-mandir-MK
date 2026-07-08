import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import WelcomeOverlay from '../components/WelcomeOverlay';
import HomeHero from '../components/home/HomeHero';
import useTempleStatusCopy from '../hooks/useTempleStatusCopy';
import RathCountdown from '../components/RathCountdown';
import CreatorMarquee from '../components/home/CreatorMarquee';
import TodayBand from '../components/home/TodayBand';
import AboutPreview from '../components/home/AboutPreview';
import HomeMantraBand from '../components/home/HomeMantraBand';
import DeityFigureSection from '../components/home/DeityFigureSection';
import NitiTimingsSection from '../components/home/NitiTimingsSection';
import FestivalPreviewSection from '../components/home/FestivalPreviewSection';
import HomeDonateBand from '../components/home/HomeDonateBand';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/home.module.css';

export default function Home() {
  const { t } = useTranslation();
  const { statusText: liveStatusText } = useTempleStatusCopy();
  const { data, loading, error } = usePageData(endpoints.home);

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError message={error.message} />;
  } else {
    content = (
      <>
        <HomeHero deityImages={data.deityImages} />
        <RathCountdown />
        <CreatorMarquee />
        <TodayBand />
        <AboutPreview templeImages={data.templeImages} />
        <HomeMantraBand deityImages={data.deityImages} />
        <DeityFigureSection
          image={data.deityImages.sudarshan}
          alt={t('home.sudarshanAlt')}
          odia={t('home.sudarshanOdia')}
          name={t('home.sudarshanName')}
          devanagari={t('home.sudarshanDevanagari')}
        />
        <NitiTimingsSection />
        <DeityFigureSection
          image={data.deityImages.lakshmi}
          alt={t('home.laxmiAlt')}
          odia={t('home.laxmiOdia')}
          name={t('home.laxmiName')}
          devanagari={t('home.laxmiDevanagari')}
          bgStyle={{ background: '#FBF6EA' }}
        />
        <FestivalPreviewSection />
        <HomeDonateBand donationAmounts={data.donationAmounts} />
      </>
    );
  }

  return (
    <>
      <WelcomeOverlay status={liveStatusText} config={data?.welcomePopup} />
      <PageShell active="home" className={styles.page}>
        {content}
      </PageShell>
    </>
  );
}
