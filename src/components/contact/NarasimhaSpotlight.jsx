import { NARASIMHA_IMAGE } from '../../data/contact';
import DeitySpotlight from '../deity/DeitySpotlight';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../../styles/contact.module.css';

const NARASIMHA_STYLES = {
  section: styles.narasimhaSection,
  inner: styles.narasimhaInner,
  img: styles.narasimhaImg,
  figurePhoto: styles.figurePhoto,
  odia: styles.narasimhaOdia,
  name: styles.narasimhaName,
  devanagari: styles.narasimhaDevanagari,
};

export default function NarasimhaSpotlight({ narasimhaImage = NARASIMHA_IMAGE }) {
  const { t } = useTranslation();

  return (
    <DeitySpotlight
      image={narasimhaImage}
      alt={t('contact.narasimhaAlt')}
      odia={t('contact.narasimhaOdia')}
      name={t('contact.narasimhaName')}
      devanagari={t('contact.narasimhaDevanagari')}
      stylesModule={NARASIMHA_STYLES}
    />
  );
}
