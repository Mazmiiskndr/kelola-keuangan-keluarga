import { GlobalSearch } from '@/components/global-search';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { PwaInstallAction } from '@/components/pwa-install-action';
import { ThemeModeSwitch } from '@/components/theme-mode-switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [], pageTitle }: { breadcrumbs?: BreadcrumbItemType[]; pageTitle?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const title = pageTitle ?? breadcrumbs.at(-1)?.title ?? 'Dashboard';

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 transition-[width,height] ease-linear md:px-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <SidebarTrigger className="size-9 text-slate-700 dark:text-slate-200" />
                <GlobalSearch />
                <p className="hidden shrink-0 text-sm font-semibold text-slate-600 lg:block dark:text-slate-300">{title}</p>
            </div>
            <TooltipProvider delayDuration={0}>
                <PwaInstallAction />
                <ThemeModeSwitch />
                <Button type="button" variant="outline" size="icon" className="size-10 rounded-lg bg-white shadow-none dark:bg-slate-950">
                    <NotificationDropdown />
                </Button>
            </TooltipProvider>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 cursor-pointer gap-3 rounded-xl bg-white px-2 shadow-none dark:bg-slate-950">
                        <Avatar className="size-8 overflow-hidden rounded-xl">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="rounded-xl bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-36 text-left md:block">
                            <span className="block truncate text-xs font-semibold text-slate-950 dark:text-white">{auth.user.name}</span>
                            <span className="text-muted-foreground block truncate text-[11px] font-normal">{auth.user.email}</span>
                        </span>
                        <ChevronDown className="hidden size-4 text-slate-400 md:block" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
