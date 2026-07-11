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
  templeStatusMode: 'auto',
  templeStatusHead: '',
  templeStatusSub: '',
  templeStatusRibbon: '',
  accentColor: '',
  rows: [{ ...EMPTY_ROW }],
};

const ACCENT_PRESETS = [
  { id: 'default', label: 'Temple gold', color: '' },
  { id: 'green', label: 'Open green', color: '#1F8A5B' },
  { id: 'gold', label: 'Closed gold', color: '#C28A1E' },
  { id: 'maroon', label: 'Maroon', color: '#9E2B25' },
  { id: 'purple', label: 'Festival purple', color: '#6B3FA0' },
  { id: 'blue', label: 'Sky blue', color: '#2B6CB0' },
];

function formatDateRange(startDate, endDate) {
  return formatIndianDateRange(startDate, endDate);
}

function statusModeLabel(mode) {
  if (mode === 'open') return 'Force open';
  if (mode === 'closed') return 'Force closed';
  return 'Auto';
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
      templeStatusMode: item.templeStatusMode || 'auto',
      templeStatusHead: item.templeStatusHead || '',
      templeStatusSub: item.templeStatusSub || '',
      templeStatusRibbon: item.templeStatusRibbon || '',
      accentColor: item.accentColor || '',
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
      templeStatusMode: form.templeStatusMode,
      templeStatusHead: form.templeStatusHead.trim(),
      templeStatusSub: form.templeStatusSub.trim(),
      templeStatusRibbon: form.templeStatusRibbon.trim(),
      accentColor: form.accentColor.trim(),
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

        <div className="status-mode-block">
          <h4 className="special-rows-title">Mandir status on homepage</h4>
          <p className="page-sub" style={{ marginBottom: 12 }}>
            While this schedule is active, override the top ribbon, hero status card, and badge on the homepage.
          </p>
          <div className="status-mode-row">
            {[
              { id: 'auto', label: 'Auto (daily hours)' },
              { id: 'open', label: 'Force open' },
              { id: 'closed', label: 'Force closed' },
            ].map((option) => (
              <label key={option.id} className="status-mode-opt">
                <input
                  type="radio"
                  name="templeStatusMode"
                  value={option.id}
                  checked={form.templeStatusMode === option.id}
                  onChange={() => setForm((prev) => ({ ...prev, templeStatusMode: option.id }))}
                />
                {option.label}
              </label>
            ))}
          </div>

          {form.templeStatusMode !== 'auto' ? (
            <>
              <label className="field-label" htmlFor="special-status-ribbon">Top ribbon status (optional)</label>
              <input
                id="special-status-ribbon"
                className="input"
                value={form.templeStatusRibbon}
                onChange={(e) => setForm((prev) => ({ ...prev, templeStatusRibbon: e.target.value }))}
                placeholder='e.g. Closed — Anavasar in progress'
              />
              <p className="page-sub" style={{ margin: '6px 0 14px' }}>
                The short line at the very top of the site (next to the colored dot). Leave blank to use the headline below.
              </p>

              <label className="field-label" htmlFor="special-status-head">Hero badge headline (optional)</label>
              <input
                id="special-status-head"
                className="input"
                value={form.templeStatusHead}
                onChange={(e) => setForm((prev) => ({ ...prev, templeStatusHead: e.target.value }))}
                placeholder='e.g. Temple Closed — Anavasar'
              />

              <label className="field-label" htmlFor="special-status-sub">Hero card message (optional)</label>
              <textarea
                id="special-status-sub"
                className="input"
                rows={3}
                value={form.templeStatusSub}
                onChange={(e) => setForm((prev) => ({ ...prev, templeStatusSub: e.target.value }))}
                placeholder="Shown under the badge on the homepage. Leave blank to use the banner note above."
              />
            </>
          ) : null}
        </div>

        <div className="accent-color-block">
          <h4 className="special-rows-title">Accent color (optional)</h4>
          <p className="page-sub" style={{ marginBottom: 10 }}>
            Colors the special schedule banner. When status is forced open/closed, it also colors the homepage status dot.
          </p>
          <div className="accent-presets">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`accent-swatch${form.accentColor === preset.color ? ' accent-swatch-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, accentColor: preset.color }))}
                title={preset.label}
              >
                <span
                  className="accent-swatch-dot"
                  style={{ background: preset.color || 'linear-gradient(135deg, #e3c36a, #9e2b25)' }}
                />
                {preset.label}
              </button>
            ))}
          </div>
          <div className="accent-custom-row">
            <input
              id="special-accent-color"
              type="color"
              className="accent-color-input"
              value={form.accentColor || '#C28A1E'}
              onChange={(e) => setForm((prev) => ({ ...prev, accentColor: e.target.value.toUpperCase() }))}
              aria-label="Pick a custom accent color"
            />
            <input
              className="input"
              value={form.accentColor}
              onChange={(e) => setForm((prev) => ({ ...prev, accentColor: e.target.value.toUpperCase() }))}
              placeholder="#C28A1E"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            {form.accentColor ? (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setForm((prev) => ({ ...prev, accentColor: '' }))}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

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
                  {item.templeStatusMode && item.templeStatusMode !== 'auto' ? (
                    <span className="badge-muted">Status: {statusModeLabel(item.templeStatusMode)}</span>
                  ) : null}
                </div>
              </div>
              {item.note ? <p className="special-card-note">{item.note}</p> : null}
              {item.accentColor ? (
                <p className="special-card-meta">
                  Accent:
                  <span
                    className="special-card-color"
                    style={{ background: item.accentColor }}
                    aria-hidden="true"
                  />
                  {item.accentColor}
                </p>
              ) : null}
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
