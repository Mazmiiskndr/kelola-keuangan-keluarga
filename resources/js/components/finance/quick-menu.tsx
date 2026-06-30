import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
];

export function QuickMenu() {
    return (
        <Card className="rounded-lg border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader>
                <CardTitle>Quick Menu</CardTitle>
                <CardDescription>Akses cepat ke fitur utama aplikasi keuangan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {quickMenuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className="group flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus-visible:ring-white"
                        >
                            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-md', item.tone)}>
                                <item.icon className="size-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-slate-950 dark:text-white">{item.title}</span>
                                <span className="text-muted-foreground mt-1 block text-xs leading-5">{item.description}</span>
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
