export const BLOG_CATEGORIES = ['Temple Life', 'Festivals', 'Traditions'];

export function getBlogFilterCategories(posts) {
  const fromPosts = (posts ?? [])
    .map((post) => post.category)
    .filter(Boolean);
  const unique = [...new Set([...BLOG_CATEGORIES, ...fromPosts])];
  return ['All', ...unique];
}
