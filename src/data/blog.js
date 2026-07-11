import { apiGet, resolveMediaUrl } from '../api/client';
import { plainTextFromRich } from '../lib/richText.js';
import { getBlogFilterCategories } from './blogCategories.js';

function mapApiPost(row, index) {
  const excerpt = plainTextFromRich(row.excerpt ?? row.body ?? '');
  const imageUrl = row.imageUrl ?? row.image ?? '';
  return {
    id: row.id ?? index,
    title: row.title ?? 'Untitled',
    name: row.name ?? row.authorName ?? '',
    instaId: row.instaId ?? '',
    category: row.category ?? 'Temple Life',
    date: row.date ?? row.dateLabel ?? '',
    body: row.body ?? row.excerpt ?? '',
    excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt,
    image: imageUrl ? resolveMediaUrl(imageUrl) : null,
  };
}

/** Loads blog posts saved in the admin panel via /api/blogs. */
export async function getPosts() {
  const rows = await apiGet('/api/blogs');
  if (!Array.isArray(rows)) return [];
  return rows.map(mapApiPost);
}

export function getCategoriesFromPosts(posts) {
  return getBlogFilterCategories(posts);
}
