import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import TempleLogo from '../components/TempleLogo';
import RathGpsPanel from '../components/rath/RathGpsPanel';
import {
  apiGetAuth,
  apiPostAuth,
  endpoints,
  resolveMediaUrl,
} from '../api/client';
import {
  clearVolunteerSession,
  getVolunteerSession,
} from '../lib/rathWallSession';
import { stopGpsSharing } from '../lib/rathGpsTracker';
import {
  dismissLocalDivyangRequest,
  formatAssistTime,
  readLocalDivyangRequests,
  subscribeDivyangAssistUpdates,
} from '../lib/divyangAssist';
import { isVolunteerAuthError, withVolunteerAuth } from '../lib/volunteerAuth';
import CreatorSpotlightPanel from '../components/volunteer/CreatorSpotlightPanel';
import styles from '../styles/rathWallVolunteer.module.css';

const POLL_MS = 5_000;
const WALL_REFRESH_CHANNEL = 'rath-yatra-wall';

function notifyWallRefresh() {
  try {
    const channel = new BroadcastChannel(WALL_REFRESH_CHANNEL);
    channel.postMessage('refresh');
    channel.close();
  } catch {
    // BroadcastChannel not available in very old browsers
  }
}

export default function RathWallVolunteer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'gps'
    ? 'gps'
    : searchParams.get('tab') === 'divyang'
      ? 'divyang'
      : searchParams.get('tab') === 'creators'
        ? 'creators'
        : searchParams.get('tab') === 'sankalp'
          ? 'sankalp'
          : searchParams.get('tab') === 'diya'
            ? 'diya'
            : 'pictures';

  const [token, setToken] = useState(() => getVolunteerSession());
  const [pending, setPending] = useState([]);
  const [pendingSankalps, setPendingSankalps] = useState([]);
  const [sankalpApprovedCount, setSankalpApprovedCount] = useState(0);
  const [sankalpMax, setSankalpMax] = useState(30);
  const [pendingDiyas, setPendingDiyas] = useState([]);
  const [diyaApprovedCount, setDiyaApprovedCount] = useState(0);
  const [diyaMax, setDiyaMax] = useState(50);
  const [divyangRequests, setDivyangRequests] = useState([]);
  const [assistToasts, setAssistToasts] = useState([]);
  const [uploadsOpen, setUploadsOpen] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);
  const [maxPhotos, setMaxPhotos] = useState(20);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [clearWallLoading, setClearWallLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [divyangFetchError, setDivyangFetchError] = useState('');
  const seenDivyangRef = useRef(new Set());
  const divyangInitializedRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    const activeToken = getVolunteerSession();
    if (!activeToken) return;

    try {
      const [settingsData, pendingData] = await Promise.all([
        apiGetAuth(endpoints.rathWallVolunteerSettings, activeToken),
        apiGetAuth(endpoints.rathWallVolunteerPending, activeToken),
      ]);
      setUploadsOpen(settingsData.uploadsOpen);
      setApprovedCount(settingsData.approvedCount ?? 0);
      setMaxPhotos(settingsData.maxPhotos ?? 20);
      setPending(pendingData.photos ?? []);
      setError('');
    } catch (err) {
      setError(err.message ?? 'Failed to load volunteer dashboard');
    }
  }, []);

  useEffect(() => {
    if (!token || activeTab !== 'pictures') return undefined;
    fetchDashboard();
    const timer = setInterval(fetchDashboard, POLL_MS);
    return () => clearInterval(timer);
  }, [token, activeTab, fetchDashboard]);

  const fetchSankalps = useCallback(async () => {
    const activeToken = getVolunteerSession();
    if (!activeToken) return;

    try {
      const data = await apiGetAuth(endpoints.sankalpVolunteerPending, activeToken);
      setPendingSankalps(data.sankalps ?? []);
      setSankalpApprovedCount(data.approvedCount ?? 0);
      setSankalpMax(data.maxSankalps ?? 30);
      setError('');
    } catch (err) {
      setError(err.message ?? 'Failed to load sankalp queue');
    }
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    fetchSankalps();
    const timer = setInterval(fetchSankalps, POLL_MS);
    return () => clearInterval(timer);
  }, [token, fetchSankalps]);

  const fetchDiyas = useCallback(async () => {
    const activeToken = getVolunteerSession();
    if (!activeToken) return;

    try {
      const data = await apiGetAuth(endpoints.diyaVolunteerPending, activeToken);
      setPendingDiyas(data.diyas ?? []);
      setDiyaApprovedCount(data.approvedCount ?? 0);
      setDiyaMax(data.maxDiyas ?? 50);
      setError('');
    } catch (err) {
      setError(err.message ?? 'Failed to load diya queue');
    }
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    fetchDiyas();
    const timer = setInterval(fetchDiyas, POLL_MS);
    return () => clearInterval(timer);
  }, [token, fetchDiyas]);

  const mergeDivyangRequests = useCallback((remoteRequests = []) => {
    const localRequests = readLocalDivyangRequests();
    const merged = [...remoteRequests];
    localRequests.forEach((entry) => {
      if (!merged.some((item) => item.id === entry.id)) merged.push(entry);
    });
    return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, []);

  const registerDivyangAlerts = useCallback((requests) => {
    requests.forEach((request) => {
      if (seenDivyangRef.current.has(request.id)) return;
      const isLiveAlert = divyangInitializedRef.current;
      seenDivyangRef.current.add(request.id);
      if (isLiveAlert) {
        setAssistToasts((prev) => [...prev, request].slice(-3));
      }
    });
    divyangInitializedRef.current = true;
  }, []);

  const fetchDivyangRequests = useCallback(async () => {
    let remoteRequests = [];
    try {
      const data = await withVolunteerAuth((activeToken) => (
        apiGetAuth(endpoints.divyangVolunteerRequests, activeToken)
      ));
      remoteRequests = data.requests ?? [];
      setDivyangFetchError('');
    } catch (err) {
      remoteRequests = [];
      if (isVolunteerAuthError(err)) {
        setDivyangFetchError('Session expired — tap Sign out and sign in again.');
      }
    }

    const merged = mergeDivyangRequests(remoteRequests);
    registerDivyangAlerts(merged);
    setDivyangRequests(merged);
  }, [mergeDivyangRequests, registerDivyangAlerts]);

  useEffect(() => {
    if (!token) return undefined;
    fetchDivyangRequests();
    const timer = setInterval(fetchDivyangRequests, POLL_MS);
    const unsubscribe = subscribeDivyangAssistUpdates(fetchDivyangRequests);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [token, fetchDivyangRequests]);

  useEffect(() => {
    if (assistToasts.length === 0) return undefined;
    const timers = assistToasts.map((toast) => setTimeout(() => {
      setAssistToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 9000));
    return () => timers.forEach(clearTimeout);
  }, [assistToasts]);

  function setTab(tab) {
    if (tab === 'gps') {
      setSearchParams({ tab: 'gps' }, { replace: true });
      return;
    }
    if (tab === 'divyang') {
      setSearchParams({ tab: 'divyang' }, { replace: true });
      return;
    }
    if (tab === 'creators') {
      setSearchParams({ tab: 'creators' }, { replace: true });
      return;
    }
    if (tab === 'sankalp') {
      setSearchParams({ tab: 'sankalp' }, { replace: true });
      return;
    }
    if (tab === 'diya') {
      setSearchParams({ tab: 'diya' }, { replace: true });
      return;
    }
    setSearchParams({}, { replace: true });
  }

  async function handleDismissDivyang(id) {
    setActionError('');
    try {
      dismissLocalDivyangRequest(id);
      if (!String(id).startsWith('local-')) {
        await apiPostAuth(endpoints.divyangVolunteerDismiss(id), {}, getVolunteerSession());
      }
      setAssistToasts((prev) => prev.filter((item) => item.id !== id));
      await fetchDivyangRequests();
    } catch (err) {
      setActionError(err.message ?? 'Could not update assistance request');
    }
  }

  function dismissToast(id) {
    setAssistToasts((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleApproveSankalp(id) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.sankalpVolunteerApprove(id), {}, getVolunteerSession());
      notifyWallRefresh();
      await fetchSankalps();
    } catch (err) {
      setActionError(err.message ?? 'Approve failed');
    }
  }

  async function handleRejectSankalp(id) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.sankalpVolunteerReject(id), {}, getVolunteerSession());
      await fetchSankalps();
    } catch (err) {
      setActionError(err.message ?? 'Reject failed');
    }
  }

  async function handleApproveDiya(id) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.diyaVolunteerApprove(id), {}, getVolunteerSession());
      notifyWallRefresh();
      await fetchDiyas();
    } catch (err) {
      setActionError(err.message ?? 'Approve failed');
    }
  }

  async function handleRejectDiya(id) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.diyaVolunteerReject(id), {}, getVolunteerSession());
      await fetchDiyas();
    } catch (err) {
      setActionError(err.message ?? 'Reject failed');
    }
  }

  function handleVolunteerAuthFailure() {
    clearVolunteerSession();
    setToken(null);
    const tab = searchParams.get('tab');
    const loginPath = tab === 'gps'
      ? '/login?redirect=volunteer&tab=gps'
      : tab === 'creators'
        ? '/login?redirect=volunteer&tab=creators'
        : tab === 'divyang'
          ? '/login?redirect=volunteer&tab=divyang'
          : tab === 'sankalp'
            ? '/login?redirect=volunteer&tab=sankalp'
            : tab === 'diya'
              ? '/login?redirect=volunteer&tab=diya'
              : '/login?redirect=volunteer';
    navigate(loginPath, { replace: true });
  }

  function handleLogout() {
    stopGpsSharing();
    clearVolunteerSession();
    setToken(null);
    setPending([]);
    navigate('/login?redirect=volunteer', { replace: true });
  }

  if (!token) {
    const loginPath = activeTab === 'gps'
      ? '/login?redirect=volunteer&tab=gps'
      : activeTab === 'creators'
        ? '/login?redirect=volunteer&tab=creators'
        : activeTab === 'divyang'
          ? '/login?redirect=volunteer&tab=divyang'
          : activeTab === 'sankalp'
            ? '/login?redirect=volunteer&tab=sankalp'
            : activeTab === 'diya'
              ? '/login?redirect=volunteer&tab=diya'
              : '/login?redirect=volunteer';
    return <Navigate to={loginPath} replace />;
  }

  async function toggleUploads(open) {
    setSettingsLoading(true);
    setActionError('');
    try {
      const data = await apiPostAuth(
        endpoints.rathWallVolunteerSettings,
        { uploadsOpen: open },
        getVolunteerSession(),
      );
      setUploadsOpen(data.uploadsOpen);
      setApprovedCount(data.approvedCount ?? 0);
      setMaxPhotos(data.maxPhotos ?? 20);
    } catch (err) {
      setActionError(err.message ?? 'Could not update upload setting');
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.rathWallVolunteerApprove(id), {}, getVolunteerSession());
      notifyWallRefresh();
      await fetchDashboard();
    } catch (err) {
      setActionError(err.message ?? 'Approve failed');
    }
  }

  async function handleReject(id, blockPhone = false) {
    setActionError('');
    try {
      await apiPostAuth(endpoints.rathWallVolunteerReject(id), { blockPhone }, getVolunteerSession());
      notifyWallRefresh();
      await fetchDashboard();
    } catch (err) {
      setActionError(err.message ?? 'Reject failed');
    }
  }

  async function handleClearWall() {
    const confirmed = window.confirm(
      'Clear the entire public Ratha Yatra Wall?\n\nThis removes all live photos, sankalps, and diyas. Pending submissions stay in the queue.',
    );
    if (!confirmed) return;

    setClearWallLoading(true);
    setActionError('');
    try {
      await apiPostAuth(endpoints.rathWallVolunteerClearWall, {}, getVolunteerSession());
      notifyWallRefresh();
      await Promise.all([fetchDashboard(), fetchSankalps(), fetchDiyas()]);
    } catch (err) {
      setActionError(err.message ?? 'Could not clear the wall');
    } finally {
      setClearWallLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {assistToasts.length > 0 ? (
        <div className={styles.toastStack} aria-live="polite">
          {assistToasts.map((toast) => (
            <div key={toast.id} className={styles.assistToast}>
              <div className={styles.assistToastBody}>
                <span className={styles.assistToastIcon} aria-hidden="true">♿</span>
                <div>
                  <strong className={styles.assistToastTitle}>Divyang assistance requested</strong>
                  <p className={styles.assistToastPhone}>
                    <a href={`tel:${toast.phone.replace(/\s/g, '')}`}>{toast.phone}</a>
                    {' · '}
                    {formatAssistTime(toast.createdAt)}
                  </p>
                </div>
              </div>
              <div className={styles.assistToastActions}>
                <button
                  type="button"
                  className={styles.assistToastAssistBtn}
                  onClick={() => handleDismissDivyang(toast.id)}
                >
                  Mark assisted
                </button>
                <button
                  type="button"
                  className={styles.assistToastClose}
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <header className={styles.header}>
        <TempleLogo size={36} />
        <div className={styles.headerBrand}>
          <div className={styles.headerTitle}>Ratha Yatra · Volunteer</div>
          <div className={styles.headerSub}>Shree Jagannath Mandir, Maruti Kunj</div>
        </div>
        <button
          type="button"
          className={styles.headerSignOut}
          onClick={handleLogout}
          aria-label="Sign out and return to login"
        >
          Sign out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.tabBar} role="tablist" aria-label="Volunteer tools">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pictures'}
            className={`${styles.tabBtn} ${activeTab === 'pictures' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('pictures')}
          >
            Picture board
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gps'}
            className={`${styles.tabBtn} ${activeTab === 'gps' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('gps')}
          >
            Rath GPS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'divyang'}
            className={`${styles.tabBtn} ${activeTab === 'divyang' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('divyang')}
          >
            Divyang assist
            {divyangRequests.length > 0 ? (
              <span className={styles.tabBadge}>{divyangRequests.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sankalp'}
            className={`${styles.tabBtn} ${activeTab === 'sankalp' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('sankalp')}
          >
            Sankalps
            {pendingSankalps.length > 0 ? (
              <span className={styles.tabBadge}>{pendingSankalps.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'diya'}
            className={`${styles.tabBtn} ${activeTab === 'diya' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('diya')}
          >
            Diyas
            {pendingDiyas.length > 0 ? (
              <span className={styles.tabBadge}>{pendingDiyas.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'creators'}
            className={`${styles.tabBtn} ${activeTab === 'creators' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('creators')}
          >
            Creators
          </button>
        </div>

        {activeTab === 'gps' ? (
          <RathGpsPanel />
        ) : activeTab === 'divyang' ? (
          <>
            {actionError ? <p className={styles.error}>{actionError}</p> : null}
            {divyangFetchError ? <p className={styles.error}>{divyangFetchError}</p> : null}
            <div className={styles.card}>
              <h2 className={styles.controlTitle}>Divyang support requests</h2>
              <p className={styles.controlBody}>
                When a devotee requests assistance from the mela ground, their phone number appears here.
              </p>
              <span className={`${styles.statusPill} ${styles.statusOn}`}>
                {divyangRequests.length} waiting
              </span>
            </div>

            {divyangRequests.length === 0 ? (
              <p className={styles.empty}>No assistance requests right now.</p>
            ) : (
              <div className={styles.assistList}>
                {divyangRequests.map((request) => (
                  <article key={request.id} className={styles.assistItem}>
                    <div className={styles.assistItemMain}>
                      <span className={styles.assistItemIcon} aria-hidden="true">♿</span>
                      <div>
                        <a
                          className={styles.assistItemPhone}
                          href={`tel:${request.phone.replace(/\s/g, '')}`}
                        >
                          {request.phone}
                        </a>
                        <p className={styles.assistItemTime}>
                          Requested at {formatAssistTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.assistDismissBtn}
                      onClick={() => handleDismissDivyang(request.id)}
                    >
                      Mark assisted
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'creators' ? (
          <>
            {actionError ? <p className={styles.error}>{actionError}</p> : null}
            <CreatorSpotlightPanel
              onError={setActionError}
              onAuthFailure={handleVolunteerAuthFailure}
            />
          </>
        ) : activeTab === 'sankalp' ? (
          <>
            <div className={styles.card}>
              <div className={styles.statusLine}>
                <span className={`${styles.statusPill} ${styles.statusOn}`}>
                  {pendingSankalps.length} pending · {sankalpApprovedCount}/{sankalpMax} live on wall
                </span>
              </div>
              <h2 className={styles.controlTitle}>Devotee sankalps</h2>
              <p className={styles.controlBody}>
                Public sankalps from the mela ground appear here for review.
                Approved sankalps show on the Ratha Yatra Wall (max {sankalpMax} at a time).
              </p>
              <Link to="/rath-yatra-wall" className={styles.publicLink}>
                View public Ratha Yatra Wall →
              </Link>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {actionError ? <p className={styles.error}>{actionError}</p> : null}

            <h2 className={styles.sectionTitle}>Sankalps waiting for your approval</h2>

            {pendingSankalps.length === 0 ? (
              <p className={styles.empty}>No sankalps waiting for review.</p>
            ) : (
              <div className={styles.sankalpPendingList}>
                {pendingSankalps.map((entry) => (
                  <article key={entry.id} className={styles.sankalpPendingItem}>
                    <p className={styles.sankalpPendingText}>{entry.text}</p>
                    <p className={styles.sankalpPendingTime}>
                      Submitted {new Date(entry.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className={styles.pendingActions}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApproveSankalp(entry.id)}
                      >
                        ✓ Approve for wall
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={() => handleRejectSankalp(entry.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'diya' ? (
          <>
            <div className={styles.card}>
              <div className={styles.statusLine}>
                <span className={`${styles.statusPill} ${styles.statusOn}`}>
                  {pendingDiyas.length} pending · {diyaApprovedCount}/{diyaMax} live on wall
                </span>
              </div>
              <h2 className={styles.controlTitle}>Light a Diya requests</h2>
              <p className={styles.controlBody}>
                When a devotee lights a diya from the mela ground, their name appears here.
                Approved diyas glow on the Ratha Yatra Wall with their name underneath (max {diyaMax} at a time).
              </p>
              <Link to="/rath-yatra-wall" className={styles.publicLink}>
                View public Ratha Yatra Wall →
              </Link>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {actionError ? <p className={styles.error}>{actionError}</p> : null}

            <h2 className={styles.sectionTitle}>Diyas waiting for your approval</h2>

            {pendingDiyas.length === 0 ? (
              <p className={styles.empty}>No diyas waiting for review.</p>
            ) : (
              <div className={styles.diyaPendingList}>
                {pendingDiyas.map((entry) => (
                  <article key={entry.id} className={styles.diyaPendingItem}>
                    <div className={styles.diyaPendingMain}>
                      <span className={styles.diyaPendingIcon} aria-hidden="true">🪔</span>
                      <div>
                        <p className={styles.diyaPendingName}>{entry.name}</p>
                        <p className={styles.diyaPendingTime}>
                          Submitted {new Date(entry.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={styles.pendingActions}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApproveDiya(entry.id)}
                      >
                        ✓ Approve for wall
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={() => handleRejectDiya(entry.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.statusLine}>
                <span className={`${styles.statusPill} ${styles.statusOn}`}>
                  {pending.length} pending · {approvedCount}/{maxPhotos} live on wall
                </span>
              </div>

              <div className={styles.uploadControl}>
                <div>
                  <h2 className={styles.controlTitle}>Allow devotee uploads</h2>
                  <p className={styles.controlBody}>
                    Turn ON when devotees should submit photos.
                    Turn OFF when the board is closed.
                  </p>
                </div>
                <button
                  type="button"
                  className={uploadsOpen ? styles.toggleOn : styles.toggleOff}
                  onClick={() => toggleUploads(!uploadsOpen)}
                  disabled={settingsLoading}
                  aria-pressed={uploadsOpen}
                >
                  {settingsLoading ? '…' : uploadsOpen ? 'Uploads OPEN' : 'Uploads CLOSED'}
                </button>
              </div>

              <Link to="/rath-yatra-wall" className={styles.publicLink}>
                View public picture board →
              </Link>

              <div className={styles.clearWallControl}>
                <div>
                  <h2 className={styles.controlTitle}>Clear the public wall</h2>
                  <p className={styles.controlBody}>
                    Remove all live photos, sankalps, and diyas from the Ratha Yatra Wall.
                    Pending items waiting for review are kept.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.clearWallBtn}
                  onClick={handleClearWall}
                  disabled={clearWallLoading || (approvedCount === 0 && sankalpApprovedCount === 0 && diyaApprovedCount === 0)}
                >
                  {clearWallLoading ? 'Clearing…' : 'Clear board'}
                </button>
              </div>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {actionError ? <p className={styles.error}>{actionError}</p> : null}

            <h2 className={styles.sectionTitle}>Photos waiting for your approval</h2>

            {pending.length === 0 ? (
              <p className={styles.empty}>No photos waiting for review.</p>
            ) : (
              <div className={styles.pendingList}>
                {pending.map((photo) => (
                  <article key={photo.id} className={styles.pendingItem}>
                    <img
                      src={resolveMediaUrl(photo.url)}
                      alt={photo.caption}
                      className={styles.pendingImage}
                    />
                    <div className={styles.pendingMeta}>
                      <h3 className={styles.pendingName}>{photo.name}</h3>
                      <p className={styles.pendingCaption}>{photo.caption}</p>
                      <div className={styles.pendingActions}>
                        <button
                          type="button"
                          className={styles.approveBtn}
                          onClick={() => handleApprove(photo.id)}
                        >
                          ✓ Approve for wall
                        </button>
                        <button
                          type="button"
                          className={styles.rejectBtn}
                          onClick={() => handleReject(photo.id, false)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
