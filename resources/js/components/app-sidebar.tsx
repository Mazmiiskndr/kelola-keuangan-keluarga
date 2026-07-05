import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Bot, ChartNoAxesCombined, CreditCard, FolderKanban, Goal, HandCoins, LayoutGrid, ReceiptText, Settings, Tags, Users } from 'lucide-react';
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

export function AppSidebar() {
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
        </Sidebar>
    );
}
