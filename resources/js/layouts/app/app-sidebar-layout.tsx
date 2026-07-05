import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
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
                <footer className="text-muted-foreground px-4 pb-6 text-center text-xs font-medium md:px-6">2026 Created by Mazmiiskndr</footer>
            </AppContent>
        </AppShell>
    );
}
