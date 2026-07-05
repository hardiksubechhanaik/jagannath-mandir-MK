import { useMemo } from 'react';
import { TRINITY, TRINITY_LAYOUT, TRINITY_ORDER } from '../../data/deities';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/deities.module.css';

export function getLayout(side) {
  if (side === 'left') {
    return {
      cols: '0.85fr 1.15fr',
      imgColStart: 1,
      txtColStart: 2,
    };
  }
  return {
    cols: '1.15fr 0.85fr',
    imgColStart: 2,
    txtColStart: 1,
  };
}

function sortByTrinityOrder(entries) {
  return [...entries].sort(
    (a, b) => TRINITY_ORDER.indexOf(a.name) - TRINITY_ORDER.indexOf(b.name),
  );
}

export default function TrinitySection({ trinity: trinityProp }) {
  const { t } = useTranslation();
  const trinityText = t('deities.trinity', { object: true });
  const trinityAssets = trinityProp ?? TRINITY;

  const trinity = useMemo(() => {
    const assetsByName = Object.fromEntries(
      trinityAssets.map((entry) => [entry.name, entry]),
    );

    return sortByTrinityOrder(trinityText).map((entry, index) => {
      const assets = assetsByName[entry.name] ?? {};
      const side = TRINITY_LAYOUT[index] ?? assets.side ?? 'left';

      return {
        name: entry.name,
        odia: entry.odia,
        devanagari: entry.devanagari,
        color: entry.color,
        tag: entry.tag,
        imageAlt: entry.imageAlt,
        description: entry.description,
        image: assets.image,
        imageFocus: assets.imageFocus,
        imageZoom: assets.imageZoom,
        side,
      };
    });
  }, [trinityText, trinityAssets]);

  return (
    <section className={styles.trinitySection}>
      <div className={styles.trinitySectionInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('deities.trinityEyebrow')}</div>
          <h2 className={styles.trinityH2}>{t('deities.trinityTitle')}</h2>
        </div>

        <div className={styles.trinityRows}>
          {trinity.map((d) => {
            const { cols, imgColStart, txtColStart } = getLayout(d.side);
            return (
              <div
                key={d.name}
                className={styles.trinityRow}
                style={{ gridTemplateColumns: cols }}
              >
                <div
                  className={styles.trinityImg}
                  style={{ gridColumn: imgColStart, gridRow: 1 }}
                >
                  <img
                    src={d.image}
                    alt={d.imageAlt}
                    className={styles.trinityPhoto}
                    style={{
                      objectPosition: d.imageFocus,
                      transformOrigin: d.imageFocus,
                      transform: d.imageZoom ? `scale(${d.imageZoom})` : undefined,
                    }}
                  />
                </div>

                <div
                  className={styles.trinityText}
                  style={{ gridColumn: txtColStart, gridRow: 1 }}
                >
                  <div className={styles.trinityTag}>{d.tag}</div>
                  <div className={styles.trinityOdia}>{d.odia}</div>
                  <h3 className={styles.trinityName}>{d.name}</h3>
                  <div className={styles.trinityMeta}>{d.devanagari} · {d.color}</div>
                  <p className={styles.trinityDesc}>{d.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
