// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';

const site =
  process.env.PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.SITE ||
  process.env.URL ||
  'https://globalsblog.com';

export default defineConfig({
  site,
  integrations: [
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