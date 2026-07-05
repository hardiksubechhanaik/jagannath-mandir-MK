const DEFAULT_OFFSET = 88;

/** Scroll to a hash target, accounting for the sticky site header. */
export function scrollToHash(hash, { offset = DEFAULT_OFFSET, behavior = 'smooth' } = {}) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) return false;

  const el = document.getElementById(id);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export { DEFAULT_OFFSET as HASH_SCROLL_OFFSET };
