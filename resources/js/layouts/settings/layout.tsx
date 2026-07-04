import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="finance-page">
            <Heading title="Pengaturan" description="Preferensi profil, keamanan, notifikasi, dan tampilan." />

            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <aside className="app-surface rounded-lg p-3">
                    <nav className="flex flex-col gap-1">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start rounded-lg', {
                                    'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="min-w-0">
                    <section className="grid gap-4 xl:grid-cols-2">{children}</section>
                </div>
            </div>
        </div>
    );
}
