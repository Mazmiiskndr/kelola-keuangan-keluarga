import react from '@vitejs/plugin-react';
import { networkInterfaces } from 'node:os';
import { cwd } from 'node:process';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

function currentLanHost() {
    const interfaces = networkInterfaces();

    for (const addresses of Object.values(interfaces)) {
        const address = addresses?.find((item) => item.family === 'IPv4' && !item.internal);

        if (address) {
            return address.address;
        }
    }

    return 'localhost';
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, cwd(), '');
    const devServerHost = env.VITE_DEV_SERVER_HOST || currentLanHost();
    const devServerPort = Number(env.VITE_DEV_SERVER_PORT || 5173);
    const devServerUrl = env.VITE_DEV_SERVER_URL || `http://${devServerHost}:${devServerPort}`;

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
        server: {
            host: '0.0.0.0',
            port: devServerPort,
            cors: true,
            origin: devServerUrl,
            hmr: {
                host: new URL(devServerUrl).hostname,
            },
        },
    };
});
