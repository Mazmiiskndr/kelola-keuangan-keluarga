import { DateTimeDisplay } from '@/components/finance/date-display';
import { ExpenseCompositionChart } from '@/components/finance/expense-composition-chart';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { QuickMenu } from '@/components/finance/quick-menu';
import { SimpleBarChart } from '@/components/finance/simple-bar-chart';
import { StatCard } from '@/components/finance/stat-card';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis, type AiRecommendation, type Family, type SummaryMetric } from '@/types/finance';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Bot,
    CreditCard,
    Eye,
    Lightbulb,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
} from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    summary: SummaryMetric;
    families: Family[];
    latestAnalysis?: DashboardAiAnalysis | null;
    aiModelLabel: string;
}

interface DashboardAiAnalysis extends AiAnalysis {
    ai_recommendations?: AiRecommendation[];
}

const aiTypeIcons: Record<string, React.ReactNode> = {
    alert: <AlertCircle className="size-4 text-rose-500" />,
    opportunity: <Lightbulb className="size-4 text-emerald-500" />,
    habit: <TrendingUp className="size-4 text-cyan-500" />,
    goal: <Target className="size-4 text-teal-500" />,
    next_step: <ArrowRight className="size-4 text-indigo-500" />,
};

function poweredByLabel(analysis: DashboardAiAnalysis, configuredModelLabel: string): string {
    if (!analysis.model_name || analysis.model_name === 'deterministic-rules') {
        return configuredModelLabel;
    }

    return analysis.model_label || analysis.model_name;
}

export default function Dashboard({ summary, families = [], latestAnalysis = null, aiModelLabel }: DashboardProps) {
    const memberBreakdown = summary.member_breakdown ?? [];
    const currentScope = summary.scope ?? 'personal';
    const selectedFamilyId = summary.family?.id ? String(summary.family.id) : families[0]?.id ? String(families[0].id) : '';
    const accounts = summary.accounts ?? [];
    const trend = summary.trend ?? [];
    const expenseByCategory = summary.expense_by_category ?? [];
    const largestExpenses = summary.largest_expenses ?? [];
    const upcomingDebts = summary.upcoming_debts ?? [];
    const activeFamilyName = summary.family?.name ?? families.find((family) => String(family.id) === selectedFamilyId)?.name ?? 'Keluarga aktif';
    const scopeLabel = currentScope === 'family' ? 'Keluarga' : 'Pribadi';
    const visibilityLabel = summary.can_view_family_details ? 'Detail anggota aktif' : 'Data agregat';
    const latestRecommendations = latestAnalysis
        ? (latestAnalysis.aiRecommendations ?? latestAnalysis.ai_recommendations ?? latestAnalysis.recommendations ?? [])
        : [];

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
                    <CardContent className="flex flex-col gap-6 p-5 lg:flex-row lg:items-start">
                        <div className="shrink-0">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">Mode dashboard</p>
                            <div className="border-input mt-2 grid h-12 w-full max-w-72 grid-cols-2 rounded-md border bg-slate-50 p-[6px] shadow-sm dark:bg-slate-950">
                                <button
                                    type="button"
                                    className={`flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-all ${currentScope === 'personal'
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
                                        className={`flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-all ${currentScope === 'family'
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
                        <div className="shrink-0">
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
                        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 lg:mt-7">
                            <div className="flex h-12 min-w-0 items-center gap-3.5 rounded-md border border-blue-100 bg-blue-50/60 px-3.5 dark:border-blue-900/60 dark:bg-blue-950/30">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300">
                                    <Eye className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] leading-none font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                                        Tampilan aktif
                                    </p>
                                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                                        {scopeLabel}
                                        {currentScope === 'family' ? ` - ${activeFamilyName}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-12 min-w-0 items-center gap-3.5 rounded-md border border-emerald-100 bg-emerald-50/60 px-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300">
                                    <ShieldCheck className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <div className="flex min-w-0 items-center gap-3 pr-2">
                                        <p className="shrink-0 text-[10px] leading-none font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                            Akses data
                                        </p>
                                        {summary.family_role && (
                                            <Badge className="h-4 rounded-full bg-violet-50 p-2 text-[10px] text-violet-700 dark:bg-violet-950 dark:text-violet-200">
                                                {summary.family_role}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{visibilityLabel}</p>
                                </div>
                            </div>
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
                        sparkline={trend.map((item) => item.income + item.expense)}
                    />
                    <StatCard
                        title="Pemasukan Bulan Ini"
                        value={summary.totals.income}
                        description="Income periode berjalan"
                        icon={ArrowUpRight}
                        tone="green"
                        sparkline={trend.map((item) => item.income)}
                    />
                    <StatCard
                        title="Pengeluaran Bulan Ini"
                        value={summary.totals.expense}
                        description="Expense periode berjalan"
                        icon={ArrowDownRight}
                        tone="red"
                        sparkline={trend.map((item) => item.expense)}
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
                                            {account.name.charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{account.name}</p>
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

                {/* Dashboard Section: Tren & Komposisi Pengeluaran */}
                <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <Card className="flex h-full min-w-0 flex-col overflow-hidden">
                        <CardHeader>
                            <CardTitle>Tren 6 Bulan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex min-w-0 flex-1 px-3 pt-0 pb-3">
                            <SimpleBarChart data={trend} />
                        </CardContent>
                    </Card>

                    <ExpenseCompositionChart data={expenseByCategory} total={summary.totals.expense} />
                </div>

                {/* Compact Cards: Rasio Prioritas & Hutang Jatuh Tempo */}
                <div className="grid gap-4 xl:grid-cols-2">
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
                            {upcomingDebts.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Tidak ada hutang jatuh tempo.</p>
                            ) : (
                                upcomingDebts.slice(0, 3).map((debt) => (
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

                {/* Pengeluaran Terbesar */}
                <Card>
                    <CardHeader>
                        <CardTitle>{currentScope === 'family' ? 'Pengeluaran Terbesar Keluarga' : 'Pengeluaran Terbesar'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {largestExpenses.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Belum ada pengeluaran pada periode ini.</p>
                        ) : (
                            largestExpenses.map((item) => (
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

                {/* Latest AI Insight Section at the Bottom */}
                {latestAnalysis ? (
                    <Card className="relative overflow-hidden border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 to-white shadow-md dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-slate-950">
                        <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-5">
                            <Bot className="size-32" />
                        </div>
                        <CardHeader className="border-b border-indigo-100/50 bg-white/50 pb-3 dark:border-indigo-900/50 dark:bg-slate-900/50">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl text-indigo-950 dark:text-indigo-100">
                                        Insight AI Terbaru <DateTimeDisplay value={latestAnalysis.period_start} dateOnly />
                                    </CardTitle>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        <Sparkles className="size-3" />
                                        Powered by {poweredByLabel(latestAnalysis, aiModelLabel)}
                                    </p>
                                </div>
                                {latestAnalysis.health_score !== undefined && (
                                    <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/80 px-3 py-1.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/80">
                                        <Activity className="size-3.5 text-emerald-500" />
                                        <span className="text-xs font-semibold">Score:</span>
                                        <span
                                            className={`text-xs font-bold ${latestAnalysis.health_score >= 70 ? 'text-emerald-600' : latestAnalysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}
                                        >
                                            {latestAnalysis.health_score}/100
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 grid gap-6 p-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <h3 className="text-lg leading-tight font-bold text-slate-900 dark:text-white">
                                    {latestAnalysis.headline || 'Insight Keuangan Utama'}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{latestAnalysis.result_summary}</p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800/50 dark:hover:bg-indigo-950/50"
                                >
                                    <Link href="/ai-insights">
                                        Lihat Detail Analisis Lengkap <ArrowRight className="ml-2 size-3" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-3">
                                <h4 className="mb-2 text-sm font-semibold tracking-wider text-slate-500 uppercase">Top Rekomendasi</h4>
                                {latestRecommendations.slice(0, 2).map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="flex gap-3 rounded-lg border border-slate-100 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <div className="h-fit shrink-0 rounded-md bg-slate-100 p-1.5 dark:bg-slate-800">
                                            {aiTypeIcons[rec.type] || <Bot className="size-4 text-slate-500" />}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{rec.title}</p>
                                            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{rec.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mt-8 flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 p-8 text-center dark:bg-slate-900/50">
                        <Bot className="mb-3 size-10 text-slate-300" />
                        <h3 className="text-base font-medium">Belum Ada Analisis AI</h3>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            Dapatkan insight dan panduan keuangan khusus untuk Anda dengan menjalankan analisis bulan ini.
                        </p>
                        <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                            <Link href="/ai-insights">Mulai Analisis AI Sekarang</Link>
                        </Button>
                    </Card>
                )}

                <PwaInstallBanner floating />
            </div>
        </AppLayout>
    );
}
