import { ABOUT_IMAGES } from '../../data/about';
import DeitySpotlight from '../deity/DeitySpotlight';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/about.module.css';

const GANAPATI_STYLES = {
  section: styles.ganapatiSection,
  inner: styles.ganapatiInner,
  img: styles.ganapatiImg,
  figurePhoto: styles.figurePhoto,
  odia: styles.ganapatiOdia,
  name: styles.ganapatiName,
  devanagari: styles.ganapatiDevanagari,
};

export default function GanapatiSpotlight({ images = ABOUT_IMAGES }) {
  const { t } = useTranslation();

  return (
    <DeitySpotlight
      image={images.ganapati.src}
      alt={t('about.ganapatiAlt')}
      odia={t('about.ganapatiOdia')}
      name={t('about.ganapatiName')}
      devanagari={t('about.ganapatiDevanagari')}
      stylesModule={GANAPATI_STYLES}
    />
  );
}
