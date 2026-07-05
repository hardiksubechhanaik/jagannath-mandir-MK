import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

export default function Timings() {
  const [all, setAll] = useState({ summer: [], winter: [] });
  const [season, setSeason] = useState('summer');
  const rows = all[season] || [];

  useEffect(() => {
    store.get('timings').then(setAll);
  }, []);

  async function setTime(i, value) {
    const next = JSON.parse(JSON.stringify(all));
    next[season][i].time = value;
    const saved = await store.set('timings', next);
    setAll(saved);
  }

  return (
    <>
      <PageHead eyebrow="Daily Niti · ଦୈନନ୍ଦିନ ନୀତି" title="Darshan Timings" />
      <p className="page-sub">Edit the ritual times shown on the site. Changes save automatically.</p>

      <div className="toggle" style={{ marginBottom: 22 }}>
        <button className={'toggle-opt' + (season === 'summer' ? ' active' : '')} onClick={() => setSeason('summer')}>Summer</button>
        <button className={'toggle-opt' + (season === 'winter' ? ' active' : '')} onClick={() => setSeason('winter')}>Winter</button>
      </div>

      <div className="timing-list">
        {rows.map((t, i) => (
          <div className="timing-row" key={`${season}-${t.time}-${i}`}>
            <div>
              <div className="timing-name">{t.name}</div>
              <div className="timing-odia">{t.odia}</div>
            </div>
            <input className="timing-input" value={t.time} onChange={(e) => setTime(i, e.target.value)} />
          </div>
        ))}
      </div>
    </>
  );
}
