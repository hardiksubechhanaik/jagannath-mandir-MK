import styles from '../../styles/mantraBand.module.css';

export default function MantraBand({ left, right, odia, roman, meaning }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.deity}>
          <div className={styles.deityImg}>
            <img src={left.image} alt={left.alt} className={styles.deityPhoto} />
          </div>
          <div className={styles.deityOdia}>{left.odia}</div>
          {left.name && <div className={styles.deityName}>{left.name}</div>}
        </div>

        <div className={styles.text}>
          <div className={styles.odia}>{odia}</div>
          {roman && <div className={styles.roman}>{roman}</div>}
          {meaning && <div className={styles.meaning}>{meaning}</div>}
        </div>

        <div className={styles.deity}>
          <div className={styles.deityImg}>
            <img src={right.image} alt={right.alt} className={styles.deityPhoto} />
          </div>
          <div className={styles.deityOdia}>{right.odia}</div>
          {right.name && <div className={styles.deityName}>{right.name}</div>}
        </div>
      </div>
    </section>
  );
}
