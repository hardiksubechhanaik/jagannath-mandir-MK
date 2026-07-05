import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import {
  apiGet,
  apiUpload,
  endpoints,
  resolveMediaUrl,
} from '../api/client';
import styles from './RathYatraWall.module.css';
import { layoutWallBoard } from '../lib/rathWallLayout';

const PHOTOS_POLL_MS = 5_000;
const WALL_REFRESH_CHANNEL = 'rath-yatra-wall';

function PolaroidPhoto({ photo }) {
  const rotRad = `${photo.rot * (Math.PI / 180)}rad`;

  return (
    <div
      className={`${styles.photo} ${photo._new ? styles.dropin : ''}`}
      style={{
        left: `${photo.leftPct}%`,
        top: `${photo.topPct}%`,
        zIndex: photo.z,
        transform: photo._new ? undefined : `rotate(${photo.rot}deg)`,
        '--r': rotRad,
      }}
    >
      {photo.style === 'tape' ? (
        <span className={styles.tape} aria-hidden="true" />
      ) : (
        <span className={styles.pin} aria-hidden="true" />
      )}
      <div className={styles.photoCard}>
        <img
          src={resolveMediaUrl(photo.url)}
          alt={photo.caption}
          className={styles.photoImage}
          draggable={false}
        />
        <div className={styles.photoCaption}>{photo.caption}</div>
      </div>
      <div className={styles.photoName}>{photo.name}</div>
    </div>
  );
}

function SankalpNote({ sankalp }) {
  return (
    <div
      className={styles.sankalpNote}
      style={{
        left: `${sankalp.leftPct}%`,
        top: `${sankalp.topPct}%`,
        zIndex: sankalp.z,
        transform: `rotate(${sankalp.rot}deg)`,
      }}
    >
      <span className={styles.tape} aria-hidden="true" />
      <div className={styles.sankalpNoteCard}>
        <span className={styles.sankalpNoteIcon} aria-hidden="true">🙏</span>
        <p className={styles.sankalpNoteText}>{sankalp.text}</p>
      </div>
    </div>
  );
}

function DiyaPin({ diya }) {
  return (
    <div
      className={styles.diyaPin}
      style={{
        left: `${diya.leftPct}%`,
        top: `${diya.topPct}%`,
        zIndex: diya.z,
        transform: `rotate(${diya.rot}deg)`,
        '--flicker-delay': `${(diya.id.charCodeAt(3) % 10) * 0.25}s`,
      }}
    >
      <span className={styles.diyaFlame} aria-hidden="true">🪔</span>
      <span className={styles.diyaName}>{diya.name}</span>
    </div>
  );
}

export default function RathYatraWall() {
  const fileInputRef = useRef(null);
  const knownPhotoIdsRef = useRef(new Set());
  const [photos, setPhotos] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [sankalps, setSankalps] = useState([]);
  const [sankalpCount, setSankalpCount] = useState(0);
  const [diyas, setDiyas] = useState([]);
  const [diyaCount, setDiyaCount] = useState(0);
  const [uploadsOpen, setUploadsOpen] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [composing, setComposing] = useState(false);
  const [composePreview, setComposePreview] = useState(null);
  const [composeFile, setComposeFile] = useState(null);
  const [composeName, setComposeName] = useState('');
  const [composeCaption, setComposeCaption] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const ribbon = useMemo(() => {
    const parts = [];
    if (photoCount > 0) parts.push(`${photoCount} photo${photoCount === 1 ? '' : 's'}`);
    if (sankalpCount > 0) parts.push(`${sankalpCount} sankalp${sankalpCount === 1 ? '' : 's'}`);
    if (diyaCount > 0) parts.push(`${diyaCount} diya${diyaCount === 1 ? '' : 's'}`);
    const statusText = parts.length > 0 ? `${parts.join(' · ')} pinned live` : 'Wall is ready';

    return {
      statusDot: '#1F8A5B',
      statusGlow: 'rgba(31,138,91,0.35)',
      statusText,
      nextText: '16 JULY 2026 · ରଥଯାତ୍ରା',
      pulse: parts.length > 0,
    };
  }, [photoCount, sankalpCount, diyaCount]);

  const ribbonExtra = (
    <Link to="/memory-wall" className={styles.ribbonWallLink}>
      General Memory Wall →
    </Link>
  );

  const boardLayout = useMemo(
    () => layoutWallBoard({ photos, sankalps, diyas }),
    [photos, sankalps, diyas],
  );

  const fetchWall = useCallback(async () => {
    const errors = [];
    const [photoResult, sankalpResult, diyaResult] = await Promise.allSettled([
      apiGet(endpoints.rathWallPhotos),
      apiGet(endpoints.sankalpsPublic),
      apiGet(endpoints.diyasPublic),
    ]);

    if (photoResult.status === 'fulfilled') {
      const photoData = photoResult.value;
      const incoming = photoData.photos ?? [];
      const hadPhotos = knownPhotoIdsRef.current.size > 0;
      const nextPhotos = incoming.map((photo) => ({
        ...photo,
        _new: hadPhotos && !knownPhotoIdsRef.current.has(photo.id),
      }));
      knownPhotoIdsRef.current = new Set(incoming.map((photo) => photo.id));
      setPhotos(nextPhotos);
      setPhotoCount(photoData.count ?? incoming.length);
      setUploadsOpen(photoData.uploadsOpen !== false);
    } else {
      errors.push(photoResult.reason?.message ?? 'Could not load photos');
    }

    if (sankalpResult.status === 'fulfilled') {
      const sankalpData = sankalpResult.value;
      setSankalps(sankalpData.sankalps ?? []);
      setSankalpCount(sankalpData.count ?? (sankalpData.sankalps?.length ?? 0));
    } else {
      errors.push(sankalpResult.reason?.message ?? 'Could not load sankalps');
    }

    if (diyaResult.status === 'fulfilled') {
      const diyaData = diyaResult.value;
      setDiyas(diyaData.diyas ?? []);
      setDiyaCount(diyaData.count ?? (diyaData.diyas?.length ?? 0));
    } else {
      errors.push(diyaResult.reason?.message ?? 'Could not load diyas');
    }

    setLoadError(errors.length === 3 ? errors[0] : '');
  }, []);

  useEffect(() => {
    fetchWall();
    const timer = setInterval(fetchWall, PHOTOS_POLL_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') fetchWall();
    }

    let channel;
    try {
      channel = new BroadcastChannel(WALL_REFRESH_CHANNEL);
      channel.onmessage = () => fetchWall();
    } catch {
      channel = null;
    }

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchWall);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchWall);
      channel?.close();
    };
  }, [fetchWall]);

  useEffect(() => {
    if (!composing) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') cancelCompose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [composing]);

  function handleCameraClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!uploadsOpen) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setComposeFile(file);
    setComposePreview(URL.createObjectURL(file));
    setComposeName('');
    setComposeCaption('');
    setComposing(true);
    window.requestAnimationFrame(() => {
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }

  function cancelCompose() {
    if (composePreview?.startsWith('blob:')) URL.revokeObjectURL(composePreview);
    setComposing(false);
    setComposePreview(null);
    setComposeFile(null);
    setComposeName('');
    setComposeCaption('');
    setSubmitError('');
  }

  async function submitPhoto() {
    if (!composeFile) return;

    setSubmitLoading(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('image', composeFile);
      formData.append('name', composeName.trim() || 'Devotee');
      formData.append('caption', composeCaption.trim() || 'A moment from the yatra.');

      await apiUpload(endpoints.rathWallSubmit, formData);
      cancelCompose();
      await fetchWall();
      setSubmitMessage('Photo submitted! A volunteer will review it before it appears on the wall.');
      setTimeout(() => setSubmitMessage(''), 8000);
    } catch (err) {
      setSubmitError(err.message ?? 'Upload failed');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <PageShell className={styles.page} ribbon={ribbon} ribbonExtra={ribbonExtra}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroOdia}>ରଥଯାତ୍ରା ସ୍ମୃତି ପ୍ରାଚୀର</p>
          <h1 className={styles.heroTitle}>The Ratha Yatra Wall</h1>
          <p className={styles.heroBody}>
            Snap a photo or offer a sankalp from the mela ground.
            Volunteers approve before anything goes live on the board.
          </p>
        </div>
      </section>

      <section className={styles.wallSection} aria-label="Ratha Yatra photo wall">
        <span className={styles.instruction}>
          {!uploadsOpen
            ? 'Uploads are closed — volunteers will open the board during the yatra'
            : 'Tap 📷 to upload photos · sankalps & diyas from the mela appear here once approved'}
        </span>

        {!uploadsOpen ? (
          <p className={styles.closedBanner}>Picture uploads are closed right now.</p>
        ) : null}

        {submitMessage ? <p className={styles.successMsg}>{submitMessage}</p> : null}
        {loadError ? <p className={styles.errorMsg}>{loadError}</p> : null}

        <div className={styles.board}>
          {boardLayout.diyas.map((entry) => (
            <DiyaPin key={entry.id} diya={entry} />
          ))}

          {boardLayout.sankalps.map((entry) => (
            <SankalpNote key={entry.id} sankalp={entry} />
          ))}

          {boardLayout.photos.map((photo) => (
            <PolaroidPhoto key={photo.id} photo={photo} />
          ))}

          <input
            ref={fileInputRef}
            id="wall-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            className={styles.hiddenFileInput}
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
          />

          <button
            type="button"
            className={`${styles.cameraBtn} ${!uploadsOpen ? styles.cameraBtnDisabled : ''}`}
            aria-label={uploadsOpen ? 'Take or upload a photo' : 'Uploads closed'}
            onClick={handleCameraClick}
            disabled={!uploadsOpen}
          >
            <span className={styles.cameraIcon} aria-hidden="true">📷</span>
          </button>
        </div>
      </section>

      {composing ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-title"
          onClick={cancelCompose}
        >
          <div className={`${styles.sheet} ${styles.sheetup}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <img src={composePreview} alt="" className={styles.sheetPreview} />
              <div>
                <h2 id="compose-title" className={styles.sheetTitle}>Submit to the wall</h2>
                <p className={styles.sheetHint}>
                  A volunteer will review this before it goes live.
                </p>
              </div>
            </div>
            <label htmlFor="wall-compose-name" className="visually-hidden">Your name</label>
            <input
              id="wall-compose-name"
              type="text"
              className={styles.input}
              placeholder="Your name"
              value={composeName}
              onChange={(e) => setComposeName(e.target.value)}
            />
            <label htmlFor="wall-compose-caption" className="visually-hidden">Caption</label>
            <input
              id="wall-compose-caption"
              type="text"
              className={styles.input}
              placeholder="A short caption…"
              value={composeCaption}
              onChange={(e) => setComposeCaption(e.target.value)}
            />
            {submitError ? <p className={styles.errorMsg}>{submitError}</p> : null}
            <div className={styles.sheetActions}>
              <button type="button" className={styles.btnCancel} onClick={cancelCompose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPin}
                onClick={submitPhoto}
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting…' : '📌 Submit for review'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
