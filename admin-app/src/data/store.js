import api from '../api/axios.js';
import { resolveApiOrigin } from '../lib/apiBase.js';

export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#EFE3C6"/><g fill="none" stroke="#C9B58A" stroke-width="2"><path d="M0 0l400 300M400 0L0 300"/></g><text x="200" y="158" font-family="monospace" font-size="14" fill="#9A8C70" text-anchor="middle">[ photo ]</text></svg>',
  );

const ROUTES = {
  gallery: '/admin/gallery',
  blogs: '/admin/blogs',
  festivals: '/admin/festivals',
  devotionalMusic: '/admin/devotional-music',
  donations: '/admin/donations',
  messages: '/admin/messages',
};

async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const base = resolveApiOrigin();
  return `${base}${data.url}`;
}

export { uploadImage };

export const store = {
  async list(name) {
    if (name === 'timings') return this.get('timings');
    const { data } = await api.get(ROUTES[name]);
    return data;
  },

  async get(name) {
    if (name === 'timings') {
      const { data } = await api.get('/admin/timings');
      return data;
    }
    if (name === 'settings') {
      const { data } = await api.get('/settings');
      return data;
    }
    return this.list(name);
  },

  async set(name, value) {
    if (name === 'timings') {
      const { data } = await api.put('/admin/timings/bulk', value);
      return data;
    }
    if (name === 'settings') {
      const { data } = await api.put('/admin/settings', value);
      return data;
    }
    throw new Error(`store.set not supported for ${name}`);
  },

  async add(name, record, { prepend = true } = {}) {
    if (name === 'gallery') {
      let url = record.url || PLACEHOLDER;
      if (record.file instanceof File) {
        url = await uploadImage(record.file);
      }
      const { data } = await api.post('/admin/gallery', {
        caption: record.caption,
        category: record.category,
        url,
      });
      return prepend ? data : data;
    }

    const body = { ...record };
    const { data } = await api.post(ROUTES[name], body);
    if (name === 'festivals' && !prepend) return data;
    return data;
  },

  async update(name, id, patch) {
    if (name === 'messages' && patch.unread !== undefined) {
      const { data } = await api.patch(`/admin/messages/${id}/read`, { unread: patch.unread });
      return data;
    }

    const { data } = await api.put(`${ROUTES[name]}/${id}`, patch);
    return data;
  },

  async remove(name, id) {
    const { data } = await api.delete(`${ROUTES[name]}/${id}`);
    return data;
  },

  async patch(name, patch) {
    if (name === 'settings') {
      const current = await this.get('settings');
      const { data } = await api.put('/admin/settings', { ...current, ...patch });
      return data;
    }
    return this.set(name, patch);
  },

  async getSummary() {
    const { data } = await api.get('/admin/stats/summary');
    return data;
  },
};
