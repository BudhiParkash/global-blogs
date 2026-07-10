// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';

const site =
  process.env.PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.SITE ||
  process.env.URL ||
  'https://globalsblog.com';

export default defineConfig({
  site,
  trailingSlash: 'never',

  // Fix 3: 301 redirects for broken internal links flagged in Search Console.
  // Mirrored in vercel.json (true HTTP 301s); these also generate fallback
  // redirect pages so the URLs resolve on plain static hosting (GoDaddy).
  redirects: {
    '/beauty/best-eye-liner-india': '/beauty/best-eye-liner',
    '/auto/best-family-car-in-india': '/auto/best-family-cars-india',
    '/auto/government-subsidy-ev-charging-station-india-2026':
      '/auto/government-subsidy-ev-charging-stations-india-2026',
    '/auto/best-car-under-10-lakhs-in-india': '/auto/best-suvs-under-10-lakh',
    '/auto/best-mileage-car-in-india': '/auto/best-mileage-suvs-india',
    '/auto/best-car-in-india': '/category/auto',
  },

  integrations: [
    react(),
    mdx(),
    sitemap(),
    // UPDATED: Added configuration to partytown
    partytown({
      config: {
        forward: ['gtag', 'dataLayer.push'],
      },
    }),
  ],

  fonts: [
      {
          provider: fontProviders.local(),
          name: 'Atkinson',
          cssVariable: '--font-atkinson',
          fallbacks: ['sans-serif'],
          options: {
              variants: [
                  {
                      src: ['./src/assets/fonts/atkinson-regular.woff'],
                      weight: 400,
                      style: 'normal',
                      display: 'swap',
                  },
                  {
                      src: ['./src/assets/fonts/atkinson-bold.woff'],
                      weight: 700,
                      style: 'normal',
                      display: 'swap',
                  },
              ],
          },
      },
    ],

  vite: {
    plugins: [tailwindcss()],
  },
});