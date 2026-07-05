export default function DeitySpotlight({ image, alt, odia, name, devanagari, stylesModule }) {
  const s = stylesModule;

  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.img}>
          <img
            src={image}
            alt={alt}
            className={s.figurePhoto}
          />
        </div>
        <div className={s.odia}>{odia}</div>
        <div className={s.name}>{name}</div>
        <div className={s.devanagari}>{devanagari}</div>
      </div>
    </section>
  );
}
