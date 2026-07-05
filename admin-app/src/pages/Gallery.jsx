import { useEffect, useState } from 'react';
import { store, PLACEHOLDER } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    store.list('gallery').then(setPhotos);
  }, []);

  async function add() {
    setError('');
    try {
      const next = await store.add('gallery', {
        caption: caption.trim() || 'Untitled',
        category: category.trim() || 'General',
        url: url.trim() || PLACEHOLDER,
        file,
      });
      setPhotos(next);
      setCaption(''); setCategory(''); setUrl(''); setFile(null);
    } catch (err) {
      setError(err.message || 'Could not add photo. Try a smaller image or paste a URL.');
    }
  }

  async function remove(id) {
    setPhotos(await store.remove('gallery', id));
  }

  return (
    <>
      <PageHead
        eyebrow="Darshan Gallery · ଦର୍ଶନ"
        title="Gallery"
        right={<div className="count-note">{photos.length} photos</div>}
      />
      <p className="page-sub">Add darshan and festival photos shown on the public gallery. Paste an image URL.</p>

      <div className="card card--gold" style={{ marginBottom: 30 }}>
        <div className="card-title">Add a photo</div>
        <div className="grid-2 mb14">
          <div>
            <label className="field-label">Caption</label>
            <input className="input" placeholder="e.g. Mangala Arati" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Category</label>
            <input className="input" placeholder="e.g. Festival" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>
        <label className="field-label">Image URL</label>
        <div className="row-inline mb14">
          <input className="input flex1" placeholder="https://… or leave blank for placeholder" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <label className="field-label">Or upload a file</label>
        <div className="row-inline">
          <input
            className="input flex1"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={add}>+ Add Photo</button>
        </div>
        {error && <div className="login-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="gal-grid">
        {photos.map((p) => (
          <div className="gal-card" key={p.id}>
            <div className="gal-imgwrap">
              <img className="gal-img" src={p.url} alt={p.caption} />
              <button className="gal-remove" title="Remove" onClick={() => remove(p.id)}>✕</button>
            </div>
            <div className="gal-body">
              <div className="gal-caption">{p.caption}</div>
              <div className="gal-cat">{p.category}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
