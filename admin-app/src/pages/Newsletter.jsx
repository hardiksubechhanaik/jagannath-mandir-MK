import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHead from '../components/PageHead.jsx';

const TYPES = [
  { value: 'general', label: 'General update' },
  { value: 'blog', label: 'Blog / Temple Journal' },
  { value: 'emergency', label: 'Emergency notice' },
];

function formatWhen(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Newsletter() {
  const [mailStatus, setMailStatus] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [broadcasts, setBroadcasts] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [testingMail, setTestingMail] = useState(false);
  const [smtpError, setSmtpError] = useState('');

  async function loadBroadcasts() {
    const { data } = await api.get('/admin/newsletter/broadcasts');
    setBroadcasts(data || []);
    return data || [];
  }

  async function loadAll() {
    const [statusRes, subsRes, broadcastsRes] = await Promise.all([
      api.get('/admin/newsletter/status'),
      api.get('/admin/newsletter/subscribers'),
      api.get('/admin/newsletter/broadcasts'),
    ]);
    setMailStatus(statusRes.data);
    setSubscribers(subsRes.data.subscribers || []);
    setSubscriberCount(subsRes.data.count || 0);
    setBroadcasts(broadcastsRes.data || []);
  }

  useEffect(() => {
    loadAll().catch((err) => setError(err.message || 'Could not load newsletter data.'));
  }, []);

  async function waitForBroadcast(broadcastId) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(2000);
      const items = await loadBroadcasts();
      const item = items.find((entry) => entry.id === broadcastId);
      if (!item || item.status === 'sending') continue;

      if (item.status === 'sent') {
        return `Sent to ${item.sentCount} of ${item.recipientCount} subscribers.`;
      }
      if (item.status === 'partial') {
        return `Partially sent: ${item.sentCount} delivered, ${item.failedCount} failed. Check SMTP settings on Render.`;
      }
      return `Broadcast failed. Check SMTP_USER, SMTP_PASS, and try SMTP_HOST=smtppro.zoho.in on Render.`;
    }
    return 'Broadcast is still processing. Refresh this page in a minute to see the result.';
  }

  async function insertLatestBlog() {
    setError('');
    try {
      const { data } = await api.get('/admin/newsletter/latest-blog');
      if (!data.available) {
        setError('No blog posts found yet. Publish a post first.');
        return;
      }
      setSubject(data.suggestedSubject || '');
      setBody(data.suggestedBody || '');
      setType('blog');
    } catch (err) {
      setError(err.message || 'Could not load latest blog.');
    }
  }

  async function testSmtp() {
    setError('');
    setSuccess('');
    setSmtpError('');
    setTestingMail(true);
    try {
      const { data } = await api.post('/admin/newsletter/test-mail', {}, { timeout: 90000 });
      setSuccess(data.message || 'Test email sent.');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'SMTP test failed.';
      setSmtpError(message);
      setError(message);
    } finally {
      setTestingMail(false);
    }
  }

  async function sendBroadcast() {
    setError('');
    setSuccess('');
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.');
      return;
    }
    if (!window.confirm(`Send this email to ${subscriberCount} subscriber(s)?`)) return;

    setSending(true);
    try {
      const { data } = await api.post('/admin/newsletter/broadcasts', {
        subject: subject.trim(),
        body: body.trim(),
        type,
      }, { timeout: 35000 });

      const broadcastId = data.broadcast?.id;
      setSuccess(data.message || 'Broadcast started…');
      setSubject('');
      setBody('');
      setType('general');
      await loadBroadcasts();

      if (broadcastId) {
        const result = await waitForBroadcast(broadcastId);
        setSuccess(result);
        await loadAll();
      }
    } catch (err) {
      const message = err.response?.status === 502
        ? 'Server timed out (502). Zoho SMTP is likely misconfigured — try SMTP_HOST=smtppro.zoho.in and a Zoho app password on Render.'
        : (err.message || 'Broadcast failed.');
      setError(message);
      await loadBroadcasts();
    } finally {
      setSending(false);
    }
  }

  async function removeSubscriber(id) {
    if (!window.confirm('Remove this subscriber?')) return;
    setError('');
    try {
      const { data } = await api.delete(`/admin/newsletter/subscribers/${id}`);
      setSubscribers(data.subscribers || []);
      setSubscriberCount(data.count || 0);
    } catch (err) {
      setError(err.message || 'Could not remove subscriber.');
    }
  }

  const latestBroadcast = broadcasts[0] ?? null;

  return (
    <>
      <PageHead
        eyebrow="Sambad · ସମ୍ବାଦ"
        title="Newsletter Broadcast"
        right={<div className="count-note">{subscriberCount} subscribers</div>}
      />
      <p className="page-sub">
        Email everyone who subscribed on the blog page. Delivered via Brevo and reaches Gmail, Yahoo, Outlook, and all other inboxes.
      </p>

      {mailStatus && (
        <div className={`card card--gold mb14 ${mailStatus.configured ? '' : 'login-error'}`} style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ fontSize: 18 }}>Email delivery</div>
          {mailStatus.configured ? (
            <>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: '#5A5043' }}>
                {mailStatus.provider === 'brevo' ? 'Brevo' : 'SMTP'} is configured. Messages will send from{' '}
                <strong>{mailStatus.from || 'your sender address'}</strong>
                {mailStatus.provider === 'brevo'
                  ? ' via the Brevo API.'
                  : <> via <strong>{mailStatus.host}:{mailStatus.port}</strong>.</>}
              </p>
              <button type="button" className="btn btn-soft" onClick={testSmtp} disabled={testingMail || sending}>
                {testingMail ? 'Sending test…' : 'Send test email to mandir inbox'}
              </button>
              {smtpError && (
                <div className="login-error" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                  {smtpError}
                </div>
              )}
              {mailStatus.provider === 'brevo' && (
                <p style={{ margin: '12px 0 0', fontSize: 12, color: '#7A6E5C', lineHeight: 1.5 }}>
                  In Brevo, verify <strong>{mailStatus.from}</strong> under Senders &amp; IP before sending.
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14 }}>
              Email is not configured on the server yet. Set <code>BREVO_API_KEY</code>, <code>MAIL_FROM</code>, and <code>MAIL_FROM_NAME</code> on Render.
            </p>
          )}
        </div>
      )}

      <div className="editor-2col">
        <div className="card card--gold sticky-top">
          <div className="card-title">Compose broadcast</div>
          <label className="field-label">Type</label>
          <select className="input mb14" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <label className="field-label">Subject</label>
          <input className="input mb14" placeholder="Email subject line" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <label className="field-label">Message</label>
          <textarea
            className="textarea mb14"
            rows={10}
            placeholder="Write your notice or blog summary…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="row-inline mb14">
            <button type="button" className="btn btn-soft flex1" onClick={insertLatestBlog}>
              Insert latest blog
            </button>
          </div>
          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ marginBottom: 12, color: '#2f6b2f', fontSize: 14, fontWeight: 600 }}>{success}</div>}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={sendBroadcast}
            disabled={sending || subscriberCount === 0}
          >
            {sending ? 'Sending…' : `Send to ${subscriberCount} subscriber(s)`}
          </button>
        </div>

        <div className="stack">
          <div className="card card--white">
            <div className="card-title" style={{ fontSize: 18 }}>Latest broadcast</div>
            {!latestBroadcast ? (
              <p style={{ margin: 0, color: '#7A6E5C', fontSize: 14 }}>No broadcasts sent yet.</p>
            ) : (
              <div className="fest-row fest-row--editing">
                <div>
                  <div className="post-date">{formatWhen(latestBroadcast.createdAt)} · {latestBroadcast.type}</div>
                  <div className="post-title" style={{ fontSize: 20 }}>{latestBroadcast.subject}</div>
                  <div style={{ fontSize: 13, color: '#7A6E5C', marginTop: 6 }}>
                    {latestBroadcast.sentCount}/{latestBroadcast.recipientCount} delivered · status: {latestBroadcast.status}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card card--white">
            <div className="card-title" style={{ fontSize: 18 }}>Subscribers</div>
            {subscribers.length === 0 ? (
              <p style={{ margin: 0, color: '#7A6E5C', fontSize: 14 }}>No subscribers yet. They appear when visitors subscribe on the blog page.</p>
            ) : (
              subscribers.map((sub) => (
                <div className="fest-row" key={sub.id} style={{ marginBottom: 10, gridTemplateColumns: '1fr auto' }}>
                  <div>
                    <div className="fest-name" style={{ fontSize: 15 }}>{sub.email}</div>
                    <div style={{ fontSize: 12, color: '#9A8C70' }}>Joined {formatWhen(sub.subscribedAt)}</div>
                  </div>
                  <button type="button" className="btn-danger" onClick={() => removeSubscriber(sub.id)}>Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
