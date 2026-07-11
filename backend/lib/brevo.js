const BREVO_API = 'https://api.brevo.com/v3';

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

function brevoApiKey() {
  return process.env.BREVO_API_KEY?.trim() || '';
}

async function parseBrevoError(res) {
  let message = `Brevo API error (${res.status})`;
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
    else if (body?.error) message = body.error;
    else if (typeof body === 'string') message = body;
  } catch {
    // keep default message
  }
  return message;
}

async function brevoRequest(path, options = {}) {
  const res = await fetch(`${BREVO_API}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': brevoApiKey(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await parseBrevoError(res));
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function verifyBrevoConnection() {
  if (!isBrevoConfigured()) {
    throw new Error('BREVO_API_KEY is not set on the server.');
  }

  try {
    await brevoRequest('/account');
    return { ok: true };
  } catch (err) {
    throw new Error(
      `${err.message}. Check BREVO_API_KEY on Render and verify your sender email in the Brevo dashboard.`,
    );
  }
}

export async function sendBrevoMail({
  to,
  subject,
  html,
  text,
  replyTo,
  senderEmail,
  senderName,
}) {
  if (!isBrevoConfigured()) {
    throw new Error('BREVO_API_KEY is not set on the server.');
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  try {
    return await brevoRequest('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(
      `${err.message} Verify ${senderEmail} is added and confirmed under Brevo → Senders & IP.`,
    );
  }
}
