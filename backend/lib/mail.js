import * as brevo from './brevo.js';
import * as smtp from './smtp.js';

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

export function getMailProvider() {
  if (brevo.isBrevoConfigured()) return 'brevo';
  if (smtp.isSmtpConfigured()) return 'smtp';
  return null;
}

export function isMailConfigured() {
  return getMailProvider() !== null;
}

export function getSenderEmail() {
  return process.env.MAIL_FROM?.trim()
    || process.env.SMTP_USER?.trim()
    || 'office@shreejagannathmandirmk.in';
}

export function getSenderName() {
  return process.env.MAIL_FROM_NAME?.trim() || 'Shree Jagannath Mandir';
}

export function getMailStatus() {
  const provider = getMailProvider();
  return {
    configured: Boolean(provider),
    provider,
    from: getSenderEmail(),
    host: provider === 'brevo' ? 'api.brevo.com' : (process.env.SMTP_HOST || 'smtppro.zoho.in'),
    port: provider === 'brevo' ? 443 : Number(process.env.SMTP_PORT || 465),
  };
}

export async function verifyMailConnection() {
  if (brevo.isBrevoConfigured()) {
    return brevo.verifyBrevoConnection();
  }
  if (smtp.isSmtpConfigured()) {
    return smtp.verifyMailConnection();
  }
  if (process.env.NODE_ENV !== 'production') {
    return { ok: true, dev: true };
  }
  throw new Error('Email is not configured. Set BREVO_API_KEY on Render.');
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
  const senderEmail = getSenderEmail();
  const senderName = getSenderName();
  const replyToEmail = replyTo || senderEmail;

  if (brevo.isBrevoConfigured()) {
    return brevo.sendBrevoMail({
      to,
      subject,
      html,
      text,
      replyTo: replyToEmail,
      senderEmail,
      senderName,
    });
  }

  if (smtp.isSmtpConfigured()) {
    return smtp.sendSmtpMail({
      to,
      subject,
      html,
      text,
      replyTo: replyToEmail,
      senderEmail,
      senderName,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[mail:dev]', { to, subject, provider: 'dev' });
    return { messageId: 'dev-logged' };
  }

  throw new Error('Email is not configured. Set BREVO_API_KEY on Render.');
}

export function getActiveMailLabel() {
  const provider = getMailProvider();
  if (provider === 'brevo') return 'Brevo API';
  if (provider === 'smtp') return smtp.getActiveSmtpHost();
  return 'not configured';
}
