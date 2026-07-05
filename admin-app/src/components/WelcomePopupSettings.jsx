import { useState } from 'react';
import { store, uploadImage } from '../data/store.js';
import { resolvePreviewUrl } from '../lib/mediaUrl.js';

export default function WelcomePopupSettings({ settings, onChange, onFlash, onError }) {
  const [saving, setSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const [draftFile, setDraftFile] = useState(null);
  const [draftAlt, setDraftAlt] = useState('');
  const [draftLink, setDraftLink] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [imageError, setImageError] = useState('');
  const [removingIndex, setRemovingIndex] = useState(null);

  const images = Array.isArray(settings.welcomePopupImages) ? settings.welcomePopupImages : [];

  async function saveToggle(patch) {
    setSavingToggle(true);
    onError('');

    try {
      const current = await store.get('settings');
      const saved = await store.set('settings', { ...current, ...patch });
      onChange(saved);
      onFlash();
    } catch (err) {
      onError(err.message || 'Could not save welcome popup setting');
    } finally {
      setSavingToggle(false);
    }
  }

  async function saveContent() {
    setSaving(true);
    onError('');

    try {
      const current = await store.get('settings');
      const saved = await store.set('settings', {
        ...current,
        welcomePopupEyebrow: settings.welcomePopupEyebrow || '',
        welcomePopupHeading: settings.welcomePopupHeading || '',
        welcomePopupSubline: settings.welcomePopupSubline || '',
        welcomePopupImages: images,
      });
      onChange(saved);
      onFlash();
    } catch (err) {
      onError(err.message || 'Could not save welcome popup');
    } finally {
      setSaving(false);
    }
  }

  async function addImage() {
    setImageError('');
    try {
      let url = draftUrl.trim();
      if (draftFile instanceof File) {
        url = await uploadImage(draftFile);
      }
      if (!url) {
        setImageError('Add an image URL or upload a file.');
        return;
      }

      const nextImages = [
        ...images,
        {
          url,
          alt: draftAlt.trim(),
          linkUrl: draftLink.trim(),
          caption: draftCaption.trim(),
        },
      ];

      const current = await store.get('settings');
      const saved = await store.set('settings', {
        ...current,
        welcomePopupImages: nextImages,
      });
      onChange(saved);
      onFlash();
      setDraftUrl('');
      setDraftFile(null);
      setDraftAlt('');
      setDraftLink('');
      setDraftCaption('');
    } catch (err) {
      setImageError(err.message || 'Could not add image');
    }
  }

  async function removeImage(index) {
    onError('');
    setRemovingIndex(index);
    try {
      const nextImages = images.filter((_, i) => i !== index);
      const current = await store.get('settings');
      const saved = await store.set('settings', {
        ...current,
        welcomePopupImages: nextImages,
      });
      onChange(saved);
      onFlash();
    } catch (err) {
      onError(err.message || 'Could not remove image');
    } finally {
      setRemovingIndex(null);
    }
  }

  function updateField(field, value) {
    onChange({ ...settings, [field]: value });
  }

  return (
    <div className="card card--gold">
      <div className="card-title">Welcome popup (Home page)</div>
      <p className="page-sub" style={{ marginTop: 0, marginBottom: 14 }}>
        Shown once per visit when someone lands on the Home page. Toggle saves immediately;
        text and images — click Save welcome popup.
      </p>

      <div className="toggle" style={{ marginBottom: 18 }}>
        <button
          type="button"
          className={'toggle-opt' + (settings.welcomePopupEnabled ? ' active-green' : '')}
          onClick={() => saveToggle({ welcomePopupEnabled: true })}
          disabled={savingToggle}
        >
          ● Popup on
        </button>
        <button
          type="button"
          className={'toggle-opt' + (!settings.welcomePopupEnabled ? ' active-gold' : '')}
          onClick={() => saveToggle({ welcomePopupEnabled: false })}
          disabled={savingToggle}
        >
          Popup off
        </button>
      </div>

      <div className="grid-2 mb14">
        <div className="span2">
          <label className="field-label">Eyebrow (small line above heading)</label>
          <input
            className="input"
            value={settings.welcomePopupEyebrow || ''}
            onChange={(e) => updateField('welcomePopupEyebrow', e.target.value)}
            placeholder="Bhakti · Sanskriti · Seva"
          />
        </div>
        <div className="span2">
          <label className="field-label">Promo heading</label>
          <input
            className="input"
            value={settings.welcomePopupHeading || ''}
            onChange={(e) => updateField('welcomePopupHeading', e.target.value)}
            placeholder="Are you a content creator?"
          />
        </div>
        <div className="span2">
          <label className="field-label">Promo subline</label>
          <input
            className="input"
            value={settings.welcomePopupSubline || ''}
            onChange={(e) => updateField('welcomePopupSubline', e.target.value)}
            placeholder="We invite you to be our official Content Creator Partner."
          />
        </div>
      </div>

      <div className="card-title" style={{ fontSize: 16, marginBottom: 10 }}>
        Popup images ({images.length})
      </div>
      <p className="page-sub" style={{ marginTop: 0, marginBottom: 12 }}>
        Add one or more posters or banners. They appear below the welcome message on the Home popup.
      </p>

      {images.length > 0 && (
        <div className="gal-grid" style={{ marginBottom: 18 }}>
          {images.map((img, index) => (
            <div className="gal-card" key={`${img.url}-${index}`}>
              <div className="gal-imgwrap">
                <img
                  className="gal-img"
                  src={resolvePreviewUrl(img.url)}
                  alt={img.alt || `Popup image ${index + 1}`}
                />
                <button
                  type="button"
                  className="gal-remove"
                  title="Remove"
                  disabled={removingIndex === index}
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>
              </div>
              <div className="gal-cap">{img.alt || img.caption || 'No caption'}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginBottom: 16 }}>
        <div className="card-title" style={{ fontSize: 16, marginBottom: 10 }}>
          Add image
        </div>
        <div className="grid-2 mb14">
          <div className="span2">
            <label className="field-label">Image URL</label>
            <input
              className="input"
              placeholder="https://… or /images/…"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
            />
          </div>
          <div className="span2">
            <label className="field-label">Or upload a file</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setDraftFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="field-label">Alt text (accessibility)</label>
            <input
              className="input"
              value={draftAlt}
              onChange={(e) => setDraftAlt(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
          <div>
            <label className="field-label">Link URL (optional)</label>
            <input
              className="input"
              value={draftLink}
              onChange={(e) => setDraftLink(e.target.value)}
              placeholder="https://instagram.com/…"
            />
          </div>
          <div className="span2">
            <label className="field-label">Caption (optional)</label>
            <input
              className="input"
              value={draftCaption}
              onChange={(e) => setDraftCaption(e.target.value)}
              placeholder="Short label under the image"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={addImage}>
          + Add to popup
        </button>
        {imageError && <div className="login-error" style={{ marginTop: 12 }}>{imageError}</div>}
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ padding: '12px 28px' }}
        onClick={saveContent}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save welcome popup'}
      </button>
    </div>
  );
}
