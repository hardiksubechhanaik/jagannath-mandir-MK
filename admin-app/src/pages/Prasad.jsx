import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

const DEFAULT_PRICING = {
  pickup: { weekday: 200, weekend: 120 },
  'ananda-bazar': { weekday: 150, weekend: 100 },
};

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 1 ? Math.round(num) : fallback;
}

export default function Prasad() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [flash, setFlash] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store.get('settings').then((data) => {
      if (data?.prasadPricing) {
        setPricing({
          pickup: {
            weekday: data.prasadPricing.pickup?.weekday ?? DEFAULT_PRICING.pickup.weekday,
            weekend: data.prasadPricing.pickup?.weekend ?? DEFAULT_PRICING.pickup.weekend,
          },
          'ananda-bazar': {
            weekday: data.prasadPricing['ananda-bazar']?.weekday ?? DEFAULT_PRICING['ananda-bazar'].weekday,
            weekend: data.prasadPricing['ananda-bazar']?.weekend ?? DEFAULT_PRICING['ananda-bazar'].weekend,
          },
        });
      }
    }).catch(() => {});
  }, []);

  function updateRate(method, field, value) {
    setPricing((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value,
      },
    }));
    setSaveError('');
  }

  async function save() {
    setSaving(true);
    setSaveError('');

    const payload = {
      pickup: {
        weekday: toNumber(pricing.pickup.weekday, DEFAULT_PRICING.pickup.weekday),
        weekend: toNumber(pricing.pickup.weekend, DEFAULT_PRICING.pickup.weekend),
      },
      'ananda-bazar': {
        weekday: toNumber(pricing['ananda-bazar'].weekday, DEFAULT_PRICING['ananda-bazar'].weekday),
        weekend: toNumber(pricing['ananda-bazar'].weekend, DEFAULT_PRICING['ananda-bazar'].weekend),
      },
    };

    try {
      const current = await store.get('settings');
      const saved = await store.set('settings', { ...current, prasadPricing: payload });
      if (saved?.prasadPricing) {
        setPricing(saved.prasadPricing);
      }
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    } catch (err) {
      setSaveError(err.message || 'Could not save prasad prices');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead eyebrow="Mahaprasad booking" title="Prasad Prices" />
      <p className="page-sub">
        Set the rates shown on the public prasad booking page. Prices are stored in MongoDB and stay saved across server restarts.
      </p>

      <div className="card card--gold" style={{ maxWidth: 720 }}>
        <div className="card-title">Temple pickup</div>
        <p className="page-sub" style={{ marginTop: 0, marginBottom: 14 }}>
          Per person / pack when devotees collect at the temple.
        </p>
        <div className="grid-2">
          <div>
            <label className="field-label" htmlFor="pickup-weekday">Weekday rate (₹)</label>
            <input
              id="pickup-weekday"
              type="number"
              min="1"
              className="input"
              value={pricing.pickup.weekday}
              onChange={(e) => updateRate('pickup', 'weekday', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="pickup-weekend">Sat–Sun rate (₹)</label>
            <input
              id="pickup-weekend"
              type="number"
              min="1"
              className="input"
              value={pricing.pickup.weekend}
              onChange={(e) => updateRate('pickup', 'weekend', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, marginTop: 18 }}>
        <div className="card-title">Ananda Bazar</div>
        <p className="page-sub" style={{ marginTop: 0, marginBottom: 14 }}>
          Per person / pack when collected at the temple Ananda Bazar.
        </p>
        <div className="grid-2">
          <div>
            <label className="field-label" htmlFor="bazar-weekday">Weekday rate (₹)</label>
            <input
              id="bazar-weekday"
              type="number"
              min="1"
              className="input"
              value={pricing['ananda-bazar'].weekday}
              onChange={(e) => updateRate('ananda-bazar', 'weekday', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="bazar-weekend">Sat–Sun rate (₹)</label>
            <input
              id="bazar-weekend"
              type="number"
              min="1"
              className="input"
              value={pricing['ananda-bazar'].weekend}
              onChange={(e) => updateRate('ananda-bazar', 'weekend', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-mid" style={{ marginTop: 22 }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: '14px 34px', fontSize: 15 }}
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save prices'}
        </button>
        {flash ? <span className="saved-flash">✓ Saved — live on website</span> : null}
        {saveError ? <span className="login-error">{saveError}</span> : null}
      </div>
    </>
  );
}
