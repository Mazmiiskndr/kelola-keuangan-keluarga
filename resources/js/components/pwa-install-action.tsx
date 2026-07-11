import { Button } from '@/components/ui/button';
import { usePwaInstallPrompt } from '@/hooks/use-pwa-install-prompt';
import { Download } from 'lucide-react';

export function PwaInstallAction() {
    const { canInstall, install } = usePwaInstallPrompt();

    if (!canInstall) {
        return null;
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="h-10 cursor-pointer gap-2 rounded-xl border-blue-200 bg-blue-50 px-3 text-blue-700 shadow-none transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:hover:border-blue-800 dark:hover:bg-blue-900"
            onClick={install}
            aria-label="Pasang aplikasi Finanxyra"
        >
            <Download className="size-4" />
            <span className="hidden text-xs font-semibold sm:inline">Pasang Aplikasi</span>
        </Button>
    );
}
