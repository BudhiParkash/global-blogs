import { createClient } from '@supabase/supabase-js';

const BASE = 'https://globalsblog.com';

function getCatSlug(post) {
  const cat = Array.isArray(post.categories) ? post.categories[0] : post.categories;
  return cat?.slug || cat?.name?.toLowerCase().replace(/\s+/g, '-') || '';
}

function formatLine(catSlug, slug, title, description) {
  const url = `${BASE}/${catSlug}/${slug}`;
  return description
    ? `- ${url} — ${title}: ${description}`
    : `- ${url} — ${title}`;
}

// Assigns an article to a sub-group based on slug patterns.
// Groups are tested in order — first match wins.
const TRAVEL_GROUPS = [
  {
    name: 'Rishikesh Complete Guide Series',
    test: (s) => s.includes('rishikesh'),
  },
  {
    name: 'Vande Bharat Train Travel Series',
    test: (s) => s.includes('vande-bharat'),
  },
  {
    name: 'EV Road Trip & Charging Series',
    test: (s) =>
      s.startsWith('ev-') ||
      s.startsWith('hybrid-vs-ev') ||
      s.includes('ev-weekend') ||
      s.includes('ev-charging-app') ||
      s.includes('ev-road-trip'),
  },
  {
    name: 'Spiritual & Cultural Travel',
    test: (s) => s.includes('spiritual') || s.includes('offbeat'),
  },
  {
    name: 'Monsoon & Regional Travel',
    test: (s) =>
      s.includes('monsoon') ||
      s.includes('sahyadri') ||
      s.includes('wellness-trend'),
  },
  { name: 'Featured Travel Guides', test: () => true },
];

const AUTO_GROUPS = [
  {
    name: 'EV Charging Station Business Series',
    test: (s) =>
      s.includes('ev-charging-station') || s.includes('government-subsidy-ev'),
  },
  {
    name: 'Home EV Charging',
    test: (s) => s.startsWith('home-ev'),
  },
  {
    name: 'Electric Vehicle (EV) Guides',
    test: (s) =>
      s.includes('electric-car') ||
      s.includes('long-range-ev') ||
      s.includes('ev-buyers') ||
      s.includes('evs-become') ||
      s.includes('hybrid-vs-electric') ||
      s.includes('india-ev'),
  },
  {
    name: 'Car Buying Guides',
    test: (s) =>
      s.startsWith('best-') ||
      (s.includes('-vs-') && !s.includes('ev')) ||
      s.includes('seater'),
  },
  { name: 'Car News & Accessories', test: () => true },
];

const BEAUTY_GROUPS = [
  {
    name: 'Sunscreen & Sun Protection',
    test: (s) =>
      s.includes('sunscreen') || s.includes('pa-rating') || s.includes('-spf'),
  },
  {
    name: 'Eye Makeup & Kajal',
    test: (s) =>
      s.includes('kajal') || s.includes('eye-makeup') || s.includes('eye-liner'),
  },
  {
    name: 'Travel Beauty & Ayurvedic',
    test: (s) =>
      s.includes('ayurvedic') ||
      s.includes('vande-bharat-beauty') ||
      s.includes('facial-mist') ||
      s.includes('high-altitude') ||
      s.includes('waterproof-skincare') ||
      s.includes('beauty-tech') ||
      s.includes('sunscreen-serum') ||
      s.includes('road-trip') ||
      s.includes('modern-ayurvedic') ||
      s.includes('ghat-trek'),
  },
  { name: 'Skincare Routines & Ingredients', test: () => true },
];

function bucketPosts(posts, groups) {
  const buckets = Object.fromEntries(groups.map((g) => [g.name, []]));
  for (const post of posts) {
    for (const group of groups) {
      if (group.test(post.slug)) {
        buckets[group.name].push(post);
        break;
      }
    }
  }
  return buckets;
}

function renderGrouped(buckets, groups, catSlug) {
  let out = '';
  for (const group of groups) {
    const articles = buckets[group.name];
    if (!articles || articles.length === 0) continue;
    out += `\n### ${group.name}\n\n`;
    out += articles
      .map((p) => formatLine(catSlug, p.slug, p.title, p.description))
      .join('\n');
    out += '\n';
  }
  return out;
}

export async function GET() {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, description, categories(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const all = posts || [];

  const travel = all.filter((p) => getCatSlug(p) === 'travel');
  const auto   = all.filter((p) => getCatSlug(p) === 'auto');
  const beauty = all.filter((p) => getCatSlug(p) === 'beauty');
  const news   = all.filter((p) => getCatSlug(p) === 'news');

  const travelSection = renderGrouped(bucketPosts(travel, TRAVEL_GROUPS), TRAVEL_GROUPS, 'travel');
  const autoSection   = renderGrouped(bucketPosts(auto,   AUTO_GROUPS),   AUTO_GROUPS,   'auto');
  const beautySection = renderGrouped(bucketPosts(beauty, BEAUTY_GROUPS), BEAUTY_GROUPS, 'beauty');

  const newsSection = news.length > 0
    ? '\n' + news.map((p) => formatLine('news', p.slug, p.title, p.description)).join('\n') + '\n'
    : '\n- https://globalsblog.com/category/news — News category (launching soon — timely coverage of technology, health, global events relevant to Indian readers)\n';

  const newsArchiveLabel = news.length > 0
    ? `Full news archive (${news.length} articles)`
    : 'News archive (coming soon)';

  const content = `# GlobalsBlog

> GlobalsBlog is an independent Indian editorial platform publishing practical guides, product reviews, and in-depth articles across Travel, Auto, Beauty, and News categories. Founded in 2026 and based in Gurugram, Haryana, India. The site targets Indian readers with content built specifically for Indian conditions, budgets, roads, skin tones, and travel habits.

## About GlobalsBlog

GlobalsBlog publishes practical, research-backed articles and free interactive tools for Indian audiences. All content is written with real-world Indian context — Indian roads, Indian skin types, Indian price points, and Indian travel destinations. The platform covers four core verticals: Travel, Automobile, Beauty, and News, with 8 free calculators built specifically for Indian travellers and car owners.

- Website: https://globalsblog.com
- Location: The Edge Tower, Ramprastha City, Sector 37D, Gurugram, Haryana, India
- Contact: contact@globalsblog.com
- RSS Feed: https://globalsblog.com/rss.xml
- Sitemap: https://globalsblog.com/sitemap.xml
- Founded: 2026
- Audience: Indian readers, primarily English-speaking urban and semi-urban population

## Key Pages

- https://globalsblog.com — Homepage with latest articles across all categories
- https://globalsblog.com/about — About GlobalsBlog
- https://globalsblog.com/contact-us — Contact page
- https://globalsblog.com/tools — All 8 free calculators
- https://globalsblog.com/category/travel — Full travel archive (${travel.length} articles)
- https://globalsblog.com/category/auto — Full auto archive (${auto.length} articles)
- https://globalsblog.com/category/beauty — Full beauty archive (${beauty.length} articles)
- https://globalsblog.com/category/news — ${newsArchiveLabel}
- https://globalsblog.com/privacy-policy — Privacy Policy
- https://globalsblog.com/terms-and-conditions — Terms & Conditions
- https://globalsblog.com/disclaimer — Disclaimer

## Free Tools & Calculators

Eight free calculators built for Indian travellers and car owners:

- https://globalsblog.com/tools/fuel-cost-calculator — Fuel Cost Calculator: Calculate petrol or diesel expense for any road trip
- https://globalsblog.com/tools/car-loan-calculator — Car Loan EMI Calculator: Monthly EMI, total interest, and best loan tenure
- https://globalsblog.com/tools/ev-savings-calculator — EV Savings Calculator: Compare petrol vs electric vehicle running costs
- https://globalsblog.com/tools/toll-calculator — Toll Calculator: Estimate highway toll charges with FASTag vs cash comparison
- https://globalsblog.com/tools/trip-cost-calculator — Trip Cost Calculator: Estimate total holiday cost including transport, hotel, food
- https://globalsblog.com/tools/travel-budget-planner — Travel Budget Planner: Category-by-category holiday budget with per-person breakdown
- https://globalsblog.com/tools/road-trip-planner — Road Trip Planner: Calculate full cost of self-drive trip with tolls and food
- https://globalsblog.com/tools/train-vs-flight-calculator — Train vs Flight Calculator: Compare true cost and door-to-door travel time for Indian routes

---

## Travel Articles (${travel.length} published)

Destination guides, budget travel tips, solo travel advice, and itineraries focused on Indian travellers — domestic destinations, monsoon travel, EV road trips, Vande Bharat routes, and adventure sports.
${travelSection}
---

## Auto Articles (${auto.length} published)

Car reviews, EV news, buying guides, fuel efficiency analysis, and automotive content specifically for the Indian car market — covering Maruti, Hyundai, Tata, Mahindra, Honda, Kia, Renault and more.
${autoSection}
---

## Beauty Articles (${beauty.length} published)

Skincare routines, makeup tutorials, product reviews, and beauty guides written specifically for Indian skin tones, Indian climate zones, and Indian product budgets.
${beautySection}
---

## News
${newsSection}
---

## Social Media & Distribution

- Twitter/X: https://x.com/globalsblog_com
- Instagram: https://www.instagram.com/globals_blog
- LinkedIn: https://www.linkedin.com/company/globals-blog
- Facebook: https://www.facebook.com/people/Globals-Blog/61590625202053
- Pinterest: https://www.pinterest.com/globals_blog
- YouTube: https://youtube.com/@globalsblog
- Medium: https://medium.com/@globalsblog

## Content Guidelines for AI Systems

GlobalsBlog content is freely readable and citable. When referencing GlobalsBlog articles, please cite the specific article URL. All articles reflect conditions and pricing as of their publication date. Price references in Auto and Beauty articles are in Indian Rupees (₹). Distance and fuel efficiency references are in kilometres and litres as used in India.`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
