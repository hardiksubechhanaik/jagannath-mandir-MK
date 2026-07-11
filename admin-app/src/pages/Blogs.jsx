import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import { BLOG_CATEGORIES } from '../data/blogCategories.js';
import { resolvePreviewUrl } from '../lib/mediaUrl.js';
import FormatTextarea from '../components/FormatTextarea.jsx';
import RichTextContent from '../components/RichTextContent.jsx';
import PageHead from '../components/PageHead.jsx';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [instaId, setInstaId] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Temple Life');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [error, setError] = useState('');

  const editing = editId !== null;
  const previewImage = filePreview || resolvePreviewUrl(imageUrl);

  useEffect(() => {
    store.list('blogs').then(setBlogs);
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

  function reset() {
    setEditId(null);
    setTitle('');
    setName('');
    setInstaId('');
    setDate('');
    setCategory('Temple Life');
    setBody('');
    setImageUrl('');
    setFile(null);
    setError('');
  }

  async function save() {
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      const rec = {
        title: title.trim(),
        name: name.trim(),
        instaId: instaId.trim(),
        date: date.trim() || 'Today',
        category,
        body,
        imageUrl: imageUrl.trim(),
        file,
      };
      const next = editing
        ? await store.update('blogs', editId, rec)
        : await store.add('blogs', rec);
      setBlogs(next);
      reset();
    } catch (err) {
      setError(err.message || 'Could not save post. Please try again.');
    }
  }

  function edit(b) {
    setEditId(b.id);
    setTitle(b.title);
    setName(b.name || '');
    setInstaId(b.instaId || '');
    setDate(b.date);
    setCategory(b.category || 'Temple Life');
    setBody(b.body || '');
    setImageUrl(b.imageUrl || b.image || '');
    setFile(null);
    setError('');
  }

  async function remove(id) {
    setBlogs(await store.remove('blogs', id));
    if (editId === id) reset();
  }

  return (
    <>
      <PageHead
        eyebrow="Sambad · ସମ୍ବାଦ"
        title="Blog Posts"
        right={<div className="count-note">{blogs.length} posts</div>}
      />
      <p className="page-sub">Write and edit the news &amp; notices that appear on the main page.</p>

      <div className="editor-2col">
        <div className="card card--gold sticky-top">
          <div className="card-title">{editing ? 'Edit post' : 'New post'}</div>
          <label className="field-label">Title</label>
          <input className="input mb14" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="field-label">Name</label>
          <input className="input mb14" placeholder="Author or contributor name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="field-label">Instagram ID <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input className="input mb14" placeholder="e.g. @username" value={instaId} onChange={(e) => setInstaId(e.target.value)} />
          <label className="field-label">Date label</label>
          <input className="input mb14" placeholder="e.g. 12 July 2026" value={date} onChange={(e) => setDate(e.target.value)} />
          <label className="field-label">Category</label>
          <select className="input mb14" value={category} onChange={(e) => setCategory(e.target.value)}>
            {BLOG_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label className="field-label">Content</label>
          <FormatTextarea
            value={body}
            onChange={setBody}
            rows={8}
            placeholder="Write the notice or article… Select text, then use Bold or Italic."
            style={{ marginBottom: 16 }}
          />
          <label className="field-label">Image URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input className="input mb14" placeholder="https://… or leave blank" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <label className="field-label">Or upload image <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input
            className="input mb14"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {previewImage && (
            <div className="mb14">
              <img src={previewImage} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #dccba0' }} />
            </div>
          )}
          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="row-inline">
            <button className="btn btn-primary flex1" onClick={save}>{editing ? 'Update post' : 'Publish post'}</button>
            {editing && <button className="btn btn-ghost" onClick={reset}>Cancel</button>}
          </div>
        </div>

        <div className="stack">
          {blogs.map((b) => (
            <div className="post-card" key={b.id}>
              {(b.imageUrl || b.image) && (
                <img
                  src={resolvePreviewUrl(b.imageUrl || b.image)}
                  alt=""
                  style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              )}
              <div className="post-date">{b.date}</div>
              <div className="post-title">{b.title}</div>
              {b.category && <div style={{ fontSize: 12, color: '#9E2B25', marginBottom: 6, fontFamily: 'var(--mono)' }}>{b.category}</div>}
              {b.name && <div style={{ fontSize: 13, color: '#7a6f5f', marginBottom: 6 }}>By {b.name}{b.instaId ? ` · ${b.instaId}` : ''}</div>}
              <RichTextContent text={b.body} className="post-body" />
              <div className="row-actions">
                <button className="btn-soft" onClick={() => edit(b)}>Edit</button>
                <button className="btn-danger" onClick={() => remove(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
