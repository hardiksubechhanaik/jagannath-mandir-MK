/** In-memory picture board settings (volunteer-controlled). */
let uploadsOpen = true;

export function getWallSettings() {
  return { uploadsOpen };
}

export function setUploadsOpen(open) {
  uploadsOpen = Boolean(open);
  return getWallSettings();
}

export function assertUploadsOpen() {
  if (!uploadsOpen) {
    const err = new Error('Photo uploads are currently closed. Please check back during the yatra.');
    err.status = 403;
    throw err;
  }
}
