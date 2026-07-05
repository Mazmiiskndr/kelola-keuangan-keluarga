import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePwaInstallPrompt } from '@/hooks/use-pwa-install-prompt';
import { cn } from '@/lib/utils';
import { BadgeCheck, Smartphone, X } from 'lucide-react';
import { useEffect } from 'react';

interface PwaInstallBannerProps {
    compact?: boolean;
    className?: string;
    onVisibleChange?: (visible: boolean) => void;
}

export function PwaInstallBanner({ compact = false, className, onVisibleChange }: PwaInstallBannerProps) {
    const { canInstall, canNativeInstall, install, dismiss, showManualGuide, setShowManualGuide, isIos } = usePwaInstallPrompt();

    useEffect(() => {
        onVisibleChange?.(canInstall);
    }, [canInstall, onVisibleChange]);

    if (!canInstall) {
        return null;
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
            <section className={cn('app-surface flex flex-col gap-4 rounded-lg p-4 md:flex-row md:items-center', className)}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
                        <Smartphone className="size-6" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Finanxyra siap dipasang di perangkat Anda</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Akses cepat seperti aplikasi native, sinkron antar anggota, dan aman untuk pemakaian harian.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        <BadgeCheck className="mr-1 size-3.5" /> PWA Ready
                    </span>
                    <Button type="button" onClick={install} className="min-w-36">
                        {canNativeInstall ? 'Instal Sekarang' : isIos ? 'Panduan iPhone' : 'Panduan Instal'}
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

            <Dialog open={showManualGuide} onOpenChange={setShowManualGuide}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Instal Finanxyra sebagai PWA</DialogTitle>
                        <DialogDescription>
                            Jika tombol instal tidak muncul di browser Anda, tambahkan aplikasi secara manual dari menu browser.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                        <p>iPhone Safari: buka menu Share, pilih Add to Home Screen, lalu konfirmasi nama aplikasi.</p>
                        <p>Android Chrome: buka menu browser, pilih Install app atau Add to Home screen.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
