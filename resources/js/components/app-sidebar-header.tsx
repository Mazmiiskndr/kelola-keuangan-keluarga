import { NotificationDropdown } from '@/components/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronDown, Command, HelpCircle, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [], pageTitle }: { breadcrumbs?: BreadcrumbItemType[]; pageTitle?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const title = pageTitle ?? breadcrumbs.at(-1)?.title ?? 'Dashboard';

    useEffect(() => {
        function handleSearchShortcut(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
            }
        }

        window.addEventListener('keydown', handleSearchShortcut);

        return () => window.removeEventListener('keydown', handleSearchShortcut);
    }, []);

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 transition-[width,height] ease-linear md:px-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <SidebarTrigger className="size-9 text-slate-700 dark:text-slate-200" />
                <div className="relative hidden w-full max-w-[500px] md:block">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari transaksi, kategori, atau akun..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-10 w-full rounded-full border border-slate-200 bg-white pr-32 pl-11 text-sm text-slate-700 shadow-sm transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-950"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="absolute top-1/2 right-[5.35rem] flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                            onClick={() => {
                                setSearchQuery('');
                                searchInputRef.current?.focus();
                            }}
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    <span className="pointer-events-none absolute top-1/2 right-5 inline-flex h-7 -translate-y-1/2 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <Command className="size-3.5" />K
                    </span>
                </div>
                <p className="hidden shrink-0 text-sm font-semibold text-slate-600 lg:block dark:text-slate-300">{title}</p>
            </div>
            <TooltipProvider delayDuration={0}>
                <NotificationDropdown />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="size-10 rounded-xl bg-white shadow-none dark:bg-slate-950">
                            <HelpCircle className="size-5" />
                            <span className="sr-only">Bantuan</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bantuan</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 gap-3 rounded-xl bg-white px-2 shadow-none dark:bg-slate-950">
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
