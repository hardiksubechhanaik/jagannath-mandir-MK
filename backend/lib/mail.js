import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 20000);
const DEFAULT_ZOHO_HOSTS = ['smtppro.zoho.in', 'smtp.zoho.in'];

let transport;
let activeSmtpHost;

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getSiteUrl() {
  const raw = process.env.SITE_URL || process.env.CLIENT_URL?.split(',')[0] || 'https://www.shreejagannathmandirmk.in';
  return raw.replace(/\/$/, '');
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

function getConfiguredSmtpHost() {
  return process.env.SMTP_HOST?.trim() || '';
}

function getHostsToTry() {
  const configured = getConfiguredSmtpHost();
  if (configured) return [configured];
  return DEFAULT_ZOHO_HOSTS;
}

function createTransport(host) {
  const smtpHost = host || activeSmtpHost || getConfiguredSmtpHost() || DEFAULT_ZOHO_HOSTS[0];
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
}

function getTransport() {
  if (!transport) {
    transport = createTransport(activeSmtpHost);
  }
  return transport;
}

export function resetMailTransport() {
  if (transport?.close) {
    try {
      transport.close();
    } catch {
      // ignore close errors while resetting
    }
  }
  transport = undefined;
  activeSmtpHost = undefined;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    }),
  ]);
}

function formatSmtpError(err, host) {
  const message = err?.message || 'Unknown SMTP error';
  const hints = [
    'Use a Zoho app password (Security → App Passwords), not your login password.',
    host
      ? `Tried host: ${host}. Custom-domain mail often needs SMTP_HOST=smtppro.zoho.in.`
      : 'Set SMTP_HOST to smtppro.zoho.in for custom-domain Zoho Mail.',
    'Use port 465 (SSL) or port 587 with SMTP_SECURE=false.',
  ];
  return `${message}. ${hints.join(' ')}`;
}

async function verifyHost(host) {
  const candidate = createTransport(host);
  try {
    await withTimeout(candidate.verify(), SMTP_TIMEOUT_MS, `SMTP connection (${host})`);
    activeSmtpHost = host;
    transport = candidate;
    return host;
  } catch (err) {
    if (candidate.close) candidate.close();
    throw err;
  }
}

export async function verifyMailConnection() {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true, dev: true, host: 'dev' };
    }
    throw new Error('Email is not configured on the server. Set SMTP_USER and SMTP_PASS for Zoho Mail.');
  }

  resetMailTransport();
  const hosts = getHostsToTry();
  let lastError;

  for (const host of hosts) {
    try {
      const workingHost = await verifyHost(host);
      return { ok: true, host: workingHost };
    } catch (err) {
      lastError = err;
      console.error(`[mail] SMTP verify failed for ${host}:`, err.message);
    }
  }

  throw new Error(formatSmtpError(lastError, hosts.join(', ')));
}

export function plainTextToHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br />');
}

export function buildBroadcastEmail({ subject, bodyText, unsubscribeUrl }) {
  const siteUrl = getSiteUrl();
  const htmlBody = plainTextToHtml(bodyText);

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 640px; margin: 0 auto; color: #2b2522; line-height: 1.65;">
      <div style="background: #6E1413; color: #F7EFD8; padding: 22px 24px; border-radius: 8px 8px 0 0;">
        <div style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #E7C36A; margin-bottom: 6px;">Shree Jagannath Mandir</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${escapeHtml(subject)}</h1>
      </div>
      <div style="background: #fff; border: 1px solid #E3D6B8; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <div style="font-size: 16px;">${htmlBody}</div>
        <p style="margin: 28px 0 0; font-size: 14px;">
          <a href="${siteUrl}/blog" style="color: #9E2B25; font-weight: 700;">Visit the Temple Journal →</a>
        </p>
      </div>
      <p style="font-size: 11px; color: #7A6E5C; margin-top: 18px; text-align: center;">
        You subscribed to updates from Shree Jagannath Mandir, Maruti Kunj.<br />
        <a href="${unsubscribeUrl}" style="color: #7A6E5C;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `${subject}\n\n${bodyText}\n\nVisit: ${siteUrl}/blog\nUnsubscribe: ${unsubscribeUrl}`;

  return { html, text };
}

export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[mail:dev]', { to, subject });
      return { messageId: 'dev-logged' };
    }
    throw new Error('Email is not configured on the server. Set SMTP_USER and SMTP_PASS for Zoho Mail.');
  }

  if (!activeSmtpHost && !transport) {
    await verifyMailConnection();
  }

  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
  const fromName = process.env.MAIL_FROM_NAME || 'Shree Jagannath Mandir';

  try {
    return await withTimeout(
      getTransport().sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        replyTo: replyTo || fromEmail,
        subject,
        html,
        text,
      }),
      SMTP_TIMEOUT_MS,
      `Sending to ${to}`,
    );
  } catch (err) {
    resetMailTransport();
    throw new Error(formatSmtpError(err, activeSmtpHost || getConfiguredSmtpHost()));
  }
}

export function getActiveSmtpHost() {
  return activeSmtpHost || getConfiguredSmtpHost() || DEFAULT_ZOHO_HOSTS[0];
}
