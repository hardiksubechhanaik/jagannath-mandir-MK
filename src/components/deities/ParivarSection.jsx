import { useMemo } from 'react';
import { PARIVAR_IMAGES } from '../../assets/deities/parivar';
import {
  INNER_SANCTUM_ORDER,
  PARIVAR,
  PARIVAR_ORDER,
} from '../../data/deities';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/deities.module.css';

function sortByOrder(entries, order) {
  return [...entries].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
  );
}

function buildTiles(textEntries, assets, order) {
  const assetsByName = Object.fromEntries(
    assets.map((entry) => [entry.name, entry]),
  );

  return sortByOrder(textEntries, order).map((entry) => {
    const meta = assetsByName[entry.name] ?? {};

    return {
      name: entry.name,
      odia: entry.odia,
      role: entry.role,
      image: PARIVAR_IMAGES[entry.name] ?? meta.image,
      imageFocus: meta.imageFocus ?? '50% 40%',
    };
  });
}

function ParivarGrid({ tiles }) {
  return (
    <div className={styles.parivarGrid}>
      {tiles.map((p) => (
        <div className={styles.parivarCard} key={p.name}>
          <div className={styles.parivarImg}>
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className={styles.parivarPhoto}
                style={{ objectPosition: p.imageFocus }}
              />
            ) : (
              <span className={styles.phLabel}>[ {p.name} ]</span>
            )}
          </div>
          <div className={styles.parivarBody}>
            <div className={styles.parivarOdia}>{p.odia}</div>
            <div className={styles.parivarName}>{p.name}</div>
            <div className={styles.parivarRole}>{p.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ParivarSection({ parivar: parivarProp }) {
  const { t } = useTranslation();
  const parivarText = t('deities.parivar', { object: true });
  const innerSanctumText = t('deities.innerSanctum', { object: true });
  const parivarAssets = parivarProp ?? PARIVAR;

  const { parivarDevata, innerSanctum } = useMemo(() => {
    const sanctumNames = new Set(INNER_SANCTUM_ORDER);
    const parivarOnly = parivarAssets.filter((entry) => !sanctumNames.has(entry.name));
    const sanctumOnly = parivarAssets.filter((entry) => sanctumNames.has(entry.name));

    return {
      parivarDevata: buildTiles(parivarText, parivarOnly, PARIVAR_ORDER),
      innerSanctum: buildTiles(innerSanctumText, sanctumOnly, INNER_SANCTUM_ORDER),
    };
  }, [parivarText, innerSanctumText, parivarAssets]);

  return (
    <section className={styles.parivarSection}>
      <div className={styles.parivarInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>{t('deities.parivarEyebrow')}</div>
          <h2 className={styles.parivarH2}>{t('deities.parivarTitle')}</h2>
          <p className={styles.parivarSubhead}>{t('deities.parivarSubhead')}</p>
        </div>

        <ParivarGrid tiles={parivarDevata} />

        <div className={styles.innerSanctumBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>{t('deities.innerSanctumEyebrow')}</div>
            <h3 className={styles.innerSanctumH3}>{t('deities.innerSanctumTitle')}</h3>
            <p className={styles.parivarSubhead}>{t('deities.innerSanctumSubhead')}</p>
          </div>
          <ParivarGrid tiles={innerSanctum} />
        </div>
      </div>
    </section>
  );
}
