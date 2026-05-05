import rss from '@astrojs/rss';
import { createClient } from '@supabase/supabase-js';

export async function GET(context) {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return rss({
    title: 'Global Blogs',
    description: 'Latest News in Travel, Auto, and Beauty',
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.published_at),
      description: post.description,
      link: `/${post.slug}/`,
    })),
  });
}