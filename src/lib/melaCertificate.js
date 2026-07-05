const TEMPLATE_URL = '/mela-certificate-template.png';
const WIDTH = 1024;
const HEIGHT = 819;
export const CERT_NAME_Y_RATIO = 0.518;
const MAX_NAME_WIDTH_RATIO = 0.72;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadCertificateFont(size) {
  try {
    await document.fonts.load(`700 ${size}px Coiny`);
  } catch {
    await document.fonts.load(`700 ${size}px Mukta`);
  }
}

function fitNameFont(ctx, name, maxWidth) {
  let fontSize = 28;
  while (fontSize >= 16) {
    ctx.font = `700 ${fontSize}px Coiny, Mukta, sans-serif`;
    if (ctx.measureText(name).width <= maxWidth) return fontSize;
    fontSize -= 2;
  }
  return 16;
}

export async function renderCertificatePng(name) {
  const img = await loadImage(TEMPLATE_URL);
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

  const maxWidth = WIDTH * MAX_NAME_WIDTH_RATIO;
  const fontSize = fitNameFont(ctx, name, maxWidth);
  await loadCertificateFont(fontSize);

  ctx.font = `700 ${fontSize}px Coiny, Mukta, sans-serif`;
  ctx.fillStyle = '#5d34a4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(name, WIDTH / 2, HEIGHT * CERT_NAME_Y_RATIO);

  return canvas.toDataURL('image/png');
}

export function downloadCertificate(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function certificateFilename(name) {
  const slug = name.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'devotee';
  return `${slug}-rath-yatra-mela-certificate.png`;
}
