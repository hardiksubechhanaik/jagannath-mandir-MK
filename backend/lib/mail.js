import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 20000);
const SMTP_VERIFY_TIMEOUT_MS = Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 12000);

let transport;
let activeProfile;

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

function smtpUser() {
  return process.env.SMTP_USER?.trim() || '';
}

function smtpPass() {
  return process.env.SMTP_PASS?.trim() || '';
}

export function isMailConfigured() {
  return Boolean(smtpUser() && smtpPass());
}

function getConfiguredSmtpHost() {
  return process.env.SMTP_HOST?.trim() || '';
}

function getConfiguredPort() {
  const raw = process.env.SMTP_PORT?.trim();
  return raw ? Number(raw) : null;
}

function getProfilesToTry() {
  const configuredHost = getConfiguredSmtpHost();
  const configuredPort = getConfiguredPort();
  const profiles = [];
  const seen = new Set();

  function add(host, port, secure) {
    const key = `${host}:${port}`;
    if (!host || seen.has(key)) return;
    seen.add(key);
    profiles.push({ host, port, secure });
  }

  if (configuredHost) {
    if (configuredPort) {
      add(configuredHost, configuredPort, configuredPort === 465);
    } else {
      add(configuredHost, 465, true);
      add(configuredHost, 587, false);
    }
  }

  const fallbackHosts = configuredHost
    ? ['smtppro.zoho.in', 'smtp.zoho.in'].filter((host) => host !== configuredHost)
    : ['smtppro.zoho.in', 'smtp.zoho.in'];

  for (const host of fallbackHosts) {
    add(host, 465, true);
    add(host, 587, false);
  }

  return profiles;
}

function createTransport(profile) {
  return nodemailer.createTransport({
    host: profile.host,
    port: profile.port,
    secure: profile.secure,
    requireTLS: !profile.secure,
    auth: {
      user: smtpUser(),
      pass: smtpPass(),
    },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    tls: {
      minVersion: 'TLSv1.2',
      servername: profile.host,
    },
  });
}

function getTransport() {
  if (!transport || !activeProfile) {
    throw new Error('SMTP is not connected yet.');
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
  activeProfile = undefined;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    }),
  ]);
}

function formatSmtpError(err, attempts = []) {
  const message = err?.message || 'Unknown SMTP error';
  const tried = attempts.length
    ? `Tried: ${attempts.join('; ')}. `
    : '';
  return `${message}. ${tried}Use a Zoho app password (accounts.zoho.com → Security → App Passwords). Free Zoho plans usually need smtp.zoho.in; paid custom-domain plans need smtppro.zoho.in. Enable IMAP/SMTP access in Zoho Mail settings.`;
}

async function verifyProfile(profile) {
  const candidate = createTransport(profile);
  try {
    await withTimeout(
      candidate.verify(),
      SMTP_VERIFY_TIMEOUT_MS,
      `SMTP ${profile.host}:${profile.port}`,
    );
    activeProfile = profile;
    transport = candidate;
    return profile;
  } catch (err) {
    if (candidate.close) candidate.close();
    throw err;
  }
}

export async function verifyMailConnection() {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true, dev: true, profile: 'dev' };
    }
    throw new Error('Email is not configured on the server. Set SMTP_USER and SMTP_PASS for Zoho Mail.');
  }

  resetMailTransport();
  const profiles = getProfilesToTry();
  const attempts = [];
  let lastError;

  for (const profile of profiles) {
    const label = `${profile.host}:${profile.port}`;
    try {
      const working = await verifyProfile(profile);
      console.log(`[mail] SMTP connected via ${label}`);
      return { ok: true, profile: working };
    } catch (err) {
      lastError = err;
      attempts.push(`${label} (${err.message})`);
      console.error(`[mail] SMTP verify failed for ${label}:`, err.message);
    }
  }

  throw new Error(formatSmtpError(lastError, attempts));
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

  if (!activeProfile || !transport) {
    await verifyMailConnection();
  }

  const fromEmail = process.env.MAIL_FROM?.trim() || smtpUser();
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
    throw new Error(formatSmtpError(err, activeProfile ? [`${activeProfile.host}:${activeProfile.port}`] : []));
  }
}

export function getActiveSmtpHost() {
  if (activeProfile) return `${activeProfile.host}:${activeProfile.port}`;
  const host = getConfiguredSmtpHost() || 'smtppro.zoho.in';
  const port = getConfiguredPort() || 465;
  return `${host}:${port}`;
}
