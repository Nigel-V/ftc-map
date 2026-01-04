// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: "https://ftcmap.vrhk.dev",

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // This tells the underlying Vite server to ignore the scripts folder
        ignored: ['**/scripts/**'],
      },
    },
  },

  integrations: [react()]
});