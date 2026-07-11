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

export function wrapTextareaSelection(textarea, before, after) {
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const value = textarea.value ?? '';
  const selected = value.slice(start, end) || 'text';
  const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  const nextStart = start + before.length;
  const nextEnd = nextStart + selected.length;

  return { value: nextValue, selectionStart: nextStart, selectionEnd: nextEnd };
}

export function insertTextAtSelection(textarea, insertText) {
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const value = textarea.value ?? '';
  const nextValue = `${value.slice(0, start)}${insertText}${value.slice(end)}`;
  const caret = start + insertText.length;

  return { value: nextValue, selectionStart: caret, selectionEnd: caret };
}

function isBoldElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = node.tagName.toLowerCase();
  if (tag === 'b' || tag === 'strong') return true;
  const weight = node.style?.fontWeight;
  return weight === 'bold' || Number(weight) >= 600;
}

function isItalicElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = node.tagName.toLowerCase();
  if (tag === 'i' || tag === 'em') return true;
  const style = node.style?.fontStyle;
  return style === 'italic' || style === 'oblique';
}

function isBlockElement(tag) {
  return ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr'].includes(tag);
}

function serializeRichTextNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\u00a0/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  if (tag === 'br') return '\n';

  const children = [...node.childNodes].map(serializeRichTextNode).join('');
  if (!children && tag !== 'br') return '';

  if (isBoldElement(node)) return `**${children}**`;
  if (isItalicElement(node)) return `*${children}*`;
  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
    return `**${children.trim()}**\n\n`;
  }
  if (isBlockElement(tag)) {
    return `${children}${children.endsWith('\n') ? '' : '\n'}`;
  }

  return children;
}

/** Convert pasted HTML (Word, Docs, web) into our lightweight rich-text markers. */
export function htmlToRichText(html) {
  if (!html || typeof document === 'undefined') return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = serializeRichTextNode(doc.body)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  return text;
}
