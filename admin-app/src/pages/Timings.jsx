import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';
import SpecialTimingsPanel from '../components/SpecialTimingsPanel.jsx';

export default function Timings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('view') === 'special' ? 'special' : 'summer';
  const [mode, setMode] = useState(initialMode);
  const [all, setAll] = useState({ summer: [], winter: [] });
  const saveTimer = useRef(null);
  const rows = mode === 'special' ? [] : all[mode] || [];

  useEffect(() => {
    store.get('timings').then(setAll);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    setMode(searchParams.get('view') === 'special' ? 'special' : 'summer');
  }, [searchParams]);

  function switchMode(nextMode) {
    setMode(nextMode);
    if (nextMode === 'special') {
      setSearchParams({ view: 'special' });
    } else {
      setSearchParams({});
    }
  }

  function queueSave(next) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const saved = await store.set('timings', next);
        setAll(saved);
      } catch {
        /* keep local edits visible */
      }
    }, 450);
  }

  function setTime(i, value) {
    const next = JSON.parse(JSON.stringify(all));
    next[mode][i].time = value;
    setAll(next);
    queueSave(next);
  }

  return (
    <>
      <PageHead eyebrow="Daily Niti · ଦୈନନ୍ଦିନ ନୀତି" title="Darshan Timings" />

      <div className="toggle timings-mode-toggle" style={{ marginBottom: 22 }}>
        <button
          type="button"
          className={'toggle-opt' + (mode === 'summer' ? ' active' : '')}
          onClick={() => switchMode('summer')}
        >
          Summer
        </button>
        <button
          type="button"
          className={'toggle-opt' + (mode === 'winter' ? ' active' : '')}
          onClick={() => switchMode('winter')}
        >
          Winter
        </button>
        <button
          type="button"
          className={'toggle-opt toggle-opt--special' + (mode === 'special' ? ' active' : '')}
          onClick={() => switchMode('special')}
        >
          Special periods
        </button>
      </div>

      {mode === 'special' ? (
        <SpecialTimingsPanel />
      ) : (
        <>
          <p className="page-sub">
            Edit the {mode} ritual times shown on the site. Changes save automatically.
          </p>

          <div className="timing-list">
            {rows.map((t, i) => (
              <div className="timing-row" key={t.id || `${mode}-${t.name}-${i}`}>
                <div>
                  <div className="timing-name">{t.name}</div>
                  <div className="timing-odia">{t.odia}</div>
                </div>
                <input className="timing-input" value={t.time} onChange={(e) => setTime(i, e.target.value)} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
