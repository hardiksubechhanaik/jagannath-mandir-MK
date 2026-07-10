import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import { formatIndianDateRange } from '../lib/indianDates.js';

const EMPTY_ROW = { time: '', name: '', odia: '', note: '' };

const EMPTY_FORM = {
  title: '',
  titleOdia: '',
  startDate: '',
  endDate: '',
  note: '',
  active: true,
  rows: [{ ...EMPTY_ROW }],
};

function formatDateRange(startDate, endDate) {
  return formatIndianDateRange(startDate, endDate);
}

function isActiveNow(item) {
  if (!item.active) return false;
  const today = new Date().toISOString().slice(0, 10);
  return item.startDate <= today && item.endDate >= today;
}

export default function SpecialTimingsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [summerRows, setSummerRows] = useState([]);

  const editing = editingId !== null;

  async function loadItems() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/special-timings');
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load special timetables');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    api.get('/admin/timings')
      .then(({ data }) => setSummerRows(data?.summer ?? []))
      .catch(() => setSummerRows([]));
  }, []);

  const activeCount = useMemo(
    () => items.filter(isActiveNow).length,
    [items],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage('');
    setError('');
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      titleOdia: item.titleOdia || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      note: item.note || '',
      active: item.active !== false,
      rows: item.items?.length
        ? item.items.map((row) => ({
          time: row.time || '',
          name: row.name || '',
          odia: row.odia || '',
          note: row.note || '',
        }))
        : [{ ...EMPTY_ROW }],
    });
    setMessage('');
    setError('');
  }

  function updateRow(index, field, value) {
    setForm((prev) => {
      const rows = [...prev.rows];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, rows };
    });
  }

  function addRow() {
    setForm((prev) => ({ ...prev, rows: [...prev.rows, { ...EMPTY_ROW }] }));
  }

  function removeRow(index) {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((_, i) => i !== index) : prev.rows,
    }));
  }

  function copyFromSummer() {
    if (!summerRows.length) return;
    setForm((prev) => ({
      ...prev,
      rows: summerRows.map((row) => ({
        time: row.time || '',
        name: row.name || '',
        odia: row.odia || '',
        note: row.note || '',
      })),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      title: form.title.trim(),
      titleOdia: form.titleOdia.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      note: form.note.trim(),
      active: form.active,
      rows: form.rows.map((row, index) => ({
        time: row.time.trim(),
        name: row.name.trim(),
        odia: row.odia.trim(),
        note: row.note.trim(),
        order: index,
      })),
    };

    try {
      if (editing) {
        await api.put(`/admin/special-timings/${editingId}`, payload);
        setMessage('Special timetable updated.');
      } else {
        await api.post('/admin/special-timings', payload);
        setMessage('Special timetable added.');
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save special timetable');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this special timetable?')) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/admin/special-timings/${id}`);
      if (editingId === id) resetForm();
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not delete special timetable');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="page-sub">
        Add a different timetable for a specific date range (Rath Yatra week, festival days, etc.).
        When today&apos;s date falls in that range, the website shows this schedule instead of summer/winter.
      </p>

      <p className="page-sub" style={{ marginBottom: 18 }}>
        <strong>{items.length}</strong> schedule{items.length === 1 ? '' : 's'} · <strong>{activeCount}</strong> active today
      </p>

      {message ? <p style={{ color: '#157a5c', marginBottom: 12 }}>{message}</p> : null}
      {error ? <p style={{ color: '#c92a04', marginBottom: 12 }} role="alert">{error}</p> : null}

      <form className="card card--gold" onSubmit={handleSubmit}>
        <h3 className="card-title">{editing ? 'Edit special timetable' : 'Add special timetable'}</h3>

        <label className="field-label" htmlFor="special-title">Schedule title</label>
        <input
          id="special-title"
          className="input"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Rath Yatra week"
          required
        />

        <label className="field-label" htmlFor="special-title-odia">Title in Odia (optional)</label>
        <input
          id="special-title-odia"
          className="input"
          value={form.titleOdia}
          onChange={(e) => setForm((prev) => ({ ...prev, titleOdia: e.target.value }))}
          placeholder="ଶ୍ରୀ ରଥଯାତ୍ରା ସପ୍ତାହ"
        />

        <div className="grid-2 mb14">
          <div>
            <label className="field-label" htmlFor="special-start">Start date</label>
            <input
              id="special-start"
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="special-end">End date</label>
            <input
              id="special-end"
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <label className="field-label" htmlFor="special-note">Banner note (optional)</label>
        <input
          id="special-note"
          className="input"
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="Shown on the website during this period"
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
          />
          Active — show on website when dates match
        </label>

        <div className="special-rows-head">
          <h4 className="special-rows-title">Timing rows</h4>
          <button type="button" className="btn-soft" onClick={copyFromSummer} disabled={!summerRows.length}>
            Copy from summer schedule
          </button>
        </div>

        <div className="special-rows">
          {form.rows.map((row, index) => (
            <div className="special-row" key={`row-${index}`}>
              <input
                className="input"
                value={row.time}
                onChange={(e) => updateRow(index, 'time', e.target.value)}
                placeholder="5:30 AM"
                required
              />
              <input
                className="input"
                value={row.name}
                onChange={(e) => updateRow(index, 'name', e.target.value)}
                placeholder="Ritual name"
                required
              />
              <input
                className="input"
                value={row.odia}
                onChange={(e) => updateRow(index, 'odia', e.target.value)}
                placeholder="Odia name"
              />
              <input
                className="input"
                value={row.note}
                onChange={(e) => updateRow(index, 'note', e.target.value)}
                placeholder="Short note"
              />
              <button type="button" className="btn-danger" onClick={() => removeRow(index)} aria-label="Remove row">
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" className="btn-soft" onClick={addRow}>Add row</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add special timetable'}
          </button>
          {editing ? (
            <button type="button" className="btn-ghost" onClick={resetForm} disabled={saving}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="card-title" style={{ marginTop: 28 }}>Saved special schedules</h3>
      {loading ? (
        <p className="page-sub">Loading…</p>
      ) : items.length === 0 ? (
        <p className="page-sub">No special timetables yet. Use the form above to add one.</p>
      ) : (
        <div className="special-list">
          {items.map((item) => (
            <article key={item.id} className={`special-card ${isActiveNow(item) ? 'special-card-active' : ''}`}>
              <div className="special-card-head">
                <div>
                  <div className="special-card-title">{item.title}</div>
                  {item.titleOdia ? <div className="special-card-odia">{item.titleOdia}</div> : null}
                  <div className="special-card-dates">{formatDateRange(item.startDate, item.endDate)}</div>
                </div>
                <div className="special-card-badges">
                  {isActiveNow(item) ? <span className="badge-live">Live now</span> : null}
                  {!item.active ? <span className="badge-muted">Inactive</span> : null}
                </div>
              </div>
              {item.note ? <p className="special-card-note">{item.note}</p> : null}
              <p className="special-card-meta">{item.items?.length ?? 0} timing rows</p>
              <div className="special-card-actions">
                <button type="button" className="btn-soft" onClick={() => startEdit(item)} disabled={saving}>
                  Edit
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(item.id)} disabled={saving}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
