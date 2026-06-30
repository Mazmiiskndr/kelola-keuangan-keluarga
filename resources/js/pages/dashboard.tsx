import { DateTimeDisplay } from '@/components/finance/date-display';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { QuickMenu } from '@/components/finance/quick-menu';
import { SimpleBarChart } from '@/components/finance/simple-bar-chart';
import { StatCard } from '@/components/finance/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SummaryMetric } from '@/types/finance';
import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Bot, CreditCard, PiggyBank, WalletCards } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    summary: SummaryMetric;
}

export default function Dashboard({ summary }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Dashboard Keuangan"
                    description="Pantau saldo, pemasukan, pengeluaran, hutang jatuh tempo, tabungan, dan pola pengeluaran terbesar dalam satu layar."
                    icon={WalletCards}
                    action={
                        <Badge variant="outline">
                            Periode <DateTimeDisplay value={summary.period.start} /> - <DateTimeDisplay value={summary.period.end} />
                        </Badge>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total Saldo" value={summary.totals.balance} description="Saldo aktif semua akun" icon={CreditCard} tone="blue" />
                    <StatCard title="Pemasukan Bulan Ini" value={summary.totals.income} icon={ArrowUpRight} tone="green" />
                    <StatCard title="Pengeluaran Bulan Ini" value={summary.totals.expense} icon={ArrowDownRight} tone="red" />
                    <StatCard title="Cicilan Jatuh Tempo" value={summary.totals.debt_due} icon={PiggyBank} tone="amber" />
                </div>

                <QuickMenu />

                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Tren 6 Bulan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={summary.trend} />
                            <div className="text-muted-foreground mt-4 flex gap-4 text-xs">
                                <span className="inline-flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" /> Pemasukan
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-rose-500" /> Pengeluaran
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Rasio Prioritas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <ProgressRow
                                label="Target tabungan"
                                value={summary.totals.saving_current}
                                target={summary.totals.saving_target}
                                tone="green"
                            />
                            <ProgressRow label="Budget terpakai" value={summary.totals.expense} target={summary.totals.budget} tone="amber" />
                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="text-sm font-medium">Cash flow</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    <MoneyDisplay value={summary.totals.cash_flow} />
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Pemasukan dikurangi pengeluaran dan cicilan pada periode berjalan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="rounded-lg xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Pengeluaran Terbesar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {summary.largest_expenses.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Belum ada pengeluaran pada periode ini.</p>
                            ) : (
                                summary.largest_expenses.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{item.description || item.category || 'Pengeluaran'}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {item.category || 'Tanpa kategori'} · <DateTimeDisplay value={item.date} />
                                            </p>
                                        </div>
                                        <MoneyDisplay value={item.amount} className="font-semibold text-rose-600" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="inline-flex items-center gap-2">
                                <Bot className="size-4" /> Fokus AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary.expense_by_category.slice(0, 5).map((item) => (
                                <ProgressRow key={item.name} label={item.name} value={item.amount} target={summary.totals.expense || 1} tone="red" />
                            ))}
                            {summary.expense_by_category.length === 0 && (
                                <p className="text-muted-foreground text-sm">AI akan lebih akurat setelah transaksi bulanan tersedia.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
