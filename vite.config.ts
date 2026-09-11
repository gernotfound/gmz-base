import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/gmz-base/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        id: './',
        name: 'GMZ Base',
        short_name: 'GMZ Base',
        description: 'Una sala giochi web leggera, installabile e pronta a crescere.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#070b14',
        theme_color: '#070b14',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
