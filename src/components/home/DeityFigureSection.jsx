import styles from '../../styles/home.module.css';

export default function DeityFigureSection({ image, alt, odia, name, devanagari, bgStyle }) {
  return (
    <section className={styles.sudarshanSection} style={bgStyle}>
      <div className={styles.sudarshanInner}>
        <div className={styles.sudarshanCircle}>
          <img src={image} alt={alt} className={styles.deityImg} />
        </div>
        <div className={styles.sudarshanOdia}>{odia}</div>
        <div className={styles.sudarshanName}>{name}</div>
        <div className={styles.sudarshanDevanagari}>{devanagari}</div>
      </div>
    </section>
  );
}
