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
  formatInstagramHandle,
  getPartnerTypeLabel,
  groupCreatorsByType,
  hasInstagramHandle,
  instagramProfileUrl,
  isHighlightedCreator,
  notifyCreatorSpotlightUpdate,
} from '../../lib/creatorSpotlight';
import { isVolunteerAuthError, withVolunteerAuth } from '../../lib/volunteerAuth';
import styles from '../../styles/rathWallVolunteer.module.css';

const EMPTY_FORM = {
  name: '',
  instagramHandle: '',
  partnerType: '',
  details: '',
  highlighted: false,
  photo: null,
  photoPreview: '',
};

function CreatorManageRow({ creator, saving, onEdit, onDelete }) {
  const highlighted = isHighlightedCreator(creator);

  return (
    <article
      className={`${styles.creatorManageItem} ${highlighted ? styles.creatorManageItemOfficial : ''}`}
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
        <span className={highlighted ? styles.creatorTierBadgeOfficial : styles.creatorTierBadgeDigital}>
          {getPartnerTypeLabel(creator)}
          {highlighted ? ' · Highlighted' : ''}
        </span>
        <h3 className={styles.creatorManageName}>{creator.name}</h3>
        {creator.details ? (
          <p className={styles.creatorManageDetails}>{creator.details}</p>
        ) : null}
        {hasInstagramHandle(creator.instagramHandle) ? (
          <a
            href={instagramProfileUrl(creator.instagramHandle)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creatorManageHandle}
          >
            {formatInstagramHandle(creator.instagramHandle)}
          </a>
        ) : null}
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

  const grouped = useMemo(() => groupCreatorsByType(creators), [creators]);
  const highlightedCount = useMemo(
    () => creators.filter(isHighlightedCreator).length,
    [creators],
  );

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
      onError(err.message ?? 'Failed to load partners');
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
      partnerType: getPartnerTypeLabel(creator),
      details: creator.details ?? '',
      highlighted: isHighlightedCreator(creator),
      photo: null,
      photoPreview: creator.photoUrl ? resolveMediaUrl(creator.photoUrl) : '',
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
    const partnerType = form.partnerType.trim() || 'Partner';
    const details = form.details.trim();

    if (!name) {
      showFormError('Please enter a partner name.');
      return;
    }

    setSaving(true);
    setFormMessage('');
    onError('');
    const body = new FormData();
    body.append('name', name);
    body.append('instagramHandle', instagramHandle);
    body.append('partnerType', partnerType);
    body.append('details', details);
    body.append('highlighted', form.highlighted ? 'true' : 'false');
    if (form.photo) body.append('photo', form.photo);

    try {
      const successMsg = editingId ? 'Partner updated.' : 'Partner added.';
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
      showFormError(err.message ?? 'Could not save partner');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this partner from the spotlight?')) return;
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
      onError(err.message ?? 'Could not remove partner');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.controlTitle}>Partner Spotlight</h2>
        <p className={styles.controlBody}>
          Add creators, sponsors, and other partners for the home-page marquee.
          Clicking a partner on the home page opens a popup with their details.
        </p>
        <span className={`${styles.statusPill} ${styles.statusOn}`}>
          {creators.length} partners · {highlightedCount} highlighted
        </span>
      </div>

      <form ref={formRef} className={styles.creatorFormCard} onSubmit={handleSubmit}>
        <h3 className={styles.creatorFormTitle}>
          {editingId ? 'Edit partner' : 'Add partner'}
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

        <label className={styles.inputLabel} htmlFor="partner-type">Partner type</label>
        <input
          id="partner-type"
          className={styles.input}
          value={form.partnerType}
          onChange={(e) => setForm((prev) => ({ ...prev, partnerType: e.target.value }))}
          placeholder="e.g. Official Creator Partner, Corporate Sponsor, Media Partner"
          required
        />
        <p className={styles.fieldHint}>This label appears on the partner popup and in grouped lists.</p>

        <label className={styles.creatorHighlightToggle}>
          <input
            type="checkbox"
            checked={form.highlighted}
            onChange={(e) => setForm((prev) => ({ ...prev, highlighted: e.target.checked }))}
          />
          <span className={styles.creatorHighlightToggleLabel}>
            <strong>Highlight this partner</strong>
            <small>Gold ring and star on the home-page marquee</small>
          </span>
        </label>

        <label className={styles.inputLabel} htmlFor="creator-name">Partner name</label>
        <input
          id="creator-name"
          className={styles.input}
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Display name"
          required
        />

        <label className={styles.inputLabel} htmlFor="partner-details">Partner details</label>
        <textarea
          id="partner-details"
          className={styles.textarea}
          rows={4}
          value={form.details}
          onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
          placeholder="Short description shown in the home-page popup when visitors click this partner"
        />

        <label className={styles.inputLabel} htmlFor="creator-handle">
          Instagram <span className={styles.optionalHint}>(optional)</span>
        </label>
        <input
          id="creator-handle"
          className={styles.input}
          value={form.instagramHandle}
          onChange={(e) => setForm((prev) => ({ ...prev, instagramHandle: e.target.value }))}
          placeholder="@username or full profile link"
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
        <p className={styles.fieldHint}>If no photo is uploaded, a default icon is shown on the marquee.</p>

        {form.photoPreview ? (
          <img src={form.photoPreview} alt="" className={styles.creatorFormPreview} />
        ) : null}

        <div className={styles.creatorFormActions}>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add partner'}
          </button>
          {editingId ? (
            <button type="button" className={styles.linkBtn} onClick={resetForm} disabled={saving}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <p className={styles.empty}>Loading partners…</p>
      ) : grouped.length === 0 ? (
        <p className={styles.empty}>No partners yet. Use the form above to add one.</p>
      ) : (
        grouped.map(({ type, items }) => (
          <div key={type}>
            <h2 className={styles.sectionTitle}>{type}</h2>
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
          </div>
        ))
      )}
    </>
  );
}
