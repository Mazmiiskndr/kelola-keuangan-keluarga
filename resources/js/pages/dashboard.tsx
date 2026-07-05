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
import { accountLabel } from '@/lib/finance-labels';
import { type BreadcrumbItem } from '@/types';
import { type Family, type SummaryMetric } from '@/types/finance';
import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Bot, CreditCard, PiggyBank } from 'lucide-react';

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
    const memberBreakdown = summary.member_breakdown ?? [];
    const currentScope = summary.scope ?? 'personal';
    const selectedFamilyId = summary.family?.id ? String(summary.family.id) : families[0]?.id ? String(families[0].id) : '';
    const accounts = summary.accounts ?? [];

    function openScope(scope: string) {
        router.post(
            '/dashboard/scope',
            {
                scope,
                family_id: scope === 'family' ? selectedFamilyId : null,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function openFamily(familyId: string) {
        router.post('/dashboard/scope', { scope: 'family', family_id: familyId }, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Dashboard Keuangan">
            <Head title="Dashboard" />
            <div className="finance-page">
                <PageHeader
                    title="Dashboard Keuangan"
                    description="Pantau saldo, pemasukan, pengeluaran, hutang jatuh tempo, tabungan, dan pola pengeluaran terbesar dalam satu layar."
                    action={
                        <Badge variant="outline" className="rounded-md bg-white px-4 py-3 text-xs font-semibold dark:bg-slate-950">
                            Periode <DateTimeDisplay value={summary.period.start} dateOnly /> s/d{' '}
                            <DateTimeDisplay value={summary.period.end} dateOnly />
                        </Badge>
                    }
                />

                <QuickMenu />

                <Card>
                    <CardContent className="grid gap-5 p-5 lg:grid-cols-[280px_1fr_auto] lg:items-center">
                        <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">Mode dashboard</p>
                            <div className="border-input mt-2 grid h-12 w-full max-w-72 grid-cols-2 rounded-md border bg-slate-50 p-[6px] shadow-sm dark:bg-slate-950">
                                <button
                                    type="button"
                                    className={`flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-all ${
                                        currentScope === 'personal'
                                            ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                                            : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    onClick={() => openScope('personal')}
                                >
                                    Pribadi
                                </button>
                                {families.length > 0 && (
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-all ${
                                            currentScope === 'family'
                                                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                                                : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        onClick={() => openScope('family')}
                                    >
                                        Keluarga aktif
                                    </button>
                                )}
                                {families.length === 0 && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap"
                                        disabled
                                    >
                                        Keluarga
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">Keluarga aktif</p>
                            <div className="mt-2 w-full max-w-64">
                                {families.length === 0 ? (
                                    <div className="border-input text-muted-foreground flex h-12 items-center rounded-md border bg-white px-4 text-sm dark:bg-slate-950">
                                        Tidak ada keluarga
                                    </div>
                                ) : (
                                    <FinanceSelect
                                        value={selectedFamilyId}
                                        onValueChange={openFamily}
                                        options={families.map((family) => ({
                                            value: family.id.toString(),
                                            label: family.name,
                                        }))}
                                        placeholder="Pilih keluarga"
                                        searchPlaceholder="Cari keluarga..."
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {summary.family_role && (
                                <Badge className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
                                    Role: {summary.family_role}
                                </Badge>
                            )}
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                {summary.can_view_family_details ? 'Detail anggota aktif' : 'Data agregat'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Saldo"
                        value={summary.totals.balance}
                        description="Saldo aktif semua akun"
                        icon={CreditCard}
                        tone="blue"
                        sparkline={summary.trend.map((item) => item.income + item.expense)}
                    />
                    <StatCard
                        title="Pemasukan Bulan Ini"
                        value={summary.totals.income}
                        description="Income periode berjalan"
                        icon={ArrowUpRight}
                        tone="green"
                        sparkline={summary.trend.map((item) => item.income)}
                    />
                    <StatCard
                        title="Pengeluaran Bulan Ini"
                        value={summary.totals.expense}
                        description="Expense periode berjalan"
                        icon={ArrowDownRight}
                        tone="red"
                        sparkline={summary.trend.map((item) => item.expense)}
                    />
                    <StatCard
                        title="Cicilan Jatuh Tempo"
                        value={summary.totals.debt_due}
                        description="Hutang aktif bulan ini"
                        icon={PiggyBank}
                        tone="amber"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[540px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Saldo Akun</CardTitle>
                            <p className="text-muted-foreground text-xs">Private, Family, dan Shared Goal mengikuti visibilitas akun di aplikasi.</p>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {accounts.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Belum ada akun aktif untuk ditampilkan.</p>
                            ) : (
                                accounts.slice(0, 4).map((account) => (
                                    <div key={account.id} className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                            {accountLabel(account).charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{accountLabel(account)}</p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {account.visibility} {account.owner ? `- Pemilik ${account.owner}` : ''}
                                            </p>
                                        </div>
                                        <MoneyDisplay value={account.current_balance} className="shrink-0 text-xs font-bold" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Anggota Keluarga</CardTitle>
                            <p className="text-muted-foreground text-xs">Ditampilkan saat scope Keluarga dan user boleh melihat detail.</p>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            {(currentScope === 'family' ? memberBreakdown : []).length === 0 ? (
                                <p className="text-muted-foreground text-sm md:col-span-3">
                                    Aktifkan scope keluarga untuk melihat statistik anggota.
                                </p>
                            ) : (
                                memberBreakdown.slice(0, 3).map((member) => (
                                    <div key={member.user_id}>
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                                {member.name.charAt(0)}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold">{member.name}</p>
                                                <FinanceBadge value={member.role} className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-1 text-xs">
                                            <p>
                                                Income <MoneyDisplay value={member.income} compact />
                                            </p>
                                            <p>
                                                Expense <MoneyDisplay value={member.expense} compact />
                                            </p>
                                            <p className={member.cash_flow < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-600'}>
                                                Cashflow <MoneyDisplay value={member.cash_flow} compact />
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_286px_292px]">
                    <Card>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Rasio Prioritas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <ProgressRow
                                label="Target tabungan"
                                value={summary.totals.saving_current}
                                target={summary.totals.saving_target}
                                semantic="saving"
                            />
                            <ProgressRow label="Budget terpakai" value={summary.totals.expense} target={summary.totals.budget} semantic="budget" />
                            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="text-sm font-bold text-emerald-600">
                                    Cash flow <MoneyDisplay value={summary.totals.cash_flow} />
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hutang Jatuh Tempo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary.upcoming_debts.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Tidak ada hutang jatuh tempo.</p>
                            ) : (
                                summary.upcoming_debts.slice(0, 3).map((debt) => (
                                    <div key={debt.id} className="flex items-center gap-3">
                                        <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">!</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{debt.name}</p>
                                            <p className="text-muted-foreground text-xs">
                                                <DateTimeDisplay value={debt.due_date} dateOnly />
                                            </p>
                                        </div>
                                        <MoneyDisplay value={debt.amount} compact className="text-xs font-bold" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>{currentScope === 'family' ? 'Pengeluaran Terbesar Keluarga' : 'Pengeluaran Terbesar'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {summary.largest_expenses.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Belum ada pengeluaran pada periode ini.</p>
                            ) : (
                                summary.largest_expenses.map((item) => (
                                    <div key={item.id} className="finance-panel-list">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{item.description || item.category || 'Pengeluaran'}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {item.category || 'Tanpa kategori'} - <DateTimeDisplay value={item.date} dateOnly />
                                                {summary.can_view_family_details && item.member ? ` - ${item.member}` : ''}
                                            </p>
                                        </div>
                                        <MoneyDisplay value={item.amount} className="font-semibold text-rose-600" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="inline-flex items-center gap-2">
                                <Bot className="size-4" /> Fokus AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary.expense_by_category.slice(0, 5).map((item) => (
                                <ProgressRow
                                    key={item.name}
                                    label={item.name}
                                    value={item.amount}
                                    target={summary.totals.expense || 1}
                                    semantic="budget"
                                />
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
