import { useEffect, useMemo, useState } from 'react';
import { store } from '../data/store.js';
import { resolvePreviewUrl } from '../lib/mediaUrl.js';
import PageHead from '../components/PageHead.jsx';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function normalizeMonth(value) {
  if (!value) return '';
  const key = String(value).trim().slice(0, 3).toLowerCase();
  return MONTHS.find((m) => m.toLowerCase() === key) || '';
}

function panjikaYearForMonth(month) {
  const index = MONTHS.indexOf(month);
  if (index < 0) return 2026;
  if (index >= 5) return 2026;
  if (index <= 3) return 2027;
  return 2026;
}

function daysInMonth(month) {
  const index = MONTHS.indexOf(month);
  if (index < 0) return 31;
  const year = panjikaYearForMonth(month);
  return new Date(year, index + 1, 0).getDate();
}

function festivalId(festival) {
  return festival.id || festival._id || null;
}

const DEFAULT_DAY = '16';
const DEFAULT_MONTH = 'Jul';

export default function Festivals() {
  const [festivals, setFestivals] = useState([]);
  const [editId, setEditId] = useState(null);
  const [day, setDay] = useState(DEFAULT_DAY);
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [error, setError] = useState('');

  const editing = editId !== null;
  const previewImage = filePreview || resolvePreviewUrl(imageUrl);
  const dayOptions = useMemo(() => {
    const maxDay = daysInMonth(month);
    return Array.from({ length: maxDay }, (_, i) => String(i + 1));
  }, [month]);

  useEffect(() => {
    store.list('festivals').then(setFestivals);
  }, []);

  useEffect(() => {
    if (!file) {
      setFilePreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const maxDay = daysInMonth(month);
    if (Number(day) > maxDay) {
      setDay(String(maxDay));
    }
  }, [day, month]);

  function resetForm() {
    setEditId(null);
    setDay(DEFAULT_DAY);
    setMonth(DEFAULT_MONTH);
    setName('');
    setDesc('');
    setImageUrl('');
    setFile(null);
    setError('');
  }

  async function save() {
    if (!name.trim() || !day || !month) return;
    setError('');
    try {
      const rec = {
        day: day.trim(),
        month: month.trim(),
        name: name.trim(),
        desc: desc.trim(),
        imageUrl: imageUrl.trim(),
        file,
      };
      const next = editing
        ? await store.update('festivals', editId, rec)
        : await store.add('festivals', rec, { prepend: false });
      setFestivals(next);
      resetForm();
    } catch (err) {
      setError(err.message || 'Could not save event. Try a smaller image or paste a URL.');
    }
  }

  function startEdit(festival) {
    const id = festivalId(festival);
    if (!id) return;
    setEditId(id);
    setDay(String(festival.day || DEFAULT_DAY));
    setMonth(normalizeMonth(festival.month) || DEFAULT_MONTH);
    setName(festival.name || '');
    setDesc(festival.desc || festival.description || '');
    setImageUrl(festival.imageUrl || festival.image || '');
    setFile(null);
    setError('');
  }

  async function remove(id) {
    setFestivals(await store.remove('festivals', id));
    if (editId === id) resetForm();
  }

  function renderEventFields({ idPrefix = 'fest' } = {}) {
    return (
      <>
        <div className="grid-2 mb14">
          <div>
            <label className="field-label" htmlFor={`${idPrefix}-day`}>Day</label>
            <select
              id={`${idPrefix}-day`}
              className="input"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              {dayOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor={`${idPrefix}-month`}>Month</label>
            <select
              id={`${idPrefix}-month`}
              className="input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="field-label" htmlFor={`${idPrefix}-name`}>Festival name</label>
        <input
          id={`${idPrefix}-name`}
          className="input mb14"
          placeholder="Ratha Yatra"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="field-label" htmlFor={`${idPrefix}-desc`}>Description</label>
        <textarea
          id={`${idPrefix}-desc`}
          className="textarea"
          rows={3}
          placeholder="Short description…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <label className="field-label" htmlFor={`${idPrefix}-image-url`}>
          Image URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id={`${idPrefix}-image-url`}
          className="input mb14"
          placeholder="https://… or leave blank"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <label className="field-label" htmlFor={`${idPrefix}-image-file`}>
          Or upload image <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id={`${idPrefix}-image-file`}
          className="input mb14"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {previewImage && (
          <div className="mb14">
            <img
              src={previewImage}
              alt=""
              style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #dccba0' }}
            />
          </div>
        )}
        {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Utsav · ଉତ୍ସବ"
        title="Festivals & Events"
        right={<div className="count-note">{festivals.length} events</div>}
      />
      <p className="page-sub">Manage the festival calendar shown on the site. Click Edit on any event to change it inline.</p>

      <div className="editor-2col editor-2col--fest">
        <div className="card card--gold sticky-top">
          <div className="card-title">Add event</div>
          {renderEventFields({ idPrefix: 'fest-new' })}
          <div className="row-inline">
            <button type="button" className="btn btn-primary flex1" onClick={save} disabled={editing}>
              Add event
            </button>
          </div>
          {editing && (
            <p className="fest-add-note">Finish editing the selected event below, or cancel to add a new one.</p>
          )}
        </div>

        <div className="stack">
          {festivals.map((f) => {
            const id = festivalId(f);
            const isEditing = editing && editId === id;

            if (isEditing) {
              return (
                <div className="fest-row fest-row--editing" key={id}>
                  <div className="fest-edit-title">Edit event</div>
                  {renderEventFields({ idPrefix: `fest-edit-${id}` })}
                  <div className="row-inline">
                    <button type="button" className="btn btn-primary flex1" onClick={save}>
                      Save changes
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="fest-row" key={id || `${f.day}-${f.month}-${f.name}`}>
                <div className="fest-date">
                  {(f.imageUrl || f.image) ? (
                    <img
                      src={resolvePreviewUrl(f.imageUrl || f.image)}
                      alt=""
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                    />
                  ) : (
                    <>
                      <div className="fest-day">{f.day}</div>
                      <div className="fest-month">{f.month}</div>
                    </>
                  )}
                </div>
                <div>
                  <div className="fest-name">{f.name}</div>
                  <div className="fest-desc">{f.desc || f.description}</div>
                </div>
                <div className="col-actions">
                  <button type="button" className="btn-soft" onClick={() => startEdit(f)}>
                    Edit
                  </button>
                  <button type="button" className="btn-danger" onClick={() => remove(id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
