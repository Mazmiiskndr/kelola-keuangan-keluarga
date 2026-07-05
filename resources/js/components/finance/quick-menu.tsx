import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    ChartNoAxesCombined,
    CreditCard,
    FolderKanban,
    Goal,
    HandCoins,
    ReceiptText,
    Settings,
    Tags,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';

interface QuickMenuItem {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone: string;
    actionLabel: string;
}

const quickMenuItems: QuickMenuItem[] = [
    {
        title: 'Transaksi',
        description: 'Catat pemasukan dan pengeluaran',
        href: '/transactions',
        icon: ReceiptText,
        tone: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50',
        actionLabel: 'Tambah Transaksi',
    },
    {
        title: 'Akun',
        description: 'Kelola rekening dan saldo',
        href: '/accounts',
        icon: CreditCard,
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
        actionLabel: 'Tambah Rekening',
    },
    {
        title: 'Kategori',
        description: 'Atur kategori transaksi',
        href: '/categories',
        icon: Tags,
        tone: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-900/70 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/50',
        actionLabel: 'Kategori',
    },
    {
        title: 'Budget',
        description: 'Pantau batas pengeluaran',
        href: '/budgets',
        icon: FolderKanban,
        tone: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/50',
        actionLabel: 'Budget',
    },
    {
        title: 'Tabungan',
        description: 'Cek target uang ditabung',
        href: '/saving-goals',
        icon: Goal,
        tone: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-100 dark:border-cyan-900/70 dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:bg-cyan-900/50',
        actionLabel: 'Tambah Tabungan',
    },
    {
        title: 'Hutang',
        description: 'Hitung cicilan dan sisa hutang',
        href: '/debts',
        icon: HandCoins,
        tone: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/50',
        actionLabel: 'Bayar Hutang',
    },
    {
        title: 'Laporan',
        description: 'Analisa pemasukan dan pengeluaran',
        href: '/reports',
        icon: ChartNoAxesCombined,
        tone: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800',
        actionLabel: 'Lihat Laporan',
    },
    {
        title: 'AI Insight',
        description: 'Rekomendasi hemat dan investasi',
        href: '/ai-insights',
        icon: Bot,
        tone: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:border-fuchsia-300 hover:bg-fuchsia-100 dark:border-fuchsia-900/70 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900/50',
        actionLabel: 'Tanya AI',
    },
    {
        title: 'Keluarga',
        description: 'Kelola akses anggota keluarga',
        href: '/families',
        icon: Users,
        tone: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100 dark:border-orange-900/70 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/50',
        actionLabel: 'Kelola Keluarga',
    },
    {
        title: 'Pengaturan',
        description: 'Atur preferensi akun',
        href: '/settings/profile',
        icon: Settings,
        tone: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800',
        actionLabel: 'Pengaturan',
    },
];

export function QuickMenu() {
    return (
        <Card className="overflow-hidden border-none bg-gradient-to-r from-white to-slate-50 shadow-sm dark:from-slate-950 dark:to-slate-900">
            <CardHeader className="pt-5 pb-3">
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="inline-flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                <Zap className="size-4" />
                            </span>
                            Akses Cepat
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">Jalan pintas menuju fitur-fitur yang paling sering Anda butuhkan.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-1">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {quickMenuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={cn(
                                'group rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none',
                                item.tone,
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-sm dark:bg-white/10">
                                    <item.icon className="size-4" />
                                </span>
                                <ArrowRight className="size-4 shrink-0 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                            </div>
                            <p className="mt-3 truncate text-sm font-bold">{item.actionLabel}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-4 opacity-75">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
