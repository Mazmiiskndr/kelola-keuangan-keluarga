import { DateTimeDisplay } from '@/components/finance/date-display';
import { ExpenseCompositionChart } from '@/components/finance/expense-composition-chart';
import { MoneyDisplay } from '@/components/finance/money-display';
import { ProgressRow } from '@/components/finance/progress-row';
import { SixMonthTrendLineChart } from '@/components/finance/six-month-trend-line-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SummaryMetric } from '@/types/finance';

interface DashboardFinancialAnalysisProps {
    summary: SummaryMetric;
    currentScope: 'personal' | 'family';
}

export function DashboardFinancialAnalysis({ summary, currentScope }: DashboardFinancialAnalysisProps) {
    const trend = summary.trend ?? [];
    const expenseByCategory = summary.expense_by_category ?? [];
    const upcomingDebts = summary.upcoming_debts ?? [];
    const largestExpenses = summary.largest_expenses ?? [];

    return (
        <>
            <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <Card className="flex h-full min-w-0 flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Tren 6 Bulan</CardTitle>
                    </CardHeader>
                    <CardContent className="flex min-w-0 flex-1 px-3 pt-0 pb-3">
                        <SixMonthTrendLineChart data={trend} />
                    </CardContent>
                </Card>

                <ExpenseCompositionChart data={expenseByCategory} total={summary.totals.expense} />
            </div>

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
        </>
    );
}
