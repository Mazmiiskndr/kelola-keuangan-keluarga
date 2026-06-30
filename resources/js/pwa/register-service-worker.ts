export function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
            // PWA tetap berjalan sebagai website jika registrasi service worker gagal.
        });
    });
}
