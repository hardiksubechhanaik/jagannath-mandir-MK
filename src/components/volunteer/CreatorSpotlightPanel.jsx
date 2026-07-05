import { useCallback, useEffect, useRef, useState } from 'react';
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
  instagramProfileUrl,
  notifyCreatorSpotlightUpdate,
} from '../../lib/creatorSpotlight';
import { isVolunteerAuthError, withVolunteerAuth } from '../../lib/volunteerAuth';
import styles from '../../styles/rathWallVolunteer.module.css';

const EMPTY_FORM = { name: '', instagramHandle: '', photo: null, photoPreview: '' };

export default function CreatorSpotlightPanel({ onError, onAuthFailure }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileInputRef = useRef(null);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (!name || !instagramHandle) return;
    if (!editingId && !form.photo) {
      onError('Please add a profile photo for the creator.');
      return;
    }

    setSaving(true);
    onError('');
    const body = new FormData();
    body.append('name', name);
    body.append('instagramHandle', instagramHandle);
    if (form.photo) body.append('photo', form.photo);

    try {
      if (editingId) {
        await withVolunteerAuth((token) => apiUploadPutAuth(endpoints.creatorsVolunteerUpdate(editingId), body, token));
      } else {
        await withVolunteerAuth((token) => apiUploadAuth(endpoints.creatorsVolunteer, body, token));
      }
      notifyCreatorSpotlightUpdate();
      resetForm();
      await fetchCreators();
    } catch (err) {
      if (isVolunteerAuthError(err)) {
        onError('Session expired — please sign in again.');
        onAuthFailure?.();
        return;
      }
      onError(err.message ?? 'Could not save creator');
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

  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.controlTitle}>Creator Spotlight</h2>
        <p className={styles.controlBody}>
          Add or edit creators shown on the mela ground. Include a profile photo and Instagram handle.
        </p>
        <span className={`${styles.statusPill} ${styles.statusOn}`}>
          {creators.length} live on mela
        </span>
      </div>

      <form className={styles.creatorFormCard} onSubmit={handleSubmit}>
        <h3 className={styles.creatorFormTitle}>
          {editingId ? 'Edit creator' : 'Add creator'}
        </h3>

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

        <label className={styles.inputLabel} htmlFor="creator-photo">Profile photo</label>
        <input
          id="creator-photo"
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />

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

      <h2 className={styles.sectionTitle}>Current creators</h2>

      {loading ? (
        <p className={styles.empty}>Loading creators…</p>
      ) : creators.length === 0 ? (
        <p className={styles.empty}>No creators added yet.</p>
      ) : (
        <div className={styles.creatorManageList}>
          {creators.map((creator) => (
            <article key={creator.id} className={styles.creatorManageItem}>
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
                  onClick={() => startEdit(creator)}
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.rejectBtn}
                  onClick={() => handleDelete(creator.id)}
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
