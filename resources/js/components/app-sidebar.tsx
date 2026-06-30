import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Bot, ChartNoAxesCombined, CreditCard, FolderKanban, Goal, HandCoins, LayoutGrid, ReceiptText, Tags, Users } from 'lucide-react';
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
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
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

            <SidebarFooter>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
