import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import FollowSection from '../components/live/FollowSection';
import LiveStreamStage from '../components/live/LiveStreamStage';
import RecordingsSection from '../components/live/RecordingsSection';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import styles from '../styles/liveDarshan.module.css';

export default function LiveDarshan() {
  const { data, loading, error } = usePageData(endpoints.liveDarshan);

  if (loading && !data) {
    return (
      <PageShell active="live-darshan" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="live-darshan" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="live-darshan" className={styles.page}>
      <LiveStreamStage youtubeStats={data.youtubeStats} />
      <FollowSection />
      <RecordingsSection recordings={data.recordings} />
    </PageShell>
  );
}
