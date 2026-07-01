import react from '@vitejs/plugin-react';
import { cwd } from 'node:process';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, cwd(), '');
    const devServerUrl = env.VITE_DEV_SERVER_URL;

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.jsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        server: devServerUrl
            ? {
                  host: '0.0.0.0',
                  cors: true,
                  origin: devServerUrl,
                  hmr: {
                      host: new URL(devServerUrl).hostname,
                  },
              }
            : undefined,
    };
});
