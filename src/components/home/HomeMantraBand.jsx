import MantraBand from '../deity/MantraBand';
import { DEITY_IMAGES } from '../../data/home';
import { useTranslation } from '../../i18n/useTranslation';

export default function HomeMantraBand({ deityImages = DEITY_IMAGES }) {
  const { t } = useTranslation();

  const mantra = {
    left: {
      image: deityImages.garuda,
      alt: t('home.garudaAlt'),
      odia: t('home.garudaName').split(' · ')[1] ?? t('home.garudaName'),
      name: t('home.garudaName'),
    },
    right: {
      image: deityImages.hanuman,
      alt: t('home.hanumanAlt'),
      odia: t('home.hanumanName').split(' · ')[1] ?? t('home.hanumanName'),
      name: t('home.hanumanName'),
    },
  };

  return (
    <MantraBand
      left={mantra.left}
      right={mantra.right}
      odia={
        <>
          ଆହେ ନୀଳଶୈଳ ପ୍ରବଳ ମତ୍ତ ବାରଣ,<br />
          ମୋ ଆରତ ନଳିନୀ ବନକୁ କର ଦଳନ ।
        </>
      }
      roman="āhe nīla śaila prabala matta vārana, mo ārata nalinī vanaku kara daḷana"
      meaning={t('home.mantraMeaning')}
    />
  );
}
