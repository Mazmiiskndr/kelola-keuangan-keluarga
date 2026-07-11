import { Button } from '@/components/ui/button';
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
    const { canInstall, install, dismiss, dismissed } = usePwaInstallPrompt();
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

    if (!canInstall || dismissed) {
        return null;
    }

    const renderBanner = (variant: 'fixed' | 'inline', visible = true) => (
        <section
            aria-hidden={!visible}
            inert={!visible ? true : undefined}
            className={cn(
                'app-surface relative grid gap-4 rounded-[14px] p-5 pt-12 shadow-xl transition-all duration-300 ease-out md:p-5 md:pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-4',
                variant === 'fixed' &&
                    'fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-4 z-40 md:right-6 md:bottom-6 md:left-[calc(var(--sidebar-width)+1.5rem)]',
                variant === 'inline' && 'relative w-full',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
                className,
            )}
        >
            <div className="mx-auto grid max-w-xl min-w-0 justify-items-center gap-3 text-center md:grid-cols-[5rem_minmax(0,1fr)] md:items-center md:justify-items-start md:gap-4 md:text-left lg:mx-0 lg:flex lg:max-w-none lg:flex-1">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-[14px] bg-blue-50 md:size-20 lg:size-16 dark:bg-blue-950">
                    <img src="/icons/mobile-app-icon-footer.svg" alt="" className="size-10 md:size-12 lg:size-10" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base leading-6 font-semibold text-slate-950 lg:text-sm dark:text-white">
                        Finanxyra siap dipasang di perangkat Anda
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm leading-5 md:max-w-2xl">
                        Akses cepat seperti aplikasi native, sinkron antar anggota, dan aman untuk pemakaian harian.
                    </p>
                </div>
            </div>
            <div className="mx-auto grid w-full max-w-xl grid-cols-2 items-center gap-3 md:flex md:max-w-none md:flex-wrap md:justify-center lg:mx-0 lg:w-auto lg:flex-nowrap lg:justify-end">
                <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                    <BadgeCheck className="mr-1 size-3.5" /> PWA Ready
                </span>
                <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    Realtime Family
                </span>
                <Button type="button" onClick={install} className="col-span-2 h-12 w-full shadow-lg shadow-blue-600/20 md:w-auto md:min-w-44">
                    Instal Aplikasi
                </Button>
                <button
                    type="button"
                    className="text-muted-foreground absolute top-3 right-3 rounded-md p-2 hover:bg-slate-100 hover:text-slate-950 lg:static dark:hover:bg-slate-900 dark:hover:text-white"
                    onClick={dismiss}
                    aria-label="Sembunyikan install prompt"
                >
                    <X className="size-4" />
                </button>
            </div>
        </section>
    );

    if (floating) {
        return (
            <>
                <div ref={dockRef}>{renderBanner('inline', isDocked)}</div>
                {renderBanner('fixed', !isDocked)}
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

    return <>{renderBanner('inline')}</>;
}
