import { DateTimeDisplay } from '@/components/finance/date-display';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export function NotificationDropdown() {
    const { notifications } = usePage<SharedData>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const items = notifications?.items ?? [];

    function markAsRead(id: string) {
        router.patch(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllAsRead() {
        router.patch('/notifications/read-all', {}, { preserveScroll: true });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-0">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <DropdownMenuLabel className="p-0">Notification</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700" onClick={markAllAsRead}>
                            Tandai semua terbaca
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                {items.length === 0 ? (
                    <div className="text-muted-foreground px-4 py-6 text-sm">Belum ada notification.</div>
                ) : (
                    <div className="max-h-96 overflow-y-auto p-1">
                        {items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                className="block cursor-default rounded-md p-3"
                                onSelect={(event) => event.preventDefault()}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={`mt-1 size-2 rounded-full ${item.read_at ? 'bg-slate-300 dark:bg-slate-700' : 'bg-rose-500'}`}
                                        aria-hidden="true"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-medium">{item.title}</p>
                                            <span className="text-muted-foreground text-[11px]">{item.read_at ? 'Terbaca' : 'Belum dibaca'}</span>
                                        </div>
                                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{item.message}</p>
                                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                            <span className="text-muted-foreground">
                                                <DateTimeDisplay value={item.created_at} fallback="Baru saja" />
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {item.url && (
                                                    <Link href={item.url} className="font-medium text-blue-600 hover:text-blue-700">
                                                        Buka
                                                    </Link>
                                                )}
                                                {!item.read_at && (
                                                    <button
                                                        type="button"
                                                        className="font-medium text-emerald-600 hover:text-emerald-700"
                                                        onClick={() => markAsRead(item.id)}
                                                    >
                                                        Tandai terbaca
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
