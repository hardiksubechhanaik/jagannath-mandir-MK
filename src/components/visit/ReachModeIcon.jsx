import styles from '../../styles/visit.module.css';

const ICONS = {
  road: '/images/icons/road.png',
  metro: '/images/icons/delhi-metro.png',
};

function ReachIconImg({ src, className }) {
  return (
    <img
      src={src}
      alt=""
      className={className}
      width={44}
      height={44}
      draggable={false}
      aria-hidden="true"
    />
  );
}

function RailAirIcon() {
  return (
    <div className={styles.reachDualIcon}>
      <ReachIconImg src="/images/icons/rail.png" className={styles.reachIconImg} />
      <ReachIconImg src="/images/icons/flight.png" className={styles.reachIconImg} />
    </div>
  );
}

export default function ReachModeIcon({ id }) {
  if (id === 'rail') {
    return (
      <div className={styles.reachIconWrap}>
        <RailAirIcon />
      </div>
    );
  }

  const src = ICONS[id];
  if (!src) return null;

  return (
    <div className={styles.reachIconWrap}>
      <ReachIconImg src={src} className={styles.reachIconImg} />
    </div>
  );
}
