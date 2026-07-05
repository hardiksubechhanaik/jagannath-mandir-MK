import TempleLogo from '../TempleLogo';
import { CHANNEL_NAME, YOUTUBE, YOUTUBE_CHANNEL_ID } from '../../data/liveDarshan';
import useYoutubeStats from '../../hooks/useYoutubeStats';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

const isYoutubeConfigured = YOUTUBE_CHANNEL_ID !== 'UC_TEMPLE_CHANNEL_ID';

function channelStatsLabel(stats, t) {
  if (!stats?.subscribers) return null;
  if (stats.watching) {
    return t('live.channelStats', {
      subscribers: stats.subscribers,
      watching: stats.watching,
    });
  }
  return t('live.channelStatsSubscribersOnly', { subscribers: stats.subscribers });
}

export default function LiveStreamStage({ youtubeStats: initialStats }) {
  const { t } = useTranslation();
  const youtubeStats = useYoutubeStats(initialStats);
  const statsLabel = channelStatsLabel(youtubeStats, t);

  return (
    <section className={styles.stage}>
      <div className={styles.stageInner}>
        <div className={styles.stageTopBar}>
          <div>
            <div className={styles.liveRow}>
              <span className={styles.livePill}>
                <span className={`${styles.liveDot} ${styles.liveDotMd}`} aria-hidden="true" />
                {t('common.live')}
              </span>
              <span className={styles.streamingLabel}>{t('live.streamingOn')}</span>
            </div>
            <h1 className={styles.stageH1}>{t('live.title')}</h1>
          </div>
          <div className={styles.stageRight}>
            <div className={styles.stageOdia}>{t('live.odia')}</div>
            <div className={styles.stageSubtitle}>{t('live.nowLine')}</div>
          </div>
        </div>

        <div className={styles.player}>
          {isYoutubeConfigured ? (
            <iframe
              src={YOUTUBE.embedUrl}
              title={t('live.playerTitle')}
              className={styles.playerEmbed}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.playerPoster}>
              <div className={styles.posterPlayBtn} aria-hidden="true">
                <span className={styles.posterPlayIcon}>▶</span>
              </div>
              <p className={styles.posterLabel}>{t('live.posterLabel')}</p>
            </div>
          )}
        </div>

        <div className={styles.channelBar}>
          <div className={styles.channelInfo}>
            <TempleLogo className={styles.channelLogo} size={44} alt="" />
            <div>
              <div className={styles.channelName}>{CHANNEL_NAME}</div>
              {statsLabel ? (
                <div className={styles.channelStats}>{statsLabel}</div>
              ) : null}
            </div>
          </div>
          <div className={styles.channelActions}>
            <a
              href={YOUTUBE.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.subscribeBtn}
              aria-label={t('live.subscribeAria')}
            >
              <span aria-hidden="true">▶</span>
              {t('live.subscribe')}
            </a>
            <a
              href={YOUTUBE.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openYoutubeBtn}
              aria-label={t('live.openYoutubeAria')}
            >
              {t('live.openYoutube')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
