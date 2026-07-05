import styles from '../../styles/pageHero.module.css';

export default function PageHero({ eyebrow, title, odia }) {
  return (
    <section className={styles.hero}>
      <div className="templeHeroBg" aria-hidden="true" />
      <div className="templeHeroOverlay" aria-hidden="true" />
      <div className={styles.heroContent}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={`${styles.title} templeHeroTextShadow`}>{title}</h1>
        {odia && <div className={styles.odia}>{odia}</div>}
      </div>
    </section>
  );
}
