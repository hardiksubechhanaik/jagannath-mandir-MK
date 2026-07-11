import nodemailer from 'nodemailer';

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

function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.zoho.in';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
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

  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
  const fromName = process.env.MAIL_FROM_NAME || 'Shree Jagannath Mandir';

  const transport = createTransport();
  return transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    replyTo: replyTo || fromEmail,
    subject,
    html,
    text,
  });
}
