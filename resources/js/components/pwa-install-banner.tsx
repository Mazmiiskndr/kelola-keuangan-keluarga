import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePwaInstallPrompt } from '@/hooks/use-pwa-install-prompt';
import { cn } from '@/lib/utils';
import { BadgeCheck, Smartphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PwaInstallBannerProps {
    compact?: boolean;
    floating?: boolean;
    className?: string;
    onVisibleChange?: (visible: boolean) => void;
}

export function PwaInstallBanner({ compact = false, floating = false, className, onVisibleChange }: PwaInstallBannerProps) {
    const { canInstall, canNativeInstall, install, dismiss, showManualGuide, setShowManualGuide, isIos } = usePwaInstallPrompt();
    const dockRef = useRef<HTMLDivElement>(null);
    const [isDocked, setIsDocked] = useState(false);

    useEffect(() => {
        onVisibleChange?.(canInstall);
    }, [canInstall, onVisibleChange]);

    useEffect(() => {
        if (!floating || !canInstall || !dockRef.current) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsDocked(entry.isIntersecting && entry.intersectionRatio > 0);
        });

        observer.observe(dockRef.current);

        return () => observer.disconnect();
    }, [canInstall, floating]);

    if (!canInstall) {
        return null;
    }

    const installLabel = canNativeInstall ? 'Instal Sekarang' : isIos ? 'Panduan iPhone' : 'Panduan Instal';

    const renderBanner = (variant: 'fixed' | 'inline', visible = true) => (
        <section
            aria-hidden={!visible}
            inert={!visible ? true : undefined}
            className={cn(
                'app-surface flex flex-col gap-4 rounded-[14px] p-4 shadow-xl transition-all duration-300 ease-out sm:flex-row sm:items-center sm:justify-between',
                variant === 'fixed' &&
                'fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-4 z-40 md:right-6 md:bottom-6 md:left-[calc(var(--sidebar-width)+1.5rem)]',
                variant === 'inline' && 'relative w-full',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-[14px] bg-blue-50 dark:bg-blue-950">
                    <img src="/icons/mobile-app-icon-footer.svg" alt="" className="size-10" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Finanxyra siap dipasang di perangkat Anda</h2>
                    <p className="text-muted-foreground mt-1 text-sm leading-5">
                        Akses cepat seperti aplikasi native, sinkron antar anggota, dan aman untuk pemakaian harian.
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                    <BadgeCheck className="mr-1 size-3.5" /> PWA Ready
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    Realtime Family
                </span>
                <Button type="button" onClick={install} className="min-w-36 shadow-lg shadow-blue-600/20">
                    {installLabel}
                </Button>
                <button
                    type="button"
                    className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
                    onClick={dismiss}
                    aria-label="Sembunyikan install prompt"
                >
                    <X className="size-4" />
                </button>
            </div>
        </section>
    );

    const renderInstallGuide = () => (
        <Dialog open={showManualGuide} onOpenChange={setShowManualGuide}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Instal Finanxyra sebagai PWA</DialogTitle>
                    <DialogDescription>
                        Jika tombol instal tidak muncul di browser Anda, tambahkan aplikasi secara manual dari menu browser.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>Chrome Desktop: buka ikon install di address bar, atau menu browser lalu pilih Install Finanxyra.</p>
                    <p>Android Chrome: buka menu browser, pilih Install app atau Add to Home screen.</p>
                    <p>iPhone Safari: buka menu Share, pilih Add to Home Screen, lalu konfirmasi nama aplikasi.</p>
                </div>
            </DialogContent>
        </Dialog>
    );

    if (floating) {
        return (
            <>
                <div ref={dockRef} >
                    {renderBanner('inline', isDocked)}
                </div>

                {renderBanner('fixed', !isDocked)}

                {renderInstallGuide()}
            </>
        );
    }

    if (compact) {
        return (
            <div className={cn('rounded-lg border border-white/15 bg-white/10 p-3 text-white shadow-sm', className)}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">Mobile ready</p>
                        <p className="mt-2 text-xs leading-5 text-blue-100">Sinkron transaksi keluarga dari perangkat apa pun.</p>
                    </div>
                    <Smartphone className="size-8 shrink-0 text-blue-200" />
                </div>
                <button type="button" className="mt-3 text-xs font-semibold text-blue-100 hover:text-white" onClick={install}>
                    Instal PWA
                </button>
            </div>
        );
    }

    return (
        <>
            {renderBanner('inline')}
            {renderInstallGuide()}
        </>
    );
}
