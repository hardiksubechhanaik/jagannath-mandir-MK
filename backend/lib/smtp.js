import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 20000);
const SMTP_VERIFY_TIMEOUT_MS = Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 12000);

let transport;
let activeProfile;

function smtpUser() {
  return process.env.SMTP_USER?.trim() || '';
}

function smtpPass() {
  return process.env.SMTP_PASS?.trim() || '';
}

export function isSmtpConfigured() {
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
  const tried = attempts.length ? `Tried: ${attempts.join('; ')}. ` : '';
  return `${message}. ${tried}Use a Zoho app password or switch to Brevo with BREVO_API_KEY.`;
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
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured.');
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

export async function sendSmtpMail({ to, subject, html, text, replyTo, senderEmail, senderName }) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured.');
  }

  if (!activeProfile || !transport) {
    await verifyMailConnection();
  }

  try {
    return await withTimeout(
      getTransport().sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        replyTo,
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
