import { apiGet } from '../api/client';

function mapApiPost(row, index) {
  const excerpt = row.excerpt ?? row.body ?? '';
  return {
    id: row.id ?? index,
    title: row.title ?? 'Untitled',
    category: row.category ?? 'Temple Life',
    date: row.date ?? row.dateLabel ?? '',
    excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt,
    image: row.image ?? row.imageUrl ?? null,
  };
}

/** Loads blog posts saved in the admin panel via /api/blogs. */
export async function getPosts() {
  const rows = await apiGet('/api/blogs');
  if (!Array.isArray(rows)) return [];
  return rows.map(mapApiPost);
}

export function getCategoriesFromPosts(posts) {
  const categories = ['All'];
  posts.forEach((post) => {
    if (post.category && !categories.includes(post.category)) {
      categories.push(post.category);
    }
  });
  return categories;
}
