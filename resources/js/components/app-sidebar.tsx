import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Bot,
    ChartNoAxesCombined,
    CreditCard,
    FolderKanban,
    Goal,
    HandCoins,
    LayoutGrid,
    Moon,
    ReceiptText,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Transaksi',
        url: '/transactions',
        icon: ReceiptText,
    },
    {
        title: 'Akun',
        url: '/accounts',
        icon: CreditCard,
    },
    {
        title: 'Kategori',
        url: '/categories',
        icon: Tags,
    },
    {
        title: 'Budget',
        url: '/budgets',
        icon: FolderKanban,
    },
    {
        title: 'Tabungan',
        url: '/saving-goals',
        icon: Goal,
    },
    {
        title: 'Hutang',
        url: '/debts',
        icon: HandCoins,
    },
    {
        title: 'Laporan',
        url: '/reports',
        icon: ChartNoAxesCombined,
    },
    {
        title: 'AI Insight',
        url: '/ai-insights',
        icon: Bot,
    },
    {
        title: 'Keluarga',
        url: '/families',
        icon: Users,
    },
    {
        title: 'Pengaturan',
        url: '/settings/profile',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-12 bg-transparent px-2 text-white group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5! hover:bg-transparent hover:text-white active:bg-transparent data-[active=true]:bg-transparent"
                        >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="mt-auto gap-3 p-3 group-data-[collapsible=icon]:hidden">
                <PwaInstallBanner compact />
                <button
                    type="button"
                    className="flex h-11 items-center justify-between gap-3 rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-medium text-white"
                    onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                >
                    <span className="inline-flex items-center gap-3">
                        <Moon className="size-4" /> Mode Gelap
                    </span>
                    <span className={`flex h-5 w-9 items-center rounded-full p-0.5 ${isDark ? 'bg-blue-500' : 'bg-white/25'}`}>
                        <span className={`size-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-4' : ''}`} />
                    </span>
                </button>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
            </SidebarFooter>
        </Sidebar>
    );
}
