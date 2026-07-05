import { useMemo } from 'react';
import MantraBand from '../deity/MantraBand';
import { DEITY_MANTRA } from '../../data/niti';
import { useTranslation } from '../../i18n/useTranslation';

export default function DeitiesMantraBand({ mantra: mantraProp }) {
  const { t } = useTranslation();
  const mantraText = t('niti.mantra', { object: true });
  const assets = mantraProp ?? DEITY_MANTRA;

  const mantra = useMemo(
    () => ({
      left: {
        image: assets.left?.image ?? DEITY_MANTRA.left.image,
        alt: mantraText.garudaAlt,
        odia: mantraText.garudaOdia,
      },
      right: {
        image: assets.right?.image ?? DEITY_MANTRA.right.image,
        alt: mantraText.hanumanAlt,
        odia: mantraText.hanumanOdia,
      },
      odia: mantraText.odia,
      roman: mantraText.roman,
      meaning: mantraText.meaning,
    }),
    [assets, mantraText],
  );

  return (
    <MantraBand
      left={mantra.left}
      right={mantra.right}
      odia={mantra.odia}
      roman={mantra.roman}
      meaning={mantra.meaning}
    />
  );
}
