import { useCallback, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed-at-v2';
const DISMISS_DAYS = 7;

function isStandaloneDisplay() {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && Boolean(navigator.standalone));
}

function isIosLike() {
    if (typeof navigator === 'undefined') {
        return false;
    }

    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isDismissedRecently() {
    if (typeof window === 'undefined') {
        return false;
    }

    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);

    if (!dismissedAt) {
        return false;
    }

    return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function usePwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
    const [showManualGuide, setShowManualGuide] = useState(false);
    const [dismissed, setDismissed] = useState(isDismissedRecently);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setDismissed(isDismissedRecently());
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowManualGuide(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const canShow = useMemo(() => !isInstalled && !dismissed, [dismissed, isInstalled]);

    const install = useCallback(async () => {
        if (!deferredPrompt) {
            setShowManualGuide(true);
            return;
        }

        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);

        if (choice.outcome === 'dismissed') {
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
            setDismissed(true);
        }
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        setDismissed(true);
        setShowManualGuide(false);
    }, []);

    return {
        canInstall: canShow,
        canNativeInstall: Boolean(deferredPrompt),
        install,
        dismiss,
        isInstalled,
        isIos: isIosLike(),
        showManualGuide,
        setShowManualGuide,
    };
}
