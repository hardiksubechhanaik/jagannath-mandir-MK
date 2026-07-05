import styles from './LiveIndicator.module.css';

export default function LiveIndicator({ showLabel = true, className = '' }) {
  return (
    <span className={`${styles.wrap} ${className}`} aria-hidden="true">
      <span className={styles.signal}>
        <span className={styles.dot} />
        <span className={styles.ring} />
        <span className={styles.ring} data-delay />
      </span>
      {showLabel ? <span className={styles.label}>LIVE</span> : null}
    </span>
  );
}
