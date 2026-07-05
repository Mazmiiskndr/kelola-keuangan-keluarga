import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    pageTitle,
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    pageTitle?: string;
}) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} pageTitle={pageTitle} />
                {children}
                <footer className="text-muted-foreground px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs font-medium md:px-6">
                    2026 Created by Mazmiiskndr
                </footer>
                <PwaInstallBanner floating />
                <div className="fixed right-4 bottom-[calc(24px+env(safe-area-inset-bottom))] z-50 md:hidden">
                    <Link
                        href="/transactions"
                        className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 dark:bg-blue-700"
                        aria-label="Tambah Transaksi"
                    >
                        <Plus className="size-6" />
                    </Link>
                </div>
            </AppContent>
        </AppShell>
    );
}
