import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiDeleteAuth,
  apiGetAuth,
  apiUploadAuth,
  apiUploadPutAuth,
  endpoints,
  resolveMediaUrl,
} from '../../api/client';
import {
  CREATOR_TIERS,
  CREATOR_TIER_LABELS,
  formatInstagramHandle,
  instagramProfileUrl,
  notifyCreatorSpotlightUpdate,
  partitionCreators,
} from '../../lib/creatorSpotlight';
import { isVolunteerAuthError, withVolunteerAuth } from '../../lib/volunteerAuth';
import styles from '../../styles/rathWallVolunteer.module.css';

const EMPTY_FORM = {
  name: '',
  instagramHandle: '',
  photo: null,
  photoPreview: '',
  tier: CREATOR_TIERS.DIGITAL,
};

function CreatorManageRow({ creator, saving, onEdit, onDelete }) {
  const isOfficial = creator.tier === CREATOR_TIERS.OFFICIAL;

  return (
    <article
      key={creator.id}
      className={`${styles.creatorManageItem} ${isOfficial ? styles.creatorManageItemOfficial : ''}`}
    >
      {creator.photoUrl ? (
        <img
          src={resolveMediaUrl(creator.photoUrl)}
          alt=""
          className={styles.creatorManagePhoto}
        />
      ) : (
        <div className={styles.creatorManagePhotoFallback} aria-hidden="true">🎥</div>
      )}
      <div className={styles.creatorManageMeta}>
        <span className={isOfficial ? styles.creatorTierBadgeOfficial : styles.creatorTierBadgeDigital}>
          {CREATOR_TIER_LABELS[creator.tier] ?? CREATOR_TIER_LABELS[CREATOR_TIERS.DIGITAL]}
        </span>
        <h3 className={styles.creatorManageName}>{creator.name}</h3>
        <a
          href={instagramProfileUrl(creator.instagramHandle)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.creatorManageHandle}
        >
          {formatInstagramHandle(creator.instagramHandle)}
        </a>
      </div>
      <div className={styles.creatorManageActions}>
        <button
          type="button"
          className={styles.approveBtn}
          onClick={() => onEdit(creator)}
          disabled={saving}
        >
          Edit
        </button>
        <button
          type="button"
          className={styles.rejectBtn}
          onClick={() => onDelete(creator.id)}
          disabled={saving}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export default function CreatorSpotlightPanel({ onError, onAuthFailure }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formMessage, setFormMessage] = useState('');
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const { official, digital } = useMemo(() => partitionCreators(creators), [creators]);

  const fetchCreators = useCallback(async () => {
    try {
      const data = await withVolunteerAuth((token) => apiGetAuth(endpoints.creatorsVolunteer, token));
      setCreators(data.creators ?? []);
      onError('');
    } catch (err) {
      if (isVolunteerAuthError(err)) {
        onError('Session expired — please sign in again.');
        onAuthFailure?.();
        return;
      }
      onError(err.message ?? 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [onError, onAuthFailure]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  function resetForm() {
    if (form.photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(form.photoPreview);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function showFormError(message) {
    setFormMessage(message);
    onError(message);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function startEdit(creator) {
    if (form.photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(form.photoPreview);
    }
    setEditingId(creator.id);
    setForm({
      name: creator.name,
      instagramHandle: creator.instagramHandle,
      photo: null,
      photoPreview: creator.photoUrl ? resolveMediaUrl(creator.photoUrl) : '',
      tier: creator.tier === CREATOR_TIERS.OFFICIAL ? CREATOR_TIERS.OFFICIAL : CREATOR_TIERS.DIGITAL,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (form.photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(form.photoPreview);
    }
    setForm((prev) => ({
      ...prev,
      photo: file,
      photoPreview: URL.createObjectURL(file),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const name = form.name.trim();
    const instagramHandle = form.instagramHandle.trim();

    if (!name) {
      showFormError('Please enter a display name.');
      return;
    }
    if (!instagramHandle) {
      showFormError('Please enter an Instagram handle or profile link.');
      return;
    }

    setSaving(true);
    setFormMessage('');
    onError('');
    const body = new FormData();
    body.append('name', name);
    body.append('instagramHandle', instagramHandle);
    body.append('tier', form.tier);
    if (form.photo) body.append('photo', form.photo);

    try {
      const successMsg = editingId ? 'Creator updated.' : 'Creator added.';
      if (editingId) {
        await withVolunteerAuth((token) => apiUploadPutAuth(endpoints.creatorsVolunteerUpdate(editingId), body, token));
      } else {
        await withVolunteerAuth((token) => apiUploadAuth(endpoints.creatorsVolunteer, body, token));
      }
      onError('');
      notifyCreatorSpotlightUpdate();
      resetForm();
      setFormMessage(successMsg);
      await fetchCreators();
    } catch (err) {
      if (isVolunteerAuthError(err)) {
        showFormError('Session expired — please sign in again.');
        onAuthFailure?.();
        return;
      }
      showFormError(err.message ?? 'Could not save creator');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this creator from the mela spotlight?')) return;
    setSaving(true);
    onError('');
    try {
      await withVolunteerAuth((token) => apiDeleteAuth(endpoints.creatorsVolunteerDelete(id), token));
      notifyCreatorSpotlightUpdate();
      if (editingId === id) resetForm();
      await fetchCreators();
    } catch (err) {
      if (isVolunteerAuthError(err)) {
        onError('Session expired — please sign in again.');
        onAuthFailure?.();
        return;
      }
      onError(err.message ?? 'Could not remove creator');
    } finally {
      setSaving(false);
    }
  }

  function renderCreatorSection(title, items, emptyMessage) {
    return (
      <>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {items.length === 0 ? (
          <p className={styles.empty}>{emptyMessage}</p>
        ) : (
          <div className={styles.creatorManageList}>
            {items.map((creator) => (
              <CreatorManageRow
                key={creator.id}
                creator={creator}
                saving={saving}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.controlTitle}>Creator Spotlight</h2>
        <p className={styles.controlBody}>
          Add Official Creator Partners and Digital Partners for the mela ground spotlight.
          Official partners appear highlighted at the top of the modal.
        </p>
        <span className={`${styles.statusPill} ${styles.statusOn}`}>
          {official.length} official · {digital.length} digital
        </span>
      </div>

      <form ref={formRef} className={styles.creatorFormCard} onSubmit={handleSubmit}>
        <h3 className={styles.creatorFormTitle}>
          {editingId ? 'Edit creator' : 'Add creator'}
        </h3>

        {formMessage ? (
          <p
            className={
              formMessage.endsWith('added.') || formMessage.endsWith('updated.')
                ? styles.formSuccess
                : styles.formError
            }
            role="alert"
          >
            {formMessage}
          </p>
        ) : null}

        <fieldset className={styles.creatorTierFieldset}>
          <legend className={styles.inputLabel}>Partner type</legend>
          <div className={styles.creatorTierOptions}>
            <label className={styles.creatorTierOption}>
              <input
                type="radio"
                name="creator-tier"
                value={CREATOR_TIERS.OFFICIAL}
                checked={form.tier === CREATOR_TIERS.OFFICIAL}
                onChange={() => setForm((prev) => ({ ...prev, tier: CREATOR_TIERS.OFFICIAL }))}
              />
              <span className={styles.creatorTierOptionLabel}>
                <strong>{CREATOR_TIER_LABELS[CREATOR_TIERS.OFFICIAL]}</strong>
                <small>Featured with gold highlight on the mela modal</small>
              </span>
            </label>
            <label className={styles.creatorTierOption}>
              <input
                type="radio"
                name="creator-tier"
                value={CREATOR_TIERS.DIGITAL}
                checked={form.tier === CREATOR_TIERS.DIGITAL}
                onChange={() => setForm((prev) => ({ ...prev, tier: CREATOR_TIERS.DIGITAL }))}
              />
              <span className={styles.creatorTierOptionLabel}>
                <strong>{CREATOR_TIER_LABELS[CREATOR_TIERS.DIGITAL]}</strong>
                <small>Listed under Digital Partners</small>
              </span>
            </label>
          </div>
        </fieldset>

        <label className={styles.inputLabel} htmlFor="creator-name">Display name</label>
        <input
          id="creator-name"
          className={styles.input}
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Creator name"
          required
        />

        <label className={styles.inputLabel} htmlFor="creator-handle">Instagram</label>
        <input
          id="creator-handle"
          className={styles.input}
          value={form.instagramHandle}
          onChange={(e) => setForm((prev) => ({ ...prev, instagramHandle: e.target.value }))}
          placeholder="@username or full profile link"
          required
        />

        <label className={styles.inputLabel} htmlFor="creator-photo">
          Profile photo <span className={styles.optionalHint}>(optional)</span>
        </label>
        <input
          id="creator-photo"
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        <p className={styles.fieldHint}>If no photo is uploaded, a default camera icon is shown on the mela modal.</p>

        {form.photoPreview ? (
          <img src={form.photoPreview} alt="" className={styles.creatorFormPreview} />
        ) : null}

        <div className={styles.creatorFormActions}>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add creator'}
          </button>
          {editingId ? (
            <button type="button" className={styles.linkBtn} onClick={resetForm} disabled={saving}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <p className={styles.empty}>Loading creators…</p>
      ) : (
        <>
          {renderCreatorSection(
            'Official Creator Partners',
            official,
            'No official partners yet. Use the form above and choose Official Creator Partner.',
          )}
          {renderCreatorSection(
            'Digital Partners',
            digital,
            'No digital partners yet.',
          )}
        </>
      )}
    </>
  );
}
