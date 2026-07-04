import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { type BreadcrumbItem } from '@/types';

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
                <div className="px-4 pb-4 md:px-6">
                    <PwaInstallBanner />
                </div>
            </AppContent>
        </AppShell>
    );
}
