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
    type LucideIcon,
} from 'lucide-react';

interface QuickMenuItem {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone: string;
}

const quickMenuItems: QuickMenuItem[] = [
    {
        title: 'Transaksi',
        description: 'Catat pemasukan dan pengeluaran',
        href: '/transactions',
        icon: ReceiptText,
        tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    {
        title: 'Akun',
        description: 'Kelola rekening dan saldo',
        href: '/accounts',
        icon: CreditCard,
        tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
        title: 'Kategori',
        description: 'Atur kategori transaksi',
        href: '/categories',
        icon: Tags,
        tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    },
    {
        title: 'Budget',
        description: 'Pantau batas pengeluaran',
        href: '/budgets',
        icon: FolderKanban,
        tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    {
        title: 'Tabungan',
        description: 'Cek target uang ditabung',
        href: '/saving-goals',
        icon: Goal,
        tone: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    },
    {
        title: 'Hutang',
        description: 'Hitung cicilan dan sisa hutang',
        href: '/debts',
        icon: HandCoins,
        tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    },
    {
        title: 'Laporan',
        description: 'Analisa pemasukan dan pengeluaran',
        href: '/reports',
        icon: ChartNoAxesCombined,
        tone: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
    },
    {
        title: 'AI Insight',
        description: 'Rekomendasi hemat dan investasi',
        href: '/ai-insights',
        icon: Bot,
        tone: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
    },
    {
        title: 'Keluarga',
        description: 'Kelola akses anggota keluarga',
        href: '/families',
        icon: Users,
        tone: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    },
    {
        title: 'Pengaturan',
        description: 'Atur preferensi akun',
        href: '/settings/profile',
        icon: Settings,
        tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
    },
];

export function QuickMenu() {
    return (
        <Card className="overflow-hidden border-none bg-gradient-to-r from-white to-slate-50 shadow-sm dark:from-slate-950 dark:to-slate-900">
            <CardHeader className="pt-5 pb-3">
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">🚀 Akses Cepat</CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">Jalan pintas menuju fitur-fitur yang paling sering Anda butuhkan.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="scrollbar-hide flex gap-4 overflow-x-auto pt-2 pb-4">
                    {quickMenuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={cn(
                                'group flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/50 px-5 text-sm font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-white/10',
                                item.tone,
                            )}
                        >
                            {item.title === 'Transaksi'
                                ? 'Tambah Transaksi'
                                : item.title === 'Akun'
                                  ? 'Tambah Rekening'
                                  : item.title === 'Hutang'
                                    ? 'Bayar Hutang'
                                    : item.title === 'Tabungan'
                                      ? 'Tambah Tabungan'
                                      : item.title === 'Laporan'
                                        ? 'Lihat Laporan'
                                        : item.title === 'AI Insight'
                                          ? 'Tanya AI'
                                          : item.title === 'Keluarga'
                                            ? 'Kelola Keluarga'
                                            : item.title}
                            <ArrowRight className="ml-2 size-4 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
