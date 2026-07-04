import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    pageTitle?: string;
}

export default ({ children, breadcrumbs, pageTitle, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} pageTitle={pageTitle} {...props}>
        {children}
    </AppLayoutTemplate>
);
