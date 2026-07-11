function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip **bold** and *italic* markers for plain-text previews. */
export function plainTextFromRich(text) {
  return String(text ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');
}

/** Render lightweight blog formatting (**bold**, *italic*). Line breaks/spaces use CSS pre-wrap. */
export function formatRichText(text) {
  const escaped = escapeHtml(text ?? '');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}
