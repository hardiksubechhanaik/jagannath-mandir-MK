import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';
import WelcomePopupSettings from '../components/WelcomePopupSettings.jsx';

export default function Settings() {
  const [s, setS] = useState({
    status: 'open',
    phone: '',
    email: '',
    address: '',
    morning: '',
    evening: '',
    paymentsEnabled: false,
    welcomePopupEnabled: true,
    welcomePopupEyebrow: '',
    welcomePopupHeading: '',
    welcomePopupSubline: '',
    welcomePopupImages: [],
  });
  const [flash, setFlash] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savingToggle, setSavingToggle] = useState(false);

  useEffect(() => {
    store.get('settings').then((data) => {
      setS((prev) => ({
        ...prev,
        ...data,
        paymentsEnabled: Boolean(data.paymentsEnabled),
        welcomePopupEnabled: data.welcomePopupEnabled !== false,
        welcomePopupImages: Array.isArray(data.welcomePopupImages) ? data.welcomePopupImages : [],
      }));
    });
  }, []);

  function applySettings(data) {
    setS((prev) => ({
      ...prev,
      ...data,
      paymentsEnabled: Boolean(data.paymentsEnabled),
      welcomePopupEnabled: data.welcomePopupEnabled !== false,
      welcomePopupImages: Array.isArray(data.welcomePopupImages) ? data.welcomePopupImages : [],
    }));
  }

  function showFlash() {
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  function update(patch) {
    setS((prev) => ({ ...prev, ...patch }));
    setSaveError('');
  }

  async function saveToggle(patch) {
    setSavingToggle(true);
    setSaveError('');

    try {
      const current = await store.get('settings');
      const next = { ...current, ...patch };
      const saved = await store.set('settings', next);
      applySettings(saved);
      showFlash();
    } catch (err) {
      setSaveError(err.message || 'Could not save setting');
    } finally {
      setSavingToggle(false);
    }
  }

  async function save() {
    setSaveError('');
    try {
      const saved = await store.set('settings', s);
      applySettings(saved);
      showFlash();
    } catch (err) {
      setSaveError(err.message || 'Could not save settings');
    }
  }

  return (
    <>
      <PageHead eyebrow="Configuration" title="Site Settings" />
      <p className="page-sub">
        Temple status, welcome popup, and online payments save immediately when toggled.
        Contact details and hours — click Save Settings.
      </p>

      <div className="settings-stack">
        <div className="card card--gold">
          <div className="card-title">Online payments</div>
          <p className="page-sub" style={{ marginTop: 0, marginBottom: 14 }}>
            When ON, the donation form on the public Donate page is shown.
            UPI and bank details always stay visible.
          </p>
          <div className="toggle">
            <button
              type="button"
              className={'toggle-opt' + (s.paymentsEnabled ? ' active-green' : '')}
              onClick={() => saveToggle({ paymentsEnabled: true })}
              disabled={savingToggle}
            >
              ● Accept payments
            </button>
            <button
              type="button"
              className={'toggle-opt' + (!s.paymentsEnabled ? ' active-gold' : '')}
              onClick={() => saveToggle({ paymentsEnabled: false })}
              disabled={savingToggle}
            >
              Payments off
            </button>
          </div>
          <p className="page-sub" style={{ marginTop: 12, marginBottom: 0 }}>
            Current: <b>{s.paymentsEnabled ? 'ON — form visible on site' : 'OFF — form hidden'}</b>
          </p>
        </div>

        <div className="card card--gold">
          <div className="card-title">Temple status</div>
          <div className="toggle">
            <button
              type="button"
              className={'toggle-opt' + (s.status === 'open' ? ' active-green' : '')}
              onClick={() => saveToggle({ status: 'open' })}
              disabled={savingToggle}
            >
              ● Open
            </button>
            <button
              type="button"
              className={'toggle-opt' + (s.status === 'closed' ? ' active-gold' : '')}
              onClick={() => saveToggle({ status: 'closed' })}
              disabled={savingToggle}
            >
              Closed
            </button>
          </div>
        </div>

        <WelcomePopupSettings
          settings={s}
          onChange={applySettings}
          onFlash={showFlash}
          onError={setSaveError}
        />

        <div className="card">
          <div className="card-title">Contact details</div>
          <div className="grid-2">
            <div>
              <label className="field-label">Phone</label>
              <input className="input" value={s.phone} onChange={(e) => update({ phone: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="input" value={s.email} onChange={(e) => update({ email: e.target.value })} />
            </div>
            <div className="span2">
              <label className="field-label">Address</label>
              <input className="input" value={s.address} onChange={(e) => update({ address: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Opening hours</div>
          <div className="grid-2">
            <div>
              <label className="field-label">Morning</label>
              <input className="input" value={s.morning} onChange={(e) => update({ morning: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Evening</label>
              <input className="input" value={s.evening} onChange={(e) => update({ evening: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex-mid">
          <button className="btn btn-primary" style={{ padding: '14px 34px', fontSize: 15 }} onClick={save}>
            Save Settings
          </button>
          {flash && <span className="saved-flash">✓ Saved — live on website</span>}
          {saveError && <span className="login-error">{saveError}</span>}
        </div>
      </div>
    </>
  );
}
