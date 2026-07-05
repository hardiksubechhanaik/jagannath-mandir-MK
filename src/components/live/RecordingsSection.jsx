import { RECORDINGS, YOUTUBE } from '../../data/liveDarshan';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/liveDarshan.module.css';

export default function RecordingsSection({ recordings: recordingsProp }) {
  const { t } = useTranslation();
  const recordings = recordingsProp?.length ? recordingsProp : RECORDINGS;

  if (!recordings.length) return null;

  return (
    <section className={styles.recentSection}>
      <div className={styles.recentInner}>
        <div className={styles.recentHeader}>
          <div>
            <div className={styles.eyebrow}>{t('live.recordingsEyebrow')}</div>
            <h2 className={styles.recentH2}>{t('live.recordingsTitle')}</h2>
          </div>
          <a
            href={YOUTUBE.videosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.archiveBtn}
            aria-label={t('live.allVideosAria')}
          >
            {t('live.allVideos')}
          </a>
        </div>

        <div className={styles.recordingsGrid}>
          {recordings.map((recording) => (
            <a
              key={recording.id ?? recording.href ?? recording.title}
              href={recording.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.recordingCard}
              aria-label={t('live.playRecording', { title: recording.title })}
            >
              <div
                className={`${styles.recordingImg} ${recording.thumbnail ? styles.recordingImgHasThumb : ''}`}
                style={
                  recording.thumbnail
                    ? { backgroundImage: `url(${recording.thumbnail})` }
                    : undefined
                }
              >
                <div className={styles.recordingPlayBtn} aria-hidden="true">
                  <span className={styles.recordingPlayIcon}>▶</span>
                </div>
                {recording.duration ? (
                  <span className={styles.durationChip}>{recording.duration}</span>
                ) : null}
              </div>
              <div className={styles.recordingBody}>
                {recording.date ? (
                  <div className={styles.recordingDate}>{recording.date}</div>
                ) : null}
                <div className={styles.recordingTitle}>{recording.title}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
