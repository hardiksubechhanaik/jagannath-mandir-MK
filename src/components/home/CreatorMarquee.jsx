import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { apiGet, endpoints } from '../../api/client';
import {
  sortCreatorsForDisplay,
  subscribeCreatorSpotlightUpdates,
} from '../../lib/creatorSpotlight';
import { useTranslation } from '../../i18n/useTranslation';
import CreatorMarqueeCard from './CreatorMarqueeCard';
import CreatorPartnerModal from './CreatorPartnerModal';
import styles from './CreatorMarquee.module.css';

const ITEM_STRIDE_PX = 90;

function buildFilledGroup(ordered, repeatCount) {
  const items = [];
  for (let i = 0; i < repeatCount; i += 1) {
    ordered.forEach((creator, index) => {
      items.push({ creator, key: `${creator.id}-${i}-${index}` });
    });
  }
  return items;
}

export default function CreatorMarquee() {
  const { t } = useTranslation();
  const marqueeRef = useRef(null);
  const [creators, setCreators] = useState([]);
  const [repeatCount, setRepeatCount] = useState(4);
  const [selectedCreator, setSelectedCreator] = useState(null);

  const fetchCreators = useCallback(async () => {
    try {
      const data = await apiGet(endpoints.creatorsPublic);
      if (Array.isArray(data.creators)) setCreators(data.creators);
    } catch {
      // keep last list
    }
  }, []);

  useEffect(() => {
    fetchCreators();
    return subscribeCreatorSpotlightUpdates(fetchCreators);
  }, [fetchCreators]);

  const ordered = useMemo(() => sortCreatorsForDisplay(creators), [creators]);

  useLayoutEffect(() => {
    if (!ordered.length) return undefined;

    function updateRepeatCount() {
      const viewport = marqueeRef.current?.clientWidth ?? window.innerWidth;
      const minItems = Math.ceil(viewport / ITEM_STRIDE_PX) + 4;
      const copies = Math.max(2, Math.ceil(minItems / ordered.length));
      setRepeatCount(copies);
    }

    updateRepeatCount();
    window.addEventListener('resize', updateRepeatCount);
    return () => window.removeEventListener('resize', updateRepeatCount);
  }, [ordered]);

  const groupItems = useMemo(
    () => buildFilledGroup(ordered, repeatCount),
    [ordered, repeatCount],
  );

  if (!groupItems.length) return null;

  return (
    <>
      <section className={styles.section} aria-labelledby="creator-marquee-title">
        <div className={styles.header}>
          <h2 id="creator-marquee-title" className={styles.title}>
            {t('home.creatorMarqueeTitle')}
          </h2>
        </div>
        <div className={styles.marquee} ref={marqueeRef}>
          <div className={styles.track}>
            <div className={styles.trackGroup}>
              {groupItems.map(({ creator, key }) => (
                <CreatorMarqueeCard
                  key={`a-${key}`}
                  creator={creator}
                  onSelect={setSelectedCreator}
                />
              ))}
            </div>
            <div className={styles.trackGroup} aria-hidden="true">
              {groupItems.map(({ creator, key }) => (
                <CreatorMarqueeCard
                  key={`b-${key}`}
                  creator={creator}
                  onSelect={setSelectedCreator}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <CreatorPartnerModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />
    </>
  );
}
