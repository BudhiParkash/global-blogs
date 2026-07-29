// Thin client for the GlobalsBlog Node/MongoDB API — replaces the direct
// @supabase/supabase-js calls that used to run at build time. PUBLIC_API_URL
// is intentionally a PUBLIC_ var: it's also read directly by client-side
// scripts (comment form, newsletter signup) since it's just a base URL, not a secret.
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) return [];
  return res.json();
}

// params: { category, excludeSlug, authorId, limit, published }
// published defaults to true server-side; pass published: false to include drafts.
export async function getPosts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.excludeSlug) qs.set('excludeSlug', params.excludeSlug);
  if (params.authorId) qs.set('authorId', params.authorId);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.published === false) qs.set('published', 'false');

  const res = await fetch(`${API_URL}/api/posts?${qs.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getPostBySlug(slug) {
  const res = await fetch(`${API_URL}/api/posts/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getAuthorsWithPosts() {
  const res = await fetch(`${API_URL}/api/authors/with-posts`);
  if (!res.ok) return [];
  return res.json();
}
