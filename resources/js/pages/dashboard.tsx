import { DateTimeDisplay } from '@/components/finance/date-display';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { QuickMenu } from '@/components/finance/quick-menu';
import { SimpleBarChart } from '@/components/finance/simple-bar-chart';
import { StatCard } from '@/components/finance/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type Family, type SummaryMetric } from '@/types/finance';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Bot, CreditCard, PiggyBank, Users, WalletCards } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    summary: SummaryMetric;
    families: Family[];
}

export default function Dashboard({ summary, families }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const memberBreakdown = summary.member_breakdown ?? [];
    const currentScope = summary.scope ?? 'personal';
    const selectedFamilyId = summary.family?.id ? String(summary.family.id) : families[0]?.id ? String(families[0].id) : '';
    const ownBreakdown = memberBreakdown.find((member) => member.user_id === auth.user.id);
    const otherExpense = Math.max(summary.totals.expense - (ownBreakdown?.expense ?? 0), 0);

    function openScope(scope: string) {
        router.get('/dashboard', scope === 'family' && selectedFamilyId ? { scope: 'family', family_id: selectedFamilyId } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function openFamily(familyId: string) {
        router.get('/dashboard', { scope: 'family', family_id: familyId }, { preserveState: true, preserveScroll: true });
    }

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
                            Periode <DateTimeDisplay value={summary.period.start} /> s/d <DateTimeDisplay value={summary.period.end} />
                        </Badge>
                    }
                />

                <Card className="rounded-lg">
                    <CardContent className="grid gap-4 p-4 md:grid-cols-[240px_1fr]">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Mode dashboard</p>
                            <FinanceSelect
                                value={currentScope}
                                onValueChange={openScope}
                                options={[
                                    { value: 'personal', label: 'Pribadi' },
                                    ...(families.length > 0 ? [{ value: 'family', label: 'Keluarga' }] : []),
                                ]}
                            />
                        </div>
                        {currentScope === 'family' && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Keluarga aktif</p>
                                <FinanceSelect
                                    value={selectedFamilyId}
                                    onValueChange={openFamily}
                                    options={families.map((family) => ({ value: String(family.id), label: family.name }))}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total Saldo" value={summary.totals.balance} description="Saldo aktif semua akun" icon={CreditCard} tone="blue" />
                    <StatCard title="Pemasukan Bulan Ini" value={summary.totals.income} icon={ArrowUpRight} tone="green" />
                    <StatCard title="Pengeluaran Bulan Ini" value={summary.totals.expense} icon={ArrowDownRight} tone="red" />
                    <StatCard title="Cicilan Jatuh Tempo" value={summary.totals.debt_due} icon={PiggyBank} tone="amber" />
                </div>

                {currentScope === 'family' && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Pengeluaran Saya"
                            value={ownBreakdown?.expense ?? 0}
                            description="Total transaksi dari akun pribadi saya"
                            icon={WalletCards}
                            tone="red"
                        />
                        <StatCard
                            title="Pengeluaran Anggota Lain"
                            value={otherExpense}
                            description="Akumulasi anggota keluarga aktif"
                            icon={Users}
                            tone="amber"
                        />
                        <StatCard
                            title="Total Cash Flow Keluarga"
                            value={summary.totals.cash_flow}
                            description="Pemasukan dikurangi pengeluaran keluarga"
                            icon={ArrowUpRight}
                            tone="green"
                        />
                    </div>
                )}

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
                            <CardTitle>{currentScope === 'family' ? 'Pengeluaran Terbesar Keluarga' : 'Pengeluaran Terbesar'}</CardTitle>
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
                                                {item.category || 'Tanpa kategori'} - <DateTimeDisplay value={item.date} />
                                                {summary.can_view_family_details && item.member ? ` - ${item.member}` : ''}
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

                {currentScope === 'family' && (
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Statistik Anggota Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {memberBreakdown.map((member) => (
                                <div key={member.user_id} className="rounded-lg border p-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{member.name}</p>
                                        <FinanceBadge value={member.role} className="mt-2" />
                                    </div>
                                    <div className="mt-4 grid gap-2 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Pemasukan</span>
                                            <MoneyDisplay value={member.income} className="font-medium text-emerald-600" />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Pengeluaran</span>
                                            <MoneyDisplay value={member.expense} className="font-medium text-rose-600" />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Tabungan</span>
                                            <MoneyDisplay value={member.saving} className="font-medium text-teal-600" />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Cash Flow</span>
                                            <MoneyDisplay value={member.cash_flow} className="font-medium" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
