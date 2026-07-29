import { FinanceSelect } from '@/components/finance/finance-select';
import { MoneyDisplay } from '@/components/finance/money-display';
import { Card, CardContent } from '@/components/ui/card';
import { type Family, type SummaryMetric } from '@/types/finance';
import { Link } from '@inertiajs/react';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardScopeControlsProps {
    summary: SummaryMetric;
    families: Family[];
    currentScope: 'personal' | 'family';
    selectedFamilyId: string;
    onScopeChange: (scope: 'personal' | 'family') => void;
    onFamilyChange: (familyId: string) => void;
}

export function DashboardScopeControls({
    summary,
    families,
    currentScope,
    selectedFamilyId,
    onScopeChange,
    onFamilyChange,
}: DashboardScopeControlsProps) {
    const cashFlow = Number(summary.totals.cash_flow);
    const hasBudget = Number(summary.totals.budget) > 0;
    const budgetRemaining = Number(summary.totals.budget) - Number(summary.totals.expense);
    const budgetUsage = hasBudget ? Math.round((Number(summary.totals.expense) / Number(summary.totals.budget)) * 100) : 0;
    const isCashFlowNegative = cashFlow < 0;
    const isBudgetOver = hasBudget && budgetRemaining < 0;

    return (
        <Card>
            <CardContent className="flex flex-col gap-6 p-5 lg:flex-row lg:items-start">
                <div className="shrink-0">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Mode dashboard</p>
                    <div className="border-input mt-2 grid h-12 w-full max-w-72 grid-cols-2 rounded-md border bg-slate-50 p-[6px] shadow-sm dark:bg-slate-950">
                        <button
                            type="button"
                            className={`flex items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap transition-all ${
                                currentScope === 'personal'
                                    ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                                    : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                            }`}
                            onClick={() => onScopeChange('personal')}
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
                                onClick={() => onScopeChange('family')}
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
                                onValueChange={onFamilyChange}
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
                    <div
                        className={`flex h-12 min-w-0 items-center gap-3.5 rounded-md border px-3.5 ${
                            isCashFlowNegative
                                ? 'border-rose-100 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30'
                                : 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                        }`}
                    >
                        <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm dark:bg-slate-900 ${
                                isCashFlowNegative ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'
                            }`}
                        >
                            {isCashFlowNegative ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
                        </span>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p
                                    className={`text-[10px] leading-none font-semibold tracking-wide uppercase ${
                                        isCashFlowNegative ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
                                    }`}
                                >
                                    Arus kas bulan ini
                                </p>
                                <p className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white">
                                    <MoneyDisplay value={cashFlow} />
                                </p>
                            </div>
                            <span
                                className={`shrink-0 text-xs font-semibold ${
                                    isCashFlowNegative ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
                                }`}
                            >
                                {isCashFlowNegative ? 'Defisit' : cashFlow === 0 ? 'Seimbang' : 'Positif'}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flex h-12 min-w-0 items-center gap-3.5 rounded-md border px-3.5 ${
                            isBudgetOver
                                ? 'border-rose-100 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30'
                                : 'border-blue-100 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/30'
                        }`}
                    >
                        <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm dark:bg-slate-900 ${
                                isBudgetOver ? 'text-rose-600 dark:text-rose-300' : 'text-blue-600 dark:text-blue-300'
                            }`}
                        >
                            <Target className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p
                                    className={`text-[10px] leading-none font-semibold tracking-wide uppercase ${
                                        isBudgetOver ? 'text-rose-700 dark:text-rose-300' : 'text-blue-700 dark:text-blue-300'
                                    }`}
                                >
                                    Anggaran bulan ini
                                </p>
                                {hasBudget ? (
                                    <p className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white">
                                        {isBudgetOver ? 'Melebihi ' : 'Sisa '} <MoneyDisplay value={Math.abs(budgetRemaining)} />
                                    </p>
                                ) : (
                                    <Link
                                        href="/budgets"
                                        className="mt-1 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                                    >
                                        Atur budget bulanan
                                    </Link>
                                )}
                            </div>
                            {hasBudget && (
                                <span
                                    className={`ml-1 shrink-0 text-xs font-semibold ${
                                        isBudgetOver ? 'text-rose-700 dark:text-rose-300' : 'text-blue-700 dark:text-blue-300'
                                    }`}
                                >
                                    {budgetUsage}% Terpakai
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
