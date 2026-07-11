import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

const CATEGORIES = ['Bhajan', 'Aarti', 'Kirtan', 'Stotra', 'Other'];

const EMPTY_FORM = {
  title: '',
  artist: '',
  category: 'Bhajan',
  youtubeUrl: '',
  description: '',
  featured: false,
  published: true,
  order: 0,
};

export default function DevotionalMusic() {
  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const editing = editId !== null;
  const pendingSuggestions = suggestions.filter((item) => item.status === 'pending');

  async function loadSuggestions() {
    try {
      const { data } = await api.get('/admin/music-suggestions');
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      setSuggestions([]);
    }
  }

  useEffect(() => {
    store.list('devotionalMusic').then(setItems).catch(() => setItems([]));
    loadSuggestions();
  }, []);

  function reset() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({
      title: item.title || '',
      artist: item.artist || '',
      category: item.category || 'Bhajan',
      youtubeUrl: item.youtubeUrl || '',
      description: item.description || '',
      featured: Boolean(item.featured),
      published: item.published !== false,
      order: item.order ?? 0,
    });
    setError('');
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        artist: form.artist.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        description: form.description.trim(),
        order: Number(form.order) || 0,
      };
      const next = editing
        ? await store.update('devotionalMusic', editId, payload)
        : await store.add('devotionalMusic', payload);
      setItems(next);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save music item');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Remove this music item?')) return;
    setSaving(true);
    try {
      const next = await store.remove('devotionalMusic', id);
      setItems(next);
      if (editId === id) reset();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not delete music item');
    } finally {
      setSaving(false);
    }
  }

  function useSuggestion(suggestion) {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      title: suggestion.title || '',
      artist: suggestion.suggesterName || '',
      youtubeUrl: suggestion.youtubeUrl || '',
      description: 'Suggested by a devotee.',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function approveSuggestion(id) {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post(`/admin/music-suggestions/${id}/approve`);
      if (Array.isArray(data?.items)) setItems(data.items);
      if (Array.isArray(data?.suggestions)) setSuggestions(data.suggestions);
      else await loadSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not add suggestion to library');
    } finally {
      setSaving(false);
    }
  }

  async function dismissSuggestion(id) {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/admin/music-suggestions/${id}/dismiss`);
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not dismiss suggestion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Bhakti · ଭକ୍ତି"
        title="Devotional Music"
        right={<div className="count-note">{items.length} tracks</div>}
      />
      <p className="page-sub">
        Add suggested bhajans, aartis, and kirtans for devotees. Paste a YouTube or YouTube Music link.
      </p>

      {error ? <p style={{ color: '#c92a04', marginBottom: 12 }} role="alert">{error}</p> : null}

      <div className="editor-2col">
        <div className="card card--gold sticky-top">
          <div className="card-title">{editing ? 'Edit track' : 'Add track'}</div>

          <label className="field-label" htmlFor="music-title">Title</label>
          <input
            id="music-title"
            className="input mb14"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Jagannath Bhajan"
          />

          <label className="field-label" htmlFor="music-artist">Artist / Singer (optional)</label>
          <input
            id="music-artist"
            className="input mb14"
            value={form.artist}
            onChange={(e) => setForm((prev) => ({ ...prev, artist: e.target.value }))}
            placeholder="e.g. Temple singers"
          />

          <label className="field-label" htmlFor="music-category">Category</label>
          <select
            id="music-category"
            className="input mb14"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <label className="field-label" htmlFor="music-url">YouTube / YouTube Music link</label>
          <input
            id="music-url"
            className="input mb14"
            value={form.youtubeUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
          />

          <label className="field-label" htmlFor="music-description">Description (optional)</label>
          <textarea
            id="music-description"
            className="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Short note about this track"
            style={{ marginBottom: 14 }}
          />

          <label className="field-label" htmlFor="music-order">Display order</label>
          <input
            id="music-order"
            type="number"
            className="input mb14"
            value={form.order}
            onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                featured: e.target.checked,
                published: e.target.checked ? true : prev.published,
              }))}
            />
            Featured — show as the large hero on the music page (only one at a time)
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.published}
              disabled={form.featured}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            />
            Published — visible on the website
          </label>
          {form.featured ? (
            <p className="page-sub" style={{ marginTop: -4, marginBottom: 12 }}>
              Featured tracks are always published on the website.
            </p>
          ) : null}

          <div className="row-inline" style={{ marginTop: 16 }}>
            <button className="btn btn-primary flex1" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update track' : 'Add track'}
            </button>
            {editing ? <button className="btn btn-ghost" onClick={reset} disabled={saving}>Cancel</button> : null}
          </div>
        </div>

        <div className="stack">
          {items.length === 0 ? (
            <p className="page-sub">No devotional music added yet.</p>
          ) : items.map((item) => (
            <article className="post-card" key={item.id}>
              <div className="post-date">{item.category}{item.featured ? ' · Featured' : ''}</div>
              <div className="post-title">{item.title}</div>
              {item.artist ? <div className="post-body">{item.artist}</div> : null}
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt=""
                  style={{ width: '100%', maxWidth: 280, borderRadius: 8, marginTop: 10 }}
                />
              ) : null}
              <div className="post-body" style={{ marginTop: 8, wordBreak: 'break-all' }}>{item.youtubeUrl}</div>
              {!item.published ? (
                <div className="badge-muted" style={{ marginTop: 8 }}>
                  Draft — hidden from website{item.featured ? ' (featured hero will not show)' : ''}
                </div>
              ) : item.featured ? (
                <div className="badge-live" style={{ marginTop: 8, display: 'inline-block' }}>Live hero track</div>
              ) : null}
              <div className="row-actions">
                <button className="btn-soft" onClick={() => startEdit(item)} disabled={saving}>Edit</button>
                <button className="btn-danger" onClick={() => remove(item.id)} disabled={saving}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 36 }}>
        Devotee suggestions
        {pendingSuggestions.length ? ` (${pendingSuggestions.length} pending)` : ''}
      </h3>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        Tracks suggested from the public music page. Add them to the library or dismiss them.
      </p>

      {pendingSuggestions.length === 0 ? (
        <p className="page-sub">No pending suggestions right now.</p>
      ) : (
        <div className="stack">
          {pendingSuggestions.map((suggestion) => (
            <article className="post-card" key={suggestion.id}>
              <div className="post-date">{suggestion.time}{suggestion.suggesterName ? ` · ${suggestion.suggesterName}` : ''}</div>
              <div className="post-title">{suggestion.title}</div>
              <div className="post-body" style={{ wordBreak: 'break-all' }}>{suggestion.youtubeUrl}</div>
              {suggestion.thumbnail ? (
                <img
                  src={suggestion.thumbnail}
                  alt=""
                  style={{ width: '100%', maxWidth: 280, borderRadius: 8, marginTop: 10 }}
                />
              ) : null}
              <div className="row-actions">
                <button className="btn btn-primary" onClick={() => approveSuggestion(suggestion.id)} disabled={saving}>
                  Add to library
                </button>
                <button className="btn-soft" onClick={() => useSuggestion(suggestion)} disabled={saving}>
                  Edit before adding
                </button>
                <button className="btn-danger" onClick={() => dismissSuggestion(suggestion.id)} disabled={saving}>
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
