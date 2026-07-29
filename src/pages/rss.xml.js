import rss from '@astrojs/rss';
import { getPosts } from '../lib/api.js';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
  const posts = await getPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,

    trailingSlash: false,

    customData: `<language>en-us</language>`,

    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
    },

    items: posts.map((post) => {
      const categorySlug = post.category?.slug || post.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'blog';
      const cleanPath = `/${categorySlug}/${post.slug}`.replace(/\/$/, "");

      const imageUrl = post.heroImage || null;
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
        pubDate: new Date(post.publishedAt),
        description: post.description,
        link: cleanPath,
        categories: [post.category?.name || 'General'],
        customData: enclosure,
      };
    }),
  });
}