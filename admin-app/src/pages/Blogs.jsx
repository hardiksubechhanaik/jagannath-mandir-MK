import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [body, setBody] = useState('');

  const editing = editId !== null;

  useEffect(() => {
    store.list('blogs').then(setBlogs);
  }, []);

  function reset() { setEditId(null); setTitle(''); setDate(''); setBody(''); }

  async function save() {
    if (!title.trim()) return;
    const rec = { title: title.trim(), date: date.trim() || 'Today', body: body.trim() };
    const next = editing
      ? await store.update('blogs', editId, rec)
      : await store.add('blogs', rec);
    setBlogs(next);
    reset();
  }

  function edit(b) { setEditId(b.id); setTitle(b.title); setDate(b.date); setBody(b.body); }

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
          <label className="field-label">Date label</label>
          <input className="input mb14" placeholder="e.g. 12 July 2026" value={date} onChange={(e) => setDate(e.target.value)} />
          <label className="field-label">Content</label>
          <textarea className="textarea" rows={6} placeholder="Write the notice or article…" value={body} onChange={(e) => setBody(e.target.value)} style={{ marginBottom: 16 }} />
          <div className="row-inline">
            <button className="btn btn-primary flex1" onClick={save}>{editing ? 'Update post' : 'Publish post'}</button>
            {editing && <button className="btn btn-ghost" onClick={reset}>Cancel</button>}
          </div>
        </div>

        <div className="stack">
          {blogs.map((b) => (
            <div className="post-card" key={b.id}>
              <div className="post-date">{b.date}</div>
              <div className="post-title">{b.title}</div>
              <div className="post-body">{b.body}</div>
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
