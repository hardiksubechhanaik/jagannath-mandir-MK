import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import DonateHero from '../components/donate/DonateHero';
import PurposesSection from '../components/donate/PurposesSection';
import DonationFormSection from '../components/donate/DonationFormSection';
import OtherWaysSection from '../components/donate/OtherWaysSection';
import DonateQuoteBand from '../components/donate/DonateQuoteBand';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import styles from '../styles/donate.module.css';

export default function Donate() {
  const { data, loading, error } = usePageData(endpoints.donate);

  if (loading && !data) {
    return (
      <PageShell active="donate" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="donate" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="donate" className={styles.page}>
      <DonateHero />
      <PurposesSection />
      <DonationFormSection paymentsEnabled={Boolean(data?.paymentsEnabled)} />
      <OtherWaysSection />
      <DonateQuoteBand />
    </PageShell>
  );
}
