import rss from '@astrojs/rss';
import { createClient } from '@supabase/supabase-js';

export async function GET(context) {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );

  // 1. Fetch posts along with the category name
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return rss({
    title: 'GlobalsBlog',
    description: 'Latest News in Travel, Auto, and Beauty',
    site: context.site,
    items: (posts || []).map((post) => {
      // 2. Extract the category slug (handle array or single object)
      const categoryData = Array.isArray(post.categories) ? post.categories : post.categories;
      const categorySlug = categoryData?.name?.toLowerCase().replace(/\s+/g, '-') || 'blog';

      // 3. Build the path string and strictly strip any trailing slashes
      const cleanPath = `/${categorySlug}/${post.slug}`.replace(/\/$/, "");

      return {
        title: post.title,
        pubDate: new Date(post.published_at),
        description: post.excerpt || post.description, 
        // 4. Pass the clean, non-trailing slash path
        link: cleanPath,
        // 5. Add category to the RSS item metadata
        categories: [categoryData?.name || 'General'],
      };
    }),
  });
}