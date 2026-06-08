import rss from '@astrojs/rss';
import { createClient } from '@supabase/supabase-js';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );

  // 1. Fetch posts along with the category name
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, description, hero_image, published_at, categories(name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,

    trailingSlash: false,

    customData: `<language>en-us</language>`,

    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
    },

    items: (posts || []).map((post) => {
      const categoryData = Array.isArray(post.categories) ? post.categories[0] : post.categories;
      const categorySlug = categoryData?.name?.toLowerCase().replace(/\s+/g, '-') || 'blog';
      const cleanPath = `/${categorySlug}/${post.slug}`.replace(/\/$/, "");

      const imageUrl = post.hero_image || null;
      let enclosure = '';
      if (imageUrl) {
        const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : ext === 'gif' ? 'image/gif'
          : 'image/jpeg';
        enclosure = `<enclosure url="${imageUrl}" type="${mime}" length="0"/><media:content url="${imageUrl}" medium="image" type="${mime}"/>`;
      }

      return {
        title: post.title,
        pubDate: new Date(post.published_at),
        description: post.excerpt || post.description,
        link: cleanPath,
        categories: [categoryData?.name || 'General'],
        customData: enclosure,
      };
    }),
  });
}